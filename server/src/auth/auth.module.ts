import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'TWOJ_SEKRETNY_KLUCZ',
      signOptions: { expiresIn: '1d' }, // Token wygasa po 1 dniu
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}