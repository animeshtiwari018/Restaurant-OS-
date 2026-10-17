# RESTRO MANAGE — Document 01: Product Scope and Boundaries

**Project:** RESTRO MANAGE  
**Full Title:** Smart QR-Based Restaurant Management, Waiter Dispatch & Nutritional Transparency System  
**Document ID:** RM-REQ-001  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md)

---

## 1. Executive Summary & Vision

Restro Manage is a full-stack, browser-based restaurant operations platform designed to streamline dine-in operations, digital ordering, waiter dispatch, kitchen coordination, table reservations, nutritional transparency, and billing through a single unified system.

### The Operational Workflow
$$\text{Discover Menu} \longrightarrow \text{Understand Ingredients} \longrightarrow \text{Order} \longrightarrow \text{Physical Waiter Verification} \longrightarrow \text{Kitchen Preparation} \longrightarrow \text{Serve} \longrightarrow \text{Settle Bill}$$

### Key Differentiators
1. **Physical Waiter Verification Gate:** Customer orders remain `PENDING_VERIFICATION` until an authorized waiter physically confirms customer presence at the table.
2. **Atomic Waiter Claiming:** Real-time first-come, first-claim order assignment enforced by transactional database locking (`SELECT ... FOR UPDATE` / conditional update in PostgreSQL).
3. **Nutritional Transparency:** Structured item disclosures for calories, protein, carbs, total fat, ingredients, serving sizes, allergens, and verified dietary tags.
4. **Kitchen Coordination (KDS & KOT):** Item-level preparation tracking and optional network thermal printing.
5. **Conflict-Free Advance Reservations:** Atomic time-slot and specific-table booking with concurrency protection.
6. **Unified Billing Invariant:** Strictly **one primary bill per table service session**, allowing multiple partial payments against that bill.

---

## 2. Features Included in MVP (30 Core Capabilities)

1. **Customer mobile web application** (zero-install, mobile-browser optimized).
2. **Secure QR-based table access** using opaque, non-sequential cryptographic tokens (`/t/<token>`).
3. **Phone number and OTP verification** for dine-in ordering and reservations.
4. **Customer dining-session management** tied to active table visits.
5. **Menu and category management** with hierarchical categories and items.
6. **Food item ingredient management** (structured ingredient names & quantities where supplied).
7. **Nutritional information management** (Calories in kcal, Protein, Carbs, Fat in grams).
8. **Allergen and dietary-tag management** (Milk, Peanuts, Gluten, Veg, Vegan, etc.).
9. **Serving-size and portion information** (explicit basis: per serving vs. per 100g).
10. **Item customizations and special instructions** (spice levels, add-ons, table instructions).
11. **Customer cart and order placement** with authoritative server-side price re-validation.
12. **QR-based dine-in ordering** (orders submitted into `PENDING_VERIFICATION`).
13. **Waiter-assisted ordering** directly from staff devices.
14. **Advance food ordering** for permitted future fulfillment with valid reservations.
15. **Real-time waiter dispatch and atomic order claiming** (first-come, first-claim).
16. **Physical waiter verification gate** before kitchen tickets are generated.
17. **Kitchen Display System (KDS)** with item-level and order-level prep status tracking.
18. **Kitchen Order Ticket (KOT) generation** strictly post-waiter verification.
19. **Optional network thermal printing** via ESC/POS local bridge.
20. **Table and floor management** (table layout, seating capacity, operational states).
21. **Advance reservations with specific-table assignment**.
22. **Configurable reservation deposit and no-show policies**.
23. **One primary bill per table service session** rule.
24. **Multiple payment records per bill** (allowing split payment methods for one bill).
25. **Cash and supported digital payment methods** (UPI, Card, Online).
26. **Payment verification and reconciliation metadata** (idempotent webhook tracking).
27. **Role-based staff permissions** (Admin, Manager, Waiter, Kitchen Staff).
28. **Audit logging** for critical operational and financial events.
29. **Basic operational and sales analytics** (revenue, volume, nutritional completeness).
30. **QR token revocation and regeneration**.

---

## 3. Features Explicitly Excluded from MVP ("Farzi" / Out-of-Scope Features)

The following items are **strictly excluded** from the MVP to preserve simplicity, database consistency, and operational focus:

| Excluded Feature | Rationale for Exclusion |
|---|---|
| **Inventory and stock management** | Requires complex supply chain workflows not needed for dine-in operations. |
| **Automatic stock deduction** | Out of scope; availability is controlled manually via item availability flags (`is_available`). |
| **Recipe management and recipe versioning** | Ingredient quantities and disclosures can be configured without a full recipe engine. |
| **Supplier management and purchase orders** | Back-office procurement is separate from front-of-house operations. |
| **Food delivery and delivery-partner dispatch** | MVP targets in-restaurant dine-in and advance reservations only. |
| **Independent split bills** | MVP enforces **one primary bill per table session**; multiple payment records can settle that single bill. |
| **Multiple primary bills for the same table session** | Violates the core financial invariant: 1 table session = 1 authoritative bill. |
| **Native Android and iOS customer applications** | Customers should not be forced to install an app; mobile browser is faster and frictionless. |
| **Franchise management** | Initial deployment is designed for an individual restaurant. |
| **Multi-restaurant subscription billing** | Multi-tenant SaaS billing will be designed in a future phase. |
| **Advanced accounting integrations** | Accounting exports are deferred. |
| **AI-based recommendations and forecasting** | Non-essential heuristic complexity. |

> **Scope Principle:** Nutritional information and ingredient management are included in the MVP. Inventory tracking and recipe management are NOT required to deliver those features. The restaurant can manually configure ingredient disclosures and nutrition without inventory overhead.
