const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Banner = require('../models/Banner');
const Category = require('../models/Category');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/techmart', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        await seedDatabase();
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            console.log("Seeding database from db.json...");
            const dbPath = path.join(__dirname, '../../db.json'); // Because current is in config/
            let data = { allProducts: [], flashSaleProducts: [], orders: [], users: [], categories: [], banners: [] };
            
            if (fs.existsSync(dbPath)) {
                data = JSON.parse(fs.readFileSync(dbPath));
            } else {
                const altPath = path.join(__dirname, '../db.json');
                if (fs.existsSync(altPath)) {
                    data = JSON.parse(fs.readFileSync(altPath));
                }
            }

            // Seed Products
            const productsToInsert = [];
            // Normal products
            if (data.allProducts) {
                data.allProducts.forEach(p => {
                    productsToInsert.push({ ...p, isFlashSale: false });
                });
            }
            // Flash sale products
            if (data.flashSaleProducts) {
                data.flashSaleProducts.forEach(p => {
                    productsToInsert.push({ ...p, isFlashSale: true });
                });
            }
            if (productsToInsert.length > 0) {
                await Product.insertMany(productsToInsert);
                console.log('Products seeded');
            }

            // Seed Orders
            if (data.orders && data.orders.length > 0) {
                await Order.insertMany(data.orders);
                console.log('Orders seeded');
            }

            // Seed Users
            if (data.users && data.users.length > 0) {
                await User.insertMany(data.users);
                console.log('Users seeded');
            }

            // Seed Categories
            if (data.categories && data.categories.length > 0) {
                await Category.insertMany(data.categories);
                console.log('Categories seeded');
            }

            // Seed Banners
            if (data.banners && data.banners.length > 0) {
                await Banner.insertMany(data.banners);
                console.log('Banners seeded');
            }

            console.log("Seeding completed successfully!");
        }
    } catch (err) {
        console.error("Error seeding data:", err);
    }
};

module.exports = connectDB;
