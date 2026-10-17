# RESTRO MANAGE — Document 02: Customer Mobile Web Application & Nutritional Transparency

**Project:** RESTRO MANAGE  
**Document ID:** RM-REQ-002  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Section 3)

---

## 1. Zero-Install Mobile Web Access

- Customers access the platform exclusively via a modern mobile browser (Safari, Chrome, Edge, Firefox).
- Scanning a physical table QR code opens the opaque-token restaurant table entry point: `/t/<opaque-token>`.
- Zero native application installation is required.
- Public menu browsing is supported without an active dining session.
- Submitting an order requires phone number + OTP verification.

---

## 2. Secure QR Table Access

- Every physical table is associated with a 32-character opaque cryptographic token (generated from 16 secure random bytes).
- URLs do not expose sequential table IDs, database auto-increments, or editable numbers.
- The backend resolves the token to the specific restaurant and table.
- Revoked, expired, or invalid tokens are rejected immediately.
- Customer authentication and dining-session authorization remain separate concerns.

---

## 3. Digital Menu & Nutritional Transparency

Every menu item can present rich, structured information across four tiers:

### 3.1 Basic Item Details
- Name, description, category, and high-quality image URLs.
- Selling price (stored in integer minor units, e.g., paise / cents).
- Availability status (`is_available`: true/false).
- Serving size or portion estimate (e.g., 200g, 1 bowl).
- Estimated preparation time in minutes.

### 3.2 Structured Ingredient Disclosures
- Structured list of major ingredients (e.g., Paneer, Curd, Spices, Mustard Oil, Lemon Juice).
- Where supplied by the restaurant, the quantity of each ingredient per portion (e.g., 150g Paneer).
- **Rule:** This is informational disclosure for the diner, NOT an automated inventory deduction engine.

### 3.3 Nutritional Information (Macronutrients)
Every food item records the four primary nutritional values:
1. **Calories:** Measured in kcal.
2. **Protein:** Measured in grams.
3. **Carbohydrates:** Measured in grams.
4. **Total Fat:** Measured in grams.

Optional extended fields supported in schema:
- Saturated fat, dietary fibre, total sugar, sodium, serving weight in grams.

#### Serving-Size Rules & Reporting Basis
- Nutritional values must be explicitly tied to a defined reporting basis:
  - `PER_SERVING`
  - `PER_100_GRAMS`
- The customer UI must clearly display which basis is shown.
- Dishes with unknown or unverified data must be marked as `UNAVAILABLE` rather than showing fabricated or estimated zeros.

### 3.4 Allergen Disclosures & Warnings
- Menu items are linked to a standardized allergen taxonomy:
  - Milk & Dairy, Peanuts, Tree Nuts, Gluten, Soy, Egg, Fish, Shellfish, Sesame, etc.
- Known cross-contact risks are disclosed where applicable.
- **Rule:** Allergen filters are informational aids. The platform does not fabricate safety guarantees. Missing allergen data must never be interpreted as "allergen-free".

### 3.5 Dietary Labels
- Menu items display restaurant-verified labels:
  - Vegetarian (`VEG`), Vegan (`VEGAN`), Eggitarian (`CONTAINS_EGG`), Gluten-Free (`GLUTEN_FREE`).
- Filters operate on structured database fields, not unstructured string searches.

---

## 4. Cart, Customizations & Authoritative Server Revalidation

- Customers can add items, select modifier options, set quantities, add item-specific cooking instructions, and add table notes.
- **Security Rule:** Client-submitted prices and totals are NEVER trusted. The backend recalculates the order total directly from authoritative menu item prices in PostgreSQL.
- If a menu item price changes or becomes unavailable after cart creation, the backend revalidates the cart and notifies the customer before submission.

---

## 5. Ordering Modes & Order Tracking

### Supported Ordering Modes
1. **Mode A: QR-Based Dine-In Ordering:** Customer scans table QR, verifies phone via OTP, submits order into `PENDING_VERIFICATION`.
2. **Mode B: Waiter-Assisted Ordering:** Waiter creates an order from the staff terminal directly into the active dining session.
3. **Mode C: Advance Food Ordering:** Pre-orders tied to permitted future reservation fulfillment.

### Customer Order Lifecycle View
$$\text{Order Submitted} \longrightarrow \text{Waiting for Waiter} \longrightarrow \text{Confirmed} \longrightarrow \text{Preparing} \longrightarrow \text{Ready} \longrightarrow \text{Served} \longrightarrow \text{Bill Settled}$$

If an order is rejected during waiter verification, the customer sees the rejection status and explanation immediately, and no kitchen ticket is created.
