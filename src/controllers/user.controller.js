// backend/src/controllers/user.controller.js

// @desc    Mendapatkan profil pengguna yang sedang login
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // Data pengguna sudah didapatkan oleh middleware 'protect' dan disimpan di req.user
  const user = req.user;

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.profilePicture,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'Pengguna tidak ditemukan' });
  }
};

module.exports = {
  getUserProfile,
};