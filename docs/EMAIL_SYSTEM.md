# 📧 The Chad Foundation Email System

## Overview

This feature sends a branded "Thank You" email to donors immediately after a successful transaction. It replaces the generic Stripe receipt with a warm, personalized message that includes:

- **Donor Name** & **Amount**.
- **Impact Message** specific to the selected Fund.
- **Official Receipt Link** (PDF) from Stripe.
- **Subscription Management Link** (for recurring donors).
- **Corporate Matching Gift** reminder.

## 🛠 Architecture

- **Triggers:**
  1. `checkout.session.completed` (First Payment / One-Time).
  2. `invoice.paid` (Monthly Recurring Renewals).
- **Backend:** Netlify Functions (Node.js).
- **Email Service:** [Resend](https://resend.com).
- **Self-Service:** [Stripe Customer Portal](https://dashboard.stripe.com/settings/billing/portal).

## 🔑 Environment Variables

To run this locally or in production, you need:

- `RESEND_API_KEY`: The API key from Resend.com.
- `ADMIN_EMAIL`: The recipient for internal alerts.
- `STRIPE_CUSTOMER_PORTAL_URL`: **(New)** The static link to the Stripe Customer Portal for managing subscriptions.
- `GOOGLE_SHEET_ID`: For tracking product fulfillment.

---

## 📂 Code Structure

### 1. `netlify/functions/stripe-webhook.js`

The main entry point. It now handles two distinct events:

- **Checkout Completed:**
  - Saves the **First Donation** to the DB.
  - Retrieves the receipt via `payment_intent`.
  - Triggered by `checkout.session.completed`.
- **Invoice Paid (Recurring):**
  - Saves **Renewal Donations** to the DB.
  - Retrieves the receipt via `invoice.hosted_invoice_url`.
  - Recovers "Fund" metadata from the Subscription object if missing on the invoice.
  - Triggered by `invoice.paid`.

### 2. `netlify/functions/utils/send-email.js`

A helper function that constructs the HTML email.

- **Dynamic Subject Line:** Changes based on `isRecurring` (e.g., "Monthly Donation Receipt").
- **Subscription Link:** If `isRecurring` is true, it appends a "Manage My Monthly Donation" link pointing to `STRIPE_CUSTOMER_PORTAL_URL`.
- **Safety:** Catches errors internally so webhooks always return `200 OK`.

### 3. `netlify/functions/utils/send-admin-email.js`

Sends internal alerts to the organization admin (`ADMIN_EMAIL`).

- **Alert Types:**
  - **New Donation:** One-time gifts.
  - **Recurring Renewal:** Monthly automatic payments.
  - **Product Order:** Includes shipping address.

---

## ⚙️ Receipt URL Logic

We use different logic depending on the transaction type:

1. **One-Time Donation:**

   ```javascript
   const paymentIntent = await stripe.paymentIntents.retrieve(
     session.payment_intent,
     {
       expand: ["latest_charge"],
     },
   );
   const receiptUrl = paymentIntent.latest_charge?.receipt_url;
   ```

2. **Recurring Renewal:**
   ```javascript
   // Invoices have the URL directly
   const receiptUrl = invoice.hosted_invoice_url;
   ```

---

## 🧪 How to Test

### Local Development

1. Start Netlify Dev: `netlify dev`
2. Start Stripe Listen: `stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook`

### Scenarios

| Scenario              | Command                                                                       | Expected Outcome                                        |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| **One-Time Donation** | `stripe trigger checkout.session.completed`                                   | Email subject: "Thank You for Your Support"             |
| **Recurring Renewal** | `stripe trigger invoice.paid --add invoice:billing_reason=subscription_cycle` | Email subject: "Monthly Donation Receipt" + Portal Link |

---

## 📝 DNS Configuration

For emails to land in the Inbox (not Spam), the domain `chad-foundation.org` is verified on Resend with MX, SPF, and DKIM records managed in Netlify DNS.
