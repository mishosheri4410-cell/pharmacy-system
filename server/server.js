const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, {
  index: false,
  extensions: ['html']
}));

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

app.use('/api/auth', authRoutes.router);
app.use('/api/data', dataRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  const loginPath = path.join(publicPath, 'login.html');
  if (fs.existsSync(loginPath)) {
    res.sendFile(loginPath);
  } else {
    res.redirect('/login.html');
  }
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: 'خطأ في الخادم' });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  🏥 Pharmacy Management Server');
    console.log('  صيدليات د. شريف شعبان');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log(`  📍 Local:    http://localhost:${PORT}`);
    const network = getLocalIP();
    if (network) {
      console.log(`  📱 Network:  http://${network}:${PORT}`);
    }
    console.log('');
    console.log('  🔐 Default login:');
    console.log('     Username: admin');
    console.log('     Password: admin123');
    console.log('');
    console.log('═══════════════════════════════════════════');
  });
}

function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}
