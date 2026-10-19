# PROJECT_INDEX.md — Authoritative Architectural Index & Repository Map
**System:** Restro Manage (Restaurant Operating System)  
**Architecture:** Decoupled Monorepo (Node.js/Express REST + Socket.IO Backend & Next.js 16 Customer + Staff Frontend)  
**Maintenance Rule:** This document is the single source of truth for codebase layout and contracts. Update concurrently on any structural changes.

---

## 1. Repository Directory Tree & Component Responsibilities

```
d:\Computer science\Restaurant Management system\
├── restro-backend/                     # Node.js + Express + Socket.IO + Mongoose Backend
│   ├── .env                            # Environment configuration (PORT, MONGO_URI, JWT_SECRET, TABLE_SECRET)
│   ├── package.json                    # Backend dependencies (express, mongoose, socket.io, jsonwebtoken, bcryptjs, cors)
│   ├── server.js                       # Server entry point; initializes HTTP server and attaches Socket.IO
│   ├── public/
│   │   └── socket-tester.html          # Interactive browser-based tester for WebSocket events and dispatch flows
│   └── src/
│       ├── index.js                    # Database connection wrapper and application startup logic
│       ├── app.js                      # Express application setup, global middlewares, static routes, and API mounting
│       ├── constants.js                # Authoritative domain enums (Staff roles, Table/Order/KDS/Session/Bill statuses)
│       ├── seed.js                     # Database seeder script for tables, menu items, staff, and initial categories
│       ├── test-e2e.js                 # Automated end-to-end integration test runner validating end-to-end order flow
│       ├── config/
│       ├── db/
│       │   └── index.js                # MongoDB connection handler via Mongoose with retry and error logging
│       ├── models/
│       │   ├── Bill.js                 # Bill schema, payment records sub-document, tax/discount computations
│       │   ├── KitchenTicket.js        # KDS ticket model, individual station items, timing tracking
│       │   ├── MenuCategory.js         # Menu category taxonomy (Starters, Main Course, Breads, Beverages, Desserts)
│       │   ├── MenuItem.js             # Menu dishes, integer paise pricing, dietary tags, allergens, nutrition facts
│       │   ├── Order.js                # Order model with embedded immutable item snapshots and waiter assignment
│       │   ├── Reservation.js          # Table reservation bookings, time intervals, party sizes, customer phone
│       │   ├── Staff.js                # Staff accounts (name, email, password, role, status, station) with bcrypt
│       │   ├── Table.js                # Physical restaurant table configuration, capacity, floor, active status
│       │   └── TableSession.js         # Dining session lifecycle model with unique active table partial index
│       ├── middlewares/
│       │   ├── auth.middleware.js      # JWT verification (`verifyStaffToken`) & RBAC permission checker (`authorizeRoles`)
│       │   ├── error.middleware.js     # Centralized global error handling middleware producing standardized ApiError
│       │   └── rateLimiter.middleware.js# In-memory sliding window rate limiters (QR scan & session reconnect endpoints)
│       ├── services/
│       │   ├── dispatch.service.js     # Concurrency-safe order claiming and MongoDB ACID verification transaction
│       │   └── order.service.js        # Server-authoritative order creation, price calculation, and session validation
│       ├── controllers/
│       │   ├── auth.controller.js      # Staff registration, privilege-escalation guard, login claims, admin provisioning
│       │   ├── billing.controller.js   # Bill generation from active orders, itemization, payment records, session close
│       │   ├── kitchen.controller.js   # KDS active ticket retrieval, ticket/item status transitions, food ready dispatch
│       │   ├── menu.controller.js      # CRUD controllers for menu categories and menu catalog items
│       │   ├── order.controller.js     # Order placement, queue retrieval, claim, verification, and rejection
│       │   ├── reservation.controller.js# Reservation slot check, table availability logic, reservation lifecycle
│       │   ├── session.controller.js   # Reconnection state hydration API returning current table/session snapshot
│       │   └── table.controller.js     # Physical table management, QR token generation, and table session creation
│       ├── routes/
│       │   ├── admin.routes.js         # Routes for `/api/v1/admin` (admin staff provisioning, staff listing)
│       │   ├── auth.routes.js          # Routes for `/api/v1/auth` (staff login, register, me, admin staff alias)
│       │   ├── billing.routes.js       # Routes for `/api/v1/billing` (session bills, payments, finalize)
│       │   ├── kitchen.routes.js       # Routes for `/api/v1/kitchen` (tickets, item status, order served)
│       │   ├── menu.routes.js          # Routes for `/api/v1/menu` (categories, items)
│       │   ├── order.routes.js         # Routes for `/api/v1/orders` (place, queue, claim, verify, reject)
│       │   ├── reservation.routes.js   # Routes for `/api/v1/reservations` (available tables, booking, status)
│       │   ├── session.routes.js       # Routes for `/api/v1/sessions` (current session hydration)
│       │   └── tableRoutes.js          # Routes for `/api/v1/tables` (tables, QR generation, session verification)
│       ├── sockets/
│       │   └── index.js                # Socket.IO setup, room routing (`room:waiters`, `room:kitchen`, `room:session_<id>`)
│       └── utils/
│           ├── apiError.js             # Operational error class with custom status codes and serialization
│           ├── apiResponse.js          # Uniform API JSON response envelope `{ success, statusCode, message, data }`
│           ├── asyncHandler.js         # Promise-based wrapper eliminating try/catch repetition in controllers
│           ├── password.js             # Password hashing and bcrypt comparison utilities
│           └── token.js                # JWT issuance and verification for staff auth and table QR sessions
│
├── customer-web/                       # Next.js 16 (App Router) + React 19 + Tailwind CSS 4 Web App
│   ├── package.json                    # Frontend dependencies (next, react, react-dom, axios, tailwindcss)
│   ├── middleware.ts                   # Edge route guard protecting `/waiter/*`, `/kitchen/*`, `/admin/*`, `/staff/*`
│   ├── tailwind.config.js              # Theme design tokens, colors (primary, surface, amber), typography
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js               # Global HTML document wrapper with font definitions and CSS imports
│   │   │   ├── globals.css             # Tailwind v4 configuration, theme root variables, custom utility classes
│   │   │   ├── (customer)/             # Customer Dining PWA Route Group
│   │   │   │   ├── layout.tsx          # Customer layout, TableSessionHeader, CartProvider, sticky bottom navigation
│   │   │   │   ├── page.tsx            # Root redirect to `/menu`
│   │   │   │   ├── t/[token]/page.tsx  # Dynamic QR scan landing page; decodes JWT token, bootstraps session, redirects
│   │   │   │   ├── menu/page.tsx       # Interactive menu; category tabs, search, veg/non-veg filter, cart drawer
│   │   │   │   ├── order-status/page.tsx # Order tracking view with 5-step status stepper & call waiter actions
│   │   │   │   └── bill/page.tsx       # Bill summary, itemized receipt, split billing simulation, checkout trigger
│   │   │   └── (staff)/                # Staff Operations Portal Route Group
│   │   │       ├── layout.tsx          # Staff navigation bar, on-duty toggle, role-aware tabs, logout
│   │   │       ├── staff/login/page.tsx# Staff authentication form with demo quick-login credentials
│   │   │       ├── waiter/page.tsx     # Waiter dispatch terminal with pending orders, claim locks, verification modal
│   │   │       ├── kitchen/page.tsx    # Kitchen Display System (KDS) board with station filtering and status bumps
│   │   │       ├── admin/page.tsx      # Admin/Manager live table map, floor occupancy metrics, active bill figures
│   │   │       └── staff/              # Staff subroute aliases (/staff/waiter, /staff/kitchen, /staff/admin)
│   │   ├── components/
│   │   │   ├── customer/
│   │   │   │   ├── BillSettlementCard.tsx   # Itemized invoice, tax calculations, payment method selector
│   │   │   │   ├── CartDrawer.tsx           # Slide-up customer cart drawer with item count, notes, place order
│   │   │   │   ├── LiveOrderStepper.tsx     # 5-step visual tracking component for order progression
│   │   │   │   ├── MenuItemCard.tsx         # Menu dish card with photo, price, dietary badge, add button
│   │   │   │   ├── ProductDetailDrawer.tsx  # Dish deep-dive modal: nutrition, ingredients, spice customization
│   │   │   │   └── TableSessionHeader.tsx   # Top header showing table number, session timer, waiter ping button
│   │   │   ├── kitchen/
│   │   │   │   └── KDSBoard.tsx             # Interactive kitchen board, station tabs, ticket timer, item bumping
│   │   │   └── waiter/
│   │   │       ├── VerificationModal.tsx    # 2-step physical check modal (customer seated + allergen verified)
│   │   │       └── WaiterDispatch.tsx       # Waiter dispatch queue, live order claim, rejection reason handling
│   │   ├── context/
│   │   │   └── CartContext.tsx         # Customer cart context, persistent localStorage, `formatRupees`, totals
│   │   ├── services/
│   │   │   └── api.ts                  # Axios client, dynamic host resolution, auth headers, domain service modules
│   │   └── types/
│   │       └── dining.ts               # Authoritative TypeScript interfaces matching database schemas
│
├── Docs/                               # Project architecture documentation, schemas, requirements
└── worklow.md                          # Detailed functional workflow specifications and technical requirements
```

---

## 2. Authoritative Data Models & State Machines

### Fundamental Invariants
1. **Integer Paise Pricing Standard:** All prices, subtotals, taxes, discounts, and payments are strictly stored and computed as integer paise (`₹1.00 = 100 paise`). Floating-point arithmetic for currency is strictly prohibited.
2. **Single Active Table Session Invariant:** At any given moment, a physical restaurant table can have at most **one** active dining session (`OPEN`, `ACTIVE_SERVICE`, or `AWAITING_SETTLEMENT`). Enforced in MongoDB via a unique partial filter index on `TableSession.table_id`.
3. **Immutable Order Item Snapshots:** When an order is placed, dish name and unit price are snapshotted into `Order.items[i]` to guarantee historical financial accuracy against future menu price updates.
4. **Single Primary Bill Invariant:** A `TableSession` maps to exactly one primary `Bill` record enforced via a unique index on `Bill.table_session_id`.

---

### State Lifecycles

#### A. Order Lifecycle (`ORDER_STATUS`)
```
[Customer Places Order]
         │
         ▼
 PENDING_VERIFICATION  (Broadcast to room:waiters via NEW_ORDER_DISPATCH)
         │
         ▼
      CLAIMED          (Waiter locks order via atomic findOneAndUpdate; status broadcast via ORDER_CLAIMED)
      ┌──┴──────────────────────────┐
      ▼                             ▼
  CONFIRMED                      REJECTED
  (KDS Ticket generated;         (Customer notified via ORDER_STATUS_UPDATE with reason)
   broadcast to room:kitchen)
      │
      ▼
  PREPARING            (Kitchen begins cooking dishes; updates individual items)
      │
      ▼
    READY              (Kitchen marks all items ready; alerts room:waiters via FOOD_READY_ALERT)
      │
      ▼
   SERVED              (Waiter delivers food to table)
      │
      ▼
  COMPLETED            (Session settled and closed)
```

#### B. Kitchen Ticket Lifecycle (`KITCHEN_TICKET_STATUS` & `KITCHEN_ITEM_STATUS`)
- **Ticket Statuses:** `QUEUED` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED` (or `CANCELLED`)
- **Individual Item Statuses:** `QUEUED` ➔ `PREPARING` ➔ `READY`
- **Station Routing:** Tickets and items route dynamically by preparation station:
  * `Curry`
  * `Tandoor & Breads`
  * `Beverages`
- **Delayed Threshold:** KDS flags tickets exceeding 20 minutes as critical delayed items.

#### C. Table Session Lifecycle (`TABLE_SESSION_STATUS`)
```
    OPEN               (Customer scans QR code; table token resolved; session created)
      │
      ▼
ACTIVE_SERVICE         (First order confirmed and preparing)
      │
      ▼
AWAITING_SETTLEMENT    (Customer requests bill or checkout initiated)
      │
      ▼
    CLOSED             (Bill fully settled; table marked AVAILABLE)
```

#### D. Bill & Payment Lifecycle (`BILL_STATUS` & `PAYMENT_STATUS`)
- **Bill Statuses:** `DRAFT` ➔ `FINALIZED` ➔ `PARTIALLY_PAID` ➔ `SETTLED` (or `CANCELLED`)
- **Payment Methods:** `UPI`, `CARD`, `CASH`, `ONLINE`
- **Payment Statuses:** `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`

---

## 3. Real-Time WebSocket Architecture & Rooms

**Server Module:** `restro-backend/src/sockets/index.js`  
**Connection Endpoint:** Port `5000` (attached to Express HTTP Server)  
**Handshake Auto-Join:** Supports query/auth params `room`, `sessionId`, `role`.

### Active Rooms
| Room Identifier | Target Audience | Primary Purpose |
|---|---|---|
| `room:waiters` | Waiters, Floor Captains, Admins | Receiving dispatch requests, food ready alerts, waiter assistance calls |
| `room:kitchen` | Kitchen KDS Stations & Head Chef | Receiving confirmed tickets ready for cooking, station routing |
| `room:session_<sessionId>` | Customer Dining at Table Session | Real-time updates on order verification, cooking status, bill readiness |

### WebSocket Event Dictionary
| Event Name | Direction | Emitter | Listener | Payload Structure |
|---|---|---|---|---|
| `NEW_ORDER_DISPATCH` | Outbound | `order.controller.js` | Waiter Terminals (`room:waiters`) | Full `Order` object with table number, items, and timestamp |
| `ORDER_CLAIMED` | Outbound | `order.controller.js` | Waiters & Table (`room:waiters`, `room:session_<id>`) | `{ orderId, waiterId, waiterName, status: 'CLAIMED' }` |
| `KDS_TICKET_QUEUED` | Outbound | `order.controller.js` | Kitchen Display (`room:kitchen`) | Generated `KitchenTicket` object with station items |
| `ORDER_STATUS_UPDATE` | Outbound | `order.controller.js` / `kitchen.controller.js` | Customer App (`room:session_<id>`) | `{ orderId, status, rejectionReason?, waiterName? }` |
| `FOOD_READY_ALERT` | Outbound | `kitchen.controller.js` | Waiters & Customer (`room:waiters`, `room:session_<id>`) | `{ ticketId, orderId, tableNumber, status: 'READY', message }` |
| `join_waiters` | Inbound | Waiter Web Client | Socket Server | None (joins socket to `room:waiters`) |
| `join_kitchen` | Inbound | Kitchen KDS Client | Socket Server | None (joins socket to `room:kitchen`) |
| `join_session` | Inbound | Customer Web Client | Socket Server | `sessionId` (joins socket to `room:session_<id>`) |

---

## 4. API Endpoints Quick Reference Table

Base URL: `http://localhost:5000/api/v1`

### Authentication & Staff Onboarding (`/api/v1/auth`)
| HTTP Method | Route Path | Controller Function | Auth Scope Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | `loginStaff` | Public |
| `POST` | `/api/v1/auth/staff/login` | `loginStaff` | Public |
| `POST` | `/api/v1/auth/register` | `registerStaff` | Public (WAITER/KITCHEN, or with invite secret for ADMIN/MANAGER) |
| `POST` | `/api/v1/auth/staff/register` | `registerStaff` | Public (Privilege escalation protected) |
| `GET` | `/api/v1/auth/me` | `getStaffProfile` | Bearer Staff Token |

### Admin Staff Management (`/api/v1/admin`)
| HTTP Method | Route Path | Controller Function | Auth Scope Required |
|---|---|---|---|
| `POST` | `/api/v1/admin/staff` | `adminProvisionStaff` | Bearer Staff Token (`ADMIN` only) |
| `GET` | `/api/v1/admin/staff` | `listStaff` | Bearer Staff Token (`ADMIN`, `MANAGER`) |


### Tables & Dining Sessions (`/api/v1/tables` & `/api/v1/sessions`)
| HTTP Method | Route Path | Controller Function | Auth Scope Required |
|---|---|---|---|
| `POST` | `/api/v1/tables` | `createTable` | Public / Admin |
| `GET` | `/api/v1/tables` | `getTables` | Public / Admin |
| `GET` | `/api/v1/tables/generate-qr/:tableNumber` | `getTableQRCode` | Rate-limited (20 req/15m) |
| `GET` | `/api/v1/tables/verify-session` | `verifyAndGetSession` | Table Token Header (`x-table-token`) |
| `GET` | `/api/v1/tables/sessions/current` | `getCurrentSessionState`| Rate-limited Session Hydration |
| `POST` | `/api/v1/tables/sessions/:sessionId/close` | `closeTableSession` | Rate-limited Staff / Customer |
| `GET` | `/api/v1/sessions/current` | `getCurrentSessionState`| Reconnection State Hydration |

### Menu & Catalog (`/api/v1/menu`)
| HTTP Method | Route Path | Controller Function | Auth Scope Required |
|---|---|---|---|
| `GET` | `/api/v1/menu/categories` | `getCategories` | Public |
| `POST` | `/api/v1/menu/categories` | `createCategory` | Public / Admin |
| `GET` | `/api/v1/menu/items` | `getMenuItems` | Public (optional `category_id` query) |
| `POST` | `/api/v1/menu/items` | `createMenuItem` | Public / Admin |

### Orders & Waiter Dispatch (`/api/v1/orders`)
| HTTP Method | Route Path | Controller Function | Auth Scope Required |
|---|---|---|---|
| `POST` | `/api/v1/orders` | `createOrder` | Public (Active Table Session) |
| `GET` | `/api/v1/orders` | `getOrders` | Public / Staff |
| `GET` | `/api/v1/orders/unassigned` | `getUnassignedOrders` | Staff Token (`WAITER`, `ADMIN`, `MANAGER`) |
| `GET` | `/api/v1/orders/:orderId` | `getOrderById` | Public / Staff |
| `POST` | `/api/v1/orders/:orderId/claim` | `claimOrder` | Staff Token (`WAITER`, `ADMIN`) |
| `POST` | `/api/v1/orders/:orderId/verify` | `verifyOrder` | Staff Token (`WAITER`, `ADMIN`) |
| `POST` | `/api/v1/orders/:orderId/reject` | `rejectOrder` | Staff Token (`WAITER`, `ADMIN`) |

### Kitchen Display System (`/api/v1/kitchen`)
| HTTP Method | Route Path | Controller Function | Auth Scope Required |
|---|---|---|---|
| `GET` | `/api/v1/kitchen/tickets` | `getActiveTickets` | Staff Token (`KITCHEN`, `ADMIN`, `MANAGER`, `WAITER`) |
| `PATCH` | `/api/v1/kitchen/tickets/:ticketId/status` | `updateTicketStatus` | Staff Token (`KITCHEN`, `ADMIN`) |
| `PATCH` | `/api/v1/kitchen/tickets/:ticketId/items/:itemId/status` | `updateTicketItemStatus` | Staff Token (`KITCHEN`, `ADMIN`) |
| `POST` | `/api/v1/kitchen/orders/:orderId/serve` | `markOrderServed` | Staff Token (`WAITER`, `ADMIN`) |

### Reservations (`/api/v1/reservations`)
| HTTP Method | Route Path | Controller Function | Auth Scope Required |
|---|---|---|---|
| `GET` | `/api/v1/reservations/available-tables` | `getAvailableTables` | Public / Staff |
| `POST` | `/api/v1/reservations` | `createReservation` | Public / Staff |
| `GET` | `/api/v1/reservations` | `getReservations` | Public / Staff |
| `PATCH` | `/api/v1/reservations/:reservationId/status` | `updateReservationStatus` | Staff Token (`ADMIN`, `MANAGER`, `WAITER`) |

### Billing & Settlement (`/api/v1/billing`)
| HTTP Method | Route Path | Controller Function | Auth Scope Required |
|---|---|---|---|
| `GET` | `/api/v1/billing/sessions/:sessionId` | `getOrCreateBillForSession` | Public / Staff |
| `GET` | `/api/v1/billing/:billId` | `getBillById` | Public / Staff |
| `POST` | `/api/v1/billing/:billId/finalize` | `finalizeBill` | Staff Token (`WAITER`, `ADMIN`, `MANAGER`) |
| `POST` | `/api/v1/billing/:billId/payments` | `recordPayment` | Staff Token (`WAITER`, `ADMIN`, `MANAGER`) |

---

## 5. Frontend Routes & Staff Access Matrix

| URL Route | Primary Audience | Guards / Middlewares | Key Components / Features |
|---|---|---|---|
| `/menu` | Customers | Public | Category filters, dish list, CartDrawer launcher |
| `/t/[token]` | Customers | Public (Valid QR JWT) | Resolves table session, sets tokens, redirects to `/menu` |
| `/order-status` | Customers | Public (Session Bound) | Real-time order progress stepper, ping waiter button |
| `/bill` | Customers | Public (Session Bound) | Receipt breakdown, GST calculations, split-bill preview |
| `/staff/login` | Staff | Public | Unified login form for Waiter, Kitchen, Admin roles |
| `/waiter` | Waiters, Admins | Role Guard (`WAITER`, `ADMIN`, `MANAGER`) | Waiter dispatch queue, claim orders, physical verification modal |
| `/kitchen` | Kitchen, Chefs | Role Guard (`KITCHEN`, `ADMIN`, `MANAGER`) | KDS ticket cards, station filter (Curry/Tandoor/Beverage), bump bar |
| `/admin` | Managers, Admins | Role Guard (`ADMIN`, `MANAGER`) | Live floor layout, table statuses, daily revenue metrics |
