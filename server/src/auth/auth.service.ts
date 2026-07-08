import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Role } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { NipService } from './nip.service';
import { Prisma } from '@prisma/client';
import { JWT_SECRET } from '../common/jwt-secret';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private nipService: NipService,
  ) {}

  async register(data: any) {
    const { email, password, role, firstName, lastName, companyName, nip, companyEmail } = data;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Użytkownik z tym adresem e-mail już istnieje');
    }

    let cleanNip: string | undefined;
    if (role === Role.EMPLOYER) {
      if (!companyName) {
        throw new BadRequestException('Nazwa firmy jest wymagana dla konta Pracodawcy.');
      }
      if (!nip) {
        throw new BadRequestException('NIP firmy jest wymagany dla konta Pracodawcy.');
      }
      if (!companyEmail) {
        throw new BadRequestException('Firmowy adres e-mail jest wymagany dla konta Pracodawcy.');
      }
      // Nie ufamy weryfikacji NIP wykonanej na froncie — sprawdzamy ponownie po stronie serwera.
      const verification = await this.nipService.verifyNip(nip);
      if (!verification.valid) {
        throw new BadRequestException(verification.message || 'Nie udało się zweryfikować NIP.');
      }
      cleanNip = nip.replace(/[^0-9]/g, '');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transakcja gwarantuje atomowe utworzenie użytkownika i jego profilu
    let user;
    try {
      user = await this.prisma.$transaction(async (prisma) => {
        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: role || Role.CANDIDATE,
            firstName,
            lastName,
          },
        });

        if (role === Role.EMPLOYER) {
          await prisma.companyProfile.create({
            data: { userId: newUser.id, companyName, nip: cleanNip, companyEmail },
          });
        } else {
          await prisma.candidateProfile.create({
            data: { userId: newUser.id },
          });
        }

        return newUser;
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Firma z tym numerem NIP jest już zarejestrowana.');
      }
      throw e;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(data: any) {
    const { email, password } = data;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Nieprawidłowe dane logowania');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Nieprawidłowe dane logowania');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Konto zostało zablokowane.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: JWT_SECRET,
      expiresIn: '1d',
    });

    return { access_token: accessToken, role: user.role };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await this.prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });
      const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
      await this.mailService.sendPasswordReset(email, resetLink);
    }
    return { message: 'Jeśli konto istnieje, wysłaliśmy link do resetu hasła.' };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword || newPassword.length < 6) {
      throw new BadRequestException('Nieprawidłowe dane. Hasło musi mieć min. 6 znaków.');
    }
    const resetToken = await this.prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Link resetu hasła jest nieprawidłowy lub wygasł.');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashedPassword } }),
      this.prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
    ]);
    return { message: 'Hasło zostało zmienione.' };
  }
}
