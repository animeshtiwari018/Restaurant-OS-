# RESTRO MANAGE — Document 01: Database Design & ERD Blueprint

**Project:** RESTRO MANAGE  
**Document ID:** RM-DB-001  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Section 11)  
**Database Engine:** PostgreSQL (Authoritative Source of Truth)  
**ORM:** Prisma ORM  

---

## 1. Database Architecture & Design Principles

1. **DB-001 Referential Integrity:** Foreign keys, cascade rules, and non-null constraints enforce relational consistency.
2. **DB-002 Authoritative Server State:** Calculations (prices, totals, discounts, remaining balances) are computed strictly by PostgreSQL and Node.js.
3. **DB-003 Historical Preservation:** Historical orders, bills, and tickets retain immutable snapshots of item names, prices, and modifiers at the time of purchase.
4. **DB-004 Monetary Precision:** All monetary amounts are stored in integer minor units (e.g., `price_paise`, `total_amount_paise`) to prevent floating-point calculation errors.
5. **DB-005 Concurrency Safety:** Atomic transactions, row-level locking (`SELECT ... FOR UPDATE`), and exclusion constraints prevent double-claiming of orders and double-booking of tables.
6. **DB-006 Scope Boundary (Zero Inventory Tables):** No `stock_movements`, `recipes`, or `inventory_deductions` tables exist in this schema. Item availability is controlled cleanly via `menu_items.is_available`.

---

## 2. Domain Entities & Schemas

### 2.1 Restaurant & Access Domain
- **`restaurants`**: Outlets with name, slug, address, timezone, currency (`INR`), opening/closing hours.
- **`users`**: Staff accounts with email, password hash, status (`ACTIVE`/`INACTIVE`).
- **`roles`**: System roles (`ADMIN`, `MANAGER`, `WAITER`, `KITCHEN_STAFF`, `CASHIER`).
- **`user_roles`**: Many-to-many link between users and roles.
- **`customer_profiles`**: Diners identified by verified phone number.
- **`customer_sessions`**: Active dining sessions with short-lived tokens, table references, and expiration timestamps.
- **`otp_verification_attempts`**: Rate-limited OTP store with hashed tokens, attempt counts, and 5-minute expiry.

### 2.2 Floor & Table Domain
- **`floors`**: Physical floor / section layouts (`name`, `display_order`).
- **`restaurant_tables`**: Physical tables with `display_number`, `capacity`, `floor_id`, and operational status (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `UNAVAILABLE`).
- **`table_qr_tokens`**: Opaque 32-character cryptographic token hashes with revocation timestamps and rotation history.
- **`table_service_sessions`**: Represents continuous dining visits. Unique constraint: At most **one active dining session** per physical table.

### 2.3 Menu & Nutritional Transparency Domain
- **`menu_categories`**: Menu groups with `restaurant_id`, `name`, `sort_order`, `is_active`.
- **`menu_items`**:
  - `id`, `restaurant_id`, `category_id`, `name`, `description`, `price_paise`
  - `image_urls`, `is_available`, `sort_order`, `preparation_time_minutes`
  - **Nutritional Fields:**
    - `calories_kcal` (integer)
    - `protein_grams` (decimal)
    - `carbs_grams` (decimal)
    - `fat_grams` (decimal)
    - `serving_size_value` (decimal) & `serving_size_unit` (e.g., `g`, `ml`, `portion`)
    - `nutritional_basis` (enum: `PER_SERVING`, `PER_100_GRAMS`)
    - `nutritional_verification_status` (enum: `UNVERIFIED`, `VERIFIED_BY_RESTAURANT`, `LAB_TESTED`)
- **`ingredients`**: Structured ingredient taxonomy (`id`, `restaurant_id`, `name`).
- **`menu_item_ingredients`**: Links items to ingredients with optional quantity per serving (e.g., 150g Paneer).
- **`allergens`**: Taxonomy of allergens (`Milk`, `Peanuts`, `Gluten`, etc.).
- **`menu_item_allergens`**: Many-to-many relationship with optional cross-contact disclosures.
- **`dietary_tags`**: Labels (`VEG`, `VEGAN`, `EGG`, `GLUTEN_FREE`).
- **`menu_item_dietary_tags`**: Many-to-many link between items and dietary labels.
- **`menu_item_customizations`** & **`customization_options`**: Modifiers (e.g., "Spice Level: Mild/Medium/Hot", "Extra Cheese: +₹50").

### 2.4 Order & Waiter Dispatch Domain
- **`orders`**:
  - `id`, `restaurant_id`, `table_session_id`, `table_number`, `customer_id`
  - `status`: `PENDING_VERIFICATION`, `CLAIMED`, `CONFIRMED`, `PREPARING`, `READY`, `SERVED`, `CANCELLED`
  - `assigned_waiter_id`: Staff member who atomically claimed the order.
  - `claimed_at`, `verified_at`, `cancellation_reason`
  - `subtotal_paise`, `tax_paise`, `total_amount_paise`
- **`order_items`**: Immutable snapshots of purchased items (`item_name`, `unit_price_paise`, `quantity`, `subtotal_paise`, special cooking instructions).
- **`order_item_customizations`**: Snapshots of selected modifiers and price adjustments.
- **`waiter_assignments`**: Audit history of waiter claims, transfers, and verifications.
- **`order_status_history`**: Audit trail of every lifecycle transition with actor reference.

### 2.5 Kitchen Display (KDS) & KOT Domain
- **`kitchen_tickets`**: Generated post-verification (`ticket_number`, `order_id`, `status`: `QUEUED`, `PREPARING`, `READY`).
- **`kitchen_ticket_items`**: Item-level preparation tracking (`QUEUED`, `PREPARING`, `READY`).
- **`kitchen_status_history`**: State change timestamps and elapsed preparation time.
- **`print_jobs`**: Network thermal print queue (`status`: `PENDING`, `PROCESSING`, `PRINTED`, `FAILED`, retry count).

### 2.6 Table Reservation Domain
- **`reservations`**:
  - `id`, `restaurant_id`, `customer_name`, `customer_phone`, `party_size`
  - `start_at`, `end_at`, `status`: `REQUESTED`, `OTP_VERIFIED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
  - `deposit_paise`, `deposit_status`
- **`reservation_table_assignments`**: Specific physical table assignment with exclusion constraint against overlapping bookings:
  $$\text{EXCLUDE USING gist } (\text{restaurant_table_id WITH }=, \text{time_range WITH }\&\&)$$
- **`reservation_status_history`**: State transition audit log.

### 2.7 Billing & Payment Domain
- **`bills`**:
  - **Constraint:** `table_session_id` is **UNIQUE**. Exactly one primary bill per session.
  - `bill_reference`, `subtotal_paise`, `tax_paise`, `discount_paise`, `final_total_paise`
  - `paid_amount_paise`, `status`: `DRAFT`, `FINALIZED`, `PARTIALLY_PAID`, `SETTLED`, `CANCELLED`
- **`bill_items`**: Aggregated line items linked to served order items.
- **`payments`**:
  - Multiple payment records per bill (`payment_method`: `CASH`, `UPI`, `CARD`, `ONLINE`).
  - `amount_paise`, `status`: `INITIATED`, `SUCCESSFUL`, `FAILED`, `REFUNDED`
  - `provider_name`, `provider_reference`, `settlement_reconciliation_meta`
- **`payment_provider_events`**: Idempotent webhook event log (`provider_event_id` UNIQUE).
- **`refunds`**: Explicit refund records linked to payment transactions.

### 2.8 Audit & Reliability Domain
- **`audit_logs`**: System-wide auditable event stream (`actor_id`, `action`, `resource_type`, `resource_id`, `ip_address`, `changes_json`).
- **`idempotency_records`**: Protects against duplicate POST operations via client idempotency keys (`idempotency_key` UNIQUE, expires after 24h).
- **`outbox_events`**: Transactional outbox for reliable asynchronous delivery of Socket.IO broadcasts and print jobs.
