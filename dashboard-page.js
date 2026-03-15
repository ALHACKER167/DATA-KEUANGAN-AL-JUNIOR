/* ================================================
   DASHBOARD-PAGE.JS — Dashboard content
   ================================================ */

let _dashChart = null;
let _dashDoughnut = null;

function renderDashboardPage() {
  const summary = DB.getSummary(currentCurrency);
  const { reks, total } = DB.getSaldo();
  const fmt = (v) => DB.formatCurrency(v, currentCurrency);
  const chartData = DB.getChartData('monthly', currentCurrency);
  const recentTx  = DB.getTx().filter(t => t.currency === currentCurrency).slice(0,8);

  document.getElementById('pageContent').innerHTML = `
  <!-- STAT CARDS ROW 1: Pemasukan -->
  <div class="stat-rows">
    <div class="stat-row-group">
      <div class="stat-card income">
        <div class="stat-card-header">
          <div class="stat-icon income"><i class="fas fa-arrow-trend-up"></i></div>
          <span class="stat-period">Hari Ini</span>
        </div>
        <div class="stat-amount text-green">${fmt(summary.today.income)}</div>
        <div class="stat-label">Pemasukan Hari Ini</div>
      </div>
      <div class="stat-card income">
        <div class="stat-card-header">
          <div class="stat-icon income"><i class="fas fa-calendar-day"></i></div>
          <span class="stat-period">Bulan Ini</span>
        </div>
        <div class="stat-amount text-green">${fmt(summary.month.income)}</div>
        <div class="stat-label">Pemasukan Bulan Ini</div>
      </div>
      <div class="stat-card income">
        <div class="stat-card-header">
          <div class="stat-icon income"><i class="fas fa-calendar"></i></div>
          <span class="stat-period">Tahun Ini</span>
        </div>
        <div class="stat-amount text-green">${fmt(summary.year.income)}</div>
        <div class="stat-label">Pemasukan Tahun Ini</div>
      </div>
    </div>

    <!-- ROW 2: Pengeluaran -->
    <div class="stat-row-group">
      <div class="stat-card expense">
        <div class="stat-card-header">
          <div class="stat-icon expense"><i class="fas fa-arrow-trend-down"></i></div>
          <span class="stat-period">Hari Ini</span>
        </div>
        <div class="stat-amount text-red">${fmt(summary.today.expense)}</div>
        <div class="stat-label">Pengeluaran Hari Ini</div>
      </div>
      <div class="stat-card expense">
        <div class="stat-card-header">
          <div class="stat-icon expense"><i class="fas fa-calendar-day"></i></div>
          <span class="stat-period">Bulan Ini</span>
        </div>
        <div class="stat-amount text-red">${fmt(summary.month.expense)}</div>
        <div class="stat-label">Pengeluaran Bulan Ini</div>
      </div>
      <div class="stat-card expense">
        <div class="stat-card-header">
          <div class="stat-icon expense"><i class="fas fa-calendar"></i></div>
          <span class="stat-period">Tahun Ini</span>
        </div>
        <div class="stat-amount text-red">${fmt(summary.year.expense)}</div>
        <div class="stat-label">Pengeluaran Tahun Ini</div>
      </div>
    </div>

    <!-- ROW 3: Biaya -->
    <div class="stat-row-group">
      <div class="stat-card biaya">
        <div class="stat-card-header">
          <div class="stat-icon biaya"><i class="fas fa-coins"></i></div>
          <span class="stat-period">Hari Ini</span>
        </div>
        <div class="stat-amount text-orange">${fmt(summary.today.biaya)}</div>
        <div class="stat-label">Biaya Hari Ini</div>
      </div>
      <div class="stat-card biaya">
        <div class="stat-card-header">
          <div class="stat-icon biaya"><i class="fas fa-calendar-day"></i></div>
          <span class="stat-period">Bulan Ini</span>
        </div>
        <div class="stat-amount text-orange">${fmt(summary.month.biaya)}</div>
        <div class="stat-label">Biaya Bulan Ini</div>
      </div>
      <div class="stat-card biaya">
        <div class="stat-card-header">
          <div class="stat-icon biaya"><i class="fas fa-calendar"></i></div>
          <span class="stat-period">Tahun Ini</span>
        </div>
        <div class="stat-amount text-orange">${fmt(summary.year.biaya)}</div>
        <div class="stat-label">Biaya Tahun Ini</div>
      </div>
    </div>
  </div>

  <!-- SALDO REKENING -->
  <div class="stat-grid" style="margin-bottom:1.5rem">
    ${reks.filter(r=>r.currency===currentCurrency).map(r=>`
    <div class="stat-card balance">
      <div class="stat-card-header">
        <div class="stat-icon balance"><i class="fas fa-university"></i></div>
        <span class="stat-period">${r.currency}</span>
      </div>
      <div class="stat-amount text-accent">${fmt(r._saldo||0)}</div>
      <div class="stat-label">${r.nama}</div>
    </div>`).join('') || `
    <div class="stat-card balance" style="grid-column:1/-1">
      <div class="empty-state" style="padding:1.5rem">
        <i class="fas fa-university"></i>
        <h3>Belum ada rekening</h3>
        <p>Tambahkan rekening bank terlebih dahulu</p>
        <button class="btn btn-primary mt-2" onclick="navigateTo('rekening')"><i class="fas fa-plus"></i> Tambah Rekening</button>
      </div>
    </div>`}
  </div>

  <!-- CHART + RINGKASAN -->
  <div class="chart-grid">
    <div class="card">
      <div class="card-title"><i class="fas fa-chart-bar"></i>Grafik 6 Bulan Terakhir</div>
      <div class="chart-container"><canvas id="mainChart"></canvas></div>
    </div>
    <div class="card">
      <div class="card-title"><i class="fas fa-chart-pie"></i>Ringkasan Total</div>
      <div style="height:200px;display:flex;align-items:center;justify-content:center">
        <canvas id="doughnutChart"></canvas>
      </div>
      <div class="mini-stat-list mt-2">
        <div class="mini-stat-item">
          <div class="mini-stat-dot" style="background:var(--green)"></div>
          <span class="mini-stat-label">Total Pemasukan</span>
          <span class="mini-stat-val text-green">${fmt(summary.all.income)}</span>
        </div>
        <div class="mini-stat-item">
          <div class="mini-stat-dot" style="background:var(--red)"></div>
          <span class="mini-stat-label">Total Pengeluaran</span>
          <span class="mini-stat-val text-red">${fmt(summary.all.expense)}</span>
        </div>
        <div class="mini-stat-item">
          <div class="mini-stat-dot" style="background:var(--orange)"></div>
          <span class="mini-stat-label">Total Biaya</span>
          <span class="mini-stat-val text-orange">${fmt(summary.all.biaya)}</span>
        </div>
        <div class="mini-stat-item" style="border-top:1px solid var(--border);padding-top:.8rem;margin-top:.3rem">
          <div class="mini-stat-dot" style="background:var(--accent)"></div>
          <span class="mini-stat-label fw-bold">Saldo Bersih</span>
          <span class="mini-stat-val text-accent fw-bold">${fmt(summary.all.income - summary.all.expense - summary.all.biaya)}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- TRANSAKSI TERBARU -->
  <div class="card mt-2">
    <div class="card-title" style="justify-content:space-between">
      <span><i class="fas fa-clock"></i>Transaksi Terbaru</span>
      <button class="btn btn-secondary btn-sm" onclick="navigateTo('history')">Lihat Semua</button>
    </div>
    ${recentTx.length ? `
    <div>${recentTx.map(t => `
      <div class="txn-item">
        <div class="txn-icon ${t.type}">
          <i class="fas ${t.type==='income'?'fa-arrow-down':t.type==='expense'?'fa-arrow-up':'fa-coins'}"></i>
        </div>
        <div class="txn-info">
          <div class="txn-name">${t.keterangan || '—'}</div>
          <div class="txn-cat">${t.kategori || 'Umum'}</div>
        </div>
        <div class="txn-right">
          <div class="txn-amount ${t.type==='income'?'text-green':t.type==='expense'?'text-red':'text-orange'}">
            ${t.type==='income'?'+':'−'} ${DB.formatCurrency(t.jumlah, t.currency)}
          </div>
          <div class="txn-date">${formatDate(t.date)}</div>
        </div>
      </div>`).join('')}
    </div>` : `<div class="empty-state"><i class="fas fa-inbox"></i><h3>Belum ada transaksi</h3><p>Mulai tambahkan pemasukan atau pengeluaran</p></div>`}
  </div>`;

  // Render Charts
  requestAnimationFrame(() => {
    renderMainChart(chartData);
    renderDoughnutChart(summary.all);
  });
}

function renderMainChart(data) {
  const ctx = document.getElementById('mainChart');
  if (!ctx) return;
  if (_dashChart) _dashChart.destroy();
  _dashChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => {
        const [y,m] = d.label.split('-');
        return new Date(y,m-1).toLocaleDateString('id-ID',{month:'short',year:'2-digit'});
      }),
      datasets: [
        { label:'Pemasukan', data: data.map(d=>d.income),  backgroundColor:'rgba(18,216,138,.7)',  borderColor:'var(--green)',  borderWidth:1, borderRadius:6 },
        { label:'Pengeluaran',data:data.map(d=>d.expense), backgroundColor:'rgba(242,79,90,.7)',   borderColor:'var(--red)',    borderWidth:1, borderRadius:6 },
        { label:'Biaya',     data: data.map(d=>d.biaya),   backgroundColor:'rgba(251,191,36,.6)',  borderColor:'var(--orange)', borderWidth:1, borderRadius:6 },
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ labels:{ color:'#8fa3c8', font:{size:11} }}},
      scales:{
        x:{ ticks:{color:'#8fa3c8',font:{size:11}}, grid:{color:'rgba(255,255,255,.05)'} },
        y:{ ticks:{color:'#8fa3c8',font:{size:11}}, grid:{color:'rgba(255,255,255,.05)'},
            beginAtZero:true }
      }
    }
  });
}

function renderDoughnutChart(all) {
  const ctx = document.getElementById('doughnutChart');
  if (!ctx) return;
  if (_dashDoughnut) _dashDoughnut.destroy();
  _dashDoughnut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pemasukan','Pengeluaran','Biaya'],
      datasets:[{ data:[all.income,all.expense,all.biaya], backgroundColor:['rgba(18,216,138,.8)','rgba(242,79,90,.8)','rgba(251,191,36,.8)'], borderColor:'transparent', borderWidth:2, hoverBorderWidth:3 }]
    },
    options: {
      responsive:true, maintainAspectRatio:false, cutout:'72%',
      plugins:{ legend:{ display:false } }
    }
  });
}
