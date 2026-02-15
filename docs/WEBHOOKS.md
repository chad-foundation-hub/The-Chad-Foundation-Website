# 🪝 Stripe Webhook & Recurring Donations Documentation

This document outlines how to develop, test, and deploy the Stripe Webhook for The Chad Foundation. The webhook handles **One-Time Donations**, **Recurring Subscriptions**, and **Product Orders**, persisting all transaction data into the Neon Postgres database.

## 1. Architecture Overview

- **Endpoint:** `POST /.netlify/functions/stripe-webhook`
- **Triggers (Events):**
  1. `checkout.session.completed`: Handles the **First Payment** (One-time or Subscription start).
  2. `invoice.paid`: Handles **Recurring Renewals** (Subsequent monthly payments).
- **Database:** Connects to Neon Postgres to insert a row into the `donations` table.
- **Security:** Verifies the cryptographic `Stripe-Signature` header.
- **Platform:** Netlify Functions (Serverless Node.js).

## 2. Prerequisites

Ensure you have the following installed globally:

- **Netlify CLI:** `npm install -g netlify-cli`
- **Stripe CLI:** [Installation Guide](https://stripe.com/docs/stripe-cli)

### Environment Variables (.env)

For local testing to work, your `.env` file must contain:

1. `STRIPE_SECRET_KEY` (sk*test*...)
2. `STRIPE_WEBHOOK_SECRET` (whsec*test*...)
3. `NETLIFY_DATABASE_URL` (postgres://...)
4. `ADMIN_EMAIL` & `FROM_EMAIL` (For notification testing)

---

## 3. Local Development (Testing)

Since webhooks originate from the cloud (Stripe), you cannot test them by simply visiting a URL. You must tunnel events to your localhost using the Stripe CLI.

### Step 1: Start the Local Backend

Start the Netlify development server to host your functions.

```bash
# Terminal 1
netlify dev

```

- **Verify:** Ensure the server is running on `http://localhost:8888`.

### Step 2: Forward Stripe Events

Open a second terminal to create a tunnel. This tells Stripe to forward events to your local function.

```bash
# Terminal 2
stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook

```

### Step 3: Configure Secrets

When you run the command in Step 2, Stripe CLI will output a **Webhook Signing Secret**.

> `> Ready! Your webhook signing secret is whsec_test_12345...`

1. Copy this secret.
2. Update your local `.env` file: `STRIPE_WEBHOOK_SECRET=whsec_test_12345...`
3. **Restart Terminal 1** (`netlify dev`) to load the new environment variable.

---

## 4. Testing Scenarios

### A. Test One-Time Donation (First Payment)

Open a third terminal to simulate a successful checkout session.

```bash
# Terminal 3
stripe trigger checkout.session.completed

```

**Success Check:**

1. **Logs:** `💰 FULFILLMENT: Recording 1000 cents...`
2. **DB:** A new row is inserted with `stripe_checkout_session_id`.

### B. Test Recurring Renewal (Next Month's Payment)

To test a renewal without modifying code, we must inject the `billing_reason` that the webhook expects.

**Command:**

```bash
stripe trigger invoice.paid --add invoice:billing_reason=subscription_cycle
```

Success Check:

Logs: You should see 🔄 RECURRING PAYMENT... and ✅ Donation saved.

Note: You do NOT need to edit stripe-webhook.js if you use this command.

## 5. Production Configuration

### Step 1: Add Endpoint in Stripe (Critical Update)

1. Go to **Stripe Dashboard** (Live Mode) > **Developers** > **Webhooks**.
2. Click **Add Endpoint**.
3. **Endpoint URL:** `https://your-site-domain.org/.netlify/functions/stripe-webhook`
4. **Events:** You MUST select **BOTH** events:

- `checkout.session.completed` (For initial sales)
- `invoice.paid` (For monthly renewals)

5. Click **Add Endpoint**.

### Step 2: Set Netlify Environment Variables

Ensure the following are set in **Netlify Dashboard** > **Site Settings** > **Environment Variables**:

1. `STRIPE_WEBHOOK_SECRET` (From the Stripe Dashboard).
2. `NETLIFY_DATABASE_URL` (From Neon).
3. **Trigger a new deploy** to ensure the functions pick up the new variables.

---

// ...existing code...

## 6. Troubleshooting

| Error                                | Cause                        | Fix                                                                                   |
| ------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------- |
| **400 Webhook Error: No signatures** | Secrets mismatch.            | Check if you are using the _CLI Test Secret_ in Production, or vice versa.            |
| **Renewal not saving to DB**         | Wrong Event Type.            | Ensure you added `invoice.paid` to the Stripe Dashboard events list.                  |
| **Renewal ignored in logs**          | Safety Check(billing_reason) | Use the --add invoice:billing_reason=subscription_cycle flag when triggering via CLI. |
| **Metadata is N/A**                  | Using `stripe trigger`.      | This is normal. The CLI sends generic test data. Real donations will have metadata.   |
