require("dotenv").config();
const { Client } = require("pg");

const connectionString =
  process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: Missing database connection string.");
  console.error(
    "   Please set NETLIFY_DATABASE_URL or DATABASE_URL in your .env file.",
  );
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
  // We disable strict SSL verification because Neon uses self-signed/dynamic certs
  // that are safe but not in the default Node trust store.
  ssl: { rejectUnauthorized: false },
});

async function testConnection() {
  try {
    await client.connect();
    const res = await client.query("SELECT count(*) FROM donations");
    console.log("✅ Row count:", res.rows[0].count);
  } catch (err) {
    console.error("❌ Database connection error:", err);
  } finally {
    await client.end();
  }
}

testConnection();
