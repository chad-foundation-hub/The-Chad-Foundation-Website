# 🛡️ Security Architecture

## 1. Database Connection

We enforce **Strict SSL Verification** for all database connections.

- **Provider:** Neon (Postgres)
- **Method:** `ssl: { rejectUnauthorized: true }`
- **Verification:** Uses the **ISRG Root X1** Certificate Authority (CA) to prevent Man-in-the-Middle (MITM) attacks.

## 2. Webhook Integrity

All incoming webhooks from Stripe are verified using cryptographic signatures.

- **Header:** `Stripe-Signature`
- **Method:** `stripe.webhooks.constructEvent(...)`
- **Policy:** Any request with an invalid or missing signature is rejected immediately (400 Bad Request).

## 3. Dependency Management

We regularly audit our `package.json` using `npm audit` to identify and patch known vulnerabilities in third-party libraries.
