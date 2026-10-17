# RESTRO MANAGE — Document 02: Implementation Roadmap & Milestones

**Project:** RESTRO MANAGE  
**Document ID:** RM-PLN-001  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Sections 16 & 18)  

---

## 1. 8-Phase Delivery Roadmap

Development follows a strict, bottom-up architectural progression. Each phase delivers a testable, production-grade module before proceeding to the next.

| Phase | Milestone Name | Core Deliverables | Exit Criteria |
|---|---|---|---|
| **Phase 1** | **Requirements & Database Foundation** | Finalize ERD, Prisma schema migrations, constraints, seed scripts | Clean migrations pass; zero inventory tables; all entity foreign keys tested |
| **Phase 2** | **Auth, Tables & Nutritional Menu** | Staff JWTs & RBAC, customer OTP, opaque QR token generator, Menu & Nutritional CMS | Full CRUD on menu items with calories, protein, carbs, fat, allergens, and dietary tags |
| **Phase 3** | **Orders & Waiter Dispatch** | Cart checkout, `PENDING_VERIFICATION` order creation, atomic claiming, physical gate | Concurrency test passes: 2 waiters claiming simultaneously yields exactly 1 winner |
| **Phase 4** | **Kitchen Display (KDS) & KOT** | KOT generation, item-level prep tracking, thermal print jobs, KDS dashboard | Unverified orders cannot reach KDS; ticket turns ready when all dishes complete |
| **Phase 5** | **Table Reservation Engine** | Time-slot validation, specific-table locks, exclusion constraints, deposits | Concurrent reservation tests pass without double-booking the same table |
| **Phase 6** | **Unified Billing & Payments** | 1 session = 1 bill invariant, multiple payments per bill, webhook idempotency | Partial payment arithmetic verified; duplicate webhooks do not double-settle |
| **Phase 7** | **Administration & Analytics** | Floor management, staff accounts, revenue analytics, nutritional audit report | Admin can manage entire restaurant operations from unified dashboard |
| **Phase 8** | **End-to-End Testing & Deployment** | The 25 Mandatory Testing Scenarios, load testing, production configuration | 100% pass rate on 25 mandatory test cases; staging deployment verified |

---

## 2. Core Development Principles

1. **Verify Before Committing:** Backend code must enforce state machine guards and financial truth. Never trust client-submitted prices or claim status.
2. **Minimal Action Principle:** Implement exactly what is specified in `worklow.md`. Do not invent unrequested modules (e.g., inventory tracking, delivery partner fleets, split billing).
3. **Continuous Concurrency Validation:** Every state change involving staff or reservations must have automated concurrent tests.
