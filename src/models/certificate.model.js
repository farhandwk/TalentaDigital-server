// backend/src/models/certificate.model.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Library untuk generate ID unik

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    default: uuidv4, // ID unik untuk setiap sertifikat
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Course',
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
});

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;