# Restaurant OS — Database Design & ERD Specification

**Document ID:** ROS-DB-006
**Version:** 1.0
**Status:** Draft
**Parent Documents:** readme.md, 02-product-requirements.md, 03-user-journeys-and-workflows.md

---

## 1. Purpose

This document defines the database structure for Restaurant OS — what tables exist, what they store, their relationships, constraints, and how they handle critical scenarios like concurrency and data integrity.

**Technology:** PostgreSQL with Prisma ORM. All schema changes will be version-controlled migrations.

> This is a **design specification**, not an executable migration file.

---

## 2. Database Design Principles

| Principle | What it means |
|---|---|
| DB-001 Referential Integrity | Related records use foreign keys and appropriate constraints |
| DB-002 Historical Accuracy | Menu changes, recipe changes, and price changes do NOT silently rewrite historical orders, bills, or stock movements |
| DB-003 Transactional Consistency | Related business records are committed atomically (all succeed or all fail) |
| DB-004 Explicit Ownership | All operational records must be linked to their owning restaurant |
| DB-005 Monetary Precision | Money is stored as exact decimal or integer minor-unit values — never floating-point |
| DB-006 Traceable Inventory | Inventory changes are recorded as stock movements, not silent balance edits |
| DB-007 Safe Retries | Retry-able operations have a defined deduplication or idempotency strategy |
| DB-008 Controlled State Changes | Order, reservation, bill, payment, and kitchen states follow defined transition rules |
| DB-009 Appropriate Normalization | Entities are normalized. Historical snapshots and derived values stored deliberately where needed for correctness or performance |
| DB-010 Time Consistency | All timestamps stored in UTC (PostgreSQL `timestamptz`). Business dates displayed in the restaurant's configured timezone |

---

## 3. Database Conventions

### Primary Keys
- Use UUID primary keys for all core business entities
- Public-facing references (order numbers, reservation codes) are separate from internal UUIDs

### Naming
- PostgreSQL tables and columns: `snake_case`
- Prisma model names: `PascalCase` mapped to snake_case table names

### Standard Fields
All operational entities include:
- `id` (UUID)
- `created_at`
- `updated_at`

Entities that can be disabled also include:
- `is_active`

### Deletion Policy
- Menu categories and items should be **deactivated**, not deleted, if referenced by historical orders
- Completed orders, bills, payments, refunds, and stock movements must **remain traceable**
- Staff accounts may be disabled
- Dependent records must not be accidentally cascade-deleted
- Retention rules must account for applicable legal requirements

### Multi-Restaurant Preparation
Even though the first release supports one restaurant, restaurant-owned tables include `restaurant_id`. This does NOT make the first release a full multi-tenant SaaS — it just establishes an explicit ownership boundary for future expansion.

---

## 4. Entity Overview

### 4.1 Identity & Restaurant Configuration
| Table | Purpose |
|---|---|
| `restaurants` | Restaurant identity and operating configuration |
| `staff_users` | Staff accounts and authentication |
| `roles` | Role definitions (admin, waiter, kitchen, cashier) |
| `permissions` | Granular permission keys |
| `staff_user_roles` | Maps staff users to their roles |
| `role_permissions` | Maps roles to their permitted operations |
| `restaurant_settings` | Restaurant-level configuration and policies |

### 4.2 Menu & Catalog
| Table | Purpose |
|---|---|
| `menu_categories` | Menu categories (e.g., Starters, Mains, Desserts) |
| `menu_items` | Individual menu items with name, price, availability |
| `menu_item_modifiers` | Modifier groups (e.g., Size, Spice Level) |
| `modifier_options` | Options within a modifier group |
| `menu_item_availability` | Availability rules beyond a simple active flag |

### 4.3 Tables & Ordering
| Table | Purpose |
|---|---|
| `restaurant_tables` | Physical tables, QR tokens |
| `table_service_sessions` | A continuous dining visit for a table |
| `orders` | The main order record |
| `order_items` | Items within an order (with historical price snapshots) |
| `order_item_modifiers` | Selected modifiers for order items (with historical snapshots) |
| `order_status_history` | Append-only log of order state transitions |
| `idempotency_records` | Prevents duplicate operations on retry |

### 4.4 Kitchen
| Table | Purpose |
|---|---|
| `kitchen_stations` | Preparation stations (if station routing is used) |
| `kitchen_tickets` | Kitchen work items generated from orders |
| `kitchen_ticket_items` | Item-level detail within a kitchen ticket |
| `kitchen_status_history` | Ticket and item state transitions |

### 4.5 Reservations
| Table | Purpose |
|---|---|
| `reservations` | Reservation records |
| `reservation_holds` | Temporary capacity holds |
| `reservation_table_assignments` | Which table(s) are assigned to a reservation |
| `reservation_status_history` | Reservation state transitions |
| `otp_verification_attempts` | OTP sending and verification tracking |

### 4.6 Billing & Payments
| Table | Purpose |
|---|---|
| `bills` | Bill records generated from eligible orders |
| `bill_items` | Items charged on a bill (historical snapshots) |
| `bill_adjustments` | Permitted discounts, charges, corrections |
| `payments` | Payment attempts and their status |
| `payment_events` | Payment provider webhook/event processing records |
| `refunds` | Refund attempts and outcomes |

### 4.7 Inventory
| Table | Purpose |
|---|---|
| `measurement_units` | Supported units (kg, g, L, count, etc.) |
| `ingredients` | Ingredient records |
| `recipes` | Links a menu item to its recipe history |
| `recipe_versions` | Versioned recipe for a specific operational period |
| `recipe_ingredients` | Ingredient quantities per recipe version |
| `stock_movements` | All inventory changes (receipts, consumption, adjustments, waste) |
| `inventory_deduplication_records` | Prevents duplicate stock movements from same logical event |

### 4.8 Audit & Events
| Table | Purpose |
|---|---|
| `audit_logs` | Auditable history of sensitive operational actions |
| `outbox_events` | (Conditional) Transactional outbox for reliable event delivery |

---

## 5. Restaurant & Identity Tables

### `restaurants`
Stores the identity and operating config of each restaurant.

| Field | Notes |
|---|---|
| `id` | UUID primary key |
| `name` | Restaurant name |
| `slug` | Unique public identifier (unique constraint) |
| `address` | Configured address |
| `phone` | Contact number |
| `currency_code` | Must be valid |
| `timezone` | IANA timezone identifier (must be valid) |
| `is_active` | Whether restaurant is active |
| `created_at`, `updated_at` | |

---

### `staff_users`
Staff identity and authentication.

| Field | Notes |
|---|---|
| `id` | UUID |
| `restaurant_id` | FK to restaurants |
| `full_name` | |
| `email` or `phone` | Login identifier (uniqueness policy to be defined) |
| `password_hash` | Hashed — never plaintext |
| `is_active` | Disabled accounts cannot initiate new protected operations |
| `last_login_at` | |
| `created_at`, `updated_at` | |

---

### `roles`, `permissions`, `staff_user_roles`, `role_permissions`

- `roles` — defines roles like administrator, waiter, kitchen, cashier
- `permissions` — defines granular permission keys (e.g., `order.cancel`, `refund.initiate`)
- `staff_user_roles` — maps a staff user to a role (unique per staff+role pair)
- `role_permissions` — maps a role to its permitted operations (unique per role+permission pair)

---

## 6. Menu & Catalog Tables

### `menu_categories`
| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `name`, `description` | |
| `display_order` | Sort order |
| `is_active` | |
| `created_at`, `updated_at` | |

One restaurant → many categories. One category → many menu items.

---

### `menu_items`
| Field | Notes |
|---|---|
| `id`, `restaurant_id`, `category_id` | |
| `name`, `description` | |
| `base_price` | Non-negative exact monetary value |
| `is_published` | Only published items are visible for ordering |
| `is_active` | Inactive items cannot be ordered |
| `created_at`, `updated_at` | |

**Constraint:** Category ownership must match restaurant ownership. Inactive/unpublished items are not accepted for new orders.

---

### `menu_item_modifiers`
Modifier groups like "Size", "Spice Level", "Add-ons".

| Field | Notes |
|---|---|
| `id`, `restaurant_id`, `menu_item_id` | |
| `name` | Group name |
| `selection_type` | Single-select or multi-select |
| `minimum_selections`, `maximum_selections` | |
| `is_required` | |

### `modifier_options`
Options within a modifier group.

| Field | Notes |
|---|---|
| `id`, `modifier_group_id` | |
| `name` | Option name |
| `price_adjustment` | Exact monetary value (same representation as menu prices) |
| `is_active` | |

---

## 7. Table & Service Session Tables

### `restaurant_tables`
| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `table_code` | Unique within restaurant |
| `display_name` | Human-readable name |
| `capacity` | Positive integer |
| `qr_token_hash` | Secure QR context representation |
| `is_active` | Inactive tables cannot receive new orders |
| `created_at`, `updated_at` | |

**Constraint:** QR access must not grant staff/admin privileges.

---

### `table_service_sessions`
Represents a continuous dining visit at a table.

| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `session_reference` | Unique reference |
| `status` | Active, closed, etc. |
| `opened_at`, `closed_at` | |
| `opened_by_staff_user_id`, `closed_by_staff_user_id` | |
| `created_at`, `updated_at` | |

- A session may link multiple orders and one or more bills (depending on billing model)
- A table should not have multiple conflicting active sessions

---

## 8. Orders & Order Items

### `orders`
| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `order_reference` | Unique within scope |
| `order_type` | `DINE_IN`, `PRE_ORDER`, `TAKEAWAY` |
| `source` | `QR`, `WAITER`, `CUSTOMER_WEB`, `ADMINISTRATIVE` |
| `table_service_session_id` | Nullable |
| `restaurant_table_id` | Nullable |
| `customer_reference` | Customer access reference |
| `status` | Current order state |
| `requested_service_at` | Nullable (for pre-orders) |
| `subtotal`, `discount_total`, `tax_total`, `charge_total`, `grand_total` | All exact monetary values |
| `currency_code` | |
| `accepted_at`, `cancelled_at` | |
| `created_at`, `updated_at` | |

**Important:** Orders must not rely on current menu values to reconstruct historical prices. Totals must be preserved as snapshots.

---

### `order_items`
| Field | Notes |
|---|---|
| `id`, `order_id` | |
| `menu_item_id` | Nullable (for historical preservation) |
| `item_name_snapshot` | Snapshot of item name at time of order |
| `unit_price_snapshot` | Snapshot of price at time of order |
| `quantity` | Positive integer |
| `modifier_total_snapshot` | |
| `line_subtotal`, `discount_amount`, `tax_amount`, `line_total` | Exact values |
| `special_instructions` | |
| `status` | Item-level status |
| `created_at`, `updated_at` | |

---

### `order_item_modifiers`
Stores selected modifiers with historical snapshots.

| Field | Notes |
|---|---|
| `id`, `order_item_id` | |
| `modifier_name_snapshot` | |
| `option_name_snapshot` | |
| `price_adjustment_snapshot` | |
| `quantity` | If modifier permits repeated selections |

---

### `order_status_history`
Append-only log of order state transitions.

| Field | Notes |
|---|---|
| `id`, `order_id` | |
| `previous_status`, `new_status` | |
| `actor_type`, `actor_id` | Who/what caused the change |
| `reason` | |
| `created_at` | |

---

### `idempotency_records`
Prevents duplicate operations on retry.

| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `operation_scope` | What type of operation |
| `idempotency_key` | Unique within scope |
| `request_fingerprint` | Conflicting fingerprint = rejected |
| `result_reference` | Reference to the result created |
| `response_status` | |
| `created_at`, `expires_at` | Retention must exceed supported retry window |

---

## 9. Kitchen Tables

### `kitchen_stations`
Preparation stations (if station routing is enabled).

| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `name` | |
| `is_active` | |

### `kitchen_tickets`
| Field | Notes |
|---|---|
| `id`, `restaurant_id`, `order_id` | |
| `station_id` | Nullable if routing not used |
| `status` | Queued, Accepted, Preparing, Ready, Cancelled |
| `queued_at`, `accepted_at`, `started_at`, `ready_at`, `cancelled_at` | |
| `created_at`, `updated_at` | |

One order may generate multiple kitchen tickets (if station routing is used).

### `kitchen_ticket_items`
| Field | Notes |
|---|---|
| `id`, `kitchen_ticket_id`, `order_item_id` | |
| `quantity` | |
| `status` | Item-level prep status |
| `created_at`, `updated_at` | |

### `kitchen_status_history`
| Field | Notes |
|---|---|
| `id`, `kitchen_ticket_id` | |
| `kitchen_ticket_item_id` | Nullable for ticket-level transitions |
| `previous_status`, `new_status` | |
| `actor_id` | |
| `created_at` | |

---

## 10. Reservation Tables

### `reservations`
| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `reservation_reference` | Unique public reference |
| `customer_name`, `customer_phone` | |
| `party_size` | Positive integer |
| `start_at`, `end_at` | End must be after start |
| `status` | Follows approved transitions |
| `verification_status` | OTP verification state |
| `deposit_required`, `deposit_amount` | |
| `confirmed_at`, `checked_in_at`, `cancelled_at`, `no_show_at` | |
| `created_at`, `updated_at` | |

**Constraints:** Verification must be completed before confirmation. Deposit conditions must be satisfied where required.

### `reservation_holds`
Temporary capacity holds during the booking process.

| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `reservation_id` | Nullable during initial hold |
| `start_at`, `end_at` | |
| `party_size` | |
| `status` | |
| `expires_at` | Expired holds must release capacity |
| `created_at`, `updated_at` | |

### `reservation_table_assignments`
| Field | Notes |
|---|---|
| `id`, `reservation_id`, `restaurant_table_id` | |
| `assigned_from`, `assigned_until` | |
| `created_at` | |

**Constraint:** Must prevent conflicting confirmed bookings for the same table. Supports one reservation assigned to multiple tables if combined-table service is used.

### `reservation_status_history`
| Field | Notes |
|---|---|
| `id`, `reservation_id` | |
| `previous_status`, `new_status` | |
| `actor_type`, `actor_id` | |
| `reason` | |
| `created_at` | |

### `otp_verification_attempts`
| Field | Notes |
|---|---|
| `id`, `purpose`, `contact_reference` | |
| `provider_reference` | Provider-side reference |
| `status` | |
| `attempt_count` | |
| `expires_at`, `verified_at` | |
| `created_at` | |

**Important:** OTP values and secrets must NOT be stored in plaintext in application records or logs. Rate limits, expiration, and resend behavior must be defined.

---

## 11. Billing Tables

### `bills`
| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `bill_reference` | Unique public reference |
| `table_service_session_id` | Nullable |
| `status` | Draft, Finalized, Partially Paid, Settled, Voided |
| `currency_code` | |
| `subtotal`, `discount_total`, `tax_total`, `charge_total`, `grand_total` | Exact values |
| `amount_paid`, `amount_refunded` | |
| `issued_at`, `settled_at`, `voided_at` | |
| `created_at`, `updated_at` | |

### `bill_items`
Historical snapshots of what was charged on a bill.

| Field | Notes |
|---|---|
| `id`, `bill_id`, `order_item_id` | order_item_id nullable for some adjustment workflows |
| `item_name_snapshot` | |
| `quantity`, `unit_price_snapshot` | |
| `discount_amount`, `tax_amount`, `line_total` | |
| `created_at` | |

### `bill_adjustments`
Permitted discounts, surcharges, corrections.

| Field | Notes |
|---|---|
| `id`, `bill_id` | |
| `adjustment_type` | Discount, surcharge, correction, etc. |
| `description`, `reason` | |
| `amount` | |
| `created_by` | Who authorized it |
| `created_at` | |

**Constraint:** Must be permission-controlled and traceable.

---

## 12. Payment Tables

### `payments`
| Field | Notes |
|---|---|
| `id`, `restaurant_id`, `bill_id` | |
| `payment_reference` | Unique |
| `provider_name` | Nullable for cash |
| `provider_payment_reference` | Nullable |
| `method` | Cash, UPI, card, etc. |
| `status` | Pending, Successful, Failed, Refunded |
| `amount`, `currency_code` | Positive value, exact representation |
| `initiated_at`, `confirmed_at`, `failed_at` | |
| `created_at`, `updated_at` | |

**Constraints:** Payment success must be based on verified evidence. Duplicate provider events must not duplicate the payment amount.

### `payment_events`
Stores payment provider webhook/event processing records.

| Field | Notes |
|---|---|
| `id`, `payment_id` | |
| `provider_event_id` | Must be unique within provider's event scope |
| `event_type` | |
| `verification_status`, `processing_status` | |
| `received_at`, `processed_at` | |

**Note:** Raw webhook payloads, if retained, must be access-controlled and scrubbed of unnecessary sensitive data.

### `refunds`
| Field | Notes |
|---|---|
| `id`, `payment_id` | |
| `refund_reference`, `provider_refund_reference` | |
| `amount` | Must not exceed permitted refundable balance |
| `status`, `reason` | |
| `initiated_by` | |
| `initiated_at`, `completed_at` | |
| `created_at`, `updated_at` | |

**Constraints:** Refund attempts and outcomes remain traceable. Duplicate refund requests must not produce duplicate financial effects.

---

## 13. Inventory Tables

### `measurement_units`
| Field | Notes |
|---|---|
| `id`, `name`, `symbol` | |
| `dimension` | Mass, volume, count, etc. |
| `is_active` | |

**Important:** Mass, volume, and count units must not be mixed without a valid conversion rule.

### `ingredients`
| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `name`, `measurement_unit_id` | |
| `low_stock_threshold` | Nullable |
| `is_active` | |
| `created_at`, `updated_at` | |

### `recipes` + `recipe_versions` + `recipe_ingredients`
- `recipes` — links a menu item to its recipe history
- `recipe_versions` — versioned recipe with `effective_from` and `effective_until` dates
- `recipe_ingredients` — ingredient quantities per recipe version

**Constraints:** Quantities must be positive. Unit conversions must be valid. Historical order consumption must reference the applicable recipe version.

### `stock_movements`
Records ALL inventory changes.

| Field | Notes |
|---|---|
| `id`, `restaurant_id`, `ingredient_id` | |
| `movement_type` | Opening balance, receipt, consumption, reversal, waste, adjustment, physical count |
| `quantity_delta` | Positive = addition, Negative = consumption (convention to be standardized) |
| `measurement_unit_id` | |
| `source_type`, `source_id` | What caused this movement |
| `idempotency_reference` | Prevents duplicate movements from same event |
| `reason`, `actor_id` | |
| `created_at` | |

**Important:** Corrections create new movements. Original movements are never erased.

### `inventory_deduplication_records`
Prevents a repeated logical event from generating duplicate stock movements.

| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `source_type`, `source_id` | |
| `movement_scope` | |
| `created_at` | |

**Constraint:** Deduplication key must be unique within the intended scope.

---

## 14. Audit & Event Tables

### `audit_logs`
| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `actor_type`, `actor_id` | Who performed the action |
| `action` | What was done |
| `entity_type`, `entity_id` | What record was affected |
| `reason` | |
| `request_reference` | |
| `metadata` | Must NOT contain passwords, OTP secrets, or sensitive payment data |
| `created_at` | |

**Rules:** Ordinary users cannot modify or delete protected audit records. Access is restricted.

### `outbox_events` (Conditional)
Only used if transactional outbox approach is adopted.

| Field | Notes |
|---|---|
| `id`, `restaurant_id` | |
| `event_type`, `aggregate_type`, `aggregate_id` | |
| `payload` | |
| `created_at`, `published_at` | |
| `attempt_count`, `last_error` | |

**Rule:** The event record must be committed in the same transaction as the business change it represents.

---

## 15. Key Relationships

```
Restaurant → Staff Users, Tables, Menu Categories, Orders, Reservations, Bills, Ingredients

Menu Category → Menu Items → Modifier Groups → Modifier Options

Restaurant Table → Service Sessions → Orders → Order Items → Order Item Modifiers
                                              → Kitchen Tickets → Ticket Items

Reservation → Reservation Holds
            → Reservation Table Assignments
            → Reservation Status History

Bill → Bill Items
     → Bill Adjustments
     → Payments → Payment Events
                → Refunds

Menu Item → Recipe → Recipe Versions → Recipe Ingredients → Ingredients → Stock Movements
```

---

## 16. Critical Database Constraints

| ID | Constraint | Description |
|---|---|---|
| DB-C01 | Unique References | Order, bill, reservation, and payment references are unique within their scope |
| DB-C02 | Restaurant Ownership | Cross-restaurant relationships are not possible accidentally |
| DB-C03 | Positive Quantities | Order quantities, party sizes, and recipe quantities follow positive-value rules |
| DB-C04 | Exact Monetary Values | Money uses exact representations with documented rounding rules |
| DB-C05 | Idempotency | Repeated operations do not duplicate orders, payment effects, or inventory movements |
| DB-C06 | Reservation Conflicts | Database prevents overlapping confirmed assignments for the same table |
| DB-C07 | Active Sessions | Prevents conflicting active service sessions for the same table |
| DB-C08 | Financial History | Settled bills and completed payments are not silently overwritten or deleted |
| DB-C09 | Inventory History | Stock changes are traceable to their source event or authorized adjustment |
| DB-C10 | State Transitions | Database and application jointly enforce permitted state changes |

---

## 17. Indexing Strategy (Candidates)

Exact indexes will be confirmed after query and workload design.

| Area | Candidate Indexes |
|---|---|
| Identity | Staff account lookup by login identifier; restaurant and account status |
| Menu | Items by restaurant, publication status, and category; modifier groups by item |
| Orders | By restaurant + creation time; by status + time; by table session; unique order reference |
| Kitchen | Active tickets by restaurant, station, status, creation time |
| Reservations | By restaurant + start time; by status + time; assignments by table + time interval; unique reservation reference |
| Billing/Payments | Bills by restaurant + status; payments by bill; payments by provider reference; unique provider event; refunds by payment |
| Inventory | Stock movements by ingredient + time; by source event; recipes by menu item + version |

---

## 18. Data Integrity & Concurrency

| Scenario | Strategy |
|---|---|
| Order creation | Atomic: order + order items must succeed together. Idempotency protects against concurrent duplicate requests. |
| Reservations | Preliminary availability check is not enough. Confirmation uses a database-backed concurrency strategy (pessimistic lock, exclusion constraint, or serializable transaction). |
| Payments | Verified provider events processed idempotently. Bill balances remain correct under concurrent payment notifications. |
| Inventory | Stock movement creation and deduplication are coordinated transactionally. Concurrent consumption of the same ingredient does not silently lose updates. |
| Historical snapshots | Order items and bill items preserve values at time of transaction. Recipe changes do not rewrite historical consumption. |

---

## 19. Data Retention & Privacy

The database design supports:
- Controlled access to customer contact details
- Restricted staff access to sensitive records
- Retention rules for audit and financial records
- Safe handling of OTP-related records
- Removal or anonymization of personal info when legally appropriate
- Backup and recovery procedures
- Data export or deletion workflows where applicable law requires

> Final retention schedule must be established after applicable legal and operational requirements are verified.

---

## 20. Seed Data Requirements

Development and test environments use synthetic data only. Never use real customer info or production secrets.

The seed dataset should include:
- One demo restaurant
- Multiple menu categories
- Available and unavailable menu items with modifiers
- Several tables with different capacities
- Staff accounts for each role
- Example orders in different states
- Kitchen tickets with different prep states
- Confirmed, pending, and cancelled reservations
- Bills with outstanding and settled balances
- Successful, failed, and pending payments
- Ingredients, recipes, and stock movements
- Audit records for representative actions

---

## 21. Database Acceptance Criteria

The database design is ready for approval when:

1. All core entities and relationships are represented
2. Order and bill history remain accurate after menu changes
3. Reservation conflicts are prevented through a defined database-backed strategy
4. Idempotency constraints cover order creation and financial/inventory side effects
5. Payment events and refunds remain traceable
6. Inventory changes are represented as stock movements
7. Ownership boundaries are defined for restaurant-scoped data
8. Required indexes correspond to known query patterns
9. Monetary and timezone conventions are documented
10. Deletion, retention, and audit requirements are defined
11. Open decisions are resolved or explicitly assigned before migration design

---

## 22. Open Decisions (Must be resolved before final schema)

1. Is customer identity account-based, guest-based, or a combination?
2. Are multiple independent bills per table session supported in the MVP?
3. Can a bill contain items from multiple orders?
4. Do reservations use specific tables or capacity-based allocation?
5. Are combined-table reservations included in the MVP?
6. Are payment provider event payloads retained, and for how long?
7. Do recipe versions use explicit effective dates or immutable version references?
8. Are stock balances derived from movements or maintained as transactionally updated projections?
9. Is the transactional outbox required for the first release?
10. Which reservation and session constraints should use PostgreSQL exclusion constraints, unique indexes, or transactional locking?
11. Which records must be retained or anonymized to meet applicable obligations?

---

**End of Document 06 — Database Design & ERD Specification**