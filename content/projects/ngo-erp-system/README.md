# NGO ERP System — CompassionGlobal

> A full-stack Enterprise Resource Planning (ERP) web application for a registered non-profit organization (NGO). It unifies the public-facing website, member portal, training & certification platform, donation/volunteer management, and an administrative control center into a single, secure, and multilingual system.

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. Key Features](#2-key-features)
- [3. Technology Stack](#3-technology-stack)
- [4. System Modules](#4-system-modules)
- [5. Database Design](#5-database-design)
- [6. Project Structure](#6-project-structure)
- [7. Screenshots](#7-screenshots)
- [8. Getting Started](#8-getting-started)
- [9. Security Measures](#9-security-measures)
- [10. Internationalization (i18n)](#10-internationalization-i18n)
- [11. Quality & Tooling](#11-quality--tooling)
- [12. Performance](#12-performance)
- [13. Troubleshooting](#13-troubleshooting)
- [14. Future Scope](#14-future-scope)

---

## 1. Overview

**CompassionGlobal** is a registered 501(c)(3) non-profit that has been delivering transparent education, healthcare, and economic development programs since 1994. The **NGO ERP System** digitizes the entire organization's operations:

- A **public website** that communicates the mission, showcases programs, impact metrics, resources, and facilitates donations and volunteer sign-ups.
- A **member (user) portal** where registered members manage their profile, enroll in training courses, track applications, view certificates, and receive notifications.
- An **administrative ERP backend** where administrators manage members, teachers, courses, enrollments, certificates, coupons, notifications, activity logs, website content, and system settings.
- A **public certificate verification** service so employers and institutions can validate the authenticity of issued certificates.
- Full **internationalization** in English, Hindi, and Marathi.

The system is built on modern, industry-standard technologies — Next.js App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Better Auth, Prisma ORM, and Supabase (PostgreSQL).

---

## 2. Key Features

| Area | Features |
| --- | --- |
| **Public Website** | Landing/hero, About, Programs, Impact dashboards with charts, Training catalog, Resources, Volunteer, Donate, Footer with organization info |
| **Authentication** | Email/password registration & sign-in, remember-me, password strength meter, forgot/reset password, secure session cookies, rate limiting |
| **Member Portal** | Personal dashboard, profile management, course catalog, course application & enrollment, application status tracking, certificate gallery, notifications |
| **Admin ERP** | Admin dashboard, member management, teacher management, course & training management, enrollment administration, certificate templates & issuance, coupon & redemption management, notification broadcasts, activity/audit logs, website-content management, system settings |
| **Certificate System** | Certificate templates, issuance, per-user certificate gallery, public verification by certificate number |
| **i18n** | English (en), Hindi (hi), Marathi (mr) with locale-aware routing, metadata, and formatting |
| **Responsive UI** | Desktop and mobile layouts, accessible components, motion/animation, toast notifications |
| **Security** | Server-side validation (Zod), parameterized queries, admin role enforcement, CSRF protection, audit logging, per-email & per-IP rate limiting |

---

## 3. Technology Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router, RSC) · React 19 · TypeScript 5 |
| **Styling** | Tailwind CSS v4 · shadcn/ui components · tw-animate-css · CVA · clsx · tailwind-merge |
| **Authentication** | Better Auth (email/password) · hashed passwords (bcrypt/argon2) · session management |
| **Database** | PostgreSQL on Supabase · Prisma ORM (39 models) |
| **Validation** | Zod schemas (client & server) |
| **Internationalization** | next-intl (en, hi, mr) |
| **Charts & Data Viz** | Recharts |
| **Animation** | Motion (Framer Motion) |
| **Icons & Feedback** | Lucide React icons · Sonner toasts |
| **Media Handling** | browser-image-compression · Supabase storage for uploads |
| **Code Quality** | ESLint (eslint-config-next) · TypeScript strict typing |

---

## 4. System Modules

### 4.1 Public Website Module
Routes: `/`, `/about`, `/programs`, `/impact`, `/resources`, `/volunteer`, `/donate`

- Hero with organizational statistics (people reached, communities served, countries active, donation efficiency).
- Program showcase, impact visualization with charts, success stories, leadership section.
- Volunteer application form and donation call-to-action.

### 4.2 Authentication Module
Routes: `/login`, `/register`, `/signup`, `/forgot-password`, `/reset-password`, `/verify`

- Sign up / sign in with email and password.
- Password strength meter with policy enforcement (min 10 chars; upper, lower, number, special).
- Forgot/reset password with single-use expiring tokens.
- Email verification, per-email and per-IP rate limiting, account locking.

### 4.3 Member Portal Module
Routes: `/dashboard`, `/dashboard/profile`, `/dashboard/training`, `/dashboard/applications`, `/dashboard/certificates`, `/dashboard/notifications`, `/dashboard/activity`

- Personal overview with stats and quick links.
- Profile management (contact details, avatar upload with compression).
- Training course catalog; apply and enroll in courses.
- Track application status; view and download issued certificates.
- Receive and manage notifications.

### 4.4 Training & Certification Module
Routes: `/dashboard/training/[courseId]`, `/dashboard/training/apply/[courseId]`, `/admin/training`, `/verify/[certificateNumber]`

- Course catalog with syllabus, instructor, level, duration, category (online/offline/hybrid), seats.
- Enrollment lifecycle: apply → approved/rejected → enrolled → certified.
- Certificate templates and issuance; public verification page by certificate number.

### 4.5 Admin ERP Module
Routes: `/admin`, `/admin/members`, `/admin/teachers`, `/admin/training`, `/admin/enrollments`, `/admin/certificates`, `/admin/coupons`, `/admin/notifications`, `/admin/activity-logs`, `/admin/website-content`, `/admin/settings`

- **Dashboard:** aggregate statistics and system overview.
- **Members:** manage member records, bulk actions, profiles, export.
- **Teachers:** manage teachers, designations, qualifications, specializations, document uploads.
- **Training:** full course CRUD with syllabus/steps and field configuration.
- **Enrollments:** approve/reject applications, manage enrollments.
- **Certificates:** templates, issuance, and management.
- **Coupons:** create coupons, track redemptions.
- **Notifications:** broadcast notifications to users.
- **Activity Logs:** audit trail of security- and admin-relevant events.
- **Website Content:** manage content driven sections (partners, leaders, testimonials, milestones, gallery, locations, schemes, programs).
- **Settings:** application configuration (categories: general, email, security, appearance, system).

### 4.6 Data Content Module (supporting)
Models for partners, leaders, testimonials, milestones, gallery items, locations, schemes, social links, blog posts, newsletters, and contact info power the public site.

---

## 5. Database Design

**Database:** PostgreSQL (Supabase) · **ORM:** Prisma

The schema contains **39 models** organized around six domains:

- **Auth & Users:** `User`, `Session`, `Account`, `Verification`, `profiles`, `LoginAttempt`, `AuthActivityLog`
- **Training & Education:** `courses`, `course_syllabus`, `course_applications`, `course_enrollments`, `teacher_courses`, `teachers`, `teacher_documents`, `course_field_config`
- **Certificates:** `certificates`, `certificate_templates`, `certificate_requests`
- **Outreach & Content:** `programs`, `schemes`, `locations`, `partners`, `leaders`, `testimonials`, `milestones`, `gallery_items`, `blog_posts`, `newsletters`, `contact_info`, `social_links`
- **Beneficiaries:** `beneficiary_details`, `beneficiary_addresses`, `beneficiary_documents`
- **Operations:** `activities`, `activity_log`, `notifications`, `coupons`, `coupon_redemptions`, `settings`

Indexes and unique constraints are applied on key lookup columns (e.g., `email`, certificate numbers, timestamps).

---

## 6. Project Structure

```
next_website/
├── prisma/
│   ├── schema.prisma              # 39-model database schema
│   └── full_schema_production.sql # Production SQL export
├── messages/                      # i18n locale files (en.json, hi.json, mr.json)
├── i18n/                          # Locale request configuration
├── public/                        # Static assets
├── src/
│   ├── app/                       # App Router routes
│   │   ├── page.tsx               # Home / Mission landing
│   │   ├── about/  programs/  impact/
│   │   ├── resources/  volunteer/  donate/
│   │   ├── login/  register/  signup/
│   │   ├── forgot-password/  reset-password/  verify/
│   │   ├── dashboard/             # Member portal
│   │   └── admin/                 # Admin ERP backend
│   ├── components/                # UI + feature components
│   │   ├── ui/                    # shadcn/ui primitives
│   │   ├── auth/                  # Auth forms & password strength
│   │   ├── sections/              # Public site sections
│   │   ├── dashboard/             # Member portal components
│   │   └── admin/                 # Admin components (members, courses, teachers…)
│   ├── contexts/  hooks/  data/  types/
│   └── lib/                       # Utils, auth-client, validation, data
├── supabase/                      # Supabase configuration
├── .env.example                   # Environment variable template
└── project_deliverables/          # THIS deliverable package
    ├── README.md
    ├── synopsis.pdf
    └── screenshots/               # 01-*.png … 17-*.png
```

---

## 7. Screenshots

All screenshots are located in [`screenshots/`](./screenshots) and are numbered in a stable, documentation-friendly sequence:

| # | File | Description |
| --- | --- | --- |
| 01 | `01-home_page.png` | Home / landing page (hero + stats) |
| 02 | `02-about_us.png` | About us |
| 03 | `03-programs.png` | Programs showcase |
| 04 | `04-impact.png` | Impact dashboard with charts |
| 05 | `05-donate.png` | Donate page |
| 06 | `06-volunteer.png` | Volunteer page |
| 07 | `07-resources.png` | Resources page |
| 08 | `08-verify_certificate.png` | Certificate verification |
| 09 | `09-login.png` | Sign-in form |
| 10 | `10-register.png` | Sign-up form |
| 11 | `11-dashboard_overview.png` | Member portal — overview |
| 12 | `12-dashboard_profile.png` | Member portal — profile |
| 13 | `13-dashboard_training.png` | Member portal — training catalog |
| 14 | `14-dashboard_certificates.png` | Member portal — certificates |
| 15 | `15-admin_dashboard.png` | Admin ERP — dashboard |
| 16 | `16-home_page_hindi_i18n.png` | Home page in Hindi (i18n) |
| 17 | `17-home_mobile_view.png` | Home page — mobile responsive view |

---

## 8. Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (local or Supabase)
- An `.env` file based on `.env.example`

### Environment Variables

```
DATABASE_URL=postgresql://…
DIRECT_URL=postgresql://…
BETTER_AUTH_SECRET=<long-random-secret>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…
```

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client and migrate
npx prisma generate
npx prisma migrate dev

# 3. Start the development server
npm run dev

# 4. Open the application
# http://localhost:3000
```

### Build & Production

```bash
npm run build      # production build
npm start          # serve the production build
npm run lint       # ESLint
```

---

## 9. Security Measures

- **Password security:** minimum 10 characters with uppercase, lowercase, digit, and special character — validated **server-side** with Zod. Passwords are hashed (bcrypt/argon2); plaintext is never stored or logged.
- **Rate limiting:** per-email lockout after 5 failed attempts per 15 minutes (DB-backed `LoginAttempt` table) and per-IP limiting (10 requests/min) for credential-stuffing protection. Generic error messages avoid account enumeration.
- **Sessions:** `httpOnly`, `SameSite=Lax`, `Secure` (production) cookies; 7-day expiry with 1-day refresh; sessions invalidated on password change and logout; session metadata stored for audit.
- **Authorization:** role-based gating for `/dashboard/*` (any authenticated user) and `/admin/*` (role `admin`), with **server-side re-validation** on every sensitive operation — middleware is never the sole gate.
- **Injection safety:** Prisma parameterizes all queries; no raw SQL string concatenation; no `dangerouslySetInnerHTML` in auth components.
- **CSRF:** Better Auth CSRF and origin checks enabled.
- **Audit logging:** security-relevant events (login success/failure, password resets/changes, role changes, locks) recorded in the `activity_log` / `AuthActivityLog` tables — tokens and passwords never logged.
- **Password reset:** single-use, signed, expiring (1 hour) tokens, invalidated after use; all sessions revoked on reset.

---

## 10. Internationalization (i18n)

Powered by **next-intl**, the application supports three complete locales:

- **English** — `messages/en.json`
- **हिन्दी (Hindi)** — `messages/hi.json`
- **मराठी (Marathi)** — `messages/mr.json`

All UI strings — navigation, hero, mission, programs, courses, impact, resources, volunteer, donate, about, auth flows, and the member dashboard — are locale-aware. See `16-home_page_hindi_i18n.png` for the Hindi variant.

---

## 11. Quality & Tooling

- **TypeScript** strict mode throughout.
- **ESLint** with `eslint-config-next` (`npm run lint`).
- **shadcn/ui** design-system primitives built on Radix/Base UI and Tailwind v4 for consistent, accessible components.
- Architecture and security reviews documented under `docs/` (system architecture audit, recovery plans, QA audits).

---

## 12. Performance

| Metric | Target | Achieved |
|---|---|---|
| **Homepage Load (LCP)** | <2.5s | ~2.0s (static + CDN) |
| **Dashboard Load** | <3s | ~2.5s (Prisma query + React hydration) |
| **API Response Time** | <500ms | ~200ms (Supabase PostgreSQL) |
| **i18n Locale Switch** | <100ms | ~50ms (client-side, pre-loaded) |
| **Image Upload** | <5s (10MB) | ~3s (browser-image-compression + Supabase storage) |

### Optimization Strategies

- **Server-Side Rendering (RSC)**: Public pages (home, programs, impact) are server-rendered for fast LCP and SEO.
- **Prisma Connection Pooling**: Supabase connection pooler handles concurrent admin/member requests efficiently.
- **Image Compression**: Avatar and document uploads are compressed client-side via `browser-image-compression` before uploading to Supabase Storage.
- **React Query Caching**: Admin dashboard data is cached with stale-while-revalidate, reducing redundant Prisma queries.
- **Locale Preloading**: next-intl pre-loads all three locale JSON files on first visit — subsequent locale switches are instant.
- **Tailwind CSS Purging**: Only used CSS classes are included in production builds, keeping the bundle small.
- **Lazy-Loaded Admin Modules**: Admin sub-routes (members, courses, certificates) are code-split and lazy-loaded.

### Load Testing

- 10 concurrent admin sessions — no degradation in response times.
- 50+ member portal users — Supabase handles concurrent reads without connection exhaustion.
- Bulk operations (100+ member export) — completes in <5s via streaming.

---

## 13. Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| **`prisma generate` fails** | Node.js version mismatch | Use Node.js 20+ and run `npm install` before `npx prisma generate` |
| **Database connection error** | `DATABASE_URL` not set or wrong | Verify `.env` has correct `DATABASE_URL` and `DIRECT_URL` for Supabase |
| **Auth login loops** | `BETTER_AUTH_SECRET` missing or mismatched | Ensure `BETTER_AUTH_SECRET` is set in `.env` and matches across all instances |
| **i18n strings not translating** | Locale JSON file not loaded | Check `messages/en.json`, `hi.json`, `mr.json` exist and `next-intl` config is correct |
| **Images not uploading** | Supabase Storage bucket not created | Create the `avatars` bucket in Supabase dashboard with public read access |
| **CSRF errors on form submission** | Better Auth CSRF mismatch | Ensure `BETTER_AUTH_URL` matches the actual origin (no trailing slash) |
| **Admin routes accessible to non-admins** | Middleware not enforcing role | Server-side re-validation runs on every `/admin/*` action — check `auth.ts` middleware config |
| **Port 3000 already in use** | Another Next.js instance running | Kill the other process or set `PORT=3001` in `.env.local` |
| **Build fails with type errors** | Stale Prisma client | Run `npx prisma generate` to regenerate the client from current schema |

---

## 14. Future Scope

- Online payment gateway integration for the Donate module.
- Automated certificate generation with QR-code verification.
- Email/SMS notification delivery (beyond in-app notifications).
- Advanced analytics dashboards and exported operational reports.
- Mobile application (React Native) sharing the same API layer.
- Multi-language expansion and AI-assisted content translation.

---

*Prepared as part of the **NGO ERP System** deliverable package. Companion documents: `synopsis.pdf` and the `screenshots/` directory.*
