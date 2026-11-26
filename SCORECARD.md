# SCORECARD — SakuRumah

Rows are scored 1–10 from the contact sheet + a playtest, by a FRESH critic
subagent that has not seen the code. Anchors: 4 = readable but generic,
6 = solid with gaps, 8 = would use as key art / shipped quality, 10 = best in
the field. Automatic failures (cap the row at 5): any panel shows a
placeholder/empty state; numbers disagree between panels (KPI vs donut vs
plan); a view named in the nav has no working content; a control visibly does
nothing; cover needs scrolling to show the dashboard.

| Row | 4/10 | 6/10 | 8/10 | 10/10 |
|---|---|---|---|---|
| 1. Complete budget site (judge #1) | dashboard + list, no plan/tools | dashboard, plan, transactions present | all 6 views real: dashboard, plan, transactions, bills, goals, debt — each reached by a link, figures in place | every shot reads as a finished budgeting product at a glance |
| 2. Content & usefulness (judge #2) | generic categories, no advice | realistic household categories + bills | zero-based plan + pace + bills + goals + debt payoff, specific Indonesian household content | the site answers "bisakah saya bayar tagihan tepat waktu?" and "kapan utang lunas?" with numbers |
| 3. Ease of use (judge #3) | nav exists, dense | clear hierarchy, main things visible | month switcher, search/filter, modal forms obvious, phone layout clean | a first-time user finds RTA, overspend and next bill in 5 seconds |
| 4. Look & originality (judge #4) | flat colours, generic fintech | one palette, tidy cards | ledger-paper identity, coherent green/terracotta/gold, charts suit the data | distinctive, memorable, own identity — not another mint clone |
| 5. Speed & structure (judge #5) | one big file / heavy | split files | one job per file, names say what they do, small first load | outline reads like a design doc; Totals line visibly light |
| 6. Number consistency | two panels disagree | KPI and plan agree | KPI, donut, plan, trend and bills all derive from one state; RTA = 0 | adding a transaction moves every number on screen, visibly |
| 7. Composition & framing | subject cut off, empty frames | readable but generic | cover fits 1280×720 with focal point + hierarchy, no scroll | key art: dense but calm, nothing clipped at contact-sheet size |
| 8. Charts & data viz | one bar chart | donut + trend present | donut, 12-month trend, pace bars and Sankey-lite all legible, labelled in Rp | charts explain the household at a glance, no chart junk |
| 9. Typography & contrast | small grey text | readable | serif display numbers + clean sans, contrast passes, Rp figures scannable | type hierarchy carries the page even without colour |
| 10. Phone layout | desktop squeezed | stacks, usable | single column + bottom nav, same numbers, no horizontal scroll | phone shot looks designed, not shrunk |
| 11. Interactivity | buttons decorative | add transaction works | add/edit/delete, plan edit, bill pay, goal top-up, debt slider all change state | every control on screen does what it says, with feedback |
| 12. Stability | errors, blank frames | occasional glitches | zero console errors, no flicker, month switch instant | — |

## Round log

| Round | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | Min | Changed this round |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 01 | 6 | 7 | 7 | 6 | — | 4 | 7 | 6 | 7 | 7 | 6 | — | 4 | scaffold + first shots; kritik ronde 1 (fresh subagent): label angka ambigu (41 vs 46 transaksi, Terpakai 10,1 jt vs Pengeluaran 8,4 jt, donut 9 segmen vs 10 legenda, Sisa vs RTA), modal tanggal format US, kartu Tagihan ruang kosong |
| 02 | 7 | 7 | 8 | 6 | — | 8 | 8 | 7 | 7 | 7 | 6 | 7 | 6 | perbaikan kritik ronde 1: label KPI & transaksi dijelaskan (41 pengeluaran / 46 total), banner plan 5 total (Pengeluaran & Ditabung dipisah), donut sertakan segmen Tabungan (10 segmen, total Rp 10,1 jt), tanggal modal DD/MM/YYYY, footer tagihan + caption tren; plan muat 720 px dgn footer Total terlihat |
| 03 | 7 | 7 | 8 | 6 | — | 8 | 8 | 7 | 7 | 7 | 8 | 8 | 6 | builder round 3 (BUKAN kritik segar — self-check, tester independen menyusul): footnote plan kini muat 720 px (hint bottom 647 px, dulu 751 px, Total + footnote terlihat); probe interaksi scripts/probe-plan.mjs PASSED — bayar tagihan Streaming +Rp 200 rb, modal tambah dana tujuan, slider utang ubah payoff, modal edit plan, ganti bulan Nov→Okt 2026, 0 console/page error; dossier deterministik 3× sha256 sama; makefun check 4 passed / 1 failed (transcripts_present, wajar) |
| 04 | 7 | 7 | 8 | 6 | — | 8 | 8 | 7 | 7 | 7 | 8 | 8 | 6 | FIX tester independen (cacat KRITIS, skor dibawa dari ronde 03 — bukan kritik segar): `#f-amount` `step="500"` (basis min=1) menolak semua jumlah Rupiah bulat via validasi native (stepMismatch) — tambah/edit transaksi, edit anggaran, bayar utang semua gagal submit. Fix 1 baris: `step="500"` → `step="1"` di app/index.html:46. Probe /tmp/fix-verify.mjs PASSED: tambah transaksi 75.000 (spent 8.387.000→8.462.000, toast muncul), edit plan Hiburan→600.000 (RTA 0→−100.000), bayar utang Kartu Kredit 475.000 (saldo 4.750.000→4.275.000), 0 console/page/request error; check.mjs PASSED; 4 screenshot re-shoot byte-identik; dossier deterministik 2× sha256 7be0994f… (617.394 B); makefun check 4 passed / 1 failed (transcripts_present, wajar) |
