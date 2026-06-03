# Classora Backend Migration

## Phase 1 implementation summary

This phase applies a controlled first migration from the reused PowerGym backend toward the Classora domain. It does not rename database tables or remove modules.

## Changes applied

- Registered the existing backend modules in `AppModule`.
- Enabled local development CORS for:
  - `http://localhost:3000`
  - `http://localhost:3001`
- Changed the canonical roles to:
  - `Role.STUDENT`
  - `Role.TEACHER`
  - `Role.ADMIN`
- Kept compatibility aliases `Role.Student`, `Role.Teacher`, and `Role.Admin` during the gradual migration.
- Migrated the former coach module files/classes to teacher naming:
  - `TeacherController`
  - `TeacherService`
  - `TeacherModule`
  - `TeacherRepository`
  - `UpdateTeacherDto`
- Changed the public teacher route from `/coach` to `/teachers`.
- Updated internal imports from `src/coach/*` to `src/teacher/*`.
- Replaced direct `Role.User` and `Role.Coach` usage with `Role.STUDENT` and `Role.TEACHER`.
- Added a minimal `token-package` module because payments and transactions already depended on it.
- Rebranded basic notification and Cloudinary folder strings from PowerGym to Classora.
- Fixed a small reservation controller/repository issue for teacher reservations.
- Added missing npm dependencies required by the existing source code.

## Modules registered in AppModule

- `NotificationsModule`
- `UsersModule`
- `TeacherModule`
- `AuthModule`
- `FilesModule`
- `ClassModule`
- `ClassScheduleModule`
- `MembershipModule`
- `PaymentsModule`
- `ChatModule`
- `ReservationModule`
- `CronsModule`
- `ScheduleModule.forRoot()`

## Parts that still remain from PowerGym

- The main entity is still named `User`; it now defaults to `Role.STUDENT`, but it has not been renamed to `Student`.
- Several TypeORM relations and database columns still use `coach`, `coachId`, or `coach_id`.
- Chat entities still model conversations as `user` and `coach`.
- `MessageType.COACH` still exists.
- Memberships, tokens, and `includesCoachChat` remain conceptually close to the PowerGym business model.
- Class scheduling still uses class/coach naming internally in some DTOs and response shapes.
- Existing table names were preserved to avoid unsafe database changes.

## Pending Student, Teacher, Admin migration

- Decide whether `User` remains a generic account entity or gets split into `StudentProfile` and `TeacherProfile`.
- Migrate database columns from `coach_id`/`coachId` to `teacher_id`/`teacherId` using TypeORM migrations.
- Rename `Class` to `Lesson` or `Course` based on the final Classora product model.
- Rename `Reservation` to `Booking` or `Enrollment`.
- Rename tokens to credits if Classora will use a credit model.
- Rework membership/subscription rules for the education domain.
- Update chat DTOs, routes, entities, and message types from coach terminology to teacher terminology.
- Replace compatibility role aliases only after all code uses canonical roles.
- Disable `synchronize: true` and introduce real TypeORM migrations before production.

## Build result

`npm run build` completed successfully after this phase.

## Notes

- No commits were created.
- No `.env` files or credentials were changed.
- No modules were deleted.
- No database table names were changed.
