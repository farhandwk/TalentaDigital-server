// backend/src/routes/course.routes.js

const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addModuleToCourse,
  updateModuleInCourse,
  deleteModuleFromCourse,
  enrollInCourse,
  markModuleAsComplete,
  getMyEnrollment,
  generateCertificate,
  getCoursesByTrainer, // Pastikan nama fungsinya konsisten
} = require('../controllers/course.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Rute untuk katalog dan membuat kursus baru
router.route('/')
  .get(protect, getAllCourses)
  .post(protect, authorize('trainer'), createCourse);

// --- POSISI DIPINDAHKAN ---
// Rute spesifik ini harus sebelum rute dinamis '/:id'
router.route('/my-courses')
  .get(protect, authorize('trainer'), getCoursesByTrainer);

// Rute untuk satu kursus spesifik (sekarang berada setelah rute yang lebih spesifik)
router.route('/:id')
  .get(protect, getCourseById)
  .put(protect, authorize('trainer'), updateCourse)
  .delete(protect, authorize('trainer'), deleteCourse);

// Rute untuk manajemen modul
router.route('/:id/modules')
  .post(protect, authorize('trainer'), addModuleToCourse);

router.route('/:id/modules/:moduleId')
  .put(protect, authorize('trainer'), updateModuleInCourse)
  .delete(protect, authorize('trainer'), deleteModuleFromCourse);

// Rute untuk learner
router.route('/:id/enroll')
  .post(protect, authorize('learner'), enrollInCourse);

router.route('/:id/enrollment')
  .get(protect, authorize('learner'), getMyEnrollment);

router.route('/:id/certificate')
  .get(protect, authorize('learner'), generateCertificate);

router.route('/:courseId/modules/:moduleId/complete')
  .post(protect, authorize('learner'), markModuleAsComplete);

module.exports = router;