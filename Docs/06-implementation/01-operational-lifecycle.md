# RESTRO MANAGE — Document 01: Operational Lifecycle & Reservation Flows

**Project:** RESTRO MANAGE  
**Document ID:** RM-OPS-001  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Sections 13 & 14)  

---

## 1. The 7-Stage End-to-End Operational Lifecycle

Restro Manage coordinates the complete dining visit across 7 sequential stages:

```
[Stage 1: Customer Arrival]
       │
       ▼
[Stage 2: Menu & Order Submission]
       │
       ▼
[Stage 3: Waiter Dispatch (Atomic Claim)]
       │
       ▼
[Stage 4: Physical Verification Gate]
       │
       ▼
[Stage 5: Kitchen Preparation (KDS & Thermal KOT)]
       │
       ▼
[Stage 6: Serving & Table Service]
       │
       ▼
[Stage 7: Unified Billing & Settlement]
```

### Detailed Breakdown of Stages:

#### Stage 1: Customer Arrival & Session Initialization
1. Customer sits at a physical restaurant table.
2. Customer scans the table's opaque QR code (`/t/<token>`).
3. Mobile browser opens the table URL; backend verifies token hash and resolves table display number.
4. Customer enters phone number and completes 4-digit OTP verification.
5. Backend establishes the authorized customer session attached to the table.

#### Stage 2: Menu Selection & Order Submission
1. Customer browses categories, structured ingredients, allergens, and macronutrients (calories, protein, carbs, fat).
2. Customer applies dietary filters (e.g., Vegetarian, High-protein, Nut-free).
3. Items, modifiers, and table cooking instructions are added to cart.
4. Backend re-validates item availability and computes authoritative prices.
5. Order is persisted in `PENDING_VERIFICATION` status.
6. Customer sees the "Waiting for Waiter Verification" screen.

#### Stage 3: Waiter Dispatch
1. Eligible on-duty waiters receive real-time audio-visual notification via WebSockets (`order:broadcast`).
2. A waiter taps "Claim Order".
3. Backend atomically executes a row-lock transaction, assigning the waiter and updating queue for all staff.
4. Other waiters attempting simultaneous claims receive a conflict toast.

#### Stage 4: Physical Verification Gate
1. Assigned waiter physically visits the table.
2. Waiter verifies customer presence, confirms requested dishes and allergy warnings.
3. Waiter taps "Confirm & Send to Kitchen" on staff terminal.
4. Transaction moves order to `CONFIRMED`, generates KOT ticket number, and enqueues KDS event & thermal print job.
5. If table is empty or order is fraudulent, waiter taps "Reject" with audit reason.

#### Stage 5: Kitchen Preparation
1. KDS displays incoming ticket with elapsed timer.
2. Chefs start preparation (`PREPARING`).
3. Optional network thermal printer outputs physical KOT slip.
4. Chefs mark dishes ready item-by-item. When all dishes are done, ticket status becomes `READY`.
5. Assigned waiter receives instant push notification: *"Table 12 order is ready to serve"*.

#### Stage 6: Serving
1. Waiter collects dishes from kitchen pass.
2. Waiter delivers food to table and marks dishes/order as `SERVED`.
3. Customer tracker updates to "Dishes Served".
4. Dining session remains active for subsequent courses or orders.

#### Stage 7: Unified Billing & Settlement
1. Staff or customer initiates bill request.
2. All served orders roll into the session's **single authoritative primary bill**.
3. Customer selects payment method (Cash, UPI, Card, Online).
4. Partial payments are accepted and credited against bill balance.
5. Bill reaches `SETTLED` once outstanding balance is zero.
6. Staff closes dining session, releasing the table for next guests.

---

## 2. Advance Table Reservation Lifecycle (11 Steps)

1. Customer selects date, time slot, and guest count on web portal.
2. System checks restaurant hours, booking windows, and dining slot duration (90 mins).
3. Reservation engine queries PostgreSQL for an available physical table of matching capacity.
4. Concurrency lock validates interval $[T_{\text{start}}, T_{\text{end}}]$ with zero overlapping confirmed bookings.
5. Customer completes phone OTP verification.
6. Any required reservation deposit is paid or held.
7. Reservation transitions to `CONFIRMED` and specific table is reserved.
8. Arriving guests are verified by host staff upon arrival.
9. Staff clicks "Check-In", moving reservation to `COMPLETED` and opening active `table_service_session`.
10. If guests fail to arrive within 20 minutes past start, reservation marks `NO_SHOW`, freeing the table.
11. Table remains fully protected against concurrent double-bookings throughout.
