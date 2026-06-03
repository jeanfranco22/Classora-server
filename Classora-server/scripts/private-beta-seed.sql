-- Private beta seed example for Classora.
-- Review table/column names against your current database before running.
-- Do not store real passwords here. Replace password hashes with hashes generated locally.

-- Suggested demo accounts:
-- teacher@example.com / generated local password hash
-- student@example.com / generated local password hash

-- 1) Create demo teacher and student in users.
-- INSERT INTO users (id, name, email, password, role, "isActive", "isProfileComplete", "tokenBalance", "authProvider")
-- VALUES
--   (gen_random_uuid(), 'Teacher Demo', 'teacher@example.com', '<bcrypt-hash>', 'TEACHER', true, true, 0, 'local'),
--   (gen_random_uuid(), 'Student Demo', 'student@example.com', '<bcrypt-hash>', 'STUDENT', true, true, 20, 'local');

-- 2) Create demo classes.
-- INSERT INTO class (id, name, duration, description, capacity, "isActive", intensity, benefits, requirements)
-- VALUES
--   (gen_random_uuid(), 'Español conversacional', '60', 'Práctica guiada de conversación.', 6, true, 'media', ARRAY['Conversación','Fluidez'], 'Nivel básico o superior'),
--   (gen_random_uuid(), 'Gramática aplicada', '45', 'Gramática en contexto real.', 6, true, 'media', ARRAY['Gramática','Práctica'], 'Cuaderno o notas');

-- 3) Create demo class schedules.
-- Replace teacher_id and class_id with ids from the inserted rows.
-- INSERT INTO class_schedule (id, date, time, token, "isActive", spaces_available, class_id, coach_id)
-- VALUES
--   (gen_random_uuid(), CURRENT_DATE + INTERVAL '1 day', '11:00', 1, true, 6, '<class-id>', '<teacher-id>'),
--   (gen_random_uuid(), CURRENT_DATE + INTERVAL '2 days', '14:00', 1, true, 6, '<class-id>', '<teacher-id>');

-- Token beta options:
-- A) Set BETA_ALLOW_RESERVATIONS_WITHOUT_TOKENS=true and do not require saldo.
-- B) Keep token logic active and update demo student token balance:
-- UPDATE users SET "tokenBalance" = 20 WHERE email = 'student@example.com';
