import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JobOffersModule } from './job-offers/job-offers.module';
import { MessagesModule } from './messages/messages.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AuthModule, PrismaModule, JobOffersModule, MessagesModule, AdminModule],
})
export class AppModule {}
