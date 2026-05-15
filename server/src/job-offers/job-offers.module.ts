import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JobOffersService } from './job-offers.service';
import { JobOffersController } from './job-offers.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'cv'),
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (file.fieldname === 'cv' && file.mimetype !== 'application/pdf') {
          return cb(new Error('CV musi być w formacie PDF') as any, false);
        }
        cb(null, true);
      },
    }),
  ],
  controllers: [JobOffersController],
  providers: [JobOffersService],
})
export class JobOffersModule {}
