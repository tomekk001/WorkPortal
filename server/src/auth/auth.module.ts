import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { NipService } from './nip.service';
import { JWT_SECRET } from '../common/jwt-secret';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    MailModule,
  ],
  providers: [AuthService, NipService],
  controllers: [AuthController],
})
export class AuthModule {}