// app.js — Boot + router hash + semua event global SakuRumah.
// Satu-satunya file yang menyentuh DOM di luar views.js.
import { CURRENT, MONTHS, monthKey } from './data.js';
import { fmtRp, monthLabel, esc, dateToDisplay, dateFromDisplay } from './format.js';
import {
  store, monthSummary, planFor, setPlan, transactionsOf,
  addTransaction, updateTransaction, deleteTransaction,
  billStatus, debtState, payoffCalc, categoryById,
} from './state.js';
import {
  viewDashboard, viewPlan, viewTransactions, viewBills, viewGoals, viewDebt, calcHtml,
} from './views.js';
import { applyShot } from './shots.js';

const params = new URLSearchParams(location.search);
const shotMode = params.get('shot');
if (shotMode) {
  // Screenshot deterministik: selalu data demo segar, abaikan localStorage.
  store.reset();
} else {
  store.load();
}

const ROUTES = ['dashboard', 'anggaran', 'transaksi', 'tagihan', 'tujuan', 'utang'];
const NAV_LABELS = {
  dashboard: 'Dasbor', anggaran: 'Anggaran', transaksi: 'Transaksi',
  tagihan: 'Tagihan', tujuan: 'Tujuan', utang: 'Utang',
};

const app = {
  year: CURRENT.year,
  month: CURRENT.month,
  route: 'dashboard',
  txnFilter: { q: '', category: '' },
  modalTxnId: null,
  modalGoalId: null,
  modalMode: null, // 'txn' | 'plan' | 'debt'
  modalCategory: null,
  debtExtra: 0,

  go(route) {
    if (!ROUTES.includes(route)) route = 'dashboard';
    this.route = route;
    this.render();
  },

  monthKey() { return monthKey(this.year, this.month); },

  shiftMonth(delta) {
    const idx = MONTHS.findIndex((m) => m.year === this.year && m.month === this.month);
    const next = MONTHS[idx + delta];
    if (!next) return;
    this.year = next.year;
    this.month = next.month;
    this.render();
  },

  render() {
    const s = monthSummary(this.year, this.month);
    document.getElementById('month-label').textContent = monthLabel(this.year, this.month);
    const prev = document.getElementById('month-prev');
    const next = document.getElementById('month-next');
    const idx = MONTHS.findIndex((m) => m.year === this.year && m.month === this.month);
    prev.disabled = idx <= 0;
    next.disabled = idx >= MONTHS.length - 1;
    document.getElementById('rta-badge').innerHTML =
      `Siap Dialokasikan <b>${fmtRp(s.readyToAssign)}</b>`;
    document.getElementById('rta-badge').classList.toggle('zero', s.readyToAssign === 0);
    document.querySelectorAll('.nav-link').forEach((a) => {
      a.classList.toggle('active', a.dataset.route === this.route);
    });
    const view = document.getElementById('view');
    if (this.route === 'dashboard') view.innerHTML = viewDashboard(this.year, this.month);
    else if (this.route === 'anggaran') view.innerHTML = viewPlan(this.year, this.month);
    else if (this.route === 'transaksi') view.innerHTML = viewTransactions(this.year, this.month, this.txnFilter);
    else if (this.route === 'tagihan') view.innerHTML = viewBills(this.year, this.month);
    else if (this.route === 'tujuan') view.innerHTML = viewGoals(this.year, this.month);
    else if (this.route === 'utang') view.innerHTML = viewDebt();
    // Kembalikan fokus pencarian transaksi bila sedang mengetik.
    if (this.route === 'transaksi' && this.txnFilter.q) {
      const input = document.getElementById('txn-search');
      if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    }
    document.title = `SakuRumah — ${NAV_LABELS[this.route]} · ${monthLabel(this.year, this.month)}`;
  },

  // --- Modal transaksi ---
  openTxnModal(id, preset = {}) {
    this.modalMode = 'txn';
    this.modalTxnId = id || null;
    this.modalGoalId = preset.goalId || null;
    const txn = id ? transactionsOf(this.year, this.month).find((t) => t.id === id) : null;
    const isIncome = preset.type === 'income' || (txn && txn.type === 'income');
    document.getElementById('modal-title').textContent = txn ? 'Ubah transaksi' : 'Tambah transaksi';
    document.getElementById('f-merchant').value = txn ? txn.merchant : (preset.merchant || '');
    document.getElementById('f-amount').value = txn ? txn.amount : (preset.amount || '');
    document.getElementById('f-date').value = txn ? dateToDisplay(txn.date) : dateToDisplay(`${this.monthKey()}-${String(CURRENT.today).padStart(2, '0')}`);
    const typeSel = document.getElementById('f-type');
    typeSel.value = txn ? txn.type : (preset.type || 'expense');
    const catSel = document.getElementById('f-category');
    catSel.value = txn ? txn.category : (preset.category || 'belanja');
    catSel.disabled = isIncome;
    document.getElementById('f-goal').value = this.modalGoalId || '';
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('f-merchant').focus();
  },

  openPlanModal(categoryId) {
    this.modalMode = 'plan';
    this.modalCategory = categoryId;
    const c = categoryById(categoryId);
    const plan = planFor(this.year, this.month);
    document.getElementById('modal-title').textContent = `Anggaran — ${c.name}`;
    document.getElementById('f-merchant').value = c.name;
    document.getElementById('f-merchant').disabled = true;
    document.getElementById('f-amount').value = plan[categoryId];
    document.getElementById('f-date').value = dateToDisplay(`${this.monthKey()}-${String(CURRENT.today).padStart(2, '0')}`);
    document.getElementById('f-type').value = 'expense';
    document.getElementById('f-category').value = categoryId;
    document.getElementById('f-category').disabled = true;
    document.getElementById('f-goal').value = '';
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('f-amount').focus();
    document.getElementById('f-amount').select();
  },

  openDebtModal(debtId) {
    this.modalMode = 'debt';
    this.modalCategory = debtId;
    const d = debtState().find((x) => x.id === debtId);
    document.getElementById('modal-title').textContent = `Bayar — ${d.name}`;
    document.getElementById('f-merchant').value = `Bayar ${d.name}`;
    document.getElementById('f-merchant').disabled = false;
    document.getElementById('f-amount').value = d.minPayment;
    document.getElementById('f-date').value = dateToDisplay(`${this.monthKey()}-${String(CURRENT.today).padStart(2, '0')}`);
    document.getElementById('f-type').value = 'transfer';
    document.getElementById('f-category').value = 'cicilan';
    document.getElementById('f-category').disabled = true;
    document.getElementById('f-goal').value = '';
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('f-amount').focus();
    document.getElementById('f-amount').select();
  },

  closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('f-merchant').disabled = false;
    document.getElementById('f-category').disabled = false;
    this.modalMode = null;
    this.modalTxnId = null;
    this.modalGoalId = null;
  },

  saveModal() {
    const amount = Number(document.getElementById('f-amount').value);
    if (!amount || amount <= 0) {
      toast('Masukkan jumlah yang valid (lebih dari 0).');
      return;
    }
    const todayIso = `${this.monthKey()}-${String(CURRENT.today).padStart(2, '0')}`;
    const date = dateFromDisplay(document.getElementById('f-date').value, todayIso);
    if (this.modalMode === 'plan') {
      setPlan(this.year, this.month, this.modalCategory, amount);
      toast(`Anggaran ${categoryById(this.modalCategory).name} diubah menjadi ${fmtRp(amount)}.`);
    } else if (this.modalMode === 'debt') {
      const merchant = document.getElementById('f-merchant').value.trim() || 'Bayar Kartu Kredit';
      addTransaction(this.year, this.month, {
        merchant, category: 'cicilan', amount, type: 'transfer',
        date, debtId: this.modalCategory,
      });
      toast(`Pembayaran ${fmtRp(amount)} dicatat, saldo utang berkurang.`);
    } else {
      const data = {
        merchant: document.getElementById('f-merchant').value,
        amount,
        type: document.getElementById('f-type').value,
        category: document.getElementById('f-type').value === 'income' ? 'income' : document.getElementById('f-category').value,
        date,
        goalId: document.getElementById('f-goal').value || undefined,
      };
      if (data.goalId) data.category = 'tabungan';
      if (this.modalTxnId) {
        updateTransaction(this.year, this.month, this.modalTxnId, data);
        toast('Transaksi diperbarui.');
      } else {
        addTransaction(this.year, this.month, data);
        toast('Transaksi ditambahkan.');
      }
    }
    this.closeModal();
    this.render();
  },

  toast,
};

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), 2600);
}

// --- Router hash ---
function routeFromHash() {
  const h = (location.hash || '#/dashboard').replace(/^#\/?/, '');
  return h.split('/')[0] || 'dashboard';
}
window.addEventListener('hashchange', () => app.go(routeFromHash()));

// --- Delegasi klik global ---
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'add-txn') app.openTxnModal(null);
  else if (action === 'edit-txn') app.openTxnModal(el.dataset.id);
  else if (action === 'delete-txn') {
    const txn = transactionsOf(app.year, app.month).find((t) => t.id === el.dataset.id);
    if (txn && deleteTransaction(app.year, app.month, el.dataset.id)) {
      toast(`Transaksi "${txn.merchant}" dihapus.`);
      app.render();
    }
  } else if (action === 'pay-bill') {
    const b = billStatus(app.year, app.month).find((x) => x.id === el.dataset.bill);
    if (!b) return;
    addTransaction(app.year, app.month, {
      merchant: b.merchant, category: b.category, amount: b.amount, type: 'expense',
    });
    toast(`${b.name} ${fmtRp(b.amount)} ditandai lunas.`);
    app.render();
  } else if (action === 'edit-plan') app.openPlanModal(el.dataset.category);
  else if (action === 'add-goal') {
    const goalName = { darurat: 'Dana Darurat', liburan: 'Liburan Keluarga', pendidikan: 'Dana Pendidikan' }[el.dataset.goal];
    app.openTxnModal(null, { category: 'tabungan', merchant: goalName, goalId: el.dataset.goal });
  } else if (action === 'pay-debt') app.openDebtModal(el.dataset.debt);
});

// --- Form & filter ---
document.getElementById('modal-form').addEventListener('submit', (ev) => {
  ev.preventDefault();
  app.saveModal();
});
document.getElementById('modal-close').addEventListener('click', () => app.closeModal());
document.getElementById('modal-cancel').addEventListener('click', () => app.closeModal());
document.getElementById('modal').addEventListener('click', (ev) => {
  if (ev.target.id === 'modal') app.closeModal();
});
document.getElementById('f-type').addEventListener('change', (ev) => {
  document.getElementById('f-category').disabled = ev.target.value === 'income';
});
document.addEventListener('input', (ev) => {
  if (ev.target.id === 'txn-search') {
    app.txnFilter.q = ev.target.value;
    // Render ulang daftar saja, tanpa memindahkan fokus.
    const s = monthSummary(app.year, app.month);
    const view = document.getElementById('view');
    const keep = document.getElementById('txn-search');
    view.innerHTML = viewTransactions(app.year, app.month, app.txnFilter);
    const input = document.getElementById('txn-search');
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    void keep; void s;
  }
  if (ev.target.id === 'txn-category') {
    app.txnFilter.category = ev.target.value;
    app.render();
  }
  if (ev.target.id === 'debt-extra') {
    const extra = Number(ev.target.value);
    app.debtExtra = extra;
    document.getElementById('debt-extra-val').textContent = fmtRp(extra);
    const d = debtState()[0];
    document.getElementById('calc-results').innerHTML = calcHtml(d, extra);
  }
});
document.getElementById('month-prev').addEventListener('click', () => app.shiftMonth(-1));
document.getElementById('month-next').addEventListener('click', () => app.shiftMonth(1));
document.getElementById('reset-demo').addEventListener('click', (ev) => {
  const btn = ev.currentTarget;
  if (btn.dataset.armed) {
    store.reset();
    app.txnFilter = { q: '', category: '' };
    app.render();
    toast('Data demo dipulihkan.');
    delete btn.dataset.armed;
    btn.textContent = 'Reset ke demo';
  } else {
    btn.dataset.armed = '1';
    btn.textContent = 'Klik lagi untuk reset';
    setTimeout(() => {
      if (btn.dataset.armed) { delete btn.dataset.armed; btn.textContent = 'Reset ke demo'; }
    }, 3000);
  }
});

// Boot.
app.go(routeFromHash());
if (shotMode) applyShot(app, shotMode);

// Hook untuk check.mjs: angka-angka kunci + aksi terprogram.
window.__app = {
  state() {
    const s = monthSummary(app.year, app.month);
    return {
      route: app.route, year: app.year, month: app.month,
      income: s.income, spent: s.spent, saved: s.saved,
      assigned: s.assigned, readyToAssign: s.readyToAssign, remaining: s.remaining,
      txnCount: s.txns.length,
      byCat: Object.fromEntries(Object.entries(s.byCat).map(([k, v]) => [k, v.spent])),
    };
  },
  addDemoTxn() {
    return addTransaction(app.year, app.month, {
      merchant: 'Uji Tambah', category: 'belanja', amount: 50000, type: 'expense',
    });
  },
  render: () => app.render(),
};
