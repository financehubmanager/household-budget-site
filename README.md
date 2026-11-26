# saku-rumah

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/financehubmanager/household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/financehubmanager/household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

SakuRumah — situs anggaran rumah tangga zero-based untuk keluarga Indonesia: rencana anggaran (Ready to Assign / Assigned / Activity / Available), transaksi, tagihan, tujuan menabung, dan kalkulator pelunasan utang — semua berjalan offline di browser, dengan data demo Keluarga Wijaya yang realistis dan tersimpan lokal.

## Run it

```sh
node serve.ts
```

Lalu buka http://localhost:8080. Pindah bulan dengan tombol ‹ › di atas, tambah transaksi dari halaman Transaksi, ubah anggaran dengan mengklik jumlah di halaman Anggaran, dan tandai tagihan lunas dari halaman Tagihan.

## Struktur

- `app/index.html` — shell, navigasi, modal, toast
- `app/css/style.css` — semua gaya (identitas ledger-paper)
- `app/js/data.js` — dataset demo: kategori, rencana, transaksi Nov 2026 (eksplisit), 11 bulan sebelumnya (berseed), tagihan, tujuan, utang
- `app/js/format.js` — format Rupiah & tanggal id-ID
- `app/js/state.js` — store (localStorage + CRUD) dan semua hitung anggaran
- `app/js/charts.js` — grafik SVG tulisan tangan (donut, tren, pace, Sankey)
- `app/js/views.js` — render Dasbor / Anggaran / Transaksi / Tagihan / Tujuan / Utang
- `app/js/shots.js` — keadaan deterministik `?shot=` untuk screenshot
- `app/js/app.js` — boot + router hash + event global

---

<sub>Entered on [make.fun](https://make.fun/?ref=eadefpex&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
