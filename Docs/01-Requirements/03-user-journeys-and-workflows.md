# Restaurant OS — User Journeys & Business Workflows

**Document ID:** ROS-UJW-003  
**Version:** 1.0  
**Status:** Draft — Pending Review  
**Parent Documents:**
- 01-product-discovery.md
- 02-product-requirements.md

---

## 1. Purpose

This document defines the end-to-end user journeys and business workflows for Restaurant OS.

It describes how customers, waiters, kitchen staff, cashiers, and administrators interact with the system, including successful flows, alternative paths, error conditions, and important edge cases.

These workflows will guide UX design, system architecture, database design, API contracts, and testing.

## 2. Actors

### ACT-01: Customer
Browses menus, places orders, reserves tables, tracks progress, and pays bills.

### ACT-02: Waiter
Manages tables, creates orders, communicates customer requests, and coordinates service.

### ACT-03: Kitchen Staff
Receives preparation tickets, prepares food, and updates readiness.

### ACT-04: Cashier
Generates bills, records cash payments, and reconciles online payments.

### ACT-05: Restaurant Administrator
Manages menus, tables, staff, restaurant settings, and inventory.

### ACT-06: Payment Provider
Processes online payment requests and sends verified payment events.

### ACT-07: OTP Provider
Delivers verification codes for reservation and other approved phone-verification workflows.

---

## 3. Journey A — Customer Places an Advance Pre-Order

### Objective

Allow a customer to order food before arriving at the restaurant for an eligible future time.

### Preconditions

- The restaurant is accepting pre-orders.
- The menu contains eligible items.
- The requested time is within the permitted ordering window.
- Required customer information has been collected.

### Main Flow

1. Customer opens the restaurant's ordering page.
2. System displays the published menu.
3. Customer selects items and permitted modifiers.
4. Customer adjusts quantities and reviews the cart.
5. Customer selects an eligible pickup or service time.
6. System validates item availability, quantities, lead time, and ordering rules.
7. System calculates the total using authoritative server-side prices.
8. Customer enters the required contact information.
9. Customer selects an available payment option.
10. If online payment is required at this stage, the system initiates payment through the configured provider.
11. The server validates the final request and creates the order transactionally.
12. The system returns an order reference and the current order status.
13. Customer can revisit the order status page.

### Alternative Flows

**A1 — Item becomes unavailable**

- System rejects the unavailable item or requests that the customer update the cart.
- No invalid order is accepted.
- Customer receives a clear explanation.

**A2 — Requested time is unavailable**

- System rejects the requested slot.
- Customer selects another eligible time.

**A3 — Payment fails**

- The order and payment states remain consistent with the configured payment policy.
- Customer receives a retry or cancellation option.
- A failed payment is never represented as a successful payment.

**A4 — Duplicate submission**

- A retry using the same idempotency key returns the existing logical result.
- A second order is not created for the same submission.

**A5 — Customer leaves before receiving confirmation**

- Customer can retrieve the order through an authorized recovery method.
- The system must not assume that a missing confirmation means the transaction failed.

### Postconditions

- The order has a unique reference.
- The order has an explicit status.
- Item and price snapshots are preserved.
- Payment state is recorded separately from order state.
- Required audit records are available.

---

## 4. Journey B — Customer Orders Through a Table QR Code

### Objective

Allow a seated customer to order from their table without waiting for a waiter to manually enter every item.

### Preconditions

- The table exists and is active.
- The QR link resolves to the correct restaurant and table.
- The restaurant permits QR ordering.
- The table is eligible to accept orders under the configured service rules.

### Main Flow

1. Customer scans the table QR code.
2. System opens the restaurant's table-specific ordering page.
3. System displays the menu and current item availability.
4. Customer adds items, quantities, modifiers, and permitted notes.
5. Customer reviews the cart.
6. System validates the table context and order contents.
7. Server calculates the total.
8. Customer submits the order.
9. Server creates the order and associated order items transactionally.
10. System confirms the order reference and current status.
11. The kitchen receives the relevant preparation ticket.
12. Customer can view order progress.
13. Customer may place another order during the same table service session if permitted.

### Alternative Flows

**B1 — Invalid or inactive QR context**

- System does not accept the order.
- Customer receives an explanation and instructions to contact staff.

**B2 — Table is no longer eligible**

- System prevents order submission or requests staff assistance.
- It must not silently associate the order with a different table.

**B3 — Item becomes unavailable**

- System revalidates the item during submission.
- The unavailable item is not silently accepted.

**B4 — Customer submits twice**

- Duplicate requests are handled through idempotency.
- The same logical order is not created twice.

**B5 — Internet connection drops**

- The customer is shown an uncertain or failed submission state rather than a false confirmation.
- On retry, the system checks the existing submission before creating another order.

**B6 — Customer requests assistance**

- The system creates an assistance request if that feature is enabled.
- Authorized staff can see and resolve the request.

### Postconditions

- The accepted order is associated with the correct restaurant and table.
- Kitchen work is created for eligible items.
- Order and payment states remain separate.
- Historical order details are preserved.

---

## 5. Journey C — Waiter Creates and Manages an Order

### Objective

Allow staff to serve customers who prefer waiter-assisted ordering.

### Main Flow

1. Waiter signs in.
2. System displays authorized restaurant operations.
3. Waiter selects a table or permitted ordering context.
4. System shows the table's active service session, if one exists.
5. Waiter creates an order or adds a permitted order to the session.
6. Waiter selects menu items and modifiers.
7. Server validates the order and calculates the total.
8. Waiter submits the order.
9. Kitchen receives the preparation ticket.
10. Waiter monitors preparation and readiness.
11. Waiter communicates relevant updates to the customer.
12. Waiter requests a bill when appropriate.

### Alternative Flows

**C1 — Table is already in service**

- System offers the existing active service session where permitted.
- It does not create an unrelated session accidentally.

**C2 — Waiter selects an unavailable item**

- System prevents the item from being accepted.
- Waiter can select an alternative.

**C3 — Customer modifies an order**

- The system checks whether the item is still modifiable under its current preparation state.
- An authorized modification creates the appropriate order and kitchen updates.

**C4 — Waiter lacks permission**

- The operation is rejected server-side.
- The system records the event where required by the security policy.

### Postconditions

- The order follows the same validation and pricing rules as a QR order.
- The responsible staff member and relevant timestamps are recorded.
- Kitchen and service information remains consistent.

---

## 6. Journey D — Kitchen Processes an Order

### Objective

Give kitchen staff a clear, reliable view of what must be prepared.

### Main Flow

1. Kitchen staff opens the kitchen interface.
2. System displays incoming tickets for authorized preparation stations.
3. Staff opens a ticket.
4. Ticket displays order reference, item quantities, modifiers, special instructions, and relevant timing information.
5. Staff accepts the ticket.
6. Staff starts preparation.
7. Staff updates item or ticket status as work progresses.
8. Completed items are marked ready.
9. Waiter or customer interface receives the relevant status update.
10. The ticket remains traceable in operational history.

### Alternative Flows

**D1 — Ticket is modified before preparation**

- Kitchen receives the latest valid item details.
- Superseded instructions are clearly identified.

**D2 — Item is cancelled after preparation starts**

- Kitchen receives a cancellation or stop-preparation instruction.
- The system preserves the original event history.
- Any waste or stock adjustment follows the configured inventory policy.

**D3 — One item is ready before the others**

- Item-level readiness is used where enabled.
- The order is not incorrectly marked entirely ready while required items remain in preparation.

**D4 — Kitchen interface disconnects**

- The system retains committed ticket data.
- On reconnection, the interface reloads current persisted state.
- Repeated status updates do not create duplicate operational records.

**D5 — Item is delayed**

- Staff can mark or report the delay using the supported workflow.
- Relevant service users can see the updated status.

### Postconditions

- Valid preparation transitions are recorded.
- Ticket history remains available.
- The customer-facing order status reflects the defined order-state rules.

---

## 7. Journey E — Customer Reserves a Table

### Objective

Allow customers to request and confirm a reservation without creating overlapping confirmed bookings.

### Preconditions

- The restaurant has configured operating hours and reservation policies.
- Eligible reservation capacity is available.
- An OTP verification mechanism is configured.

### Main Flow

1. Customer opens the reservation page.
2. Customer selects date, time, and party size.
3. System calculates eligible availability.
4. Customer selects a permitted reservation option.
5. Customer enters a phone number.
6. System sends an OTP through the configured provider.
7. Customer submits the verification code.
8. System validates the OTP.
9. System revalidates availability and applicable reservation rules.
10. System creates a reservation request or temporary hold, as defined by policy.
11. If a deposit is required, the system initiates the configured payment workflow.
12. The reservation becomes confirmed only when its required confirmation conditions are satisfied.
13. Customer receives a reservation reference and status.
14. Authorized staff can view and manage the booking.

### Alternative Flows

**E1 — Invalid OTP**

- Verification fails.
- The reservation cannot proceed past the required verification gate.

**E2 — OTP expires**

- Customer requests a new code subject to resend limits.
- The expired code cannot verify the request.

**E3 — Availability changes during booking**

- The system rechecks capacity before confirmation.
- It does not confirm an unavailable table.

**E4 — Deposit payment fails**

- The reservation remains in the policy-defined pending or failed state.
- Temporary capacity is released when the hold expires or is cancelled according to policy.

**E5 — Customer abandons the booking**

- Any temporary hold expires under the configured policy.
- Expired holds do not block availability indefinitely.

**E6 — Duplicate reservation request**

- Retries are handled safely.
- The system does not create duplicate reservations for the same logical submission.

### Postconditions

- The reservation has a unique reference and explicit status.
- Required verification and payment states are recorded.
- Confirmed capacity is protected against conflicting reservations.

---

## 8. Journey F — Staff Checks In a Reservation

### Objective

Convert a confirmed reservation into an active dining visit.

### Main Flow

1. Authorized staff opens the reservation list.
2. Staff finds the customer's reservation.
3. Staff verifies the booking reference and arrival details.
4. Staff confirms arrival.
5. System validates that the reservation can be checked in.
6. Staff assigns or confirms an eligible table.
7. System records the check-in time and responsible staff member.
8. The reservation transitions to the configured checked-in or seated state.
9. A dining service session is created or linked when appropriate.

### Alternative Flows

**F1 — Customer arrives early**

- Staff checks availability and applies the early-arrival policy.
- The system does not override a conflicting reservation automatically.

**F2 — Customer arrives late**

- Staff applies the configured grace period and late-arrival policy.
- The system records the outcome.

**F3 — Reserved table is unavailable**

- Staff may assign another eligible table if capacity and policy permit.
- The original reservation and table history remain traceable.

### Postconditions

- Arrival and table assignment are recorded.
- Reservation status and active table service status remain consistent.

---

## 9. Journey G — Cashier Generates a Bill and Accepts Payment

### Objective

Settle eligible orders accurately while preserving an auditable financial record.

### Main Flow

1. Authorized cashier opens an eligible order or table service session.
2. System retrieves the relevant order items and applicable pricing rules.
3. Cashier reviews the bill.
4. System calculates subtotal, permitted discounts, taxes, charges, and total.
5. Cashier confirms bill finalization.
6. Customer chooses an available payment method.
7. For cash, cashier records the received amount and applicable change.
8. For online payment, the system initiates a payment through the selected provider.
9. The system verifies the provider's payment confirmation.
10. The payment record is associated with the appropriate bill.
11. System recalculates the outstanding balance.
12. The bill is marked settled only when the required amount has been successfully paid.
13. The system records the settlement and relevant audit information.

### Alternative Flows

**G1 — Online payment fails**

- The payment is not marked successful.
- The outstanding balance remains correct.
- Customer can retry or use another permitted method.

**G2 — Payment is pending**

- The bill remains unsettled until verified confirmation or another valid settlement method is recorded.
- The interface clearly displays the pending state.

**G3 — Duplicate provider notification**

- The same payment event is processed idempotently.
- The payment amount is not recorded twice.

**G4 — Partial payment**

- The system records the received amount.
- The remaining balance stays outstanding.

**G5 — Refund requested**

- Only authorized users can initiate a permitted refund.
- The original payment remains traceable.
- Refund completion is recorded only when supported by verified payment-provider status or the approved manual workflow.

### Postconditions

- The bill has an explicit status.
- Every payment is traceable to its bill.
- The outstanding balance is correct.
- Settlement does not automatically imply that all food has been served.

---

## 10. Journey H — Administrator Manages Menu and Availability

### Objective

Allow restaurant administrators to maintain an accurate menu without corrupting historical orders.

### Main Flow

1. Administrator signs in.
2. Administrator opens menu management.
3. Administrator creates or updates a category or item.
4. Administrator configures price, modifiers, availability, and applicable recipe association.
5. System validates the submitted data.
6. Changes are saved.
7. Published changes become visible to eligible ordering channels.
8. Relevant audit records are created.

### Alternative Flows

**H1 — Item becomes unavailable**

- New orders cannot include the unavailable item.
- Existing accepted orders remain historically accurate.
- Staff are notified through the defined operational workflow where needed.

**H2 — Price changes**

- New orders use the new effective price.
- Existing order snapshots retain their original prices.

**H3 — Item is deactivated**

- Historical records remain available.
- The item cannot be selected for new orders.

### Postconditions

- Current menu data reflects authorized changes.
- Historical orders remain intact.
- The actor and relevant changes are traceable.

---

## 11. Journey I — Administrator Manages Inventory

### Objective

Track ingredient stock and connect recorded consumption to menu-item sales.

### Main Flow

1. Administrator opens inventory management.
2. Administrator creates an ingredient with its unit of measurement.
3. Administrator records an opening stock balance or stock receipt.
4. Administrator defines the recipe for a menu item.
5. System validates units and recipe quantities.
6. Eligible order events trigger stock deductions according to the approved policy.
7. Each deduction creates a stock movement.
8. Authorized staff record wastage, corrections, or physical stock counts.
9. System calculates the resulting stock balance.
10. Administrator reviews inventory movements and discrepancies.

### Alternative Flows

**I1 — Insufficient stock**

- The system applies the configured availability policy.
- It does not silently accept an order that violates an enforced stock constraint.

**I2 — Order is cancelled**

- Inventory is reversed or retained according to the approved cancellation and preparation policy.
- Historical movements remain traceable.

**I3 — Recipe changes**

- New applicable transactions use the correct recipe version.
- Historical consumption is not silently recalculated.

**I4 — Incorrect stock adjustment**

- An authorized correction creates a new traceable movement.
- The system does not erase the original adjustment.

### Postconditions

- Stock balances reflect recorded movements.
- Recipe-based consumption is traceable.
- Historical movements can be reconciled.

---

## 12. Cross-Workflow Business Rules

### WF-BR-001 — Shared Order System

QR orders, waiter-assisted orders, and advance pre-orders must use consistent core order validation and pricing rules.

### WF-BR-002 — Transaction Integrity

Related records that must succeed together must be persisted transactionally.

### WF-BR-003 — Idempotency

Order submissions and financial event processing must safely handle retries and duplicate delivery.

### WF-BR-004 — Reservation Concurrency

Availability must be revalidated when confirming a reservation, not only when displaying available slots.

### WF-BR-005 — Payment Separation

Order, kitchen, bill, and payment statuses must be separate concepts with explicit relationships.

### WF-BR-006 — Historical Accuracy

Changes to menu prices, recipes, and availability must not silently rewrite historical order or financial records.

### WF-BR-007 — Authorization

All privileged operations must be enforced server-side.

### WF-BR-008 — Auditable Corrections

Financial, inventory, and sensitive administrative corrections must preserve traceable history.

### WF-BR-009 — Failure Recovery

The interface must distinguish a confirmed operation from an operation whose result is unknown because of a timeout or connection failure.

### WF-BR-010 — Restaurant Isolation

Every operational workflow must enforce ownership and authorization boundaries for the relevant restaurant.

---

## 13. Required State Definitions

The following state machines must be finalized before architecture and database design are approved.

### Order

Proposed states:

- Draft
- Submitted
- Accepted
- Rejected
- In preparation
- Ready
- Served or fulfilled
- Cancelled
- Completed

The final design must define which states apply to advance orders versus dine-in orders, and how partial fulfilment is represented.

### Kitchen Ticket

Proposed states:

- Queued
- Accepted
- Preparing
- Ready
- Cancelled

Item-level status must be supported where necessary.

### Reservation

Proposed states:

- Pending verification
- Pending confirmation
- Confirmed
- Checked in
- Seated
- Cancelled
- Completed
- No-show
- Expired

The final design must define whether checked-in and seated states are distinct and how they interact with table service sessions.

### Payment

Proposed states:

- Pending
- Processing
- Successful
- Failed
- Partially refunded
- Refunded

The final design must define how multiple payments, partial payments, and refunds affect the bill's outstanding balance.

### Bill

Proposed states:

- Draft
- Finalized
- Partially paid
- Settled
- Voided

A voided bill must remain traceable and must not erase its associated financial history.

These states are proposals, not final implementation enums. The next design stage must define allowed transitions and guards.

---

## 14. Workflow Validation Scenarios

The following scenarios must be included in future test planning:

1. Customer submits a valid QR order.
2. Customer retries an order after a timeout.
3. Two customers attempt to reserve the same table concurrently.
4. An item becomes unavailable during checkout.
5. Kitchen receives an order containing multiple preparation stages.
6. A waiter modifies an order while kitchen preparation is in progress.
7. An online payment fails after order submission.
8. A successful payment notification is delivered more than once.
9. A customer abandons a reservation after a temporary hold is created.
10. A reservation is checked in and assigned to an eligible table.
11. A menu price changes while an older order remains active.
12. An order cancellation affects inventory.
13. A staff member attempts an operation outside their permissions.
14. A staff device reconnects after missing live updates.
15. A bill is partially paid and later settled.

Each scenario must have expected state changes, persistence expectations, user-visible feedback, and audit requirements.

---

## 15. Open Decisions

Before finalizing the workflows, the product owner must resolve:

1. Whether advance pre-orders are paid in full, paid on arrival, or configurable.
2. Whether table orders are grouped into one bill by default or can be billed separately.
3. Whether multiple customers can order against the same table session without authentication.
4. Which order modifications are permitted after kitchen acceptance.
5. When ingredient stock is deducted and how waste is recorded.
6. Whether deposits are refundable and how cancellation deadlines work.
7. How table capacity and reservation duration are configured.
8. Whether item readiness or whole-ticket readiness is the default kitchen workflow.
9. What happens when the restaurant loses internet connectivity.
10. Which bill, tax, discount, and refund policies are supported in the MVP.

---

## 16. Approval Criteria

This document can be approved when:

- Every primary user journey has been reviewed.
- Success and failure paths are defined for core operations.
- Cross-workflow business rules are understood.
- Proposed states and transitions are sufficiently clear for UX design.
- Open decisions have been resolved or assigned for resolution.
- The workflows are consistent with the approved Product Discovery and PRD documents.

Approval does not authorize coding. The next step is to define the page-by-page information architecture, navigation, screen requirements, and UI states.

---

**End of Document 03 — User Journeys & Business Workflows**