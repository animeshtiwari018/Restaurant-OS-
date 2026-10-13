# Development Environment & Local Setup

**Project:** Restaurant Operating System  
**Document ID:** IMPL-017  
**Status:** Draft — Pending Review  
**Last Updated:** 2026-10-13

## 1. Objective

Define a reproducible local development environment for the Restaurant Operating System so the frontend, backend, database, migrations, and tests can run consistently.

This document establishes the setup requirements and workflow. Exact dependency versions and commands must match the committed project configuration once the repository is initialized.

## 2. Required Software

| Software | Purpose |
|---|---|
| Node.js LTS | Frontend and backend runtime |
| npm | Dependency management |
| PostgreSQL | Relational database |
| Git | Version control |
| VS Code or equivalent | Development environment |
| Modern browser | UI development and testing |

Use compatible, supported versions of the selected technologies. Record the chosen Node.js version in the repository and commit the npm lockfile.

Docker may be used to run PostgreSQL locally, but it is not mandatory if PostgreSQL is already installed and configured.

## 3. Repository Setup

Clone the repository and open its root directory.

```bash
git clone <repository-url>
cd restaurant-os
```

Install dependencies using the repository's documented package-management strategy.

If the project uses npm workspaces, the root package configuration and lockfile should define the workspace packages. Install dependencies from the repository root rather than maintaining conflicting independent lockfiles.

Do not install dependencies before the repository structure and package configuration have been established.

## 4. Environment Configuration

Create local environment files from the committed examples.

The exact file locations depend on the final configuration. A possible arrangement is:

- Root `.env` for shared server-side development configuration.
- `apps/api/.env` for API-only configuration if required by the runtime.
- `apps/web/.env.local` for frontend-specific configuration.

Avoid duplicating the same variable across multiple files without a clear precedence rule.

### Required configuration categories

**Backend**
- Runtime environment.
- API port.
- PostgreSQL connection string.
- Session configuration.
- Allowed frontend origin.

**Frontend**
- Public API base URL.
- Any non-sensitive public configuration required by Next.js.

**External providers**
- Payment credentials.
- Payment webhook verification secret.
- OTP or notification provider credentials, if enabled.

All secrets must remain outside version control. Frontend-exposed environment variables must never contain server secrets.

## 5. Database Setup

PostgreSQL is the authoritative database for application state.

The local database must support:
- Version-controlled schema migrations.
- Transactional operations.
- Database constraints and indexes.
- Integration and concurrency testing.

### Initial setup procedure

1. Create a dedicated development database.
2. Configure the database connection string.
3. Verify that the application can connect.
4. Apply version-controlled migrations.
5. Seed synthetic demonstration data.
6. Verify that the application can read and write expected records.

Use a separate database or isolated schema strategy for tests. Automated tests must not accidentally modify development or production data.

### Migration rules

- Generate and review schema migrations.
- Apply migrations using the documented workflow.
- Never use production schema synchronization as a substitute for migrations.
- Test migrations against a clean database.
- Keep seed data repeatable and clearly separate from real customer information.

## 6. Application Startup

The development environment must provide documented commands for:

- Starting the frontend.
- Starting the backend API.
- Running database migrations.
- Seeding development data.
- Running unit and integration tests.
- Running end-to-end tests.
- Running linting and TypeScript checks.

The exact commands will be added to the root `package.json` and individual application package scripts during project initialization.

The API should expose a health endpoint that confirms application readiness. Database readiness should be checked separately or explicitly included in the readiness check.

The frontend must display a useful error state if the API is unavailable rather than failing silently.

## 7. Development Data

Use synthetic records for local development.

The initial seed dataset should include:

- One demonstration restaurant.
- Several menu categories and menu items.
- Multiple tables.
- Staff accounts with distinct roles.
- Representative orders in different lifecycle states.
- Kitchen tickets.
- Reservations in relevant states.
- Bills and test payment records.
- Ingredients and stock movements.

Seed data must be deterministic enough to support repeatable testing.

Development credentials must be documented only in local setup instructions and must never be reused as production credentials.

## 8. External Service Strategy

External providers should not be required for ordinary local development unless the feature specifically depends on them.

Where practical:

- Use payment-provider test mode.
- Use provider sandbox credentials.
- Mock external services in unit tests.
- Use controlled integration tests for provider-specific behavior.
- Keep production credentials separate from local configuration.

A successful mocked payment test must not be presented as evidence that a real payment provider integration works. Provider sandbox verification and production readiness are separate milestones.

## 9. Testing Environment

Tests must run against controlled, isolated data.

### Unit tests

Verify business rules, calculations, validation, and state transitions without requiring external services.

### Integration tests

Verify database behavior, transactions, authorization, idempotency, and module interactions.

### End-to-end tests

Verify important user workflows through the browser and API.

### Concurrency tests

Verify reservation capacity, duplicate order prevention, payment-event handling, and inventory consistency under simultaneous operations.

Integration and concurrency tests must use PostgreSQL rather than relying solely on an in-memory database or mocked persistence.

## 10. Troubleshooting Standards

Common setup failures should be documented in the README.

| Problem | Initial checks |
|---|---|
| Database connection fails | Verify PostgreSQL status, connection string, credentials, port, and database name |
| Migration fails | Review migration output and compare the local schema with migration history |
| API cannot start | Check runtime version, environment variables, dependency installation, and port conflicts |
| Frontend cannot reach API | Verify the API URL, API availability, CORS configuration, and browser network errors |
| Authentication fails locally | Check cookie settings, frontend/API origins, session storage, and session configuration |
| Tests affect each other | Check database isolation, cleanup, seed strategy, and shared mutable state |
| Payment test fails | Verify sandbox credentials, provider configuration, webhook verification, and provider logs |

Do not resolve setup problems by disabling authentication, removing database constraints, or weakening production security settings.

## 11. Environment Separation

Maintain distinct configurations for:

- **Development:** Local coding and debugging.
- **Testing:** Automated tests with isolated data.
- **Staging/demo:** Release validation and repeatable demonstrations.
- **Production:** Real restaurant operations, if launched.

Production data must not be copied into development or demonstration environments without a justified, secure, and appropriately anonymized process.

## 12. Definition of Done

The local development setup is complete when:

- [ ] A clean repository checkout can be installed using documented steps.
- [ ] Required environment variables are documented and validated.
- [ ] PostgreSQL can be initialized and migrated.
- [ ] Synthetic data can be seeded repeatably.
- [ ] Frontend and API start using documented commands.
- [ ] Automated tests run against isolated data.
- [ ] External provider dependencies are controlled.
- [ ] No credentials are committed to Git.
- [ ] Common setup failures have documented troubleshooting steps.

**Next document:** `docs/implementation/18-pre-implementation-review-and-sign-off.md` — perform a final consistency review of the planning documents, identify unresolved decisions that block development, and establish the formal criteria for beginning implementation.