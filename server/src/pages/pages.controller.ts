import { Controller, Get, Patch, Param, Body, Headers, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from '../common/jwt-secret';

function verifyAdmin(authHeader: string) {
  if (!authHeader) throw new UnauthorizedException('Brak dostępu.');
  const token = authHeader.split(' ')[1];
  const jwtService = new JwtService({ secret: JWT_SECRET });
  try {
    const decoded = jwtService.verify(token);
    if (decoded.role !== 'ADMIN') throw new UnauthorizedException('Brak uprawnień administratora.');
    return decoded;
  } catch (e: any) {
    if (e instanceof UnauthorizedException) throw e;
    throw new UnauthorizedException('Nieprawidłowy lub wygasły token.');
  }
}

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  async getAll(@Headers('authorization') authHeader: string) {
    verifyAdmin(authHeader);
    return this.pagesService.getAll();
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.pagesService.getBySlug(slug);
  }

  @Patch(':slug')
  async update(
    @Headers('authorization') authHeader: string,
    @Param('slug') slug: string,
    @Body() body: { title: string; content: string },
  ) {
    verifyAdmin(authHeader);
    if (!body?.title?.trim() || !body?.content?.trim()) {
      throw new BadRequestException('Tytuł i treść są wymagane.');
    }
    return this.pagesService.update(slug, body.title.trim(), body.content.trim());
  }
}
