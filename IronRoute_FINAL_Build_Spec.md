# IronRoute — Final Build Specification
### Industrial Fleet Operations Platform
**Version 3.0 — FINAL. Written to be handed directly to an AI coding agent (Claude Code, Cursor, etc.) for a zero-to-shipped build.**

---

## 0. How to Use This Document (read this first, agent or human)

This is a complete, self-contained build spec. It assumes the reading agent has no prior context beyond this file. Sections are ordered in build order — follow them top to bottom, phase by phase, and do not skip validation steps. Every phase ends with an **Acceptance Criteria** checklist; do not proceed to the next phase until every item in it is true.

Design references (Notion-inspired UI) are documented as exact tokens in Section 3, not vague adjectives — implement them literally.

---

## 1. Product Summary

IronRoute is a full-lifecycle industrial fleet operations platform — vehicle/driver management, trip dispatch, maintenance, fuel/expense tracking, compliance document management, and analytics — with two genuine technical differentiators: **AI-assisted trip intake** (real LLM structured extraction with fallback) and a **constraint-based batch dispatch optimizer** (real assignment-problem solve, not a greedy sort). Full functional and business-rule spec is in Section 5–6; this file also fully specifies the visual/UI system (Section 3) and the technical build plan (Section 8) so it can be executed end-to-end without further clarification.

---

## 2. Users, Roles & Permission Matrix

| Role | Create Trip | Dispatch/Approve | Manage Vehicles/Drivers | Maintenance Approval | Financial Reports | Admin Config |
|---|---|---|---|---|---|---|
| Fleet Manager | ✅ | ✅ | ✅ | ✅ | View only | ❌ |
| Driver | ✅ (own) | ❌ | View own only | ❌ | ❌ | ❌ |
| Safety Officer | ❌ | ❌ | Driver compliance fields only | ❌ | ❌ | ❌ |
| Financial Analyst | ❌ | ❌ | ❌ | ❌ | ✅ Full | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

RBAC must be enforced **server-side on every endpoint**, not just hidden in the UI — this is checked directly in Section 8 acceptance criteria.

---

## 3. Design System — Notion-Inspired (exact tokens, implement literally)

Do not approximate this from memory. These are the tokens to hard-code into the theme config (Tailwind config / CSS variables). This is a warm-minimal, structured, high-legibility system — the goal is a workspace tool that feels calm and information-dense without feeling cluttered, matching Notion's actual visual language rather than a generic dashboard template.

### 3.1 Color Tokens

```css
:root {
  /* Base surfaces */
  --color-background:      #FFFFFF;
  --color-surface:         #F7F6F3;  /* cards, sidebar background */
  --color-surface-muted:   #F0EFED;  /* nested/secondary panels */
  --color-border:          #E3E2E0;  /* hairline borders, all dividers */
  --color-border-soft:     #EDEEEC;  /* lighter dividers inside cards */

  /* Text */
  --color-text-primary:    #191919;  /* headings, primary body */
  --color-text-muted:      #615D59;  /* secondary text, passes AA on light bg */
  --color-text-subtle:     #9B9A97;  /* placeholders/disabled — decorative only, never body text (fails AA) */
  --color-text-inverse:    #F6F5F4;  /* text on dark surfaces */

  /* Action colors */
  --color-primary:         #2383E2;  /* primary buttons, active nav, focus rings */
  --color-primary-hover:   #1A6DC4;
  --color-link:            #0075DE;  /* inline text links only, never buttons */

  /* Semantic status (fleet-specific — not from Notion, added for this domain) */
  --color-success:         #2F9E44;  /* Available, Completed */
  --color-warning:         #E8A33D;  /* Pending, expiry approaching */
  --color-danger:          #E0393E;  /* Suspended, overdue, blocked */
  --color-info:            #2383E2;  /* On Trip, in-progress */
}

/* Dark mode — NOT a naive invert. Rebuilt for contrast per WCAG 2.2 AA (4.5:1 minimum). */
[data-theme="dark"] {
  --color-background:      #191919;
  --color-surface:         #202020;
  --color-surface-muted:   #2A2A2A;
  --color-border:          #373737;
  --color-border-soft:     #2E2E2E;
  --color-text-primary:    #E9E9E7;
  --color-text-muted:      #9B9A97;
  --color-text-subtle:     #6F6E6B;
  --color-primary:         #4599E8;  /* lightened for dark-bg contrast */
  --color-link:            #5AA6E8;
}
```

### 3.2 Typography

- **Font family:** `Inter, ui-sans-serif, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif` (Inter is the open-source equivalent of Notion's proprietary NotionInter — same character, no licensing issue).
- **Weight hierarchy (strict, do not deviate):** 600 for page/section headings, 500 for subheadings and emphasized labels, 400 for all body text and UI copy. Never use 700+ except a single hero number on the dashboard.
- **Scale:**

| Token | Size | Weight | Line-height | Usage |
|---|---|---|---|---|
| `text-display` | 32px | 600 | 1.2 | Page titles only |
| `text-h2` | 22px | 600 | 1.3 | Section headers |
| `text-h3` | 16px | 500 | 1.4 | Card headers, subsection labels |
| `text-body` | 14px | 400 | 1.5 | Default UI text |
| `text-small` | 13px | 400 | 1.5 | Table cells, secondary info |
| `text-caption` | 12px | 500 | 1.4 | Badges, tags, metadata |
| `text-numeric` | — | 500 | — | `font-variant-numeric: tabular-nums` — mandatory for all KPI numbers and tables so digits align in columns |

### 3.3 Spacing & Layout Grid
- Base unit: **4px**. All padding/margin/gap values must be multiples of 4 (4, 8, 12, 16, 24, 32, 48, 64) — no arbitrary values.
- Page content max-width: 1280px, centered, with a fixed left sidebar (see 3.5).

### 3.4 Radius & Elevation
- Border radius: **8px** for cards/inputs/buttons, **12px** for modals and larger containers.
- Shadows: soft and barely-there — `box-shadow: 0 1px 2px rgba(25,25,25,0.04), 0 2px 8px rgba(25,25,25,0.03)`. Never use hard drop shadows; this is a hairline-border-first system, shadow is secondary elevation only for modals/popovers.

### 3.5 Layout Pattern
- **Left sidebar navigation** (not top nav) — this app has 8+ feature areas across 5 roles, which is exactly the complexity threshold where sidebar navigation outperforms top nav. Sidebar width 240px, collapsible to 64px icon-only.
- Sidebar sections, role-filtered: Dashboard, Vehicles, Drivers, Trips, Maintenance, Fuel & Expenses, Documents, Reports, Settings (Admin only).
- **Command palette** (`Cmd/Ctrl+K`) for quick navigation and actions — this is now a 2026 SaaS baseline expectation, not a nice-to-have, and it's cheap to implement with a library like `cmdk`.
- Top bar (within main content area, not full-width): breadcrumb + role-switcher context + search + notification bell + dark-mode toggle + user avatar menu.

### 3.6 Component Specifications

| Component | Spec |
|---|---|
| **Primary button** | Solid `--color-primary` bg, white text, 8px radius, 10px/16px padding, `text-body` weight 500. Hover: `--color-primary-hover`. |
| **Secondary button** | Transparent bg, 1px `--color-border` border, `--color-text-primary` text. |
| **Text/link button** | No border, `--color-link` text, underline on hover only. |
| **Card** | `--color-surface` bg, 1px `--color-border` border, 8px radius, 16-24px padding, soft shadow only on hover if interactive. |
| **KPI card** | Larger padding (24px), `text-display`-scale number with `tabular-nums`, `text-small` label below in `--color-text-muted`, optional trend arrow in success/danger color. |
| **Data table** | Sticky header row, `--color-border-soft` row dividers (not full borders — Notion tables read as rows of text, not a grid), sortable column headers, row hover = `--color-surface-muted`. |
| **Status badge** | Pill shape, `text-caption`, 4px/10px padding, background = 12%-opacity of the semantic color, text = full-opacity semantic color (e.g. Available badge: light green bg, dark green text). |
| **Pill tabs** | For top-level view switching: inactive = outline + muted text, active = solid dark bg + inverse text, fully rounded. |
| **Underline tabs** | For in-page sub-navigation: inactive = muted text no border, active = primary text + 2px bottom border. |
| **Modal** | 12px radius, centered, `--color-background`, max-width 480–640px depending on content, dimmed overlay `rgba(25,25,25,0.4)`. |
| **Empty state** | Never a blank box. Icon/illustration + one-line explanation + a single primary CTA button (e.g. empty Trips list → "No trips yet" + "Create your first trip" button, not a dead end). |
| **Toast notification** | Bottom-right, 8px radius, auto-dismiss 4s, semantic left-border accent (success/warning/danger). |

### 3.7 UX Rules (non-negotiable, sourced from current SaaS dashboard practice)

1. **F-pattern hierarchy:** the most important KPIs go top-left of the dashboard, not centered or scattered.
2. **Widget limit:** maximum 7 KPI cards visible at once on the dashboard's primary view — additional metrics go behind a "view all" drill-down, not crammed onto one screen.
3. **Progressive disclosure:** advanced settings (e.g. optimizer weighting, anomaly-detection thresholds) are hidden behind an "Advanced" toggle in Settings, not exposed by default.
4. **Role-based default views:** each role's Dashboard route renders a different default widget set on login — Financial Analyst sees cost/ROI widgets first, Safety Officer sees license-expiry/safety-score widgets first, not the same generic view re-filtered.
5. **Accessibility floor:** WCAG 2.2 AA — 4.5:1 text contrast minimum (note: `--color-text-subtle` fails this for body text by design and must only be used for placeholders/disabled states, never real content), full keyboard navigation, visible focus rings using `--color-primary`, semantic HTML landmarks.
6. **Mobile parity, not mobile-afterthought:** every core flow (view dashboard, create trip, approve maintenance) must work on a 375px viewport from the first implementation pass, not bolted on later.
7. **Empty and error states are designed, not default:** every list/table has an explicit empty-state (see 3.6) and every form has inline, specific error messages ("Cargo weight exceeds this vehicle's 500kg capacity" — not "Invalid input").
8. **Micro-interactions serve feedback, not decoration:** status-change animations (e.g. a vehicle card transitioning to "In Shop") should visibly confirm the action happened, not run for their own sake.

---

## 4. Complete Functional Specification

*(Full detail — unchanged in substance from the approved v2 spec, included here for completeness so this file is standalone.)*

### 4.1 Authentication & RBAC
Email/password login, forgot-password, session validation (JWT), server-side RBAC middleware on every API route.

### 4.2 Dashboard
KPI cards: Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization (%). Filters: vehicle type, status, region. Charts: utilization trend line, cost breakdown donut, fuel efficiency bar chart. Real-time state reflection (polling acceptable; websockets optional upgrade).

### 4.3 Vehicle Registry
Fields: Registration Number (unique), Name/Model, Type, Max Load Capacity, Odometer, Acquisition Cost, Status (Available/On Trip/In Shop/Retired). Document management: upload insurance/registration/permit files with expiry dates, feeding the notification pipeline. Search/filter/sort by reg. number, type, status, region.

### 4.4 Driver Management
Fields: Name, License Number, License Category, License Expiry Date, Contact Number, Safety Score, Status (Available/On Trip/Off Duty/Suspended). Search/filter/sort by name, license category, status.

### 4.5 Trip Management
Standard flow: source, destination, vehicle (available only), driver (available only), cargo weight, planned distance. Lifecycle: Draft → Dispatched → Completed → Cancelled.

**Differentiator 1 — AI-Assisted Trip Intake:** natural-language input parsed via a single server-side LLM call (Claude API) into structured fields (destination, cargo weight, time window, soft preferences). Output is pre-filled into the standard form for user confirmation — never auto-submitted. Passes through the identical validation pipeline as manual entry. On low-confidence parse or API failure/timeout, falls back to the manual form with a visible message. This fallback path must be tested, not just coded.

**Differentiator 2 — Batch Dispatch Optimizer:** when ≥2 trips are pending, builds a cost matrix of (trip × eligible vehicle-driver pair) weighted by capacity-fit + safety score + license-expiry proximity, and solves via `scipy.optimize.linear_sum_assignment` (Hungarian algorithm) for the fleet-wide optimal assignment rather than one-trip-at-a-time greedy suggestion. Ineligible pairs (fail rules 3–5 in Section 6) are excluded from the matrix entirely, never merely deprioritized.

### 4.6 Maintenance
Create record → vehicle auto-status "In Shop" → excluded from dispatch pool. Close → reverts to Available (unless Retired). Predictive maintenance: simple linear regression per vehicle over historical maintenance-interval-vs-odometer data; falls back to a configurable static threshold when insufficient history exists (new vehicles).

### 4.7 Fuel & Expense Management
Fuel logs (liters, cost, date) and other expenses. Auto-computed total operational cost per vehicle. Anomaly detection: z-score deviation from each vehicle's own trailing fuel-efficiency baseline flags entries for review — labeled explicitly as statistical anomaly detection, never "AI fraud detection."

### 4.8 Reports & Analytics
Fuel Efficiency, Fleet Utilization, Operational Cost, Vehicle ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost. CSV export (mandatory) and server-rendered PDF export (bonus, fully built).

### 4.9 Notifications
Email + in-app notifications for: license expiring within N days, vehicle document expiring within N days, predictive-maintenance window approaching, new compliance/maintenance events.

---

## 5. Data Model (ERD-level, ready for schema translation)

**Core entities:** Users, Roles, Vehicles, Drivers, Trips, MaintenanceLogs, FuelLogs, Expenses.
**Supporting entities:** VehicleDocuments, NotificationLog, AuditLog.

**Key relationships:** Trip → Vehicle, Trip → Driver (both must be Available at dispatch — enforced via DB transaction, not just app logic, to prevent race conditions on concurrent dispatch). MaintenanceLog/FuelLog/Expense/VehicleDocument → Vehicle (1:many).

---

## 6. Mandatory Business Rules

1. Vehicle registration number must be unique.
2. Retired or In Shop vehicles never appear in dispatch selection.
3. Drivers with expired licenses or Suspended status cannot be assigned to trips.
4. A driver or vehicle already On Trip cannot be assigned to another trip.
5. Cargo Weight must not exceed the vehicle's max load capacity.
6. Dispatching a trip → vehicle and driver status both become On Trip.
7. Completing a trip → vehicle and driver status both revert to Available.
8. Cancelling a dispatched trip → vehicle and driver revert to Available.
9. Maintenance record creation/closure cascades vehicle status as specified in 4.6.
10. AI-assisted intake never bypasses the validation pipeline.
11. The optimizer excludes ineligible pairs from its cost matrix entirely.
12. Every status-changing action writes an AuditLog entry (actor, action, before/after state, timestamp).

---

## 7. System Architecture

- **Frontend:** Next.js/React, Tailwind CSS configured with the exact tokens in Section 3, `cmdk` for command palette, Recharts for charts.
- **Backend:** Node/Express (or Supabase Edge Functions), RBAC middleware on every route.
- **Database:** Postgres, indexed on `vehicles.status`, `drivers.status`, `trips.status`.
- **Optimizer service:** isolated Python function (`scipy.optimize.linear_sum_assignment`) called synchronously; failure degrades gracefully to single-trip suggestion, never blocks trip creation.
- **LLM integration:** server-side only, Claude API, constrained JSON-output prompt, explicit timeout + fallback.
- **File storage:** S3-compatible object storage for vehicle documents.
- **Email:** transactional provider (Resend/SendGrid) for reminders.

---

## 8. Agent Build Plan — Execute in This Exact Order

> Each phase lists deliverables and an acceptance checklist. Do not start a phase until the previous phase's checklist is fully satisfied.

### Phase 0 — Project Scaffold
- Initialize Next.js + Tailwind project; wire the Section 3 design tokens into `tailwind.config` / CSS variables exactly as written.
- Set up Postgres + ORM (Prisma recommended) and connect.
- Folder structure:
```
/app
  /(auth)
  /dashboard
  /vehicles
  /drivers
  /trips
  /maintenance
  /fuel-expenses
  /documents
  /reports
  /settings
/components
  /ui        (buttons, cards, badges, tables, modals — per Section 3.6)
  /layout    (sidebar, topbar, command-palette)
/lib
  /rbac
  /validation
  /optimizer  (Hungarian-algorithm service call)
  /llm        (Claude API intake parser)
/prisma
  schema.prisma
```
- **Acceptance:** app boots, design tokens visibly applied to a placeholder page, DB connection confirmed.

### Phase 1 — Database Schema
- Implement all entities from Section 5 as Prisma models with correct relations and enums for every status field (Vehicle.status, Driver.status, Trip.status).
- Add DB-level constraints: unique `registrationNumber`, FK constraints on all relations.
- **Acceptance:** migrations run clean; seed script inserts realistic demo data (12 vehicles, 8 drivers, mixed statuses, one vehicle pre-flagged for maintenance, one document near expiry).

### Phase 2 — Auth & RBAC
- Email/password auth, session/JWT, forgot-password flow.
- RBAC middleware enforced on every API route per the Section 2 matrix — write at least one test per role confirming a forbidden action is rejected server-side.
- **Acceptance:** logging in as each of the 5 roles renders a role-filtered sidebar (Section 3.5) and blocks unauthorized API calls even if attempted directly (not just hidden in UI).

### Phase 3 — Vehicle & Driver CRUD
- Full CRUD screens using the Section 3.6 component specs (cards, tables, badges, forms).
- Search/filter/sort on both list views.
- Vehicle document upload with expiry date field.
- **Acceptance:** unique registration number enforced with a specific inline error message; documents list shows expiry status badges.

### Phase 4 — Trip Lifecycle & Business Rules Engine
- Trip creation form with vehicle/driver eligibility filtering (rules 2–5 from Section 6).
- Implement lifecycle transitions (Draft → Dispatched → Completed → Cancelled) with the status cascades from rules 6–9.
- Write the validation pipeline as a single shared function/module — this is what both manual entry and the AI intake path must call, per rule 10.
- **Acceptance:** manually walk through the exact example workflow from the original brief (register Van-05 at 500kg → register Alex → 450kg trip → dispatch → complete → maintenance record → status hidden from dispatch) and confirm every step matches.

### Phase 5 — Differentiators
- **AI intake:** build the Claude API call with a strict JSON-schema prompt, wire it to pre-fill the Phase 4 form, implement the low-confidence/failure fallback to manual entry, and test the fallback path explicitly (e.g. by simulating a timeout).
- **Batch optimizer:** implement the cost-matrix builder and `linear_sum_assignment` call as an isolated service; wire a UI moment where ≥2 pending trips trigger the batch suggestion instead of one-at-a-time.
- **Acceptance:** stage a concrete 3-trip/3-vehicle scenario where the optimizer's assignment is visibly better than a naive greedy pick, and confirm the UI can display both for comparison (this is the single highest-value demo moment — do not skip building this comparison view).

### Phase 6 — Dashboard, Reports & Charts
- KPI cards (Section 4.2), role-based default views (UX Rule 4), charts via Recharts.
- CSV export (mandatory) and server-rendered PDF export.
- **Acceptance:** dashboard obeys the F-pattern/7-widget rules from Section 3.7; exports produce correctly formatted files, not empty stubs.

### Phase 7 — Maintenance, Fuel/Expense Intelligence
- Maintenance workflow with cascading status.
- Predictive maintenance regression (with documented fallback for low-history vehicles).
- Fuel/expense logging, cost rollup, z-score anomaly flagging.
- **Acceptance:** a seeded vehicle with maintenance history shows a predicted-service badge; a seeded anomalous fuel log is flagged and explained in-app with the specific deviation, not a generic warning.

### Phase 8 — Notifications
- Email + in-app notifications for license/document expiry and predictive-maintenance windows.
- **Acceptance:** triggering a seeded near-expiry record produces both an email (or logged email in dev) and an in-app notification-center entry.

### Phase 9 — Polish Pass
- Dark mode via the Section 3.1 dark tokens (not inverted colors) — verify contrast at 4.5:1.
- Full responsive pass at 375px, 768px, 1280px.
- Empty states (Section 3.6) on every list/table.
- Command palette (`Cmd+K`) wired to core navigation and "Create Trip" action.
- **Acceptance:** every screen has a designed empty state; keyboard-only navigation reaches every primary action; dark mode passes a contrast check, not just a visual glance.

### Phase 10 — QA & Demo Rehearsal
- Re-run the full example workflow from Section 4.5/Phase 4 end-to-end without manual DB intervention.
- Rehearse the 4-minute demo script (Section 9).
- **Acceptance:** zero console errors during the full demo path; the optimizer comparison view (Phase 5) and AI-intake fallback (Phase 5) have both been triggered live at least once during rehearsal.

---

## 9. Demo Script (4 minutes)

1. Dashboard at rest — seeded data, charts populated, one document near expiry flagged.
2. Type a natural-language dispatch request → AI parses it → user confirms → batch optimizer runs because more trips are pending → show the fleet-wide optimal assignment next to what greedy would have picked.
3. Dispatch → live status cascade on dashboard.
4. Complete trip → cost/efficiency reports update; a seeded vehicle is flagged as a fuel-efficiency anomaly.
5. Close a maintenance record whose "predicted due" badge was shown earlier.
6. Export a PDF report live.
7. Toggle dark mode to close.

---

## 10. Honest Risks

- LLM call latency/failure at a venue with unreliable wifi is the single biggest live-demo risk — the fallback path must be rehearsed, not just coded (Phase 5/10 acceptance criteria exist specifically to force this).
- The optimizer's advantage is only visible if you deliberately stage a comparison scenario (Phase 5 acceptance) — otherwise "optimal vs. greedy" looks identical to an untrained eye.
- This is now a larger build than an 8-hour minimal-safe scope. If time runs out, cut from the bottom of Section 8 (Phase 9 polish, then Phase 8 notifications) — never skip Phase 4's business-rule correctness or Phase 5's staged comparison, since those are what the score actually depends on.

## 11. Honest Score Note (carried forward, not re-inflated)
As a spec, this is now complete against the original brief (100% of mandatory + bonus items) with genuine technical depth (Phase 5) and a real, literal design system instead of a vague aesthetic direction. That combination is what earns a competitive score at scale — but the number is still earned in Phase 10, live, not on this page.
