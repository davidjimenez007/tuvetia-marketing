// Arma las páginas HTML de logo y footer con los tokens reales, las captura con Edge headless
// y las convierte a JPG dentro de marca/. Uso: node render.js <scratchpad>
const fs = require('fs');
const { execFileSync } = require('child_process');
const sharp = require('sharp');

const S = process.argv[2] || require('os').tmpdir() + '/tuvetia-marca';
const ROOT = 'c:/Users/Luciano/Desktop/tuvetia-content';
const OUT = S + '/render';
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(S + '/edge-profile', { recursive: true });
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:wght@600;700&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
const TOKENS = 'file:///' + ROOT + '/marca/tokens/tuvetia.css';

// Logo oficial de WhatsApp (mismo trazado que usa la app en Integraciones).
const WA = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413';

const glifo = (size, color) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" style="flex:none" aria-hidden="true"><path fill="${color}" fill-rule="evenodd" d="M32 8A24 24 0 1 1 32 56A24 24 0 1 1 32 8ZM44 22A5 5 0 1 1 44 32A5 5 0 1 1 44 22Z"/></svg>`;
const wa = (size, color) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="flex:none" aria-hidden="true"><path fill="${color}" fill-rule="evenodd" d="${WA}"/></svg>`;
const wordmark = (px, color) => `<span style="font-family:var(--display);font-weight:700;letter-spacing:-.02em;font-size:${px}px;line-height:1;color:${color}">Tuvetia</span>`;
const lockup = (px, g, t) => `<span style="display:inline-flex;align-items:center;gap:${Math.round(px * 0.28)}px">${glifo(Math.round(px * 1.25), g)}${wordmark(px, t)}</span>`;
const rotulo = (px, txt, color, extra) => `<div class="tv-rotulo" style="font-size:${px}px;${color ? 'color:' + color + ';' : ''}${extra || ''}">${txt}</div>`;

function page({ w, h, cls = '', css = '', body }) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS}"><link rel="stylesheet" href="${TOKENS}">
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{width:${w}px;height:${h}px;overflow:hidden}
body{font-family:var(--sans);color:var(--text);background:var(--ink);-webkit-font-smoothing:antialiased}
ul{list-style:none}${css}</style></head><body class="${cls}">${body}</body></html>`;
}

const P = {};
// ── LOGO ─────────────────────────────────────────────────────────────────────
const logoPage = (cls, g, t, bg) => ({ w: 1600, h: 900, cls, css: `body{display:grid;place-items:center;${bg ? 'background:' + bg : ''}}`, body: lockup(180, g, t) });
P['logo/logo-horizontal-claro'] = logoPage('tv-grano', 'var(--accent)', 'var(--text)');
P['logo/logo-horizontal-oscuro'] = logoPage('dark', 'var(--accent)', 'var(--text)');
P['logo/logo-horizontal-menta'] = logoPage('', '#ffffff', '#ffffff', 'var(--tv-mint-500)');
P['logo/avatar-menta'] = { w: 1080, h: 1080, css: 'body{display:grid;place-items:center;background:var(--tv-mint-500)}', body: glifo(720, '#ffffff') };
P['logo/avatar-claro'] = { w: 1080, h: 1080, cls: 'tv-grano', css: 'body{display:grid;place-items:center}', body: glifo(720, 'var(--accent)') };

// ── FOOTER · carrusel ────────────────────────────────────────────────────────
const tira = (h) => `<footer style="height:${h}px;flex:none;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 80px">
  ${lockup(40, 'var(--accent)', 'var(--text)')}
  ${rotulo(22, '@tuvetia')}
</footer>`;
P['footer/footer-carrusel-tira'] = { w: 1080, h: 150, css: 'body{display:flex;flex-direction:column}', body: tira(150) };
P['footer/footer-carrusel-slide'] = { w: 1080, h: 1350, cls: 'tv-grano', css: 'body{display:flex;flex-direction:column}', body: `
  <div style="flex:1;display:flex;flex-direction:column;padding:88px 80px 0">
    ${rotulo(22, 'Buscamos 10 veterinarios · 0/10')}
    <h1 class="tv-titular" style="font-size:96px;margin:auto 0">Ningún veterinario debería volver a escribir una ficha.</h1>
  </div>
  ${tira(150)}` };
P['footer/footer-carrusel-cta'] = { w: 1080, h: 1350, css: 'body{display:flex;flex-direction:column}', body: `
  <div class="tv-grano" style="flex:1;display:flex;flex-direction:column;padding:88px 80px 72px">
    ${lockup(40, 'var(--accent)', 'var(--text)')}
    <div style="margin:auto 0;display:flex;flex-direction:column;gap:30px">
      ${rotulo(22, 'Buscamos 10 veterinarios · 0/10')}
      <h1 class="tv-titular" style="font-size:118px">¿Eres veterinario?</h1>
      <p style="font-size:44px;line-height:1.3;color:var(--text-2);max-width:20ch">Buscamos los primeros 10 que lo prueben. Ustedes deciden qué construimos.</p>
    </div>
  </div>
  <footer style="flex:none;background:var(--tv-mint-500);color:#fff;padding:64px 80px;display:flex;align-items:center;gap:32px">
    ${wa(96, '#ffffff')}
    <div>
      <div style="font-family:var(--display);font-weight:700;letter-spacing:-.02em;font-size:58px;line-height:1.05;color:#fff">Escríbenos al WhatsApp</div>
      ${rotulo(20, 'WhatsApp directo · link en la bio', 'rgba(255,255,255,.78)', 'margin-top:16px')}
    </div>
  </footer>` };

// ── FOOTER · cierre de reel (1080×1920, safe zone inferior de 250px vacía) ───
P['footer/cierre-reel'] = { w: 1080, h: 1920, cls: 'tv-grano', css: 'body{display:flex;flex-direction:column;padding:120px 96px 250px}', body: `
  ${lockup(44, 'var(--accent)', 'var(--text)')}
  <div style="margin:auto 0;display:flex;flex-direction:column;align-items:flex-start;gap:38px">
    ${rotulo(24, 'Buscamos 10 veterinarios · 0/10')}
    <h1 class="tv-titular" style="font-size:136px">¿Eres veterinario?</h1>
    <p style="font-size:52px;line-height:1.28;color:var(--text-2);max-width:17ch">Buscamos los primeros 10 que lo prueben.</p>
    <a class="tv-btn" style="font-size:46px;height:auto;padding:30px 48px;border-radius:26px;gap:24px;box-shadow:var(--shadow-md)">${wa(56, 'currentColor')} Escríbenos al WhatsApp</a>
    ${rotulo(22, 'WhatsApp directo · link en la bio')}
  </div>` };

// ── FOOTER · web (landing) ───────────────────────────────────────────────────
const col = (t, items) => `<div>${rotulo(11, t)}<ul style="margin-top:16px;display:flex;flex-direction:column;gap:12px;font-size:16px;color:var(--text-2)">${items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
const webFooter = `<footer style="height:100%;display:flex;flex-direction:column;padding:72px 96px 0">
  <div style="flex:1;display:grid;grid-template-columns:1.7fr 1fr 1fr 1.4fr;gap:48px">
    <div>
      <div style="display:flex;align-items:center;gap:12px">${lockup(28, 'var(--accent)', 'var(--text)')}<span class="tv-beta" style="font-size:11px">Beta</span></div>
      <p style="margin-top:22px;font-size:19px;line-height:1.5;color:var(--text-2);max-width:30ch">Athos escucha la consulta y escribe la ficha. Tú revisas y firmas.</p>
      ${rotulo(11, 'Bogotá · Ginebra', null, 'margin-top:24px')}
    </div>
    ${col('Producto', ['Athos', 'Consultas', 'Pacientes', 'Agenda', 'Ventas'])}
    ${col('Tuvetia', ['Buscamos 10 veterinarios', 'Privacidad · Ley 1581', 'Términos', 'Ayuda'])}
    <div>${rotulo(11, 'Hablemos')}
      <a class="tv-btn" style="margin-top:16px;font-size:16px;height:50px;padding:0 22px;border-radius:12px;gap:10px">${wa(20, 'currentColor')} Escríbenos al WhatsApp</a>
      <p style="margin-top:14px;font-size:14px;line-height:1.5;color:var(--muted);max-width:26ch">Es el WhatsApp directo del equipo. Sin formularios.</p>
    </div>
  </div>
  <div style="flex:none;border-top:1px solid var(--border-soft);padding:24px 0 28px;display:flex;justify-content:space-between">
    ${rotulo(11, '© 2026 Tuvetia')}${rotulo(11, 'Ningún veterinario debería volver a escribir una ficha.')}
  </div>
</footer>`;
P['footer/footer-web-claro'] = { w: 1600, h: 480, cls: 'tv-grano', body: webFooter };
P['footer/footer-web-oscuro'] = { w: 1600, h: 480, cls: 'dark', body: webFooter };

// ── Render ───────────────────────────────────────────────────────────────────
(async () => {
  for (const [name, spec] of Object.entries(P)) {
    const htmlPath = `${OUT}/${name.replace('/', '__')}.html`;
    const png = `${OUT}/${name.replace('/', '__')}.png`;
    const jpg = `${ROOT}/marca/${name}.jpg`;
    fs.writeFileSync(htmlPath, page(spec));
    try {
      execFileSync(EDGE, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
        '--disable-extensions', '--force-device-scale-factor=1', `--user-data-dir=${S}/edge-profile`,
        '--virtual-time-budget=12000', `--window-size=${spec.w},${spec.h}`, `--screenshot=${png}`, 'file:///' + htmlPath
      ], { stdio: 'ignore', timeout: 90000 });
    } catch (e) { console.log('  ✗ edge falló en', name, e.message); continue; }
    if (!fs.existsSync(png)) { console.log('  ✗ sin captura', name); continue; }
    const meta = await sharp(png).metadata();
    await sharp(png).jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true }).toFile(jpg);
    console.log('  ✓', name + '.jpg', `${meta.width}×${meta.height}`, Math.round(fs.statSync(jpg).size / 1024) + ' KB');
  }
})();
