# Document 08 — Authentication, Authorization & Security Design

**Project:** Restaurant OS  
**Document Type:** Security Architecture  
**Version:** 0.1 — Draft  
**Status:** Proposed; pending review  
**Applies to:** Next.js frontend, Express API, PostgreSQL, payment provider, OTP provider, and real-time services

---

## 1. Purpose

This document defines how Restaurant OS identifies users, grants permissions, protects restaurant data, manages guest access, and responds to security threats.

The security design must support:

- Restaurant owners and managers.
- Cashiers, waiters, kitchen staff, and inventory staff.
- Customers placing pre-orders.
- Customers ordering through table QR codes.
- Customers making and managing reservations.
- Online and cash payments.
- Future SaaS operation with multiple restaurants.

The first release will operate for one restaurant, but its security model must not assume that every future user belongs to the same business.

## 2. Security Objectives

The system must protect the confidentiality, integrity, and availability of restaurant operations.

### 2.1 Confidentiality

Prevent unauthorized access to:

- Customer contact details.
- Staff accounts and permissions.
- Orders and reservations.
- Bills, payment records, and refunds.
- Supplier and inventory information.
- Restaurant-specific reports and audit history.

### 2.2 Integrity

Prevent unauthorized or accidental changes to:

- Menu prices and published availability.
- Order states and item quantities.
- Reservation capacity and booking status.
- Bill totals and payment status.
- Stock movements and inventory balances.
- Staff roles and restaurant settings.

### 2.3 Availability

Protect public and operational endpoints against:

- Automated OTP abuse.
- Login brute-force attempts.
- Request flooding.
- Expensive or excessively large requests.
- Repeated webhook processing.
- Resource exhaustion caused by invalid or malicious input.

## 3. User Identity Model

Restaurant OS has two broad identity categories.

### 3.1 Staff identity

Staff members have authenticated accounts.

A staff identity should contain:

- Staff user ID.
- Account status.
- Assigned restaurant membership.
- Granted roles and permissions.
- Session or authentication metadata.

Staff access must be revocable. Disabling an account must prevent future authorized operations and invalidate or revoke its active sessions according to the session policy.

### 3.2 Customer identity

Customer identity is a product decision that remains open.

Potential models:

1. Registered customer accounts.
2. Optional accounts plus guest checkout.
3. Guest-first access using verified phone numbers and secure, limited capabilities.

For MVP, a guest-first model may reduce customer friction, but it must not allow someone to access another person's order merely by knowing an order number or phone number.

A verified phone number is evidence of control over that number at a particular time; it is not permanent proof of identity.

## 4. Authentication Design

Authentication answers: **Who is making this request?**

Authorization answers: **What is this identity allowed to do?**

The two checks must remain separate.

### 4.1 Staff login

Proposed login flow:

1. Staff submits login credentials.
2. The API validates the request.
3. The server verifies the credentials against the stored password hash.
4. The server checks whether the account is active.
5. The server establishes an authenticated session.
6. The client receives a minimal identity and permission context.
7. Subsequent protected requests are authenticated through the session mechanism.

Invalid login attempts must not reveal whether an email address exists.

### 4.2 Password storage

Passwords must never be stored in plaintext or reversible form.

Use an established password-hashing algorithm such as Argon2id, configured according to current security guidance.

Additional rules:

- Never log passwords.
- Never return password hashes from APIs.
- Rate-limit login attempts.
- Support password changes and account recovery through a verified workflow.
- Revoke relevant sessions after credential changes or suspected account compromise.

The implementation must use a maintained library rather than a custom hashing implementation.

### 4.3 Staff session strategy

**Proposed default:** server-managed sessions using secure cookies for the browser-based staff interface.

Cookie requirements:

- `HttpOnly`.
- `Secure` in production.
- An appropriate `SameSite` setting.
- Restricted cookie scope.
- Expiration and rotation according to the approved session policy.

Session identifiers must be unpredictable and treated as secrets.

The final design must specify idle timeout, absolute lifetime, renewal behavior, logout behavior, and session revocation.

If authentication is implemented using cookies, state-changing requests must have appropriate CSRF protection. `SameSite` alone should not be treated as the entire CSRF strategy.

Long-lived authentication tokens must not be stored in browser local storage by default.

### 4.4 Customer and guest authentication

Public menu browsing does not require authentication.

Actions that reveal private information or alter an order, reservation, or payment require an authenticated identity or an approved limited capability.

Possible guest verification methods include:

- OTP verification.
- A short-lived signed capability.
- A secure, unguessable access link.

The final model must specify:

- Capability scope.
- Expiry.
- Revocation.
- Whether it can be reused.
- Whether it can authorize cancellation or changes.
- How access is recovered after losing the original browser session.

A guest capability for viewing an order must not automatically authorize refunds, payment administration, or access to another table's orders.

## 5. Authorization Model

Authorization will use **role-based access control (RBAC)** with restaurant-level scoping.

Roles group permissions. The backend evaluates permissions for every protected operation.

### 5.1 Proposed permission catalog

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

These permissions are proposed and must be reconciled with the product requirements.

### 5.2 Role-permission mapping

Initial suggested defaults:

| Role | Main access |
|---|---|
| Owner | Full restaurant administration, subject to system safeguards |
| Manager | Day-to-day operations, permitted menu, reservations, reports, and inventory |
| Cashier | Bills and permitted payment collection |
| Waiter | Table sessions and waiter-assisted orders |
| Kitchen Staff | Kitchen tickets and preparation states |
| Inventory Staff | Ingredient records and stock operations |
| Customer/Guest | Only explicitly authorized personal or guest resources |

This is a starting point, not the final authorization matrix.

A cashier must not automatically gain staff-management permission. Kitchen staff must not be able to alter menu prices. Inventory staff must not be able to mark an online payment successful.

### 5.3 Server-side enforcement

The backend must never rely on:

- Hidden frontend buttons.
- Client-supplied role names.
- Client-supplied restaurant IDs without membership validation.
- A resource ID alone as proof of authorization.
- A previous successful authorization check when the permission or resource state may have changed.

Every protected request must independently verify its authorization requirements.

## 6. Restaurant Data Isolation

The application must be designed for eventual multi-restaurant SaaS operation.

For the initial release, only one restaurant may be active, but restaurant ownership must remain explicit in the data and authorization model.

Rules:

1. Restaurant-owned resources must be associated with a restaurant.
2. Staff must have an authorized membership for the requested restaurant.
3. The API must derive or validate restaurant scope from trusted identity and resource relationships.
4. A user must not gain access to another restaurant by changing an ID in the URL or request body.
5. Related records must be checked for consistent restaurant ownership.
6. Background jobs and webhooks must resolve the correct restaurant context.
7. Administrative operations must follow a separately approved system-level authorization model.

Automated tests must attempt cross-restaurant access using valid IDs belonging to another restaurant.

## 7. QR Code Security

QR codes are an important entry point for at-table ordering and therefore need their own security controls.

### 7.1 QR token design

A QR code should contain an opaque, unpredictable token or a URL containing such a token.

It should not expose sensitive internal database identifiers or unrestricted administrative capabilities.

The backend should store a hash of the QR token where feasible, rather than the raw reusable secret.

### 7.2 QR resolution flow

1. Customer scans the code.
2. The application resolves the token.
3. The server checks whether the token is valid and active.
4. The server returns limited restaurant and table context.
5. The customer sees the menu and can proceed through the approved guest-access workflow.
6. Order submission revalidates the table context and session state.

### 7.3 QR threat controls

The design must address:

- Photographed or shared QR codes.
- Replaced physical QR stickers.
- Expired or revoked tokens.
- Orders placed against a closed table session.
- Attempts to access another table's session.
- Automated order flooding.

A static table QR code identifies an entry point; it must not by itself grant unrestricted access to all historical orders, bills, or customer information associated with that table.

Rotating QR codes may be considered later if the threat model and operational cost justify them.

## 8. OTP Security

OTP verification may be used for reservations or other approved customer verification flows.

Requirements:

- OTPs must be generated using a cryptographically secure source.
- Codes must expire after a short, defined period.
- Verification attempts must be limited.
- Resend frequency must be restricted.
- Requests must be rate-limited by relevant factors such as phone number, IP address, and verification session.
- Successful verification must be bound to the intended purpose and target identity.
- A verification record must not be reusable for unrelated operations.
- OTP values must never appear in ordinary logs, analytics, or error messages.
- OTP storage should use an appropriate protected representation and be deleted or invalidated when no longer needed.

The precise code length, expiry, retry limits, and provider are implementation decisions to be recorded before release.

## 9. Order and Reservation Authorization

### 9.1 Orders

A customer may access only an order authorized by their authenticated identity or guest capability.

The system must not treat knowledge of an order number as sufficient authorization.

Order cancellation must additionally check:

- Current order state.
- Whether preparation has begun.
- Restaurant cancellation policy.
- Applicable payment and refund rules.

Staff actions must be restricted by restaurant membership and permission.

### 9.2 Reservations

Reservation access must be restricted to the verified customer context or authorized restaurant staff.

Reservation modification and cancellation must validate the current state and the relevant policy.

OTP verification does not automatically authorize access to every reservation associated with a phone number.

### 9.3 Resource enumeration

Identifiers should be unpredictable, but unguessable IDs alone do not replace authorization.

The API must avoid revealing sensitive resource existence through distinguishable error messages or timing where practical.

## 10. Payment and Refund Security

Payment handling must follow a strict trust boundary.

### 10.1 Payment initiation

The backend must calculate the amount from authoritative bill data.

It must not trust a client-provided amount, currency, discount, tax value, or final bill total.

### 10.2 Payment confirmation

A payment must not be marked successful merely because:

- The browser returns to a success page.
- The frontend submits a success flag.
- The customer shares a transaction screenshot.
- An unsigned provider callback is received.

Online payment confirmation must rely on verified provider events or an approved server-to-server verification mechanism.

### 10.3 Webhook controls

Payment webhooks must:

- Validate the provider signature.
- Use the correct secret for the configured environment.
- Reject invalid or malformed events.
- Deduplicate provider event IDs.
- Handle repeated and out-of-order events safely.
- Persist processing outcomes.
- Avoid leaking sensitive data in logs.

### 10.4 Refunds

Refunds must be separate, auditable operations.

The backend must validate refund eligibility, amount, original payment, user permission, and provider requirements.

The system must not allow a refund amount greater than the permitted refundable balance.

For high-risk operations, an approval or separation-of-duties policy may be appropriate. Whether dual approval is necessary for MVP remains open.

### 10.5 Cash payments

Cash collection is a staff-recorded business event, not an online provider event.

The API must record who recorded the collection, when it occurred, the amount, and the relevant bill or payment reference.

Corrections must be auditable rather than silently overwriting historical financial records.

## 11. Input Validation and Injection Prevention

All incoming data must be considered untrusted.

The backend must:

- Validate payloads with explicit schemas.
- Use parameterized database operations through the approved persistence layer.
- Reject malformed identifiers and invalid enum values.
- Limit request body sizes.
- Limit array lengths and pagination sizes.
- Validate file uploads if they are introduced.
- Normalize data only where the business contract requires it.
- Encode output appropriately for its destination.
- Avoid executing client-supplied SQL, commands, templates, or arbitrary expressions.

Frontend validation improves usability but is not a security boundary.

## 12. CSRF, CORS, and Browser Security

### 12.1 CSRF

If browser authentication relies on cookies, state-changing endpoints must have a documented CSRF defense.

The final implementation should select and test an appropriate combination of:

- CSRF tokens where required.
- SameSite cookie settings.
- Origin or Referer validation where appropriate.
- Strict state-changing endpoint behavior.

GET requests must not perform state-changing operations.

### 12.2 CORS

CORS must allow only the approved frontend origins in deployed environments.

The server must not combine unrestricted origins with credentialed requests.

Development origins must be configured separately from production origins.

### 12.3 Security headers

The deployment should apply suitable security headers, including an appropriate Content Security Policy, frame restrictions, content-type protections, and transport security in production.

Header settings must be tested against the actual frontend architecture and external integrations.

## 13. Rate Limiting and Abuse Prevention

Rate limits should be applied according to endpoint risk and expected legitimate usage.

High-priority targets include:

- Staff login and password recovery.
- OTP request and verification.
- Reservation availability and creation.
- Public QR token resolution.
- Guest order creation.
- Payment initiation.
- Refund requests.
- Search and report endpoints that may be computationally expensive.

Rate limiting may use a combination of identity, IP address, restaurant scope, and operation-specific counters.

Behind proxies, client IP handling must be configured safely so attackers cannot bypass limits by forging forwarded headers.

Responses must use a consistent `429 RATE_LIMIT_EXCEEDED` error and, where appropriate, a `Retry-After` header.

Limits must be configurable and monitored to avoid blocking normal restaurant operations.

## 14. Audit Logging

The application must maintain a protected audit trail for important actions, including:

- Staff login security events.
- Role and permission changes.
- Menu price and availability changes.
- Order cancellation and exceptional state changes.
- Bill finalization and corrections.
- Payment collection and refund operations.
- Reservation overrides.
- Inventory adjustments and waste movements.
- Restaurant security-setting changes.

Audit records should capture:

- Event ID.
- Timestamp.
- Restaurant context.
- Actor or system source.
- Action type.
- Target resource type and ID.
- Outcome.
- Reason where required.
- Relevant sanitized metadata.

Audit records must not contain passwords, OTP values, session secrets, or payment credentials.

Ordinary users must not be able to edit or delete audit records through the application API.

## 15. Secrets and Environment Management

Secrets may include:

- Database credentials.
- Session signing or encryption secrets.
- OTP provider credentials.
- Payment provider credentials.
- Webhook signing secrets.
- Email or SMS service credentials.

Requirements:

1. Secrets must not be committed to Git.
2. Local development must use an ignored environment file or another approved secret mechanism.
3. A safe example environment file may document variable names without real values.
4. Production secrets must use an appropriate managed or deployment-provided secret store.
5. Separate credentials must be used for development and production.
6. Secrets must be rotated according to risk and provider capabilities.
7. Logs and error messages must not expose secret values.
8. Compromised credentials must be revocable without unnecessary system-wide disruption.

The exact deployment platform and secret-management mechanism remain to be selected.

## 16. Data Protection and Retention

Personal data collection must be limited to what the product needs.

The system must define retention rules for:

- Customer contact details.
- OTP verification records.
- Staff sessions.
- Payment event payloads.
- Audit logs.
- Idempotency records.
- Order and billing history.
- Reservation history.

Financial and audit records may need longer retention than temporary authentication records.

Deletion or anonymization must respect applicable legal, accounting, operational, and dispute-resolution requirements.

The system should avoid retaining complete external-provider payloads when a minimal verified event record is sufficient.

## 17. Security Incident Handling

The operational plan must cover:

1. Detecting suspicious authentication or payment activity.
2. Identifying affected accounts and resources.
3. Revoking compromised sessions or capabilities.
4. Rotating affected secrets.
5. Preserving relevant audit evidence.
6. Restricting unsafe operations if necessary.
7. Restoring service safely.
8. Reviewing the root cause and implementing corrective actions.

For MVP, at minimum, the owner or designated operator must have a documented process for disabling staff accounts, rotating credentials, and responding to suspected payment fraud.

## 18. Security Testing Plan

### Authentication tests

- Invalid credentials do not create a session.
- Disabled staff accounts cannot authenticate.
- Logout invalidates the relevant session.
- Expired sessions cannot access protected endpoints.
- Rate limits prevent uncontrolled login attempts.

### Authorization tests

- Kitchen staff cannot change menu prices.
- Waiters cannot manage staff roles.
- Cashiers cannot perform unauthorized refunds.
- Customers cannot access another customer's orders.
- Staff cannot access another restaurant's resources.
- Changing an ID in a request does not bypass authorization.

### QR and OTP tests

- Invalid or revoked QR tokens are rejected.
- QR access does not expose historical table data.
- Expired OTPs are rejected.
- OTP attempt limits are enforced.
- A verified OTP cannot be reused for an unrelated operation.

### Payment tests

- A client cannot mark a payment successful.
- An invalid webhook signature is rejected.
- Repeated webhooks do not duplicate payment effects.
- Refund limits are enforced.
- Unauthorized staff cannot issue refunds.

### Input and abuse tests

- Invalid payloads are rejected.
- SQL injection attempts do not alter database behavior.
- Oversized requests are rejected.
- Rate limits apply to sensitive endpoints.
- Error responses do not reveal stack traces or secrets.

Security testing must run in an isolated environment using test accounts and payment-provider test mode where available.

## 19. Security Acceptance Criteria

The security design is ready for implementation approval when:

- [ ] Staff and customer identity models are defined.
- [ ] The staff session mechanism and lifecycle are approved.
- [ ] The guest-access model is approved.
- [ ] The role-permission matrix is finalized.
- [ ] Restaurant-level isolation rules are documented.
- [ ] QR token creation, validation, expiry, and revocation are defined.
- [ ] OTP expiry and abuse controls are defined.
- [ ] Payment confirmation and refund authorization rules are defined.
- [ ] CSRF, CORS, and session protection are specified.
- [ ] Sensitive endpoints have rate-limit policies.
- [ ] Audit logging requirements are documented.
- [ ] Secret management and data-retention policies are established.
- [ ] Cross-user and cross-restaurant authorization tests are planned.
- [ ] Security-sensitive failure cases are included in API contract tests.

## 20. Open Decisions

The following remain unresolved:

1. Will customer accounts exist in MVP, or will the product use guest-first access?
2. Will staff authentication use server-managed sessions throughout?
3. What are the idle and absolute session lifetimes?
4. Which OTP and SMS provider will be used?
5. What OTP length, expiry, retry, and resend limits will apply?
6. Will table QR codes be static, revocable, or periodically rotated?
7. Which online payment provider will be integrated first?
8. Which refunds require managerial approval?
9. Which staff actions require mandatory reasons or additional confirmation?
10. What audit and financial-data retention periods apply?
11. Which deployment platform and secret-management mechanism will be used?
12. Is multi-factor authentication necessary for owners and managers in the first release?

Each decision must be recorded before the affected feature is implemented.

## 21. Final Status

**Document 08 is a proposed security design.**

It establishes the minimum security principles for Restaurant OS while leaving provider-specific and policy-specific decisions open.

It must remain aligned with:

- Document 02 — Product Requirements.
- Document 03 — User Journeys and Workflows.
- Document 05 — System Architecture.
- Document 06 — Database Design and ERD.
- Document 07 — API Specification and Contract Design.

Security requirements must be reflected in the API contracts, database constraints, tests, deployment configuration, and operational procedures. They must not exist only in this document.

**Next document:** Document 09 — Business Rules, State Machines & Transaction Invariants.
