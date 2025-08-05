// backend/src/routes/career.routes.js

const express = require('express');
const router = express.Router();
const {
  createConsultant,
  getAllConsultants,
  updateConsultant,
  deleteConsultant,
} = require('../controllers/career.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Rute untuk mendapatkan semua konsultan (bisa diakses semua user login)
// dan membuat konsultan baru (hanya trainer)
router.route('/consultants')
  .get(protect, getAllConsultants)
  .post(protect, authorize('trainer'), createConsultant);

// Rute untuk satu konsultan spesifik (hanya trainer)
router.route('/consultants/:id')
  .put(protect, authorize('trainer'), updateConsultant)
  .delete(protect, authorize('trainer'), deleteConsultant);

module.exports = router;