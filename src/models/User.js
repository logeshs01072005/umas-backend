const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  city: {
    type: String,
    default: null,
  },
  pincode: {
    type: String,
    default: null,
  },
  is_admin: {
    type: Boolean,
    required: true,
    default: false,
  },
  status: {
    type: String,
    enum: ["Active", "Blocked"],
    default: "Active",
  },
  avatar_url: {
    type: String,
    default: null,
  },
  saved_addresses: [
    {
      label: { type: String, default: "Home" },
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      is_default: { type: Boolean, default: false },
    },
  ],
  reset_password_token: {
    type: String,
    default: null,
  },
  reset_password_expires: {
    type: Date,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
