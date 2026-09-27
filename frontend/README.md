# BSofts School - Frontend Application

Production-grade Next.js 16 SaaS web application for comprehensive school management and virtual classrooms.

## Architectural Highlights

- **Framework**: Next.js 16 with App Router, Turbopack, and React 19.
- **Strict Brand Design System**: High-contrast, accessibility-focused 5-solid-color palette:
  - Deep Navy: `#242F40`
  - Charcoal Dark: `#363636`
  - Warm Ochre: `#CCA43B`
  - Platinum Light: `#E5E5E5`
  - Pure White: `#FFFFFF`
  *(Zero gradients policy)*
- **Data Architecture**: Reusable `DataTable` component system across all 41 routes with integrated pagination, server/client searching, column filtering, bulk actions, and trash bin toggle.
- **Virtual Meetings & Classrooms**: Integrated LiveKit WebRTC video rooms, screen sharing, real-time participant queue/turn requests, and interactive meeting point voting.
- **Dual Payment Flows**:
  - **Stripe**: Multi-currency card checkout for SaaS subscription plans.
  - **ClicToPay**: Tunisian dinar processing for student tuitions and school fee payments.
- **Multi-Tenant Navigation**: Instant tenant and establishment switching with dual-mode navigation (Horizontal Top Navbar & Vertical Sidebar).
- **Resilient Error Handling**: Zero silent catch policy with centralized toast feedback notifications (`useToast`) and API error parsing (`showApiErrorToast`).

## Directory Structure

```
frontend/src/
├── app/
│   ├── (auth)/                  # Login, registration, forgotten password
│   ├── (dashboard)/             # Main SaaS operational views (41 routes)
│   │   ├── admin/               # Tenants, subscriptions, plans, system/audit logs, settings
│   │   ├── community/           # LiveKit meetings, notifications, internal messaging
│   │   ├── payments/            # Tuition invoices, caisse, transactions
│   │   ├── portal/              # Role-specific portals (Student, Parent, Teacher)
│   │   ├── schedule/            # Interactive class & teacher timetables
│   │   └── [modules]/           # Students, teachers, classes, homework, attendance, exams
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # SaaS marketing landing page
├── components/
│   ├── layout/                  # Navbar, Sidebar, Breadcrumb, Header
│   ├── meetings/                # LiveKit video room, voting UI, hand raise
│   └── ui/                      # DataTable, Card, Modal, Input, Button, Toast
├── lib/
│   ├── api.ts                   # Axios client with interceptors & tenant headers
│   └── utils.ts                 # Formatting & class concatenation utilities
├── store/
│   ├── auth-store.ts            # User profile, tokens, RBAC permissions
│   └── establishment-store.ts   # Active tenant & establishment context
└── types/                       # Authoritative TypeScript domain models
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Environment

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Run development server
npm run dev
```

### Production Build

```bash
# Type-check and production build with Turbopack
npm run build

# Start production server
npm run start
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=BSofts School
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
