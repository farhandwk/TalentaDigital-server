// backend/src/models/question.model.js

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Teks pertanyaan tidak boleh kosong'],
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [
        (val) => val.length > 1,
        'Harus ada setidaknya dua pilihan jawaban',
      ],
    },
    correctAnswerIndex: {
      type: Number,
      required: [true, 'Indeks jawaban yang benar harus ditentukan'],
    },
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

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;