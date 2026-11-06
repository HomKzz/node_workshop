var express = require("express");
var router = express.Router();
var orderSchema = require("../models/orders.model");
var tokenMiddleware = require("../middleware/token.middleware");

router.get("/", tokenMiddleware, async function (req, res, next) {
  try {
    let userId = req.auth.userId;
    //console.log("userId: ", userId);
    let orders = await orderSchema.find({ userId }).populate("productId", "productName stockLeft");
    res.status(200).json({status: 200, message: "success", data: orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;