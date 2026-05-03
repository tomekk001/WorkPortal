import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client'; // Zaimportuj Role z wygenerowanego klienta Prisma

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    const { email, password, role, firstName, lastName, companyName } = data;

    // 1. Sprawdź, czy użytkownik istnieje
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Użytkownik z tym adresem e-mail już istnieje');
    }

    // 2. Zaszyfruj hasło
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Transakcja bazy danych (Gwarantuje, że User i Profil utworzą się razem, albo wcale)
    const user = await this.prisma.$transaction(async (prisma) => {
      
      // A. Tworzymy główny rekord użytkownika
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role || Role.CANDIDATE,
          firstName,
          lastName,
        },
      });

      // B. Tworzymy odpowiedni profil powiązany z użytkownikiem
      if (role === Role.EMPLOYER) {
        if (!companyName) {
          throw new BadRequestException('Nazwa firmy jest wymagana dla konta Pracodawcy.');
        }
        await prisma.companyProfile.create({
          data: {
            userId: newUser.id,
            companyName: companyName,
          },
        });
      } else {
        // Domyślnie profil Kandydata
        await prisma.candidateProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      }

      return newUser;
    });

    // 4. Zwróć dane użytkownika bez hasła za pomocą destrukturyzacji
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(data: any) {
    const { email, password } = data;

    // 1. Znajdź użytkownika
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Nieprawidłowe dane logowania');
    }

    // 2. Porównaj hasła
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Nieprawidłowe dane logowania');
    }

    // 3. Wygeneruj token JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'TWOJ_SEKRETNY_KLUCZ', // Dodaj JWT_SECRET do .env
      expiresIn: '1d', // Token ważny 1 dzień
    });

    // Zwracamy token oraz rolę, by Frontend wiedział, na jaki widok przekierować (Kandydat vs Pracodawca)
    return { access_token: accessToken, role: user.role };
  }
}