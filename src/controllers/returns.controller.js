const ReturnRequest = require("../models/ReturnRequest");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");

const RETURN_WINDOW_DAYS = 7;

async function createReturnRequest(req, res, next) {
  try {
    const { orderId, customerPhone, productName, reason, customReason, comments, imageUrls } = req.body;
    if (!orderId || !customerPhone || !productName || !reason) {
      return res.status(400).json({ error: "Order ID, Phone Number, Product Name, and Reason are required." });
    }

    const order = await Order.findOne({ _id: orderId, user_id: req.user.id });
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({ error: "Only delivered orders are eligible for return." });
    }

    // Check delivery window (7 days)
    const deliveryDate = order.updated_at || order.created_at;
    const diffMs = Date.now() - new Date(deliveryDate).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > RETURN_WINDOW_DAYS) {
      return res.status(400).json({ error: "Return Period Expired. Returns must be requested within 7 days of delivery." });
    }

    // Check if a request already exists for this order
    const existing = await ReturnRequest.findOne({ order_id: order._id, product_name: productName });
    if (existing) {
      return res.status(409).json({ error: "A return request for this item is already submitted." });
    }

    const doc = await ReturnRequest.create({
      order_id: order._id,
      order_number: order.order_number,
      user_id: req.user.id,
      customer_phone: customerPhone,
      product_name: productName,
      reason,
      custom_reason: customReason || "",
      comments: comments || "",
      image_urls: Array.isArray(imageUrls) ? imageUrls : [],
      status: "Pending",
    });

    res.status(201).json({ returnRequest: doc });
  } catch (err) {
    next(err);
  }
}

async function getMyReturnRequests(req, res, next) {
  try {
    const requests = await ReturnRequest.find({ user_id: req.user.id }).sort({ requested_at: -1 });
    res.json({ returnRequests: requests });
  } catch (err) {
    next(err);
  }
}

async function checkReturnEligibility(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, user_id: req.user.id });
    if (!order) return res.status(404).json({ error: "Order not found." });

    if (order.status !== "Delivered") {
      return res.json({
        eligible: false,
        reason: "Order is not yet delivered.",
        remainingDays: 0,
      });
    }

    const deliveryDate = order.updated_at || order.created_at;
    const diffMs = Date.now() - new Date(deliveryDate).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const remainingDays = Math.max(0, Math.ceil(RETURN_WINDOW_DAYS - diffDays));

    if (diffDays > RETURN_WINDOW_DAYS) {
      return res.json({
        eligible: false,
        reason: "Return Period Expired",
        remainingDays: 0,
      });
    }

    res.json({
      eligible: true,
      remainingDays,
      message: `Return available for ${remainingDays} days after delivery`,
    });
  } catch (err) {
    next(err);
  }
}

// Admin controllers
async function getAllReturnRequestsAdmin(req, res, next) {
  try {
    const requests = await ReturnRequest.find()
      .populate("user_id", "name email phone")
      .sort({ requested_at: -1 });
    res.json({ returnRequests: requests });
  } catch (err) {
    next(err);
  }
}

async function updateReturnStatusAdmin(req, res, next) {
  try {
    const { status, adminNotes } = req.body;
    if (!["Approved", "Rejected", "Refund Completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid return status." });
    }

    const returnReq = await ReturnRequest.findById(req.params.id);
    if (!returnReq) return res.status(404).json({ error: "Return request not found." });

    const previousStatus = returnReq.status;
    returnReq.status = status;
    if (adminNotes !== undefined) returnReq.admin_notes = adminNotes;
    returnReq.processed_at = Date.now();
    await returnReq.save();

    // If status changed to Approved, automatically restock item quantity in inventory
    if (status === "Approved" && previousStatus !== "Approved") {
      const order = await Order.findById(returnReq.order_id);
      if (order) {
        const item = order.items.find((i) => i.product_name === returnReq.product_name);
        if (item && item.product_id) {
          const product = await Product.findById(item.product_id);
          if (product) {
            product.stock += item.quantity;
            if (product.stock > 0 && product.status === "Out of Stock") {
              product.status = "Available";
            }
            await product.save();
          }
        }
      }
    }

    // If status changed to Refund Completed, record refund transaction
    if (status === "Refund Completed" && previousStatus !== "Refund Completed") {
      const order = await Order.findById(returnReq.order_id);
      if (order) {
        await Transaction.create({
          user_id: returnReq.user_id,
          order_id: returnReq.order_id,
          transaction_id: `REFUND-${Date.now()}`,
          payment_method: order.payment_method,
          amount: order.total,
          type: "Refund",
          status: "Success",
          description: `Refund completed for order ${order.order_number}`,
        });
      }
    }

    res.json({ returnRequest: returnReq, message: `Return request status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReturnRequest,
  getMyReturnRequests,
  checkReturnEligibility,
  getAllReturnRequestsAdmin,
  updateReturnStatusAdmin,
};
