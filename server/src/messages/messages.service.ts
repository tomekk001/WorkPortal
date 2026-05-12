import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async startConversation(employerId: number, candidateId: number, applicationId: number, firstMessage: string) {
    const employer = await this.prisma.user.findUnique({ where: { id: employerId } });
    if (!employer || employer.role !== 'EMPLOYER') {
      throw new ForbiddenException('Tylko pracodawca może rozpocząć konwersację.');
    }

    const existing = await this.prisma.conversation.findFirst({
      where: { employerId, candidateId, applicationId },
    });

    const conversation = existing ?? await this.prisma.conversation.create({
      data: { employerId, candidateId, applicationId },
    });

    await this.prisma.message.create({
      data: { content: firstMessage, senderId: employerId, conversationId: conversation.id },
    });

    return this.getConversation(conversation.id, employerId);
  }

  async getConversation(conversationId: number, userId: number) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        employer:  { select: { id: true, firstName: true, lastName: true, email: true } },
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
        },
      },
    });

    if (!conv) throw new NotFoundException('Konwersacja nie istnieje.');
    if (conv.employerId !== userId && conv.candidateId !== userId) {
      throw new ForbiddenException('Brak dostępu do tej konwersacji.');
    }

    return conv;
  }

  async getUserConversations(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Użytkownik nie istnieje.');

    const where = user.role === 'EMPLOYER'
      ? { employerId: userId }
      : { candidateId: userId };

    return this.prisma.conversation.findMany({
      where,
      include: {
        employer:    { select: { id: true, firstName: true, lastName: true } },
        candidate:   { select: { id: true, firstName: true, lastName: true } },
        application: { select: { id: true, jobOffer: { select: { title: true } } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const conversations = await this.prisma.conversation.findMany({
      where: { OR: [{ employerId: userId }, { candidateId: userId }] },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { senderId: true } } },
    });
    const count = conversations.filter(c => c.messages[0] && c.messages[0].senderId !== userId).length;
    return { count };
  }

  async sendMessage(conversationId: number, senderId: number, content: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Konwersacja nie istnieje.');
    if (conv.employerId !== senderId && conv.candidateId !== senderId) {
      throw new ForbiddenException('Brak dostępu.');
    }

    return this.prisma.message.create({
      data: { content, senderId, conversationId },
      include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
    });
  }
}
