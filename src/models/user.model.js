// backend/src/models/user.model.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Nama tidak boleh kosong'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email tidak boleh kosong'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // Dihapus: required: [true, 'Password tidak boleh kosong'],
      minlength: [6, 'Password minimal 6 karakter'],
    },
    role: {
      type: String,
      enum: ['learner', 'trainer'],
      default: 'learner',
    },
    googleId: {
      type: String,
    },
    profilePicture: {
      type: String,
      default: 'https://i.pravatar.cc/150',
    },
  }, {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  // Hanya hash password jika ada dan diubah
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  // Jika pengguna tidak punya password (misal dari Google), langsung return false
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;