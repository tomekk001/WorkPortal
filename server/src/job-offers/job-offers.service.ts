import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobOffersService {
  constructor(private prisma: PrismaService) {}

  // =========================================================================
  // 1. WYSZUKIWARKA OFERT (Dla Kandydata i niezalogowanych)
  // =========================================================================
  async searchOffers(title?: string, location?: string) {
    return this.prisma.jobOffer.findMany({
      where: {
        isActive: true, // Zwraca tylko aktywne/zatwierdzone oferty
        
        // Wyszukiwanie 'contains' (zawiera) i 'mode: insensitive' (ignoruje wielkość liter)
        title: title ? { contains: title, mode: 'insensitive' } : undefined,
        location: location ? { contains: location, mode: 'insensitive' } : undefined,
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
      categoryId: Number(data.categoryId), // Używamy ID przesłanego z frontendu!
    }
  });
}

  async findAllCategories() {
  return this.prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
}


  // METODY POMOCNICZE (do późniejszej edycji/usuwania ofert)
  findAll() {
    return this.prisma.jobOffer.findMany();
  }

  findOne(id: number) {
    return this.prisma.jobOffer.findUnique({ where: { id } });
  }

  remove(id: number) {
    return this.prisma.jobOffer.delete({ where: { id } });
  }
}