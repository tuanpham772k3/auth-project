const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');

const { 
  authMiddleware, 
  adminMiddleware 
} = require('../middlewares/authMiddleware');

// Lấy danh sách người dùng (Chỉ admin)
router.get('/', [authMiddleware, adminMiddleware], getAllUsers);

// Tạo người dùng mới (Chỉ admin)
router.post('/', [authMiddleware, adminMiddleware], createUser);

// Cập nhật người dùng (Chỉ admin hoặc chính người dùng)
router.put('/:id', [authMiddleware], updateUser);

// Xóa người dùng (Chỉ admin)   
router.delete('/:id', [authMiddleware, adminMiddleware], deleteUser);

// Lấy thông tin cá nhân
router.get('/profile', [authMiddleware], async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;