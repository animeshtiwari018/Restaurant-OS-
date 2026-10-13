# Repository Structure & Development Workflow

**Project:** Restaurant Operating System  
**Document ID:** IMPL-016  
**Status:** Draft — Pending Review  
**Last Updated:** 2026-10-13

## 1. Purpose

Define the repository structure, module boundaries, development conventions, environment configuration, and Git workflow for the Restaurant Operating System.

The repository must remain understandable for a solo developer while supporting reliable testing, independent module development, and future SaaS expansion.

## 2. Repository Strategy

**Decision:** Use a single Git repository containing the frontend, backend, shared contracts, documentation, and database-related assets.

This keeps development and version control straightforward while the application is maintained as a modular monolith.

Use separate frontend and backend applications within the repository, but do not introduce separate repositories or microservices without a concrete requirement.

## 3. Proposed Repository Structure

```text
restaurant-os/
├── apps/
│   ├── web/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── menu/
│   │   │   │   ├── ordering/
│   │   │   │   ├── reservations/
│   │   │   │   ├── tables/
│   │   │   │   ├── kitchen/
│   │   │   │   ├── billing/
│   │   │   │   └── inventory/
│   │   │   ├── lib/
│   │   │   ├── hooks/
│   │   │   └── styles/
│   │   ├── tests/
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── app.ts
│       │   ├── server.ts
│       │   ├── config/
│       │   ├── middleware/
│       │   ├── common/
│       │   ├── modules/
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
│   └── contracts/
│       ├── src/
│       └── package.json
│
├── docs/
│   ├── requirements/
│   ├── architecture/
│   ├── database/
│   ├── design/
│   ├── quality/
│   └── implementation/
│
├── tests/
│   └── e2e/
│
├── .github/
│   └── workflows/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

This is the proposed target structure, not a requirement to create every directory immediately. Add module folders as the corresponding features are implemented.

## 4. Frontend Organization

The frontend uses Next.js with TypeScript.

### `app/`

Contains routes, layouts, loading states, error boundaries, and route-level composition.

### `components/`

Contains reusable presentation components that are not specific to one business module.

Examples include buttons, dialogs, form controls, data tables, status badges, and loading indicators.

### `features/`

Contains feature-specific UI, hooks, forms, and presentation logic.

A feature may contain its own components when those components are not genuinely reusable elsewhere.

### `lib/`

Contains shared infrastructure such as API clients, formatting utilities, and non-visual helpers.

### Frontend rules

- Keep business-critical rules on the backend.
- Treat all client-provided prices, totals, roles, and resource identifiers as untrusted input.
- Avoid duplicating the same UI logic across ordering modes.
- Provide consistent loading, empty, error, and conflict states.
- Do not place secrets in client-side environment variables.
- Use server-side rendering and client-side interaction according to actual page requirements rather than forcing every component into one rendering mode.

## 5. Backend Module Organization

Each backend module should have a clear responsibility and a consistent internal structure.

Example:

```text
modules/
└── orders/
    ├── orders.routes.ts
    ├── orders.controller.ts
    ├── orders.service.ts
    ├── orders.repository.ts
    ├── orders.schemas.ts
    ├── orders.types.ts
    └── orders.test.ts
```

Not every module needs every file. Small modules should remain small.

### Responsibilities

| Layer | Responsibility |
|---|---|
| Routes | Declare endpoints and middleware |
| Controllers | Translate HTTP requests and responses |
| Services | Coordinate use cases and business operations |
| Domain logic | Enforce business rules and valid transitions |
| Repositories | Encapsulate database access |
| Schemas | Validate incoming requests |
| Tests | Verify behavior and invariants |

### Backend rules

- Controllers must not contain complex business logic.
- Business rules must not depend on HTTP request objects.
- Database access must follow defined module boundaries.
- Related database mutations must use explicit transaction boundaries.
- External provider calls must not occur inside long-running database transactions.
- Modules must not import another module's internal files arbitrarily.
- All errors must flow through the application's consistent error-handling mechanism.

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

A module may request an operation from another module through an explicit service interface. It must not directly manipulate another module's records to bypass that module's business rules.

## 7. Shared Contracts

The `packages/contracts/` package contains shared API-related schemas and types when sharing them is useful and does not introduce inappropriate coupling.

Examples:

- Request and response schemas.
- Shared API error structures.
- Enumerations exposed through the API.
- Common pagination metadata.

Rules:

- Do not share database models directly with the frontend.
- Do not expose internal database fields simply because they exist in Prisma.
- Avoid circular dependencies.
- Keep contracts independent of server-only libraries and secrets.
- Validate requests again on the backend even when the frontend uses the same schema.

## 8. Environment Configuration

Use separate environment configurations for local development, testing, staging, and production.

The root `.env.example` should document required variable names without containing real credentials.

Typical variables may include:

```text
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

The exact variable names and required values must be finalized when the relevant providers and deployment environments are selected.

### Environment rules

- Never commit populated environment files.
- Validate required environment variables at application startup.
- Fail clearly when required configuration is missing.
- Use separate credentials for development, staging, and production.
- Keep payment and notification credentials server-side.
- Use test credentials for demonstration payment flows.
- Rotate compromised credentials immediately.

## 9. Git Workflow

Use a simple branch strategy appropriate for a solo developer.

### Branches

- `main`: Stable, demonstrable application state.
- `feat/<short-description>`: New functionality.
- `fix/<short-description>`: Bug fixes.
- `docs/<short-description>`: Documentation-only changes.

Examples:

```text
feat/menu-management
feat/order-lifecycle
feat/kitchen-display
fix/duplicate-order-submission
docs/api-contract-review
```

### Development sequence

1. Start from the latest stable `main`.
2. Create a branch for a focused change.
3. Implement the smallest coherent unit of work.
4. Run the relevant tests, linting, and type checks.
5. Review the diff for unrelated changes, secrets, and accidental data exposure.
6. Commit with a clear message.
7. Merge only after the change satisfies its acceptance criteria.

For a solo project, pull requests are optional locally but useful for documenting significant changes and preserving review discipline.

## 10. Commit Conventions

Use concise commit messages describing the change.

Recommended format:

```text
feat: add menu item management
fix: prevent duplicate order creation
test: cover reservation concurrency
docs: define billing invariants
refactor: isolate payment provider handling
chore: configure automated checks
```

A commit should represent a coherent change. Avoid mixing unrelated features, formatting changes, and large refactors in the same commit.

## 11. Code Quality Standards

Every change must follow these standards:

- TypeScript strict mode where practical.
- Explicit request and response contracts.
- Consistent error handling.
- No hardcoded secrets.
- No authoritative monetary calculations using floating-point arithmetic.
- No unvalidated state transitions.
- No unchecked cross-restaurant resource access.
- Database migrations for schema changes.
- Automated tests for critical business behavior.
- Clear naming and limited unnecessary abstraction.

Formatting and linting rules should be automated rather than enforced only through manual review.

## 12. Local Development Requirements

The development environment must provide:

- A supported Node.js LTS release.
- npm and a committed lockfile.
- PostgreSQL.
- Git.
- A TypeScript-compatible editor.
- Browser-based frontend testing.
- Environment configuration for the frontend and API.

The exact runtime versions must be pinned in the repository before implementation begins.

The README must explain:

1. Prerequisites.
2. Repository installation.
3. Environment setup.
4. Database creation and migrations.
5. Synthetic data seeding.
6. Starting the frontend and API.
7. Running tests and quality checks.
8. Troubleshooting common setup errors.

## 13. Repository Acceptance Criteria

The repository foundation is complete when:

- [ ] Frontend and backend have clear boundaries.
- [ ] Backend modules have documented ownership.
- [ ] Shared contracts do not expose internal database models.
- [ ] Environment variables are validated.
- [ ] No secrets are committed.
- [ ] Database migrations are version-controlled.
- [ ] Git conventions are documented.
- [ ] Automated quality checks are available.
- [ ] A clean local setup is reproducible from the README.
- [ ] The structure supports the approved MVP without unnecessary infrastructure.

