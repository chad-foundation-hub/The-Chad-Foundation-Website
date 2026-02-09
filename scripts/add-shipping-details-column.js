require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    await client.connect();
    console.log("🔌 Connected to database...");
    
    const result = await client.query(`
      ALTER TABLE donations 
      ADD COLUMN IF NOT EXISTS shipping_details JSONB;
    `);
    
    console.log("✅ Column added successfully");
    
    // Verify it exists
    const verify = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'donations' 
      AND column_name = 'shipping_details';
    `);
    
    if (verify.rows.length > 0) {
      console.log("✅ Verified:", verify.rows[0]);
    } else {
      console.log("❌ Column not found after creation!");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
})();
