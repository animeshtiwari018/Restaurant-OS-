# RESTRO MANAGE — Document 01: UI/UX Design Specification

**Project:** RESTRO MANAGE  
**Document ID:** RM-UX-001  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Sections 3, 4, 5, 9)  

---

## 1. Design Systems & Core Principles

- **Mobile-First for Diners:** The customer web application is engineered specifically for mobile browsers (360px–430px viewport width) with fluid touch targets, rich visual food cards, and high contrast.
- **High-Velocity for Staff:** The waiter dispatch and KDS interfaces prioritize speed, high-contrast status cues, audible alerts, and unambiguous action buttons.
- **Authoritative Feedback:** No false confirmation. An order or claim is never displayed as confirmed until the backend PostgreSQL transaction commits.

---

## 2. Customer Mobile Web Application Screens

### 2.1 Table QR Entry & Landing (`/t/:token`)
- Validates opaque QR token; resolves restaurant name and table number (e.g., "Welcome to Table 12").
- Displays restaurant banner, operating hours, and search bar.
- Category horizontal pills (Starters, Main Course, Breads, Beverages, Desserts).

### 2.2 Menu Browsing & Dietary Filtering
- **Rich Dish Card:**
  - Item photo, name, selling price (₹ / minor units).
  - Dietary icon (Veg green dot, Non-veg red triangle, Vegan leaf).
  - Quick nutrition tags: Calories (kcal), Protein (g).
  - Availability status ("In Stock" / "Sold Out" overlay).
- **Nutritional & Allergen Modal:**
  - Detailed macronutrient bars: Calories, Protein, Carbohydrates, Total Fat.
  - Serving size indicator (e.g., "Per 200g serving").
  - Ingredient list (Paneer, curd, fresh spices, lemon juice).
  - Allergen alert banner (e.g., "Contains: Dairy. Made in kitchen handling peanuts").
- **Smart Dietary Filters:**
  - Toggles for Vegetarian, Vegan, Gluten-Free.
  - Allergen Exclusion selector (exclude Dairy, Nuts, Soy).
  - High-Protein filter (>15g protein).

### 2.3 Cart & Order Submission
- Quantity selectors, modifier choices (e.g., Mild/Medium/Spicy), and item cooking notes.
- Price summary with taxes and fees calculated by server.
- Phone number input + OTP verification modal.
- Submission button triggers real-time state change to `PENDING_VERIFICATION`.

### 2.4 Live Order Tracker
- Progress bar:
  $$\text{Order Placed} \longrightarrow \text{Waiter Assigned} \longrightarrow \text{Confirmed} \longrightarrow \text{Cooking} \longrightarrow \text{Ready} \longrightarrow \text{Served}$$
- Live status banner informing customer: *"Your waiter is visiting Table 12 to verify your order shortly."*

---

## 3. Waiter Dispatch Interface (Staff Terminal)

### 3.1 Live Dispatch Queue
- Persistent top bar showing active tables and unassigned alerts.
- **Audio-Visual Alert Card:**
  - Table number prominently displayed.
  - Number of items, total amount, elapsed seconds since submission.
  - Primary Action: Large **"Claim Order"** button.
  - If another waiter wins the claim: Instant toast *"Order claimed by Waiter Ramesh"* and card disappears.

### 3.2 Physical Verification Modal
- Opens upon winning claim:
  - Checklist: Guests present at table, dishes verified, allergy notes confirmed.
  - Actions: **"Confirm & Send to Kitchen"** (Green) vs. **"Reject (Prank/Empty Table)"** (Red).

### 3.3 Active Table View & Serving
- Table grid with color-coded status (Green = Free, Yellow = Active, Blue = Ready to Serve, Orange = Bill Requested).
- One-tap "Mark Served" for kitchen-ready dishes.
- Bill generation and payment recording action buttons.

---

## 4. Kitchen Display System (KDS Screen)

- Designed for 15"–24" touchscreens mounted in the kitchen.
- **Ticket Columns:** `QUEUED` (Grey) $\longrightarrow$ `PREPARING` (Yellow) $\longrightarrow$ `READY` (Green).
- Color-coded SLA timers:
  - $< 15$ mins: Normal (Green timer)
  - $15 - 25$ mins: Warning (Amber timer)
  - $> 25$ mins: Delayed (Flashing Red alert)
- Item-level checkboxes: Chefs tap individual dishes as prepared; ticket turns green when all items are done.
- Header button: **"Reprint KOT"** for thermal printer re-runs.

---

## 5. Admin Dashboard (CMS & Floor Layout)

- **Menu CMS:** Category reordering, item creation with nutrition values, allergen tagging, manual availability switch.
- **Floor Map Editor:** Add tables, assign seats, set sections, generate printable QR codes.
- **Sales & Revenue:** Daily bill totals, cash vs. digital breakdown, average dining duration.
- **Scope Boundary:** No inventory stock screens, no recipe versioning forms, no delivery fleet maps.
