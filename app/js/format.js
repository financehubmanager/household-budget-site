// format.js — Format angka & tanggal (id-ID), tanpa library.
export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function fmtRp(n) {
  const v = Math.round(n || 0);
  const sign = v < 0 ? '-' : '';
  return `${sign}Rp ${Math.abs(v).toLocaleString('id-ID')}`;
}

export function fmtRpShort(n) {
  const v = Math.abs(n || 0);
  const sign = n < 0 ? '-' : '';
  if (v >= 1000000) return `${sign}Rp ${(v / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (v >= 1000) return `${sign}Rp ${Math.round(v / 1000)} rb`;
  return fmtRp(n);
}

export function fmtPct(n, digits = 0) {
  return `${(n * 100).toFixed(digits)}%`;
}

export function monthLabel(year, month) {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function monthShort(year, month) {
  return `${MONTH_SHORT[month - 1]} ${String(year).slice(2)}`;
}

export function dateLabel(iso) {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTH_SHORT[m - 1]}`;
}

// Tanggal ala Indonesia untuk form: tampil "26/11/2026", simpan ISO.
export function dateToDisplay(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function dateFromDisplay(str, fallbackIso) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((str || '').trim());
  if (!match) return fallbackIso;
  const d = Number(match[1]);
  const mo = Number(match[2]);
  const y = Number(match[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return fallbackIso;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
