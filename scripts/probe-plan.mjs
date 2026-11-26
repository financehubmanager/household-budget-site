// Probe: plan footnote fit + interactions (pay bill, goal top-up, debt slider,
// plan edit, month switch). Usage: node scripts/probe-plan.mjs
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn('node', ['serve.ts', '--port', '8095'], { cwd: root, stdio: 'ignore' });
const failures = [];
try {
  await sleep(1500);
  const browser = await chromium.launch({
    executablePath: `${process.env.HOME}/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome`,
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  // 1. Plan footnote must fit in 720 px.
  await page.goto('http://127.0.0.1:8095/?shot=plan', { waitUntil: 'load' });
  await sleep(1200);
  const fit = await page.evaluate(() => {
    const hint = document.querySelector('#view .hint');
    const r = hint?.getBoundingClientRect();
    return { hintBottom: r ? r.bottom : null, viewport: window.innerHeight };
  });
  console.log('PLAN-FIT', JSON.stringify(fit));
  if (fit.hintBottom === null || fit.hintBottom > 720) failures.push(`plan footnote bottom ${fit.hintBottom}, must be <= 720`);

  // 2. Pay the Streaming bill (Rp 200.000): spent +200k, remaining -200k.
  const s0 = await page.evaluate(() => window.__app.state());
  await page.evaluate(() => { location.hash = '#/tagihan'; });
  await sleep(800);
  const paid = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('[data-action="pay-bill"]')].find((b) => b.dataset.bill === 'streaming');
    if (!btn) return false;
    btn.click();
    return true;
  });
  await sleep(400);
  const s1 = await page.evaluate(() => window.__app.state());
  console.log('PAY-BILL', JSON.stringify({ paid, before: s0.spent, after: s1.spent }));
  if (!paid) failures.push('pay-bill button for streaming not found');
  else if (s1.spent !== s0.spent + 200000) failures.push(`pay bill: spent ${s0.spent} -> ${s1.spent}, expected +200000`);
  const billNowPaid = await page.evaluate(() => document.getElementById('view')?.innerText.includes('Sudah lunas') && !document.querySelector('[data-action="pay-bill"][data-bill="streaming"]'));
  if (!billNowPaid) failures.push('streaming bill still shows as unpaid after paying');

  // 3. Goal top-up: open goal modal, add Rp 500.000 to Dana Darurat.
  await page.evaluate(() => { location.hash = '#/tujuan'; });
  await sleep(800);
  const goal = await page.evaluate(() => {
    const btn = document.querySelector('[data-action="add-goal"]');
    if (!btn) return { btn: false };
    btn.click();
    return { btn: true, modalOpen: !document.getElementById('modal')?.classList.contains('hidden') };
  });
  console.log('GOAL-MODAL', JSON.stringify(goal));
  if (!goal.btn) failures.push('add-goal button not found');
  if (!goal.modalOpen) failures.push('goal top-up modal did not open');

  // 4. Debt slider: extra Rp 500.000/month must change the payoff text.
  await page.evaluate(() => { location.hash = '#/utang'; });
  await sleep(800);
  const debt = await page.evaluate(async () => {
    const slider = document.querySelector('input[type=range]#debt-extra');
    if (!slider) return { slider: false };
    const before = document.getElementById('view')?.innerText;
    slider.value = '500000';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 200));
    const after = document.getElementById('view')?.innerText;
    return { slider: true, changed: before !== after, extraVal: document.getElementById('debt-extra-val')?.textContent };
  });
  console.log('DEBT-SLIDER', JSON.stringify(debt));
  if (!debt.slider) failures.push('debt slider not found');
  else if (!debt.changed) failures.push('debt slider did not change payoff text');

  // 5. Plan edit: click a Dianggarkan amount, modal opens.
  await page.evaluate(() => { location.hash = '#/anggaran'; });
  await sleep(800);
  const plan = await page.evaluate(() => {
    const btn = document.querySelector('[data-action="edit-plan"]');
    if (!btn) return { btn: false };
    btn.click();
    return { btn: true, modalOpen: !document.getElementById('modal')?.classList.contains('hidden') };
  });
  console.log('PLAN-EDIT', JSON.stringify(plan));
  if (!plan.btn) failures.push('edit-plan button not found');
  if (!plan.modalOpen) failures.push('plan edit modal did not open');

  // 6. Month switch: prev month changes the label and numbers.
  await page.evaluate(() => { location.hash = '#/dashboard'; });
  await sleep(800);
  const month = await page.evaluate(async () => {
    const before = document.getElementById('month-label')?.textContent;
    const btn = document.querySelector('#month-prev');
    if (!btn) return { btn: false };
    btn.click();
    await new Promise((r) => setTimeout(r, 300));
    const after = document.getElementById('month-label')?.textContent;
    return { btn: true, before, after, changed: before !== after };
  });
  console.log('MONTH-SWITCH', JSON.stringify(month));
  if (!month.btn) failures.push('prev-month button not found');
  else if (!month.changed) failures.push(`month switch did not change label (${month.before} -> ${month.after})`);

  if (errors.length > 0) failures.push(...errors.map((e) => `page/console error: ${e}`));
  await browser.close();
} finally {
  server.kill();
}

if (failures.length > 0) {
  console.error(`\nPROBE FAILED (${failures.length}):`);
  failures.forEach((f) => console.error(` - ${f}`));
  process.exit(1);
}
console.log('\nPROBE PASSED');
