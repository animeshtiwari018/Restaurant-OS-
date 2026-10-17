# RESTRO MANAGE — Document 04: API & Real-Time Event Specification

**Project:** RESTRO MANAGE  
**Document ID:** RM-API-001  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Sections 3–9, 12)  
**Base URL:** `/api/v1`  
**Protocol:** HTTPS / WSS  

---

## 1. Authentication & Session Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/auth/staff/login` | Public | Staff email/password login -> Sets secure HTTP-only JWT cookie |
| `POST` | `/auth/staff/logout` | Staff | Invalidates staff session |
| `GET` | `/auth/staff/me` | Staff | Returns authenticated staff profile and permissions |
| `POST` | `/auth/customer/otp/request` | Public | Sends 4-digit OTP to customer phone (Rate limited: 3 / 15min) |
| `POST` | `/auth/customer/otp/verify` | Public | Validates OTP -> Issues short-lived customer session token |

---

## 2. Table & Session Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/tables/resolve/:token` | Public | Resolves opaque QR token to restaurant and table display data |
| `GET` | `/tables` | Staff | Lists all physical tables with live occupancy/reservation status |
| `POST` | `/tables` | Admin | Creates new table (number, capacity, floor assignment) |
| `POST` | `/tables/:id/rotate-token` | Admin | Revokes existing token and generates new opaque QR token |
| `GET` | `/sessions/active` | Staff | Returns active dining sessions across all tables |
| `POST` | `/sessions/:id/close` | Manager | Verifies zero balance and closes table dining session |

---

## 3. Menu & Nutritional Catalog Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/menu/categories` | Public | Lists active categories in display sort order |
| `POST` | `/menu/categories` | Admin | Creates new category |
| `GET` | `/menu/items` | Public | Lists menu items with dietary filters (`veg`, `vegan`, `allergens_exclude`, `high_protein`, `max_calories`) |
| `GET` | `/menu/items/:id` | Public | Retrieves single item with full nutritional breakdown, ingredients, allergens, and customizations |
| `POST` | `/menu/items` | Admin | Creates menu item with nutrition values, ingredients, and allergen links |
| `PATCH` | `/menu/items/:id/availability`| Staff | Toggles `is_available` (86ing items when depleted) |

---

## 4. Order & Waiter Dispatch Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/orders` | Customer / Waiter | Submits cart. Validates prices on server. Sets status to `PENDING_VERIFICATION` |
| `GET` | `/orders/pending` | Waiter / Manager | Fetches unassigned dispatch queue for active tables |
| `POST` | `/orders/:id/claim` | Waiter | **Atomic claim**: Row-locks order; assigns waiter or returns 409 Conflict |
| `POST` | `/orders/:id/verify-confirm` | Assigned Waiter | Physical gate: confirms table presence -> Moves order to `CONFIRMED` -> Generates KOT |
| `POST` | `/orders/:id/verify-reject` | Assigned Waiter | Rejects order with reason code -> Cancels order, no KOT created |
| `PATCH` | `/orders/:id/served` | Assigned Waiter | Marks order / items as served to table |

---

## 5. Kitchen Display System (KDS) Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/kitchen/tickets` | Kitchen Staff | Fetches active KDS tickets (`QUEUED`, `PREPARING`) |
| `PATCH` | `/kitchen/tickets/:id/start` | Kitchen Staff | Moves ticket to `PREPARING` |
| `PATCH` | `/kitchen/tickets/:id/items/:itemId/ready` | Kitchen Staff | Marks specific item ready. When all items ready, ticket becomes `READY` |
| `POST` | `/kitchen/tickets/:id/reprint` | Staff | Queues reprint job on network thermal printer with audit log |

---

## 6. Table Reservation Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/reservations/availability` | Public | Checks table slot availability for given date, time, and party size |
| `POST` | `/reservations` | Public | Books table atomically; checks exclusion constraints against double-booking |
| `GET` | `/reservations` | Staff | Displays upcoming reservations and arrival schedules |
| `PATCH` | `/reservations/:id/check-in` | Staff | Marks party arrived -> Opens corresponding dining session |
| `PATCH` | `/reservations/:id/no-show` | Staff | Marks reservation no-show past grace period |

---

## 7. Billing & Payment Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/bills/session/:sessionId` | Staff / Customer | Retrieves the single authoritative primary bill for the session |
| `POST` | `/bills/session/:sessionId/finalize` | Cashier | Locks eligible served items into the bill; computes taxes & totals |
| `POST` | `/payments/cash` | Cashier | Records verified cash payment against bill |
| `POST` | `/payments/online/initiate` | Customer / Staff | Initiates online UPI / Card payment transaction with provider |
| `POST` | `/payments/webhook` | Public (Provider) | Idempotent webhook receiver for payment confirmations (`provider_event_id` UNIQUE) |

---

## 8. Real-Time WebSocket Events (Socket.IO)

```
Channels & Namespaces:
- /waiters       -> Authenticated on-duty wait staff
- /kitchen       -> Kitchen Display System terminals
- /table-session -> Customer party at specific table session
```

### Event Taxonomy
- `order:broadcast` $\longrightarrow$ Broadcast to `/waiters` when order is submitted in `PENDING_VERIFICATION`.
- `order:claimed` $\longrightarrow$ Broadcast to `/waiters` updating queue when a waiter wins atomic claim.
- `kitchen:ticket_created` $\longrightarrow$ Emitted to `/kitchen` immediately upon physical waiter confirmation.
- `kitchen:item_ready` $\longrightarrow$ Emitted to assigned waiter when a dish is marked ready.
- `order:status_updated` $\longrightarrow$ Emitted to `/table-session` so customer sees live stage progression.
- `bill:settled` $\longrightarrow$ Emitted to `/table-session` and staff when outstanding balance reaches zero.
