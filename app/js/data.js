// data.js — Dataset demo Lumbung: Keluarga Wijaya, Semarang.
// Semua angka ditulis di sini (bukan diambil dari mana pun): transaksi bulan
// berjalan (November 2026) ditulis eksplisit per transaksi agar total tiap
// kategori tepat seperti BRIEF.md; 11 bulan sebelumnya dibangkitkan dari RNG
// berseed agar deterministik. Tidak ada network, tidak ada fetch.

export const CURRENT = { year: 2026, month: 11, today: 26, daysInMonth: 30 };
export const MONTHS = [
  { year: 2025, month: 12 }, { year: 2026, month: 1 }, { year: 2026, month: 2 },
  { year: 2026, month: 3 }, { year: 2026, month: 4 }, { year: 2026, month: 5 },
  { year: 2026, month: 6 }, { year: 2026, month: 7 }, { year: 2026, month: 8 },
  { year: 2026, month: 9 }, { year: 2026, month: 10 }, { year: 2026, month: 11 },
];

// Kategori anggaran zero-based. plan = jumlah yang dialokasikan tiap bulan.
// Total plan = Rp 12.500.000 = pemasukan bulanan -> Ready to Assign Rp 0.
export const CATEGORIES = [
  { id: 'belanja',    name: 'Belanja Harian',    short: 'Belanja',    icon: '🛒', color: '#2E7D32', plan: 2800000 },
  { id: 'makan',      name: 'Makan di Luar',     short: 'Makan Luar', icon: '🍜', color: '#C2410C', plan: 900000 },
  { id: 'transport',  name: 'Transportasi',      short: 'Transport',  icon: '🛵', color: '#1565C0', plan: 1100000 },
  { id: 'tagihan',    name: 'Tagihan Rumah',     short: 'Tagihan',    icon: '💡', color: '#F9A825', plan: 1650000 },
  { id: 'sekolah',    name: 'Sekolah Anak',      short: 'Sekolah',    icon: '🎒', color: '#6A1B9A', plan: 1200000 },
  { id: 'kesehatan',  name: 'Kesehatan',        short: 'Kesehatan',  icon: '💊', color: '#00838F', plan: 400000 },
  { id: 'hiburan',    name: 'Hiburan',           short: 'Hiburan',    icon: '🎬', color: '#AD1457', plan: 500000 },
  { id: 'pakaian',    name: 'Pakaian',           short: 'Pakaian',    icon: '👕', color: '#5D4037', plan: 350000 },
  { id: 'cicilan',    name: 'Cicilan Motor',     short: 'Cicilan',    icon: '🏍️', color: '#37474F', plan: 850000 },
  { id: 'tabungan',   name: 'Tabungan & Tujuan', short: 'Tabungan',   icon: '🎯', color: '#16294A', plan: 1750000 },
  { id: 'cadangan',   name: 'Dana Cadangan',     short: 'Cadangan',   icon: '🛟', color: '#78909C', plan: 1000000 },
];

export const INCOME_MONTHLY = 12500000;

// Tagihan bulanan: name = merchant transaksi yang menandainya lunas.
export const BILLS = [
  { id: 'spp-andi',   name: 'SPP Andi',          merchant: 'SPP Andi',            category: 'sekolah',   amount: 450000, dueDay: 1 },
  { id: 'spp-sinta',  name: 'SPP Sinta',         merchant: 'SPP Sinta',           category: 'sekolah',   amount: 450000, dueDay: 1 },
  { id: 'hp-budi',    name: 'Pulsa HP Budi',     merchant: 'Pulsa HP Budi',       category: 'tagihan',   amount: 150000, dueDay: 5 },
  { id: 'hp-sari',    name: 'Pulsa HP Sari',     merchant: 'Pulsa HP Sari',       category: 'tagihan',   amount: 150000, dueDay: 5 },
  { id: 'les',        name: 'Les Matematika',    merchant: 'Les Matematika Andi', category: 'sekolah',   amount: 180000, dueDay: 7 },
  { id: 'pln',        name: 'Listrik PLN',       merchant: 'Listrik PLN',         category: 'tagihan',   amount: 550000, dueDay: 20 },
  { id: 'pdam',       name: 'Air PDAM',          merchant: 'Air PDAM',            category: 'tagihan',   amount: 200000, dueDay: 10 },
  { id: 'internet',   name: 'Internet IndiHome', merchant: 'Internet IndiHome',   category: 'tagihan',   amount: 350000, dueDay: 15 },
  { id: 'cicilan',    name: 'Cicilan Motor',     merchant: 'Cicilan Motor',       category: 'cicilan',   amount: 850000, dueDay: 10 },
  { id: 'streaming',  name: 'Streaming',         merchant: 'Streaming',           category: 'tagihan',   amount: 200000, dueDay: 28 },
  { id: 'iuran',      name: 'Iuran RT',          merchant: 'Iuran RT',            category: 'tagihan',   amount: 50000,  dueDay: 30 },
];

// Tujuan menabung. saved = baseSaved + kontribusi bulan berjalan (transaksi
// ber-goalId di bulan ini). Kontribusi bulan lalu sudah masuk ke baseSaved.
export const GOALS = [
  { id: 'darurat',    name: 'Dana Darurat',      target: 30000000, baseSaved: 18000000, note: '6× pengeluaran bulanan' },
  { id: 'liburan',    name: 'Liburan Keluarga',  target: 8000000,  baseSaved: 2700000,  note: 'Yogyakarta, 4 hari' },
  { id: 'pendidikan', name: 'Dana Pendidikan',   target: 25000000, baseSaved: 8900000,  note: 'Biaya masuk SMP Andi' },
];

// Utang berbunga yang dihitung kalkulator pelunasan.
export const DEBTS = [
  { id: 'kartu-kredit', name: 'Kartu Kredit', balance: 4750000, monthlyRate: 0.0225, minPayment: 475000 },
];

// --- RNG berseed (mulberry32): bulan-bulan lama deterministik. ---
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad2 = (n) => String(n).padStart(2, '0');
export const monthKey = (y, m) => `${y}-${pad2(m)}`;
export const dateStr = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

// Transaksi bulan berjalan — ditulis eksplisit, total per kategori:
// belanja 2.315.000 | makan 945.000 | transport 862.000 | tagihan 1.400.000
// (streaming 200.000 + iuran 50.000 belum dibayar) | sekolah 1.200.000 |
// kesehatan 185.000 | hiburan 420.000 | pakaian 210.000 | cicilan 850.000 |
// tabungan 1.750.000. Pengeluaran 8.387.000, ditabung 1.750.000,
// sisa 2.363.000.
function novemberTransactions() {
  const t = [];
  let n = 0;
  const add = (day, merchant, category, amount, extra = {}) => {
    n += 1;
    t.push({ id: `nov-${n}`, date: dateStr(2026, 11, day), merchant, category, amount, type: 'expense', ...extra });
  };
  add(24, 'Gaji Budi', 'income', 8500000, { type: 'income' });
  add(25, 'Gaji Sari', 'income', 4000000, { type: 'income' });
  // Belanja Harian — 2.315.000
  add(1, 'Pasar Johar', 'belanja', 385000);
  add(4, 'Indomaret', 'belanja', 142000);
  add(7, 'Pasar Johar', 'belanja', 420000);
  add(9, 'Alfamart', 'belanja', 98500);
  add(12, 'Super Indo', 'belanja', 356000);
  add(15, 'Pasar Johar', 'belanja', 398000);
  add(18, 'Indomaret', 'belanja', 121500);
  add(21, 'Super Indo', 'belanja', 289000);
  add(24, 'Pasar Johar', 'belanja', 105000);
  // Makan di Luar — 945.000 (over Rp 45.000 dari anggaran)
  add(2, 'GoFood', 'makan', 68000);
  add(6, 'Warung Sate Pak Slamet', 'makan', 125000);
  add(10, 'GoFood', 'makan', 84500);
  add(13, 'Mie Ayam Pakde', 'makan', 42000);
  add(16, 'Restoran Keluarga', 'makan', 310000);
  add(20, 'GoFood', 'makan', 96500);
  add(23, 'Kopi & Roti', 'makan', 58000);
  add(25, 'Bakso & Mie Ayam', 'makan', 161000);
  // Transportasi — 862.000
  add(3, 'Pertamina', 'transport', 250000);
  add(8, 'Tol Semarang', 'transport', 45000);
  add(10, 'Pertamina', 'transport', 200000);
  add(14, 'Parkir & Ojek', 'transport', 62000);
  add(17, 'Pertamina', 'transport', 180000);
  add(22, 'Tol & Parkir', 'transport', 75000);
  add(25, 'Pertamina', 'transport', 50000);
  // Tagihan Rumah — 1.400.000 lunas (streaming + iuran belum)
  add(1, 'SPP Andi', 'sekolah', 450000);
  add(1, 'SPP Sinta', 'sekolah', 450000);
  add(5, 'Listrik PLN', 'tagihan', 550000);
  add(5, 'Pulsa HP Budi', 'tagihan', 150000);
  add(5, 'Pulsa HP Sari', 'tagihan', 150000);
  add(7, 'Les Matematika Andi', 'sekolah', 180000);
  add(10, 'Air PDAM', 'tagihan', 200000);
  add(10, 'Cicilan Motor', 'cicilan', 850000);
  add(14, 'Les Bahasa Sinta', 'sekolah', 120000);
  add(15, 'Internet IndiHome', 'tagihan', 350000);
  // Kesehatan — 185.000
  add(9, 'Apotek Sehat', 'kesehatan', 85000);
  add(19, 'Puskesmas Manyaran', 'kesehatan', 100000);
  // Hiburan — 420.000
  add(8, 'Bioskop', 'hiburan', 160000);
  add(15, 'Mainan Anak', 'hiburan', 130000);
  add(22, 'Bioskop & Popcorn', 'hiburan', 130000);
  // Pakaian — 210.000
  add(11, 'Seragam Sekolah', 'pakaian', 145000);
  add(18, 'Kaos Kaki & Pakaian Dalam', 'pakaian', 65000);
  // Tabungan & Tujuan — 1.750.000 (kontribusi ke tujuan)
  add(25, 'Dana Darurat', 'tabungan', 750000, { goalId: 'darurat' });
  add(25, 'Liburan Keluarga', 'tabungan', 500000, { goalId: 'liburan' });
  add(25, 'Dana Pendidikan', 'tabungan', 500000, { goalId: 'pendidikan' });
  return t;
}

// Bulan-bulan lama: tagihan tetap (merchant + jumlah sama tiap bulan),
// belanja variabel mengikuti pola kategori, gaji 24/25 tiap bulan,
// THR Rp 1.500.000 di Maret 2026.
const VARIABLE_SPEND = [
  { category: 'belanja', merchants: ['Pasar Johar', 'Super Indo', 'Indomaret', 'Alfamart'], min: 90000, max: 430000, count: [7, 10] },
  { category: 'makan', merchants: ['GoFood', 'Warung Sate Pak Slamet', 'Mie Ayam Pakde', 'Bakso & Mie Ayam'], min: 40000, max: 320000, count: [6, 9] },
  { category: 'transport', merchants: ['Pertamina', 'Tol Semarang', 'Parkir & Ojek'], min: 45000, max: 260000, count: [5, 8] },
  { category: 'kesehatan', merchants: ['Apotek Sehat', 'Puskesmas Manyaran'], min: 50000, max: 180000, count: [1, 3] },
  { category: 'hiburan', merchants: ['Bioskop', 'Mainan Anak', 'Bioskop & Popcorn'], min: 90000, max: 220000, count: [2, 4] },
  { category: 'pakaian', merchants: ['Seragam Sekolah', 'Toko Pakaian'], min: 60000, max: 280000, count: [1, 3] },
  { category: 'tabungan', merchants: ['Dana Darurat', 'Liburan Keluarga', 'Dana Pendidikan'], min: 400000, max: 750000, count: [2, 3] },
];

function generatedMonth(year, month, seed) {
  const rnd = mulberry32(seed);
  const t = [];
  let n = 0;
  const add = (day, merchant, category, amount, type = 'expense', extra = {}) => {
    n += 1;
    t.push({ id: `gen-${year}-${pad2(month)}-${n}`, date: dateStr(year, month, day), merchant, category, amount, type, ...extra });
  };
  add(24, 'Gaji Budi', 'income', 8500000, 'income');
  add(25, 'Gaji Sari', 'income', 4000000, 'income');
  if (year === 2026 && month === 3) add(15, 'THR Lebaran', 'income', 1500000, 'income');
  // Tagihan tetap tiap bulan (jatuh tempo = dueDay tagihan).
  for (const b of BILLS) {
    if (b.id === 'streaming' || b.id === 'iuran') continue; // kadang telat di bulan lama
    add(b.dueDay, b.merchant, b.category, b.amount);
  }
  add(15, 'Streaming', 'tagihan', 200000);
  add(28, 'Iuran RT', 'tagihan', 50000);
  for (const spec of VARIABLE_SPEND) {
    const count = spec.count[0] + Math.floor(rnd() * (spec.count[1] - spec.count[0] + 1));
    for (let i = 0; i < count; i += 1) {
      const day = 1 + Math.floor(rnd() * 26);
      const merchant = spec.merchants[Math.floor(rnd() * spec.merchants.length)];
      const amount = Math.round((spec.min + rnd() * (spec.max - spec.min)) / 500) * 500;
      const extra = spec.category === 'tabungan'
        ? { goalId: ['darurat', 'liburan', 'pendidikan'][Math.floor(rnd() * 3)] }
        : {};
      add(day, merchant, spec.category, amount, 'expense', extra);
    }
  }
  return t;
}

// Seluruh dataset demo: { '2025-12': [...], ..., '2026-11': [...] }
export function buildDemoData() {
  const months = {};
  for (const { year, month } of MONTHS) {
    if (year === 2026 && month === 11) months[monthKey(year, month)] = novemberTransactions();
    else months[monthKey(year, month)] = generatedMonth(year, month, year * 100 + month);
  }
  return months;
}
