const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  users: [
    {
      id: 1,
      username: 'admin',
      password: '$2a$10$default',
      fullName: 'المدير',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ],
  settings: {},
  reports: []
};

let data = null;

function load() {
  if (data) return data;
  try {
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } else {
      data = JSON.parse(JSON.stringify(defaultData));
      save();
    }
  } catch (e) {
    data = JSON.parse(JSON.stringify(defaultData));
    save();
  }
  return data;
}

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getUsers() {
  return load().users;
}

function getUserById(id) {
  return load().users.find(u => u.id === id);
}

function getUserByUsername(username) {
  return load().users.find(u => u.username === username);
}

function createUser(username, passwordHash, fullName, role) {
  const db = load();
  const maxId = db.users.reduce((max, u) => Math.max(max, u.id), 0);
  const user = {
    id: maxId + 1,
    username,
    password: passwordHash,
    fullName,
    role: role || 'doctor',
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  save();
  return user;
}

function getSettings() {
  return load().settings;
}

function getSetting(key) {
  return load().settings[key];
}

function setSetting(key, value) {
  const db = load();
  db.settings[key] = value;
  save();
}

function getReports(userId, type) {
  const db = load();
  let reports = db.reports;
  if (userId) reports = reports.filter(r => r.userId === userId);
  if (type) reports = reports.filter(r => r.type === type);
  return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function createReport(userId, type, data) {
  const db = load();
  const maxId = db.reports.reduce((max, r) => Math.max(max, r.id), 0);
  const report = {
    id: maxId + 1,
    userId,
    type,
    data,
    createdAt: new Date().toISOString()
  };
  db.reports.push(report);
  save();
  return report;
}

function deleteReport(id) {
  const db = load();
  db.reports = db.reports.filter(r => r.id !== id);
  save();
}

function updateUserPassword(userId, passwordHash) {
  const db = load();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.password = passwordHash;
    save();
    return true;
  }
  return false;
}

module.exports = {
  getUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUserPassword,
  getSettings,
  getSetting,
  setSetting,
  getReports,
  createReport,
  deleteReport
};
