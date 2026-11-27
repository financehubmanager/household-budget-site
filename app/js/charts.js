// charts.js — Grafik SVG tulisan tangan (tanpa library): donut breakdown,
// tren 12 bulan (bar + garis tabungan), bilah pace per kategori, dan aliran
// Sankey-lite pemasukan -> kategori -> terpakai/tersisa. Semua murni SVG
// inline agar tetap ringan dan tanpa network.
import { fmtRpShort, fmtRp, monthShort } from './format.js';

// Donut: irisan per kategori dari semua uang yang keluar (pengeluaran +
// tabungan). Dana Cadangan tidak punya irisan: belum terpakai.
export function donutChart(byCat, categories, size = 200) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const inner = r - 26;
  const entries = categories
    .filter((c) => c.id !== 'cadangan' && byCat[c.id].spent > 0)
    .map((c) => ({ ...c, value: byCat[c.id].spent }));
  const total = entries.reduce((s, e) => s + e.value, 0);
  if (total <= 0) {
    return `<svg viewBox="0 0 ${size} ${size}" class="donut" role="img" aria-label="Belum ada pengeluaran">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E8E0D2" stroke-width="26"/>
      <text x="${cx}" y="${cy}" text-anchor="middle" class="donut-center">Rp 0</text></svg>`;
  }
  let angle = -Math.PI / 2;
  const parts = [];
  for (const e of entries) {
    const frac = e.value / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2;
    angle = a1;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const xi1 = cx + inner * Math.cos(a1);
    const yi1 = cy + inner * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0);
    const yi0 = cy + inner * Math.sin(a0);
    parts.push(`<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xi1.toFixed(1)} ${yi1.toFixed(1)} A ${inner} ${inner} 0 ${large} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)} Z" fill="${e.color}"><title>${e.name}: ${fmtRp(e.value)}</title></path>`);
  }
  return `<svg viewBox="0 0 ${size} ${size}" class="donut" role="img" aria-label="Breakdown pengeluaran">
    ${parts.join('')}
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-center-num">${fmtRpShort(total)}</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-center-lbl">keluar bln ini</text>
  </svg>`;
}

// Tren 12 bulan: bar pengeluaran + garis pemasukan + titik tabungan.
export function trendChart(months, width = 640, height = 190) {
  const padL = 44;
  const padB = 22;
  const padT = 12;
  const w = width - padL - 8;
  const h = height - padT - padB;
  const max = Math.max(...months.map((m) => Math.max(m.income, m.spent, m.saved)), 1000000);
  const top = Math.ceil(max / 5000000) * 5000000;
  const y = (v) => padT + h - (v / top) * h;
  const slot = w / months.length;
  const barW = Math.min(26, slot * 0.52);
  const grid = [0, 0.5, 1].map((f) => {
    const v = top * f;
    return `<line x1="${padL}" y1="${y(v)}" x2="${width - 8}" y2="${y(v)}" class="grid"/><text x="${padL - 6}" y="${y(v) + 4}" text-anchor="end" class="axis">${fmtRpShort(v)}</text>`;
  }).join('');
  const bars = months.map((m, i) => {
    const x = padL + i * slot + (slot - barW) / 2;
    const spentH = h - (y(m.spent) - padT);
    const savedH = h - (y(m.saved) - padT);
    return `<rect x="${x.toFixed(1)}" y="${y(m.spent).toFixed(1)}" width="${barW.toFixed(1)}" height="${spentH.toFixed(1)}" rx="3" fill="#C2410C" opacity="${m.current ? 1 : 0.8}"><title>${monthShort(m.year, m.month)}: keluar ${fmtRp(m.spent)}</title></rect>`
      + `<rect x="${x.toFixed(1)}" y="${y(m.saved).toFixed(1)}" width="${barW.toFixed(1)}" height="${savedH.toFixed(1)}" rx="3" fill="#C89B3C" opacity="0.85"><title>${monthShort(m.year, m.month)}: ditabung ${fmtRp(m.saved)}</title></rect>`;
  }).join('');
  // Garis pemasukan.
  const pts = months.map((m, i) => `${(padL + i * slot + slot / 2).toFixed(1)},${y(m.income).toFixed(1)}`).join(' ');
  const labels = months.map((m, i) => {
    const x = padL + i * slot + slot / 2;
    return `<text x="${x.toFixed(1)}" y="${height - 6}" text-anchor="middle" class="axis${m.current ? ' axis-now' : ''}">${monthShort(m.year, m.month)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${width} ${height}" class="trend" role="img" aria-label="Tren 12 bulan">
    ${grid}
    ${bars}
    <polyline points="${pts}" fill="none" stroke="#16294A" stroke-width="2" stroke-linejoin="round"/>
    ${months.map((m, i) => `<circle cx="${(padL + i * slot + slot / 2).toFixed(1)}" cy="${y(m.income).toFixed(1)}" r="3" fill="#16294A"><title>${monthShort(m.year, m.month)}: masuk ${fmtRp(m.income)}</title></circle>`).join('')}
    ${labels}
  </svg>`;
}

// Bilah pace: terpakai vs harapan s.d. hari ke-N (garis penanda).
export function paceBar(assigned, spent, day, daysInMonth) {
  const expected = assigned * (day / daysInMonth);
  const pct = assigned > 0 ? Math.min(100, (spent / assigned) * 100) : 0;
  const mark = assigned > 0 ? Math.min(100, (expected / assigned) * 100) : 0;
  const over = spent > assigned;
  const cls = over ? 'pace-fill over' : (spent > expected ? 'pace-fill warm' : 'pace-fill ok');
  return `<div class="pace" role="img" aria-label="Terpakai ${fmtRp(spent)} dari ${fmtRp(assigned)}">
    <div class="pace-track"><div class="${cls}" style="width:${pct.toFixed(1)}%"></div>
    <div class="pace-mark" style="left:${mark.toFixed(1)}%"></div></div>
  </div>`;
}

// Sankey-lite: pemasukan -> kelompok belanja -> terpakai / ditabung / sisa.
// Tiga kolom, pita SVG dengan lebar sebanding jumlah.
export function sankeyChart(summary, width = 640, height = 240) {
  const groups = [
    { label: 'Belanja & hidup', value: 0, color: '#2E7D32' },
    { label: 'Tagihan & cicilan', value: 0, color: '#F9A825' },
    { label: 'Sekolah & sehat', value: 0, color: '#6A1B9A' },
    { label: 'Hiburan & lain', value: 0, color: '#AD1457' },
  ];
  const map = {
    belanja: 0, makan: 0, transport: 0, tagihan: 1, cicilan: 1, sekolah: 2, kesehatan: 2, hiburan: 3, pakaian: 3,
  };
  for (const [id, v] of Object.entries(summary.byCat)) {
    if (id === 'tabungan' || id === 'cadangan') continue;
    const g = map[id];
    if (g != null) groups[g].value += v.spent;
  }
  const income = summary.income;
  const saved = summary.saved;
  const remaining = summary.remaining;
  const scale = (height - 70) / Math.max(income, 1);
  const colX = [8, width / 2 - 70, width - 118];
  const colW = 110;
  const yIncome = 20;
  const hIncome = Math.max(8, income * scale);
  let gy = 20;
  const mid = groups.map((g) => {
    const h = Math.max(6, g.value * scale);
    const item = { ...g, y: gy, h };
    gy += h + 12;
    return item;
  });
  const outY = { spent: 20, saved: 20 + (income - saved - remaining) * scale + 12, remaining: 20 + (income - remaining) * scale + 24 };
  const outH = {
    spent: Math.max(6, (income - saved - remaining) * scale),
    saved: Math.max(6, saved * scale),
    remaining: Math.max(6, remaining * scale),
  };
  const band = (x0, y0, x1, y1, h0, h1, color) => {
    const mx = (x0 + x1) / 2;
    return `<path d="M ${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1} L ${x1} ${y1 + h1} C ${mx} ${y1 + h1}, ${mx} ${y0 + h0}, ${x0} ${y0 + h0} Z" fill="${color}" opacity="0.45"/>`;
  };
  const bands = [];
  // Pemasukan -> tiap kelompok.
  let iy = yIncome;
  for (const g of mid) {
    bands.push(band(colX[0] + colW, iy, colX[1], g.y, g.value * scale, g.h, g.color));
    iy += g.value * scale;
  }
  // Kelompok -> terpakai (semua kelompok mengalir ke "Terpakai").
  let oy = outY.spent;
  for (const g of mid) {
    bands.push(band(colX[1] + colW, g.y, colX[2], oy, g.h, g.h, g.color));
    oy += g.h;
  }
  // Tabungan & sisa langsung dari pemasukan (pita tipis di bawah).
  const saveY = yIncome + (income - saved - remaining) * scale;
  bands.push(band(colX[0] + colW, saveY, colX[2], outY.saved, saved * scale, outH.saved, '#16294A'));
  const remY = yIncome + (income - remaining) * scale;
  bands.push(band(colX[0] + colW, remY, colX[2], outY.remaining, remaining * scale, outH.remaining, '#78909C'));
  const node = (x, y, h, color, label, value) => `<rect x="${x}" y="${y}" width="${colW}" height="${Math.max(6, h)}" rx="4" fill="${color}"/><text x="${x + colW / 2}" y="${y + Math.max(6, h) + 14}" text-anchor="middle" class="sankey-lbl">${label}</text><text x="${x + colW / 2}" y="${y + Math.max(6, h) + 28}" text-anchor="middle" class="sankey-val">${fmtRpShort(value)}</text>`;
  return `<svg viewBox="0 0 ${width} ${height}" class="sankey" role="img" aria-label="Aliran uang bulan ini">
    ${bands.join('')}
    ${node(colX[0], yIncome, hIncome, '#16294A', 'Pemasukan', income)}
    ${mid.map((g) => node(colX[1], g.y, g.h, g.color, g.label, g.value)).join('')}
    ${node(colX[2], outY.spent, outH.spent, '#C2410C', 'Terpakai', income - saved - remaining)}
    ${node(colX[2], outY.saved, outH.saved, '#16294A', 'Ditabung', saved)}
    ${node(colX[2], outY.remaining, outH.remaining, '#78909C', 'Sisa', remaining)}
  </svg>`;
}
