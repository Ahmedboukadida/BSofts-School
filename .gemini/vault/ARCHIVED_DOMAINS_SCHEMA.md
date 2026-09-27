# Archived Domain Schema Definitions

*Archived on: 2026-08-18*

These models and enums were removed from the active schema but preserved here for future reference.

## ENUM: blogs_media_type

```prisma
enum blogs_media_type {
  IMAGE
  VIDEO
}
```

## ENUM: blogs_status

```prisma
enum blogs_status {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

## ENUM: blogs_type

```prisma
enum blogs_type {
  GALLERY
  PORTFOLIO
  NEWS
  POST
}
```

## ENUM: blogs_visibility

```prisma
enum blogs_visibility {
  PUBLIC
  PRIVATE
}
```

## ENUM: campaign_status

```prisma
enum campaign_status {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
}
```

## ENUM: page_events_type

```prisma
enum page_events_type {
  SHARE
  VIEW
}
```

## ENUM: projects_milestones_status

```prisma
enum projects_milestones_status {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

## ENUM: projects_participants_role

```prisma
enum projects_participants_role {
  CHEF
  ASSISTANT
  OPERATEUR
  QUALITY
  TESTER
  DEVELOPER
  DESIGNER
}
```

## ENUM: projects_status

```prisma
enum projects_status {
  PLANNING
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}
```

## ENUM: projects_tasks_priority

```prisma
enum projects_tasks_priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

## ENUM: projects_tasks_status

```prisma
enum projects_tasks_status {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
  CANCELLED
  BLOCKED
}
```

## ENUM: projects_type

```prisma
enum projects_type {
  INTERNE
  EXTERNE
}
```

## ENUM: supports_tickets_files_type

```prisma
enum supports_tickets_files_type {
  IMAGE
  PDF
}
```

## ENUM: supports_tickets_priority

```prisma
enum supports_tickets_priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

## ENUM: supports_tickets_status

```prisma
enum supports_tickets_status {
  OPEN
  IN_PROGRESS
  CLOSED
}
```

## ENUM: supports_tickets_type

```prisma
enum supports_tickets_type {
  BUG
  FEATURE
  SUPPORT
}
```

## ENUM: academic_cycles_type

```prisma
enum academic_cycles_type {
  PRIMAIRE
  COLLEGE
  LYCEE
  UNIVERSITE
}
```

## ENUM: syndic_type_depense

```prisma
enum syndic_type_depense {
  CHARGES_COURANTES
  TRAVAUX
  HONORAIRES
  ASSURANCE
  IMPOTS
  ENTRETIEN
  AUTRE
}
```

## ENUM: syndic_type_reglement

```prisma
enum syndic_type_reglement {
  ESPECES
  CHEQUE
  VIREMENT
  PRELEVEMENT
  CARTE
}
```

## ENUM: syndic_type_maintenance

```prisma
enum syndic_type_maintenance {
  PREVENTIF
  CORRECTIF
  AMELIORATIF
  CONDITIONNEL
}
```

## ENUM: syndic_reclamation_status

```prisma
enum syndic_reclamation_status {
  OUVERTE
  EN_COURS
  RESOLUE
  REJETEE
}
```

## ENUM: academic_enrollment_status

```prisma
enum academic_enrollment_status {
  ACTIVE
  SUSPENDED
  GRADUATED
  WITHDRAWN
  TRANSFERRED
}
```

## MODEL: blog_posts_gallery

```prisma
model blog_posts_gallery {
  id                                         Int              @id @default(autoincrement())
  blog_id                                    Int
  file_path                                  String
  type                                       blogs_media_type
  company_id                                 Int
  created_at                                 DateTime         @default(now())
  created_by                                 Int
  is_updated                                 Boolean          @default(false)
  updated_at                                 DateTime?
  updated_by                                 Int?
  is_deleted                                 Boolean          @default(false)
  deleted_at                                 DateTime?
  deleted_by                                 Int?
  blogs                                      blogs            @relation(fields: [blog_id], references: [id])
  companies                                  companies        @relation(fields: [company_id], references: [id])
  users_blog_posts_gallery_created_byTousers users            @relation("blog_posts_gallery_created_byTousers", fields: [created_by], references: [id])
  users_blog_posts_gallery_deleted_byTousers users?           @relation("blog_posts_gallery_deleted_byTousers", fields: [deleted_by], references: [id])
  users_blog_posts_gallery_updated_byTousers users?           @relation("blog_posts_gallery_updated_byTousers", fields: [updated_by], references: [id])

  @@index([blog_id])
  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([updated_by])
}
```

## MODEL: blogs

```prisma
model blogs {
  id                            Int                          @id @default(autoincrement())
  title                         String
  image                         String?
  cover                         String?
  content                       String
  date                          DateTime
  status                        blogs_status
  type                          blogs_type
  visibility                    blogs_visibility
  company_id                    Int
  created_at                    DateTime                     @default(now())
  created_by                    Int
  is_updated                    Boolean                      @default(false)
  updated_at                    DateTime?
  updated_by                    Int?
  is_deleted                    Boolean                      @default(false)
  deleted_at                    DateTime?
  deleted_by                    Int?
  blog_posts_gallery            blog_posts_gallery[]
  companies                     companies                    @relation(fields: [company_id], references: [id])
  users_blogs_created_byTousers users                        @relation("blogs_created_byTousers", fields: [created_by], references: [id])
  users_blogs_deleted_byTousers users?                       @relation("blogs_deleted_byTousers", fields: [deleted_by], references: [id])
  users_blogs_updated_byTousers users?                       @relation("blogs_updated_byTousers", fields: [updated_by], references: [id])
  blogs_categories_relations    blogs_categories_relations[]
  blogs_comments                blogs_comments[]
  blogs_media                   blogs_media[]
  blogs_tags_relations          blogs_tags_relations[]

  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([updated_by])
}
```

## MODEL: blogs_categories

```prisma
model blogs_categories {
  id                                       Int                          @id @default(autoincrement())
  name                                     String
  company_id                               Int
  created_at                               DateTime                     @default(now())
  created_by                               Int
  is_updated                               Boolean                      @default(false)
  updated_at                               DateTime?
  updated_by                               Int?
  is_deleted                               Boolean                      @default(false)
  deleted_at                               DateTime?
  deleted_by                               Int?
  companies                                companies                    @relation(fields: [company_id], references: [id])
  users_blogs_categories_created_byTousers users                        @relation("blogs_categories_created_byTousers", fields: [created_by], references: [id])
  users_blogs_categories_deleted_byTousers users?                       @relation("blogs_categories_deleted_byTousers", fields: [deleted_by], references: [id])
  users_blogs_categories_updated_byTousers users?                       @relation("blogs_categories_updated_byTousers", fields: [updated_by], references: [id])
  blogs_categories_relations               blogs_categories_relations[]

  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([updated_by])
}
```

## MODEL: blogs_categories_relations

```prisma
model blogs_categories_relations {
  id                  Int              @id @default(autoincrement())
  blogs_id            Int
  blogs_categories_id Int
  blogs_categories    blogs_categories @relation(fields: [blogs_categories_id], references: [id])
  blogs               blogs            @relation(fields: [blogs_id], references: [id])

  @@index([blogs_categories_id])
  @@index([blogs_id])
}
```

## MODEL: blogs_comments

```prisma
model blogs_comments {
  id                                     Int              @id @default(autoincrement())
  content                                String
  date                                   DateTime
  blogs_id                               Int
  parent_id                              Int?
  created_at                             DateTime         @default(now())
  created_by                             Int
  is_updated                             Boolean          @default(false)
  updated_at                             DateTime?
  updated_by                             Int?
  is_deleted                             Boolean          @default(false)
  deleted_at                             DateTime?
  deleted_by                             Int?
  blogs                                  blogs            @relation(fields: [blogs_id], references: [id])
  users_blogs_comments_created_byTousers users            @relation("blogs_comments_created_byTousers", fields: [created_by], references: [id])
  users_blogs_comments_deleted_byTousers users?           @relation("blogs_comments_deleted_byTousers", fields: [deleted_by], references: [id])
  blogs_comments                         blogs_comments?  @relation("blogs_commentsToblogs_comments", fields: [parent_id], references: [id])
  other_blogs_comments                   blogs_comments[] @relation("blogs_commentsToblogs_comments")
  users_blogs_comments_updated_byTousers users?           @relation("blogs_comments_updated_byTousers", fields: [updated_by], references: [id])

  @@index([blogs_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([parent_id])
  @@index([updated_by])
}
```

## MODEL: blogs_media

```prisma
model blogs_media {
  id                                  Int              @id @default(autoincrement())
  file_path                           String
  type                                blogs_media_type
  blogs_id                            Int
  created_at                          DateTime         @default(now())
  created_by                          Int
  is_updated                          Boolean          @default(false)
  updated_at                          DateTime?
  updated_by                          Int?
  is_deleted                          Boolean          @default(false)
  deleted_at                          DateTime?
  deleted_by                          Int?
  blogs                               blogs            @relation(fields: [blogs_id], references: [id])
  users_blogs_media_created_byTousers users            @relation("blogs_media_created_byTousers", fields: [created_by], references: [id])
  users_blogs_media_deleted_byTousers users?           @relation("blogs_media_deleted_byTousers", fields: [deleted_by], references: [id])
  users_blogs_media_updated_byTousers users?           @relation("blogs_media_updated_byTousers", fields: [updated_by], references: [id])

  @@index([blogs_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([updated_by])
}
```

## MODEL: blogs_tags

```prisma
model blogs_tags {
  id                                 Int                    @id @default(autoincrement())
  name                               String
  company_id                         Int
  created_at                         DateTime               @default(now())
  created_by                         Int
  is_updated                         Boolean                @default(false)
  updated_at                         DateTime?
  updated_by                         Int?
  is_deleted                         Boolean                @default(false)
  deleted_at                         DateTime?
  deleted_by                         Int?
  companies                          companies              @relation(fields: [company_id], references: [id])
  users_blogs_tags_created_byTousers users                  @relation("blogs_tags_created_byTousers", fields: [created_by], references: [id])
  users_blogs_tags_deleted_byTousers users?                 @relation("blogs_tags_deleted_byTousers", fields: [deleted_by], references: [id])
  users_blogs_tags_updated_byTousers users?                 @relation("blogs_tags_updated_byTousers", fields: [updated_by], references: [id])
  blogs_tags_relations               blogs_tags_relations[]

  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([updated_by])
}
```

## MODEL: blogs_tags_relations

```prisma
model blogs_tags_relations {
  id            Int        @id @default(autoincrement())
  blogs_id      Int
  blogs_tags_id Int
  blogs         blogs      @relation(fields: [blogs_id], references: [id])
  blogs_tags    blogs_tags @relation(fields: [blogs_tags_id], references: [id])

  @@index([blogs_id])
  @@index([blogs_tags_id])
}
```

## MODEL: campaign_analytics

```prisma
model campaign_analytics {
  id                                         Int                 @id @default(autoincrement())
  opens                                      Int
  clicks                                     Int
  bounces                                    Int
  campaign_id                                Int
  company_id                                 Int
  created_at                                 DateTime            @default(now())
  created_by                                 Int
  updated_at                                 DateTime?
  is_updated                                 Boolean             @default(false)
  updated_by                                 Int?
  deleted_at                                 DateTime?
  is_deleted                                 Boolean             @default(false)
  deleted_by                                 Int?
  marketing_campaigns                        marketing_campaigns @relation(fields: [campaign_id], references: [id])
  companies                                  companies           @relation(fields: [company_id], references: [id])
  users_campaign_analytics_created_byTousers users               @relation("campaign_analytics_created_byTousers", fields: [created_by], references: [id])
  users_campaign_analytics_deleted_byTousers users?              @relation("campaign_analytics_deleted_byTousers", fields: [deleted_by], references: [id])
  users_campaign_analytics_updated_byTousers users?              @relation("campaign_analytics_updated_byTousers", fields: [updated_by], references: [id])

  @@index([campaign_id])
  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([updated_by])
}
```

## MODEL: email_sequences

```prisma
model email_sequences {
  id                                      Int                 @id @default(autoincrement())
  subject                                 String
  html_body                               String
  send_delay_days                         Int
  campaign_id                             Int
  company_id                              Int
  created_at                              DateTime            @default(now())
  created_by                              Int
  updated_at                              DateTime?
  is_updated                              Boolean             @default(false)
  updated_by                              Int?
  deleted_at                              DateTime?
  is_deleted                              Boolean             @default(false)
  deleted_by                              Int?
  marketing_campaigns                     marketing_campaigns @relation(fields: [campaign_id], references: [id])
  companies                               companies           @relation(fields: [company_id], references: [id])
  users_email_sequences_created_byTousers users               @relation("email_sequences_created_byTousers", fields: [created_by], references: [id])
  users_email_sequences_deleted_byTousers users?              @relation("email_sequences_deleted_byTousers", fields: [deleted_by], references: [id])
  users_email_sequences_updated_byTousers users?              @relation("email_sequences_updated_byTousers", fields: [updated_by], references: [id])

  @@index([campaign_id])
  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([updated_by])
}
```

## MODEL: marketing_campaigns

```prisma
model marketing_campaigns {
  id                                          Int                  @id @default(autoincrement())
  name                                        String
  status                                      campaign_status
  budget                                      Decimal?             @db.Decimal(24, 6)
  start_date                                  DateTime?
  end_date                                    DateTime?
  company_id                                  Int
  created_at                                  DateTime             @default(now())
  created_by                                  Int
  updated_at                                  DateTime?
  is_updated                                  Boolean              @default(false)
  updated_by                                  Int?
  deleted_at                                  DateTime?
  is_deleted                                  Boolean              @default(false)
  deleted_by                                  Int?
  campaign_analytics                          campaign_analytics[]
  email_sequences                             email_sequences[]
  companies                                   companies            @relation(fields: [company_id], references: [id])
  users_marketing_campaigns_created_byTousers users                @relation("marketing_campaigns_created_byTousers", fields: [created_by], references: [id])
  users_marketing_campaigns_deleted_byTousers users?               @relation("marketing_campaigns_deleted_byTousers", fields: [deleted_by], references: [id])
  users_marketing_campaigns_updated_byTousers users?               @relation("marketing_campaigns_updated_byTousers", fields: [updated_by], references: [id])

  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([updated_by])
}
```

## MODEL: page_events

```prisma
model page_events {
  id         Int              @id @default(autoincrement())
  page_name  String
  type       page_events_type
  actor_id   Int
  company_id Int
  users      users            @relation(fields: [actor_id], references: [id])
  companies  companies        @relation(fields: [company_id], references: [id])

  @@index([actor_id])
  @@index([company_id])
}
```

## MODEL: projects_comments

```prisma
model projects_comments {
  id                                        Int             @id @default(autoincrement())
  project_id                                Int?
  task_id                                   Int?
  comment                                   String
  company_id                                Int
  created_at                                DateTime        @default(now())
  author_id                                 Int
  created_by                                Int
  deleted_at                                DateTime?
  deleted_by                                Int?
  is_deleted                                Boolean         @default(false)
  is_updated                                Boolean         @default(false)
  updated_at                                DateTime?
  updated_by                                Int?
  users_projects_comments_author_idTousers  users           @relation("projects_comments_author_idTousers", fields: [author_id], references: [id])
  companies                                 companies       @relation(fields: [company_id], references: [id])
  users_projects_comments_created_byTousers users           @relation("projects_comments_created_byTousers", fields: [created_by], references: [id])
  users_projects_comments_deleted_byTousers users?          @relation("projects_comments_deleted_byTousers", fields: [deleted_by], references: [id])
  projects_tasks                            projects_tasks? @relation(fields: [task_id], references: [id])
  users_projects_comments_updated_byTousers users?          @relation("projects_comments_updated_byTousers", fields: [updated_by], references: [id])

  @@index([author_id])
  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([project_id])
  @@index([task_id])
  @@index([updated_by])
}
```

## MODEL: projects_files

```prisma
model projects_files {
  id                                     Int       @id @default(autoincrement())
  file                                   String
  type                                   String
  project_id                             Int
  company_id                             Int
  name                                   String
  size                                   Decimal?  @db.Decimal(24, 6)
  created_at                             DateTime  @default(now())
  created_by                             Int
  deleted_at                             DateTime?
  deleted_by                             Int?
  is_deleted                             Boolean   @default(false)
  is_updated                             Boolean   @default(false)
  updated_at                             DateTime?
  updated_by                             Int?
  companies                              companies @relation(fields: [company_id], references: [id])
  users_projects_files_created_byTousers users     @relation("projects_files_created_byTousers", fields: [created_by], references: [id])
  users_projects_files_deleted_byTousers users?    @relation("projects_files_deleted_byTousers", fields: [deleted_by], references: [id])
  users_projects_files_updated_byTousers users?    @relation("projects_files_updated_byTousers", fields: [updated_by], references: [id])

  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([project_id])
  @@index([updated_by])
}
```

## MODEL: projects_milestones

```prisma
model projects_milestones {
  id                                          Int                        @id @default(autoincrement())
  name                                        String
  description                                 String?
  due_date                                    DateTime
  status                                      projects_milestones_status
  project_id                                  Int
  company_id                                  Int
  created_at                                  DateTime                   @default(now())
  created_by                                  Int
  deleted_at                                  DateTime?
  deleted_by                                  Int?
  is_deleted                                  Boolean                    @default(false)
  is_updated                                  Boolean                    @default(false)
  updated_at                                  DateTime?
  updated_by                                  Int?
  companies                                   companies                  @relation(fields: [company_id], references: [id])
  users_projects_milestones_created_byTousers users                      @relation("projects_milestones_created_byTousers", fields: [created_by], references: [id])
  users_projects_milestones_deleted_byTousers users?                     @relation("projects_milestones_deleted_byTousers", fields: [deleted_by], references: [id])
  users_projects_milestones_updated_byTousers users?                     @relation("projects_milestones_updated_byTousers", fields: [updated_by], references: [id])
  projects_tasks                              projects_tasks[]

  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([project_id])
  @@index([updated_by])
}
```

## MODEL: projects_participants

```prisma
model projects_participants {
  id                                            Int                        @id @default(autoincrement())
  project_id                                    Int
  role                                          projects_participants_role
  company_id                                    Int
  joined_at                                     DateTime?
  actor_id                                      Int
  created_at                                    DateTime                   @default(now())
  created_by                                    Int
  deleted_at                                    DateTime?
  deleted_by                                    Int?
  is_deleted                                    Boolean                    @default(false)
  is_updated                                    Boolean                    @default(false)
  updated_at                                    DateTime?
  updated_by                                    Int?
  users_projects_participants_actor_idTousers   users                      @relation("projects_participants_actor_idTousers", fields: [actor_id], references: [id])
  companies                                     companies                  @relation(fields: [company_id], references: [id])
  users_projects_participants_created_byTousers users                      @relation("projects_participants_created_byTousers", fields: [created_by], references: [id])
  users_projects_participants_deleted_byTousers users?                     @relation("projects_participants_deleted_byTousers", fields: [deleted_by], references: [id])
  users_projects_participants_updated_byTousers users?                     @relation("projects_participants_updated_byTousers", fields: [updated_by], references: [id])

  @@index([actor_id])
  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([project_id])
  @@index([updated_by])
}
```

## MODEL: projects_tasks

```prisma
model projects_tasks {
  id                                                                 Int                          @id @default(autoincrement())
  titre                                                              String
  description                                                        String?
  start_date                                                         DateTime
  end_date                                                           DateTime
  projects_tasks_status                                              projects_tasks_status
  project_id                                                         Int
  company_id                                                         Int
  created_at                                                         DateTime                     @default(now())
  milestone_id                                                       Int?
  parent_id                                                          Int?
  projects_tasks_priority                                            projects_tasks_priority
  created_by                                                         Int
  deleted_at                                                         DateTime?
  deleted_by                                                         Int?
  is_deleted                                                         Boolean                      @default(false)
  is_updated                                                         Boolean                      @default(false)
  predecessor_id                                                     Int?
  updated_at                                                         DateTime?
  updated_by                                                         Int?
  projects_comments                                                  projects_comments[]
  companies                                                          companies                    @relation(fields: [company_id], references: [id])
  users_projects_tasks_created_byTousers                             users                        @relation("projects_tasks_created_byTousers", fields: [created_by], references: [id])
  users_projects_tasks_deleted_byTousers                             users?                       @relation("projects_tasks_deleted_byTousers", fields: [deleted_by], references: [id])
  projects_milestones                                                projects_milestones?         @relation(fields: [milestone_id], references: [id])
  projects_tasks_projects_tasks_parent_idToprojects_tasks            projects_tasks?              @relation("projects_tasks_parent_idToprojects_tasks", fields: [parent_id], references: [id])
  other_projects_tasks_projects_tasks_parent_idToprojects_tasks      projects_tasks[]             @relation("projects_tasks_parent_idToprojects_tasks")
  projects_tasks_projects_tasks_predecessor_idToprojects_tasks       projects_tasks?              @relation("projects_tasks_predecessor_idToprojects_tasks", fields: [predecessor_id], references: [id])
  other_projects_tasks_projects_tasks_predecessor_idToprojects_tasks projects_tasks[]             @relation("projects_tasks_predecessor_idToprojects_tasks")
  users_projects_tasks_updated_byTousers                             users?                       @relation("projects_tasks_updated_byTousers", fields: [updated_by], references: [id])
  projects_tasks_assignments                                         projects_tasks_assignments[]
  projects_time_entries                                              projects_time_entries[]

  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([milestone_id])
  @@index([parent_id])
  @@index([predecessor_id])
  @@index([project_id])
  @@index([updated_by])
}
```

## MODEL: projects_tasks_assignments

```prisma
model projects_tasks_assignments {
  id                                                 Int            @id @default(autoincrement())
  task_id                                            Int
  company_id                                         Int
  created_at                                         DateTime       @default(now())
  created_by                                         Int
  deleted_at                                         DateTime?
  deleted_by                                         Int?
  is_deleted                                         Boolean        @default(false)
  is_updated                                         Boolean        @default(false)
  member_id                                          Int
  updated_at                                         DateTime?
  updated_by                                         Int?
  companies                                          companies      @relation(fields: [company_id], references: [id])
  users_projects_tasks_assignments_created_byTousers users          @relation("projects_tasks_assignments_created_byTousers", fields: [created_by], references: [id])
  users_projects_tasks_assignments_deleted_byTousers users?         @relation("projects_tasks_assignments_deleted_byTousers", fields: [deleted_by], references: [id])
  users_projects_tasks_assignments_member_idTousers  users          @relation("projects_tasks_assignments_member_idTousers", fields: [member_id], references: [id])
  projects_tasks                                     projects_tasks @relation(fields: [task_id], references: [id])
  users_projects_tasks_assignments_updated_byTousers users?         @relation("projects_tasks_assignments_updated_byTousers", fields: [updated_by], references: [id])

  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([member_id])
  @@index([task_id])
  @@index([updated_by])
}
```

## MODEL: projects_time_entries

```prisma
model projects_time_entries {
  id                                            Int             @id @default(autoincrement())
  project_id                                    Int
  task_id                                       Int?
  hours                                         Decimal         @db.Decimal(24, 6)
  date                                          DateTime
  description                                   String?
  company_id                                    Int
  created_at                                    DateTime        @default(now())
  created_by                                    Int
  deleted_at                                    DateTime?
  deleted_by                                    Int?
  is_deleted                                    Boolean         @default(false)
  is_updated                                    Boolean         @default(false)
  member_id                                     Int
  updated_at                                    DateTime?
  updated_by                                    Int?
  companies                                     companies       @relation(fields: [company_id], references: [id])
  users_projects_time_entries_created_byTousers users           @relation("projects_time_entries_created_byTousers", fields: [created_by], references: [id])
  users_projects_time_entries_deleted_byTousers users?          @relation("projects_time_entries_deleted_byTousers", fields: [deleted_by], references: [id])
  users_projects_time_entries_member_idTousers  users           @relation("projects_time_entries_member_idTousers", fields: [member_id], references: [id])
  projects_tasks                                projects_tasks? @relation(fields: [task_id], references: [id])
  users_projects_time_entries_updated_byTousers users?          @relation("projects_time_entries_updated_byTousers", fields: [updated_by], references: [id])

  @@index([company_id])
  @@index([created_by])
  @@index([deleted_by])
  @@index([is_deleted, deleted_at])
  @@index([member_id])
  @@index([project_id])
  @@index([task_id])
  @@index([updated_by])
}
```

## MODEL: live_chat_messages

```prisma
model live_chat_messages {
  id         Int      @id @default(autoincrement())
  session_id Int
  sender_id  Int
  content    String
  created_at DateTime @default(now())
  is_deleted Boolean  @default(false)


  @@index([session_id])
}
```

## MODEL: academic_schools

```prisma
model academic_schools {
  id          Int      @id @default(autoincrement())
  company_id  Int
  name        String
  code        String?
  address     String?
  phone       String?
  email       String?
  created_at  DateTime @default(now())
  created_by  Int
  is_deleted  Boolean  @default(false)
  deleted_at  DateTime?

  @@index([company_id])
  @@index([is_deleted])
}
```

## MODEL: academic_years

```prisma
model academic_years {
  id          Int      @id @default(autoincrement())
  company_id  Int
  label       String
  start_date  DateTime
  end_date    DateTime
  is_current  Boolean  @default(false)
  created_at  DateTime @default(now())

  @@index([company_id])
  @@index([is_current])
}
```

## MODEL: academic_classes

```prisma
model academic_classes {
  id               Int      @id @default(autoincrement())
  company_id       Int
  academic_year_id Int
  name             String
  level_id         Int?
  main_teacher_id  Int?
  max_students     Int      @default(30)
  created_at       DateTime @default(now())

  @@index([company_id])
  @@index([academic_year_id])
}
```

## MODEL: academic_students

```prisma
model academic_students {
  id                  Int      @id @default(autoincrement())
  company_id          Int
  user_id             Int
  registration_number String   @unique
  class_id            Int?
  parent_name         String?
  parent_phone        String?
  parent_email        String?
  created_at          DateTime @default(now())

  @@index([company_id])
  @@index([class_id])
}
```

## MODEL: academic_grades

```prisma
model academic_grades {
  id          Int      @id @default(autoincrement())
  company_id  Int
  student_id  Int
  subject_id  Int
  term        Int
  grade_value Float
  coefficient Float    @default(1.0)
  created_at  DateTime @default(now())

  @@index([company_id])
  @@index([student_id])
  @@index([subject_id])
}
```

## MODEL: lims_chantiers

```prisma
model lims_chantiers {
  id          Int      @id @default(autoincrement())
  company_id  Int
  client_id   Int
  name        String
  location    String?
  code_site   String?
  created_at  DateTime @default(now())

  @@index([company_id])
  @@index([client_id])
}
```

## MODEL: lims_essais

```prisma
model lims_essais {
  id            Int      @id @default(autoincrement())
  company_id    Int
  chantier_id   Int
  test_type     String
  sample_ref    String
  measured_fc28 Float?
  measured_pi   Float?
  is_frozen     Boolean  @default(false)
  frozen_at     DateTime?
  created_at    DateTime @default(now())

  @@index([company_id])
  @@index([chantier_id])
}
```

## MODEL: meetings_sessions

```prisma
model meetings_sessions {
  id           Int      @id @default(autoincrement())
  company_id   Int
  title        String
  meeting_date DateTime
  quorum_pct   Float    @default(50.0)
  is_active    Boolean  @default(true)
  livekit_room String?
  created_at   DateTime @default(now())

  @@index([company_id])
  @@index([is_active])
}
```

## MODEL: meetings_votes

```prisma
model meetings_votes {
  id            Int      @id @default(autoincrement())
  session_id    Int
  user_id       Int
  resolution_id Int
  vote_choice   String
  voting_weight Float    @default(1.0)
  created_at    DateTime @default(now())

  @@index([session_id])
  @@index([user_id])
}
```

## MODEL: syndic_immeubles

```prisma
model syndic_immeubles {
  id              Int      @id @default(autoincrement())
  company_id      Int
  name            String
  address         String
  total_tantiemes Int      @default(1000)
  created_at      DateTime @default(now())

  @@index([company_id])
}
```

## MODEL: syndic_coproprietaires

```prisma
model syndic_coproprietaires {
  id          Int      @id @default(autoincrement())
  company_id  Int
  immeuble_id Int
  user_id     Int
  tantiemes   Int
  lot_number  String
  created_at  DateTime @default(now())

  @@index([company_id])
  @@index([immeuble_id])
}
```

## MODEL: syndic_depenses

```prisma
model syndic_depenses {
  id              Int       @id @default(autoincrement())
  company_id      Int
  immeuble_id     Int
  type_depense    syndic_type_depense
  libelle         String    @db.VarChar(200)
  montant         Int
  date_depense    DateTime  @db.Date
  fournisseur     String?   @db.VarChar(200)
  facture_ref     String?   @db.VarChar(100)
  exercice        String?   @db.VarChar(10)
  notes           String?
  created_by      Int
  created_at      DateTime  @default(now())
  updated_by      Int?
  updated_at      DateTime?
  is_deleted      Boolean   @default(false)
  deleted_by      Int?
  deleted_at      DateTime?

  @@index([company_id])
  @@index([immeuble_id])
  @@index([company_id, date_depense])
}
```

## MODEL: syndic_reglements

```prisma
model syndic_reglements {
  id                  Int       @id @default(autoincrement())
  company_id          Int
  coproprietaire_id   Int
  immeuble_id         Int
  montant             Int
  type_reglement      syndic_type_reglement
  date_reglement      DateTime  @db.Date
  reference           String?   @db.VarChar(100)
  appel_fonds_id      Int?
  exercice            String?   @db.VarChar(10)
  notes               String?
  created_by          Int
  created_at          DateTime  @default(now())
  updated_by          Int?
  updated_at          DateTime?
  is_deleted          Boolean   @default(false)
  deleted_by          Int?
  deleted_at          DateTime?

  @@index([company_id])
  @@index([coproprietaire_id])
  @@index([immeuble_id])
}
```

## MODEL: syndic_appels_fonds

```prisma
model syndic_appels_fonds {
  id              Int       @id @default(autoincrement())
  company_id      Int
  immeuble_id     Int
  libelle         String    @db.VarChar(200)
  montant_total   Int
  trimestre       Int
  annee           Int
  date_emission   DateTime  @db.Date
  date_echeance   DateTime  @db.Date
  exercice        String?   @db.VarChar(10)
  notes           String?
  created_by      Int
  created_at      DateTime  @default(now())
  updated_by      Int?
  updated_at      DateTime?
  is_deleted      Boolean   @default(false)
  deleted_by      Int?
  deleted_at      DateTime?

  @@index([company_id])
  @@index([immeuble_id])
  @@index([company_id, annee, trimestre])
}
```

## MODEL: syndic_compteurs

```prisma
model syndic_compteurs {
  id              Int       @id @default(autoincrement())
  company_id      Int
  immeuble_id     Int
  type_compteur   String    @db.VarChar(50)
  numero          String    @db.VarChar(100)
  emplacement     String?   @db.VarChar(200)
  coproprietaire_id Int?
  actif           Boolean   @default(true)
  created_by      Int
  created_at      DateTime  @default(now())
  updated_by      Int?
  updated_at      DateTime?
  is_deleted      Boolean   @default(false)
  deleted_by      Int?
  deleted_at      DateTime?

  @@index([company_id])
  @@index([immeuble_id])
}
```

## MODEL: syndic_compteurs_releves

```prisma
model syndic_compteurs_releves {
  id              Int       @id @default(autoincrement())
  company_id      Int
  compteur_id     Int
  date_releve     DateTime  @db.Date
  valeur          Decimal   @db.Decimal(18,3)
  delta           Decimal?  @db.Decimal(18,3)
  cout_unitaire   Decimal?  @db.Decimal(18,6)
  montant         Int?
  notes           String?
  created_by      Int
  created_at      DateTime  @default(now())

  @@index([company_id])
  @@index([compteur_id, date_releve])
}
```

## MODEL: syndic_maintenances

```prisma
model syndic_maintenances {
  id               Int       @id @default(autoincrement())
  company_id       Int
  immeuble_id      Int
  type_maintenance syndic_type_maintenance
  titre            String    @db.VarChar(200)
  description      String?
  date_planifiee   DateTime? @db.Date
  date_realisation DateTime? @db.Date
  cout_prevu       Int?
  cout_reel        Int?
  fournisseur      String?   @db.VarChar(200)
  statut           String    @default("PLANIFIE") @db.VarChar(30)
  created_by       Int
  created_at       DateTime  @default(now())
  updated_by       Int?
  updated_at       DateTime?
  is_deleted       Boolean   @default(false)
  deleted_by       Int?
  deleted_at       DateTime?

  @@index([company_id])
  @@index([immeuble_id])
}
```

## MODEL: syndic_reclamations

```prisma
model syndic_reclamations {
  id                  Int       @id @default(autoincrement())
  company_id          Int
  immeuble_id         Int
  coproprietaire_id   Int?
  titre               String    @db.VarChar(200)
  description         String?
  date_reclamation    DateTime  @db.Date
  statut              syndic_reclamation_status @default(OUVERTE)
  priorite            String    @default("NORMALE") @db.VarChar(20)
  date_resolution     DateTime? @db.Date
  resolution_notes    String?
  created_by          Int
  created_at          DateTime  @default(now())
  updated_by          Int?
  updated_at          DateTime?
  is_deleted          Boolean   @default(false)
  deleted_by          Int?
  deleted_at          DateTime?

  @@index([company_id])
  @@index([immeuble_id])
  @@index([company_id, statut])
}
```

## MODEL: academic_subjects

```prisma
model academic_subjects {
  id              Int       @id @default(autoincrement())
  company_id      Int
  code            String    @db.VarChar(50)
  libelle         String    @db.VarChar(150)
  coefficient     Decimal   @default(1) @db.Decimal(5,2)
  cycle_type      academic_cycles_type?
  heures_semaine  Decimal?  @db.Decimal(5,2)
  actif           Boolean   @default(true)
  created_by      Int
  created_at      DateTime  @default(now())
  updated_by      Int?
  updated_at      DateTime?
  is_deleted      Boolean   @default(false)
  deleted_by      Int?
  deleted_at      DateTime?

  @@unique([company_id, code])
  @@index([company_id])
}
```

## MODEL: academic_teachers

```prisma
model academic_teachers {
  id              Int       @id @default(autoincrement())
  company_id      Int
  employe_id      Int?
  matricule       String?   @db.VarChar(50)
  nom             String    @db.VarChar(100)
  prenom          String    @db.VarChar(100)
  email           String?   @db.VarChar(255)
  telephone       String?   @db.VarChar(50)
  specialisation  String?   @db.VarChar(200)
  actif           Boolean   @default(true)
  created_by      Int
  created_at      DateTime  @default(now())
  updated_by      Int?
  updated_at      DateTime?
  is_deleted      Boolean   @default(false)
  deleted_by      Int?
  deleted_at      DateTime?

  @@index([company_id])
}
```

## MODEL: academic_enrollments

```prisma
model academic_enrollments {
  id              Int       @id @default(autoincrement())
  company_id      Int
  student_id      Int
  class_id        Int
  year_id         Int
  statut          academic_enrollment_status @default(ACTIVE)
  date_inscription DateTime @db.Date
  notes           String?
  created_by      Int
  created_at      DateTime  @default(now())
  updated_by      Int?
  updated_at      DateTime?
  is_deleted      Boolean   @default(false)
  deleted_by      Int?
  deleted_at      DateTime?

  @@unique([student_id, year_id])
  @@index([company_id])
  @@index([class_id])
  @@index([year_id])
}
```

## MODEL: academic_timetables

```prisma
model academic_timetables {
  id              Int       @id @default(autoincrement())
  company_id      Int
  class_id        Int
  subject_id      Int
  teacher_id      Int
  year_id         Int
  jour_semaine    Int
  heure_debut     String    @db.VarChar(10)
  heure_fin       String    @db.VarChar(10)
  salle           String?   @db.VarChar(50)
  created_by      Int
  created_at      DateTime  @default(now())
  updated_by      Int?
  updated_at      DateTime?
  is_deleted      Boolean   @default(false)
  deleted_by      Int?
  deleted_at      DateTime?

  @@index([company_id])
  @@index([class_id, year_id])
  @@index([teacher_id, year_id])
}
```

