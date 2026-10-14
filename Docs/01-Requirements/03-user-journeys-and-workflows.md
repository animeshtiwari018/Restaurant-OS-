# Restaurant OS — User Journeys & Business Workflows

**Document ID:** ROS-UJW-003
**Version:** 1.0
**Status:** Draft
**Parent Documents:** readme.md, 02-product-requirements.md

---

## 1. Purpose

This document describes how each type of user interacts with the system — what they do, what happens, and what can go wrong.

These workflows guide UX design, architecture, database design, API contracts, and testing.

---

## 2. Who are the actors?

| Actor | What they do |
|---|---|
| Customer | Browses menu, places orders, reserves tables, tracks progress, pays bills |
| Waiter | Manages tables, creates orders, coordinates service |
| Kitchen Staff | Receives tickets, prepares food, updates readiness |
| Cashier | Generates bills, records payments, reconciles |
| Restaurant Admin | Manages menu, tables, staff, settings, and inventory |
| Payment Provider | Processes online payments, sends verified payment events |
| OTP Provider | Sends verification codes for reservations and phone verification |

---

## 3. Journey A — Customer Places an Advance Pre-Order

**Goal:** Customer orders food before arriving at the restaurant for a future time.

**Preconditions:**
- Restaurant is accepting pre-orders
- Menu has eligible items
- Requested time is within the permitted ordering window
- Required customer info has been collected

### Main Flow

1. Customer opens the restaurant's ordering page
2. System shows the published menu
3. Customer selects items and modifiers
4. Customer adjusts quantities and reviews cart
5. Customer selects an eligible pickup/service time
6. System validates item availability, quantities, lead time, and ordering rules
7. System calculates the total using authoritative server-side prices
8. Customer enters required contact info
9. Customer selects a payment option
10. If online payment is required, system initiates payment through the configured provider
11. Server validates the final request and creates the order transactionally
12. System returns an order reference and current order status
13. Customer can revisit the order status page

### What can go wrong?

| Scenario | What happens |
|---|---|
| A1 — Item becomes unavailable | System rejects the item or asks customer to update cart. No invalid order is accepted. |
| A2 — Requested time is unavailable | System rejects the slot. Customer selects another time. |
| A3 — Payment fails | Order and payment states stay consistent with payment policy. Customer gets retry or cancel option. Failed payment is never shown as successful. |
| A4 — Duplicate submission | Retry with same idempotency key returns the existing result. No second order is created. |
| A5 — Customer leaves before seeing confirmation | Customer can retrieve the order via an authorized recovery method. System doesn't assume failure just because confirmation wasn't seen. |

### Result (Postconditions)
- Order has a unique reference
- Order has an explicit status
- Item and price snapshots are preserved
- Payment state is recorded separately from order state
- Audit records are available

---

## 4. Journey B — Customer Orders Through a Table QR Code

**Goal:** Seated customer orders from the table without waiting for a waiter.

**Preconditions:**
- Table exists and is active
- QR link resolves to the correct restaurant and table
- Restaurant permits QR ordering
- Table is eligible to accept orders

### Main Flow

1. Customer scans the table QR code
2. System opens the table-specific ordering page
3. System shows menu and current item availability
4. Customer adds items, quantities, modifiers, and notes
5. Customer reviews cart
6. System validates table context and order contents
7. Server calculates the total
8. Customer submits the order
9. Server creates the order and order items transactionally
10. System confirms the order reference and current status
11. Kitchen receives the preparation ticket
12. Customer can view order progress
13. Customer can place additional orders during the same table session if permitted

### What can go wrong?

| Scenario | What happens |
|---|---|
| B1 — Invalid or inactive QR | System does not accept the order. Customer is told to contact staff. |
| B2 — Table is no longer eligible | System blocks submission. Does not silently associate the order with a different table. |
| B3 — Item becomes unavailable | System revalidates the item during submission. Unavailable item is not silently accepted. |
| B4 — Customer submits twice | Idempotency prevents duplicate orders. |
| B5 — Internet drops | Customer sees an uncertain state, not a false confirmation. On retry, system checks existing submission before creating another. |
| B6 — Customer requests assistance | System creates an assistance request if the feature is enabled. Authorized staff can see and resolve it. |

### Result (Postconditions)
- Accepted order is linked to the correct restaurant and table
- Kitchen work is created for eligible items
- Order and payment states remain separate
- Historical order details are preserved

---

## 5. Journey C — Waiter Creates and Manages an Order

**Goal:** Serve customers who prefer waiter-assisted ordering.

### Main Flow

1. Waiter signs in
2. System shows authorized restaurant operations
3. Waiter selects a table or permitted ordering context
4. System shows the table's active service session (if one exists)
5. Waiter creates an order or adds to the session
6. Waiter selects menu items and modifiers
7. Server validates the order and calculates the total
8. Waiter submits the order
9. Kitchen receives the preparation ticket
10. Waiter monitors preparation and readiness
11. Waiter communicates relevant updates to the customer
12. Waiter requests a bill when appropriate

### What can go wrong?

| Scenario | What happens |
|---|---|
| C1 — Table is already in service | System shows the existing active session where permitted. Does not accidentally create an unrelated session. |
| C2 — Waiter picks an unavailable item | System prevents the item from being accepted. Waiter can pick an alternative. |
| C3 — Customer modifies an order | System checks if the item is still modifiable based on its current preparation state. Authorized modification creates appropriate order and kitchen updates. |
| C4 — Waiter lacks permission | Operation is rejected server-side. Event is recorded per security policy. |

### Result (Postconditions)
- Order follows the same validation and pricing rules as a QR order
- Responsible staff member and timestamps are recorded
- Kitchen and service info remains consistent

---

## 6. Journey D — Kitchen Processes an Order

**Goal:** Give kitchen staff a clear, reliable view of what to prepare.

### Main Flow

1. Kitchen staff opens the kitchen interface
2. System shows incoming tickets for authorized prep stations
3. Staff opens a ticket
4. Ticket shows: order reference, item quantities, modifiers, special instructions, timing info
5. Staff accepts the ticket
6. Staff starts preparation
7. Staff updates item or ticket status as work progresses
8. Completed items are marked ready
9. Waiter or customer interface receives the status update
10. Ticket remains traceable in operational history

### What can go wrong?

| Scenario | What happens |
|---|---|
| D1 — Ticket is modified before prep | Kitchen receives the latest valid item details. Old instructions are clearly identified. |
| D2 — Item is cancelled after prep starts | Kitchen receives a cancellation instruction. Original event history is preserved. Waste/stock follows inventory policy. |
| D3 — One item ready before others | Item-level readiness is used if enabled. Order is not incorrectly marked fully ready. |
| D4 — Kitchen interface disconnects | Committed ticket data is retained. On reconnect, interface reloads current persisted state. Repeated status updates don't create duplicate records. |
| D5 — Item is delayed | Staff can mark or report the delay. Relevant service users see the updated status. |

### Result (Postconditions)
- Valid preparation transitions are recorded
- Ticket history remains available
- Customer-facing order status reflects the defined order-state rules

---

## 7. Journey E — Customer Reserves a Table

**Goal:** Customer requests and confirms a reservation without creating conflicting bookings.

**Preconditions:**
- Restaurant has configured hours and reservation policies
- Eligible reservation capacity is available
- OTP verification is configured

### Main Flow

1. Customer opens the reservation page
2. Customer selects date, time, and party size
3. System checks eligible availability
4. Customer selects a permitted reservation option
5. Customer enters a phone number
6. System sends OTP via configured provider
7. Customer submits the verification code
8. System validates OTP
9. System rechecks availability and reservation rules
10. System creates a reservation request or temporary hold per policy
11. If a deposit is required, system initiates the payment flow
12. Reservation becomes confirmed only when all required conditions are met
13. Customer receives a reservation reference and status
14. Authorized staff can view and manage the booking

### What can go wrong?

| Scenario | What happens |
|---|---|
| E1 — Invalid OTP | Verification fails. Reservation cannot proceed. |
| E2 — OTP expires | Customer requests new code (within resend limits). Expired code cannot verify the request. |
| E3 — Availability changes during booking | System rechecks capacity before confirmation. Does not confirm an unavailable table. |
| E4 — Deposit payment fails | Reservation stays in pending/failed state. Temporary capacity is released when hold expires. |
| E5 — Customer abandons the booking | Temporary hold expires per policy. Expired holds do not block availability indefinitely. |
| E6 — Duplicate reservation request | Retries are handled safely. No duplicate reservations for the same logical submission. |

### Result (Postconditions)
- Reservation has a unique reference and explicit status
- Verification and payment states are recorded
- Confirmed capacity is protected against conflicting reservations

---

## 8. Journey F — Staff Checks In a Reservation

**Goal:** Convert a confirmed reservation into an active dining visit.

### Main Flow

1. Authorized staff opens the reservation list
2. Staff finds the customer's reservation
3. Staff verifies booking reference and arrival details
4. Staff confirms arrival
5. System validates that the reservation can be checked in
6. Staff assigns or confirms an eligible table
7. System records check-in time and responsible staff member
8. Reservation transitions to the configured checked-in/seated state
9. A dining service session is created or linked as appropriate

### What can go wrong?

| Scenario | What happens |
|---|---|
| F1 — Customer arrives early | Staff checks availability and applies early-arrival policy. System does not override a conflicting reservation automatically. |
| F2 — Customer arrives late | Staff applies configured grace period and late-arrival policy. System records the outcome. |
| F3 — Reserved table is unavailable | Staff can assign another eligible table if capacity and policy permit. Original reservation and table history remain traceable. |

### Result (Postconditions)
- Arrival and table assignment are recorded
- Reservation status and active table service status remain consistent

---

## 9. Journey G — Cashier Generates a Bill and Accepts Payment

**Goal:** Settle eligible orders accurately while preserving an auditable financial record.

### Main Flow

1. Authorized cashier opens an eligible order or table service session
2. System retrieves relevant order items and applicable pricing rules
3. Cashier reviews the bill
4. System calculates: subtotal, permitted discounts, taxes, charges, and total
5. Cashier confirms bill finalization
6. Customer chooses an available payment method
7. For cash: cashier records the received amount and change
8. For online payment: system initiates a payment through the selected provider
9. System verifies the provider's payment confirmation
10. Payment record is associated with the appropriate bill
11. System recalculates the outstanding balance
12. Bill is marked settled only when the required amount has been successfully paid
13. System records the settlement and audit information

### What can go wrong?

| Scenario | What happens |
|---|---|
| G1 — Online payment fails | Payment is not marked successful. Outstanding balance remains correct. Customer can retry or use another method. |
| G2 — Payment is pending | Bill stays unsettled until verified confirmation or another valid settlement method is recorded. Interface clearly shows pending state. |
| G3 — Duplicate provider notification | Same payment event is processed idempotently. Payment amount is not recorded twice. |
| G4 — Partial payment | System records the received amount. Remaining balance stays outstanding. |
| G5 — Refund requested | Only authorized users can initiate a refund. Original payment remains traceable. Refund is recorded only when verified. |

### Result (Postconditions)
- Bill has an explicit status
- Every payment is traceable to its bill
- Outstanding balance is correct
- Settlement does not automatically mean all food was served

---

## 10. Journey H — Administrator Manages Menu and Availability

**Goal:** Admin maintains an accurate menu without corrupting historical orders.

### Main Flow

1. Administrator signs in
2. Administrator opens menu management
3. Administrator creates or updates a category or item
4. Administrator configures price, modifiers, availability, and recipe association
5. System validates the submitted data
6. Changes are saved
7. Published changes become visible to eligible ordering channels
8. Relevant audit records are created

### What can go wrong?

| Scenario | What happens |
|---|---|
| H1 — Item becomes unavailable | New orders cannot include the unavailable item. Existing accepted orders remain historically accurate. Staff are notified per the operational workflow. |
| H2 — Price changes | New orders use the new price. Existing order snapshots retain their original prices. |
| H3 — Item is deactivated | Historical records remain available. Item cannot be selected for new orders. |

### Result (Postconditions)
- Current menu reflects authorized changes
- Historical orders remain intact
- Actor and relevant changes are traceable

---

## 11. Journey I — Administrator Manages Inventory

**Goal:** Track ingredient stock and connect consumption to menu-item sales.

### Main Flow

1. Administrator opens inventory management
2. Administrator creates an ingredient with its unit of measurement
3. Administrator records an opening stock balance or stock receipt
4. Administrator defines a recipe for a menu item
5. System validates units and recipe quantities
6. Eligible order events trigger stock deductions per approved policy
7. Each deduction creates a stock movement record
8. Authorized staff record wastage, corrections, or physical stock counts
9. System calculates the resulting stock balance
10. Administrator reviews inventory movements and discrepancies

### What can go wrong?

| Scenario | What happens |
|---|---|
| I1 — Insufficient stock | System applies the configured availability policy. Does not silently accept an order that violates a stock constraint. |
| I2 — Order is cancelled | Inventory is reversed or retained per the cancellation and preparation policy. Historical movements remain traceable. |
| I3 — Recipe changes | New applicable transactions use the correct recipe version. Historical consumption is not silently recalculated. |
| I4 — Incorrect stock adjustment | An authorized correction creates a new traceable movement. Original adjustment is not erased. |

### Result (Postconditions)
- Stock balances reflect recorded movements
- Recipe-based consumption is traceable
- Historical movements can be reconciled

---

## 12. Cross-Workflow Business Rules

These rules apply across all workflows:

| Rule | Description |
|---|---|
| WF-BR-001 Shared Order System | QR orders, waiter-assisted orders, and pre-orders all use the same core validation and pricing rules |
| WF-BR-002 Transaction Integrity | Records that must succeed together are persisted transactionally |
| WF-BR-003 Idempotency | Order submissions and financial events safely handle retries and duplicate delivery |
| WF-BR-004 Reservation Concurrency | Availability is revalidated when confirming a reservation, not just when displaying slots |
| WF-BR-005 Payment Separation | Order, kitchen, bill, and payment statuses are separate concepts with explicit relationships |
| WF-BR-006 Historical Accuracy | Menu price, recipe, and availability changes do not silently rewrite historical order or financial records |
| WF-BR-007 Authorization | All privileged operations are enforced server-side |
| WF-BR-008 Auditable Corrections | Financial, inventory, and sensitive admin corrections preserve traceable history |
| WF-BR-009 Failure Recovery | Interface distinguishes a confirmed operation from one with an unknown result due to timeout or connection failure |
| WF-BR-010 Restaurant Isolation | Every workflow enforces ownership and authorization boundaries for the relevant restaurant |

---

## 13. State Definitions

These state machines must be finalized before architecture and database design are approved.

### Order States
- Draft
- Submitted
- Accepted
- Rejected
- In Preparation
- Ready
- Served / Fulfilled
- Cancelled
- Completed

> Final design must define which states apply to advance orders vs. dine-in orders, and how partial fulfilment is represented.

### Kitchen Ticket States
- Queued
- Accepted
- Preparing
- Ready
- Cancelled

> Item-level status must be supported where the preparation workflow requires it.

### Reservation States
- Pending Verification
- Pending Confirmation
- Confirmed
- Checked In
- Seated
- Cancelled
- Completed
- No-show
- Expired

> Final design must define whether "checked in" and "seated" are distinct and how they interact with table service sessions.

### Payment States
- Pending
- Processing
- Successful
- Failed
- Partially Refunded
- Refunded

> Final design must define how multiple payments, partial payments, and refunds affect the bill's outstanding balance.

### Bill States
- Draft
- Finalized
- Partially Paid
- Settled
- Voided

> A voided bill must remain traceable and must not erase its associated financial history.

> **Note:** These are proposals, not final implementation enums. The next design stage defines allowed transitions and guards.

---

## 14. Test Scenarios Required

These scenarios must be covered in test planning:

1. Customer submits a valid QR order
2. Customer retries an order after a timeout
3. Two customers attempt to reserve the same table concurrently
4. An item becomes unavailable during checkout
5. Kitchen receives an order with multiple preparation stages
6. A waiter modifies an order while kitchen preparation is in progress
7. An online payment fails after order submission
8. A successful payment notification is delivered more than once
9. A customer abandons a reservation after a temporary hold is created
10. A reservation is checked in and assigned to an eligible table
11. A menu price changes while an older order is still active
12. An order cancellation affects inventory
13. A staff member attempts an operation outside their permissions
14. A staff device reconnects after missing live updates
15. A bill is partially paid and later settled

Each scenario needs: expected state changes, persistence expectations, user-visible feedback, and audit requirements.

---

## 15. Open Decisions (Must be resolved)

1. Are advance pre-orders paid in full, on arrival, or configurable?
2. Are table orders grouped into one bill by default or can they be billed separately?
3. Can multiple customers order against the same table session without authentication?
4. Which order modifications are permitted after kitchen acceptance?
5. When is ingredient stock deducted, and how is waste recorded?
6. Are deposits refundable? How do cancellation deadlines work?
7. How are table capacity and reservation duration configured?
8. Is item readiness or whole-ticket readiness the default kitchen workflow?
9. What happens when the restaurant loses internet?
10. Which bill, tax, discount, and refund policies are supported in the MVP?

---

## 16. Approval Criteria

This document can be approved when:
- Every primary user journey has been reviewed
- Success and failure paths are defined for core operations
- Cross-workflow business rules are understood
- Proposed states and transitions are clear enough for UX design
- Open decisions have been resolved or assigned for resolution
- Workflows are consistent with the PRD

> **Approval does not authorize coding.** Next step: define the page-by-page information architecture, navigation, screen requirements, and UI states.

---

**End of Document 03 — User Journeys & Business Workflows**