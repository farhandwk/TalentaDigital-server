// backend/src/routes/quiz.routes.js

const express = require('express');
const router = express.Router();
const {
  // Functions for Questions
  createQuestion,
  getAllQuestionsByTrainer,
  updateQuestion,
  deleteQuestion,
  // Functions for Tests
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  getAllTestsByTrainer,
  // Functions for Learners/Results
  submitTest,
  getMyResults,
  getResultById,
  getLeaderboard,
} = require('../controllers/quiz.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// --- RUTE UNTUK MANAJEMEN PERTANYAAN (HANYA TRAINER) ---
router.route('/questions')
  .post(protect, authorize('trainer'), createQuestion)
  .get(protect, authorize('trainer'), getAllQuestionsByTrainer);

router.route('/questions/:id')
  .put(protect, authorize('trainer'), updateQuestion)
  .delete(protect, authorize('trainer'), deleteQuestion);


// --- RUTE UNTUK MANAJEMEN PAKET TES ---
router.route('/tests')
  .post(protect, authorize('trainer'), createTest) // Trainer membuat tes
  .get(protect, getAllTests); // Semua user login bisa melihat daftar tes

// Rute khusus untuk trainer melihat tes miliknya
router.route('/tests/my-tests')
  .get(protect, authorize('trainer'), getAllTestsByTrainer);

router.route('/tests/:id')
  .get(protect, getTestById) // Semua user login bisa melihat detail
  .put(protect, authorize('trainer'), updateTest) // Trainer mengedit
  .delete(protect, authorize('trainer'), deleteTest); // Trainer menghapus


// --- RUTE UNTUK LEARNER & PUBLIK ---
router.route('/tests/:id/submit')
  .post(protect, authorize('learner'), submitTest);

router.route('/results/my-results')
  .get(protect, authorize('learner'), getMyResults);

router.route('/results/:id')
  .get(protect, getResultById);

router.route('/leaderboard')
  .get(getLeaderboard);


module.exports = router;