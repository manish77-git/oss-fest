# CampusConnect Backend — Community Platform Foundation

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748.svg)](https://www.prisma.io/)

**CampusConnect** is an open-source, college-focused community and collaboration platform inspired by Discord. It empowers students to form college communities, discuss technical projects, coordinate open-source contributions, and interact with AI assistance.

This repository contains the core **REST API backend foundation**, implementing production-grade authentication, student profiles, community lifecycle management, channel hierarchies, threaded chat messaging, and server-side role-based access control (RBAC).

---

## Features

- 🔐 **Secure Authentication**: Student registration and login with salt-hashed passwords (`bcryptjs`) and signed JSON Web Tokens (`jsonwebtoken`).
- 🎓 **Student Profiles**: Public and private profile attributes (display name, avatar, bio, department, academic year, skills, and interests).
- 🏫 **Communities & Memberships**: Create, discover, join, and leave communities. Community creators are automatically granted the `OWNER` role. Duplicate memberships are prevented.
- 💬 **Channel Hierarchies**: Organize communities into purpose-built channels (`GENERAL`, `ANNOUNCEMENTS`, `PROJECT_DISCUSSION`) with unique naming constraints per community.
- 📨 **Channel Messaging**: Message creation, validation, cursor-based pagination, and server-enforced edit/delete permissions.
- 🛡️ **Server-Side Authorization (RBAC)**: Enforces three distinct roles (`OWNER`, `MODERATOR`, `MEMBER`). Non-members are strictly forbidden from viewing or sending channel messages.
- 📦 **Prisma ORM with Migrations**: Zero-config SQLite development database with automated migrations, and seamless PostgreSQL compatibility for production.
- 🧪 **Comprehensive Automated Tests**: End-to-end integration test suite using `vitest` and `supertest`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js (v20+ recommended) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Framework** | Express 4 |
| **Database & ORM** | Prisma ORM with SQLite (Local dev) / PostgreSQL (Production) |
| **Security** | Helmet, CORS, Bcrypt.js, JSON Web Tokens (JWT) |
| **Validation** | Zod v3 |
| **Testing** | Vitest, Supertest |

---

## Project Structure

```text
├── LICENSE                 # MIT Open Source License
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript strict compiler configuration
├── vitest.config.ts        # Vitest test runner configuration
├── .env.example            # Environment variables template
├── prisma/
│   ├── schema.prisma       # Database schema (User, Community, Member, Channel, Message)
│   └── migrations/         # Reproducible SQL migration history
├── src/
│   ├── app.ts              # Express application factory & middleware setup
│   ├── server.ts           # Server bootstrap and graceful shutdown handler
│   ├── config.ts           # Environment variables configuration loader
│   ├── db.ts               # PrismaClient singleton instance
│   ├── types/              # Shared TypeScript interfaces and types
│   ├── schemas/            # Zod validation schemas
│   ├── middleware/
│   │   ├── auth.ts         # JWT authentication & extraction middleware
│   │   ├── permissions.ts  # Community membership & role check middleware
│   │   └── error.ts        # Structured JSON error handler & custom AppErrors
│   └── routes/
│       ├── health.routes.ts       # Service health check endpoint
│       ├── auth.routes.ts         # Student register & login endpoints
│       ├── users.routes.ts        # Profile retrieval & update endpoints
│       ├── communities.routes.ts  # Community, membership, and channel endpoints
│       ├── channels.routes.ts     # Channel message feed & creation endpoints
│       └── messages.routes.ts     # Message editing & moderation deletion endpoints
└── tests/
    ├── helpers.ts          # Test fixtures and database reset utilities
    ├── auth.test.ts        # Registration & login tests
    ├── users.test.ts       # Profile & permission tests
    ├── communities.test.ts # Community lifecycle & membership tests
    ├── channels.test.ts    # Channel creation & unique constraint tests
    └── messages.test.ts    # Messaging & moderation tests
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or higher)
- [npm](https://www.npmjs.com/) (version 9 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/manish77-git/oss-fest.git
   cd oss-fest
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

   | Variable | Description | Default |
   |---|---|---|
   | `PORT` | Port the HTTP server will bind to | `4000` |
   | `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
   | `DATABASE_URL` | SQLite file path or PostgreSQL connection URL | `"file:./dev.db"` |
   | `JWT_SECRET` | Secret key used to sign and verify JWT tokens | *(Required)* |
   | `JWT_EXPIRES_IN` | Token expiration duration (e.g. `7d`, `24h`) | `7d` |
   | `ALLOWED_EMAIL_DOMAINS`| Comma-separated list of approved college domains (e.g. `university.edu,mit.edu`). Leave empty to permit all valid emails during development. | `""` |
   | `CORS_ORIGIN` | Allowed CORS origins (`*` or comma-separated URLs) | `*` |

   > **Note on Email Domain Validation**: While `ALLOWED_EMAIL_DOMAINS` allows restricting registrations to institutional email domains, domain validation alone does not prove active enrollment. Email verification links can be layered on in production.

4. **Initialize Database & Run Migrations**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:4000`.

---

## API Documentation

All request bodies must have `Content-Type: application/json`.
Protected endpoints require the `Authorization: Bearer <TOKEN>` header.

### 1. System Health & Probes
- **`GET /api/health`**
  - **Auth**: Public
  - **Description**: Liveness check: verifies the backend application process is operational.
  - **Response** `200 OK`:
    ```json
    {
      "status": "ok",
      "service": "campusconnect-backend",
      "timestamp": "2026-10-17T07:24:32.452Z",
      "version": "1.0.0"
    }
    ```

- **`GET /api/health/ready`**
  - **Auth**: Public
  - **Description**: Readiness check: executes a live database query (`SELECT 1`) to verify real database connectivity.
  - **Response** `200 OK` (when database is connected):
    ```json
    {
      "status": "ready",
      "database": "connected"
    }
    ```
  - **Response** `503 Service Unavailable` (when database is unreachable):
    ```json
    {
      "status": "not_ready",
      "database": "disconnected"
    }
    ```

---

### 2. Authentication
- **`POST /api/auth/register`**
  - **Auth**: Public
  - **Body**:
    ```json
    {
      "email": "student@college.edu",
      "password": "securePassword123",
      "displayName": "Alex Chen",
      "department": "Computer Science",
      "academicYear": "Junior",
      "skills": ["TypeScript", "React"],
      "interests": ["Open Source", "Distributed Systems"]
    }
  - **Response** `201 Created`:
    ```json
    {
      "message": "Registration successful",
      "user": {
        "id": "cmvc...",
        "displayName": "Alex Chen",
        "email": "student@college.edu",
        "createdAt": "2026-10-17T07:00:00.000Z"
      }
    }
    ```
    *(Note: Passwords, password hashes, and tokens are strictly excluded from the registration response)*

- **`POST /api/auth/login`**
  - **Auth**: Public
  - **Body**:
    ```json
    {
      "email": "student@college.edu",
      "password": "securePassword123"
    }
    ```
  - **Response** `200 OK`: Returns JWT `token` and sanitized `user` object.

---

### 3. Student Profiles
- **`GET /api/users/me`**
  - **Auth**: Required
  - **Response** `200 OK`: Returns the authenticated student's full profile and their community memberships.

- **`PATCH /api/users/me`**
  - **Auth**: Required
  - **Body**: Permitted fields: `displayName`, `avatarUrl`, `bio`, `department`, `academicYear`, `skills`, `interests`.
  - **Response** `200 OK`: Returns updated sanitized student profile.

- **`GET /api/users/:id`**
  - **Auth**: Public
  - **Response** `200 OK`: Returns public profile information. Password hashes and credentials are never exposed.

---

### 4. Communities
- **`POST /api/communities`**
  - **Auth**: Required
  - **Body**:
    ```json
    {
      "name": "Open Source Club",
      "description": "Student-led OSS collaboration and contribution hub"
    }
    ```
  - **Response** `201 Created`: Returns created community. The creator is automatically assigned the `OWNER` role, and a default `#general` text channel is created.

- **`GET /api/communities`**
  - **Auth**: Optional (enriches output with `isMember` and `myRole` if token is provided)
  - **Response** `200 OK`: Lists all communities with member counts and channel counts.

- **`GET /api/communities/:id`**
  - **Auth**: Optional
  - **Response** `200 OK`: Retrieves detailed community metadata, channel list, and member count.

- **`POST /api/communities/:id/join`**
  - **Auth**: Required
  - **Response** `200 OK`: Joins community as a `MEMBER`. Returns `409 Conflict` if already a member.

- **`POST /api/communities/:id/leave`**
  - **Auth**: Required
  - **Response** `200 OK`: Leaves the community. Sole owners cannot leave without transferring ownership or deleting the community.

- **`GET /api/communities/:id/members`**
  - **Auth**: Required (Community Member)
  - **Response** `200 OK`: Lists all members with their roles and join dates.

- **`PATCH /api/communities/:id/members/:userId`**
  - **Auth**: Required (`OWNER` role only)
  - **Body**: `{ "role": "MODERATOR" }` or `{ "role": "MEMBER" }`
  - **Response** `200 OK`: Updates target member's role.

---

### 5. Channels
- **`POST /api/communities/:id/channels`**
  - **Auth**: Required (`OWNER` or `MODERATOR` role in the community)
  - **Body**:
    ```json
    {
      "name": "project-showcase",
      "description": "Share and review campus open-source projects",
      "type": "PROJECT_DISCUSSION"
    }
    ```
  - **Types supported**: `GENERAL`, `ANNOUNCEMENTS`, `PROJECT_DISCUSSION`
  - **Response** `201 Created`: Returns the created channel. Enforces unique channel names per community.

- **`GET /api/communities/:id/channels`**
  - **Auth**: Required (Community Member)
  - **Response** `200 OK`: Lists all text channels in the community.

---

### 6. Messages
- **`GET /api/channels/:id/messages`**
  - **Auth**: Required (Community Member)
  - **Query Parameters**:
    - `limit`: Number of messages (1–100, default 50)
    - `before`: Cursor message ID to fetch messages sent prior to that point in time
  - **Response** `200 OK`: Returns chronological messages list and pagination cursor.

- **`POST /api/channels/:id/messages`**
  - **Auth**: Required (Community Member)
  - **Body**:
    ```json
    {
      "content": "Hey everyone! Does anyone want to collaborate on the CampusConnect hackathon project?"
    }
    ```
  - **Response** `201 Created`: Returns saved message with author details. Empty or >4000 character messages are rejected.

- **`PATCH /api/messages/:id`**
  - **Auth**: Required (Original Message Author only)
  - **Body**: `{ "content": "Updated message content" }`
  - **Response** `200 OK`: Updates message and sets `updatedAt`. Non-authors receive `403 Forbidden`.

- **`DELETE /api/messages/:id`**
  - **Auth**: Required (Author OR Community `OWNER`/`MODERATOR`)
  - **Response** `200 OK`: Deletes message from database. Unauthorized users receive `403 Forbidden`.

---

## Production PostgreSQL Deployment

To deploy with PostgreSQL (e.g. AWS RDS, Supabase, Neon, or Railway):

1. In `prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set your PostgreSQL connection string in `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@db-host:5432/campusconnect?schema=public"
   ```
3. Run migrations on the production database:
   ```bash
   npx prisma migrate deploy
   ```
4. Build and run:
   ```bash
   npm run build
   npm start
   ```

---

## Testing & Quality Assurance

Verify real database persistence (write, read, verified cleanup):
```bash
npm run db:verify
```

Run the automated test suite:
```bash
npm test
```

Run TypeScript strict type checking:
```bash
npm run typecheck
```

Build the production bundle:
```bash
npm run build
```

---

## Roadmap & Modular Architecture

CampusConnect is architected to support future modular stages without breaking existing data models or authentication:
- **Open-Source Project Directory**: Link GitHub repositories, projects, and contribution tasks to community channels.
- **AI-Assisted Issue Triaging**: Automated explanations for beginner-friendly `good-first-issue` tags.
- **Feature Proposals & Voting**: Upvote system for campus-wide initiatives and hackathon project ideas.

---

## License

This project is licensed under the [MIT License](LICENSE).
