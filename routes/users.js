var express = require('express');
var router = express.Router();
var User = require('../models/User');

// POST /users/register
router.post('/register', async function(req, res) {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ các trường thông tin" });
        }

        // Kiểm tra xem email hoặc số điện thoại đã tồn tại chưa
        const existingUser = await User.findOne({ $or: [{ email: email }, { phone: phone }] });
        if (existingUser) {
            return res.status(400).json({ error: "Email hoặc số điện thoại đã được đăng ký" });
        }

        // Tạo user mới
        const newUser = new User({
            id: "USR_" + Date.now(),
            name: name,
            email: email,
            phone: phone,
            password: password // Ở mức độ học tập/dev, lưu plaintext hoặc có thể băm (để đơn giản ta lưu thẳng)
        });

        await newUser.save();

        res.status(201).json({ message: "Đăng ký tài khoản thành công!", user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /users/login
router.post('/login', async function(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ tài khoản và mật khẩu" });
        }

        // Tìm user theo email hoặc phone
        const user = await User.findOne({ 
            $or: [{ email: email }, { phone: email }],
            password: password 
        });

        if (!user) {
            return res.status(401).json({ error: "Tài khoản hoặc mật khẩu không chính xác" });
        }

        res.json({
            message: "Đăng nhập thành công!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /users/profile/:email
router.get('/profile/:email', async function(req, res) {
    try {
        const email = req.params.email;
        
        const user = await User.findOne({ $or: [{ email: email }, { phone: email }] });
        if (!user) {
            return res.status(404).json({ error: "Không tìm thấy thông tin người dùng" });
        }

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /users/social-login
router.post('/social-login', async function(req, res) {
    try {
        const { name, email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Thiếu email từ Social Login" });
        }

        // Tìm user theo email
        let user = await User.findOne({ email: email });

        if (!user) {
            // Nếu chưa có, tạo user mới
            user = new User({
                id: "USR_" + Date.now(),
                name: name || "Người dùng ẩn danh",
                email: email,
                phone: "Social Login",
                password: "Social_Login_Token"
            });
            await user.save();
        }

        res.json({
            message: "Đăng nhập Social thành công!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
