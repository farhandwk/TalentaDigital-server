// backend/src/routes/user.routes.js

const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware'); // Impor middleware 'protect'

// Saat ada request GET ke /api/users/profile
// 1. Jalankan middleware 'protect' dulu
// 2. Jika lolos, baru jalankan 'getUserProfile'
router.get('/profile', protect, getUserProfile);

module.exports = router;