// netlify/functions/create-checkout-session.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. EXTRACT DATA: Get the 'fund' and 'notes' from the frontend
    const { type, amount, sku, addOn, fund, notes } = JSON.parse(event.body);
    const lineItems = [];
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // --- LOGIC 1: DONATION ---
    if (type === "donation") {
      if (!amount || isNaN(amount) || amount < 100) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Amount must be at least $1.00" }),
        };
      }
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Donation to The Chad Foundation",
            description: fund ? `Fund: ${fund}` : "General Donation", // Nice description for user
          },
          unit_amount: amount,
        },
        quantity: 1,
      });
    }

    // --- LOGIC 2: KEYCHAIN ---
    else if (type === "product" && sku === "keychain") {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Chad Foundation Keychain" },
          unit_amount: 2500,
        },
        quantity: 1,
      });
      if (addOn) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: { name: "Gift Wrap / Add-on" },
            unit_amount: 500,
          },
          quantity: 1,
        });
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid transaction type" }),
      };
    }

    // --- CREATE SESSION WITH METADATA ---
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/donate`,

      // 2. PASS METADATA TO STRIPE
      payment_intent_data: {
        metadata: {
          fund: fund || "General", // e.g. "Scholarship"
          notes: notes || "", // e.g. "In memory of..."
          type: type, // e.g. "donation"
        },
      },
      // Also attach to the Session object for easy retrieval
      metadata: {
        fund: fund || "General",
        type: type,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error("Stripe Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
