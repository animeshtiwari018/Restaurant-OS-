# RESTRO MANAGE — Document 08: Admin Dashboard & Staff Management

**Project:** RESTRO MANAGE  
**Document ID:** RM-REQ-008  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Section 9)

---

## 1. Menu & Nutritional CMS

Administrators and managers have access to a rich Content Management System (CMS):
- **Category Management:** Create, reorder, edit, and deactivate menu categories.
- **Menu Item Management:**
  - Item names, descriptions, images, prices (paise), and estimated prep time.
  - Manual availability toggle (`is_available`: true/false) for 86ing items when out of stock.
  - Ingredient lists & optional quantities per serving.
  - Macronutrients (Calories in kcal, Protein, Carbs, Fat in grams).
  - Explicit reporting basis (`PER_SERVING` vs. `PER_100_GRAMS`).
  - Standardized allergen tags with cross-contact risk disclosures.
  - Verified dietary labels (Vegetarian, Vegan, Gluten-free).
  - Modifier groups and customization options with incremental price adjustments.
- **Scope Boundary:** Inventory stock deductions, purchase orders, and supplier tracking remain excluded.

---

## 2. Staff Roles & Role-Based Access Control (RBAC)

Supported staff roles:
1. **Administrator:** Full operational and system configuration rights.
2. **Manager:** Table floor management, order escalation, manual reassignment, refunds.
3. **Waiter:** Real-time order claiming, physical verification, at-table ordering, serving updates.
4. **Kitchen Staff:** KDS screen operations, ticket status updates, item ready marks.
5. **Cashier / Billing Staff:** Bill generation, cash receipt recording, payment reconciliation.

All permissions are strictly enforced on the server for every REST endpoint and WebSocket action.

---

## 3. Operational Dashboard & Real-Time Monitoring

Live operational views derived from authoritative database records:
- **Active Floor Map:** Live table occupancy, active sessions, and upcoming reservations.
- **Order Dispatch Queue:** Unassigned orders awaiting waiter claim and verification.
- **Kitchen SLAs:** Elapsed ticket times and bottleneck alerts.
- **Revenue Summaries:** Completed dining sessions, total sales, payment method breakdowns.
- **Nutritional Audit:** Coverage report highlighting menu items with incomplete or unverified nutritional data.
