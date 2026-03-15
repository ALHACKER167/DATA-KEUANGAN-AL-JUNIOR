/* ================================================
   REKENING-PAGE.JS
   ================================================ */
function renderRekeningPage() {
  const reks = DB.getRekening();
  document.getElementById('pageContent').innerHTML = `
  <div class="section-header">
    <h2><i class="fas fa-university"></i> Rekening Bank</h2>
    <button class="btn btn-primary" onclick="showAddRekeningForm()"><i class="fas fa-plus"></i> Tambah Rekening</button>
  </div>

  <div id="addRekeningForm" class="card mb-2" style="display:none">
    <div class="card-title"><i class="fas fa-plus-circle"></i>Tambah Rekening Baru</div>
    <div class="form-row">
      <div class="form-group">
        <label>Nama Rekening / Bank</label>
        <input type="text" id="rekNama" class="form-control" placeholder="Contoh: BCA Utama">
      </div>
      <div class="form-group">
        <label>No. Rekening</label>
        <input type="text" id="rekNo" class="form-control" placeholder="0123456789">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Mata Uang</label>
        <select id="rekCurrency" class="form-control">
          <option value="IDR">🇮🇩 IDR - Rupiah</option>
          <option value="THB">🇹🇭 THB - Baht</option>
          <option value="KHR">🇰🇭 KHR - Riel</option>
        </select>
      </div>
      <div class="form-group">
        <label>Saldo Awal</label>
        <input type="number" id="rekSaldo" class="form-control" placeholder="0">
      </div>
    </div>
    <div class="form-group">
      <label>Nama Pemilik</label>
      <input type="text" id="rekOwner" class="form-control" placeholder="Nama pemilik rekening">
    </div>
    <div style="display:flex;gap:.8rem;justify-content:flex-end">
      <button class="btn btn-secondary" onclick="document.getElementById('addRekeningForm').style.display='none'">Batal</button>
      <button class="btn btn-primary" onclick="saveRekening()"><i class="fas fa-save"></i> Simpan</button>
    </div>
  </div>

  <div class="rekening-grid" id="rekeningGrid">
    ${reks.length ? reks.map(r => {
      const saldo = DB.getSaldo(r.id);
      return `
      <div class="rekening-card">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.8rem">
          <div>
            <div class="rekening-bank-name">${r.nama}</div>
            <div class="rekening-num">${r.noRek || '—'}</div>
            <div class="text-muted text-xs">${r.owner || ''}</div>
          </div>
          <span class="badge badge-blue">${r.currency}</span>
        </div>
        <div class="text-muted text-sm mb-1">Saldo Saat Ini</div>
        <div class="rekening-bal text-accent">${DB.formatCurrency(saldo, r.currency)}</div>
        <div class="text-muted text-xs mt-1">Saldo Awal: ${DB.formatCurrency(r.saldoAwal||0, r.currency)}</div>
        <div class="rekening-actions">
          <button class="btn btn-secondary btn-sm" onclick="editRekeningModal('${r.id}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteRekeningConfirm('${r.id}')"><i class="fas fa-trash"></i> Hapus</button>
        </div>
      </div>`;
    }).join('') : `<div class="card" style="grid-column:1/-1"><div class="empty-state"><i class="fas fa-university"></i><h3>Belum ada rekening</h3><p>Tambahkan rekening bank untuk mulai mencatat</p></div></div>`}
  </div>

  <!-- Edit Modal -->
  <div id="editRekModal" class="modal-overlay" style="display:none">
    <div class="modal-box" style="max-width:480px;width:100%;text-align:left">
      <h3 style="margin-bottom:1.2rem"><i class="fas fa-edit text-accent"></i> Edit Rekening</h3>
      <input type="hidden" id="editRekId">
      <div class="form-group"><label>Nama</label><input type="text" id="editRekNama" class="form-control"></div>
      <div class="form-group"><label>No. Rekening</label><input type="text" id="editRekNo" class="form-control"></div>
      <div class="form-row">
        <div class="form-group"><label>Saldo Awal</label><input type="number" id="editRekSaldo" class="form-control"></div>
        <div class="form-group"><label>Mata Uang</label>
          <select id="editRekCurrency" class="form-control"><option value="IDR">IDR</option><option value="THB">THB</option><option value="KHR">KHR</option></select>
        </div>
      </div>
      <div class="modal-actions" style="justify-content:flex-end">
        <button class="btn-modal-cancel" onclick="document.getElementById('editRekModal').style.display='none'">Batal</button>
        <button class="btn-modal-ok" onclick="saveEditRekening()">Simpan</button>
      </div>
    </div>
  </div>`;
}

function showAddRekeningForm() {
  const f = document.getElementById('addRekeningForm');
  f.style.display = f.style.display === 'none' ? 'block' : 'none';
}
function saveRekening() {
  const nama = document.getElementById('rekNama').value.trim();
  if (!nama) { showToast('Nama rekening wajib diisi.','error'); return; }
  DB.addRekening({ nama, noRek: document.getElementById('rekNo').value.trim(), currency: document.getElementById('rekCurrency').value, saldoAwal: parseFloat(document.getElementById('rekSaldo').value)||0, owner: document.getElementById('rekOwner').value.trim() });
  showToast('Rekening berhasil ditambahkan!','success');
  renderRekeningPage();
}
function editRekeningModal(id) {
  const r = DB.getRekening().find(r=>r.id===id);
  if (!r) return;
  document.getElementById('editRekId').value = id;
  document.getElementById('editRekNama').value = r.nama;
  document.getElementById('editRekNo').value = r.noRek||'';
  document.getElementById('editRekSaldo').value = r.saldoAwal||0;
  document.getElementById('editRekCurrency').value = r.currency;
  document.getElementById('editRekModal').style.display='flex';
}
function saveEditRekening() {
  const id = document.getElementById('editRekId').value;
  DB.updateRekening(id, { nama:document.getElementById('editRekNama').value, noRek:document.getElementById('editRekNo').value, saldoAwal:parseFloat(document.getElementById('editRekSaldo').value)||0, currency:document.getElementById('editRekCurrency').value });
  document.getElementById('editRekModal').style.display='none';
  showToast('Rekening diperbarui.','success');
  renderRekeningPage();
}
function deleteRekeningConfirm(id) {
  showModal({ title:'Hapus Rekening', msg:'Rekening ini akan dihapus. Transaksi terkait tidak ikut terhapus.', icon:'danger', okText:'Hapus', okClass:'danger', onOk:()=>{ DB.deleteRekening(id); showToast('Rekening dihapus.','success'); renderRekeningPage(); }});
}

/* ================================================
   LAPORAN-PAGE.JS
   ================================================ */
let _lapChart = null;
function renderLaporanPage() {
  const now = new Date();
  document.getElementById('pageContent').innerHTML = `
  <div class="section-header"><h2><i class="fas fa-file-chart-bar"></i> Generate Laporan</h2></div>

  <div class="card mb-2">
    <div class="card-title"><i class="fas fa-filter"></i>Filter Laporan</div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end">
      <div class="form-group mb-1" style="flex:1;min-width:130px">
        <label>Dari Tanggal</label>
        <input type="date" id="lapStart" class="form-control" value="${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01">
      </div>
      <div class="form-group mb-1" style="flex:1;min-width:130px">
        <label>Sampai Tanggal</label>
        <input type="date" id="lapEnd" class="form-control" value="${now.toISOString().split('T')[0]}">
      </div>
      <div class="form-group mb-1" style="flex:1;min-width:110px">
        <label>Mata Uang</label>
        <select id="lapCurrency" class="form-control">
          <option value="IDR" ${currentCurrency==='IDR'?'selected':''}>IDR</option>
          <option value="THB" ${currentCurrency==='THB'?'selected':''}>THB</option>
          <option value="KHR" ${currentCurrency==='KHR'?'selected':''}>KHR</option>
        </select>
      </div>
      <div class="form-group mb-1">
        <label>&nbsp;</label>
        <button class="btn btn-primary" onclick="generateLaporan()"><i class="fas fa-chart-bar"></i> Tampilkan</button>
      </div>
    </div>
  </div>

  <div id="lapResult" style="display:none">
    <div class="stat-grid mb-2" id="lapStats"></div>
    <div class="card mb-2">
      <div class="card-title"><i class="fas fa-chart-line"></i>Grafik Laporan</div>
      <div class="chart-container"><canvas id="lapChart"></canvas></div>
    </div>
    <div class="card">
      <div class="card-title" style="justify-content:space-between">
        <span><i class="fas fa-list"></i>Detail Transaksi</span>
        <div style="display:flex;gap:.5rem">
          <button class="btn btn-success btn-sm" onclick="exportLapExcel()"><i class="fas fa-file-excel"></i> Excel</button>
          <button class="btn btn-danger btn-sm" onclick="exportLapPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Tanggal</th><th>Tipe</th><th>Keterangan</th><th>Kategori</th><th>Jumlah</th></tr></thead>
        <tbody id="lapTbody"></tbody>
      </table></div>
    </div>
  </div>`;
}

let _lapData = [];
function generateLaporan() {
  const start = document.getElementById('lapStart').value;
  const end   = document.getElementById('lapEnd').value;
  const cur   = document.getElementById('lapCurrency').value;
  _lapData = DB.filterTx({ startDate:start, endDate:end, currency:cur });

  const income  = _lapData.filter(t=>t.type==='income').reduce((s,t)=>s+t.jumlah,0);
  const expense = _lapData.filter(t=>t.type==='expense').reduce((s,t)=>s+t.jumlah,0);
  const biaya   = _lapData.filter(t=>t.type==='biaya').reduce((s,t)=>s+t.jumlah,0);
  const fmt = v => DB.formatCurrency(v, cur);

  document.getElementById('lapStats').innerHTML = `
    <div class="stat-card income"><div class="stat-card-header"><div class="stat-icon income"><i class="fas fa-arrow-down"></i></div></div><div class="stat-amount text-green">${fmt(income)}</div><div class="stat-label">Total Pemasukan</div></div>
    <div class="stat-card expense"><div class="stat-card-header"><div class="stat-icon expense"><i class="fas fa-arrow-up"></i></div></div><div class="stat-amount text-red">${fmt(expense)}</div><div class="stat-label">Total Pengeluaran</div></div>
    <div class="stat-card biaya"><div class="stat-card-header"><div class="stat-icon biaya"><i class="fas fa-coins"></i></div></div><div class="stat-amount text-orange">${fmt(biaya)}</div><div class="stat-label">Total Biaya</div></div>
    <div class="stat-card balance"><div class="stat-card-header"><div class="stat-icon balance"><i class="fas fa-wallet"></i></div></div><div class="stat-amount ${income-expense-biaya>=0?'text-green':'text-red'}">${fmt(income-expense-biaya)}</div><div class="stat-label">Saldo Bersih</div></div>`;

  document.getElementById('lapTbody').innerHTML = _lapData.length ? _lapData.map(t=>`
    <tr><td>${formatDate(t.date)}</td>
    <td><span class="badge ${t.type==='income'?'badge-green':t.type==='expense'?'badge-red':'badge-orange'}">${t.type}</span></td>
    <td>${t.keterangan||'—'}</td><td>${t.kategori||'Umum'}</td>
    <td class="${t.type==='income'?'text-green':t.type==='expense'?'text-red':'text-orange'} fw-bold">${fmt(t.jumlah)}</td></tr>`).join('')
    : '<tr><td colspan="5"><div class="empty-state" style="padding:1.5rem"><i class="fas fa-inbox"></i><h3>Tidak ada data</h3></div></td></tr>';

  document.getElementById('lapResult').style.display = 'block';

  // Chart per kategori
  const byKat = {};
  _lapData.filter(t=>t.type!=='income').forEach(t=>{ byKat[t.kategori||'Umum'] = (byKat[t.kategori||'Umum']||0)+t.jumlah; });
  if (_lapChart) _lapChart.destroy();
  const ctx = document.getElementById('lapChart');
  if (ctx) {
    _lapChart = new Chart(ctx, {
      type:'doughnut',
      data:{ labels:Object.keys(byKat), datasets:[{ data:Object.values(byKat), backgroundColor:['#4f8ef7','#12d88a','#ef4444','#fbbf24','#9b72f8','#06c8e8','#f59e0b','#10b981'], borderColor:'transparent' }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{ color:'#8fa3c8', font:{size:11} } } } }
    });
  }
}
function exportLapExcel() { DB.exportToExcel(_lapData, 'laporan-aljunior'); showToast('Excel berhasil diunduh!','success'); }
function exportLapPDF()   { DB.exportToPDF(_lapData, 'laporan-aljunior'); }

/* ================================================
   NOTIFIKASI-PAGE.JS
   ================================================ */
function renderNotifikasiPage() {
  const notifs = DB.getNotif();
  document.getElementById('pageContent').innerHTML = `
  <div class="section-header">
    <h2><i class="fas fa-bell"></i> Notifikasi (${notifs.length})</h2>
    ${notifs.length?`<button class="btn btn-danger btn-sm" onclick="clearAllNotifPage()"><i class="fas fa-trash"></i> Hapus Semua</button>`:''}
  </div>
  <div class="card">
    ${notifs.length ? notifs.map(n=>`
    <div class="nd-item" style="padding:1rem 0;border-bottom:1px solid var(--border)">
      <div class="nd-item-icon ${n.type}">
        <i class="fas ${n.type==='income'?'fa-arrow-down':n.type==='expense'?'fa-arrow-up':'fa-coins'}"></i>
      </div>
      <div class="nd-item-body" style="flex:1">
        <div class="nd-item-title">${n.title}</div>
        <div style="font-size:.83rem;color:var(--text2);margin:.2rem 0">${n.msg}</div>
        <div class="nd-item-time">${formatDateTime(n.time)}</div>
      </div>
      <button class="btn btn-danger btn-sm btn-icon" onclick="deleteNotifPage('${n.id}')"><i class="fas fa-times"></i></button>
    </div>`).join('')
    : '<div class="empty-state" style="padding:3rem"><i class="fas fa-bell-slash"></i><h3>Tidak ada notifikasi</h3><p>Notifikasi akan muncul setiap ada transaksi baru</p></div>'}
  </div>`;
}
function deleteNotifPage(id) { DB.deleteNotif(id); updateNotifBadge(); renderNotifikasiPage(); showToast('Notifikasi dihapus.','info'); }
function clearAllNotifPage()  { DB.clearNotif(); updateNotifBadge(); renderNotifikasiPage(); showToast('Semua notifikasi dihapus.','success'); }

/* ================================================
   USERS-PAGE.JS
   ================================================ */
function renderUsersPage() {
  if (!AUTH.isAdmin()) { showToast('Akses hanya Admin.','error'); return; }
  const users = AUTH.getUsers();
  document.getElementById('pageContent').innerHTML = `
  <div class="section-header">
    <h2><i class="fas fa-users-cog"></i> Manajemen User</h2>
    <button class="btn btn-primary" onclick="showAddUserForm()"><i class="fas fa-user-plus"></i> Tambah User</button>
  </div>

  <div id="addUserForm" class="card mb-2" style="display:none">
    <div class="card-title"><i class="fas fa-user-plus"></i>Tambah User Baru</div>
    <div class="form-row">
      <div class="form-group"><label>Nama Lengkap</label><input type="text" id="uName" class="form-control" placeholder="Nama lengkap"></div>
      <div class="form-group"><label>Username</label><input type="text" id="uUsername" class="form-control" placeholder="username"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Password</label><input type="password" id="uPass" class="form-control" placeholder="Password"></div>
      <div class="form-group"><label>Role</label>
        <select id="uRole" class="form-control">
          <option value="kasir">Kasir</option><option value="admin">Admin</option><option value="viewer">Viewer</option><option value="manajer">Manajer</option>
        </select>
      </div>
    </div>
    <div class="form-group"><label>Email (opsional)</label><input type="email" id="uEmail" class="form-control" placeholder="email@contoh.com"></div>
    <div style="display:flex;gap:.8rem;justify-content:flex-end">
      <button class="btn btn-secondary" onclick="document.getElementById('addUserForm').style.display='none'">Batal</button>
      <button class="btn btn-primary" onclick="saveNewUser()"><i class="fas fa-save"></i> Simpan</button>
    </div>
  </div>

  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>Nama</th><th>Username</th><th>Role</th><th>Dibuat</th><th>Status</th><th>IP Diizinkan</th><th>Aksi</th></tr></thead>
      <tbody>${users.map(u=>`
        <tr>
          <td><div class="flex gap-1"><div class="user-avatar" style="width:30px;height:30px;font-size:.8rem">${(u.name||u.username).charAt(0).toUpperCase()}</div>${u.name||'—'}</div></td>
          <td><code style="background:var(--bg3);padding:.2rem .5rem;border-radius:6px;font-size:.82rem">${u.username}</code></td>
          <td><span class="badge ${u.role==='admin'?'badge-purple':u.role==='kasir'?'badge-blue':'badge-orange'}">${u.role}</span></td>
          <td class="text-muted text-sm">${formatDate(u.createdAt)}</td>
          <td><span class="badge ${u.active!==false?'badge-green':'badge-red'}">${u.active!==false?'Aktif':'Nonaktif'}</span></td>
          <td class="text-muted text-sm">${(u.allowedIPs||[]).join(', ')||'Semua IP'}</td>
          <td><div style="display:flex;gap:.4rem">
            <button class="btn btn-secondary btn-sm btn-icon" onclick="toggleUserActive('${u.id}',${u.active!==false})" title="Toggle Aktif"><i class="fas fa-power-off"></i></button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="deleteUserConfirm('${u.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
          </div></td>
        </tr>`).join('')}
      </tbody>
    </table></div>
  </div>`;
}
function showAddUserForm() { const f = document.getElementById('addUserForm'); f.style.display = f.style.display==='none'?'block':'none'; }
function saveNewUser() {
  const name = document.getElementById('uName').value.trim();
  const username = document.getElementById('uUsername').value.trim();
  const pass = document.getElementById('uPass').value;
  const role = document.getElementById('uRole').value;
  const email = document.getElementById('uEmail').value.trim();
  if (!name || !username || !pass) { showToast('Nama, username, dan password wajib diisi.','error'); return; }
  const res = AUTH.addUser({ name, username, password: pass, role, email });
  if (!res.ok) { showToast(res.msg,'error'); return; }
  showToast('User berhasil ditambahkan!','success');
  renderUsersPage();
}
function toggleUserActive(id, isActive) {
  AUTH.updateUser(id, { active: !isActive });
  showToast(`User ${!isActive?'diaktifkan':'dinonaktifkan'}.`,'info');
  renderUsersPage();
}
function deleteUserConfirm(id) {
  showModal({ title:'Hapus User', msg:'User ini akan dihapus permanen. Lanjutkan?', icon:'danger', okText:'Hapus', okClass:'danger', onOk:()=>{
    const res = AUTH.deleteUser(id);
    if (!res.ok) { showToast(res.msg,'error'); return; }
    showToast('User dihapus.','success'); renderUsersPage();
  }});
}

/* ================================================
   SETTINGS-PAGE.JS
   ================================================ */
function renderSettingsPage() {
  if (!AUTH.isAdmin()) { showToast('Akses hanya Admin.','error'); return; }
  const users = AUTH.getUsers();
  document.getElementById('pageContent').innerHTML = `
  <div class="section-header"><h2><i class="fas fa-cog"></i> Pengaturan & Pembatasan IP</h2></div>

  <div class="card mb-2">
    <div class="card-title"><i class="fas fa-shield-alt"></i>Pembatasan IP per User</div>
    <p class="text-muted text-sm mb-2">Tambahkan IP yang diizinkan untuk setiap user. Kosong = semua IP boleh login.</p>
    <div class="table-wrap"><table>
      <thead><tr><th>User</th><th>Role</th><th>IP Diizinkan</th><th>Aksi</th></tr></thead>
      <tbody>${users.map(u=>`
        <tr>
          <td>${u.name||u.username}</td>
          <td><span class="badge badge-blue">${u.role}</span></td>
          <td><div id="ipList_${u.id}">${(u.allowedIPs||[]).map(ip=>`<span class="badge badge-purple" style="margin:.1rem">${ip} <button onclick="removeIP('${u.id}','${ip}')" style="background:none;border:none;color:inherit;cursor:pointer;font-size:.8rem;margin-left:.2rem">×</button></span>`).join('')||'<span class="text-muted text-sm">Semua IP</span>'}</div></td>
          <td>
            <div style="display:flex;gap:.4rem;align-items:center">
              <input type="text" id="newIP_${u.id}" class="form-control" style="width:150px;padding:.4rem .7rem;font-size:.82rem" placeholder="192.168.1.1">
              <button class="btn btn-primary btn-sm" onclick="addIP('${u.id}')"><i class="fas fa-plus"></i></button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>
  </div>

  <div class="card">
    <div class="card-title"><i class="fas fa-database"></i>Manajemen Data</div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap">
      <div class="card" style="flex:1;min-width:220px;background:var(--bg3)">
        <div style="font-size:.9rem;font-weight:700;margin-bottom:.5rem"><i class="fas fa-file-export text-accent"></i> Export Semua Data</div>
        <p class="text-muted text-sm mb-2">Unduh semua data transaksi ke Excel.</p>
        <button class="btn btn-success btn-sm" onclick="exportAllData()"><i class="fas fa-download"></i> Download Excel</button>
      </div>
      <div class="card" style="flex:1;min-width:220px;background:var(--bg3)">
        <div style="font-size:.9rem;font-weight:700;margin-bottom:.5rem"><i class="fas fa-sync text-accent"></i> Sync Google Sheets</div>
        <p class="text-muted text-sm mb-2">Ambil ulang data dari Google Sheets.</p>
        <button class="btn btn-primary btn-sm" onclick="manualSync()"><i class="fas fa-sync"></i> Sync Sekarang</button>
      </div>
      <div class="card" style="flex:1;min-width:220px;background:var(--bg3)">
        <div style="font-size:.9rem;font-weight:700;margin-bottom:.5rem"><i class="fas fa-trash text-red"></i> Hapus Semua Transaksi</div>
        <p class="text-muted text-sm mb-2">Hapus semua data transaksi (tidak bisa diurungkan).</p>
        <button class="btn btn-danger btn-sm" onclick="clearAllTx()"><i class="fas fa-trash"></i> Hapus Semua</button>
      </div>
    </div>
  </div>`;
}
function addIP(userId) {
  const inp = document.getElementById('newIP_' + userId);
  const ip = inp.value.trim();
  if (!ip) return;
  const user = AUTH.getUsers().find(u=>u.id===userId);
  const ips = user?.allowedIPs || [];
  if (ips.includes(ip)) { showToast('IP sudah ada.','warning'); return; }
  AUTH.updateUser(userId, { allowedIPs: [...ips, ip] });
  inp.value = '';
  showToast('IP ditambahkan.','success');
  renderSettingsPage();
}
function removeIP(userId, ip) {
  const user = AUTH.getUsers().find(u=>u.id===userId);
  AUTH.updateUser(userId, { allowedIPs: (user?.allowedIPs||[]).filter(i=>i!==ip) });
  showToast('IP dihapus.','info');
  renderSettingsPage();
}
function exportAllData() { DB.exportToExcel(DB.getTx(), 'semua-transaksi-aljunior'); showToast('Data diekspor.','success'); }
async function manualSync() {
  showToast('Menyinkronkan...','info');
  const res = await DB.importFromSheet();
  if (res.ok) showToast(`Sync selesai. ${res.added} data baru ditambahkan.`, 'success');
  else showToast('Sync gagal: ' + res.msg, 'error');
}
function clearAllTx() {
  showModal({ title:'Hapus Semua Transaksi', msg:'PERHATIAN: Semua data transaksi akan dihapus permanen!', icon:'danger', okText:'Hapus Semua', okClass:'danger', onOk:()=>{
    localStorage.removeItem('_alj_transaksi');
    localStorage.removeItem('_alj_notifikasi');
    showToast('Semua transaksi dihapus.','success');
  }});
}

/* ================================================
   PASSWORD-PAGE.JS
   ================================================ */
function renderPasswordPage() {
  const session = AUTH.getSession();
  document.getElementById('pageContent').innerHTML = `
  <div style="max-width:480px;margin:0 auto">
    <div class="card">
      <div class="card-title"><i class="fas fa-key"></i>Ganti Password</div>
      <div class="alert-info"><i class="fas fa-info-circle"></i>Mengganti password untuk akun: <strong>${session?.username}</strong></div>
      <div class="form-group">
        <label>Password Lama</label>
        <div class="input-wrap">
          <i class="fas fa-lock input-icon"></i>
          <input type="password" id="oldPass" class="form-control" placeholder="Password saat ini">
        </div>
      </div>
      <div class="form-group">
        <label>Password Baru</label>
        <div class="input-wrap">
          <i class="fas fa-lock input-icon"></i>
          <input type="password" id="newPass" class="form-control" placeholder="Password baru (min. 6 karakter)">
        </div>
      </div>
      <div class="form-group">
        <label>Konfirmasi Password Baru</label>
        <div class="input-wrap">
          <i class="fas fa-lock input-icon"></i>
          <input type="password" id="confPass" class="form-control" placeholder="Ulangi password baru">
        </div>
      </div>
      <button class="btn btn-primary w-full mt-2" onclick="submitChangePass()"><i class="fas fa-save"></i> Simpan Password Baru</button>
    </div>

    ${AUTH.isAdmin() ? `
    <div class="card mt-2">
      <div class="card-title"><i class="fas fa-users-cog"></i>Reset Password User Lain (Admin)</div>
      <div class="form-row">
        <div class="form-group">
          <label>Pilih User</label>
          <select id="adminTargetUser" class="form-control">
            ${AUTH.getUsers().filter(u=>u.id!==session?.userId).map(u=>`<option value="${u.id}">${u.username} (${u.role})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Password Baru</label>
          <input type="password" id="adminNewPass" class="form-control" placeholder="Password baru">
        </div>
      </div>
      <button class="btn btn-warning" onclick="adminResetPass()"><i class="fas fa-key"></i> Reset Password</button>
    </div>` : ''}
  </div>`;
}
function submitChangePass() {
  const session = AUTH.getSession();
  const oldPass = document.getElementById('oldPass').value;
  const newPass = document.getElementById('newPass').value;
  const confPass= document.getElementById('confPass').value;
  if (!oldPass||!newPass||!confPass) { showToast('Semua field wajib diisi.','error'); return; }
  if (newPass.length < 6) { showToast('Password baru minimal 6 karakter.','error'); return; }
  if (newPass !== confPass) { showToast('Konfirmasi password tidak cocok.','error'); return; }
  const res = AUTH.changePassword(session.userId, oldPass, newPass);
  if (!res.ok) { showToast(res.msg,'error'); return; }
  showToast('Password berhasil diubah! Silakan login ulang.','success');
  setTimeout(() => AUTH.logout(), 2000);
}
function adminResetPass() {
  const userId = document.getElementById('adminTargetUser').value;
  const newPass = document.getElementById('adminNewPass').value;
  if (!newPass || newPass.length < 6) { showToast('Password minimal 6 karakter.','error'); return; }
  AUTH.updateUser(userId, { password: newPass });
  showToast('Password user berhasil direset.','success');
  document.getElementById('adminNewPass').value = '';
}
