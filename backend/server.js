 const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const quizRoutes = require('./routes/quiz');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing.');
}

const app = express();

const allowedOrigin =
  process.env.FRONTEND_URL || 'https://cybersurakshain.vercel.app';

// ---------- CORS ----------
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// ---------- Middleware ----------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------- Uploads ----------
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// ---------- API ----------
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/quiz', quizRoutes);

// ---------- Health ----------
app.get('/api/health', async (_, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      ok: true,
      database: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      database: false
    });
  }
});

// ---------- Frontend ----------
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (_, res) => {
  res.sendFile(
    path.join(__dirname, 'public', 'index.html')
  );
});

// ---------- Vercel ----------
module.exports = app;