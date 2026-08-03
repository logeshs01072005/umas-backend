const express = require("express");
const { createRazorpayOrder, verifyPayment, confirmUpiPayment, manualConfirm } = require("../controllers/payment.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.post("/razorpay/create-order", createRazorpayOrder);
router.post("/razorpay/verify", verifyPayment);
router.post("/manual-confirm", requireAdmin, manualConfirm);
router.post("/upi/confirm", confirmUpiPayment);

module.exports = router;
