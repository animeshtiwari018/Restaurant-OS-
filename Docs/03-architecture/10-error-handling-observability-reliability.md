# Document 10 — Error Handling, Observability & Operational Reliability

**Project:** Restaurant OS  
**Document Type:** Reliability and Operations Specification  
**Version:** 0.1 — Draft  
**Status:** Proposed; pending review  
**Backend:** Node.js, Express, TypeScript  
**Database:** PostgreSQL  
**Architecture:** Modular monolith

---

## 1. Purpose

This document defines how Restaurant OS detects, reports, records, recovers from, and prevents operational failures.

It covers:

- API error handling.
- Structured logging.
- Request tracing.
- Metrics and health checks.
- Database reliability.
- Payment and OTP provider failures.
- Background job recovery.
- Real-time delivery failures.
- Backup and restoration.
- Incident response.
- Reliability testing and acceptance criteria.

The goal is not to make failures impossible. The goal is to ensure failures are detectable, contained, recoverable, and do not silently corrupt restaurant operations.

## 2. Reliability Principles

### REL-001: Never report success before commitment

An operation must not be reported as successful before its required database transaction has committed.

### REL-002: Distinguish failure from uncertainty

A timeout does not always mean an operation failed. Payment requests and external integrations may succeed remotely even when the application receives no response.

### REL-003: Preserve business integrity

Failures must not produce duplicate orders, double bookings, incorrect payment states, or inconsistent inventory balances.

### REL-004: Make failures traceable

Each failed request should have enough contextual information for an authorized developer or operator to investigate it.

### REL-005: Retry only when safe

Retries must respect idempotency, provider behavior, operation type, and the possibility that an earlier attempt succeeded.

### REL-006: Fail safely

If a required dependency is unavailable, the system must avoid accepting operations that cannot be completed safely.

### REL-007: Keep the MVP operationally simple

The initial system should use a small, maintainable observability setup rather than introducing unnecessary infrastructure.

---

## 3. Error Classification

Every error should belong to a recognizable category.

| Category | Examples | Expected handling |
|---|---|---|
| Validation | Invalid quantity, missing field | Reject with a safe client error |
| Authentication | Invalid or expired session | Reject and require authentication |
| Authorization | User lacks billing permission | Reject and record the security-relevant outcome |
| Business conflict | Table already has an active session | Return a conflict response |
| Concurrency | Stale state transition, reservation race | Reject or safely retry where appropriate |
| Database | Connection failure, constraint violation | Roll back required transaction and record the failure |
| External dependency | SMS provider timeout | Apply bounded retry or recovery policy |
| Payment uncertainty | Provider request timed out | Reconcile before attempting a potentially duplicate charge |
| Internal application | Unexpected exception | Return a generic error and log diagnostic details securely |
| Configuration | Missing provider credentials | Fail safely and alert the operator |
| Resource exhaustion | Request flooding, pool exhaustion | Apply limits and restore service safely |

Expected business errors should not be logged as if they were unexpected application crashes.

Security-sensitive failures should be recorded without exposing credentials or unnecessary personal data.

---

## 4. Standard API Error Handling

### 4.1 Response contract

API errors should follow the shared contract defined in Document 07.

Example:

```json id="e1w9ac"
{
  "error": {
    "code": "TABLE_SESSION_CONFLICT",
    "message": "This table already has an active session.",
    "details": [],
    "requestId": "request-id"
  }
}
```

### 4.2 Error handling rules

- Use stable, machine-readable error codes.
- Return messages that help the client respond appropriately.
- Never expose database credentials, SQL statements, stack traces, or provider secrets.
- Include a request ID where applicable.
- Avoid returning sensitive information when the caller is unauthorized.
- Keep validation errors separate from unexpected internal failures.
- Map known database constraint violations to appropriate business errors.
- Do not convert every failure into `500 Internal Server Error`.

### 4.3 Centralized error handling

The Express application should have a centralized error-handling strategy.

The intended request lifecycle is:

1. Receive and identify the request.
2. Validate authentication and permissions.
3. Validate input.
4. Execute the appropriate application operation.
5. Commit required database changes.
6. Return the documented response.
7. Record unexpected failures with safe diagnostic context.

Expected errors should be represented consistently throughout the application.

The implementation must not expose internal exception objects directly to clients.

### 4.4 Client behavior

The frontend should distinguish between:

- Invalid input requiring correction.
- Expired authentication requiring reauthentication.
- A conflict requiring updated data or another action.
- A temporary failure that may be retried safely.
- An uncertain payment result requiring status verification.

The frontend must not blindly retry every failed request.

---

## 5. Structured Logging

### 5.1 Logging format

Application logs should be structured, machine-readable records, preferably JSON.

Each relevant record should include:

- Timestamp.
- Log level.
- Environment.
- Service or application component.
- Request ID or trace ID where available.
- HTTP method and route template.
- Response status.
- Operation duration.
- Sanitized error code.
- Relevant restaurant or resource context when necessary and permitted.

Do not log full request bodies by default.

### 5.2 Log levels

| Level | Use |
|---|---|
| `DEBUG` | Temporary detailed diagnostics in controlled environments |
| `INFO` | Important normal application events |
| `WARN` | Recoverable failures, unusual conditions, or degraded dependencies |
| `ERROR` | Failed operations requiring investigation |
| `FATAL` | A condition preventing the process from operating safely |

Production logging should prioritize actionable information and avoid excessive noise.

### 5.3 Sensitive-data redaction

The following must not appear in ordinary application logs:

- Passwords.
- OTP codes.
- Session cookies or authentication tokens.
- API keys and secret values.
- Full payment credentials.
- Unnecessary customer personal information.
- Sensitive webhook signatures.

Phone numbers and email addresses should be omitted or appropriately masked when full values are not needed for the investigation.

### 5.4 Audit logs versus application logs

These are separate systems with different purposes.

**Application logs** help diagnose technical behavior.

**Audit logs** preserve important business and security actions, such as refunds, role changes, bill finalization, and stock adjustments.

A technical log is not a substitute for a business audit record.

---

## 6. Request IDs and Tracing

Every API request should receive a unique request ID.

If a trusted upstream component supplies a request ID, the application must validate and handle it safely. Untrusted client-supplied identifiers must not be allowed to corrupt logs or tracing.

The request ID should be:

- Returned in the response metadata or an approved response header.
- Included in relevant application logs.
- Propagated to internal operations when useful.
- Included in sanitized error reports.

Distributed tracing may be introduced when multiple independently deployed services exist. It is not mandatory for the initial modular monolith.

The first release should provide enough request-level correlation to diagnose an order, payment, reservation, or inventory failure.

---

## 7. Metrics and Monitoring

Monitoring should focus on indicators that reveal whether the application is healthy and useful to restaurant staff.

### 7.1 Technical metrics

Track:

- Request count by route and status.
- Request latency.
- Error rate.
- Database query latency.
- Database connection-pool saturation.
- Authentication failures and rate-limit events.
- Background job failures.
- External-provider latency and failures.
- Webhook processing failures.
- Memory and CPU utilization where available.

### 7.2 Business-operational metrics

Where practical, track:

- Orders created and rejected.
- Time from order placement to kitchen acceptance.
- Kitchen ticket processing delays.
- Reservation creation conflicts.
- Pending payments and payment verification delays.
- Failed refund operations.
- Inventory movement failures.

Business metrics must use appropriate aggregation and access controls. They should not expose customer-level sensitive information.

### 7.3 Avoid misleading metrics

A low API error rate does not prove that restaurant operations are healthy.

For example, the API may respond successfully while a background kitchen-ticket job remains stuck.

Monitoring must therefore include asynchronous processing and important business workflows, not just HTTP responses.

---

## 8. Health Checks

The application should expose separate health checks for different purposes.

### 8.1 Liveness

A liveness check determines whether the application process is running and responsive.

It should not depend on every external provider being available.

### 8.2 Readiness

A readiness check determines whether the application can safely receive the traffic assigned to it.

It may consider essential dependencies such as database connectivity.

A temporary SMS-provider outage should not automatically make the entire application unready if unrelated operations can continue safely.

### 8.3 Dependency status

Internal monitoring may track the status of:

- PostgreSQL.
- OTP or SMS provider.
- Payment provider.
- Background processing.
- Real-time delivery infrastructure.

Public health endpoints must not reveal credentials, internal topology, or sensitive operational information.

---

## 9. Database Reliability

### 9.1 Transaction handling

Business operations that require multiple database writes must use appropriate transactions.

If a required transaction fails, the application must roll it back and return a failure response.

Examples include:

- Order creation with required order-item and history records.
- Reservation creation with protected capacity allocation.
- Bill finalization.
- Payment-event processing.
- Inventory movement creation with required balance updates.

### 9.2 Connection management

The backend must use a controlled database connection pool.

The implementation should define:

- Maximum connections.
- Connection acquisition timeout.
- Query timeout policy.
- Transaction timeout policy.
- Connection health behavior.
- Shutdown behavior.

These values must reflect the deployment environment and PostgreSQL capacity rather than being guessed independently in different modules.

### 9.3 Constraint failures

Database constraints are an important final layer of protection.

The application must handle expected uniqueness, foreign-key, and concurrency-related constraint failures safely.

A constraint failure must not be silently ignored if it means the business operation did not complete.

### 9.4 Migrations

Database schema changes must be version-controlled and applied through a repeatable migration process.

Before applying a migration to production:

1. Review the change.
2. Test it against representative data.
3. Assess locking and data-loss risks.
4. Confirm backup and recovery arrangements.
5. Plan for application compatibility during deployment.

Destructive migrations require particular scrutiny.

---

## 10. External Provider Reliability

Restaurant OS may depend on SMS/OTP services and a payment provider.

### 10.1 Timeouts

External requests must have explicit timeouts.

The application must not wait indefinitely for a provider response while holding unnecessary database resources or locks.

### 10.2 Retry policy

Retries must be:

- Bounded.
- Appropriate to the operation.
- Delayed according to a documented backoff policy where useful.
- Safe against duplicate business effects.
- Observable through logs and metrics.

Not every error should be retried. Authentication failures, invalid requests, and definitive business rejections usually require a different response from temporary network failures.

### 10.3 Circuit breaking

A circuit breaker may be introduced if repeated provider failures create cascading delays or resource exhaustion.

For the MVP, a simpler timeout, retry, and failure-isolation strategy may be sufficient.

The implementation should add circuit-breaking complexity only when the failure modes justify it.

### 10.4 Provider configuration

Missing or invalid production credentials must produce a clear operational failure.

The system must not silently substitute test credentials or pretend a payment or OTP operation succeeded.

---

## 11. Payment Failure and Reconciliation

Payment reliability requires special treatment because a network failure can leave the outcome uncertain.

### 11.1 Payment outcome categories

The system must distinguish:

- Confirmed success.
- Confirmed failure.
- Pending provider processing.
- Unknown outcome requiring verification.

A timeout belongs to the uncertain category unless authoritative evidence proves otherwise.

### 11.2 Recovery workflow

For an uncertain payment:

1. Preserve the local payment attempt and provider reference.
2. Do not create a second charge automatically without checking the first attempt.
3. Query the provider or wait for a verified webhook, according to provider capabilities.
4. Reconcile the local state with the authoritative provider outcome.
5. Record the reconciliation result.
6. Make the current status visible to authorized users.

### 11.3 Duplicate webhook delivery

Webhook processing must be idempotent.

The application should persist the provider event identity and processing outcome.

Repeated delivery must not duplicate payment success, refunds, or financial allocations.

### 11.4 Reconciliation jobs

The system should define a way to identify payments that remain pending or uncertain beyond an acceptable period.

A scheduled reconciliation process may be introduced when supported by the provider.

If automated reconciliation is unavailable, the operator must have a documented manual verification process.

---

## 12. Background Jobs and Asynchronous Work

Background processing may be required for:

- OTP delivery.
- Reservation reminders.
- Kitchen event delivery.
- Payment reconciliation.
- Inventory calculations.
- Reports.
- Notifications.
- Cleanup of expired temporary records.

The exact queue or job mechanism is an architecture decision.

### 12.1 Job requirements

Each important job must define:

- Its purpose.
- Its input and output.
- Retry eligibility.
- Maximum attempts.
- Idempotency strategy.
- Failure logging.
- Recovery procedure.
- Whether a dead-letter or manual intervention path is required.

### 12.2 Retry safety

A background job must be safe to retry when a previous attempt may have partially succeeded.

For example, retrying a notification must not create a second order, and retrying an inventory operation must not duplicate stock movement.

### 12.3 Scheduling and cleanup

Cleanup jobs must not delete records required for financial reconciliation, audit history, or idempotency protection.

Retention policies must determine what can be expired, anonymized, archived, or removed.

---

## 13. Real-Time Delivery Reliability

Kitchen screens and staff interfaces may depend on real-time events.

The chosen transport may be SSE or WebSockets, as decided in the architecture review.

The reliability requirements remain the same regardless of transport.

### 13.1 Delivery rules

- Database state is authoritative.
- Events communicate changes; they do not replace persisted records.
- Clients must recover after disconnects.
- Reconnection must not require duplicating business operations.
- Clients should refetch authoritative state when they may have missed events.
- Unauthorized users must not receive events for restricted resources.

### 13.2 Event publication failure

If an operation commits successfully but event publication fails, the system must have a defined recovery strategy.

A transactional outbox may be appropriate if reliable event publication is required.

The MVP should not claim guaranteed real-time delivery until its publication and recovery mechanism supports that guarantee.

### 13.3 Stale kitchen screens

The UI should detect stale connections where practical and show an appropriate connection or freshness indicator.

Staff must have a safe way to refresh the authoritative ticket list.

---

## 14. Graceful Degradation

The system should continue safe operations when a nonessential capability is unavailable.

| Failure | Expected behavior |
|---|---|
| SMS provider unavailable | Do not falsely mark OTP delivery successful; offer a controlled retry or recovery path |
| Payment provider unavailable | Do not claim online payment success; preserve the attempt and show its state |
| Real-time connection lost | Keep the screen's last known data visibly stale and allow safe refresh |
| Reporting query fails | Show an error without corrupting operational records |
| Database unavailable | Reject operations requiring persistence; do not simulate success |
| Inventory summary unavailable | Avoid inventing stock values; use an approved fallback or restrict affected operations |
| Background notification fails | Preserve the business operation and retry notification safely |

Graceful degradation must not bypass financial, authorization, or data-integrity requirements.

---

## 15. Backup and Disaster Recovery

### 15.1 Backup policy

The deployment must define:

- Backup frequency.
- Backup retention.
- Backup storage location.
- Encryption and access control.
- Whether point-in-time recovery is available.
- Who is responsible for monitoring backup success.

The policy must account for operational data and financial history.

### 15.2 Recovery targets

Two targets must be defined:

- **Recovery Point Objective (RPO):** The maximum acceptable amount of data loss measured in time.
- **Recovery Time Objective (RTO):** The maximum acceptable time to restore service.

The exact values must be selected based on the deployment, budget, and business requirements.

They must not be claimed as achieved until restoration has been tested.

### 15.3 Restore testing

A successful backup job does not prove that the system can be restored.

The project must test restoration into an isolated environment and verify:

- Schema integrity.
- Required operational records.
- Payment and order consistency.
- Application compatibility.
- Access control.
- The documented restoration procedure.

---

## 16. Deployment and Shutdown

### 16.1 Startup

The application must validate essential configuration at startup.

Missing required secrets, invalid database configuration, or incompatible settings must cause a clear startup failure rather than undefined behavior.

### 16.2 Graceful shutdown

The application should:

1. Stop accepting new requests where appropriate.
2. Allow in-flight operations to finish within a bounded period.
3. Close background processing safely.
4. Release database connections.
5. Exit cleanly.

Long-running operations and jobs must have a defined interruption and retry policy.

### 16.3 Migration safety

Deployments must account for the possibility that application instances and database schema versions temporarily differ.

Where necessary, use an expand-and-contract migration strategy:

1. Add backward-compatible schema changes.
2. Deploy compatible application code.
3. Migrate data where necessary.
4. Remove obsolete schema only after old code no longer depends on it.

---

## 17. Incident Response

The initial operational process should be simple and documented.

### 17.1 Incident categories

- Critical: financial integrity, broad data exposure, or major operational outage.
- High: core order, kitchen, reservation, or payment workflow significantly impaired.
- Medium: a limited feature is degraded but safe operations continue.
- Low: cosmetic issues or noncritical failures.

The final incident severity policy must be agreed upon before production use.

### 17.2 Response process

1. Identify the affected workflow.
2. Determine whether financial or operational data integrity is at risk.
3. Contain the issue without creating further damage.
4. Inspect request IDs, logs, metrics, and relevant audit records.
5. Recover using an approved procedure.
6. Verify data consistency.
7. Document the cause and corrective actions.

### 17.3 Manual interventions

Manual changes to production data should be minimized.

Any necessary intervention must be authorized, recorded, and followed by consistency checks.

Never correct a payment or stock discrepancy by silently changing a stored total without preserving the relevant history.

---

## 18. Reliability Testing Plan

### API reliability

- [ ] Unexpected exceptions return safe error responses.
- [ ] Every request has a traceable request ID.
- [ ] Errors do not leak secrets or stack traces.
- [ ] Rate limits work on sensitive endpoints.

### Database reliability

- [ ] Failed transactions roll back correctly.
- [ ] Connection failures are handled safely.
- [ ] Duplicate requests do not duplicate business effects.
- [ ] Database constraints are mapped to appropriate application errors.

### External dependencies

- [ ] Provider timeouts are handled.
- [ ] Unknown payment outcomes can be reconciled.
- [ ] Duplicate webhooks are safe.
- [ ] Background jobs can retry without duplicating effects.

### Real-time behavior

- [ ] Disconnected clients can reconnect.
- [ ] Missed events can be recovered through authoritative refetching.
- [ ] Stale screens do not falsely claim current data.
- [ ] Event failures do not erase committed operations.

### Recovery

- [ ] Backups complete successfully.
- [ ] Restoration has been tested.
- [ ] Recovery instructions are documented.
- [ ] The system can be restarted without duplicating interrupted jobs.

---

## 19. Reliability Acceptance Criteria

Before production release:

- [ ] Standard API error handling is implemented.
- [ ] Structured logs and request IDs are available.
- [ ] Sensitive data is redacted.
- [ ] Essential health checks are available.
- [ ] Database transaction failures are tested.
- [ ] Payment uncertainty and reconciliation behavior are documented.
- [ ] Important asynchronous jobs are retry-safe.
- [ ] Real-time reconnection behavior is defined.
- [ ] Backup and restore procedures are tested.
- [ ] RPO and RTO are explicitly documented.
- [ ] Incident response and manual correction procedures are available.
- [ ] The operator can diagnose a failed order or payment using the relevant request or transaction references.

---

## 20. Open Decisions

1. Which logging and monitoring tools will be used?
2. Will the MVP use a job queue or a simpler background-job mechanism?
3. Is a transactional outbox required in the first release?
4. Which payment reconciliation capabilities does the selected provider offer?
5. What are the maximum acceptable provider timeouts?
6. Which retry limits and backoff rules apply to each job type?
7. What are the database connection and transaction timeout settings?
8. What backup frequency and retention period are required?
9. What RPO and RTO can the deployment realistically support?
10. Which failures should trigger an operator alert?
11. Will real-time updates use SSE or WebSockets?
12. What is the approved procedure for correcting production financial discrepancies?

Each decision must be recorded in the relevant architecture or operations document.

---

## 21. Final Status

**Document 10 is a proposed reliability and operations specification.**

It defines expected system behavior during failures without prematurely selecting every infrastructure tool.

It must remain aligned with:

- Document 05 — System Architecture.
- Document 06 — Database Design and ERD.
- Document 07 — API Specification and Contract Design.
- Document 08 — Authentication, Authorization & Security Design.
- Document 09 — Business Rules, State Machines & Transaction Invariants.

Reliability is not established merely by adding logging or retrying failed requests. It depends on preserving business invariants, understanding uncertain outcomes, and proving that recovery procedures work.

**Next document:** Document 11 — Testing Strategy, Test Plan & Quality Gates.
