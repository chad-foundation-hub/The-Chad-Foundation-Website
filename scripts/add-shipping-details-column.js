const { Client } = require("pg");

const connectionString =
  process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: No database connection string found.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    await client.connect();
    console.log("🔌 Connected to database...");

    // ✅ FIX: Removed unused 'const result ='
    await client.query(`
      ALTER TABLE donations
      ADD COLUMN IF NOT EXISTS shipping_details JSONB;
    `);

    console.log("✅ Migration successful: 'shipping_details' column added.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await client.end();
  }
})();
