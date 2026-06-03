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

## Phase 2 implementation summary

This phase exposes a minimal education-domain API for the Classora frontend while preserving the current database model and existing PowerGym-compatible routes.

## Changes applied in Phase 2

- Confirmed work continues on `refactor/classora-backend-phase-2`.
- Added `POST /auth/register` as an alias of the existing student signup flow.
- Added `StudentsController` under `/students`, backed by `UsersService`, because `User` still represents the generic account entity.
- Added `ClassesController` under `/classes` as an education-domain alias for the existing `/clases` routes.
- Added `ClassSchedulesController` under `/class-schedules` as an education-domain alias for the existing `/class_schedule` routes.
- Added `ReservationsController` under `/reservations` as an education-domain alias for the existing `/reservation` routes.
- Added frontend-friendly authenticated routes:
  - `GET /students/me`
  - `PATCH /students/me/complete-profile`
  - `GET /reservations/me`
- Kept legacy routes active to avoid breaking existing consumers.
- Updated class schedule DTO/response naming to expose `teacherId` and `teacher` while keeping `id_coach`/`coach` compatibility fields.
- Fixed class schedule teacher assignment to use the JWT `sub` value instead of a non-existent `user.id`.
- Updated user-facing class schedule messages from coach wording to teacher/professor wording where it does not affect the database schema.

## Minimal API available after Phase 2

### Auth

- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/register`
- `GET /auth/me`
- `GET /auth/google`
- `GET /auth/google/callback`

### Students

- `GET /students`
- `GET /students/me`
- `GET /students/email`
- `GET /students/:id`
- `PUT /students/:id`
- `PATCH /students/me/complete-profile`
- `PUT /students/:id/inactive`
- `PUT /students/:id/active`

### Teachers

- `GET /teachers`
- `GET /teachers/nameAndImg`
- `GET /teachers/email`
- `GET /teachers/:id`
- `PUT /teachers/update/:id`
- `PUT /teachers/promote/:id`
- `PUT /teachers/demote/:id`
- `PUT /teachers/inactive/:id`

### Classes

- `GET /classes`
- `GET /classes/all`
- `POST /classes`
- `PUT /classes/:id`
- `PATCH /classes/:id/inactive`
- `PATCH /classes/:id/active`
- `POST /classes/:id/image`

### Class schedules

- `GET /class-schedules`
- `POST /class-schedules?classId=:classId`
- `PUT /class-schedules/:id/cancel`

### Reservations

- `POST /reservations?classScheduleId=:classScheduleId`
- `PUT /reservations/:id/cancel`
- `GET /reservations`
- `GET /reservations/me`
- `GET /reservations/teacher/:teacherId`
- `GET /reservations/student/:id`

## Parts that still remain from PowerGym after Phase 2

- Legacy public routes still exist: `/clases`, `/class_schedule`, and `/reservation`.
- The `User` entity and `users` table still represent students, teachers, and admins.
- The `class_schedule` relation and database join column still use `coach` and `coach_id`.
- Reservation internals still call `get_reservations_by_coach`.
- Chat internals still model `coach`, `coachId`, and coach message types.
- Memberships, tokens, token packages, and coach-chat subscription fields still reflect the original PowerGym model.

## Phase 2 build result

`npm run build` completed successfully.

## Recommended next phase

- Connect the frontend first to the Phase 2 routes: `/auth`, `/students/me`, `/teachers`, `/classes`, `/class-schedules`, and `/reservations/me`.
- Add smoke/e2e tests for the frontend contract before deeper renames.
- Then migrate chat and reservation/class schedule internals from coach naming to teacher naming with a real database migration for `coach_id`.
