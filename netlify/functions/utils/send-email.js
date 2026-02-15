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

    const { data, error } = await resend.emails.send({
      from: "The Chad Foundation <donations@chad-foundation.org>",
      to: [email],
      reply_to: "info@chad-foundation.org",
      subject: subjectLine,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          
          <h2 style="color: #2c3e50; text-align: center;">${headline}</h2>
          
          <p style="font-size: 16px; color: #555; line-height: 1.5;">
            ${mainMessage}
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.5;">
            ${impactMessage}
          </p>

          ${shippingSection}

          
          ${
            safeReceiptUrl
              ? `<div style="text-align: center; margin: 30px 0;">
                <a href="${safeReceiptUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Official Receipt
                </a>
               </div>`
              : `<p style="font-size: 14px; color: #7f8c8d; text-align: center; margin: 30px 0; font-style: italic;">
                 Your official receipt will be sent separately by Stripe.
               </p>`
          }

          ${
            !isProduct
              ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #2ecc71; margin-bottom: 30px;">
            <h3 style="color: #27ae60; margin-top: 0; font-size: 18px;">Double Your Impact</h3>
            <p style="font-size: 14px; color: #555; margin-bottom: 0;">
              Did you know many employers match charitable donations? 
              Please check with your HR department to see if your company offers a <strong>Corporate Matching Gift Program</strong>.
            </p>
          </div>`
              : ""
          }

          ${subscriptionSection}  

          <p style="font-size: 14px; color: #7f8c8d; text-align: center; margin-top: 40px;">
            The Chad Foundation<br>
            <small>A registered 501(c)(3) non-profit organization.</small>
          </p>
        </div>
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
