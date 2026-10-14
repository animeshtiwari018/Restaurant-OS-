# Restaurant OS — UX Information Architecture & Page Specification

**Document ID:** ROS-UX-004
**Version:** 1.0
**Status:** Draft
**Parent Documents:** readme.md, 02-product-requirements.md, 03-user-journeys-and-workflows.md

---

## 1. Purpose

This document defines:
- What pages/screens exist in the system
- What each page shows and what the user can do on it
- How navigation works
- What UI states each page needs to handle

It does **not** define implementation code, database schemas, or final API contracts.

---

## 2. UX Principles

| Principle | What it means |
|---|---|
| UX-001 Task-first | Every screen helps the user complete a specific task without unnecessary navigation |
| UX-002 Mobile-first (customers) | Customer pages must work well on mobile browsers |
| UX-003 Operational clarity | Staff screens prioritize current work, status, urgency, and next actions |
| UX-004 Consistency | Order, table, kitchen, bill, and payment statuses use consistent terminology everywhere |
| UX-005 Error recovery | Users always get actionable feedback when an operation fails or is uncertain |
| UX-006 Role-based nav | Users only see pages and actions appropriate to their permissions |
| UX-007 Accessible | Controls have clear labels, readable contrast, keyboard support where appropriate |
| UX-008 No false confirmation | Do not show order or payment as successful before the server confirms it |

---

## 3. Information Architecture

### 3.1 Customer App Pages
- Restaurant landing page
- Menu
- Item details
- Cart
- Checkout
- Order confirmation
- Order tracking
- Reservation search
- Reservation details & verification
- Reservation confirmation
- Bill and payment status
- Customer support / assistance

### 3.2 Staff App Pages
- Staff login
- Operational home (dashboard)
- Table overview
- Table service session
- Order creation
- Order details
- Kitchen display
- Reservation management
- Billing and payments
- Inventory overview
- Ingredient and recipe management
- Staff management
- Restaurant settings
- Reports and audit history

### 3.3 Shared UI Elements
- Loading indicators
- Error messages
- Empty states
- Confirmation dialogs
- Notifications / toasts
- Status badges
- Search and filters
- Pagination / list loading
- Form validation messages

---

## 4. Navigation

### 4.1 Customer Navigation
Simple mobile-friendly navigation:

Primary: **Menu | Cart | Orders | Reservations**

Context-specific links: Restaurant info, Contact/assistance, Bill and payment status

> The active table context (from QR scan) must remain visible throughout the ordering flow.

### 4.2 Staff Navigation
Persistent sidebar/nav on desktop and tablet.

Primary: **Overview | Tables | Orders | Kitchen | Reservations | Billing | Inventory | Reports | Settings**

- Navigation items shown depend on the user's role/permissions
- Kitchen-only accounts open directly to the kitchen interface

---

## 5. Customer Pages

### CUS-01 — Restaurant Landing Page

**Goal:** Introduce the restaurant and direct customers to the right workflow.

| Element | Details |
|---|---|
| Content | Restaurant name, logo, operating status, menu entry, pre-order entry, reservation entry, contact info |
| Actions | Browse menu, Start pre-order, Make reservation |
| States | Loading, Restaurant open, Restaurant closed, Ordering unavailable, Restaurant not found |

---

### CUS-02 — Menu Page

**Goal:** Let customers discover available items.

| Element | Details |
|---|---|
| Content | Category navigation, item name/image/description, current price, availability, dietary info, cart summary, active table context |
| Actions | Change category, Search items (if enabled), Open item details, Add item to cart |
| States | Loading, Menu available, Empty menu, No items in category, Item unavailable, Menu temporarily unavailable |
| Rules | Unavailable items are not shown as orderable. Prices match server data. Cart items are revalidated before submission. |

---

### CUS-03 — Item Details

**Goal:** Let customers configure an item before adding to cart.

| Element | Details |
|---|---|
| Content | Item name/description/price, quantity selector, required and optional modifiers, special instructions, availability |
| Actions | Select modifiers, Adjust quantity, Add to cart, Cancel |
| States | Loading, Available, Unavailable, Invalid modifier combination, Quantity limit reached |
| Rules | Required modifiers must be selected. Invalid combinations are rejected. Price changes are communicated before final submission. |

---

### CUS-04 — Cart

**Goal:** Review selected items before placing an order.

| Element | Details |
|---|---|
| Content | Selected items, quantities, modifiers, item prices, subtotal, estimated taxes/charges, estimated total, ordering context |
| Actions | Change quantity, Remove item, Edit modifiers (if permitted), Go to checkout |
| States | Empty cart, Cart populated, Item no longer available, Price/availability changed, Cart requires review |
| Rules | Displayed total is provisional until server validates checkout. Customer is informed of material changes. |

---

### CUS-05 — Checkout

**Goal:** Collect information required to submit an eligible order.

| Element | Details |
|---|---|
| Content | Order summary, contact details (if required), pre-order date/time (if applicable), table context (for QR orders), payment method, charges, final total |
| Actions | Confirm order details, Initiate payment (if required), Submit order |
| States | Validating cart, Ready to submit, Submission in progress, Submission confirmed, Submission rejected, Result unknown |
| Rules | Prevent accidental repeated submissions. Preserve submission reference. Do not show success until server confirms the order. |

---

### CUS-06 — Order Confirmation

**Goal:** Confirm the outcome of an order submission.

| Element | Details |
|---|---|
| Content | Order reference, current order status, order summary, payment status, expected service time (if available) |
| Actions | Track order, View order details, Return to menu |
| States | Accepted, Pending confirmation, Rejected, Payment pending, Confirmation unavailable |

---

### CUS-07 — Order Tracking

**Goal:** Show the current status of an existing order.

| Element | Details |
|---|---|
| Content | Order reference, item summary, current status, status timeline, estimated prep time, payment status |
| Actions | Refresh status, Return to menu, Request assistance (if supported) |
| States | Waiting for acceptance, Accepted, Preparing, Partially ready, Ready, Served/fulfilled, Cancelled, Temporarily disconnected |
| Rules | Live updates are reconciled with persisted server state. Page recovers latest status after reconnection. |

---

### CUS-08 — Reservation Search

**Goal:** Find eligible reservation options.

| Element | Details |
|---|---|
| Content | Date selector, time selector, party size, available reservation options, booking policies |
| Actions | Select date and time, Change party size, Continue to reservation details |
| States | Loading availability, Available slots, No availability, Restaurant closed, Invalid date or party size |
| Rules | Availability shown is provisional until reservation is confirmed. Time zones follow restaurant config. |

---

### CUS-09 — Reservation Details & Verification

**Goal:** Collect booking details and verify the customer.

| Element | Details |
|---|---|
| Content | Selected date/time, party size, customer contact details, applicable deposit, cancellation/no-show policy |
| Actions | Request OTP, Submit OTP, Request new OTP (within limits), Continue to confirmation |
| States | Entering details, OTP sent, OTP invalid, OTP expired, Resend temporarily unavailable, Verification successful |
| Rules | Verification codes must not be exposed in production or logs. Resend limits and expiry are enforced. |

---

### CUS-10 — Reservation Confirmation

**Goal:** Show the final reservation outcome.

| Element | Details |
|---|---|
| Content | Reservation reference, date/time/party size, reservation status, deposit status (if applicable), cancellation and arrival instructions |
| Actions | View reservation details, Cancel (when permitted), Contact restaurant |
| States | Pending confirmation, Awaiting deposit, Confirmed, Cancelled, Expired, No longer available |

---

### CUS-11 — Bill and Payment Status

**Goal:** Let a customer understand the bill and settlement status.

| Element | Details |
|---|---|
| Content | Bill reference, itemized charges, discounts/taxes, total, amount paid, outstanding balance, payment status |
| Actions | Initiate online payment (where permitted), Retry failed payment, View settlement status |
| States | Bill pending, Payment processing, Partially paid, Settled, Payment failed, Refund pending, Refunded |
| Rules | Browser return URL alone does not determine payment success. Financial status is reconciled with authoritative payment records. |

---

## 6. Staff Pages

### STF-01 — Staff Login

**Goal:** Authenticate restaurant staff.

| Element | Details |
|---|---|
| Content | Login form, error messages, password recovery entry (if supported) |
| States | Ready, Submitting, Invalid credentials, Account disabled, Temporarily unavailable |
| Rules | Authentication failures don't reveal unnecessary account details. Successful login loads only authorized functionality. |

---

### STF-02 — Operational Overview (Dashboard)

**Goal:** Give authorized managers a summary of current operations.

| Element | Details |
|---|---|
| Content | Active tables, new/active orders, kitchen workload, upcoming reservations, outstanding bills, inventory warnings |
| Actions | Open the relevant module, Filter/inspect a status summary |
| States | Loading, Data available, No active operations, Partial data unavailable, Access denied |
| Rules | Summary values derived from authoritative records. Operational counts do not imply financial settlement unless verified. |

---

### STF-03 — Table Overview

**Goal:** Show the current state of restaurant tables.

| Element | Details |
|---|---|
| Content | Table ID, capacity, occupancy/service status, active session reference, order or reservation indicator |
| Actions | Open a table, Start an eligible service session, Assign/reassign a table (if permitted), View active orders |
| States | Available, Reserved, Occupied, Awaiting cleaning/reset (if enabled), Unavailable, Loading/error |
| Rules | Displayed table status must agree with the underlying service session and reservation rules. |

---

### STF-04 — Table Service Session

**Goal:** Coordinate all activity for a dining table.

| Element | Details |
|---|---|
| Content | Table ID, session status, active orders, item prep status, associated reservations, bill/payment summary, service history |
| Actions | Add an order, View an order, Request a bill, Record permitted service events, Close the session |
| States | Active, Awaiting preparation, Ready for service, Awaiting settlement, Closed, Requires staff attention |
| Rules | Closing a session does not erase order or payment history. Unsettled balances are handled per configured closure policy. |

---

### STF-05 — Order Creation

**Goal:** Allow authorized staff to create an order.

| Element | Details |
|---|---|
| Content | Menu selector, category navigation, item and modifier selection, quantity controls, special instructions, table/context, order summary |
| Actions | Add items, Remove items (before submission), Review total, Submit order |
| States | Empty order, Draft populated, Validation error, Submission in progress, Accepted, Rejected |
| Rules | Staff orders use the same server-side validation and pricing rules as customer orders. |

---

### STF-06 — Order Details

**Goal:** Show an order's complete operational state.

| Element | Details |
|---|---|
| Content | Order reference, creation time, customer/table context, item + price snapshots, kitchen status, payment status, status history |
| Actions | Request permitted modifications, Cancel (per policy), View related kitchen ticket, View related bill |
| States | Submitted, Accepted, Preparing, Ready, Fulfilled, Cancelled, Requires attention |
| Rules | Every action must follow valid state transitions and permissions. |

---

### STF-07 — Kitchen Display

**Goal:** Help kitchen staff process current preparation work.

| Element | Details |
|---|---|
| Content | Incoming tickets, order age/elapsed prep time, item quantities and modifiers, special instructions, current status, station assignment (if supported) |
| Actions | Accept ticket, Start preparation, Mark item ready, Mark ticket ready, Acknowledge modifications/cancellations |
| States | New ticket, Queued, Preparing, Partially ready, Ready, Cancelled, Delayed, Reconnecting |
| Rules | New/urgent work is visually distinguishable. Stale client data doesn't silently overwrite newer server state. Status changes validated server-side. |

---

### STF-08 — Reservation Management

**Goal:** Manage upcoming and current reservations.

| Element | Details |
|---|---|
| Content | Reservation list/schedule, date/time, party size, reservation status, deposit status, assigned table |
| Actions | Search reservations, Filter by date/status, View details, Confirm eligible reservations, Check in customers, Record cancellations/no-shows |
| States | No reservations, Upcoming reservations, Awaiting confirmation, Deposit pending, Checked in, Cancelled, No-show, Error loading |
| Rules | Conflicting table assignments are prevented. Reservation changes preserve history. |

---

### STF-09 — Billing and Payments

**Goal:** Manage bills and outstanding payments.

| Element | Details |
|---|---|
| Content | Eligible orders/table sessions, bill details, itemized totals, amount paid, outstanding balance, payment method/reference, refund status |
| Actions | Generate bill, Finalize bill, Record cash payment, Inspect online payment status, Initiate permitted refund, Reconcile discrepancies |
| States | Draft bill, Finalized, Partially paid, Settled, Payment pending, Payment failed, Refund pending, Discrepancy detected |
| Rules | Sensitive financial actions require appropriate permissions. Bill cannot be settled while a balance remains. Payment notifications handled idempotently. |

---

### STF-10 — Inventory Overview

**Goal:** Show current ingredient stock levels.

| Element | Details |
|---|---|
| Content | Ingredient name, unit, current stock, low-stock threshold, recent movements, related menu-item usage |
| Actions | Open ingredient details, Record stock receipt, Record authorized adjustment, Review low-stock warnings |
| States | Loading, Inventory available, No inventory records, Low stock, Potential stock discrepancy, Access denied |
| Rules | Stock balances derive from recorded movements and defined opening balances. |

---

### STF-11 — Ingredient and Recipe Management

**Goal:** Configure ingredients and menu-item recipes.

| Element | Details |
|---|---|
| Content | Ingredient details, unit of measurement, recipe quantities, menu-item association, recipe version/effective date |
| Actions | Create ingredient, Edit ingredient details, Configure a recipe, Validate units/quantities, Save changes |
| States | Draft, Valid, Invalid unit or quantity, Missing recipe, Saved, Permission denied |
| Rules | Recipe changes must not silently rewrite historical stock consumption. |

---

### STF-12 — Staff Management

**Goal:** Manage staff access and permissions.

| Element | Details |
|---|---|
| Content | Staff list, account status, assigned role, relevant account info |
| Actions | Create account, Change permitted roles, Disable account, Review access |
| States | No staff records, Loading, Active account, Disabled account, Validation error |
| Rules | Only authorized admins can change permissions. Changes to privileged roles must be audited. |

---

### STF-13 — Restaurant Settings

**Goal:** Configure restaurant-level policies.

| Element | Details |
|---|---|
| Content | Restaurant info, operating hours, currency and timezone, ordering policies, reservation settings, deposit/cancellation rules, tax/billing config |
| Actions | Edit settings, Validate changes, Save settings |
| States | Loading, Unsaved changes, Validation error, Saved, Permission denied |
| Rules | Changes apply consistently across relevant workflows. Historical orders and bills retain their historical values. |

---

### STF-14 — Reports and Audit History

**Goal:** Review operational performance and sensitive activity.

| Element | Details |
|---|---|
| Content | Order summaries, sales and payment summaries, inventory movement history, audit records, filters and date ranges |
| Actions | Filter records, Inspect details, Export records (if enabled) |
| States | No matching records, Loading, Data available, Partial data unavailable, Access denied |
| Rules | Reports clearly identify the underlying period and status definitions. Audit history does not expose info beyond viewer's permissions. |

---

## 7. Shared UI Components

These components should be standardized across all pages:

- App header and navigation
- Restaurant identity and table context
- Status badges
- Search and filter controls
- Menu item cards
- Quantity selectors
- Order summary
- Price and payment summary
- Data tables / responsive lists
- Confirmation dialogs
- Form field validation messages
- Toast / inline notifications
- Loading skeletons
- Empty-state messages
- Error and retry panels
- Pagination controls

> Exact styling and responsive breakpoints will be documented in the visual design specification.

---

## 8. Required UI States

Every data-driven screen must handle these states:

| State | What to show |
|---|---|
| Loading | Clear loading indicator while system retrieves info |
| Empty | Explain why no records exist; provide a relevant next action |
| Error | Explain the failure in plain language; offer a safe retry or recovery path |
| Permission Denied | Tell the user the operation is unavailable; don't expose protected info |
| Validation Error | Identify invalid fields and explain how to correct them |
| Pending | Distinguish "awaiting confirmation" from "completed" |
| Connection Lost | Indicate that info may be stale; provide a safe refresh path |
| Success | Show success only after the required operation is confirmed |
| Conflict | Explain when a record has changed and requires user review |

---

## 9. Responsive Design

### Customer interface
- Prioritize mobile screens
- Cart is easy to access at all times
- No horizontal scrolling in primary workflows
- Form fields and controls are touch-friendly
- Prices and order status are clearly readable

### Staff interface
- Support desktop and tablet layouts
- Rapid access to current work
- High-frequency kitchen actions are easy to tap
- Responsive layouts for smaller screens without hiding critical status

### Kitchen interface
- Readable at a distance
- Active tickets are visually distinct
- Do not rely on color alone
- Status updates accessible through large, clearly labeled controls

---

## 10. Accessibility Requirements

- All interactive controls have meaningful accessible names
- Keyboard users can navigate forms and staff interfaces
- Focus states remain visible
- Text and controls meet appropriate contrast standards
- Validation errors are associated with their relevant fields
- Status is conveyed using text or another accessible indicator (not color alone)
- Important confirmations and errors are announced accessibly where appropriate

---

## 11. UX Acceptance Criteria

| ID | Test |
|---|---|
| UX-AC-001 | Customer can discover an item, configure it, add to cart, and reach checkout without hitting a dead-end screen |
| UX-AC-002 | Customer can review order summary and any price/availability changes before final submission |
| UX-AC-003 | Customer using a table QR link can identify the restaurant and active table context before placing an order |
| UX-AC-004 | Customers and authorized staff see consistent persisted order states |
| UX-AC-005 | Kitchen staff can identify new tickets and update prep states without unnecessary navigation |
| UX-AC-006 | When a reservation slot becomes unavailable, the interface explains the conflict and lets customer choose another option |
| UX-AC-007 | Interface clearly distinguishes a failed or pending payment from a successful payment |
| UX-AC-008 | Users do not see or successfully execute actions that their role does not authorize |
| UX-AC-009 | A recoverable failure provides a clear next action and does not silently duplicate an order or payment |
| UX-AC-010 | Core customer workflows function on mobile browsers; core staff workflows work on desktop and tablet |

---

## 12. Open Design Decisions

Resolve these during detailed design:

1. Does order tracking require an account, a secure link, or another recovery method?
2. How do customers access bills for a shared table?
3. Can table sessions support multiple independent bills?
4. Which kitchen actions are item-level vs. ticket-level?
5. Can customers request bill splitting through the interface?
6. Which report exports are needed for the first release?
7. Are assistance requests included in the initial MVP?
8. Which screens need live updates vs. manual refresh?
9. Which empty, loading, and error states need dedicated wireframes?
10. Which design system, typography, and component tokens will be used?

---

## 13. Approval Criteria

This document can be approved when:
- All primary customer and staff pages are accounted for
- Navigation is consistent with the approved roles
- Each major workflow has clear page responsibilities
- Loading, empty, error, pending, success, and conflict states are defined
- Responsive and accessibility requirements are agreed
- Open design decisions have been resolved or assigned

> **Approval does not authorize implementation.** Next step: system architecture, then database design, API contracts, security, testing, and implementation roadmap.

---

**End of Document 04 — UX Information Architecture & Page Specification**