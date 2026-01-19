# 🗄️ Database Architecture

We use **Neon (Serverless Postgres)** provisioned via the Netlify Marketplace.

## 🔑 Access & Configuration

The application connects to the database using the connection string found in the Environment Variables.

- **Production:** Managed by Netlify (`NETLIFY_DATABASE_URL`).
- **Local:** Set in your `.env` file.

## 🛠️ Scripts

We have custom scripts in the `/scripts` folder to manage the DB.

| Command                           | Description                                                 |
| :-------------------------------- | :---------------------------------------------------------- |
| `node scripts/test-db.js`         | **Safe.** Checks connectivity and returns the row count.    |
| `node scripts/init-db.js`         | **Safe.** Creates the table only if it doesn't exist.       |
| `node scripts/init-db.js --reset` | **⚠️ Destructive.** Wipes all data and recreates the table. |

## 📐 Schema: `donations`

Stores all successful transactions from Stripe Webhooks.

| Column                       | Type   | Notes                                        |
| :--------------------------- | :----- | :------------------------------------------- |
| `id`                         | SERIAL | Primary Key                                  |
| `stripe_checkout_session_id` | TEXT   | **Unique.** Prevents duplicate processing.   |
| `amount_cents`               | BIGINT | Stored in cents to avoid float errors.       |
| `raw_event`                  | JSONB  | Stores the full Stripe payload for auditing. |
| ...                          | ...    | (List other columns here)                    |

## 🚑 Troubleshooting

**Error: "The server does not support SSL connections"**

- Ensure your client config includes `ssl: { rejectUnauthorized: false }`. This is required because Neon uses self-signed certificates.
