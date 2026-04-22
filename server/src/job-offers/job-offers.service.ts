import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobOffersService {
  constructor(private prisma: PrismaService) {}

  // =========================================================================
  // 1. WYSZUKIWARKA OFERT (Dla Kandydata i niezalogowanych)
  // =========================================================================
  async searchOffers(title?: string, location?: string, categoryId?: string) {
    return this.prisma.jobOffer.findMany({
      where: {
        isActive: true,
        title: title ? { contains: title, mode: 'insensitive' } : undefined,
        location: location ? { contains: location, mode: 'insensitive' } : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        company: {
          select: { companyName: true, logoUrl: true }
        },
        category: true,
      },
    });
  }

  // 2. DODAWANIE NOWEJ OFERTY (Dla Pracodawcy)
  async createOffer(userId: number, data: any) {
    const company = await this.prisma.companyProfile.findUnique({
      where: { userId: Number(userId) }
    });

    if (!company) throw new UnauthorizedException('Brak profilu pracodawcy.');

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
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        companyId: company.id,
        categoryId: Number(data.categoryId),
      }
    });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  }

  // =========================================================================
  // 3. APLIKACJA NA STANOWISKO (Dla Kandydata)
  // =========================================================================
  async applyForOffer(userId: number, jobOfferId: number) {
    // Sprawdzenie czy oferta istnieje
    const jobOffer = await this.prisma.jobOffer.findUnique({
      where: { id: jobOfferId },
    });

    if (!jobOffer) {
      throw new NotFoundException('Oferta nie została znaleziona.');
    }

    // Sprawdzenie czy użytkownik już aplikował
    const existingApplication = await this.prisma.application.findUnique({
      where: {
        userId_jobOfferId: {
          userId: Number(userId),
          jobOfferId: Number(jobOfferId),
        },
      },
    });

    if (existingApplication) {
      throw new Error('Już aplikowałeś na tę ofertę.');
    }

    // Tworzenie nowej aplikacji
    return this.prisma.application.create({
      data: {
        userId: Number(userId),
        jobOfferId: Number(jobOfferId),
        status: 'NEW',
      },
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true },
        },
        jobOffer: {
          select: { title: true, company: { select: { companyName: true } } },
        },
      },
    });
  }

  // =========================================================================
  // =========================================================================
  // METODY POMOCNICZE (do późniejszej edycji/usuwania ofert)
  // =========================================================================
  findAll() {
    return this.prisma.jobOffer.findMany();
  }

  findOne(id: number) {
    return this.prisma.jobOffer.findUnique({ where: { id } });
  }

  remove(id: number) {
    return this.prisma.jobOffer.delete({ where: { id } });
  }

  // =========================================================================
  // 5. OFERTAS PRACODAWCY (Dla Pracodawcy)
  // =========================================================================
  async getEmployerOffers(userId: number) {
    const company = await this.prisma.companyProfile.findUnique({
      where: { userId: Number(userId) }
    });

    if (!company) {
      throw new UnauthorizedException('Brak profilu pracodawcy.');
    }

    return this.prisma.jobOffer.findMany({
      where: {
        companyId: company.id
      },
      include: {
        category: true,
        applications: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // =========================================================================
  // 6. APLIKACJE DLA PRACODAWCY (Dla Pracodawcy)
  // =========================================================================
  async getEmployerApplications(userId: number) {
    const company = await this.prisma.companyProfile.findUnique({
      where: { userId: Number(userId) }
    });

    if (!company) {
      throw new UnauthorizedException('Brak profilu pracodawcy.');
    }

    // Pobieramy wszystkie aplikacje na oferty tego pracodawcy
    return this.prisma.application.findMany({
      where: {
        jobOffer: {
          companyId: company.id
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        jobOffer: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });
  }

  // =========================================================================
  // 4. PRZESYŁANIE FORMULARZA APLIKACJI (Dla Kandydata)
  // =========================================================================
  async submitApplicationForm(userId: number, jobOfferId: number, formData: any, files: any) {
    // Walidacja danych
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      throw new BadRequestException('Brakują wymagane dane osobowe.');
    }

    // Sprawdzenie czy oferta istnieje
    const jobOffer = await this.prisma.jobOffer.findUnique({
      where: { id: Number(jobOfferId) },
    });

    if (!jobOffer) {
      throw new NotFoundException('Oferta nie została znaleziona.');
    }

    // Sprawdzenie czy użytkownik już aplikował
    const existingApplication = await this.prisma.application.findUnique({
      where: {
        userId_jobOfferId: {
          userId: Number(userId),
          jobOfferId: Number(jobOfferId),
        },
      },
    });

    if (existingApplication) {
      throw new BadRequestException('Już aplikowałeś na tę ofertę.');
    }

    // Tworzenie nowej aplikacji
    return this.prisma.application.create({
      data: {
        userId: Number(userId),
        jobOfferId: Number(jobOfferId),
        status: 'NEW' as const,
      },
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true },
        },
        jobOffer: {
          select: { title: true, company: { select: { companyName: true } } },
        },
      },
    });
  }
}