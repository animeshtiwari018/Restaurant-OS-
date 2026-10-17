# RESTRO MANAGE — Document 04: Kitchen Display System (KDS) & KOT Management

**Project:** RESTRO MANAGE  
**Document ID:** RM-REQ-004  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Section 5)

---

## 1. Kitchen Order Ticket (KOT) Generation Rules

- A KOT is generated **only after** the physical waiter verification gate succeeds.
- Unverified customer orders **must never** enter the kitchen queue or trigger ticket printing.
- The confirmation transaction atomically:
  1. Validates current order status (`CLAIMED`).
  2. Verifies waiter authorization and assignment.
  3. Transitions order status to `CONFIRMED`.
  4. Generates a unique, sequential kitchen ticket number.
  5. Creates kitchen ticket line items with item snapshots, customizations, and cooking instructions.
  6. Emits the real-time event to the KDS.
  7. Enqueues an outbox print job if network thermal printing is enabled.

---

## 2. Kitchen Display System (KDS) Workflow

Kitchen terminals display active tickets ordered by confirmation timestamp and preparation urgency.

### Information Displayed per Ticket:
- Ticket number & table reference.
- Items requested with quantities and modifier details.
- Specific cooking notes (e.g., "extra spicy", "no onions").
- Elapsed preparation timer with color-coded SLA thresholds (Green -> Amber -> Red).
- Ticket status:
  $$\text{Queued} \longrightarrow \text{Preparing} \longrightarrow \text{Ready}$$

---

## 3. Item-Level Preparation States

Individual items within a ticket can advance independently:
- **Example:**
  - Dish A (Starter): `READY`
  - Dish B (Main Course): `PREPARING`
  - Dish C (Bread): `QUEUED`
- **Aggregation Rule:** The overall order is marked `READY` only when **all** required items have reached the `READY` state. This prevents waiters from delivering incomplete courses prematurely.

---

## 4. Optional Thermal Printing (ESC/POS Network Bridge)

When thermal printing is enabled for kitchen stations:
- The backend queues an auditable `print_jobs` record within the confirmation transaction.
- Standard ESC/POS commands are sent over TCP (typically port 9100) to network printers or via a lightweight local print agent.
- **Reliability Invariants:**
  - A committed database transaction does NOT assume paper was physically printed.
  - Printer paper-out, offline, or network errors do not cancel or corrupt the authoritative KDS record.
  - Print jobs track statuses: `PENDING`, `PROCESSING`, `PRINTED`, `FAILED`.
  - Manual reprint is supported with audit logging (`reprint_count`).
  - The KDS remains the primary and authoritative kitchen workflow.
