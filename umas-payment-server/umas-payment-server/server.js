require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------------------------------------------------------------
// Product prices — kept in sync with SEED_PRODUCTS in
// umas-fashion-boutique.jsx. If you add/edit products there,
// update this list too (or, better, move both to a shared source
// like a database once you're past the prototype stage).
// ---------------------------------------------------------------
const PRODUCT_PRICES = {
  p1: 8999, p2: 10999, p3: 3499, p4: 4999, p5: 24999, p6: 15999,
  p7: 18999, p8: 2799, p9: 1899, p10: 1299, p11: 2499, p12: 3999,
  p13: 2999, p14: 1999, p15: 899, p16: 1499, p17: 1299, p18: 1999,
};
const FREE_SHIPPING_THRESHOLD = 2999;
const FLAT_SHIPPING_FEE = 99;

// In-memory order store — swap for a real database when you connect
// the full backend. Keyed by our own orderId so the amount we verify
// against is always the one WE calculated, never one sent by the browser.
const orders = {};

function priceCart(items) {
  // items: [{ productId, name, size, qty }]
  let subtotal = 0;
  const priced = items.map((i) => {
    const price = PRODUCT_PRICES[i.productId];
    if (price == null) throw new Error(`Unknown product: ${i.productId}`);
    const lineTotal = price * i.qty;
    subtotal += lineTotal;
    return { ...i, price, lineTotal };
  });
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING_FEE;
  return { items: priced, subtotal, shipping, total: subtotal + shipping };
}

app.get("/health", (req, res) => res.json({ ok: true }));

// ---------- Cash on Delivery: place order immediately, no gateway needed ----------
app.post("/api/orders/cod", (req, res) => {
  try {
    const { items, address } = req.body;
    const priced = priceCart(items);
    const orderId = "ORD" + Date.now().toString(36).toUpperCase();

    orders[orderId] = {
      ...priced,
      address,
      method: "cod",
      status: "cod-pending",
      createdAt: new Date().toISOString(),
    };

    res.json({ orderId, order: orders[orderId] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Online payment, step 1: create a Razorpay order ----------
app.post("/api/payments/razorpay/create-order", async (req, res) => {
  try {
    const { items, address } = req.body;
    const priced = priceCart(items);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(priced.total * 100), // paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    orders[razorpayOrder.id] = {
      ...priced,
      address,
      method: "online",
      status: "created",
      createdAt: new Date().toISOString(),
    };

    res.json({
      key: process.env.RAZORPAY_KEY_ID, // public key, safe for the browser
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Could not create payment order" });
  }
});

// ---------- Online payment, step 2: verify signature after Checkout completes ----------
app.post("/api/payments/razorpay/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ verified: false, error: "Invalid payment signature" });
  }

  const order = orders[razorpay_order_id];
  if (!order) return res.status(404).json({ verified: false, error: "Unknown order" });

  order.status = "paid";
  order.paymentId = razorpay_payment_id;

  res.json({ verified: true, orderId: razorpay_order_id, order });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Payment server running on http://localhost:${PORT}`));
