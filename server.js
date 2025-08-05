// backend/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db.config.js');

// Impor semua file rute
const authRoutes = require('./src/routes/auth.routes.js');
const userRoutes = require('./src/routes/user.routes.js');
const quizRoutes = require('./src/routes/quiz.routes.js');
const courseRoutes = require('./src/routes/course.routes.js');
const careerRoutes = require('./src/routes/career.routes.js')
const projectRoutes = require('./src/routes/project.routes.js');

dotenv.config();
connectDB();

const app = express();

// Middleware harus didefinisikan sebelum rute
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Daftarkan semua rute
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/career', careerRoutes)
app.use('/api/projects', projectRoutes);

// Rute health check untuk memastikan server hidup
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running and healthy!' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});