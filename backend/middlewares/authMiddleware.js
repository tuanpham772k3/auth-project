const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Lấy token từ header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Kiểm tra token
  if (!token) {
    return res.status(401).json({ message: 'Không có token, từ chối truy cập' });
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Gắn thông tin người dùng vào request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Middleware kiểm tra quyền admin
const adminMiddleware = (req, res, next) => {
  // Kiểm tra xem người dùng có phải admin không
  if (!req.user.role || req.user.role.name !== 'ADMIN') {
    return res.status(403).json({ message: 'Truy cập bị từ chối' });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware
};