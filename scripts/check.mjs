// Headless load + playtest check for SakuRumah. Starts serve.ts, opens the
// site in Chromium, fails loudly on console/page errors or a blank view,
// then asserts the budget numbers agree (RTA = 0, KPI = plan math) and that
// adding a transaction moves the numbers. Usage: node scripts/check.mjs
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { access } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = portIndex === -1 ? 8092 : Number(args[portIndex + 1]);
const base = `http://127.0.0.1:${port}`;

async function findChrome() {
  const home = process.env.HOME;
  const candidates = [
    `${home}/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome`,
    `${home}/.cache/ms-playwright/chromium_headless_shell-1254/chrome-linux/headless_shell`,
  ];
  for (const c of candidates) {
    try { await access(c); return c; } catch { /* next */ }
  }
  return undefined;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(tries = 40) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(`${base}/index.html`);
      if (res.ok) return true;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  return false;
}

const server = spawn('node', ['serve.ts', '--port', String(port)], { cwd: root, stdio: 'ignore' });
const failures = [];
try {
  if (!(await waitForServer())) {
    failures.push('serve.ts did not answer');
    throw new Error('no server');
  }
  const executablePath = await findChrome();
  const browser = await chromium.launch({
    executablePath,
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('favicon.ico')) errors.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => {
    if (!req.url().endsWith('/favicon.ico')) errors.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`);
  });

  await page.goto(`${base}/`, { waitUntil: 'load', timeout: 30000 });
  await sleep(1500);

  const boot = await page.evaluate(() => {
    const st = window.__app?.state?.() ?? null;
    const text = document.getElementById('view')?.innerText ?? '';
    return { state: st, textLength: text.length, hasKpi: !!document.getElementById('kpi-income') };
  });
  console.log('BOOT', JSON.stringify(boot, null, 2));
  if (!boot.state) failures.push('window.__app missing');
  if (!boot.hasKpi) failures.push('KPI cards missing');
  if (boot.textLength < 500) failures.push(`view looks blank (${boot.textLength} chars)`);

  if (boot.state) {
    const s = boot.state;
    // Zero-based: Ready to Assign harus 0, dan sisa = pemasukan - keluar - ditabung.
    if (s.readyToAssign !== 0) failures.push(`readyToAssign ${s.readyToAssign}, expected 0`);
    if (s.income !== 12500000) failures.push(`income ${s.income}, expected 12500000`);
    if (s.spent !== 8387000) failures.push(`spent ${s.spent}, expected 8387000`);
    if (s.saved !== 1750000) failures.push(`saved ${s.saved}, expected 1750000`);
    if (s.remaining !== 2363000) failures.push(`remaining ${s.remaining}, expected 2363000`);
    if (s.assigned !== 12500000) failures.push(`assigned ${s.assigned}, expected 12500000`);
    if (s.byCat.makan !== 945000) failures.push(`makan spent ${s.byCat.makan}, expected 945000`);
  }

  // Setiap rute harus me-render tanpa error dan berisi konten.
  for (const route of ['anggaran', 'transaksi', 'tagihan', 'tujuan', 'utang']) {
    await page.goto(`${base}/#/${route}`, { waitUntil: 'load', timeout: 30000 });
    await sleep(800);
    const info = await page.evaluate(() => ({
      route: window.__app?.state?.().route,
      len: document.getElementById('view')?.innerText.length ?? 0,
    }));
    console.log('ROUTE', route, JSON.stringify(info));
    if (info.route !== route) failures.push(`route ${route} did not render (got ${info.route})`);
    if (info.len < 200) failures.push(`route ${route} looks empty (${info.len} chars)`);
  }

  // Playtest: tambah transaksi Rp 50.000 belanja -> spent naik 50.000,
  // remaining turun 50.000, dan transaksi muncul di daftar.
  await page.goto(`${base}/#/transaksi`, { waitUntil: 'load', timeout: 30000 });
  await sleep(800);
  const before = await page.evaluate(() => window.__app.state());
  await page.evaluate(() => window.__app.addDemoTxn());
  await page.evaluate(() => window.__app.render());
  await sleep(400);
  const after = await page.evaluate(() => window.__app.state());
  console.log('ADD-TXN', JSON.stringify({ before: before.spent, after: after.spent, beforeRem: before.remaining, afterRem: after.remaining }));
  if (after.spent !== before.spent + 50000) failures.push(`add txn: spent ${before.spent} -> ${after.spent}, expected +50000`);
  if (after.remaining !== before.remaining - 50000) failures.push(`add txn: remaining ${before.remaining} -> ${after.remaining}, expected -50000`);
  const listHas = await page.evaluate(() => document.getElementById('view')?.innerText.includes('Uji Tambah'));
  if (!listHas) failures.push('added transaction "Uji Tambah" not visible in list');

  // Shot modes must all boot without errors.
  for (const shot of ['cover', 'plan', 'transactions']) {
    await page.goto(`${base}/?shot=${shot}`, { waitUntil: 'load', timeout: 30000 });
    await sleep(1200);
    const shotState = await page.evaluate(() => window.__app?.state?.() ?? null);
    console.log(`SHOT ${shot}`, JSON.stringify(shotState?.route), shotState?.txnCount);
    if (!shotState || shotState.readyToAssign !== 0) failures.push(`shot ${shot} did not reach a consistent state`);
  }
  if (errors.length > 0) failures.push(...errors);
  await browser.close();
} finally {
  server.kill();
}

if (failures.length > 0) {
  console.error(`\nCHECK FAILED (${failures.length}):`);
  failures.forEach((f) => console.error(` - ${f}`));
  process.exit(1);
}
console.log('\nCHECK PASSED');
