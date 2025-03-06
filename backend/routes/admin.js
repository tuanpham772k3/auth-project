// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { checkAdminRole } = require('../middlewares/roleMiddleware');

// Route để nâng cấp người dùng thành admin
router.post('/promote-to-admin', [authMiddleware, checkAdminRole], async (req, res) => {
  try {
    const { userId } = req.body;

    // Tìm role admin
    const adminRole = await Role.findOne({ name: 'ADMIN' });
    if (!adminRole) {
      return res.status(500).json({ message: 'Không tìm thấy vai trò admin' });
    }

    // Cập nhật người dùng
    const user = await User.findByIdAndUpdate(
      userId, 
      { role: adminRole._id }, 
      { new: true }
    ).populate('role');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({ 
      message: 'Đã nâng cấp người dùng thành admin',
      user: {
        id: user._id,
        username: user.username,
        role: user.role.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi nâng cấp admin', error: error.message });
  }
});

// Route để hạ cấp admin
router.post('/demote-admin', [authMiddleware, checkAdminRole], async (req, res) => {
  try {
    const { userId } = req.body;

    // Tìm role user
    const userRole = await Role.findOne({ name: 'USER' });
    if (!userRole) {
      return res.status(500).json({ message: 'Không tìm thấy vai trò user' });
    }

    // Cập nhật người dùng
    const user = await User.findByIdAndUpdate(
      userId, 
      { role: userRole._id }, 
      { new: true }
    ).populate('role');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({ 
      message: 'Đã hạ cấp admin thành user',
      user: {
        id: user._id,
        username: user.username,
        role: user.role.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hạ cấp admin', error: error.message });
  }
});

module.exports = router;