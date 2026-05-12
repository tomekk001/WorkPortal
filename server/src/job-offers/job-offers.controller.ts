import { Controller, Get, Post, Body, Query, Headers, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { JwtService } from '@nestjs/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'TWOJ_SEKRETNY_KLUCZ';

function verifyToken(authHeader: string) {
  if (!authHeader) throw new UnauthorizedException('Brak dostępu. Zaloguj się.');
  const token = authHeader.split(' ')[1];
  const jwtService = new JwtService({ secret: JWT_SECRET });
  try {
    return jwtService.verify(token);
  } catch {
    throw new UnauthorizedException('Nieprawidłowy lub wygasły token.');
  }
}

@Controller('job-offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

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

  @Post('categories')
  async createCategory(@Body() body: { name: string }) {
    if (!body?.name?.trim()) throw new BadRequestException('Nazwa kategorii jest wymagana.');
    return this.jobOffersService.createCategory(body.name.trim());
  }

  // submit-application musi być przed @Post() aby router nie potraktował go jako :id
  @Post('submit-application')
  async submitApplication(
    @Headers('authorization') authHeader: string,
    @Body() body: any,
  ) {
    const decoded = verifyToken(authHeader);
    if (!body?.jobOfferId) throw new BadRequestException('Brak ID oferty w request body.');
    return this.jobOffersService.submitApplicationForm(decoded.sub, body.jobOfferId, body, {});
  }

  @Get('my-offers')
  async getMyOffers(@Headers('authorization') authHeader: string) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.getEmployerOffers(decoded.sub);
  }

  @Get('my-applications')
  async getMyApplications(@Headers('authorization') authHeader: string) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.getEmployerApplications(decoded.sub);
  }

  @Get('candidate-applications')
  async getCandidateApplications(@Headers('authorization') authHeader: string) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.getCandidateApplications(decoded.sub);
  }

  @Post()
  async create(@Headers('authorization') authHeader: string, @Body() data: any) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.createOffer(decoded.sub, data);
  }
}
