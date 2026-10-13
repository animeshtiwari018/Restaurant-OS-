# Restaurant OS — Product Discovery

**Version:** 1.0  
**Date:** 13 October 2026  
**Status:** Draft — Pending Review

## 1. Product Overview

Restaurant OS is a restaurant operations platform designed to connect customer ordering, table management, kitchen operations, billing, reservations, and basic inventory within one integrated system.

The initial release will support a single restaurant while keeping future expansion into a multi-restaurant SaaS platform in mind.

The platform will support both full-service restaurants and cafés/quick-service restaurants (QSRs).

## 2. Problem Statement

Restaurants manage multiple connected workflows throughout the day. When ordering, kitchen preparation, table management, billing, and inventory operate through disconnected tools or manual processes, information can become inconsistent.

Potential consequences include:

- Incorrect or duplicated orders.
- Delayed communication between waiters and kitchen staff.
- Customers ordering unavailable items.
- Reservation conflicts and no-shows.
- Billing and payment discrepancies.
- Inaccurate ingredient stock records.
- Additional manual work for restaurant managers.

These are initial problem hypotheses and must be validated through operator interviews and realistic workflow simulations.

## 3. Product Vision

Build a reliable restaurant operating system that connects the complete dine-in journey through one consistent operational workflow.

The system should help restaurant staff coordinate their work, reduce avoidable mistakes, and provide customers with a smoother ordering and dining experience.

## 4. Target Users

### 4.1 Customers
- Browse menus and item availability.
- Place advance pre-orders.
- Order through table-specific QR codes.
- Reserve tables.
- Track order status.
- View bills and complete payments.

### 4.2 Waiters
- View table status.
- Create and manage dine-in orders.
- Record customer requests and item modifications.
- Monitor order readiness.
- Assist with billing and service.

### 4.3 Kitchen Staff
- Receive incoming kitchen tickets.
- View order items and preparation instructions.
- Update preparation status.
- Mark items or orders as ready.
- Identify delayed and cancelled items.

### 4.4 Cashiers
- Generate and review bills.
- Record cash payments.
- Reconcile online payments.
- Handle permitted payment adjustments and refunds.

### 4.5 Restaurant Administrators
- Manage menus, prices, and availability.
- Manage tables, QR codes, and reservations.
- Manage staff roles and permissions.
- Configure basic inventory and recipes.
- Review operational records and reports.

## 5. Initial Target Market

The first validation segment will be independent, owner-operated full-service restaurants with dine-in tables.

Cafés and QSRs will also be supported by the product vision, but their workflows will be validated separately before expanding the MVP.

Ideal initial customers:

- Operate a single outlet.
- Have recurring dine-in orders.
- Experience coordination between front-of-house and kitchen staff.
- Use manual processes or multiple disconnected tools.
- Are willing to demonstrate their existing workflow and evaluate a prototype.

## 6. Core Product Hypothesis

A single system connecting orders, tables, kitchen preparation, billing, reservations, and basic inventory can reduce duplicated work and improve operational consistency compared with the restaurant's existing workflow.

This hypothesis must be validated before assuming commercial demand.

## 7. Product Positioning

Restaurant OS is an integrated operational platform for independent restaurants and cafés.

Its proposed differentiation is not the individual availability of QR ordering, kitchen displays, billing, or inventory. Existing products already offer many of these features.

The differentiation to validate is the reliability and simplicity of the complete operational workflow.

Proposed differentiators:

- A consistent source of truth for orders and tables.
- Clear order lifecycle tracking.
- Reliable handling of concurrent orders and reservations.
- Connected kitchen and customer status updates.
- Recipe-based inventory deductions with traceable stock movements.
- Support for both QR-based and waiter-assisted ordering.

## 8. Business Model

The long-term business model is subscription-based SaaS.

Potential revenue streams:

1. Monthly or annual restaurant subscriptions.
2. Initial setup and onboarding services.
3. Advanced inventory, reporting, and multi-outlet features.

No final pricing decision has been made.

Pricing must be validated through customer interviews, competitive research, and pilot commitments.

## 9. Product Scope

### 9.1 Initial MVP

The initial MVP is intended to include:

- Single-restaurant configuration.
- Customer-facing digital menu.
- Menu categories, item modifiers, prices, and availability.
- Advance pre-ordering.
- QR-based at-table ordering.
- Waiter-assisted order creation.
- Table management.
- Basic reservation management with OTP verification.
- Configurable reservation deposit and no-show policies.
- Kitchen order display and preparation status.
- Billing and payment records.
- Cash and online payment support.
- Basic ingredient inventory and recipe-based stock deductions.
- Staff authentication and role-based access control.
- Operational history and audit records.

### 9.2 Deferred Features

The following are deferred until the core workflows are validated:

- Multi-restaurant administration.
- Subscription billing.
- Supplier management and purchase orders.
- Advanced procurement and accounting.
- Staff scheduling.
- Loyalty programs.
- Customer relationship management.
- Delivery fleet management.
- Native mobile applications.
- AI-powered forecasting.
- Deep third-party delivery marketplace integrations.

## 10. Technology Direction

The proposed technology stack is:

- Frontend: Next.js, React, TypeScript.
- Backend: Node.js, Express, TypeScript.
- Database: PostgreSQL.
- ORM: Prisma.
- Validation: Zod.
- Version control: Git and GitHub.

The initial architecture is expected to use a modular monolith. Final architecture decisions will be documented separately.

## 11. Key Assumptions

- Restaurant operators experience meaningful problems across disconnected workflows.
- A unified workflow can improve operational consistency.
- QR ordering is useful as an additional channel, not a replacement for waiter service.
- Basic inventory can provide useful visibility when recipes and stock movements are configured correctly.
- Operators may pay for measurable operational improvements.
- The system can support future multi-restaurant expansion without premature enterprise complexity.

Each assumption requires evidence before it can be considered validated.

## 12. Key Risks

- Scope creep may delay the MVP.
- Existing restaurant software may already solve the targeted problems.
- Staff may resist changing established workflows.
- Concurrent orders may create duplicate or inconsistent records.
- Reservations may conflict if table availability is not protected correctly.
- Payment states may become inconsistent with actual payment-provider records.
- Inventory accuracy may be undermined by incorrect recipes, wastage, or missing stock adjustments.
- Customer data and staff permissions may be mishandled.
- Production deployment may require additional tax, payment, privacy, and regulatory compliance work.

## 13. Validation Strategy

### Problem validation
Interview three to five restaurant operators or managers.

Document their current ordering, kitchen, billing, reservation, and inventory workflows.

### Workflow validation
Use realistic scenarios to test whether the proposed workflow handles ordinary operations and common exceptions.

### Technical validation
Test duplicate submissions, concurrent reservations, order modifications, payment failures, and stock reconciliation.

### Usability validation
Ask representative users to complete core tasks using a prototype and record completion rates, errors, and confusion.

### Commercial validation
Seek concrete pilot commitments and test willingness to pay before making assumptions about subscription revenue.

## 14. Initial Success Criteria

Proposed acceptance targets:

- Zero duplicate orders in a defined suite of 1,000 retry and repeated-submission tests.
- Zero conflicting confirmed reservations for the same table and overlapping booking intervals.
- Correct handling of successful, failed, pending, and refunded payment scenarios.
- Kitchen order visibility within two seconds under specified test conditions.
- Inventory reconciliation consistent with configured recipes and recorded adjustments.
- At least four out of five usability-test participants complete the assigned core workflow without coaching.
- At least three interviewed operators agree to a concrete next step toward a structured pilot.

These are proposed validation targets, not evidence of existing product performance.

## 15. Discovery Decisions

Confirmed product direction:

- Restaurant types: Full-service restaurants and cafés/QSRs.
- Initial deployment: Single restaurant.
- Long-term model: Multi-restaurant SaaS.
- Payment methods: Cash and online payments, including UPI.
- Reservations: OTP verification with configurable deposit and no-show policies.
- Inventory: Basic inventory included in the intended MVP.
- Development approach: Complete product planning and design before implementation.

## 16. Open Questions

The following require explicit decisions in the PRD and system design:

- How pre-orders differ from table reservations and ordinary dine-in orders.
- When customers pay and when an order is considered settled.
- How multiple orders at one table are grouped into a bill.
- How item cancellations and modifications affect kitchen tickets and inventory.
- How reservation holds, expiry, arrival windows, and table capacity work.
- When recipe-based inventory deductions occur.
- How the system behaves during internet or device failures.
- Which operational workflows are essential for the first pilot.

## 17. Exit Criteria

This document can be approved when the problem hypotheses, initial customer segment, product positioning, MVP boundaries, assumptions, risks, and validation criteria have been reviewed.

Implementation must not begin solely because this document exists. The detailed PRD, user workflows, UI structure, architecture, database design, API contracts, security plan, testing strategy, and implementation roadmap must also be reviewed and approved.
