var express = require("express");
var router = express.Router();
var productSchema = require("../models/product.model");
var orderShchema = require("../models/orders.model");
var tokenMiddleware = require("../middleware/token.middleware");

router.get("/", tokenMiddleware, async function (req, res, next) {
    try {
        let products = await productSchema.find();
        res.status(200).json({ message: "success", data: products });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", tokenMiddleware, async function (req, res, next) {
    try {
        let { productName, stockLeft } = req.body;
        let { userId } = req.auth;
        let product = new productSchema({
            productName: productName,
            stockLeft: stockLeft,
            userId: userId
        });
        await product.save();
        res.status(201).json({ message: "success" });
    }catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/:id", tokenMiddleware, async function (req, res, next) {
    try {
        let { id } = req.params;
        let { productName, stockLeft } = req.body;
        console.log("stockLeft: ", stockLeft);
        let { userId } = req.auth;
        let product = await productSchema.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.userId.toString() !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (productName !== undefined) {
            product.productName = productName;
        }
        if (stockLeft !== undefined) {
            product.stockLeft = stockLeft;
        }

        await product.save();
        res.status(200).json({ message: "success" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/:id", tokenMiddleware, async function (req, res, next) {
    try{
        let { id } = req.params;
        let { userId } = req.auth;
        let product = await productSchema.findById(id);
        if(!product){
            return res.status(404).json({ message: "Product not found" });
        }
        if(product.userId.toString() !== userId){
            return res.status(403).json({ message: "Forbidden" });
        }
        await product.deleteOne();
        res.status(200).json({ message: "success" });
    }catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/:id", tokenMiddleware, async function (req, res, next) {
    try{
        let { id } = req.params;
        let product = await productSchema.findById(id);
        if(!product){
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "success", data: product });
    }catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/:id/orders", tokenMiddleware, async function (req, res, next) {
    try{
        let { id } = req.params;
        let product = await productSchema.findById(id);
        if(!product){
            return res.status(404).json({ message: "Product not found" });
        }
        let orders = await orderShchema.find({ productId: id });
        res.status(200).json({ message: "success", data: orders });
    }catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/:id/orders", tokenMiddleware, async function (req, res, next) {
    try{
        let { id } = req.params;
        let { quantity } = req.body;
        let product = await productSchema.findById(id);
        if(!product){
            return res.status(404).json({ message: "Product not found" });
        }
        let { userId } = req.auth;
        // console.log("userId: ", userId);
        // console.log("product: ", product);
        // console.log("quantity: ", quantity);
        if(product.stockLeft <= 0){
            return res.status(400).json({ message: "Product out of stock" });
        }
        if(quantity > product.stockLeft){
            return res.status(400).json({ message: "Not enough stock" });
        }
        let order = new orderShchema({
            productId: id,
            quantity: quantity,
            userId: userId
        });
        await order.save();
        product.stockLeft = product.stockLeft - quantity;
        await product.save();
        res.status(201).json({ message: "success" });

    }catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;