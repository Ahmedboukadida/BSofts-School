import {
  PrismaClient,
  Currency,
  Language,
  Theme,
  EstablishmentCategory,
  SubscriptionStatus,
  PeriodType,
  PaymentMethod,
  PaymentStatus,
  TransactionType,
  CaisseType,
  RoomType,
  ContractType,
  AttendanceStatus,
  ExamType,
  ExamStatus,
  MeetingType,
  MeetingMode,
  MeetingStatus,
  MeetingParticipantRole,
  ParticipantStatus,
  VoteValue,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

// -------------------------------------------------------------
// Load environment variables if not already set
// -------------------------------------------------------------
const envPath = path.join(__dirname, '..', '.env');
if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
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
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ============================================================
// HELPER UTILITIES
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
// METADATA DEFINITIONS
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
  { name: 'Free', description: 'Plan d\'initiation pour petites structures', price: 0, currency: Currency.TND, interval: 'MONTHLY' as const, sortOrder: 1 },
  { name: 'Basic', description: 'Idéal pour écoles primaires et collèges en croissance', price: 50, currency: Currency.TND, interval: 'MONTHLY' as const, sortOrder: 2 },
  { name: 'Premium', description: 'Solution complète pour institutions d\'envergure', price: 150, currency: Currency.TND, interval: 'MONTHLY' as const, sortOrder: 3 },
  { name: 'Enterprise', description: 'Infrastructure sur-mesure pour groupes scolaires multisites', price: 500, currency: Currency.TND, interval: 'YEARLY' as const, sortOrder: 4 },
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

const tenantDefinitions = [
  { name: 'Groupe Éducatif Hannibal', email: 'tenant1@bsofts.com', username: 'hannibal_admin', firstName: 'Hédi', lastName: 'Hannibal' },
  { name: 'Institution Al-Amel', email: 'tenant2@bsofts.com', username: 'alamel_admin', firstName: 'Leila', lastName: 'Ben Ammar' },
  { name: 'Complexe Scolaire Ibn Khaldoun', email: 'tenant3@bsofts.com', username: 'ibnkhaldoun_admin', firstName: 'Moncef', lastName: 'Khaldoun' },
  { name: 'Étoile Brillante Éducation', email: 'tenant4@bsofts.com', username: 'etoile_admin', firstName: 'Salma', lastName: 'Trabelsi' },
];

const establishmentDefinitions: Array<{
  tenantIndex: number;
  name: string;
  slug: string;
  category: EstablishmentCategory;
  city: string;
  address: string;
  phone: string;
  email: string;
}> = [
  // Tenant 1: Groupe Éducatif Hannibal
  {
    tenantIndex: 0,
    name: "Jardin d'Enfants Les Poussins",
    slug: 'creche-les-poussins',
    category: EstablishmentCategory.DAYCARE,
    city: 'Tunis',
    address: '14 Rue d\'Angleterre, Tunis',
    phone: '+216 71 234 560',
    email: 'contact@creche-lespoussins.tn',
  },
  {
    tenantIndex: 0,
    name: 'École Primaire Hannibal',
    slug: 'ecole-hannibal',
    category: EstablishmentCategory.SCHOOL,
    city: 'Carthage',
    address: '28 Avenue Habib Bourguiba, Carthage',
    phone: '+216 71 740 120',
    email: 'contact@ecole-hannibal.tn',
  },

  // Tenant 2: Institution Al-Amel
  {
    tenantIndex: 1,
    name: 'École Primaire Al-Amel',
    slug: 'ecole-al-amel',
    category: EstablishmentCategory.SCHOOL,
    city: 'Ariana',
    address: '45 Avenue de la République, Ariana',
    phone: '+216 71 850 330',
    email: 'primaire@alamel.tn',
  },
  {
    tenantIndex: 1,
    name: 'Collège Privé Al-Amel',
    slug: 'college-al-amel',
    category: EstablishmentCategory.MIDDLE_SCHOOL,
    city: 'La Marsa',
    address: '12 Rue Sidi Abdelaziz, La Marsa',
    phone: '+216 71 910 440',
    email: 'college@alamel.tn',
  },

  // Tenant 3: Complexe Scolaire Ibn Khaldoun
  {
    tenantIndex: 2,
    name: 'Collège Ibn Khaldoun',
    slug: 'college-ibn-khaldoun',
    category: EstablishmentCategory.MIDDLE_SCHOOL,
    city: 'Sousse',
    address: '88 Boulevard 14 Janvier, Sousse',
    phone: '+216 73 220 550',
    email: 'college@ibnkhaldoun.tn',
  },
  {
    tenantIndex: 2,
    name: "Lycée d'Excellence Ibn Khaldoun",
    slug: 'lycee-ibn-khaldoun',
    category: EstablishmentCategory.HIGH_SCHOOL,
    city: 'Sousse',
    address: '102 Avenue Léopold Senghor, Sousse',
    phone: '+216 73 340 660',
    email: 'lycee@ibnkhaldoun.tn',
  },

  // Tenant 4: Étoile Brillante Éducation
  {
    tenantIndex: 3,
    name: 'École Internationale Étoile Brillante',
    slug: 'ecole-etoile-brillante',
    category: EstablishmentCategory.SCHOOL,
    city: 'Sfax',
    address: '55 Route de Téniour Km 2, Sfax',
    phone: '+216 74 410 770',
    email: 'primaire@etoile-brillante.tn',
  },
  {
    tenantIndex: 3,
    name: 'Lycée Polyvalent Étoile Brillante',
    slug: 'lycee-etoile-brillante',
    category: EstablishmentCategory.HIGH_SCHOOL,
    city: 'Sfax',
    address: '77 Route Soukra Km 3, Sfax',
    phone: '+216 74 620 880',
    email: 'lycee@etoile-brillante.tn',
  },
];

const matieresCatalog = [
  { name: 'Mathématiques', code: 'MATH', coefficient: 3 },
  { name: 'Français', code: 'FRAN', coefficient: 3 },
  { name: 'Arabe', code: 'ARAB', coefficient: 3 },
  { name: 'Anglais', code: 'ANGL', coefficient: 2 },
  { name: 'Physique-Chimie', code: 'PHYCH', coefficient: 2 },
  { name: 'Sciences de la Vie et de la Terre', code: 'SVT', coefficient: 2 },
  { name: 'Histoire-Géographie', code: 'HIST', coefficient: 2 },
  { name: 'Éducation Civique', code: 'CIVIQ', coefficient: 1 },
  { name: 'EPS & Sport', code: 'EPS', coefficient: 1 },
  { name: 'Informatique & Algorithmique', code: 'INFO', coefficient: 2 },
  { name: 'Arts Plastiques', code: 'ART', coefficient: 1 },
  { name: 'Musique', code: 'MUSIQ', coefficient: 1 },
];

const tunisianFirstNames = [
  'Ahmed', 'Mohamed', 'Youssef', 'Amine', 'Karim', 'Sami', 'Omar', 'Mehdi', 'Bilel', 'Hamza',
  'Yassine', 'Skander', 'Farouk', 'Zied', 'Anis', 'Tarek', 'Slim', 'Kais', 'Wassim', 'Ilyes',
  'Mariem', 'Fatma', 'Sarra', 'Nour', 'Yasmine', 'Rania', 'Amira', 'Ines', 'Dorra', 'Chaima',
  'Sirine', 'Hela', 'Nesrine', 'Maha', 'Salma', 'Khadija', 'Leila', 'Aya', 'Eya', 'Asma',
];

const tunisianLastNames = [
  'Ben Salem', 'Trabelsi', 'Gharbi', 'Bouazizi', 'Masmoudi', 'Dridi', 'Ayari', 'Mejri', 'Chaabane', 'Hammami',
  'Jlassi', 'Khemiri', 'Mansouri', 'Kefi', 'Riahi', 'Zitouni', 'Boukadida', 'Maaloul', 'Triki', 'Louati',
  'Sassi', 'Abidi', 'Bouslama', 'Rekik', 'Fakhfakh', 'Ellouze', 'Belhadj', 'Cherif', 'Baccouche', 'Koubaa',
];

const lessonTitles = [
  'Introduction aux fractions rationnelles',
  'Les droits fondamentaux et libertés publiques',
  'La photosynthèse et flux d\'énergie',
  'Grammaire: les propositions subordonnées relatives',
  'Résolution des équations du second degré',
  'Histoire: La Décolonisation et l\'émergence du tiers-monde',
  'Biologie cellulaire: structure et fonctions des organites',
  'Phonétique et prosodie en langue française',
  'Cinétique chimique et catalyses',
  'Astronomie: le système solaire et gravitation',
  'Géométrie analytique dans l\'espace tridimensionnel',
  'Poésie moderne et métaphores contemporaines',
  'Circuits électriques en courant alternatif',
  'Nutrition minérale et hydrique chez les végétaux',
  'Arithmétique: nombres premiers et cryptographie RSA',
  'Syntaxe avancée de la langue arabe',
  'Histoire de l\'Empire ottoman et réformes au Maghreb',
  'Thermochimie et bilans énergétiques',
  'Algorithmes de tri et complexité temporelle',
  'Programmation orientée objet en TypeScript',
];

// ============================================================
// MAIN SEED EXECUTION
// ============================================================

async function main() {
  console.log('🌱 Starting full multi-tenant seed for BSofts School...\n');

  // 0. Safe cleanup of existing data in transaction
  console.log('🧹 Cleaning existing tables in cascade order...');
  const tableNames = [
    'DynamicEnum',
    'AuditLog',
    'Notification',
    'Message',
    'ConversationParticipant',
    'Conversation',
    'FinancialTransaction',
    'Caisse',
    'TeacherPayment',
    'TeacherContract',
    'StudentPayment',
    'ExamSubmission',
    'ExamQuestion',
    'Exam',
    'Note',
    'MeetingVote',
    'MeetingPoint',
    'MeetingDocument',
    'MeetingParticipant',
    'Meeting',
    'Lesson',
    'TeacherAttendance',
    'TeacherLeave',
    'StudentAttendance',
    'Holiday',
    'Session',
    'Room',
    'StudentClassAssignment',
    'StudentParent',
    'TeacherMatiere',
    'ClassModuleAssignment',
    'Class',
    'GradingConfig',
    'AcademicPeriod',
    'AcademicYear',
    'Teacher',
    'Employee',
    'Parent',
    'Student',
    'Establishment',
    'TenantSubscription',
    'SaaSPlanFeature',
    'SaaSPlanModule',
    'SaaSPlan',
    'SaaSPermission',
    'SaaSModule',
    'RolePermission',
    'UserRoleAssignment',
    'Role',
    'LoginLog',
    'Matiere',
    'AcademicModule',
    'TenantSettings',
    'ClassLevel',
    'User',
    'Tenant',
  ];

  for (const table of tableNames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
    } catch {
      // Table may not exist yet or already empty
    }
  }
  console.log('   ✅ Tables truncated cleanly.\n');

  // 1. Create SaaS Modules
  console.log('📦 1. Creating SaaS Modules...');
  const createdModules = await Promise.all(
    modules.map((m) =>
      prisma.saaSModule.upsert({
        where: { code: m.code },
        update: { name: m.name, description: m.description, sortOrder: m.sortOrder },
        create: m,
      }),
    ),
  );
  console.log(`   ✅ ${createdModules.length} SaaS modules ready.`);

  // 2. Create Permissions
  console.log('🔐 2. Creating Permissions (161 granular permissions)...');
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

  // 3. Create SaaS Plans
  console.log('💳 3. Creating SaaS Plans (Free, Basic, Premium, Enterprise)...');
  const createdPlans = await Promise.all(
    plans.map((p) =>
      prisma.saaSPlan.upsert({
        where: { name: p.name },
        update: { price: p.price, description: p.description, currency: p.currency, interval: p.interval, sortOrder: p.sortOrder },
        create: p,
      }),
    ),
  );

  // Assign modules to plans
  for (const plan of createdPlans) {
    for (const mod of createdModules) {
      await prisma.saaSPlanModule.upsert({
        where: { planId_moduleId: { planId: plan.id, moduleId: mod.id } },
        update: {},
        create: { planId: plan.id, moduleId: mod.id },
      });
    }
  }

  // Seed SaaSPlanFeatures matching landing page tiers
  const planFeaturesCatalog = [
    // Free Plan (50 students, 5 teachers)
    { planId: createdPlans[0].id, code: 'max_students', value: '50', description: 'Jusqu\'à 50 élèves' },
    { planId: createdPlans[0].id, code: 'max_teachers', value: '5', description: 'Jusqu\'à 5 professeurs' },
    { planId: createdPlans[0].id, code: 'reports', value: 'basic', description: 'Rapports élémentaires' },
    { planId: createdPlans[0].id, code: 'support', value: 'community', description: 'Support communautaire' },

    // Basic Plan (200 students, 20 teachers)
    { planId: createdPlans[1].id, code: 'max_students', value: '200', description: 'Jusqu\'à 200 élèves' },
    { planId: createdPlans[1].id, code: 'max_teachers', value: '20', description: 'Jusqu\'à 20 professeurs' },
    { planId: createdPlans[1].id, code: 'reports', value: 'standard', description: 'Rapports & statistiques standards' },
    { planId: createdPlans[1].id, code: 'sms', value: 'true', description: 'Notifications SMS & WhatsApp' },
    { planId: createdPlans[1].id, code: 'support', value: 'email', description: 'Support email 48h' },

    // Premium Plan (Unlimited students & teachers)
    { planId: createdPlans[2].id, code: 'max_students', value: 'unlimited', description: 'Élèves illimités' },
    { planId: createdPlans[2].id, code: 'max_teachers', value: 'unlimited', description: 'Professeurs illimités' },
    { planId: createdPlans[2].id, code: 'reports', value: 'advanced', description: 'Analytique & prévisions avancées' },
    { planId: createdPlans[2].id, code: 'sms', value: 'true', description: 'Notifications SMS/Email illimitées' },
    { planId: createdPlans[2].id, code: 'support', value: 'priority_24_7', description: 'Support prioritaire 24/7' },
    { planId: createdPlans[2].id, code: 'api', value: 'true', description: 'Accès API & Webhooks' },
    { planId: createdPlans[2].id, code: 'livekit_meetings', value: 'true', description: 'Classes virtuelles LiveKit HD' },

    // Enterprise Plan (Multi-site, white label, SLA)
    { planId: createdPlans[3].id, code: 'max_students', value: 'unlimited', description: 'Élèves illimités multi-campus' },
    { planId: createdPlans[3].id, code: 'max_teachers', value: 'unlimited', description: 'Équipes pédagogiques illimitées' },
    { planId: createdPlans[3].id, code: 'custom_domain', value: 'true', description: 'Nom de domaine & SSL dédié' },
    { planId: createdPlans[3].id, code: 'white_label', value: 'true', description: 'Marque blanche complète' },
    { planId: createdPlans[3].id, code: 'dedicated_account_manager', value: 'true', description: 'Gestionnaire de compte dédié' },
    { planId: createdPlans[3].id, code: 'sla_guarantee', value: '99.9%', description: 'Garantie SLA 99.9%' },
    { planId: createdPlans[3].id, code: 'livekit_meetings', value: 'true', description: 'Classes virtuelles LiveKit HD' },
  ];

  for (const pf of planFeaturesCatalog) {
    await prisma.saaSPlanFeature.upsert({
      where: { planId_code: { planId: pf.planId, code: pf.code } },
      update: { value: pf.value, description: pf.description },
      create: pf,
    });
  }
  console.log(`   ✅ ${createdPlans.length} plans & features assigned.`);

  // 4. Create System Roles & Permissions
  console.log('👑 4. Creating System Roles...');
  const roles = [
    { name: 'Super Admin', code: 'SUPER_ADMIN', description: 'Propriétaire d\'établissement / Multi-campus', isSystem: true },
    { name: 'Admin', code: 'ADMIN', description: 'Directeur ou administrateur d\'établissement', isSystem: true },
    { name: 'Employee', code: 'EMPLOYEE', description: 'Personnel administratif et comptable', isSystem: true },
    { name: 'Teacher', code: 'TEACHER', description: 'Corps enseignant et formateurs', isSystem: true },
    { name: 'Student', code: 'STUDENT', description: 'Élèves et apprenants', isSystem: true },
    { name: 'Parent', code: 'PARENT', description: 'Parents et tuteurs légaux', isSystem: true },
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

  const rolePermissionsMap: Record<string, string[]> = {
    SUPER_ADMIN: createdPermissions.map((p) => p.code),
    ADMIN: createdPermissions.filter((p) => !p.code.startsWith('billing')).map((p) => p.code),
    EMPLOYEE: ['students:list', 'students:read', 'teachers:list', 'teachers:read', 'payments:list', 'payments:read', 'finance:list', 'finance:read', 'finance:create'],
    TEACHER: ['students:list', 'students:read', 'lessons:list', 'lessons:read', 'lessons:create', 'grades:list', 'grades:read', 'grades:create', 'attendance:list', 'attendance:create', 'exams:list', 'exams:read', 'exams:create'],
    STUDENT: ['lessons:list', 'lessons:read', 'grades:list', 'grades:read', 'exams:list', 'exams:read', 'attendance:list', 'attendance:read'],
    PARENT: ['students:list', 'students:read', 'grades:list', 'grades:read', 'payments:list', 'payments:read', 'attendance:list', 'attendance:read'],
  };

  const rolePermissionsToInsert: Array<{ roleId: string; permissionId: string }> = [];
  for (const role of createdRoles) {
    const permCodes = rolePermissionsMap[role.code] || [];
    const perms = createdPermissions.filter((p) => permCodes.includes(p.code));
    for (const perm of perms) {
      rolePermissionsToInsert.push({ roleId: role.id, permissionId: perm.id });
    }
  }

  await prisma.rolePermission.createMany({
    data: rolePermissionsToInsert,
    skipDuplicates: true,
  });
  console.log(`   ✅ ${createdRoles.length} roles initialized with ${rolePermissionsToInsert.length} permissions.`);

  // 5. Create Class Levels
  console.log('📚 5. Creating Class Levels...');
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

  // 6. Create Super Admin Root User
  const rootEmail = process.env.SEED_ROOT_EMAIL || 'bsofts.contact@gmail.com';
  const rootRawPassword = process.env.SEED_ROOT_PASSWORD || 'Ahmed123*';
  const commonRawPassword = process.env.SEED_COMMON_PASSWORD || 'Admin@123';
  console.log(`👤 6. Creating Super Admin User (${rootEmail})...`);
  const rootPassword = await bcrypt.hash(rootRawPassword, 10);
  const commonPassword = await bcrypt.hash(commonRawPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: rootEmail },
    update: { password: rootPassword, isRoot: true, isActive: true },
    create: {
      email: rootEmail,
      username: 'bsofts_root',
      firstName: 'BSofts',
      lastName: 'Root',
      password: rootPassword,
      isRoot: true,
      isActive: true,
    },
  });

  const superAdminRole = createdRoles.find((r) => r.code === 'SUPER_ADMIN')!;
  const adminRole = createdRoles.find((r) => r.code === 'ADMIN')!;
  const teacherRole = createdRoles.find((r) => r.code === 'TEACHER')!;
  const studentRole = createdRoles.find((r) => r.code === 'STUDENT')!;
  const parentRole = createdRoles.find((r) => r.code === 'PARENT')!;
  const employeeRole = createdRoles.find((r) => r.code === 'EMPLOYEE')!;

  // 7. Create 4 Tenants with Settings and Subscriptions
  console.log('🏢 7. Creating 4 Tenants with Settings & Subscriptions...');
  const createdTenants = [];
  for (let i = 0; i < tenantDefinitions.length; i++) {
    const tDef = tenantDefinitions[i];
    const tenantUser = await prisma.user.upsert({
      where: { email: tDef.email },
      update: { password: commonPassword, isActive: true },
      create: {
        email: tDef.email,
        username: tDef.username,
        firstName: tDef.firstName,
        lastName: tDef.lastName,
        password: commonPassword,
        isRoot: false,
        isActive: true,
      },
    });

    const tenant = await prisma.tenant.create({
      data: { userId: tenantUser.id },
    });

    await prisma.tenantSettings.create({
      data: {
        tenantId: tenant.id,
        currency: Currency.TND,
        language: Language.FR,
        theme: Theme.LIGHT,
        timezone: 'Africa/Tunis',
        dateFormat: 'DD/MM/YYYY',
      },
    });

    // Subscriptions: Tenant 0 -> Free, Tenant 1 -> Basic, Tenant 2 -> Premium, Tenant 3 -> Enterprise
    await prisma.tenantSubscription.create({
      data: {
        tenantId: tenant.id,
        planId: createdPlans[i].id,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2026-09-01'),
      },
    });

    createdTenants.push(tenant);
  }
  console.log(`   ✅ 4 Tenants created with active subscriptions.`);

  // 8. Create 8 Establishments across the 4 Tenants
  console.log('🏫 8. Creating 8 Establishments (2 per tenant)...');
  const createdEstablishments = [];
  for (const estDef of establishmentDefinitions) {
    const tenant = createdTenants[estDef.tenantIndex];
    const est = await prisma.establishment.create({
      data: {
        name: estDef.name,
        slug: estDef.slug,
        category: estDef.category,
        tenantId: tenant.id,
        country: 'TN',
        timezone: 'Africa/Tunis',
        phone: estDef.phone,
        email: estDef.email,
        address: estDef.address,
      },
    });
    createdEstablishments.push(est);

    // Assign Super Admin as SUPER_ADMIN to this establishment
    await prisma.userRoleAssignment.create({
      data: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
        establishmentId: est.id,
      },
    });
  }
  console.log(`   ✅ 8 Establishments created. Super Admin assigned to all.`);

  // 9. Loop over ALL 8 establishments to populate complete isolated data
  console.log('🚀 9. Populating Academic Years, Classes, Users, Attendance, and Finance per establishment...');

  const defaultDynamicEnums = [
    { category: 'STUDENT_STATUS', code: 'INSCRIT', labelFr: 'Inscrit', labelEn: 'Enrolled', labelAr: 'مسجل', color: '#242F40', sortOrder: 1 },
    { category: 'STUDENT_STATUS', code: 'RADIE', labelFr: 'Radié', labelEn: 'Expelled', labelAr: 'مفصول', color: '#363636', sortOrder: 2 },
    { category: 'STUDENT_STATUS', code: 'SUSPENDU', labelFr: 'Suspendu', labelEn: 'Suspended', labelAr: 'موقوف', color: '#CCA43B', sortOrder: 3 },
    { category: 'STUDENT_STATUS', code: 'DIPLOME', labelFr: 'Diplômé', labelEn: 'Graduated', labelAr: 'متخرج', color: '#242F40', sortOrder: 4 },
    { category: 'PAYMENT_METHOD', code: 'ESPECES', labelFr: 'Espèces', labelEn: 'Cash', labelAr: 'نقدا', color: '#242F40', sortOrder: 1 },
    { category: 'PAYMENT_METHOD', code: 'CHEQUE', labelFr: 'Chèque', labelEn: 'Check', labelAr: 'شيك', color: '#363636', sortOrder: 2 },
    { category: 'PAYMENT_METHOD', code: 'VIREMENT', labelFr: 'Virement', labelEn: 'Bank Transfer', labelAr: 'تحويل بنكي', color: '#CCA43B', sortOrder: 3 },
    { category: 'CAISSE_TYPE', code: 'PRINCIPALE', labelFr: 'Caisse Principale', labelEn: 'Main Cash Desk', labelAr: 'الصندوق الرئيسي', color: '#242F40', sortOrder: 1 },
    { category: 'CAISSE_TYPE', code: 'SCOLARITE', labelFr: 'Caisse Frais Scolarité', labelEn: 'Tuition Cash Desk', labelAr: 'صندوق مصاريف الدراسة', color: '#CCA43B', sortOrder: 2 },
    { category: 'CAISSE_TYPE', code: 'CANTINE', labelFr: 'Caisse Cantine', labelEn: 'Canteen Cash Desk', labelAr: 'صندوق المطعم', color: '#363636', sortOrder: 3 },
  ];

  let totalClassesCreated = 0;
  let totalStudentsCreated = 0;
  let totalTeachersCreated = 0;
  let totalPaymentsCreated = 0;
  let totalExamsCreated = 0;

  for (let estIdx = 0; estIdx < createdEstablishments.length; estIdx++) {
    const est = createdEstablishments[estIdx];
    const prefix = `est${estIdx + 1}`;

    // A. Dynamic Enums
    for (const de of defaultDynamicEnums) {
      await prisma.dynamicEnum.create({
        data: { ...de, establishmentId: est.id },
      });
    }

    // B. Academic Years (2024-2025 Current, 2023-2024 Past, 2025-2026 Future)
    const currentYear = await prisma.academicYear.create({
      data: {
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: true,
        establishmentId: est.id,
      },
    });
    await prisma.academicYear.create({
      data: {
        name: '2023-2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
        isCurrent: false,
        establishmentId: est.id,
      },
    });
    await prisma.academicYear.create({
      data: {
        name: '2025-2026',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-06-30'),
        isCurrent: false,
        establishmentId: est.id,
      },
    });

    // C. Academic Periods for current year
    const trimester1 = await prisma.academicPeriod.create({
      data: {
        name: '1er Trimestre',
        type: PeriodType.TRIMESTER,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-11-30'),
        isCurrent: false,
        sortOrder: 1,
        academicYearId: currentYear.id,
      },
    });
    const trimester2 = await prisma.academicPeriod.create({
      data: {
        name: '2ème Trimestre',
        type: PeriodType.TRIMESTER,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-02-28'),
        isCurrent: true,
        sortOrder: 2,
        academicYearId: currentYear.id,
      },
    });
    await prisma.academicPeriod.create({
      data: {
        name: '3ème Trimestre',
        type: PeriodType.TRIMESTER,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: false,
        sortOrder: 3,
        academicYearId: currentYear.id,
      },
    });

    // D. Academic Modules & Matieres for this establishment
    const acadModules = await Promise.all([
      prisma.academicModule.create({ data: { name: 'Pôle Scientifique', establishmentId: est.id } }),
      prisma.academicModule.create({ data: { name: 'Pôle Littéraire & Langues', establishmentId: est.id } }),
      prisma.academicModule.create({ data: { name: 'Pôle Développement & Arts', establishmentId: est.id } }),
    ]);

    const estMatieres = [];
    for (let mIdx = 0; mIdx < matieresCatalog.length; mIdx++) {
      const mDef = matieresCatalog[mIdx];
      const targetMod = acadModules[mIdx % acadModules.length];
      const mat = await prisma.matiere.create({
        data: {
          name: mDef.name,
          code: `${mDef.code}_${prefix.toUpperCase()}`,
          coefficient: mDef.coefficient,
          moduleId: targetMod.id,
        },
      });
      estMatieres.push(mat);
    }

    // E. Rooms
    const rooms = await Promise.all([
      prisma.room.create({ data: { name: `Salle 101 (${est.slug})`, code: `R101_${prefix}`, capacity: 30, type: RoomType.CLASSROOM, establishmentId: est.id } }),
      prisma.room.create({ data: { name: `Salle 102 (${est.slug})`, code: `R102_${prefix}`, capacity: 30, type: RoomType.CLASSROOM, establishmentId: est.id } }),
      prisma.room.create({ data: { name: `Laboratoire Informatique`, code: `LAB_INF_${prefix}`, capacity: 25, type: RoomType.LABORATORY, establishmentId: est.id } }),
      prisma.room.create({ data: { name: `Bibliothèque & Documentation`, code: `BIB_${prefix}`, capacity: 40, type: RoomType.LIBRARY, establishmentId: est.id } }),
    ]);

    // F. Classes appropriate for Category
    let levelSubset: typeof createdClassLevels = [];
    if (est.category === EstablishmentCategory.DAYCARE) {
      levelSubset = createdClassLevels.slice(0, 3); // Petite, Moyenne, Grande Section
    } else if (est.category === EstablishmentCategory.SCHOOL) {
      levelSubset = createdClassLevels.slice(3, 8); // CP, CE1, CE2, CM1, CM2
    } else if (est.category === EstablishmentCategory.MIDDLE_SCHOOL) {
      levelSubset = createdClassLevels.slice(8, 12); // 6ème, 5ème, 4ème, 3ème
    } else {
      levelSubset = createdClassLevels.slice(12, 15); // Seconde, Première, Terminale
    }

    const estClasses = [];
    for (const lvl of levelSubset) {
      const clsA = await prisma.class.create({
        data: {
          name: `${lvl.name} A`,
          code: `${lvl.name.replace(/\s/g, '').toUpperCase()}_A_${prefix}`,
          classLevelId: lvl.id,
          academicYearId: currentYear.id,
          establishmentId: est.id,
          periodType: PeriodType.TRIMESTER,
          maxStudents: 32,
        },
      });
      estClasses.push(clsA);
      totalClassesCreated++;
    }

    // Link modules to classes
    for (const cls of estClasses) {
      for (const mod of acadModules) {
        await prisma.classModuleAssignment.create({
          data: { classId: cls.id, moduleId: mod.id },
        });
      }
    }

    // G. Staff: 1 Admin, 3 Teachers, 1 Employee
    const adminUser = await prisma.user.create({
      data: {
        email: `admin_${est.slug}@school.tn`,
        username: `admin_${est.slug}`,
        firstName: randomPick(tunisianFirstNames),
        lastName: randomPick(tunisianLastNames),
        password: commonPassword,
        isActive: true,
      },
    });
    await prisma.userRoleAssignment.create({
      data: { userId: adminUser.id, roleId: adminRole.id, establishmentId: est.id },
    });

    const estTeachers = [];
    for (let tIdx = 0; tIdx < 3; tIdx++) {
      const tFirstName = randomPick(tunisianFirstNames);
      const tLastName = randomPick(tunisianLastNames);
      const tUser = await prisma.user.create({
        data: {
          email: `prof${tIdx + 1}_${est.slug}@school.tn`,
          username: `prof${tIdx + 1}_${est.slug}`,
          firstName: tFirstName,
          lastName: tLastName,
          password: commonPassword,
          isActive: true,
        },
      });
      await prisma.userRoleAssignment.create({
        data: { userId: tUser.id, roleId: teacherRole.id, establishmentId: est.id },
      });

      const teacher = await prisma.teacher.create({
        data: {
          firstName: tFirstName,
          lastName: tLastName,
          email: tUser.email,
          phone: `+216 9${Math.floor(1000000 + Math.random() * 9000000)}`,
          hireDate: new Date('2023-09-01'),
          specialization: estMatieres[tIdx % estMatieres.length].name,
          userId: tUser.id,
          establishmentId: est.id,
        },
      });

      // Contract
      const contract = await prisma.teacherContract.create({
        data: {
          teacherId: teacher.id,
          contractType: ContractType.FULL_TIME,
          startDate: new Date('2023-09-01'),
          salary: 1200 + tIdx * 250,
          currency: Currency.TND,
        },
      });

      // Teacher Matieres
      await prisma.teacherMatiere.create({
        data: { teacherId: teacher.id, matiereId: estMatieres[tIdx % estMatieres.length].id },
      });

      // Teacher payment
      await prisma.teacherPayment.create({
        data: {
          teacherId: teacher.id,
          contractId: contract.id,
          period: 'Janvier 2025',
          amount: contract.salary,
          currency: Currency.TND,
          calculatedAmount: contract.salary,
          status: PaymentStatus.PAID,
          paidAt: new Date('2025-01-30'),
        },
      });

      estTeachers.push(teacher);
      totalTeachersCreated++;
    }

    // 1 Employee (Comptable)
    const empUser = await prisma.user.create({
      data: {
        email: `compta_${est.slug}@school.tn`,
        username: `compta_${est.slug}`,
        firstName: randomPick(tunisianFirstNames),
        lastName: randomPick(tunisianLastNames),
        password: commonPassword,
        isActive: true,
      },
    });
    await prisma.userRoleAssignment.create({
      data: { userId: empUser.id, roleId: employeeRole.id, establishmentId: est.id },
    });
    await prisma.employee.create({
      data: {
        firstName: empUser.firstName,
        lastName: empUser.lastName,
        email: empUser.email,
        phone: `+216 7${Math.floor(1000000 + Math.random() * 9000000)}`,
        position: 'Responsable Financier & Comptable',
        hireDate: new Date('2022-09-01'),
        userId: empUser.id,
        establishmentId: est.id,
      },
    });

    // H. Parents (3 parents per establishment)
    const estParents = [];
    for (let pIdx = 0; pIdx < 3; pIdx++) {
      const pUser = await prisma.user.create({
        data: {
          email: `parent${pIdx + 1}_${est.slug}@parent.tn`,
          username: `parent${pIdx + 1}_${est.slug}`,
          firstName: randomPick(tunisianFirstNames),
          lastName: randomPick(tunisianLastNames),
          password: commonPassword,
          isActive: true,
        },
      });
      await prisma.userRoleAssignment.create({
        data: { userId: pUser.id, roleId: parentRole.id, establishmentId: est.id },
      });
      const parent = await prisma.parent.create({
        data: {
          firstName: pUser.firstName,
          lastName: pUser.lastName,
          email: pUser.email,
          phone: `+216 2${Math.floor(1000000 + Math.random() * 9000000)}`,
          occupation: randomPick(['Cadre de banque', 'Médecin spécialiste', 'Enseignant universitaire', 'Architecte', 'Chef d\'entreprise']),
          userId: pUser.id,
          establishmentId: est.id,
        },
      });
      estParents.push(parent);
    }

    // I. Students (6 students per establishment)
    const estStudents = [];
    for (let sIdx = 0; sIdx < 6; sIdx++) {
      const sFirstName = randomPick(tunisianFirstNames);
      const sLastName = randomPick(tunisianLastNames);
      const sUser = await prisma.user.create({
        data: {
          email: `eleve${sIdx + 1}_${est.slug}@school.tn`,
          username: `eleve${sIdx + 1}_${est.slug}`,
          firstName: sFirstName,
          lastName: sLastName,
          password: commonPassword,
          isActive: true,
        },
      });
      await prisma.userRoleAssignment.create({
        data: { userId: sUser.id, roleId: studentRole.id, establishmentId: est.id },
      });

      const student = await prisma.student.create({
        data: {
          firstName: sFirstName,
          lastName: sLastName,
          phone: `+216 5${Math.floor(1000000 + Math.random() * 9000000)}`,
          registrationNumber: generateMatricule(`ELV-${estIdx + 1}-`, sIdx + 1),
          dateOfBirth: new Date(2010 + (sIdx % 8), (sIdx * 2) % 12, 15),
          gender: sIdx % 2 === 0 ? 'MALE' : 'FEMALE',
          address: `${10 + sIdx} Avenue de Carthage, ${estDef.city}`,
          userId: sUser.id,
          establishmentId: est.id,
        },
      });

      // Assign student to class
      const targetClass = estClasses[sIdx % estClasses.length];
      await prisma.studentClassAssignment.create({
        data: {
          studentId: student.id,
          classId: targetClass.id,
          academicYearId: currentYear.id,
        },
      });

      // Link to parent
      const parent = estParents[sIdx % estParents.length];
      await prisma.studentParent.create({
        data: {
          studentId: student.id,
          parentId: parent.id,
          relation: sIdx % 2 === 0 ? 'father' : 'mother',
        },
      });

      // Student Payments
      await prisma.studentPayment.create({
        data: {
          studentId: student.id,
          parentId: parent.id,
          amount: 250 + (sIdx % 3) * 100,
          currency: Currency.TND,
          method: PaymentMethod.CASH,
          status: PaymentStatus.PAID,
          paidAt: new Date('2024-10-05'),
          reference: `REC-${prefix.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          notes: 'Frais de scolarité Trimestre 1',
        },
      });
      totalPaymentsCreated++;

      estStudents.push(student);
      totalStudentsCreated++;
    }

    // J. Caisses & Financial Transactions
    const caissePrincipale = await prisma.caisse.create({
      data: {
        name: 'Caisse Principale',
        type: CaisseType.MAIN,
        balance: 15400.0,
        currency: Currency.TND,
        establishmentId: est.id,
      },
    });
    const caisseScolarite = await prisma.caisse.create({
      data: {
        name: 'Caisse Frais Scolarité',
        type: CaisseType.TUITION,
        balance: 38200.0,
        currency: Currency.TND,
        establishmentId: est.id,
      },
    });

    await prisma.financialTransaction.create({
      data: {
        caisseId: caisseScolarite.id,
        type: TransactionType.INCOME,
        amount: 4500.0,
        balance: 38200.0,
        category: 'Frais de scolarité',
        description: 'Encaissement groupé rentrée scolaire',
        performedBy: empUser.id,
      },
    });
    await prisma.financialTransaction.create({
      data: {
        caisseId: caissePrincipale.id,
        type: TransactionType.EXPENSE,
        amount: 850.0,
        balance: 14550.0,
        category: 'Fournitures pédagogiques',
        description: 'Achat de consommables et fournitures didactiques',
        performedBy: empUser.id,
      },
    });

    // K. Sessions & Lessons for each class
    for (const cls of estClasses) {
      for (let sSlot = 0; sSlot < 2; sSlot++) {
        const sessionDate = new Date('2024-11-15');
        sessionDate.setDate(sessionDate.getDate() + sSlot * 3);

        const session = await prisma.session.create({
          data: {
            classId: cls.id,
            periodId: trimester1.id,
            academicYearId: currentYear.id,
            roomId: rooms[sSlot % rooms.length].id,
            teacherId: estTeachers[sSlot % estTeachers.length].id,
            date: sessionDate,
            startTime: new Date(2024, 10, 15, 8 + sSlot * 2, 0),
            endTime: new Date(2024, 10, 15, 10 + sSlot * 2, 0),
          },
        });

        // Lesson
        await prisma.lesson.create({
          data: {
            sessionId: session.id,
            matiereId: estMatieres[sSlot % estMatieres.length].id,
            title: randomPick(lessonTitles),
            content: 'Développement du cours théorique suivi d\'exercices d\'application dirigés.',
            objectives: 'Maîtriser les notions clés du programme et réussir les applications pratiques.',
            createdBy: estTeachers[sSlot % estTeachers.length].userId,
          },
        });

        // Attendance records for students in class
        const classStudents = await prisma.studentClassAssignment.findMany({
          where: { classId: cls.id },
        });
        for (const cs of classStudents) {
          await prisma.studentAttendance.create({
            data: {
              studentId: cs.studentId,
              sessionId: session.id,
              status: AttendanceStatus.PRESENT,
              markedBy: `Prof. ${estTeachers[sSlot % estTeachers.length].lastName}`,
            },
          });
        }
      }

      // L. Exam and Grades
      const exam = await prisma.exam.create({
        data: {
          title: `Contrôle Continu Trimestre 1 - ${cls.name}`,
          description: 'Épreuve d\'évaluation sommative des acquis du 1er trimestre',
          type: ExamType.MIDTERM,
          maxScore: 20,
          duration: 90,
          status: ExamStatus.COMPLETED,
          classId: cls.id,
          matiereId: estMatieres[0].id,
          periodId: trimester1.id,
          academicYearId: currentYear.id,
          establishmentId: est.id,
          startTime: new Date('2024-11-20T09:00:00Z'),
        },
      });
      totalExamsCreated++;

      const enrolled = await prisma.studentClassAssignment.findMany({ where: { classId: cls.id } });
      for (const enr of enrolled) {
        await prisma.note.create({
          data: {
            studentId: enr.studentId,
            examId: exam.id,
            matiereId: estMatieres[0].id,
            periodId: trimester1.id,
            academicYearId: currentYear.id,
            value: Math.floor(10 + Math.random() * 9), // 10 to 18
            maxValue: 20,
            coefficient: estMatieres[0].coefficient,
            comment: 'Bon travail et investissement sérieux.',
          },
        });
      }
    }

    // M. School Holidays
    const holidaysData = [
      { name: 'Fête de l\'Évacuation', startDate: new Date('2024-10-15'), endDate: new Date('2024-10-15') },
      { name: 'Vacances de la Mi-Trimestre 1', startDate: new Date('2024-10-28'), endDate: new Date('2024-11-03') },
      { name: 'Vacances d\'Hiver & Fin d\'Année', startDate: new Date('2024-12-21'), endDate: new Date('2025-01-05') },
      { name: 'Fête de la Révolution & Jeunesse', startDate: new Date('2025-01-14'), endDate: new Date('2025-01-14') },
      { name: 'Vacances de Printemps', startDate: new Date('2025-03-15'), endDate: new Date('2025-03-30') },
      { name: 'Fête de l\'Indépendance', startDate: new Date('2025-03-20'), endDate: new Date('2025-03-20') },
      { name: 'Fête des Martyrs', startDate: new Date('2025-04-09'), endDate: new Date('2025-04-09') },
      { name: 'Fête du Travail', startDate: new Date('2025-05-01'), endDate: new Date('2025-05-01') },
    ];
    for (const h of holidaysData) {
      await prisma.holiday.create({
        data: {
          name: h.name,
          startDate: h.startDate,
          endDate: h.endDate,
          establishmentId: est.id,
        },
      });
    }
  }

  // 10. Direct Messages and Notifications
  console.log('💬 10. Creating Sample Conversations and Notifications...');
  const sampleTeacher = await prisma.user.findFirst({ where: { username: { startsWith: 'prof1_' } } });
  const sampleStudent = await prisma.user.findFirst({ where: { username: { startsWith: 'eleve1_' } } });
  if (sampleTeacher && sampleStudent) {
    const conv = await prisma.conversation.create({
      data: { title: 'Assistance Pédagogique', type: 'DIRECT' },
    });
    await prisma.conversationParticipant.createMany({
      data: [
        { conversationId: conv.id, userId: sampleTeacher.id },
        { conversationId: conv.id, userId: sampleStudent.id },
      ],
    });
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: sampleTeacher.id,
        content: 'Bonjour, n\'oublie pas de réviser les exercices de géométrie pour la séance de demain.',
        type: 'TEXT',
        isRead: true,
      },
    });
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: sampleStudent.id,
        content: 'Bien reçu Monsieur, j\'ai terminé les applications numéro 4 et 5.',
        type: 'TEXT',
        isRead: false,
      },
    });
  }

  // 17. Seed Meetings Suite (LiveKit WebRTC Rooms, Agenda Points with Votes, Participants)
  console.log('📹 17. Creating Meetings Suite for All 8 Establishments...');
  let totalMeetingsCreated = 0;
  for (const est of createdEstablishments) {
    const estTeachers = await prisma.teacher.findMany({
      where: { establishmentId: est.id },
      include: { user: true },
      take: 4,
    });
    const estParents = await prisma.parent.findMany({
      where: { establishmentId: est.id },
      include: { user: true },
      take: 3,
    });

    // Meeting 1: Conseil de Classe (SCHEDULED, ONLINE)
    await prisma.meeting.create({
      data: {
        establishmentId: est.id,
        createdById: superAdmin.id,
        subject: `Conseil de Classe — ${est.name}`,
        type: MeetingType.CLASS_COUNCIL,
        date: new Date(Date.now() + 86400000 * 2),
        startTime: '14:00',
        endTime: '15:30',
        duration: 90,
        mode: MeetingMode.ONLINE,
        location: 'Visioconférence LiveKit HD',
        description: 'Examen des moyennes trimestrielles, assiduité et orientations pédagogiques.',
        status: MeetingStatus.SCHEDULED,
        isOnline: true,
        roomName: `school-room-${est.slug}-council`,
        points: {
          create: [
            {
              title: 'Approbation des bilans de classe et félicitations du conseil',
              description: 'Examen des notes et propositions de mentions honorifiques.',
              isVote: true,
              sortOrder: 1,
            },
            {
              title: 'Mesures d’accompagnement et soutien scolaire',
              description: 'Organisation des séances de rattrapage en sciences et langues.',
              isVote: false,
              sortOrder: 2,
            },
          ],
        },
        participants: {
          create: [
            {
              name: 'Direction Pédagogique',
              email: est.email || `admin@${est.slug}.tn`,
              role: MeetingParticipantRole.HOST,
              userId: superAdmin.id,
            },
            ...estTeachers.map((t, idx) => ({
              name: `${t.firstName} ${t.lastName}`,
              email: t.email || `teacher${idx}@${est.slug}.tn`,
              role: MeetingParticipantRole.MODERATOR,
              userId: t.userId,
            })),
          ],
        },
      },
    });

    // Meeting 2: Conseil Pédagogique (IN_PROGRESS, LIVE with cast votes)
    const m2 = await prisma.meeting.create({
      data: {
        establishmentId: est.id,
        createdById: superAdmin.id,
        subject: `Conseil Pédagogique & Innovation — ${est.name}`,
        type: MeetingType.PEDAGOGICAL,
        date: new Date(),
        startTime: '10:00',
        endTime: '12:00',
        duration: 120,
        mode: MeetingMode.ONLINE,
        location: 'Visioconférence LiveKit HD',
        description: 'Séance collégiale en direct : Déploiement des outils numériques et calendrier des épreuves.',
        status: MeetingStatus.IN_PROGRESS,
        isOnline: true,
        roomName: `school-room-${est.slug}-pedagogical`,
        points: {
          create: [
            {
              title: 'Adoption du calendrier définitif des épreuves de contrôle',
              description: 'Validation à la majorité des dates proposées par les départements.',
              isVote: true,
              sortOrder: 1,
            },
            {
              title: 'Projet d’activités culturelles et sorties pédagogiques',
              description: 'Planning des clubs robotique et visites éducatives.',
              isVote: true,
              sortOrder: 2,
            },
          ],
        },
        participants: {
          create: [
            {
              name: 'Directeur des Études',
              email: `direction@${est.slug}.tn`,
              role: MeetingParticipantRole.HOST,
              userId: superAdmin.id,
              status: ParticipantStatus.ATTENDED,
            },
            ...estTeachers.map((t, idx) => ({
              name: `${t.firstName} ${t.lastName}`,
              email: t.email || `prof${idx}@${est.slug}.tn`,
              role: MeetingParticipantRole.PRESENTER,
              userId: t.userId,
              status: ParticipantStatus.ATTENDED,
            })),
          ],
        },
      },
      include: {
        points: true,
        participants: true,
      },
    });

    // Cast sample votes on Meeting 2 points
    if (m2.points.length > 0 && m2.participants.length > 1) {
      const pt1 = m2.points[0];
      const p1 = m2.participants[0];
      const p2 = m2.participants[1];
      await prisma.meetingVote.createMany({
        data: [
          { pointId: pt1.id, participantId: p1.id, value: VoteValue.YES },
          { pointId: pt1.id, participantId: p2.id, value: VoteValue.YES },
        ],
        skipDuplicates: true,
      });
    }

    // Meeting 3: Réunion Parents-Professeurs (SCHEDULED, HYBRID)
    await prisma.meeting.create({
      data: {
        establishmentId: est.id,
        createdById: superAdmin.id,
        subject: `Rencontre Parents-Enseignants Trimestre 1 — ${est.name}`,
        type: MeetingType.PARENT_TEACHER,
        date: new Date(Date.now() + 86400000 * 5),
        startTime: '16:00',
        endTime: '18:00',
        duration: 120,
        mode: MeetingMode.HYBRID,
        location: 'Amphithéâtre Principal & Reclassement WebRTC',
        description: 'Échanges individuels et collectifs avec les représentants des parents d’élèves.',
        status: MeetingStatus.SCHEDULED,
        isOnline: true,
        roomName: `school-room-${est.slug}-parents`,
        points: {
          create: [
            {
              title: 'Présentation des indicateurs de réussite globale du trimestre',
              description: 'Taux de réussite et assiduité par section.',
              isVote: false,
              sortOrder: 1,
            },
          ],
        },
        participants: {
          create: [
            {
              name: 'Coordinateur des Cycles',
              email: `coordination@${est.slug}.tn`,
              role: MeetingParticipantRole.HOST,
            },
            ...estParents.map((p, idx) => ({
              name: `${p.firstName} ${p.lastName}`,
              email: p.email || `parent${idx}@${est.slug}.tn`,
              role: MeetingParticipantRole.ATTENDEE,
              userId: p.userId,
            })),
          ],
        },
      },
    });

    totalMeetingsCreated += 3;
  }
  console.log(`   ✅ ${totalMeetingsCreated} meetings populated with LiveKit rooms, points & votes.`);

  console.log('\n======================================================');
  console.log('🎉 MULTI-TENANT SEED COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log(`   - Tenants: 4 (Hannibal, Al-Amel, Ibn Khaldoun, Étoile Brillante)`);
  console.log(`   - Establishments: 8 across Daycare, School, Middle & High School`);
  console.log(`   - Classes: ${totalClassesCreated} fully linked`);
  console.log(`   - Teachers: ${totalTeachersCreated} with contracts & matieres`);
  console.log(`   - Students: ${totalStudentsCreated} enrolled in classes & linked to parents`);
  console.log(`   - Student Payments: ${totalPaymentsCreated} in TND`);
  console.log(`   - Exams: ${totalExamsCreated} with student grades`);
  console.log('\n🔑 ACCESS CREDENTIALS FOR TESTING:');
  console.log('   👑 Root Admin:          bsofts.contact@gmail.com   / Ahmed123* (Assigned to all 8 establishments)');
  console.log('   🏢 Tenant 1 (Hannibal):  tenant1@bsofts.com         / Admin@123');
  console.log('   🏢 Tenant 2 (Al-Amel):   tenant2@bsofts.com         / Admin@123');
  console.log('   🏢 Tenant 3 (Khaldoun):  tenant3@bsofts.com         / Admin@123');
  console.log('   🏢 Tenant 4 (Étoile):    tenant4@bsofts.com         / Admin@123');
  console.log('   🏫 School Admins:        admin_<slug>@school.tn     / Admin@123');
  console.log('   👩‍🏫 Teachers:             prof1_<slug>@school.tn     / Admin@123');
  console.log('   🎓 Students:             eleve1_<slug>@school.tn    / Admin@123');
  console.log('   👨‍👩‍👧 Parents:              parent1_<slug>@parent.tn   / Admin@123');
  console.log('======================================================\n');
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
