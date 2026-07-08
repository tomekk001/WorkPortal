import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { JobOffersService } from './job-offers.service';
import { JobOffersController } from './job-offers.controller';

const ALLOWED_DOC_MIMETYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'cv'),
        filename: (_req, file, cb) => {
          // Nazwa kryptograficznie losowa — nie do odgadnięcia/brute-force'u,
          // co ma znaczenie dodatkowe (defense-in-depth), bo katalog i tak
          // nie jest już publicznie serwowany (patrz main.ts).
          const unique = randomBytes(24).toString('hex');
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
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
