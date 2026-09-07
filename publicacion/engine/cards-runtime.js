/* ═══════════════════════════════════════════════════════════════════════
   MARKETING OS · CARDS RUNTIME
   A standalone gallery for visuals that are not tied to a publishing
   calendar: brand cards, ad creatives, carousel batches, profile art.
   Reads window.BRAND + window.CARDS. Each card previews live and exports
   a PNG; captions copy to the clipboard on click.
   ═══════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const GAL = {};

  GAL.mount = function () {
    const B = global.BRAND;
    const D = global.CARDS;
    /* Wording, overridable from CARDS.ui so the chrome matches the content. */
    const L = Object.assign({ caption: 'Caption', copy: 'copy', copied: 'copied' }, (D && D.ui) || {});
    if (!B || !D) {
      document.body.innerHTML = '<p style="padding:40px;font-family:monospace">' +
        'Missing brand.config.js or cards data — check the script tags in this file.</p>';
      return;
    }

    /* The gallery previews social assets, so it wears the social theme —
       you judge a card against the ground it will actually sit on. */
    const themeName = B.socialTheme || 'dark';
    const t = B[themeName];
    const r = document.documentElement.style;
    r.setProperty('--bg', t.bg);
    r.setProperty('--ink', t.ink);
    r.setProperty('--card', t.card || t.bg);
    r.setProperty('--cream', t.cream || t.card || t.bg);
    r.setProperty('--brand', t.brand);
    r.setProperty('--accent', t.accent || t.brand);
    r.setProperty('--muted', t.muted);
    r.setProperty('--soft', t.soft);
    r.setProperty('--border', t.border);
    r.setProperty('--border-strong', t.borderStrong || t.border);
    r.setProperty('--font-sans', `"${B.fonts.sans}", system-ui, sans-serif`);
    r.setProperty('--font-mono', `"${B.fonts.mono}", ui-monospace, monospace`);
    if (themeName === 'dark') document.body.classList.add('theme-dark');
    if (B.fonts.googleUrl) {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = B.fonts.googleUrl;
      document.head.appendChild(l);
    }
    document.title = `${B.name} — visual assets`;
    CK.use(B, themeName);

    const logo = `<span class="nav-logo">${esc(B.wordmark || B.name)}<span class="nav-dot"></span></span>`;
    document.body.innerHTML = `
<nav>${logo}<div class="nav-links">${(D.sets || []).map((s, i) => `<a class="nav-link" href="#set${i}">${esc(s.nav || s.label)}</a>`).join('')}</div></nav>
<header>
  <div class="eyebrow"><span class="b-dot"></span>${esc(D.eyebrow || 'Visual assets')}</div>
  <h1>${esc(D.title || 'Preview and download.')}</h1>
  <p class="header-sub">${D.intro || 'Every card renders at its real export size. <strong>Download PNG</strong> to export, click a caption to copy it.'}</p>
</header>
<div id="content"></div>
<footer>${logo}<p>${D.footer || ''}</p></footer>`;

    const content = document.getElementById('content');
    const jobs = [];

    (D.sets || []).forEach((set, si) => {
      const sec = document.createElement('section');
      sec.id = 'set' + si;
      sec.innerHTML =
        `<div class="week-head">
           <p class="week-label">${esc(set.label)}</p>
           ${set.title ? `<h2 class="week-title">${esc(set.title)}</h2>` : ''}
           ${set.sub ? `<p class="week-sub">${set.sub}</p>` : ''}
         </div>`;

      const grid = document.createElement('div');
      grid.className = 'canvas-grid';
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';

      (set.cards || []).forEach(cd => {
        const cell = document.createElement('div');
        cell.className = 'canvas-cell';
        const { W, H } = CK.size(cd.preset);
        const el = document.createElement('canvas');
        el.width = W; el.height = H;
        el.style.background = t.bg;
        const btn = document.createElement('button');
        btn.className = 'dl-btn';
        btn.textContent = '↓ ' + (cd.label || 'PNG');
        btn.onclick = () => CK.download(el, `${B.slug}-${cd.id}.png`);
        cell.appendChild(el);
        cell.appendChild(btn);

        if (cd.caption) {
          const cap = document.createElement('div');
          cap.className = 'copyblock';
          cap.style.marginTop = '10px';
          cap.style.textAlign = 'left';
          cap.innerHTML = `<p class="lbl">${esc(L.caption)}</p><pre>${esc(cd.caption)}</pre><button class="copy-btn">${esc(L.copy)}</button>`;
          cap.querySelector('.copy-btn').onclick = ev => {
            navigator.clipboard.writeText(cd.caption).then(() => {
              ev.target.textContent = L.copied;
              ev.target.classList.add('ok');
              setTimeout(() => { ev.target.textContent = L.copy; ev.target.classList.remove('ok'); }, 1400);
            });
          };
          cell.appendChild(cap);
        }

        grid.appendChild(cell);
        jobs.push(() => {
          try { cd.draw(el.getContext('2d')); }
          catch (e) { console.error('card ' + cd.id, e); }
        });
      });

      sec.appendChild(grid);
      content.appendChild(sec);
    });

    CK.whenFontsReady(() => jobs.forEach(j => j()));
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  global.GALLERY = GAL;
})(window);
