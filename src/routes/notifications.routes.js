const express = require("express");
const { subscribeStockNotification } = require("../controllers/notifications.controller");

const router = express.Router();

router.post("/subscribe", subscribeStockNotification);

module.exports = router;
