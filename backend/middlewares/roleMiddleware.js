// backend/middleware/roleMiddleware.js
const Role = require('../models/Role');

// Middleware kiểm tra quyền admin
const checkAdminRole = async (req, res, next) => {
  try {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    // Tìm role của người dùng
    const userRole = await Role.findById(req.user.role);

    // Kiểm tra xem có phải admin không
    if (!userRole || userRole.name !== 'ADMIN') {
      return res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền admin' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi kiểm tra quyền', error: error.message });
  }
};

module.exports = {
  checkAdminRole
};