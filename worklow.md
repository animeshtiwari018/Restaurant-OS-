# RESTRO MANAGE
## Smart QR-Based Restaurant Management, Waiter Dispatch & Nutritional Transparency System

**Project Type:** Full-Stack Restaurant Operations Platform  
**Initial Deployment:** One Individual Restaurant  
**Architecture:** Modular Monolith  
**Primary Focus:** Backend Engineering, Database Design, Transaction Integrity, Real-Time Operations, Security and Payment Reliability  
**Future Direction:** Expansion-ready architecture for a multi-restaurant SaaS platform

---

# 1. Executive Summary

Restro Manage is a browser-based restaurant management platform designed to streamline dine-in operations, digital ordering, waiter dispatch, kitchen coordination, table reservations, nutritional transparency and billing through a unified system.

The platform connects customers, waiters, kitchen staff and restaurant administrators through role-specific interfaces backed by a centralized PostgreSQL database.

Its distinguishing feature is the combination of secure QR-based ordering, physical waiter verification, real-time order dispatch and a detailed nutritional menu. Every food item can display its ingredients, serving size, calories, protein, carbohydrates, fat and allergen information.

Customers can scan a table QR code, browse the menu, apply dietary filters, place orders and track preparation without downloading a native application. Orders submitted through customer devices remain pending until an authorized waiter verifies the request and confirms it for kitchen preparation.

The platform also supports advance table reservations, specific-table assignment, kitchen order tickets, thermal printing, one primary bill per dining session and multiple payment records against that bill.

## Product Vision

Build a reliable restaurant operating system that connects the entire dine-in journey:

**Discover Menu → Understand Ingredients → Order → Verify → Prepare → Serve → Settle Bill**

The objective is not simply to digitize a restaurant menu. It is to make restaurant operations more secure, transparent, coordinated and measurable.

## Primary Objectives

- Provide a zero-install customer ordering experience.
- Display detailed nutritional and ingredient information for every configured menu item.
- Help customers identify allergens and dietary preferences.
- Reduce fraudulent and prank orders through layered security and waiter verification.
- Prevent duplicate waiter assignments through atomic database operations.
- Synchronize customer, waiter and kitchen interfaces in real time.
- Prevent conflicting reservations and table assignments.
- Maintain accurate order histories, bills and payment records.
- Support kitchen display screens and optional thermal KOT printing.
- Provide administrators with menu, floor, reservation, staff and sales management.
- Keep the MVP focused while preserving a path toward future SaaS expansion.

---

# 2. Product Scope and Boundaries

## 2.1 Features Included in the MVP

1. Customer mobile web application.
2. Secure QR-based table access.
3. Phone number and OTP verification.
4. Customer dining-session management.
5. Menu and category management.
6. Food item ingredient management.
7. Nutritional information management.
8. Allergen and dietary-tag management.
9. Serving-size and portion information.
10. Item customizations and special instructions.
11. Customer cart and order placement.
12. QR-based dine-in ordering.
13. Waiter-assisted ordering.
14. Advance food ordering for permitted future fulfillment.
15. Real-time waiter dispatch and atomic order claiming.
16. Physical waiter verification.
17. Kitchen Display System (KDS).
18. Kitchen Order Ticket (KOT) generation.
19. Optional network thermal printing.
20. Table and floor management.
21. Advance reservations with specific-table assignment.
22. Configurable reservation deposit and no-show policies.
23. One primary bill per table service session.
24. Multiple payment records per bill.
25. Cash and supported digital payment methods.
26. Payment verification and reconciliation metadata.
27. Role-based staff permissions.
28. Audit logging.
29. Basic operational and sales analytics.
30. QR token revocation and regeneration.

## 2.2 Features Explicitly Excluded from the MVP

- Inventory and stock management.
- Automatic stock deduction.
- Recipe management and recipe versioning.
- Supplier management and purchase orders.
- Food delivery and delivery-partner dispatch.
- Independent split bills.
- Multiple primary bills for the same table service session.
- Native Android and iOS customer applications.
- Franchise management.
- Multi-restaurant subscription billing.
- Advanced accounting integrations.
- AI-based recommendations and forecasting.

**Scope principle:** Nutritional information and ingredient management are included in the MVP. Inventory tracking and recipe management are not required to deliver those features.

The restaurant can manually configure ingredient quantities and nutritional information without building a full inventory or recipe-management subsystem.

---

# 3. Customer Mobile Web Application

## 3.1 Zero-Install Access

- Customers access the application through a mobile browser.
- Scanning a physical table QR code opens the corresponding restaurant table entry point.
- No native application installation is required.
- The interface is optimized for mobile screens.
- Public menu browsing can be supported without requiring an authenticated dining session.

## 3.2 Secure Table Access

- Every physical table is associated with an opaque QR token.
- URLs do not expose sequential table IDs or directly editable table numbers.
- The backend resolves the token to the appropriate restaurant and table.
- Revoked or invalid tokens cannot initiate new authorized sessions.
- Customer authentication and dining-session authorization remain separate concerns.

## 3.3 Digital Menu and Nutritional Transparency

Every menu item can include the following information.

### Basic Item Information

- Food item name.
- Description.
- Category.
- Images.
- Selling price.
- Availability status.
- Serving size or portion information.
- Optional preparation-time estimate.

### Ingredient Information

Each food item can display its major ingredients and additional ingredients supplied by the restaurant.

Examples include:

- Paneer.
- Milk or curd.
- Butter or oil.
- Wheat flour.
- Rice.
- Vegetables.
- Spices.
- Sauces and seasonings.
- Other relevant ingredients.

Where the restaurant supplies ingredient quantities, the system can record the amount of each ingredient associated with a serving.

The MVP does not require a recipe engine, stock deduction or automatic ingredient purchasing calculations.

### Nutritional Information

Each food item can display:

- Calories, measured in kcal.
- Protein, measured in grams.
- Carbohydrates, measured in grams.
- Total fat, measured in grams.

Additional nutritional fields may be added later, such as:

- Saturated fat.
- Dietary fibre.
- Total sugar.
- Sodium.
- Serving weight in grams.

The four primary nutritional values are mandatory fields in the menu data model, but a value should only be published as verified when the restaurant has reliable data for it. Unknown values must be marked unavailable rather than fabricated.

### Serving-Size Rules

Nutritional values must be associated with a defined quantity.

For example:

- Per serving.
- Per 100 grams.
- Per specified portion weight.

The customer interface must clearly identify which basis is being displayed.

A dish containing 350 kcal per serving must not be presented as 350 kcal per 100 grams unless that is actually the calculated value.

The system should store the relevant serving-size basis alongside the nutritional values to prevent ambiguous reporting.

### Allergen Information

The restaurant can associate menu items with allergen tags such as:

- Milk and dairy.
- Peanuts.
- Tree nuts.
- Gluten-containing cereals.
- Soy.
- Egg.
- Fish.
- Shellfish.
- Sesame.
- Other applicable allergens.

The exact supported allergen taxonomy should be configurable.

Customers can filter or inspect menu items based on allergen and dietary preferences.

**Important:** An allergen filter is an informational aid, not a guarantee that a dish is allergen-free. The restaurant must disclose known cross-contact risks where applicable, and the interface must not invent safety assurances.

### Dietary Labels

Menu items can optionally include labels such as:

- Vegetarian.
- Vegan.
- Contains dairy.
- Contains egg.
- Gluten-free, where adequately verified.
- Other restaurant-defined dietary classifications.

Dietary labels must be based on restaurant-provided, appropriately validated information.

## 3.4 Customer Menu Example

Example display with illustrative nutritional values:

**Paneer Tikka**

- Serving size: 200 g.
- Calories: 320 kcal.
- Protein: 18 g.
- Carbohydrates: 12 g.
- Total fat: 22 g.
- Ingredients: Paneer, curd, spices, oil and lemon juice.
- Known allergen: Milk.

These example values are illustrative only and must not be used as actual nutritional data without verification.

## 3.5 Dietary Filters

Customers can apply filters such as:

- Vegetarian.
- Vegan.
- Contains or excludes selected known allergens.
- High-protein options, when reliable nutritional data exists.
- Lower-calorie options, when serving-size data exists.
- Items currently available.

Filtering must be based on structured database fields, not keyword matching against item descriptions alone.

An item with missing allergen information must not automatically be classified as safe for that allergen.

## 3.6 Cart and Customization

Customers can:

- Add items to the cart.
- Change quantities.
- Select supported customizations.
- Add cooking instructions per item.
- Add general table instructions.
- Review prices and quantities.
- Select an available payment method.
- Submit an order for waiter verification.

The backend recalculates the order total from authoritative menu prices. Client-submitted prices and totals must never be trusted.

When a menu item becomes unavailable or its price changes, the backend validates the cart again and communicates any necessary changes before order confirmation.

## 3.7 Ordering Modes

### Mode A: QR-Based Dine-In Ordering

The customer scans the physical table QR code, verifies their phone number, selects items and submits an order.

The order remains pending until an authorized waiter physically verifies the request.

### Mode B: Waiter-Assisted Ordering

An authorized waiter creates an order through the staff interface and associates it with the correct active table service session.

### Mode C: Advance Food Ordering

Customers can order food for a permitted future fulfillment time.

Advance food ordering must be distinguished from immediate dine-in ordering.

An advance food order does not automatically reserve a table. A table is guaranteed only when a valid table reservation exists.

## 3.8 Customer Order Tracking

The customer interface displays a meaningful order lifecycle:

`Order Submitted → Waiting for Waiter → Confirmed → Preparing → Ready → Served → Bill Settled`

The application must distinguish:

- Overall order status.
- Individual kitchen-item status.
- Payment status.
- Dining-session status.

A rejected order receives an appropriate status and explanation and must not enter the kitchen workflow.

---

# 4. Waiter Dispatch and Floor Operations

## 4.1 Real-Time Order Broadcast

When an eligible customer order is submitted:

- All eligible on-duty waiters receive a real-time alert.
- The alert shows the table number, item count and order amount.
- A configurable audible and visual notification is triggered.
- The order appears in the dispatch queue.
- Staff can inspect order details before claiming it.

Sensitive customer information must not be broadcast unnecessarily.

## 4.2 First-Come, First-Claim Assignment

The first eligible waiter to successfully claim an order becomes its assigned waiter.

The claim operation must be atomic.

If two waiters attempt to claim the same order simultaneously, only one operation can succeed.

The successful operation records the waiter assignment. Other waiters receive a conflict response or an updated order state.

PostgreSQL transactions and appropriate row locking or conditional updates should enforce this rule.

Redis can support temporary coordination and caching, but it must not be the only authority for permanent order ownership.

## 4.3 Physical Verification Gate

Claiming an order does not authorize kitchen preparation.

The assigned waiter must physically visit the table and:

1. Confirm customer presence.
2. Verify the correct table and dining session.
3. Review the requested items.
4. Clarify special instructions.
5. Confirm or reject the request.

Only a successful, authorized confirmation can release an eligible order into the kitchen workflow.

If the customer is absent, the waiter can reject the order without creating a kitchen ticket.

## 4.4 Service Lifecycle

Waiters can:

- View assigned orders.
- Receive kitchen-ready notifications.
- Mark items or orders as served.
- View active table sessions.
- Initiate the billing workflow.
- Perform authorized service actions.
- Release or escalate assignments under defined rules.

Backend permissions must prevent unauthorized staff from modifying orders assigned to other waiters unless a supervisory permission explicitly allows it.

## 4.5 Failure Handling

The system must handle:

- Waiter disconnections.
- Abandoned claims.
- Duplicate confirmation requests.
- Lost WebSocket connections.
- Rejected orders.
- Authorized reassignment.
- Staff going off duty while holding active assignments.

Reassignment must follow explicit rules and be auditable. The system must not silently transfer an order while its original waiter is already performing physical verification.

---

# 5. Kitchen Display System and KOT Management

## 5.1 Kitchen Order Ticket Generation

A KOT is generated only after the required waiter-verification gate succeeds.

The confirmation workflow must:

1. Validate the current order status.
2. Verify waiter authorization and assignment.
3. Confirm that the relevant dining session is valid.
4. Atomically transition the order into the confirmed workflow.
5. Record the confirmation event.
6. Make the kitchen ticket available to the KDS.
7. Queue a print job when thermal printing is enabled.

The kitchen must not receive unverified customer orders.

## 5.2 Kitchen Display System

Kitchen staff can view:

- Ticket number.
- Table or fulfillment reference.
- Item names and quantities.
- Item customizations.
- Cooking instructions.
- Confirmation timestamp.
- Elapsed preparation time.
- Current kitchen status.

Supported states:

`Queued → Preparing → Ready`

Exceptional states must be explicitly handled through validated transitions and audit records.

## 5.3 Item-Level Preparation

Individual items can have separate preparation statuses.

For example:

- Dish A: Ready.
- Dish B: Preparing.
- Dish C: Queued.

The overall order becomes ready only when all required items have reached the appropriate ready state.

This avoids marking a complete order as ready when only some dishes are prepared.

## 5.4 Thermal Printing

An optional ESC/POS-compatible thermal printer can print the KOT after waiter confirmation.

The integration may use:

- A network thermal printer.
- A local restaurant network.
- A local print agent or equivalent secure network bridge.
- TCP communication, commonly port 9100 when supported.

A cloud-hosted backend cannot directly access a printer on a restaurant's private LAN without an appropriate network bridge.

The print workflow should maintain:

- A persistent print-job record.
- Pending, processing, printed and failed states.
- Retry handling.
- Duplicate-print protection.
- Manual reprint with audit logging.

A committed database transaction does not prove that paper physically printed.

The KDS remains the authoritative kitchen workflow when the printer is offline.

---

# 6. Table and Dining-Session Management

## 6.1 Physical Table Management

Administrators can configure:

- Table identifier and display number.
- Seating capacity.
- Floor or section.
- Active or inactive status.
- Associated QR token.
- Operational availability.

The floor map can display:

- Available.
- Occupied.
- Reserved.
- Unavailable.

Reservation status and physical occupancy must remain logically separate.

A table reserved for a future slot can still be physically available before that reservation begins.

## 6.2 Table Service Sessions

A table service session represents one continuous dining visit.

It connects the table with its active orders, waiter assignments and primary bill.

Suggested lifecycle:

`Open → Active Service → Awaiting Settlement → Closed`

The database must prevent conflicting active dining sessions for the same physical table.

The system must not close a session merely because one order has been paid if other orders or outstanding obligations remain.

Historical sessions, orders and bills must remain available after closure.

## 6.3 Session Closure

A session can close only after its required closure conditions are satisfied:

- No unresolved order workflow.
- Required items served, cancelled or otherwise resolved.
- The primary bill fully settled, unless an authorized exception applies.
- Required closing actions completed.

The table becomes available according to its actual operational and reservation state.

---

# 7. Advance Table Reservation Engine

## 7.1 Reservation Creation

Customers can:

- Select a date and time.
- Enter the number of guests.
- Verify their phone number.
- Review the assigned table.
- Review applicable deposit and cancellation policies.
- Confirm the reservation.

Configurable parameters include:

- Restaurant opening hours.
- Booking window.
- Time-slot duration.
- Standard dining duration.
- Buffer between bookings.
- Cancellation policy.
- Deposit requirement.
- No-show policy.

The default dining duration is 90 minutes, configurable by restaurant management.

## 7.2 Specific-Table Assignment

Each confirmed reservation is assigned to a specific physical table.

The system must ensure:

- Adequate seating capacity.
- No conflicting confirmed reservation.
- No incompatible active dining session.
- Correct restaurant and table association.

Combining multiple physical tables for one reservation is excluded from the MVP.

## 7.3 Concurrency Protection

Checking availability and then inserting a reservation without transactional protection can cause overbooking.

Two customers might otherwise reserve the same table simultaneously.

The reservation engine must:

1. Validate the requested time interval.
2. Find a suitable table.
3. Coordinate the assignment using transactional protection.
4. Check overlapping reservations and temporary holds.
5. Create the reservation and assignment atomically.
6. Commit only when the assignment remains valid.

PostgreSQL exclusion constraints on table-and-time ranges, or an equivalent rigorously enforced design, should be considered.

Temporary reservation holds must expire according to explicit rules.

The engine must also check active dining sessions. A confirmed reservation cannot make an occupied table immediately available.

## 7.4 Deposit and No-Show Policies

Reservation states can include:

- Requested.
- OTP verified.
- Awaiting deposit.
- Confirmed.
- Cancelled.
- Completed.
- No-show.
- Expired.

Deposit payment records must remain distinct from the final restaurant bill.

Refund, forfeiture and deposit-application rules must be explicitly defined.

---

# 8. Billing and Payment Management

## 8.1 Primary Billing Rule

**One table service session = one primary bill.**

Multiple orders can contribute to the same bill according to the configured billing rules.

The MVP does not support independent split bills or multiple primary bills for one session.

## 8.2 Multiple Payments per Bill

A bill can have multiple payment records.

Example:

- Bill total: ₹2,000.
- First payment: ₹500 through UPI.
- Second payment: ₹1,000 by card.
- Remaining balance: ₹500 in cash.

The bill remains partially paid until the outstanding balance reaches zero.

Concurrent payment requests must not create inconsistent or duplicated settlements.

## 8.3 Payment Methods

Supported categories include:

- Cash.
- Online payment through a supported provider.
- UPI through a supported provider.
- Card payment through a supported provider or POS workflow.

The specific online payment provider will be selected during implementation.

Online payment success must be verified using a trusted server-side provider response, verified webhook or provider API. A browser redirect alone is not sufficient proof of payment.

## 8.4 Payment Records and Reconciliation

Each payment record should contain:

- Bill reference.
- Payment method.
- Amount and currency.
- Payment status.
- Provider reference, where applicable.
- Provider event identifier, where applicable.
- Verification and processing status.
- Reconciliation metadata.
- Creation and update timestamps.

Provider event identifiers should be unique where appropriate.

Webhook processing must be idempotent.

Raw webhook payloads will not be stored by default. The system retains the necessary verification and reconciliation metadata.

Card numbers, CVVs and sensitive payment credentials must not be stored.

## 8.5 Billing Rules

- Bill totals are calculated by the backend.
- Purchase-time prices are preserved in historical order items.
- Monetary values use appropriate decimal precision or integer minor units.
- Partial payments do not settle a bill.
- Failed payments do not count as successful settlement.
- Duplicate payment events do not create duplicate settlements.
- Refunds and reversals are explicitly recorded.
- A bill cannot be marked settled merely because a payment request was initiated.

Taxes, discounts, service charges, rounding and invoice numbering must be defined before billing implementation.

---

# 9. Admin Dashboard

## 9.1 Menu and Nutritional CMS

Administrators can:

- Create and edit menu categories.
- Add, edit and deactivate menu items.
- Set prices and serving sizes.
- Upload item images.
- Maintain ingredient lists.
- Record ingredient quantities where available.
- Enter calories, protein, carbohydrates and fat.
- Select the nutritional reporting basis.
- Maintain allergen information.
- Configure dietary labels.
- Configure item customizations.
- Toggle availability.
- Review and update nutritional information.

Menu changes must not rewrite historical order details.

Inventory, recipe management and automatic stock deduction remain excluded.

## 9.2 Staff and Permissions

Supported roles can include:

- Administrator.
- Manager.
- Waiter.
- Kitchen Staff.
- Cashier, if required.

Role-based permissions must be enforced by the backend.

Examples:

- Waiters claim and confirm eligible orders.
- Kitchen staff update preparation statuses.
- Authorized billing staff manage settlement operations.
- Administrators manage menu configuration, staff and tables.

## 9.3 Operational Dashboard

The dashboard can display:

- Active dining sessions.
- Table occupancy.
- Pending waiter confirmations.
- Assigned and unassigned orders.
- Kitchen queue and preparation times.
- Ready-to-serve orders.
- Reservations and upcoming arrivals.
- Outstanding bills.
- Payment reconciliation exceptions.
- Popular menu items.
- Order volume and revenue summaries.
- Nutritional menu coverage, including items with missing information.

Reports must be derived from persisted records rather than temporary WebSocket events.

---

# 10. Security and Anti-Fraud Architecture

## 10.1 Opaque QR Tokens

Every table receives a cryptographically secure random token.

Example URL:

`/t/<opaque-token>`

The token must not contain the table number or sequential database ID.

A 32-character hexadecimal token generated from 16 secure random bytes provides 128 bits of randomness.

The backend should store a cryptographic hash of the token rather than a reusable plaintext token where practical.

Controls include:

- Token validation.
- Token revocation.
- Token rotation.
- Invalid-token rejection.
- Rate-limited access.
- Protection against unauthorized table reassignment.

Opaque tokens reduce URL manipulation but do not independently prove physical presence.

## 10.2 Phone Number and OTP

Customer phone verification uses an OTP.

Security controls include:

- Short OTP expiration, such as five minutes.
- Attempt limits.
- Resend cooldowns.
- Rate limiting by phone number, IP and relevant session identifiers.
- Secure OTP storage.
- Single-use verification.
- Replay and brute-force protection.

A four-digit OTP has limited entropy and requires strict rate limiting. A longer OTP can be considered if it fits the chosen authentication provider and usability requirements.

## 10.3 Customer Session Security

The server establishes a customer session associated with:

- Customer identity.
- Restaurant.
- Table.
- Dining-session identifier.
- Issue and expiry times.
- Session status.

The original two-hour session duration can be a configurable starting policy.

The backend must additionally validate that the session has not been revoked and that the associated dining session remains valid.

Short-lived access tokens with controlled renewal are preferable to relying exclusively on a long-lived JWT.

## 10.4 Physical Verification

The waiter-verification gate ensures that:

- Pending orders cannot enter the kitchen workflow.
- Only authorized waiters can confirm eligible orders.
- Confirmation requires a valid assignment.
- Duplicate requests do not generate duplicate tickets.
- Rejections are recorded.
- Important actions are auditable.

GPS and browser location alone cannot reliably prove that a customer is sitting at a particular table. Restro Manage therefore uses layered security rather than claiming to eliminate every possible fraud attempt.

## 10.5 Nutritional Data Integrity

Nutritional and ingredient information must be treated as restaurant-managed data with a clear source and reporting basis.

Where useful, records can include:

- Data source.
- Last updated timestamp.
- Verification status.
- Serving-size basis.
- Staff member responsible for the update.

The platform must not invent nutrition values or claim that allergen information has been independently certified when it has not.

---

# 11. Database Design and ERD Blueprint

PostgreSQL will be the authoritative source of truth for core business records.

The schema must enforce data integrity through primary keys, foreign keys, unique constraints, appropriate indexes and transactional operations.

## 11.1 Restaurant and Access Domain

Suggested entities:

- `restaurants`
- `users`
- `roles`
- `user_roles`
- `staff_profiles`
- `customer_profiles`
- `customer_sessions`
- `otp_verification_attempts`

Relevant business records should have a clear restaurant ownership boundary to support future expansion.

## 11.2 Floor and Table Domain

- `floors`
- `restaurant_tables`
- `table_qr_tokens`
- `table_service_sessions`

QR token records must support revocation, rotation and history.

## 11.3 Menu and Nutritional Domain

### `menu_categories`

Stores category name, description, ordering and availability.

### `menu_items`

Stores:

- Item name.
- Description.
- Category reference.
- Current selling price.
- Availability status.
- Image reference.
- Serving-size value.
- Serving-size unit.
- Calories in kcal.
- Protein in grams.
- Carbohydrates in grams.
- Total fat in grams.
- Nutritional reporting basis.
- Nutritional verification status.
- Relevant timestamps.

The nutritional reporting basis must distinguish per-serving data from per-100-gram data.

Additional nutrients can be added as optional fields when required.

### `ingredients`

Stores ingredient names and other relevant ingredient metadata.

### `menu_item_ingredients`

Links menu items to their ingredients.

Suggested fields:

- Menu item reference.
- Ingredient reference.
- Quantity, when known.
- Quantity unit.
- Display order.
- Optional preparation or disclosure note.

This is an ingredient-information relationship, not an inventory or recipe-management subsystem.

### `allergens`

Stores supported allergen definitions.

### `menu_item_allergens`

Links menu items to applicable allergen information, with optional notes about known cross-contact risks.

### `dietary_tags`

Stores labels such as vegetarian or vegan.

### `menu_item_dietary_tags`

Links menu items to dietary labels.

### `menu_item_customizations`

Stores supported customization groups where required.

### `customization_options`

Stores available choices and applicable additional prices.

Nutritional adjustments for customizations should only be displayed when they can be calculated from reliable data.

## 11.4 Order and Dispatch Domain

- `orders`
- `order_items`
- `order_item_customizations`
- `waiter_assignments`
- `order_status_history`
- `kitchen_tickets`
- `kitchen_ticket_items`
- `kitchen_status_history`
- `outbox_events`
- `print_jobs`

Order items must preserve purchase-time item names, quantities, prices and relevant customization details.

Historical records must remain accurate when the menu changes.

## 11.5 Reservation Domain

- `reservations`
- `reservation_table_assignments`
- `reservation_status_history`
- `reservation_deposits` or appropriate payment references

The reservation model must support specific-table assignment, temporary holds and overlapping-reservation protection.

## 11.6 Billing and Payment Domain

- `bills`
- `bill_items`
- `payments`
- `payment_provider_events`
- `refunds`, if refunds are supported
- `payment_reconciliation_records`, if required

Each dining session has at most one primary bill.

Multiple payment records can belong to one bill.

Settlement calculations must account for valid payment, refund and reversal history.

## 11.7 Audit and Reliability Domain

- `audit_logs`
- `idempotency_records`
- `notifications`, if required
- `print_jobs`, if not already included in the kitchen domain

Audit records should capture actor, action, target record, timestamp and safe operational metadata.

Secrets and unnecessary sensitive information must not be written to logs.

## 11.8 Required Database Integrity Rules

The final schema must enforce, where applicable:

- Primary and foreign key integrity.
- Unique QR token hashes.
- Valid quantities and monetary values.
- Valid status transitions.
- One active dining session per physical table.
- One primary bill per dining session.
- Unique payment-provider event identifiers.
- Idempotent order submission and payment processing.
- Reservation overlap protection.
- Accurate order and bill history.
- Appropriate indexes for operational queries.

Concurrency-sensitive rules must not rely exclusively on frontend validation.

---

# 12. Backend Architecture and Technology Stack

| Component | Recommended Technology | Purpose |
|---|---|---|
| Customer application | Next.js, React, TypeScript, Tailwind CSS | Mobile-first menu and ordering |
| Staff application | React PWA or responsive web application | Waiter, kitchen and admin interfaces |
| Backend | Node.js with Express | REST APIs and business logic |
| Request validation | Zod | Input and configuration validation |
| ORM | Prisma | Database access and migrations |
| Database | PostgreSQL | Transactional source of truth |
| Real-time communication | Socket.IO | Order broadcasts and live updates |
| Cache | Redis, when required | Temporary state, caching and rate limiting |
| Authentication | Secure session/JWT design | Customer and staff authorization |
| Payment integration | Selected payment provider | Online payment processing |
| Printer integration | ESC/POS local print agent | KOT printing |
| Testing | Vitest or Jest, Supertest and database integration tests | Backend verification |
| API documentation | OpenAPI | API contracts |
| Deployment | Cloud application hosting and managed PostgreSQL | Production hosting |

## 12.1 Modular Monolith

The initial backend will use a modular monolith instead of microservices.

Suggested modules:

- Authentication and Authorization.
- Restaurant Configuration.
- Menu and Nutritional Management.
- Table and Dining Sessions.
- Orders and Dispatch.
- Kitchen and KOT.
- Reservations.
- Billing and Payments.
- Notifications and Real-Time Events.
- Audit and Reporting.

Each module should have clearly defined responsibilities and service boundaries.

## 12.2 REST and WebSocket Responsibilities

REST APIs handle authoritative operations, including:

- Order creation.
- Order claiming and confirmation.
- Reservation creation.
- Table assignment.
- Menu updates.
- Bill generation.
- Payment initiation and verification.

WebSockets deliver real-time notifications and state updates.

WebSocket events must not replace database authorization or transactional validation.

Clients must be able to fetch the latest authoritative state after reconnecting.

## 12.3 Reliable Event Publication

A committed database transaction can succeed even if a notification or printer operation fails.

For critical workflows, use a transactional outbox pattern or an equivalent reliable event-publication mechanism.

1. Update the business record in PostgreSQL.
2. Record the corresponding event in the same transaction.
3. Commit the transaction.
4. Publish the event asynchronously.
5. Retry delivery when necessary.
6. Ensure consumers process events idempotently.

---

# 13. End-to-End Operational Lifecycle

## Stage 1: Customer Arrival

1. Customer sits at a physical table.
2. Customer scans the QR code.
3. Browser opens the opaque-token URL.
4. Backend validates the QR token.
5. Customer verifies their phone number through OTP.
6. Backend establishes the authorized customer session.
7. Customer browses the menu, including nutritional and allergen information.

## Stage 2: Menu Selection and Order Submission

1. Customer selects food items.
2. Customer reviews ingredients, serving sizes, nutrition and allergen disclosures.
3. Customer adds customizations and instructions.
4. Customer selects a payment preference.
5. Backend validates current prices, quantities and availability.
6. Order is persisted in `PENDING_VERIFICATION`.
7. Customer sees the pending-verification state.
8. The order becomes available to eligible waiters.

## Stage 3: Waiter Dispatch

1. Eligible waiters receive a real-time notification.
2. A waiter claims the order.
3. Backend atomically records the assignment.
4. Other waiters see the updated order state.
5. The assigned waiter visits the physical table.

## Stage 4: Verification and Kitchen Release

1. Waiter verifies the customer and table.
2. Waiter reviews the items and instructions.
3. Waiter confirms or rejects the order.
4. Backend validates authorization and current order state.
5. The confirmation and associated event records are committed.
6. KDS receives the confirmed ticket.
7. A print job is queued if thermal printing is enabled.
8. Customer receives the updated order status.

## Stage 5: Kitchen Preparation

1. Kitchen staff view the ticket.
2. Staff update preparation statuses.
3. Individual dishes become ready.
4. The overall order becomes ready when all required items are ready.
5. The assigned waiter receives a notification.

## Stage 6: Serving

1. Waiter collects the prepared food.
2. Waiter delivers it to the table.
3. Waiter records the serving status.
4. Customer sees the updated status.
5. The dining session remains active if further orders or settlement work are pending.

## Stage 7: Billing and Settlement

1. Authorized staff generate or update the primary bill.
2. Eligible order items and applicable charges are included.
3. Customer selects a supported payment method.
4. Payment is initiated or recorded.
5. Backend verifies payment success where applicable.
6. Payment records update the outstanding balance.
7. Bill becomes settled only when its valid outstanding balance is zero.
8. Session closes after its required closure conditions are satisfied.
9. Table becomes available according to its operational and reservation state.

---

# 14. Reservation Lifecycle

1. Customer selects date, time and guest count.
2. Backend checks restaurant hours and booking rules.
3. Reservation engine finds an eligible physical table.
4. Availability is validated under transactional protection.
5. Customer completes OTP verification.
6. Any required deposit is processed.
7. Reservation is confirmed when configured requirements are satisfied.
8. Table remains protected against overlapping reservations.
9. Staff verify the arriving reservation.
10. A corresponding dining session is opened when the guest is seated.
11. Reservation is completed, cancelled or marked as a no-show according to its actual outcome.

A reservation and a dining session are separate records. A future reservation does not mean that a table is currently occupied.

---

# 15. Non-Functional Requirements

## Consistency

- Only one waiter can successfully claim a given order at a time.
- Conflicting confirmed reservations cannot exist for the same table and overlapping interval.
- Each dining session has at most one primary bill.
- Duplicate provider events cannot create duplicate successful settlements.

## Kitchen Safety

- Unverified customer orders cannot enter the kitchen workflow.
- Duplicate confirmation requests do not create duplicate tickets.
- Failed printer jobs do not erase the authoritative KDS ticket.

## Data Quality

- Nutritional values have an explicit reporting basis.
- Unknown nutritional values are not fabricated.
- Ingredients and allergens are structured records.
- Historical order items retain purchase-time details.

## Security

- Backend authorization is mandatory.
- QR tokens can be revoked.
- OTP endpoints are rate-limited.
- Payment results are verified through trusted mechanisms.
- Secrets are excluded from logs.

## Recoverability

- Clients can recover current state after a WebSocket disconnection.
- Failed event publication is retried safely.
- Failed print jobs remain visible.
- Database backups and restoration are tested.
- Payment reconciliation exceptions are monitored.

Performance targets and expected concurrent-user limits must be defined before load testing.

---

# 16. Implementation Roadmap

## Phase 1: Requirements and Database Foundation

- Finalize business rules.
- Finalize the ERD.
- Design PostgreSQL tables and relationships.
- Define keys, constraints and indexes.
- Define order, reservation, payment and session state machines.
- Define API contracts.
- Establish migration and testing strategies.

**Deliverable:** Approved database design and API specification.

## Phase 2: Authentication, Tables and Menu

- Implement staff authentication and roles.
- Implement customer OTP verification.
- Implement opaque QR-token generation and validation.
- Implement tables and dining sessions.
- Implement menu and category management.
- Implement ingredients and allergen relationships.
- Add serving-size and nutritional fields.
- Implement dietary filters and menu availability.
- Validate prices and nutritional reporting bases.

**Deliverable:** Secure menu, nutritional data and table-management APIs.

## Phase 3: Orders and Waiter Dispatch

- Implement QR-based order creation.
- Implement waiter-assisted orders.
- Implement advance food ordering.
- Implement order-state validation.
- Implement atomic waiter claims.
- Implement physical verification.
- Add idempotency and audit logging.
- Integrate real-time order broadcasts.

**Deliverable:** Complete customer-to-waiter order workflow.

## Phase 4: Kitchen and KOT

- Implement kitchen tickets.
- Add item-level preparation states.
- Build KDS APIs.
- Implement reliable event publication.
- Add persistent print jobs.
- Integrate the optional local print agent.
- Test retries, duplicate events and printer failures.

**Deliverable:** Reliable order-to-kitchen workflow.

## Phase 5: Reservations

- Implement reservation creation and OTP verification.
- Implement capacity and time-slot rules.
- Add specific-table assignment.
- Prevent overlapping reservations.
- Add temporary holds and expiration.
- Implement deposits and no-show policies.

**Deliverable:** Reservation engine protected against concurrent booking conflicts.

## Phase 6: Billing and Payments

- Implement one primary bill per dining session.
- Aggregate eligible order items into the bill.
- Implement multiple payment records.
- Integrate the selected payment provider.
- Implement webhook verification and idempotency.
- Add payment reconciliation.
- Test partial payments, failures, retries and refunds if supported.

**Deliverable:** Reliable billing and settlement workflows.

## Phase 7: Administration and Analytics

- Implement staff and role management.
- Build menu and table administration.
- Add floor and reservation views.
- Add kitchen and order monitoring.
- Add nutritional data completeness reporting.
- Build basic revenue and operational analytics.
- Add audit-log inspection.

**Deliverable:** Functional restaurant administration backend.

## Phase 8: Testing and Deployment

- Run unit and integration tests.
- Test database concurrency.
- Test authorization boundaries.
- Test duplicate order submissions and payment events.
- Simulate WebSocket disconnections.
- Test reservation conflicts.
- Test printer failures.
- Configure production secrets and database backups.
- Deploy and validate the end-to-end workflow.

**Deliverable:** Tested MVP ready for controlled restaurant trials.

---

# 17. Mandatory Testing Scenarios

1. Two waiters claim the same order simultaneously: only one succeeds.
2. An unverified order cannot appear as a confirmed kitchen ticket.
3. Repeated confirmation requests do not create duplicate tickets.
4. An altered table URL cannot bypass backend authorization.
5. A revoked QR token cannot initiate a new authorized session.
6. An expired OTP cannot authenticate a customer.
7. Concurrent reservation attempts cannot create overlapping confirmed assignments.
8. An occupied table cannot be assigned to an arriving reservation without operational resolution.
9. A menu price changes after cart creation: the backend revalidates the price.
10. Historical orders remain unchanged after a menu update.
11. Nutritional values are displayed with the correct serving-size basis.
12. Missing nutritional data is not presented as verified information.
13. Allergen filters do not treat unknown allergen information as proof of safety.
14. A waiter disconnect does not create a duplicate assignment or confirmation.
15. A printer failure does not remove the KDS ticket.
16. Duplicate payment-provider events are processed idempotently.
17. Partial payments do not incorrectly settle a bill.
18. Concurrent payment attempts cannot silently over-settle a bill.
19. Multiple orders in one dining session still share one primary bill.
20. A paid order can remain unserved without incorrectly changing its fulfillment status.
21. An order submitted during session closure is handled according to explicit state rules.
22. Unauthorized staff cannot perform restricted administrative or financial operations.
23. A missed WebSocket event can be recovered by fetching authoritative server state.
24. Menu ingredient and allergen updates are reflected correctly in subsequent menu views.
25. Reservation deposits remain distinct from the final dining bill unless explicitly applied under the configured policy.

---

# 18. Final Product Definition

Restro Manage is a restaurant operations platform built around six primary capabilities:

1. **Secure QR Ordering:** Controlled table access and physical waiter verification.
2. **Nutritional Transparency:** Structured ingredients, serving sizes, calories, protein, carbohydrates, fat, allergens and dietary labels for every configured menu item.
3. **Real-Time Operations:** Atomic waiter dispatch, kitchen coordination and live order updates.
4. **Reservation Integrity:** Specific-table booking and protection against overlapping reservations.
5. **Unified Billing:** One primary bill per dining session with multiple payment records.
6. **Reliable Backend:** Transactional database rules, idempotent operations, auditability and recoverable event delivery.

The first release targets one full-service restaurant. Its backend will use a modular architecture and a relational database with clearly enforced business rules.

The project should prioritize database correctness, reliable state transitions and payment integrity before adding interface complexity or unnecessary modules.

**Final Development Principle:** Finalize the business rules, ERD and API contracts first. Implement the backend in testable modules, validate the critical concurrency and security cases, and then build the customer, waiter, kitchen and admin interfaces around those stable contracts.

Restro Manage should be a working restaurant operations system whose reliability can be demonstrated—not merely a collection of features that looks impressive on paper.