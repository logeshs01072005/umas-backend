const express = require("express");
const {
  getCart, addToCart, updateCartItem, removeCartItem, clearCart,
} = require("../controllers/cart.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:cartItemId", updateCartItem);
router.patch("/:cartItemId", updateCartItem);
router.delete("/:cartItemId", removeCartItem);
router.delete("/", clearCart);

module.exports = router;
