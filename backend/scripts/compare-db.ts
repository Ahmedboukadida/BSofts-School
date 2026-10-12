import { Client } from 'pg';

const LOCAL_URL = 'postgresql://postgres:admin@127.0.0.1:5432/bsoftsschool?schema=public';
const NEON_URL = 'postgresql://neondb_owner:npg_ItvFmO5Cw7ES@ep-broad-sunset-b4uaw37v-pooler.c-6.us-east-2.aws.neon.tech/bsofts_school?sslmode=require&channel_binding=require';

async function main() {
  const localClient = new Client({ connectionString: LOCAL_URL });
  const neonClient = new Client({ connectionString: NEON_URL });

  await localClient.connect();
  await neonClient.connect();

  const tables = [
    'User', 'Tenant', 'Establishment', 'SaaSPlan', 'TenantSubscription',
    'Class', 'Student', 'Teacher', 'Parent', 'AcademicYear', 'AcademicPeriod',
    'Session', 'Lesson', 'Exam', 'Notification', 'AuditLog', 'SystemLog'
  ];

  console.log('--- DB Comparison ---');
  for (const t of tables) {
    try {
      const l = await localClient.query(`SELECT count(*) FROM "${t}"`);
      const n = await neonClient.query(`SELECT count(*) FROM "${t}"`);
      console.log(`${t}: Local=${l.rows[0].count} | Neon=${n.rows[0].count}`);
    } catch (e: any) {
      console.log(`${t}: error ${e.message}`);
    }
  }

  const s = await localClient.query('SELECT id, date, "startTime", "endTime" FROM "Session" LIMIT 5');
  console.log('Sample Sessions in Local:', s.rows);

  await localClient.end();
  await neonClient.end();
}

main().catch(console.error);
