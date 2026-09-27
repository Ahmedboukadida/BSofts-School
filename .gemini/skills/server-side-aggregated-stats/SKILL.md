---
name: server-side-aggregated-stats
description: 'High-performance server-side aggregation architecture for dashboards and reports, replacing client-side limit=200 fetching with PostgreSQL aggregations and Redis caching.'
---

# Server-Side Aggregated Stats Architecture

## 1. Problem Statement & Anti-Pattern

In previous iterations, pages like `/dashboard` and `/reports` executed:
```typescript
// ANTI-PATTERN: Client-side bulk download and iteration
const payments = await api.get('/student-payments?limit=200');
const totalPaid = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
```
**Why this breaks in production**:
- Once a school exceeds 200 payments or attendance entries, records beyond the limit are silently dropped.
- Heavy browser payload transmission and memory bloat.
- Multiple uncoordinated round-trips over the network.

## 2. Standard Solution: Authoritative Server-Side Endpoints

### 2.1 Dashboard Stats (`GET /dashboard/stats`)
- **Controller**: `DashboardController` (`backend/src/reports/dashboard.controller.ts`)
- **Guard**: `JwtAuthGuard` (accessible to all authenticated users of an establishment).
- **Service**: `ReportsService.getDashboardStats(establishmentId)`
- **Aggregation Strategy**:
  - `prisma.student.count` (non-deleted)
  - `prisma.teacher.count` (active, non-deleted)
  - `prisma.class.count` (active)
  - `prisma.studentPayment.aggregate` for `PAID`, `PENDING`, and `OVERDUE` with `_sum: { amount: true }` and `_count: true`
  - `prisma.studentAttendance.groupBy` by `status`
  - `prisma.student.findMany` (take: 5) for recent enrollments
- **Caching**: 60-second Redis TTL keyed by `bsofts:<tenant>:<est>:reports:stats`.

### 2.2 Reporting Stats (`GET /reports/stats`)
- **Controller**: `ReportsController` (`backend/src/reports/reports.controller.ts`)
- **Guard**: `JwtAuthGuard` + `PermissionsGuard('reports:list')`
- **Output Schema**:
  - `summary`: High-level totals (`totalStudents`, `totalTeachers`, `totalClasses`, `totalPaid`, `totalPending`, `totalOverdue`, `attendanceRate`).
  - `paymentSummary`: Pre-grouped arrays suitable for chart components (`Payé`, `En attente`, `En retard`).
  - `attendanceSummary`: Pre-grouped attendance statuses (`Présent`, `Absent`, `En retard`, `Excusé`).

## 3. Frontend Consumption Pattern

Always fetch from server stats first, with graceful fallback:
```typescript
const statsRes = await api.get('/dashboard/stats', { params })
  .catch(() => api.get('/reports/stats', { params }))
  .catch(async () => { /* fallback */ });
```
This guarantees accurate numbers regardless of dataset size.
