const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pharmacy-secret-key-change-in-production';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح به' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'انتهت الجلسة، سجل دخول مرة أخرى' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'هذه الميزة للمدير فقط' });
  }
  next();
}

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }
  const user = db.getUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }
  const token = generateToken(user);
  res.json({
    token,
    user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role }
  });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
  res.json({ id: user.id, username: user.username, fullName: user.fullName, role: user.role });
});

router.post('/register', authMiddleware, adminMiddleware, (req, res) => {
  const { username, password, fullName, role } = req.body;
  if (!username || !password || !fullName) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور والاسم الكامل' });
  }
  if (db.getUserByUsername(username)) {
    return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const user = db.createUser(username, hash, fullName, role || 'doctor');
  res.json({ id: user.id, username: user.username, fullName: user.fullName, role: user.role });
});

router.post('/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = db.getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  db.updateUserPassword(user.id, hash);
  res.json({ success: true });
});

router.get('/users', authMiddleware, adminMiddleware, (req, res) => {
  const users = db.getUsers().map(u => ({
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    role: u.role,
    createdAt: u.createdAt
  }));
  res.json(users);
});

module.exports = { router, authMiddleware, adminMiddleware };
