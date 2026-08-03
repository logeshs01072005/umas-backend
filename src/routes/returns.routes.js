const express = require("express");
const {
  createReturnRequest,
  getMyReturnRequests,
  checkReturnEligibility,
  getAllReturnRequestsAdmin,
  updateReturnStatusAdmin,
} = require("../controllers/returns.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, createReturnRequest);
router.get("/my-returns", requireAuth, getMyReturnRequests);
router.get("/eligibility/:orderId", requireAuth, checkReturnEligibility);

router.get("/admin", requireAuth, requireAdmin, getAllReturnRequestsAdmin);
router.put("/admin/:id/status", requireAuth, requireAdmin, updateReturnStatusAdmin);

module.exports = router;
