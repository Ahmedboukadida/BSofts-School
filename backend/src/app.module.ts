import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { RolePermissionsModule } from './role-permissions/role-permissions.module';
import { LoginLogsModule } from './login-logs/login-logs.module';
import { SaaSPlansModule } from './saas-plans/saas-plans.module';
import { SaaSModulesModule } from './saas-modules/saas-modules.module';
import { TenantSubscriptionsModule } from './tenant-subscriptions/tenant-subscriptions.module';
import { TenantsModule } from './tenants/tenants.module';
import { EstablishmentsModule } from './establishments/establishments.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { AcademicPeriodsModule } from './academic-periods/academic-periods.module';
import { ClassesModule } from './classes/classes.module';
import { AcademicModulesModule } from './academic-modules/academic-modules.module';
import { MatieresModule } from './matieres/matieres.module';
import { StudentsModule } from './students/students.module';
import { ParentsModule } from './parents/parents.module';
import { TeachersModule } from './teachers/teachers.module';
import { EmployeesModule } from './employees/employees.module';
import { RoomsModule } from './rooms/rooms.module';
import { SessionsModule } from './sessions/sessions.module';
import { HolidaysModule } from './holidays/holidays.module';
import { StudentAttendanceModule } from './student-attendance/student-attendance.module';
import { TeacherAttendanceModule } from './teacher-attendance/teacher-attendance.module';
import { TeacherLeavesModule } from './teacher-leaves/teacher-leaves.module';
import { LessonsModule } from './lessons/lessons.module';
import { NotesModule } from './notes/notes.module';
import { ExamsModule } from './exams/exams.module';
import { StudentPaymentsModule } from './student-payments/student-payments.module';
import { TeacherPaymentsModule } from './teacher-payments/teacher-payments.module';
import { CaissesModule } from './caisses/caisses.module';
import { FinancialTransactionsModule } from './financial-transactions/financial-transactions.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { SystemLogsModule } from './system-logs/system-logs.module';
import { ReportsModule } from './reports/reports.module';
import { LandingModule } from './landing/landing.module';
import { ClassLevelsModule } from './class-levels/class-levels.module';
import { PaymentPlansModule } from './payment-plans/payment-plans.module';
import { TeacherContractsModule } from './teacher-contracts/teacher-contracts.module';
import { EmployeeContractsModule } from './employee-contracts/employee-contracts.module';
import { BulletinsModule } from './bulletins/bulletins.module';
import { PlatformSettingsModule } from './platform-settings/platform-settings.module';
import { UploadModule } from './upload/upload.module';
import { MailModule } from './mail/mail.module';
import { HomeworkModule } from './homework/homework.module';
import { DynamicEnumsModule } from './dynamic-enums/dynamic-enums.module';
import { LivekitModule } from './livekit/livekit.module';
import { MeetingsModule } from './meetings/meetings.module';
import { BillingModule } from './billing/billing.module';
import { CacheModule } from './common/cache/cache.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  SubscriptionMiddleware,
  EstablishmentContextMiddleware,
  SecurityHeadersMiddleware,
  AuthRateLimitMiddleware,
} from './common/middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}.local`,
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env.local',
        '.env',
      ],
    }),
    CacheModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    UserRolesModule,
    RolePermissionsModule,
    LoginLogsModule,
    SaaSPlansModule,
    SaaSModulesModule,
    TenantSubscriptionsModule,
    TenantsModule,
    EstablishmentsModule,
    AcademicYearsModule,
    AcademicPeriodsModule,
    ClassesModule,
    AcademicModulesModule,
    MatieresModule,
    StudentsModule,
    ParentsModule,
    TeachersModule,
    EmployeesModule,
    RoomsModule,
    SessionsModule,
    HolidaysModule,
    StudentAttendanceModule,
    TeacherAttendanceModule,
    TeacherLeavesModule,
    LessonsModule,
    NotesModule,
    ExamsModule,
    StudentPaymentsModule,
    TeacherPaymentsModule,
    CaissesModule,
    FinancialTransactionsModule,
    ConversationsModule,
    MessagesModule,
    NotificationsModule,
    AuditLogsModule,
    SystemLogsModule,
    ReportsModule,
    LandingModule,
    ClassLevelsModule,
    PaymentPlansModule,
    TeacherContractsModule,
    EmployeeContractsModule,
    BulletinsModule,
    PlatformSettingsModule,
    UploadModule,
    MailModule,
    HomeworkModule,
    DynamicEnumsModule,
    LivekitModule,
    MeetingsModule,
    BillingModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret && process.env.NODE_ENV === 'production') {
          throw new Error('FATAL: JWT_SECRET environment variable is missing in production mode!');
        }
        return {
          secret: secret || 'bsofts-school-jwt-secret-2026-development-only-key',
          signOptions: {
            expiresIn: configService.get('JWT_EXPIRATION') || '15m',
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityHeadersMiddleware)
      .forRoutes('*');
    consumer
      .apply(AuthRateLimitMiddleware)
      .forRoutes('auth/*', 'mail/test');
    consumer
      .apply(SubscriptionMiddleware)
      .forRoutes('*');
    consumer
      .apply(EstablishmentContextMiddleware)
      .forRoutes('*');
  }
}
