const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const Razorpay = require("razorpay");
let nodemailer = null;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  nodemailer = null;
}
const Order = require("../models/Order");
const CartItem = require("../models/CartItem");

function formatInvoiceDate(value) {
  const date = new Date(value || Date.now());
  return date.toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function generateInvoiceHtml(order) {
  const invoiceDate = formatInvoiceDate(order.payment_verified_at || order.created_at || Date.now());
  const lineItems = order.items
    .map(
      (it) => `<tr><td>${it.product_name} (${it.size})</td><td class="right">${it.quantity}</td><td class="right">₹${Number(it.price).toFixed(2)}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice - ${order.order_number}</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; color: #111827; }
    .invoice { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 18px; border: 1px solid #e5e7eb; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap; }
    .brand { font-size: 28px; font-weight: 800; letter-spacing: -0.04em; color: #111827; }
    .meta { text-align: right; color: #4b5563; font-size: 14px; line-height: 1.75; }
    .section { margin-top: 30px; }
    .section h2 { margin: 0 0 12px; font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #6b7280; }
    .details { display: grid; gap: 8px; font-size: 14px; color: #374151; line-height: 1.8; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 14px 12px; border-bottom: 1px solid #e5e7eb; }
    th { text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; }
    td { font-size: 14px; color: #374151; }
    td.right { text-align: right; }
    .summary { width: 100%; max-width: 380px; margin-left: auto; margin-top: 24px; border-collapse: collapse; }
    .summary td { padding: 10px 12px; border: none; font-size: 14px; color: #374151; }
    .summary tr.total td { font-weight: 700; border-top: 1px solid #d1d5db; }
    .footer { margin-top: 30px; font-size: 13px; color: #6b7280; line-height: 1.9; }
    @media print { body { background: #ffffff; padding: 0; } .invoice { box-shadow: none; border: none; border-radius: 0; margin: 0; padding: 16px; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="brand">Uma's Fashion & Boutique</div>
        <div class="details" style="margin-top: 16px;">
          <div>${order.ship_name}</div>
          <div>${order.ship_address}</div>
          <div>${order.ship_city} - ${order.ship_pincode}</div>
          <div>${order.ship_phone}</div>
        </div>
      </div>
      <div class="meta">
        <div><strong>Invoice</strong></div>
        <div>${order.order_number}</div>
        <div>${invoiceDate}</div>
        ${order.payment_reference ? `<div>Payment ref: ${order.payment_reference}</div>` : ""}
      </div>
    </div>
    <div class="section">
      <h2>Order items</h2>
      <table>
        <thead>
          <tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th></tr>
        </thead>
        <tbody>
          ${lineItems}
        </tbody>
      </table>
      <table class="summary">
        <tr><td>Subtotal</td><td class="right">₹${Number(order.subtotal).toFixed(2)}</td></tr>
        <tr><td>Shipping</td><td class="right">${Number(order.shipping_fee) > 0 ? `₹${Number(order.shipping_fee).toFixed(2)}` : 'FREE (₹0.00)'}</td></tr>
        <tr class="total"><td>Total</td><td class="right">₹${Number(order.total).toFixed(2)}</td></tr>
      </table>
    </div>
    <div class="footer">Thank you for shopping with Uma's Fashion & Boutique.</div>
  </div>
</body>
</html>`;
}

// Only instantiate Razorpay if keys are available
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

async function createRazorpayOrder(req, res, next) {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "orderId is required." });

    const order = await Order.findOne({ _id: orderId, user_id: req.user.id });
    if (!order) return res.status(404).json({ error: "Order not found." });

    if (order.payment_method !== "online") {
      return res.status(400).json({ error: "This order is not set up for Razorpay online payment." });
    }
    if (order.payment_status === "paid") {
      return res.status(400).json({ error: "This order has already been paid." });
    }

    if (!razorpay) {
      return res.status(500).json({ error: "Razorpay is not configured on the server." });
    }

    const rpOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.total) * 100), // paise
      currency: "INR",
      receipt: order.order_number,
      notes: { orderId: order._id.toString(), userId: req.user.id.toString() },
    });

    order.razorpay_order_id = rpOrder.id;
    await order.save();

    res.json({
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification fields." });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: "Razorpay secret is not configured on the server." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed. Signature mismatch." });
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, user_id: req.user.id, razorpay_order_id },
      {
        $set: {
          payment_status: "paid",
          razorpay_payment_id,
          status: "Processing",
          payment_verified_at: new Date(),
          updated_at: Date.now(),
        },
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found." });

    // Clear the user's cart once payment is confirmed.
    await CartItem.deleteMany({ user_id: req.user.id });

    // Generate a simple e-bill (HTML) and store it under /uploads/invoices/{orderId}.html
    try {
      const uploadsDir = path.join(__dirname, "../../uploads/invoices");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const invoicePath = `/uploads/invoices/${order._id}.html`;
      const fullInvoiceFile = path.join(uploadsDir, `${order._id}.html`);
      const invoiceDate = formatInvoiceDate(order.payment_verified_at || order.created_at || Date.now());

      const invoiceHtml = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Invoice - ${order.order_number}</title></head>
<body style="font-family: Arial, sans-serif; max-width:800px;margin:0 auto;padding:20px;">
  <h1>Uma's Fashion & Boutique</h1>
  <h2>Invoice — ${order.order_number}</h2>
  <p><strong>Date:</strong> ${invoiceDate}</p>
      ${order.payment_reference ? `<p><strong>Payment ref:</strong> ${order.payment_reference}</p>` : ""}
  <h3>Billing / Shipping</h3>
  <p>${order.ship_name}<br/>${order.ship_phone}<br/>${order.ship_address}, ${order.ship_city} - ${order.ship_pincode}</p>
  <h3>Items</h3>
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr><th style="text-align:left;border-bottom:1px solid #ddd;padding:8px">Item</th><th style="text-align:right;border-bottom:1px solid #ddd;padding:8px">Qty</th><th style="text-align:right;border-bottom:1px solid #ddd;padding:8px">Price</th></tr></thead>
    <tbody>
      ${order.items
          .map(
            (it) => `<tr><td style="padding:8px;border-bottom:1px solid #f1f1f1">${it.product_name} (${it.size})</td><td style="padding:8px;border-bottom:1px solid #f1f1f1;text-align:right">${it.quantity}</td><td style="padding:8px;border-bottom:1px solid #f1f1f1;text-align:right">₹${Number(
              it.price
            ).toFixed(2)}</td></tr>`
          )
          .join("")}
    </tbody>
  </table>
  <h3 style="text-align:right">Subtotal: ₹${Number(order.subtotal).toFixed(2)}</h3>
  <h3 style="text-align:right">Shipping: ${Number(order.shipping_fee) > 0 ? `₹${Number(order.shipping_fee).toFixed(2)}` : 'FREE (₹0.00)'}</h3>
  <h2 style="text-align:right">Total: ₹${Number(order.total).toFixed(2)}</h2>
  <p>Thank you for shopping with Uma's Fashion & Boutique.</p>
</body>
</html>`;

      fs.writeFileSync(fullInvoiceFile, invoiceHtml, "utf8");

      order.invoice_url = invoicePath;
      order.notified = false;
      await order.save();

      // Optionally send email notification if SMTP is configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && order.user_id) {
        try {
          // load user email
          await order.populate("user_id", "email");
          const userEmail = order.user_id && order.user_id.email;
          if (userEmail) {
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT || 587),
              secure: process.env.SMTP_SECURE === "true",
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            });

            const siteUrl = process.env.CLIENT_URL || "";
            const invoiceLink = `${siteUrl}${invoicePath}`;

            await transporter.sendMail({
              from: process.env.EMAIL_FROM || process.env.SMTP_USER,
              to: userEmail,
              subject: `Your invoice for order ${order.order_number}`,
              html: `<p>Hi,</p><p>Thanks for your purchase. Your order <strong>${order.order_number}</strong> has been paid successfully.</p><p>You can download your invoice here: <a href="${invoiceLink}">Invoice</a></p>`,
            });

            order.notified = true;
            await order.save();
          }
        } catch (mailErr) {
          // Log and continue — email is optional
          console.error("Failed to send invoice email:", mailErr);
        }
      }
    } catch (invErr) {
      console.error("Failed to generate invoice:", invErr);
    }

    res.json({ success: true, invoiceUrl: order.invoice_url });
  } catch (err) {
    next(err);
  }
}

async function confirmUpiPayment(req, res, next) {
  try {
    const { orderId, paymentReference, paymentProofUrl, paymentChannel } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required." });
    }

    const order = await Order.findOne({ _id: orderId, user_id: req.user.id });
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (order.payment_method !== "upi" && order.payment_method !== "online" && order.payment_method !== "card") {
      return res.status(400).json({ error: "This order is not set up for payment confirmation." });
    }

    if (order.payment_status === "paid") {
      // Clear user's cart if still present
      await CartItem.deleteMany({ user_id: req.user.id });
      return res.json({
        success: true, paymentStatus: order.payment_status, invoiceUrl: order.invoice_url, order: {
          id: order._id,
          orderNumber: order.order_number,
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          total: order.total,
          paymentReference: order.payment_reference,
          paymentProofUrl: order.payment_proof_url,
          paymentChannel: order.payment_channel,
        }
      });
    }

    if (order.payment_status === "verification_requested") {
      // Clear user's cart if still present
      await CartItem.deleteMany({ user_id: req.user.id });
      return res.json({
        success: true,
        paymentStatus: order.payment_status,
        message: "Payment verification is already pending. Please wait for admin approval.",
        order: {
          id: order._id,
          orderNumber: order.order_number,
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          total: order.total,
          paymentReference: order.payment_reference,
          paymentProofUrl: order.payment_proof_url,
          paymentChannel: order.payment_channel,
        },
      });
    }

    order.payment_status = "verification_requested";
    order.status = "Placed";
    order.razorpay_payment_id = order.razorpay_payment_id || `REQ-${Date.now()}`;
    if (paymentReference) {
      order.payment_reference = String(paymentReference).trim();
    }
    if (paymentProofUrl) {
      order.payment_proof_url = String(paymentProofUrl).trim();
    }
    if (paymentChannel) {
      order.payment_channel = String(paymentChannel).trim();
    }
    await order.save();

    // Clear user's cart once transaction ID / UTR is submitted
    await CartItem.deleteMany({ user_id: req.user.id });

    return res.json({
      success: true,
      paymentStatus: order.payment_status,
      message: "UPI payment verification has been requested. Your order will be updated once the payment is confirmed.",
      order: {
        id: order._id,
        orderNumber: order.order_number,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        total: order.total,
        paymentReference: order.payment_reference,
        paymentProofUrl: order.payment_proof_url,
        paymentChannel: order.payment_channel,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function manualConfirm(req, res, next) {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "orderId is required." });

    const order = await Order.findOne({ _id: orderId });
    if (!order) return res.status(404).json({ error: "Order not found." });

    // This endpoint can be used by admin to mark order as paid and generate invoice
    order.payment_status = "paid";
    order.status = "Processing";
    order.razorpay_payment_id = `MANUAL-${Date.now()}`;
    await order.save();

    // Clear the user's cart once payment is confirmed.
    await CartItem.deleteMany({ user_id: order.user_id });

    // generate invoice same as other flows
    try {
      const uploadsDir = path.join(__dirname, "../../uploads/invoices");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const invoicePath = `/uploads/invoices/${order._id}.html`;
      const fullInvoiceFile = path.join(uploadsDir, `${order._id}.html`);
      const invoiceDate = formatInvoiceDate(order.payment_verified_at || order.created_at || Date.now());

      const invoiceHtml = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Invoice - ${order.order_number}</title></head>
<body style="font-family: Arial, sans-serif; max-width:800px;margin:0 auto;padding:20px;">
  <h1>Uma's Fashion & Boutique</h1>
  <h2>Invoice — ${order.order_number}</h2>
  <p><strong>Date:</strong> ${invoiceDate}</p>
  <h3>Billing / Shipping</h3>
  <p>${order.ship_name}<br/>${order.ship_phone}<br/>${order.ship_address}, ${order.ship_city} - ${order.ship_pincode}</p>
  <h3>Items</h3>
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr><th style="text-align:left;border-bottom:1px solid #ddd;padding:8px">Item</th><th style="text-align:right;border-bottom:1px solid #ddd;padding:8px">Qty</th><th style="text-align:right;border-bottom:1px solid #ddd;padding:8px">Price</th></tr></thead>
    <tbody>
      ${order.items
          .map(
            (it) => `<tr><td style="padding:8px;border-bottom:1px solid #f1f1f1">${it.product_name} (${it.size})</td><td style="padding:8px;border-bottom:1px solid #f1f1f1;text-align:right">${it.quantity}</td><td style="padding:8px;border-bottom:1px solid #f1f1f1;text-align:right">₹${Number(
              it.price
            ).toFixed(2)}</td></tr>`
          )
          .join("")}
    </tbody>
  </table>
  <h3 style="text-align:right">Subtotal: ₹${Number(order.subtotal).toFixed(2)}</h3>
  <h3 style="text-align:right">Shipping: ${Number(order.shipping_fee) > 0 ? `₹${Number(order.shipping_fee).toFixed(2)}` : 'FREE (₹0.00)'}</h3>
  <h2 style="text-align:right">Total: ₹${Number(order.total).toFixed(2)}</h2>
  <p>Thank you for shopping with Uma's Fashion & Boutique.</p>
</body>
</html>`;

      fs.writeFileSync(fullInvoiceFile, invoiceHtml, "utf8");
      order.invoice_url = invoicePath;
      order.notified = false;
      await order.save();
    } catch (invErr) {
      console.error("Failed to generate invoice:", invErr);
    }

    res.json({ success: true, invoiceUrl: order.invoice_url });
  } catch (err) {
    next(err);
  }
}

module.exports = { createRazorpayOrder, verifyPayment, confirmUpiPayment, manualConfirm, generateInvoiceHtml };
