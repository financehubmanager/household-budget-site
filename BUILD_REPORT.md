# BUILD REPORT — v2 "Lumbung" (2026-11-27)

Bounty: **Make the best household budget site** — slug
`best-household-budget-site-20261126-1457`, $50. Repo:
`financehubmanager/household-budget-site`. v1 submission `01a2190b`
(remote commit `1e447bf8`).

User approval: 27 Nov 2026 17:22 WIB ("Ketiganya"), including the
execution-risk hold for build/grade commands in this repo.

## Diagnosis (why v2 exists)

Round 1 result: **rank 423 / 4.675, score 614771 = 61.5% win rate** —
top ~9%, far from the prize line. Neighbors 418–428 are dominated by
"Hearth" variants (Hearthline, Hearthside Budget, HearthLedger…): the
field converged on one concept and one look. v1's ledger-paper identity
(warm cream + deep green) is the SAME family as the field — in the judge's
contact sheet we do not stand out. Content is strong (61.5%); the
differentiator must be visual identity, not more features.

## Changes

### 1. Identity: SakuRumah → Lumbung (rice granary)
- New name everywhere: `app/index.html` (title, meta, brand),
  `app/js/app.js` (document.title), `app/js/data.js`, `main.ts`,
  `LICENSE`, `README.md`, `BRIEF.md`, `SCORECARD.md`.
- Brand mark ◈ → 🌾 (rice sheaf). Repo name
  (`household-budget-site`) unchanged.
- **Suggested submit title for the parent: "Lumbung — Household
  Budget Site".**

### 2. Palette: ledger-paper green → midnight granary (ink navy + gold)
- Tokens (`app/css/style.css`): `--green` #14532D → #16294A,
  `--green-2` #1B4332 → #0F1D33, `--gold` #B8860B → #C89B3C.
  Terracotta #C2410C (overspend) and ok-green #2E7D32 kept as semantics.
- **Dark navy nav rail** (full-height, cream links, gold active pill)
  + dark navy topbar; content stays warm cream paper for legibility.
  Phone bottom nav is dark navy too (verified on 4-phone.jpg).
- Charts follow the tokens: trend income line + dots #16294A, saved
  bars #C89B3C, Sankey income/saved nodes #16294A (`charts.js`);
  trend legend swatches (`views.js`); category "Tabungan & Tujuan"
  color #16294A (`data.js`).
- Body ruled lines re-tinted indigo; modal overlay indigo;
  brand subtitle #A9B8D0; nav foot #8FA0B8.

### 3. Cover now shows the debt (v1 gap)
- Bills card gains one computed line from `debtState()`:
  "💳 Kartu Kredit: Rp 4,8 jt · min Rp 475 rb/bln" (short form —
  the full form wrapped to two lines and pushed "Semua tagihan →"
  below the fold; fixed and re-verified).
- All three bottom-card links visible in the 720 px frame again.
- Cover now carries every value in one frame: income/spent/saved/
  remaining KPIs, donut + 10-category legend, 12-month trend, pace
  top-3, bills + debt, goals.

### 4. Plan shot: Sankey enters the frame
- Freed ~40 px above the Sankey card (table row padding 3→2 px,
  banner padding 6→4 px + RTA number 22→20 px, plan-card h2/hint
  margins trimmed). Sankey card header + top of the flows (income
  node + first bands) now visible at 720 px.
- Honest limit: only the TOP of the Sankey is visible; the flow body
  is still below the fold (full Sankey needs ~390 px, impossible by
  tightening). The Sankey SVG itself was NOT redesigned (chart math
  untouched). Row 8 stays 7.

### 5. Accepted, not changed
- Row 11 interactivity (6, stale round-01 critic score): modal,
  click-to-edit amounts, "Tandai dibayar" are all probe-verified.
  No code change; noted in SCORECARD round 05.

## What was kept
- Structure, data, all routes, all interactions, determinism.
- No code copied from any other entry. No new dependency.
- `vendor/makefun-frontend.ts` untouched; `serve.ts`, `shots.json`
  unchanged.

## Verification (all done, all seen)
- `node scripts/check.mjs` → **CHECK PASSED** (all 6 routes render,
  RTA = 0, numbers agree, add-transaction +50.000 / −50.000 remaining,
  shot modes boot).
- `node scripts/shoot.mjs` → 4 shots re-shot; **all 4 viewed directly**:
  1-cover (Lumbung brand, navy rail + gold pill, debt line one line,
  all 3 card-links visible), 2-plan (navy banner, Sankey header + top
  flows in frame), 3-transactions (modal, navy Simpan button),
  4-phone (dark bottom nav, gold Dasbor pill).
- `MAKEFUN_OUTPUT_DIR=out node main.ts` 2× → dossier.json sha256
  **b253849bb54c7a4b5a400fd9c6043c1a49ab86bc55ba1dff9d0f70bc8f577799**
  identical both runs (619,017 bytes).
- SCORECARD.md round 05 added (self-score, honestly labelled):
  row 4: 6→8, row 1: 7→8, row 14: 7→8; min stays 6 (row 11 stale).

## Handoff to parent (tester + submit)
- **Do NOT push / bundle / submit from this builder session** (per brief).
- Local HEAD after commit: see `git log -1` (commit message
  "v2: Lumbung identity — navy+gold, dark rail, debt on cover").
- Target: tester + submit before round 2 cutoff **28 Nov 09:57 WIB**.
- **Quota warning (from the campaign summary): 19 of ~20 total
  submissions used.** Verify the real remaining quota via CLI before
  submitting this v2 (and the Thankful v3 / CAKRAWALA v4 revisions).
- Suggested submit title: "Lumbung — Household Budget Site".
- Bundle note for the parent: v2 reuses the v1 writer sessions +
  this v2 session (same recipe as CAKRAWALA v2b/v3: typed origin with
  the root session's first message + all writer sessions; check the
  bundle skill before bundling).
