const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
  product_name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
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
});

const orderSchema = new mongoose.Schema({
  order_number: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Placed",
    enum: ["Placed", "Processing", "Packed", "Shipped", "Dispatched", "Out for Delivery", "Delivered", "Cancelled"],
  },
  payment_method: {
    type: String,
    required: true,
    enum: ["cod", "online", "upi", "card", "net_banking"],
  },
  payment_status: {
    type: String,
    required: true,
    default: "pending",
  },
  razorpay_order_id: {
    type: String,
    default: null,
  },
  razorpay_payment_id: {
    type: String,
    default: null,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  shipping_fee: {
    type: Number,
    required: true,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  ship_name: {
    type: String,
    required: true,
  },
  ship_phone: {
    type: String,
    required: true,
  },
  ship_address: {
    type: String,
    required: true,
  },
  ship_city: {
    type: String,
    required: true,
  },
  ship_pincode: {
    type: String,
    required: true,
  },
  items: [orderItemSchema],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  payment_channel: {
    type: String,
    default: null,
  },
  payment_reference: {
    type: String,
    default: null,
  },
  payment_proof_url: {
    type: String,
    default: null,
  },
  payment_verified_by: {
    type: String,
    default: null,
  },
  payment_verified_at: {
    type: Date,
    default: null,
  },
  payment_verification_notes: {
    type: String,
    default: null,
  },
  invoice_url: {
    type: String,
    default: null,
  },
  notified: {
    type: Boolean,
    default: false,
  },
});

// Indexes for ultra-fast query execution
orderSchema.index({ user_id: 1, created_at: -1 });
orderSchema.index({ created_at: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ payment_status: 1 });

module.exports = mongoose.model("Order", orderSchema);
