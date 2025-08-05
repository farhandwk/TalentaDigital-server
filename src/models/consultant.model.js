// backend/src/models/consultant.model.js

const mongoose = require('mongoose');

const consultantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama konsultan tidak boleh kosong'],
      trim: true,
    },
    photoUrl: {
      type: String,
      default: 'https://i.pravatar.cc/150', // Foto placeholder
    },
    // Spesialisasi bisa berisi tipe RIASEC atau bidang keahlian lain
    specialization: {
      type: [String],
      required: true,
    },
    contact: {
      type: String, // Bisa berupa email, link LinkedIn, dll.
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Deskripsi singkat tidak boleh kosong'],
    },
    // Menghubungkan data ini ke trainer yang membuatnya/mengelolanya
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Consultant = mongoose.model('Consultant', consultantSchema);

module.exports = Consultant;