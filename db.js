/* ================================================
   DB.JS — Data management & Google Sheets sync
   ================================================ */

const DB = (() => {
  const SHEET_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQOj1_MrwhNdW-q7pboeyEd7OCJ4NcBhdGLW-Mzkgw06udNH8cjkuV8hY201hB8SzsA8TTfep4bye3E/pub?gid=0&single=true&output=csv';

  const KEYS = {
    transaksi: '_alj_transaksi',
    rekening:  '_alj_rekening',
    notifikasi:'_alj_notifikasi',
    settings:  '_alj_settings',
    sheetSync: '_alj_sheet_imported'
  };

  // ===== TRANSAKSI =====
  const getTx = () => JSON.parse(localStorage.getItem(KEYS.transaksi) || '[]');
  const saveTx = (d) => localStorage.setItem(KEYS.transaksi, JSON.stringify(d));

  const addTx = (tx) => {
    const list = getTx();
    const entry = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2,5),
      ...tx,
      createdAt: new Date().toISOString()
    };
    list.unshift(entry);
    saveTx(list);
    addNotif(entry);
    return entry;
  };

  const updateTx = (id, data) => {
    const list = getTx();
    const idx = list.findIndex(t => t.id === id);
    if (idx < 0) return null;
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
    saveTx(list);
    return list[idx];
  };

  const deleteTx = (id) => {
    saveTx(getTx().filter(t => t.id !== id));
  };

  const filterTx = ({ type, rekening, currency, startDate, endDate, search } = {}) => {
    let list = getTx();
    if (type) list = list.filter(t => t.type === type);
    if (rekening) list = list.filter(t => t.rekening === rekening);
    if (currency) list = list.filter(t => t.currency === currency);
    if (startDate) list = list.filter(t => t.date >= startDate);
    if (endDate)   list = list.filter(t => t.date <= endDate);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.keterangan||'').toLowerCase().includes(q) ||
        (t.kategori||'').toLowerCase().includes(q)
      );
    }
    return list;
  };

  // ===== SUMMARY CALCULATIONS =====
  const getSummary = (currency = 'IDR') => {
    const all = getTx().filter(t => t.currency === currency);
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0,7);
    const thisYear  = today.substring(0,4);

    const sum = (list, type) => list.filter(t => t.type === type).reduce((s,t) => s + (parseFloat(t.jumlah)||0), 0);

    const todayList  = all.filter(t => t.date === today);
    const monthList  = all.filter(t => t.date && t.date.startsWith(thisMonth));
    const yearList   = all.filter(t => t.date && t.date.startsWith(thisYear));

    return {
      today:  { income: sum(todayList,'income'),  expense: sum(todayList,'expense'),  biaya: sum(todayList,'biaya') },
      month:  { income: sum(monthList,'income'),  expense: sum(monthList,'expense'),  biaya: sum(monthList,'biaya') },
      year:   { income: sum(yearList,'income'),   expense: sum(yearList,'expense'),   biaya: sum(yearList,'biaya') },
      all:    { income: sum(all,'income'),         expense: sum(all,'expense'),        biaya: sum(all,'biaya') }
    };
  };

  const getSaldo = (rekeningId = null) => {
    const reks = getRekening();
    let totalSaldo = 0;
    reks.forEach(r => {
      const txs = getTx().filter(t => (rekeningId ? t.rekening === rekeningId : t.rekening === r.id) && t.currency === r.currency);
      const income  = txs.filter(t => t.type === 'income').reduce((s,t) => s + (parseFloat(t.jumlah)||0), 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((s,t) => s + (parseFloat(t.jumlah)||0), 0);
      const biaya   = txs.filter(t => t.type === 'biaya').reduce((s,t) => s + (parseFloat(t.jumlah)||0), 0);
      r._saldo = (parseFloat(r.saldoAwal)||0) + income - expense - biaya;
      if (!rekeningId) totalSaldo += r._saldo;
    });
    return rekeningId ? (reks.find(r => r.id === rekeningId)?._saldo || 0) : { reks, total: totalSaldo };
  };

  const getChartData = (type = 'monthly', currency = 'IDR') => {
    const all = getTx().filter(t => t.currency === currency);
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().substring(0,7));
    }
    return months.map(m => {
      const list = all.filter(t => t.date && t.date.startsWith(m));
      return {
        label: m,
        income:  list.filter(t => t.type==='income').reduce((s,t)=>s+(parseFloat(t.jumlah)||0),0),
        expense: list.filter(t => t.type==='expense').reduce((s,t)=>s+(parseFloat(t.jumlah)||0),0),
        biaya:   list.filter(t => t.type==='biaya').reduce((s,t)=>s+(parseFloat(t.jumlah)||0),0),
      };
    });
  };

  // ===== REKENING =====
  const getRekening = () => JSON.parse(localStorage.getItem(KEYS.rekening) || '[]');
  const saveRekening = (d) => localStorage.setItem(KEYS.rekening, JSON.stringify(d));

  const addRekening = (rek) => {
    const list = getRekening();
    const entry = { id: 'rek_' + Date.now(), ...rek, createdAt: new Date().toISOString() };
    list.push(entry);
    saveRekening(list);
    return entry;
  };
  const updateRekening = (id, data) => {
    const list = getRekening();
    const idx = list.findIndex(r => r.id === id);
    if (idx < 0) return null;
    list[idx] = { ...list[idx], ...data };
    saveRekening(list);
    return list[idx];
  };
  const deleteRekening = (id) => saveRekening(getRekening().filter(r => r.id !== id));

  // ===== NOTIFIKASI =====
  const getNotif = () => JSON.parse(localStorage.getItem(KEYS.notifikasi) || '[]');
  const saveNotif = (d) => localStorage.setItem(KEYS.notifikasi, JSON.stringify(d));

  const addNotif = (tx) => {
    const list = getNotif();
    list.unshift({
      id: 'notif_' + Date.now(),
      type: tx.type,
      title: tx.type === 'income' ? 'Pemasukan Baru' : tx.type === 'expense' ? 'Pengeluaran Baru' : 'Biaya Baru',
      msg: `${tx.keterangan} — ${formatCurrency(tx.jumlah, tx.currency)}`,
      time: new Date().toISOString(),
      read: false
    });
    saveNotif(list.slice(0, 100)); // Max 100 notif
  };
  const deleteNotif = (id) => saveNotif(getNotif().filter(n => n.id !== id));
  const clearNotif  = () => saveNotif([]);
  const markNotifRead = () => saveNotif(getNotif().map(n => ({...n, read:true})));

  // ===== SETTINGS =====
  const getSettings = () => JSON.parse(localStorage.getItem(KEYS.settings) || '{"activeCurrency":"IDR","theme":"dark"}');
  const saveSettings = (d) => localStorage.setItem(KEYS.settings, JSON.stringify({ ...getSettings(), ...d }));

  // ===== GOOGLE SHEETS IMPORT =====
  const importFromSheet = async () => {
    try {
      const res = await fetch(SHEET_CSV + '&t=' + Date.now());
      if (!res.ok) throw new Error('Gagal mengambil data');
      const text = await res.text();
      const rows = text.split('\n').slice(1).filter(r => r.trim());

      const existing = getTx();
      const existingIds = new Set(existing.map(t => t.sheetRow));
      let added = 0;

      rows.forEach((row, idx) => {
        const cols = parseCSVRow(row);
        if (cols.length < 4) return;
        const [tanggal, tipe, jumlah, keterangan, kategori, rekening, currency] = cols;
        if (!tanggal || !tipe || !jumlah) return;
        const sheetRow = 'sheet_row_' + (idx + 2);
        if (existingIds.has(sheetRow)) return;

        const types = { 'income':'income', 'pemasukan':'income', 'expense':'expense', 'pengeluaran':'expense', 'biaya':'biaya' };
        const txType = types[(tipe||'').toLowerCase()] || 'income';

        addTx({
          type: txType,
          date: normalizeDate(tanggal.trim()),
          jumlah: parseFloat((jumlah||'0').replace(/[^0-9.]/g,'')),
          keterangan: keterangan?.trim() || '(dari sheet)',
          kategori: kategori?.trim() || 'Umum',
          rekening: rekening?.trim() || '',
          currency: (currency?.trim().toUpperCase()) || 'IDR',
          sheetRow,
          source: 'sheet'
        });
        added++;
      });

      return { ok:true, added };
    } catch(e) {
      return { ok:false, msg: e.message };
    }
  };

  const parseCSVRow = (row) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const c = row[i];
      if (c === '"') { inQuotes = !inQuotes; continue; }
      if (c === ',' && !inQuotes) { result.push(current); current = ''; continue; }
      current += c;
    }
    result.push(current);
    return result;
  };

  const normalizeDate = (d) => {
    if (!d) return new Date().toISOString().split('T')[0];
    // Try DD/MM/YYYY
    const parts = d.split(/[\/\-\.]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
      if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
    }
    return d;
  };

  // ===== GENERATE RANDOM HISTORY =====
  const generateRandomHistory = (count = 20, currency = 'IDR') => {
    const categories = ['Gaji','Bonus','Penjualan','Operasional','Transportasi','Makan','Listrik','Internet','Transfer','Lainnya'];
    const types = ['income','income','expense','expense','biaya'];
    const rekList = getRekening();
    const entries = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * 90));
      const rek = rekList[Math.floor(Math.random() * Math.max(rekList.length,1))];
      entries.push(addTx({
        type,
        date: d.toISOString().split('T')[0],
        jumlah: Math.round(Math.random() * (currency==='IDR'?10000000:100000) / 1000) * 1000,
        keterangan: categories[Math.floor(Math.random()*categories.length)] + ' ' + (i+1),
        kategori: categories[Math.floor(Math.random()*categories.length)],
        rekening: rek?.id || '',
        currency,
        source: 'generated'
      }));
    }
    return entries;
  };

  // ===== EXPORT =====
  const exportToExcel = (data, filename = 'transaksi') => {
    const ws = XLSX.utils.json_to_sheet(data.map(t => ({
      Tanggal: t.date, Tipe: t.type, Jumlah: t.jumlah,
      Keterangan: t.keterangan, Kategori: t.kategori,
      Rekening: t.rekening, Mata_Uang: t.currency
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
    XLSX.writeFile(wb, filename + '.xlsx');
  };

  const exportToPDF = (data, filename = 'transaksi') => {
    const win = window.open('', '_blank');
    const rows = data.map(t => `
      <tr>
        <td>${t.date}</td>
        <td><span class="${t.type}">${t.type}</span></td>
        <td>${t.keterangan}</td>
        <td>${t.kategori}</td>
        <td style="text-align:right">${formatCurrency(t.jumlah,t.currency)}</td>
        <td>${t.currency}</td>
      </tr>`).join('');

    win.document.write(`<!DOCTYPE html><html><head>
      <title>Laporan Keuangan AL JUNIOR</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;color:#333;}
        h1{color:#4f8ef7;font-size:18px;} h2{font-size:14px;color:#666;}
        table{width:100%;border-collapse:collapse;margin-top:16px;}
        th{background:#1e2840;color:#fff;padding:8px;text-align:left;}
        td{padding:7px 8px;border-bottom:1px solid #ddd;}
        tr:nth-child(even){background:#f8f9fa;}
        .income{color:green;font-weight:bold;}
        .expense{color:red;font-weight:bold;}
        .biaya{color:orange;font-weight:bold;}
        @media print{button{display:none;}}
      </style></head><body>
      <h1>DATA KEUANGAN AL JUNIOR</h1>
      <h2>Laporan Transaksi — Dicetak: ${new Date().toLocaleString('id-ID')}</h2>
      <table><thead><tr><th>Tanggal</th><th>Tipe</th><th>Keterangan</th><th>Kategori</th><th>Jumlah</th><th>Mata Uang</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <button onclick="window.print()" style="margin-top:20px;padding:8px 16px;background:#4f8ef7;color:#fff;border:none;border-radius:6px;cursor:pointer;">🖨️ Cetak / Simpan PDF</button>
      </body></html>`);
    win.document.close();
  };

  // ===== CURRENCY FORMAT =====
  const formatCurrency = (val, cur = 'IDR') => {
    const n = parseFloat(val) || 0;
    switch(cur) {
      case 'IDR': return 'Rp ' + n.toLocaleString('id-ID');
      case 'THB': return '฿ ' + n.toLocaleString('th-TH');
      case 'KHR': return '៛ ' + n.toLocaleString('km-KH');
      default:    return n.toLocaleString();
    }
  };

  return {
    getTx, addTx, updateTx, deleteTx, filterTx,
    getSummary, getSaldo, getChartData,
    getRekening, addRekening, updateRekening, deleteRekening,
    getNotif, addNotif, deleteNotif, clearNotif, markNotifRead,
    getSettings, saveSettings,
    importFromSheet, generateRandomHistory,
    exportToExcel, exportToPDF,
    formatCurrency
  };
})();
