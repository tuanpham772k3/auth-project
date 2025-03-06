// backend/scripts/createInitialAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createInitialAdmin() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Tìm role admin
    const adminRole = await Role.findOne({ name: 'ADMIN' });
    if (!adminRole) {
      throw new Error('Chưa tạo role admin. Hãy chạy createRoles.js trước');
    }

    // Kiểm tra xem đã có admin chưa
    const existingAdmin = await User.findOne({ 'role': adminRole._id });
    if (existingAdmin) {
      console.log('Admin đã tồn tại');
      return;
    }

    // Tạo mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.INITIAL_ADMIN_PASSWORD || 'AdminPassword123!', salt);

    // Tạo user admin
    const adminUser = new User({
      username: process.env.INITIAL_ADMIN_USERNAME || 'admin',
      email: process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com',
      password: hashedPassword,
      role: adminRole._id
    });

    await adminUser.save();
    console.log('Tạo admin thành công');
  } catch (error) {
    console.error('Lỗi tạo admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

createInitialAdmin();