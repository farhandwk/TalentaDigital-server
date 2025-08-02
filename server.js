// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db.config.js');
const authRoutes = require('./src/routes/auth.routes.js');
const userRoutes = require('./src/routes/user.routes.js');
const quizRoutes = require('./src/routes/quiz.routes.js')

dotenv.config();
connectDB();

const app = express();

// Cukup gunakan cors() standar. Proxy Vite yang akan menangani sisanya.
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes)

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running and healthy!' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});