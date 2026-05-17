const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    image: String,
    name: String,
    price: String,
    quantity: Number
});

const reviewSchema = new mongoose.Schema({
    rating: Number,
    comment: String,
    date: Number,
    adminReply: String,
    replyDate: Number
});

const orderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    total: String,
    address: String,
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    paymentMethod: String,
    orderDate: Number,
    status: { type: Number, default: 0 },
    review: reviewSchema
});

module.exports = mongoose.model('Order', orderSchema);
