import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { NipService } from './nip.service';

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
}