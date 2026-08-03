const express = require("express");
const { getPaymentSettings, updatePaymentSettings } = require("../controllers/settings.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/payment-methods", getPaymentSettings);
router.put("/admin/payment-methods", requireAuth, requireAdmin, updatePaymentSettings);

module.exports = router;
