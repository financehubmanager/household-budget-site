// state.js — Satu-satunya sumber kebenaran angka. Semua panel (KPI, donut,
// rencana, tren, tagihan, tujuan) menghitung dari fungsi di sini, jadi angka
// tidak pernah berbeda antar panel. Data demo dari data.js; perubahan user
// disimpan di localStorage dan bisa direset ke demo.
import { CATEGORIES, BILLS, GOALS, DEBTS, CURRENT, buildDemoData, monthKey } from './data.js';

const STORE_KEY = 'sakurumah-v1';

export const store = {
  months: buildDemoData(),
  plans: {}, // key bulan -> { categoryId: assigned } (default = plan kategori)
  debtPayments: [], // { debtId, date, amount } — pembayaran transfer, bukan belanja
  reset() {
    this.months = buildDemoData();
    this.plans = {};
    this.debtPayments = [];
    this.save();
  },
  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!saved || !saved.months) return false;
      this.months = saved.months;
      this.plans = saved.plans || {};
      this.debtPayments = saved.debtPayments || [];
      return true;
    } catch {
      return false;
    }
  },
  save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        months: this.months, plans: this.plans, debtPayments: this.debtPayments,
      }));
    } catch { /* penyimpanan penuh / privat: tetap jalan di memori */ }
  },
};

export function categories() {
  return CATEGORIES;
}

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || { id, name: id, icon: '•', color: '#78909C', plan: 0 };
}

export function planFor(year, month) {
  const key = monthKey(year, month);
  const out = {};
  for (const c of CATEGORIES) out[c.id] = (store.plans[key] && store.plans[key][c.id] != null)
    ? store.plans[key][c.id] : c.plan;
  return out;
}

export function setPlan(year, month, categoryId, amount) {
  const key = monthKey(year, month);
  if (!store.plans[key]) store.plans[key] = {};
  store.plans[key][categoryId] = Math.max(0, Math.round(amount || 0));
  store.save();
}

export function transactionsOf(year, month) {
  const list = store.months[monthKey(year, month)] || [];
  return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function isTabungan(c) { return c === 'tabungan'; }

// Ringkasan satu bulan: semua angka turunan dari transaksi + rencana.
export function monthSummary(year, month) {
  const plan = planFor(year, month);
  const txns = transactionsOf(year, month);
  const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const assigned = Object.values(plan).reduce((s, v) => s + v, 0);
  const byCat = {};
  for (const c of CATEGORIES) byCat[c.id] = { assigned: plan[c.id], spent: 0, count: 0 };
  let spent = 0; // belanja nyata (di luar tabungan & transfer)
  let saved = 0; // kontribusi ke tujuan (kategori tabungan)
  for (const t of txns) {
    if (t.type !== 'expense') continue;
    if (!byCat[t.category]) continue;
    byCat[t.category].spent += t.amount;
    byCat[t.category].count += 1;
    if (isTabungan(t.category)) saved += t.amount;
    else spent += t.amount;
  }
  const available = {};
  for (const c of CATEGORIES) available[c.id] = byCat[c.id].assigned - byCat[c.id].spent;
  const readyToAssign = income - assigned;
  const remaining = income - spent - saved; // sama dengan jumlah available
  return {
    year, month, income, assigned, spent, saved, readyToAssign, remaining,
    byCat, available, txns,
    savingsRate: income > 0 ? (income - spent) / income : 0,
  };
}

// Tren 12 bulan untuk grafik: pemasukan, pengeluaran, ditabung per bulan.
export function trend12() {
  const now = monthKey(CURRENT.year, CURRENT.month);
  const keys = Object.keys(store.months).sort();
  return keys.map((k) => {
    const [y, m] = k.split('-').map(Number);
    const s = monthSummary(y, m);
    return { key: k, year: y, month: m, income: s.income, spent: s.spent, saved: s.saved, current: k === now };
  });
}

// Status tagihan bulan ini: lunas bila ada transaksi merchant yang sama.
export function billStatus(year, month) {
  const txns = transactionsOf(year, month);
  return BILLS.map((b) => {
    const paidTxn = txns.find((t) => t.type === 'expense' && t.merchant === b.merchant && t.amount === b.amount);
    return { ...b, paid: Boolean(paidTxn), paidDate: paidTxn ? paidTxn.date : null };
  });
}

export function upcomingBills(year, month) {
  return billStatus(year, month).filter((b) => !b.paid);
}

// Progres tujuan: baseSaved + kontribusi bulan berjalan.
export function goalProgress(year, month) {
  const txns = transactionsOf(year, month);
  return GOALS.map((g) => {
    const added = txns.filter((t) => t.goalId === g.id).reduce((s, t) => s + t.amount, 0);
    const saved = g.baseSaved + added;
    return { ...g, saved, added, pct: g.target > 0 ? saved / g.target : 0, left: Math.max(0, g.target - saved) };
  });
}

// Saldo utang setelah pembayaran transfer yang dicatat.
export function debtState() {
  return DEBTS.map((d) => {
    const paid = store.debtPayments.filter((p) => p.debtId === d.id).reduce((s, p) => s + p.amount, 0);
    return { ...d, balance: Math.max(0, d.balance - paid), paidTotal: paid };
  });
}

// Kalkulator pelunasan: cicilan tetap tiap bulan, bunga bulanan atas sisa.
// Mengembalikan { months, totalInterest, monthsSaved, interestSaved }.
export function payoffCalc(debt, extraMonthly) {
  const pay = Math.max(0, debt.minPayment + (extraMonthly || 0));
  if (pay <= 0) return { months: Infinity, totalInterest: 0, monthsSaved: 0, interestSaved: 0 };
  const simulate = (monthly) => {
    let balance = debt.balance;
    let interest = 0;
    let months = 0;
    while (balance > 0 && months < 600) {
      const interestThis = balance * debt.monthlyRate;
      interest += interestThis;
      balance += interestThis;
      const payThis = Math.min(monthly, balance);
      balance -= payThis;
      months += 1;
      if (monthly <= interestThis && months > 1 && balance >= debt.balance) return { months: Infinity, totalInterest: Infinity };
    }
    return { months, totalInterest: Math.round(interest) };
  };
  const base = simulate(debt.minPayment);
  const fast = simulate(pay);
  return {
    months: fast.months,
    totalInterest: fast.totalInterest,
    monthsSaved: base.months === Infinity ? 0 : base.months - fast.months,
    interestSaved: base.totalInterest === Infinity ? 0 : base.totalInterest - fast.totalInterest,
    baseMonths: base.months,
    baseInterest: base.totalInterest,
  };
}

// --- CRUD transaksi (semua perubahan lewat sini, lalu save + render ulang) ---
let uidCounter = 1000;
export function addTransaction(year, month, { merchant, category, amount, type = 'expense', date, goalId, debtId }) {
  uidCounter += 1;
  const key = monthKey(year, month);
  const txn = {
    id: `user-${Date.now()}-${uidCounter}`,
    date: date || `${key}-${String(CURRENT.today).padStart(2, '0')}`,
    merchant: (merchant || '').trim() || 'Tanpa nama',
    category, amount: Math.round(Math.abs(amount || 0)), type,
  };
  if (goalId) txn.goalId = goalId;
  if (debtId) txn.debtId = debtId;
  if (!store.months[key]) store.months[key] = [];
  store.months[key].push(txn);
  if (type === 'transfer' && debtId) {
    store.debtPayments.push({ debtId, date: txn.date, amount: txn.amount });
  }
  store.save();
  return txn;
}

export function updateTransaction(year, month, id, patch) {
  const list = store.months[monthKey(year, month)] || [];
  const txn = list.find((t) => t.id === id);
  if (!txn) return false;
  Object.assign(txn, patch);
  store.save();
  return true;
}

export function deleteTransaction(year, month, id) {
  const key = monthKey(year, month);
  const list = store.months[key] || [];
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  const [removed] = list.splice(idx, 1);
  if (removed.type === 'transfer' && removed.debtId) {
    const p = store.debtPayments.findIndex((x) => x.debtId === removed.debtId && x.amount === removed.amount && x.date === removed.date);
    if (p !== -1) store.debtPayments.splice(p, 1);
  }
  store.save();
  return true;
}
