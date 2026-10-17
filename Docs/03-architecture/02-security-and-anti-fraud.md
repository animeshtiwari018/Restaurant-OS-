# RESTRO MANAGE — Document 02: Security & Anti-Fraud Architecture

**Project:** RESTRO MANAGE  
**Document ID:** RM-SEC-001  
**Version:** 1.0  
**Source Document:** [worklow.md](file:///d:/Computer%20science/Restaurant%20Management%20system/worklow.md) (Section 10)

---

## 1. Layered Defense Architecture

Because restaurant environments suffer from malicious QR manipulation, prank orders, and concurrent staff contention, Restro Manage implements a multi-layered security and verification architecture:

$$\text{Opaque QR Token} \longrightarrow \text{Phone OTP Verification} \longrightarrow \text{Physical Waiter Verification Gate} \longrightarrow \text{Kitchen Release}$$

---

## 2. Opaque QR Tokens & URL Manipulation Defense

- **Non-Sequential Identifiers:** Table URLs do not expose sequential database IDs (e.g., `/table/5` is forbidden).
- **Cryptographic Randomness:** Every physical table receives an opaque 32-character hexadecimal token generated from 16 secure random bytes (128 bits of entropy):
  $$\text{URL: } \texttt{https://restro.app/t/a8f2c3d4e5f6...}$$
- **Hashed Token Storage:** The database stores a SHA-256 cryptographic hash of the token rather than reusable plaintext.
- **Token Rotation & Revocation:** Administrators can revoke or rotate a table's QR token immediately from the dashboard without deleting table history. Revoked tokens cannot initiate new dining sessions.

---

## 3. Phone Number & OTP Verification

To prevent automated cart submission and spam orders:
- Submitting an order or confirming a reservation requires phone number + OTP verification.
- **Rate-Limiting Controls:**
  - Maximum 3 OTP requests per phone number / IP within a 15-minute window.
  - Strict 5-minute expiry on generated OTPs.
  - Constant-time verification to prevent timing attacks.
  - Single-use consumption: once verified, the token is invalidated.

---

## 4. Physical Waiter Verification Gate (Anti-Prank Enforcement)

GPS and browser geolocation cannot reliably pinpoint whether a diner is at Table 4 or Table 6. Restro Manage relies on physical human verification:
1. When submitted, the order is locked in `PENDING_VERIFICATION`.
2. The kitchen display system will **never** receive the order in this state.
3. The assigned waiter must physically visit the table, confirm that the party is present, confirm the items and allergy instructions, and enter their confirmation code/tap confirm on their staff terminal.
4. If no customer is at the table, the waiter marks the order `REJECTED`, logging the fraud attempt with audit metadata.

---

## 5. Staff Role-Based Access Control (RBAC)

- Staff authentication utilizes secure, HTTP-only, SameSite cookies with short-lived JWT access tokens and database-backed session revocation.
- Middleware verifies permissions on every endpoint:
  - `requireRole(['ADMIN', 'MANAGER'])` for menu editing, pricing, refunds.
  - `requireRole(['WAITER', 'MANAGER'])` for order claiming, verification, table service.
  - `requireRole(['KITCHEN_STAFF', 'MANAGER'])` for KDS prep status changes.
  - `requireRole(['CASHIER', 'MANAGER'])` for bill finalization and cash payments.

---

## 6. Nutritional Data Integrity & Transparency

- Nutritional and allergen claims carry legal and health implications.
- The platform enforces structured data entry with required reporting bases (`PER_SERVING` or `PER_100_GRAMS`).
- The system forbids fabricating nutritional values. If a dish lacks lab-tested or verified restaurant nutrition data, it must be marked `UNVERIFIED` / `UNAVAILABLE`.
- Allergen filters display clear disclaimers that they are informational aids based on restaurant-disclosed ingredients and known cross-contact risks.
