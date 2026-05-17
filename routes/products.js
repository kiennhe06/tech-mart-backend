var express = require('express');
var router = express.Router();
var Product = require('../models/Product');
var Banner = require('../models/Banner');
var Category = require('../models/Category');

// GET home data
router.get('/home-data', async function(req, res) {
    try {
        const banners = await Banner.find().lean();
        const categories = await Category.find().lean();
        const flashSale = await Product.find({ isFlashSale: true }).lean();
        const allProducts = await Product.find({ isFlashSale: false }).lean();
        
        res.json({
            banners: banners,
            categories: categories,
            flashSale: flashSale,
            allProducts: allProducts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET product detail by ID
router.get('/products/:id', async function(req, res) {
    try {
        const id = req.params.id;
        const product = await Product.findOne({ id: id }).lean();
        
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        // Trả về sản phẩm với mô tả và thông số thực tế từ DB
        const result = {
            ...product,
            description: product.description || "Chưa có mô tả cho sản phẩm này.",
            specifications: (product.specifications && product.specifications.length > 0) 
                ? product.specifications 
                : [
                    { key: "Thương hiệu", value: "TechMart Premium" },
                    { key: "Bảo hành", value: "12 tháng" },
                    { key: "Tình trạng", value: "Mới 100%" }
                ]
        };

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST to add a new product
router.post('/add-product', async function(req, res) {
    try {
        const { name, price, image, categoryId, stock } = req.body;
        
        if (!name || !price || !categoryId) {
            return res.status(400).json({ error: "Missing required fields: name, price, categoryId" });
        }

        const newId = "P_" + Date.now();
        
        const newProduct = new Product({
            id: newId,
            name: name,
            price: price,
            image: image || "http://10.0.2.2:3000/images/banner_laptop.png",
            categoryId: parseInt(categoryId),
            stock: parseInt(stock) || 0,
            isFlashSale: false
        });

        await newProduct.save();

        res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
