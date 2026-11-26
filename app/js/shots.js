// shots.js — Keadaan deterministik untuk screenshot: ?shot=<nama> memaksa
// data demo segar (tanpa localStorage) dan membuka halaman yang sama di
// setiap ronde. Dipakai scripts/shoot.mjs; pengguna biasa tidak melihatnya.
export const SHOTS = {
  cover: { route: 'dashboard' },
  plan: { route: 'anggaran' },
  transactions: { route: 'transaksi', modal: 'add' },
};

// Terapkan shot setelah app selesai render pertama. Mengembalikan true bila
// ada shot yang diterapkan.
export function applyShot(app, shot) {
  const def = SHOTS[shot];
  if (!def) return false;
  app.go(def.route);
  if (def.modal === 'add') app.openTxnModal(null);
  return true;
}
