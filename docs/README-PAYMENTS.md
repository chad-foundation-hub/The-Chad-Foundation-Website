# 💳 Payments System & Runbook

> **System Owner:** Vijay Khot
> **Primary Tech Stack:** React, Netlify Functions, Stripe, Neon (Postgres), Resend.

## 📖 Overview

This document serves as the **Master Runbook** for the Chad Foundation's payment infrastructure. It covers the end-to-end flow of Donations, Recurring Subscriptions, and Product Orders.

For deep dives into specific components, see the detailed documentation:

- **Webhooks & Testing:** [docs/WEBHOOKS.md](docs/WEBHOOKS.md)
- **Email Receipts:** [docs/EMAIL.md](docs/EMAIL.md)
- **Database Schema:** [docs/DATABASE.md](docs/DATABASE.md)
- **Product Fulfillment:** [docs/KEYCHAIN_PURCHASE.md](docs/KEYCHAIN_PURCHASE.md)

---

## 🏗️ System Architecture

The payment system follows a **Serverless Event-Driven Architecture**:

1.  **Frontend:** User selects "One-Time", "Monthly", or buys a "Keychain".
2.  **API:** `create-checkout-session.js` generates a Stripe Session URL.
3.  **Payment:** User pays on Stripe's hosted page.
4.  **Webhook:** Stripe sends an event (`checkout.session.completed` or `invoice.paid`) to `stripe-webhook.js`.
5.  **Persistence:** Transaction is saved to **Neon Postgres**.
6.  **Notification:**
    - Donor receives a branded HTML email (via Resend).
    - Admin receives an alert.
    - (If Product) Order is synced to Google Sheets.

---

## ⚡ Quick Start (Local Dev)

To develop or test payment logic locally, you need two terminal windows.

### Terminal 1: Backend

Start the Netlify server to run the functions.

```bash
netlify dev

```

### Terminal 2: Stripe Tunnel

Forward Stripe events to your local machine.

```bash
stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook

```

---

## 🔑 Environment Variables (Master List)

Ensure these are set in **Netlify Site Settings** (Production) and `.env` (Local).

| Variable                     | Description                                          | Criticality |
| ---------------------------- | ---------------------------------------------------- | ----------- |
| `STRIPE_SECRET_KEY`          | Secret Key (`sk_...`) for creating sessions.         | 🔴 High     |
| `STRIPE_WEBHOOK_SECRET`      | Signing Secret (`whsec_...`) for verifying webhooks. | 🔴 High     |
| `NETLIFY_DATABASE_URL`       | Postgres connection string (Neon).                   | 🔴 High     |
| `RESEND_API_KEY`             | API Key for sending emails.                          | 🟡 Medium   |
| `STRIPE_CUSTOMER_PORTAL_URL` | Link for donors to manage subscriptions.             | 🟢 Low      |
| `ADMIN_EMAIL`                | Recipient for internal alerts.                       | 🟢 Low      |
| `GOOGLE_SHEET_ID`            | (Product Only) Fulfillment Sheet ID.                 | 🟢 Low      |

---

## 🏃‍♂️ Operations Runbook

### 1. How to Check Logs

If a donation fails to save or an email isn't sent:

1. Log in to **Netlify Dashboard**.
2. Go to **Logs** > **Functions**.
3. Select `stripe-webhook`.
4. Look for `❌ Error` or `⚠️ Warning` messages.

### 2. How to Rotate Secrets

If a key is compromised or expired:

**A. Stripe Keys:**

1. Go to Stripe Dashboard > Developers > API Keys.
2. Roll the key.
3. Update `STRIPE_SECRET_KEY` in Netlify immediately.
4. **Impact:** Payments will fail until updated.

**B. Webhook Secret:**

1. Go to Stripe Dashboard > Developers > Webhooks.
2. "Reveal" or "Roll" the signing secret.
3. Update `STRIPE_WEBHOOK_SECRET` in Netlify.
4. **Impact:** Webhooks will be rejected (400 Error) until updated.

### 3. Emergency: Stop Recurring Payments

If the automation goes haywire (e.g., double charging):

1. Log in to **Stripe Dashboard**.
2. Go to **Payments** > **Subscriptions**.
3. Select the affected subscription(s).
4. Click **Cancel Subscription** > **Immediately**.
5. _This stops the billing at the source (Stripe), bypassing our code entirely._

---

## 🧪 Testing Cheatsheet

| To Test...            | Run This Command                                                              |
| --------------------- | ----------------------------------------------------------------------------- |
| **One-Time Donation** | `stripe trigger checkout.session.completed`                                   |
| **Recurring Renewal** | `stripe trigger invoice.paid --add invoice:billing_reason=subscription_cycle` |
| **Product Purchase**  | _Manual test required via localhost UI_                                       |
