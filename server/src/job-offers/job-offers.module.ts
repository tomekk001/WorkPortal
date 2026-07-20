import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JobOffersService } from './job-offers.service';
import { JobOffersController } from './job-offers.controller';
import { StorageModule } from '../storage/storage.module';

const ALLOWED_DOC_MIMETYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Module({
  imports: [
    StorageModule,
    MulterModule.register({
      // Pliki trzymane w pamięci (nie na dysku) — StorageService decyduje,
      // czy trafią na lokalny dysk (dev) czy do Cloudflare R2 (produkcja).
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (file.fieldname === 'cv' && file.mimetype !== 'application/pdf') {
          return cb(new Error('CV musi być w formacie PDF') as any, false);
        }
        if (file.fieldname === 'additional' && !ALLOWED_DOC_MIMETYPES.includes(file.mimetype)) {
          return cb(new Error('Dodatkowy plik musi być w formacie PDF, DOC lub DOCX') as any, false);
        }
        cb(null, true);
      },
    }),
  ],
  controllers: [JobOffersController],
  providers: [JobOffersService],
})
export class JobOffersModule {}
