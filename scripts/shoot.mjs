// Screenshot loop for SakuRumah: the same 4 deterministic shots every round,
// 1280x720 JPEG (phone 390x844), so the critic loop compares like with like.
// Usage: node scripts/shoot.mjs [--port 8092] [--out screenshots]
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { access, mkdir, readFile } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = portIndex === -1 ? 8092 : Number(args[portIndex + 1]);
const outIndex = args.indexOf('--out');
const outDir = outIndex === -1 ? join(root, 'screenshots') : args[outIndex + 1];
const base = `http://127.0.0.1:${port}`;
const shots = JSON.parse(await readFile(join(root, 'shots.json'), 'utf8'));

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

await mkdir(outDir, { recursive: true });
const server = spawn('node', ['serve.ts', '--port', String(port)], { cwd: root, stdio: 'ignore' });
try {
  if (!(await waitForServer())) throw new Error('serve.ts did not answer');
  const executablePath = await findChrome();
  const browser = await chromium.launch({
    executablePath,
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  for (const shot of shots) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } });
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(`${base}/${shot.query}`, { waitUntil: 'load', timeout: 30000 });
    await sleep(1500);
    await page.screenshot({ path: join(outDir, shot.name), type: 'jpeg', quality: 82 });
    const state = await page.evaluate(() => window.__app?.state?.() ?? null);
    console.log(shot.name, JSON.stringify(state));
    if (errors.length > 0) {
      console.error(`PAGE ERRORS on ${shot.name}:`, errors);
      process.exit(1);
    }
    await page.close();
  }
  await browser.close();
  console.log('SHOTS DONE');
} finally {
  server.kill();
}
