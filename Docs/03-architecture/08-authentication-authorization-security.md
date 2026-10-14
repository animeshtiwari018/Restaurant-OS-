# Authentication, Authorization & Security Design

**Project:** Restaurant OS
**Document ID:** 08
**Version:** 0.1 — Draft
**Status:** Pending Review
**Applies to:** Next.js frontend, Express API, PostgreSQL, payment provider, OTP provider

---

## 1. Purpose

This document defines how Restaurant OS:
- Identifies users (authentication)
- Grants permissions (authorization)
- Protects restaurant data
- Manages guest access
- Responds to security threats

---

## 2. Security Objectives

### Confidentiality — Protect from unauthorized access:
- Customer contact details
- Staff accounts and permissions
- Orders and reservations
- Bills, payments, and refunds
- Inventory information
- Restaurant reports and audit history

### Integrity — Prevent unauthorized changes to:
- Menu prices and availability
- Order states and item quantities
- Reservation capacity and booking status
- Bill totals and payment status
- Stock movements and inventory balances
- Staff roles and restaurant settings

### Availability — Protect against:
- Automated OTP abuse
- Login brute-force attempts
- Request flooding
- Expensive or oversized requests
- Repeated webhook processing
- Resource exhaustion from invalid input

---

## 3. User Identity Model

### Staff Identity
Staff have authenticated accounts. Each identity contains:
- Staff user ID
- Account status (active/disabled)
- Assigned restaurant membership
- Granted roles and permissions
- Session/authentication metadata

**Rule:** Disabling an account must prevent future authorized operations AND invalidate active sessions.

### Customer Identity
This is an open product decision. Options:

| Option | Description |
|---|---|
| Registered accounts | Customers create an account |
| Optional accounts + guest checkout | Accounts are optional |
| Guest-first with phone verification | No accounts — use OTP for verification |

**For MVP:** Guest-first model reduces customer friction, but knowing an order number or phone number alone must NOT be enough to access someone else's order.

---

## 4. Authentication Design

> **Authentication = Who is making this request?**
> **Authorization = What is this identity allowed to do?**
> These two checks must remain separate.

### 4.1 Staff Login Flow

1. Staff submits login credentials
2. API validates the request
3. Server verifies credentials against the stored password hash
4. Server checks if the account is active
5. Server establishes an authenticated session
6. Client receives a minimal identity and permission context
7. Subsequent protected requests are authenticated through the session

**Rule:** Invalid login attempts must NOT reveal whether an email address exists.

### 4.2 Password Storage
- Passwords must NEVER be stored in plaintext or reversible form
- Use Argon2id (or equivalent established algorithm) with current security guidance
- Never log passwords
- Never return password hashes from APIs
- Rate-limit login attempts
- Revoke relevant sessions after credential changes or suspected account compromise

### 4.3 Staff Session Strategy

**Proposed:** Server-managed sessions using secure cookies.

Cookie requirements:
- `HttpOnly`
- `Secure` in production
- Appropriate `SameSite` setting
- Restricted cookie scope
- Expiration and rotation per approved session policy

Session identifiers must be unpredictable and treated as secrets.

The final design must specify: idle timeout, absolute lifetime, renewal behavior, logout behavior, and session revocation.

> If authentication uses cookies, state-changing requests must have CSRF protection. `SameSite` alone is not the entire CSRF strategy.
>
> Long-lived authentication tokens must NOT be stored in browser local storage.

### 4.4 Customer / Guest Authentication

Public menu browsing: no authentication required.

Actions that reveal private info or alter an order/reservation/payment: require an authenticated identity or approved limited capability.

Possible guest verification methods:
- OTP verification
- A short-lived signed capability
- A secure, unguessable access link

The final model must define: capability scope, expiry, revocation, whether it can be reused, whether it can authorize cancellations, and how access is recovered.

> A guest capability for viewing an order must NOT automatically authorize refunds, payment admin, or access to another table's orders.

---

## 5. Authorization Model

**RBAC (Role-Based Access Control)** with restaurant-level scoping.

Roles group permissions. The backend evaluates permissions for every protected operation.

### 5.1 Permission Catalog (Proposed)

| Permission | Description |
|---|---|
| `restaurant.read` | Read permitted restaurant configuration |
| `restaurant.update` | Update restaurant settings |
| `menu.read` | Read staff menu data |
| `menu.manage` | Create, update, publish, or archive menu items |
| `orders.read` | View authorized orders |
| `orders.create` | Create permitted orders |
| `orders.update` | Update permitted order fields |
| `orders.cancel` | Cancel orders when policy permits |
| `kitchen.read` | View authorized kitchen tickets |
| `kitchen.update` | Execute allowed kitchen transitions |
| `tables.read` | View table status |
| `tables.manage` | Open, update, and close permitted table sessions |
| `reservations.read` | View authorized reservations |
| `reservations.manage` | Manage reservations and check-ins |
| `billing.read` | Read authorized bills |
| `billing.manage` | Create and finalize bills |
| `payments.collect` | Record permitted payment collection |
| `payments.refund` | Request or approve permitted refunds |
| `inventory.read` | Read inventory records |
| `inventory.manage` | Record approved inventory changes |
| `staff.manage` | Manage staff memberships and roles |
| `reports.read` | Read authorized business reports |
| `audit.read` | Read permitted audit history |

### 5.2 Role-Permission Mapping (Suggested Defaults)

| Role | Main Access |
|---|---|
| Owner | Full restaurant administration, subject to system safeguards |
| Manager | Day-to-day operations, menu, reservations, reports, inventory |
| Cashier | Bills and permitted payment collection |
| Waiter | Table sessions and waiter-assisted orders |
| Kitchen Staff | Kitchen tickets and preparation states |
| Inventory Staff | Ingredient records and stock operations |
| Customer/Guest | Only explicitly authorized personal or guest resources |

> A cashier must NOT gain staff-management permission. Kitchen staff must NOT alter menu prices. Inventory staff must NOT mark a payment successful.

### 5.3 Server-Side Enforcement Rules

The backend must NEVER rely on:
- Hidden frontend buttons
- Client-supplied role names
- Client-supplied restaurant IDs without membership validation
- A resource ID alone as proof of authorization
- A previous successful auth check (must re-check each request)

> Every protected request must independently verify its authorization requirements.

---

## 6. Restaurant Data Isolation

Even though the first release supports one restaurant, data ownership must remain explicit.

Rules:
1. Restaurant-owned resources must be associated with a restaurant
2. Staff must have an authorized membership for the requested restaurant
3. The API must derive or validate restaurant scope from trusted identity (not from URL params alone)
4. A user must not access another restaurant by changing an ID in the URL or request body
5. Related records must be checked for consistent restaurant ownership
6. Background jobs and webhooks must resolve the correct restaurant context

> Automated tests must attempt cross-restaurant access using valid IDs from another restaurant.

---

## 7. QR Code Security

### QR Token Design
- QR code contains an opaque, unpredictable token
- Must NOT expose sensitive internal database IDs or unrestricted admin capabilities
- Backend stores a hash of the QR token (not the raw secret)

### QR Resolution Flow
1. Customer scans the code
2. App resolves the token
3. Server checks if the token is valid and active
4. Server returns limited restaurant and table context
5. Customer sees the menu and proceeds through approved guest-access workflow
6. Order submission revalidates the table context and session state

### QR Threat Controls
The design must address:
- Photographed or shared QR codes
- Replaced physical QR stickers
- Expired or revoked tokens
- Orders placed against a closed table session
- Attempts to access another table's session
- Automated order flooding

> A static table QR code is an entry point. It must NOT grant unrestricted access to all historical orders, bills, or customer info for that table.

---

## 8. OTP Security

Requirements:
- OTPs generated using a cryptographically secure source
- Codes expire after a short, defined period
- Verification attempts are limited
- Resend frequency is restricted
- Rate-limited by: phone number, IP address, and verification session
- A verified OTP cannot be reused for an unrelated operation
- OTP values must NEVER appear in logs, analytics, or error messages
- OTP storage uses an appropriate protected representation; deleted/invalidated when no longer needed

> Code length, expiry, retry limits, and provider selection must be recorded before release.

---

## 9. Order and Reservation Authorization

### Orders
- Customer can access only their own order (via authenticated identity or guest capability)
- Knowing an order number alone is NOT sufficient authorization
- Order cancellation must additionally check: current order state, whether preparation has begun, restaurant cancellation policy, and applicable payment/refund rules

### Reservations
- Restricted to the verified customer context or authorized restaurant staff
- Modification and cancellation validate the current state and relevant policy
- OTP verification does NOT automatically authorize access to every reservation associated with a phone number

### Resource Enumeration
- Identifiers should be unpredictable, but unguessable IDs alone do not replace authorization
- Avoid revealing sensitive resource existence through distinguishable error messages or timing

---

## 10. Payment and Refund Security

### Payment Initiation
- Backend calculates the amount from authoritative bill data
- Must NOT trust client-provided amount, currency, discount, tax, or total

### Payment Confirmation
A payment must NOT be marked successful merely because:
- Browser returns to a success page
- Frontend submits a success flag
- Customer shares a transaction screenshot
- An unsigned provider callback is received

Online payment confirmation must rely on verified provider events or server-to-server verification.

### Webhook Controls
Payment webhooks must:
- Validate the provider signature
- Use the correct secret for the configured environment
- Reject invalid or malformed events
- Deduplicate provider event IDs
- Handle repeated and out-of-order events safely
- Persist processing outcomes
- Avoid leaking sensitive data in logs

### Refunds
- Separate, auditable operations
- Backend validates: refund eligibility, amount, original payment, user permission, and provider requirements
- Refund amount must NOT exceed the permitted refundable balance

### Cash Payments
- A staff-recorded business event, not an online provider event
- API records: who recorded it, when, the amount, and the relevant bill reference
- Corrections are auditable, not silent overwrites

---

## 11. Input Validation and Injection Prevention

All incoming data must be treated as untrusted.

The backend must:
- Validate payloads with explicit schemas (Zod)
- Use parameterized database operations (Prisma ORM)
- Reject malformed identifiers and invalid enum values
- Limit request body sizes
- Limit array lengths and pagination sizes
- Encode output appropriately for its destination
- Never execute client-supplied SQL, commands, templates, or arbitrary expressions

> Frontend validation improves usability but is NOT a security boundary.

---

## 12. CSRF, CORS, and Browser Security

### CSRF
If authentication uses cookies, state-changing endpoints must have documented CSRF defense:
- CSRF tokens where required
- SameSite cookie settings
- Origin or Referer validation where appropriate

**Rule:** GET requests must NOT perform state-changing operations.

### CORS
- Allow only approved frontend origins in deployed environments
- Never combine unrestricted origins with credentialed requests
- Development origins must be configured separately from production

### Security Headers
Apply in deployment:
- Content Security Policy (CSP)
- Frame restrictions
- Content-type protections
- Transport security (HTTPS/HSTS) in production

---

## 13. Rate Limiting

Apply rate limits to these high-priority endpoints:

| Endpoint | Risk |
|---|---|
| Staff login and password recovery | Brute force |
| OTP request and verification | Abuse |
| Reservation availability and creation | Flooding |
| Public QR token resolution | Enumeration |
| Guest order creation | Automated abuse |
| Payment initiation | Fraud |
| Refund requests | Financial risk |
| Expensive search/report endpoints | Resource exhaustion |

- Rate limiting may combine: identity, IP address, restaurant scope, and operation-specific counters
- Behind proxies: client IP handling must be configured safely (no bypass via forged forwarded headers)
- Return `429 RATE_LIMIT_EXCEEDED` with a `Retry-After` header where appropriate

---

## 14. Audit Logging

Audit trail required for:
- Staff login security events
- Role and permission changes
- Menu price and availability changes
- Order cancellation and exceptional state changes
- Bill finalization and corrections
- Payment collection and refund operations
- Reservation overrides
- Inventory adjustments and waste movements
- Restaurant security-setting changes

Each audit record captures:

| Field | Notes |
|---|---|
| Event ID | Unique identifier |
| Timestamp | UTC |
| Restaurant context | |
| Actor or system source | Who/what triggered it |
| Action type | What was done |
| Target resource type + ID | What was affected |
| Outcome | Success or failure |
| Reason | Where required |
| Sanitized metadata | No passwords, OTPs, session secrets, or payment credentials |

> Ordinary users must NOT be able to edit or delete audit records through the application API.

---

## 15. Secrets and Environment Management

Secrets include: database credentials, session signing secrets, OTP credentials, payment credentials, webhook signing secrets.

Rules:
1. Secrets must NOT be committed to Git
2. Local dev uses an ignored `.env` file or approved secret mechanism
3. `.env.example` documents variable names only — no real values
4. Production secrets use a managed/deployment-provided secret store
5. Separate credentials for development and production
6. Rotate secrets per risk and provider capabilities
7. Logs and error messages must NOT expose secret values
8. Compromised credentials must be revocable without system-wide disruption

---

## 16. Data Protection and Retention

Collect only what the product needs.

Define retention rules for:
- Customer contact details
- OTP verification records
- Staff sessions
- Payment event payloads
- Audit logs
- Idempotency records
- Order and billing history
- Reservation history

> Financial and audit records may need longer retention than temporary auth records.
> Deletion/anonymization must respect legal, accounting, and dispute-resolution requirements.

---

## 17. Security Incident Handling

The operational plan must cover:

1. Detecting suspicious authentication or payment activity
2. Identifying affected accounts and resources
3. Revoking compromised sessions or capabilities
4. Rotating affected secrets
5. Preserving relevant audit evidence
6. Restricting unsafe operations if necessary
7. Restoring service safely
8. Reviewing root cause and implementing corrective actions

> For MVP minimum: the owner must have a documented process for disabling staff accounts, rotating credentials, and responding to suspected payment fraud.

---

## 18. Security Testing Plan

### Authentication Tests
- [ ] Invalid credentials do not create a session
- [ ] Disabled staff accounts cannot authenticate
- [ ] Logout invalidates the relevant session
- [ ] Expired sessions cannot access protected endpoints
- [ ] Rate limits prevent uncontrolled login attempts

### Authorization Tests
- [ ] Kitchen staff cannot change menu prices
- [ ] Waiters cannot manage staff roles
- [ ] Cashiers cannot perform unauthorized refunds
- [ ] Customers cannot access another customer's orders
- [ ] Staff cannot access another restaurant's resources
- [ ] Changing an ID in a request does not bypass authorization

### QR and OTP Tests
- [ ] Invalid or revoked QR tokens are rejected
- [ ] QR access does not expose historical table data
- [ ] Expired OTPs are rejected
- [ ] OTP attempt limits are enforced
- [ ] A verified OTP cannot be reused for an unrelated operation

### Payment Tests
- [ ] A client cannot mark a payment successful
- [ ] An invalid webhook signature is rejected
- [ ] Repeated webhooks do not duplicate payment effects
- [ ] Refund limits are enforced
- [ ] Unauthorized staff cannot issue refunds

### Input and Abuse Tests
- [ ] Invalid payloads are rejected
- [ ] SQL injection attempts do not alter database behavior
- [ ] Oversized requests are rejected
- [ ] Rate limits apply to sensitive endpoints
- [ ] Error responses do not reveal stack traces or secrets

---

## 19. Security Acceptance Criteria

The security design is ready for implementation approval when:

- [ ] Staff and customer identity models are defined
- [ ] Staff session mechanism and lifecycle are approved
- [ ] Guest-access model is approved
- [ ] Role-permission matrix is finalized
- [ ] Restaurant-level isolation rules are documented
- [ ] QR token creation, validation, expiry, and revocation are defined
- [ ] OTP expiry and abuse controls are defined
- [ ] Payment confirmation and refund authorization rules are defined
- [ ] CSRF, CORS, and session protection are specified
- [ ] Sensitive endpoints have rate-limit policies
- [ ] Audit logging requirements are documented
- [ ] Secret management and data-retention policies are established
- [ ] Cross-user and cross-restaurant authorization tests are planned

---

## 20. Open Decisions

| # | Decision |
|---|---|
| 1 | Will customers have accounts in MVP, or use guest-first access? |
| 2 | Will staff authentication use server-managed sessions throughout? |
| 3 | What are the idle and absolute session lifetimes? |
| 4 | Which OTP and SMS provider will be used? |
| 5 | OTP length, expiry, retry, and resend limits? |
| 6 | Will table QR codes be static, revocable, or periodically rotated? |
| 7 | Which online payment provider will be integrated first? |
| 8 | Which refunds require managerial approval? |
| 9 | Which staff actions require mandatory reasons or additional confirmation? |
| 10 | What audit and financial-data retention periods apply? |
| 11 | Which deployment platform and secret-management mechanism will be used? |
| 12 | Is multi-factor authentication needed for owners/managers in the first release? |

> Each decision must be recorded before the affected feature is implemented.

---

**Next document:** 09 — Business Rules, State Machines & Transaction Invariants
