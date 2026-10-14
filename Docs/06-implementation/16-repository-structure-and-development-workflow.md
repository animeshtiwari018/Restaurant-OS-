# Repository Structure & Development Workflow

**Project:** Restaurant Operating System
**Document ID:** IMPL-016
**Status:** Draft
**Last Updated:** 2026-10-13

---

## 1. Purpose

Define the repository structure, module boundaries, development conventions, environment configuration, and Git workflow for this project.

The repo must be manageable for a solo developer while supporting reliable testing, independent module development, and future SaaS expansion.

---

## 2. Repository Strategy

**Decision:** Single Git repository containing frontend, backend, shared contracts, documentation, and database assets.

This keeps development and version control simple while the application is a modular monolith.

> Do NOT introduce separate repositories or microservices without a concrete requirement.

---

## 3. Proposed Repository Structure

```
restaurant-os/
├── apps/
│   ├── web/                         # Next.js frontend
│   │   ├── public/
│   │   └── src/
│   │       ├── app/                 # Routes, layouts, error boundaries
│   │       ├── components/          # Reusable UI components
│   │       ├── features/            # Feature-specific UI and logic
│   │       │   ├── menu/
│   │       │   ├── ordering/
│   │       │   ├── reservations/
│   │       │   ├── tables/
│   │       │   ├── kitchen/
│   │       │   ├── billing/
│   │       │   └── inventory/
│   │       ├── lib/                 # API clients, utilities, helpers
│   │       ├── hooks/
│   │       └── styles/
│   │
│   └── api/                         # Express backend
│       ├── src/
│       │   ├── app.ts
│       │   ├── server.ts
│       │   ├── config/
│       │   ├── middleware/
│       │   ├── common/
│       │   ├── modules/             # Business domain modules
│       │   │   ├── auth/
│       │   │   ├── restaurants/
│       │   │   ├── menu/
│       │   │   ├── tables/
│       │   │   ├── orders/
│       │   │   ├── kitchen/
│       │   │   ├── reservations/
│       │   │   ├── billing/
│       │   │   ├── payments/
│       │   │   ├── inventory/
│       │   │   └── reports/
│       │   ├── infrastructure/
│       │   │   ├── database/
│       │   │   ├── logging/
│       │   │   └── providers/
│       │   └── tests/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       └── package.json
│
├── packages/
│   └── contracts/                   # Shared API schemas and types
│
├── docs/                            # Planning and specification documents
│   ├── requirements/
│   ├── architecture/
│   ├── database/
│   ├── design/
│   ├── quality/
│   └── implementation/
│
├── tests/
│   └── e2e/                         # End-to-end tests
│
├── .github/
│   └── workflows/                   # CI/CD automation
├── .env.example                     # Placeholder env file (no real secrets)
├── .gitignore
├── package.json
└── README.md
```

> This is the proposed target structure. Add module folders as features are implemented — don't create everything upfront.

---

## 4. Frontend Organization

### `app/`
Routes, layouts, loading states, error boundaries, and route-level composition.

### `components/`
Reusable UI components not specific to any one business module.
Examples: buttons, dialogs, form controls, data tables, status badges, loading indicators.

### `features/`
Feature-specific UI, hooks, forms, and presentation logic.
A feature may have its own components if they are not genuinely reusable elsewhere.

### `lib/`
Shared infrastructure: API clients, formatting utilities, non-visual helpers.

### Frontend Rules
- Business-critical rules stay on the backend, not the frontend
- Treat all client-provided prices, totals, roles, and resource IDs as untrusted
- Don't duplicate the same UI logic across different ordering modes
- Provide consistent loading, empty, error, and conflict states
- Never put secrets in client-side environment variables

---

## 5. Backend Module Organization

Each module has a clear responsibility and consistent internal structure.

### Example Module Structure
```
modules/orders/
├── orders.routes.ts       # Endpoints and middleware
├── orders.controller.ts   # HTTP request/response translation
├── orders.service.ts      # Use cases and business operations
├── orders.repository.ts   # Database access
├── orders.schemas.ts      # Request validation (Zod)
├── orders.types.ts        # TypeScript types
└── orders.test.ts         # Tests
```

Small modules should remain small — not every file is needed in every module.

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| Routes | Declare endpoints and middleware |
| Controllers | Translate HTTP requests and responses |
| Services | Coordinate use cases and business operations |
| Domain logic | Enforce business rules and valid transitions |
| Repositories | Encapsulate database access |
| Schemas | Validate incoming requests |
| Tests | Verify behavior and invariants |

### Backend Rules
- Controllers must NOT contain complex business logic
- Business rules must NOT depend on HTTP request objects
- Database access must follow defined module boundaries
- Related database mutations must use explicit transaction boundaries
- External provider calls must NOT occur inside long-running database transactions
- Modules must NOT import another module's internal files arbitrarily
- All errors must flow through the application's consistent error-handling mechanism

---

## 6. Module Ownership

| Module | Owns |
|---|---|
| Authentication | Sessions, login, logout, credential verification |
| Restaurants | Restaurant profile, operational settings |
| Menu | Categories, items, modifiers, availability |
| Tables | Table records, QR access, service sessions |
| Orders | Order lifecycle, item snapshots, order history |
| Kitchen | Kitchen tickets, preparation states |
| Reservations | Availability, bookings, reservation history |
| Billing | Bills, bill items, adjustments, settlement rules |
| Payments | Payment attempts, provider events, refunds |
| Inventory | Ingredients, stock movements, stock balances |
| Reports | Read-only reporting and aggregation |

> A module can request an operation from another module through an explicit service interface. It must NOT directly manipulate another module's records.

---

## 7. Shared Contracts (`packages/contracts/`)

Contains shared API-related schemas and types that both frontend and backend need.

Examples:
- Request and response schemas
- Shared API error structures
- Enums exposed through the API
- Common pagination metadata

Rules:
- Do NOT share database models directly with the frontend
- Do NOT expose internal database fields just because they exist in Prisma
- Avoid circular dependencies
- Keep contracts independent of server-only libraries and secrets
- Always validate requests on the backend even if the frontend uses the same schema

---

## 8. Environment Configuration

Use separate environments for: local development, testing, staging, and production.

The `.env.example` file documents required variable names — never real credentials.

### Typical Environment Variables
```
NODE_ENV=
PORT=
DATABASE_URL=
SESSION_SECRET=
WEB_ORIGIN=
API_BASE_URL=
PAYMENT_PROVIDER_KEY=
PAYMENT_WEBHOOK_SECRET=
OTP_PROVIDER_KEY=
```

### Environment Rules
- Never commit populated `.env` files
- Validate required environment variables at application startup
- Fail clearly if required config is missing
- Use separate credentials for dev, staging, and production
- Keep payment and notification credentials server-side only
- Use test/sandbox credentials for demo flows
- Rotate compromised credentials immediately

---

## 9. Git Workflow

Simple branch strategy suitable for a solo developer.

### Branches
| Branch | Purpose |
|---|---|
| `main` | Stable, demonstrable application state |
| `feat/<short-description>` | New functionality |
| `fix/<short-description>` | Bug fixes |
| `docs/<short-description>` | Documentation-only changes |

### Examples
```
feat/menu-management
feat/order-lifecycle
feat/kitchen-display
fix/duplicate-order-submission
docs/api-contract-review
```

### Development Sequence
1. Start from the latest stable `main`
2. Create a branch for a focused change
3. Implement the smallest coherent unit of work
4. Run the relevant tests, linting, and type checks
5. Review the diff for: unrelated changes, secrets, accidental data exposure
6. Commit with a clear message
7. Merge only after the change satisfies its acceptance criteria

> For a solo project, pull requests are optional locally but useful for documenting significant changes.

---

## 10. Commit Conventions

Use concise commit messages describing the change.

```
feat: add menu item management
fix: prevent duplicate order creation
test: cover reservation concurrency
docs: define billing invariants
refactor: isolate payment provider handling
chore: configure automated checks
```

A commit should represent a coherent change. Don't mix unrelated features, formatting changes, and large refactors in one commit.

---

## 11. Code Quality Standards

Every change must follow these:

- TypeScript strict mode where practical
- Explicit request and response contracts
- Consistent error handling
- No hardcoded secrets
- No floating-point arithmetic for monetary calculations
- No unvalidated state transitions
- No unchecked cross-restaurant resource access
- Database migrations for all schema changes
- Automated tests for critical business behavior
- Clear naming, limited unnecessary abstraction

> Formatting and linting must be automated, not just enforced through manual review.

---

## 12. Repository Acceptance Criteria

The repository foundation is complete when:

- [ ] Frontend and backend have clear boundaries
- [ ] Backend modules have documented ownership
- [ ] Shared contracts do not expose internal database models
- [ ] Environment variables are validated at startup
- [ ] No secrets are committed to the repository
- [ ] Database migrations are version-controlled
- [ ] Git conventions are documented
- [ ] Automated quality checks are available
- [ ] A clean local setup is reproducible from the README
- [ ] The structure supports the approved MVP without unnecessary infrastructure
