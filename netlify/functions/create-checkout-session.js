const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error("CRITICAL: STRIPE_SECRET_KEY is missing.");
  throw new Error("Server Misconfiguration: Missing Stripe Key");
}

const stripe = require("stripe")(STRIPE_SECRET_KEY);

// Constants
const MIN_DONATION_CENTS = 100; // $1.00
const MAX_DONATION_CENTS = 1000000; // $10,000.00
const KEYCHAIN_PRICE_CENTS = 2500; // $25.00
const GIFTBOX_PRICE_CENTS = 500; // $5.00
const MAX_NOTE_LENGTH = 500; // Characters

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    let body;
    try {
      // Safe JSON Parsing
      body = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    // EXTRACT DATA: Get the 'fund' and 'notes' from the frontend
    const { type, amount, sku, addOn, fund, notes } = body;
    const lineItems = [];
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // --- LOGIC 1: DONATION ---
    if (type === "donation") {
      // Strict Amount Validation (Min & Max)
      if (
        !amount ||
        isNaN(amount) ||
        amount < MIN_DONATION_CENTS ||
        amount > MAX_DONATION_CENTS
      ) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: `Donation must be between $${
              MIN_DONATION_CENTS / 100
            } and $${MAX_DONATION_CENTS / 100}`,
          }),
        };
      }

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Donation to The Chad Foundation",
            description: fund
              ? `Fund: ${String(fund).slice(0, 100)}`
              : "General Donation", // Truncate fund name
          },
          unit_amount: Math.floor(amount), // Ensure integer
        },
        quantity: 1,
      });
    }
    // --- LOGIC 2: KEYCHAIN ---
    else if (type === "product") {
      // Strict SKU Validation
      if (sku !== "keychain") {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid or missing SKU" }),
        };
      }

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Chad Foundation Keychain" },
          unit_amount: KEYCHAIN_PRICE_CENTS,
        },
        quantity: 1,
      });

      if (addOn) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: { name: "Gift Wrap / Add-on" },
            unit_amount: GIFTBOX_PRICE_CENTS,
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

    if (lineItems.length === 0) {
      throw new Error("No line items generated");
    }

    const sanitizedNotes = notes ? String(notes).slice(0, MAX_NOTE_LENGTH) : "";

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
    console.error("Stripe Checkout Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unable to create checkout session. Please try again.",
      }),
    };
  }
};
