const { GoogleSpreadsheet } = require("google-spreadsheet");

const formatDate = () => new Date().toISOString().split("T")[0];

const appendToSheet = async (orderData) => {
  try {
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_PRIVATE_KEY) {
      console.warn("⚠️ Google Sheets credentials missing. Skipping sync.");
      return;
    }

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // Format shipping address from either location
    let formattedAddress = "N/A";
    const shippingDetails =
      orderData.shipping_details ||
      orderData.collected_information?.shipping_details ||
      null;

    if (shippingDetails?.address) {
      const { line1, line2, city, state, postal_code } =
        shippingDetails.address;
      formattedAddress = `${line1}${line2 ? ", " + line2 : ""}, ${city}, ${state} ${postal_code}`;
    }

    await sheet.addRow({
      Date: formatDate(),
      "Order ID": orderData.id,
      "Customer Name": orderData.customer_details?.name || "Supporter",
      "Item (SKU)": orderData.metadata?.product_sku || "Unknown",
      "Add-Ons": orderData.metadata?.add_on === "true" ? "Gift Wrap" : "None",
      "Shipping Address": formattedAddress,
      Status: "Pending",
    });

    console.log(`✅ Order ${orderData.id} synced to Google Sheets.`);
  } catch (error) {
    console.error("❌ Google Sheet Sync Failed:", error.message);
  }
};

module.exports = { appendToSheet };
