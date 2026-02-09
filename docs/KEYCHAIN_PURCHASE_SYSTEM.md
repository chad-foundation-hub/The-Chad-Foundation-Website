<!-- filepath: /Users/vijaykhot/The-Chad-Foundation-Website/docs/KEYCHAIN_PURCHASE_SYSTEM.md -->

# Product Purchase Flow (Keychain & Add-Ons)

This document outlines the technical implementation of the Product Purchase flow (specifically the Keychain), which differs from the standard Donation flow.

## 1. Architecture Overview

Unlike donations (where the user sets the price), Products have **fixed backend prices** and support optional **Add-Ons** (like Gift Wrap).

The flow relies on **Stripe Metadata** to carry context (like `product_sku` and `add_on` status) through the payment process so it can be recorded in the Database and Email Confirmation.

## 2. Frontend Implementation

- **Component:** `ChadMissionSupport.js`
- **Endpoint:** `POST /api/create-checkout-session`

**Payload Structure:**

```json
{
  "type": "product",
  "sku": "keychain",
  "addOns": ["GIFT_WRAP"]
}
```

> **Note:** We do NOT send the price or amount from the frontend. The backend calculates the total to prevent tampering.

## 3. Backend Logic (`create-checkout-session.js`)

The backend maps the `sku` and `addOns` to Stripe Price IDs defined in the server configuration.

**Critical Metadata:**
We strictly use **snake_case** for metadata keys to match our Database schema.

- `product_sku`: e.g., "keychain"
- `add_on`: "true" or "false"

## 4. Webhook & Fulfillment (`stripe-webhook.js`)

When `checkout.session.completed` fires, we extract the metadata to perform two actions:

1. **Database Record:**
   - Maps `metadata.product_sku` -> DB Column `product_sku`
   - Maps `metadata.add_on` -> DB Column `add_on` (Boolean)
   - **Note:** If `add_on` is true, the order included the Gift Box.

2. **Email Confirmation:**
   - Passes `type: "product"` to the email handler.
   - **Logic:** If `type === "product"`, the email subject changes to "Order Confirmation" and the body text is adjusted to reflect a purchase rather than a generic donation.

## 5. Testing Guide

To test this flow locally, you need the Stripe CLI running.

1. **Start the Server:** `netlify dev`
2. **Start Stripe Forwarding:**

```bash
stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook
```

3. **Perform Purchase:**
   - Go to `http://localhost:8888`
   - Buy a Keychain (with Gift Wrap checked)
   - Use Stripe Test Card: `4242 4242 4242 4242`
   - Complete payment and verify confirmation email

## 6. Shipping & Fulfillment Data

To support physical product delivery, the system conditionally collects shipping addresses based on the transaction type.

### A. Stripe Configuration (`create-checkout-session.js`)

- **Logic:** The `shipping_address_collection` field is enabled **ONLY** when `type === 'product'`
- **Constraint:** Currently restricted to `allowed_countries: ["US"]` to simplify logistics
- **Donations:** Pure donations do **not** trigger address collection to maintain low friction

### B. Database Schema (`shipping_details`)

We store the raw address data from Stripe in a **JSONB** column in PostgreSQL.

- **Column:** `shipping_details` (JSONB)
- **Structure:**

```json
{
  "address": {
    "city": "Jersey City",
    "country": "US",
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "postal_code": "07302",
    "state": "NJ"
  },
  "name": "John Doe"
}
```

### C. Email Integration

The `sendThankYouEmail` function checks for the existence of this `shipping_details` object.

- **If present:** It injects a "Shipping Address" section into the HTML email
- **If absent:** It sends the standard donation receipt format

**Email Webhook Flow:**

1. `stripe-webhook.js` extracts `session.collected_information.shipping_details`
2. Passes it to `sendThankYouEmail` via the `shipping` parameter
3. Email template renders the address in a styled box with 📦 icon
4. Address is also persisted to database as JSON for fulfillment/tracking

## 7. Future Scalability & Reusability

Currently, the Keychain purchase UI is located on the **Donate Page** (`ChadMissionSupport.js`). However, the backend logic (`/api/create-checkout-session`) is entirely **frontend-agnostic**.

- **Decoupled Logic:** The API cares only about the JSON payload (`sku`, `type`, `addOns`). It does not rely on the user being on any specific page URL
- **Moving the Feature:** If we decide to create a dedicated **Store** or **Shop** page in the future, you can simply move the frontend component (or the `handleKeychainPurchase` function) to the new page. **No backend changes will be required**

## 8. Troubleshooting

| Issue                                   | Solution                                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Shipping address not appearing in email | Check that `shipping_details` exists in database. Verify `type === "product"` in metadata                |
| Address not being collected from Stripe | Ensure `shipping_address_collection` is configured in `create-checkout-session.js` for product purchases |
| Email not sending                       | Verify `RESEND_API_KEY` is set. Check webhook logs for email service errors                              |
