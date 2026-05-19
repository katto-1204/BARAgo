# BaraGo

A full-stack barangay healthcare scheduling management system. Residents can register, book checkup appointments, request ambulance assistance, and receive notifications. Admins manage appointments, ambulance requests, health schedules, residents, and generate reports.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/barago run dev` — run the frontend (proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — express-session secret

## Seed Accounts (all use password: `admin123`)

| Email | Role | Notes |
|-------|------|-------|
| admin@barago.ph | admin | Full admin access |
| worker@barago.ph | health_worker | Can mark appointments complete |
| juan@barago.ph | resident | Pre-populated with sample appointments |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + TailwindCSS + shadcn/ui + Wouter + TanStack Query
- API: Express 5 + express-session
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Charts: Recharts (admin dashboard)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/barago/` — React+Vite frontend
  - `src/App.tsx` — router and route guards
  - `src/lib/auth.tsx` — AuthProvider, useAuth hook
  - `src/pages/resident/` — resident-facing pages
  - `src/pages/admin/` — admin pages
  - `src/pages/health-worker/` — health worker page
  - `src/components/layout/AppLayout.tsx` — sidebar layout (role-aware nav)
  - `src/components/shared/StatusBadges.tsx` — StatusBadge, UrgencyBadge
- `artifacts/api-server/` — Express 5 API
  - `src/routes/` — all route handlers
  - `src/middlewares/auth.ts` — requireAuth, requireAdmin, requireAdminOrHealthWorker
  - `src/app.ts` — express-session, cors setup, session type augmentation
- `lib/db/` — Drizzle ORM schema and client
  - `src/schema/` — users, residents, health_schedules, appointments, ambulance_requests, notifications, reports
- `lib/api-spec/` — OpenAPI spec source of truth
- `lib/api-client-react/` — generated React Query hooks (via Orval)
- `lib/api-zod/` — generated Zod schemas (via Orval)

## Architecture decisions

- Session-based auth (express-session, httpOnly cookie) rather than JWT — simpler for a barangay intranet context
- Contract-first API design: OpenAPI spec drives both backend Zod validation and frontend React Query hooks via Orval codegen
- Role-based access: resident, health_worker, admin — enforced in both middleware and frontend ProtectedRoute
- Frontend uses wouter (lightweight router) with role-aware redirects at `HomeRedirect`
- All passwords hashed with bcryptjs (cost 10)

## Product

- **Residents**: register with barangay info, book checkup appointments (pending admin approval), request ambulance assistance, receive notifications, view appointment history
- **Admins**: dashboard with charts, manage all appointments (approve/reject/reschedule/complete), manage ambulance requests (approve/dispatch/complete), manage health schedules, manage resident accounts (verify/disable), generate reports
- **Health Workers**: view approved appointments and mark them as completed with consultation remarks

## User preferences

- No emojis in the UI
- Brand colors: Primary Green #16A34A, Trust Blue #2563EB, Emergency Red #DC2626, Warning Yellow #F59E0B
- Philippine context: Tagalog terms for barangay locations (purok, etc.)

## Gotchas

- Always use `req.session.user = {...}` NOT `req.session = {...}` — replacing the session object loses the `touch()` method and crashes express-session
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before editing frontend or backend
- `pnpm --filter @workspace/db run push` must be run after schema changes (dev only, not production)
- The shared proxy routes `/api` to the API server and `/` to the frontend; never hard-code ports in app code

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
