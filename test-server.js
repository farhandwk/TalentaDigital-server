// backend/test-server.js
const express = require('express');
const cors = require('cors');
const app = express();

console.log('Memulai server tes minimalis...');

// Gunakan konfigurasi CORS yang sama persis
const corsOptions = {
  origin: 'null', // 'null' adalah origin untuk file lokal
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
};
app.use(cors(corsOptions));
app.use(express.json());

// Buat satu endpoint POST sederhana
app.post('/test', (req, res) => {
  console.log('Endpoint /test berhasil diakses!');
  console.log('Body yang diterima:', req.body);
  res.status(200).json({ message: 'Halo dari server tes! Permintaan Anda berhasil.' });
});

app.listen(8080, () => {
  console.log('Server tes berjalan di http://localhost:8080');
});