# Document 12 — UI/UX Design Specification

**Project:** Restaurant OS  
**Document Type:** Product Design and Interaction Specification  
**Version:** 0.1 — Draft  
**Status:** Proposed; pending review  
**Platforms:** Customer web, staff web application, mobile-responsive QR ordering  
**Design Approach:** Task-focused, responsive, accessible, operationally efficient

---

## 1. Purpose

This document defines the UI/UX design direction for Restaurant OS.

It covers:

- Customer-facing experience.
- Staff dashboard and operational workflows.
- Kitchen display interface.
- Cashier and billing experience.
- Navigation and page hierarchy.
- Design tokens and component standards.
- Interaction patterns.
- Loading, empty, error, and success states.
- Responsive behavior and accessibility.
- Design validation and acceptance criteria.

The objective is to create a coherent interface across customer ordering and restaurant operations without making every user work through the same dashboard.

## 2. Design Goals

### UX-001: Minimize operational friction

Common actions such as accepting an order, updating a kitchen ticket, opening a table session, and settling a bill should require minimal unnecessary navigation.

### UX-002: Make important information immediately visible

Order status, table availability, payment state, and preparation progress must be easy to distinguish.

### UX-003: Prevent costly mistakes

Destructive, financial, and irreversible actions must have appropriate confirmation, validation, and feedback.

### UX-004: Optimize for the user's environment

A customer may use a mobile phone while seated at a table. Kitchen staff may use a large display. A cashier may use a desktop or tablet.

The layout must reflect those differences.

### UX-005: Maintain consistent interaction patterns

Buttons, forms, dialogs, notifications, status indicators, and navigation must behave consistently across modules.

### UX-006: Provide understandable failure states

Users must know whether an operation succeeded, failed, or is still being processed.

### UX-007: Keep the MVP focused

The first release should not contain decorative analytics, unnecessary animation, or complex configuration screens that do not support the agreed MVP workflows.

---

## 3. Product Experience Areas

Restaurant OS contains three major experience areas.

### 3.1 Customer experience

Primary tasks:

- Discover restaurant information.
- Browse the menu.
- Customize items.
- Place pre-orders.
- Place QR-based table orders.
- Track order status.
- Make reservations.
- Complete required payment steps.
- Access relevant order and reservation details.

### 3.2 Staff operations

Primary tasks:

- Sign in.
- View operational activity.
- Manage tables and service sessions.
- Create and update orders.
- Manage menu availability.
- Handle reservations.
- Create bills and process permitted payment workflows.
- Manage inventory.
- View relevant reports.

### 3.3 Kitchen operations

Primary tasks:

- See incoming preparation work.
- Identify new, accepted, and in-progress tickets.
- Prioritize work.
- Update preparation states.
- Identify delayed tickets.
- Mark eligible tickets ready.
- Recover from lost connections without duplicating work.

Kitchen operations should have a focused interface rather than requiring staff to navigate the full administrative dashboard.

---

## 4. Proposed Visual Direction

The visual direction should be professional, readable, and operationally calm.

The interface must prioritize information hierarchy and speed over decorative effects.

### 4.1 Design characteristics

- Clear typography.
- Strong visual hierarchy.
- Consistent spacing.
- High-contrast operational status indicators.
- Restrained use of color.
- Readable tables and lists.
- Predictable navigation.
- Limited animation.
- Responsive layouts.
- Accessible controls.

### 4.2 Brand identity

The final brand name, logo, typography, and color palette remain open decisions.

The product should feel suitable for both cafés/QSRs and full-service restaurants rather than being visually tied to one cuisine or restaurant style.

The customer-facing menu may allow restaurant-specific branding while staff operations retain a consistent product interface.

### 4.3 Avoid

- Excessive gradients and decorative effects.
- Overloaded dashboards.
- Small, difficult-to-tap mobile controls.
- Color-only status communication.
- Hidden actions for frequently used workflows.
- Animations that delay operational tasks.
- Unnecessary charting on screens intended for rapid action.

---

## 5. Information Architecture

The UI structure must remain aligned with Document 04.

### 5.1 Customer-facing routes

Proposed route structure:

- `/r/:restaurantSlug` — restaurant landing page.
- `/r/:restaurantSlug/menu` — menu browsing.
- `/r/:restaurantSlug/cart` — cart and order review.
- `/r/:restaurantSlug/checkout` — pre-order checkout.
- `/r/:restaurantSlug/order/:orderId` — authorized order status.
- `/r/:restaurantSlug/reservations` — reservation creation.
- `/r/:restaurantSlug/reservations/:reservationId` — authorized reservation details.
- `/qr/:token` — QR entry and table context.

These routes are proposals. The final routing scheme must account for the chosen Next.js application structure and secure guest-access model.

Sensitive information must not be exposed merely because a route contains a resource ID.

### 5.2 Staff routes

Proposed route structure:

- `/staff/login`
- `/staff`
- `/staff/orders`
- `/staff/kitchen`
- `/staff/tables`
- `/staff/reservations`
- `/staff/billing`
- `/staff/menu`
- `/staff/inventory`
- `/staff/reports`
- `/staff/team`
- `/staff/settings`

Access to each route and its underlying API operations must be permission-controlled.

### 5.3 Navigation rules

Customer navigation should prioritize menu browsing, cart, reservations, and order tracking.

Staff navigation should prioritize operational modules based on the user's role.

Kitchen staff should see a focused kitchen interface without unrelated financial or administrative navigation.

The system should not show navigation items as if the user has access when the user's permissions do not allow the corresponding operations.

---

## 6. Global Design Tokens

Exact values will be finalized after visual exploration.

### 6.1 Spacing

Use a consistent spacing scale rather than arbitrary spacing values.

Proposed scale:

- `space-1`: 4 px
- `space-2`: 8 px
- `space-3`: 12 px
- `space-4`: 16 px
- `space-5`: 24 px
- `space-6`: 32 px
- `space-7`: 48 px
- `space-8`: 64 px

The implementation may map these tokens to the chosen styling system.

### 6.2 Typography

Typography must establish a clear hierarchy between:

- Page title.
- Section title.
- Card title.
- Body text.
- Supporting text.
- Form labels.
- Status labels.
- Financial values.

Use readable body text and sufficiently large operational status indicators.

Long item names, customer names, and table labels must not break layouts.

### 6.3 Color semantics

The final palette remains open, but semantic colors should have stable meanings.

| Semantic token | Intended use |
|---|---|
| Primary | Main actions and active navigation |
| Success | Confirmed successful operation |
| Warning | Attention required |
| Danger | Error, destructive action, or serious problem |
| Information | Neutral guidance |
| Neutral | Ordinary text, borders, and surfaces |
| Disabled | Unavailable interaction |

Color must not be the only indicator of status. Pair it with readable text, icons, or another accessible signal.

### 6.4 Borders and elevation

Use consistent border, radius, and elevation tokens.

Cards and dialogs should have enough visual separation to communicate hierarchy without making every element appear as a separate floating panel.

### 6.5 Motion

Motion should communicate meaningful state changes.

Examples include a short confirmation transition or a subtle menu/cart update.

Avoid motion that blocks interaction, causes excessive distraction, or makes the interface feel slower.

Honor reduced-motion preferences where practical.

---

## 7. Core Reusable Components

The design system should include reusable components for common patterns.

### 7.1 Navigation components

- Customer header.
- Staff sidebar.
- Mobile navigation.
- Breadcrumbs where useful.
- Restaurant identity selector if multi-restaurant staff access is introduced.

### 7.2 Data components

- Status badge.
- Data table.
- Order card.
- Kitchen ticket.
- Reservation card.
- Table status card.
- Bill summary.
- Payment status panel.
- Inventory quantity indicator.
- Empty-state panel.

### 7.3 Form components

- Text input.
- Numeric input.
- Select control.
- Date and time picker.
- Phone input.
- Checkbox.
- Radio group.
- Toggle.
- Validation message.
- Search field.
- Confirmation dialog.

### 7.4 Feedback components

- Toast or notification.
- Inline error.
- Loading indicator.
- Skeleton state.
- Retry action.
- Connection status indicator.
- Unsaved-changes warning.

Components must have documented behavior and accessibility expectations.

---

## 8. Customer Menu Experience

### 8.1 Restaurant landing page

The page should communicate:

- Restaurant name and branding.
- Relevant opening information.
- Available ordering options.
- Menu entry point.
- Reservation entry point where supported.
- Essential policies or notices.

Avoid placing lengthy promotional content above the primary customer actions.

### 8.2 Menu browsing

The menu screen should provide:

- Category navigation.
- Item name and description.
- Price.
- Image where available.
- Relevant dietary labels where supported.
- Availability state.
- Item customization entry point.

Customers should be able to scan items quickly without opening every item individually.

### 8.3 Item customization

The item detail interface should clearly distinguish:

- Required modifiers.
- Optional modifiers.
- Minimum and maximum selection rules.
- Additional modifier prices.
- Quantity.
- Special instructions where supported.
- Updated item price.

Invalid modifier combinations must be prevented or clearly explained.

### 8.4 Cart

The cart should display:

- Selected items.
- Quantities.
- Modifier selections.
- Applicable special instructions.
- Item totals.
- Estimated taxes or charges where the product rules permit.
- Current order total.
- Clear edit and removal actions.

The cart is a client-side representation of intent. The backend must recalculate and validate the authoritative totals during submission.

### 8.5 Checkout

Checkout should show the relevant ordering mode and necessary details.

For pre-orders, include only the scheduling and fulfillment fields supported by the approved MVP.

For QR orders, show the resolved restaurant and table context without exposing internal security tokens.

Payment options must reflect the configured restaurant capabilities and current availability.

---

## 9. Order Tracking Experience

The order status page should communicate the current state in plain language.

Proposed progression:

1. Order placed.
2. Confirmed, where required.
3. In preparation.
4. Ready.
5. Served or handed over, where applicable.
6. Completed.

Cancelled orders must be displayed distinctly.

The interface must not show a stage as completed merely because the browser has optimistic local state.

### Required states

- Initial loading.
- Order found and authorized.
- Current status.
- Cancellation pending or completed, where applicable.
- Payment pending or uncertain.
- Temporary connection failure.
- Expired or invalid access.
- Order no longer available.

If real-time updates disconnect, show that the displayed status may be stale and provide a safe refresh path.

---

## 10. Reservation Experience

### 10.1 Reservation form

The form should collect only the required information.

Potential fields:

- Date.
- Time.
- Party size.
- Customer name.
- Phone number.
- Verification step.
- Deposit information where applicable.
- Relevant booking notes if supported.

Required fields must follow the approved reservation policy.

### 10.2 Availability presentation

Available slots should be easy to compare.

The UI must not imply that selecting a slot guarantees a reservation.

The final submission must revalidate availability on the server.

### 10.3 Verification and payment

OTP and deposit steps should clearly explain:

- What action is required.
- Whether the code was sent.
- When the code expires, where relevant.
- Whether another code can be requested.
- Whether the reservation is pending or confirmed.
- Whether payment is pending or confirmed.

### 10.4 Reservation confirmation

Show:

- Reservation reference.
- Date and time.
- Party size.
- Restaurant details.
- Relevant cancellation policy.
- Deposit status where applicable.

Do not show a confirmed reservation until the server confirms that the required conditions have been satisfied.

---

## 11. Staff Dashboard

### 11.1 Purpose

The dashboard should provide an operational overview, not become a wall of charts.

Useful information may include:

- Active orders.
- Orders requiring attention.
- Kitchen workload.
- Current table occupancy.
- Upcoming reservations.
- Payment or billing tasks requiring action.

The exact dashboard widgets must be limited to information supported by the MVP and the user's permissions.

### 11.2 Role-aware views

A waiter should prioritize tables and orders.

A kitchen worker should prioritize preparation tickets.

A cashier should prioritize bills and payment operations.

A manager may see a broader operational summary.

Avoid showing the same dashboard to every role merely because it is easier to implement.

---

## 12. Table and Service Session Interface

The table view should make operational states distinguishable.

Possible information:

- Table identifier.
- Seating capacity.
- Current session state.
- Associated active orders.
- Relevant reservation status.
- Outstanding billing state where authorized.

Primary actions may include:

- Open session.
- View session.
- Add order.
- View permitted session details.
- Start billing.
- Close session when eligible.

### Safety rules

- Prevent accidental duplicate session creation.
- Require confirmation for high-impact closure actions where appropriate.
- Explain why an action is unavailable.
- Refresh authoritative state after concurrency conflicts.
- Do not permit ordinary ordering against a closed session.

---

## 13. Kitchen Display Interface

The kitchen screen is an operational workspace, not a general-purpose admin dashboard.

### 13.1 Information hierarchy

Each ticket should make the following easy to identify:

- Order reference.
- Time received or elapsed time.
- Items and quantities.
- Modifiers and special instructions.
- Current preparation state.
- Required action.

### 13.2 Layout

A column-based layout may group tickets into:

- New.
- In progress.
- Ready.

The final grouping must match the approved kitchen state machine.

Use readable text, clear spacing, and large action controls.

### 13.3 Interaction rules

- Accept or start work using explicit actions.
- Mark a ticket ready only when required items are complete.
- Prevent duplicate action submissions.
- Show confirmation or updated status after a successful transition.
- Handle simultaneous staff updates safely.
- Indicate stale connection state.

The screen must remain usable without relying exclusively on color, sound, or animation.

---

## 14. Billing and Cashier Interface

The cashier interface must prioritize correctness and clarity.

### 14.1 Bill summary

Display:

- Included items and quantities.
- Unit prices.
- Modifiers.
- Discounts.
- Taxes and applicable charges.
- Total due.
- Confirmed payments.
- Outstanding balance.
- Relevant payment history.

### 14.2 Finalization

Before finalization, the user should be able to review the bill and identify the operation being confirmed.

After finalization, the interface must distinguish ordinary viewing from approved adjustment or void workflows.

### 14.3 Payment state

Payment states must distinguish:

- Not initiated.
- Pending.
- Confirmed.
- Failed.
- Unknown or awaiting verification.
- Refund pending or completed, where applicable.

Do not display a success message solely because a payment button was clicked.

### 14.4 Duplicate-action protection

Disable or otherwise protect against accidental repeated submissions while an operation is in progress.

The backend must still enforce idempotency because frontend protection alone is insufficient.

---

## 15. Menu and Inventory Management

### 15.1 Menu management

The interface should support the approved MVP operations for:

- Categories.
- Menu items.
- Prices.
- Modifiers.
- Availability.
- Publishing and archiving.

High-impact changes should be validated and clearly confirmed.

Historical order snapshots must remain unchanged when menu prices or descriptions are updated.

### 15.2 Inventory management

The inventory interface should present:

- Ingredient name.
- Measurement unit.
- Current stock or approved stock summary.
- Relevant movement history.
- Receipt and adjustment actions.
- Validation messages.

Stock adjustments should require a clear movement type and, where appropriate, a reason.

The interface must not encourage users to overwrite historical stock movements or bypass inventory rules.

---

## 16. Loading, Empty, Error, and Success States

Every major page must define its operational states.

### Loading

Use a meaningful loading indicator or skeleton when data retrieval takes time.

Prevent duplicate submissions during in-flight operations.

### Empty

Explain what the empty state means and offer an appropriate next action.

Examples:

- No orders yet.
- No kitchen tickets.
- No upcoming reservations.
- No stock movements recorded.

### Error

Explain what failed and what the user can safely do next.

Examples:

- Invalid form input.
- Session expired.
- Permission denied.
- Resource no longer available.
- Temporary server failure.
- Payment outcome awaiting verification.

### Success

Show confirmation only after the relevant operation succeeds according to the API contract.

For important operations, display a reference or updated resource state.

### Conflict

When another user has changed the resource, refresh or present the latest authoritative state and explain why the requested action could not proceed.

---

## 17. Responsive Design Requirements

### Mobile

Prioritize:

- Menu browsing.
- Item customization.
- Cart editing.
- Checkout.
- Reservation creation.
- Order tracking.

Touch targets must be large enough for comfortable interaction.

### Tablet

Support appropriate layouts for:

- Waiter operations.
- Table management.
- Cashier workflows.
- Kitchen ticket management where required.

### Desktop

Prioritize:

- Staff navigation.
- Data-heavy operational tables.
- Inventory management.
- Reports.
- Configuration screens.

Responsive behavior should be based on available space and task requirements rather than simply shrinking the desktop layout.

The final MVP must define its supported minimum viewport sizes and browser matrix.

---

## 18. Accessibility Requirements

The design must aim for WCAG 2.2 Level AA where applicable.

Requirements include:

- Keyboard-accessible controls.
- Visible focus states.
- Appropriate text and interface contrast.
- Semantic HTML.
- Accessible form labels.
- Clear error association with invalid fields.
- Screen-reader-compatible status updates.
- Accessible dialogs and focus management.
- Alternative text for meaningful images.
- No color-only status communication.
- Support for reduced motion where practical.

Accessibility should be tested throughout development rather than left until the final review.

---

## 19. UX Analytics and Privacy

If product analytics are introduced, collect only information needed to evaluate usability and product behavior.

Potential aggregate events include:

- Menu viewed.
- Item added to cart.
- Checkout started.
- Order submitted.
- Reservation submitted.
- Payment workflow started.
- Workflow abandoned.

Analytics must not capture passwords, OTPs, session secrets, payment credentials, or unnecessary personal information.

Operational audit logs and product analytics must remain separate.

The MVP may begin with basic operational metrics before introducing a dedicated analytics provider.

---

## 20. Design Validation Plan

Before finalizing the visual system:

1. Create low-fidelity wireframes for critical customer and staff workflows.
2. Review them against Documents 03 and 04.
3. Create a small visual prototype for the highest-priority screens.
4. Test the prototype with representative tasks.
5. Identify confusing navigation and unnecessary steps.
6. Validate mobile menu and QR ordering behavior.
7. Validate the kitchen and cashier information hierarchy.
8. Record feedback and revise the design.
9. Approve the core patterns before implementing all screens.

Even without a large group of real users, structured task walkthroughs can expose confusing flows. They do not, however, replace validation with actual restaurant staff when that becomes possible.

---

## 21. UI/UX Acceptance Criteria

Before design approval:

- [ ] Every MVP journey maps to the required screens.
- [ ] Customer and staff experiences have separate, appropriate navigation.
- [ ] Kitchen operations use a focused interface.
- [ ] The menu, cart, and checkout display clear pricing information.
- [ ] Order and reservation states are understandable.
- [ ] Payment uncertainty is communicated honestly.
- [ ] Loading, empty, error, success, and conflict states are specified.
- [ ] Important actions have appropriate confirmation and duplicate-submission protection.
- [ ] Responsive behavior is defined for supported viewports.
- [ ] Accessibility requirements are incorporated into component design.
- [ ] Role-based navigation matches backend permissions.
- [ ] The visual direction and core components are approved.
- [ ] No screen promises a state that the backend has not confirmed.

---

## 22. Open Decisions

1. What is the final product name, logo, and visual identity?
2. What color palette and typography will be used?
3. Will the customer experience be a responsive web app only, or will installable PWA behavior be included?
4. Which browsers and minimum viewport sizes must be supported?
5. Will the kitchen interface include sound notifications?
6. Will staff use dedicated tablet layouts?
7. Which dashboard widgets are essential for MVP?
8. Which menu images and dietary labels are supported?
9. Which customer analytics events are necessary?
10. What level of restaurant branding customization is included in the first release?
11. Which accessibility testing tools will be used?
12. Which screens need high-fidelity designs before implementation?

---

## 23. Final Status

**Document 12 is a proposed UI/UX design specification.**

It establishes the interaction and visual requirements for Restaurant OS while leaving brand and detailed visual decisions open for review.

It must remain aligned with:

- Document 02 — Product Requirements.
- Document 03 — User Journeys and Workflows.
- Document 04 — UX Information Architecture.
- Document 07 — API Specification and Contract Design.
- Document 09 — Business Rules and State Machines.
- Document 11 — Testing Strategy and Quality Gates.

The purpose of this document is to reduce design ambiguity before implementation, not to prescribe every pixel before the core workflows are validated.

**Next document:** Document 13 — Technical Decisions & Architecture Decision Records (ADRs).
