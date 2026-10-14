# Restaurant OS — Product Discovery

**Version:** 1.0
**Date:** 13 October 2026
**Status:** Draft

---

## 1. What is this project?

Restaurant OS is a system to manage a restaurant's full operations — ordering, tables, kitchen, billing, reservations, and basic inventory — all in one place.

The first version is built for a single restaurant. Later, it can expand to support multiple restaurants as a SaaS product.

It will work for both full-service restaurants and cafés/quick-service restaurants (QSRs).

---

## 2. What problem does it solve?

Most restaurants use disconnected tools or manual processes for different tasks. This causes:

- Wrong or duplicate orders
- Slow communication between waiters and kitchen
- Customers ordering unavailable items
- Reservation conflicts
- Billing mistakes
- Inaccurate stock records
- Extra manual work for managers

---

## 3. Product Vision

Build a reliable system that connects the entire dine-in journey — from ordering to kitchen to payment — through one consistent workflow.

The goal is to help staff coordinate better, reduce mistakes, and give customers a smoother experience.

---

## 4. Who uses this system?

### Customers
- Browse the menu and check availability
- Place advance pre-orders
- Order at table by scanning a QR code
- Reserve a table
- Track order status
- View bills and pay

### Waiters
- See table status
- Create and manage dine-in orders
- Record customer requests and item changes
- Monitor kitchen status
- Help with billing

### Kitchen Staff
- See incoming order tickets
- View item details and prep instructions
- Update preparation status
- Mark orders as ready
- See cancelled or delayed items

### Cashiers
- Generate and review bills
- Record cash payments
- Handle online payments
- Process permitted refunds

### Restaurant Administrators
- Manage menu, prices, availability
- Manage tables, QR codes, reservations
- Manage staff roles and permissions
- Configure basic inventory and recipes
- View reports and operational records

---

## 5. Who is the first customer?

Independent, owner-operated restaurants with dine-in tables.

Ideal customer:
- Runs a single outlet
- Has regular dine-in business
- Needs better coordination between front-of-house and kitchen
- Currently uses manual processes or multiple disconnected tools

---

## 6. Core Hypothesis

A single system connecting orders, tables, kitchen, billing, reservations, and inventory can reduce duplicated work and improve consistency compared to the current workflow.

This must be validated — don't assume commercial demand.

---

## 7. What makes this different?

The differentiation is not individual features (QR ordering, kitchen display, billing). Other products already offer these.

The key differentiator to validate is the **reliability and simplicity of the complete operational workflow**.

- One consistent record of orders and tables
- Clear order lifecycle tracking
- Reliable handling of concurrent orders and reservations
- Connected kitchen and customer status updates
- Recipe-based inventory with traceable stock changes
- Both QR-based and waiter-assisted ordering

---

## 8. Business Model

Long-term: subscription-based SaaS.

Possible revenue streams:
1. Monthly/annual subscriptions
2. Onboarding and setup services
3. Advanced features (inventory, reporting, multi-outlet)

No pricing decided yet. Must be validated through customer interviews and pilot commitments.

---

## 9. What's in the MVP?

The MVP will include:

- Single-restaurant setup
- Customer-facing digital menu
- Menu categories, modifiers, prices, availability
- Advance pre-ordering
- QR-based table ordering
- Waiter-assisted ordering
- Table management
- Reservation management with OTP verification and deposit policies
- Kitchen order display and status tracking
- Billing and payment records (cash + online)
- Basic ingredient inventory with recipe-based deductions
- Staff authentication and role-based access control
- Audit history

### Not in MVP (Deferred)

- Multi-restaurant support
- Subscription billing
- Supplier management / purchase orders
- Staff scheduling
- Loyalty programs
- Customer relationship management
- Delivery fleet management
- Native mobile apps
- AI-powered forecasting
- Third-party delivery integrations

---

## 10. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Version Control | Git + GitHub |

Initial architecture: modular monolith.

---

## 11. Key Assumptions

- Restaurants have real problems with disconnected workflows
- A unified system can improve operational consistency
- QR ordering adds value alongside waiter service (not replacing it)
- Basic inventory is useful when recipes and stock movements are correctly configured
- Operators will pay for measurable improvements
- The system can scale to multi-restaurant later without premature complexity

Each assumption needs validation.

---

## 12. Key Risks

- Scope creep delays the MVP
- Existing software already solves these problems well enough
- Staff resist changing existing workflows
- Concurrent orders create inconsistent records
- Reservation conflicts if table availability isn't protected
- Payment state inconsistencies
- Inaccurate inventory due to wrong recipes or missing adjustments
- Data and permissions mishandled
- Production requires compliance work (tax, privacy, payments)

---

## 13. How to Validate

| Type | Method |
|---|---|
| Problem validation | Interview 3–5 restaurant operators |
| Workflow validation | Test with realistic scenarios including edge cases |
| Technical validation | Test duplicate submissions, concurrent reservations, payment failures |
| Usability validation | Ask users to complete core tasks on a prototype |
| Commercial validation | Seek pilot commitments before assuming subscription revenue |

---

## 14. Success Criteria (Proposed)

- Zero duplicate orders across 1,000 retry/re-submission tests
- Zero conflicting confirmed reservations for the same table and overlapping time
- Correct handling of successful, failed, pending, and refunded payments
- Kitchen order visible within 2 seconds under defined test conditions
- Inventory reconciles with configured recipes and recorded adjustments
- At least 4 out of 5 usability-test participants complete core workflows without coaching
- At least 3 interviewed operators agree to a concrete next step

These are targets to validate, not guarantees.

---

## 15. Confirmed Decisions

| Topic | Decision |
|---|---|
| Restaurant types | Full-service + cafés/QSRs |
| Initial deployment | Single restaurant |
| Long-term model | Multi-restaurant SaaS |
| Payment methods | Cash + online (including UPI) |
| Reservations | OTP verification + configurable deposit and no-show policy |
| Inventory | Basic inventory in MVP |
| Development approach | Complete all planning and design before implementation |

---

## 16. Open Questions (Need Answers)

These must be decided before detailed design begins:

1. How do pre-orders differ from table reservations and regular dine-in orders?
2. When does a customer pay, and when is an order considered settled?
3. How are multiple orders at one table grouped into a bill?
4. How do item cancellations and modifications affect kitchen tickets and inventory?
5. How do reservation holds, expiry, arrival windows, and table capacity work?
6. When do recipe-based inventory deductions happen?
7. How does the system behave during internet or device failures?
8. Which workflows are essential for the first pilot?

---

## 17. When is this document approved?

This document can be approved when:
- Problem hypotheses are reviewed
- Initial customer segment is agreed
- Product positioning and MVP boundaries are accepted
- Assumptions, risks, and validation criteria are reviewed

> **Important:** Approval of this document does NOT mean implementation can start. The detailed PRD, user workflows, UI structure, architecture, database design, API contracts, security plan, testing strategy, and implementation roadmap must all be reviewed and approved before coding begins.
