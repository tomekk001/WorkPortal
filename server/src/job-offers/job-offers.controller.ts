import {
  Controller, Get, Post, Patch, Delete, Body, Query, Headers, Param,
  Res, UseInterceptors, UploadedFiles, UploadedFile,
  UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JobOffersService } from './job-offers.service';
import { StorageService } from '../storage/storage.service';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from '../common/jwt-secret';
import { verifyFileSignature } from '../common/file-signature';

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

function verifyAdmin(authHeader: string) {
  const decoded = verifyToken(authHeader);
  if (decoded.role !== 'ADMIN') throw new UnauthorizedException('Brak uprawnień administratora.');
  return decoded;
}

@Controller('job-offers')
export class JobOffersController {
  constructor(
    private readonly jobOffersService: JobOffersService,
    private readonly storageService: StorageService,
  ) {}

  @Get('search')
  async search(
    @Query('title') title?: string,
    @Query('location') location?: string,
    @Query('categoryId') categoryId?: string,
    @Query('skill') skill?: string,
    @Query('seniority') seniority?: string,
  ) {
    return this.jobOffersService.searchOffers(title, location, categoryId, skill, seniority);
  }

  @Get('company/:companyId')
  async getCompanyPublicProfile(@Param('companyId') companyId: string) {
    return this.jobOffersService.getCompanyPublicProfile(Number(companyId));
  }

  @Get('categories')
  async getCategories() {
    return this.jobOffersService.findAllCategories();
  }

  @Get('pricing')
  async getPricing() {
    return this.jobOffersService.getPricing();
  }

  @Post('categories')
  async createCategory(@Headers('authorization') authHeader: string, @Body() body: { name: string }) {
    verifyAdmin(authHeader);
    if (!body?.name?.trim()) throw new BadRequestException('Nazwa kategorii jest wymagana.');
    return this.jobOffersService.createCategory(body.name.trim());
  }

  @Patch('categories/:id')
  async updateCategory(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { name: string },
  ) {
    verifyAdmin(authHeader);
    if (!body?.name?.trim()) throw new BadRequestException('Nazwa kategorii jest wymagana.');
    return this.jobOffersService.updateCategory(Number(id), body.name.trim());
  }

  @Delete('categories/:id')
  async deleteCategory(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    verifyAdmin(authHeader);
    return this.jobOffersService.deleteCategory(Number(id));
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

    const cvFile = files?.cv?.[0];
    const additionalFile = files?.additional?.[0];

    if (cvFile && !verifyFileSignature(cvFile.buffer, cvFile.mimetype)) {
      throw new BadRequestException('Plik CV nie jest prawidłowym plikiem PDF.');
    }
    if (additionalFile && !verifyFileSignature(additionalFile.buffer, additionalFile.mimetype)) {
      throw new BadRequestException('Dodatkowy plik ma nieprawidłową zawartość dla zadeklarowanego typu.');
    }

    const cvFileName = cvFile
      ? await this.storageService.savePrivateFile(cvFile.buffer, cvFile.originalname, cvFile.mimetype, 'cv')
      : null;
    const additionalFileName = additionalFile
      ? await this.storageService.savePrivateFile(additionalFile.buffer, additionalFile.originalname, additionalFile.mimetype, 'cv')
      : null;
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

  @Get('offer-eligibility')
  async getOfferEligibility(@Headers('authorization') authHeader: string) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.getOfferEligibility(decoded.sub);
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

  @Patch('applications/:applicationId/status')
  async updateApplicationStatus(
    @Headers('authorization') authHeader: string,
    @Param('applicationId') applicationId: string,
    @Body() body: { status: string },
  ) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.updateApplicationStatus(decoded.sub, Number(applicationId), body.status);
  }

  @Post('save/:jobOfferId')
  async toggleSave(
    @Headers('authorization') authHeader: string,
    @Param('jobOfferId') jobOfferId: string,
  ) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.toggleSaveOffer(decoded.sub, Number(jobOfferId));
  }

  @Post(':jobOfferId/view')
  async incrementViews(@Param('jobOfferId') jobOfferId: string) {
    return this.jobOffersService.incrementViews(Number(jobOfferId));
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

  @Get('company-profile')
  async getCompanyProfile(@Headers('authorization') authHeader: string) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.getCompanyProfile(decoded.sub);
  }

  @Patch('company-profile')
  async updateCompanyProfile(
    @Headers('authorization') authHeader: string,
    @Body() body: { companyName?: string; description?: string; website?: string; location?: string; companyEmail?: string },
  ) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.setupCompanyProfile(decoded.sub, body);
  }

  @Post('company-profile/logo')
  @UseInterceptors(FileInterceptor('logo', {
    storage: memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Logo musi być obrazem.') as any, false);
      }
      cb(null, true);
    },
  }))
  async uploadCompanyLogo(
    @Headers('authorization') authHeader: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const decoded = verifyToken(authHeader);
    if (!file) throw new BadRequestException('Brak pliku logo.');
    if (!verifyFileSignature(file.buffer, file.mimetype)) {
      throw new BadRequestException('Plik logo ma nieprawidłową zawartość dla zadeklarowanego typu.');
    }
    const logoUrl = await this.storageService.savePublicFile(file.buffer, file.originalname, file.mimetype, 'logos');
    return this.jobOffersService.updateCompanyLogo(decoded.sub, logoUrl);
  }

  @Get(':offerId/similar')
  async getSimilarOffers(@Param('offerId') offerId: string) {
    return this.jobOffersService.getSimilarOffers(Number(offerId));
  }

  @Get(':offerId')
  async getOfferById(@Param('offerId') offerId: string) {
    return this.jobOffersService.getOfferById(Number(offerId));
  }

  @Patch(':offerId/toggle-active')
  async toggleOfferActive(
    @Headers('authorization') authHeader: string,
    @Param('offerId') offerId: string,
  ) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.toggleOfferActive(decoded.sub, Number(offerId));
  }

  @Post(':offerId/promote-paid')
  async promoteOfferPaid(
    @Headers('authorization') authHeader: string,
    @Param('offerId') offerId: string,
  ) {
    const decoded = verifyToken(authHeader);
    return this.jobOffersService.promoteOfferPaid(decoded.sub, Number(offerId));
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
