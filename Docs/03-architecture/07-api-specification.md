# Document 07 — API Specification & Contract Design

**Project:** Restaurant OS  
**Document Type:** API Contract Specification  
**Version:** 0.1 — Draft  
**Status:** Proposed; pending review  
**Base Path:** `/api/v1`  
**Backend:** Node.js, Express, TypeScript  
**Database:** PostgreSQL  
**Validation:** Zod

---

## 1. Purpose

This document defines the communication contract between the Restaurant OS frontend, backend, database-facing application services, and external providers.

It establishes:

- API conventions and naming standards.
- Authentication and authorization expectations.
- Request and response formats.
- Endpoint inventory by business module.
- Order, kitchen, reservation, billing, payment, and inventory contracts.
- Idempotency and concurrency requirements.
- Error handling, validation, and security rules.
- Real-time event requirements.
- API acceptance criteria and unresolved decisions.

The contracts in this document are proposals. They must be reviewed alongside the product requirements, user journeys, system architecture, and database design before implementation begins.

## 2. API Design Principles

1. **Contract-first:** Endpoint behavior and data structures must be agreed upon before implementation.
2. **Business-oriented:** APIs should represent restaurant operations, not expose raw database tables.
3. **Explicit authorization:** Every protected operation must verify both identity and permission.
4. **Safe retries:** Retried requests must not accidentally create duplicate orders, payments, or stock movements.
5. **Transactional integrity:** Related financial and operational changes must be committed atomically where required.
6. **Predictable errors:** Clients must receive consistent error structures.
7. **Minimal exposure:** Return only the information required by the requesting client.
8. **Restaurant isolation:** Every restaurant-scoped resource must be checked against the authenticated user's authorized restaurant.
9. **Documented state transitions:** Clients must not arbitrarily set operational statuses.
10. **Backward-compatible evolution:** API changes must not silently break existing clients.

## 3. API Conventions

### 3.1 Base URL and versioning

All endpoints use the `/api/v1` prefix.

Example development base URL:

`http://localhost:<PORT>/api/v1`

The production hostname and port will be configured during deployment planning.

Breaking API changes require a new version or an explicitly approved migration strategy.

### 3.2 HTTP methods

| Method | Purpose |
|---|---|
| GET | Retrieve a resource or collection |
| POST | Create a resource or execute a defined business action |
| PATCH | Partially update permitted fields |
| PUT | Replace a resource when full replacement is explicitly supported |
| DELETE | Delete a resource only when deletion is permitted by business and retention rules |

Operational records such as completed orders, successful payments, audit events, and stock movements must not be physically deleted through ordinary API endpoints.

### 3.3 Content type

Requests and responses use JSON unless an endpoint explicitly documents another content type.

Protected endpoints must validate the request content type and reject malformed JSON.

### 3.4 Naming conventions

- URLs use lowercase kebab-case where compound words are necessary.
- Resource identifiers are opaque IDs, normally UUIDs.
- JSON properties use camelCase.
- Database naming remains snake_case.
- Timestamps use ISO 8601 UTC representations.
- Enum values use documented, stable strings.
- Unknown fields should be rejected for sensitive or state-changing payloads where strict validation is appropriate.

### 3.5 Monetary values

Amounts must never use floating-point arithmetic for financial calculations.

The API should represent money as an exact decimal string with a separate currency code.

Example:

`"amount": "1250.00"`

`"currency": "INR"`

All calculations, rounding rules, discounts, tax treatment, and final payable amounts must be determined by the backend.

The server must never trust a total amount supplied by the client.

### 3.6 Pagination

Collection endpoints should support cursor-based pagination where collections can grow significantly.

Proposed query parameters:

- `limit`: maximum number of records to return.
- `cursor`: opaque continuation token.
- `sort`: explicitly supported sort field and direction.
- `status`: optional status filter where applicable.
- `from` and `to`: date range filters where applicable.

The server must enforce a maximum page size.

Example:

`GET /api/v1/staff/orders?status=PLACED&limit=25`

Proposed response:

- `data`: array of records.
- `pagination.nextCursor`: next cursor or `null`.
- `pagination.hasMore`: whether another page exists.

Pagination rules for reports and small, bounded lookup lists may differ if documented.

---

## 4. Authentication and Authorization

### 4.1 Staff authentication

Staff users authenticate using an approved login mechanism.

Initial proposed endpoints:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

For browser-based staff sessions, secure, HTTP-only cookies are preferred over storing long-lived access tokens in browser storage.

Session lifetime, refresh behavior, CSRF protection, password recovery, and optional multi-factor authentication require a separate security decision.

### 4.2 Customer and guest access

Customers may need to browse menus, create pre-orders, place QR orders, manage reservations, and view order status.

The guest access model is not yet finalized.

Possible approaches include:

- OTP-verified customer accounts or sessions.
- Short-lived, signed access tokens for specific orders.
- Secure, unguessable order access links with revocation and expiry.

The selected mechanism must prevent unauthorized users from enumerating order IDs, viewing another customer's information, or controlling another table's session.

Public access to a menu does not imply public access to orders, bills, payments, or customer information.

### 4.3 Authorization roles

Proposed roles include:

| Role | Typical permissions |
|---|---|
| Owner | Restaurant configuration, staff, menu, reports, operational oversight |
| Manager | Daily operations, reservations, orders, billing, inventory within granted permissions |
| Cashier | Bills, payment initiation, receipts, permitted refunds |
| Waiter | Table sessions, waiter-assisted orders, permitted order updates |
| Kitchen Staff | Assigned kitchen tickets and item preparation states |
| Inventory Staff | Ingredients, stock receipts, adjustments, and approved stock operations |
| Customer/Guest | Only the customer's authorized operations and resources |

The final permission model must be defined in the authorization matrix.

A role name alone is not sufficient authorization. The backend must check the actual permission and restaurant scope.

### 4.4 Protected resource rules

Every protected resource lookup must verify:

1. The caller is authenticated or possesses the approved guest capability.
2. The caller has permission for the requested action.
3. The resource belongs to the authorized restaurant or permitted customer context.
4. The resource is in a state where the requested action is allowed.

Unauthorized access should not reveal sensitive resource existence.

---

## 5. Standard Response Contracts

### 5.1 Successful response

A successful request returns the appropriate HTTP status and a documented response body.

Proposed standard format:

```json
{
  "data": {
    "id": "resource-id"
  },
  "meta": {
    "requestId": "request-id"
  }
}
```

Collection responses additionally include pagination metadata where required.

Not every endpoint needs an identical response wrapper if a clear, consistent exception is documented.

### 5.2 Error response

All API errors should use a consistent structure.

```json
{
  "error": {
    "code": "ORDER_STATE_CONFLICT",
    "message": "This order cannot be cancelled in its current state.",
    "details": [],
    "requestId": "request-id"
  }
}
```

Rules:

- `code` is a stable machine-readable identifier.
- `message` is safe for display or logging.
- `details` contains sanitized validation details when applicable.
- `requestId` allows the support team to trace a failed request.
- Internal stack traces, SQL errors, credentials, and sensitive provider responses must never be returned.

### 5.3 HTTP status conventions

| Status | Meaning |
|---|---|
| 200 | Successful retrieval or operation |
| 201 | Resource created |
| 202 | Request accepted for asynchronous processing |
| 204 | Successful operation with no response body |
| 400 | Malformed request or invalid request structure |
| 401 | Authentication required or invalid |
| 403 | Authenticated caller lacks permission |
| 404 | Resource not found or intentionally concealed |
| 409 | Business-state or concurrency conflict |
| 410 | Resource or capability has expired, where disclosure is appropriate |
| 422 | Structurally valid request that fails business validation |
| 429 | Rate limit exceeded |
| 500 | Unexpected internal error |
| 502/503 | Upstream dependency or temporary service unavailability |

The distinction between `400` and `422` must be applied consistently.

### 5.4 Standard error codes

Initial proposed codes:

- `VALIDATION_ERROR`
- `AUTHENTICATION_REQUIRED`
- `INVALID_CREDENTIALS`
- `PERMISSION_DENIED`
- `RESOURCE_NOT_FOUND`
- `RESOURCE_EXPIRED`
- `IDEMPOTENCY_KEY_REUSED`
- `ORDER_STATE_CONFLICT`
- `TABLE_SESSION_CONFLICT`
- `RESERVATION_SLOT_UNAVAILABLE`
- `PAYMENT_ALREADY_PROCESSED`
- `PAYMENT_PROVIDER_ERROR`
- `INSUFFICIENT_STOCK`
- `RATE_LIMIT_EXCEEDED`
- `DEPENDENCY_UNAVAILABLE`
- `INTERNAL_ERROR`

Each code must have a defined meaning and retry policy.

---

## 6. Endpoint Inventory

All paths below are relative to `/api/v1`.

The inventory describes the proposed API surface. Endpoints may be merged, split, or renamed during contract review.

### 6.1 Authentication and staff sessions

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/auth/login` | Authenticate staff | Public, rate-limited |
| POST | `/auth/logout` | End the current session | Authenticated staff |
| GET | `/auth/me` | Retrieve current staff identity and permissions | Authenticated staff |

### 6.2 Public restaurant and menu

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/restaurants/:restaurantSlug` | Retrieve public restaurant information | Public |
| GET | `/restaurants/:restaurantSlug/menu` | Retrieve available menu and categories | Public |
| GET | `/restaurants/:restaurantSlug/menu/:itemId` | Retrieve public item details | Public |

Public menu responses must exclude internal costs, stock-management details, staff notes, and unpublished items.

### 6.3 QR and table context

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/tables/qr/:token` | Resolve an approved QR entry token into limited table context | Public capability, rate-limited |
| POST | `/table-sessions/:sessionId/guest-access` | Establish guest access for an eligible session | Pending guest-access design |
| GET | `/staff/tables` | List tables and operational status | Authorized staff |
| POST | `/staff/table-sessions` | Open a table service session | Authorized staff |
| GET | `/staff/table-sessions/:sessionId` | Retrieve session details | Authorized staff |
| POST | `/staff/table-sessions/:sessionId/close` | Close a session subject to billing rules | Authorized staff |

The raw QR token must not expose internal database IDs or unrestricted access to a table session.

### 6.4 Orders

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/orders` | Create an eligible customer order | Authorized customer/guest or staff |
| GET | `/orders/:orderId` | Retrieve an authorized order | Authorized customer/guest or staff |
| GET | `/orders/:orderId/status` | Retrieve a limited status view | Authorized customer/guest or staff |
| POST | `/orders/:orderId/cancel` | Request cancellation when permitted | Authorized customer or staff |
| GET | `/staff/orders` | List restaurant orders | Authorized staff |
| POST | `/staff/orders` | Create a waiter-assisted order | Authorized staff |
| PATCH | `/staff/orders/:orderId` | Update explicitly permitted order fields | Authorized staff |
| PATCH | `/staff/orders/:orderId/status` | Execute an approved order transition | Authorized staff |

Customer order creation and staff order creation may ultimately share an application service while applying different authorization and validation policies.

### 6.5 Kitchen operations

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/kitchen/tickets` | List tickets for permitted kitchen stations | Kitchen staff |
| GET | `/kitchen/tickets/:ticketId` | Retrieve a ticket | Kitchen staff |
| POST | `/kitchen/tickets/:ticketId/accept` | Accept a ticket | Kitchen staff |
| POST | `/kitchen/tickets/:ticketId/start` | Start preparation | Kitchen staff |
| POST | `/kitchen/tickets/:ticketId/ready` | Mark the ticket ready | Kitchen staff |
| PATCH | `/kitchen/tickets/:ticketId/items/:itemId/status` | Update an allowed item-level state | Kitchen staff |

Kitchen access should be scoped to the user's assigned restaurant and, where applicable, kitchen station.

### 6.6 Reservations

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/reservations/availability` | Check availability for a requested party and time | Public, rate-limited |
| POST | `/reservations/otp/request` | Request a verification code | Public, rate-limited |
| POST | `/reservations/otp/verify` | Verify the code | Public, rate-limited |
| POST | `/reservations` | Create a reservation after required verification | Verified customer |
| GET | `/reservations/:reservationId` | Retrieve an authorized reservation | Authorized customer/staff |
| POST | `/reservations/:reservationId/cancel` | Cancel a reservation under policy | Authorized customer/staff |
| GET | `/staff/reservations` | List restaurant reservations | Authorized staff |
| POST | `/staff/reservations/:reservationId/check-in` | Check in a guest | Authorized staff |
| PATCH | `/staff/reservations/:reservationId/status` | Execute an allowed reservation transition | Authorized staff |

Availability checking alone must not guarantee a table. The final reservation-creation operation must revalidate availability atomically.

### 6.7 Billing and payments

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/staff/table-sessions/:sessionId/bills` | Create a bill for an eligible session | Authorized staff |
| GET | `/bills/:billId` | Retrieve an authorized bill | Authorized customer/staff |
| POST | `/bills/:billId/finalize` | Finalize bill totals and line items | Authorized staff |
| GET | `/bills/:billId/payments` | Retrieve permitted payment information | Authorized customer/staff |
| POST | `/bills/:billId/payments` | Initiate cash or online payment workflow | Authorized customer/staff |
| GET | `/payments/:paymentId` | Retrieve payment status | Authorized customer/staff |
| POST | `/payments/:paymentId/refunds` | Request a permitted refund | Authorized staff |
| POST | `/webhooks/payments/:provider` | Receive provider events | Verified provider signature |

The final billing model depends on unresolved decisions about whether one bill may include multiple orders and whether a service session can have multiple bills.

A payment API must not accept an arbitrary client-supplied declaration that a payment succeeded.

### 6.8 Menu management

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/staff/menu/categories` | List menu categories | Authorized staff |
| POST | `/staff/menu/categories` | Create a category | Authorized staff |
| PATCH | `/staff/menu/categories/:categoryId` | Update a category | Authorized staff |
| GET | `/staff/menu/items` | List menu items | Authorized staff |
| POST | `/staff/menu/items` | Create a menu item | Authorized staff |
| GET | `/staff/menu/items/:itemId` | Retrieve an item including permitted internal fields | Authorized staff |
| PATCH | `/staff/menu/items/:itemId` | Update permitted item fields | Authorized staff |
| POST | `/staff/menu/items/:itemId/archive` | Archive an item | Authorized staff |
| PUT | `/staff/menu/items/:itemId/availability` | Update availability settings | Authorized staff |

Archiving must preserve historical order and billing records.

### 6.9 Inventory

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/staff/inventory/ingredients` | List ingredients | Authorized inventory staff |
| POST | `/staff/inventory/ingredients` | Create an ingredient | Authorized inventory staff |
| PATCH | `/staff/inventory/ingredients/:ingredientId` | Update ingredient metadata | Authorized inventory staff |
| GET | `/staff/inventory/stock` | Retrieve stock balances | Authorized inventory staff |
| POST | `/staff/inventory/stock-movements` | Record a receipt or approved adjustment | Authorized inventory staff |
| GET | `/staff/inventory/stock-movements` | Retrieve movement history | Authorized inventory staff |
| GET | `/staff/menu/items/:itemId/recipe` | Retrieve a permitted recipe | Authorized inventory/management staff |
| PUT | `/staff/menu/items/:itemId/recipe` | Create or revise recipe configuration | Authorized inventory/management staff |

Stock balances must be derived from, or kept consistent with, the authoritative movement records.

### 6.10 Staff, settings, reporting, and audit

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/staff/users` | List restaurant staff | Owner/authorized manager |
| POST | `/staff/users` | Invite or create a staff user | Owner/authorized manager |
| PATCH | `/staff/users/:userId` | Update permitted staff fields | Owner/authorized manager |
| GET | `/staff/roles` | Retrieve roles and permissions | Authorized manager |
| GET | `/staff/settings` | Retrieve restaurant settings | Authorized staff |
| PATCH | `/staff/settings` | Update permitted restaurant settings | Owner/authorized manager |
| GET | `/staff/reports/sales` | Retrieve sales report | Authorized management |
| GET | `/staff/reports/orders` | Retrieve order report | Authorized management |
| GET | `/staff/audit-logs` | Retrieve permitted audit history | Authorized management |

Report definitions must specify their time zone, date boundaries, refund treatment, tax treatment, and revenue calculations before implementation.

---

## 7. Detailed Core Endpoint Contracts

The following examples establish the expected contract style. They are illustrative proposed schemas, not finalized TypeScript types.

### 7.1 `POST /auth/login`

**Purpose:** Authenticate a staff user.

**Authentication:** None; apply rate limiting.

**Request:**

```json
{
  "email": "staff@example.com",
  "password": "example-password"
}
```

**Successful response:** `200 OK`

The response returns a minimal staff profile and authorized restaurant context. The authentication mechanism may establish a secure session cookie instead of returning a reusable token in the JSON body.

**Possible errors:**

- `400 VALIDATION_ERROR`
- `401 INVALID_CREDENTIALS`
- `429 RATE_LIMIT_EXCEEDED`

Authentication errors must not reveal whether a specific email address exists.

### 7.2 `GET /restaurants/:restaurantSlug/menu`

**Purpose:** Retrieve the published public menu.

**Authentication:** None.

**Query parameters:**

- `categoryId`, optional.
- `availableOnly`, optional; defaults to `true`.
- `cursor`, optional.
- `limit`, optional.

**Successful response:** `200 OK`

```json
{
  "data": {
    "restaurant": {
      "slug": "sample-restaurant",
      "name": "Sample Restaurant",
      "currency": "INR"
    },
    "categories": [],
    "items": []
  },
  "meta": {
    "requestId": "request-id"
  }
}
```

The actual menu item representation must include the fields required for display, such as ID, name, description, price, image reference, category, dietary labels where supported, modifiers, and current orderability.

Unavailable items must not be treated as orderable merely because their details are cached on the client.

### 7.3 `POST /orders`

**Purpose:** Create a pre-order, QR order, or waiter-assisted order.

**Authentication:** Authorized customer/guest capability or staff identity, according to the order source.

**Required header:**

`Idempotency-Key: <unique-client-generated-value>`

**Proposed request:**

```json
{
  "restaurantSlug": "sample-restaurant",
  "orderType": "AT_TABLE",
  "source": "QR",
  "tableSessionId": "session-id",
  "items": [
    {
      "menuItemId": "item-id",
      "quantity": 2,
      "modifierOptionIds": ["modifier-option-id"],
      "specialInstructions": "No onions"
    }
  ],
  "notes": ""
}
```

Allowed `orderType` values are proposed as `PRE_ORDER` and `AT_TABLE`.

Allowed `source` values are proposed as `WEB`, `QR`, and `WAITER`.

The server must validate that the combination of order type, source, restaurant, table context, menu availability, modifiers, quantity, and session state is permitted.

A pre-order must not require a table session unless the product rules explicitly require one.

The backend must:

1. Validate all submitted items and modifiers.
2. Recalculate prices from authoritative menu data.
3. Create immutable order-item snapshots.
4. Validate table-session access when relevant.
5. Create the order and its initial history in a transaction.
6. Trigger the approved kitchen workflow when operationally appropriate.
7. Return the persisted order representation.

**Successful response:** `201 Created`

```json
{
  "data": {
    "id": "order-id",
    "orderNumber": "R-1042",
    "orderType": "AT_TABLE",
    "source": "QR",
    "status": "PLACED",
    "currency": "INR",
    "subtotal": "500.00",
    "taxTotal": "25.00",
    "discountTotal": "0.00",
    "total": "525.00",
    "items": [],
    "createdAt": "2026-10-13T12:00:00Z"
  },
  "meta": {
    "requestId": "request-id"
  }
}
```

The amounts and order number above are illustrative.

**Possible errors:**

- `400 VALIDATION_ERROR`
- `403 PERMISSION_DENIED`
- `404 RESOURCE_NOT_FOUND`
- `409 TABLE_SESSION_CONFLICT`
- `409 IDEMPOTENCY_KEY_REUSED`
- `422` for unavailable items or invalid modifiers
- `429 RATE_LIMIT_EXCEEDED`

### 7.4 `GET /orders/:orderId/status`

**Purpose:** Return a limited operational status for an authorized order.

**Authentication:** Staff identity or valid customer/guest capability.

**Successful response:** `200 OK`

```json
{
  "data": {
    "orderId": "order-id",
    "status": "IN_PREPARATION",
    "items": [],
    "updatedAt": "2026-10-13T12:10:00Z"
  },
  "meta": {
    "requestId": "request-id"
  }
}
```

The status response must not reveal staff-only notes, internal costs, payment credentials, or unrelated customer details.

### 7.5 `POST /orders/:orderId/cancel`

**Purpose:** Request cancellation of an order.

**Authentication:** Authorized customer or staff.

**Proposed request:**

```json
{
  "reason": "Customer requested cancellation"
}
```

The server must enforce cancellation rules based on the order state, kitchen progress, payment state, and applicable restaurant policy.

Cancellation and refund are separate business operations. Cancelling an order must not automatically claim that a payment has been refunded.

**Possible errors:**

- `404 RESOURCE_NOT_FOUND`
- `409 ORDER_STATE_CONFLICT`
- `403 PERMISSION_DENIED`

### 7.6 `POST /reservations/availability`

**Purpose:** Find potential reservation availability.

**Authentication:** None; rate-limited.

Although the endpoint inventory uses `GET` for availability, the request fields below illustrate the logical contract. The final HTTP method and query serialization must be standardized during review.

**Proposed request fields:**

- Restaurant identifier or slug.
- Requested date and time.
- Party size.
- Optional duration, subject to restaurant policy.

**Successful response:** `200 OK`

```json
{
  "data": {
    "requestedDate": "2026-10-20",
    "partySize": 4,
    "availableSlots": []
  },
  "meta": {
    "requestId": "request-id"
  }
}
```

An available slot represents a candidate, not a guaranteed reservation.

### 7.7 `POST /reservations`

**Purpose:** Create a verified reservation.

**Authentication:** Verified customer or an approved guest capability.

**Proposed request:**

```json
{
  "restaurantSlug": "sample-restaurant",
  "customerName": "Example Customer",
  "phone": "+91XXXXXXXXXX",
  "partySize": 4,
  "startAt": "2026-10-20T13:00:00+05:30",
  "durationMinutes": 90,
  "verificationId": "verification-id"
}
```

The phone number is illustrative.

The server must:

1. Validate the verification record and its expiry.
2. Confirm that it belongs to the intended phone or customer.
3. Recheck availability within the reservation transaction.
4. Apply the restaurant's deposit and cancellation policy.
5. Create the reservation and history atomically.
6. Return the confirmed reservation or an explicit pending state if an additional step is required.

**Possible errors:**

- `422` for invalid reservation details.
- `409 RESERVATION_SLOT_UNAVAILABLE`
- `410 RESOURCE_EXPIRED` for an expired verification capability, where appropriate.
- `429 RATE_LIMIT_EXCEEDED`

OTP codes must never be stored or logged in plaintext.

### 7.8 `POST /staff/table-sessions/:sessionId/bills`

**Purpose:** Create a bill for an eligible service session.

**Authentication:** Staff with billing permission.

The request must identify any supported billing choices, such as included orders, when the approved billing model requires them.

The server must reject attempts to bill unrelated sessions or include orders from another restaurant.

Bill creation and finalization must have explicitly defined rules for taxes, discounts, rounding, tips or service charges, and subsequent order additions.

The response returns the bill ID, line-item snapshots, totals, currency, and state.

### 7.9 `POST /bills/:billId/payments`

**Purpose:** Start a cash or online payment workflow.

**Authentication:** Authorized customer/staff context.

**Proposed request:**

```json
{
  "method": "ONLINE",
  "amount": "525.00",
  "currency": "INR",
  "provider": "configured-provider",
  "returnUrl": "https://example.com/payment-result"
}
```

The amount and return URL are subject to server-side validation. The example does not define a production payment-provider integration.

For a cash payment, the authorized staff workflow must define who records receipt of cash and when the payment is considered collected.

For online payments, the backend must calculate the payable amount, create a pending payment record, and initiate the provider workflow.

**Critical rule:** A browser redirect, client callback, or customer-submitted status must never be sufficient evidence of successful payment.

Payment success must be established through the trusted provider confirmation mechanism, with signature verification and duplicate-event protection.

### 7.10 `POST /webhooks/payments/:provider`

**Purpose:** Process an event from a configured payment provider.

**Authentication:** Provider-specific signature verification.

Requirements:

- Verify the signature using the raw request body and the provider's documented signing procedure.
- Reject invalid signatures.
- Validate event identity and structure.
- Deduplicate provider event IDs.
- Process event updates transactionally.
- Ensure that repeated delivery cannot create duplicate payment success or refund records.
- Return the provider-appropriate response.
- Avoid logging payment secrets or unnecessary personal information.

Webhook processing must be resilient to duplicate and out-of-order events.

### 7.11 `POST /staff/inventory/stock-movements`

**Purpose:** Record an inventory receipt, consumption adjustment, correction, or waste movement.

**Authentication:** Authorized inventory staff.

**Proposed request:**

```json
{
  "ingredientId": "ingredient-id",
  "movementType": "RECEIPT",
  "quantity": "10.000",
  "unitId": "unit-id",
  "reason": "Supplier delivery",
  "reference": "delivery-reference"
}
```

Quantities must use exact decimal representations appropriate to the measurement precision.

The backend must validate compatible units, the permitted movement type, quantity rules, restaurant ownership, and the user's permissions.

Every accepted movement must have an auditable record. Corrections should generally be recorded as compensating movements instead of rewriting historical movements.

Automatic recipe-based stock deduction timing remains a product and architecture decision.

---

## 8. Order and Kitchen State Contracts

### 8.1 Order states

The final order state machine must be approved before coding.

Proposed customer-facing and operational states:

- `PLACED`
- `CONFIRMED`
- `IN_PREPARATION`
- `READY`
- `SERVED`
- `COMPLETED`
- `CANCELLED`

Whether `CONFIRMED` is necessary, whether a pre-order needs a scheduled state, and how rejected or partially fulfilled orders are represented remain open questions.

### 8.2 State transitions

Clients must invoke documented actions rather than freely assigning status values.

For example, the kitchen interface should use an operation such as:

`POST /kitchen/tickets/:ticketId/start`

instead of allowing arbitrary status mutation.

The backend must validate the current state, actor permissions, restaurant scope, and any required prerequisites.

Invalid transitions should return `409` with a stable business error code.

### 8.3 Order history

Important order transitions must produce an append-only history entry containing the previous state, new state, actor or system source, timestamp, and permitted reason.

History creation must occur in the same transaction as the corresponding state change.

---

## 9. Idempotency and Retry Policy

Idempotency is mandatory for high-impact create operations.

### 9.1 Client idempotency keys

The following operations should require an `Idempotency-Key` header:

- Order creation.
- Reservation creation where retries could create duplicates.
- Payment initiation.
- Refund initiation.
- Inventory movement creation where retrying could duplicate stock.
- Other operations identified as financially or operationally sensitive.

The key is scoped to the authenticated actor or approved guest context and the operation.

### 9.2 Required behavior

The server must:

1. Store the key with the relevant scope and request fingerprint.
2. Execute the operation at most once for a given key and matching request.
3. Return the original result for a retry of the same request where safe.
4. Reject reuse of the key with a materially different request.
5. Define how in-progress requests and expired idempotency records behave.
6. Retain records for a period appropriate to the operation's risk and reconciliation requirements.

A retry must not create a second order, reservation, payment, refund, or stock movement.

### 9.3 Provider deduplication

Payment providers may deliver the same webhook more than once.

Store provider event IDs and processing outcomes under a uniqueness constraint or equivalent durable deduplication mechanism.

The exact retention periods must be set in the data-retention policy.

---

## 10. Concurrency and Transaction Requirements

### 10.1 Reservations

Reservation creation must revalidate availability during the write operation.

Two customers attempting to reserve the same limited capacity must not both receive confirmed reservations when doing so violates the restaurant's capacity rules.

The implementation must choose and document the appropriate combination of database transactions, locking, constraints, or capacity allocation.

A prior availability response is not a reservation guarantee.

### 10.2 Table sessions

Opening, closing, and assigning tables must protect against conflicting concurrent actions.

The API must define behavior when two staff members try to open or close the same table session simultaneously.

### 10.3 Orders

Concurrent changes must not silently overwrite newer order state.

Where optimistic concurrency is appropriate, the API may use a version number or ETag/`If-Match` contract. Where database locking is necessary, the locking strategy must be defined in the architecture and implementation design.

### 10.4 Payments

Payment initiation, provider callbacks, reconciliation, and refunds must be designed to tolerate retries and concurrency.

A payment's final state must not be downgraded by an older event or duplicated by a repeated event.

### 10.5 Inventory

Stock movement creation and any stock-balance projection updates must be consistent.

If a recipe deduction or adjustment could produce a negative stock balance, the system must follow an explicitly approved policy rather than silently accepting or rejecting the movement based on inconsistent reads.

---

## 11. Real-Time Updates

The application requires timely updates for:

- Newly placed orders.
- Kitchen ticket creation and state changes.
- Order status changes.
- Table session changes.
- Reservation updates.
- Payment status changes where the user is authorized to see them.

Proposed event names:

- `order.created`
- `order.updated`
- `kitchen.ticket.created`
- `kitchen.ticket.updated`
- `table.session.updated`
- `reservation.updated`
- `payment.updated`

These are logical event names, not yet a commitment to a particular transport.

### 11.1 Transport decision

Server-Sent Events (SSE) and WebSockets remain options.

SSE may be sufficient for one-way operational updates with ordinary HTTP commands. WebSockets may be justified if the application requires substantial bidirectional real-time communication.

The decision must consider reconnect behavior, deployment compatibility, authentication, scale, and operational complexity.

### 11.2 Event rules

- Events must not expose data beyond the subscriber's authorization.
- Events should contain identifiers and enough information for a safe update or refetch.
- Clients must refetch authoritative state after reconnecting when necessary.
- A real-time event must not be treated as the only durable record of an operation.
- The system must define how to handle an event published before its database transaction is committed.

A transactional outbox may be introduced if reliable database-to-event publication is required.

---

## 12. Validation and Input Handling

All state-changing endpoints must validate requests at the API boundary.

Validation includes:

- Required and optional fields.
- String lengths and formats.
- UUID or opaque identifier formats.
- Numeric ranges and exact decimal representations.
- Enum values.
- Date and time validity.
- Maximum array sizes and request body size.
- Restaurant ownership and resource relationships.
- State-dependent business rules.
- Duplicate or conflicting values.
- Allowed fields for the caller's permission level.

Zod is the proposed validation library.

Validation schemas should be maintained near the relevant API contracts and reused where appropriate, without treating client-side validation as a security boundary.

The backend must independently validate all security-sensitive and business-critical rules.

---

## 13. Security and Privacy Requirements

The API must:

1. Enforce authentication and authorization server-side.
2. Apply restaurant-level data isolation.
3. Prevent insecure direct-object-reference attacks.
4. Rate-limit login, OTP, public reservation, QR entry, and sensitive endpoints.
5. Protect staff sessions against CSRF where cookie-based authentication requires it.
6. Store passwords using an appropriate password-hashing algorithm.
7. Keep secrets in environment or managed secret configuration, never in source code.
8. Verify payment webhook signatures.
9. Avoid exposing internal database errors and stack traces.
10. Redact credentials, OTPs, payment secrets, and sensitive personal data from logs.
11. Enforce appropriate CORS and security-header policies.
12. Define retention and deletion rules for personal data.
13. Audit sensitive administrative, financial, and inventory operations.
14. Prevent clients from modifying trusted totals, roles, payment states, or stock balances directly.
15. Use HTTPS in deployed environments.

The guest-access design must receive particular scrutiny because QR codes may be photographed, shared, or reused.

---

## 14. Observability and Operational Behavior

Every request should have a traceable request ID.

The API should record:

- Request ID and timestamp.
- Route and HTTP method.
- Response status.
- Duration.
- Authenticated actor or safe actor reference.
- Relevant restaurant scope.
- Sanitized error category.
- Dependency failures and retry outcomes.

Logs must not contain passwords, OTP values, session secrets, full payment credentials, or unnecessary personal information.

Metrics should cover request latency, error rates, database failures, payment-provider failures, webhook processing, reservation conflicts, and background-job failures.

Health endpoints may be added for deployment monitoring, but must not reveal credentials or internal system details.

---

## 15. API Testing and Acceptance Criteria

The API contract is ready for implementation planning only when the following criteria are satisfied:

- [ ] Every MVP user journey maps to one or more defined API operations.
- [ ] Every endpoint has a documented purpose, access rule, request, response, and error behavior.
- [ ] The authentication and guest-access model is approved.
- [ ] Restaurant-level authorization is consistently defined.
- [ ] Order, reservation, kitchen, bill, payment, and inventory state transitions are documented.
- [ ] Monetary calculations and rounding policies are approved.
- [ ] Idempotency behavior is defined for sensitive create operations.
- [ ] Reservation and table-session concurrency behavior is documented.
- [ ] Payment-provider success and failure handling is documented.
- [ ] Webhook signature verification and event deduplication are defined.
- [ ] Pagination, sorting, filtering, and date-range conventions are consistent.
- [ ] Rate limits and sensitive-data logging rules are documented.
- [ ] Contract tests can verify valid responses and standard errors.
- [ ] Authorization tests cover cross-restaurant and cross-customer access attempts.
- [ ] Retry tests cover duplicate orders, reservations, payments, refunds, and stock movements.
- [ ] The endpoint inventory is reconciled with the approved MVP scope.

---

## 16. Open Decisions Before Approval

The following questions must be resolved or explicitly deferred before their associated endpoints are implemented.

### Authentication and identity

1. Will customer accounts be mandatory, optional, or absent for MVP?
2. How will a guest securely retrieve order and reservation details?
3. Will staff authentication use cookie-based sessions, and what are the expiry and CSRF rules?
4. What password recovery and staff invitation flows are required?

### Ordering

5. Can customers edit an order after submission?
6. Which order states permit cancellation?
7. How are scheduled pre-orders confirmed and released to the kitchen?
8. Can a table session contain orders from multiple customers?
9. How are item-level cancellations, unavailable items, and partial fulfillment handled?

### Reservations

10. Are tables assigned during booking or at check-in?
11. How will combined tables, variable seating durations, and capacity constraints be represented?
12. Which reservations require deposits, and what are the cancellation and no-show policies?
13. What OTP expiry, retry, and attempt limits are required?

### Billing and payments

14. Can a bill contain multiple orders?
15. Can a service session have multiple bills?
16. Are split payments, split bills, tips, service charges, and partial payments required in MVP?
17. Which payment provider will be integrated first?
18. What are the cash reconciliation and refund approval rules?
19. How will payment reconciliation work if a provider callback is delayed or missing?

### Inventory

20. Which inventory movement types are required for MVP?
21. When is recipe-based stock deducted: order placement, kitchen acceptance, preparation start, or completion?
22. Are negative stock balances permitted?
23. Is ingredient-level unit conversion required in MVP?

### Platform behavior

24. Will real-time updates use SSE or WebSockets?
25. Is a transactional outbox required in the first release?
26. What retention rules apply to audit logs, payment events, OTP attempts, and idempotency records?
27. Which reports are required for MVP, and how are sales, taxes, discounts, and refunds calculated?
28. Which endpoints are mandatory for the first single-restaurant deployment versus later SaaS expansion?

These decisions should be recorded in the project decision log rather than silently inferred during implementation.

---

## 17. Final Status

**Document 07 is a proposed API contract, not an implementation specification that is already fully approved.**

It provides an initial endpoint inventory, representative contracts, shared conventions, and critical reliability requirements.

Before coding begins, the API must be reconciled with:

- Document 02 — Product Requirements.
- Document 03 — User Journeys and Workflows.
- Document 04 — UX Information Architecture.
- Document 05 — System Architecture.
- Document 06 — Database Design and ERD.

Any change to an entity, workflow, permission, or state transition must be reflected in the relevant documents to prevent contradictions.

**Next document:** Document 08 — Authentication, Authorization & Security Design.
