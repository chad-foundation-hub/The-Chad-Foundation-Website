const { Resend } = require("resend");
const { escapeHtml } = require("./send-email");

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const sendAdminNotification = async ({ type, orderData, shippingDetails }) => {
  try {
    if (!resend) {
      console.error("❌ Resend API Key missing. Skipping admin email.");
      return;
    }
    if (!process.env.ADMIN_EMAIL) {
      console.warn("⚠️ ADMIN_EMAIL is missing. Skipping admin notification.");
      return;
    }
    if (!process.env.FROM_EMAIL) {
      console.warn("⚠️ FROM_EMAIL is missing. Skipping admin notification.");
      return;
    }
    // Optional warning for Sheet ID
    if (!process.env.GOOGLE_SHEET_ID) {
      console.warn(
        "⚠️ GOOGLE_SHEET_ID is missing. Sheet link in email will be broken.",
      );
    }

    const isProduct = type === "product";
    const amount = (orderData.amount_total / 100).toFixed(2);
    const date = new Date().toLocaleDateString("en-US");

    const donorName = escapeHtml(
      orderData.customer_details?.name || "Supporter",
    );
    const donorEmailAddress = escapeHtml(
      orderData.customer_details?.email ||
        orderData.customer_email ||
        "No email provided",
    );
    const fund = escapeHtml(orderData.metadata?.fund || "General Donation");
    const dedication = orderData.metadata?.notes
      ? escapeHtml(orderData.metadata.notes)
      : null;

    const baseDashboardUrl = "https://dashboard.stripe.com";
    const stripeLink = orderData.payment_intent
      ? `${baseDashboardUrl}/payments/${orderData.payment_intent}`
      : baseDashboardUrl;

    const sheetLink = `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}`;

    let subject = "";
    let htmlBody = "";

    // 🅰️ TEMPLATE: PRODUCT ORDER (Keychain)
    if (isProduct) {
      subject = `📦 New Order: Keychain - ${donorName}`;

      let addressHtml = "No shipping address provided.";
      if (shippingDetails?.address) {
        const { line1, line2, city, state, postal_code } =
          shippingDetails.address;
        addressHtml = `${escapeHtml(line1)}<br>${line2 ? escapeHtml(line2) + "<br>" : ""}${escapeHtml(city)}, ${escapeHtml(state)} ${escapeHtml(postal_code)}`;
      }

      htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #2c3e50;">📦 New Product Order Received</h2>
          <p><strong>Customer:</strong> ${donorName}</p>
          <p><strong>Email:</strong> <a href="mailto:${donorEmailAddress}">${donorEmailAddress}</a></p>
          <p><strong>Amount:</strong> $${amount}</p>
          
          <div style="background: #f9f9f9; padding: 15px; margin: 15px 0;">
            <h3 style="margin-top:0;">Shipping Address:</h3>
            <p>${addressHtml}</p>
          </div>

          <p>This order has been added to your Google Sheet automatically.</p>
          
          <a href="${sheetLink}" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            📂 Open Fulfillment Sheet
          </a>
          <br><br>
          <small>Stripe ID: ${orderData.id}</small>
        </div>
      `;
    }

    // 🅱️ TEMPLATE: DONATION (Money Only)
    else {
      subject = `💰 New Donation: $${amount} - ${fund}`;

      htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #27ae60;">💰 New Donation Received</h2>
          <p><strong>Donor:</strong> ${donorName}</p>
          <p><strong>Email:</strong> <a href="mailto:${donorEmailAddress}">${donorEmailAddress}</a></p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Fund Designation:</strong> ${fund}</p>

          ${dedication ? `<p><strong>Dedication:</strong> ${dedication}</p>` : ""}

          <p><strong>Date:</strong> ${date}</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          
          <a href="${stripeLink}" style="background-color: #635bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View in Stripe Dashboard
          </a>
        </div>
      `;
    }

    // 🚀 SEND THE EMAIL (This was missing!)
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: subject,
      html: htmlBody,
    });

    console.log(`📧 Admin notification sent to ${process.env.ADMIN_EMAIL}`);
  } catch (error) {
    console.error("❌ Failed to send admin notification:", error);
  }
};

module.exports = { sendAdminNotification };
