# 🎓 SkillBridge Backend API

**Connect with Expert Tutors, Learn Anything**

This is the backend server for the SkillBridge platform — a full-stack tutoring system that connects students with expert tutors.

Built with **Node.js, Express, TypeScript, Prisma, PostgreSQL, and Better Auth**.

---

# 👨‍💻 Author

**Md. Nazmul Hossen**

---

# 🌐 Live Links

[![Live Frontend](https://img.shields.io/badge/Live_Frontend-SkillBridge-blue?style=for-the-badge&logo=vercel)](https://skill-bridge-frontend-v3.vercel.app/)

[![Live Backend API](https://img.shields.io/badge/Live_API-SkillBridge_Server-blueviolet?style=for-the-badge&logo=vercel)](https://skill-bridge-v3.vercel.app/)

[![Frontend Repo](https://img.shields.io/badge/Frontend_Repo-GitHub-000?style=for-the-badge&logo=github)](https://github.com/nazmulxdev/Skill-Bridge-Frontend-)

[![Backend Repo](https://img.shields.io/badge/Backend_Repo-GitHub-333?style=for-the-badge&logo=github)](https://github.com/nazmulxdev/Skill-Bridge-server-)

--

# 📌 Project Overview

SkillBridge is a role-based tutoring platform where:

- 👨‍🎓 Students can browse tutors, book sessions, and leave reviews.
- 👨‍🏫 Tutors can create profiles, set availability, and manage bookings.
- 🛡️ Admins can manage users, categories, and monitor bookings.

This repository contains only the **Backend REST API Server**.

---

# 🛠️ Tech Stack

- Node.js
- Express v5
- TypeScript
- PostgreSQL
- Prisma ORM
- Better Auth
- Zod (Validation)
- CORS
- dotenv

---

# 📂 Project Structure

```
src/
 ├── modules/
 │    ├── admin/
 │    ├── student/
 │    ├── tutor/
 │    ├── public/
 │    ├── categories/
 │    └── subjects/
 │
 ├── middlewares/
 │    └── authMiddleware.ts
 │
 ├── prisma/
 │
 └── server.ts
```

---

# 🔐 Authentication & Authorization

Authentication is handled using **Better Auth**.

Role-based access:

- STUDENT
- TUTOR
- ADMIN

Protected routes use:

```ts
authMiddleware("ROLE");
```

---

# 🌍 Environment Variables

Create a `.env` file in the root directory:

```
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

DATABASE_URL=your_postgresql_connection_string

PORT=5000

BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_secret_key

CALLBACK_URL=http://localhost:5000

NODE_ENV=development

```

---

# 🗄️ Database

Database: PostgreSQL  
ORM: Prisma

Main Tables:

- Users
- TutorProfiles
- Categories
- Subjects
- Bookings
- Reviews
- Availabilities
- TimeSlots

---

# 🚀 API Endpoints

## 🔓 Public Routes

| Method | Endpoint     | Description         |
| ------ | ------------ | ------------------- |
| GET    | `/`          | Get all tutors      |
| GET    | `/features`  | Get featured tutors |
| GET    | `/tutor/:id` | Get tutor details   |

---

## 👨‍🎓 Student Routes (Protected)

| Method | Endpoint                       | Description         |
| ------ | ------------------------------ | ------------------- |
| GET    | `/student/me`                  | Get student profile |
| POST   | `/student/bookings/:id`        | Create booking      |
| PATCH  | `/student/bookings/cancel/:id` | Cancel booking      |
| POST   | `/student/bookings/review/:id` | Create review       |

---

## 👨‍🏫 Tutor Routes (Protected)

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/tutor/me`                    | Get tutor profile    |
| POST   | `/tutor`                       | Create tutor profile |
| PATCH  | `/tutor/update/hourly_rate`    | Update hourly rate   |
| POST   | `/tutor/subjects`              | Add subject          |
| DELETE | `/tutor/subjects/:subjectId`   | Remove subject       |
| POST   | `/tutor/education`             | Add education        |
| PATCH  | `/tutor/education/:id`         | Update education     |
| DELETE | `/tutor/education/:id`         | Delete education     |
| POST   | `/tutor/availabilities`        | Add availability     |
| PATCH  | `/tutor/availabilities/:id`    | Update availability  |
| DELETE | `/tutor/availabilities/:id`    | Delete availability  |
| POST   | `/tutor/time-slot`             | Create time slot     |
| PATCH  | `/tutor/time-slot/:id`         | Update time slot     |
| DELETE | `/tutor/time-slot/:id`         | Delete time slot     |
| PATCH  | `/tutor/bookings/confirm/:id`  | Confirm booking      |
| PATCH  | `/tutor/bookings/cancel/:id`   | Cancel booking       |
| PATCH  | `/tutor/bookings/complete/:id` | Complete booking     |

---

## 🛡️ Admin Routes (Protected)

| Method | Endpoint                     | Description        |
| ------ | ---------------------------- | ------------------ |
| GET    | `/admin/users`               | Get all users      |
| GET    | `/admin/bookings`            | Get all bookings   |
| PATCH  | `/admin/users/:id`           | Update user status |
| PATCH  | `/admin/tutors/:id/featured` | Feature tutor      |

---

## 📚 Categories Routes

| Method | Endpoint          | Description             |
| ------ | ----------------- | ----------------------- |
| GET    | `/categories`     | Get all categories      |
| POST   | `/categories`     | Create category (Admin) |
| PATCH  | `/categories/:id` | Update category         |
| DELETE | `/categories/:id` | Delete category         |

---

## 📘 Subjects Routes

| Method | Endpoint        | Description      |
| ------ | --------------- | ---------------- |
| GET    | `/subjects`     | Get all subjects |
| POST   | `/subjects/:id` | Add subject      |
| PATCH  | `/subjects/:id` | Update subject   |
| DELETE | `/subjects/:id` | Delete subject   |

---

# 📊 Booking Status Flow

Booking status values:

- CONFIRMED (default after booking)
- COMPLETED (marked by tutor)
- CANCELLED (cancelled by student)

Flow:

1. Student creates booking → CONFIRMED
2. Tutor completes session → COMPLETED
3. Student cancels → CANCELLED

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```
git clone <your-repository-url>
cd level-2-a4-backend
```

## 2️⃣ Install Dependencies

```
npm install
```

## 3️⃣ Setup Environment Variables

Create `.env` file (see above).

## 4️⃣ Run Prisma Migration

```
npx prisma migrate dev
```

## 5️⃣ Start Development Server

```
npm run dev
```

Server will run at:

```
http://localhost:5000
```

---

# 🏗️ Build for Production

```
npm run build
```

---

# 🔒 Security Features

- Role-based authorization
- Protected routes
- Zod input validation
- Environment variable configuration
- Secure PostgreSQL connection

---

# 📄 License

ISC License
