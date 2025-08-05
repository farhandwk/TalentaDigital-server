// backend/src/models/project.model.js

const mongoose = require('mongoose');

// Skema untuk setiap komentar/feedback
const feedbackSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Bisa learner atau trainer
    },
  },
  {
    timestamps: true, // Setiap feedback akan punya stempel waktu
  }
);

// --- SKEMA BUSINESS MODEL CANVAS LENGKAP ---
const businessCanvasSchema = new mongoose.Schema({
  customerSegments: { type: String, default: '' },   // 1. Segmen Pelanggan
  valuePropositions: { type: String, default: '' },  // 2. Proposisi Nilai
  channels: { type: String, default: '' },           // 3. Saluran
  customerRelationships: { type: String, default: '' },// 4. Hubungan Pelanggan
  revenueStreams: { type: String, default: '' },     // 5. Arus Pendapatan
  keyActivities: { type: String, default: '' },      // 6. Aktivitas Kunci
  keyResources: { type: String, default: '' },       // 7. Sumber Daya Kunci
  keyPartnerships: { type: String, default: '' },    // 8. Kemitraan Kunci
  costStructure: { type: String, default: '' },      // 9. Struktur Biaya
});
// -----------------------------------------

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, 'Nama proyek tidak boleh kosong'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Deskripsi proyek tidak boleh kosong'],
    },
    category: {
      type: String,
      default: 'Umum',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Draft', 'Menunggu Mentor', 'Dalam Bimbingan', 'Selesai'],
      default: 'Draft',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    // Menggunakan skema BMC yang sudah lengkap
    canvas: {
      type: businessCanvasSchema,
      default: () => ({}),
    },
    feedback: [feedbackSchema],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;