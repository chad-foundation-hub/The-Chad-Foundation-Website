require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  connectionString:
    process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const dropTableQuery = `DROP TABLE IF EXISTS donations;`;

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    stripe_checkout_session_id TEXT UNIQUE NOT NULL, -- Critical for deduplication
    donor_email TEXT,
    donor_name TEXT,              -- Kept this as it's useful for "Thank You" emails
    amount_cents BIGINT NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'usd',
    type TEXT NOT NULL,           -- 'donation' | 'product'
    product_sku TEXT,             -- For the keychain (e.g., 'keychain_001')
    add_on BOOLEAN DEFAULT FALSE, -- For Gift Wrap
    status TEXT,                  -- 'succeeded', 'pending'
    raw_event JSONB,              -- Stores the full Stripe payload for auditing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`;

async function initDb() {
  try {
    console.log("🔌 Connecting to Neon Database...");
    await client.connect();

    // 🛡️ SAFETY LATCH: Only drop if explicitly asked
    // Usage: node scripts/init-db.js --reset
    const shouldReset = process.argv.includes("--reset");

    if (shouldReset) {
      console.warn(
        "⚠️  WARNING: Reset flag detected. Dropping 'donations' table...",
      );
      await client.query(dropTableQuery);
    } else {
      console.log("ℹ️  Skipping DROP (Use --reset to wipe the table).");
    }

    console.log("🏗️  Creating 'donations' table (if not exists)...");
    await client.query(createTableQuery);

    console.log("✅ Success! Database is ready.");
  } catch (err) {
    console.error("❌ Error provisioning database:", err.message, err.stack);
  } finally {
    await client.end();
  }
}

initDb();
