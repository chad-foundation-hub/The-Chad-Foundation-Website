# 📊 Google Sheets Order Fulfillment Sync

## 1. Overview

This system provides a **"Zero-UI" fulfillment dashboard** for the non-profit owner. When a user purchases a physical product (e.g., Keychain), the order details are automatically appended to a secure Google Sheet.

This allows the owner to track, package, and ship items without needing to log into the Stripe Dashboard or database.

## 2. Architecture

### Data Flow

1. **Trigger:** User completes a checkout for a product on Stripe.
2. **Webhook:** `stripe-webhook.js` receives the `checkout.session.completed` event.
3. **Filter:** The webhook checks if `metadata.type === 'product'`.
4. **Sync:** The `appendToSheet` utility function is called.
5. **Auth:** The system authenticates with Google APIs using a **Service Account**.
6. **Action:** A new row is appended to the "Chad Foundation Orders" spreadsheet.

### Failure Strategy (Fail Open)

The sync process is wrapped in a `try/catch` block within the utility function.

- **Success:** Order is logged, and execution continues.
- **Failure:** The error is logged to the console (`❌ Google Sheet Sync Failed`), but **the Webhook does NOT crash**.
- _Reasoning:_ We must ensure the user still receives their confirmation email and the database record is created, even if Google Sheets is down.

## 3. Configuration & Credentials

### A. Environment Variables

The feature relies on three critical environment variables in `.env` (Local) and Netlify (Production):

| Variable                       | Description                           | Example Format                                  |
| ------------------------------ | ------------------------------------- | ----------------------------------------------- |
| `GOOGLE_SHEET_ID`              | The ID string found in the Sheet URL. | `1BxiMVs0...`                                   |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | The "robot" email address.            | `sheets-bot@project-id.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY`           | The RSA key for the service account.  | `-----BEGIN PRIVATE KEY-----\n...`              |

> **⚠️ Critical Note on Private Keys:**
> The private key contains newline characters (`\n`). In `.env` files and Netlify UI, these must be handled carefully. The code automatically replaces literal `\n` strings with actual newline characters:
> `private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')`

## 4. Technical Implementation Details

### Dependencies

- **Library:** `google-spreadsheet`
- **Version Constraint:** **v3.3.0** (Strict)
- _Why?_ The project uses CommonJS (`require`). Newer versions of this library are ESM-only and break the Netlify Functions build. **Do not upgrade this package** without migrating the entire project to ESM.

### Address Extraction Logic

Stripe sessions store shipping addresses in different locations depending on the payment flow. The code attempts to resolve the address using the following priority:

1. `session.shipping_details` (Direct object)
2. `session.collected_information.shipping_details` (Payment Intent wrapper)

```javascript
// Logic used in append-to-sheet.js
const shippingDetails =
  orderData.shipping_details ||
  orderData.collected_information?.shipping_details ||
  null;
```

## 5. Troubleshooting

### Common Errors

| Error Message                                        | Cause                                                           | Fix                                                                        |
| ---------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `invalid_grant: Invalid grant: account not found`    | The `GOOGLE_SERVICE_ACCOUNT_EMAIL` is wrong or contains a typo. | Check for trailing spaces in the env var.                                  |
| `error:0909006C:PEM routines:get_name:no start line` | The `GOOGLE_PRIVATE_KEY` is formatted incorrectly.              | Ensure the key includes `-----BEGIN PRIVATE KEY-----` and handles `\n`.    |
| `Caller does not have permission`                    | The Service Account is not shared on the Sheet.                 | Open the Google Sheet > Share > Add the Service Account Email as "Editor". |
| `require() of ES Module ... not supported`           | Library version mismatch.                                       | Downgrade to `npm install google-spreadsheet@3.3.0`.                       |

## 6. Maintenance

To rotate keys or change the destination sheet:

1. **New Sheet:** Create a new Google Sheet, share it with the Service Account email, and update `GOOGLE_SHEET_ID` in Netlify.
2. **New Keys:** Generate a new JSON key in Google Cloud Console, update `GOOGLE_PRIVATE_KEY` in Netlify, and redeploy.
