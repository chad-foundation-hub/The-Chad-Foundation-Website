const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendAdminNotification = async ({ type, orderData, shippingDetails }) => {
  try {
    if (!process.env.ADMIN_EMAIL) {
      console.warn("⚠️ ADMIN_EMAIL is missing. Skipping admin notification.");
      return;
    }

    const isProduct = type === "product";
    const amount = (orderData.amount_total / 100).toFixed(2);
    const donorName = orderData.customer_details?.name || "Supporter";
    const date = new Date().toLocaleDateString("en-US");
    const donorEmailAddress =
      orderData.customer_details?.email ||
      orderData.customer_email ||
      "No email provided";
    const fund = orderData.metadata?.fund || "General Donation";
    const dedication = orderData.metadata?.notes || null;

    // 🔗 Dynamic Links
    const stripeLink = `https://dashboard.stripe.com/payments/${orderData.payment_intent}`;
    const sheetLink = `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}`;

    let subject = "";
    let htmlBody = "";

    // 🅰️ TEMPLATE: PRODUCT ORDER (Keychain)
    if (isProduct) {
      subject = `📦 New Order: Keychain - ${donorName}`;

      // Format Address for Email
      let addressHtml = "No shipping address provided.";
      if (shippingDetails?.address) {
        const { line1, line2, city, state, postal_code } =
          shippingDetails.address;
        addressHtml = `${line1}<br>${line2 ? line2 + "<br>" : ""}${city}, ${state} ${postal_code}`;
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
      subject = `💰 New Donation: $${amount} from ${donorName}`;

      htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #27ae60;">💰 New Donation Received</h2>
          <p><strong>Customer:</strong> ${donorName}</p>
            <p><strong>Email:</strong> <a href="mailto:${donorEmailAddress}">${donorEmailAddress}</a></p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Fund Designation:</strong> ${fund}</p>
          ${dedication ? `<p><strong>Dedication:</strong> ${dedication}</p>` : ""}
          <p><strong>Date:</strong> ${date}</p>
          
          <p>The funds are now in your Stripe account.</p>
          
          <a href="${stripeLink}" style="background-color: #635bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View in Stripe Dashboard
          </a>
        </div>
      `;
    }

    await resend.emails.send({
      from: "Chad Foundation Notifications <notifications@chad-foundation.org>", // Or your verified domain
      to: process.env.ADMIN_EMAIL,
      subject: subject,
      html: htmlBody,
    });

    console.log(`📧 Admin notification sent to ${process.env.ADMIN_EMAIL}`);
  } catch (error) {
    console.error("❌ Failed to send admin notification:", error);
    // We do NOT throw the error, because we don't want to crash the webhook
  }
};

module.exports = { sendAdminNotification };
