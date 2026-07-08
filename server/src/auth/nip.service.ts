import { Injectable, Logger } from '@nestjs/common';

export interface NipVerificationResult {
  valid: boolean;
  message?: string;
  name?: string;
  address?: string;
  regon?: string;
  statusVat?: string;
}

const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7];

@Injectable()
export class NipService {
  private readonly logger = new Logger(NipService.name);

  validateNipChecksum(nip: string): boolean {
    if (!/^\d{10}$/.test(nip)) return false;
    const digits = nip.split('').map(Number);
    const sum = digits.slice(0, 9).reduce((acc, digit, i) => acc + digit * NIP_WEIGHTS[i], 0);
    const checksum = sum % 11;
    return checksum !== 10 && checksum === digits[9];
  }

  async verifyNip(rawNip: string): Promise<NipVerificationResult> {
    const nip = (rawNip || '').replace(/[^0-9]/g, '');

    if (!this.validateNipChecksum(nip)) {
      return { valid: false, message: 'Nieprawidłowy numer NIP (błędna suma kontrolna).' };
    }

    const today = new Date().toISOString().slice(0, 10);
    const url = `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${today}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        return { valid: false, message: 'Nie udało się zweryfikować NIP w wykazie podatników VAT.' };
      }

      const data: any = await res.json();
      const subject = data?.result?.subject;

      if (!subject) {
        return { valid: false, message: 'NIP nie widnieje w wykazie podatników VAT Ministerstwa Finansów.' };
      }

      return {
        valid: true,
        name: subject.name,
        address: subject.workingAddress || subject.residenceAddress || undefined,
        regon: subject.regon || undefined,
        statusVat: subject.statusVat || undefined,
      };
    } catch (e) {
      this.logger.warn(`Błąd weryfikacji NIP ${nip}: ${e}`);
      return { valid: false, message: 'Nie udało się połączyć z wykazem podatników VAT. Spróbuj ponownie.' };
    }
  }
}
