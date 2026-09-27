# Domain 2: Academic & Institution Management

## 1. Domain Purpose
The Academic & Institution domain models the physical and temporal structure of educational facilities: physical campuses/establishments, academic years, classrooms, student enrollments, teacher assignments, timetable schedules, and year-end grade promotions.

## 2. Core Entities & Data Models
- **`Establishment`**: An educational facility/campus belonging to a Tenant. Categories: `DAYCARE`, `PRIMARY`, `MIDDLE_SCHOOL`, `HIGH_SCHOOL`, `UNIVERSITY`.
- **`AcademicYear`**: Academic calendar session (e.g., `2025/2026`) with `startDate`, `endDate`, and `isCurrent` active flag.
- **`Class`**: Academic grade group (e.g., `3ème B`, `CM2 A`) linked to an establishment and academic year.
- **`Room`**: Physical facilities (classrooms, labs, sports fields) with capacity limits.
- **`Student` & `StudentProfile`**: Student demographic records, national ID, matricule, parent relations, tuition balances.
- **`Teacher` & `TeacherProfile`**: Faculty directory with specializations, qualifications, and weekly teaching loads.
- **`Session` (Timetable Schedule)**: Scheduled class periods mapping a teacher, subject, room, day of week, and start/end time.
- **`ClassPromotion`**: Promotion and progression records transitioning students across academic years.

## 3. Key Endpoints & APIs
- `GET /establishments` & `POST /establishments`: Establishment management with category validation.
- `GET /academic-years`: Active and historical academic years.
- `GET /classes` & `POST /classes`: Class section creation and capacity tracking.
- `GET /students` & `POST /students`: Student registrations, profile updates, and active enrollment.
- `GET /teachers` & `POST /teachers`: Teacher recruitment, contact information, and subject mapping.
- `GET /rooms` & `POST /rooms`: Room inventory and availability checking.
- `GET /sessions`: Timetable periods scoped with `startDate` and `endDate` query boundaries to prevent unbound rendering.
- `POST /classes/promotion`: Batch student promotion across academic cycles.

## 4. Frontend Views
- `/establishments`: Multi-campus directory with capacity counters and director contact details.
- `/classes`: Class overview cards, student headcounts, and assigned teachers.
- `/classes/promotion`: Interactive wizard for year-end student promotion and retention.
- `/students`: Comprehensive directory with matricule generation, payment status badge, and detail drawers.
- `/teachers`: Faculty list with contact shortcuts, subject tags, and weekly timetable links.
- `/rooms`: Facility roster with capacity utilization indicators.
- `/schedule`: High-performance interactive weekly schedule with day/room/teacher filters.

## 5. Architectural Safeguards
- All entity queries are filtered using `tenantId` and `establishmentId` via `TenantWhereBuilder`.
- Timetable queries MUST enforce date bounding to guarantee sub-100ms render performance.
- Establishment category updates must conform to the Prisma `EstablishmentCategory` enum (`DAYCARE`, `PRIMARY`, `MIDDLE_SCHOOL`, `HIGH_SCHOOL`, `UNIVERSITY`).
