// Genera los logos SVG de Tuvetia con el wordmark ya trazado (outlines.json) + la chispa.
const fs = require('fs');
const S = process.argv[2] || require('os').tmpdir() + '/tuvetia-marca';
const OUT = 'c:/Users/Luciano/Desktop/tuvetia-content/marca/logo';
fs.mkdirSync(OUT, { recursive: true });
const O = JSON.parse(fs.readFileSync(__dirname + '/outlines.json', 'utf8'));
const W = O.wordmark700; // trazado a tamaño 100, baseline y=0
const C = { mint: '#12856a', mint300: '#7ed0ba', graphite: '#0c1613', snow: '#f5f8f7', white: '#ffffff' };
const r2 = n => Math.round(n * 100) / 100;

// La chispa: disco de radio R centrado en (cx,cy) con un ojo (r = R/4.8) desplazado (+.5R, -.21R) arriba a la derecha.
// Son las proporciones del glifo original de la app (64×64: disco r24 en 32,32 · ojo r5 en 44,27).
function chispa(cx, cy, R, fill) {
  const s = R / 24, r = 5 * s, ex = cx + 12 * s, ey = cy - 5 * s;
  const d = `M${r2(cx)} ${r2(cy - R)}A${r2(R)} ${r2(R)} 0 1 1 ${r2(cx)} ${r2(cy + R)}A${r2(R)} ${r2(R)} 0 1 1 ${r2(cx)} ${r2(cy - R)}Z` +
            `M${r2(ex)} ${r2(ey - r)}A${r2(r)} ${r2(r)} 0 1 1 ${r2(ex)} ${r2(ey + r)}A${r2(r)} ${r2(r)} 0 1 1 ${r2(ex)} ${r2(ey - r)}Z`;
  return `<path fill="${fill}" fill-rule="evenodd" d="${d}"/>`;
}
const svg = (vb, w, h, inner, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" role="img" aria-label="${label}"><title>${label}</title>${inner}</svg>\n`;
const write = (name, s) => { fs.writeFileSync(`${OUT}/${name}`, s); console.log('  ✓', name); };

// ── Glifo solo (64×64, como en la app) ───────────────────────────────────────
for (const [name, fill] of [['glifo.svg', C.mint], ['glifo-oscuro.svg', C.mint300], ['glifo-blanco.svg', C.white], ['glifo-grafito.svg', C.graphite]])
  write(name, svg('0 0 64 64', 64, 64, chispa(32, 32, 24, fill), 'Tuvetia'));

// ── Horizontal: chispa (caja 1.25× el cuerpo) + wordmark, alineados al centro de las mayúsculas ──
// Wordmark a tamaño 100: cap height 66 → centro de caps en y=-33. Disco r=46.875 (caja 125 × 48/64).
const R = 125 * 24 / 64, cy = -W.capHeight / 2, gapDisco = 60;
const textX = 2 * R + gapDisco - W.bbox.x1;       // el ink de la T arranca a 60u del borde del disco
const totalW = textX + W.bbox.x2;
const top = Math.min(cy - R, W.bbox.y1), bottom = Math.max(cy + R, W.bbox.y2);
const pad = 6;
const vbH = `${r2(-pad)} ${r2(top - pad)} ${r2(totalW + pad * 2)} ${r2(bottom - top + pad * 2)}`;
const horiz = (g, t) => chispa(R, cy, R, g) + `<path fill="${t}" transform="translate(${r2(textX)} 0)" d="${W.d}"/>`;
const hw = Math.round(totalW + pad * 2), hh = Math.round(bottom - top + pad * 2);
write('logo-horizontal.svg', svg(vbH, hw, hh, horiz(C.mint, C.graphite), 'Tuvetia'));
write('logo-horizontal-oscuro.svg', svg(vbH, hw, hh, horiz(C.mint300, C.snow), 'Tuvetia'));
write('logo-horizontal-blanco.svg', svg(vbH, hw, hh, horiz(C.white, C.white), 'Tuvetia'));
write('logo-horizontal-grafito.svg', svg(vbH, hw, hh, horiz(C.graphite, C.graphite), 'Tuvetia'));

// ── Wordmark solo ─────────────────────────────────────────────────────────────
const ww = W.bbox.x2 - W.bbox.x1, wh = W.bbox.y2 - W.bbox.y1;
write('wordmark.svg', svg(`${r2(W.bbox.x1 - pad)} ${r2(W.bbox.y1 - pad)} ${r2(ww + pad * 2)} ${r2(wh + pad * 2)}`, Math.round(ww + pad * 2), Math.round(wh + pad * 2),
  `<path fill="${C.graphite}" d="${W.d}"/>`, 'Tuvetia'));

// ── Vertical: chispa grande arriba, wordmark centrado abajo ───────────────────
const Rv = 62, gapV = 44;
const vW = ww, cxV = vW / 2;
const baseline = Rv * 2 + gapV - W.bbox.y1;       // el tope del wordmark queda a gapV del disco
const vH = baseline + W.bbox.y2;
const vbV = `${r2(-pad)} ${r2(-pad)} ${r2(vW + pad * 2)} ${r2(vH + pad * 2)}`;
const vert = (g, t) => chispa(cxV, Rv, Rv, g) + `<path fill="${t}" transform="translate(${r2(-W.bbox.x1)} ${r2(baseline)})" d="${W.d}"/>`;
write('logo-vertical.svg', svg(vbV, Math.round(vW + pad * 2), Math.round(vH + pad * 2), vert(C.mint, C.graphite), 'Tuvetia'));
write('logo-vertical-blanco.svg', svg(vbV, Math.round(vW + pad * 2), Math.round(vH + pad * 2), vert(C.white, C.white), 'Tuvetia'));

// ── Avatar 1:1 (foto de perfil) ───────────────────────────────────────────────
write('avatar.svg', svg('0 0 512 512', 512, 512, `<rect width="512" height="512" rx="112" fill="${C.mint}"/>` + chispa(256, 256, 156, C.white), 'Tuvetia'));
write('avatar-claro.svg', svg('0 0 512 512', 512, 512, `<rect width="512" height="512" rx="112" fill="${C.white}"/>` + chispa(256, 256, 156, C.mint), 'Tuvetia'));
write('avatar-circular.svg', svg('0 0 512 512', 512, 512, `<circle cx="256" cy="256" r="256" fill="${C.mint}"/>` + chispa(256, 256, 156, C.white), 'Tuvetia'));
console.log('horizontal viewBox:', vbH, '· vertical viewBox:', vbV);
