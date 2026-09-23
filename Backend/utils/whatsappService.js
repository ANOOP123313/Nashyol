import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * Sanitizes template param values: removes newlines, tabs, and double spaces.
 * Crucial for Meta WhatsApp Cloud API / Happilee to prevent payload rejection.
 */
export const sanitizeTemplateValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .replace(/\t/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

export const normalizePhoneNumber = (phone) => {
  if (!phone) return "";
  return String(phone).replace(/[^\d+]/g, "").trim();
};

export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDisplayDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Core WhatsApp API caller via Happilee
 */
export const sendWhatsAppTemplate = async ({ phone, templateId, templateParams }) => {
  const apiKey = process.env.HAPPILEE_API_KEY || "";
  const baseUrl = process.env.HAPPILEE_BASE_URL || "https://api.happilee.io";
  const url = `${baseUrl.replace(/\/$/, "")}/api/v1/sendTemplateMessage`;

  if (!apiKey || apiKey === "your_happilee_api_key_here") {
    console.warn("⚠️ Happilee WhatsApp API key is not configured in .env. Skipping WhatsApp message dispatch.");
    return { mock: true, success: true, message: "Happilee API key not configured" };
  }

  if (!templateId || templateId.includes("your_")) {
    console.warn(`⚠️ Happilee template ID (${templateId}) is not configured in .env.`);
    return { mock: true, success: false, message: "Template ID not configured" };
  }

  const sanitizedTemplateParams = (templateParams || []).map((param) => ({
    name: sanitizeTemplateValue(param?.name),
    value: sanitizeTemplateValue(param?.value),
  }));

  const payload = {
    candidate_details: {
      phone_number: phone,
    },
    template_message_id: templateId,
    template_params: sanitizedTemplateParams,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error("WhatsApp API Error:", {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

/**
 * Send WhatsApp OTP
 */
export const sendWhatsappOTP = async ({ phone, otp }) => {
  const templateId = process.env.HAPPILEE_OTP_TEMPLATE_ID;
  return await sendWhatsAppTemplate({
    phone,
    templateId,
    templateParams: [
      {
        name: "otp",
        value: otp,
      },
      {
        name: "1",
        value: otp,
      },
    ],
  });
};

/**
 * Send WhatsApp Order Confirmation
 */
export const sendOrderConfirmation = async (order) => {
  try {
    if (!order || !order._id) {
      console.error("Order confirmation failed: missing order object");
      return false;
    }

    const user = order.user || {};
    const shippingAddress = order.shippingAddress || order.address || {};
    const customerName = user.name || shippingAddress.fullName || shippingAddress.name || "Customer";
    const phone = normalizePhoneNumber(
      user.phone || shippingAddress.phone || order.phone
    );

    if (!phone) {
      console.error("Order confirmation failed: missing customer phone number for order", order._id);
      return false;
    }

    // Format products line - support both orderItems and items
    const rawItems = order.orderItems || order.items || [];
    const productLines = rawItems
      .map((item) => {
        const itemName = item.name || item.title || item.product?.name || item.product?.title || "Item";
        const quantity = item.quantity || 1;
        const price = formatCurrency(item.price || 0);
        return `${itemName} x ${quantity} @ ${price}`;
      })
      .join(" | ");

    // Delivery address
    const deliveryAddress = [
      shippingAddress.street || shippingAddress.address,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.pincode,
      shippingAddress.phone,
    ]
      .filter(Boolean)
      .join(", ");

    // Message summary text
    const messageSummary = [
      `Customer Name: ${customerName}`,
      `Order Date: ${formatDisplayDate(order.createdAt)}`,
      `Products: ${productLines || "Not available"}`,
      `Grand Total: ${formatCurrency(order.totalAmount || 0)}`,
      `Payment Method: ${order.paymentMethod || "COD"}`,
      `Payment Status: ${order.paymentStatus || "Pending"}`,
      `Delivery Address: ${deliveryAddress || "Not available"}`,
    ].join(" | ");

    const templateParams = [
      { name: "1", value: customerName },
      { name: "2", value: String(order._id) },
      { name: "3", value: messageSummary },
    ];

    const response = await sendWhatsAppTemplate({
      phone,
      templateId: process.env.HAPPILEE_ORDER_TEMPLATE_ID,
      templateParams,
    });

    return response;
  } catch (error) {
    console.error("WhatsApp Order Confirmation Error:", error?.response?.data || error.message);
    return false;
  }
};
