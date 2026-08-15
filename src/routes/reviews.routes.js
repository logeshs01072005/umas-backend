const express = require("express");
const {
  createReview,
  updateReview,
  getProductReviews,
  getAllReviewsAdmin,
  updateReviewStatusAdmin,
  deleteReviewAdmin,
} = require("../controllers/reviews.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/product/:productId", getProductReviews);
router.post("/", requireAuth, createReview);
router.put("/:id", requireAuth, updateReview);

router.get("/admin", requireAuth, requireAdmin, getAllReviewsAdmin);
router.put("/admin/:id/status", requireAuth, requireAdmin, updateReviewStatusAdmin);
router.delete("/admin/:id", requireAuth, requireAdmin, deleteReviewAdmin);

module.exports = router;
