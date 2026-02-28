const { Resend } = require("resend");

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const portalUrl = process.env.STRIPE_CUSTOMER_PORTAL_URL;

const escapeHtml = (unsafe) => {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

async function sendThankYouEmail({
  email,
  name,
  amount,
  currency,
  receiptUrl,
  fund,
  type,
  shipping,
  isRecurring,
}) {
  if (!resend) {
    console.warn("⚠️ RESEND_API_KEY is missing. Email skipped.");
    return null;
  }
  if (!portalUrl) {
    console.warn(
      "⚠️ STRIPE_CUSTOMER_PORTAL_URL is missing. Customer portal link will not be included.",
    );
  }

  if (!email) {
    console.log("⚠️ No email provided, skipping Thank You email.");
    return;
  }

  try {
    const amountInDollars = amount / 100;
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    });
    const formattedMoney = formatter.format(amountInDollars);

    const safeName = escapeHtml(name || "Friend");
    const safeFund = escapeHtml(fund);
    const safeReceiptUrl = receiptUrl ? escapeHtml(receiptUrl) : null;

    const isProduct = type === "product";

    let subjectLine;
    let headline;
    let mainMessage;
    let impactMessage;

    let shippingSection = "";
    if (shipping && shipping.address) {
      const { line1, line2, city, state, postal_code, country } =
        shipping.address;

      const safeName = escapeHtml(shipping.name);
      const safeLine1 = escapeHtml(line1);
      const safeLine2 = escapeHtml(line2);
      const safeCity = escapeHtml(city);
      const safeState = escapeHtml(state);
      const safeZip = escapeHtml(postal_code);
      const safeCountry = escapeHtml(country);

      const addressHtml = `
      ${safeLine1}<br>
      ${safeLine2 ? `${safeLine2}<br>` : ""}
      ${safeCity}, ${safeState} ${safeZip}<br>
      ${safeCountry}
    `;

      shippingSection = `
      <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
        <h3 style="margin: 0 0 10px; color: #333;">📦 Shipping Address</h3>
        <p style="margin: 0; color: #555; line-height: 1.5;">
          <strong>${safeName}</strong><br>
          ${addressHtml}
        </p>
      </div>
    `;
    }

    if (isProduct) {
      subjectLine = "Order Confirmation - The Chad Foundation";
      headline = `Thank You for Your Order, ${safeName}!`;
      mainMessage = `We have successfully received your order of <strong>${formattedMoney}</strong>.`;
      impactMessage =
        "Your purchase helps support our mission of safeguarding young hearts and preventing Sudden Cardiac Arrest. Your item(s) will be prepared for shipment shortly.";
    } else {
      // 1. Customize Subject for Recurring
      subjectLine = isRecurring
        ? "Monthly Donation Receipt - The Chad Foundation"
        : "Thank You for Your Support - The Chad Foundation";

      headline = `Thank You, ${safeName}!`;

      // 2. Customize Body for Recurring
      const frequencyText = isRecurring ? "monthly recurring " : "";

      mainMessage = `We have successfully received your ${frequencyText}donation of <strong>${formattedMoney}</strong>${
        fund && fund !== "General Donation"
          ? ` designated for the <strong>${safeFund}</strong>`
          : ""
      }.`;

      const defaultImpactMessage =
        "Your contribution supports our core mission of raising awareness about Sudden Cardiac Arrest (SCA) in young people.";

      const fundMessages = {
        "General Donation": defaultImpactMessage,
        "The Chad Scholarship Program":
          "Your gift helps provide educational opportunities to deserving students.",
        "The Gift of Heart Program":
          "Your support enables us to provide critical cardiac screenings.",
        "The Gift of Art Program":
          "Your contribution fosters creativity and supports artistic expression.",
        "Life is a Gift: Safe Driver Campaign":
          "Your support is vital to our mission of educating young drivers.",
      };

      impactMessage = fundMessages[fund] || defaultImpactMessage;
    }

    // 3. Create the Subscription Management Section
    let subscriptionSection = "";
    if (isRecurring && portalUrl) {
      subscriptionSection = `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="font-size: 14px; color: #7f8c8d; margin-bottom: 10px;">
            Need to update your payment method or cancel your subscription?
          </p>
          <a href="${portalUrl}" style="color: #3498db; text-decoration: underline; font-size: 14px;">
            Manage My Monthly Donation
          </a>
        </div>
      `;
    }
    const SITE_URL =
      process.env.URL ||
      process.env.DEPLOY_PRIME_URL ||
      "https://chad-foundation.org";

    const LOGO_URL = `${SITE_URL}/chad_logo.png`;
    
    const { data, error } = await resend.emails.send({
      from: "The Chad Foundation <donations@chad-foundation.org>",
      to: [email],
      reply_to: "info@chad-foundation.org",
      subject: subjectLine,
      html: `
         <body style="margin:0; padding:0; background-color:#ffffff;">

 <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
 <tr>
 <td align="center" style="padding:0 12px;">

 <table width="600" cellpadding="0" cellspacing="0"
            style="
 width:100%;
 max-width:600px;
 border-radius:12px;
 overflow:hidden;
 background-color:#f5efea;
            ">

            // Header
 <tr>
 <td style="padding:24px 20px 10px 20px; text-align:center;">
 <img src="${LOGO_URL}" width="140" alt="The Chad Foundation" style="display:block; margin:0 auto; height:auto;" />
 </td>
 </tr>

            // Body
 <tr>
 <td style="
 padding:10px 28px 28px 28px;
 font-family:'Source Sans Pro', Arial, Helvetica, sans-serif;
 color:#0d0d0d;
              ">

            // Headline
 <h2 style="
 text-align:center;
 margin:10px 0 20px 0;
 font-size:22px;
 letter-spacing:0.4px;
 font-family: Anton, Impact, Haettenschweiler, 'Arial Narrow Bold', Arial, Helvetica, sans-serif;
 color:#0d0d0d;
                ">
 ${headline}
 </h2>

 <p style="font-size:16px; line-height:1.6; margin:0 0 14px 0;">
 ${mainMessage}
 </p>

 <p style="font-size:16px; line-height:1.6; margin:0 0 14px 0;">
 ${impactMessage}
 </p>

 ${shippingSection}

 ${
   safeReceiptUrl
     ? `
 <div style="text-align:center; margin:30px 0;">
 <a
                    href="${safeReceiptUrl}"
                    style="
 display:inline-block;
 background-color:#ef761f;
 color:#fffefe;
 text-decoration:none;
 padding:14px 32px;
 border-radius:10px;
 font-size:18px;
 font-weight:700;
 letter-spacing:0.3px;
 box-shadow:0px 4px 10px rgba(0,0,0,0.15);
 font-family: Anton, Impact, Haettenschweiler, 'Arial Narrow Bold', Arial, Helvetica, sans-serif;
                    "
 >
 View Official Receipt
 </a>
 </div>
 `
     : `
 <p
                  style="
 margin:22px 0 0 0;
 font-size:13px;
 line-height:1.5;
 color:#555;
 text-align:center;
 font-style:italic;
                  "
 >
 Your official receipt will be sent separately by Stripe.
 </p>
 `
 }

 ${
   !isProduct
     ? `
 <div
                  style="
 margin-top:28px;
 background-color:#ffffff;
 border-radius:10px;
 border-left:4px solid #3dadc8;
 padding:16px;
                  "
 >
 <h3 style="
 margin:0 0 8px 0;
 font-size:16px;
 font-family: Anton, Impact, Haettenschweiler, 'Arial Narrow Bold', Arial, Helvetica, sans-serif;
                  ">
 Double Your Impact
 </h3>

 <p style="margin:0; font-size:14px; line-height:1.5;">
 Did you know many employers match charitable donations?
 Please check with your HR department to see if your company offers a
 <strong>Corporate Matching Gift Program</strong>.
 </p>
 </div>
 `
     : ""
 }

 ${subscriptionSection}

          //  Footer 
 <div style="border-top:1px solid #dddddd; margin-top:34px; padding-top:18px; text-align:center;">
 <p style="margin:0; font-size:13px; color:#555;">
 <strong style="color:#0d0d0d;">The Chad Foundation</strong><br />
 A registered 501(c)(3) non-profit organization.
 </p>
 </div>

 </td>
 </tr>

 </table>

 </td>
 </tr>
 </table>

 </body>
      `,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return null;
    }

    console.log(
      `📧 Email sent successfully to ${email}. ID: ${data?.id || "Sent"}`,
    );
    return data;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return null;
  }
}

module.exports = { sendThankYouEmail, escapeHtml };
