# Restaurant OS — UX Information Architecture & Page-by-Page UI Specification

**Document ID:** ROS-UX-004  
**Version:** 1.0  
**Status:** Draft — Pending Review  
**Parent Documents:**
- 01-product-discovery.md
- 02-product-requirements.md
- 03-user-journeys-and-workflows.md

---

## 1. Purpose

This document defines the information architecture, navigation structure, page inventory, screen responsibilities, user interactions, and UI states for Restaurant OS.

It establishes a consistent interface for customers, waiters, kitchen staff, cashiers, and administrators.

It does not define implementation code, database schemas, or final API contracts.

## 2. UX Principles

### UX-001 — Task-first design
Every screen must help the user complete a specific task without unnecessary navigation.

### UX-002 — Mobile-first customer experience
Customer-facing menu, ordering, reservation, and order-tracking pages must work on common mobile browsers.

### UX-003 — Operational clarity
Staff interfaces must prioritize current work, status, urgency, and next actions.

### UX-004 — Consistency
Order, table, kitchen, bill, and payment statuses must use consistent terminology throughout the application.

### UX-005 — Error recovery
Users must receive actionable feedback when an operation fails or its result is uncertain.

### UX-006 — Role-based navigation
Users must see only the pages and actions appropriate to their permissions.

### UX-007 — Accessible interaction
Controls must have understandable labels, keyboard support where appropriate, readable contrast, and visible focus states.

### UX-008 — No false confirmation
The interface must not show an order or payment as successful before the required confirmation is received.

## 3. Information Architecture

### 3.1 Customer application

- Restaurant landing page
- Menu
- Item details
- Cart
- Checkout
- Order confirmation
- Order tracking
- Reservation search
- Reservation details
- Reservation confirmation
- Bill and payment status
- Customer support or assistance state

### 3.2 Staff application

- Staff login
- Operational home
- Table overview
- Table service session
- Order creation
- Order details
- Kitchen display
- Reservation management
- Bill management
- Payment reconciliation
- Inventory management
- Stock movement history
- Staff and permission management
- Restaurant settings
- Operational reports
- Audit history

### 3.3 Shared interface elements

- Loading indicators
- Error messages
- Empty states
- Confirmation dialogs
- Notifications
- Status indicators
- Search and filters
- Pagination or controlled list loading
- Form validation messages

## 4. Global Navigation

### 4.1 Customer Navigation

The customer interface should use simple navigation suited to mobile devices.

Primary navigation:
- Menu
- Cart
- Orders
- Reservations

Context-specific links:
- Restaurant information
- Contact or assistance
- Bill and payment status

The active table context must remain visible when the customer is ordering through a table QR code.

### 4.2 Staff Navigation

The staff interface should use a persistent navigation layout on desktop and tablet.

Primary navigation:
- Overview
- Tables
- Orders
- Kitchen
- Reservations
- Billing
- Inventory
- Reports
- Settings

The visible navigation items must depend on the authenticated user's permissions.

Kitchen-only accounts should open directly into the kitchen interface or their assigned operational view.

## 5. Customer Pages

### CUS-01 — Restaurant Landing Page

**Purpose:** Introduce the restaurant and direct customers to the appropriate workflow.

Content:
- Restaurant name and logo.
- Operating status.
- Menu entry point.
- Pre-order entry point.
- Reservation entry point.
- Contact information where configured.

Actions:
- Browse menu.
- Start a pre-order.
- Make a reservation.

States:
- Loading restaurant configuration.
- Restaurant open.
- Restaurant closed.
- Ordering unavailable.
- Restaurant not found.

### CUS-02 — Menu Page

**Purpose:** Let customers discover available items.

Content:
- Category navigation.
- Item name, image where available, and description.
- Current price.
- Availability.
- Relevant dietary or allergen information where configured.
- Cart summary.
- Active table context for QR ordering.

Actions:
- Change category.
- Search menu items if search is enabled.
- Open item details.
- Add an eligible item to the cart.

States:
- Loading menu.
- Menu available.
- Empty menu.
- No items in the selected category.
- Item unavailable.
- Menu temporarily unavailable.

Rules:
- Unavailable items must not be presented as orderable.
- Prices must be consistent with the server's authoritative data.
- Existing cart items must be revalidated before submission.

### CUS-03 — Item Details

**Purpose:** Let customers configure an item before adding it to the cart.

Content:
- Item name and description.
- Price.
- Quantity selector.
- Required and optional modifiers.
- Special instructions where permitted.
- Availability status.

Actions:
- Select modifiers.
- Adjust quantity.
- Add item to cart.
- Cancel without adding.

States:
- Loading details.
- Available.
- Unavailable.
- Invalid modifier combination.
- Quantity limit reached.

Rules:
- Required modifiers must be selected.
- Invalid combinations must be rejected.
- Price changes must be communicated before final submission.

### CUS-04 — Cart

**Purpose:** Review selected items before placing an order.

Content:
- Selected items.
- Quantities and modifiers.
- Item prices.
- Subtotal.
- Applicable estimated taxes or charges where configured.
- Estimated total.
- Ordering context and requested time where relevant.

Actions:
- Increase or decrease quantity.
- Remove item.
- Edit modifiers where permitted.
- Continue to checkout.

States:
- Empty cart.
- Cart populated.
- Item no longer available.
- Price or availability changed.
- Cart requires review.

Rules:
- The displayed total is provisional until the server validates checkout.
- A customer must be informed of material price or availability changes.

### CUS-05 — Checkout

**Purpose:** Collect the information required to submit an eligible order.

Content:
- Order summary.
- Contact details where required.
- Pre-order date and time where applicable.
- Table context for QR ordering.
- Payment method.
- Applicable charges.
- Final total.

Actions:
- Confirm order details.
- Initiate payment when required.
- Submit order.

States:
- Validating cart.
- Ready to submit.
- Submission in progress.
- Submission confirmed.
- Submission rejected.
- Submission result unknown.

Rules:
- Prevent accidental repeated submissions.
- Preserve a submission reference where supported.
- Do not display success until the server confirms the order.

### CUS-06 — Order Confirmation

**Purpose:** Confirm the outcome of an order submission.

Content:
- Order reference.
- Current order status.
- Order summary.
- Payment status.
- Expected service or pickup time where available.

Actions:
- Track order.
- View order details.
- Return to menu.

States:
- Accepted.
- Pending confirmation.
- Rejected.
- Payment pending.
- Confirmation unavailable.

### CUS-07 — Order Tracking

**Purpose:** Display the current status of an existing order.

Content:
- Order reference.
- Item summary.
- Current status.
- Status timeline where available.
- Estimated preparation time where configured.
- Payment status.

Actions:
- Refresh status.
- Return to menu.
- Request assistance where supported.

States:
- Waiting for acceptance.
- Accepted.
- Preparing.
- Partially ready where item-level readiness is supported.
- Ready.
- Served or fulfilled.
- Cancelled.
- Temporarily disconnected.

Rules:
- Live updates must be reconciled with persisted server state.
- The page must recover the latest status after reconnection.

### CUS-08 — Reservation Search

**Purpose:** Find eligible reservation options.

Content:
- Date selector.
- Time selector.
- Party size.
- Available reservation options.
- Relevant booking policies.

Actions:
- Select date and time.
- Change party size.
- Continue to reservation details.

States:
- Loading availability.
- Available slots.
- No availability.
- Restaurant closed.
- Invalid date or party size.

Rules:
- Availability shown on screen is provisional until the reservation is confirmed.
- Time zones and reservation duration must follow restaurant configuration.

### CUS-09 — Reservation Details and Verification

**Purpose:** Collect booking details and verify the customer.

Content:
- Selected date and time.
- Party size.
- Customer contact details.
- Applicable deposit.
- Cancellation and no-show policy.

Actions:
- Request OTP.
- Submit OTP.
- Request a new OTP within configured limits.
- Continue to confirmation.

States:
- Entering details.
- OTP sent.
- OTP invalid.
- OTP expired.
- Resend temporarily unavailable.
- Verification successful.

Rules:
- Verification codes must not be exposed in production interfaces or logs.
- Resend limits and expiry must be enforced.
- Sensitive reservation details must be protected.

### CUS-10 — Reservation Confirmation

**Purpose:** Display the final reservation outcome.

Content:
- Reservation reference.
- Date, time, and party size.
- Reservation status.
- Deposit status if applicable.
- Cancellation and arrival instructions.

Actions:
- View reservation details.
- Cancel when permitted.
- Contact the restaurant.

States:
- Pending confirmation.
- Awaiting deposit.
- Confirmed.
- Cancelled.
- Expired.
- No longer available.

### CUS-11 — Bill and Payment Status

**Purpose:** Allow a customer to understand the bill and settlement status.

Content:
- Bill reference.
- Itemized charges where applicable.
- Discounts and taxes where configured.
- Total amount.
- Amount paid.
- Outstanding balance.
- Payment status.

Actions:
- Initiate online payment where permitted.
- Retry a failed payment.
- View verified settlement status.

States:
- Bill pending.
- Payment processing.
- Partially paid.
- Settled.
- Payment failed.
- Refund pending.
- Refunded.

Rules:
- A browser return URL must not determine payment success.
- Financial status must be reconciled with authoritative payment records.

## 6. Staff Pages

### STF-01 — Staff Login

**Purpose:** Authenticate restaurant staff.

Content:
- Login form.
- Error messages.
- Password recovery entry point where supported.

States:
- Ready.
- Submitting.
- Invalid credentials.
- Account disabled.
- Temporarily unavailable.

Rules:
- Authentication failures must not reveal unnecessary account details.
- Successful authentication must load only authorized staff functionality.

### STF-02 — Operational Overview

**Purpose:** Give authorized managers a summary of current operations.

Content:
- Active tables.
- New and active orders.
- Kitchen workload.
- Upcoming reservations.
- Outstanding bills.
- Inventory warnings where supported.

Actions:
- Open the relevant operational module.
- Filter or inspect a status summary.

States:
- Loading.
- Data available.
- No active operations.
- Partial data unavailable.
- Access denied.

Rules:
- Summary values must be derived from authoritative records.
- Operational counts must not imply financial settlement unless verified.

### STF-03 — Table Overview

**Purpose:** Show the current state of restaurant tables.

Content:
- Table identifier.
- Capacity.
- Occupancy or service status.
- Active session reference.
- Relevant order or reservation indicator.

Actions:
- Open a table.
- Start an eligible service session.
- Assign or reassign a table where permitted.
- View active orders.

States:
- Available.
- Reserved.
- Occupied.
- Awaiting cleaning or reset if that workflow is enabled.
- Unavailable.
- Data loading or error.

Rules:
- Displayed table status must agree with the underlying service session and reservation rules.

### STF-04 — Table Service Session

**Purpose:** Coordinate all relevant activity for a dining table.

Content:
- Table identifier.
- Session status.
- Active orders.
- Item preparation status.
- Associated reservations.
- Bill and payment summary.
- Relevant service history.

Actions:
- Add an order.
- View an order.
- Request a bill.
- Record permitted service events.
- Close the session when all required conditions are satisfied.

States:
- Active.
- Awaiting preparation.
- Ready for service.
- Awaiting settlement.
- Closed.
- Requires staff attention.

Rules:
- Closing a session must not erase order or payment history.
- Unsettled balances must be handled according to the configured closure policy.

### STF-05 — Order Creation

**Purpose:** Allow authorized staff to create an order.

Content:
- Menu selector.
- Category navigation.
- Item and modifier selection.
- Quantity controls.
- Special instructions.
- Table or ordering context.
- Order summary.

Actions:
- Add items.
- Remove items before submission.
- Review total.
- Submit order.

States:
- Empty order.
- Draft populated.
- Validation error.
- Submission in progress.
- Accepted.
- Rejected.

Rules:
- Staff-created orders must use the same server-side validation and pricing rules as customer orders.

### STF-06 — Order Details

**Purpose:** Display an order's complete operational state.

Content:
- Order reference.
- Creation time.
- Customer or table context.
- Item and price snapshots.
- Kitchen status.
- Payment status.
- Status history.

Actions:
- Request permitted modifications.
- Cancel under applicable policy.
- View the related kitchen ticket.
- View the related bill.

States:
- Submitted.
- Accepted.
- Preparing.
- Ready.
- Fulfilled.
- Cancelled.
- Requires attention.

Rules:
- Every action must follow valid state transitions and permissions.

### STF-07 — Kitchen Display

**Purpose:** Help kitchen staff process current preparation work.

Content:
- Incoming tickets.
- Order age or elapsed preparation time.
- Item quantities and modifiers.
- Special instructions.
- Current status.
- Station assignment where supported.

Actions:
- Accept ticket.
- Start preparation.
- Mark item ready.
- Mark ticket ready.
- Acknowledge modifications or cancellations.

States:
- New ticket.
- Queued.
- Preparing.
- Partially ready.
- Ready.
- Cancelled.
- Delayed.
- Reconnecting.

Rules:
- New and urgent work must be visually distinguishable.
- Stale client data must not silently overwrite a newer server state.
- Status changes must be validated server-side.

### STF-08 — Reservation Management

**Purpose:** Manage upcoming and current reservations.

Content:
- Reservation list or schedule.
- Date and time.
- Party size.
- Reservation status.
- Deposit status.
- Assigned table where applicable.

Actions:
- Search reservations.
- Filter by date and status.
- View reservation details.
- Confirm eligible reservations.
- Check in arriving customers.
- Record permitted cancellations and no-shows.

States:
- No reservations.
- Upcoming reservations.
- Awaiting confirmation.
- Deposit pending.
- Checked in.
- Cancelled.
- No-show.
- Error loading data.

Rules:
- Conflicting table assignments must be prevented.
- Reservation changes must preserve history.

### STF-09 — Billing and Payments

**Purpose:** Manage bills and outstanding payments.

Content:
- Eligible orders or table sessions.
- Bill details.
- Itemized totals.
- Amount paid.
- Outstanding balance.
- Payment method and reference.
- Refund status where relevant.

Actions:
- Generate bill.
- Finalize bill.
- Record cash payment.
- Inspect online payment status.
- Initiate permitted refund.
- Reconcile payment discrepancies.

States:
- Draft bill.
- Finalized.
- Partially paid.
- Settled.
- Payment pending.
- Payment failed.
- Refund pending.
- Discrepancy detected.

Rules:
- Sensitive financial actions require appropriate permissions.
- A bill must not be settled while a balance remains.
- Payment notifications must be handled idempotently.

### STF-10 — Inventory Overview

**Purpose:** Provide a current view of ingredient stock.

Content:
- Ingredient name.
- Unit.
- Current stock.
- Configured low-stock threshold.
- Recent movements.
- Related menu-item usage where available.

Actions:
- Open ingredient details.
- Record stock receipt.
- Record authorized adjustment.
- Review low-stock warnings.

States:
- Loading.
- Inventory available.
- No inventory records.
- Low stock.
- Potential stock discrepancy.
- Access denied.

Rules:
- Stock balances must derive from recorded movements and defined opening balances.

### STF-11 — Ingredient and Recipe Management

**Purpose:** Configure ingredients and menu-item recipes.

Content:
- Ingredient details.
- Unit of measurement.
- Recipe quantities.
- Menu-item association.
- Recipe version or effective date where supported.

Actions:
- Create ingredient.
- Edit ingredient details.
- Configure a recipe.
- Validate units and quantities.
- Save changes.

States:
- Draft.
- Valid.
- Invalid unit or quantity.
- Missing recipe.
- Saved.
- Permission denied.

Rules:
- Recipe changes must not silently rewrite historical stock consumption.

### STF-12 — Staff Management

**Purpose:** Manage staff access.

Content:
- Staff list.
- Account status.
- Assigned role.
- Relevant account information.

Actions:
- Create account.
- Change permitted roles.
- Disable account.
- Review access.

States:
- No staff records.
- Loading.
- Active account.
- Disabled account.
- Validation error.

Rules:
- Only authorized administrators can change permissions.
- Changes to privileged roles must be audited.

### STF-13 — Restaurant Settings

**Purpose:** Configure restaurant-level policies.

Content:
- Restaurant information.
- Operating hours.
- Currency and time zone.
- Ordering policies.
- Reservation settings.
- Deposit and cancellation rules.
- Tax and billing configuration where supported.

Actions:
- Edit settings.
- Validate changes.
- Save settings.

States:
- Loading.
- Unsaved changes.
- Validation error.
- Saved.
- Permission denied.

Rules:
- Changes must apply consistently across relevant workflows.
- Historical orders and bills must retain the applicable historical values.

### STF-14 — Reports and Audit History

**Purpose:** Review operational performance and sensitive activity.

Content:
- Order summaries.
- Sales and payment summaries.
- Inventory movement history.
- Audit records.
- Relevant filters and date ranges.

Actions:
- Filter records.
- Inspect details.
- Export records if that capability is enabled.

States:
- No matching records.
- Loading.
- Data available.
- Partial data unavailable.
- Access denied.

Rules:
- Reports must clearly identify the underlying period and status definitions.
- Audit history must not expose information beyond the viewer's permissions.

## 7. Shared UI Components

The following components should be standardized across relevant pages:

- Application header and navigation.
- Restaurant identity and table context.
- Status badges.
- Search and filter controls.
- Menu item cards.
- Quantity selectors.
- Order summary.
- Price and payment summary.
- Data tables or responsive lists.
- Confirmation dialogs.
- Form field validation.
- Toast or inline notifications.
- Loading skeletons.
- Empty-state illustrations or messages.
- Error and retry panels.
- Pagination controls where needed.

Component styling and exact responsive breakpoints will be documented in the visual design specification.

## 8. Required UI States

Every data-driven screen must account for applicable states.

### Loading
Display a clear loading indicator while the system retrieves information.

### Empty
Explain why no records are shown and provide a relevant next action when possible.

### Error
Explain the failure in plain language and offer a safe retry or recovery path.

### Permission Denied
Explain that the operation is unavailable to the current user without exposing protected information.

### Validation Error
Identify invalid fields and explain how to correct them.

### Pending
Distinguish an operation awaiting confirmation from a completed operation.

### Connection Lost
Indicate that current information may be stale and provide a safe refresh or recovery path.

### Success
Display success only after the required operation has been confirmed.

### Conflict
Explain when an item, table, reservation slot, or record has changed and requires user review.

## 9. Responsive Behaviour

### Customer interface
- Prioritize mobile screens.
- Keep cart access easy to reach.
- Avoid horizontal scrolling for primary workflows.
- Make form fields and controls touch-friendly.
- Preserve readable prices and order status information.

### Staff interface
- Support desktop and tablet layouts.
- Prioritize rapid access to current work.
- Keep high-frequency kitchen actions easy to operate.
- Provide responsive layouts for smaller screens without hiding critical status information.

### Kitchen interface
- Prioritize readability at a distance.
- Keep active tickets visually distinct.
- Avoid relying on color alone.
- Make status updates accessible through large, clearly labeled controls.

## 10. Accessibility Requirements

- All interactive controls must have meaningful accessible names.
- Keyboard users must be able to navigate applicable forms and staff interfaces.
- Focus states must remain visible.
- Text and controls must meet an appropriate contrast standard.
- Validation errors must be associated with the relevant fields.
- Status must be conveyed using text or another accessible indicator, not color alone.
- Important confirmations and errors must be announced accessibly where appropriate.

## 11. UX Acceptance Criteria

### UX-AC-001 — Customer Ordering
A customer can discover an available item, configure it, add it to the cart, and reach checkout without encountering a dead-end screen.

### UX-AC-002 — Price Review
The customer can review the order summary and any material price or availability changes before final submission.

### UX-AC-003 — QR Context
A customer using a table QR link can identify the restaurant and active table context before placing an order.

### UX-AC-004 — Order Status
Customers and authorized staff see consistent persisted order states.

### UX-AC-005 — Kitchen Workflow
Kitchen staff can identify new tickets and update permitted preparation states without unnecessary navigation.

### UX-AC-006 — Reservation Conflict
When a selected reservation slot becomes unavailable, the interface explains the conflict and lets the customer choose another option.

### UX-AC-007 — Payment Failure
The interface clearly distinguishes a failed or pending payment from a successful payment.

### UX-AC-008 — Staff Permissions
Users do not see or successfully execute actions that their role does not authorize.

### UX-AC-009 — Error Recovery
A recoverable failure provides a clear next action and does not silently duplicate an order or payment.

### UX-AC-010 — Responsive Layout
Core customer workflows function on supported mobile browsers, while core staff workflows remain usable on supported desktop and tablet screens.

## 12. Open Design Decisions

The following decisions must be resolved during detailed design:

1. Whether customer order tracking requires an account, a secure link, or another recovery method.
2. How customers access bills for a shared table.
3. Whether table sessions support multiple independent bills.
4. Which kitchen actions are item-level versus ticket-level.
5. Whether customers can request bill splitting through the interface.
6. Which report exports are necessary for the first release.
7. Whether assistance requests are included in the initial MVP.
8. Which customer and staff screens require live updates versus manual refresh.
9. Which empty, loading, and error states need dedicated wireframes.
10. Which visual design system, typography, and component tokens will be used.

## 13. Approval Criteria

This document can be approved when:

- All primary user-facing and staff-facing pages are accounted for.
- Navigation is consistent with the approved roles.
- Each major workflow has clear page responsibilities.
- Relevant loading, empty, error, pending, success, and conflict states are defined.
- Responsive and accessibility requirements are agreed.
- Open design decisions have been resolved or explicitly assigned.

Approval of this document does not authorize implementation.

The next planning stage is system architecture, followed by detailed database design, API contracts, security, testing, and the implementation roadmap.

---

**End of Document 04 — UX Information Architecture & Page-by-Page UI Specification**