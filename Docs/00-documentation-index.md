# RESTRO MANAGE — Master Documentation Index

**Smart QR-Based Restaurant Management, Waiter Dispatch & Nutritional Transparency System**

- **Source Specification:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md)
- **Architecture:** Modular Monolith (Node.js + Express, PostgreSQL, Prisma, Next.js, Socket.IO)
- **Status:** All Documentation Aligned & Verified

---

## 1. Complete Documentation Directory Structure

The `Docs/` directory is organized into 6 core modules, completely aligned with the Restro Manage master specification:

### 📁 01-Requirements
- **[01-product-scope-and-boundaries.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/01-Requirements/01-product-scope-and-boundaries.md):** Executive summary, 30 MVP inclusions, 12 explicit exclusions (No inventory, no recipes, no delivery, no split bills).
- **[02-customer-mobile-app-and-nutrition.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/01-Requirements/02-customer-mobile-app-and-nutrition.md):** Zero-install web access, opaque QR tokens, macronutrient transparency (kcal, protein, carbs, fat), ingredients, allergens, dietary labels.
- **[03-waiter-dispatch-and-floor-operations.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/01-Requirements/03-waiter-dispatch-and-floor-operations.md):** Real-time order broadcast, first-come first-claim atomic row locking, physical waiter verification gate.
- **[04-kitchen-kds-and-kot.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/01-Requirements/04-kitchen-kds-and-kot.md):** KOT generation strictly post-verification, KDS status tracking, item-level prep states, thermal printer bridge.
- **[05-table-and-session-management.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/01-Requirements/05-table-and-session-management.md):** Floor management, table service sessions (`Open -> Active -> Awaiting Settlement -> Closed`), 1 active session per table invariant.
- **[06-table-reservation-engine.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/01-Requirements/06-table-reservation-engine.md):** Specific table booking, concurrency protection against double-booking, deposits & no-show policies.
- **[07-billing-and-payments.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/01-Requirements/07-billing-and-payments.md):** **1 table session = 1 primary bill**, multiple payments per bill, reconciliation metadata.
- **[08-admin-dashboard.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/01-Requirements/08-admin-dashboard.md):** Menu & nutritional CMS, staff roles & RBAC permissions, live operational views.

### 📁 02-database-design
- **[01-database-design-and-erd.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/02-database-design/01-database-design-and-erd.md):** Authoritative PostgreSQL schema covering Restaurant & Access, Floor & Table, Menu & Nutrition, Order & Dispatch, Reservation, Billing & Payment, Audit & Reliability domains (with zero inventory tables).

### 📁 03-architecture
- **[01-system-architecture.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/03-architecture/01-system-architecture.md):** Modular monolith structure, technology stack, REST vs WebSocket responsibilities, transactional outbox pattern.
- **[02-security-and-anti-fraud.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/03-architecture/02-security-and-anti-fraud.md):** Opaque QR tokens, phone OTP rate limiting, physical verification gate security, nutritional data integrity.
- **[03-business-rules-and-state-machines.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/03-architecture/03-business-rules-and-state-machines.md):** State machine diagrams and transition guards for Orders, Kitchen Tickets, Table Sessions, Reservations, and Bills.
- **[04-api-specification.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/03-architecture/04-api-specification.md):** Complete REST API contracts, validation schemas, and Socket.IO real-time event taxonomy.

### 📁 04-quality
- **[01-testing-strategy-and-scenarios.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/04-quality/01-testing-strategy-and-scenarios.md):** The 25 Mandatory Testing Scenarios, race condition testing, and quality release gates.

### 📁 05-design
- **[01-ui-ux-design-specification.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/05-design/01-ui-ux-design-specification.md):** Customer mobile web design, Waiter dispatch interface, Kitchen Display (KDS), and Admin CMS.

### 📁 06-implementation
- **[01-operational-lifecycle.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/06-implementation/01-operational-lifecycle.md):** 7-stage service lifecycle and 11-step reservation lifecycle.
- **[02-implementation-roadmap.md](file:///d:/Computer%20science/Restaurant%20Management%20system/Docs/06-implementation/02-implementation-roadmap.md):** 8-phase delivery roadmap, milestones, and exit criteria.
