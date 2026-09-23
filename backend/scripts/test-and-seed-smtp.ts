import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const directUrl = (process.env.DATABASE_URL || '').replace('-pooler', '');
const adapter = new PrismaPg({ connectionString: directUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('1. Saving PlatformSetting SMTP_CONFIG to Neon...');
  const smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    user: 'bsofts.contact@gmail.com',
    password: 'tcyzyruiyuwkilfw', // stripped spaces
    fromName: 'BSofts School',
    fromEmail: 'bsofts.contact@gmail.com',
    isSecure: true,
    isDefault: true,
  };

  await prisma.platformSetting.upsert({
    where: { key: 'SMTP_CONFIG' },
    update: {
      value: JSON.stringify(smtpConfig),
      category: 'COMMUNICATION',
      isPublic: false,
    },
    create: {
      key: 'SMTP_CONFIG',
      value: JSON.stringify(smtpConfig),
      category: 'COMMUNICATION',
      isPublic: false,
    },
  });
  console.log('✅ SMTP_CONFIG saved to Neon PlatformSetting!');

  console.log('2. Testing Nodemailer dispatch with port 465 SSL...');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'bsofts.contact@gmail.com',
      pass: 'tcyzyruiyuwkilfw',
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    // @ts-ignore
    family: 4,
    tls: { rejectUnauthorized: false },
  });

  const info = await transporter.sendMail({
    from: '"BSofts School" <bsofts.contact@gmail.com>',
    to: 'ahmedboukadida.ts@gmail.com',
    subject: 'BSofts School — Test de Messagerie SMTP Réussi',
    text: 'Félicitations ! La configuration SMTP sur le port 465 SSL est validée et opérationnelle.',
    html: '<h2 style="color: #242F40;">BSofts School — SMTP Connecté avec Succès</h2><p style="color: #CCA43B; font-weight: bold;">Le serveur SMTP est parfaitement opérationnel sur le port 465 SSL.</p>',
  });

  console.log('🎉 Email sent successfully! Message ID:', info.messageId);
}

main()
  .catch((err) => {
    console.error('❌ Error during test:', err);
  })
  .finally(() => prisma.$disconnect());
