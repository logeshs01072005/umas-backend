const express = require("express");
const { getAllCustomers, updateCustomerStatus, getDashboardStats, getCustomerCart, getCustomerOrders, getPendingPayments } = require("../controllers/admin.controller");
const { getAllOrders, updateOrderStatus, getOrderById, verifyOrderPayment } = require("../controllers/orders.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/stats", getDashboardStats);
router.get("/customers", getAllCustomers);
router.put("/customers/:id/status", updateCustomerStatus);
router.get("/customers/:id/cart", getCustomerCart);
router.get("/customers/:id/orders", getCustomerOrders);

router.get("/payments/pending", getPendingPayments);

router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/status", updateOrderStatus);
router.post("/orders/:id/verify-payment", verifyOrderPayment);

module.exports = router;
