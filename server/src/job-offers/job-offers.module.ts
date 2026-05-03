import { Module } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { JobOffersController } from './job-offers.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [JobOffersController],
  providers: [JobOffersService, PrismaService],
})
export class JobOffersModule {}
