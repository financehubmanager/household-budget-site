# BRIEF — SakuRumah: Anggaran Rumah Tangga

## The contract (make.fun bounty "Make the best household budget site", 26–29 Nov 2026)

- A complete, original household budget site. Static files under `app/`, no
  network request, desktop Chrome + phone. 3–4 real screenshots under
  `screenshots/`.
- The AI judge (GLM) compares entries two at a time from (a) a contact sheet
  of the screenshots (cover large on top, the rest small below) and (b) a
  short outline of the source (file paths + first declarations). Screenshots
  decide almost everything.
- Judge criteria, most important first:
  1. Working budget site SHOWN in screenshots: the pages, tools and sections
     a household needs, each reached by a link, real figures in place, every
     control doing what it says, nothing empty, broken or placeholder.
  2. Content and usefulness: written for people managing household money,
     complete and specific, answers what they come for, gives them what they
     need to act on.
  3. Ease of use: clear navigation and hierarchy, main things at a glance,
     phone layout, readable type and contrast.
  4. Look and originality: original design, own identity, coherent palette
     and type, charts and layout that suit the purpose. Never a copy of
     another site's brand, text or images.
  5. Speed and structure: smaller first load on the Totals line, no heavy
     framework where none is needed, source split into files with one clear
     job each, named for what they do.
- Gate (must pass or the entry scores 0): app/ ≤ 993 files, ≤ 16 MiB,
  index.html ≤ 1 MiB, no symlinks, no network references (everything local or
  `data:`), screenshots 3–4, each ≤ 256 KiB, long side ≤ 1280, short side
  ≥ 360, dossier byte-identical to what `buildDossier` writes, MIT LICENSE,
  repo created after the bounty opened, public, owned by ocoot. Transcripts:
  ≥30% authored lines, ≥5 assistant turns with text, ≥2 revising writes of
  some file.
- Deadline: entries close 29 Nov 2026 21:57 WIB. Top 10 share $50 ($5 each).
  Blind rounds: no public ranks until results. Round 1 cutoff 27 Nov 15:57 WIB.
  Dev heats judge each valid entry against 4 fixed house sites; top 40 dev
  board go to the final heat.

## The site

**Name:** SakuRumah — Anggaran Rumah Tangga. **Household:** Keluarga Wijaya
(Budi & Sari, 2 anak), Semarang. **Currency:** IDR. **Current month:**
November 2026 ("hari ini" 26 Nov 2026, fixed for deterministic screenshots).
**Method:** zero-based budgeting — every rupiah has a job; Ready to Assign
must be 0 when the plan is complete.

**Demo numbers (must agree on every panel — one state, computed everywhere):**
- Pemasukan Nov: Rp 12.500.000 (Gaji Budi 8.500.000 + Gaji Sari 4.000.000).
- Anggaran (assigned) Nov, 11 kategori, total Rp 12.500.000 → Ready to Assign Rp 0.
- Pengeluaran Nov s.d. 26 Nov: Rp 8.387.000. Ditabung: Rp 1.750.000.
  Sisa (available): Rp 2.363.000.
- Kategori (assigned / spent / available): Belanja Harian 2.800.000 /
  2.315.000 / 485.000; Makan di Luar 900.000 / 945.000 / −45.000 (over, merah);
  Transportasi 1.100.000 / 862.000 / 238.000; Tagihan Rumah 1.650.000 /
  1.400.000 / 250.000 (streaming + iuran belum dibayar); Sekolah Anak 1.200.000 /
  1.200.000 / 0; Kesehatan 400.000 /
  185.000 / 215.000; Hiburan 500.000 / 420.000 / 80.000; Pakaian 350.000 /
  210.000 / 140.000; Cicilan Motor 850.000 / 850.000 / 0; Tabungan & Tujuan
  1.750.000 / dialokasikan 1.750.000 / 0; Dana Cadangan 1.000.000 / 0 /
  1.000.000.
- Tagihan: PLN, PDAM, Internet, HP, SPP, Asuransi (lunas) + Iuran RT (jatuh
  tempo 30 Nov) + Streaming (28 Nov) belum dibayar. "Tandai dibayar" membuat
  transaksi nyata (angka ikut berubah).
- Tujuan: Dana Darurat 18.750.000 / 30.000.000 (62%); Liburan Keluarga
  3.200.000 / 8.000.000 (40%); Dana Pendidikan 9.400.000 / 25.000.000 (38%).
- Utang: Kartu Kredit sisa Rp 4.750.000, bunga 2,25%/bulan, min. Rp 475.000;
  kalkulator pelunasan (tambahan bayar/bulan → bulan lebih cepat + bunga hemat).
- Tren 12 bulan (Des 2025–Nov 2026): pemasukan 12,5 jt (Mar 14 jt, THR),
  pengeluaran 8,2–9,6 jt.

**Views (hash routes, all real, all wired):**
1. `#/dashboard` — ringkasan bulan (4 kartu KPI), donut breakdown, tren 12
   bulan, pace per kategori, tagihan jatuh tempo, progres tujuan.
2. `#/anggaran` — rencana zero-based: Ready to Assign / Assigned / Activity /
   Available per kategori, edit jumlah anggaran inline, pace marker (harapan
   s.d. hari ke-26 dari 30).
3. `#/transaksi` — daftar transaksi bulan ini (filter kategori + cari),
   tambah/edit/hapus transaksi (modal) — anggaran & grafik langsung berubah.
4. `#/tagihan` — daftar tagihan bulanan + status lunas/belum + tandai dibayar.
5. `#/tujuan` — kartu tujuan + progress bar + tambah dana (membuat transaksi).
6. `#/utang` — saldo utang + kalkulator pelunasan (slider tambahan bayar).

**Interactions that must work:** tambah/edit/hapus transaksi; ubah anggaran;
tandai tagihan dibayar; tambah dana tujuan; kalkulator utang; pindah bulan
(12 bulan data demo); reset ke demo; semua tersimpan di localStorage.
`?shot=` memaksa data demo segar + tanggal tetap (deterministik).

## Look (one style, no placeholders)

- Ledger-paper identity: warm cream background (#FAF6EF), deep green ink
  (#14532D / #1B4332), terracotta accent (#C2410C), gold highlights (#B8860B).
  Serif display for big numbers (Georgia stack, system only — no webfont, no
  network), system sans for UI. No framework, no library: hand-rolled SVG
  charts (donut, trend bars+line, pace bars, Sankey-lite flow).
- Every number formatted `Rp 12.500.000` (id-ID). Dates Indonesian.
- Density: dashboard cover must fit 1280×720 without scrolling — the whole
  app in one frame, legible when shrunk to 768×480 on the contact sheet.
- Phone view: single column, bottom nav, same numbers.

## Structure (criterion 5 — the judge reads file/function names)

One job per file, named for what it does:
- `app/index.html` — shell, nav, view containers, modal, toast
- `app/css/style.css` — all styles (tokens, layout, components, phone)
- `app/js/data.js` — demo dataset: categories, plan, Nov transactions (exact),
  11 months generated (seeded), bills, goals, debt
- `app/js/format.js` — IDR formatting, dates, small helpers
- `app/js/state.js` — store (localStorage, CRUD), derived budget math
- `app/js/charts.js` — SVG donut, trend, pace bars, Sankey-lite
- `app/js/views.js` — render dashboard / plan / transactions / bills /
  goals / debt
- `app/js/shots.js` — deterministic `?shot=` states
- `app/js/app.js` — boot + hash router + modal + global events
- `main.ts` — copies app/ + screenshots/ to /output, writes dossier.json
- `serve.ts` — local static server for testing

## Screenshot plan (the cover decides the first impression)

1280×720 JPEG (phone 390×844), each ≤ 256 KiB. First by name is the cover.
1. `1-cover.jpg` — dashboard desktop: KPI row, donut + pace, tren 12 bulan,
   tagihan + tujuan. The whole site in one frame.
2. `2-plan.jpg` — anggaran zero-based: RTA 0, per-kategori Assigned /
   Activity / Available + pace marker, satu kategori over (merah).
3. `3-transactions.jpg` — transaksi November + modal tambah transaksi terbuka.
4. `4-phone.jpg` — dashboard di ukuran HP 390×844.

## Verification loop

Build → `node scripts/check.mjs` (load, no console errors, not blank, state
assertions: RTA=0, sums agree, add-transaction updates KPI) →
`node scripts/shoot.mjs` (same 4 shots every round) → fresh critic subagent
scores SCORECARD.md rows 1–10 from the contact sheet only → fix the lowest
row → repeat. Stop when every row ≥ 8, or two rounds in a row fail to raise
the minimum, or the deadline forces a submit. A subagent playtest (scripted
clicks, state assertions) runs after every stage so a visual pass can't
silently break a mechanic.
