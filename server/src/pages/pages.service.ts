import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async getBySlug(slug: string) {
    const page = await this.prisma.staticPage.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Strona nie istnieje.');
    return page;
  }

  async getAll() {
    return this.prisma.staticPage.findMany({ orderBy: { slug: 'asc' } });
  }

  async update(slug: string, title: string, content: string) {
    const page = await this.prisma.staticPage.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Strona nie istnieje.');
    return this.prisma.staticPage.update({
      where: { slug },
      data: { title, content },
    });
  }
}
