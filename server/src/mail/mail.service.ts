import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  async onModuleInit() {
    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  async sendPasswordReset(email: string, resetLink: string) {
    const info = await this.transporter.sendMail({
      from: '"WorkPortal" <no-reply@workportal.pl>',
      to: email,
      subject: 'Reset hasła — WorkPortal',
      text: `Kliknij link, aby zresetować hasło: ${resetLink}\n\nLink jest ważny 1 godzinę.`,
      html: `<p>Kliknij link, aby zresetować hasło:</p><p><a href="${resetLink}">${resetLink}</a></p><p>Link jest ważny 1 godzinę.</p>`,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    this.logger.log(`Password reset email sent to ${email}. Preview: ${previewUrl}`);
    return previewUrl;
  }

  async sendCompanyEmailVerification(email: string, verifyLink: string) {
    const info = await this.transporter.sendMail({
      from: '"WorkPortal" <no-reply@workportal.pl>',
      to: email,
      subject: 'Zweryfikuj adres e-mail firmy — WorkPortal',
      text: `Kliknij link, aby zweryfikować adres e-mail firmy i móc publikować ogłoszenia: ${verifyLink}\n\nLink jest ważny 24 godziny.`,
      html: `<p>Kliknij link, aby zweryfikować adres e-mail firmy i móc publikować ogłoszenia:</p><p><a href="${verifyLink}">${verifyLink}</a></p><p>Link jest ważny 24 godziny.</p>`,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    this.logger.log(`Company email verification sent to ${email}. Preview: ${previewUrl}`);
    return previewUrl;
  }
}
