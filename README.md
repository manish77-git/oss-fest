# CampusConnect — Full-Stack College Community & Open-Source Collaboration

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16%20Turbopack-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/manish77-git/oss-fest/tree/main)

**CampusConnect** is an open-source, college-focused community and collaboration platform inspired by Discord. It empowers students to join campus communities, participate in channel-based discussions, coordinate open-source contributions, triage bug reports, and interact with the unified **CampusAI Copilot**.

This repository is organized as a full-stack project:
- **`frontend/`**: Interactive Discord-inspired web application built with **Next.js 16 (Turbopack)**, **React 19**, **Tailwind CSS v4**, and **Lucide Icons**, featuring CampusAI Copilot, structured contribution cards, and institutional login gating.
- **`src/`**: Production-grade **REST API backend**, implementing secure JWT authentication, student profiles, community lifecycle management, channel hierarchies, and role-based permissions (RBAC).

[![Deploy to DigitalOcean](https://img.shields.io/badge/DigitalOcean-App%20Platform%20Ready-blue?logo=digitalocean&logoColor=white)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/manish77-git/oss-fest/tree/main)

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

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 16 (App Router) |
| UI Library | React 19, React DOM |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Icons | Lucide React |
| CSS Utilities | clsx, tailwind-merge |
| Backend Runtime | Node.js |
| Backend Framework | Express.js 4 |
| API & Middleware | CORS, Helmet, dotenv |
| Authentication | JSON Web Tokens (JWT) |
| Password Security | bcryptjs |
| Validation | Zod |
| Database ORM | Prisma ORM 6 |
| Database (Development) | SQLite |
| Database (Production) | PostgreSQL |
| Testing | Vitest, Supertest |
| Build & Development | TypeScript, tsx, npm |
| Frontend Bundler | Turbopack |
| Version Control | Git & GitHub |
| License | MIT |

---

## 🌊 DigitalOcean Deployment

This repository is pre-configured with native **DigitalOcean App Platform** specification (`.do/app.yaml`) and **DigitalOcean Droplet (Docker)** support.

### Method 1: DigitalOcean App Platform (1-Click Automated Deployment)

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/manish77-git/oss-fest/tree/main)

1. Click **[Deploy to DigitalOcean](https://cloud.digitalocean.com/apps/new?repo=https://github.com/manish77-git/oss-fest/tree/main)**.
2. Sign in to your DigitalOcean account and authorize GitHub access if prompted.
3. DigitalOcean automatically reads `.do/app.yaml` and provisions:
   - **`frontend`**: Next.js 16 Web Application with Turbopack (Port 3000)
   - **`api`**: Express REST API & Prisma Engine (Port 4000)
4. Click **Next** &rarr; **Create Resources**. DigitalOcean will build both services and assign free SSL domains!

### Method 2: DigitalOcean Droplet (Docker Compose)

Deploy to any DigitalOcean Ubuntu/Debian Droplet with a single command:

```bash
# Clone the repository on your Droplet
git clone https://github.com/manish77-git/oss-fest.git
cd oss-fest

# Start backend & frontend containers in background
docker compose up -d --build
```

---

## Project Structure & Code Navigation

This monorepo contains both the **Next.js 16 Web Application** and the **Express REST API Backend**:

```text
├── frontend/                          # 🌐 NEXT.JS 16 FRONTEND (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Main Discord-inspired 4-pane application
│   │   │   ├── layout.tsx             # Root layout & font styles
│   │   │   └── globals.css            # Dark theme styles & Tailwind variables
│   │   ├── components/
│   │   │   ├── auth/LoginPage.tsx     # Student Login & Account Registration
│   │   │   ├── layout/ServerRail.tsx  # Community server rail
│   │   │   ├── layout/ChannelSidebar.tsx # Channel categories & navigation
│   │   │   ├── chat/ConversationPanel.tsx # Chat messages & conversation stream
│   │   │   ├── ai/AIAssistantDrawer.tsx # CampusAI Copilot assistant
│   │   │   ├── profile/StudentProfileModal.tsx # Profile customization & karma
│   │   │   └── contributions/         # Structured Good-First-Issue & Bug cards
│   │   ├── data/                      # Campus channels & mock community data
│   │   └── services/                  # CampusAI engine, API client & auth service
│   ├── package.json                   # Frontend dependencies
│   └── next.config.ts                 # Next.js Turbopack configuration
│
├── src/                               # ⚙️ EXPRESS REST API BACKEND (Port 4000)
│   ├── server.ts                      # Server bootstrap on port 4000
│   ├── app.ts                         # Express application & middleware
│   ├── routes/                        # REST API endpoints (auth, users, channels, etc.)
│   ├── middleware/                    # JWT auth, rate limiting & RBAC permissions
│   └── services/                      # Token generation & password hashing
│
├── prisma/
│   └── schema.prisma                  # SQLite / PostgreSQL database schema
├── tests/                             # Vitest end-to-end integration test suite
└── package.json                       # Root backend dependencies & project scripts
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or higher)
- [npm](https://www.npmjs.com/) (version 9 or higher)

### 1. Clone & Install
```bash
git clone https://github.com/manish77-git/oss-fest.git
cd oss-fest

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Run the Applications

#### Option A: Run Frontend (Next.js App on Port 3000)
```bash
cd frontend
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

#### Option B: Run Backend (Express REST API on Port 4000)
```bash
npm run prisma:generate
npm run dev
```
API runs at **[http://localhost:4000](http://localhost:4000)**.

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
  - **Auth**: Public (Rate-limited: 10 attempts / 15 minutes per IP)
  - **Body**:
    ```json
    {
      "email": "student@college.edu",
      "password": "securePassword123"
    }
    ```
  - **Response** `200 OK`:
    ```json
    {
      "message": "Login successful",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 1800,
      "user": {
        "id": "cmvc...",
        "displayName": "Alex Chen",
        "email": "student@college.edu"
      }
    }
    ```
  - **Security Features**:
    - Constant-time password verification via `bcryptjs`.
    - Generic `401 Unauthorized` response for both incorrect password and non-existent email to prevent user enumeration.
    - Signed short-lived JWT access token with standard `sub`, `iss` (`campusconnect`), and `aud` (`campusconnect-api`) claims.
    - Abuse protection: returns `429 Too Many Requests` with a `Retry-After` header when rate limits are exceeded.
    - Stateless token lifecycle: tokens expire automatically after `expiresIn` seconds (1800s / 30m); clients log out by discarding the stored token.

- **`GET /api/auth/session`**
  - **Auth**: Required (`Authorization: Bearer <TOKEN>`)
  - **Description**: Protected test endpoint verifying authentication middleware and identifying the active student.
  - **Response** `200 OK`:
    ```json
    {
      "status": "authenticated",
      "user": {
        "id": "cmvc3...",
        "email": "student@college.edu"
      }
    }
    ```
  - **Error Response** `401 Unauthorized`: Returned when Authorization header is missing, malformed, expired, invalid, or belongs to a deleted account.

---

### 3. Student Profiles (Feature 06)
- **`GET /api/users/me`**
  - **Auth**: Required (`Authorization: Bearer <TOKEN>`)
  - **Description**: Retrieves the authenticated student's private profile. The identity is extracted directly from the verified JWT token; any client-supplied user ID in query parameters or body is ignored.
  - **Response** `200 OK`:
    ```json
    {
      "user": {
        "id": "cmvc3...",
        "email": "student@college.edu",
        "displayName": "Alex Chen",
        "avatarUrl": "https://cdn.example.com/avatar.png",
        "bio": "CS junior interested in open source and distributed systems.",
        "department": "Computer Science",
        "academicYear": "Junior",
        "skills": ["TypeScript", "Python", "Rust"],
        "interests": ["Open source", "Distributed systems"],
        "createdAt": "2026-10-17T06:00:00.000Z",
        "updatedAt": "2026-10-17T06:30:00.000Z",
        "memberships": []
      }
    }
    ```
  - **Security & Privacy**:
    - Password hashes, salt rounds, and internal tokens are never returned.
    - Safely returns `401 Unauthorized` or `404 Not Found` if the user account was deleted or is unavailable.

- **`PATCH /api/users/me`**
  - **Auth**: Required (`Authorization: Bearer <TOKEN>`)
  - **Description**: Allows students to update permitted profile fields for their own account only.
  - **Editable Fields**:
    - `displayName` (string, 1–60 chars, trimmed)
    - `avatarUrl` (valid HTTP/HTTPS URL, or null/empty string to clear)
    - `bio` (string, max 300 chars, nullable)
    - `department` (string, max 100 chars, nullable)
    - `academicYear` (string up to 20 chars, or integer 1–10, nullable)
    - `skills` (array of trimmed strings, max 30 items, max 50 chars per item, nullable)
    - `interests` (array of trimmed strings, max 30 items, max 50 chars per item, nullable)
  - **Request Body Example**:
    ```json
    {
      "bio": "Specializing in cloud systems and contributing to open-source.",
      "academicYear": 3,
      "skills": ["TypeScript", "Go", "Docker"]
    }
    ```
  - **Response** `200 OK`:
    ```json
    {
      "message": "Profile updated successfully",
      "user": {
        "id": "cmvc3...",
        "email": "student@college.edu",
        "displayName": "Alex Chen",
        "avatarUrl": "https://cdn.example.com/avatar.png",
        "bio": "Specializing in cloud systems and contributing to open-source.",
        "department": "Computer Science",
        "academicYear": "3",
        "skills": ["TypeScript", "Go", "Docker"],
        "interests": ["Open source"],
        "createdAt": "2026-10-17T06:00:00.000Z"
      }
    }
    ```
  - **Validation & Security**:
    - Empty payloads (`{}`) are rejected with `400 Bad Request`.
    - Partial updates are fully supported: omitted fields remain unchanged.
    - Protected fields (`id`, `email`, `passwordHash`, `role`, `createdAt`) are strictly rejected with `400 Bad Request`.
    - Cross-user tampering is impossible: updates always target `req.user.id` verified from the token.

- **`GET /api/users/:id`**
  - **Auth**: Public (No authentication required)
  - **Description**: Retrieves public profile information for any student.
  - **Public Fields**: `id`, `displayName`, `avatarUrl`, `bio`, `department`, `academicYear`, `skills` (string array), `interests` (string array), `createdAt`.
  - **Response** `200 OK`:
    ```json
    {
      "user": {
        "id": "cmvc3...",
        "displayName": "Alex Chen",
        "avatarUrl": "https://cdn.example.com/avatar.png",
        "bio": "Specializing in cloud systems and contributing to open-source.",
        "department": "Computer Science",
        "academicYear": "3",
        "skills": ["TypeScript", "Go", "Docker"],
        "interests": ["Open source"],
        "createdAt": "2026-10-17T06:00:00.000Z"
      }
    }
    ```
  - **Security & Privacy**:
    - Public profiles strictly omit `email`, `passwordHash`, credentials, and tokens.
    - Validates student ID format (alphanumeric, 1–64 characters); returns `400 Bad Request` for invalid formats.
    - Returns `404 Not Found` for nonexistent student IDs.
    - Strictly read-only: retrieval cannot mutate records.

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
