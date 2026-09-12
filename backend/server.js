 const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const quizRoutes = require('./routes/quiz');

const app = express();

// Make sure JWT_SECRET exists
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing.');
}

// --------------------------------------------------
// CORS
// --------------------------------------------------

const allowedOrigin = process.env.FRONTEND_URL;

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigin && origin === allowedOrigin) {
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

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------------------------------------------
// Uploaded files
// --------------------------------------------------

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// --------------------------------------------------
// API Routes
// --------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/quiz', quizRoutes);

// --------------------------------------------------
// Database Health Check
// --------------------------------------------------

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      ok: true,
      database: true
    });
  } catch (error) {
    console.error('Database connection error:', error);

    res.status(500).json({
      ok: false,
      database: false
    });
  }
});

// --------------------------------------------------
// Frontend
// --------------------------------------------------

app.use(
  express.static(path.join(__dirname, 'public'))
);

app.get('*', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'public', 'index.html')
  );
});

// --------------------------------------------------
// Render Server
// --------------------------------------------------

const port = Number(process.env.PORT || 10000);

app.listen(port, '0.0.0.0', () => {
  console.log(`Cyber Suraksha running on port ${port}`);
});