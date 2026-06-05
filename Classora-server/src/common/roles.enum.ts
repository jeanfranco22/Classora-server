export enum Role {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',

  // Backward-compatible aliases while the PowerGym domain is migrated.
  Student = STUDENT,
  Teacher = TEACHER,
  Admin = ADMIN,
}

export const ROLE_VALUES = [Role.STUDENT, Role.TEACHER, Role.ADMIN] as const;
