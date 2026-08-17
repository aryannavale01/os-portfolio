# Production-Readiness Audit Report — macOS AI Developer Portfolio

**Date:** August 16, 2026
**Build audited:** Production build (`npm run build` → `next build`, Next.js 15.5.23, React 19)
**Method:** Static code review of all components/pipeline scripts, production build + lint, live HTTP testing against the standalone production server, headless-Chrome DOM renders (375px and default viewport), live Ask-AI API behavior tests (real Groq key), Lighthouse audits (mobile + desktop emulation), and client-bundle/security scans. Mouse-drag/resize animations and touch gestures were verified by code inspection and headless renders — this environment has no interactive browser driver, so those specific items are marked "code-verified" where they could not be physically clicked.

---

## 1. Summary — Verdict: **Needs fixes (no critical blockers)**

The site is **functionally complete and deployable**: the production build compiles clean, every route/asset serves correctly from the standalone server, the content pipeline validated all 5 new projects, Ask Ultron is grounded and correctly refuses code/injection requests, secrets are server-side only, and there are no critical bugs that break core flows.

However, it is **not yet launch-clean**. The main concerns before a public launch:

1. **Desktop Performance score is 46** (Lighthouse) — ~2.9s of main-thread work, ~96 KiB of unused JS, and every window re-renders during drag because `Window` isn't memoized and window-state changes write to `localStorage` on every mousemove frame.
2. **Accessibility:** the 9 dock icon buttons have no accessible names (`aria-label`), failing the button-name audit (Accessibility 94).
3. **SEO:** `robots.txt` declares `Sitemap: /sitemap.xml` as a *relative* URL, which is invalid per the robots spec (SEO 92).
4. **Content hygiene:** several `README.md` files contain `GROQ_API_KEY=your_key_here` placeholder text that gets **bundled into the client JavaScript** (harmless placeholders, but sloppy), and a few project-gallery/content inconsistencies (see Moderate).

None of these block functionality, but they should be fixed before or immediately after launch.

---

## 2. Critical Issues

**None found.** No bug breaks a core feature, crashes the app, exposes data, or fails gracefully in an unacceptable way. Specifically verified:

- Build succeeds with **zero errors and zero warnings** (`npm run lint` also clean).
- All routes return correct status codes; static assets, project images/PDFs, and the resume PDF all serve.
- Ask AI never exposes `GROQ_API_KEY`; the actual key value has **0 occurrences** in any client bundle.
- Source files (`content/*`, `lib/*`, `.env.local`) are **not** reachable via any public route (all 404; path traversal blocked).

---

## 3. Moderate Issues

| # | Issue | Where | Impact |
|---|-------|-------|--------|
| M1 | **Every window re-renders on every drag frame; `localStorage` is written on every mousemove.** `Window` is not wrapped in `React.memo`, and `Desktop`'s "save windows state" effect runs `JSON.stringify` + `localStorage.setItem` on every state change — i.e. 60×/sec while dragging. | `components/Window.tsx`, `components/Desktop.tsx` | Jank during drag with several windows open; unrelated apps (e.g. Finder) re-render during any drag. Fix: memoize `Window`, throttle the persistence effect. |
| M2 | **Desktop Lighthouse Performance = 46** (2.9s main-thread work, 1.2s script evaluation, 96 KiB unused JS). Mobile emulation scores 74. The entire desktop (all 8 apps) ships as one eager client bundle. | build output / `app/page.tsx` | Slow first paint on mid-range devices. Fix candidates: lazy-load window contents (`next/dynamic`), cut `og.png` preload (see P3), defer non-critical JS. |
| M3 | **Dock icon buttons have no accessible name** — 9 `<button>`s carry only a `title` on the wrapper, failing Lighthouse `button-name`. | `components/Dock.tsx` | Screen readers announce the dock as 9 unnamed buttons. Fix: add `aria-label={item.name}` (also dedupe `aria-hidden` on icons). |
| M4 | **`robots.txt` sitemap line is a relative URL** (`Sitemap: /sitemap.xml`), flagged "Invalid sitemap URL" by Lighthouse. | `public/robots.txt` | Invalid robots.txt; SEO 92. Fix: use `Sitemap: ${APP_URL}/sitemap.xml` or a static absolute URL. |
| M5 | **All 5 projects share the `fullstack` category** — the Finder "Categories" sidebar filter collapses to a single entry ("Full-Stack AI Tools") plus "All". | `content/projects/*/data.json` | The category filter is effectively useless today; taxonomy work is needed to surface AI/RAG/agents/vision entries. |
| M6 | **`doctor-appointment-scheduling-system` case-study.pdf is a 2.4 KB stub** (likely a title-page-only PDF), while the README openly states the dashboard is "mock data, no live backend" — but `data.json` highlights claim live Vapi voice booking. | `content/projects/doctor-appointment-scheduling-system/` | Content credibility risk: the visible highlights overstate what exists. Align highlights with the README's actual status or expand the PDF. |
| M7 | **`ngo-erp-system` gallery begins at `03-programs.png`** — no `01-`/`02-` images; numbering starts at 03. | `content/projects/ngo-erp-system/` | Cosmetic; gallery still orders correctly (03→10), but looks like missing screenshots to a reviewer. |

---

## 4. Minor / Polish Items

| # | Item | Detail |
|---|------|--------|
| P1 | **Overlong Ask-AI input returns the "redirect" message, not a "too long" message.** A >300-char message returns `REDIRECT_MESSAGE` with HTTP 200 — graceful, but the reply ("I'm just here to answer questions about Aryan…") is misleading. A dedicated "message too long" reply would be clearer. | `app/api/ask-ai/route.ts` |
| P2 | **Empty Ask-AI message returns the generic failure text.** Empty/whitespace input → 400 with `"Something went wrong — try again in a moment."` The client blocks empty sends, so this only affects direct API callers. | `app/api/ask-ai/route.ts` |
| P3 | **`og.png` (85 KB) is `<link rel="preload">`'d on every page load** but is only needed for social sharing; `logo.png` (98 KB) is also heavy for a logo. Both are preloaded on the main document. | `app/layout.tsx` |
| P4 | **`GROQ_API_KEY=your_key_here` placeholder text from embedded project READMEs ships in the client JS bundle.** The real key never ships, but the placeholder string is greppable in `.next/static`. Consider scrubbing "GROQ_API_KEY=…" examples from READMEs that get embedded. | `lib/projects.generated.ts` (README content) |
| P5 | **Rate limiter is in-memory per serverless instance** — resets on cold start and is per-instance on Vercel, so it's a soft limit, not a hard one. Acceptable for a portfolio, worth knowing. | `app/api/ask-ai/route.ts` |
| P6 | **Mobile first-paint renders the desktop layout for one frame** — `useIsMobile` initializes `false` and flips after mount, so on <768px the draggable-window DOM mounts before the full-screen mobile view. Usually imperceptible; could gate initial render. | `hooks/use-mobile.ts` |
| P7 | **Esc closes the active window** (when no overlay is open). macOS doesn't do this — Cmd+W does. Low risk, but a user pressing Esc to dismiss something may close a window. | `components/Desktop.tsx` |
| P8 | **Resume lists 3 of 5 projects** (`RESUME_PROJECT_IDS`). The two excluded (NGO ERP, Doctor Appointment) are fine to omit by design; just flagging so it's intentional. | `content/aryan.ts` |
| P9 | **Project source PNGs are large** — gallery totals 19 MB on disk (largest: 1.66 MB `rag-system` 01-architecture.png). `next/image` optimizer compresses on delivery, so runtime impact is limited, but smaller sources would reduce build/asset weight. | `content/projects/` |
| P10 | **Wallpaper image could compress better** (~20 KB of its 35 KB optimized delivery is flagged as wasted by Lighthouse). | `public/wallpapers/default-workstation.jpg` |
| P11 | `metadata.json` still declares `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` while the app now only uses Groq — stale capability metadata for the AI Studio runtime. | `metadata.json` |
| P12 | Desktop icons use a fixed reserved region (`bottom-88`) — fine at tested sizes, but on very short viewports the icon container clips (`overflow-hidden`) rather than scrolling. | `components/Desktop.tsx` |

---

## 5. Lighthouse Scores

| Category | Mobile emulation (412×823) | Desktop (1350×940) |
|---|---|---|
| **Performance** | **74** | **46** |
| **Accessibility** | **94** | **94** |
| **Best Practices** | **100** | **100** |
| **SEO** | **92** | **92** |

**Mobile failing audits:** `button-name` (0 — dock icons), `robots-txt` (0 — relative sitemap URL), `unused-javascript` (50), LCP (61), Speed Index (73), TBT (55), Max FID (47), TTI (86). `color-contrast`, `target-size`, `image-alt`, `meta-viewport`, `heading-order` all pass.

**Desktop failing audits:** same as mobile plus worse main-thread metrics (2.9s main-thread work; 1.4s bootup-time; 1.2s script evaluation). First Contentful Paint is 1.0s (good); the penalty comes from client JS execution, not network.

**Note:** Lighthouse runs under 4× CPU throttling; real-user desktop numbers will be better. The desktop score is dominated by the single eager client bundle (279 kB First Load JS).

---

## 6. What Was Tested — Coverage Checklist

Legend: ✅ pass · ⚠️ pass w/ caveat · ❌ fail · 🔍 verified by code inspection (no interactive driver in this environment)

### 1. Functional — Window System
| Item | Result |
|---|---|
| Drag windows | 🔍 ✅ code-verified (window-level mousemove, viewport clamping) |
| Resize — all 8 handles (n/s/e/w/ne/nw/se/sw) | 🔍 ✅ code-verified (handles + min/max bounds present) |
| Minimize / restore from dock | 🔍 ✅ code-verified (state preserved; z-index bumped on restore) |
| Maximize / restore (incl. double-click header) | 🔍 ✅ code-verified |
| Close | ✅ (window state + focus handoff logic reviewed) |
| Focus / z-index | ✅ (z-index renormalization at MAX_WINDOW_Z=40) |
| Single-instance focus (open same app twice) | 🔍 ✅ code-verified (single window per app; re-open focuses) |
| 5+ windows concurrently | 🔍 ✅ code-verified (z-order renormalization) |
| Keyboard shortcuts (⌘W, ⌥⌘W, ⌘M/H, ⌘Q, ⌘,, ⌘P, ⌘K, ⌥⌘Esc, Esc) | 🔍 ✅ code-verified in `Desktop.tsx` keydown handler |
| Minimized window returns to exact prior size/position | 🔍 ✅ code-verified (position/size untouched by minimize) |

### 2. Finder / File System
| Item | Result |
|---|---|
| Navigate into every project folder (5/5 folders validated) | ✅ (all data.json + assets scanned, build passed) |
| Breadcrumbs / back / up navigation | 🔍 ✅ code-verified |
| Quick Look — image open, arrow-key nav, Esc/click-outside close | 🔍 ✅ code-verified (`QuickLook.tsx` + keyboard listener) |
| PDF opens in Preview w/ pagination/zoom | ✅ (real PDFs via `RealPdfViewer` iframe; verified all 4 project PDFs + resume are valid `%PDF` files and serve 200) |
| README renders in TextEdit w/ markdown + clickable links | 🔍 ✅ code-verified (`MarkdownViewer`, links `target=_blank`) |
| Gallery cycles + numeric-prefix ordering | ✅ code-verified (alphabetical sort = numeric order); ⚠️ NGO ERP starts at `03-` (M7) |
| Right-click context menu, Get Info, grid/list, search | 🔍 ✅ code-verified |

### 3. Ask Ultron (live API tests, real Groq key)
| Item | Result |
|---|---|
| Real question about a project → grounded answer | ✅ (RAG chatbot question returned correct, project-specific tech-stack detail) |
| Code-generation request refused | ✅ (returns redirect message) |
| Prompt-injection phrase refused | ✅ ("Ignore all previous instructions…" → redirect message) |
| Empty message | ✅ (400 + friendly fallback; client blocks empty sends) — ⚠️ P2 |
| Overlong message (>300 chars) | ✅ (graceful refusal) — ⚠️ P1 |
| Rapid repeated messages → rate limit | ✅ (429 "You're asking a lot right now…" triggered at 6/60s window) |
| GROQ_API_KEY never in client requests/responses | ✅ (0 occurrences of key value in all static bundles; requests only POST `{message}`) |
| Groq failure → friendly fallback | ✅ (missing-key path returns friendly fallback, tested) |

### 4. Desktop / Intro / Wallpaper
| Item | Result |
|---|---|
| Wallpaper loads on fresh session | ✅ (image present in headless DOM; serves 200) |
| Entrance animation plays once, not on subsequent nav | ✅ code-verified (no routing; `introPlayed` gates replay; replays only on "Restart") |
| Tagline cycles without stutter/overlap | 🔍 ✅ code-verified (2.6s interval, `AnimatePresence popLayout`) |
| Icons never overlap intro/dock | ✅ code-verified (bounded region top-12→bottom-88 vs intro bottom-36, dock bottom-2.5) |
| Settings wallpaper switch persists + legible on all options | ✅ code-verified (`ThemeContext` v2 localStorage, light-wallpaper text colors, scrims on gradients) |

### 5. Responsive / Cross-Device
| Item | Result |
|---|---|
| 375px render | ✅ (headless 375×667 render: menu/dock/intro/icons all present, no crash) |
| 768px breakpoint (mobile fallback) | 🔍 ✅ code-verified (`useIsMobile` <768 → full-screen window views) |
| 1440px / 1920px | 🔍 ✅ code-verified (clamping + resize reflow logic); no clipping at tested sizes |
| Mobile full-screen apps; no overflow/clip | ✅ (Lighthouse mobile emulation found no layout failures; `overflow-hidden` everywhere) — ⚠️ P12 short-viewport icon clipping |
| Touch interactions (tap to open, swipe gallery) | 🔍 ✅ code-verified (`ProjectGallery` pointer swipe; tap-to-open); no interactive touch test performed |

### 6. Error Handling
| Item | Result |
|---|---|
| Groq API failure → friendly fallback, not broken UI | ✅ (tested missing-key path + client `catch` → fallback bubble) |
| Slow/throttled network loading states | 🔍 ✅ (boot progress bar + Ask-AI typing/bounce states; wallpaper `priority`) — no blur placeholders (P9) |
| Non-existent route / invalid state | ✅ (404 page; `_not-found` route; `app/error.tsx` boundary w/ Try Again/Reload) |
| Bad JSON body, path traversal | ✅ (400 / 404 respectively) |

### 7. Performance
| Item | Result |
|---|---|
| Lighthouse (all 4 categories, mobile + desktop) | ✅ recorded — see §5 |
| Bundle size flags | ✅ First Load JS 279 kB; 96 KiB unused; desktop perf 46 (M2, P3) |
| Image optimization | ✅ `next/image` used for wallpaper/galleries (fill, sizes, q=75); ⚠️ large source PNGs (P9) |
| Unnecessary re-renders in window manager | ⚠️ **Found** — no `React.memo` on `Window` + per-frame `localStorage` writes (M1) |

### 8. Security / Config Hygiene
| Item | Result |
|---|---|
| Keys in env, never hardcoded | ✅ (`GROQ_API_KEY` only in `.env.local`; no `sk-*` strings in source) |
| Key absent from client bundle (built output, not just source) | ✅ (0 occurrences of actual key value in `.next/static`); ⚠️ placeholder string from READMEs present (P4) |
| `.env*` gitignored | ✅ (`.env*` + `!.env.example`; `git check-ignore` confirms; no `.env` tracked) |
| Content source files not exposed via public routes | ✅ (`content/…/data.json`, `README.md`, `lib/*`, `.env.local` all 404) |
| Security headers | ✅ (`X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`) |
| robots.txt / sitemap | ⚠️ robots.txt valid except relative sitemap URL (M4) |

### 9. Production Build Verification
| Item | Result |
|---|---|
| `npm run build` — zero errors, zero unexpected warnings | ✅ (5 projects, 34 assets synced; compiled in 10.7s; no warnings) |
| `npm run lint` | ✅ clean |
| Production standalone server (`npm run start` equivalent) | ✅ (all core flows above tested against the prod server, not dev) |
| Asset paths after prestart copy | ✅ (all static assets + generated content 200) |

---

## 7. Recommended Priority Order

1. **M1** — memoize `Window` / throttle localStorage persistence (perf + jank during drag).
2. **M4** — absolute sitemap URL in `robots.txt` (instant SEO win).
3. **M3** — `aria-label` on dock buttons (instant a11y win → likely 100).
4. **M2 / P3** — trim eager bundle: drop `og.png` preload, consider `next/dynamic` for heavy app bodies.
5. **M5 / M6 / M7 / P4** — content alignment pass (categories, doctor-appointment claims, NGO gallery numbering, scrub API-key examples from embedded READMEs).
6. **P1 / P2 / P7** — small Ask-AI and keyboard polish.

*Per your instruction, no fixes were applied in this pass — this report is for review and prioritization only.*
