# Development Environment & Local Setup

**Project:** Restaurant Operating System
**Document ID:** IMPL-017
**Status:** Draft
**Last Updated:** 2026-10-13

---

## 1. Objective

Define a reproducible local development environment so the frontend, backend, database, migrations, and tests can all run consistently.

> Exact dependency versions and commands must match the committed project configuration once the repository is initialized.

---

## 2. Required Software

| Software | Purpose |
|---|---|
| Node.js LTS | Frontend and backend runtime |
| npm | Dependency management |
| PostgreSQL | Relational database |
| Git | Version control |
| VS Code (or equivalent) | Development editor |
| Modern browser | UI development and testing |

- Record the chosen Node.js version in the repository
- Commit the npm lockfile
- Docker may be used to run PostgreSQL locally but is not mandatory

---

## 3. Repository Setup

```bash
git clone <repository-url>
cd restaurant-os
npm install  # Install all workspace dependencies from root
```

If the project uses npm workspaces, install from the root — don't maintain separate conflicting lockfiles.

> Do not install dependencies before the repository structure and package configuration are established.

---

## 4. Environment Configuration

Create local environment files from the committed examples.

### Possible File Arrangement
| File | Purpose |
|---|---|
| Root `.env` | Shared server-side development config |
| `apps/api/.env` | API-only config if required by runtime |
| `apps/web/.env.local` | Frontend-specific config |

Avoid duplicating the same variable across multiple files without a clear precedence rule.

### Required Configuration Categories

**Backend:**
- Runtime environment (`NODE_ENV`)
- API port
- PostgreSQL connection string
- Session configuration
- Allowed frontend origin (CORS)

**Frontend:**
- Public API base URL
- Any non-sensitive public config required by Next.js

**External Providers:**
- Payment provider credentials (test/sandbox)
- Payment webhook verification secret
- OTP/notification provider credentials (if enabled)

> All secrets must remain outside version control. Frontend environment variables must NEVER contain server secrets.

---

## 5. Database Setup

### Initial Setup Procedure
1. Create a dedicated development database
2. Configure the database connection string in `.env`
3. Verify the application can connect
4. Apply version-controlled migrations
5. Seed synthetic demonstration data
6. Verify the application can read and write expected records

Use a separate database or isolated schema for tests. Automated tests must NOT modify development data.

### Migration Rules
- Generate and review schema migrations before applying
- Apply migrations using the documented workflow (`npx prisma migrate dev`)
- Never use `prisma db push` as a substitute for versioned migrations in production
- Test migrations against a clean database
- Keep seed data repeatable and clearly separate from real customer data

---

## 6. Application Startup Commands

The following commands will be added to `package.json` during project initialization:

| Command | Purpose |
|---|---|
| `npm run dev:web` | Start the frontend in development mode |
| `npm run dev:api` | Start the backend API in development mode |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed development data |
| `npm test` | Run unit and integration tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Run linting |
| `npm run typecheck` | Run TypeScript type checks |

The API must expose a `/health` endpoint that confirms application readiness.

The frontend must display a useful error state if the API is unavailable — not just fail silently.

---

## 7. Development Data (Seed Data)

Use synthetic records only. Never use real customer data.

The initial seed dataset includes:
- One demonstration restaurant
- Several menu categories and items (some available, some not)
- Multiple tables with different capacities
- Staff accounts with distinct roles (admin, waiter, kitchen, cashier)
- Representative orders in different lifecycle states
- Kitchen tickets
- Reservations in relevant states (confirmed, pending, cancelled)
- Bills with outstanding and settled balances
- Ingredients and stock movements

> Seed data must be deterministic enough to support repeatable testing. Development credentials must never be reused as production credentials.

---

## 8. External Service Strategy

External providers should not be required for ordinary local development.

| Provider Type | Local Strategy |
|---|---|
| Payment provider | Use test/sandbox mode with test credentials |
| OTP provider | Use configured test mode or mock |
| Unit tests | Mock external services |
| Integration tests | Use controlled, provider-specific test configs |

> A successful mocked payment test does NOT prove the real payment integration works. Provider sandbox verification and production readiness are separate milestones.

---

## 9. Testing Environment

Tests must run against controlled, isolated data.

| Test Type | What it tests |
|---|---|
| Unit tests | Business rules, calculations, validation, and state transitions — no external services needed |
| Integration tests | Database behavior, transactions, authorization, idempotency, and module interactions |
| End-to-end tests | Important user workflows through the browser and API |
| Concurrency tests | Reservation capacity, duplicate order prevention, payment-event handling, and inventory consistency under simultaneous operations |

> Integration and concurrency tests must use PostgreSQL — not an in-memory database or mocked persistence.

---

## 10. Troubleshooting Common Setup Issues

| Problem | What to check |
|---|---|
| Database connection fails | PostgreSQL status, connection string, credentials, port, database name |
| Migration fails | Migration output, local schema vs. migration history |
| API cannot start | Node.js version, environment variables, dependency installation, port conflicts |
| Frontend cannot reach API | API URL, API availability, CORS configuration, browser network errors |
| Authentication fails locally | Cookie settings, frontend/API origins, session storage, session configuration |
| Tests affect each other | Database isolation, cleanup strategy, seed strategy, shared mutable state |
| Payment test fails | Sandbox credentials, provider configuration, webhook verification, provider logs |

> Do NOT resolve setup problems by disabling authentication, removing database constraints, or weakening security settings.

---

## 11. Environment Separation

| Environment | Purpose |
|---|---|
| Development | Local coding and debugging |
| Testing | Automated tests with isolated data |
| Staging/demo | Release validation and repeatable demonstrations |
| Production | Real restaurant operations (when launched) |

> Production data must NOT be copied into development or demo environments without a justified, secure, and appropriately anonymized process.

---

## 12. Definition of Done

The local development setup is complete when:

- [ ] A clean repository checkout can be installed using documented steps
- [ ] Required environment variables are documented and validated at startup
- [ ] PostgreSQL can be initialized and migrated
- [ ] Synthetic data can be seeded repeatably
- [ ] Frontend and API start using documented commands
- [ ] Automated tests run against isolated data
- [ ] External provider dependencies are controlled (test mode or mocked)
- [ ] No credentials are committed to Git
- [ ] Common setup failures have documented troubleshooting steps
