const { Client } = require("pg");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sendThankYouEmail } = require("./utils/send-email");
const { appendToSheet } = require("./utils/append-to-sheet");
const { sendAdminNotification } = require("./utils/send-admin-email");

const VALID_FUNDS = [
  "General Donation",
  "The Chad Scholarship Program",
  "The Gift of Heart Program",
  "The Gift of Art Program",
  "Life is a Gift: Safe Driver Campaign",
];

// Helper functions
async function saveDonationToDB(data) {
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
        raw_event,
        shipping_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (stripe_checkout_session_id) DO NOTHING;
    `;

    const values = [
      data.id,
      data.email,
      data.name,
      data.amount,
      data.currency,
      data.type,
      data.productSku,
      data.addOn,
      data.status,
      JSON.stringify(data.rawEvent),
      data.shipping ? JSON.stringify(data.shipping) : null,
    ];

    await client.query(query, values);
    console.log("✅ Donation saved to database successfully.");
  } catch (dbError) {
    console.error("❌ Database Error:", dbError);
    // We do NOT throw here; we want emails to still send if DB fails slightly
  } finally {
    await client.end();
  }
}

// --- MAIN HANDLER ---
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

  // ==================================================================
  // CASE 1: CHECKOUT COMPLETED (First Payment)
  // ==================================================================
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;

    const amount = session.amount_total;
    const currency = session.currency;
    const donorEmail = session.customer_details?.email || null;
    const donorName = session.customer_details?.name || "Supporter";

    const shippingDetails =
      session.shipping_details ||
      session.collected_information?.shipping_details ||
      null;

    const type = session.metadata?.type || "donation";
    const productSku = session.metadata?.product_sku || null;
    const addOn = session.metadata?.add_on === "true";
    const frequency = session.metadata?.frequency || "one-time";

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
        `💰 FULFILLMENT: Recording ${amount} cents for ${finalFund} (${frequency}) by ${donorEmail || donorName || "Anonymous"}`,
      );

      // 1. Save to DB (Using Helper)
      await saveDonationToDB({
        id: session.id,
        email: donorEmail,
        name: donorName,
        amount: amount,
        currency: currency,
        type: type,
        productSku: productSku,
        addOn: addOn,
        status: session.payment_status,
        rawEvent: stripeEvent,
        shipping: shippingDetails,
      });

      // 2. Retrieve Receipt URL
      let receiptUrl = null;
      try {
        if (session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent,
            { expand: ["latest_charge"] },
          );
          receiptUrl = paymentIntent.latest_charge?.receipt_url;
        } else if (session.invoice) {
          const invoice = await stripe.invoices.retrieve(session.invoice);
          receiptUrl = invoice.hosted_invoice_url;
        }
      } catch (err) {
        console.error("⚠️ Could not retrieve receipt URL:", err);
      }

      // 3. Send Donor Email
      if (donorEmail) {
        await sendThankYouEmail({
          email: donorEmail,
          name: donorName,
          amount: amount,
          currency: currency,
          receiptUrl: receiptUrl,
          fund: finalFund,
          type: type,
          shipping: shippingDetails || null,
          isRecurring: frequency === "monthly",
        });
      }

      // 4. Send Admin Notification
      console.log("🔔 Sending admin notification...");
      try {
        await sendAdminNotification({
          type,
          orderData: session,
          shippingDetails: shippingDetails,
        });
      } catch (err) {
        console.error("❌ Failed to send admin notification:", err);
      }

      // 5. Sync Sheets (Products Only)
      if (type === "product") {
        console.log("📝 Syncing product order to Google Sheets...");
        await appendToSheet(session);
      }
    } else {
      console.log(
        `⏳ Payment not paid yet (Status: ${session.payment_status})`,
      );
    }
  }

  // ==================================================================
  // CASE 2: INVOICE PAID (Recurring Renewals)
  // ==================================================================
  else if (stripeEvent.type === "invoice.paid") {
    const invoice = stripeEvent.data.object;

    if (invoice.billing_reason === "subscription_cycle") {
      console.log(
        `🔄 RECURRING PAYMENT: ${invoice.amount_paid} cents from ${invoice.customer_email}`,
      );

      // Extract Metadata
      const donorEmail = invoice.customer_email;
      const donorName = invoice.customer_name || "Recurring Donor";
      const amount = invoice.amount_paid;
      const currency = invoice.currency;

      let fundRaw =
        invoice.lines?.data[0]?.metadata?.fund ||
        invoice.subscription_details?.metadata?.fund ||
        invoice.metadata?.fund;

      if (!fundRaw && invoice.subscription) {
        try {
          console.log(
            `🔎 Fetching subscription ${invoice.subscription} to recover metadata...`,
          );
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription,
          );
          fundRaw = subscription.metadata?.fund;
        } catch (err) {
          console.warn(
            "⚠️ Could not fetch subscription metadata:",
            err.message,
          );
        }
      }

      const finalFund =
        fundRaw && VALID_FUNDS.includes(fundRaw) ? fundRaw : "General Donation";

      // 1. Save to DB
      await saveDonationToDB({
        id: invoice.id,
        email: donorEmail,
        name: donorName,
        amount: amount,
        currency: currency,
        type: "donation",
        productSku: null,
        addOn: false,
        status: "paid",
        rawEvent: stripeEvent,
        shipping: null,
      });

      // 2. Send Donor Receipt
      if (donorEmail) {
        await sendThankYouEmail({
          email: donorEmail,
          name: donorName,
          amount: amount,
          currency: currency,
          receiptUrl: invoice.hosted_invoice_url,
          fund: finalFund,
          type: "donation",
          shipping: null,
          isRecurring: true,
        });
      } else {
        console.warn(
          "⚠️ Skipping donor receipt for recurring renewal because email is missing.",
          {
            invoiceId: invoice.id,
            amount: amount,
            fund: finalFund,
          },
        );
      }

      // 3. Send Admin Notification
      const mockSession = {
        amount_total: amount,
        customer_details: { name: donorName, email: donorEmail },
        metadata: { fund: finalFund, notes: "Recurring Renewal" },
        id: invoice.id,
        payment_intent: invoice.payment_intent,
      };

      try {
        await sendAdminNotification({
          type: "donation",
          orderData: mockSession,
          shippingDetails: null,
        });
      } catch (err) {
        console.error("❌ Failed to send admin notification for renewal:", err);
      }
    }
  } else {
    console.log(`ℹ️  Unhandled Stripe event type: ${stripeEvent.type}`);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
