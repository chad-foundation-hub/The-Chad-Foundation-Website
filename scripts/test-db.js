require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    await client.connect();
    const res = await client.query("SELECT count(*) FROM donations");
    console.log("✅ Row count:", res.rows[0].count);
    await client.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();
