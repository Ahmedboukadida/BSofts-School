import { PrismaClient, Currency, EstablishmentCategory, SubscriptionStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '..', '.env');
const envFile = fs.readFileSync(envPath, 'utf-8');
envFile.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) return;
  const key = trimmed.slice(0, eqIndex).trim();
  let value = trimmed.slice(eqIndex + 1).trim();
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  process.env[key] = value;
});

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMatricule(prefix: string, index: number): string {
  return `${prefix}${String(index).padStart(4, '0')}`;
}

// ============================================================
// SEED DATA
// ============================================================

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
  { name: 'Free', description: 'Free plan for small establishments', price: 0, currency: Currency.TND, interval: 'MONTHLY' as const, sortOrder: 1 },
  { name: 'Basic', description: 'Basic plan for schools', price: 50, currency: Currency.TND, interval: 'MONTHLY' as const, sortOrder: 2 },
  { name: 'Premium', description: 'Premium plan with all features', price: 150, currency: Currency.TND, interval: 'MONTHLY' as const, sortOrder: 3 },
  { name: 'Enterprise', description: 'Enterprise plan for large institutions', price: 500, currency: Currency.TND, interval: 'YEARLY' as const, sortOrder: 4 },
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

const establishments: Array<{ name: string; slug: string; category: EstablishmentCategory }> = [
  { name: 'École El Irfane', slug: 'ecole-el-irfane', category: EstablishmentCategory.DAYCARE },
  { name: 'École Primaire Les Palmiers', slug: 'ecole-primaire-les-palmiers', category: EstablishmentCategory.SCHOOL },
  { name: 'Collège Al Andalous', slug: 'college-al-andalous', category: EstablishmentCategory.MIDDLE_SCHOOL },
  { name: 'Lycée Ibn Khaldoun', slug: 'lycee-ibn-khaldoun', category: EstablishmentCategory.HIGH_SCHOOL },
];

const matieres = [
  { name: 'Mathématiques', code: 'MATH', coefficient: 3 },
  { name: 'Français', code: 'FRAN', coefficient: 3 },
  { name: 'Arabe', code: 'ARAB', coefficient: 3 },
  { name: 'Anglais', code: 'ANGL', coefficient: 2 },
  { name: 'Physique-Chimie', code: 'PHYCH', coefficient: 2 },
  { name: 'SVT', code: 'SVT', coefficient: 2 },
  { name: 'Histoire-Géographie', code: 'HIST', coefficient: 2 },
  { name: 'Éducation Civique', code: 'CIVIQ', coefficient: 1 },
  { name: 'EPS', code: 'EPS', coefficient: 1 },
  { name: 'Informatique', code: 'INFO', coefficient: 1 },
  { name: 'Art Plastique', code: 'ART', coefficient: 1 },
  { name: 'Musique', code: 'MUSIQ', coefficient: 1 },
];

const firstNames = [
  'Mohammed', 'Ahmed', 'Youcef', 'Khaled', 'Amine', 'Omar', 'Karim', 'Samir', 'Rachid', 'Farid',
  'Fatima', 'Aicha', 'Khadija', 'Amina', 'Nadia', 'Sabrina', 'Meriem', 'Dalila', 'Naima', 'Sara',
  'Yacine', 'Sofiane', 'Abdelkader', 'Redouane', 'Zakaria', 'Mehdi', 'Bilal', 'Hamza', 'Youssef', 'Anis',
  'Lina', 'Houda', 'Imane', 'Asma', 'Wassila', 'Nesrine', 'Radia', 'Samira', 'Leila', 'Djihad',
];

const lastNames = [
  'Benali', 'Mohamedi', 'Khelifi', 'Bouzid', 'Ait Ahmed', 'Mebarki', 'Cherif', 'Belkacem', 'Hamidi', 'Brahimi',
  'Djelloul', 'Benaissa', 'Aouchiche', 'Mansouri', 'Touati', 'Guerfi', 'Bouhadja', 'Slimani', 'Bentaleb', 'Ferhat',
  'Bouzoura', 'Messaoudi', 'Boukhtoucha', 'Rahal', 'Bouzid', 'Mebarki', 'Cherif', 'Belkacem', 'Hamidi', 'Brahimi',
];

const addresses = [
  '123 Rue Didouche Mourad, Alger',
  '45 Avenue de la Liberté, Oran',
  '78 Boulevard Emir Abdelkader, Constantine',
  '12 Rue Hassiba Ben Bouali, Tlemcen',
  '89 Avenue principale, Blida',
  '34 Rue des Frères Abbas, Sétif',
  '56 Boulevard Zighoud Youcef, Annaba',
  '23 Rue Larbi Ben M\'hidi, Batna',
  '67 Avenue Ahmed Ouaked, Biskra',
  '91 Rue Colonel Amirouche, Tizi Ouzou',
];

const roomNames = [
  'Salle 101', 'Salle 102', 'Salle 103', 'Salle 201', 'Salle 202',
  'Salle 203', 'Salle 301', 'Salle 302', 'Labo Info', 'Labo Sci',
  'Gymnase', 'Bibliothèque', 'Amphithéâtre', 'Salle des Professeurs', 'Bureau Direction',
];

const lessonTitles = [
  'Introduction aux fractions',
  'Les droits de l\'homme',
  'La photosynthèse',
  'Les parties du discours',
  'Les équations du second degré',
  'La Révolution française',
  'Les cellules vivantes',
  'Les accents français',
  'La chimie organique',
  'Le système solaire',
  'Les droits de l\'homme',
  'La géométrie dans l\'espace',
  'La poésie contemporaine',
  'Les circuits électriques',
  'La殖民isation',
  'La nutrition chez les plantes',
  'Les nombres décimaux',
  'La grammaire arabe',
  'L\'empire ottoman',
  'Les Oxhydres-carbures',
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "DynamicEnum" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "AuditLog" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Notification" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Message" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "ConversationParticipant" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Conversation" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "FinancialTransaction" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Caisse" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "TeacherPayment" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "TeacherContract" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "StudentPayment" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "ExamSubmission" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "ExamQuestion" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Exam" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Note" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Lesson" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "TeacherAttendance" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "TeacherLeave" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "StudentAttendance" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Holiday" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Session" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Room" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "StudentClassAssignment" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "StudentParent" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "TeacherMatiere" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "ClassModuleAssignment" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Class" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "AcademicPeriod" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "AcademicYear" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Teacher" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Employee" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Parent" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Student" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Establishment" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "TenantSubscription" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "SaaSPlanFeature" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "SaaSPlanModule" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "SaaSPlan" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "SaaSPermission" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "SaaSModule" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "RolePermission" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "UserRoleAssignment" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Role" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "LoginLog" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Matiere" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "AcademicModule" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "TenantSettings" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "ClassLevel" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Tenant" CASCADE');
  console.log('   ✅ Data cleaned\n');

  // 1. Create SaaS Modules
  console.log('📦 Creating SaaS modules...');
  const createdModules = await Promise.all(
    modules.map((m) =>
      prisma.saaSModule.upsert({
        where: { code: m.code },
        update: { name: m.name, description: m.description, sortOrder: m.sortOrder },
        create: m,
      }),
    ),
  );
  console.log(`   ✅ ${createdModules.length} modules created`);

  // 2. Create Permissions
  console.log('🔐 Creating permissions...');
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
  console.log(`   ✅ ${createdPermissions.length} permissions created`);

  // 3. Create SaaS Plans
  console.log('💳 Creating SaaS plans...');
  const createdPlans = await Promise.all(
    plans.map((p) =>
      prisma.saaSPlan.upsert({
        where: { name: p.name },
        update: { price: p.price, description: p.description },
        create: p,
      }),
    ),
  );
  console.log(`   ✅ ${createdPlans.length} plans created`);

  // Assign modules to plans
  console.log('🔗 Assigning modules to plans...');
  for (const plan of createdPlans) {
    for (const mod of createdModules) {
      await prisma.saaSPlanModule.upsert({
        where: { planId_moduleId: { planId: plan.id, moduleId: mod.id } },
        update: {},
        create: { planId: plan.id, moduleId: mod.id },
      });
    }
  }
  console.log('   ✅ Plan modules assigned');

  // 4. Create System Roles
  console.log('👑 Creating system roles...');
  const roles = [
    { name: 'Super Admin', code: 'SUPER_ADMIN', description: 'Establishment owner', isSystem: true },
    { name: 'Admin', code: 'ADMIN', description: 'Administrative staff', isSystem: true },
    { name: 'Employee', code: 'EMPLOYEE', description: 'Office staff', isSystem: true },
    { name: 'Teacher', code: 'TEACHER', description: 'Teaching staff', isSystem: true },
    { name: 'Student', code: 'STUDENT', description: 'Students', isSystem: true },
    { name: 'Parent', code: 'PARENT', description: 'Parents & guardians', isSystem: true },
  ];

  const createdRoles = await Promise.all(
    roles.map((r) =>
      prisma.role.upsert({
        where: { code: r.code },
        update: { name: r.name, description: r.description },
        create: r,
      }),
    ),
  );
  console.log(`   ✅ ${createdRoles.length} roles created`);

  // Assign permissions to roles
  console.log('🔗 Assigning permissions to roles...');
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
  console.log('   ✅ Role permissions assigned');

  // 5. Create Class Levels
  console.log('📚 Creating class levels...');
  const createdClassLevels = await Promise.all(
    classLevels.map((cl) =>
      prisma.classLevel.upsert({
        where: { name: cl.name },
        update: { sortOrder: cl.sortOrder },
        create: cl,
      }),
    ),
  );
  console.log(`   ✅ ${createdClassLevels.length} class levels created`);

  // 6. Create Super Admin User (Root)
  console.log('👤 Creating super admin user...');
  const rootPassword = await bcrypt.hash('Ahmed123*', 12);
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const superAdmin = await prisma.user.upsert({
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

  const superAdminRole = createdRoles.find((r) => r.code === 'SUPER_ADMIN')!;
  const existingAssignment = await prisma.userRoleAssignment.findFirst({
    where: { userId: superAdmin.id, roleId: superAdminRole.id, establishmentId: null },
  });
  if (!existingAssignment) {
    await prisma.userRoleAssignment.create({
      data: { userId: superAdmin.id, roleId: superAdminRole.id },
    });
  }
  console.log('   ✅ Super admin user created: bsofts.contact@gmail.com / Ahmed123*');

  // 7. Create Tenants
  console.log('🏢 Creating tenants...');
  const tenantUsers = [];
  for (let i = 0; i < 2; i++) {
    const tenantUser = await prisma.user.upsert({
      where: { email: `tenant${i + 1}@bsofts.com` },
      update: {},
      create: {
        email: `tenant${i + 1}@bsofts.com`,
        username: `tenant${i + 1}`,
        firstName: `Tenant ${i + 1}`,
        lastName: 'Admin',
        password: hashedPassword,
        isRoot: false,
        isActive: true,
      },
    });
    tenantUsers.push(tenantUser);
  }

  const createdTenants = await Promise.all(
    tenantUsers.map((user) =>
      prisma.tenant.create({
        data: { userId: user.id },
      }),
    ),
  );
  console.log(`   ✅ ${createdTenants.length} tenants created`);

  // 8. Create Establishments
  console.log('🏫 Creating establishments...');
  const createdEstablishments = await Promise.all(
    establishments.map((e, i) =>
      prisma.establishment.create({
        data: {
          ...e,
          tenantId: createdTenants[i % createdTenants.length].id,
          country: 'TN',
          timezone: 'Africa/Tunis',
          phone: `216${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          email: `${e.slug}@school.dz`,
          address: randomPick(addresses),
        },
      }),
    ),
  );
  console.log(`   ✅ ${createdEstablishments.length} establishments created`);

  // Assign Super Admin to all establishments
  for (const est of createdEstablishments) {
    const existing = await prisma.userRoleAssignment.findFirst({
      where: { userId: superAdmin.id, roleId: superAdminRole.id, establishmentId: est.id },
    });
    if (!existing) {
      await prisma.userRoleAssignment.create({
        data: { userId: superAdmin.id, roleId: superAdminRole.id, establishmentId: est.id },
      });
    }
  }

  // 9. Create Tenant Settings
  console.log('⚙️ Creating tenant settings...');
  for (const tenant of createdTenants) {
    await prisma.tenantSettings.create({
      data: {
        tenantId: tenant.id,
        currency: 'TND',
        language: 'FR',
        theme: 'LIGHT',
        timezone: 'Africa/Tunis',
        dateFormat: 'DD/MM/YYYY',
      },
    });
  }
  console.log('   ✅ Tenant settings created with defaults: TND, FR, LIGHT');

  // 9.1 Create Default Dynamic Enums per establishment
  console.log('🏷️ Creating dynamic enums...');
  const defaultEnums = [
    { category: 'STUDENT_STATUS', code: 'INSCRIT', labelFr: 'Inscrit', labelEn: 'Enrolled', labelAr: 'مسجل', color: '#10B981', sortOrder: 1 },
    { category: 'STUDENT_STATUS', code: 'RADIE', labelFr: 'Radié', labelEn: 'Expelled', labelAr: 'مفصول', color: '#EF4444', sortOrder: 2 },
    { category: 'STUDENT_STATUS', code: 'SUSPENDU', labelFr: 'Suspendu', labelEn: 'Suspended', labelAr: 'موقوف', color: '#F59E0B', sortOrder: 3 },
    { category: 'STUDENT_STATUS', code: 'DIPLOME', labelFr: 'Diplômé', labelEn: 'Graduated', labelAr: 'متخرج', color: '#4F46E5', sortOrder: 4 },
    { category: 'PAYMENT_METHOD', code: 'ESPECES', labelFr: 'Espèces', labelEn: 'Cash', labelAr: 'نقدا', color: '#10B981', sortOrder: 1 },
    { category: 'PAYMENT_METHOD', code: 'CHEQUE', labelFr: 'Chèque', labelEn: 'Check', labelAr: 'شيك', color: '#3B82F6', sortOrder: 2 },
    { category: 'PAYMENT_METHOD', code: 'VIREMENT', labelFr: 'Virement', labelEn: 'Bank Transfer', labelAr: 'تحويل بنكي', color: '#8B5CF6', sortOrder: 3 },
    { category: 'CAISSE_TYPE', code: 'PRINCIPALE', labelFr: 'Caisse Principale', labelEn: 'Main Cash Desk', labelAr: 'الصندوق الرئيسي', color: '#4F46E5', sortOrder: 1 },
    { category: 'CAISSE_TYPE', code: 'SCOLARITE', labelFr: 'Caisse Frais Scolarité', labelEn: 'Tuition Cash Desk', labelAr: 'صندوق مصاريف الدراسة', color: '#10B981', sortOrder: 2 },
    { category: 'CAISSE_TYPE', code: 'SALAIRES', labelFr: 'Caisse Salaires', labelEn: 'Payroll Cash Desk', labelAr: 'صندوق الأجور', color: '#F59E0B', sortOrder: 3 },
  ];

  for (const est of createdEstablishments) {
    for (const de of defaultEnums) {
      await prisma.dynamicEnum.create({
        data: {
          ...de,
          establishmentId: est.id,
        },
      });
    }
  }
  console.log('   ✅ Dynamic enums created for all establishments');

  // 10. Create Academic Modules per establishment
  console.log('📦 Creating academic modules...');
  const allAcademicModules: any[] = [];
  for (const establishment of createdEstablishments) {
    const moduleNames = ['Sciences', 'Lettres et Langues', 'Mathématiques'];
    for (const name of moduleNames) {
      const existing = await prisma.academicModule.findFirst({
        where: { name, establishmentId: establishment.id },
      });
      if (!existing) {
        const mod = await prisma.academicModule.create({
          data: {
            name,
            establishmentId: establishment.id,
          },
        });
        allAcademicModules.push(mod);
      }
    }
  }
  console.log(`   ✅ ${allAcademicModules.length} academic modules created`);

  // 11. Create Matieres
  console.log('📖 Creating subjects...');
  const createdMatieres = await Promise.all(
    matieres.map(async (m, idx) => {
      const module = allAcademicModules[idx % allAcademicModules.length];
      const existing = await prisma.matiere.findFirst({ where: { name: m.name, moduleId: module.id } });
      if (existing) {
        return prisma.matiere.update({ where: { id: existing.id }, data: { coefficient: m.coefficient } });
      }
      return prisma.matiere.create({
        data: { ...m, moduleId: module.id },
      });
    }),
  );
  console.log(`   ✅ ${createdMatieres.length} subjects created`);

  // 12. Create Users for Admin, Teachers, Students, Parents, Employees
  console.log('👥 Creating users...');

  const adminRole = createdRoles.find((r) => r.code === 'ADMIN')!;
  const teacherRole = createdRoles.find((r) => r.code === 'TEACHER')!;
  const studentRole = createdRoles.find((r) => r.code === 'STUDENT')!;
  const parentRole = createdRoles.find((r) => r.code === 'PARENT')!;
  const employeeRole = createdRoles.find((r) => r.code === 'EMPLOYEE')!;

  // Create Admin Users
  const adminUsers = [];
  for (let i = 0; i < 3; i++) {
    const user = await prisma.user.create({
      data: {
        email: `admin${i + 1}@school.dz`,
        username: `admin${i + 1}`,
        firstName: randomPick(firstNames),
        lastName: randomPick(lastNames),
        password: hashedPassword,
        isActive: true,
      },
    });
    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        roleId: adminRole.id,
        establishmentId: createdEstablishments[i % createdEstablishments.length].id,
      },
    });
    adminUsers.push(user);
  }
  console.log(`   ✅ ${adminUsers.length} admin users created`);

  // Create Teacher Users
  const teacherUsers = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `teacher${i + 1}@school.dz`,
        username: `teacher${i + 1}`,
        firstName: randomPick(firstNames),
        lastName: randomPick(lastNames),
        password: hashedPassword,
        isActive: true,
      },
    });
    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        roleId: teacherRole.id,
        establishmentId: createdEstablishments[i % createdEstablishments.length].id,
      },
    });
    teacherUsers.push(user);
  }
  console.log(`   ✅ ${teacherUsers.length} teacher users created`);

  // Create Parent Users
  const parentUsers = [];
  for (let i = 0; i < 15; i++) {
    const user = await prisma.user.create({
      data: {
        email: `parent${i + 1}@school.dz`,
        username: `parent${i + 1}`,
        firstName: randomPick(firstNames),
        lastName: randomPick(lastNames),
        password: hashedPassword,
        isActive: true,
      },
    });
    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        roleId: parentRole.id,
        establishmentId: createdEstablishments[i % createdEstablishments.length].id,
      },
    });
    parentUsers.push(user);
  }
  console.log(`   ✅ ${parentUsers.length} parent users created`);

  // Create Student Users
  const studentUsers = [];
  for (let i = 0; i < 30; i++) {
    const user = await prisma.user.create({
      data: {
        email: `student${i + 1}@school.dz`,
        username: `student${i + 1}`,
        firstName: randomPick(firstNames),
        lastName: randomPick(lastNames),
        password: hashedPassword,
        isActive: true,
      },
    });
    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        roleId: studentRole.id,
        establishmentId: createdEstablishments[i % createdEstablishments.length].id,
      },
    });
    studentUsers.push(user);
  }
  console.log(`   ✅ ${studentUsers.length} student users created`);

  // Create Employee Users
  const employeeUsers = [];
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `employee${i + 1}@school.dz`,
        username: `employee${i + 1}`,
        firstName: randomPick(firstNames),
        lastName: randomPick(lastNames),
        password: hashedPassword,
        isActive: true,
      },
    });
    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        roleId: employeeRole.id,
        establishmentId: createdEstablishments[i % createdEstablishments.length].id,
      },
    });
    employeeUsers.push(user);
  }
  console.log(`   ✅ ${employeeUsers.length} employee users created`);

  // 11. Create Students
  console.log('🎓 Creating students...');
  const createdStudents = [];
  for (let i = 0; i < studentUsers.length; i++) {
      const student = await prisma.student.create({
      data: {
        firstName: studentUsers[i].firstName,
        lastName: studentUsers[i].lastName,
        phone: `06${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        registrationNumber: generateMatricule('REG', i + 1),
        dateOfBirth: randomDate(new Date('2005-01-01'), new Date('2015-12-31')),
        gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
        address: randomPick(addresses),
        userId: studentUsers[i].id,
        establishmentId: createdEstablishments[i % createdEstablishments.length].id,
      },
    });
    createdStudents.push(student);
  }
  console.log(`   ✅ ${createdStudents.length} students created`);

  // 12. Create Parents
  console.log('👨‍👩‍👧 Creating parents...');
  const createdParents = [];
  for (let i = 0; i < parentUsers.length; i++) {
    const parent = await prisma.parent.create({
      data: {
        firstName: parentUsers[i].firstName,
        lastName: parentUsers[i].lastName,
        email: parentUsers[i].email,
        phone: `05${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        occupation: randomPick(['Ingénieur', 'Médecin', 'Enseignant', 'Commerçant', 'Fonctionnaire', 'Infirmier']),
        userId: parentUsers[i].id,
        establishmentId: createdEstablishments[i % createdEstablishments.length].id,
      },
    });
    createdParents.push(parent);
  }
  console.log(`   ✅ ${createdParents.length} parents created`);

  // 13. Create Teachers
  console.log('👩‍🏫 Creating teachers...');
  const createdTeachers = [];
  for (let i = 0; i < teacherUsers.length; i++) {
    const teacher = await prisma.teacher.create({
      data: {
        firstName: teacherUsers[i].firstName,
        lastName: teacherUsers[i].lastName,
        email: teacherUsers[i].email,
        phone: `05${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        specialization: randomPick(matieres.map((m) => m.name)),
        hireDate: randomDate(new Date('2015-01-01'), new Date('2023-12-31')),
        address: randomPick(addresses),
        userId: teacherUsers[i].id,
        establishmentId: createdEstablishments[i % createdEstablishments.length].id,
      },
    });
    createdTeachers.push(teacher);
  }
  console.log(`   ✅ ${createdTeachers.length} teachers created`);

  // 14. Create Employees
  console.log('👔 Creating employees...');
  const createdEmployees = [];
  for (let i = 0; i < employeeUsers.length; i++) {
    const employee = await prisma.employee.create({
      data: {
        firstName: employeeUsers[i].firstName,
        lastName: employeeUsers[i].lastName,
        email: employeeUsers[i].email,
        phone: `05${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        position: randomPick(['Secrétaire', 'Comptable', 'Surveillant', 'Assistant', 'Technicien']),
        hireDate: randomDate(new Date('2015-01-01'), new Date('2023-12-31')),
        userId: employeeUsers[i].id,
        establishmentId: createdEstablishments[i % createdEstablishments.length].id,
      },
    });
    createdEmployees.push(employee);
  }
  console.log(`   ✅ ${createdEmployees.length} employees created`);

  // 15. Create Academic Years
  console.log('📅 Creating academic years...');
  const academicYears = await Promise.all([
    prisma.academicYear.create({
      data: {
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: true,
        establishmentId: createdEstablishments[0].id,
      },
    }),
    prisma.academicYear.create({
      data: {
        name: '2023-2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
        isCurrent: false,
        establishmentId: createdEstablishments[0].id,
      },
    }),
  ]);
  console.log(`   ✅ ${academicYears.length} academic years created`);

  // 16. Create Academic Periods
  console.log('📆 Creating academic periods...');
  const periods = [];
  for (const year of academicYears) {
    const p1 = await prisma.academicPeriod.create({
      data: {
        name: 'Trimestre 1',
        type: 'TRIMESTER',
        startDate: year.startDate,
        endDate: new Date(new Date(year.startDate).setMonth(new Date(year.startDate).getMonth() + 3)),
        academicYearId: year.id,
      },
    });
    const p2 = await prisma.academicPeriod.create({
      data: {
        name: 'Trimestre 2',
        type: 'TRIMESTER',
        startDate: new Date(new Date(year.startDate).setMonth(new Date(year.startDate).getMonth() + 3)),
        endDate: new Date(new Date(year.startDate).setMonth(new Date(year.startDate).getMonth() + 6)),
        academicYearId: year.id,
      },
    });
    const p3 = await prisma.academicPeriod.create({
      data: {
        name: 'Trimestre 3',
        type: 'TRIMESTER',
        startDate: new Date(new Date(year.startDate).setMonth(new Date(year.startDate).getMonth() + 6)),
        endDate: year.endDate,
        academicYearId: year.id,
      },
    });
    periods.push(p1, p2, p3);
  }
  console.log(`   ✅ ${periods.length} academic periods created`);

  // 17. Create Rooms
  console.log('🏠 Creating rooms...');
  const createdRooms = await Promise.all(
    roomNames.map((name, i) =>
      prisma.room.create({
        data: {
          name,
          code: `ROOM${String(i + 1).padStart(3, '0')}`,
          capacity: Math.floor(Math.random() * 30) + 20,
          type: i < 12 ? 'CLASSROOM' : i < 14 ? 'LABORATORY' : 'OTHER',
          establishmentId: createdEstablishments[i % createdEstablishments.length].id,
        },
      }),
    ),
  );
  console.log(`   ✅ ${createdRooms.length} rooms created`);

  // 18. Create Classes
  console.log('📚 Creating classes...');
  const createdClasses = [];
  const currentYear = academicYears[0];
  const selectedLevels = createdClassLevels.slice(8, 15); // 6ème to Terminale

  for (const level of selectedLevels) {
    for (let i = 0; i < 2; i++) {
      const cls = await prisma.class.create({
        data: {
          name: `${level.name} ${String.fromCharCode(65 + i)}`,
          code: `${level.name.replace(/\s/g, '')}${String.fromCharCode(65 + i)}`,
          classLevelId: level.id,
          academicYearId: currentYear.id,
          establishmentId: createdEstablishments[0].id,
          periodType: 'TRIMESTER',
          maxStudents: 40,
        },
      });
      createdClasses.push(cls);
    }
  }
  console.log(`   ✅ ${createdClasses.length} classes created`);

  // 19. Assign Students to Classes
  console.log('🔗 Assigning students to classes...');
  for (let i = 0; i < createdStudents.length; i++) {
    const cls = createdClasses[i % createdClasses.length];
    await prisma.studentClassAssignment.create({
      data: {
        studentId: createdStudents[i].id,
        classId: cls.id,
        academicYearId: currentYear.id,
        assignedAt: randomDate(new Date('2024-09-01'), new Date('2024-09-15')),
      },
    });
  }
  console.log('   ✅ Students assigned to classes');

  // 20. Create Sessions
  console.log('⏰ Creating sessions...');
  const createdSessions = [];
  for (const cls of createdClasses) {
    for (let day = 1; day <= 5; day++) {
      for (let slot = 0; slot < 6; slot++) {
        const session = await prisma.session.create({
          data: {
            classId: cls.id,
            periodId: periods[0].id,
            academicYearId: currentYear.id,
            date: randomDate(new Date('2024-09-16'), new Date('2024-12-15')),
            startTime: new Date(2024, 0, 1, 8 + slot, 0),
            endTime: new Date(2024, 0, 1, 9 + slot, 0),
          },
        });
        createdSessions.push(session);
      }
    }
  }
  console.log(`   ✅ ${createdSessions.length} sessions created`);

  // 21. Create Lessons
  console.log('📝 Creating lessons...');
  const createdLessons = [];
  const lessonSessions = createdSessions.slice(0, 50);
  for (let i = 0; i < lessonSessions.length; i++) {
    const matiere = randomPick(createdMatieres);
    const teacher = randomPick(createdTeachers);
    const lesson = await prisma.lesson.create({
      data: {
        sessionId: lessonSessions[i].id,
        matiereId: matiere.id,
        title: randomPick(lessonTitles),
        content: 'Contenu de la leçon à compléter.',
        objectives: 'Objectifs pédagogiques de la leçon.',
        createdBy: teacher.userId,
      },
    });
    createdLessons.push(lesson);
  }
  console.log(`   ✅ ${createdLessons.length} lessons created`);

  // 22. Create Student Attendance
  console.log('📋 Creating student attendance records...');
  const attendanceRecords = [];
  const attendanceSessions = createdSessions.slice(0, 100);

  for (const session of attendanceSessions) {
    const studentsInClass = await prisma.studentClassAssignment.findMany({
      where: { classId: session.classId },
    });

    for (const assignment of studentsInClass) {
      const rand = Math.random();
      let status: string;
      if (rand < 0.85) status = 'PRESENT';
      else if (rand < 0.92) status = 'ABSENT';
      else if (rand < 0.97) status = 'LATE';
      else status = 'EXCUSED';

      const record = await prisma.studentAttendance.create({
        data: {
          studentId: assignment.studentId,
          sessionId: session.id,
          status: status as any,
        },
      });
      attendanceRecords.push(record);
    }
  }
  console.log(`   ✅ ${attendanceRecords.length} attendance records created`);

  // 23. Create Teacher Attendance
  console.log('👩‍🏫 Creating teacher attendance records...');
  const teacherAttendanceRecords = [];
  const startDate = new Date('2024-09-16');
  const endDate = new Date('2024-12-15');
  for (const teacher of createdTeachers) {
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const rand = Math.random();
      let status: string;
      if (rand < 0.92) status = 'PRESENT';
      else if (rand < 0.96) status = 'ABSENT';
      else status = 'LATE';

      const record = await prisma.teacherAttendance.create({
        data: {
          teacherId: teacher.id,
          date: new Date(d),
          status: status as any,
        },
      });
      teacherAttendanceRecords.push(record);
    }
  }
  console.log(`   ✅ ${teacherAttendanceRecords.length} teacher attendance records created`);

  // 24. Create Exams
  console.log('📝 Creating exams...');
  const createdExams = [];
  const examTypes = ['QUIZ', 'MIDTERM', 'FINAL', 'HOMEWORK'];
  const examStatuses = ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'];

  for (const cls of createdClasses.slice(0, 5)) {
    for (const matiere of createdMatieres.slice(0, 4)) {
      const exam = await prisma.exam.create({
        data: {
          title: `Examen ${matiere.name} - ${cls.name}`,
          description: `Examen de ${matiere.name} pour la classe ${cls.name}`,
          type: randomPick(examTypes) as any,
          maxScore: 20,
          duration: randomPick([60, 90, 120]),
          classId: cls.id,
          matiereId: matiere.id,
          periodId: periods[0].id,
          academicYearId: currentYear.id,
          establishmentId: createdEstablishments[0].id,
          status: randomPick(examStatuses) as any,
          startTime: randomDate(new Date('2024-10-01'), new Date('2024-12-15')),
        },
      });
      createdExams.push(exam);
    }
  }
  console.log(`   ✅ ${createdExams.length} exams created`);

  // 25. Create Notes/Grades
  console.log('📊 Creating grades...');
  const createdNotes = [];
  for (const exam of createdExams) {
    const classObj = await prisma.class.findUnique({ where: { id: exam.classId } });
    if (!classObj) continue;

    const students = await prisma.studentClassAssignment.findMany({
      where: { classId: exam.classId },
    });

    for (const assignment of students) {
      if (!exam.matiereId || !exam.periodId || !exam.academicYearId) continue;
      const matiere = await prisma.matiere.findUnique({ where: { id: exam.matiereId } });
      if (!matiere) continue;

      const note = await prisma.note.create({
        data: {
          studentId: assignment.studentId,
          matiereId: exam.matiereId,
          periodId: exam.periodId,
          academicYearId: exam.academicYearId,
          examId: exam.id,
          value: Math.floor(Math.random() * 16) + 4,
          maxValue: 20,
          coefficient: matiere.coefficient,
          comment: randomPick(['Excellent', 'Bien', 'Passable', 'Insuffisant', '']),
        },
      });
      createdNotes.push(note);
    }
  }
  console.log(`   ✅ ${createdNotes.length} grades created`);

  // 26. Create Caisse
  console.log('💰 Creating caisses...');
  const createdCaisses = await Promise.all([
    prisma.caisse.create({
      data: {
        name: 'Caisse Principale',
        type: 'MAIN',
        balance: 50000,
        currency: 'TND',
        establishmentId: createdEstablishments[0].id,
      },
    }),
    prisma.caisse.create({
      data: {
        name: 'Caisse Petite',
        type: 'PETTY_CASH',
        balance: 5000,
        currency: 'TND',
        establishmentId: createdEstablishments[0].id,
      },
    }),
    prisma.caisse.create({
      data: {
        name: 'Compte Bancaire',
        type: 'SALARY',
        balance: 200000,
        currency: 'TND',
        establishmentId: createdEstablishments[0].id,
      },
    }),
  ]);
  console.log(`   ✅ ${createdCaisses.length} caisses created`);

  // 27. Create Student Payments
  console.log('💳 Creating student payments...');
  const paymentStatuses = ['PAID', 'PENDING', 'PARTIAL', 'OVERDUE'];
  const feeTypes = ['Frais de scolarité', 'Frais d\'inscription', 'Assurance', 'Cantine', 'Transport'];

  const createdPayments = [];
  for (const student of createdStudents) {
    const numPayments = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numPayments; i++) {
      const payment = await prisma.studentPayment.create({
        data: {
          studentId: student.id,
          parentId: createdParents[studentUsers.indexOf(studentUsers.find((u) => u.id === student.userId)!) % createdParents.length].id,
          amount: randomPick([50, 100, 150, 200, 250]),
          currency: 'TND',
          method: randomPick(['CASH', 'BANK_TRANSFER', 'CHECK']) as any,
          status: randomPick(paymentStatuses) as any,
          paidAt: randomDate(new Date('2024-09-01'), new Date('2024-12-15')),
          reference: `PAY${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
          notes: 'Paiement frais de scolarité',
        },
      });
      createdPayments.push(payment);
    }
  }
  console.log(`   ✅ ${createdPayments.length} student payments created`);

  // 28. Create Teacher Contracts
  console.log('📝 Creating teacher contracts...');
  const createdContracts = [];
  for (const teacher of createdTeachers) {
    const contract = await prisma.teacherContract.create({
      data: {
        teacherId: teacher.id,
        contractType: 'MONTHLY',
        startDate: randomDate(new Date('2023-01-01'), new Date('2024-01-01')),
        salary: randomPick([500, 600, 700, 800]),
        currency: 'TND',
      },
    });
    createdContracts.push(contract);
  }
  console.log(`   ✅ ${createdContracts.length} teacher contracts created`);

  // 29. Create Teacher Payments
  console.log('👩‍🏫 Creating teacher payments...');
  const createdTeacherPayments = [];
  for (let i = 0; i < createdTeachers.length; i++) {
    const payment = await prisma.teacherPayment.create({
      data: {
        teacherId: createdTeachers[i].id,
        contractId: createdContracts[i].id,
        period: 'Décembre 2024',
        amount: createdContracts[i].salary,
        currency: 'TND',
        calculatedAmount: createdContracts[i].salary,
        status: randomPick(['PENDING', 'PAID']) as any,
        paidAt: new Date('2024-12-28'),
      },
    });
    createdTeacherPayments.push(payment);
  }
  console.log(`   ✅ ${createdTeacherPayments.length} teacher payments created`);

  // 29. Create Financial Transactions
  console.log('📊 Creating financial transactions...');
  const transactionTypes = ['INCOME', 'EXPENSE'];
  const transactionCategories = ['Frais de scolarité', 'Salaires', 'Fournitures', 'Équipement', 'Maintenance', 'Autres'];

  const createdTransactions = [];
  for (let i = 0; i < 30; i++) {
    const type = randomPick(transactionTypes);
    const transaction = await prisma.financialTransaction.create({
      data: {
        caisseId: createdCaisses[0].id,
        type: type as any,
        amount: type === 'INCOME' ? randomPick([50, 100, 150]) : randomPick([20, 50, 80]),
        balance: 50000 + (i * 100),
        category: randomPick(transactionCategories),
        description: `Transaction ${i + 1}`,
        performedBy: superAdmin.id,
      },
    });
    createdTransactions.push(transaction);
  }
  console.log(`   ✅ ${createdTransactions.length} financial transactions created`);

  // 30. Create Conversations and Messages
  console.log('💬 Creating conversations and messages...');
  const conversations = [];
  for (let i = 0; i < 5; i++) {
    const conversation = await prisma.conversation.create({
      data: {
        type: 'DIRECT',
      },
    });

    await prisma.conversationParticipant.createMany({
      data: [
        { conversationId: conversation.id, userId: teacherUsers[i % teacherUsers.length].id },
        { conversationId: conversation.id, userId: studentUsers[i % studentUsers.length].id },
      ],
    });

    // Create messages
    for (let j = 0; j < 5; j++) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: j % 2 === 0 ? teacherUsers[i % teacherUsers.length].id : studentUsers[i % studentUsers.length].id,
          content: `Message ${j + 1} dans la conversation ${i + 1}`,
          type: 'TEXT',
          isRead: Math.random() > 0.5,
        },
      });
    }
    conversations.push(conversation);
  }
  console.log(`   ✅ ${conversations.length} conversations with messages created`);

  // 31. Create Notifications
  console.log('🔔 Creating notifications...');
  const notificationTypes = ['IN_APP', 'EMAIL', 'SMS'];
  const notificationTitles = [
    'Bienvenue sur BSofts School',
    'Rappel: Réunion parents-professeurs',
    'Nouveau bulletin disponible',
    'Paiement reçu avec succès',
    'Mise à jour du système',
  ];

  const createdNotifications = [];
  for (const user of studentUsers.slice(0, 10)) {
    for (let i = 0; i < 3; i++) {
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          title: randomPick(notificationTitles),
          content: `Contenu de la notification ${i + 1}`,
          type: randomPick(notificationTypes) as any,
          isRead: Math.random() > 0.5,
        },
      });
      createdNotifications.push(notification);
    }
  }
  console.log(`   ✅ ${createdNotifications.length} notifications created`);

  // 32. Create Audit Logs
  console.log('📝 Creating audit logs...');
  const auditActions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
  const auditEntities = ['User', 'Student', 'Teacher', 'Class', 'Exam', 'Payment'];

  const createdAuditLogs = [];
  for (let i = 0; i < 50; i++) {
    const log = await prisma.auditLog.create({
      data: {
        userId: superAdmin.id,
        action: randomPick(auditActions),
        entity: randomPick(auditEntities),
        entityId: superAdmin.id,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      },
    });
    createdAuditLogs.push(log);
  }
  console.log(`   ✅ ${createdAuditLogs.length} audit logs created`);

  // 33. Create Tenant Subscriptions
  console.log('💳 Creating tenant subscriptions...');
  const subscriptionStatuses: SubscriptionStatus[] = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.SUSPENDED,
    SubscriptionStatus.EXPIRED,
  ];
  const createdSubscriptions = [];
  for (let i = 0; i < createdTenants.length; i++) {
    const plan = createdPlans[i % createdPlans.length];
    const status = subscriptionStatuses[i % subscriptionStatuses.length];
    const startDate = new Date('2025-09-01');
    const endDate = new Date('2026-09-01');
    const sub = await prisma.tenantSubscription.create({
      data: {
        tenantId: createdTenants[i].id,
        planId: plan.id,
        status,
        startDate,
        endDate,
      },
    });
    createdSubscriptions.push(sub);
  }
  console.log(`   ✅ ${createdSubscriptions.length} tenant subscriptions created`);

  // 34. Create SaaS Plan Features
  console.log('✨ Creating plan features...');
  const planFeatures = [
    { planId: createdPlans[0].id, code: 'max_students', value: '50', description: 'Maximum 50 students' },
    { planId: createdPlans[0].id, code: 'max_teachers', value: '5', description: 'Maximum 5 teachers' },
    { planId: createdPlans[0].id, code: 'reports', value: 'basic', description: 'Basic reporting' },
    { planId: createdPlans[1].id, code: 'max_students', value: '200', description: 'Maximum 200 students' },
    { planId: createdPlans[1].id, code: 'max_teachers', value: '20', description: 'Maximum 20 teachers' },
    { planId: createdPlans[1].id, code: 'reports', value: 'advanced', description: 'Advanced reporting' },
    { planId: createdPlans[1].id, code: 'sms', value: 'true', description: 'SMS notifications' },
    { planId: createdPlans[2].id, code: 'max_students', value: 'unlimited', description: 'Unlimited students' },
    { planId: createdPlans[2].id, code: 'max_teachers', value: 'unlimited', description: 'Unlimited teachers' },
    { planId: createdPlans[2].id, code: 'reports', value: 'full', description: 'Full reporting' },
    { planId: createdPlans[2].id, code: 'sms', value: 'true', description: 'SMS notifications' },
    { planId: createdPlans[2].id, code: 'support', value: 'priority', description: 'Priority support' },
    { planId: createdPlans[2].id, code: 'api', value: 'true', description: 'API access' },
    { planId: createdPlans[3].id, code: 'max_students', value: 'unlimited', description: 'Unlimited students' },
    { planId: createdPlans[3].id, code: 'custom_domain', value: 'true', description: 'Custom domain' },
    { planId: createdPlans[3].id, code: 'white_label', value: 'true', description: 'White label branding' },
  ];
  const createdPlanFeatures = [];
  for (const f of planFeatures) {
    const feat = await prisma.saaSPlanFeature.create({ data: f });
    createdPlanFeatures.push(feat);
  }
  console.log(`   ✅ ${createdPlanFeatures.length} plan features created`);

  // 35. Create StudentParent relations
  console.log('👨‍👩‍👧 Creating student-parent relations...');
  const createdStudentParents = [];
  for (let i = 0; i < createdStudents.length; i++) {
    const parentIdx = i % createdParents.length;
    const sp = await prisma.studentParent.create({
      data: {
        studentId: createdStudents[i].id,
        parentId: createdParents[parentIdx].id,
        relation: i % 3 === 0 ? 'father' : i % 3 === 1 ? 'mother' : 'guardian',
      },
    });
    createdStudentParents.push(sp);
  }
  console.log(`   ✅ ${createdStudentParents.length} student-parent relations created`);

  // 36. Create TeacherMatiere relations
  console.log('👩‍🏫 Creating teacher-subject relations...');
  const createdTeacherMatieres = [];
  for (const teacher of createdTeachers) {
    const numSubjects = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...createdMatieres].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numSubjects; i++) {
      const tm = await prisma.teacherMatiere.create({
        data: {
          teacherId: teacher.id,
          matiereId: shuffled[i].id,
        },
      });
      createdTeacherMatieres.push(tm);
    }
  }
  console.log(`   ✅ ${createdTeacherMatieres.length} teacher-subject relations created`);

  // 37. Create ClassModuleAssignment
  console.log('📚 Creating class-module assignments...');
  const createdClassModuleAssignments = [];
  for (const cls of createdClasses) {
    for (const mod of allAcademicModules.slice(0, 2)) {
      const cma = await prisma.classModuleAssignment.create({
        data: {
          classId: cls.id,
          moduleId: mod.id,
        },
      });
      createdClassModuleAssignments.push(cma);
    }
  }
  console.log(`   ✅ ${createdClassModuleAssignments.length} class-module assignments created`);

  // 38. Create Holidays
  console.log('🏖️ Creating holidays...');
  const holidayData = [
    { name: 'Rentrée scolaire', startDate: new Date('2025-09-01'), endDate: new Date('2025-09-01') },
    { name: 'Journée de la République', startDate: new Date('2025-10-15'), endDate: new Date('2025-10-15') },
    { name: 'Toussaint', startDate: new Date('2025-11-01'), endDate: new Date('2025-11-01') },
    { name: 'Vacances d\'hiver', startDate: new Date('2025-12-20'), endDate: new Date('2026-01-04') },
    { name: 'Journée de l\'École', startDate: new Date('2026-01-16'), endDate: new Date('2026-01-16') },
    { name: 'Vacances d\'hiver (suite)', startDate: new Date('2026-02-14'), endDate: new Date('2026-02-22') },
    { name: 'Journée des Martyrs', startDate: new Date('2026-04-09'), endDate: new Date('2026-04-09') },
    { name: 'Vacances de Pâques', startDate: new Date('2026-04-10'), endDate: new Date('2026-04-20') },
    { name: 'Fête du Travail', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-01') },
    { name: 'Vacances d\'été', startDate: new Date('2026-06-15'), endDate: new Date('2026-09-01') },
  ];
  const createdHolidays = [];
  for (const h of holidayData) {
    for (const establishment of createdEstablishments) {
      const existing = await prisma.holiday.findFirst({
        where: { name: h.name, establishmentId: establishment.id },
      });
      if (!existing) {
        const holiday = await prisma.holiday.create({
          data: {
            name: h.name,
            startDate: h.startDate,
            endDate: h.endDate,
            establishmentId: establishment.id,
          },
        });
        createdHolidays.push(holiday);
      }
    }
  }
  console.log(`   ✅ ${createdHolidays.length} holidays created`);

  // 39. Create TeacherLeave
  console.log('🏖️ Creating teacher leaves...');
  const leaveReasons = [
    'Congé maladie', 'Congé familial', 'Congé annuel', 'Congé de maternité', 'Raison personnelle',
  ];
  const leaveTypes = ['SICK', 'PERSONAL', 'VACATION', 'MATERNITY', 'OTHER'] as const;
  const leaveStatuses = ['APPROVED', 'APPROVED', 'PENDING', 'REJECTED'] as const;
  const createdTeacherLeaves = [];
  for (let i = 0; i < 5; i++) {
    const teacher = createdTeachers[i % createdTeachers.length];
    const leave = await prisma.teacherLeave.create({
      data: {
        teacherId: teacher.id,
        type: leaveTypes[i],
        startDate: randomDate(new Date('2025-10-01'), new Date('2026-03-01')),
        endDate: randomDate(new Date('2026-03-01'), new Date('2026-06-01')),
        reason: leaveReasons[i],
        status: leaveStatuses[i],
      },
    });
    createdTeacherLeaves.push(leave);
  }
  console.log(`   ✅ ${createdTeacherLeaves.length} teacher leaves created`);

  // 40. Create Login Logs
  console.log('🔐 Creating login logs...');
  const loginIps = ['127.0.0.1', '192.168.1.100', '192.168.1.101', '10.0.0.50', '10.0.0.51'];
  const allUsers = [superAdmin, ...tenantUsers, ...adminUsers, ...teacherUsers, ...studentUsers];
  const createdLoginLogs = [];
  for (let i = 0; i < 20; i++) {
    const user = allUsers[i % allUsers.length];
    const log = await prisma.loginLog.create({
      data: {
        userId: user.id,
        ipAddress: randomPick(loginIps),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: Math.random() > 0.15,
      },
    });
    createdLoginLogs.push(log);
  }
  console.log(`   ✅ ${createdLoginLogs.length} login logs created`);

  // 41. Create Grading Configs
  console.log('📊 Creating grading configs...');
  const createdGradingConfigs = [];
  for (const establishment of createdEstablishments) {
    for (const classLevel of createdClassLevels.slice(0, 3)) {
      const existing = await prisma.gradingConfig.findFirst({
        where: { establishmentId: establishment.id, classLevelId: classLevel.id },
      });
      if (!existing) {
        const config = await prisma.gradingConfig.create({
          data: {
            establishmentId: establishment.id,
            classLevelId: classLevel.id,
            name: `Config ${classLevel.name} - ${establishment.name}`,
            scaleType: 'NUMERIC',
            minScore: 0,
            maxScore: 20,
            passThreshold: 10,
            isDefault: true,
          },
        });
        createdGradingConfigs.push(config);
      }
    }
  }
  console.log(`   ✅ ${createdGradingConfigs.length} grading configs created`);

  // Summary
  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Summary:');
  console.log(`   - ${createdModules.length} modules`);
  console.log(`   - ${createdPermissions.length} permissions`);
  console.log(`   - ${createdPlans.length} plans`);
  console.log(`   - ${createdPlanFeatures.length} plan features`);
  console.log(`   - ${createdRoles.length} roles`);
  console.log(`   - ${createdClassLevels.length} class levels`);
  console.log(`   - ${createdMatieres.length} subjects`);
  console.log(`   - ${createdTenants.length} tenants`);
  console.log(`   - ${createdEstablishments.length} establishments`);
  console.log(`   - ${createdSubscriptions.length} tenant subscriptions`);
  console.log(`   - ${adminUsers.length} admin users`);
  console.log(`   - ${teacherUsers.length} teacher users`);
  console.log(`   - ${parentUsers.length} parent users`);
  console.log(`   - ${studentUsers.length} student users`);
  console.log(`   - ${employeeUsers.length} employee users`);
  console.log(`   - ${createdStudents.length} students`);
  console.log(`   - ${createdParents.length} parents`);
  console.log(`   - ${createdTeachers.length} teachers`);
  console.log(`   - ${createdEmployees.length} employees`);
  console.log(`   - ${createdStudentParents.length} student-parent relations`);
  console.log(`   - ${createdTeacherMatieres.length} teacher-subject relations`);
  console.log(`   - ${createdClassModuleAssignments.length} class-module assignments`);
  console.log(`   - ${academicYears.length} academic years`);
  console.log(`   - ${periods.length} academic periods`);
  console.log(`   - ${createdGradingConfigs.length} grading configs`);
  console.log(`   - ${createdRooms.length} rooms`);
  console.log(`   - ${createdClasses.length} classes`);
  console.log(`   - ${createdSessions.length} sessions`);
  console.log(`   - ${createdLessons.length} lessons`);
  console.log(`   - ${attendanceRecords.length} student attendance records`);
  console.log(`   - ${teacherAttendanceRecords.length} teacher attendance records`);
  console.log(`   - ${createdTeacherLeaves.length} teacher leaves`);
  console.log(`   - ${createdHolidays.length} holidays`);
  console.log(`   - ${createdExams.length} exams`);
  console.log(`   - ${createdNotes.length} grades`);
  console.log(`   - ${createdCaisses.length} caisses`);
  console.log(`   - ${createdPayments.length} student payments`);
  console.log(`   - ${createdTeacherPayments.length} teacher payments`);
  console.log(`   - ${createdTransactions.length} financial transactions`);
  console.log(`   - ${conversations.length} conversations`);
  console.log(`   - ${createdNotifications.length} notifications`);
  console.log(`   - ${createdAuditLogs.length} audit logs`);
  console.log(`   - ${createdLoginLogs.length} login logs`);
  console.log('\n🔑 Login credentials:');
  console.log('   - Root Admin: bsofts.contact@gmail.com / Ahmed123*');
  console.log('   - Tenant 1 Admin: tenant1@bsofts.com / Admin@123');
  console.log('   - Tenant 2 Admin: tenant2@bsofts.com / Admin@123');
  console.log('   - Admin: admin1@school.dz / Admin@123');
  console.log('   - Teacher: teacher1@school.dz / Admin@123');
  console.log('   - Student: student1@school.dz / Admin@123');
  console.log('   - Parent: parent1@school.dz / Admin@123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
