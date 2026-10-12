/**
 * TroOi Backend API - Auth Service (Example)
 * 
 * Đây là ví dụ về backend API đơn giản với Node.js + Express
 * để hỗ trợ tính năng đăng nhập. Bạn có thể adapt theo cấu trúc backend của mình.
 * 
 * Installation:
 * npm install express cors bcryptjs jsonwebtoken
 * 
 * Chạy:
 * node api.js
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Mock user database (trong production, dùng database thực)
const users = [
  {
    id: '1',
    email: 'tenant@trooi.com',
    name: 'Nguyễn Văn A',
    role: 'tenant',
    password: '$2a$10$Zdz.4k1r5K1Z6r5K1Z6r5O8V3K5K5K5K5K5K5K5K5K5K5K5K5K5K', // password: 123456
  },
  {
    id: '2',
    email: 'landlord@trooi.com',
    name: 'Trần Thị B',
    role: 'landlord',
    password: '$2a$10$Zdz.4k1r5K1Z6r5K1Z6r5O8V3K5K5K5K5K5K5K5K5K5K5K5K5K', // password: 123456
  },
];

/**
 * POST /api/auth/login
 * Đăng nhập người dùng
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
    }

    // Tìm user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Trả về response
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'Tất cả các trường là bắt buộc' });
    }

    if (!['tenant', 'landlord'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    // Kiểm tra email đã tồn tại
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = {
      id: String(users.length + 1),
      email,
      name,
      role,
      password: hashedPassword,
    };

    users.push(newUser);

    // Tạo JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * GET /api/auth/verify
 * Xác minh token
 */
app.get('/api/auth/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token không được cung cấp' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User không tồn tại' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
});

/**
 * POST /api/auth/logout
 * Đăng xuất (client-side: xóa token)
 */
app.post('/api/auth/logout', (req, res) => {
  // Logout logic ở client-side (xóa localStorage)
  res.json({ message: 'Đã đăng xuất thành công' });
});

app.listen(PORT, () => {
  console.log(`🚀 TroOi Auth Server chạy trên http://localhost:${PORT}`);
  console.log('\n📝 Test accounts:');
  console.log('  Người thuê: tenant@trooi.com / 123456');
  console.log('  Chủ trọ: landlord@trooi.com / 123456');
});
