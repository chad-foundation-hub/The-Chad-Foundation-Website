/**
 * Returns the standard CORS headers.
 * @param {string} origin - The origin of the incoming request
 * @returns {{ "Access-Control-Allow-Origin": string, "Access-Control-Allow-Headers": string, "Access-Control-Allow-Methods": string }} An object containing the CORS response headers.
 */
const getCorsHeaders = (origin) => {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "*";

  if (allowedOriginsEnv === "*") {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    };
  }

  const allowedOrigins = allowedOriginsEnv
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const isAllowed = origin && allowedOrigins.includes(origin);

  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (isAllowed) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
};

/**
 * Helper to handle the OPTIONS preflight request automatically.
 * @param {Object} event - The incoming request event, containing the HTTP method and headers.
 * @returns {{statusCode: number, headers: Object, body: string} | null} A response object for preflight requests, or null for non-OPTIONS requests.
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
