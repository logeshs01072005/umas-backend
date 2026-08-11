const fs = require("fs");
const path = require("path");
const Order = require("../models/Order");
const Product = require("../models/Product");
const CartItem = require("../models/CartItem");
const User = require("../models/User");
const Setting = require("../models/Setting");
const Transaction = require("../models/Transaction");
const DeliveryTracking = require("../models/DeliveryTracking");
const { generateOrderNumber } = require("../utils/orderNumber");
const { generateInvoiceHtml } = require("../controllers/payment.controller");

const FREE_SHIPPING_THRESHOLD = Number(process.env.FREE_SHIPPING_THRESHOLD || 2999);
const FLAT_SHIPPING_FEE = Number(process.env.FLAT_SHIPPING_FEE || 99);
const VALID_STATUSES = ["Placed", "Processing", "Packed", "Shipped", "Dispatched", "Out for Delivery", "Delivered", "Cancelled"];

function mapOrder(doc) {
  if (!doc) return null;
  return {
    id: doc._id,
    orderNumber: doc.order_number,
    status: doc.status,
    paymentMethod: doc.payment_method,
    paymentStatus: doc.payment_status,
    subtotal: Number(doc.subtotal),
    shippingFee: Number(doc.shipping_fee),
    total: Number(doc.total),
    shipping: {
      name: doc.ship_name,
      phone: doc.ship_phone,
      address: doc.ship_address,
      city: doc.ship_city,
      pincode: doc.ship_pincode,
    },
    items: (doc.items || []).map((i) => ({
      productId: i.product_id,
      name: i.product_name,
      category: i.category,
      price: Number(i.price),
      size: i.size,
      quantity: i.quantity,
    })),
    userEmail: doc.user_id && typeof doc.user_id === "object" ? doc.user_id.email : null,
    paymentChannel: doc.payment_channel || null,
    paymentReference: doc.payment_reference || null,
    paymentVerifiedBy: doc.payment_verified_by || null,
    paymentVerificationNotes: doc.payment_verification_notes || null,
    invoiceUrl: doc.invoice_url || null,
    notified: !!doc.notified,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
}

async function placeOrder(req, res, next) {
  try {
    const { paymentMethod, shipping } = req.body;
    if (!["cod", "online", "upi", "card", "net_banking"].includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid paymentMethod." });
    }

    // Check payment settings in DB
    const settingDoc = await Setting.findOne({ key: "payment_methods" });
    if (settingDoc && settingDoc.value) {
      // "online" maps to the "online" key first; fall back to "card" for backwards compatibility
      const pmKey = paymentMethod === "online" ? "online" : paymentMethod;
      const config = settingDoc.value[pmKey] || (paymentMethod === "online" ? settingDoc.value["card"] : null);
      if (config && config.enabled === false) {
        return res.status(400).json({
          error: `${config.customMessage || "This payment method is currently unavailable (Coming Soon)."}`
        });
      }
    }

    const required = ["name", "phone", "address", "city", "pincode"];
    for (const field of required) {
      if (!shipping || !shipping[field]) {
        return res.status(400).json({ error: `shipping.${field} is required.` });
      }
    }

    await User.findByIdAndUpdate(req.user.id, {
      name: shipping.name,
      phone: shipping.phone,
      address: shipping.address,
      city: shipping.city,
      pincode: shipping.pincode,
    });

    const cartItems = await CartItem.find({ user_id: req.user.id }).populate("product_id");

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }

    // Verify stock availability & active status
    for (const item of cartItems) {
      if (!item.product_id || !item.product_id.is_active) {
        return res.status(400).json({ error: `Product in cart is no longer active.` });
      }
      if (item.product_id.status === "Out of Stock" || item.product_id.stock < item.quantity) {
        return res.status(409).json({ error: `Insufficient stock for "${item.product_id.name}". Only ${item.product_id.stock} left.` });
      }
    }

    const subtotal = cartItems.reduce((sum, i) => sum + Number(i.product_id.price) * i.quantity, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
    const total = subtotal + shippingFee;
    const orderNumber = generateOrderNumber();

    const items = cartItems.map((item) => ({
      product_id: item.product_id._id,
      product_name: item.product_id.name,
      category: item.product_id.category,
      price: item.product_id.price,
      size: item.size,
      quantity: item.quantity,
    }));

    // Deduct stock and update status if 0
    for (const item of cartItems) {
      const prod = await Product.findById(item.product_id._id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (prod.stock === 0) {
          prod.status = "Out of Stock";
        }
        await prod.save();
      }
    }

    const channelLabel =
      paymentMethod === "cod"
        ? "Cash on Delivery"
        : paymentMethod === "online" || paymentMethod === "card"
          ? "Card Payment"
          : paymentMethod === "upi"
            ? "UPI / QR"
            : "Net Banking";

    const doc = await Order.create({
      order_number: orderNumber,
      user_id: req.user.id,
      payment_method: paymentMethod,
      payment_channel: channelLabel,
      subtotal,
      shipping_fee: shippingFee,
      total,
      ship_name: shipping.name,
      ship_phone: shipping.phone,
      ship_address: shipping.address,
      ship_city: shipping.city,
      ship_pincode: shipping.pincode,
      items,
    });

    // Create Initial Delivery Tracking timeline
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 5);

    await DeliveryTracking.create({
      order_id: doc._id,
      order_number: doc.order_number,
      current_status: "Order Placed",
      estimated_delivery: estimatedDate,
      timeline: [
        { status: "Order Placed", description: "Order has been placed successfully.", timestamp: new Date() },
      ],
    });

    // Record Transaction
    await Transaction.create({
      user_id: req.user.id,
      order_id: doc._id,
      transaction_id: `TXN-${doc.order_number}`,
      payment_method: channelLabel,
      amount: total,
      type: "Payment",
      status: "Pending",
      description: `Order #${doc.order_number} payment via ${channelLabel}`,
    });

    // Clear cart immediately only for COD orders. For UPI and other remote payments,
    // keep cart until payment verification to allow retry/back navigation and persistence.
    if (paymentMethod === "cod") {
      await CartItem.deleteMany({ user_id: req.user.id });
    }

    const populated = await Order.findById(doc._id).populate("user_id", "email");
    res.status(201).json({ order: mapOrder(populated) });
  } catch (err) {
    next(err);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const docs = await Order.find({ user_id: req.user.id })
      .populate("user_id", "email")
      .sort({ created_at: -1 });
    res.json({ orders: docs.map(mapOrder) });
  } catch (err) {
    next(err);
  }
}

async function getMyTransactions(req, res, next) {
  try {
    const transactions = await Transaction.find({ user_id: req.user.id })
      .populate("order_id", "order_number status")
      .sort({ created_at: -1 });
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const isAdmin = req.user.isAdmin;
    const query = isAdmin
      ? { _id: req.params.id }
      : { _id: req.params.id, user_id: req.user.id };

    const doc = await Order.findOne(query).populate("user_id", "email");
    if (!doc) return res.status(404).json({ error: "Order not found." });

    res.json({ order: mapOrder(doc) });
  } catch (err) {
    next(err);
  }
}

async function getOrderTracking(req, res, next) {
  try {
    const { id } = req.params;
    let tracking = await DeliveryTracking.findOne({ order_id: id });
    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ error: "Order not found." });

    if (!tracking) {
      const estimatedDate = new Date(order.created_at);
      estimatedDate.setDate(estimatedDate.getDate() + 5);

      tracking = await DeliveryTracking.create({
        order_id: order._id,
        order_number: order.order_number,
        current_status: order.status === "Placed" ? "Order Placed" : order.status,
        estimated_delivery: estimatedDate,
        timeline: [
          { status: "Order Placed", description: "Order has been placed.", timestamp: order.created_at },
        ],
      });
    }

    res.json({ tracking, order: mapOrder(order) });
  } catch (err) {
    next(err);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const docs = await Order.find()
      .populate("user_id", "email")
      .sort({ created_at: -1 });
    res.json({ orders: docs.map(mapOrder) });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    const prevOrder = await Order.findById(req.params.id);
    if (!prevOrder) return res.status(404).json({ error: "Order not found." });

    const previousStatus = prevOrder.status;

    const doc = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status, updated_at: Date.now() } },
      { new: true }
    );

    // Update tracking timeline
    let tracking = await DeliveryTracking.findOne({ order_id: doc._id });
    if (!tracking) {
      tracking = new DeliveryTracking({
        order_id: doc._id,
        order_number: doc.order_number,
        timeline: [],
      });
    }

    tracking.current_status = status;
    tracking.timeline.push({
      status,
      description: `Order status updated to ${status}`,
      timestamp: new Date(),
    });
    await tracking.save();

    // If order was cancelled, automatically restore product stock
    if (status === "Cancelled" && previousStatus !== "Cancelled") {
      for (const item of doc.items) {
        if (item.product_id) {
          const prod = await Product.findById(item.product_id);
          if (prod) {
            prod.stock += item.quantity;
            if (prod.stock > 0 && prod.status === "Out of Stock") {
              prod.status = "Available";
            }
            await prod.save();
          }
        }
      }
    }

    res.json({ success: true, order: mapOrder(doc), tracking });
  } catch (err) {
    next(err);
  }
}

async function verifyOrderPayment(req, res, next) {
  try {
    const { notes, paymentChannel } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (order.payment_status === "paid") {
      return res.status(400).json({ error: "Order payment is already verified." });
    }

    order.payment_status = "paid";
    order.status = "Processing";
    order.payment_verified_by = req.user.email || req.user.name || req.user.id;
    order.payment_verified_at = Date.now();
    order.payment_verification_notes = notes ? String(notes).trim() : null;
    if (paymentChannel) {
      order.payment_channel = String(paymentChannel).trim();
    }
    order.razorpay_payment_id = `ADMIN-${Date.now()}`;
    await order.save();

    await CartItem.deleteMany({ user_id: order.user_id });

    // Update tracking
    let tracking = await DeliveryTracking.findOne({ order_id: order._id });
    if (tracking) {
      tracking.current_status = "Payment Confirmed";
      tracking.timeline.push({
        status: "Payment Confirmed",
        description: "Payment has been verified by administrator.",
        timestamp: new Date(),
      });
      await tracking.save();
    }

    const uploadsDir = path.join(__dirname, "../../uploads/invoices");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const invoicePath = `/uploads/invoices/${order._id}.html`;
    const fullInvoiceFile = path.join(uploadsDir, `${order._id}.html`);
    const invoiceHtml = generateInvoiceHtml(order);
    fs.writeFileSync(fullInvoiceFile, invoiceHtml, "utf8");

    order.invoice_url = invoicePath;
    order.notified = false;
    await order.save();

    res.json({ success: true, invoiceUrl: order.invoice_url, order: mapOrder(order) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  placeOrder,
  getMyOrders,
  getMyTransactions,
  getOrderById,
  getOrderTracking,
  getAllOrders,
  updateOrderStatus,
  verifyOrderPayment,
};
