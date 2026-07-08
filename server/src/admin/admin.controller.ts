import { Controller, Get, Patch, Delete, Param, Body, Headers, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from '../common/jwt-secret';

function verifyAdmin(authHeader: string) {
  if (!authHeader) throw new UnauthorizedException('Brak dostępu.');
  const token = authHeader.split(' ')[1];
  const jwtService = new JwtService({ secret: JWT_SECRET });
  try {
    const decoded = jwtService.verify(token);
    if (decoded.role !== 'ADMIN') throw new UnauthorizedException('Brak uprawnień administratora.');
    return decoded;
  } catch (e: any) {
    if (e instanceof UnauthorizedException) throw e;
    throw new UnauthorizedException('Nieprawidłowy lub wygasły token.');
  }
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats(@Headers('authorization') authHeader: string) {
    verifyAdmin(authHeader);
    return this.adminService.getStats();
  }

  @Get('reports')
  async getReports(@Headers('authorization') authHeader: string) {
    verifyAdmin(authHeader);
    return this.adminService.getReports();
  }

  @Patch('reports/:id/status')
  async updateStatus(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { status: 'PENDING' | 'REVIEWED' | 'RESOLVED' },
  ) {
    verifyAdmin(authHeader);
    const allowed = ['PENDING', 'REVIEWED', 'RESOLVED'];
    if (!body?.status || !allowed.includes(body.status)) {
      throw new BadRequestException('Nieprawidłowy status.');
    }
    return this.adminService.updateReportStatus(Number(id), body.status);
  }

  @Get('offers')
  async getAllOffers(@Headers('authorization') authHeader: string) {
    verifyAdmin(authHeader);
    return this.adminService.getAllOffers();
  }

  @Patch('offers/:id/approve')
  async approveOffer(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    verifyAdmin(authHeader);
    return this.adminService.approveOffer(Number(id));
  }

  @Patch('offers/:id/promote')
  async togglePromoted(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    verifyAdmin(authHeader);
    return this.adminService.togglePromoted(Number(id));
  }

  @Get('contact-messages')
  async getContactMessages(@Headers('authorization') authHeader: string) {
    verifyAdmin(authHeader);
    return this.adminService.getContactMessages();
  }

  @Patch('contact-messages/:id/read')
  async markContactMessageRead(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    verifyAdmin(authHeader);
    return this.adminService.markContactMessageRead(Number(id));
  }

  @Get('users')
  async getUsers(@Headers('authorization') authHeader: string) {
    verifyAdmin(authHeader);
    return this.adminService.getUsers();
  }

  @Patch('users/:id/ban')
  async toggleUserBan(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    verifyAdmin(authHeader);
    return this.adminService.toggleUserBan(Number(id));
  }

  @Delete('users/:id')
  async deleteUser(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    verifyAdmin(authHeader);
    return this.adminService.deleteUser(Number(id));
  }
}
