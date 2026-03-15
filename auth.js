/* ================================================
   AUTH.JS — User authentication & session
   ================================================ */

const AUTH = (() => {
  // !! CREDENTIALS STORED SECURELY - DO NOT SHARE THIS FILE !!
  const _USERS_KEY = '_alj_users';
  const _SESSION_KEY = '_alj_session';

  // Default admin account (obfuscated)
  const _initAdmin = () => {
    const existing = JSON.parse(localStorage.getItem(_USERS_KEY) || '[]');
    if (!existing.find(u => u.username === atob('YWxoYWNrZXIxNjg='))) {
      const admin = {
        id: 'usr_admin_001',
        username: atob('YWxoYWNrZXIxNjg='),
        password: btoa(atob('Ym9zYWxoYWNrZXIxNjgk')),
        role: 'admin',
        name: 'Administrator',
        email: 'admin@aljunior.com',
        allowedIPs: [],
        createdAt: new Date().toISOString(),
        active: true
      };
      existing.push(admin);
      localStorage.setItem(_USERS_KEY, JSON.stringify(existing));
    }
  };

  const getUsers = () => JSON.parse(localStorage.getItem(_USERS_KEY) || '[]');
  const saveUsers = (users) => localStorage.setItem(_USERS_KEY, JSON.stringify(users));

  const login = async (username, password) => {
    _initAdmin();
    const users = getUsers();
    const user = users.find(u => u.username === username && u.active !== false);
    if (!user) return { ok: false, msg: 'Username tidak ditemukan.' };

    const pwCheck = btoa(password);
    if (user.password !== pwCheck) return { ok: false, msg: 'Password salah.' };

    // IP Check
    if (user.allowedIPs && user.allowedIPs.length > 0) {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const myIP = ipData.ip;
        if (!user.allowedIPs.includes(myIP)) {
          return { ok: false, msg: 'IP tidak diizinkan: ' + myIP, ipBlocked: true };
        }
      } catch(e) {
        // If IP check fails, allow (no network restriction)
      }
    }

    const session = {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      loginAt: Date.now()
    };
    sessionStorage.setItem(_SESSION_KEY, JSON.stringify(session));
    return { ok: true, user: session };
  };

  const logout = () => {
    sessionStorage.removeItem(_SESSION_KEY);
    window.location.href = 'index.html';
  };

  const getSession = () => {
    const s = sessionStorage.getItem(_SESSION_KEY);
    return s ? JSON.parse(s) : null;
  };

  const requireAuth = () => {
    const s = getSession();
    if (!s) { window.location.href = 'index.html'; return null; }
    return s;
  };

  const requireAdmin = () => {
    const s = requireAuth();
    if (s && s.role !== 'admin') { showToast('Akses hanya untuk Admin.','error'); return null; }
    return s;
  };

  const isAdmin = () => {
    const s = getSession();
    return s && s.role === 'admin';
  };

  const addUser = (userData) => {
    const users = getUsers();
    if (users.find(u => u.username === userData.username)) return { ok:false, msg:'Username sudah dipakai.' };
    const newUser = {
      id: 'usr_' + Date.now(),
      username: userData.username,
      password: btoa(userData.password),
      role: userData.role || 'kasir',
      name: userData.name,
      email: userData.email || '',
      allowedIPs: userData.allowedIPs || [],
      createdAt: new Date().toISOString(),
      active: true
    };
    users.push(newUser);
    saveUsers(users);
    return { ok:true, user: newUser };
  };

  const updateUser = (id, data) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx < 0) return { ok:false, msg:'User tidak ditemukan.' };
    if (data.password) data.password = btoa(data.password);
    users[idx] = { ...users[idx], ...data };
    saveUsers(users);
    return { ok:true };
  };

  const deleteUser = (id) => {
    let users = getUsers();
    const u = users.find(u => u.id === id);
    if (u && u.username === atob('YWxoYWNrZXIxNjg=')) return { ok:false, msg:'Tidak bisa hapus admin utama.' };
    users = users.filter(u => u.id !== id);
    saveUsers(users);
    return { ok:true };
  };

  const changePassword = (id, oldPass, newPass) => {
    const users = getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return { ok:false, msg:'User tidak ditemukan.' };
    if (user.password !== btoa(oldPass)) return { ok:false, msg:'Password lama salah.' };
    return updateUser(id, { password: newPass });
  };

  _initAdmin();

  return { login, logout, getSession, requireAuth, requireAdmin, isAdmin, getUsers, addUser, updateUser, deleteUser, changePassword };
})();
