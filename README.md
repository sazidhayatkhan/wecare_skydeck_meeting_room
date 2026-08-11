# RoomBook — Meeting Room Booking App

A simple meeting room booking app for a shared office with a single meeting room.

**Stack:** Next.js (App Router) + Tailwind CSS + shadcn/ui on the frontend,
NestJS + Prisma + PostgreSQL on the backend.

## Features

- Company accounts: sign up with company name, email, and a 4-digit PIN
- Log in to book a slot — the company name is taken from your account
- Big month calendar showing every booking (company name + from–to time), so everyone can see who has the room
- Conflicting bookings are rejected automatically
- View and cancel upcoming bookings from one place
- Toast notifications for success/error feedback

## Project structure

```
meeting-room-booking/
├── backend/    NestJS API + Prisma + PostgreSQL
└── frontend/   Next.js + Tailwind + shadcn/ui
```

## 1. Set up the database

You need a running PostgreSQL instance. Easiest option — Docker:

```bash
docker run --name roombook-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=meeting_rooms -p 5432:5432 -d postgres:16
```

## 2. Backend setup

```bash
cd backend
cp .env.example .env       # adjust DATABASE_URL if needed
npm install
npx prisma migrate dev --name init   # creates tables
npm run start:dev
```

Backend runs at `http://localhost:4000/api`.

## 3. Frontend setup

```bash
cd frontend
cp .env.local.example .env.local   # points to the backend API
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## API overview

| Method | Endpoint            | Description                                        |
|--------|---------------------|----------------------------------------------------|
| POST   | /api/auth/signup    | Create an account (company name, email, 4-digit PIN) |
| POST   | /api/auth/login     | Log in, returns a bearer token                     |
| POST   | /api/auth/logout    | Log out (requires auth)                            |
| GET    | /api/auth/me        | Current user (requires auth)                       |
| GET    | /api/bookings       | List all bookings (public)                         |
| GET    | /api/bookings?date= | Bookings for a given date (public)                 |
| POST   | /api/bookings       | Create a booking (requires auth, conflict-checked) |
| DELETE | /api/bookings/:id   | Cancel a booking (requires auth)                   |

## Notes

- Booking conflicts (overlapping time ranges) are rejected server-side with a clear error message.
- Past-dated bookings are rejected.
- The calendar and booking list are public; booking and cancelling require login.
# wecare_skydeck_meeting_room
