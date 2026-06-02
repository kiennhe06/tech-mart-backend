var express = require('express');
var router = express.Router();
var Product = require('../models/Product');
var Order = require('../models/Order');
var Category = require('../models/Category');
var User = require('../models/User');

/* GET admin dashboard. */
router.get('/', async function(req, res, next) {
    try {
        const products = await Product.find().lean();
        const categories = await Category.find().lean();
        const orders = await Order.find().lean().sort({ orderDate: -1 });
        const users = await User.find().lean();

        res.render('index', { 
            title: 'TechMart Admin',
            products: products,
            categories: categories,
            orders: orders,
            users: users
        });
    } catch (err) {
        next(err);
    }
});

// Helper to fix URLs for Android Emulator
function fixURL(url) {
    if (!url) return "";
    return url.replace(/localhost/g, "10.0.2.2");
}

// Helper to parse specifications from text
function parseSpecs(specsText) {
    if (!specsText) return [];
    return specsText.split(/\r?\n/).map(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;

        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex !== -1) {
            return {
                key: trimmedLine.substring(0, colonIndex).trim(),
                value: trimmedLine.substring(colonIndex + 1).trim()
            };
        } else {
            return {
                key: trimmedLine,
                value: ""
            };
        }
    }).filter(s => s !== null);
}

/* POST add product */
router.post('/add-product', async function(req, res) {
    try {
        const { name, price, categoryId, image, description, specifications, isFlashSale, discount, soldProgress } = req.body;
        const productCount = await Product.countDocuments();
        
        const newProduct = new Product({
            id: "P_" + Date.now(),
            name: name || "Sản phẩm mới",
            price: price || "0đ",
            image: fixURL(image) || "http://10.0.2.2:3000/images/laptop_neo.png",
            categoryId: parseInt(categoryId) || 1,
            stock: parseInt(req.body.stock) || 0,
            description: description || "Chưa có mô tả cho sản phẩm này.",
            specifications: parseSpecs(specifications),
            isFlashSale: isFlashSale === 'on',
            discount: parseInt(discount) || 0,
            soldProgress: parseInt(soldProgress) || 0
        });
        
        await newProduct.save();
        res.redirect('/?tab=products');
    } catch (err) {
        console.error(err);
        res.redirect('/?tab=products');
    }
});

/* POST edit product */
router.post('/edit-product/:id', async function(req, res) {
    try {
        const id = req.params.id;
        const { name, price, categoryId, image, description, specifications, isFlashSale, discount, soldProgress } = req.body;
        
        await Product.findOneAndUpdate({ id: id }, {
            name: name,
            price: price,
            categoryId: parseInt(categoryId),
            image: fixURL(image),
            description: description,
            stock: parseInt(req.body.stock) || 0,
            specifications: parseSpecs(specifications),
            isFlashSale: isFlashSale === 'on',
            discount: parseInt(discount) || 0,
            soldProgress: parseInt(soldProgress) || 0
        });

        res.redirect('/?tab=products');
    } catch (err) {
        console.error(err);
        res.redirect('/?tab=products');
    }
});

/* POST delete product */
router.post('/delete-product/:id', async function(req, res) {
    try {
        await Product.findOneAndDelete({ id: req.params.id });
        res.redirect('/?tab=products');
    } catch (err) {
        console.error(err);
        res.redirect('/?tab=products');
    }
});

/* POST update order status */
router.post('/update-order-status/:id', async function(req, res) {
    try {
        const id = req.params.id;
        const { status } = req.body;
        
        const order = await Order.findOne({ id: id });
        if (order) {
            if (order.status !== -1 && order.status !== 3) {
                order.status = parseInt(status);
                await order.save();
            }
        }
        res.redirect('/?tab=orders');
    } catch (err) {
        console.error(err);
        res.redirect('/?tab=orders');
    }
});

/* POST delete user */
router.post('/delete-user/:id', async function(req, res) {
    try {
        await User.findOneAndDelete({ id: req.params.id });
        res.redirect('/?tab=users');
    } catch (err) {
        console.error(err);
        res.redirect('/?tab=users');
    }
});

module.exports = router;
