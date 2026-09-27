# BSofts School Master Completion Roadmap

## Current Status: Production Builds Passing (Backend 0 errors, Frontend 0 errors)
- PostgreSQL 17 Schema: 68 Models, 31 Enums
- NestJS Backend: 52 Modules, 51 Controllers, 52 Services
- Next.js 16 Frontend: 38 Views, 0 explicit `any` types

---

## Pillar 1: Academic Engine & Scheduling (EasySchool Invariants)
- [x] Establishment, Academic Year, Academic Period, Class Level, Class models configured
- [x] Class-Module & Subject assignments
- [x] Student enrollment and class assignment flows
- [ ] **Timetable 3-Tier Collision Avoidance Service**:
  - Teacher conflict validation on Session creation
  - Class conflict validation on Session creation
  - Room conflict validation on Session creation
- [ ] **Interactive Timetable Calendar View** (`/schedule`): Weekly visual grid with drag-and-drop or slot selection and immediate collision feedback
- [ ] **Tunisian Trimester Bulletin Generator**:
  - Coefficient weighting calculation
  - Exam / Note aggregation per period
  - Automatic class rank computation
  - Printable / Exportable PDF Bulletin layout

---

## Pillar 2: Financial Operations & Multi-Caisses
- [x] Caisse model, FinancialTransaction model, PaymentPlan, StudentPayment, TeacherPayment
- [x] Currency definition (TND millimes standard)
- [ ] **Atomic Balance Locking**:
  - `SELECT ... FOR UPDATE` row locking during cash movements (`ENCAISSEMENT`, `DECAISSEMENT`, `TRANSFERT`)
  - Real-time caisse balance recalculation
- [ ] **Tuition Installment Engine**:
  - Multi-installment payment plans with due dates
  - Automated overdue calculation & parent notification triggers
  - Payment receipt PDF printing

---

## Pillar 3: Governance, Dual-Delete & Trash ("Corbeille")
- [x] `isDeleted`, `deletedAt`, `deletedBy` fields on primary models
- [x] Tenant & Establishment context injection (`x-tenant-id`, `x-establishment-id`)
- [ ] **Dual-Delete Controller Enforcement**:
  - Regular users restricted to soft-delete
  - ROOT role permitted permanent hard-delete (`DELETE /:id?permanent=true`)
- [ ] **Unified Corbeille (Trash) Management View** (`/admin/trash`):
  - View all soft-deleted records across entities
  - One-click record restore
  - Bulk permanent purge (Root only)

---

## Pillar 4: Frontend UI/UX Standardization
- [x] Horizontal navigation bar overflow fix
- [x] Dynamic breadcrumb and establishment switcher
- [ ] **Standardized High-Density `<DataTable>` Engine**:
  - Contextual display modes (Table, Card Grid)
  - Column sorting, multi-attribute filtering, search debouncing
  - Standard pagination (10, 25, 50, 100)
  - 1-Click CSV/Excel export
- [ ] **Audit Metadata Timeline Modal**:
  - Visual timeline (`Created by`, `Updated by`, `Last accessed`)
  - Composed actor identity display (`FirstName LastName (@username) [Role]`)

---

## Pillar 5: Real-Time Communication & Notifications
- [x] Conversation, Participant, Message, Notification, NotificationTemplate models
- [ ] **WebSocket Gateway Integration**:
  - Real-time instant messaging between teachers, parents, and admins
  - Immediate absence alerts pushed to parent mobile/web portal
