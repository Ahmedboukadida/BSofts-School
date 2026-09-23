import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const directUrl = (process.env.DATABASE_URL || '').replace('-pooler', '');
const adapter = new PrismaPg({ connectionString: directUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- SMTP CONFIGS ---');
  const configs = await prisma.smtpConfig.findMany();
  console.log(JSON.stringify(configs, null, 2));

  console.log('--- PLATFORM SETTINGS ---');
  const settings = await prisma.platformSetting.findMany({ where: { key: 'SMTP_CONFIG' } });
  console.log(JSON.stringify(settings, null, 2));
}

main().finally(() => prisma.$disconnect());
