/* ================================================
   APP.JS — Main application controller
   ================================================ */

let currentPage = 'dashboard';
let currentCurrency = 'IDR';
let sidebarOpen = false;
let notifDropdownOpen = false;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  const session = AUTH.requireAuth();
  if (!session) return;

  // Show loader
  animateLoader(() => {
    document.getElementById('pageLoader').classList.add('hidden');
    initApp(session);
  });
});

function animateLoader(cb) {
  const fill = document.getElementById('loaderBarFill');
  const sub  = document.getElementById('loaderSub');
  const msgs = ['Memuat data keuangan...','Menyinkronkan Google Sheets...','Mempersiapkan dashboard...','Siap!'];
  let prog = 0;
  let msgIdx = 0;

  // Create loader particles
  const lp = document.getElementById('loaderParticles');
  if (lp) {
    const cols = ['rgba(79,142,247,.4)','rgba(6,200,232,.3)','rgba(155,114,248,.3)','rgba(18,216,138,.25)'];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      const s = Math.random() * 8 + 2;
      p.className = 'lp';
      p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;top:${Math.random()*100}%;background:${cols[Math.floor(Math.random()*cols.length)]};filter:blur(${Math.random()*3}px);animation-duration:${Math.random()*5+3}s;animation-delay:${Math.random()*3}s;`;
      lp.appendChild(p);
    }
  }

  const interval = setInterval(() => {
    prog += Math.random() * 18 + 5;
    if (prog > 95) prog = 95;
    if (fill) fill.style.width = prog + '%';
    if (sub && msgIdx < msgs.length - 1) {
      if (prog > (msgIdx + 1) * 25) { sub.textContent = msgs[++msgIdx]; }
    }
  }, 200);

  setTimeout(() => {
    clearInterval(interval);
    if (fill) fill.style.width = '100%';
    if (sub) sub.textContent = 'Siap!';
    setTimeout(cb, 400);
  }, 1600);
}

function initApp(session) {
  // Set user info
  const initial = (session.name || session.username).charAt(0).toUpperCase();
  document.getElementById('sidebarAvatar').textContent = initial;
  document.getElementById('topbarAvatar').textContent  = initial;
  document.getElementById('sidebarName').textContent   = session.name || session.username;
  document.getElementById('topbarName').textContent    = session.name || session.username;
  document.getElementById('sidebarRole').textContent   = (session.role || 'kasir').toUpperCase();

  // Hide admin menus for non-admin
  if (session.role !== 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  }

  // Sidebar toggle
  document.getElementById('menuToggle').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

  // Nav items
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pg = item.getAttribute('data-page');
      navigateTo(pg);
      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    showModal({
      title: 'Konfirmasi Logout',
      msg: 'Apakah Anda yakin ingin keluar?',
      icon: 'danger', okText: 'Ya, Logout', okClass: 'danger',
      onOk: () => AUTH.logout()
    });
  });

  // Currency switcher
  document.querySelectorAll('.cur-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cur-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCurrency = btn.getAttribute('data-cur');
      DB.saveSettings({ activeCurrency: currentCurrency });
      renderCurrentPage();
    });
  });

  // Notification button
  document.getElementById('topNotifBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNotifDropdown();
  });
  document.addEventListener('click', () => {
    if (notifDropdownOpen) closeNotifDropdown();
  });
  document.getElementById('notifDropdown').addEventListener('click', e => e.stopPropagation());

  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Load settings
  const settings = DB.getSettings();
  currentCurrency = settings.activeCurrency || 'IDR';
  document.querySelectorAll('.cur-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-cur') === currentCurrency);
  });

  // Sync Google Sheets on load
  syncSheet();

  // Navigate to saved page or dashboard
  const hash = location.hash.replace('#','') || 'dashboard';
  navigateTo(hash);
  updateNotifBadge();
}

// ===== NAVIGATION =====
const PAGE_RENDERERS = {
  dashboard: () => renderDashboardPage(),
  transaksi: () => renderTransaksiPage(),
  history:   () => renderHistoryPage(),
  rekening:  () => renderRekeningPage(),
  laporan:   () => renderLaporanPage(),
  notifikasi:() => renderNotifikasiPage(),
  users:     () => renderUsersPage(),
  settings:  () => renderSettingsPage(),
  'ganti-password': () => renderPasswordPage(),
};

const PAGE_TITLES = {
  dashboard: ['Dashboard', 'Home / Dashboard'],
  transaksi: ['Input Transaksi', 'Home / Transaksi'],
  history:   ['Riwayat Transaksi', 'Home / History'],
  rekening:  ['Rekening Bank', 'Home / Rekening'],
  laporan:   ['Generate Laporan', 'Home / Laporan'],
  notifikasi:['Notifikasi', 'Home / Notifikasi'],
  users:     ['Manajemen User', 'Home / Users'],
  settings:  ['Pengaturan & IP', 'Home / Settings'],
  'ganti-password': ['Ganti Password', 'Home / Password'],
};

function navigateTo(page) {
  if (!PAGE_RENDERERS[page]) page = 'dashboard';

  // Admin guard
  if (['users','settings'].includes(page) && !AUTH.isAdmin()) {
    showToast('Akses hanya untuk Admin.', 'error'); return;
  }

  currentPage = page;
  location.hash = page;

  // Update nav active state
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-page') === page);
  });

  // Update title
  const [title, bread] = PAGE_TITLES[page] || ['Dashboard', 'Home / Dashboard'];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageBreadcrumb').textContent = bread;

  // Render
  const content = document.getElementById('pageContent');
  content.style.opacity = '0';
  content.style.transform = 'translateY(10px)';
  setTimeout(() => {
    PAGE_RENDERERS[page]();
    content.style.transition = 'opacity .3s ease, transform .3s ease';
    content.style.opacity = '1';
    content.style.transform = 'translateY(0)';
  }, 100);
}

function renderCurrentPage() { if (PAGE_RENDERERS[currentPage]) PAGE_RENDERERS[currentPage](); }

// ===== SIDEBAR =====
function openSidebar()  { document.getElementById('sidebar').classList.add('open'); document.getElementById('sidebarOverlay').classList.add('active'); sidebarOpen = true; }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarOverlay').classList.remove('active'); sidebarOpen = false; }

// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const date = now.toLocaleDateString('id-ID', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
  const el = document.getElementById('sidebarClock');
  const de = document.getElementById('sidebarDate');
  if (el) el.textContent = time;
  if (de) de.textContent = date;
}

// ===== NOTIFICATIONS =====
function toggleNotifDropdown() {
  const dd = document.getElementById('notifDropdown');
  notifDropdownOpen = !notifDropdownOpen;
  dd.classList.toggle('visible', notifDropdownOpen);
  if (notifDropdownOpen) { renderNotifDropdown(); DB.markNotifRead(); updateNotifBadge(); }
}
function closeNotifDropdown() {
  document.getElementById('notifDropdown').classList.remove('visible');
  notifDropdownOpen = false;
}
function updateNotifBadge() {
  const notifs = DB.getNotif();
  const unread = notifs.filter(n => !n.read).length;
  const badge = document.getElementById('navNotifBadge');
  const dot   = document.getElementById('notifDot');
  if (badge) badge.textContent = notifs.length;
  if (dot)   dot.style.display = unread > 0 ? 'block' : 'none';
}
function renderNotifDropdown() {
  const list = document.getElementById('ndList');
  if (!list) return;
  const notifs = DB.getNotif();
  if (!notifs.length) {
    list.innerHTML = '<div class="empty-state" style="padding:2rem"><i class="fas fa-bell-slash"></i><h3>Tidak ada notifikasi</h3></div>';
    return;
  }
  list.innerHTML = notifs.slice(0,20).map(n => `
    <div class="nd-item">
      <div class="nd-item-icon ${n.type}">
        <i class="fas ${n.type==='income'?'fa-arrow-down':n.type==='expense'?'fa-arrow-up':'fa-coins'}"></i>
      </div>
      <div class="nd-item-body">
        <div class="nd-item-title">${n.title}</div>
        <div style="font-size:.8rem;color:var(--text2);margin:.1rem 0">${n.msg}</div>
        <div class="nd-item-time">${timeAgo(n.time)}</div>
      </div>
      <button class="nd-item-del" onclick="deleteNotifItem('${n.id}')"><i class="fas fa-times"></i></button>
    </div>`).join('');
}
function deleteNotifItem(id) {
  DB.deleteNotif(id);
  renderNotifDropdown();
  updateNotifBadge();
}
function clearAllNotif() {
  DB.clearNotif();
  renderNotifDropdown();
  updateNotifBadge();
  closeNotifDropdown();
  showToast('Semua notifikasi dihapus.', 'success');
}

// ===== GOOGLE SHEETS SYNC =====
async function syncSheet() {
  const result = await DB.importFromSheet();
  if (result.ok && result.added > 0) {
    showToast(`${result.added} data baru dari Google Sheets!`, 'success');
    updateNotifBadge();
    if (currentPage === 'dashboard') renderDashboardPage();
  }
}
