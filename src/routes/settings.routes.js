const express = require("express");
const { getPaymentSettings, updatePaymentSettings, getPromoSettings, updatePromoSettings, getActiveTheme, updateActiveTheme } = require("../controllers/settings.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/payment-methods", getPaymentSettings);
router.put("/admin/payment-methods", requireAuth, requireAdmin, updatePaymentSettings);

router.get("/promo", getPromoSettings);
router.put("/admin/promo", requireAuth, requireAdmin, updatePromoSettings);

router.get("/active-theme", getActiveTheme);
router.put("/admin/active-theme", requireAuth, requireAdmin, updateActiveTheme);

module.exports = router;

