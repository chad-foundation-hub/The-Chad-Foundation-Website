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
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.STRIPE_WEBHOOK_SECRET ||
    !process.env.NETLIFY_DATABASE_URL
  ) {
    console.error("❌ Missing required environment variables");
    return { statusCode: 500, body: "Server configuration error" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const sig = event.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    console.error("⚠️  Missing Stripe-Signature header");
    return {
      statusCode: 400,
      body: "Webhook Error: Missing Stripe-Signature header",
    };
  }

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

    // --- FUND VALIDATION LOGIC ---
    const fundRaw = session.metadata?.fund || "Unspecified";
    let finalFund = fundRaw;
    if (!VALID_FUNDS.includes(fundRaw)) {
      console.warn(
        `⚠️  Warning: Unknown Fund "${fundRaw}". Marking as General.`,
      );
      finalFund = "General Donation";
    }

    if (session.metadata) {
      session.metadata.fund = finalFund;
    }

    if (session.payment_status === "paid") {
      const amount = session.amount_total;
      const currency = session.currency;
      const userRaw =
        session.metadata?.user ||
        session.customer_details?.email ||
        "Anonymous";

      console.log(
        `💰 FULFILLMENT: Recording ${amount} cents for ${finalFund} by ${userRaw}`,
      );

      // --- DATABASE PERSISTENCE ---
      const client = new Client({
        connectionString: process.env.NETLIFY_DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });

      try {
        await client.connect();

        // Extract Data
        const donor_email = session.customer_details?.email || null;
        const type = session.metadata?.type || "donation";
        const product_sku = session.metadata?.product_sku || null;

        const add_on = session.metadata?.add_on === "true";

        const query = `
          INSERT INTO donations (
            stripe_checkout_session_id,
            donor_email,
            amount_cents,
            currency,
            type,
            product_sku,
            add_on,
            status,
            raw_event
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (stripe_checkout_session_id) DO NOTHING;
        `;

        const values = [
          session.id,
          donor_email,
          amount,
          currency,
          type,
          product_sku,
          add_on,
          session.payment_status,
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
  } else {
    console.log(`ℹ️  Unhandled Stripe event type: ${stripeEvent.type}`);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
