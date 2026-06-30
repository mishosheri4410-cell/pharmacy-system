const bcrypt = require('bcryptjs');
const db = require('./database');

const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const hash = bcrypt.hashSync(adminPassword, 10);

const existing = db.getUserByUsername('admin');
if (existing) {
  db.updateUserPassword(existing.id, hash);
  console.log('✅ Admin password updated');
} else {
  db.createUser('admin', hash, 'المدير', 'admin');
  console.log('✅ Admin user created');
}

console.log('   Username: admin');
console.log('   Password: ' + adminPassword);
console.log('   Role: admin');
console.log('');
console.log('To add more users, log in as admin and use the user management page.');
