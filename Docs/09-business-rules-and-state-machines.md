# Document 09 — Business Rules, State Machines & Transaction Invariants

**Project:** Restaurant OS  
**Document Type:** Domain Rules and State Design  
**Version:** 0.1 — Draft  
**Status:** Proposed; pending review  
**Scope:** Orders, kitchen operations, tables, reservations, billing, payments, and inventory

---

## 1. Purpose

This document defines the rules that govern restaurant operations independently of the UI or API implementation.

It establishes:

- Permitted states and state transitions.
- Business invariants that must never be violated.
- Transaction boundaries.
- Concurrency requirements.
- Cancellation and failure behavior.
- Cross-module rules for orders, bills, payments, and stock.
- Acceptance criteria for domain-level testing.

The purpose is to ensure that the application behaves consistently regardless of whether an action originates from a customer, waiter, kitchen employee, manager, payment provider, or background job.

## 2. Core Domain Principles

### BR-001: The server is authoritative

The backend determines whether an operation is valid.

The frontend may display available actions, but the backend must revalidate every business rule before committing a change.

### BR-002: Every transition must be valid

A resource cannot move directly from one state to another unless that transition is explicitly allowed.

For example, a kitchen ticket cannot become `READY` if it has not entered an eligible preparation state.

### BR-003: Historical records must remain explainable

Important operational changes must preserve history.

Completed orders, finalized bills, payment events, refunds, stock movements, and audit records must not be silently rewritten or deleted.

### BR-004: Retries must not duplicate effects

Repeating the same logical request must not create a second order, reservation, payment, refund, or inventory movement.

### BR-005: Financial truth must be consistent

Order totals, bill totals, payment records, refunds, and reconciliation data must agree according to explicitly defined rules.

### BR-006: Restaurant boundaries must be enforced

A business operation must never combine resources belonging to different restaurants.

### BR-007: Derived state must have an authoritative source

If a value is derived from other records, the application must define how it is calculated and kept consistent.

Examples include available stock, outstanding bill balance, and reservation capacity.

---

## 3. State Machine Notation

Each state machine defines:

- **Initial state:** The state when a resource is first created.
- **Transition:** A permitted change from one state to another.
- **Guard:** A condition that must be satisfied before the transition.
- **Side effect:** An additional operation triggered by the transition.
- **Terminal state:** A state from which ordinary transitions are no longer permitted.

All state changes must be validated by the backend.

A failed transition must leave the resource in its previous valid state.

Where a transition triggers several database changes, those changes must be committed atomically when they form one business operation.

External side effects, such as sending an SMS or publishing an event, must be handled safely so that a failed external call does not leave the database in an inconsistent state.

---

## 4. Order State Machine

### 4.1 Proposed states

| State | Meaning |
|---|---|
| `PLACED` | Order has been accepted by the application for processing |
| `CONFIRMED` | Restaurant has confirmed the order, if confirmation is required |
| `IN_PREPARATION` | Preparation has begun |
| `READY` | The order is ready for the next fulfillment step |
| `SERVED` | The order has been served or handed over |
| `COMPLETED` | The order's fulfillment lifecycle is complete |
| `CANCELLED` | The order has been cancelled under an approved rule |

This is a proposed shared lifecycle. Pre-orders, at-table orders, and takeaway orders may require different allowed transitions.

The final state machine must be approved before implementation.

### 4.2 Proposed transitions

| From | To | Condition |
|---|---|---|
| Creation | `PLACED` | Request is valid and the order is persisted |
| `PLACED` | `CONFIRMED` | Confirmation is required and authorized |
| `PLACED` | `IN_PREPARATION` | Direct preparation is allowed by the configured workflow |
| `CONFIRMED` | `IN_PREPARATION` | Kitchen workflow permits preparation |
| `IN_PREPARATION` | `READY` | Required preparation is complete |
| `READY` | `SERVED` | Handover or serving is recorded |
| `SERVED` | `COMPLETED` | Fulfillment completion conditions are satisfied |
| Eligible active state | `CANCELLED` | Cancellation policy permits it |

No other transitions are allowed unless explicitly approved.

### 4.3 Order creation rules

**BR-ORDER-001:** An order must belong to exactly one restaurant.

**BR-ORDER-002:** An order must have a valid order type and source.

Proposed order types:

- `PRE_ORDER`
- `AT_TABLE`

Proposed sources:

- `WEB`
- `QR`
- `WAITER`

Takeaway or delivery should be added only if the MVP explicitly includes those fulfillment modes.

**BR-ORDER-003:** Every order item must reference a valid menu item and capture an immutable snapshot of the relevant product details and price.

**BR-ORDER-004:** The server calculates all prices, taxes, discounts, and totals.

**BR-ORDER-005:** Quantity must be within configured business limits.

**BR-ORDER-006:** Submitted modifiers must be valid for the selected menu item.

**BR-ORDER-007:** The server must revalidate item availability at order submission time.

**BR-ORDER-008:** A QR order must reference a valid table context and satisfy the approved guest-access policy.

**BR-ORDER-009:** A pre-order must follow its scheduling and confirmation rules. It must not be released to the kitchen earlier than permitted by those rules.

**BR-ORDER-010:** Repeated requests using the same idempotency key and request fingerprint must not create duplicate orders.

### 4.4 Order modification rules

After order submission, modifications must be restricted according to the order's state.

Proposed policy:

- Before preparation begins: modifications may be permitted.
- After preparation begins: modifications require an explicitly approved workflow.
- After fulfillment or cancellation: ordinary modification is prohibited.

If an item must be removed after preparation begins, the system must define whether to cancel the item, create an adjustment, record waste, or apply another approved process.

The application must not silently rewrite the original order to conceal an operational change.

### 4.5 Order cancellation rules

Cancellation must validate:

- Current order state.
- Cancellation policy.
- Preparation progress.
- Customer or staff authorization.
- Relevant payment state.

Cancellation is not equivalent to refund.

If a payment has already succeeded, cancellation may require a separate refund operation.

If the order is already completed, an ordinary cancellation request must be rejected. Any correction must use an approved adjustment or refund workflow.

### 4.6 Order invariants

- Order totals must reconcile with the stored line-item snapshots and approved pricing rules.
- An order cannot belong to multiple restaurants.
- A completed order cannot return to an active preparation state through an ordinary transition.
- A cancelled order cannot continue through the normal fulfillment lifecycle.
- A customer cannot modify another customer's order without authorized access.
- Order status history must reflect every accepted state transition.

---

## 5. Kitchen Ticket State Machine

Kitchen tickets represent preparation work generated from eligible orders.

### 5.1 Proposed states

| State | Meaning |
|---|---|
| `QUEUED` | Awaiting kitchen action |
| `ACCEPTED` | A kitchen worker has accepted the work |
| `IN_PROGRESS` | Preparation is underway |
| `READY` | The ticket's required items are ready |
| `CANCELLED` | Preparation work has been cancelled through an approved process |

### 5.2 Proposed transitions

| From | To | Condition |
|---|---|---|
| Creation | `QUEUED` | Eligible order items are accepted for preparation |
| `QUEUED` | `ACCEPTED` | Authorized kitchen action |
| `ACCEPTED` | `IN_PROGRESS` | Preparation begins |
| `QUEUED` or `ACCEPTED` | `IN_PROGRESS` | Direct start is permitted by the workflow |
| `IN_PROGRESS` | `READY` | Required ticket items are complete |
| Eligible state | `CANCELLED` | Cancellation is authorized and operationally valid |

### 5.3 Kitchen rules

**BR-KITCHEN-001:** A ticket must be associated with the correct restaurant and kitchen station.

**BR-KITCHEN-002:** Only authorized kitchen staff or management may change kitchen state.

**BR-KITCHEN-003:** A ticket cannot become ready while required items remain incomplete.

**BR-KITCHEN-004:** Ticket history must preserve accepted transitions and relevant actors.

**BR-KITCHEN-005:** A cancelled order must not continue generating ordinary preparation work.

**BR-KITCHEN-006:** Cancellation of an order already in preparation must follow the approved kitchen cancellation policy.

**BR-KITCHEN-007:** Repeated order events must not create duplicate kitchen tickets for the same intended work.

### 5.4 Partial preparation

A multi-item order may contain items with different preparation times or kitchen stations.

The domain model must distinguish:

- Item-level preparation state.
- Ticket-level preparation state.
- Overall order fulfillment state.

The overall order must not become `READY` merely because one ticket is ready when other required items remain incomplete.

Whether tickets are grouped by station, course, or another rule remains an implementation decision.

---

## 6. Table and Service Session Rules

A physical table and a service session are separate concepts.

A table identifies a seating location. A session represents an active period of service associated with that location.

### 6.1 Proposed session states

- `OPEN`
- `CLOSING`
- `CLOSED`

`CLOSING` may be unnecessary if the system can perform closure atomically. Its inclusion remains open.

### 6.2 Session rules

**BR-TABLE-001:** A table belongs to one restaurant.

**BR-TABLE-002:** A table cannot have two conflicting active service sessions if the approved model permits only one active session per table.

**BR-TABLE-003:** Opening a session must validate table status and any relevant reservation or seating rules.

**BR-TABLE-004:** Closing a session must verify the approved requirements for outstanding orders, bills, and payments.

**BR-TABLE-005:** A closed session cannot accept new orders through its ordinary QR context.

**BR-TABLE-006:** A session must not be closed while required business operations remain unresolved, unless an explicitly authorized exception exists.

**BR-TABLE-007:** Concurrent attempts to open or close a session must produce a single valid result rather than conflicting sessions.

### 6.3 Table status versus session status

The physical table's operational status must not be treated as interchangeable with the session state.

For example, a table can be physically unavailable for cleaning even though its previous service session is closed.

The final model must define whether table status is stored independently or derived from sessions and maintenance conditions.

### 6.4 Multiple customers and multiple orders

The application must explicitly decide whether:

- Several customers can place orders into one session.
- Waiters can add orders to an existing session.
- One customer can split their order from the rest of the table.
- A session can have multiple bills.
- Multiple tables can be joined into one party or service session.

These capabilities must not be assumed until their data and transaction rules are approved.

---

## 7. Reservation State Machine

### 7.1 Proposed states

| State | Meaning |
|---|---|
| `PENDING_VERIFICATION` | Required customer verification is incomplete |
| `PENDING_PAYMENT` | Required deposit has not been confirmed |
| `CONFIRMED` | Reservation is confirmed |
| `CHECKED_IN` | Guest has arrived and been checked in |
| `SEATED` | Guest has been seated |
| `COMPLETED` | Reservation visit has concluded |
| `CANCELLED` | Reservation has been cancelled |
| `NO_SHOW` | Guest did not arrive within the approved policy |

Not every reservation needs every state. The final workflow depends on whether verification and deposits are mandatory for a particular booking.

### 7.2 Proposed transitions

| From | To | Condition |
|---|---|---|
| Creation | `PENDING_VERIFICATION` | Verification is required |
| Creation | `PENDING_PAYMENT` | Verification is complete and a deposit is required |
| Creation | `CONFIRMED` | All required booking conditions are satisfied |
| `PENDING_VERIFICATION` | `PENDING_PAYMENT` | Verification succeeds and a deposit is required |
| `PENDING_VERIFICATION` | `CONFIRMED` | Verification succeeds and no deposit is required |
| `PENDING_PAYMENT` | `CONFIRMED` | Deposit is confirmed or an approved exception applies |
| `CONFIRMED` | `CHECKED_IN` | Authorized staff checks in the guest |
| `CHECKED_IN` | `SEATED` | Seating is recorded |
| `SEATED` | `COMPLETED` | Visit concludes |
| `CONFIRMED` | `CANCELLED` | Cancellation is permitted |
| `CONFIRMED` | `NO_SHOW` | Approved no-show criteria are met |

Expired or abandoned pending reservations require a defined cleanup policy.

### 7.3 Reservation creation rules

**BR-RES-001:** Reservation creation must validate the restaurant's operating hours and booking rules.

**BR-RES-002:** Party size must be within configured limits.

**BR-RES-003:** The requested time must be valid in the restaurant's local time zone.

**BR-RES-004:** The server must revalidate capacity during the final reservation transaction.

**BR-RES-005:** An availability search does not reserve capacity.

**BR-RES-006:** OTP verification must be bound to the intended verification purpose and customer context.

**BR-RES-007:** Required deposits must be confirmed using a trusted payment workflow.

**BR-RES-008:** A repeated reservation request must not create duplicate reservations.

**BR-RES-009:** Reservation status history must be preserved.

### 7.4 Capacity and concurrency

The system must define how reservation capacity is calculated.

Potential factors include:

- Number of tables.
- Table seating capacity.
- Party size.
- Reservation duration.
- Preparation or turnover buffer.
- Combined-table arrangements.
- Walk-in occupancy.
- Existing active reservations.

A successful availability search must not be treated as a lock or a guarantee.

The final creation operation must enforce the approved capacity policy using an appropriate transactional strategy.

### 7.5 Cancellation and no-show rules

Cancellation and no-show policies must specify:

- Permitted cancellation window.
- Deposit refund eligibility.
- Late cancellation treatment.
- Grace period before no-show classification.
- Who may override a no-show decision.
- How exceptional cases are recorded.

The system must not automatically charge or forfeit a deposit without a clearly defined policy and the required payment-provider support.

---

## 8. Billing State Machine

### 8.1 Proposed states

- `DRAFT`
- `FINALIZED`
- `PARTIALLY_PAID`
- `PAID`
- `VOIDED`

A bill may require additional states for failed settlement or disputed transactions, but these should be introduced only when their semantics are defined.

### 8.2 Proposed transitions

| From | To | Condition |
|---|---|---|
| Creation | `DRAFT` | Bill is created |
| `DRAFT` | `FINALIZED` | Totals and bill items are validated and frozen |
| `FINALIZED` | `PARTIALLY_PAID` | Confirmed payments are below the amount due |
| `FINALIZED` | `PAID` | Confirmed payments settle the required amount |
| `PARTIALLY_PAID` | `PAID` | Remaining amount is settled |
| Eligible state | `VOIDED` | Authorized void operation satisfies business rules |

The transition to `PAID` must be determined from authoritative payment and bill data, not from a client-submitted status.

### 8.3 Billing rules

**BR-BILL-001:** A bill must belong to one restaurant.

**BR-BILL-002:** Bill line items must preserve the relevant item descriptions, quantities, and prices used at billing time.

**BR-BILL-003:** Bill totals must be calculated by the backend.

**BR-BILL-004:** A finalized bill must not be silently edited.

**BR-BILL-005:** Corrections to a finalized bill must use an approved adjustment, void, or replacement process.

**BR-BILL-006:** A bill must not include unrelated orders or sessions.

**BR-BILL-007:** A bill must not be marked paid merely because a payment was initiated.

**BR-BILL-008:** Payment allocations must not exceed the permitted amount due.

**BR-BILL-009:** Tax, discount, service-charge, and rounding rules must be consistent and auditable.

### 8.4 Outstanding balance

The application must define a single authoritative calculation for the amount still payable.

Conceptually:

Outstanding balance = finalized amount due − valid payment allocations + applicable approved adjustments.

The exact treatment of refunds, reversals, credits, tips, and service charges must be specified in the financial rules.

A refund does not automatically mean the original bill was never paid. Payment history and refund history must remain separately visible.

### 8.5 Bill cardinality decisions

Before implementation, decide:

- Whether one bill can include multiple orders.
- Whether one session can have multiple bills.
- Whether split bills are required.
- Whether multiple payments can settle one bill.
- Whether one payment can be allocated across multiple bills.

These decisions affect database constraints, API contracts, and transaction logic.

---

## 9. Payment State Machine

### 9.1 Proposed states

| State | Meaning |
|---|---|
| `INITIATED` | Payment attempt has been created |
| `PENDING` | Waiting for provider or collection confirmation |
| `SUCCEEDED` | Payment has been confirmed |
| `FAILED` | Attempt failed |
| `CANCELLED` | Attempt was cancelled before successful completion |
| `REFUND_PENDING` | A refund operation is in progress, if modeled at payment level |
| `PARTIALLY_REFUNDED` | Some permitted amount has been refunded |
| `REFUNDED` | The refundable amount has been fully refunded |

The payment and refund lifecycles should remain distinct where necessary. A single payment may have several refund attempts or events, so refund status must not erase the payment's original outcome.

### 9.2 Payment rules

**BR-PAY-001:** Every payment belongs to the correct restaurant and references the relevant bill or approved payable resource.

**BR-PAY-002:** The server determines the payable amount and currency.

**BR-PAY-003:** An initiated payment is not a successful payment.

**BR-PAY-004:** Online payment success requires trusted provider confirmation.

**BR-PAY-005:** Cash payment success requires the approved staff collection workflow.

**BR-PAY-006:** Duplicate provider events must not create duplicate payment effects.

**BR-PAY-007:** Out-of-order provider events must not incorrectly reverse a verified successful outcome.

**BR-PAY-008:** Refunds must reference an eligible original payment.

**BR-PAY-009:** The cumulative refund amount must not exceed the permitted refundable amount.

**BR-PAY-010:** Payment and refund operations must be auditable.

### 9.3 Failed and uncertain payments

A provider timeout does not necessarily mean the payment failed. The provider may have processed the payment even if the application did not receive the confirmation.

In uncertain cases, the system must use a documented verification or reconciliation workflow instead of immediately creating a new charge.

The UI should communicate uncertainty clearly and avoid encouraging repeated payment attempts that could result in duplicate charges.

### 9.4 Payment and bill consistency

A bill can be marked paid only when the required confirmed payment allocations satisfy the approved settlement rules.

A failed payment must not increase the amount collected.

A refund must update the relevant refund and financial records without deleting the original payment event.

---

## 10. Inventory State and Movement Rules

Inventory is primarily represented through stock movements rather than a freely editable quantity field.

### 10.1 Proposed movement types

- `RECEIPT`
- `CONSUMPTION`
- `WASTE`
- `ADJUSTMENT_INCREASE`
- `ADJUSTMENT_DECREASE`
- `RETURN_TO_SUPPLIER`
- `REVERSAL`

The final list must be limited to supported operational workflows.

### 10.2 Inventory rules

**BR-INV-001:** Every stock movement must reference a valid ingredient and restaurant.

**BR-INV-002:** Quantities must use an approved unit and precision.

**BR-INV-003:** Stock movements must be recorded as auditable events.

**BR-INV-004:** Historical movements must not be silently overwritten.

**BR-INV-005:** Corrections should generally use compensating movements.

**BR-INV-006:** Repeated requests must not duplicate stock movements.

**BR-INV-007:** Ingredient unit conversions must follow approved conversion rules.

**BR-INV-008:** Recipe changes must not silently rewrite historical stock consumption.

### 10.3 Recipe-based consumption

When recipes are used to estimate ingredient consumption, the system must define:

- Which menu items have recipes.
- Whether ingredient quantities represent raw or prepared quantities.
- Whether wastage factors are included.
- When consumption is recorded.
- How cancellations and failed fulfillment are handled.
- How recipe version changes affect future orders.

A proposed recipe-based calculation is:

Ingredient consumption = fulfilled quantity × approved recipe quantity per item, adjusted according to the configured recipe and yield rules.

This is a conceptual rule, not a finalized formula for every ingredient.

### 10.4 Negative stock

The business must explicitly decide whether negative stock is permitted.

If negative stock is prohibited, the application must validate available stock and protect against concurrent deductions.

If negative stock is permitted for operational continuity, the system must make shortages visible and auditable.

The application must not produce contradictory stock balances when two operations occur simultaneously.

---

## 11. Transaction Boundaries

A transaction boundary defines which database changes must succeed or fail together.

### 11.1 Order creation

The order creation transaction should include:

- Validated order header.
- Order-item snapshots.
- Modifier snapshots or references as defined by the schema.
- Initial order history.
- Required idempotency record linkage.

Any additional record that is a required part of successful order creation must be included or handled through a durable, recoverable process.

### 11.2 Kitchen ticket creation

If order acceptance requires kitchen tickets to exist, the database operation must ensure the order and its required preparation work cannot become inconsistent.

If asynchronous ticket creation is selected, the system must use a durable mechanism and provide recovery for failed processing.

### 11.3 Reservation creation

The reservation transaction must include:

- Capacity validation or protected allocation.
- Reservation creation.
- Initial history.
- Relevant idempotency record linkage.

A reservation must not be confirmed if its required capacity allocation fails.

### 11.4 Bill finalization

Bill finalization must atomically preserve the finalized line items, calculated totals, state transition, and history.

After finalization, corrections must use the approved financial adjustment workflow.

### 11.5 Payment processing

The application must separate its database transaction from external provider communication.

A proposed workflow is:

1. Validate the bill and payment request.
2. Create a pending payment record and idempotency linkage.
3. Commit the local transaction.
4. Communicate with the provider.
5. Persist the resulting provider reference and outcome safely.
6. Process later provider events through a verified, deduplicated handler.

The implementation must handle failures between these steps and define reconciliation behavior.

### 11.6 Inventory movements

A stock movement and its required balance projection or inventory summary update must remain consistent.

If a business operation deducts stock as part of another operation, the transaction boundary and failure behavior must be explicitly documented.

---

## 12. Cross-Module Invariants

The following rules apply across the application.

### INV-001: Restaurant ownership

Related resources must belong to the correct restaurant. Cross-restaurant references must be rejected.

### INV-002: Order-to-kitchen consistency

Only eligible order items generate preparation work. Duplicate events must not create duplicate work.

### INV-003: Order-to-bill consistency

Only eligible orders may be included in a bill, according to the approved billing model.

### INV-004: Bill-to-payment consistency

Payment allocations must reference valid payable records and respect their outstanding balances.

### INV-005: Payment-to-refund consistency

A refund must reference an eligible original payment and stay within the permitted refundable balance.

### INV-006: Reservation capacity

Confirmed reservations must respect the approved capacity-allocation policy.

### INV-007: Table-session uniqueness

If the product model permits only one active session per table, the database and application must enforce that rule under concurrency.

### INV-008: Inventory integrity

Recorded stock movements must reconcile with the authoritative stock balance.

### INV-009: History integrity

Every accepted critical state transition must have a corresponding history record.

### INV-010: Idempotency

A retried logical operation must not duplicate its business effects.

### INV-011: Authorization

A valid state transition does not imply every user may perform it. Authorization must be checked separately.

### INV-012: Financial immutability

Finalized financial records must be corrected through explicit, auditable operations rather than silent edits.

---

## 13. Concurrency Failure Scenarios

The following scenarios must be tested before release.

| Scenario | Required outcome |
|---|---|
| Two customers reserve the last available capacity | No overbooking beyond the approved capacity policy |
| Two waiters open the same table simultaneously | Only a valid session outcome is committed |
| Two requests submit the same order with the same idempotency key | One logical order is created |
| Two different requests compete for the same limited stock | Stock remains consistent with the approved stock policy |
| Two payment callbacks report the same event | The payment effect is applied once |
| A delayed payment event arrives after a newer event | State remains consistent with the provider's authoritative outcome |
| Two staff members attempt conflicting order transitions | Invalid or stale transitions are rejected |
| A bill is finalized while another request tries to modify it | Finalized financial values remain consistent |
| A refund is requested twice | Duplicate refunds are prevented |
| A table session closes while an order is being submitted | The system resolves the race without accepting an order into an invalid session |

The exact locking, uniqueness constraints, version checks, and retry strategies belong in the implementation design, but the required outcomes are domain requirements.

---

## 14. Failure and Recovery Rules

### 14.1 Database failure

If a required transaction fails, the application must not report the operation as successfully committed.

Partial database writes must be rolled back when they belong to the same transaction.

### 14.2 External provider failure

An SMS or payment-provider outage must not corrupt the underlying reservation or payment records.

The application must distinguish between:

- Confirmed failure.
- Temporary failure.
- Unknown outcome requiring reconciliation.

### 14.3 Event publication failure

If a committed business operation requires an event, the system must have a defined retry or recovery mechanism.

An event publication failure must not silently erase the committed business operation.

### 14.4 Background job failure

Background jobs must be safe to retry, observable, and designed to avoid duplicate business effects.

Dead-letter or manual recovery procedures may be introduced where repeated retries cannot safely resolve a failure.

### 14.5 Manual correction

Administrative overrides must require appropriate permissions, preserve history, and record a reason when the operation is material.

---

## 15. Domain-Level Acceptance Tests

The following acceptance tests are required for the corresponding MVP modules.

### Orders and kitchen

- [ ] Valid order creation creates exactly one order.
- [ ] Invalid items or modifiers are rejected.
- [ ] Unavailable menu items cannot be ordered.
- [ ] Invalid order transitions are rejected.
- [ ] Cancellation follows the approved policy.
- [ ] Duplicate order submissions do not create duplicate orders.
- [ ] Kitchen tickets reflect the correct eligible order items.
- [ ] An order is not marked ready while required items remain incomplete.

### Tables and reservations

- [ ] Closed sessions cannot accept ordinary new QR orders.
- [ ] Conflicting active table sessions cannot be created.
- [ ] Availability searches do not reserve capacity.
- [ ] Concurrent reservation attempts respect capacity.
- [ ] Expired OTP verification cannot authorize reservation creation.
- [ ] Cancellation and no-show rules are applied consistently.

### Billing and payments

- [ ] The server recalculates bill totals.
- [ ] Finalized bills cannot be silently edited.
- [ ] Failed payments do not settle a bill.
- [ ] Duplicate payment events do not duplicate financial effects.
- [ ] Refunds cannot exceed the permitted refundable amount.
- [ ] Payment timeouts trigger the defined recovery process.

### Inventory

- [ ] Stock movements preserve history.
- [ ] Duplicate movement requests do not duplicate stock.
- [ ] Unit conversions follow the approved rules.
- [ ] Concurrent stock changes do not produce inconsistent balances.
- [ ] Recipe updates do not rewrite historical consumption.

### Cross-module integrity

- [ ] Cross-restaurant references are rejected.
- [ ] Critical state changes produce history records.
- [ ] Retried business operations remain idempotent.
- [ ] Financial records reconcile according to the approved rules.

---

## 16. Decisions Required Before Implementation

The following decisions remain open and must be tracked explicitly.

1. Does every order require restaurant confirmation?
2. Can orders be modified after submission?
3. What are the exact cancellation rules for each order type?
4. How are pre-orders scheduled and released to the kitchen?
5. Can one order generate multiple kitchen tickets?
6. Are partial fulfillment and item-level cancellation in MVP?
7. Can multiple customers order through the same table session?
8. Can tables be combined?
9. Is a separate `CLOSING` table-session state necessary?
10. How are reservation capacity and overlapping durations calculated?
11. When does a reservation require a deposit?
12. Can a reservation be confirmed before a required deposit succeeds?
13. Can one bill contain multiple orders?
14. Can one session have multiple bills?
15. Are split bills and split payments in MVP?
16. Which payment and refund transitions are required?
17. When is inventory consumed relative to kitchen preparation?
18. Are negative stock balances permitted?
19. Which manual overrides require managerial approval?
20. Which failures require automatic retry, reconciliation, or manual intervention?

These decisions affect the product requirements, API contracts, database constraints, and test plan.

---

## 17. Final Status

**Document 09 is a proposed domain rules and state-machine specification.**

It defines the operational outcomes the application must preserve while leaving unresolved business policies visible for review.

Before implementation, reconcile this document with:

- Document 02 — Product Requirements.
- Document 03 — User Journeys and Workflows.
- Document 05 — System Architecture.
- Document 06 — Database Design and ERD.
- Document 07 — API Specification and Contract Design.
- Document 08 — Authentication, Authorization & Security Design.

No state, transaction, or policy should be implemented merely because it appears in a proposed example. The corresponding business rule must be approved first.

**Next document:** Document 10 — Error Handling, Observability & Operational Reliability.
