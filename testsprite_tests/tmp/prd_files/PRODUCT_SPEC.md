# Product specification — Stock Composer

**Version:** 1.0  
**Last updated:** 2026-04-03  
**Status:** Living document (align with `prd.md` and shipped code)

---

## 1. Summary

**Stock Composer** is a web application for digitizing warehouse inventory: products, batch-level quantities, rack locations, and inbound/outbound movements. It targets operators who today rely on spreadsheets or paper and need **real-time stock visibility**, **batch traceability**, and **low-stock awareness** without barcode hardware.

**Primary outcome:** One place to maintain master data, record every stock change with batch context, and see dashboards that reflect current totals and recent movement trends.

---

## 2. Problem statement

| Pain | How the product helps |
|------|------------------------|
| Hard to know true on-hand quantity | Aggregates quantity across batches per product |
| Batch and location data scattered | Mandatory batch on inbound; rack location on product |
| No clear history of who moved what | Movement log with user, time, type, quantity, notes |
| Reactive reordering | Dashboard highlights items below minimum stock |

---

## 3. Goals and non-goals

### 3.1 Goals (MVP)

- Authenticated access to all inventory features.
- CRUD for products (master data) with SKU uniqueness.
- Inbound: increase stock by creating or adding to batches (batch number, optional expiry).
- Outbound: decrease stock from selected batches (FIFO/LIFO-style manual batch choice).
- Dashboard: counts, low-stock panel, stock composition chart, movement trend chart.
- Movement history view (read-only audit trail).

### 3.2 Non-goals (explicit)

- Barcode or QR scanning.
- Multi-warehouse / multi-tenant SaaS (unless explicitly expanded later).
- Purchase orders, suppliers, or accounting integrations (out of MVP scope).
- Mobile-first field workflows (desktop/laptop is the primary input surface).

---

## 4. Personas and permissions

| Persona | Description | Access |
|---------|-------------|--------|
| **Warehouse admin** | Primary user; enters products and movements | Full app after login |

**Product intent:** Optimized for a **single-organization, admin-style** workflow (see in-app copy: “Admin tunggal”). The stack supports multiple user accounts (Better Auth); operations and UX assume trusted internal users, not public self-service.

---

## 5. Information architecture

| Area | Route (approx.) | Purpose |
|------|-----------------|---------|
| Home | `/` → redirect to dashboard | Entry |
| Auth | `/login`, `/register` | Sign-in / onboarding |
| Dashboard | `/dashboard` | KPIs, charts, low stock |
| Products | `/products` | Master data |
| Inbound | `/inbound` | Stock in |
| Outbound | `/outbound` | Stock out |
| Movements | `/movements` | History |

---

## 6. Feature specifications

### 6.1 Authentication

- Users sign in with email and password.
- Protected app routes require a valid session; unauthenticated users are directed to login.

**Acceptance criteria**

- Session persists across refresh according to auth configuration.
- Logout (if exposed in UI) clears access to protected routes.

### 6.2 Products (master data)

**Fields (conceptual)**

- Name, SKU (unique), unit, rack location, minimum stock threshold, category.

**Behaviors**

- Create, edit, delete product records.
- SKU must remain unique across the catalog.

**Acceptance criteria**

- Cannot save two products with the same SKU.
- Deleting a product cascades or is blocked per data rules (implementation: batches/movements tied to product/batch).

### 6.3 Inbound (stock in)

**Inputs**

- Product, quantity, batch number, inbound date (as specified in product requirements), optional notes/expiry per batch model.

**Effects**

- Increases `current_quantity` on the relevant batch (new or existing batch as implemented).
- Appends an **inbound** movement record linked to the batch and acting user.

**Acceptance criteria**

- Total units for the product reflect the sum of batch quantities after save.
- Movement appears in history with correct type and quantity.

### 6.4 Outbound (stock out)

**Inputs**

- Product, quantity, **batch selection** (manual choice for FIFO/LIFO-style picking), optional notes.

**Effects**

- Decreases batch quantity; rejects or blocks insufficient quantity.
- Appends an **outbound** movement.

**Acceptance criteria**

- Cannot outbound more than available on the chosen batch.
- Dashboard and product totals update after successful outbound.

### 6.5 Dashboard

**Content**

- **Total products** — count of SKUs in master data.
- **Total units** — sum of quantities across all batches.
- **Low stock** — products whose total on-hand is strictly below `min_stock`.
- **Trend chart** — inbound vs outbound over time (e.g. weekly buckets).
- **Composition chart** — relative stock by product (or category, depending on implementation).

**Acceptance criteria**

- Low-stock list matches the same rule as computed totals from batches.
- Charts reflect latest data after hydration/sync from API.

### 6.6 Movement log

- Tabular list: time, type (in/out), product/batch context, quantity, user, notes where applicable.
- Read-only from the user’s perspective (corrections happen via new movements or admin DB process — product decision: no inline “edit movement” in MVP unless added).

---

## 7. Data model (conceptual)

Aligned with the Drizzle schema in `src/db/schema/inventory.ts`:

- **Product** — catalog row with SKU, unit, rack, min stock, category, timestamps.
- **Batch** — belongs to one product; holds `batch_number`, `current_quantity`, optional `expiry_date`.
- **Movement** — `inbound` | `outbound`; quantity; links to batch and user; optional notes; timestamp.

**Relationships**

- Product 1 — N Batches  
- Batch 1 — N Movements  

---

## 8. UX and visual requirements

- **Default theme:** dark mode (per PRD).
- **Typography:** variable font stack as defined in project design tokens (Geist Mono / JetBrains Mono per `prd.md`).
- **Locale:** UI copy may use Indonesian (`id-ID`) for numbers and labels where implemented.

---

## 9. Technical context (as implemented)

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Database | PostgreSQL via `DATABASE_URL` |
| ORM | Drizzle |
| Auth | Better Auth |
| UI | React, Tailwind, shared component primitives |

*Note:* Early PRD drafts mentioned SQLite; the shipped configuration targets **PostgreSQL**. Treat this spec and `.env.example` as authoritative for environment setup.

---

## 10. Success metrics (suggested)

| Metric | Why it matters |
|--------|----------------|
| Time to record inbound/outbound | Replaces slow manual ledgers |
| % of movements with batch filled | Traceability adoption |
| Incidents of stock mismatch | Validates single source of truth |
| Weekly active use | Confirms the dashboard is part of routine |

---

## 11. Open questions / backlog hooks

- Asset valuation on dashboard (optional in PRD) — define formula and currency before building.
- Formal FIFO/LIFO automation vs manual batch pick.
- Expiry-driven alerts (data field exists; alerting UX may not).
- Role separation (viewer vs editor) if multi-user rollout grows.

---

## 12. Related documents

- `prd.md` — original project requirements (Indonesian), includes Mermaid ERD and flow diagrams.
- `.env.example` — runtime configuration for database and auth.
