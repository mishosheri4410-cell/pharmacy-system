const bcrypt = require('bcryptjs');

const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const adminHash = bcrypt.hashSync(adminPassword, 10);

const data = {
  users: [
    { id: 1, username: 'admin', password: adminHash, fullName: 'المدير', role: 'admin', createdAt: new Date().toISOString() }
  ],
  settings: {},
  reports: []
};

function getUserById(id) {
  return data.users.find(u => u.id === id);
}

function getUserByUsername(username) {
  return data.users.find(u => u.username === username);
}

function createUser(username, passwordHash, fullName, role) {
  const maxId = data.users.reduce((max, u) => Math.max(max, u.id), 0);
  const user = { id: maxId + 1, username, password: passwordHash, fullName, role: role || 'doctor', createdAt: new Date().toISOString() };
  data.users.push(user);
  return user;
}

function updateUserPassword(userId, passwordHash) {
  const user = data.users.find(u => u.id === userId);
  if (user) { user.password = passwordHash; return true; }
  return false;
}

function getSettings() { return data.settings; }
function getSetting(key) { return data.settings[key]; }

function setSetting(key, value) {
  data.settings[key] = value;
}

function getReports(userId, type) {
  let reports = data.reports;
  if (userId) reports = reports.filter(r => r.userId === userId);
  if (type) reports = reports.filter(r => r.type === type);
  return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function createReport(userId, type, reportData) {
  const maxId = data.reports.reduce((max, r) => Math.max(max, r.id), 0);
  const report = { id: maxId + 1, userId, type, data: reportData, createdAt: new Date().toISOString() };
  data.reports.push(report);
  return report;
}

function deleteReport(id) {
  data.reports = data.reports.filter(r => r.id !== id);
}

module.exports = { getUserById, getUserByUsername, createUser, updateUserPassword, getSettings, getSetting, setSetting, getReports, createReport, deleteReport };
