# TEST REPORT — SakuRumah v2 "Lumbung" (independent tester, 2026-11-27)

Bounty: **Make the best household budget site** — slug
`best-household-budget-site-20261126-1457`, $50. Repo lokal
`~/workspace/makefun/budget-site/` (GitHub `financehubmanager/budget-site`).
v1 submission `01a2190b` (ronde 1: 423/4.675, 61,5%). v2 commit lokal `fc3bdd2`
(builder), target ronde 2 (cutoff 28 Nov 09:57 WIB).

User approval: 27 Nov 2026 17:22 WIB ("Ketiganya"), termasuk hold risiko
eksekusi untuk perintah build/grade di repo ini.

## Verdict: LAYAK SUBMIT

0 KRITIS, 0 SEDANG, 2 KECIL (keduanya kosmetik, tidak menghambat submit —
lihat bawah). Semua klaim builder yang bisa diuji ulang **terverifikasi
independen**; satu klaim sedikit dilebih-lebihkan (KECIL-1).

## Verifikasi mekanis (semua dijalankan sendiri oleh tester)

| Cek | Hasil |
|---|---|
| `node scripts/check.mjs` | **CHECK PASSED** — 6 rute render (dashboard/anggaran/transaksi/tagihan/tujuan/utang), RTA = 0, angka antar-view konsisten, ADD-TXN +50.000 spent / −50.000 remaining, shot mode cover/plan/transactions boot |
| Determinisme `MAKEFUN_OUTPUT_DIR=out node main.ts` 2× | dossier.json sha256 **b253849bb54c7a4b5a400fd9c6043c1a49ab86bc55ba1dff9d0f70bc8f577799** identik kedua run (619.017 byte) — sama persis dengan klaim builder |
| Vendor | `vendor/makefun-frontend.ts` utuh (sha256 4c8da1c8…), ter-track git, tidak ada perubahan |
| shots.json | Utuh — 4 shot, dimensi benar (1–3: 1280×720, 4: 390×844) |
| Probe interaksi `scripts/probe-plan.mjs` (independen) | **PROBE PASSED** — footnote plan bottom 610 px (muat 720), bayar tagihan Streaming spent +200.000 dan status "Sudah lunas", modal tambah dana tujuan terbuka, slider utang berubah (extra Rp 500.000), modal edit plan terbuka, ganti bulan Nov→Okt 2026, 0 console/page error |
| Probe form asli tester (`/tmp/tester-addtxn.mjs`) | **PASSED** — submit lewat tombol Simpan di modal dengan jumlah Rupiah bulat Rp 75.000: `stepMismatch: false`, spent 8.387.000 → 8.462.000 (+75.000), transaksi "Uji Tester 75rb" muncul di daftar, modal menutup, 0 console error. Fix KRITIS ronde 04 (`step="500"` → `step="1"`) **masih berlaku di v2 lewat UI asli** (check.mjs hanya memakai `addDemoTxn()` programatik, jadi ini diverifikasi terpisah oleh tester) |

## Penilaian visual — keempat screenshot dilihat langsung

### 1-cover.jpg — LULUS
- Brand "Lumbung — Anggaran Rumah Tangga" + mark 🌾; rel navigasi navy penuh
  dengan pill emas "Dasbor" — terbaca premium, **jelas bukan varian "Hearth"**
  (lapangan didominasi krem hangat + hijau; navy + emas menonjol di contact
  sheet).
- Semua nilai dalam satu frame: KPI Pemasukan Rp 12,5 jt / Pengeluaran
  Rp 8.387.000 / Ditabung Rp 1.750.000 / Sisa di Kategori Rp 2.363.000; donut
  + legenda 10 kategori; tren 12 bulan (garis navy + bar oranye + bar emas);
  Kecepatan belanja top-3; kartu Tagihan + kartu Tujuan menabung.
- **Baris utang SATU baris, terverifikasi:** "💳 Kartu Kredit: Rp 4,8 jt ·
  min Rp 475 rb/bln" — tidak membungkus, dan "Semua tagihan →" tetap terlihat.
- **Ketiga link bawah terlihat:** "Lihat semua kategori →", "Semua tagihan →",
  "Kelola tujuan →".
- Tidak ada teks terpotong / tumpang tindih / keluar frame pada 1280×720.
  Rel navy gelap tapi tidak berat: konten tetap kertas krem, kontras link krem
  di navy terbaca, pill emas menjadi aksen yang jelas.

### 2-plan.jpg — LULUS dengan catatan (KECIL-1)
- Banner navy "SIAP DIALOKASIKAN Rp 0" + 5 total (Pemasukan/Dialokasikan/
  Pengeluaran/Ditabung/Tersisa) utuh; tabel 11 kategori + baris Total +
  footnote ("* Terpakai termasuk Rp 1.750.000…") semuanya muat dalam 720 px
  (footnote bottom 610 px, diukur probe).
- Sankey: header "Ke mana uang mengalir — pemasukan → kelompok belanja →
  hasil" terlihat, TAPI zoom strip bawah (y 640–720) menunjukkan yang
  terlihat hanyalah **puncak ~15 px batang node tanpa label** (navy, hijau
  sage, hijau tua, hijau pucat, oranye-merah) — **tidak ada aliran, tidak ada
  node pemasukan, tidak ada label**. Klaim builder "income node + first
  bands" **dilebih-lebihkan**; yang benar adalah "puncak node saja".
  Builder sendiri jujur di BUILD_REPORT bahwa badan Sankey masih di bawah
  fold; zoom tester menunjukkan kondisinya lebih tipis dari yang ditulis.
  Dampak: strip warna di tepi bawah frame memberi sinyal "ada grafik di
  bawah" tapi tidak memberi informasi apa pun — bukan rusak, tapi juga bukan
  nilai tambah. Tidak bisa diperbaiki dengan melonggarkan lagi (Sankey penuh
  butuh ~390 px).

### 3-transactions.jpg — LULUS
- Modal "Tambah transaksi" rapi di tengah: Merchant, Jumlah (Rp), Tanggal
  **26/11/2026 (DD/MM/YYYY — fix kritik ronde 1 dipertahankan)**, Jenis,
  Kategori, "Untuk tujuan", tombol Batal + **Simpan navy**. Tidak ada overlap
  dengan daftar di belakangnya. Ringkasan atas ("Pemasukan Rp 12.500.000 ·
  Pengeluaran Rp 8.387.000 · Ditabung Rp 1.750.000 · 46 transaksi") konsisten
  dengan cover.

### 4-phone.jpg — LULUS
- 390×844: KPI 2×2, donut + legenda 10 kategori terbaca, bottom nav navy
  gelap dengan pill emas "Dasbor", 6 item nav muat, tidak ada overflow
  horizontal. Terlihat dirancang untuk ponsel, bukan desktop yang dikecilkan.

## Rename SakuRumah → Lumbung — LULUS (1 sisa tak terlihat)
- Title, meta description, brand di topbar, `document.title`, README,
  LICENSE, BRIEF, SCORECARD, BUILD_REPORT: semua "Lumbung".
- Dossier: "Lumbung" 7×, "SakuRumah" 0×.
- Satu sisa: `app/js/state.js:7` — `STORE_KEY = 'sakurumah-v1'` (KECIL-2).
  Tidak terlihat di UI mana pun; hanya muncul sekali sebagai string di dalam
  source outline dossier. Tidak memengaruhi penilaian juri.

## Daftar cacat

### KRITIS — tidak ada
### SEDANG — tidak ada

### KECIL
- **KECIL-1 — Sankey hanya puncak node yang terlihat di shot plan.**
  Bukti: zoom strip y 640–720 pada `screenshots/2-plan.jpg` — hanya puncak
  ~15 px batang node tanpa label/aliran; header Sankey terlihat tapi badan
  grafik sepenuhnya di bawah fold. Klaim builder "income node + first bands"
  tidak akurat. Dampak: kosmetik — shot plan tetap lengkap (banner + tabel +
  footnote utuh); strip bawah hanya memberi kesan "ada lagi di bawah".
  Perbaikan (redesign SVG Sankey menjadi ringkas ~150 px) adalah pekerjaan
  besar dengan risiko merusak chart math — **tidak disarankan sebelum cutoff
  ronde 2**.
- **KECIL-2 — Sisa nama lama di `STORE_KEY`.** Bukti: `app/js/state.js:7`
  `const STORE_KEY = 'sakurumah-v1';` — muncul 1× di dossier sebagai teks
  source, 0× terlihat di UI. Dampak: nihil untuk juri (hanya pembaca source
  outline yang sangat teliti yang mungkin melihatnya). Perbaikan 1 baris
  (ganti key) berisiko mereset state demo tersimpan dan tidak mengubah satu
  pun piksel — **opsional, tidak menghambat submit**.

## Skor juri per kriteria (independen, anchor SCORECARD 1–10)

| # | Kriteria | Skor | Catatan |
|---|----------|------|---------|
| 1 | Completeness of budget | **8** | Utang kini terlihat di cover; semua 6 view nyata & terjangkau dari cover. Setuju klaim builder 8. |
| 2 | Clarity of figures | 8 | Label jelas, angka konsisten antar-view. |
| 3 | Number consistency | 8 | RTA = 0; tambah transaksi menggerakkan semua angka (probe). |
| 4 | Look & originality | **8** | Navy + emas "Lumbung" adalah pemisah nyata dari lapangan "Hearth"; terbaca premium di contact-sheet. Setuju klaim builder 8. |
| 5 | Structure | 8 | Tidak berubah dari v1. |
| 6 | Realism of demo data | 8 | Data rumah tangga Indonesia spesifik & konsisten. |
| 7 | Composition | 8 | Cover muat 720 px dengan hierarki jelas, ketiga link terlihat. |
| 8 | Charts | **7** | Donut + tren + pace legibel; Sankey hanya tease (KECIL-1). Setuju builder tetap 7. |
| 9 | Typography & contrast | 8 | Hierarki serif/sans terbaca; kontras navy-krem lolos. |
| 10 | Mobile | 8 | Phone shot bersih, bottom nav navy + pill emas, tanpa overflow. |
| 11 | Interactivity | **8** | Bukti probe (bukan skor kritik basi): bayar tagihan, top-up tujuan, slider utang, edit plan, ganti bulan, submit form asli — semuanya berfungsi. SCORECARD masih menulis 6 dari kritik ronde-01 yang basi; berdasarkan bukti saat ini nilainya 8. |
| 12 | Fit with the brief | 9 | Zero-based + tagihan + tujuan + utang dalam satu tempat. |
| 13 | Trust | 8 | Angka konsisten, tidak ada placeholder. |
| 14 | Polish | **8** | Chrome navy + pill emas rapi di contact-sheet; satu-satunya noda adalah strip Sankey (KECIL-1). |
| 15 | Completeness of evidence | 9 | Dossier deterministik 2× sha256 sama. |

**Min berdasarkan bukti: 7** (baris 8). Min menurut SCORECARD (skor kritik basi
baris 11): 6 — sudah tidak mencerminkan kondisi saat ini.

## Rekomendasi untuk parent
- **Submit v2 apa adanya sebelum cutoff ronde 2 (28 Nov 09:57 WIB).**
  Judul submit yang disarankan builder: "Lumbung — Household Budget Site".
- Jangan kerahkan fixer untuk KECIL-1/KECIL-2: keduanya kosmetik, perbaikan
  Sankey berisiko tinggi dan tidak mengubah duel juri; rename `STORE_KEY`
  tidak mengubah satu piksel pun.
- Catatan kuota dari builder: **19 dari ~20 total submission sudah terpakai**
  — verifikasi sisa kuota via CLI sebelum submit (v2 ini + Thankful v3 +
  CAKRAWALA v4 berebut slot terakhir).
