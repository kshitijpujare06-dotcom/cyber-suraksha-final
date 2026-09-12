const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/attempt', requireAuth, async (req, res) => {
  const score = Number(req.body.score);
  if (!Number.isInteger(score) || score < 0 || score > 10) return res.status(400).json({ error: 'Invalid score.' });
  const [result] = await pool.execute('INSERT INTO quiz_attempts (user_id,score,total_questions) VALUES (?,?,10)', [req.user.id, score]);
  const [best] = await pool.execute('SELECT MAX(score) AS best FROM quiz_attempts WHERE user_id = ?', [req.user.id]);
  res.status(201).json({ id: result.insertId, score, best: best[0].best || 0 });
});

router.get('/best', requireAuth, async (req, res) => {
  const [rows] = await pool.execute('SELECT MAX(score) AS best FROM quiz_attempts WHERE user_id = ?', [req.user.id]);
  res.json({ best: rows[0].best || 0 });
});

module.exports = router;
