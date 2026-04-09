import { Controller, Get, Post, Body, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { JwtService } from '@nestjs/jwt';

@Controller('job-offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  // 1. Zwracanie ofert do wyszukiwarki (GET)
  @Get('search')
  async search(@Query('title') title?: string, @Query('location') location?: string) {
    return this.jobOffersService.searchOffers(title, location);
  }
  
  // Dodaj ten endpoint do kontrolera
@Get('categories')
async getCategories() {
  return this.jobOffersService.findAllCategories();
}

  // 2. Odbieranie nowej oferty z formularza Pracodawcy (POST)
  @Post()
  async create(@Headers('authorization') authHeader: string, @Body() data: any) {
    if (!authHeader) {
      throw new UnauthorizedException('Brak dostępu. Zaloguj się.');
    }

    // Token przychodzi w formacie "Bearer eyJhbGciOi...", więc wyciągamy sam token
    const token = authHeader.split(' ')[1];
    
    try {
      // Weryfikujemy token (używamy paczki, którą już masz zainstalowaną)
      const jwtService = new JwtService({ secret: process.env.JWT_SECRET || 'TWOJ_SEKRETNY_KLUCZ' });
      const decoded = jwtService.verify(token);
      
      // Przekazujemy ID użytkownika (decoded.sub) oraz dane z formularza do serwisu
      return this.jobOffersService.createOffer(decoded.sub, data);
    } catch (err) {
      throw new UnauthorizedException('Nieprawidłowy lub wygasły token.');
    }
  }
}