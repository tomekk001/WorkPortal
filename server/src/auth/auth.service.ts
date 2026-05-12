import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    const { email, password, role, firstName, lastName, companyName } = data;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Użytkownik z tym adresem e-mail już istnieje');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transakcja gwarantuje atomowe utworzenie użytkownika i jego profilu
    const user = await this.prisma.$transaction(async (prisma) => {
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
        if (!companyName) {
          throw new BadRequestException('Nazwa firmy jest wymagana dla konta Pracodawcy.');
        }
        await prisma.companyProfile.create({
          data: { userId: newUser.id, companyName },
        });
      } else {
        await prisma.candidateProfile.create({
          data: { userId: newUser.id },
        });
      }

      return newUser;
    });

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

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'TWOJ_SEKRETNY_KLUCZ',
      expiresIn: '1d',
    });

    return { access_token: accessToken, role: user.role };
  }
}
