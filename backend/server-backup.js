const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const quizRoutes = require('./routes/quiz');

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
const app = express();
const allowedOrigin = process.env.FRONTEND_URL || 'https://cybersurakshain.vercel.app';
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/quiz', quizRoutes);
app.get('/api/health', async (_, res) => { try { await pool.query('SELECT 1'); res.json({ ok: true, database: true }); } catch { res.status(500).json({ ok: false, database: false }); } });
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Cyber Suraksha running at http://localhost:${port}`));
