// backend/src/routes/project.routes.js

const express = require('express');
const router = express.Router();
const {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  requestMentorship,
  getMentorshipQueue,
  acceptMentorship,
  addFeedback,
  getMyMentoredProjects,
  completeProject,
  getPublicProjects,
} = require('../controllers/project.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// --- Middleware Logging Sederhana ---
const logRequest = (req, res, next) => {
  console.log(`[ROUTER LOG] Menerima permintaan: ${req.method} ${req.originalUrl}`);
  next(); // Lanjutkan ke middleware atau controller berikutnya
};

// Rute untuk membuat dan mendapatkan daftar proyek (learner)
router.route('/')
  .post(protect, authorize('learner'), createProject)
  .get(protect, authorize('learner'), getMyProjects);

// --- RUTE SPESIFIK UNTUK TRAINER ---
// Rute spesifik ini harus sebelum rute dinamis '/:id'
router.route('/gallery')
  .get(getPublicProjects); // <-- Rute publik baru, tanpa 'protect'
  
router.route('/mentorship-queue')
  .get(protect, authorize('trainer'), getMentorshipQueue);

router.route('/my-mentored')
  .get(protect, authorize('trainer'), getMyMentoredProjects);
// ------------------------------------

// Rute untuk satu proyek spesifik (sekarang berada setelah rute yang lebih spesifik)
router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('learner'), updateProject);

// Rute untuk interaksi mentorship
router.route('/:id/request-mentorship')
  .post(protect, authorize('learner'), requestMentorship);

router.route('/:id/accept-mentorship')
  .post(protect, authorize('trainer'), acceptMentorship);

router.route('/:id/feedback')
  .post(protect, addFeedback);

// Trainer menyelesaikan sebuah proyek
router.route('/:id/complete')
  .post(logRequest, protect, authorize('trainer'), completeProject);

module.exports = router;