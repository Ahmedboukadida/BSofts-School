import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MailService } from '../src/mail/mail.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const mailService = app.get(MailService);

  console.log('Testing MailService.sendMail via NestJS context...');
  const result = await mailService.sendMail({
    to: 'ahmedboukadida.ts@gmail.com',
    subject: 'BSofts School — Diagnostic Service Validé',
    text: 'Test de transmission via le service MailService NestJS.',
    html: '<p>Test de transmission via le service <b>MailService</b> NestJS.</p>',
  });

  console.log('Result:', JSON.stringify(result, null, 2));
  await app.close();
}

main().catch(console.error);
