import { Controller, Post, Get, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from '../common/jwt-secret';
import { AuthService } from './auth.service';
import { NipService } from './nip.service';

function verifyToken(authHeader: string) {
  if (!authHeader) throw new UnauthorizedException('Brak dostępu. Zaloguj się.');
  const token = authHeader.split(' ')[1];
  const jwtService = new JwtService({ secret: JWT_SECRET });
  try {
    return jwtService.verify(token);
  } catch {
    throw new UnauthorizedException('Nieprawidłowy lub wygasły token.');
  }
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly nipService: NipService,
  ) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Get('verify-nip/:nip')
  verifyNip(@Param('nip') nip: string) {
    return this.nipService.verifyNip(nip);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body?.email);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('reset-password')
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body?.token, body?.newPassword);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify-email')
  verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body?.token);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('resend-verification')
  resendVerification(@Headers('authorization') authHeader: string) {
    const decoded = verifyToken(authHeader);
    return this.authService.resendVerification(decoded.sub);
  }
}