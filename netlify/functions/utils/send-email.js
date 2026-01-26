const { Resend } = require("resend");

const escapeHtml = (unsafe) => {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  throw new Error(
    "RESEND_API_KEY environment variable is not set. Please configure RESEND_API_KEY to enable email sending.",
  );
}
const resend = new Resend(resendApiKey);

async function sendThankYouEmail({
  email,
  name,
  amount,
  currency,
  receiptUrl,
  fund,
}) {
  if (!email) {
    console.log("⚠️ No email provided, skipping Thank You email.");
    return;
  }

  try {
    const formattedAmount = (amount / 100).toFixed(2);
    const displayCurrency = currency.toUpperCase();

    const safeName = escapeHtml(name || "Friend");
    const safeFund = escapeHtml(fund);

    const fundMessages = {
      "The Chad Scholarship Program":
        "Your gift helps provide educational opportunities to deserving students, carrying forward Chad's legacy of excellence.",
      "The Gift of Heart Program":
        "Your support enables us to provide critical cardiac screenings and heart health education.",
      "The Gift of Art Program":
        "Your contribution fosters creativity and supports artistic expression in our community.",
      "Life is a Gift: Safe Driver Campaign":
        "Your support is vital to our mission of educating young drivers and preventing tragedies on our roads.",
    };

    const defaultMessage =
      "Your contribution supports our core mission of raising awareness about Sudden Cardiac Arrest (SCA) in young people—protecting athletes and non-athletes alike through early detection and education.";

    const impactMessage = fundMessages[fund] || defaultMessage;

    const { data, error } = await resend.emails.send({
      from: "The Chad Foundation <donations@chad-foundation.org>",
      to: [email],
      reply_to: "info@chad-foundation.org",
      subject: "Thank You for Your Support - The Chad Foundation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2c3e50; text-align: center;">Thank You, ${safeName || "Friend"}!</h2>
          
          <p style="font-size: 16px; color: #555; line-height: 1.5;">
            We have successfully received your donation of <strong>$${formattedAmount} ${displayCurrency}</strong>
            ${fund && fund !== "General Donation" ? ` designated for the <strong>${safeFund}</strong>` : ""}.
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.5;">
            ${impactMessage}
          </p>
          
          ${
            receiptUrl
              ? `<div style="text-align: center; margin: 30px 0;">
                <a href="${receiptUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Official Receipt
                </a>
               </div>`
              : `<p style="font-size: 14px; color: #7f8c8d; text-align: center; margin: 30px 0; font-style: italic;">
                 Your official receipt will be sent separately by Stripe.
               </p>`
          }

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #2ecc71; margin-bottom: 30px;">
            <h3 style="color: #27ae60; margin-top: 0; font-size: 18px;">Double Your Impact</h3>
            <p style="font-size: 14px; color: #555; margin-bottom: 0;">
              Did you know many employers match charitable donations? 
              Please check with your HR department to see if your company offers a <strong>Corporate Matching Gift Program</strong>.
            </p>
          </div>

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

module.exports = { sendThankYouEmail };
