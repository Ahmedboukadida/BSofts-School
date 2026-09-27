# BSofts-School — Database Schema & Entity Relationships (68 Tables)

> Complete PostgreSQL Schema Specification deployed on Neon Cloud.  
> **Last Verified**: 2026-09-22

---

## 1. Domain Entity Relationship Diagram

```mermaid
erDiagram
    Tenant ||--o{ Establishment : owns
    Tenant ||--o{ TenantSubscription : holds
    SaaSPlan ||--o{ TenantSubscription : defines
    Establishment ||--o{ User : registers
    Establishment ||--o{ AcademicYear : manages
    Establishment ||--o{ ClassLevel : organizes
    ClassLevel ||--o{ Class : groups
    AcademicYear ||--o{ Class : hosts
    Establishment ||--o{ Room : contains
    Establishment ||--o{ AcademicModule : teaches
    AcademicModule ||--o{ Matiere : contains
    
    Class ||--o{ StudentClassAssignment : assigns
    Student ||--o{ StudentClassAssignment : enrolled_in
    AcademicYear ||--o{ StudentClassAssignment : for_year
    
    Student ||--o{ StudentParent : links
    Parent ||--o{ StudentParent : guardians
    
    Establishment ||--o{ Teacher : employs
    Teacher ||--o{ TeacherMatiere : instructs
    Matiere ||--o{ TeacherMatiere : taught_by
    Teacher ||--o{ TeacherContract : contracted_by
    
    Establishment ||--o{ Employee : employs
    Employee ||--o{ EmployeeContract : contracted_by
    
    Class ||--o{ Session : schedules
    Teacher ||--o{ Session : teaches
    Room ||--o{ Session : located_in
    Session ||--o{ StudentAttendance : records
    
    Class ||--o{ Exam : evaluates
    Matiere ||--o{ Exam : covers
    Exam ||--o{ Note : scores
    Student ||--o{ Note : receives
    
    Establishment ||--o{ Caisse : operates
    Caisse ||--o{ FinancialTransaction : logs
    Student ||--o{ StudentPayment : pays
    Teacher ||--o{ TeacherPayment : paid_via
    
    Establishment ||--o{ DynamicEnum : configures
    Establishment ||--o{ SmtpConfig : dispatches_via
    Establishment ||--o{ AuditLog : audits
    Establishment ||--o{ SystemLog : traces
```

---

## 2. Table Catalog by Domain

| Domain | Table Names | Description |
| :--- | :--- | :--- |
| **SaaS Platform** | `SaaSPlan`, `SaaSModule`, `SaaSPlanModule`, `SaaSPlanFeature`, `TenantPlanFeatureOverride`, `TenantSubscription`, `Tenant`, `TenantSettings`, `PlatformSetting` | Multi-tenant billing, feature limits, plan modules |
| **Identity & Access** | `User`, `Role`, `Permission`, `RolePermission`, `UserRoleAssignment`, `LoginLog` | Multi-role RBAC with permission guards |
| **Establishment & Config** | `Establishment`, `EstablishmentConfig`, `GraduationConfig`, `GraduationRecord`, `DynamicEnum`, `SmtpConfig`, `NotificationTemplate`, `NotificationConfig`, `PaymentConfig` | Campus master data, dynamic enums, email server configurations |
| **Academic Hierarchy** | `AcademicYear`, `AcademicPeriod`, `ClassLevel`, `Class`, `AcademicModule`, `ClassModuleAssignment`, `Matiere` | Cycles, trimesters, classes, subject coefficients |
| **People & HRMS** | `Student`, `Parent`, `StudentParent`, `StudentClassAssignment`, `Teacher`, `TeacherMatiere`, `TeacherContract`, `TeacherLeave`, `Employee`, `EmployeeContract` | Comprehensive student dossiers, parent links, contracts |
| **Facilities & Calendar** | `Room`, `RoomEquipment`, `Holiday`, `Session` | Timetable generation, collision prevention, equipment |
| **Evaluation & Pedagogics** | `Lesson`, `Homework`, `Exam`, `ExamQuestion`, `ExamSubmission`, `ExamAnswer`, `Note`, `Bulletin` | Continuous grading, bulletins with Rachat, online homework |
| **Attendance** | `StudentAttendance`, `TeacherAttendance` | Daily and session-level attendance with absence alerts |
| **Finance & Caisses** | `Caisse`, `FinancialTransaction`, `StudentPayment`, `PaymentPlan`, `TeacherPayment`, `ProfitLoss` | Double-entry cash drawers, receipts, payroll calculations |
| **Communication & Logs** | `Conversation`, `ConversationParticipant`, `Message`, `Notification`, `AuditLog`, `SystemLog` | Direct chat channels, audit trail, error tracing |

---

## 3. Standardized Audit & Soft-Delete Schema

All 45 primary domain models contain the following standardized fields:
```prisma
createdBy   String?
updatedBy   String?
isDeleted   Boolean   @default(false)
deletedAt   DateTime?
deletedBy   String?
```
This enables full recovery from the application trash mode without risking foreign key corruption or silent data loss.
