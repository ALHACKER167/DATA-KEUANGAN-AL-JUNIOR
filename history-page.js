/* ================================================
   HISTORY-PAGE.JS — Transaction history
   ================================================ */

let _histPage = 1;
let _histFilters = {};

function renderHistoryPage() {
  document.getElementById('pageContent').innerHTML = `
  <div class="section-header">
    <h2><i class="fas fa-history"></i> Riwayat Transaksi</h2>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap">
      <button class="btn btn-secondary btn-sm" onclick="showGenerateModal()"><i class="fas fa-magic"></i> Generate Acak</button>
      <button class="btn btn-success btn-sm" onclick="exportHistExcel()"><i class="fas fa-file-excel"></i> Excel</button>
      <button class="btn btn-danger btn-sm" onclick="exportHistPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
    </div>
  </div>

  <!-- Filters -->
  <div class="card mb-2">
    <div style="display:flex;gap:.8rem;flex-wrap:wrap;align-items:flex-end">
      <div class="form-group mb-1" style="min-width:130px;flex:1">
        <label>Tipe</label>
        <select id="histType" class="form-control" onchange="applyHistFilter()">
          <option value="">Semua</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
          <option value="biaya">Biaya</option>
        </select>
      </div>
      <div class="form-group mb-1" style="min-width:110px;flex:1">
        <label>Mata Uang</label>
        <select id="histCurrency" class="form-control" onchange="applyHistFilter()">
          <option value="">Semua</option>
          <option value="IDR" ${currentCurrency==='IDR'?'selected':''}>IDR</option>
          <option value="THB" ${currentCurrency==='THB'?'selected':''}>THB</option>
          <option value="KHR" ${currentCurrency==='KHR'?'selected':''}>KHR</option>
        </select>
      </div>
      <div class="form-group mb-1" style="flex:1;min-width:130px">
        <label>Dari Tanggal</label>
        <input type="date" id="histStart" class="form-control" onchange="applyHistFilter()">
      </div>
      <div class="form-group mb-1" style="flex:1;min-width:130px">
        <label>Sampai Tanggal</label>
        <input type="date" id="histEnd" class="form-control" onchange="applyHistFilter()">
      </div>
      <div class="form-group mb-1 search-bar" style="flex:2;min-width:180px">
        <label>Cari</label>
        <i class="fas fa-search"></i>
        <input type="text" id="histSearch" class="form-control" style="padding-left:2.4rem" placeholder="Keterangan / Kategori..." oninput="applyHistFilter()">
      </div>
    </div>
  </div>

  <!-- Table -->
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Tanggal</th><th>Tipe</th><th>Keterangan</th>
            <th>Kategori</th><th>Jumlah</th><th>Mata Uang</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody id="histTbody"></tbody>
      </table>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:1rem;flex-wrap:wrap;gap:.5rem">
      <span id="histInfo" class="text-muted text-sm"></span>
      <div id="histPagination" class="pagination"></div>
    </div>
  </div>

  <!-- Edit Modal -->
  <div id="editTxModal" class="modal-overlay" style="display:none">
    <div class="modal-box" style="max-width:520px;width:100%;text-align:left">
      <h3 style="margin-bottom:1.2rem;display:flex;align-items:center;gap:.5rem"><i class="fas fa-edit text-accent"></i> Edit Transaksi</h3>
      <input type="hidden" id="editTxId">
      <div class="form-row">
        <div class="form-group">
          <label>Tanggal</label>
          <input type="date" id="editDate" class="form-control">
        </div>
        <div class="form-group">
          <label>Tipe</label>
          <select id="editType" class="form-control">
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
            <option value="biaya">Biaya</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Jumlah</label>
          <input type="number" id="editJumlah" class="form-control">
        </div>
        <div class="form-group">
          <label>Mata Uang</label>
          <select id="editCurrency" class="form-control">
            <option value="IDR">IDR</option><option value="THB">THB</option><option value="KHR">KHR</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Kategori</label>
        <select id="editKategori" class="form-control">
          <option>Gaji</option><option>Bonus</option><option>Penjualan</option>
          <option>Investasi</option><option>Operasional</option><option>Transportasi</option>
          <option>Makan & Minum</option><option>Listrik & Air</option><option>Internet</option>
          <option>Sewa</option><option>Transfer Antar Bank</option><option>Administrasi Bank</option>
          <option>Gaji Karyawan</option><option>Pajak</option><option>Lainnya</option>
        </select>
      </div>
      <div class="form-group">
        <label>Keterangan</label>
        <input type="text" id="editKeterangan" class="form-control">
      </div>
      <div class="modal-actions" style="justify-content:flex-end">
        <button class="btn-modal-cancel" onclick="document.getElementById('editTxModal').style.display='none'">Batal</button>
        <button class="btn-modal-ok" onclick="saveEditTx()">Simpan</button>
      </div>
    </div>
  </div>
  `;

  applyHistFilter();
}

function applyHistFilter() {
  _histPage = 1;
  _histFilters = {
    type:      document.getElementById('histType')?.value     || '',
    currency:  document.getElementById('histCurrency')?.value || '',
    startDate: document.getElementById('histStart')?.value    || '',
    endDate:   document.getElementById('histEnd')?.value      || '',
    search:    document.getElementById('histSearch')?.value   || '',
  };
  renderHistTable();
}

function renderHistTable() {
  const filtered = DB.filterTx(_histFilters);
  const { data, total, pages } = paginate(filtered, _histPage, 15);
  const tbody = document.getElementById('histTbody');
  const info  = document.getElementById('histInfo');
  if (!tbody) return;

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state" style="padding:2rem"><i class="fas fa-search"></i><h3>Tidak ada transaksi</h3><p>Coba ubah filter pencarian</p></div></td></tr>`;
  } else {
    const start = (_histPage - 1) * 15;
    tbody.innerHTML = data.map((t, i) => `
      <tr>
        <td class="text-muted text-sm">${start + i + 1}</td>
        <td>${formatDate(t.date)}</td>
        <td>
          <span class="badge ${t.type==='income'?'badge-green':t.type==='expense'?'badge-red':'badge-orange'}">
            <i class="fas ${t.type==='income'?'fa-arrow-down':t.type==='expense'?'fa-arrow-up':'fa-coins'}"></i>
            ${t.type==='income'?'Masuk':t.type==='expense'?'Keluar':'Biaya'}
          </span>
        </td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${t.keterangan||''}">${t.keterangan||'—'}</td>
        <td><span class="badge badge-blue">${t.kategori||'Umum'}</span></td>
        <td class="fw-bold ${t.type==='income'?'text-green':t.type==='expense'?'text-red':'text-orange'}">
          ${t.type==='income'?'+':'−'} ${DB.formatCurrency(t.jumlah, t.currency)}
        </td>
        <td><span class="badge badge-purple">${t.currency}</span></td>
        <td>
          <div style="display:flex;gap:.4rem">
            <button class="btn btn-secondary btn-sm btn-icon" onclick="openEditTx('${t.id}')" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="deleteTxConfirm('${t.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`).join('');
  }

  if (info) info.textContent = `Menampilkan ${Math.min((_histPage-1)*15+1, total)}–${Math.min(_histPage*15, total)} dari ${total} transaksi`;
  buildPagination(document.getElementById('histPagination'), { pages, page: _histPage, onPage: (p) => { _histPage = p; renderHistTable(); } });
}

function openEditTx(id) {
  const tx = DB.getTx().find(t => t.id === id);
  if (!tx) return;
  document.getElementById('editTxId').value        = id;
  document.getElementById('editDate').value         = tx.date;
  document.getElementById('editType').value         = tx.type;
  document.getElementById('editJumlah').value       = tx.jumlah;
  document.getElementById('editCurrency').value     = tx.currency;
  document.getElementById('editKategori').value     = tx.kategori;
  document.getElementById('editKeterangan').value   = tx.keterangan;
  document.getElementById('editTxModal').style.display = 'flex';
}

function saveEditTx() {
  const id = document.getElementById('editTxId').value;
  DB.updateTx(id, {
    date:       document.getElementById('editDate').value,
    type:       document.getElementById('editType').value,
    jumlah:     parseFloat(document.getElementById('editJumlah').value),
    currency:   document.getElementById('editCurrency').value,
    kategori:   document.getElementById('editKategori').value,
    keterangan: document.getElementById('editKeterangan').value,
  });
  document.getElementById('editTxModal').style.display = 'none';
  showToast('Transaksi berhasil diperbarui.', 'success');
  renderHistTable();
}

function deleteTxConfirm(id) {
  showModal({ title:'Hapus Transaksi', msg:'Data transaksi ini akan dihapus permanen. Lanjutkan?', icon:'danger', okText:'Hapus', okClass:'danger', onOk:() => {
    DB.deleteTx(id);
    showToast('Transaksi dihapus.', 'success');
    renderHistTable();
  }});
}

function exportHistExcel() {
  const filtered = DB.filterTx(_histFilters);
  DB.exportToExcel(filtered, 'riwayat-transaksi-aljunior');
  showToast('File Excel berhasil diunduh!', 'success');
}
function exportHistPDF() {
  const filtered = DB.filterTx(_histFilters);
  DB.exportToPDF(filtered, 'riwayat-transaksi-aljunior');
}

function showGenerateModal() {
  showModal({
    title: 'Generate Data Acak',
    msg: 'Buat 30 transaksi acak untuk testing? (Currency: ' + currentCurrency + ')',
    icon: 'info', okText: 'Generate',
    onOk: () => {
      DB.generateRandomHistory(30, currentCurrency);
      showToast('30 transaksi acak berhasil dibuat!', 'success');
      renderHistTable();
      updateNotifBadge();
    }
  });
}
