/* ================================================
   TRANSAKSI-PAGE.JS — Input transaksi
   ================================================ */

function renderTransaksiPage() {
  const reks = DB.getRekening();
  document.getElementById('pageContent').innerHTML = `
  <div style="max-width:680px;margin:0 auto">
    <div class="card">
      <div class="card-title"><i class="fas fa-plus-circle"></i>Tambah Transaksi Baru</div>

      <div style="display:flex;gap:.5rem;margin-bottom:1.5rem;background:var(--bg3);padding:.4rem;border-radius:12px;">
        <button class="tx-type-btn active" data-type="income"  onclick="setTxType('income')">
          <i class="fas fa-arrow-down"></i> Pemasukan
        </button>
        <button class="tx-type-btn" data-type="expense" onclick="setTxType('expense')">
          <i class="fas fa-arrow-up"></i> Pengeluaran
        </button>
        <button class="tx-type-btn" data-type="biaya"   onclick="setTxType('biaya')">
          <i class="fas fa-coins"></i> Biaya
        </button>
      </div>
      <input type="hidden" id="txType" value="income">

      <div class="form-row">
        <div class="form-group">
          <label>Tanggal</label>
          <input type="date" id="txDate" class="form-control" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label>Mata Uang</label>
          <select id="txCurrency" class="form-control">
            <option value="IDR" ${currentCurrency==='IDR'?'selected':''}>🇮🇩 IDR - Rupiah</option>
            <option value="THB" ${currentCurrency==='THB'?'selected':''}>🇹🇭 THB - Baht</option>
            <option value="KHR" ${currentCurrency==='KHR'?'selected':''}>🇰🇭 KHR - Riel</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Jumlah</label>
        <div class="input-wrap">
          <i class="fas fa-money-bill-wave input-icon"></i>
          <input type="number" id="txJumlah" class="form-control" placeholder="0" min="0" step="any">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Kategori</label>
          <select id="txKategori" class="form-control">
            <option>Gaji</option><option>Bonus</option><option>Penjualan</option>
            <option>Investasi</option><option>Operasional</option><option>Transportasi</option>
            <option>Makan & Minum</option><option>Listrik & Air</option><option>Internet</option>
            <option>Sewa</option><option>Transfer Antar Bank</option><option>Administrasi Bank</option>
            <option>Gaji Karyawan</option><option>Pajak</option><option>Lainnya</option>
          </select>
        </div>
        <div class="form-group">
          <label>Rekening</label>
          <select id="txRekening" class="form-control">
            <option value="">— Pilih Rekening —</option>
            ${reks.map(r=>`<option value="${r.id}">${r.nama} (${r.currency})</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Keterangan</label>
        <input type="text" id="txKeterangan" class="form-control" placeholder="Deskripsi transaksi...">
      </div>

      <div class="form-group">
        <label>Catatan (opsional)</label>
        <textarea id="txCatatan" class="form-control" rows="2" placeholder="Catatan tambahan..."></textarea>
      </div>

      <div style="display:flex;gap:.8rem;justify-content:flex-end;margin-top:1.5rem">
        <button class="btn btn-secondary" onclick="clearTxForm()"><i class="fas fa-undo"></i> Reset</button>
        <button class="btn btn-primary" onclick="submitTx()"><i class="fas fa-save"></i> Simpan Transaksi</button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="card mt-2">
      <div class="card-title"><i class="fas fa-info-circle"></i>Ringkasan Hari Ini</div>
      ${(() => {
        const s = DB.getSummary(currentCurrency);
        const fmt = v => DB.formatCurrency(v, currentCurrency);
        return `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem">
          <div style="text-align:center;padding:1rem;background:var(--bg3);border-radius:12px">
            <div class="text-green fw-bold" style="font-size:1.1rem">${fmt(s.today.income)}</div>
            <div class="text-muted text-sm mt-1">Pemasukan</div>
          </div>
          <div style="text-align:center;padding:1rem;background:var(--bg3);border-radius:12px">
            <div class="text-red fw-bold" style="font-size:1.1rem">${fmt(s.today.expense)}</div>
            <div class="text-muted text-sm mt-1">Pengeluaran</div>
          </div>
          <div style="text-align:center;padding:1rem;background:var(--bg3);border-radius:12px">
            <div class="text-orange fw-bold" style="font-size:1.1rem">${fmt(s.today.biaya)}</div>
            <div class="text-muted text-sm mt-1">Biaya</div>
          </div>
        </div>`;
      })()}
    </div>
  </div>`;

  // Inject styles for type buttons
  if (!document.getElementById('txBtnStyle')) {
    const s = document.createElement('style');
    s.id = 'txBtnStyle';
    s.textContent = `
      .tx-type-btn { flex:1;padding:.65rem;border:none;border-radius:10px;background:transparent;color:var(--text2);font-size:.88rem;font-weight:600;cursor:pointer;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:.4rem; }
      .tx-type-btn:hover { color:var(--text); }
      .tx-type-btn.active[data-type="income"]  { background:rgba(18,216,138,.15);color:var(--green); }
      .tx-type-btn.active[data-type="expense"] { background:rgba(242,79,90,.15);color:var(--red); }
      .tx-type-btn.active[data-type="biaya"]   { background:rgba(251,191,36,.15);color:var(--orange); }
    `;
    document.head.appendChild(s);
  }
}

function setTxType(type) {
  document.getElementById('txType').value = type;
  document.querySelectorAll('.tx-type-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-type') === type));
}

function clearTxForm() {
  document.getElementById('txDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('txJumlah').value = '';
  document.getElementById('txKeterangan').value = '';
  document.getElementById('txCatatan').value = '';
  setTxType('income');
}

function submitTx() {
  const type      = document.getElementById('txType').value;
  const date      = document.getElementById('txDate').value;
  const jumlah    = parseFloat(document.getElementById('txJumlah').value);
  const kategori  = document.getElementById('txKategori').value;
  const rekening  = document.getElementById('txRekening').value;
  const keterangan= document.getElementById('txKeterangan').value.trim();
  const catatan   = document.getElementById('txCatatan').value.trim();
  const currency  = document.getElementById('txCurrency').value;

  if (!date)   { showToast('Tanggal wajib diisi.','error'); return; }
  if (!jumlah || jumlah <= 0) { showToast('Jumlah harus lebih dari 0.','error'); return; }
  if (!keterangan) { showToast('Keterangan wajib diisi.','error'); return; }

  DB.addTx({ type, date, jumlah, kategori, rekening, keterangan, catatan, currency });
  showToast('Transaksi berhasil disimpan!', 'success');
  clearTxForm();
  updateNotifBadge();
}
