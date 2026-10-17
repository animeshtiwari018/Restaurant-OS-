# RESTRO MANAGE — Document 01: System Architecture & Technical Design

**Project:** RESTRO MANAGE  
**Document ID:** RM-ARCH-001  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Section 12)  
**Architectural Style:** Modular Monolith  

---

## 1. Architectural Strategy

Restro Manage uses a **Modular Monolith** architecture for its initial restaurant deployment:
- Single deployable backend application divided into distinct, isolated domain modules.
- Single transactional PostgreSQL database with schema boundaries.
- Low networking overhead, simplified deployment, straightforward local development, and zero distributed transaction complexity.
- Future-ready: Clean service boundaries allow extracting specific modules (e.g., Reservation Engine or Payment Webhooks) into independent microservices when expanding to a multi-restaurant SaaS platform.

---

## 2. Recommended Technology Stack

| Layer | Technology | Primary Responsibility |
|---|---|---|
| **Customer Web App** | Next.js, React, TypeScript, Tailwind CSS | Mobile-first zero-install menu, cart, nutritional filters, order tracking |
| **Staff Web App** | React PWA / Responsive Web App | Waiter order dispatch, Kitchen Display (KDS), Admin CMS, Floor Map |
| **Backend Framework** | Node.js with Express | REST APIs, authentication, transactional business logic |
| **Request Validation** | Zod | Strict schema validation for headers, query params, and JSON bodies |
| **Authoritative ORM** | Prisma ORM | Relational data access, migrations, typed queries, and transactions |
| **Primary Database** | PostgreSQL | Transactional source of truth, row-locking, exclusion constraints |
| **Real-Time Layer** | Socket.IO | Waiter order dispatch broadcast, live KDS status, customer order tracking |
| **Cache & Ephemeral Store** | Redis | Temporary WebSocket socket-to-user mappings, rate-limiting, short-lived locks |
| **Thermal Printing** | ESC/POS via Local Network Bridge | Kitchen Order Ticket (KOT) printing |
| **Testing Framework** | Vitest / Jest, Supertest | Integration, concurrency, and business rule test suites |

---

## 3. Domain Modules & Boundaries

The modular monolith is partitioned into 8 core application modules:
1. **Authentication & Identity:** Staff JWTs, RBAC middleware, customer phone OTP verification.
2. **Table & Floor Management:** Opaque QR token resolution, floor layout, table service session lifecycle.
3. **Menu & Nutritional Management:** Categories, items, structured ingredients, macronutrients, allergens, dietary tags.
4. **Order & Dispatch Engine:** Cart submission, atomic first-come waiter claiming, physical verification gate.
5. **Kitchen Display System (KDS):** KOT ticket generation, item-level prep tracking, thermal print jobs.
6. **Reservation Engine:** Specific-table assignment, time-slot overlapping protection, deposit records.
7. **Billing & Payments:** 1 table session = 1 primary bill invariant, multiple payments per bill, webhook verification.
8. **Audit & Observability:** Outbox event dispatcher, system audit logs, metrics.

---

## 4. REST vs. WebSocket Responsibilities

### REST APIs (Authoritative Operations)
All state-changing operations and business decisions must execute via REST endpoints:
- Order placement, waiter claims, physical verification confirmation, bill finalization, payment processing.
- The server validates permissions, initiates PostgreSQL transactions, updates records, and commits.

### WebSocket Events (Ephemeral Notifications)
WebSockets deliver instantaneous real-time UI updates:
- Alerting waiters when a new order is submitted (`order:broadcast`).
- Updating kitchen screens when an order is verified (`kitchen:new_ticket`).
- Notifying customers when dishes are marked ready or served (`order:status_updated`).
- **Resilience Rule:** WebSockets are never the authoritative source of truth. If a client disconnects, it reconnects and fetches the authoritative state from REST endpoints.

---

## 5. Reliable Event Publication (Transactional Outbox Pattern)

To guarantee that real-time notifications and thermal print jobs are never lost during sudden crashes:
1. In the same database transaction that confirms an order, an `outbox_events` record is written.
2. The transaction commits atomically to PostgreSQL.
3. An asynchronous outbox worker picks up pending events, delivers the Socket.IO broadcast / enqueues the print job, and marks the event `PROCESSED`.
4. If an external service is temporarily down, the worker retries with exponential backoff.
