const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

async function getCart(req, res, next) {
  try {
    const dbItems = await CartItem.find({ user_id: req.user.id })
      .populate("product_id")
      .sort({ created_at: 1 });

    const items = [];
    for (const item of dbItems) {
      // If product doesn't exist or is inactive, skip (or we could clean it up)
      if (!item.product_id || !item.product_id.is_active) {
        continue;
      }
      items.push({
        cartItemId: item._id,
        productId: item.product_id._id,
        name: item.product_id.name,
        category: item.product_id.category,
        price: Number(item.product_id.price),
        mrp: Number(item.product_id.mrp),
        tag: item.product_id.tag,
        imageUrl: item.product_id.image_url,
        size: item.size,
        quantity: item.quantity,
      });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ items, subtotal });
  } catch (err) {
    next(err);
  }
}

async function addToCart(req, res, next) {
  try {
    const { productId, size, quantity } = req.body;
    if (!productId || !size || !quantity || quantity < 1) {
      return res.status(400).json({ error: "productId, size and a positive quantity are required." });
    }

    const product = await Product.findOne({ _id: productId, is_active: true });
    if (!product) return res.status(404).json({ error: "Product not found." });

    await CartItem.findOneAndUpdate(
      { user_id: req.user.id, product_id: productId, size },
      { $inc: { quantity: quantity } },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: "quantity must be at least 1." });

    const item = await CartItem.findOneAndUpdate(
      { _id: req.params.cartItemId, user_id: req.user.id },
      { $set: { quantity } },
      { new: true }
    );

    if (!item) return res.status(404).json({ error: "Cart item not found." });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function removeCartItem(req, res, next) {
  try {
    const item = await CartItem.findOneAndDelete({
      _id: req.params.cartItemId,
      user_id: req.user.id,
    });
    if (!item) return res.status(404).json({ error: "Cart item not found." });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    await CartItem.deleteMany({ user_id: req.user.id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
