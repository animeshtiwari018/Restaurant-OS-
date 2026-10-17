# RESTRO MANAGE — Document 07: Billing and Payment Management

**Project:** RESTRO MANAGE  
**Document ID:** RM-REQ-007  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Section 8)

---

## 1. The Primary Billing Invariant

**One Table Service Session = Exactly One Primary Bill.**

- All eligible served orders placed during a dining session roll into the session's single authoritative primary bill.
- The MVP explicitly **excludes** independent split bills and multiple primary bills for a single table service session.
- Historical item prices are preserved from purchase-time snapshots; subsequent menu price edits do not alter historical bills.

---

## 2. Multiple Payments per Bill

While a session has only one primary bill, that bill supports **multiple payment records** across different methods until the balance is settled.

### Practical Example:
- **Bill Total:** ₹2,000
  - First Payment: ₹500 via UPI (Customer A)
  - Second Payment: ₹1,000 via Credit Card (Customer B)
  - Remaining Balance: ₹500 in Cash
- **Balance Calculation:**
  $$\text{Outstanding Balance} = \text{Bill Total} - \sum \text{Verified Successful Payments}$$
- The bill remains in `PARTIALLY_PAID` status until `Outstanding Balance == 0`, at which point it transitions to `SETTLED`.

---

## 3. Payment Methods & Verification

Supported payment categories:
- **Cash:** Recorded manually by authorized billing staff or cashier.
- **UPI:** Dynamic QR / intent flow via integrated provider.
- **Card:** Point-of-sale terminal verification or online checkout.
- **Online Checkout:** Server-side verification via trusted provider webhooks or APIs.

### Security Invariants:
- A client-side browser redirect is **never** accepted as proof of payment. Payment success must be verified through signed server-to-server webhooks or direct provider API status queries.
- Webhook processing is strictly **idempotent**: duplicate webhook deliveries for the same `provider_event_id` are ignored and do not double-credit settlements.
- Raw sensitive payment credentials (full card numbers, CVVs) are **never** stored. Only reconciliation tokens and provider event identifiers are retained.
