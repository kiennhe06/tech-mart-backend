const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    discount: { type: Number }, // Only for Flash Sale
    soldProgress: { type: Number }, // Only for Flash Sale
    image: { type: String },
    stock: { type: Number, default: 0 },
    categoryId: { type: Number },
    description: { type: String },
    specifications: [{
        key: String,
        value: String
    }],
    isFlashSale: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', productSchema);
