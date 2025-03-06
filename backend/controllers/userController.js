const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Kiểm tra người dùng đã tồn tại
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'Người dùng đã tồn tại' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await user.save();
    res.status(201).json({ 
      message: 'Người dùng đã được tạo',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo người dùng', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    // Kiểm tra quyền cập nhật
    const isAdmin = req.user.role?.name === 'ADMIN';
    const isOwnProfile = req.user.userId === id;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ message: 'Không có quyền cập nhật' });
    }

    // Nếu không phải admin, không được thay đổi role
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    
    // Chỉ admin mới được thay đổi role
    if (isAdmin && role) updateData.role = role;

    // Xử lý mật khẩu
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Cập nhật người dùng
    const user = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, select: '-password' }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      message: 'Cập nhật thành công',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Chỉ admin mới được xóa
    const isAdmin = req.user.role?.name === 'ADMIN';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Không có quyền xóa người dùng' });
    }

    // Không được xóa chính mình
    if (id === req.user.userId) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({ 
      message: 'Xóa người dùng thành công',
      deletedUser: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa người dùng', error: error.message });
  }
};