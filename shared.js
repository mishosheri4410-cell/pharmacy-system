const PharmaAPI = {
  API: (function(){
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return '';
    return 'https://pharmacy-backend.onrender.com';
  })(),

  async request(method, path, body) {
    const token = localStorage.getItem('pharma_token');
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(this.API + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  get(path) { return this.request('GET', path); },
  post(path, body) { return this.request('POST', path, body); },
  put(path, body) { return this.request('PUT', path, body); },
  del(path) { return this.request('DELETE', path); },

  async checkAuth() {
    const token = localStorage.getItem('pharma_token');
    if (!token) {
      window.location.href = 'login.html';
      return null;
    }
    try {
      const user = await this.get('/api/auth/me');
      localStorage.setItem('pharma_user', JSON.stringify(user));
      return user;
    } catch (e) {
      localStorage.removeItem('pharma_token');
      localStorage.removeItem('pharma_user');
      window.location.href = 'login.html';
      return null;
    }
  },

  getUser() {
    try { return JSON.parse(localStorage.getItem('pharma_user')); }
    catch (e) { return null; }
  },

  async getSettings() {
    try { return await this.get('/api/data/settings'); }
    catch (e) { return {}; }
  },

  async getSetting(key) {
    const settings = await this.getSettings();
    return settings[key];
  },

  async setSetting(key, value) {
    return this.put('/api/data/settings', { key, value });
  },

  async setSettings(settingsObj) {
    return this.put('/api/data/settings/bulk', settingsObj);
  },

  async syncSettingsToLocal() {
    try {
      const settings = await this.getSettings();
      if (settings.pharma_pin) localStorage.setItem('pharma_pin', settings.pharma_pin);
      if (settings.pharma_wa) localStorage.setItem('pharma_wa', settings.pharma_wa);
    } catch (e) {}
  },

  logout() {
    localStorage.removeItem('pharma_token');
    localStorage.removeItem('pharma_user');
    window.location.href = 'login.html';
  },

  async saveReport(type, data) {
    return this.post('/api/data/reports', { type, data });
  },

  async getReports(type) {
    const params = type ? '?type=' + encodeURIComponent(type) : '';
    return this.get('/api/data/reports' + params);
  },

  async getUsers() {
    return this.get('/api/auth/users');
  },

  async registerUser(username, password, fullName, role) {
    return this.post('/api/auth/register', { username, password, fullName, role });
  },

  async changePassword(currentPassword, newPassword) {
    return this.post('/api/auth/change-password', { currentPassword, newPassword });
  }
};
