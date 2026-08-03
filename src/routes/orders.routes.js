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

router.use(requireAuth);

router.post("/", placeOrder);
router.get("/my-orders", getMyOrders);
router.get("/my-transactions", getMyTransactions);
router.get("/:id", getOrderById);
router.get("/:id/tracking", getOrderTracking);

module.exports = router;
