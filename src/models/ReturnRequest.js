const mongoose = require("mongoose");

const returnRequestSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  order_number: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  customer_phone: {
    type: String,
    required: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  custom_reason: {
    type: String,
    default: "",
  },
  comments: {
    type: String,
    default: "",
  },
  image_urls: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Refund Completed"],
    default: "Pending",
  },
  admin_notes: {
    type: String,
    default: "",
  },
  requested_at: {
    type: Date,
    default: Date.now,
  },
  processed_at: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);
