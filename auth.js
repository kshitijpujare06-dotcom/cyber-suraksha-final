const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
const cookieOptions = { httpOnly: true, sameSite: 'none', secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 };

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 4) return res.status(400).json({ error: 'Name, email and a password of at least 4 characters are required.' });
    const normalized = email.trim().toLowerCase();
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [normalized]);
    if (existing.length) return res.status(409).json({ error: 'An account with this email already exists.' });
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)', [name.trim(), normalized, hash]);
    const user = { id: result.insertId, name: name.trim(), email: normalized };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, cookieOptions).json({ user });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Could not create the account.' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute('SELECT id,name,email,password_hash FROM users WHERE email = ?', [(email || '').trim().toLowerCase()]);
    if (!rows.length || !(await bcrypt.compare(password || '', rows[0].password_hash))) return res.status(401).json({ error: 'Incorrect email or password.' });
    const user = { id: rows[0].id, name: rows[0].name, email: rows[0].email };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, cookieOptions).json({ user });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Login failed.' }); }
});

router.post('/logout', (req, res) => res.clearCookie('token', { httpOnly: true, sameSite: 'none', secure: true }).json({ ok: true }));
router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

module.exports = router;
