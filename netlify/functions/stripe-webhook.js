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
      endpointSecret
    );
  } catch (err) {
    console.error(`⚠️  Webhook Signature Verification Failed: ${err.message}`);
    return {
      statusCode: 400,
      body: "Webhook Error: Invalid payload or signature",
    };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;

    const amount = session.amount_total;
    const currency = session.currency;
    const fundRaw = session.metadata?.fund || "Unspecified";
    const userRaw =
      session.metadata?.user || session.customer_details?.email || "Anonymous";

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
      console.log(`✅ Payment Received: ${amount} ${currency}`);
      // TODO: Insert into Database or Send Email here
    } else {
      console.log(
        `⏳ Payment not paid yet (Status: ${session.payment_status})`
      );
    }
  } else {
    console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
