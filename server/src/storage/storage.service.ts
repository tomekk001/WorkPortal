import { Injectable, Logger, NotFoundException, StreamableFile } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import { Readable } from 'stream';
import { join, extname } from 'path';
import { randomBytes } from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// Dwa tryby, wybierane automatycznie po obecności zmiennych R2_*:
// - lokalny dysk (domyślny, dopóki nie założono konta Cloudflare R2) — pliki
//   znikają przy każdym redeployu na hostingach z ulotnym systemem plików
//   (Railway/Render), więc nadaje się tylko do developmentu.
// - Cloudflare R2 (S3-kompatybilne) — trwałe przechowywanie w produkcji.
const R2_CONFIGURED = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client | null;
  private readonly bucket = process.env.R2_BUCKET_NAME as string;
  private readonly publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

  constructor() {
    this.s3 = R2_CONFIGURED
      ? new S3Client({
          region: 'auto',
          endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
          },
        })
      : null;
    this.logger.log(this.s3 ? 'Storage: Cloudflare R2' : 'Storage: lokalny dysk (uploads/) — tylko do developmentu');
  }

  private randomName(originalName: string): string {
    return `${randomBytes(24).toString('hex')}${extname(originalName)}`;
  }

  /** Publiczne pliki (np. logo firm) — zwraca URL gotowy do zapisania w DB i wyświetlenia w <img>. */
  async savePublicFile(buffer: Buffer, originalName: string, mimetype: string, folder: string): Promise<string> {
    const filename = this.randomName(originalName);
    if (this.s3) {
      await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: `${folder}/${filename}`, Body: buffer, ContentType: mimetype }));
      return `${this.publicUrl}/${folder}/${filename}`;
    }
    const dir = join(process.cwd(), 'uploads', folder);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);
    return `/uploads/${folder}/${filename}`;
  }

  /** Prywatne pliki (CV, załączniki) — zwraca sam klucz/nazwę, nie publiczny URL; dostęp wyłącznie przez readPrivateFile. */
  async savePrivateFile(buffer: Buffer, originalName: string, mimetype: string, folder: string): Promise<string> {
    const filename = this.randomName(originalName);
    if (this.s3) {
      await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: `${folder}/${filename}`, Body: buffer, ContentType: mimetype }));
      return filename;
    }
    const dir = join(process.cwd(), 'uploads', folder);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);
    return filename;
  }

  async readPrivateFile(folder: string, filename: string): Promise<StreamableFile> {
    if (this.s3) {
      try {
        const res = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: `${folder}/${filename}` }));
        return new StreamableFile(res.Body as Readable);
      } catch {
        throw new NotFoundException('Plik nie został znaleziony.');
      }
    }
    const filePath = join(process.cwd(), 'uploads', folder, filename);
    if (!existsSync(filePath)) throw new NotFoundException('Plik nie został znaleziony.');
    return new StreamableFile(createReadStream(filePath));
  }
}
