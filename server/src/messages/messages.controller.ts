import { Controller, Get, Post, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'TWOJ_SEKRETNY_KLUCZ';

function verifyToken(authHeader: string) {
  if (!authHeader) throw new UnauthorizedException('Brak tokenu.');
  const token = authHeader.split(' ')[1];
  const jwtService = new JwtService({ secret: JWT_SECRET });
  try {
    return jwtService.verify(token);
  } catch {
    throw new UnauthorizedException('Nieprawidłowy token.');
  }
}

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('start')
  async startConversation(
    @Headers('authorization') authHeader: string,
    @Body() body: { candidateId: number; applicationId: number; firstMessage: string },
  ) {
    const decoded = verifyToken(authHeader);
    return this.messagesService.startConversation(
      decoded.sub,
      body.candidateId,
      body.applicationId,
      body.firstMessage,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Headers('authorization') authHeader: string) {
    const decoded = verifyToken(authHeader);
    return this.messagesService.getUnreadCount(decoded.sub);
  }

  @Get('conversations')
  async getConversations(@Headers('authorization') authHeader: string) {
    const decoded = verifyToken(authHeader);
    return this.messagesService.getUserConversations(decoded.sub);
  }

  @Get('conversations/:id')
  async getConversation(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const decoded = verifyToken(authHeader);
    return this.messagesService.getConversation(Number(id), decoded.sub);
  }

  @Post('conversations/:id/send')
  async sendMessage(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    const decoded = verifyToken(authHeader);
    return this.messagesService.sendMessage(Number(id), decoded.sub, body.content);
  }
}
