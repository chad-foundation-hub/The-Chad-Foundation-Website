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
        stripe_checkout_session_id VARCHAR(255) UNIQUE NOT NULL,
        donor_email VARCHAR(255),
        donor_name VARCHAR(255),
        amount_cents INTEGER,
        currency VARCHAR(10),
        type VARCHAR(50) DEFAULT 'donation',
        product_sku VARCHAR(50),
        add_on BOOLEAN DEFAULT FALSE,
        status VARCHAR(50),
        raw_event JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        shipping_details JSONB  
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
