const { Client } = require("pg");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const VALID_FUNDS = [
  "General Donation",
  "The Chad Scholarship Program",
  "The Gift of Heart Program",
  "The Gift of Art Program",
  "Life is a Gift: Safe Driver Campaign",
];

exports.handler = async (event) => {
  // 1. Safety Checks
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("❌ Missing Stripe environment variables");
    return { statusCode: 500, body: "Server configuration error" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const sig = event.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  // 2. Verify Signature
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      endpointSecret,
    );
  } catch (err) {
    console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  // 3. Handle Payment Success
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;

    const fundRaw = session.metadata?.fund || "Unspecified";
    let finalFund = fundRaw;
    if (!VALID_FUNDS.includes(fundRaw)) {
      console.warn(
        `⚠️  Warning: Unknown Fund "${fundRaw}". Marking as General.`,
      );
      finalFund = "General Donation";
    }

    if (session.payment_status === "paid") {
      console.log(`💰 FULFILLMENT: Processing donation for ${finalFund}`);

      const client = new Client({
        connectionString: process.env.NETLIFY_DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });

      try {
        await client.connect();

        // Extract Data
        const {
          id: stripe_checkout_session_id,
          amount_total: amount_cents,
          currency,
          customer_details,
          payment_status,
          metadata,
        } = session;

        const donor_email = customer_details?.email || null;
        const donor_name = customer_details?.name || null;

        // Determine type and sku
        const type = metadata?.type || "donation";
        const product_sku = metadata?.product_sku || null;

        // Insert into Database
        const query = `
          INSERT INTO donations (
            stripe_checkout_session_id,
            donor_email,
            donor_name,
            amount_cents,
            currency,
            type,
            product_sku,
            status,
            raw_event
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (stripe_checkout_session_id) DO NOTHING;
        `;

        const values = [
          stripe_checkout_session_id,
          donor_email,
          donor_name,
          amount_cents,
          currency,
          type,
          product_sku,
          payment_status,
          JSON.stringify(stripeEvent),
        ];

        await client.query(query, values);
        console.log("✅ Donation saved to database successfully.");
      } catch (dbError) {
        console.error("❌ Database Error:", dbError);
        return { statusCode: 500, body: "Database Error" };
      } finally {
        await client.end();
      }
    } else {
      console.log(
        `⏳ Payment not paid yet (Status: ${session.payment_status})`,
      );
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
