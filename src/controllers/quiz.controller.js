// backend/src/controllers/quiz.controller.js

const Question = require('../models/question.model');
const Test = require('../models/test.model')
const QuizResult = require('../models/quizResult.model');

/**
 * @desc    Membuat pertanyaan baru (dengan Validasi Mendalam)
 * @route   POST /api/quiz/questions
 * @access  Private (Trainer)
 */
const createQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswerIndex } = req.body;
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Pilihan jawaban (options) harus berupa array dengan minimal 2 item.' });
    }
    if (typeof correctAnswerIndex !== 'number') {
      return res.status(400).json({ message: 'Indeks jawaban yang benar (correctAnswerIndex) harus berupa angka.' });
    }
    if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      return res.status(400).json({ message: 'Indeks jawaban yang benar tidak valid untuk pilihan yang diberikan.' });
    }
    const question = new Question({
      questionText,
      options,
      correctAnswerIndex,
      createdBy: req.user._id,
    });
    const createdQuestion = await question.save();
    res.status(201).json(createdQuestion);
  } catch (error) {
    res.status(400).json({ message: 'Gagal membuat pertanyaan', error: error.message });
  }
};


/**
 * @desc    Mendapatkan semua pertanyaan yang dibuat oleh trainer (dengan Pagination)
 * @route   GET /api/quiz/questions
 * @access  Private (Trainer)
 */
const getAllQuestionsByTrainer = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const total = await Question.countDocuments({ createdBy: req.user._id });
    const questions = await Question.find({ createdBy: req.user._id }).limit(limit).skip(skip);
    res.json({ data: questions, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pertanyaan', error: error.message });
  }
};
/**
 * @desc    Memperbarui pertanyaan (dengan Validasi Mendalam)
 * @route   PUT /api/quiz/questions/:id
 * @access  Private (Trainer)
 */
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (question) {
      if (question.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Tidak diizinkan' });
      }
      const { questionText, options, correctAnswerIndex } = req.body;
      if (options) {
        if (!Array.isArray(options) || options.length < 2) {
          return res.status(400).json({ message: 'Pilihan jawaban (options) harus berupa array dengan minimal 2 item.' });
        }
        question.options = options;
      }
      if (typeof correctAnswerIndex === 'number') {
        const currentOptions = options || question.options;
        if (correctAnswerIndex < 0 || correctAnswerIndex >= currentOptions.length) {
          return res.status(400).json({ message: 'Indeks jawaban yang benar tidak valid untuk pilihan yang diberikan.' });
        }
        question.correctAnswerIndex = correctAnswerIndex;
      }
      question.questionText = questionText || question.questionText;
      const updatedQuestion = await question.save();
      res.json(updatedQuestion);
    } else {
      res.status(404).json({ message: 'Pertanyaan tidak ditemukan' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Gagal memperbarui pertanyaan', error: error.message });
  }
};

/**
 * @desc    Menghapus pertanyaan (VERSI AMAN)
 * @route   DELETE /api/quiz/questions/:id
 * @access  Private (Trainer)
 */
const deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const testUsingQuestion = await Test.findOne({ questions: questionId });
    if (testUsingQuestion) {
      return res.status(400).json({ message: `Pertanyaan tidak bisa dihapus karena sedang digunakan dalam tes "${testUsingQuestion.title}".` });
    }
    const question = await Question.findById(questionId);
    if (question) {
      if (question.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Tidak diizinkan' });
      }
      await question.deleteOne();
      res.json({ message: 'Pertanyaan berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Pertanyaan tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus pertanyaan', error: error.message });
  }
};

/**
 * @desc    Membuat paket tes baru
 * @route   POST /api/quiz/tests
 * @access  Private (Trainer)
 */
const createTest = async (req, res) => {
  try {
    const { title, description, questions, youtubeEmbedUrl } = req.body;

    const test = new Test({
      title,
      description,
      questions, // Ini adalah array berisi ID pertanyaan
      youtubeEmbedUrl,
      createdBy: req.user._id,
    });

    const createdTest = await test.save();
    res.status(201).json(createdTest);
  } catch (error) {
    res.status(400).json({ message: 'Gagal membuat tes', error: error.message });
  }
};

/**
 * @desc    Mendapatkan semua paket tes yang tersedia (dengan Pagination)
 * @route   GET /api/quiz/tests
 * @access  Private (Learner & Trainer)
 */
const getAllTests = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const total = await Test.countDocuments({});
    const tests = await Test.find({})
      .select('title description createdBy')
      .limit(limit)
      .skip(skip);
      
    res.json({
      data: tests,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data tes', error: error.message });
  }
};

/**
 * @desc    Mendapatkan detail satu tes beserta pertanyaannya (VERSI AMAN)
 * @route   GET /api/quiz/tests/:id
 * @access  Private (Learner & Trainer)
 */
const getTestById = async (req, res) => {
  try {
    // Tentukan field mana yang akan diambil berdasarkan peran pengguna
    const fieldsToSelect = req.user.role === 'trainer' 
      ? 'questionText options correctAnswerIndex' // Trainer melihat semuanya
      : 'questionText options'; // Learner hanya melihat soal & pilihan

    const test = await Test.findById(req.params.id).populate({
      path: 'questions',
      select: fieldsToSelect, // Gunakan pilihan field yang dinamis
    });

    if (test) {
      res.json(test);
    } else {
      res.status(404).json({ message: 'Tes tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail tes', error: error.message });
  }
};

/**
 * @desc    Memperbarui paket tes
 * @route   PUT /api/quiz/tests/:id
 * @access  Private (Trainer)
 */
const updateTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (test) {
      if (test.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Tidak diizinkan' });
      }

      test.title = req.body.title || test.title;
      test.description = req.body.description || test.description;
      test.questions = req.body.questions || test.questions;
      test.youtubeEmbedUrl = req.body.youtubeEmbedUrl || test.youtubeEmbedUrl;

      const updatedTest = await test.save();
      res.json(updatedTest);
    } else {
      res.status(404).json({ message: 'Tes tidak ditemukan' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Gagal memperbarui tes', error: error.message });
  }
};

/**
 * @desc    Menghapus paket tes (VERSI AMAN dengan Cascade Delete)
 * @route   DELETE /api/quiz/tests/:id
 * @access  Private (Trainer)
 */
const deleteTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const test = await Test.findById(testId);

    if (test) {
      if (test.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Tidak diizinkan' });
      }

      // 1. Hapus semua hasil kuis (QuizResult) yang terkait dengan tes ini
      await QuizResult.deleteMany({ testId: testId });

      // 2. Setelah itu, baru hapus tes itu sendiri
      await test.deleteOne();
      
      res.json({ message: 'Tes dan semua hasil terkait berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Tes tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus tes', error: error.message });
  }
};

// --- FUNGSI BARU UNTUK LEARNER & HASIL KUIS ---

/**
 * @desc    Learner mengirimkan jawaban tes & mendapatkan skor
 * @route   POST /api/quiz/tests/:id/submit
 * @access  Private (Learner)
 */
const submitTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const { answers } = req.body;

    const test = await Test.findById(testId).populate('questions', 'correctAnswerIndex');
    if (!test) {
      return res.status(404).json({ message: 'Tes tidak ditemukan' });
    }

    let correctAnswersCount = 0;
    test.questions.forEach((correctQuestion) => {
      const userAnswer = answers.find(
        (ans) => ans.questionId === correctQuestion._id.toString()
      );
      if (userAnswer && userAnswer.selectedAnswerIndex === correctQuestion.correctAnswerIndex) {
        correctAnswersCount++;
      }
    });

    const totalQuestions = test.questions.length;
    const score = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

    const resultPayload = {
      userId: req.user._id,
      testId: testId,
      score: score.toFixed(2),
      totalQuestions: totalQuestions,
      answers: answers,
      completedAt: Date.now(),
    };

    const updatedResult = await QuizResult.findOneAndUpdate(
      { userId: req.user._id, testId: testId },
      { $set: resultPayload, $inc: { attempts: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // --- PERBAIKAN DI SINI ---
    // Ambil kembali hasilnya dan populate dengan detail tes sebelum mengirim
    const populatedResult = await QuizResult.findById(updatedResult._id)
      .populate('testId', 'title youtubeEmbedUrl');
    // -------------------------

    res.status(200).json(populatedResult); // Kirim hasil yang sudah lengkap
  } catch (error) {
    res.status(500).json({ message: 'Gagal memproses hasil tes', error: error.message });
  }
};

/**
 * @desc    Mendapatkan semua hasil tes dari seorang learner (dengan Pagination)
 * @route   GET /api/quiz/results/my-results
 * @access  Private (Learner)
 */
const getMyResults = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const total = await QuizResult.countDocuments({ userId: req.user._id });
        const results = await QuizResult.find({ userId: req.user._id })
            // --- PERUBAHAN DI SINI: Tambahkan youtubeEmbedUrl ---
            .populate('testId', 'title description youtubeEmbedUrl')
            .sort({ completedAt: -1 })
            .limit(limit)
            .skip(skip);

        res.json({
            data: results,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil riwayat hasil', error: error.message });
    }
};
/**
 * @desc    Mendapatkan leaderboard (skor tertinggi)
 * @route   GET /api/quiz/leaderboard
 * @access  Public
 */
const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await QuizResult.aggregate([
            // Kelompokkan berdasarkan pengguna, ambil skor tertinggi mereka
            { $group: { _id: "$userId", maxScore: { $max: "$score" } } },
            // Urutkan dari skor tertinggi
            { $sort: { maxScore: -1 } },
            // Batasi hanya 10 teratas
            { $limit: 10 },
            // Ambil detail nama pengguna
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            // Rapikan output
            { $project: { _id: 0, score: "$maxScore", name: { $arrayElemAt: ["$user.name", 0] } } }
        ]);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil leaderboard', error: error.message });
    }
};

/**
 * @desc    Mendapatkan satu hasil tes berdasarkan ID-nya
 * @route   GET /api/quiz/results/:id
 * @access  Private (Hanya pemilik hasil)
 */
const getResultById = async (req, res) => {
    try {
        const result = await QuizResult.findById(req.params.id)
            // --- PERUBAHAN DI SINI: Pastikan youtubeEmbedUrl ada ---
            .populate('testId', 'title youtubeEmbedUrl');

        if (!result) {
            return res.status(404).json({ message: 'Hasil tidak ditemukan' });
        }

        if (result.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Tidak diizinkan' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data hasil', error: error.message });
    }
};

// Mendapatkan semua tes yang dibuat oleh trainer yang login
const getAllTestsByTrainer = async (req, res) => {
  try {
    const tests = await Test.find({ createdBy: req.user._id });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data tes', error: error.message });
  }
};

module.exports = {
  createQuestion,
  getAllQuestionsByTrainer,
  updateQuestion,
  deleteQuestion,
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  submitTest,
  getMyResults,
  getLeaderboard,
  getResultById,
  getAllTestsByTrainer
};