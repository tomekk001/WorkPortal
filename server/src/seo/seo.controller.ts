import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SeoService } from './seo.service';

@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap.xml')
  async sitemap(@Res() res: Response) {
    const xml = await this.seoService.buildSitemap();
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  }

  @Get('robots.txt')
  robots(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(this.seoService.buildRobotsTxt());
  }
}
