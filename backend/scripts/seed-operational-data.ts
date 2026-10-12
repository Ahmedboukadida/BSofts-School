import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const LOCAL_URL = 'postgresql://postgres:admin@127.0.0.1:5432/bsoftsschool?schema=public';
const NEON_URL = 'postgresql://neondb_owner:npg_ItvFmO5Cw7ES@ep-broad-sunset-b4uaw37v-pooler.c-6.us-east-2.aws.neon.tech/bsofts_school?sslmode=require&channel_binding=require';

async function seedDatabase(dbUrl: string, name: string) {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Operational Data Seed on: ${name}`);
  console.log(`======================================================`);

  const adapter = new PrismaPg({ connectionString: dbUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log(`✅ Connected to ${name}`);

    // 1. Fetch Establishments & Context
    const establishments = await prisma.establishment.findMany({
      where: { isDeleted: false },
      include: {
        academicYears: {
          include: { periods: true },
        },
        classes: true,
        teachers: {
          include: { user: true },
        },
        rooms: true,
      },
    });

    const allMatieres = await prisma.matiere.findMany({
      take: 50,
    });

    console.log(`📍 Found ${establishments.length} establishments in ${name}`);

    // Fetch users for logging/notifications
    const allUsers = await prisma.user.findMany({
      where: { isActive: true },
      take: 50,
    });

    const students = await prisma.student.findMany({
      where: { isDeleted: false },
      include: {
        establishment: true,
        classAssignments: true,
      },
      take: 60,
    });

    // 2. Seed Dynamic Payment Plans (Rubrics) per Establishment
    console.log(`💳 Seeding dynamic Payment Plans (Rubrics) per establishment...`);
    const rubricTemplates = [
      { name: "Frais d'Inscription & Dossier Annuel", type: 'ENROLLMENT', amount: 350.00, currency: 'TND', recurringPeriod: null },
      { name: 'Scolarité Trimestrielle - Trimestre 1', type: 'TUITION', amount: 1250.00, currency: 'TND', recurringPeriod: 'QUARTERLY' },
      { name: 'Scolarité Trimestrielle - Trimestre 2', type: 'TUITION', amount: 1250.00, currency: 'TND', recurringPeriod: 'QUARTERLY' },
      { name: 'Service Restauration & Cantine', type: 'RECURRING', amount: 420.00, currency: 'TND', recurringPeriod: 'MONTHLY' },
      { name: 'Transport Scolaire & Navette Urbaine', type: 'RECURRING', amount: 380.00, currency: 'TND', recurringPeriod: 'MONTHLY' },
      { name: 'Uniforme & Équipement Pédagogique', type: 'ONE_TIME', amount: 190.00, currency: 'TND', recurringPeriod: null },
      { name: 'Club Robotique & Activités Artistiques', type: 'CUSTOM', amount: 150.00, currency: 'TND', recurringPeriod: null },
      { name: 'Assurance Scolaire Obligatoire', type: 'ONE_TIME', amount: 65.00, currency: 'TND', recurringPeriod: null },
    ];

    for (const est of establishments) {
      for (const tpl of rubricTemplates) {
        const existing = await prisma.paymentPlan.findFirst({
          where: { establishmentId: est.id, name: tpl.name },
        });
        if (!existing) {
          await prisma.paymentPlan.create({
            data: {
              establishmentId: est.id,
              name: tpl.name,
              type: tpl.type as any,
              amount: tpl.amount,
              currency: tpl.currency,
              recurringPeriod: tpl.recurringPeriod as any,
              isActive: true,
              description: `Rubrique standard pour ${est.name}`,
            },
          });
        }
      }
    }

    // 3. Seed Student Payments linked to Payment Plans
    console.log(`💰 Seeding Student Payments with dynamic rubrics...`);
    for (const stu of students) {
      const plans = await prisma.paymentPlan.findMany({
        where: { establishmentId: stu.establishmentId, isActive: true },
        take: 4,
      });

      for (let i = 0; i < plans.length; i++) {
        const plan = plans[i];
        const existingPay = await prisma.studentPayment.findFirst({
          where: { studentId: stu.id, planId: plan.id },
        });

        if (!existingPay) {
          const status = i === 0 ? 'PAID' : (i === 1 ? 'PAID' : (i === 2 ? 'PENDING' : 'OVERDUE'));
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + (status === 'OVERDUE' ? -15 : 30));

          await prisma.studentPayment.create({
            data: {
              studentId: stu.id,
              planId: plan.id,
              amount: plan.amount,
              currency: 'TND',
              method: i % 2 === 0 ? 'CASH' : 'BANK_TRANSFER',
              status: status as any,
              dueDate,
              paidAt: status === 'PAID' ? new Date(Date.now() - 5 * 24 * 3600 * 1000) : null,
              reference: `PAY-${stu.registrationNumber || stu.id.slice(0, 4)}-${plan.name.slice(0, 3).toUpperCase()}-${i + 1}`,
              notes: `Paiement pour ${plan.name}`,
            },
          });
        }
      }
    }

    // 4. Seed Schedule Sessions across the current Academic Year (Current Week & Surroundings)
    console.log(`📅 Seeding Timetable Sessions for current week and academic periods...`);
    const today = new Date();
    // Monday of current week
    const currentMonday = new Date(today);
    const day = currentMonday.getDay();
    const diff = currentMonday.getDate() - day + (day === 0 ? -6 : 1);
    currentMonday.setDate(diff);
    currentMonday.setHours(0, 0, 0, 0);

    const timeSlots = [
      { startH: 8, startM: 30, endH: 10, endM: 30 },
      { startH: 10, startM: 45, endH: 12, endM: 45 },
      { startH: 14, startM: 0, endH: 16, endM: 0 },
      { startH: 16, startM: 15, endH: 18, endM: 15 },
    ];

    for (const est of establishments) {
      const year = est.academicYears.find((y) => y.isCurrent) || est.academicYears[0];
      if (!year) continue;
      const period = year.periods[0] || (await prisma.academicPeriod.create({
        data: {
          academicYearId: year.id,
          name: 'Trimestre 1',
          code: 'T1',
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 3600 * 1000),
        },
      }));

      const estClasses = est.classes.slice(0, 4);
      const estTeachers = est.teachers;
      const estRooms = est.rooms;
      const estMatieres = allMatieres;

      if (estClasses.length === 0 || estTeachers.length === 0) continue;

      // Seed for 4 weeks (last week, current week, next 2 weeks)
      for (let weekOffset = -1; weekOffset <= 2; weekOffset++) {
        for (let dayOffset = 0; dayOffset < 6; dayOffset++) { // Mon - Sat
          const sessionDate = new Date(currentMonday);
          sessionDate.setDate(currentMonday.getDate() + (weekOffset * 7) + dayOffset);

          for (let slotIdx = 0; slotIdx < timeSlots.length; slotIdx++) {
            const slot = timeSlots[slotIdx];
            const cls = estClasses[(dayOffset + slotIdx) % estClasses.length];
            const teacher = estTeachers[(slotIdx + dayOffset) % estTeachers.length];
            const room = estRooms.length > 0 ? estRooms[slotIdx % estRooms.length] : null;
            const matiere = estMatieres.length > 0 ? estMatieres[(slotIdx * 2 + dayOffset) % estMatieres.length] : null;

            const startTime = new Date(sessionDate);
            startTime.setHours(slot.startH, slot.startM, 0, 0);

            const endTime = new Date(sessionDate);
            endTime.setHours(slot.endH, slot.endM, 0, 0);

            // Check if session exists
            const existingSession = await prisma.session.findFirst({
              where: {
                classId: cls.id,
                date: {
                  gte: new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate(), 0, 0, 0),
                  lte: new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate(), 23, 59, 59),
                },
                startTime,
              },
            });

            if (!existingSession) {
              const session = await prisma.session.create({
                data: {
                  classId: cls.id,
                  academicYearId: year.id,
                  periodId: period.id,
                  teacherId: teacher?.id,
                  roomId: room?.id,
                  date: sessionDate,
                  startTime,
                  endTime,
                  topic: matiere ? `Séance de ${matiere.name} — Chapitre ${slotIdx + 1}` : `Cours Magistral ${cls.name}`,
                  status: sessionDate < today ? 'COMPLETED' : 'SCHEDULED',
                },
              });

              // Create Lesson record for this session if matiere available
              if (matiere) {
                await prisma.lesson.create({
                  data: {
                    sessionId: session.id,
                    matiereId: matiere.id,
                    title: `Cours de ${matiere.name}`,
                    content: `Séance d'apprentissage approfondi en classe de ${cls.name}`,
                    objectives: `Maîtrise des concepts clés du programme officiel`,
                  },
                });
              }

              // Seed student attendance for past sessions
              if (sessionDate < today) {
                const classStudents = await prisma.studentClassAssignment.findMany({
                  where: { classId: cls.id },
                  include: { student: true },
                });

                for (let stuIdx = 0; stuIdx < classStudents.length; stuIdx++) {
                  const s = classStudents[stuIdx];
                  const status = stuIdx % 10 === 0 ? 'ABSENT' : (stuIdx % 8 === 0 ? 'LATE' : 'PRESENT');
                  await prisma.studentAttendance.upsert({
                    where: {
                      studentId_sessionId: {
                        studentId: s.studentId,
                        sessionId: session.id,
                      },
                    },
                    update: {},
                    create: {
                      studentId: s.studentId,
                      sessionId: session.id,
                      status: status as any,
                      reason: status === 'ABSENT' ? 'Absence non justifiée' : (status === 'LATE' ? 'Retard transport (15 min)' : undefined),
                      markedBy: 'Enseignant',
                    },
                  });
                }
              }
            }
          }
        }
      }
    }

    // 5. Seed Broadcast and In-App Notifications
    console.log(`🔔 Seeding rich notification announcements...`);
    const notificationTemplates = [
      {
        title: 'Rentrée Scolaire 2025-2026 : Emplois du Temps Disponibles',
        content: 'Les nouveaux emplois du temps hebdomadaires sont désormais en ligne et consultables sur vos espaces dédiés.',
        type: 'IN_APP',
        link: '/schedule',
      },
      {
        title: 'Conseil de Classe & Délibérations Trimestrielles',
        content: 'La commission pédagogique se réunira pour valider les moyennes et délibérations du premier trimestre.',
        type: 'IN_APP',
        link: '/classes/promotion',
      },
      {
        title: 'Rappel d’échéance : Régularisation des Frais de Scolarité',
        content: 'Veuillez vérifier l’état de vos paiements pour le trimestre en cours auprès de la caisse ou via ClicToPay.',
        type: 'IN_APP',
        link: '/payments',
      },
      {
        title: 'Calendrier des Épreuves et Examens Sommatifs',
        content: 'Le calendrier officiel des examens et compositions a été publié pour toutes les classes.',
        type: 'IN_APP',
        link: '/exams',
      },
      {
        title: 'Réunion Pédagogique Parents-Enseignants en Ligne',
        content: 'Une visioconférence LiveKit aura lieu ce samedi pour faire le point sur le suivi des élèves.',
        type: 'IN_APP',
        link: '/community/meetings',
      },
    ];

    for (const u of allUsers.slice(0, 20)) {
      for (const n of notificationTemplates) {
        const existing = await prisma.notification.findFirst({
          where: { userId: u.id, title: n.title },
        });
        if (!existing) {
          await prisma.notification.create({
            data: {
              userId: u.id,
              title: n.title,
              content: n.content,
              type: n.type as any,
              link: n.link,
              isRead: Math.random() > 0.5,
            },
          });
        }
      }
    }

    // 6. Seed Audit Logs and System Logs
    console.log(`📜 Seeding audit logs and system logs for administrative monitoring...`);
    const rootUser = allUsers.find((u) => u.isRoot) || allUsers[0];
    const auditActions = [
      { action: 'USER_LOGIN', entity: 'User', snapshot: 'Connexion sécurisée via JWT' },
      { action: 'UPDATE', entity: 'SaaSPlatformConfig', snapshot: 'Mise à jour des paramètres de la plateforme' },
      { action: 'CREATE', entity: 'PaymentPlan', snapshot: 'Création nouvelle rubrique : Frais Inscription' },
      { action: 'CREATE', entity: 'StudentPayment', snapshot: 'Enregistrement paiement scolarité 1250 TND' },
      { action: 'BULK_UPDATE', entity: 'StudentAttendance', snapshot: 'Enregistrement de la feuille d’appel de classe' },
      { action: 'GENERATE', entity: 'Bulletin', snapshot: 'Génération automatique des bulletins du trimestre' },
      { action: 'CREATE', entity: 'Exam', snapshot: 'Création épreuve d’évaluation trimestrielle' },
    ];

    for (const a of auditActions) {
      await prisma.auditLog.create({
        data: {
          userId: rootUser?.id,
          actorSnapshot: `${rootUser?.firstName || 'Admin'} ${rootUser?.lastName || 'Root'} (@${rootUser?.email || 'admin'})`,
          action: a.action,
          entity: a.entity,
          status: 'SUCCESS',
          newValues: { detail: a.snapshot, timestamp: new Date().toISOString() },
        },
      });
    }

    const systemLogs = [
      { level: 'INFO', message: 'Démarrage du service de synchronisation SaaS multi-tenant', context: 'BootstrapService' },
      { level: 'INFO', message: 'Passerelle de paiement ClicToPay initialisée en mode Test TND', context: 'BillingService' },
      { level: 'WARN', message: 'Tentative de connexion avec token expiré renouvelé automatiquement', context: 'AuthGuard' },
      { level: 'INFO', message: 'Serveur de visioconférence LiveKit Cloud connecté avec succès', context: 'LiveKitService' },
      { level: 'INFO', message: 'Calcul des moyennes pondérées terminé pour 32 classes', context: 'BulletinEngine' },
    ];

    for (const log of systemLogs) {
      await prisma.systemLog.create({
        data: {
          level: log.level as any,
          message: log.message,
          context: log.context,
          resolved: true,
          resolvedAt: new Date(),
        },
      });
    }

    console.log(`✨ Successfully completed operational data seed on: ${name}`);
  } catch (err: any) {
    console.error(`❌ Error seeding ${name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  // Seed Local PostgreSQL
  await seedDatabase(LOCAL_URL, 'Local Database (127.0.0.1:5432)');

  // Seed Neon Cloud PostgreSQL
  await seedDatabase(NEON_URL, 'Neon Cloud Database');

  console.log('\n🎉 ALL OPERATIONAL DATA SEEDED AND SYNCHRONIZED ACROSS LOCAL AND NEON!\n');
}

main().catch(console.error);
