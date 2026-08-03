const mongoose = require("mongoose");

const trackingEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const deliveryTrackingSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    unique: true,
  },
  order_number: {
    type: String,
    required: true,
  },
  current_status: {
    type: String,
    enum: ["Order Placed", "Payment Confirmed", "Processing", "Packed", "Shipped", "Dispatched", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Order Placed",
  },
  carrier: {
    type: String,
    default: "Express Delivery",
  },
  tracking_number: {
    type: String,
    default: "",
  },
  estimated_delivery: {
    type: Date,
    default: null,
  },
  timeline: [trackingEventSchema],
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DeliveryTracking", deliveryTrackingSchema);
