/**
 * Returns the standard CORS headers.
 * @param {string} origin - The origin of the incoming request
 */
const getCorsHeaders = (origin) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*").split(",");

  const isAllowed =
    process.env.ALLOWED_ORIGINS === "*" || allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
};

/**
 * Helper to handle the OPTIONS preflight request automatically.
 * Returns a response object if it IS a preflight, or null if it's not.
 */
const handleOptions = (event) => {
  if (event.httpMethod === "OPTIONS") {
    const headers = getCorsHeaders(
      event.headers.origin || event.headers.Origin
    );
    return {
      statusCode: 200,
      headers,
      body: "OK",
    };
  }
  return null;
};

module.exports = { getCorsHeaders, handleOptions };
