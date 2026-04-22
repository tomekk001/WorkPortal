import { Controller, Get, Post, Body, Query, Headers, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { JwtService } from '@nestjs/jwt';

@Controller('job-offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  // 1. Zwracanie ofert do wyszukiwarki (GET)
  @Get('search')
  async search(
    @Query('title') title?: string,
    @Query('location') location?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.jobOffersService.searchOffers(title, location, categoryId);
  }
  
  @Get('categories')
  async getCategories() {
    return this.jobOffersService.findAllCategories();
  }

  // WAŻNE: Trasy na POST muszą być w kolejności od najbardziej specyficznych do generalnych!
  // @Post('submit-application') i @Post(':id/apply') MUSZĄ być PRZED @Post()

  // 4. Przesyłanie pełnego formularza aplikacji (POST)
  @Post('submit-application')
  async submitApplication(
    @Headers('authorization') authHeader: string,
    @Body() body: any
  ) {
    if (!authHeader) {
      throw new UnauthorizedException('Brak dostępu. Zaloguj się.');
    }

    if (!body || !body.jobOfferId) {
      throw new BadRequestException('Brak ID oferty w request body.');
    }

    const token = authHeader.split(' ')[1];
    const { jobOfferId } = body;

    try {
      const jwtService = new JwtService({ secret: process.env.JWT_SECRET || 'TWOJ_SEKRETNY_KLUCZ' });
      const decoded = jwtService.verify(token);
      
      return this.jobOffersService.submitApplicationForm(
        decoded.sub,
        jobOfferId,
        body,
        {}
      );
    } catch (err: any) {
      console.error('Błąd podczas przesyłania aplikacji:', err);
      if (err.message.includes('jwt')) {
        throw new UnauthorizedException('Nieprawidłowy lub wygasły token.');
      }
      throw err;
    }
  }

  // 3. Aplikacja na ofertę (POST)
  @Post(':id/apply')
  async apply(
    @Headers('authorization') authHeader: string,
    @Body() body: any
  ) {
    if (!authHeader) {
      throw new UnauthorizedException('Brak dostępu. Zaloguj się.');
    }

    const token = authHeader.split(' ')[1];
    const jobOfferId = body.jobOfferId;

    if (!jobOfferId) {
      throw new UnauthorizedException('Brak ID oferty.');
    }

    try {
      const jwtService = new JwtService({ secret: process.env.JWT_SECRET || 'TWOJ_SEKRETNY_KLUCZ' });
      const decoded = jwtService.verify(token);
      return this.jobOffersService.applyForOffer(decoded.sub, jobOfferId);
    } catch (err) {
      throw new UnauthorizedException('Nieprawidłowy lub wygasły token.');
    }
  }

  // 5. Pobieranie ofert pracodawcy (GET)
  @Get('my-offers')
  async getMyOffers(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Brak dostępu. Zaloguj się.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const jwtService = new JwtService({ secret: process.env.JWT_SECRET || 'TWOJ_SEKRETNY_KLUCZ' });
      const decoded = jwtService.verify(token);
      return this.jobOffersService.getEmployerOffers(decoded.sub);
    } catch (err) {
      throw new UnauthorizedException('Nieprawidłowy lub wygasły token.');
    }
  }

  // 6. Pobieranie aplikacji dla pracodawcy (GET)
  @Get('my-applications')
  async getMyApplications(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Brak dostępu. Zaloguj się.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const jwtService = new JwtService({ secret: process.env.JWT_SECRET || 'TWOJ_SEKRETNY_KLUCZ' });
      const decoded = jwtService.verify(token);
      return this.jobOffersService.getEmployerApplications(decoded.sub);
    } catch (err) {
      throw new UnauthorizedException('Nieprawidłowy lub wygasły token.');
    }
  }

  // 2. Odbieranie nowej oferty z formularza Pracodawcy (POST) - GENERYCZNE, NA KOŃCU
  @Post()
  async create(@Headers('authorization') authHeader: string, @Body() data: any) {
    if (!authHeader) {
      throw new UnauthorizedException('Brak dostępu. Zaloguj się.');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const jwtService = new JwtService({ secret: process.env.JWT_SECRET || 'TWOJ_SEKRETNY_KLUCZ' });
      const decoded = jwtService.verify(token);
      
      return this.jobOffersService.createOffer(decoded.sub, data);
    } catch (err) {
      throw new UnauthorizedException('Nieprawidłowy lub wygasły token.');
    }
  }}