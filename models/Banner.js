const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    imageUrl: { type: String, required: true }
});

module.exports = mongoose.model('Banner', bannerSchema);
