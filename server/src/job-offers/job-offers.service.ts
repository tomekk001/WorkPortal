import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobOffersService {
  constructor(private prisma: PrismaService) {}

  async searchOffers(title?: string, location?: string, categoryId?: string) {
    return this.prisma.jobOffer.findMany({
      where: {
        isActive: true,
        title: title ? { contains: title, mode: 'insensitive' } : undefined,
        location: location ? { contains: location, mode: 'insensitive' } : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { companyName: true, logoUrl: true } },
        category: true,
      },
    });
  }

  async createOffer(userId: number, data: any) {
    const company = await this.prisma.companyProfile.findUnique({
      where: { userId: Number(userId) },
    });

    if (!company) throw new UnauthorizedException('Brak profilu pracodawcy.');

    const months = Math.min(Math.max(Number(data.durationMonths) || 1, 1), 4);
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + months);

    return this.prisma.jobOffer.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        salaryMin: data.salaryMin ? Number(data.salaryMin) : null,
        salaryMax: data.salaryMax ? Number(data.salaryMax) : null,
        currency: data.currency || 'PLN',
        contract: data.contract || 'B2B',
        workMode: data.workMode || 'REMOTE',
        isActive: true,
        validUntil,
        companyId: company.id,
        categoryId: Number(data.categoryId),
      },
    });
  }

  async updateOffer(userId: number, offerId: number, data: any) {
    const company = await this.prisma.companyProfile.findUnique({
      where: { userId: Number(userId) },
    });
    if (!company) throw new UnauthorizedException('Brak profilu pracodawcy.');

    const offer = await this.prisma.jobOffer.findUnique({ where: { id: Number(offerId) } });
    if (!offer) throw new NotFoundException('Oferta nie istnieje.');
    if (offer.companyId !== company.id) throw new UnauthorizedException('Brak dostępu do tej oferty.');

    const months = data.durationMonths ? Math.min(Math.max(Number(data.durationMonths), 1), 4) : null;
    const validUntil = months ? (() => { const d = new Date(); d.setMonth(d.getMonth() + months); return d; })() : undefined;

    return this.prisma.jobOffer.update({
      where: { id: Number(offerId) },
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        salaryMin: data.salaryMin ? Number(data.salaryMin) : null,
        salaryMax: data.salaryMax ? Number(data.salaryMax) : null,
        currency: data.currency || 'PLN',
        contract: data.contract || 'B2B',
        workMode: data.workMode || 'REMOTE',
        categoryId: Number(data.categoryId),
        ...(validUntil ? { validUntil } : {}),
      },
    });
  }

  async downloadCv(employerUserId: number, applicationId: number): Promise<{ stream: StreamableFile; filename: string }> {
    const company = await this.prisma.companyProfile.findUnique({ where: { userId: Number(employerUserId) } });
    if (!company) throw new UnauthorizedException('Brak profilu pracodawcy.');

    const application = await this.prisma.application.findUnique({
      where: { id: Number(applicationId) },
      include: { jobOffer: true },
    });
    if (!application) throw new NotFoundException('Aplikacja nie istnieje.');
    if (application.jobOffer.companyId !== company.id) throw new UnauthorizedException('Brak dostępu.');
    if (!application.cvFileName) throw new NotFoundException('Kandydat nie dołączył CV.');

    const filePath = join(process.cwd(), 'uploads', 'cv', application.cvFileName);
    if (!existsSync(filePath)) throw new NotFoundException('Plik CV nie został znaleziony na serwerze.');

    return {
      stream: new StreamableFile(createReadStream(filePath)),
      filename: application.cvFileName,
    };
  }

  async findAllCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async createCategory(name: string) {
    const existing = await this.prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) return existing;
    return this.prisma.category.create({ data: { name } });
  }

  async getEmployerOffers(userId: number) {
    const company = await this.prisma.companyProfile.findUnique({ where: { userId: Number(userId) } });
    if (!company) throw new UnauthorizedException('Brak profilu pracodawcy.');

    return this.prisma.jobOffer.findMany({
      where: { companyId: company.id },
      include: {
        category: true,
        applications: {
          select: {
            id: true, status: true, appliedAt: true,
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEmployerApplications(userId: number) {
    const company = await this.prisma.companyProfile.findUnique({ where: { userId: Number(userId) } });
    if (!company) throw new UnauthorizedException('Brak profilu pracodawcy.');

    return this.prisma.application.findMany({
      where: { jobOffer: { companyId: company.id } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        jobOffer: { select: { id: true, title: true } },
        conversations: { select: { id: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async getSavedOffers(userId: number) {
    const saved = await this.prisma.savedOffer.findMany({
      where: { userId: Number(userId) },
      include: {
        jobOffer: {
          include: {
            company: { select: { companyName: true, logoUrl: true } },
            category: true,
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });
    return saved.map(s => s.jobOffer);
  }

  async getSavedOfferIds(userId: number) {
    const saved = await this.prisma.savedOffer.findMany({
      where: { userId: Number(userId) },
      select: { jobOfferId: true },
    });
    return saved.map(s => s.jobOfferId);
  }

  async toggleSaveOffer(userId: number, jobOfferId: number) {
    const existing = await this.prisma.savedOffer.findUnique({
      where: { userId_jobOfferId: { userId: Number(userId), jobOfferId: Number(jobOfferId) } },
    });
    if (existing) {
      await this.prisma.savedOffer.delete({ where: { id: existing.id } });
      return { saved: false };
    }
    await this.prisma.savedOffer.create({
      data: { userId: Number(userId), jobOfferId: Number(jobOfferId) },
    });
    return { saved: true };
  }

  async reportOffer(userId: number, jobOfferId: number, reason: string, description?: string) {
    const jobOffer = await this.prisma.jobOffer.findUnique({ where: { id: Number(jobOfferId) } });
    if (!jobOffer) throw new NotFoundException('Oferta nie została znaleziona.');

    const existing = await this.prisma.report.findUnique({
      where: { userId_jobOfferId: { userId: Number(userId), jobOfferId: Number(jobOfferId) } },
    });
    if (existing) throw new BadRequestException('Już zgłosiłeś tę ofertę.');

    return this.prisma.report.create({
      data: {
        userId: Number(userId),
        jobOfferId: Number(jobOfferId),
        reason,
        description: description?.trim() || null,
      },
    });
  }

  async getCompanyProfile(userId: number) {
    return this.prisma.companyProfile.findUnique({
      where: { userId: Number(userId) },
    });
  }

  async setupCompanyProfile(userId: number, companyName: string) {
    if (!companyName?.trim()) {
      throw new BadRequestException('Nazwa firmy jest wymagana.');
    }
    return this.prisma.companyProfile.upsert({
      where: { userId: Number(userId) },
      update: { companyName: companyName.trim() },
      create: { userId: Number(userId), companyName: companyName.trim() },
    });
  }

  async getCandidateApplications(userId: number) {
    return this.prisma.application.findMany({
      where: { userId: Number(userId) },
      include: {
        jobOffer: {
          select: {
            id: true,
            title: true,
            location: true,
            company: { select: { companyName: true, logoUrl: true } },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async submitApplicationForm(userId: number, jobOfferId: number, formData: any, files: any) {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      throw new BadRequestException('Brakują wymagane dane osobowe.');
    }

    const jobOffer = await this.prisma.jobOffer.findUnique({ where: { id: Number(jobOfferId) } });
    if (!jobOffer) throw new NotFoundException('Oferta nie została znaleziona.');

    const existingApplication = await this.prisma.application.findUnique({
      where: { userId_jobOfferId: { userId: Number(userId), jobOfferId: Number(jobOfferId) } },
    });
    if (existingApplication) throw new BadRequestException('Już aplikowałeś na tę ofertę.');

    return this.prisma.application.create({
      data: {
        userId: Number(userId),
        jobOfferId: Number(jobOfferId),
        status: 'NEW' as const,
        startDate: formData.startDate || null,
        contractType: formData.contractType || null,
        expectedSalary: formData.expectedSalary ? Number(formData.expectedSalary) : null,
        coverMessage: formData.message || null,
        cvFileName: formData.cvFileName || null,
        additionalFileName: formData.additionalFileName || null,
      },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        jobOffer: { select: { title: true, company: { select: { companyName: true } } } },
      },
    });
  }
}
