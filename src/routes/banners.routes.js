const express = require("express");
const {
  getActiveBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../controllers/banners.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", getActiveBanners);
router.get("/admin", requireAuth, requireAdmin, getAllBannersAdmin);
router.post("/admin", requireAuth, requireAdmin, createBanner);
router.put("/admin/:id", requireAuth, requireAdmin, updateBanner);
router.delete("/admin/:id", requireAuth, requireAdmin, deleteBanner);

module.exports = router;
