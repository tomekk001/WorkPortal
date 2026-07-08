import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async submit(data: { name?: string; email?: string; subject?: string; message?: string }) {
    if (!data.name?.trim() || !data.email?.trim() || !data.subject?.trim() || !data.message?.trim()) {
      throw new BadRequestException('Wszystkie pola są wymagane.');
    }
    return this.prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject.trim(),
        message: data.message.trim(),
      },
    });
  }

  async getAll() {
    return this.prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async markRead(id: number) {
    const msg = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException('Wiadomość nie istnieje.');
    return this.prisma.contactMessage.update({ where: { id }, data: { status: 'READ' } });
  }
}
