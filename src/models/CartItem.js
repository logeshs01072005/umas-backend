const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure uniqueness per user, product, and size
cartItemSchema.index({ user_id: 1, product_id: 1, size: 1 }, { unique: true });

module.exports = mongoose.model("CartItem", cartItemSchema);
