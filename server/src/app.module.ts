import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JobOffersModule } from './job-offers/job-offers.module';
import { MessagesModule } from './messages/messages.module';
import { AdminModule } from './admin/admin.module';
import { PagesModule } from './pages/pages.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { ContactModule } from './contact/contact.module';
import { SeoModule } from './seo/seo.module';

@Module({
  imports: [
    // Domyślny globalny limit — dodatkowo zaostrzony przez @Throttle(...) na
    // endpointach wrażliwych na brute-force (login, rejestracja, reset hasła).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    AuthModule, PrismaModule, JobOffersModule, MessagesModule, AdminModule, PagesModule, NewsletterModule, ContactModule, SeoModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
