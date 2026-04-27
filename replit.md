# AI Cash Flow Platform

## Overview

A complete, premium online training platform ("AI CASH FLOW") for selling and delivering online courses, with a high-converting landing page, student dashboard, course player, file management, and admin panel.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (dark/gold theme)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: JWT (jsonwebtoken) + bcryptjs

## Key Features

1. **Landing Page** — High-converting sales page with hero, benefits, testimonials, pricing, FAQ, lead capture, WhatsApp button
2. **Auth System** — Email/password login + register, JWT tokens, AuthContext
3. **Student Dashboard** — Progress tracking, enrolled courses, completion stats
4. **Course System** — Modules → Lessons → Videos (YouTube/Vimeo embed support)
5. **File Management** — PDFs, guides, resources organized by module
6. **Admin Panel** — Manage courses, modules, lessons, files, users
7. **Payment-ready** — `hasPaid` flag on users for gating content

## Demo Credentials

- **Admin**: admin@aicashflow.com / Admin@123
- **Student**: student@demo.com / Demo@123

## Architecture

```
artifacts/
  ai-cash-flow/     # React + Vite frontend (port from $PORT env var, path: /)
  api-server/       # Express 5 API backend (path: /api)
lib/
  db/               # Drizzle ORM schema + PostgreSQL connection
  api-spec/         # OpenAPI spec + Orval codegen config
  api-client-react/ # Generated React Query hooks
  api-zod/          # Generated Zod schemas
```

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## API Routes

- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login user  
- `GET /api/auth/me` — Get current user (requires auth header)
- `GET /api/courses` — List courses
- `GET /api/courses/:id` — Course with modules/lessons
- `GET /api/courses/:courseId/modules` — List modules
- `GET /api/modules/:moduleId/lessons` — List lessons
- `GET /api/lessons/:id` — Get lesson
- `GET/POST /api/progress` — Track lesson progress
- `GET/POST /api/files` — List/create files
- `GET /api/users` — List users (admin only)
- `PUT /api/users/:id` — Update user role/hasPaid (admin only)
- `POST /api/leads` — Capture email lead
- `GET /api/dashboard/summary` — Student dashboard data
- `GET /api/dashboard/admin` — Admin stats

## Database Tables

- `users` — id, email, password_hash, name, role, has_paid, created_at
- `courses` — id, title, description, thumbnail, price, is_published, created_at
- `modules` — id, course_id, title, description, order, created_at
- `lessons` — id, module_id, title, description, video_url, video_type, duration, order, is_free, created_at
- `progress` — id, user_id, lesson_id, completed, completed_at
- `files` — id, module_id, name, description, file_url, file_type, file_size, created_at
- `leads` — id, email, name, phone, created_at

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
