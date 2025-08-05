// backend/src/controllers/project.controller.js

const Project = require('../models/project.model');

// --- FUNGSI DASAR ---
const createProject = async (req, res) => {
  try {
    const { projectName, description, category } = req.body;
    const project = new Project({
      projectName,
      description,
      category,
      submittedBy: req.user._id,
    });
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(400).json({ message: 'Gagal membuat proyek', error: error.message });
  }
};

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data proyek', error: error.message });
  }
};

// --- FUNGSI DENGAN OTORISASI ---

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('mentor', 'name')
      .populate('submittedBy', 'name')
      .populate('feedback.author', 'name role');

    if (!project) {
      return res.status(404).json({ message: 'Proyek tidak ditemukan' });
    }

    const isOwner = project.submittedBy.equals(req.user._id);
    const isMentor = project.mentor && project.mentor.equals(req.user._id);
    const isTrainerViewingQueue = req.user.role === 'trainer' && project.status === 'Menunggu Mentor';

    if (isOwner || isMentor || isTrainerViewingQueue) {
      return res.json(project);
    }

    return res.status(403).json({ message: 'Anda tidak memiliki akses ke proyek ini' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail proyek', error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Proyek tidak ditemukan' });

    if (!project.submittedBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengedit proyek ini' });
    }

    project.projectName = req.body.projectName || project.projectName;
    project.description = req.body.description || project.description;
    project.category = req.body.category || project.category;
    if (req.body.canvas) {
      project.canvas = { ...project.canvas, ...req.body.canvas };
    }
    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: 'Gagal memperbarui proyek', error: error.message });
  }
};

const requestMentorship = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Proyek tidak ditemukan' });

    if (!project.submittedBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk proyek ini' });
    }

    project.status = 'Menunggu Mentor';
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Gagal meminta mentorship', error: error.message });
  }
};

const getMentorshipQueue = async (req, res) => {
  try {
    const projects = await Project.find({ status: 'Menunggu Mentor' })
      .populate('submittedBy', 'name')
      .sort({ createdAt: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil antrian mentorship', error: error.message });
  }
};

const acceptMentorship = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Proyek tidak ditemukan' });
    if (project.status !== 'Menunggu Mentor') {
      return res.status(400).json({ message: 'Proyek ini tidak sedang menunggu mentor' });
    }
    project.mentor = req.user._id;
    project.status = 'Dalam Bimbingan';
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menerima mentorship', error: error.message });
  }
};

const addFeedback = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Teks feedback tidak boleh kosong' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Proyek tidak ditemukan' });

    const isOwner = project.submittedBy.equals(req.user._id);
    const isMentor = project.mentor && project.mentor.equals(req.user._id);

    if (!isOwner && !isMentor) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses untuk memberi feedback' });
    }

    const newFeedback = { text, author: req.user._id };
    project.feedback.push(newFeedback);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('mentor', 'name')
      .populate('submittedBy', 'name')
      .populate('feedback.author', 'name role');
      
    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(400).json({ message: 'Gagal menambahkan feedback', error: error.message });
  }
};

/**
 * @desc    Trainer mendapatkan semua proyek yang sedang ia bimbing
 * @route   GET /api/projects/my-mentored
 * @access  Private (Trainer)
 */
const getMyMentoredProjects = async (req, res) => {
  try {
    const projects = await Project.find({ mentor: req.user._id })
      .populate('submittedBy', 'name')
      .sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil proyek bimbingan', error: error.message });
  }
};

/**
 * @desc    Mentor menyelesaikan sebuah proyek
 * @route   POST /api/projects/:id/complete
 * @access  Private (Hanya mentor proyek)
 */
const completeProject = async (req, res) => {
  // --- LOG PERTAMA DI CONTROLLER ---
  console.log(`[CONTROLLER LOG] Permintaan berhasil masuk ke fungsi completeProject.`);
  // ---------------------------------
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      console.log('[CONTROLLER LOG] Proyek tidak ditemukan.');
      return res.status(404).json({ message: 'Proyek tidak ditemukan' });
    }

    // Otorisasi: Pastikan pengguna adalah mentor dari proyek ini
    if (!project.mentor || !project.mentor.equals(req.user._id)) {
      console.log('[CONTROLLER LOG] Otorisasi GAGAL. Pengguna bukan mentor.');
      return res.status(403).json({ message: 'Anda bukan mentor dari proyek ini' });
    }

    console.log('[CONTROLLER LOG] Otorisasi BERHASIL. Menyelesaikan proyek...');
    project.status = 'Selesai';
    project.isPublic = req.body.isPublic || project.isPublic; 
    await project.save();
    res.json(project);
  } catch (error) {
    // --- LOG JIKA TERJADI CRASH ---
    console.error('[CONTROLLER ERROR] Terjadi crash di dalam completeProject:', error);
    // -----------------------------
    res.status(500).json({ message: 'Gagal menyelesaikan proyek', error: error.message });
  }
};

/**
 * @desc    Mendapatkan semua proyek yang publik untuk galeri
 * @route   GET /api/projects/gallery
 * @access  Public
 */
const getPublicProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: 'Selesai', isPublic: true })
      .populate('submittedBy', 'name') // Ambil nama pembuat proyek
      .sort({ updatedAt: -1 }); // Tampilkan yang terbaru
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data galeri proyek', error: error.message });
  }
};


module.exports = {
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
};
