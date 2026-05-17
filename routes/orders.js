var express = require('express');
var router = express.Router();
var Order = require('../models/Order');
var Product = require('../models/Product');

// GET all orders (for Admin)
router.get('/', async function(req, res) {
    try {
        const orders = await Order.find().lean().sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET orders by user email
router.get('/user/:email', async function(req, res) {
    try {
        const email = req.params.email;
        const orders = await Order.find({ customerEmail: email }).lean().sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new order (from Mobile App)
router.post('/create', async function(req, res) {
    try {
        const { items, total, address, paymentMethod, customerName, customerEmail, customerPhone } = req.body;
        
        if (!items || !total || !address) {
            return res.status(400).json({ error: "Missing required order information" });
        }

        // Create new order
        const newOrder = new Order({
            id: req.body.id || ("ORD_" + Date.now()),
            items: items, 
            total: total,
            address: address,
            customerName: customerName || "Khách vãng lai",
            customerEmail: customerEmail || "",
            customerPhone: customerPhone || "",
            paymentMethod: paymentMethod || "COD",
            orderDate: req.body.orderDate || Date.now(),
            status: 0 
        });

        // Update stock for each item
        for (const orderItem of items) {
            const product = await Product.findOne({ name: orderItem.name });
            if (product && product.stock !== undefined) {
                product.stock -= orderItem.quantity;
                if (product.stock < 0) product.stock = 0;
                await product.save();
            }
        }

        await newOrder.save();
        res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH to update order status (for Admin)
router.patch('/:id/status', async function(req, res) {
    try {
        const orderId = req.params.id;
        const { status } = req.body; // 0, 1, 2, 3

        if (status === undefined) {
            return res.status(400).json({ error: "Missing status field" });
        }

        const order = await Order.findOne({ id: orderId });
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        order.status = parseInt(status);
        await order.save();

        res.json({ message: "Order status updated", order: order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH to cancel order (Mobile App)
router.patch('/:id/cancel', async function(req, res) {
    try {
        const orderId = req.params.id;
        const order = await Order.findOne({ id: orderId });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Only allow cancellation if order is in "Ordered" status (0)
        if (order.status !== 0) {
            return res.status(400).json({ error: "Cannot cancel order in current status" });
        }

        order.status = -1; // Cancelled

        // Restore stock
        for (const orderItem of order.items) {
            const product = await Product.findOne({ name: orderItem.name });
            if (product && product.stock !== undefined) {
                product.stock += orderItem.quantity;
                await product.save();
            }
        }

        await order.save();
        res.json({ message: "Order cancelled and stock restored" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST to submit review (Mobile App)
router.post('/:id/review', async function(req, res) {
    try {
        const orderId = req.params.id;
        const { rating, comment } = req.body;
        
        const order = await Order.findOne({ id: orderId });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Only allow review if order is completed (3)
        if (order.status !== 3) {
            return res.status(400).json({ error: "Only completed orders can be reviewed" });
        }

        order.review = {
            rating: parseInt(rating),
            comment: comment,
            date: Date.now()
        };

        await order.save();
        res.json({ message: "Review submitted successfully", review: order.review });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH to reply to a review (Admin Web)
router.patch('/:id/review/reply', async function(req, res) {
    try {
        const orderId = req.params.id;
        const { adminReply } = req.body;
        
        const order = await Order.findOne({ id: orderId });

        if (!order || !order.review) {
            return res.status(404).json({ error: "Order or review not found" });
        }

        order.review.adminReply = adminReply;
        order.review.replyDate = Date.now();

        await order.save();
        res.json({ message: "Reply sent successfully", review: order.review });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
