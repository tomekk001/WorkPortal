import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobOffersService {
  constructor(private prisma: PrismaService) {}

  async searchOffers(title?: string, location?: string, categoryId?: string, skill?: string, seniority?: string) {
    return this.prisma.jobOffer.findMany({
      where: {
        isActive: true,
        isApproved: true,
        title: title ? { contains: title, mode: 'insensitive' } : undefined,
        location: location ? { contains: location, mode: 'insensitive' } : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        skills: skill ? { has: skill } : undefined,
        seniority: seniority ? (seniority as any) : undefined,
      },
      orderBy: [{ isPromoted: 'desc' }, { createdAt: 'desc' }],
      include: {
        company: { select: { id: true, companyName: true, logoUrl: true } },
        category: true,
      },
    });
  }

  async getOfferById(offerId: number) {
    const offer = await this.prisma.jobOffer.findUnique({
      where: { id: Number(offerId) },
      include: {
        company: { select: { id: true, companyName: true, logoUrl: true, description: true, website: true, location: true } },
        category: true,
      },
    });
    if (!offer) throw new NotFoundException('Oferta nie istnieje.');
    return offer;
  }

  async getSimilarOffers(offerId: number, limit = 4) {
    const offer = await this.prisma.jobOffer.findUnique({ where: { id: Number(offerId) } });
    if (!offer) throw new NotFoundException('Oferta nie istnieje.');
    return this.prisma.jobOffer.findMany({
      where: {
        id: { not: offer.id },
        categoryId: offer.categoryId,
        isActive: true,
        isApproved: true,
      },
      take: limit,
      orderBy: [{ isPromoted: 'desc' }, { createdAt: 'desc' }],
      include: {
        company: { select: { id: true, companyName: true, logoUrl: true } },
        category: true,
      },
    });
  }

  async getCompanyPublicProfile(companyId: number) {
    const company = await this.prisma.companyProfile.findUnique({
      where: { id: Number(companyId) },
      select: { id: true, companyName: true, logoUrl: true, description: true, website: true, location: true },
    });
    if (!company) throw new NotFoundException('Firma nie istnieje.');
    const offers = await this.prisma.jobOffer.findMany({
      where: { companyId: Number(companyId), isActive: true, isApproved: true },
      orderBy: [{ isPromoted: 'desc' }, { createdAt: 'desc' }],
      include: {
        company: { select: { id: true, companyName: true, logoUrl: true } },
        category: true,
      },
    });
    return { company, offers };
  }

  async createOffer(userId: number, data: any) {
    const company = await this.prisma.companyProfile.findUnique({
      where: { userId: Number(userId) },
      include: { user: { select: { emailVerified: true } } },
    });

    if (!company) throw new UnauthorizedException('Brak profilu pracodawcy.');
    if (!company.user.emailVerified) {
      throw new UnauthorizedException('Zweryfikuj adres e-mail firmy, zanim opublikujesz ogłoszenie.');
    }

    const months = Math.min(Math.max(Number(data.durationMonths) || 1, 1), 4);
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + months);

    const MAX_SALARY = 2_147_483_647;
    const salaryMin = data.salaryMin ? Math.min(Number(data.salaryMin), MAX_SALARY) : null;
    const salaryMax = data.salaryMax ? Math.min(Number(data.salaryMax), MAX_SALARY) : null;

    return this.prisma.jobOffer.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        salaryMin,
        salaryMax,
        currency: data.currency || 'PLN',
        contract: data.contract || 'B2B',
        workMode: data.workMode || 'REMOTE',
        isActive: true,
        validUntil,
        companyId: company.id,
        categoryId: Number(data.categoryId),
        skills: Array.isArray(data.skills) ? data.skills : [],
        seniority: data.seniority || null,
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

    const MAX_SALARY = 2_147_483_647;
    return this.prisma.jobOffer.update({
      where: { id: Number(offerId) },
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        salaryMin: data.salaryMin ? Math.min(Number(data.salaryMin), MAX_SALARY) : null,
        salaryMax: data.salaryMax ? Math.min(Number(data.salaryMax), MAX_SALARY) : null,
        currency: data.currency || 'PLN',
        contract: data.contract || 'B2B',
        workMode: data.workMode || 'REMOTE',
        categoryId: Number(data.categoryId),
        skills: Array.isArray(data.skills) ? data.skills : [],
        seniority: data.seniority || null,
        ...(validUntil ? { validUntil } : {}),
        ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
      },
    });
  }

  async toggleOfferActive(userId: number, offerId: number) {
    const company = await this.prisma.companyProfile.findUnique({
      where: { userId: Number(userId) },
    });
    if (!company) throw new UnauthorizedException('Brak profilu pracodawcy.');

    const offer = await this.prisma.jobOffer.findUnique({ where: { id: Number(offerId) } });
    if (!offer) throw new NotFoundException('Oferta nie istnieje.');
    if (offer.companyId !== company.id) throw new UnauthorizedException('Brak dostępu do tej oferty.');

    return this.prisma.jobOffer.update({
      where: { id: Number(offerId) },
      data: { isActive: !offer.isActive },
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

  async updateApplicationStatus(employerUserId: number, applicationId: number, status: string) {
    const allowed = ['NEW', 'REVIEWING', 'REJECTED', 'HIRED'];
    if (!allowed.includes(status)) throw new BadRequestException('Nieprawidłowy status.');

    const company = await this.prisma.companyProfile.findUnique({ where: { userId: Number(employerUserId) } });
    if (!company) throw new UnauthorizedException('Brak profilu pracodawcy.');

    const application = await this.prisma.application.findUnique({
      where: { id: Number(applicationId) },
      include: { jobOffer: true },
    });
    if (!application) throw new NotFoundException('Aplikacja nie istnieje.');
    if (application.jobOffer.companyId !== company.id) throw new UnauthorizedException('Brak dostępu.');

    return this.prisma.application.update({
      where: { id: Number(applicationId) },
      data: { status: status as any },
    });
  }

  async incrementViews(offerId: number) {
    await this.prisma.jobOffer.update({
      where: { id: Number(offerId) },
      data: { views: { increment: 1 } },
    }).catch(() => null);
    return { ok: true };
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

  async updateCategory(id: number, name: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Kategoria nie istnieje.');
    const duplicate = await this.prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, id: { not: id } },
    });
    if (duplicate) throw new BadRequestException('Kategoria o tej nazwie już istnieje.');
    return this.prisma.category.update({ where: { id }, data: { name } });
  }

  async deleteCategory(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { jobOffers: true } } },
    });
    if (!category) throw new NotFoundException('Kategoria nie istnieje.');
    if (category._count.jobOffers > 0) {
      throw new BadRequestException('Nie można usunąć kategorii, która ma przypisane ogłoszenia.');
    }
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
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

  async setupCompanyProfile(userId: number, data: { companyName?: string; description?: string; website?: string; location?: string; companyEmail?: string }) {
    if (!data.companyName?.trim()) {
      throw new BadRequestException('Nazwa firmy jest wymagana.');
    }
    const fields = {
      companyName: data.companyName.trim(),
      description: data.description?.trim() || null,
      website: data.website?.trim() || null,
      location: data.location?.trim() || null,
      companyEmail: data.companyEmail?.trim() || null,
    };
    return this.prisma.companyProfile.upsert({
      where: { userId: Number(userId) },
      update: fields,
      create: { userId: Number(userId), ...fields },
    });
  }

  async updateCompanyLogo(userId: number, logoUrl: string) {
    const company = await this.prisma.companyProfile.findUnique({ where: { userId: Number(userId) } });
    if (!company) throw new UnauthorizedException('Brak profilu pracodawcy.');
    return this.prisma.companyProfile.update({
      where: { userId: Number(userId) },
      data: { logoUrl },
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
