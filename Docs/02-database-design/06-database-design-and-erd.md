# Restaurant OS — Database Design & ERD Specification

**Document ID:** ROS-DB-006  
**Version:** 1.0  
**Status:** Draft — Pending Review  
**Parent Documents:**
- 01-product-discovery.md
- 02-product-requirements.md
- 03-user-journeys-and-workflows.md
- 04-ux-information-architecture.md
- 05-system-architecture.md

---

## 1. Purpose

This document defines the proposed relational database model for Restaurant OS.

It identifies the core entities, their responsibilities, relationships, important fields, integrity constraints, indexes, historical snapshots, and concurrency requirements.

The database design must support:

- Menu management.
- Advance pre-orders.
- QR-based ordering.
- Waiter-assisted ordering.
- Table service sessions.
- Kitchen operations.
- Reservations and deposits.
- Billing and payments.
- Recipe-based inventory.
- Staff permissions and audit history.
- Future multi-restaurant SaaS expansion.

The initial implementation will use PostgreSQL with Prisma as the ORM. Database migrations will be version-controlled.

This document is a design specification, not an executable database migration.

## 2. Database Design Principles

### DB-001 — Referential Integrity

Related records must use foreign keys and appropriate constraints.

### DB-002 — Historical Accuracy

Changes to menu items, recipes, and prices must not silently rewrite historical orders, bills, payments, or stock movements.

### DB-003 — Transactional Consistency

Related business records must be committed atomically where required.

### DB-004 — Explicit Ownership

Operational records must be associated with their owning restaurant.

### DB-005 — Monetary Precision

Financial values must use exact decimal or integer minor-unit representations, not floating-point arithmetic.

The final representation must be consistent throughout the system.

### DB-006 — Traceable Inventory

Inventory changes must be represented through auditable stock movements rather than unexplained balance edits.

### DB-007 — Safe Retries

Operations that may be retried must have a documented deduplication or idempotency strategy.

### DB-008 — Controlled State Changes

Order, reservation, bill, payment, and kitchen states must follow defined transition rules.

### DB-009 — Appropriate Normalization

Operational entities should be normalized to reduce unnecessary duplication. Historical snapshots and derived values may be stored deliberately where they protect correctness or performance.

### DB-010 — Time Consistency

Persist timestamps consistently, preferably in UTC using PostgreSQL `timestamptz`, and display them in the restaurant's configured time zone.

Business dates, reservation times, and recurring opening hours must have clearly defined time-zone semantics.

---

## 3. Database Conventions

### 3.1 Primary Keys

Use UUID primary keys for core business entities.

Public references such as order numbers and reservation codes must be separate from internal primary keys.

### 3.2 Naming

Use consistent snake_case naming in PostgreSQL.

Prisma model names may use PascalCase while mapping to the agreed database table names.

### 3.3 Standard Fields

Where appropriate, operational entities should include:

- `id`
- `created_at`
- `updated_at`

Entities that require deactivation may additionally include:

- `is_active`

Historical and financial entities must not be physically deleted merely to hide them from ordinary screens.

### 3.4 Deletion Policy

- Menu categories and menu items should normally be deactivated rather than deleted if referenced by historical orders.
- Completed orders, bills, payments, refunds, and stock movements must remain traceable.
- Staff accounts may be disabled.
- Dependent records must not be cascaded away accidentally.
- Deletion and retention rules must account for applicable legal requirements.

### 3.5 Tenant Preparation

The initial deployment supports one restaurant, but restaurant-owned operational tables should include a `restaurant_id` where appropriate.

This does not make the first release a complete multi-tenant SaaS product. It establishes an explicit ownership boundary for future expansion.

---

## 4. Entity Overview

The proposed database is divided into logical groups.

### 4.1 Identity and Restaurant Configuration

- `restaurants`
- `staff_users`
- `roles`
- `permissions`
- `staff_user_roles`
- `role_permissions`
- `restaurant_settings`

### 4.2 Menu and Catalog

- `menu_categories`
- `menu_items`
- `menu_item_modifiers`
- `modifier_options`
- `menu_item_availability`

### 4.3 Tables and Ordering

- `restaurant_tables`
- `table_service_sessions`
- `orders`
- `order_items`
- `order_item_modifiers`
- `order_status_history`
- `idempotency_records`

### 4.4 Kitchen

- `kitchen_stations`
- `kitchen_tickets`
- `kitchen_ticket_items`
- `kitchen_status_history`

### 4.5 Reservations

- `reservations`
- `reservation_holds`
- `reservation_table_assignments`
- `reservation_status_history`
- `otp_verification_attempts`

### 4.6 Billing and Payments

- `bills`
- `bill_items`
- `bill_adjustments`
- `payments`
- `payment_events`
- `refunds`

### 4.7 Inventory

- `ingredients`
- `measurement_units`
- `recipes`
- `recipe_versions`
- `recipe_ingredients`
- `stock_movements`
- `inventory_deduplication_records`

### 4.8 Audit and Operational Events

- `audit_logs`
- `outbox_events` (if the transactional outbox approach is adopted)

The final schema may consolidate or split some entities after detailed workflow and concurrency review.

---

## 5. Restaurant and Identity Tables

### 5.1 `restaurants`

**Purpose:** Stores the identity and operating configuration of each restaurant.

Proposed fields:

- `id` — UUID primary key.
- `name` — Restaurant name.
- `slug` — Unique public identifier.
- `address` — Configured address.
- `phone` — Contact number.
- `currency_code` — Configured currency.
- `timezone` — IANA time-zone identifier.
- `is_active` — Whether the restaurant is active.
- `created_at`
- `updated_at`

Constraints:

- `slug` must be unique.
- `currency_code` must be valid.
- `timezone` must reference a valid configured time zone.

### 5.2 `staff_users`

**Purpose:** Stores staff identity and authentication information.

Proposed fields:

- `id`
- `restaurant_id`
- `full_name`
- `email` or `phone`
- `password_hash` where password authentication is used.
- `is_active`
- `last_login_at`
- `created_at`
- `updated_at`

Constraints:

- Account identifiers must follow the chosen uniqueness policy.
- Disabled accounts must not initiate new protected operations.
- Authentication secrets must never be stored in plaintext.

The exact uniqueness policy must be defined before supporting multiple restaurants or shared staff accounts.

### 5.3 `roles`

**Purpose:** Defines roles such as administrator, waiter, kitchen staff, and cashier.

Proposed fields:

- `id`
- `restaurant_id` where roles are restaurant-specific.
- `name`
- `description`
- `created_at`

### 5.4 `permissions`

**Purpose:** Defines granular permissions such as order cancellation, refund initiation, menu management, and stock adjustment.

Proposed fields:

- `id`
- `key`
- `description`

### 5.5 `staff_user_roles`

Associates staff users with their assigned roles.

Proposed fields:

- `staff_user_id`
- `role_id`
- `assigned_at`

Constraint:

- The staff-user and role pair must be unique.

### 5.6 `role_permissions`

Associates roles with permitted operations.

Proposed fields:

- `role_id`
- `permission_id`

Constraint:

- The role-permission pair must be unique.

---

## 6. Menu and Catalog Tables

### 6.1 `menu_categories`

Proposed fields:

- `id`
- `restaurant_id`
- `name`
- `description`
- `display_order`
- `is_active`
- `created_at`
- `updated_at`

Relationships:

- One restaurant has many menu categories.
- A category may contain many menu items.

### 6.2 `menu_items`

Proposed fields:

- `id`
- `restaurant_id`
- `category_id`
- `name`
- `description`
- `base_price`
- `is_published`
- `is_active`
- `created_at`
- `updated_at`

Constraints:

- Price must be non-negative.
- Category ownership must match restaurant ownership.
- Inactive or unpublished items must not be accepted for new orders.

### 6.3 `menu_item_modifiers`

Defines modifier groups, such as size, spice level, or add-ons.

Proposed fields:

- `id`
- `restaurant_id`
- `menu_item_id`
- `name`
- `selection_type`
- `minimum_selections`
- `maximum_selections`
- `is_required`

### 6.4 `modifier_options`

Defines options within a modifier group.

Proposed fields:

- `id`
- `modifier_group_id`
- `name`
- `price_adjustment`
- `is_active`

The price adjustment must use the same exact monetary representation as the menu price.

### 6.5 `menu_item_availability`

Purpose: Represents availability rules that cannot be expressed adequately through a single active flag.

Potential fields:

- `id`
- `menu_item_id`
- `service_type`
- `start_time`
- `end_time`
- `available_from`
- `available_until`
- `is_available`

The final design must define how scheduled availability interacts with temporary stockouts and manual administrator overrides.

---

## 7. Table and Service Session Tables

### 7.1 `restaurant_tables`

Proposed fields:

- `id`
- `restaurant_id`
- `table_code`
- `display_name`
- `capacity`
- `qr_token_hash` or equivalent secure QR-context representation.
- `is_active`
- `created_at`
- `updated_at`

Constraints:

- Table codes must be unique within a restaurant.
- Capacity must be a positive integer.
- Inactive tables cannot receive new orders.
- QR access must not grant staff privileges.

### 7.2 `table_service_sessions`

**Purpose:** Represents a continuous dining visit or table-service period.

Proposed fields:

- `id`
- `restaurant_id`
- `session_reference`
- `status`
- `opened_at`
- `closed_at`
- `opened_by_staff_user_id`
- `closed_by_staff_user_id`
- `created_at`
- `updated_at`

A session may link multiple orders and, subject to the approved billing model, one or more bills.

The exact relationship between a session and table assignment must be finalized before migration design.

A table should not have multiple conflicting active service sessions unless an explicitly approved workflow supports that behaviour.

### 7.3 Table Session Assignment

The design must preserve the history of which table was associated with a service session.

A separate assignment table may be used if table transfers or joined-table service are included in the MVP.

This decision must not be left to ad hoc application logic.

---

## 8. Orders and Order Items

### 8.1 `orders`

**Purpose:** Stores the main order record.

Proposed fields:

- `id`
- `restaurant_id`
- `order_reference`
- `order_type`
- `source`
- `table_service_session_id`, nullable where applicable.
- `restaurant_table_id`, nullable where applicable.
- `customer_reference` or approved customer-access reference.
- `status`
- `requested_service_at`, nullable.
- `subtotal`
- `discount_total`
- `tax_total`
- `charge_total`
- `grand_total`
- `currency_code`
- `accepted_at`
- `cancelled_at`
- `created_at`
- `updated_at`

Suggested order types:

- `DINE_IN`
- `PRE_ORDER`
- `TAKEAWAY` if included in the approved scope.

Suggested sources:

- `QR`
- `WAITER`
- `CUSTOMER_WEB`
- `ADMINISTRATIVE`

Suggested order states are defined in the workflow specification and must be finalized before implementation.

Constraints:

- Order reference must be unique within its agreed scope.
- Monetary values must use exact representations.
- Historical totals must be preserved.
- Orders must not rely on current menu values to reconstruct historical prices.

### 8.2 `order_items`

Proposed fields:

- `id`
- `order_id`
- `menu_item_id`, nullable where historical preservation requires it.
- `item_name_snapshot`
- `unit_price_snapshot`
- `quantity`
- `modifier_total_snapshot`
- `line_subtotal`
- `discount_amount`
- `tax_amount`
- `line_total`
- `special_instructions`
- `status`
- `created_at`
- `updated_at`

Constraints:

- Quantity must be positive.
- Snapshot prices and totals must be internally consistent.
- Historical item descriptions must remain available if the source menu item is deactivated.

### 8.3 `order_item_modifiers`

Purpose: Stores the selected modifiers and their historical prices.

Proposed fields:

- `id`
- `order_item_id`
- `modifier_name_snapshot`
- `option_name_snapshot`
- `price_adjustment_snapshot`
- `quantity`, where the modifier model permits repeated selections.

### 8.4 `order_status_history`

Purpose: Records valid order-state transitions.

Proposed fields:

- `id`
- `order_id`
- `previous_status`
- `new_status`
- `actor_type`
- `actor_id`, nullable for system actions.
- `reason`
- `created_at`

State history must be append-only through ordinary application workflows.

### 8.5 `idempotency_records`

Purpose: Prevents duplicate logical operations during request retries.

Proposed fields:

- `id`
- `restaurant_id`
- `operation_scope`
- `idempotency_key`
- `request_fingerprint`
- `result_reference`
- `response_status`
- `created_at`
- `expires_at`

Constraints:

- The idempotency key must be unique within its defined operation scope.
- A repeated key with a conflicting request fingerprint must be rejected.
- Retention must exceed the supported retry window.

The exact response-storage and expiration policy must be finalized during API design.

---

## 9. Kitchen Tables

### 9.1 `kitchen_stations`

Purpose: Defines preparation stations if station routing is enabled.

Proposed fields:

- `id`
- `restaurant_id`
- `name`
- `is_active`

### 9.2 `kitchen_tickets`

Proposed fields:

- `id`
- `restaurant_id`
- `order_id`
- `station_id`, nullable where routing is not used.
- `status`
- `queued_at`
- `accepted_at`
- `started_at`
- `ready_at`
- `cancelled_at`
- `created_at`
- `updated_at`

A single customer order may generate multiple kitchen tickets when separate preparation stations are enabled.

### 9.3 `kitchen_ticket_items`

Proposed fields:

- `id`
- `kitchen_ticket_id`
- `order_item_id`
- `quantity`
- `status`
- `created_at`
- `updated_at`

The design must define whether an order item can be split across stations and how partial readiness is represented.

### 9.4 `kitchen_status_history`

Purpose: Stores ticket and item state transitions.

Proposed fields:

- `id`
- `kitchen_ticket_id`
- `kitchen_ticket_item_id`, nullable for ticket-level transitions.
- `previous_status`
- `new_status`
- `actor_id`
- `created_at`

---

## 10. Reservation Tables

### 10.1 `reservations`

Proposed fields:

- `id`
- `restaurant_id`
- `reservation_reference`
- `customer_name`
- `customer_phone`
- `party_size`
- `start_at`
- `end_at`
- `status`
- `verification_status`
- `deposit_required`
- `deposit_amount`
- `confirmed_at`
- `checked_in_at`
- `cancelled_at`
- `no_show_at`
- `created_at`
- `updated_at`

Constraints:

- Party size must be positive.
- End time must be later than start time.
- Reservation status must follow approved transitions.
- Required verification must be completed before confirmation.
- Deposit conditions must be satisfied where required.

### 10.2 `reservation_holds`

Purpose: Represents temporary capacity holds.

Proposed fields:

- `id`
- `restaurant_id`
- `reservation_id`, nullable during an initial hold.
- `start_at`
- `end_at`
- `party_size`
- `status`
- `expires_at`
- `created_at`
- `updated_at`

The final design must establish whether holds reserve specific tables or aggregate capacity and how expired holds are released safely.

### 10.3 `reservation_table_assignments`

Proposed fields:

- `id`
- `reservation_id`
- `restaurant_table_id`
- `assigned_from`
- `assigned_until`
- `created_at`

The table-assignment model must prevent conflicting confirmed bookings.

If table combinations are supported, the model must handle one reservation assigned to multiple tables.

### 10.4 `reservation_status_history`

Proposed fields:

- `id`
- `reservation_id`
- `previous_status`
- `new_status`
- `actor_type`
- `actor_id`
- `reason`
- `created_at`

### 10.5 `otp_verification_attempts`

Proposed fields:

- `id`
- `purpose`
- `contact_reference`
- `provider_reference`
- `status`
- `attempt_count`
- `expires_at`
- `verified_at`
- `created_at`

OTP values and secrets must not be stored in plaintext in ordinary application records or logs.

The implementation must define rate limits, expiration, resend behaviour, and provider-side verification.

---

## 11. Billing Tables

### 11.1 `bills`

Proposed fields:

- `id`
- `restaurant_id`
- `bill_reference`
- `table_service_session_id`, nullable where applicable.
- `status`
- `currency_code`
- `subtotal`
- `discount_total`
- `tax_total`
- `charge_total`
- `grand_total`
- `amount_paid`
- `amount_refunded`
- `issued_at`
- `settled_at`
- `voided_at`
- `created_at`
- `updated_at`

The system must define whether totals and balances are stored snapshots, derived values, or both.

Any stored financial summary must be reconciled against its source records.

### 11.2 `bill_items`

Purpose: Preserves the items charged on a bill.

Proposed fields:

- `id`
- `bill_id`
- `order_item_id`, nullable when required by an approved adjustment workflow.
- `item_name_snapshot`
- `quantity`
- `unit_price_snapshot`
- `discount_amount`
- `tax_amount`
- `line_total`
- `created_at`

The final design must define how one order item is handled when multiple bills are supported.

### 11.3 `bill_adjustments`

Purpose: Records permitted discounts, charges, corrections, and other bill adjustments.

Proposed fields:

- `id`
- `bill_id`
- `adjustment_type`
- `description`
- `amount`
- `reason`
- `created_by`
- `created_at`

Adjustments must be permission-controlled and traceable.

---

## 12. Payment Tables

### 12.1 `payments`

Purpose: Stores payment attempts and their financial status.

Proposed fields:

- `id`
- `restaurant_id`
- `bill_id`
- `payment_reference`
- `provider_name`, nullable for cash.
- `provider_payment_reference`, nullable.
- `method`
- `status`
- `amount`
- `currency_code`
- `initiated_at`
- `confirmed_at`
- `failed_at`
- `created_at`
- `updated_at`

Constraints:

- Payment amount must be positive unless a separately defined accounting model requires otherwise.
- Provider references must follow the provider's documented uniqueness rules.
- Payment success must be based on verified evidence.
- Duplicate provider events must not duplicate the payment amount.

### 12.2 `payment_events`

Purpose: Stores relevant payment-provider event processing records.

Proposed fields:

- `id`
- `payment_id`
- `provider_event_id`
- `event_type`
- `verification_status`
- `processing_status`
- `received_at`
- `processed_at`

Constraint:

- Provider event identity must be unique within the provider's documented event scope.

Raw webhook payloads, if retained, must be minimized, access-controlled, and scrubbed of unnecessary sensitive data.

### 12.3 `refunds`

Proposed fields:

- `id`
- `payment_id`
- `refund_reference`
- `provider_refund_reference`, nullable.
- `amount`
- `status`
- `reason`
- `initiated_by`
- `initiated_at`
- `completed_at`
- `created_at`
- `updated_at`

Constraints:

- Refund amounts must not exceed the permitted refundable balance.
- Refund attempts and their final outcomes must remain traceable.
- Duplicate refund requests must not produce duplicate financial effects.

---

## 13. Inventory Tables

### 13.1 `measurement_units`

Purpose: Defines supported measurement units.

Proposed fields:

- `id`
- `name`
- `symbol`
- `dimension`
- `is_active`

The design must define allowed unit conversions. Mass, volume, and count units must not be mixed without a valid conversion rule.

### 13.2 `ingredients`

Proposed fields:

- `id`
- `restaurant_id`
- `name`
- `measurement_unit_id`
- `low_stock_threshold`, nullable.
- `is_active`
- `created_at`
- `updated_at`

### 13.3 `recipes`

Purpose: Associates a menu item with its recipe history.

Proposed fields:

- `id`
- `restaurant_id`
- `menu_item_id`
- `created_at`
- `updated_at`

### 13.4 `recipe_versions`

Purpose: Preserves the recipe that applies to a particular operational period.

Proposed fields:

- `id`
- `recipe_id`
- `version_number`
- `effective_from`
- `effective_until`, nullable.
- `created_at`

### 13.5 `recipe_ingredients`

Proposed fields:

- `id`
- `recipe_version_id`
- `ingredient_id`
- `quantity_required`
- `measurement_unit_id`
- `created_at`

Constraints:

- Quantities must be positive.
- Ingredient and recipe ownership must match.
- Unit conversions must be valid.
- Historical order consumption must reference the applicable recipe version or equivalent immutable snapshot.

### 13.6 `stock_movements`

Purpose: Records all inventory changes.

Proposed fields:

- `id`
- `restaurant_id`
- `ingredient_id`
- `movement_type`
- `quantity_delta`
- `measurement_unit_id`
- `source_type`
- `source_id`
- `idempotency_reference`
- `reason`
- `actor_id`
- `created_at`

Movement types may include:

- Opening balance.
- Stock receipt.
- Order consumption.
- Cancellation reversal.
- Waste.
- Manual adjustment.
- Physical count correction.

The exact sign convention must be standardized. For example, stock additions may be positive and consumption negative.

Stock movements must remain traceable. Corrections should create additional movements rather than erase the original event.

### 13.7 `inventory_deduplication_records`

Purpose: Prevents a repeated logical event from generating duplicate stock movements.

Proposed fields:

- `id`
- `restaurant_id`
- `source_type`
- `source_id`
- `movement_scope`
- `created_at`

Constraint:

- The deduplication key must be unique within the intended scope.

---

## 14. Audit and Event Tables

### 14.1 `audit_logs`

Proposed fields:

- `id`
- `restaurant_id`
- `actor_type`
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `reason`
- `request_reference`
- `metadata`
- `created_at`

Rules:

- Ordinary application users must not modify or delete protected audit records.
- Metadata must not contain passwords, OTP secrets, or unnecessary sensitive payment data.
- Access must be restricted.

### 14.2 `outbox_events` — Conditional

If a transactional outbox is adopted, the proposed fields are:

- `id`
- `restaurant_id`
- `event_type`
- `aggregate_type`
- `aggregate_id`
- `payload`
- `created_at`
- `published_at`
- `attempt_count`
- `last_error`

The event record must be committed in the same transaction as the business change it represents.

The delivery mechanism must tolerate duplicate publication.

---

## 15. Entity Relationships

The principal relationships are:

- One restaurant has many staff users, tables, categories, menu items, orders, reservations, bills, and ingredients.
- One restaurant has many roles and restaurant-scoped operational configurations.
- One menu category has many menu items.
- One menu item may have many modifier groups.
- One modifier group has many modifier options.
- One table may participate in multiple historical service sessions.
- One service session may contain multiple orders.
- One order has many order items.
- One order item may have multiple selected modifiers.
- One order may generate multiple kitchen tickets.
- One kitchen ticket has many ticket items.
- One reservation may have multiple historical table assignments.
- One bill has many bill items.
- One bill may have multiple payment attempts or successful payment records.
- One payment may have multiple provider events and refund records.
- One menu item may have multiple recipe versions.
- One recipe version has many ingredient requirements.
- One ingredient has many stock movements.
- One operational entity may have many audit records.

These relationships are conceptual until the final ERD is approved.

---

## 16. Critical Database Constraints

The following constraints must be explicitly designed and tested.

### DB-C01 — Unique References

Order, bill, reservation, and payment references must be unique within their intended scope.

### DB-C02 — Restaurant Ownership

Cross-restaurant relationships must not be possible accidentally.

The final design must use application checks and appropriate database constraints to preserve ownership consistency.

### DB-C03 — Positive Quantities

Order quantities, reservation party sizes, and recipe quantities must follow their defined positive-value rules.

### DB-C04 — Exact Monetary Values

Monetary calculations must use exact representations and documented rounding rules.

### DB-C05 — Idempotency

Repeated logical operations must not duplicate orders, payment effects, or inventory movements.

### DB-C06 — Reservation Conflicts

The database design must prevent overlapping confirmed assignments for the same table.

The exact constraint strategy depends on whether reservations use specific table assignments, combined tables, or capacity-based allocation.

### DB-C07 — Active Sessions

The design must prevent conflicting active service sessions for the same table unless an approved joined-table workflow explicitly supports them.

### DB-C08 — Financial History

Settled bills and completed payments must not be silently overwritten or deleted.

Corrections must follow traceable adjustment or refund workflows.

### DB-C09 — Inventory History

Stock changes must be traceable to their source event or authorized adjustment.

### DB-C10 — State Transitions

The database and application must jointly enforce permitted state changes and protect against stale concurrent updates.

---

## 17. Indexing Strategy

Final indexes will be selected after query and workload design.

Candidate indexes include:

### Identity
- Staff account lookup by normalized login identifier.
- Restaurant and account status lookup.

### Menu
- Menu items by restaurant, publication status, and category.
- Modifier groups by menu item.

### Orders
- Orders by restaurant and creation time.
- Orders by status and creation time.
- Orders by table service session.
- Order items by order.
- Unique order reference.

### Kitchen
- Active tickets by restaurant, station, status, and creation time.
- Ticket items by ticket.

### Reservations
- Reservations by restaurant and start time.
- Reservations by status and start time.
- Reservation assignments by table and time interval.
- Unique reservation reference.

### Billing and payments
- Bills by restaurant, status, and creation time.
- Payments by bill.
- Payments by provider reference where applicable.
- Provider events by unique event identity.
- Refunds by payment.

### Inventory
- Stock movements by ingredient and creation time.
- Stock movements by source event.
- Recipes by menu item and effective version.

Indexes must improve real query patterns without creating unnecessary write overhead.

---

## 18. Data Integrity and Concurrency Strategy

### 18.1 Order Creation

Creating an order and its required order items must be atomic.

Idempotency handling must account for concurrent requests using the same key.

### 18.2 Reservations

A preliminary availability query is not enough to guarantee a booking.

Confirmation must be protected by a database-backed concurrency strategy that matches the reservation allocation model.

### 18.3 Payments

Verified provider events must be processed idempotently.

Bill balances must remain correct when multiple payment attempts or notifications arrive concurrently.

### 18.4 Inventory

Stock movement creation and deduplication must be coordinated transactionally.

Concurrent consumption of the same ingredient must not silently lose updates.

### 18.5 Historical Snapshots

Order items and bill items must preserve the financial values applicable at the time of their respective transactions.

Recipe changes must not silently rewrite historical stock consumption.

---

## 19. Data Retention and Privacy

The database design must support:

- Controlled access to customer contact details.
- Restricted staff access to sensitive records.
- Retention rules for audit and financial records.
- Safe handling of OTP-related records.
- Removal or anonymization of personal information when legally appropriate.
- Backup and recovery procedures.
- Data export or deletion workflows where applicable law requires them.

The final retention schedule must be established after the applicable legal and operational requirements are verified.

---

## 20. Seed Data Requirements

Development and automated testing must use clearly identified synthetic data.

The seed dataset should include:

- One demo restaurant.
- Multiple menu categories.
- Available and unavailable menu items.
- Modifier groups and options.
- Several tables with different capacities.
- Staff accounts for each role.
- Example orders in different states.
- Kitchen tickets with different preparation states.
- Confirmed, pending, and cancelled reservations.
- Bills with outstanding and settled balances.
- Successful, failed, and pending payment examples.
- Ingredients, recipes, and stock movements.
- Audit records for representative actions.

Seed data must not contain real customer information or production secrets.

---

## 21. Database Acceptance Criteria

The database design is ready for approval when:

1. All core entities and relationships are represented.
2. Order and bill history remain accurate after menu changes.
3. Reservation conflicts are prevented through a defined database-backed strategy.
4. Idempotency constraints cover order creation and financial or inventory side effects.
5. Payment events and refunds remain traceable.
6. Inventory changes are represented as stock movements.
7. Ownership boundaries are defined for restaurant-scoped data.
8. Required indexes correspond to known query patterns.
9. Monetary and time-zone conventions are documented.
10. Deletion, retention, and audit requirements are defined.
11. Open decisions are resolved or explicitly assigned before migration design.

---

## 22. Open Decisions

The following must be resolved before finalizing the physical schema:

1. Whether customer identity is account-based, guest-based, or a combination.
2. Whether multiple independent bills per table session are supported in the MVP.
3. Whether a bill may contain items from multiple orders.
4. Whether reservations use specific tables or capacity-based allocation.
5. Whether combined-table reservations are included in the MVP.
6. Whether payment-provider event payloads are retained and for how long.
7. Whether recipe versions use explicit effective dates or immutable version references.
8. Whether stock balances are derived from movements or maintained as transactionally updated projections.
9. Whether the transactional outbox is required for the first release.
10. Which reservation and session constraints should be implemented through PostgreSQL exclusion constraints, unique indexes, or transactional locking.
11. Which records must be retained or anonymized to meet applicable obligations.

---

**End of Document 06 — Database Design & ERD Specification**