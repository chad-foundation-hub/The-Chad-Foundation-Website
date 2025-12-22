const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const VALID_FUNDS = [
  "General Donation",
  "The Chad Scholarship Program",
  "The Gift of Heart Program",
  "The Gift of Art Program",
  "Life is a Gift: Safe Driver Campaign",
];

exports.handler = async (event) => {
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

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error(`⚠️  Webhook Signature Verification Failed: ${err.message}`);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;

    const amount = session.amount_total;
    const currency = session.currency;
    const fundRaw = session.metadata?.fund || "Unspecified";
    const userRaw =
      session.metadata?.user || session.customer_details?.email || "Anonymous";

    console.log(`✅ Payment Received: ${amount} ${currency}`);

    let finalFund = fundRaw;
    if (!VALID_FUNDS.includes(fundRaw)) {
      console.warn(
        `⚠️  Warning: Unknown Fund "${fundRaw}". Marking as General.`
      );
      finalFund = "General Donation";
    }

    if (session.payment_status === "paid") {
      console.log(
        `💰 FULFILLMENT: Recording ${amount} cents for ${finalFund} by ${userRaw}`
      );
      // TODO: Insert into Database or Send Email here
    } else {
      console.log(
        `⏳ Payment not paid yet (Status: ${session.payment_status})`
      );
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
