import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalOffers, totalReports, pendingReports] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.jobOffer.count(),
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
    ]);
    return { totalUsers, totalOffers, totalReports, pendingReports };
  }

  async getReports() {
    return this.prisma.report.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: { select: { companyName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReportStatus(reportId: number, status: 'PENDING' | 'REVIEWED' | 'RESOLVED') {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { status },
    });
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, createdAt: true,
        companyProfile: { select: { companyName: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
