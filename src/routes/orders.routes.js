const express = require("express");
const {
  placeOrder,
  getMyOrders,
  getMyTransactions,
  getOrderById,
  getOrderTracking,
} = require("../controllers/orders.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Allow order tracking lookup by order ID or Order Number
router.get("/:id/tracking", getOrderTracking);

// Authenticated routes
router.use(requireAuth);

router.post("/", placeOrder);
router.get("/my-orders", getMyOrders);
router.get("/my-transactions", getMyTransactions);
router.get("/:id", getOrderById);

module.exports = router;

