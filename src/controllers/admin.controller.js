const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const CartItem = require("../models/CartItem");
const Transaction = require("../models/Transaction");
const ReturnRequest = require("../models/ReturnRequest");
const ActivityLog = require("../models/ActivityLog");

async function getAllCustomers(req, res, next) {
  try {
    const customers = await User.find({ is_admin: false }).sort({ created_at: -1 });
    const formatted = customers.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone || "N/A",
      address: u.address ? `${u.address}${u.city ? ", " + u.city : ""}${u.pincode ? " - " + u.pincode : ""}` : "N/A",
      city: u.city || "",
      pincode: u.pincode || "",
      status: u.status || "Active",
      registrationDate: u.created_at,
    }));
    res.json({ customers: formatted });
  } catch (err) {
    next(err);
  }
}

async function updateCustomerStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!["Active", "Blocked"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'Active' or 'Blocked'." });
    }

    const customer = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!customer) return res.status(404).json({ error: "Customer not found." });

    await ActivityLog.create({
      admin_id: req.user.id,
      admin_email: req.user.email || req.user.name,
      action: `Updated Customer Status to ${status}`,
      details: `Customer: ${customer.email}`,
    });

    res.json({ success: true, customer: { id: customer._id, name: customer.name, status: customer.status } });
  } catch (err) {
    next(err);
  }
}

async function getDashboardStats(req, res, next) {
  try {
    const { filter, startDate, endDate } = req.query;

    let dateMatch = {};
    const now = new Date();

    if (filter === "Today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateMatch = { created_at: { $gte: startOfDay } };
    } else if (filter === "This Week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      dateMatch = { created_at: { $gte: startOfWeek } };
    } else if (filter === "This Month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateMatch = { created_at: { $gte: startOfMonth } };
    } else if (filter === "This Year") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateMatch = { created_at: { $gte: startOfYear } };
    } else if (filter === "Custom" && startDate && endDate) {
      dateMatch = { created_at: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    }

    // Revenue calculation
    const revenueRes = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" }, ...dateMatch } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const revenue = revenueRes[0] ? revenueRes[0].total : 0;

    const totalOrders = await Order.countDocuments(dateMatch);
    const pendingOrders = await Order.countDocuments({ status: { $in: ["Placed", "Processing"] }, ...dateMatch });
    const completedOrders = await Order.countDocuments({ status: "Delivered", ...dateMatch });
    const cancelledOrders = await Order.countDocuments({ status: "Cancelled", ...dateMatch });
    const returnedOrders = await ReturnRequest.countDocuments(dateMatch);

    const totalCustomers = await User.countDocuments({ is_admin: false });
    const newCustomers = await User.countDocuments({ is_admin: false, ...dateMatch });

    // Category distribution
    const byCategory = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" }, ...dateMatch } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.category",
          value: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $project: { name: "$_id", value: 1, _id: 0 } },
      { $sort: { value: -1 } },
    ]);

    // Order status breakdown
    const byStatus = await Order.aggregate([
      { $match: dateMatch },
      { $group: { _id: "$status", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
    ]);

    // Top selling products
    const topSellingProducts = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" }, ...dateMatch } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_name",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stock", "$low_stock_threshold"] },
    }).select("name category stock low_stock_threshold status price");

    // Monthly & daily sales charts
    const monthlySales = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ created_at: -1 })
      .limit(5)
      .populate("user_id", "name email");

    // Recent registrations
    const recentCustomers = await User.find({ is_admin: false })
      .sort({ created_at: -1 })
      .limit(5)
      .select("name email phone created_at status");

    res.json({
      filter: filter || "All Time",
      revenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      returnedOrders,
      totalCustomers,
      newCustomers,
      revenueByCategory: byCategory,
      ordersByStatus: byStatus,
      topSellingProducts,
      lowStockProducts,
      monthlySales,
      recentOrders,
      recentCustomers,
    });
  } catch (err) {
    next(err);
  }
}

/* -------- Admin: Customer Cart View -------- */
async function getCustomerCart(req, res, next) {
  try {
    const items = await CartItem.find({ user_id: req.params.id })
      .populate("product_id", "name category price image_url")
      .sort({ created_at: 1 });

    const cart = items
      .filter((item) => item.product_id)
      .map((item) => ({
        cartItemId: item._id,
        productName: item.product_id.name,
        category: item.product_id.category,
        price: Number(item.product_id.price),
        imageUrl: item.product_id.image_url,
        size: item.size,
        quantity: item.quantity,
        lineTotal: Number(item.product_id.price) * item.quantity,
      }));

    const cartTotal = cart.reduce((s, i) => s + i.lineTotal, 0);
    res.json({ cart, cartTotal });
  } catch (err) {
    next(err);
  }
}

/* -------- Admin: Customer Order History -------- */
async function getCustomerOrders(req, res, next) {
  try {
    const orders = await Order.find({ user_id: req.params.id })
      .sort({ created_at: -1 })
      .limit(20);

    const transactions = await Transaction.find({ user_id: req.params.id })
      .sort({ created_at: -1 })
      .limit(20);

    const formatted = orders.map((o) => ({
      id: o._id,
      orderNumber: o.order_number,
      status: o.status,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      total: Number(o.total),
      itemCount: (o.items || []).length,
      items: (o.items || []).map((i) => ({
        name: i.product_name,
        size: i.size,
        qty: i.quantity,
        price: Number(i.price),
      })),
      createdAt: o.created_at,
      invoiceUrl: o.invoice_url || null,
    }));

    res.json({ orders: formatted, transactions });
  } catch (err) {
    next(err);
  }
}

/* -------- Admin: Pending Payment Verification -------- */
async function getPendingPayments(req, res, next) {
  try {
    const { paymentMethod } = req.query;
    const orderFilter = {
      payment_status: { $in: ["verification_requested", "pending"] },
    };
    if (paymentMethod) {
      orderFilter.payment_method = paymentMethod;
    }

    const pendingOrders = await Order.find(orderFilter)
      .populate("user_id", "name email phone")
      .sort({ created_at: -1 });

    const formatted = pendingOrders.map((o) => ({
      id: o._id,
      orderNumber: o.order_number,
      status: o.status,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      paymentReference: o.payment_reference || null,
      paymentProofUrl: o.payment_proof_url || null,
      total: Number(o.total),
      items: (o.items || []).map((i) => ({
        name: i.product_name,
        size: i.size,
        qty: i.quantity,
        price: Number(i.price),
      })),
      customer: {
        name: o.user_id ? o.user_id.name : "Unknown",
        email: o.user_id ? o.user_id.email : "",
        phone: o.user_id ? o.user_id.phone : "",
      },
      shipping: {
        name: o.ship_name,
        phone: o.ship_phone,
        address: o.ship_address,
        city: o.ship_city,
        pincode: o.ship_pincode,
      },
      createdAt: o.created_at,
    }));

    res.json({ pendingPayments: formatted });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllCustomers, updateCustomerStatus, getDashboardStats, getCustomerCart, getCustomerOrders, getPendingPayments };
