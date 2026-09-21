import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import { AppValidationPipe } from './common/pipes';
import { PrismaService } from './prisma/prisma.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS with dynamic multi-environment support
  const allowedOrigins = [
    'http://localhost:3025',
    'http://localhost:3026',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://bsoft-school-front.vercel.app',
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : []),
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(AppValidationPipe);

  // Global filters with Prisma for system error logging
  const prismaService = app.get(PrismaService);
  app.useGlobalFilters(new AllExceptionsFilter(prismaService));

  // Trust proxy for rate limiting
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('BSofts School API')
    .setDescription(`
### BSofts School — Multi-tenant SaaS School Management API
### Authentication: All protected endpoints require a **Bearer Token** obtained via \`POST /api/auth/login\`.
### Multi-tenancy: Most endpoints accept an \`x-establishment-id\` header to scope data to a specific establishment. ROOT users bypass establishment scoping.
### Pagination: List endpoints support \`page\`, \`limit\`, \`search\`, \`sortBy\`, \`sortOrder\` query parameters.
    `)
    .setVersion('1.0')
    .setContact('BSofts Team', 'https://bsofts.com', 'support@bsofts.com')
    .setLicense('Proprietary', 'https://bsofts.com/license')
    .addTag('Auth', 'Login, register, token refresh, profile')
    .addTag('Users', 'User CRUD, password management')
    .addTag('Roles', 'Role management and assignment')
    .addTag('Permissions', 'Permission codes and module-based listing')
    .addTag('User Roles', 'Assign roles to users per establishment')
    .addTag('Role Permissions', 'Attach permissions to roles')
    .addTag('Login Logs', 'Login attempt history and stats')
    .addTag('Establishments', 'School/organization CRUD')
    .addTag('Tenants', 'SaaS tenant management')
    .addTag('SaaS Plans', 'Subscription plan CRUD')
    .addTag('SaaS Modules', 'Feature module CRUD')
    .addTag('Tenant Subscriptions', 'Tenant plan subscriptions')
    .addTag('Academic Years', 'Academic year CRUD and set-current')
    .addTag('Academic Periods', 'Term/semester management')
    .addTag('Academic Modules', 'Module/subject management')
    .addTag('Class Levels', 'Grade level definitions')
    .addTag('Classes', 'Class/group CRUD and assignment')
    .addTag('Students', 'Student CRUD, linked user accounts')
    .addTag('Parents', 'Parent CRUD, linked user accounts')
    .addTag('Teachers', 'Teacher CRUD, linked user accounts')
    .addTag('Teacher Contracts', 'Teacher employment contracts')
    .addTag('Teacher Leaves', 'Teacher leave requests and approval')
    .addTag('Teacher Payments', 'Teacher salary/payment tracking')
    .addTag('Teacher Attendance', 'Teacher attendance tracking')
    .addTag('Employees', 'Staff CRUD, linked user accounts')
    .addTag('Employee Contracts', 'Employee employment contracts')
    .addTag('Rooms', 'Room/resource management')
    .addTag('Subjects', 'Subject (matière) management')
    .addTag('Sessions', 'Class session scheduling')
    .addTag('Lessons', 'Lesson/curriculum management')
    .addTag('Holidays', 'Holiday/vacation management')
    .addTag('Exams', 'Exam CRUD and scheduling')
    .addTag('Notes', 'Student grades/notes per period')
    .addTag('Bulletins', 'Report cards / bulletins')
    .addTag('Student Attendance', 'Student attendance tracking')
    .addTag('Student Payments', 'Student payment tracking')
    .addTag('Payment Plans', 'Payment plan definitions')
    .addTag('Caisses', 'Cash register/box management')
    .addTag('Financial Transactions', 'Financial transaction tracking')
    .addTag('Conversations', 'Messaging conversations')
    .addTag('Messages', 'Chat messages')
    .addTag('Notifications', 'User notifications')
    .addTag('Audit Logs', 'System audit trail')
    .addTag('Reports', 'Report generation')
    .addTag('Landing', 'Public landing page data (no auth)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    customSiteTitle: 'BSofts School API Docs',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customCss: '.swagger-ui .topbar { display: none } .swagger-ui { font-family: "Inter", sans-serif; }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  const port = process.env.PORT || 3025;
  await app.listen(port);
  logger.log(`Application running on: http://localhost:${port}`);
  logger.log(`API documentation: http://localhost:${port}/swagger`);
}
bootstrap();
