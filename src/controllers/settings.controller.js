const Setting = require("../models/Setting");

const DEFAULT_PAYMENT_SETTINGS = {
  cod: { enabled: true, customMessage: "Cash on Delivery available" },
  online: { enabled: true, customMessage: "Pay securely via Razorpay (UPI, Cards, Net Banking)" },
  upi: { enabled: true, customMessage: "Pay using Google Pay / PhonePe / Paytm" },
  net_banking: { enabled: true, customMessage: "Pay via Net Banking" },
  card: { enabled: true, customMessage: "Credit / Debit Cards accepted" },
};

async function getPaymentSettings(req, res, next) {
  try {
    let settingDoc = await Setting.findOne({ key: "payment_methods" });
    if (!settingDoc) {
      settingDoc = await Setting.create({ key: "payment_methods", value: DEFAULT_PAYMENT_SETTINGS });
    }
    res.json({ paymentMethods: settingDoc.value });
  } catch (err) {
    next(err);
  }
}

async function updatePaymentSettings(req, res, next) {
  try {
    const { paymentMethods } = req.body;
    if (!paymentMethods) {
      return res.status(400).json({ error: "paymentMethods object is required." });
    }

    const settingDoc = await Setting.findOneAndUpdate(
      { key: "payment_methods" },
      { value: paymentMethods, updated_at: Date.now() },
      { new: true, upsert: true }
    );

    res.json({ paymentMethods: settingDoc.value, message: "Payment settings updated successfully." });
  } catch (err) {
    next(err);
  }
}

const DEFAULT_PROMO_SETTINGS = {
  tickerText: "🔥 GRAND FESTIVE & SEASONAL LAUNCH | FLAT 20% OFF ON ALL SAREES & TOPS",
  couponCode: "UMA20",
  heroTag: "NEW SEASON LAUNCH 2026",
  heroTitle: "Elegance Woven in Every Thread",
  heroSubtitle: "Discover our latest Ajio-style curated collection of Kanjeevaram Silks, Organza Sarees, Designer Tops, and Royal Lehengas.",
  heroImageUrl: "",
  seasonName: "Festive Season",
};

async function getPromoSettings(req, res, next) {
  try {
    let settingDoc = await Setting.findOne({ key: "promo_settings" });
    if (!settingDoc) {
      settingDoc = await Setting.create({ key: "promo_settings", value: DEFAULT_PROMO_SETTINGS });
    }
    res.json({ promoSettings: { ...DEFAULT_PROMO_SETTINGS, ...settingDoc.value } });
  } catch (err) {
    next(err);
  }
}

async function updatePromoSettings(req, res, next) {
  try {
    const { promoSettings } = req.body;
    if (!promoSettings) {
      return res.status(400).json({ error: "promoSettings object is required." });
    }

    const settingDoc = await Setting.findOneAndUpdate(
      { key: "promo_settings" },
      { value: promoSettings, updated_at: Date.now() },
      { new: true, upsert: true }
    );

    res.json({ promoSettings: settingDoc.value, message: "Promotional season settings updated successfully." });
  } catch (err) {
    next(err);
  }
}

async function getActiveTheme(req, res, next) {
  try {
    let settingDoc = await Setting.findOne({ key: "active_theme" });
    if (!settingDoc) {
      settingDoc = await Setting.create({ key: "active_theme", value: { theme: "summer" } });
    }
    res.json({ activeTheme: settingDoc.value?.theme || "summer" });
  } catch (err) {
    next(err);
  }
}

async function updateActiveTheme(req, res, next) {
  try {
    const { theme } = req.body;
    if (!theme) {
      return res.status(400).json({ error: "Theme string is required." });
    }

    const settingDoc = await Setting.findOneAndUpdate(
      { key: "active_theme" },
      { value: { theme }, updated_at: Date.now() },
      { new: true, upsert: true }
    );

    res.json({ activeTheme: settingDoc.value.theme, message: "Global seasonal theme updated successfully." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPaymentSettings,
  updatePaymentSettings,
  getPromoSettings,
  updatePromoSettings,
  getActiveTheme,
  updateActiveTheme,
};

