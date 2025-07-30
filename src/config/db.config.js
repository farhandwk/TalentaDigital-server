// backend/src/config/db.config.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Pastikan dotenv.config() dipanggil di sini juga
dotenv.config();

const connectDB = async () => {
  try {
    // Pastikan MONGO_URI ada di file .env Anda
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI tidak ditemukan di file .env');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Berhasil terhubung ke MongoDB');
  } catch (error) {
    console.error('Koneksi ke MongoDB gagal:', error.message);
    process.exit(1);
  }
};

// Pastikan Anda mengekspor fungsinya seperti ini
module.exports = connectDB;