# MVP Scope & Release Plan

**Project:** Restaurant Operating System  
**Document ID:** REQ-014  
**Status:** Draft — Pending Review  
**Last Updated:** 2026-10-13

## 1. Objective

Define the smallest complete, reliable version of the Restaurant Operating System that demonstrates its core value: managing restaurant orders from placement through kitchen preparation, billing, and payment, while supporting table service, pre-orders, reservations, and basic inventory.

The MVP must be functional end to end, not a collection of disconnected screens.

## 2. MVP Strategy

Build for one restaurant first, while preserving restaurant-level data ownership and authorization for future SaaS expansion.

The initial release will support three ordering workflows:

1. **Pre-ordering:** Customers select menu items, place an order, and follow its status.
2. **QR-based table ordering:** Customers scan a table QR code, browse the menu, and place orders associated with that table's active service session.
3. **Waiter-assisted ordering:** Staff select a table, create an order on behalf of the customer, and send it to the kitchen.

All three workflows must converge on the same order-processing and kitchen-management system.

## 3. Feature Scope

### 3.1 P0 — Required for the MVP

These features are mandatory for the first complete release.

| Module | Required capabilities |
|---|---|
| Restaurant setup | Restaurant profile, opening hours, basic settings |
| Staff authentication | Login, logout, protected staff routes |
| Authorization | Role-based permissions and restaurant-level access checks |
| Menu management | Categories, items, prices, availability, item descriptions |
| Table management | Tables, QR codes, active table sessions |
| Pre-ordering | Browse menu, cart, checkout, order confirmation |
| QR ordering | Scan table QR, place orders against the correct active session |
| Waiter ordering | Create and submit orders for assigned tables |
| Order management | View orders, update permitted statuses, view order history |
| Kitchen display | Incoming tickets, preparation status, ready notifications |
| Billing | Generate bill from eligible orders, calculate totals, finalize bill |
| Payments | Cash payment recording and one online payment-provider integration in test mode |
| Reservations | Availability checks, reservation creation, confirmation, cancellation, check-in |
| Inventory | Ingredient records, stock receipts, manual adjustments, stock movement history |
| Reporting | Basic sales, order counts, reservation counts, low-stock information |
| Reliability | Validation, structured errors, idempotency for critical operations, transaction safety |
| Testing | Unit, integration, critical end-to-end, authorization, and concurrency tests |
| Deployment | Staging/demo environment, environment configuration, database migrations, backups |

**MVP acceptance principle:** A feature is not complete merely because its interface exists. Its backend rules, persistence, authorization, failure handling, and relevant tests must also work.

### 3.2 P1 — Add After the Core MVP Works

These features improve operational value but must not delay the first reliable release.

- Advanced sales reports and date-range comparisons.
- Automated recipe-based ingredient consumption.
- Supplier management and purchase orders.
- Printable receipts and kitchen tickets.
- Multiple payment providers.
- Advanced reservation policies and automated no-show charges.
- Split bills and complex payment allocation.
- Staff scheduling and attendance.
- Loyalty points and customer profiles.
- Automated SMS or WhatsApp notifications.
- Advanced discount campaigns and promotional codes.
- Multi-location restaurant management.

### 3.3 Out of Scope for the Initial Release

The following are deliberately excluded:

- Microservices architecture.
- Native Android and iOS applications.
- Franchise-wide enterprise administration.
- AI-driven demand forecasting.
- Automated accounting and tax-filing integrations.
- Complex payroll management.
- A marketplace aggregating multiple restaurants.
- Delivery-fleet management.
- Advanced procurement optimization.
- Production payment processing before provider onboarding and security validation are complete.

These exclusions reduce implementation risk without undermining the core restaurant workflow.

## 4. End-to-End MVP Workflows

### Workflow A: Pre-Order

1. Customer opens the restaurant's public menu.
2. Customer selects available items and quantities.
3. System validates item availability and current prices.
4. Customer submits the order.
5. Backend creates the order and its item snapshots transactionally.
6. Staff or the configured order policy accepts the order.
7. Kitchen receives the relevant preparation ticket.
8. Staff update preparation and completion statuses.
9. Customer can view the order's current status.
10. The order is associated with the appropriate billing and payment flow.

**Acceptance condition:** Repeated submission caused by a network retry must not create duplicate orders.

### Workflow B: QR Table Ordering

1. Staff open a table for service.
2. System provides the table's QR code.
3. Customer scans the QR code.
4. Backend validates the token and resolves the correct table and restaurant.
5. Customer views the menu and submits an order.
6. The order is linked to the active table session.
7. Kitchen receives the order.
8. Staff can see the order against the correct table.
9. Eligible orders can be included in the table's bill.
10. Staff close the session after settlement and required checks.

**Acceptance condition:** An invalid, revoked, or incorrectly scoped QR token must not authorize access to another table's active session.

### Workflow C: Waiter-Assisted Ordering

1. Staff authenticate.
2. Staff select an available table or an existing service session.
3. Staff add menu items and permitted modifiers.
4. Backend validates the order and creates the required records.
5. Kitchen receives the ticket.
6. Staff and kitchen users update the order according to their permissions.
7. The order becomes eligible for billing according to business rules.

**Acceptance condition:** Concurrent staff actions must not create inconsistent table sessions, duplicate orders, or invalid status transitions.

### Workflow D: Reservation

1. Customer selects a date, time, party size, and required contact details.
2. Backend checks current reservation capacity.
3. Customer completes any required verification.
4. Backend confirms the reservation only if capacity is still available.
5. Customer receives a confirmation reference.
6. Staff can view and manage the reservation.
7. Staff check in the customer and record seating.
8. The reservation is completed or marked as cancelled/no-show according to the permitted rules.

**Acceptance condition:** Concurrent bookings must not exceed the configured reservation capacity.

### Workflow E: Billing and Settlement

1. Staff select the eligible orders associated with the relevant service session.
2. Backend calculates the bill using persisted order snapshots and applicable pricing rules.
3. Staff review and finalize the bill.
4. Customer pays using cash or the configured online test-payment flow.
5. Backend records payment outcomes.
6. Bill status changes only according to verified payment records.
7. Staff close the table session after settlement and required checks.

**Acceptance condition:** Duplicate payment notifications must not record the same payment twice, and a client-side success message alone must never establish that online payment succeeded.

### Workflow F: Basic Inventory

1. Staff record an ingredient and its unit of measurement.
2. Staff record a stock receipt or adjustment.
3. Backend creates an auditable stock movement.
4. The system displays the resulting stock position.
5. Staff review low-stock items and movement history.

**Acceptance condition:** Every stock change must be traceable. Automatic ingredient deduction from recipes is deferred unless it becomes a confirmed MVP requirement.

## 5. Release Milestones

Milestones are defined by working outcomes rather than arbitrary calendar dates.

| Milestone | Deliverable | Exit criteria |
|---|---|---|
| M0 — Planning approval | Reviewed product and technical specifications | Critical business decisions are resolved or explicitly deferred |
| M1 — Foundation | Repository, environments, database migrations, API conventions, authentication foundation | Application starts reliably and automated checks run |
| M2 — Restaurant operations | Menu, tables, QR identity, staff roles | Staff can manage menu items and tables securely |
| M3 — Ordering and kitchen | Pre-orders, QR orders, waiter orders, kitchen tickets | All three ordering paths reach the same order lifecycle |
| M4 — Reservations and billing | Reservation flow, bill generation, cash recording | Capacity and billing invariants pass tests |
| M5 — Inventory and reporting | Stock movements, low-stock view, basic reports | Stock changes are auditable and reports reconcile with source records |
| M6 — Hardening | Integration tests, concurrency tests, security checks, error handling | Critical failure scenarios pass |
| M7 — Demonstration release | Seeded data, deployment, documented demo flow | Complete demo works from customer action to restaurant settlement |

A milestone is complete only when its exit criteria are met. A partially working feature must not be reported as finished.

## 6. Release Gates

The first release must not proceed if any of these conditions remain unresolved:

- Unauthorized users can access staff operations.
- Restaurant data can be accessed across unauthorized restaurant boundaries.
- Duplicate requests can create duplicate financial or operational records.
- Concurrent reservations can exceed permitted capacity.
- Bill totals cannot be reproduced from persisted bill and order data.
- Online payment status can be changed based only on an unverified client callback.
- Critical database operations can leave related records inconsistent.
- Database migrations fail on a clean environment.
- A required critical workflow lacks automated verification.
- Production or demonstration secrets are exposed in source control.
- Backup and recovery expectations are undocumented.

## 7. Demo Acceptance Checklist

The demonstration environment must support the following scenarios.

- [ ] Log in as an authorized staff member.
- [ ] Create and publish a menu item.
- [ ] Create a table and generate its QR code.
- [ ] Place a pre-order.
- [ ] Place an order using the table QR code.
- [ ] Create a waiter-assisted order.
- [ ] View and update kitchen tickets.
- [ ] Track an order through permitted status transitions.
- [ ] Create and manage a reservation.
- [ ] Finalize a bill from eligible orders.
- [ ] Record a cash payment.
- [ ] Run a payment-provider test flow if the provider integration is included in the release.
- [ ] Record an inventory receipt and adjustment.
- [ ] View basic operational reports.
- [ ] Demonstrate a rejected unauthorized request.
- [ ] Demonstrate safe handling of a duplicate request.
- [ ] Run the documented automated test suite.

The demo must use synthetic restaurant data and must clearly distinguish test payments from real transactions.

## 8. Scope Change Policy

A feature may enter the MVP only when:

1. It addresses a required restaurant workflow or a demonstrated blocker.
2. Its business rules and acceptance criteria are defined.
3. Its impact on existing modules and database design is understood.
4. Its testing and operational requirements are included.
5. It does not compromise release-critical work.

New ideas should normally enter the post-MVP backlog rather than interrupt a milestone already in progress.

## 9. MVP Definition of Done

The MVP is complete when a restaurant can manage its menu and tables, accept orders through all three supported ordering paths, process kitchen tickets, handle reservations, generate bills, record payments, track basic inventory, and review essential reports.

The application must preserve authorization boundaries, database integrity, safe retry behavior, and auditable financial and inventory records.

The release must be deployed to a reproducible demonstration environment and pass its required quality gates.
