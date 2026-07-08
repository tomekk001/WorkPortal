// Musi być pierwszym importem: reszta modułów (np. common/jwt-secret.ts) czyta
// process.env.JWT_SECRET już przy imporcie (top-level), więc .env trzeba wczytać
// zanim jakikolwiek inny import w tym pliku zostanie rozwiązany — poleganie na
// tym, że Prisma "przy okazji" wczyta .env, jest zależne od kolejności importów
// i nie jest gwarantowane.
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(helmet());
  app.enableCors();
  // Tylko logo firm jest publiczne. CV/załączniki kandydatów NIE są tu montowane —
  // dostęp do nich wyłącznie przez GET /job-offers/applications/:id/download-cv
  // (z weryfikacją, że pracodawca jest właścicielem oferty, do której aplikowano).
  app.useStaticAssets(join(process.cwd(), 'uploads', 'logos'), { prefix: '/uploads/logos' });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
