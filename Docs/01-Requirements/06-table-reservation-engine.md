# RESTRO MANAGE — Document 06: Advance Table Reservation Engine

**Project:** RESTRO MANAGE  
**Document ID:** RM-REQ-006  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Sections 7 & 14)

---

## 1. Reservation Creation & Booking Parameters

Customers can reserve dining slots through the web interface:
- Date, time slot, and party size (number of guests).
- Phone number verification via OTP.
- Specific physical table assignment with capacity validation.
- Configurable operational rules:
  - Opening & closing hours.
  - Advance booking window (e.g., up to 14 days in advance).
  - Standard dining slot duration (default: 90 minutes).
  - Buffer time between reservations (default: 15 minutes).
  - Deposit requirements and no-show policies.

---

## 2. Specific-Table Assignment & Concurrency Protection

- Every confirmed reservation is assigned to a **specific physical table**.
- Combining multiple physical tables for one booking is excluded from the MVP.
- **Race Condition Prevention:**
  - Checking table availability and subsequently creating a reservation without transaction locks leads to double-booking.
  - The reservation engine enforces transactional isolation:
    1. Validates the requested time interval $[T_{\text{start}}, T_{\text{end}}]$.
    2. Coordinates assignment using PostgreSQL exclusion constraints (`btree_gist` on table ID and `tstzrange`) or transactional serializable updates:
       $$\text{Existing Booking: } [T_{1}, T_{2}] \cap \text{New Booking: } [T_{\text{start}}, T_{\text{end}}] = \emptyset$$
    3. Prevents overlapping confirmed reservations and active temporary holds.
    4. Automatically releases expired temporary booking holds after 10 minutes.

---

## 3. Deposit & No-Show Policies

### Reservation States
$$\text{Requested} \longrightarrow \text{OTP Verified} \longrightarrow \text{Awaiting Deposit} \longrightarrow \text{Confirmed} \longrightarrow \text{Completed / Cancelled / No-Show}$$

- **Deposit Records:** Kept distinct from the final dining bill until applied at the table.
- **No-Show Policy:** If a party does not arrive within the configured grace period (e.g., 20 minutes past reservation start), the table can be released for walk-in guests with forfeiture of any non-refundable deposit.
- **Arrival Seating:** Arriving guests are verified by staff, transitioning the reservation to `COMPLETED` and opening an active `table_service_session`.
