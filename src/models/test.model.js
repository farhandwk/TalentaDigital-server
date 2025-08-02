// backend/src/models/test.model.js

const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Judul tes tidak boleh kosong'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Deskripsi tes tidak boleh kosong'],
    },
    // Array yang berisi ID dari setiap pertanyaan yang termasuk dalam tes ini
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question', // Merujuk ke model 'Question'
      },
    ],
    // Link untuk video pembahasan di YouTube
    youtubeEmbedUrl: {
      type: String,
      trim: true,
    },
    // Menghubungkan tes ke trainer yang membuatnya
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Test = mongoose.model('Test', testSchema);

module.exports = Test;