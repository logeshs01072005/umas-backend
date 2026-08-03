const Banner = require("../models/Banner");

async function getActiveBanners(req, res, next) {
  try {
    const now = new Date();
    const banners = await Banner.find({
      is_active: true,
      $or: [
        { start_date: null, end_date: null },
        { start_date: { $lte: now }, end_date: { $gte: now } },
        { start_date: { $lte: now }, end_date: null },
        { start_date: null, end_date: { $gte: now } },
      ],
    }).sort({ created_at: -1 });

    res.json({ banners });
  } catch (err) {
    next(err);
  }
}

async function getAllBannersAdmin(req, res, next) {
  try {
    const banners = await Banner.find().sort({ created_at: -1 });
    res.json({ banners });
  } catch (err) {
    next(err);
  }
}

async function createBanner(req, res, next) {
  try {
    const { title, description, image_url, category, start_date, end_date, is_active } = req.body;
    if (!title) return res.status(400).json({ error: "Banner title is required." });

    const banner = await Banner.create({
      title,
      description: description || "",
      image_url: image_url || "",
      category: category || "Custom",
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    res.status(201).json({ banner });
  } catch (err) {
    next(err);
  }
}

async function updateBanner(req, res, next) {
  try {
    const { title, description, image_url, category, start_date, end_date, is_active } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (category !== undefined) updateData.category = category;
    if (start_date !== undefined) updateData.start_date = start_date ? new Date(start_date) : null;
    if (end_date !== undefined) updateData.end_date = end_date ? new Date(end_date) : null;
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!banner) return res.status(404).json({ error: "Banner not found." });

    res.json({ banner });
  } catch (err) {
    next(err);
  }
}

async function deleteBanner(req, res, next) {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found." });
    res.json({ success: true, message: "Banner deleted successfully." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getActiveBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
};
