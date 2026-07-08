import { Injectable, NotFoundException } from '@nestjs/common';
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
        role: true, createdAt: true, isBanned: true,
        companyProfile: { select: { companyName: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllOffers() {
    return this.prisma.jobOffer.findMany({
      include: {
        category: true,
        company: { select: { companyName: true } },
      },
      orderBy: [{ isApproved: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async approveOffer(offerId: number) {
    const offer = await this.prisma.jobOffer.findUnique({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Oferta nie istnieje.');
    return this.prisma.jobOffer.update({
      where: { id: offerId },
      data: { isApproved: true },
    });
  }

  async togglePromoted(offerId: number) {
    const offer = await this.prisma.jobOffer.findUnique({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Oferta nie istnieje.');
    return this.prisma.jobOffer.update({
      where: { id: offerId },
      data: { isPromoted: !offer.isPromoted },
    });
  }

  async toggleUserBan(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Użytkownik nie istnieje.');
    return this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
    });
  }

  async getContactMessages() {
    return this.prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async markContactMessageRead(id: number) {
    const msg = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException('Wiadomość nie istnieje.');
    return this.prisma.contactMessage.update({ where: { id }, data: { status: 'READ' } });
  }

  async deleteUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Użytkownik nie istnieje.');
    await this.prisma.user.delete({ where: { id: userId } });
    return { ok: true };
  }
}
