const NotificationSubscription = require("../models/NotificationSubscription");
const Product = require("../models/Product");

async function subscribeStockNotification(req, res, next) {
  try {
    const { productId, email, phone } = req.body;
    if (!productId || (!email && !phone)) {
      return res.status(400).json({ error: "Product ID and Email or Phone are required." });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found." });

    const existing = await NotificationSubscription.findOne({
      product_id: productId,
      email: email ? email.toLowerCase() : null,
    });

    if (existing) {
      return res.json({ message: "You are already subscribed for stock alerts on this product." });
    }

    const subscription = await NotificationSubscription.create({
      user_id: req.user ? req.user.id : null,
      email: email ? email.toLowerCase() : (req.user ? req.user.email : ""),
      phone: phone || (req.user ? req.user.phone || "" : ""),
      product_id: productId,
    });

    res.status(201).json({
      subscription,
      message: `Subscribed successfully! We will notify you when "${product.name}" is back in stock.`,
    });
  } catch (err) {
    next(err);
  }
}

async function notifySubscribersIfRestocked(productId) {
  try {
    const product = await Product.findById(productId);
    if (!product || product.stock <= 0) return;

    const subscriptions = await NotificationSubscription.find({ product_id: productId, notified: false });
    for (const sub of subscriptions) {
      sub.notified = true;
      await sub.save();
    }
  } catch (err) {
    console.error("Error notifying subscribers:", err);
  }
}

module.exports = {
  subscribeStockNotification,
  notifySubscribersIfRestocked,
};
