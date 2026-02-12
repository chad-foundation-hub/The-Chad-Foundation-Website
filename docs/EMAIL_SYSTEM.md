# 📧 The Chad Foundation Email System

## Overview

This feature sends a branded "Thank You" email to donors immediately after a successful donation. It replaces the generic Stripe receipt with a warm, personalized message that includes:

- Donor Name
- Donation Amount
- Specific "Impact Message" based on the selected Fund.
- A link to the official Stripe Receipt (PDF).
- A reminder about Corporate Matching Gifts.

## 🛠 Architecture

- **Trigger:** Stripe Webhook (`checkout.session.completed`)
- **Backend:** Netlify Functions (Node.js)
- **Email Service:** [Resend](https://resend.com)
- **DNS Verification:** DKIM and SPF records managed in Netlify DNS.

## 🔑 Environment Variables

To run this locally or in production, you need:

- `RESEND_API_KEY`: The API key from Resend.com.
  - _Production:_ Uses the verified domain key.
  - _Dev/Test:_ Uses a separate test key to prevent spamming real users.
- `ADMIN_EMAIL`: The email address for internal admin notifications.
  - _Recipient:_ Organization admin who receives transaction alerts.

## 📂 Code Structure

### 1. `netlify/functions/stripe-webhook.js`

The main entry point. It handles:

1. Verifying the Stripe Signature.
2. Saving the donation to the Postgres Database.
3. Retrieving the **Receipt URL** (by expanding the `payment_intent`).
4. Calling `sendThankYouEmail()` for user receipts.
5. Calling `sendAdminEmail()` for internal notifications.

### 2. `netlify/functions/utils/send-email.js`

A helper function that constructs the HTML email for donors.

- **Dynamic Funds:** It uses a `fundMessages` object to map the user's selected fund (e.g., "Safe Driver Campaign") to a specific thank-you sentence.
- **Safety:** It catches errors internally so that if an email fails, the Webhook still returns a `200 OK`.

### 3. `netlify/functions/utils/send-admin-email.js`

A helper function that constructs internal alert emails for the organization admin.

- **Trigger:** Called immediately after a successful Stripe Checkout (`checkout.session.completed`).
- **Recipient:** Defined by the `ADMIN_EMAIL` environment variable.
- **Templates:**
  - **Product Orders:** Includes Shipping Address and a direct link to the [Fulfillment Google Sheet](https://docs.google.com/spreadsheets).
  - **Donations:** Includes Donor Name, Email, Amount, Fund Designation, **Dedication (if present)**, and a link to the [Stripe Dashboard](https://dashboard.stripe.com).
- **Conditional Logic:** Email subject and content differ based on transaction `type` (product vs. donation).

### Configuration

To change the recipient of admin alerts:

1. Go to **Netlify Site Settings** → **Build & Deploy** → **Environment**.
2. Update the `ADMIN_EMAIL` variable.
3. Save changes.
4. **Redeploy is NOT required** — Environment variables update instantly for serverless functions.

---

## ⚙️ Receipt URL Logic

Stripe's `checkout.session` object does **not** contain the PDF receipt URL directly. We retrieve it using this logic:

```javascript
// We pass an object as the second argument, containing the expand array
const paymentIntent = await stripe.paymentIntents.retrieve(
  session.payment_intent,
  { expand: ["latest_charge"] },
);
const receiptUrl = paymentIntent.latest_charge?.receipt_url;
```

## 🧪 How to Test

### Local Development

1. Start Netlify Dev: `netlify dev` (Port 8888)
2. Start Stripe Listen: `stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook`
3. **Real Test:** Go to `localhost:8888`, donate $1 using a Test Card (4242 4242 4242 4242).
4. **Mock Test:** Use Stripe CLI (Note: This simulates the event but often lacks the Receipt URL):

```bash
stripe trigger checkout.session.completed --add checkout_session:customer_email=you@example.com
```

## 📝 DNS Configuration

For emails to land in the Inbox (not Spam), the domain `chad-foundation.org` was verified on Resend.

- **Records:** MX, TXT (SPF), and TXT (DKIM).
- **Management:** These records are stored in Netlify DNS.
