// backend/src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin } = require('../controllers/auth.controller');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Rute baru untuk Google
router.post('/google', googleLogin);

module.exports = router;