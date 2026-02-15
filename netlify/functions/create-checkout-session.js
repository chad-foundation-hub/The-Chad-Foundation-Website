// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

let stripe;
try {
  if (!STRIPE_SECRET_KEY) {
    console.warn(
      "WARNING: STRIPE_SECRET_KEY environment variable is not set. " +
        "Stripe checkout sessions will fail until this is configured. " +
        "Set STRIPE_SECRET_KEY in Netlify environment variables.",
    );
  } else {
    stripe = require("stripe")(STRIPE_SECRET_KEY);
  }
} catch (err) {
  console.error(
    "CRITICAL: Failed to initialize Stripe client. Error:",
    err.message,
  );
}

const { getCorsHeaders, handleOptions } = require("./utils/cors");

// Donation limits (in cents)
const DONATION_LIMITS = {
  MIN: 100, // $1.00
  MAX: 1000000, // $10,000.00
};

const PRODUCTS = {
  keychain: {
    name: "Chad Foundation Keychain",
    price: 2500, // $25.00
  },
};

const ADDONS = {
  GIFT_WRAP: { name: "Premium Gift Box", price: 500 },
};

const INPUT_LIMITS = {
  FUND: 100,
  NOTE: 500,
};

const skuPattern = /^[A-Za-z0-9_-]{1,32}$/;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const sanitizeString = (str, maxLength) => {
  if (str === null || str === undefined) return "";
  if (typeof str !== "string") {
    throw new Error("Invalid input type for sanitization");
  }
  const sanitized = str.replace(/[^\p{L}\p{N}\s\-.,!?'()]/gu, "").trim();
  return sanitized.slice(0, maxLength);
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

const validateType = (type) => {
  if (typeof type !== "string" || !["donation", "product"].includes(type)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid or missing transaction type" }),
    };
  }
  return null;
};

const validateDonationAmount = (amount) => {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    !Number.isInteger(amount) ||
    amount < DONATION_LIMITS.MIN ||
    amount > DONATION_LIMITS.MAX
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Donation must be between $${(
          DONATION_LIMITS.MIN / 100
        ).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })} and ${(DONATION_LIMITS.MAX / 100).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}`,
      }),
    };
  }
  return null;
};

const validateProductSku = (sku) => {
  if (
    typeof sku !== "string" ||
    !sku ||
    !skuPattern.test(sku) ||
    !PRODUCTS[sku]
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid or missing SKU" }),
    };
  }
  return null;
};

const validateAddOns = (addOns) => {
  if (addOns === undefined || addOns === null) return null;
  if (!Array.isArray(addOns)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Add-ons must be an array" }),
    };
  }
  const validAddOns = Object.keys(ADDONS);
  for (const addOn of addOns) {
    if (typeof addOn !== "string" || !validAddOns.includes(addOn)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invalid add-on: "${addOn}". Valid options are: ${validAddOns.join(", ")}`,
        }),
      };
    }
  }
  return null;
};

const validateStringField = (fieldName, value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `${fieldName} must be a string, not ${typeof value}`,
      }),
    };
  }
  return null;
};

// ============================================================================
// LINE ITEM BUILDERS
// ============================================================================

const buildDonationLineItems = (amount, sanitizedFund, isSubscription) => {
  const productName = isSubscription
    ? "Monthly Donation to The Chad Foundation"
    : "Donation to The Chad Foundation";
  return [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: productName,
          description: sanitizedFund
            ? `Fund: ${sanitizedFund}`
            : "General Donation",
        },
        unit_amount: amount,
        recurring: isSubscription ? { interval: "month" } : undefined,
      },
      quantity: 1,
    },
  ];
};

const buildProductLineItems = (sku, addOns = []) => {
  const productDetails = PRODUCTS[sku];
  const items = [
    {
      price_data: {
        currency: "usd",
        product_data: { name: productDetails.name },
        unit_amount: productDetails.price,
      },
      quantity: 1,
    },
  ];

  if (Array.isArray(addOns) && addOns.length > 0) {
    for (const addOnName of addOns) {
      const addOn = ADDONS[addOnName];
      if (addOn) {
        items.push({
          price_data: {
            currency: "usd",
            product_data: { name: addOn.name },
            unit_amount: addOn.price,
          },
          quantity: 1,
        });
      }
    }
  }
  return items;
};

// ============================================================================
// MAIN HANDLER
// ============================================================================

exports.handler = async (event) => {
  const preflightResponse = handleOptions(event);
  if (preflightResponse) return preflightResponse;

  const corsHeaders = getCorsHeaders(
    event.headers.origin || event.headers.Origin,
  );

  const checkError = (validationResult) => {
    if (validationResult) {
      return {
        ...validationResult,
        headers: corsHeaders,
      };
    }
    return null;
  };

  if (!stripe || !STRIPE_SECRET_KEY) {
    console.error(
      "CRITICAL: Stripe is not configured. STRIPE_SECRET_KEY is missing.",
    );
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Server configuration error. Payment processing is unavailable.",
      }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    const { type, amount, frequency, sku, addOns, fund, notes } = body;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const typeError = checkError(validateType(type));
    if (typeError) return typeError;

    const addOnsError = checkError(validateAddOns(addOns));
    if (addOnsError) return addOnsError;

    const fundError = checkError(validateStringField("fund", fund));
    if (fundError) return fundError;

    const notesError = checkError(validateStringField("notes", notes));
    if (notesError) return notesError;

    const sanitizedFund = sanitizeString(fund, INPUT_LIMITS.FUND);
    const sanitizedNotes = sanitizeString(notes, INPUT_LIMITS.NOTE);
    const isSubscription = frequency === "monthly";

    let lineItems = [];

    if (type === "donation") {
      const amountError = checkError(validateDonationAmount(amount));
      if (amountError) return amountError;
      lineItems = buildDonationLineItems(amount, sanitizedFund, isSubscription);
    } else if (type === "product") {
      const skuError = checkError(validateProductSku(sku));
      if (skuError) return skuError;
      lineItems = buildProductLineItems(sku, addOns);
    }

    // Prepare Metadata
    const metadata = {
      fund: sanitizedFund || "General Donation",
      notes: sanitizedNotes || "",
      type,
      product_sku: sku || "",
      frequency: frequency || "one-time",
      add_on: Array.isArray(addOns) && addOns.length > 0 ? "true" : "false",
    };

    // Create Session Configuration
    const sessionConfig = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/donate/cancel`,
      metadata: metadata,
    };

    // Handle Metadata Location based on Mode
    if (isSubscription) {
      sessionConfig.subscription_data = {
        metadata: metadata,
      };
    } else {
      sessionConfig.payment_intent_data = {
        metadata: metadata,
      };
    }

    if (type === "product") {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ["US"],
      };
    }
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    if (error && typeof error === "object") {
      console.error("Stripe Checkout Error:", {
        message: error.message,
        type: error.type,
      });
    } else {
      console.error("Stripe Checkout Error: Malformed error object", error);
    }
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Unable to create checkout session. Please try again.",
      }),
    };
  }
};
