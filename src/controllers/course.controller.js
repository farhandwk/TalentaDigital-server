// backend/src/controllers/course.controller.js

const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model'); // Kita akan butuh ini untuk cascade delete
const Certificate = require('../models/certificate.model'); // <-- Impor baru
const PDFDocument = require('pdfkit'); // <-- Impor baru

/**
 * @desc    Membuat kursus baru
 * @route   POST /api/courses
 * @access  Private (Trainer)
 */
const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail } = req.body;

    const course = new Course({
      title,
      description,
      thumbnail,
      createdBy: req.user._id,
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(400).json({ message: 'Gagal membuat kursus', error: error.message });
  }
};

/**
 * @desc    Mendapatkan semua kursus (katalog)
 * @route   GET /api/courses
 * @access  Private (Semua user login)
 */
const getAllCourses = async (req, res) => {
  try {
    // Implementasi pagination
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const total = await Course.countDocuments({});
    const courses = await Course.find({})
      .populate('createdBy', 'name') // Ambil nama trainer
      .select('title description thumbnail createdBy')
      .limit(limit)
      .skip(skip);
      
    res.json({
      data: courses,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data kursus', error: error.message });
  }
};

/**
 * @desc    Mendapatkan detail satu kursus
 * @route   GET /api/courses/:id
 * @access  Private (Semua user login)
 */
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name'); // Ambil nama trainer

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail kursus', error: error.message });
  }
};

/**
 * @desc    Memperbarui kursus
 * @route   PUT /api/courses/:id
 * @access  Private (Trainer)
 */
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      // Pastikan hanya trainer yang membuat yang bisa mengedit
      if (course.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Tidak diizinkan' });
      }

      course.title = req.body.title || course.title;
      course.description = req.body.description || course.description;
      course.thumbnail = req.body.thumbnail || course.thumbnail;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Gagal memperbarui kursus', error: error.message });
  }
};

/**
 * @desc    Menghapus kursus
 * @route   DELETE /api/courses/:id
 * @access  Private (Trainer)
 */
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      if (course.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Tidak diizinkan' });
      }
      
      // Hapus semua data pendaftaran (enrollment) yang terkait dengan kursus ini
      await Enrollment.deleteMany({ courseId: course._id });
      // Nanti kita juga akan hapus sertifikat terkait di sini

      await course.deleteOne();
      res.json({ message: 'Kursus dan semua data terkait berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus kursus', error: error.message });
  }
};

// --- FUNGSI BARU UNTUK MANAJEMEN MODUL ---

/**
 * @desc    Menambahkan modul baru ke kursus
 * @route   POST /api/courses/:id/modules
 * @access  Private (Trainer)
 */
const addModuleToCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      if (course.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Tidak diizinkan' });
      }

      const newModule = {
        title: req.body.title,
        youtubeUrl: req.body.youtubeUrl,
        description: req.body.description,
        duration: req.body.duration,
        resources: req.body.resources,
      };

      course.modules.push(newModule);
      await course.save();
      res.status(201).json(course);
    } else {
      res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Gagal menambahkan modul', error: error.message });
  }
};

/**
 * @desc    Memperbarui modul di dalam kursus
 * @route   PUT /api/courses/:id/modules/:moduleId
 * @access  Private (Trainer)
 */
const updateModuleInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      if (course.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Tidak diizinkan' });
      }

      const module = course.modules.id(req.params.moduleId);
      if (module) {
        module.set(req.body); // Perbarui semua field yang ada di body
        await course.save();
        res.json(course);
      } else {
        res.status(404).json({ message: 'Modul tidak ditemukan' });
      }
    } else {
      res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Gagal memperbarui modul', error: error.message });
  }
};

/**
 * @desc    Menghapus modul dari kursus
 * @route   DELETE /api/courses/:id/modules/:moduleId
 * @access  Private (Trainer)
 */
const deleteModuleFromCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      if (course.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Tidak diizinkan' });
      }
      
      const module = course.modules.id(req.params.moduleId);
      if (module) {
        await module.deleteOne(); // Hapus sub-dokumen modul
        await course.save();
        res.json({ message: 'Modul berhasil dihapus' });
      } else {
        res.status(404).json({ message: 'Modul tidak ditemukan' });
      }
    } else {
      res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus modul', error: error.message });
  }
};

// --- FUNGSI BARU UNTUK LEARNER ---

/**
 * @desc    Mendaftarkan learner ke sebuah kursus
 * @route   POST /api/courses/:id/enroll
 * @access  Private (Learner)
 */
const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    // Cek apakah kursus ada
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }

    // Cek apakah sudah terdaftar
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Anda sudah terdaftar di kursus ini' });
    }

    const enrollment = await Enrollment.create({ userId, courseId });
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mendaftar kursus', error: error.message });
  }
};

/**
 * @desc    Menandai modul sebagai selesai
 * @route   POST /api/courses/:courseId/modules/:moduleId/complete
 * @access  Private (Learner)
 */
const markModuleAsComplete = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Anda belum terdaftar di kursus ini' });
    }
    
    // Tambahkan modul ke daftar yang selesai (jika belum ada)
    if (!enrollment.completedModules.includes(moduleId)) {
      enrollment.completedModules.push(moduleId);
    }
    
    // Cek apakah semua modul sudah selesai
    const course = await Course.findById(courseId);
    if (enrollment.completedModules.length === course.modules.length) {
        enrollment.status = 'completed';
        enrollment.completedAt = Date.now();
    }

    await enrollment.save();
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui progres', error: error.message });
  }
};

/**
 * @desc    Mendapatkan status pendaftaran & progres untuk satu kursus
 * @route   GET /api/courses/:id/enrollment
 * @access  Private (Learner)
 */
const getMyEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId: req.params.id });
        if (!enrollment) {
            return res.status(404).json({ message: 'Anda belum terdaftar di kursus ini' });
        }
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pendaftaran', error: error.message });
    }
};

/**
 * @desc    Membuat dan mengunduh sertifikat PDF (VERSI FINAL & BERSIH)
 * @route   GET /api/courses/:id/certificate
 * @access  Private (Learner)
 */
const generateCertificate = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user._id;

        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment || enrollment.status !== 'completed') {
            return res.status(403).json({ message: 'Anda belum menyelesaikan kursus ini' });
        }

        let certificate = await Certificate.findOne({ userId, courseId });
        if (!certificate) {
            certificate = await Certificate.create({ userId, courseId });
        }

        const course = await Course.findById(courseId);
        const user = req.user;

        const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
        
        // Atur header agar browser mengunduh file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=sertifikat-${course.title.replace(/\s+/g, '-')}.pdf`);
        
        // Hubungkan output PDF langsung ke respons HTTP (streaming)
        doc.pipe(res);

        // --- Mulai menggambar PDF ---
        doc.fontSize(40).font('Helvetica-Bold').text('SERTIFIKAT KELULUSAN', { align: 'center', y: 150 });
        doc.moveDown(2);
        doc.fontSize(20).font('Helvetica').text('Diberikan kepada:', { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(32).font('Helvetica-BoldOblique').text(user.name, { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(20).font('Helvetica').text('Telah berhasil menyelesaikan kursus:', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(28).font('Helvetica-Bold').text(course.title, { align: 'center' });
        
        doc.fontSize(12).font('Helvetica').text(`Diterbitkan pada: ${new Date(certificate.issuedAt).toLocaleDateString('id-ID')}`, 50, 500, { align: 'left' });
        doc.fontSize(10).font('Helvetica').text(`ID Sertifikat: ${certificate.certificateId}`, 50, 500, { align: 'right' });
        // --------------------------

        // Finalisasi PDF dan tutup stream
        doc.end();

    } catch (error) {
        console.error("Error saat membuat sertifikat:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Gagal membuat sertifikat', error: error.message });
        }
    }
};

const getCoursesByTrainer = async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.user._id })
    res.json(courses)
  }
  catch (error) {
    res.status(500).json({ message: "Galgal mengambil kursus data anda", error: error.message })
  }
}

module.exports = {
  createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse,
  addModuleToCourse, updateModuleInCourse, deleteModuleFromCourse, 
  enrollInCourse, markModuleAsComplete, getMyEnrollment, generateCertificate,
  getCoursesByTrainer
};