import { PrismaClient, Currency, PlanInterval } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.production first, fallback to .env
const prodEnvPath = path.join(__dirname, '..', '.env.production');
const localEnvPath = path.join(__dirname, '..', '.env');

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnvFile(prodEnvPath);
loadEnvFile(localEnvPath);

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_ItvFmO5Cw7ES@ep-broad-sunset-b4uaw37v-pooler.c-6.us-east-2.aws.neon.tech/bsofts_school?sslmode=require&channel_binding=require';

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const modules = [
  { name: 'Users', code: 'users', description: 'User management', sortOrder: 1 },
  { name: 'Roles', code: 'roles', description: 'Role management', sortOrder: 2 },
  { name: 'Students', code: 'students', description: 'Student management', sortOrder: 3 },
  { name: 'Teachers', code: 'teachers', description: 'Teacher management', sortOrder: 4 },
  { name: 'Parents', code: 'parents', description: 'Parent management', sortOrder: 5 },
  { name: 'Employees', code: 'employees', description: 'Employee management', sortOrder: 6 },
  { name: 'Classes', code: 'classes', description: 'Class management', sortOrder: 7 },
  { name: 'Modules', code: 'academic-modules', description: 'Academic module management', sortOrder: 8 },
  { name: 'Matieres', code: 'matieres', description: 'Subject management', sortOrder: 9 },
  { name: 'Lessons', code: 'lessons', description: 'Lesson management', sortOrder: 10 },
  { name: 'Exams', code: 'exams', description: 'Exam management', sortOrder: 11 },
  { name: 'Grades', code: 'grades', description: 'Grade management', sortOrder: 12 },
  { name: 'Attendance', code: 'attendance', description: 'Attendance management', sortOrder: 13 },
  { name: 'Payments', code: 'payments', description: 'Payment management', sortOrder: 14 },
  { name: 'Finance', code: 'finance', description: 'Finance management', sortOrder: 15 },
  { name: 'Rooms', code: 'rooms', description: 'Room management', sortOrder: 16 },
  { name: 'Calendar', code: 'calendar', description: 'Calendar & schedule', sortOrder: 17 },
  { name: 'Messaging', code: 'messaging', description: 'Messaging system', sortOrder: 18 },
  { name: 'Notifications', code: 'notifications', description: 'Notification management', sortOrder: 19 },
  { name: 'Reports', code: 'reports', description: 'Reports & analytics', sortOrder: 20 },
  { name: 'Establishments', code: 'establishments', description: 'Establishment management', sortOrder: 21 },
  { name: 'Settings', code: 'settings', description: 'System settings', sortOrder: 22 },
  { name: 'Billing', code: 'billing', description: 'SaaS billing', sortOrder: 23 },
];

const permissionActions = ['list', 'read', 'create', 'update', 'delete', 'export', 'import'];

const plans = [
  { name: 'Free', description: 'Free plan for small establishments', price: 0, currency: Currency.TND, interval: PlanInterval.MONTHLY, sortOrder: 1 },
  { name: 'Basic', description: 'Basic plan for schools', price: 50, currency: Currency.TND, interval: PlanInterval.MONTHLY, sortOrder: 2 },
  { name: 'Premium', description: 'Premium plan with all features', price: 150, currency: Currency.TND, interval: PlanInterval.MONTHLY, sortOrder: 3 },
  { name: 'Enterprise', description: 'Enterprise plan for large institutions', price: 500, currency: Currency.TND, interval: PlanInterval.YEARLY, sortOrder: 4 },
];

const classLevels = [
  { name: 'Petite Section', sortOrder: 1 },
  { name: 'Moyenne Section', sortOrder: 2 },
  { name: 'Grande Section', sortOrder: 3 },
  { name: 'CP', sortOrder: 4 },
  { name: 'CE1', sortOrder: 5 },
  { name: 'CE2', sortOrder: 6 },
  { name: 'CM1', sortOrder: 7 },
  { name: 'CM2', sortOrder: 8 },
  { name: '6ème', sortOrder: 9 },
  { name: '5ème', sortOrder: 10 },
  { name: '4ème', sortOrder: 11 },
  { name: '3ème', sortOrder: 12 },
  { name: 'Seconde', sortOrder: 13 },
  { name: 'Première', sortOrder: 14 },
  { name: 'Terminale', sortOrder: 15 },
];

const roles = [
  { name: 'Super Admin', code: 'SUPER_ADMIN', description: 'Establishment owner', isSystem: true },
  { name: 'Admin', code: 'ADMIN', description: 'Administrative staff', isSystem: true },
  { name: 'Employee', code: 'EMPLOYEE', description: 'Office staff', isSystem: true },
  { name: 'Teacher', code: 'TEACHER', description: 'Teaching staff', isSystem: true },
  { name: 'Student', code: 'STUDENT', description: 'Students', isSystem: true },
  { name: 'Parent', code: 'PARENT', description: 'Parents & guardians', isSystem: true },
];

async function seedProduction() {
  console.log('============================================================');
  console.log('🚀 [PRODUCTION SEED] Seeding Base System Entities to Neon');
  console.log('============================================================');
  console.log(`Connected to: ${connectionString.split('@')[1]?.split('/')[0] || 'Database'}\n`);

  try {
    // 1. SaaS Modules
    console.log('📦 Upserting SaaS Modules...');
    const createdModules = await Promise.all(
      modules.map((m) =>
        prisma.saaSModule.upsert({
          where: { code: m.code },
          update: { name: m.name, description: m.description, sortOrder: m.sortOrder },
          create: m,
        }),
      ),
    );
    console.log(`   ✅ ${createdModules.length} modules ready.`);

    // 2. SaaS Permissions
    console.log('🔐 Upserting SaaS Permissions...');
    const permissionsToCreate: Array<{ moduleId: string; name: string; code: string; description: string }> = [];
    for (const mod of createdModules) {
      for (const action of permissionActions) {
        permissionsToCreate.push({
          moduleId: mod.id,
          name: `${mod.name} ${action}`,
          code: `${mod.code}:${action}`,
          description: `${action} access for ${mod.name}`,
        });
      }
    }
    const createdPermissions = await Promise.all(
      permissionsToCreate.map((p) =>
        prisma.saaSPermission.upsert({
          where: { code: p.code },
          update: { name: p.name, description: p.description },
          create: p,
        }),
      ),
    );
    console.log(`   ✅ ${createdPermissions.length} permissions ready.`);

    // 3. System Roles
    console.log('👑 Upserting System Roles...');
    const createdRoles = await Promise.all(
      roles.map((r) =>
        prisma.role.upsert({
          where: { code: r.code },
          update: { name: r.name, description: r.description },
          create: r,
        }),
      ),
    );
    console.log(`   ✅ ${createdRoles.length} system roles ready.`);

    // 4. Role Permissions Assignment
    console.log('🔗 Assigning Role Permissions...');
    const rolePermissionsMap: Record<string, string[]> = {
      SUPER_ADMIN: createdPermissions.map((p) => p.code),
      ADMIN: createdPermissions.filter((p) => !p.code.startsWith('billing')).map((p) => p.code),
      EMPLOYEE: ['students:list', 'students:read', 'teachers:list', 'teachers:read', 'payments:list', 'payments:read'],
      TEACHER: ['students:list', 'students:read', 'lessons:list', 'lessons:read', 'lessons:create', 'grades:list', 'grades:read', 'grades:create', 'attendance:list', 'attendance:create', 'exams:list', 'exams:read', 'exams:create'],
      STUDENT: ['lessons:list', 'lessons:read', 'grades:list', 'grades:read', 'exams:list', 'exams:read', 'attendance:list', 'attendance:read'],
      PARENT: ['students:list', 'students:read', 'grades:list', 'grades:read', 'payments:list', 'payments:read', 'attendance:list', 'attendance:read'],
    };

    for (const role of createdRoles) {
      const permCodes = rolePermissionsMap[role.code] || [];
      const perms = createdPermissions.filter((p) => permCodes.includes(p.code));
      for (const perm of perms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
    console.log('   ✅ Role permissions mapped.');

    // 5. SaaS Plans
    console.log('💳 Upserting SaaS Plans...');
    const createdPlans = await Promise.all(
      plans.map((p) =>
        prisma.saaSPlan.upsert({
          where: { name: p.name },
          update: { price: p.price, description: p.description },
          create: p,
        }),
      ),
    );
    console.log(`   ✅ ${createdPlans.length} plans ready.`);

    // 6. Class Levels
    console.log('📚 Upserting Class Levels...');
    const createdClassLevels = await Promise.all(
      classLevels.map((cl) =>
        prisma.classLevel.upsert({
          where: { name: cl.name },
          update: { sortOrder: cl.sortOrder },
          create: cl,
        }),
      ),
    );
    console.log(`   ✅ ${createdClassLevels.length} class levels ready.`);

    // 7. Root User
    console.log('👤 Provisioning Root Super Administrator...');
    const rootPassword = await bcrypt.hash('Ahmed123*', 12);
    const rootUser = await prisma.user.upsert({
      where: { email: 'bsofts.contact@gmail.com' },
      update: {
        password: rootPassword,
        isRoot: true,
        isActive: true,
      },
      create: {
        email: 'bsofts.contact@gmail.com',
        username: 'bsofts_root',
        firstName: 'BSofts',
        lastName: 'Root',
        password: rootPassword,
        isRoot: true,
        isActive: true,
      },
    });

    const superAdminRole = createdRoles.find((r) => r.code === 'SUPER_ADMIN');
    if (superAdminRole) {
      const existingAssignment = await prisma.userRoleAssignment.findFirst({
        where: { userId: rootUser.id, roleId: superAdminRole.id },
      });
      if (!existingAssignment) {
        await prisma.userRoleAssignment.create({
          data: { userId: rootUser.id, roleId: superAdminRole.id },
        });
      }
    }
    console.log(`   ✅ Root user ready: bsofts.contact@gmail.com (Root: ${rootUser.isRoot})`);

    console.log('\n============================================================');
    console.log('🎉 [PRODUCTION SEED SUCCESS] Neon Cloud Database is Ready!');
    console.log('============================================================');
    console.log('Credentials:');
    console.log('  Email:    bsofts.contact@gmail.com');
    console.log('  Password: Ahmed123*');
    console.log('  Status:   ACTIVE / ROOT SUPER ADMIN');
    console.log('============================================================\n');
  } catch (err: any) {
    console.error('❌ Error seeding production database:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedProduction().catch(console.error);
