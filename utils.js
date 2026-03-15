/* ================================================
   UTILS.JS — Helper functions
   ================================================ */

function showToast(msg, type = 'info', duration = 3500) {
  const icons = { success:'fa-check-circle', error:'fa-times-circle', info:'fa-info-circle', warning:'fa-exclamation-triangle' };
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type]} toast-icon ${type}"></i><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 350);
  }, duration);
}

function showModal({ title, msg, icon = 'question', okText = 'Ya', okClass = '', onOk }) {
  const overlay = document.getElementById('modalOverlay');
  const iconEl  = document.getElementById('modalIcon');
  const titleEl = document.getElementById('modalTitle');
  const msgEl   = document.getElementById('modalMsg');
  const okBtn   = document.getElementById('modalOk');
  const cancelBtn = document.getElementById('modalCancel');

  const iconMap = {
    question: 'fa-question-circle',
    danger:   'fa-exclamation-triangle',
    info:     'fa-info-circle',
    success:  'fa-check-circle'
  };
  iconEl.innerHTML = `<i class="fas ${iconMap[icon] || iconMap.question}"></i>`;
  titleEl.textContent = title;
  msgEl.textContent = msg;
  okBtn.textContent = okText;
  okBtn.className = 'btn-modal-ok ' + okClass;
  overlay.style.display = 'flex';

  const close = () => overlay.style.display = 'none';
  okBtn.onclick = () => { close(); if(onOk) onOk(); };
  cancelBtn.onclick = close;
  overlay.onclick = (e) => { if(e.target === overlay) close(); };
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
}

function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Baru saja';
  if (m < 60) return m + ' menit lalu';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' jam lalu';
  const days = Math.floor(h / 24);
  return days + ' hari lalu';
}

function togglePass() {
  const inp = document.getElementById('loginPass');
  const icon = document.getElementById('eyeIcon');
  if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fas fa-eye-slash'; }
  else { inp.type = 'password'; icon.className = 'fas fa-eye'; }
}

function paginate(arr, page, perPage = 15) {
  const start = (page - 1) * perPage;
  return {
    data: arr.slice(start, start + perPage),
    total: arr.length,
    pages: Math.ceil(arr.length / perPage),
    page
  };
}

function buildPagination(container, { pages, page, onPage }) {
  if (!container) return;
  container.innerHTML = '';
  if (pages <= 1) return;
  const prev = document.createElement('button');
  prev.className = 'page-btn'; prev.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prev.disabled = page <= 1;
  prev.onclick = () => onPage(page - 1);
  container.appendChild(prev);

  const range = Array.from({length: pages}, (_, i) => i + 1)
    .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 2);

  let last = 0;
  range.forEach(p => {
    if (last && p - last > 1) {
      const dots = document.createElement('span');
      dots.textContent = '...'; dots.className = 'text-muted'; dots.style.padding = '0 .3rem';
      container.appendChild(dots);
    }
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (p === page ? ' active' : '');
    btn.textContent = p;
    btn.onclick = () => onPage(p);
    container.appendChild(btn);
    last = p;
  });

  const next = document.createElement('button');
  next.className = 'page-btn'; next.innerHTML = '<i class="fas fa-chevron-right"></i>';
  next.disabled = page >= pages;
  next.onclick = () => onPage(page + 1);
  container.appendChild(next);
}

function createParticles(containerId, count = 30) {
  const c = document.getElementById(containerId);
  if (!c) return;
  const colors = ['rgba(79,142,247,.3)','rgba(6,200,232,.25)','rgba(155,114,248,.2)','rgba(18,216,138,.2)'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 6 + 2;
    p.className = 'particle';
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${Math.random()*15+8}s;
      animation-delay:${Math.random()*10}s;
    `;
    c.appendChild(p);
  }
}
