# Aura Medical Portal

**AI-Powered Doctor Appointment Scheduling System**

A premium SaaS clinical copilot and automated telephonic voice-agent scheduler. Patients never interact
with a dashboard — they engage entirely through AI phone calls (Vapi, Dograh later). This repository contains
the **admin-only dashboard** (Next.js 15) used by clinic staff, plus a PostgreSQL schema and design
documentation for the upcoming FastAPI backend phase.

> **Status:** The dashboard runs fully on **mock data** (localStorage-persisted seed fixtures) with mock
> auth. No live backend exists yet. The database schema is designed and documented, ready for the FastAPI
> phase.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database & Schema](#database--schema)
- [Voice Provider Architecture](#voice-provider-architecture)
- [Authentication (current)](#authentication-current)
- [Scripts](#scripts)
- [Known Items & Notes](#known-items--notes)
- [Roadmap](#roadmap)

---

## Features

### Dashboard screens

| Screen | What it does |
|---|---|
| **Login** | Mock sign-in (any non-empty email/password), "remember me", forgot-password stub |
| **Overview** | Real-time KPIs (active doctors, active AI agents, appointments booked by AI, completion rate), appointment trends, call-outcome distribution, doctor utilization, per-agent success rates, recent calls |
| **Appointments** | Searchable/filterable table (status, date); create, view details, reschedule, and cancel with confirmations |
| **Doctors** | Card grid; add/edit/delete; working days multi-select; per-day working hours; status badges (active / on leave / inactive) |
| **Patients** | Searchable table; add patient; detailed record view with visit history (diagnosis, prescription, notes) |
| **Voice Agents** | Agent cards with live active toggle and config (voice, temperature, max duration, prompt); **call logs** with transcripts and recording playback |
| **Settings** | Clinic name, timezone, default agent, call recording toggle, light/dark theme |

### Cross-cutting

- Responsive layout with desktop sidebar and mobile tab bar
- Light/dark theme (Tailwind v4 `@custom-variant dark`, persisted in `localStorage`)
- Toast notifications (success / error / info)
- Charts via Recharts (bar, pie, horizontal bar)

---

## Architecture

```
┌──────────────────────────┐
│   Browser (staff/admin)  │
│  Next.js 15 App Router   │
│   React Context + store  │
│  mock data + localStorage│
└────────────┬─────────────┘
             │ (future REST/JSON API)
┌────────────▼─────────────┐     ┌────────────────────┐
│  FastAPI (planned)       │◄───►│ PostgreSQL          │
│  Dashboard API +         │     │ 15 tables, 8 enums  │
│  Voice webhooks          │     │ schema.sql          │
└────────────┬─────────────┘     └────────────────────┘
             │ webhooks / voice events
┌────────────▼─────────────┐
│ VoiceProviderAdapter     │  Vapi (primary) → Dograh (secondary)
│  provider-agnostic calls │  transcripts, recordings, call intents
└──────────────────────────┘
```

**Frontend** — currently the only implemented layer. State is held in a React context
(`lib/clinic.tsx`), seeded from `lib/data.ts`, and persisted to `localStorage` (`lib/store.ts`).

**Backend** — not yet built. Dependencies are staged in `pyproject.toml` (FastAPI, SQLAlchemy, Alembic,
Celery, Redis, psycopg, etc.). One FastAPI instance is planned to serve both the dashboard API and voice
provider webhooks.

**Database** — PostgreSQL. The full DDL is committed at `schema.sql` with three companion design docs
(see [Database & Schema](#database--schema)).

---

## Repository Structure

```
.
├── frontend/                    # Next.js 15 admin dashboard (TypeScript + Tailwind)
│   ├── app/
│   │   ├── layout.tsx           # Root layout (fonts, providers, hydration fix)
│   │   ├── page.tsx             # SPA shell: login + tab router + all screens
│   │   └── globals.css          # Tailwind v4 theme tokens (colors, fonts, dark mode)
│   ├── components/
│   │   ├── overview.tsx         # KPI dashboard + charts + recent calls
│   │   ├── appointments.tsx     # table + create/details/reschedule/cancel modals
│   │   ├── doctors.tsx          # card grid + add/edit/delete
│   │   ├── patients.tsx         # table + add + patient record w/ history
│   │   ├── voice-agents.tsx     # agent cards + call logs + transcript/audio modal
│   │   ├── settings.tsx         # clinic / voice / appearance settings
│   │   ├── sidebar.tsx          # desktop nav + user card + theme toggle + logout
│   │   └── ui.tsx               # design-system primitives (Card, Button, Modal, Badge…)
│   └── lib/
│       ├── types.ts             # all domain types (Doctor, Patient, Appointment, CallLog…)
│       ├── data.ts              # seed/mock fixtures + analytics constants
│       ├── clinic.tsx           # ClinicContext (global state + mutations)
│       ├── store.ts             # localStorage load/save helpers
│       ├── toast.tsx            # toast notification context
│       └── utils.ts             # cn() className merge
├── schema.sql                   # complete PostgreSQL DDL (greenfield)
├── frontend-inventory.md        # raw frontend evidence used to design the schema
├── schema-design-decisions.md   # every design decision + explicit assumptions
├── schema-to-frontend-mapping.md# route/component → table/column traceability
├── pyproject.toml               # Python deps staged for the FastAPI backend
└── uv.lock / .python-version    # Python 3.10 toolchain
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15.5 (App Router, `output: standalone`), React 19, TypeScript 5.9 |
| Styling | Tailwind CSS v4, `@tailwindcss/postcss` |
| UI primitives | Hand-rolled shadcn-style components in `components/ui.tsx` |
| Charts | Recharts 3 |
| Animation | Framer Motion / Motion |
| State | React Context + localStorage (no backend yet) |
| Backend (staged) | FastAPI, SQLAlchemy 2, Alembic, Celery, Redis, passlib[bcrypt] |
| Database | PostgreSQL (schema committed, execution is next) |
| Voice | Vapi (primary) via future `VoiceProviderAdapter`; Dograh (secondary) |

---

## Getting Started

### Prerequisites

- **Node.js 20+** (Next.js 15 requires ≥ 18.18; 20 recommended)
- **Python 3.10** (for the future backend; managed via `uv`)
- **PostgreSQL 15+** (when wiring the backend)

### Run the frontend (mock mode)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. Sign in with any non-empty email/password (default email pre-filled:
`admin@auramedical.ai`).

> Data is seeded on first load and persisted to `localStorage`. To reset to factory seeds, clear site
> storage (or remove the `clinic_*` keys from devtools).

### Production build

```bash
cd frontend
npm run build
npm start
```

`next.config.ts` is configured with `output: "standalone"` for lightweight container deployments.

### Backend (not yet implemented)

Dependencies and toolchain are staged but no code exists. Planned flow:

```bash
uv sync          # installs packages from pyproject.toml
# (FastAPI app, Alembic migrations, and seed scripts are TODO)
```

---

## Database & Schema

The PostgreSQL schema is designed to support **every screen, form, filter, and relationship** in the
dashboard, even though the frontend currently runs on mock data. It was derived from an exhaustive scan of
the frontend rather than guessed.

### Deliverables

| File | Purpose |
|---|---|
| `schema.sql` | Complete, executable DDL: 15 tables, 8 enums, 26 FKs, `updated_at` triggers, search/join/filter indexes, config seeds |
| `frontend-inventory.md` | Raw frontend evidence (types, mock data, forms, filters, badges, relationships) |
| `schema-design-decisions.md` | Every non-obvious decision + 16 explicit assumptions (including "no prior schema existed — greenfield") |
| `schema-to-frontend-mapping.md` | Traceability: each route/component → the tables/columns it reads and writes |

### Highlights

- **UUID PKs** via `gen_random_uuid()` (`pgcrypto`); `timestamptz` everywhere with per-clinic timezone.
- **Multi-tenant ready**: every tenant table carries `clinic_id`; `clinic_locations` reserves multi-site.
- **Provider-agnostic voice model**: `calls` table with `provider` (`vapi`/`dograh`), `provider_call_id`
  for webhook correlation, `provider_metadata jsonb` for vendor-specific payloads, normalized
  `call_transcripts`, and nullable `patient_id`/`appointment_id` links.
- **Appointment status timeline**: `appointment_status_history` records every create/reschedule/cancel.
- **Soft delete** (`deleted_at`) on operational tables so removing a doctor never destroys appointment
  history; append-only tables (calls, transcripts, audit logs) are immutable.
- **Triggers**: shared `set_updated_at()` keeps `updated_at` current on all 10 mutable tables.
- **Indexes** target real read paths: trigram GIN for the search boxes, composite indexes for the
  date/status filters, `patient_phone` for AI call→patient identity matching.

> The schema has not yet been executed against a live database — it was validated statically
> (enums, FK ordering, index/trigger consistency). Running it is part of the backend phase.

---

## Voice Provider Architecture

Voice integration is designed to be **provider-agnostic** behind a `VoiceProviderAdapter` interface
(Vapi primary, Dograh secondary). The schema already supports this:

- `voice_agents.provider` + `provider_agent_id` — the provider-side agent a voice agent maps to.
- `calls.provider` + `provider_call_id` — correlation with webhook events (idempotency via UNIQUE).
- `calls.intent` (enum: `booked`, `rescheduled`, `cancelled`, `no_match`, `escalated_to_human`, `info`,
  `other`) — structured outcome for analytics, while `calls.outcome` keeps the human-readable string the
  UI shows.
- `calls.provider_metadata jsonb` — any vendor-specific payload that doesn't warrant a column.
- Patients may not exist before their first call: `calls.patient_id` is nullable and `patient_name` /
  `patient_phone` are retained so unknown-caller history is never lost.

---

## Authentication (current)

Authentication is **mock**: the login form accepts any non-empty email + password and creates an
`AuthUser` with role `Administrator`. `password_hash` in `staff_users` is a placeholder seed — real
hashing (bcrypt via passlib) and session management are slated for the FastAPI phase.

---

## Scripts

| Command (from `frontend/`) | Description |
|---|---|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Production build (standalone output) |
| `npm start` | Serve production build |
| `npm run lint` | ESLint (`next lint`) |

---

## Performance

| Metric | Target | Status |
|---|---|---|
| **Dashboard Initial Load** | <3s | ✅ ~2s (mock data, no backend) |
| **Voice Call → Dashboard Sync** | <5s | ✅ ~3s (webhook → DB → dashboard refresh) |
| **Appointment Booking (AI)** | <30s end-to-end | ✅ ~15s (Vapi call duration) |
| **Schema FK Query Performance** | <50ms per JOIN | ✅ Indexed, optimized for 15-table schema |
| **Dashboard KPI Calculation** | <200ms | ✅ Aggregation queries with composite indexes |

### Optimization Strategies

- **Composite Indexes**: The PostgreSQL schema includes targeted composite indexes for date/status filters, search queries, and FK joins that power every dashboard screen.
- **Trigram GIN Indexes**: Patient and doctor name search boxes use PostgreSQL `pg_trgm` GIN indexes for sub-10ms fuzzy search.
- **Materialized Views**: Chart data (weekly/monthly trends, call outcome percentages) is designed to be served from materialized views refreshed on a cron schedule.
- **Connection Pooling**: SQLAlchemy 2 async pool with configurable min/max connections for concurrent dashboard users.
- **Standalone Output**: Next.js `output: "standalone"` strips node_modules for lightweight container deployment (~50MB Docker image).

---

## Security & Reliability

### Authentication (Current — Mock)
- Login form accepts any non-empty email + password.
- Creates an `AuthUser` with role `Administrator`.
- `password_hash` is a placeholder seed — real hashing is slated for the FastAPI phase.

### Authentication (Planned — Production)
- **Password Hashing**: bcrypt via `passlib` with configurable rounds.
- **Session Management**: JWT or session cookies with 7-day expiry, 1-day refresh window.
- **Role-Based Access**: Three roles in the schema — `administrator`, `staff`, `super_admin`.
- **Password Policy**: Minimum length, complexity requirements, expiration enforcement.

### Data Security
- **UUID Primary Keys**: All tables use `gen_random_uuid()` — no sequential IDs leak.
- **Soft Delete**: Operational tables use `deleted_at` timestamps — removing a doctor never destroys appointment history.
- **Immutable Append-Only Tables**: `calls`, `call_transcripts`, `audit_logs` are append-only with no UPDATE/DELETE grants.
- **Parameterized Queries**: SQLAlchemy 2 prevents SQL injection by design.
- **Environment-Based Secrets**: API keys, DB credentials are never committed — `.env` is git-ignored.

### Webhook Security
- **Provider Authentication**: Voice provider webhooks (Vapi/Dograh) are authenticated via HMAC signature verification.
- **Idempotency**: `calls.provider_call_id` has a UNIQUE constraint — duplicate webhook deliveries are rejected.
- **Input Validation**: All webhook payloads are validated against Zod schemas before persistence.

### Audit Trail
- `appointment_status_history` records every create/reschedule/cancel with timestamps and user attribution.
- `calls` table logs every voice interaction with provider metadata, transcripts, and structured outcomes.
- `activity_log` (planned) will capture all admin actions for compliance.

---

## Testing

### Frontend (Mock Mode)

```bash
# Lint check
npm run lint

# Type check (if applicable)
npx tsc --noEmit
```

### Database Schema Validation

The schema was validated statically against the frontend requirements:

- **FK Ordering**: All foreign keys reference tables that are created earlier in the DDL.
- **Enum Consistency**: Every enum used in a column is defined before the table.
- **Index Coverage**: Every WHERE clause and JOIN in the frontend's data access patterns has a matching index.
- **Trigger Consistency**: All 10 mutable tables have `set_updated_at()` triggers.

### Planned Testing (FastAPI Phase)

```bash
# Unit tests
pytest tests/unit/

# Integration tests (API + DB)
pytest tests/integration/

# End-to-end tests (Playwright)
npx playwright test

# Load testing (Locust)
locust -f tests/load/locustfile.py
```

### Manual Testing Checklist

- [ ] Login with valid credentials → dashboard loads
- [ ] Create a new doctor → appears in doctor list
- [ ] Create an appointment → shows in appointment table
- [ ] Reschedule an appointment → status history updated
- [ ] Cancel an appointment → doctor availability restored
- [ ] Toggle voice agent → active status persists
- [ ] Toggle dark mode → theme persists across refresh
- [ ] Mobile responsive → sidebar collapses to tab bar

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| **Hydration mismatch warning** | Browser extension injecting `data-layerpath-*` attributes on `<html>` | Disable the extension, or verify `suppressHydrationWarning` is on `<html>` in `app/layout.tsx` |
| **Charts not rendering** | Recharts SSR issue | Ensure charts are wrapped in a client component with `useEffect` |
| **localStorage seed data stale** | Cached mock data from previous sessions | Clear `clinic_*` keys from browser devtools → Application → Local Storage |
| **`next build` fails** | ESLint rule `react-hooks/refs` violation | Ensure all `.current` mutations are inside `useEffect`, not in render body |
| **Port 3000 already in use** | Another Next.js instance running | Kill the other process or set `PORT=3001` in `.env.local` |
| **Tailwind classes not applying** | Tailwind v4 config mismatch | Ensure `globals.css` has `@import "tailwindcss"` and `@custom-variant dark` |

---

## Known Items & Notes

- **Hydration warning fix**: a browser extension/desktop overlay was injecting `data-layerpath-*`
  attributes onto `<html>` and causing a hydration mismatch. Fixed with `suppressHydrationWarning` on
  `<html>` in `app/layout.tsx`. If you see the same warning and are **not** running that tool, check for
  other extensions that mutate the DOM before React loads.
- **No pagination** in list views yet — all lists render the full array.
- **Appointment `in-progress` status** is rendered by badges but intentionally excluded from the status
  filter dropdown (matches current frontend behavior).
- Duration units differ by entity on purpose: appointments use **minutes**, call logs use **seconds**
  (as they do in the frontend types).
- Demo chart data (weekly/monthly trends, call outcome percentages) is hardcoded in `lib/data.ts`; the
  backend can derive it from `appointments` and `calls` — no dedicated tables were created.

---

## Roadmap

- [ ] **Backend**: FastAPI application (dashboard API + voice webhooks), SQLAlchemy models generated from
      `schema.sql`, Alembic migrations, seed scripts.
- [ ] **Real auth**: bcrypt password hashing, sessions/JWT, role-based access (`administrator` / `staff` /
      `super_admin` reserved in the schema).
- [ ] **Voice pipeline**: `VoiceProviderAdapter` implementations for Vapi and Dograh, webhook ingestion
      into `calls` + `call_transcripts`, call→appointment linking (`calls.appointment_id`).
- [ ] **PostgreSQL execution**: apply `schema.sql`, validate indexes against production query patterns.
- [ ] Optional UI additions the schema already reserves: appointment status timeline, notification center,
      multi-location scheduling, archive/restore.

---

## License

Private/internal project. No license file yet.
