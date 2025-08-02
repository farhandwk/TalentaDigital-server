// backend/src/models/quizResult.model.js

const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Test',
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selectedAnswerIndex: Number,
      },
    ],
    // Field untuk melacak jumlah percobaan
    attempts: {
      type: Number,
      default: 1,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Membuat indeks unik untuk memastikan satu pengguna hanya punya satu hasil per tes
quizResultSchema.index({ userId: 1, testId: 1 }, { unique: true });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = QuizResult;