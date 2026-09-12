const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({ destination: uploadDir, filename: (_, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname).toLowerCase()}`) });
const upload = multer({ storage, limits: { fileSize: 4 * 1024 * 1024 }, fileFilter: (_, file, cb) => cb(null, /^image\/(png|jpeg|webp|gif)$/.test(file.mimetype)) });

router.post('/', requireAuth, upload.single('screenshot'), async (req, res) => {
  try {
    const { name, type, contact, date, description } = req.body;
    if (!description?.trim()) return res.status(400).json({ error: 'Description is required.' });
    const screenshot = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await pool.execute(
      'INSERT INTO reports (user_id,display_name,scam_type,scam_contact,incident_date,description,screenshot) VALUES (?,?,?,?,?,?,?)',
      [req.user.id, name?.trim() || req.user.name, type || 'Other', contact?.trim() || null, date || null, description.trim(), screenshot]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Could not submit the report.' }); }
});

router.get('/', requireAuth, async (_, res) => {
  try {
    const [rows] = await pool.execute(`SELECT id, display_name AS name, scam_type AS type, scam_contact AS contact, incident_date AS date, description, screenshot, created_at AS submittedAt FROM reports ORDER BY created_at DESC LIMIT 100`);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Could not load reports.' }); }
});

router.get('/dashboard', requireAuth, async (_, res) => {
  try {
    const [total] = await pool.execute('SELECT COUNT(*) AS count FROM reports');
    const [byType] = await pool.execute('SELECT scam_type AS type, COUNT(*) AS count FROM reports GROUP BY scam_type ORDER BY count DESC');
    const [recent] = await pool.execute(`SELECT id, display_name AS name, scam_type AS type, incident_date AS date, description, created_at AS submittedAt FROM reports ORDER BY created_at DESC LIMIT 100`);
    res.json({ total: total[0].count, byType, reports: recent });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Could not load the dashboard.' }); }
});

module.exports = router;
