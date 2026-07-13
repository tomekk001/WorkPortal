import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function urlEntry(loc: string, lastmod: Date, priority: string): string {
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${lastmod.toISOString()}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
}

@Injectable()
export class SeoService {
  private readonly baseUrl = (process.env.PUBLIC_APP_URL || 'http://localhost:5180').replace(/\/$/, '');

  constructor(private prisma: PrismaService) {}

  async buildSitemap(): Promise<string> {
    const now = new Date();
    const entries: string[] = [
      urlEntry(`${this.baseUrl}/`, now, '1.0'),
      urlEntry(`${this.baseUrl}/kontakt`, now, '0.3'),
    ];

    const [offers, staticPages] = await Promise.all([
      this.prisma.jobOffer.findMany({
        where: { isActive: true, isApproved: true },
        select: { id: true, updatedAt: true, companyId: true },
      }),
      this.prisma.staticPage.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    for (const page of staticPages) {
      entries.push(urlEntry(`${this.baseUrl}/p/${page.slug}`, page.updatedAt, '0.3'));
    }

    const companyIds = new Set<number>();
    for (const offer of offers) {
      entries.push(urlEntry(`${this.baseUrl}/oferta/${offer.id}`, offer.updatedAt, '0.8'));
      companyIds.add(offer.companyId);
    }
    for (const companyId of companyIds) {
      entries.push(urlEntry(`${this.baseUrl}/firma/${companyId}`, now, '0.5'));
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`;
  }

  buildRobotsTxt(): string {
    const disallow = [
      '/login', '/register', '/forgot-password', '/reset-password', '/verify-email',
      '/add-offer', '/edit-offer/', '/company-profile', '/apply/',
    ];
    const lines = [
      'User-agent: *',
      'Allow: /',
      ...disallow.map(path => `Disallow: ${path}`),
      '',
      `Sitemap: ${this.baseUrl}/sitemap.xml`,
    ];
    return lines.join('\n');
  }
}
