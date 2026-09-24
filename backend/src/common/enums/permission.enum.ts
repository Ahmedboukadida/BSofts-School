export enum Permission {
  // Users & Auth
  USERS_LIST = 'users:list',
  USERS_READ = 'users:read',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',

  // Roles & Permissions
  ROLES_LIST = 'roles:list',
  ROLES_READ = 'roles:read',
  ROLES_CREATE = 'roles:create',
  ROLES_UPDATE = 'roles:update',
  ROLES_DELETE = 'roles:delete',

  // Establishments
  ESTABLISHMENTS_LIST = 'establishments:list',
  ESTABLISHMENTS_READ = 'establishments:read',
  ESTABLISHMENTS_CREATE = 'establishments:create',
  ESTABLISHMENTS_UPDATE = 'establishments:update',
  ESTABLISHMENTS_DELETE = 'establishments:delete',

  // Academic Structure
  CLASSES_LIST = 'classes:list',
  CLASSES_READ = 'classes:read',
  CLASSES_CREATE = 'classes:create',
  CLASSES_UPDATE = 'classes:update',
  CLASSES_DELETE = 'classes:delete',

  CLASS_LEVELS_LIST = 'class-levels:list',
  CLASS_LEVELS_READ = 'class-levels:read',
  CLASS_LEVELS_CREATE = 'class-levels:create',
  CLASS_LEVELS_UPDATE = 'class-levels:update',
  CLASS_LEVELS_DELETE = 'class-levels:delete',

  ACADEMIC_MODULES_LIST = 'academic-modules:list',
  ACADEMIC_MODULES_READ = 'academic-modules:read',
  ACADEMIC_MODULES_CREATE = 'academic-modules:create',
  ACADEMIC_MODULES_UPDATE = 'academic-modules:update',
  ACADEMIC_MODULES_DELETE = 'academic-modules:delete',

  // People
  STUDENTS_LIST = 'students:list',
  STUDENTS_READ = 'students:read',
  STUDENTS_CREATE = 'students:create',
  STUDENTS_UPDATE = 'students:update',
  STUDENTS_DELETE = 'students:delete',

  TEACHERS_LIST = 'teachers:list',
  TEACHERS_READ = 'teachers:read',
  TEACHERS_CREATE = 'teachers:create',
  TEACHERS_UPDATE = 'teachers:update',
  TEACHERS_DELETE = 'teachers:delete',

  PARENTS_LIST = 'parents:list',
  PARENTS_READ = 'parents:read',
  PARENTS_CREATE = 'parents:create',
  PARENTS_UPDATE = 'parents:update',
  PARENTS_DELETE = 'parents:delete',

  // LMS & Evaluations
  EXAMS_LIST = 'exams:list',
  EXAMS_READ = 'exams:read',
  EXAMS_CREATE = 'exams:create',
  EXAMS_UPDATE = 'exams:update',
  EXAMS_DELETE = 'exams:delete',

  BULLETINS_LIST = 'bulletins:list',
  BULLETINS_READ = 'bulletins:read',
  BULLETINS_CREATE = 'bulletins:create',
  BULLETINS_UPDATE = 'bulletins:update',
  BULLETINS_DELETE = 'bulletins:delete',

  HOMEWORK_LIST = 'homework:list',
  HOMEWORK_READ = 'homework:read',
  HOMEWORK_CREATE = 'homework:create',
  HOMEWORK_UPDATE = 'homework:update',
  HOMEWORK_DELETE = 'homework:delete',

  ATTENDANCE_LIST = 'attendance:list',
  ATTENDANCE_READ = 'attendance:read',
  ATTENDANCE_CREATE = 'attendance:create',
  ATTENDANCE_UPDATE = 'attendance:update',
  ATTENDANCE_DELETE = 'attendance:delete',

  // Finance & Reporting
  FINANCE_LIST = 'finance:list',
  FINANCE_READ = 'finance:read',
  FINANCE_CREATE = 'finance:create',
  FINANCE_UPDATE = 'finance:update',
  FINANCE_DELETE = 'finance:delete',

  REPORTS_LIST = 'reports:list',
  REPORTS_VIEW = 'reports:view',
  REPORTS_CREATE = 'reports:create',
  REPORTS_UPDATE = 'reports:update',
  REPORTS_DELETE = 'reports:delete',
}

export type PermissionType = `${Permission}`;
