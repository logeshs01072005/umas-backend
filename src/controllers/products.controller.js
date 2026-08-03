const Product = require("../models/Product");
const { notifySubscribersIfRestocked } = require("./notifications.controller");

function mapProduct(doc) {
  if (!doc) return null;
  const stockNum = Number(doc.stock ?? 0);
  let statusVal = doc.status || "Available";
  if (stockNum <= 0 && statusVal === "Available") {
    statusVal = "Out of Stock";
  }

  return {
    id: doc._id,
    name: doc.name,
    category: doc.category,
    description: doc.description,
    price: Number(doc.price),
    mrp: Number(doc.mrp),
    sizes: doc.sizes,
    tag: doc.tag,
    imageUrl: doc.image_url,
    stock: stockNum,
    status: statusVal,
    lowStockThreshold: Number(doc.low_stock_threshold || 5),
    avgRating: Number(doc.avg_rating || 0),
    numReviews: Number(doc.num_reviews || 0),
    isActive: doc.is_active,
  };
}

async function listProducts(req, res, next) {
  try {
    const { category, search, sort } = req.query;
    const filter = { is_active: true };

    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { created_at: -1 };
    if (sort === "low") sortOption = { price: 1 };
    if (sort === "high") sortOption = { price: -1 };
    if (sort === "bestseller") {
      sortOption = { tag: -1, created_at: -1 };
    }

    const docs = await Product.find(filter).sort(sortOption);
    res.json({ products: docs.map(mapProduct) });
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const doc = await Product.findOne({ _id: req.params.id, is_active: true });
    if (!doc) return res.status(404).json({ error: "Product not found." });
    res.json({ product: mapProduct(doc) });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, category, description, price, mrp, sizes, tag, imageUrl, stock, status, lowStockThreshold } = req.body;
    if (!name || !category || price == null || mrp == null) {
      return res.status(400).json({ error: "name, category, price and mrp are required." });
    }

    const stockVal = stock ?? 100;
    let initialStatus = status || "Available";
    if (stockVal <= 0) initialStatus = "Out of Stock";

    const doc = await Product.create({
      name,
      category,
      description: description || "",
      price,
      mrp,
      sizes: sizes || [],
      tag: tag || "",
      image_url: imageUrl || "",
      stock: stockVal,
      status: initialStatus,
      low_stock_threshold: lowStockThreshold ?? 5,
    });
    res.status(201).json({ product: mapProduct(doc) });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { name, category, description, price, mrp, sizes, tag, imageUrl, stock, status, lowStockThreshold, isActive } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (mrp !== undefined) updateData.mrp = mrp;
    if (sizes !== undefined) updateData.sizes = sizes;
    if (tag !== undefined) updateData.tag = tag;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (stock !== undefined) {
      updateData.stock = stock;
      if (Number(stock) <= 0) {
        updateData.status = "Out of Stock";
      } else if (status === undefined || status === "Out of Stock") {
        updateData.status = "Available";
      }
    }
    if (status !== undefined) updateData.status = status;
    if (lowStockThreshold !== undefined) updateData.low_stock_threshold = lowStockThreshold;
    if (isActive !== undefined) updateData.is_active = isActive;
    updateData.updated_at = Date.now();

    const doc = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    if (!doc) return res.status(404).json({ error: "Product not found." });

    if (doc.stock > 0 && doc.status === "Available") {
      notifySubscribersIfRestocked(doc._id);
    }

    res.json({ product: mapProduct(doc) });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const doc = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { is_active: false } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Product not found." });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
