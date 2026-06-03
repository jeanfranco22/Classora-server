# Classora Private Beta Checklist

## Backend setup

1. Configure local environment:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL=http://localhost:3000`
   - `BETA_ALLOW_RESERVATIONS_WITHOUT_TOKENS=true` for the first private beta if students should reserve without credits.
2. Run the backend on port `3030`.
3. Create or seed demo data for one teacher, one student, classes, and class schedules.
4. Confirm `npm run build` passes before sharing the beta.

## Frontend setup

1. Configure `.env.local`:
   - `NEXT_PUBLIC_API_URL=http://localhost:3030`
2. Run the frontend on port `3000`.
3. Confirm these screens load:
   - `/login`
   - `/lessons`
   - `/booking`
   - `/teacher`

## Teacher flow

1. Log in with the demo teacher account.
2. Open `/teacher`.
3. Confirm upcoming reservations show:
   - class
   - student
   - date/time
   - status
4. Check that empty state is understandable if no student has reserved yet.

## Student flow

1. Log in with the demo student account.
2. Open `/lessons` and confirm classes are visible.
3. Open `/booking`.
4. Select date, duration, and a real schedule.
5. Confirm reservation succeeds.
6. Confirm the reservation appears in `Mis reservaciones`.

## Expected errors during beta

- If `BETA_ALLOW_RESERVATIONS_WITHOUT_TOKENS=false`, students without active membership/tokens can receive a token error.
- If there are no schedules for the selected date/duration, the booking page shows an empty state.
- If the same student reserves the same class schedule twice, backend rejects the duplicate reservation.
- If a class has no capacity left, backend rejects the reservation.

## Feedback to collect

- Could the student find an available schedule without help?
- Did reservation confirmation feel clear?
- Did the teacher understand which student booked which class?
- Were date/time labels clear enough?
- Did any token/credit wording confuse beta users?
- What data does the teacher need before class starts?
