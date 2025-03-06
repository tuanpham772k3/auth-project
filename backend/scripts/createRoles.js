// backend/scripts/createRoles.js
const mongoose = require('mongoose');
const Role = require('../models/Role');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createRolesIfNotExist() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Kiểm tra xem đã có role chưa
    const existingRoles = await Role.find();
    
    if (existingRoles.length === 0) {
      // Tạo role USER
      const userRole = new Role({
        name: 'USER',
        permissions: ['read:own', 'update:own']
      });
      await userRole.save();

      // Tạo role ADMIN
      const adminRole = new Role({
        name: 'ADMIN',
        permissions: ['read:all', 'create:all', 'update:all', 'delete:all']
      });
      await adminRole.save();

      console.log('Đã tạo các vai trò: USER và ADMIN');
    } else {
      console.log('Các vai trò đã tồn tại');
    }
  } catch (error) {
    console.error('Lỗi tạo vai trò:', error);
  } finally {
    mongoose.connection.close();
  }
}

createRolesIfNotExist();