import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Client } from 'pg';

const rootDir = path.resolve(__dirname, '..');
const prodEnvPath = path.join(rootDir, '.env.production');
const localEnvPath = path.join(rootDir, '.env');

function getEnvVar(filePath: string, key: string): string | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1 && trimmed.slice(0, eqIdx).trim() === key) {
      let val = trimmed.slice(eqIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      return val;
    }
  }
  return undefined;
}

const NEON_URL =
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL_NEON ||
  getEnvVar(prodEnvPath, 'DATABASE_URL') ||
  'postgresql://neondb_owner:npg_ItvFmO5Cw7ES@ep-broad-sunset-b4uaw37v-pooler.c-6.us-east-2.aws.neon.tech/bsofts_school?sslmode=require&channel_binding=require';

const LOCAL_URL =
  getEnvVar(localEnvPath, 'DATABASE_URL') ||
  'postgresql://postgres:admin@127.0.0.1:5432/bsoftsschool?schema=public';

async function checkNeonStatus() {
  console.log('\n============================================================');
  console.log('?? [NEON SYNC] Checking Neon PostgreSQL Connection & Status');
  console.log('============================================================');
  console.log(`Endpoint: ${NEON_URL.split('@')[1]?.split('/')[0] || 'Neon Cloud'}`);

  const client = new Client({ connectionString: NEON_URL });
  try {
    const startTime = Date.now();
    await client.connect();
    const latency = Date.now() - startTime;
    console.log(`? Connected successfully in ${latency}ms`);

    const versionRes = await client.query('SELECT version();');
    console.log(`?? PostgreSQL Version: ${versionRes.rows[0].version.split(',')[0]}`);

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name ASC;
    `);

    const tables = tablesRes.rows.map((r) => r.table_name);
    console.log(`?? Public Tables in Neon: ${tables.length}`);
    if (tables.length > 0) {
      console.log(`   Sample tables: ${tables.slice(0, 10).join(', ')}${tables.length > 10 ? '...' : ''}`);
    } else {
      console.log('?? Neon database is currently empty (0 tables). Ready for schema push!');
    }
  } catch (err: any) {
    console.error('? Failed to connect to Neon database:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

function pushSchemaToNeon() {
  console.log('\n============================================================');
  console.log('?? [NEON SYNC] Synchronizing Schema (Tables & Properties) to Neon');
  console.log('============================================================');
  console.log('Pushing Prisma schema definitions to Neon without data loss...');

  try {
    execSync('npx prisma db push --schema=prisma/schema.prisma', {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: NEON_URL,
      },
    });
    console.log('\n? All tables and properties synchronized to Neon successfully!');
  } catch (err: any) {
    console.error('\n? Error pushing schema to Neon:', err.message);
    process.exit(1);
  }
}

function seedNeon() {
  console.log('\n============================================================');
  console.log('?? [NEON SYNC] Seeding Initial Structural Data to Neon');
  console.log('============================================================');

  try {
    execSync('npx tsx prisma/seed.ts', {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: NEON_URL,
      },
    });
    console.log('\n? Neon database seeded successfully with base system entities!');
  } catch (err: any) {
    console.error('\n? Error seeding Neon:', err.message);
    process.exit(1);
  }
}

async function pullDataFromNeonToLocal() {
  console.log('\n============================================================');
  console.log('?? [NEON SYNC] Pull Data from Production (Neon) -> Local');
  console.log('============================================================');
  console.log('Rule Guard: Local data will NEVER overwrite Neon production.');
  console.log('Production data can be safely backed up and mirrored locally.');
  console.log(`Source (Neon): ${NEON_URL.split('@')[1]?.split('/')[0]}`);
  console.log(`Target (Local): ${LOCAL_URL}`);
  console.log('To dump and restore manually with pg_dump / psql:');
  console.log(`  pg_dump "${NEON_URL}" -F c -b -v -f neon_backup.dump`);
  console.log(`  pg_restore -d "${LOCAL_URL}" --clean --no-owner neon_backup.dump`);
}

async function main() {
  const arg = process.argv[2];

  switch (arg) {
    case '--push':
      pushSchemaToNeon();
      break;
    case '--seed':
      seedNeon();
      break;
    case '--pull-data':
      await pullDataFromNeonToLocal();
      break;
    case '--status':
    default:
      await checkNeonStatus();
      break;
  }
}

main().catch(console.error);
