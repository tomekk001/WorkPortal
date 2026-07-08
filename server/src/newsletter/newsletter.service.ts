import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(email: string) {
    if (!email?.trim() || !EMAIL_REGEX.test(email.trim())) {
      throw new BadRequestException('Podaj prawidłowy adres e-mail.');
    }
    const existing = await this.prisma.newsletterSubscriber.findUnique({ where: { email: email.trim() } });
    if (existing) throw new ConflictException('Ten adres już jest zapisany.');
    return this.prisma.newsletterSubscriber.create({ data: { email: email.trim() } });
  }
}
