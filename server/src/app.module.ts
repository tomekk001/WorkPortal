import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JobOffersModule } from './job-offers/job-offers.module';

@Module({
  imports: [AuthModule, PrismaModule, JobOffersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
