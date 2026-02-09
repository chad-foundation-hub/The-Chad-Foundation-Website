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
  // Future example:
  // book: { name: "Chad's Biography", price: 3000 }
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

/**
 * Sanitizes user input while preserving international characters.
 * Removes dangerous characters, keeps letters/numbers/punctuation.
 */
const sanitizeString = (str, maxLength) => {
  if (str === null || str === undefined) return "";
  if (typeof str !== "string") {
    throw new Error("Invalid input type for sanitization");
  }

  // Replace characters that are NOT: Letters, Numbers, Spaces, or Punctuation
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
  // addOns should be undefined, null, or an array of valid add-on names
  if (addOns === undefined || addOns === null) {
    return null; // Optional field
  }

  if (!Array.isArray(addOns)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Add-ons must be an array" }),
    };
  }

  // Check that all add-ons are valid
  const validAddOns = Object.keys(ADDONS);
  for (const addOn of addOns) {
    if (typeof addOn !== "string" || !validAddOns.includes(addOn)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invalid add-on: "${addOn}". Valid options are: ${validAddOns.join(
            ", ",
          )}`,
        }),
      };
    }
  }

  return null;
};

const validateStringField = (fieldName, value) => {
  if (value === undefined || value === null) {
    return null; // Optional
  }

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

const buildDonationLineItems = (amount, sanitizedFund) => {
  return [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: "Donation to The Chad Foundation",
          description: sanitizedFund
            ? `Fund: ${sanitizedFund}`
            : "General Donation",
        },
        unit_amount: amount,
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
      "CRITICAL: Stripe is not configured. STRIPE_SECRET_KEY is missing from environment variables.",
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

    const { type, amount, sku, addOns, fund, notes } = body;
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

    let lineItems = [];

    if (type === "donation") {
      const amountError = checkError(validateDonationAmount(amount));
      if (amountError) return amountError;
      lineItems = buildDonationLineItems(amount, sanitizedFund);
    } else if (type === "product") {
      const skuError = checkError(validateProductSku(sku));
      if (skuError) return skuError;

      // Pass the SKU and add-ons array to the builder for dynamic lookup
      lineItems = buildProductLineItems(sku, addOns);
    }

    // 5. Create Session
    const sessionConfig = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/donate/cancel`,
      payment_intent_data: {
        metadata: {
          fund: sanitizedFund || "General Donation",
          notes: sanitizedNotes || "",
          type,
          product_sku: sku || "",
          add_on: Array.isArray(addOns) && addOns.length > 0 ? "true" : "false",
        },
      },
      metadata: {
        fund: sanitizedFund || "General Donation",
        type,
        notes: sanitizedNotes || "",
        product_sku: sku || "",
        add_on: Array.isArray(addOns) && addOns.length > 0 ? "true" : "false",
      },
    };
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
