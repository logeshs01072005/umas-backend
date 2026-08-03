const Setting = require("../models/Setting");

const DEFAULT_PAYMENT_SETTINGS = {
  cod: { enabled: true, customMessage: "Cash on Delivery available" },
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

module.exports = {
  getPaymentSettings,
  updatePaymentSettings,
};
