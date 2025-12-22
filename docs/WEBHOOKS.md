# 🪝 Stripe Webhook Documentation

This document outlines how to develop, test, and deploy the Stripe Webhook for The Chad Foundation. The webhook handles asynchronous payment confirmation (e.g., recording donations, sending receipts) securely.

## 1. Architecture Overview

- **Endpoint:** `POST /.netlify/functions/stripe-webhook`
- **Trigger:** Receives events from Stripe (e.g., `checkout.session.completed`).
- **Security:** Verifies the cryptographic `Stripe-Signature` header using the raw request body.
- **Platform:** Netlify Functions (Serverless Node.js).

## 2. Prerequisites

Ensure you have the following installed globally:

- **Netlify CLI:** `npm install -g netlify-cli`
- **Stripe CLI:** [Installation Guide](https://stripe.com/docs/stripe-cli)
- **Docker** (Optional, only if running advanced local emulation, usually not required).

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
2. Open your local `.env` file.
3. Add/Update the variable:

```bash
STRIPE_WEBHOOK_SECRET=whsec_test_12345...

```

4. **Restart Terminal 1** (`netlify dev`) to load the new environment variable.

### Step 4: Trigger a Test Event

Open a third terminal to simulate a successful payment.

```bash
# Terminal 3
stripe trigger checkout.session.completed

```

**Success Check:**
In Terminal 1 (Netlify), you should see logs like:

> `✅ Event Received: checkout.session.completed` > `💰 Payment Captured: ...`

---

## 4. Production Configuration

### Step 1: Add Endpoint in Stripe

1. Go to **Stripe Dashboard** (Live Mode) > **Developers** > **Webhooks**.
2. Click **Add Endpoint**.
3. **Endpoint URL:** `https://your-site-domain.org/.netlify/functions/stripe-webhook`
4. **Events:** Select `checkout.session.completed` and `invoice.paid`.
5. Click **Add Endpoint**.

### Step 2: Set Netlify Environment Variable

1. In the Stripe Dashboard (Webhooks view), locate the **Signing Secret** (top right). It starts with `whsec_...`.
2. Go to **Netlify Dashboard** > **Site Settings** > **Environment Variables**.
3. Create a new variable:

- **Key:** `STRIPE_WEBHOOK_SECRET`
- **Value:** `[Paste the Production Secret from Stripe]`

4. **Trigger a new deploy** to ensure the functions pick up the new variable.

---

## 5. Troubleshooting

| Error                                      | Cause                                                                                                | Fix                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **400 Webhook Error: No signatures found** | The `STRIPE_WEBHOOK_SECRET` in your `.env` (or Netlify) does not match the source sending the event. | Check if you are using the _CLI Test Secret_ in Production, or vice versa.                  |
| **404 Not Found**                          | The URL path is incorrect.                                                                           | Ensure you are sending to `/.netlify/functions/stripe-webhook`, not just `/stripe-webhook`. |
| **500 Internal Server Error**              | Code crashed or missing environment variables.                                                       | Check `process.env.STRIPE_SECRET_KEY` is set. Check Netlify logs.                           |
| **Metadata is N/A**                        | You used `stripe trigger` CLI.                                                                       | This is normal. The CLI sends generic test data. Real donations will have metadata.         |
