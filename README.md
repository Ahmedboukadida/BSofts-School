# BSofts School - School Management System

A comprehensive multi-tenant SaaS school management system built with modern technologies.

## Features

### Core Modules
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Students, Teachers, Parents, Employees
- **Academic Structure**: Classes, Academic Years, Periods, Subjects
- **Attendance**: Student and Teacher attendance tracking
- **Exams & Grades**: Exam creation, grading, and reports
- **Payments**: Student fee collection and tracking
- **Finance**: Caisse management, transactions, payroll
- **Communication**: Messages, notifications, conversations
- **Reports**: Analytics, charts, and data export

### SaaS Features
- **Multi-tenancy**: Shared database with tenant isolation
- **Role-based Access**: Root, Super Admin, Admin, Teacher, Student, Parent
- **Subscription Plans**: Basic, Standard, Premium tiers
- **Landing Page**: Marketing site with pricing

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 12.x | API Framework |
| Prisma | 7.x | ORM |
| PostgreSQL | 17 | Database |
| Vitest | 4.x | Testing |
| TypeScript | 6.x | Language |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | Framework |
| React | 19.x | UI Library |
| Tailwind CSS | 4.x | Styling |
| Zustand | - | State Management |
| Recharts | - | Charts |
| Axios | - | HTTP Client |

## Project Structure

```
BSofts-School/
├── backend/                  # NestJS API & Prisma ORM
│   ├── prisma/               # Schema & seed data
│   └── src/                  # Modules, Controllers, Services, DTOs
├── frontend/                 # Next.js 16 App Router & Tailwind CSS
│   ├── src/app/              # 38 Dashboard views & portals
│   ├── src/components/       # UI components & DataTables
│   └── messages/             # i18n dictionaries (FR, EN, AR)
└── .gemini/                  # Centralized Project Hub & Intelligence
    ├── skills/               # 269 specialized engineering skills
    ├── plugins/              # Tooling & integration plugins
    ├── mcp/                  # MCP server configurations (Prisma, Neon, Firebase, etc.)
    ├── subagents/            # Domain & layer subagents specification (SUBAGENTS.md)
    ├── AGENTS.md             # Agents roster & routing rules
    ├── DESIGN_SYSTEM.md      # Solid 5-color palette & UI specifications
    ├── DEPLOYMENT.md         # Deployment & production hosting guides
    ├── implementation_plan.md# Active Master Implementation Plan
    ├── walkthrough.md        # Feature walkthroughs & change verification
    ├── scratch/              # Project maintenance & data scripts
    └── archive/              # Historical session logs & database backups
```

## Centralized Workspace Hub (`.gemini/`)

All architecture plans, agent roles, domain skills, MCP servers, plugins, and deployment guides are centralized strictly in [`.gemini/`](file:///e:/ReFactory/BSofts-School/.gemini):
- **Domain Subagents Matrix**: [`.gemini/subagents/SUBAGENTS.md`](file:///e:/ReFactory/BSofts-School/.gemini/subagents/SUBAGENTS.md)
- **Agent Roles & Routing**: [`.gemini/AGENTS.md`](file:///e:/ReFactory/BSofts-School/.gemini/AGENTS.md)
- **Design System & Palette**: [`.gemini/DESIGN_SYSTEM.md`](file:///e:/ReFactory/BSofts-School/.gemini/DESIGN_SYSTEM.md)
- **Production Deployment**: [`.gemini/DEPLOYMENT.md`](file:///e:/ReFactory/BSofts-School/.gemini/DEPLOYMENT.md)
- **Active Master Plan**: [`.gemini/implementation_plan.md`](file:///e:/ReFactory/BSofts-School/.gemini/implementation_plan.md)
- **Verification Walkthrough**: [`.gemini/walkthrough.md`](file:///e:/ReFactory/BSofts-School/.gemini/walkthrough.md)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 17
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Seed database
npm run seed

# Start development server
npm run start:dev
```

Backend runs on `http://localhost:3001/api`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | User registration |
| GET | /api/auth/profile | Get current user |
| POST | /api/auth/refresh | Refresh token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List users |
| GET | /api/users/:id | Get user |
| POST | /api/users | Create user |
| PATCH | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/students | List students |
| GET | /api/students/:id | Get student |
| POST | /api/students | Create student |
| PATCH | /api/students/:id | Update student |
| DELETE | /api/students/:id | Delete student |

### Teachers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/teachers | List teachers |
| GET | /api/teachers/:id | Get teacher |
| POST | /api/teachers | Create teacher |
| PATCH | /api/teachers/:id | Update teacher |
| DELETE | /api/teachers/:id | Delete teacher |

### Classes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/classes | List classes |
| GET | /api/classes/:id | Get class |
| POST | /api/classes | Create class |
| PATCH | /api/classes/:id | Update class |
| DELETE | /api/classes/:id | Delete class |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/student-attendance | List attendance |
| POST | /api/student-attendance | Mark attendance |
| GET | /api/student-attendance/stats | Get statistics |

### Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/exams | List exams |
| GET | /api/exams/:id | Get exam |
| POST | /api/exams | Create exam |
| PATCH | /api/exams/:id | Update exam |
| DELETE | /api/exams/:id | Delete exam |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/student-payments | List payments |
| POST | /api/student-payments | Record payment |
| GET | /api/student-payments/:id | Get payment |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reports/generate | Generate report |
| GET | /api/audit-logs | List audit logs |

## Default Credentials

### Super Admin
- **Email**: admin@bsofts.com
- **Password**: Admin@123

## Database Schema

The system uses 45+ models including:
- Users, Roles, Permissions
- Students, Teachers, Parents, Employees
- Classes, Academic Years, Periods
- Attendance, Exams, Notes
- Payments, Transactions
- Messages, Notifications

## Testing

```bash
# Run backend tests
cd backend
npm run test

# Run with coverage
npm run test:cov
```

## Build for Production

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

## License

UNLICENSED - Private Software

## Support

For support, contact: support@bsofts.com
