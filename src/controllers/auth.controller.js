// backend/src/controllers/auth.controller.js

const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Inisialisasi Google Auth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Fungsi helper untuk membuat token JWT kita sendiri
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Mendaftarkan pengguna baru dengan email/password
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  console.log('Request Body Diterima di Backend:', req.body);
  try {
    const { name, email, password, invitationCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Harap isi semua field yang wajib diisi' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Pengguna dengan email ini sudah terdaftar' });
    }

    let userRole = 'learner';
    if (invitationCode && invitationCode === process.env.TRAINER_INVITATION_CODE) {
      userRole = 'trainer';
    }

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Data pengguna tidak valid' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

/**
 * @desc    Autentikasi pengguna dengan email/password
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email atau password salah' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

/**
 * @desc    Autentikasi dengan Google
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { name, email, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        role: 'learner',
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: 'Login dengan Google gagal', error: error.message });
  }
};


module.exports = {
  registerUser,
  loginUser,
  googleLogin,
};
