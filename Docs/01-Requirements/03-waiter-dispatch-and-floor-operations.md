# RESTRO MANAGE — Document 03: Waiter Dispatch and Floor Operations

**Project:** RESTRO MANAGE  
**Document ID:** RM-REQ-003  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Section 4)

---

## 1. Real-Time Order Broadcast

When a customer submits a dine-in order via table QR:
- The order is persisted in the database with status `PENDING_VERIFICATION`.
- A real-time WebSocket event (`order:submitted`) is broadcast to all active, on-duty waiters.
- The alert displays:
  - Table number / name
  - Total items requested
  - Total order amount
  - Submission timestamp
- Audible and visual notification alerts are triggered on staff devices.
- Waiters can inspect the requested items and special instructions before attempting to claim the order.

---

## 2. First-Come, First-Claim Atomic Assignment

- Order claiming operates on a **first-come, first-claimed** model.
- The claiming operation is **strictly atomic** at the database level:
  - Enforced via PostgreSQL row-level locking (`SELECT ... FOR UPDATE`) or conditional atomic updates:
    ```sql
    UPDATE orders 
    SET assigned_waiter_id = $waiter_id, 
        status = 'CLAIMED',
        claimed_at = NOW() 
    WHERE id = $order_id AND assigned_waiter_id IS NULL AND status = 'PENDING_VERIFICATION';
    ```
- If two or more waiters click "Claim" simultaneously:
  - Exactly **one** operation succeeds and commits the assignment.
  - The losing waiter(s) receive a conflict response (`409 Conflict: Order already claimed`).
  - An updated WebSocket broadcast immediately updates all waiter screens.
- **Rule:** Redis may be used for ephemeral messaging and caching, but PostgreSQL remains the sole transactional authority for order ownership.

---

## 3. Physical Verification Gate

Claiming an order does **NOT** release it to the kitchen.

The assigned waiter must physically visit the table and perform the verification checklist:
1. **Confirm Customer Presence:** Verify that guests are physically seated at the table.
2. **Verify Table and Dining Session:** Confirm that the table matches the QR order.
3. **Review Items and Customizations:** Double-check requested dishes, portions, and spice levels with the customer.
4. **Clarify Special Notes:** Check for allergy disclosures or specific cooking instructions.
5. **Confirm or Reject:**
   - **Confirm:** Releases the order into `CONFIRMED` and triggers Kitchen Order Ticket (KOT) generation.
   - **Reject:** If the table is empty or the order is prank/erroneous, the waiter rejects the order with a mandatory reason code. No kitchen ticket is ever created.

---

## 4. Service Lifecycle Actions

Once confirmed, the assigned waiter manages the order through fulfillment:
- Receives real-time push notifications when items or the complete ticket are marked `READY` by the kitchen.
- Delivers dishes to the table and records items as `SERVED`.
- Can place additional waiter-assisted orders for the table.
- Initiates the billing workflow when guests are ready to settle.
- Backend RBAC prevents unauthorized waiters from altering orders assigned to another staff member unless a supervisory permission allows reassignment.

---

## 5. Failure Handling & Auditability

The dispatch engine handles:
- **Waiter Disconnections:** If an assigned waiter loses connection or abandons the order, an audible timeout escalation alerts the manager.
- **Supervisory Reassignment:** Managers can reassign an order with mandatory audit logging.
- **Idempotent Confirmations:** Duplicate network confirmation requests from staff devices cannot create duplicate kitchen tickets.
