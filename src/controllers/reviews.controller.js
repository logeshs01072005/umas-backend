const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

async function recalculateProductRatings(productId) {
  const stats = await Review.aggregate([
    { $match: { product_id: productId, status: "Approved" } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg_rating = stats[0] ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const num_reviews = stats[0] ? stats[0].count : 0;

  await Product.findByIdAndUpdate(productId, { avg_rating, num_reviews });
}

async function createReview(req, res, next) {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) {
      return res.status(400).json({ error: "Product ID and Rating (1-5) are required." });
    }
    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5 stars." });
    }

    // Verified purchase check
    const deliveredOrder = await Order.findOne({
      user_id: req.user.id,
      status: "Delivered",
      "items.product_id": productId,
    });

    if (!deliveredOrder) {
      return res.status(403).json({ error: "Only verified customers who purchased and received this product can write a review." });
    }

    // Check duplicate review
    const existing = await Review.findOne({ product_id: productId, user_id: req.user.id });
    if (existing) {
      return res.status(409).json({ error: "You have already submitted a review for this product." });
    }

    const review = await Review.create({
      product_id: productId,
      user_id: req.user.id,
      user_name: req.user.name || "Verified Customer",
      rating: numericRating,
      comment: comment || "",
      status: "Approved",
    });

    await recalculateProductRatings(productId);

    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "You have already submitted a review for this product." });
    }
    next(err);
  }
}

async function getProductReviews(req, res, next) {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product_id: productId, status: "Approved" }).sort({ created_at: -1 });
    const product = await Product.findById(productId).select("avg_rating num_reviews");

    res.json({
      reviews,
      avgRating: product ? product.avg_rating || 0 : 0,
      totalCount: product ? product.num_reviews || 0 : 0,
    });
  } catch (err) {
    next(err);
  }
}

// Admin handlers
async function getAllReviewsAdmin(req, res, next) {
  try {
    const reviews = await Review.find()
      .populate("product_id", "name category image_url")
      .populate("user_id", "name email")
      .sort({ created_at: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

async function updateReviewStatusAdmin(req, res, next) {
  try {
    const { status } = req.body;
    if (!["Approved", "Pending", "Hidden", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid review status." });
    }

    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ error: "Review not found." });

    await recalculateProductRatings(review.product_id);

    res.json({ review, message: `Review status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
}

async function deleteReviewAdmin(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found." });

    await recalculateProductRatings(review.product_id);

    res.json({ success: true, message: "Review deleted successfully." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReview,
  getProductReviews,
  getAllReviewsAdmin,
  updateReviewStatusAdmin,
  deleteReviewAdmin,
};
