import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JobOffersModule } from './job-offers/job-offers.module';
import { MessagesModule } from './messages/messages.module';
import { AdminModule } from './admin/admin.module';
import { PagesModule } from './pages/pages.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [AuthModule, PrismaModule, JobOffersModule, MessagesModule, AdminModule, PagesModule, NewsletterModule, ContactModule],
})
export class AppModule {}
