import {
  Controller, Get, Post, Patch, Body, Query, Headers, Param,
  Res, UseInterceptors, UploadedFiles,
  UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
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

  @Post('submit-application')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'cv', maxCount: 1 },
    { name: 'additional', maxCount: 1 },
  ]))
  async submitApplication(
    @Headers('authorization') authHeader: string,
    @Body() body: any,
    @UploadedFiles() files: { cv?: Express.Multer.File[]; additional?: Express.Multer.File[] },
  ) {
    const decoded = verifyToken(authHeader);
    if (!body?.jobOfferId) throw new BadRequestException('Brak ID oferty w request body.');
    const cvFileName = files?.cv?.[0]?.filename ?? null;
    const additionalFileName = files?.additional?.[0]?.filename ?? null;
    return this.jobOffersService.submitApplicationForm(
      decoded.sub, body.jobOfferId,
      { ...body, cvFileName, additionalFileName },
      {},
    );
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

  @Get('saved')
  async getSaved(@Headers('authorization') authHeader: string) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.getSavedOffers(decoded.sub);
  }

  @Get('saved-ids')
  async getSavedIds(@Headers('authorization') authHeader: string) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.getSavedOfferIds(decoded.sub);
  }

  @Get('applications/:applicationId/download-cv')
  async downloadCv(
    @Headers('authorization') authHeader: string,
    @Param('applicationId') applicationId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const decoded = verifyToken(authHeader);
    const { stream, filename } = await this.jobOffersService.downloadCv(decoded.sub, Number(applicationId));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return stream;
  }

  @Post('save/:jobOfferId')
  async toggleSave(
    @Headers('authorization') authHeader: string,
    @Param('jobOfferId') jobOfferId: string,
  ) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.toggleSaveOffer(decoded.sub, Number(jobOfferId));
  }

  @Post(':jobOfferId/report')
  async reportOffer(
    @Headers('authorization') authHeader: string,
    @Param('jobOfferId') jobOfferId: string,
    @Body() body: { reason: string; description?: string },
  ) {
    const decoded = verifyToken(authHeader);
    if (!body?.reason?.trim()) throw new BadRequestException('Powód zgłoszenia jest wymagany.');
    return this.jobOffersService.reportOffer(decoded.sub, Number(jobOfferId), body.reason, body.description);
  }

  @Patch(':offerId')
  async updateOffer(
    @Headers('authorization') authHeader: string,
    @Param('offerId') offerId: string,
    @Body() data: any,
  ) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.updateOffer(decoded.sub, Number(offerId), data);
  }

  @Post()
  async create(@Headers('authorization') authHeader: string, @Body() data: any) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.createOffer(decoded.sub, data);
  }
}
