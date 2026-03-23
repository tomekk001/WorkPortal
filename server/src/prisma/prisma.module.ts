import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Dodajemy ten dekorator, aby Prisma była dostępna wszędzie
@Module({
  providers: [PrismaService],
  exports: [PrismaService], //Pozwala innym modułom używać PrismaService
})
export class PrismaModule {}