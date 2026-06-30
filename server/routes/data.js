const express = require('express');
const db = require('../database');
const { authMiddleware, adminMiddleware } = require('./auth');

const router = express.Router();

router.get('/settings', authMiddleware, (req, res) => {
  res.json(db.getSettings());
});

router.put('/settings', authMiddleware, (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: 'Key is required' });
  db.setSetting(key, value);
  res.json({ success: true });
});

router.put('/settings/bulk', authMiddleware, (req, res) => {
  const settings = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Settings object required' });
  }
  Object.keys(settings).forEach(key => {
    db.setSetting(key, settings[key]);
  });
  res.json({ success: true });
});

router.get('/reports', authMiddleware, (req, res) => {
  const { type } = req.query;
  const userId = req.user.role === 'admin' ? null : req.user.userId;
  res.json(db.getReports(userId, type));
});

router.post('/reports', authMiddleware, (req, res) => {
  const { type, data } = req.body;
  if (!type || !data) return res.status(400).json({ error: 'Type and data required' });
  const report = db.createReport(req.user.userId, type, data);
  res.json(report);
});

router.delete('/reports/:id', authMiddleware, (req, res) => {
  db.deleteReport(parseInt(req.params.id));
  res.json({ success: true });
});

module.exports = router;
