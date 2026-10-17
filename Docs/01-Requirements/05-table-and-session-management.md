# RESTRO MANAGE — Document 05: Table & Dining-Session Management

**Project:** RESTRO MANAGE  
**Document ID:** RM-REQ-005  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Section 6)

---

## 1. Physical Table Management

Administrators can configure restaurant tables and floor maps:
- `table_identifier` and human-readable `display_number` (e.g., "T-01", "Patio-4").
- Seating capacity (e.g., 2, 4, 6, 8 pax).
- Floor or section assignment (e.g., Ground Floor, Rooftop, AC Hall).
- Operational availability: `ACTIVE` or `INACTIVE`.
- Associated opaque QR token hash.

### Operational Table States
- **Available:** Table is clean, unoccupied, and ready for guests.
- **Occupied:** An active dining session is currently underway.
- **Reserved:** A confirmed reservation exists for an upcoming time window.
- **Unavailable:** Table is physically closed for maintenance or staff use.

> **Rule:** Physical occupancy and future reservation status remain logically distinct. A table reserved for 8:00 PM can remain physically available for a 5:30 PM walk-in session.

---

## 2. Table Service Sessions

A **Table Service Session** represents one continuous dining visit by a customer party.
- It connects the table with its active orders, assigned waiters, customer profile, and the primary bill.
- **Core Database Invariant:** A physical table can have **at most one active dining session** at any time.

### Session Lifecycle
$$\text{Open} \longrightarrow \text{Active Service} \longrightarrow \text{Awaiting Settlement} \longrightarrow \text{Closed}$$

- `Open`: Seated guests scan QR or waiter opens the session.
- `Active Service`: Orders are submitted, verified, prepared, and served. Multiple orders can be submitted during this single session.
- `Awaiting Settlement`: The primary bill is generated; guests are reviewing the bill or making payment.
- `Closed`: Bill is settled in full and required closure checklist is satisfied.

---

## 3. Session Closure Conditions

A dining session cannot close prematurely. The database enforces all closure requirements:
1. **No Pending Orders:** All submitted orders must be `SERVED`, `CANCELLED`, or explicitly resolved.
2. **No Active Kitchen Tickets:** Kitchen prep tickets must be finished or cancelled.
3. **Primary Bill Fully Settled:** The outstanding balance on the session's primary bill must reach zero, unless an authorized manager exception applies.
4. **Table Reset:** Once closed, the table reverts to operational availability according to its floor schedule.
