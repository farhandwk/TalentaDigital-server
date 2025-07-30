// backend/src/middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware untuk melindungi rute (memastikan pengguna sudah login)
const protect = async (req, res, next) => {
  let token;

  // Cek apakah header Authorization ada dan dimulai dengan 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Ambil token dari header (tanpa kata 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifikasi token menggunakan secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Ambil data pengguna dari database berdasarkan ID di token
      // Kita tidak mengambil passwordnya untuk keamanan
      req.user = await User.findById(decoded.id).select('-password');

      // Jika pengguna tidak ditemukan (misal: sudah dihapus)
      if (!req.user) {
        return res.status(401).json({ message: 'Tidak diizinkan, pengguna tidak ditemukan' });
      }

      // 4. Lanjutkan ke controller berikutnya
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Tidak diizinkan, token gagal' });
    }
  }

  // Jika tidak ada token sama sekali
  if (!token) {
    res.status(401).json({ message: 'Tidak diizinkan, tidak ada token' });
  }
};

// Middleware untuk otorisasi berdasarkan peran (role)
const authorize = (...roles) => {
  return (req, res, next) => {
    // Cek apakah peran pengguna (dari middleware 'protect') ada di dalam daftar peran yang diizinkan
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Peran pengguna (${req.user.role}) tidak diizinkan untuk mengakses sumber daya ini`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };