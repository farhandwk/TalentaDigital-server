// backend/src/controllers/career.controller.js

const Consultant = require('../models/consultant.model');

/**
 * @desc    Membuat data konsultan baru
 * @route   POST /api/career/consultants
 * @access  Private (Trainer)
 */
const createConsultant = async (req, res) => {
  try {
    const { name, photoUrl, specialization, contact, description } = req.body;

    const consultant = new Consultant({
      name,
      photoUrl,
      specialization,
      contact,
      description,
      managedBy: req.user._id,
    });

    const createdConsultant = await consultant.save();
    res.status(201).json(createdConsultant);
  } catch (error) {
    res.status(400).json({ message: 'Gagal membuat data konsultan', error: error.message });
  }
};

/**
 * @desc    Mendapatkan semua data konsultan
 * @route   GET /api/career/consultants
 * @access  Private (Semua user login)
 */
const getAllConsultants = async (req, res) => {
  try {
    // Untuk fitur ini, kita tidak perlu pagination karena jumlahnya tidak akan terlalu banyak
    const consultants = await Consultant.find({});
    res.json(consultants);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data konsultan', error: error.message });
  }
};

/**
 * @desc    Memperbarui data konsultan
 * @route   PUT /api/career/consultants/:id
 * @access  Private (Trainer)
 */
const updateConsultant = async (req, res) => {
  try {
    const consultant = await Consultant.findById(req.params.id);

    if (consultant) {
      // Di masa depan, kita bisa tambahkan validasi managedBy di sini jika perlu
      consultant.name = req.body.name || consultant.name;
      consultant.photoUrl = req.body.photoUrl || consultant.photoUrl;
      consultant.specialization = req.body.specialization || consultant.specialization;
      consultant.contact = req.body.contact || consultant.contact;
      consultant.description = req.body.description || consultant.description;

      const updatedConsultant = await consultant.save();
      res.json(updatedConsultant);
    } else {
      res.status(404).json({ message: 'Konsultan tidak ditemukan' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Gagal memperbarui data konsultan', error: error.message });
  }
};

/**
 * @desc    Menghapus data konsultan
 * @route   DELETE /api/career/consultants/:id
 * @access  Private (Trainer)
 */
const deleteConsultant = async (req, res) => {
  try {
    const consultant = await Consultant.findById(req.params.id);

    if (consultant) {
      await consultant.deleteOne();
      res.json({ message: 'Data konsultan berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Konsultan tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus data konsultan', error: error.message });
  }
};


module.exports = {
  createConsultant,
  getAllConsultants,
  updateConsultant,
  deleteConsultant,
};