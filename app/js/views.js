// views.js — Render tiap halaman dari satu ringkasan bulan (state.js).
// Semua angka datang dari monthSummary(); view tidak pernah menghitung
// sendiri, jadi KPI, donut, rencana dan tren selalu cocok.
import { fmtRp, fmtRpShort, fmtPct, monthLabel, dateLabel, esc, clamp } from './format.js';
import { CURRENT } from './data.js';
import {
  categories, categoryById, monthSummary, trend12,
  billStatus, upcomingBills, goalProgress, debtState, payoffCalc,
} from './state.js';
import { donutChart, trendChart, paceBar, sankeyChart } from './charts.js';

function kpiCard(id, label, value, sub, tone = '') {
  return `<div class="kpi ${tone}"><div class="kpi-label">${label}</div>
    <div class="kpi-value" id="${id}">${value}</div><div class="kpi-sub">${sub}</div></div>`;
}

function legendList(summary) {
  return categories()
    .filter((c) => c.id !== 'cadangan')
    .map((c) => {
      const row = summary.byCat[c.id];
      const over = row.spent > row.assigned;
      return `<li class="legend-row">
        <span class="dot" style="background:${c.color}"></span>
        <span class="legend-name">${c.short}</span>
        <span class="legend-nums">${fmtRpShort(row.spent)} / ${fmtRpShort(row.assigned)}</span>
        <span class="legend-avail ${over ? 'neg' : ''}">${over ? '−' : ''}${fmtRpShort(Math.abs(row.assigned - row.spent))}</span>
      </li>`;
    }).join('');
}

// Status kecepatan belanja: terpenuhi bila sudah mencapai anggaran,
// waspada bila melebihi harapan harian, aman bila di bawahnya.
function paceNote(assigned, spent, day, daysInMonth) {
  if (assigned > 0 && spent >= assigned) return { text: 'Terpenuhi', cls: 'ok' };
  if (spent > assigned * (day / daysInMonth)) return { text: 'Lebih cepat dari rencana', cls: 'warm' };
  return { text: 'Sesuai rencana', cls: 'ok' };
}

export function viewDashboard(year, month) {
  const s = monthSummary(year, month);
  const trend = trend12();
  const upcoming = upcomingBills(year, month);
  const bills = billStatus(year, month);
  const paidCount = bills.filter((b) => b.paid).length;
  const billsTotal = bills.reduce((a, b) => a + b.amount, 0);
  const billsPaid = bills.filter((b) => b.paid).reduce((a, b) => a + b.amount, 0);
  const goals = goalProgress(year, month);
  const debts = debtState();
  const d0 = debts[0];
  const expenseCount = s.txns.filter((t) => t.type === 'expense' && t.category !== 'tabungan').length;
  const lastTrend = trend[trend.length - 1];
  const paceTop = categories()
    .filter((c) => c.plan > 0 && c.id !== 'tabungan' && c.id !== 'cadangan')
    .map((c) => ({ c, row: s.byCat[c.id] }))
    .sort((a, b) => (b.row.spent / b.row.assigned) - (a.row.spent / a.row.assigned))
    .slice(0, 3);
  return `
  <section class="kpis">
    ${kpiCard('kpi-income', 'Pemasukan', fmtRp(s.income), 'Gaji Budi + Gaji Sari')}
    ${kpiCard('kpi-spent', 'Pengeluaran', fmtRp(s.spent), `${expenseCount} transaksi pengeluaran`, 'ink')}
    ${kpiCard('kpi-saved', 'Ditabung', fmtRp(s.saved), `${fmtPct(s.saved / s.income)} dari pemasukan`, 'green')}
    ${kpiCard('kpi-remaining', 'Sisa di kategori', fmtRp(s.remaining), 'Sudah dialokasikan · terbawa ke bulan depan', 'gold')}
  </section>
  <div class="dash-grid">
    <section class="card donut-card">
      <h2>Ke mana uang pergi <span class="card-sub">November 2026</span></h2>
      <div class="donut-wrap">${donutChart(s.byCat, categories())}
        <ul class="legend">${legendList(s)}</ul>
      </div>
    </section>
    <section class="card trend-card">
      <h2>Tren 12 bulan <span class="card-sub">masuk · keluar · ditabung</span></h2>
      ${trendChart(trend)}
      <div class="chart-caption">${monthLabel(lastTrend.year, lastTrend.month)}: masuk ${fmtRpShort(lastTrend.income)} · keluar ${fmtRpShort(lastTrend.spent)} · ditabung ${fmtRpShort(lastTrend.saved)}</div>
      <div class="chart-legend"><span><i class="sw" style="background:#16294A"></i>Pemasukan</span>
      <span><i class="sw" style="background:#C2410C"></i>Pengeluaran</span>
      <span><i class="sw" style="background:#C89B3C"></i>Ditabung</span></div>
    </section>
    <section class="card pace-card">
      <h2>Kecepatan belanja <span class="card-sub">hari ke-${CURRENT.today} dari ${CURRENT.daysInMonth}</span></h2>
      ${paceTop.map(({ c, row }) => {
        const note = paceNote(row.assigned, row.spent, CURRENT.today, CURRENT.daysInMonth);
        const over = row.spent > row.assigned;
        return `<div class="pace-row"><div class="pace-head"><span>${c.icon} ${c.name}</span>
          <span>${fmtRpShort(row.spent)} / ${fmtRpShort(row.assigned)}</span></div>
          ${paceBar(row.assigned, row.spent, CURRENT.today, CURRENT.daysInMonth)}
          <div class="pace-note ${over ? 'neg' : note.cls}">${over ? 'Melebihi anggaran' : note.text}</div></div>`;
      }).join('')}
      <a class="card-link" href="#/anggaran">Lihat semua kategori →</a>
    </section>
    <section class="card bills-card">
      <h2>Tagihan <span class="card-sub">${paidCount} dari ${bills.length} lunas</span></h2>
      ${upcoming.length === 0
        ? '<p class="empty-ok">Semua tagihan bulan ini sudah lunas. 🎉</p>'
        : upcoming.map((b) => `<div class="bill-row"><span class="bill-name">${b.name}</span>
            <span class="bill-due">Jatuh tempo ${b.dueDay} Nov</span>
            <b>${fmtRp(b.amount)}</b>
            <button class="btn small" data-action="pay-bill" data-bill="${b.id}">Tandai dibayar</button></div>`).join('')}
      <div class="bill-foot">Total tagihan ${fmtRp(billsTotal)} · lunas ${fmtRp(billsPaid)}</div>
      <div class="bill-foot debt-line">💳 ${d0.name}: ${fmtRpShort(d0.balance)} · min ${fmtRpShort(d0.minPayment)}/bln</div>
      <a class="card-link" href="#/tagihan">Semua tagihan →</a>
    </section>
    <section class="card goals-card">
      <h2>Tujuan menabung</h2>
      ${goals.map((g) => `<div class="goal-mini"><div class="goal-head"><span>${g.name}</span>
        <b>${fmtPct(g.pct)} · ${fmtRpShort(g.saved)} / ${fmtRpShort(g.target)}</b></div>
        <div class="goal-track"><div class="goal-fill" style="width:${(g.pct * 100).toFixed(1)}%"></div></div></div>`).join('')}
      <a class="card-link" href="#/tujuan">Kelola tujuan →</a>
    </section>
  </div>`;
}

export function viewPlan(year, month) {
  const s = monthSummary(year, month);
  const rta = s.readyToAssign;
  const rows = categories().map((c) => {
    const row = s.byCat[c.id];
    const avail = row.assigned - row.spent;
    const over = avail < 0;
    const note = c.id === 'cadangan' ? { text: 'Cadangan bulan ini', cls: '' } : paceNote(row.assigned, row.spent, CURRENT.today, CURRENT.daysInMonth);
    return `<tr>
      <td><span class="dot" style="background:${c.color}"></span> ${c.icon} ${c.name}</td>
      <td class="num"><button class="plan-edit" data-action="edit-plan" data-category="${c.id}" title="Ubah anggaran">${fmtRp(row.assigned)}</button></td>
      <td class="num">${fmtRp(row.spent)}</td>
      <td class="num ${over ? 'neg' : 'pos'}">${fmtRp(avail)}</td>
      <td class="pace-cell">${paceBar(row.assigned, row.spent, CURRENT.today, CURRENT.daysInMonth)}
        <span class="pace-note ${over ? 'neg' : note.cls}">${over ? 'Melebihi anggaran' : note.text}</span></td>
    </tr>`;
  }).join('');
  return `
  <section class="plan-banner ${rta === 0 ? 'zero' : rta > 0 ? 'left' : 'over'}">
    <div class="rta"><span>Siap Dialokasikan</span><b id="rta-value">${fmtRp(rta)}</b>
      <span>${rta === 0 ? 'Setiap rupiah sudah punya tugas — anggaran zero-based tercapai.' : rta > 0 ? 'Masih ada pemasukan yang belum dialokasikan ke kategori.' : 'Anggaran melebihi pemasukan — kurangi salah satu kategori.'}</span></div>
    <div class="plan-totals">
      <div><span>Pemasukan</span><b>${fmtRp(s.income)}</b></div>
      <div><span>Dialokasikan</span><b>${fmtRp(s.assigned)}</b></div>
      <div><span>Pengeluaran</span><b>${fmtRp(s.spent)}</b></div>
      <div><span>Ditabung</span><b>${fmtRp(s.saved)}</b></div>
      <div><span>Tersisa</span><b>${fmtRp(s.remaining)}</b></div>
    </div>
  </section>
  <section class="card">
    <h2>Rencana anggaran ${monthLabel(year, month)} <span class="card-sub">klik jumlah untuk mengubah</span></h2>
    <table class="plan-table"><thead><tr>
      <th>Kategori</th><th>Dianggarkan</th><th>Terpakai *</th><th>Tersisa</th>
      <th>Kecepatan (hari ke-${CURRENT.today}/${CURRENT.daysInMonth})</th>
    </tr></thead><tbody>${rows}</tbody>
    <tfoot><tr><td>Total</td><td class="num">${fmtRp(s.assigned)}</td>
      <td class="num">${fmtRp(s.spent + s.saved)}</td><td class="num">${fmtRp(s.remaining)}</td><td></td></tr></tfoot></table>
    <p class="hint">* Terpakai termasuk ${fmtRp(s.saved)} yang ditabung ke tujuan. Garis pada bilah kecepatan = harapan pemakaian s.d. hari ini bila belanja merata.</p>
  </section>
  <section class="card">
    <h2>Ke mana uang mengalir <span class="card-sub">pemasukan → kelompok belanja → hasil</span></h2>
    ${sankeyChart(s)}
  </section>`;
}

export function viewTransactions(year, month, filter = {}) {
  const s = monthSummary(year, month);
  const q = (filter.q || '').toLowerCase();
  const cat = filter.category || '';
  let list = s.txns;
  if (cat) list = list.filter((t) => t.category === cat);
  if (q) list = list.filter((t) => t.merchant.toLowerCase().includes(q));
  const nExpense = s.txns.filter((t) => t.type === 'expense' && t.category !== 'tabungan').length;
  const nIncome = s.txns.filter((t) => t.type === 'income').length;
  const nSaved = s.txns.filter((t) => t.type === 'expense' && t.category === 'tabungan').length;
  const rows = list.map((t) => {
    const c = categoryById(t.category);
    const isIncome = t.type === 'income';
    const isTransfer = t.type === 'transfer';
    return `<tr>
      <td>${dateLabel(t.date)}</td>
      <td>${esc(t.merchant)}${t.goalId ? ' <span class="tag">🎯 tujuan</span>' : ''}${isTransfer ? ' <span class="tag">transfer</span>' : ''}</td>
      <td><span class="dot" style="background:${c.color}"></span> ${isIncome ? 'Pemasukan' : c.name}</td>
      <td class="num ${isIncome ? 'pos' : isTransfer ? '' : 'neg'}">${isIncome ? '+' : isTransfer ? '↔ ' : '−'}${fmtRp(t.amount)}</td>
      <td class="row-actions"><button class="btn tiny" data-action="edit-txn" data-id="${t.id}">Ubah</button>
      <button class="btn tiny danger" data-action="delete-txn" data-id="${t.id}">Hapus</button></td>
    </tr>`;
  }).join('');
  return `
  <section class="card">
    <div class="card-head"><h2>Transaksi ${monthLabel(year, month)}</h2>
      <button class="btn primary" data-action="add-txn">+ Tambah transaksi</button></div>
    <div class="txn-summary"><span>Pemasukan <b class="pos">${fmtRp(s.income)}</b></span>
      <span>Pengeluaran <b class="neg">${fmtRp(s.spent)}</b></span>
      <span>Ditabung <b>${fmtRp(s.saved)}</b></span>
      <span>${s.txns.length} transaksi · ${nExpense} pengeluaran, ${nIncome} pemasukan, ${nSaved} ditabung</span></div>
    <div class="filters">
      <input id="txn-search" type="search" placeholder="Cari merchant…" value="${esc(filter.q || '')}" aria-label="Cari transaksi">
      <select id="txn-category" aria-label="Filter kategori">
        <option value="">Semua kategori</option>
        ${categories().map((c) => `<option value="${c.id}" ${c.id === cat ? 'selected' : ''}>${c.name}</option>`).join('')}
        <option value="income" ${cat === 'income' ? 'selected' : ''}>Pemasukan</option>
      </select>
    </div>
    ${list.length === 0
      ? '<p class="empty-ok">Tidak ada transaksi yang cocok. Ubah pencarian atau tambah transaksi baru.</p>'
      : `<table class="txn-table"><thead><tr><th>Tanggal</th><th>Merchant / keterangan</th><th>Kategori</th><th>Jumlah</th><th></th></tr></thead><tbody>${rows}</tbody></table>`}
  </section>`;
}

export function viewBills(year, month) {
  const bills = billStatus(year, month);
  const paid = bills.filter((b) => b.paid);
  const unpaid = bills.filter((b) => !b.paid);
  const totalUnpaid = unpaid.reduce((s, b) => s + b.amount, 0);
  const row = (b) => `<div class="bill-card ${b.paid ? 'paid' : 'due'}">
      <div><b>${b.name}</b><span>Jatuh tempo ${b.dueDay} ${monthLabel(year, month).split(' ')[0]}</span>
      <span>${b.paid ? `Lunas ${b.paidDate ? dateLabel(b.paidDate) : ''}` : 'Belum dibayar'}</span></div>
      <b class="bill-amount">${fmtRp(b.amount)}</b>
      ${b.paid ? '<span class="badge ok">✓ Lunas</span>'
        : `<button class="btn small" data-action="pay-bill" data-bill="${b.id}">Tandai dibayar</button>`}
    </div>`;
  return `
  <section class="bill-summary card">
    <div><span>Tagihan bulan ini</span><b>${bills.length}</b></div>
    <div><span>Sudah lunas</span><b class="pos">${paid.length}</b></div>
    <div><span>Belum dibayar</span><b class="${unpaid.length ? 'neg' : ''}">${unpaid.length} · ${fmtRp(totalUnpaid)}</b></div>
    <div><span>Total tagihan</span><b>${fmtRp(bills.reduce((s, b) => s + b.amount, 0))}</b></div>
  </section>
  <h2 class="section-title">Segera jatuh tempo</h2>
  ${unpaid.length === 0 ? '<p class="empty-ok">Semua tagihan sudah lunas. 🎉</p>' : `<div class="bill-grid">${unpaid.map(row).join('')}</div>`}
  <h2 class="section-title">Sudah lunas</h2>
  <div class="bill-grid">${paid.map(row).join('')}</div>
  <p class="hint">Menandai dibayar akan membuat transaksi nyata di tanggal hari ini — angka anggaran dan grafik ikut berubah.</p>`;
}

export function viewGoals(year, month) {
  const goals = goalProgress(year, month);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  return `
  <section class="card goal-total"><div><span>Total tabungan tujuan</span>
    <b>${fmtRp(totalSaved)}</b><span>dari target ${fmtRp(totalTarget)} (${fmtPct(totalSaved / totalTarget)})</span></div></section>
  <div class="goal-grid">
  ${goals.map((g) => {
    const monthsLeft = g.left > 0 ? Math.ceil(g.left / 750000) : 0;
    return `<section class="card goal-card">
      <h2>${g.name}</h2><p class="goal-note">${g.note}</p>
      <div class="goal-big"><b>${fmtRp(g.saved)}</b><span>dari ${fmtRp(g.target)}</span></div>
      <div class="goal-track big"><div class="goal-fill" style="width:${(g.pct * 100).toFixed(1)}%"></div></div>
      <div class="goal-meta"><span>${fmtPct(g.pct)} tercapai</span><span>Sisa ${fmtRp(g.left)}</span></div>
      <p class="hint">${g.left > 0 ? `Menabung Rp 750.000/bulan mencapai target dalam ±${monthsLeft} bulan.` : 'Target tercapai — selamat!'}</p>
      <button class="btn primary" data-action="add-goal" data-goal="${g.id}">+ Tambah dana</button>
    </section>`;
  }).join('')}
  </div>
  <p class="hint">Dana tujuan dicatat sebagai transaksi kategori Tabungan &amp; Tujuan, jadi anggaran dan tren ikut berubah.</p>`;
}

export function viewDebt() {
  const debts = debtState();
  const d = debts[0];
  const calc = payoffCalc(d, 0);
  return `
  <div class="debt-grid">
    <section class="card">
      <h2>${d.name}</h2>
      <div class="goal-big"><b>${fmtRp(d.balance)}</b><span>sisa saldo</span></div>
      <dl class="debt-facts">
        <div><dt>Bunga</dt><dd>${fmtPct(d.monthlyRate, 2)} / bulan</dd></div>
        <div><dt>Cicilan minimum</dt><dd>${fmtRp(d.minPayment)} / bulan</dd></div>
        <div><dt>Sudah dibayar (dicatat)</dt><dd>${fmtRp(d.paidTotal)}</dd></div>
        <div><dt>Lunas dgn cicilan minimum</dt><dd>${calc.baseMonths === Infinity ? 'tidak pernah (bunga ≥ cicilan)' : `${calc.baseMonths} bulan · bunga ${fmtRp(calc.baseInterest)}`}</dd></div>
      </dl>
      <p class="hint">Pembayaran kartu kredit adalah transfer, bukan belanja — belanjanya sudah tercatat saat kartu digesek. Catat pembayaran di bawah agar saldo berkurang.</p>
      <button class="btn" data-action="pay-debt" data-debt="${d.id}">Catat pembayaran</button>
    </section>
    <section class="card">
      <h2>Kalkulator pelunasan <span class="card-sub">geser tambahan bayar / bulan</span></h2>
      <label class="slider-label" for="debt-extra">Tambahan bayar: <b id="debt-extra-val">${fmtRp(0)}</b> / bulan</label>
      <input type="range" id="debt-extra" min="0" max="1000000" step="25000" value="0">
      <div class="calc-results" id="calc-results">
        ${calcHtml(d, 0)}
      </div>
      <p class="hint">Perhitungan: bunga ${fmtPct(d.monthlyRate, 2)}/bulan atas sisa saldo, cicilan tetap tiap bulan. Makin besar tambahan bayar, makin sedikit bunga yang dibayar.</p>
    </section>
  </div>`;
}

export function calcHtml(debt, extra) {
  const c = payoffCalc(debt, extra);
  if (c.months === Infinity) {
    return `<div class="calc-row"><span>Lunas dalam</span><b>tidak pernah</b></div>
      <p class="hint">Cicilan lebih kecil dari bunga bulanan — saldo tidak berkurang. Naikkan pembayaran.</p>`;
  }
  return `<div class="calc-row"><span>Lunas dalam</span><b>${c.months} bulan</b></div>
    <div class="calc-row"><span>Total bunga dibayar</span><b>${fmtRp(c.totalInterest)}</b></div>
    ${extra > 0 ? `<div class="calc-row good"><span>Lebih cepat</span><b>${c.monthsSaved} bulan</b></div>
    <div class="calc-row good"><span>Bunga dihemat</span><b>${fmtRp(c.interestSaved)}</b></div>` : ''}`;
}

export { clamp };
