# RESTRO MANAGE — Document 01: Testing Strategy & Mandatory Scenarios

**Project:** RESTRO MANAGE  
**Document ID:** RM-QA-001  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Sections 15 & 17)  
**Testing Tools:** Vitest / Jest, Supertest, PostgreSQL Test Containers  

---

## 1. Quality Strategy & Testing Pyramid

To ensure transactional reliability and prevent operational failures during busy service hours, testing focuses on:
1. **Concurrency & Race Conditions:** Verifying that simultaneous user actions (waiter claims, table bookings, simultaneous payments) are handled atomically.
2. **State Machine Invariants:** Enforcing that resources only transition through permitted states.
3. **Financial Consistency:** Ensuring zero discrepancies between order snapshots, bill totals, and payment ledger records.
4. **Security Boundaries:** Ensuring customer context isolation and strict staff RBAC enforcement.

---

## 2. The 25 Mandatory Testing Scenarios

Every implementation milestone must pass these 25 automated and manual integration test scenarios before release:

| Test ID | Testing Scenario | Expected System Behavior |
|---|---|---|
| **TEST-01** | Two waiters attempt to claim the same order simultaneously | Exactly one waiter succeeds; the second receives a `409 Conflict`. Database records exactly one assignment. |
| **TEST-02** | Customer submits order | Order sits in `PENDING_VERIFICATION`. KDS receives zero tickets; zero print jobs queued. |
| **TEST-03** | Repeated confirmation requests sent by staff terminal | Handled idempotently. Exactly one kitchen ticket and one print job generated. |
| **TEST-04** | User edits table number in URL | Backend rejects access if opaque token does not resolve to requested table. |
| **TEST-05** | Revoked QR token accessed | Returns `401 Unauthorized / Token Revoked`; cannot initiate new session. |
| **TEST-06** | Expired or invalid OTP entered | Returns `400 Bad Request`; customer session is not established. |
| **TEST-07** | Concurrent reservation attempts for the same table & time slot | PostgreSQL exclusion constraint blocks overlapping booking; exactly one confirms. |
| **TEST-08** | Table currently occupied by walk-in when reservation arrives | System blocks silent reassignment; requires manager resolution. |
| **TEST-09** | Menu item price increases while customer has item in cart | Server recalculates total at checkout, flags difference, requires customer approval. |
| **TEST-10** | Admin edits menu item price or deletes category | All past orders, KOTs, and bills retain historical purchase-time prices and names. |
| **TEST-11** | Nutritional display verification | UI displays explicit basis (`PER_SERVING` vs. `PER_100_GRAMS`) matching stored data. |
| **TEST-12** | Menu item lacks verified nutrition | System marks values as `UNAVAILABLE` rather than displaying default zero kcal. |
| **TEST-13** | Allergen filtering on items with unknown allergens | Filter does NOT treat unverified items as safe for that allergen. |
| **TEST-14** | Assigned waiter disconnects mid-service | Order remains assigned; timeout triggers supervisory escalation alert. |
| **TEST-15** | Thermal printer out of paper / disconnected | KDS ticket remains active; print job marks `FAILED` with retry capability. |
| **TEST-16** | Payment provider webhook sent multiple times | Processed idempotently (`provider_event_id` UNIQUE); bill balance credited once. |
| **TEST-17** | Partial payment of ₹500 on ₹2000 bill | Bill status transitions to `PARTIALLY_PAID`; remaining balance reflects ₹1500. |
| **TEST-18** | Concurrent payment attempts against remaining balance | Database locking prevents payments totaling more than outstanding balance. |
| **TEST-19** | Multiple food orders placed during a single dining session | All served items roll into the session's single authoritative primary bill. |
| **TEST-20** | Bill paid before all kitchen dishes are served | Order fulfillment status remains unserved until dishes are physically delivered. |
| **TEST-21** | Customer attempts to submit new order while bill is finalizing | System rejects order or requires manager to reopen bill. |
| **TEST-22** | Waiter attempts to modify prices or issue refunds | Backend rejects request with `403 Forbidden` (Manager permission required). |
| **TEST-23** | WebSocket client disconnects and reconnects | Client queries REST state to catch up on missed status updates. |
| **TEST-24** | Ingredient or allergen edited in Admin CMS | New menu requests reflect changes immediately; historical orders unchanged. |
| **TEST-25** | Reservation deposit paid | Kept distinct in deposit ledger until applied to final dining bill. |
