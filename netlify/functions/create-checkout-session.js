// netlify/functions/create-checkout-session.js

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe (lazy initialization - will fail at runtime if key is missing)
let stripe;
try {
  if (!STRIPE_SECRET_KEY) {
    console.warn(
      "WARNING: STRIPE_SECRET_KEY environment variable is not set. " +
        "Stripe checkout sessions will fail until this is configured. " +
        "Set STRIPE_SECRET_KEY in Netlify environment variables."
    );
  } else {
    stripe = require("stripe")(STRIPE_SECRET_KEY);
  }
} catch (err) {
  console.error(
    "CRITICAL: Failed to initialize Stripe client. Error:",
    err.message
  );
}

// Donation limits (in cents)
const DONATION_LIMITS = {
  MIN: 100, // $1.00
  MAX: 1000000, // $10,000.00
};

// keys must match the 'sku' sent from frontend
const PRODUCTS = {
  keychain: {
    name: "Chad Foundation Keychain",
    price: 2500, // $25.00
  },
  // Future example:
  // book: { name: "Chad's Biography", price: 3000 }
};

// Add-on pricing
const ADDONS = {
  GIFT_WRAP: 500, // $5.00
};

// Input validation limits
const INPUT_LIMITS = {
  FUND: 100,
  NOTE: 500,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sanitizes user input while preserving international characters.
 * Uses Unicode Property Escapes (\p{L}) to match letters from any language.
 * Allowed: Letters, Numbers, Whitespace, and basic punctuation.
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
  // Dynamic check: Does this SKU exist in our PRODUCTS config?
  // SKU must be a string, 1-32 chars, only alphanumeric, underscore, hyphen
  const SKU_MAX_LENGTH = 32;
  const skuPattern = /^[A-Za-z0-9_-]{1,32}$/;
  if (
    typeof sku !== "string" ||
    !sku ||
    sku.length > SKU_MAX_LENGTH ||
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

const validateAddOn = (addOn) => {
  if (addOn !== undefined && typeof addOn !== "boolean") {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid add-on value" }),
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

const buildProductLineItems = (sku, addOn) => {
  // Dynamic Lookup: Get details from the constant based on SKU
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

  if (addOn) {
    items.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Gift Wrap / Add-on" },
        unit_amount: ADDONS.GIFT_WRAP,
      },
      quantity: 1,
    });
  }
  return items;
};

// ============================================================================
// MAIN HANDLER
// ============================================================================

exports.handler = async (event) => {
  // Runtime check: Ensure Stripe is properly initialized
  if (!stripe || !STRIPE_SECRET_KEY) {
    console.error(
      "CRITICAL: Stripe is not configured. STRIPE_SECRET_KEY is missing from environment variables."
    );
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server configuration error. Payment processing is unavailable.",
      }),
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    const { type, amount, sku, addOn = false, fund, notes } = body;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // 1. Validate Type
    const typeError = validateType(type);
    if (typeError) return typeError;

    // 2. Validate Add-On (early, before type-specific branches)
    const addOnError = validateAddOn(addOn);
    if (addOnError) return addOnError;

    // 3. Sanitize inputs
    const safeFund =
      typeof fund === "string"
        ? fund
        : typeof fund === "number"
        ? String(fund)
        : "";
    const safeNotes =
      typeof notes === "string"
        ? notes
        : typeof notes === "number"
        ? String(notes)
        : "";
    const sanitizedFund = sanitizeString(safeFund, INPUT_LIMITS.FUND);
    const sanitizedNotes = sanitizeString(safeNotes, INPUT_LIMITS.NOTE);

    // 4. Build Line Items
    let lineItems = [];

    if (type === "donation") {
      const amountError = validateDonationAmount(amount);
      if (amountError) return amountError;
      lineItems = buildDonationLineItems(amount, sanitizedFund);
    } else if (type === "product") {
      const skuError = validateProductSku(sku);
      if (skuError) return skuError;

      // Pass the SKU to the builder for dynamic lookup
      lineItems = buildProductLineItems(sku, addOn);
    }

    // 5. Create Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/donate`,
      payment_intent_data: {
        metadata: {
          fund: sanitizedFund || "General",
          notes: sanitizedNotes || "",
          type,
        },
      },
      metadata: {
        fund: sanitizedFund || "General",
        type,
        notes: sanitizedNotes || "",
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    // Log safe error details for debugging
    console.error("Stripe Checkout Error:", {
      message: error?.message,
      type: error?.type,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unable to create checkout session. Please try again.",
      }),
    };
  }
};
