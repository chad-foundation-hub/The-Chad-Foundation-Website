const { Client } = require("pg");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sendThankYouEmail } = require("./utils/send-email");

const VALID_FUNDS = [
  "General Donation",
  "The Chad Scholarship Program",
  "The Gift of Heart Program",
  "The Gift of Art Program",
  "Life is a Gift: Safe Driver Campaign",
];

exports.handler = async (event) => {
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

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;

    const amount = session.amount_total;
    const currency = session.currency;
    const donorEmail = session.customer_details?.email || null;
    const donorName = session.customer_details?.name || "Supporter";

    const type = session.metadata?.type || "donation";
    const productSku = session.metadata?.product_sku || null;
    const addOn = session.metadata?.add_on === "true";

    const fundRaw = session.metadata?.fund || "Unspecified";
    let finalFund = fundRaw;
    if (!VALID_FUNDS.includes(fundRaw)) {
      console.warn(
        `⚠️  Warning: Unknown Fund "${fundRaw}". Marking as General.`,
      );
      finalFund = "General Donation";
    }

    if (session.payment_status === "paid") {
      console.log(
        `💰 FULFILLMENT: Recording ${amount} cents for ${finalFund} by ${donorEmail}`,
      );

      // --- DATABASE PERSISTENCE ---
      const client = new Client({
        connectionString: process.env.NETLIFY_DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });

      try {
        await client.connect();

        const query = `
          INSERT INTO donations (
            stripe_checkout_session_id,
            donor_email,
            donor_name,  
            amount_cents,
            currency,
            type,
            product_sku,
            add_on,
            status,
            raw_event
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (stripe_checkout_session_id) DO NOTHING;
        `;

        const values = [
          session.id,
          donorEmail,
          donorName,
          amount,
          currency,
          type,
          productSku,
          addOn,
          session.payment_status,
          JSON.stringify(stripeEvent),
        ];

        await client.query(query, values);
        console.log("✅ Donation saved to database successfully.");
      } catch (dbError) {
        console.error("❌ Database Error:", dbError);
        // We do NOT return here; we proceed to send email even if DB fails
      } finally {
        await client.end();
      }

      // --- SEND EMAIL ---
      let receiptUrl = null;
      try {
        if (session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent,
            { expand: ["latest_charge"] },
          );
          receiptUrl = paymentIntent.latest_charge?.receipt_url;
        }
      } catch (err) {
        console.error("⚠️ Could not retrieve receipt URL:", err);
      }

      if (donorEmail) {
        await sendThankYouEmail({
          email: donorEmail,
          name: donorName,
          amount: amount,
          currency: currency,
          receiptUrl: receiptUrl,
          fund: finalFund,
          type: type,
        });
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
