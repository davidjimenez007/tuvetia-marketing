/* ═══════════════════════════════════════════════════════════════════════
   MARKETING OS · HUB RUNTIME
   Turns window.BRAND + window.CONTENT into the publishing hub: every piece
   of the month with its day, account, hour, copy-to-clipboard text,
   downloadable PNG and a published checkbox that survives a reload.

   A brand's hub.html contains nothing but four script tags and a mount
   call, so nothing here ever needs editing per brand.
   ═══════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const HUB = {};

  /* Visible wording. A brand publishing in another language overrides any of
     these through CONTENT.ui — the chrome should never be in a different
     language from the content it frames. */
  const UI = {
    published: 'published',
    copy: 'copy',
    copied: 'copied',
    all: 'All',
    progress: (n, total) => `${n} / ${total} published`,
  };
  function t(C) { return Object.assign({}, UI, C.ui || {}); }

  /* Badge class per platform style keyword — see engine/ui.css */
  const STYLE_CLASS = {
    solid: 'b-solid',
    outline: 'b-outline',
    ink: 'b-ink',
    inkline: 'b-inkline',
    quiet: 'b-quiet',
    soft: 'b-soft',
  };

  /* ── Theme ───────────────────────────────────────────────────────────
     The hub chrome uses the brand's document theme (light unless the brand
     is dark-first). Cards inside it are always drawn in BRAND.socialTheme. */

  function applyTheme(B) {
    const name = B.docTheme || (B.light ? 'light' : 'dark');
    const t = B[name] || B.light || B.dark;
    const r = document.documentElement.style;
    r.setProperty('--bg', t.bg);
    r.setProperty('--ink', t.ink);
    r.setProperty('--card', t.card || t.bg);
    r.setProperty('--cream', t.cream || t.card || t.bg);
    r.setProperty('--brand', t.brand);
    r.setProperty('--accent', t.accent || t.brand);
    /* The schedule block is inverted, so its accent must come from the dark
       palette — the light brand colour is unreadable on an ink ground. */
    const inv = B[(B.docTheme || 'light') === 'light' ? 'dark' : 'light'] || t;
    r.setProperty('--accent-inverted', inv.accent || inv.brand);
    r.setProperty('--muted', t.muted);
    r.setProperty('--soft', t.soft);
    r.setProperty('--border', t.border);
    r.setProperty('--border-strong', t.borderStrong || t.border);
    r.setProperty('--radius', (B.type && B.type.radius) || '1rem');
    r.setProperty('--font-sans', `"${B.fonts.sans}", system-ui, sans-serif`);
    r.setProperty('--font-mono', `"${B.fonts.mono}", ui-monospace, monospace`);
    if (name === 'dark') document.body.classList.add('theme-dark');
    if (B.fonts.googleUrl) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = B.fonts.googleUrl;
      document.head.appendChild(l);
    }
    document.title = `${B.name} — content hub`;
  }

  /* ── Schedule lookup ─────────────────────────────────────────────────
     CONTENT.times is declarative: per platform, a default hour plus any
     per-weekday overrides. A brand can still pass a function instead.    */

  function timeFor(C, item) {
    if (typeof C.times === 'function') return C.times(item) || '';
    const day = String(item.day || '').split(' ')[0].toUpperCase();
    if (day === 'SETUP' || day === 'WEEKLY') return '';
    const map = (C.times || {})[item.platform];
    if (!map) return '';
    if (typeof map === 'string') return map;
    return map[day] || map.DEFAULT || '';
  }

  /* ── Render ──────────────────────────────────────────────────────────  */

  HUB.mount = function (opts) {
    const B = global.BRAND;
    const C = global.CONTENT;
    if (!B || !C) {
      document.body.innerHTML = '<p style="padding:40px;font-family:monospace">' +
        'Missing brand.config.js or social/content.js — check the script tags in this file.</p>';
      return;
    }
    applyTheme(B);
    CK.use(B, B.socialTheme || 'dark');
    const L = t(C);

    const storeKey = `mos:${B.slug}:${C.id || 'month-1'}:done`;
    const viewKey = `mos:${B.slug}:${C.id || 'month-1'}:view`;
    const done = readJson(storeKey, {});
    let view = localStorage.getItem(viewKey) || 'all';

    document.body.innerHTML = chrome(B, C, L);
    const content = document.getElementById('content');
    const canvasJobs = [];
    let total = 0;

    C.weeks.forEach(week => {
      const sec = document.createElement('section');
      sec.id = week.id;
      sec.innerHTML =
        `<div class="week-head">
           <p class="week-label">${esc(week.label)}</p>
           <h2 class="week-title">${esc(week.title)}</h2>
           ${week.sub ? `<p class="week-sub">${week.sub}</p>` : ''}
         </div>`;

      week.items.forEach((item, i) => {
        total++;
        const key = `${week.id}-${i}`;
        const plat = (C.platforms || {})[item.platform] || { name: item.platform, style: 'quiet' };
        const time = timeFor(C, item);
        const card = document.createElement('div');
        card.className = 'item' + (done[key] ? ' done' : '');
        card.dataset.platform = item.platform;

        const badges =
          `<span class="badge b-day">${esc(item.day)}${time ? ' · ' + time : ''}</span>` +
          `<span class="badge ${STYLE_CLASS[plat.style] || 'b-quiet'}">${esc(plat.name)}</span>`;

        card.innerHTML =
          `<div class="item-head">
             ${badges}
             <span class="item-title">${esc(item.title)}</span>
             <label class="check"><input type="checkbox" ${done[key] ? 'checked' : ''}> ${esc(L.published)}</label>
           </div>
           ${item.note ? `<p class="item-note">${item.note}</p>` : ''}`;

        if (item.canvases && item.canvases.length) {
          const grid = document.createElement('div');
          grid.className = 'canvas-grid';
          item.canvases.forEach(cv => {
            const cell = document.createElement('div');
            cell.className = 'canvas-cell';
            const { W, H } = CK.size(cv.preset);
            const el = document.createElement('canvas');
            el.width = W; el.height = H;
            el.style.background = (B[B.socialTheme || 'dark'] || {}).bg || '#000';
            const btn = document.createElement('button');
            btn.className = 'dl-btn';
            btn.textContent = '↓ ' + (cv.label || 'PNG');
            btn.onclick = () => CK.download(el, `${B.slug}-${cv.id}.png`);
            cell.appendChild(el);
            cell.appendChild(btn);
            grid.appendChild(cell);
            canvasJobs.push(() => {
              try { cv.draw(el.getContext('2d')); }
              catch (e) { console.error('canvas ' + cv.id, e); }
            });
          });
          card.appendChild(grid);
        }

        (item.blocks || []).forEach(bl => {
          const box = document.createElement('div');
          box.className = 'copyblock';
          box.innerHTML =
            `<p class="lbl">${esc(bl.lbl)}</p>
             <pre>${esc(bl.text)}</pre>
             <button class="copy-btn">${esc(L.copy)}</button>`;
          box.querySelector('.copy-btn').onclick = ev => {
            navigator.clipboard.writeText(bl.text).then(() => {
              const b = ev.target;
              b.textContent = L.copied;
              b.classList.add('ok');
              setTimeout(() => { b.textContent = L.copy; b.classList.remove('ok'); }, 1400);
            });
          };
          card.appendChild(box);
        });

        card.querySelector('.check input').onchange = ev => {
          done[key] = ev.target.checked;
          localStorage.setItem(storeKey, JSON.stringify(done));
          card.classList.toggle('done', ev.target.checked);
          updateProgress();
        };

        sec.appendChild(card);
      });

      content.appendChild(sec);
    });

    /* Filters — hide items from other accounts, and any week left empty */
    function applyView() {
      document.querySelectorAll('.item').forEach(el => {
        el.style.display = (view === 'all' || el.dataset.platform === view) ? '' : 'none';
      });
      document.querySelectorAll('#content section').forEach(sec => {
        const any = [...sec.querySelectorAll('.item')].some(el => el.style.display !== 'none');
        sec.style.display = any ? '' : 'none';
      });
      document.querySelectorAll('.fbtn').forEach(b => {
        b.classList.toggle('active', b.dataset.f === view);
      });
      localStorage.setItem(viewKey, view);
    }
    document.querySelectorAll('.fbtn').forEach(b => {
      b.onclick = () => { view = b.dataset.f; applyView(); };
    });

    function updateProgress() {
      const n = Object.values(done).filter(Boolean).length;
      document.getElementById('progressFill').style.width = total ? (n / total * 100) + '%' : '0%';
      document.getElementById('progressLabel').textContent = L.progress(n, total);
    }

    applyView();
    updateProgress();

    /* Canvases are drawn only once the webfonts have really loaded —
       drawing earlier measures a fallback font and every layout is off. */
    CK.whenFontsReady(() => canvasJobs.forEach(j => j()));
  };

  /* ── Page chrome ─────────────────────────────────────────────────────  */

  function chrome(B, C, L) {
    const plats = C.platforms || {};
    const filters = [`<button class="fbtn" data-f="all">${esc(L.all)}</button>`]
      .concat(Object.keys(plats).map(k =>
        `<button class="fbtn ${plats[k].style === 'solid' ? 'primary' : ''}" data-f="${k}">${esc(plats[k].short || plats[k].name)}</button>`))
      .join('');

    const howto = (C.howto || [])
      .map(h => `<div class="howto-item"><strong>${esc(h.title)}</strong>${h.text}</div>`)
      .join('');

    const slots = (C.schedule || [])
      .map(s => `<div class="slot"><span class="slot-time">${esc(s.when)}</span><span class="slot-what">${esc(s.what)}</span></div>`)
      .join('');

    const navLinks = C.weeks
      .map(w => `<a class="nav-link" href="#${w.id}">${esc(w.nav || w.label.split('·')[0].trim())}</a>`)
      .join('');

    const logo = `<span class="nav-logo">${esc(B.wordmark || B.name)}<span class="nav-dot"></span></span>`;

    return `
<nav>${logo}<div class="nav-links">${navLinks}</div></nav>

<header>
  <div class="eyebrow"><span class="b-dot"></span>${esc(C.eyebrow || ('Content hub · ' + (C.period || '')))}</div>
  <h1>${esc(C.title || 'A month of content, ready to publish.')}</h1>
  <p class="header-sub">${C.intro || 'Every piece is ready: <strong>copy → paste → publish</strong> the texts, <strong>download PNG</strong> for the visuals. Tick each piece as you publish it — the checklist saves itself in this browser.'}</p>
</header>

${howto ? `<div class="howto">${howto}</div>` : ''}

<div class="filterbar">${filters}</div>

${slots ? `<div class="schedule"><div class="schedule-box">
  <p class="schedule-title">${esc(C.scheduleTitle || 'The fixed schedule · same every week')}</p>
  <div class="schedule-grid">${slots}</div>
  ${C.scheduleNote ? `<p class="schedule-note">${C.scheduleNote}</p>` : ''}
</div></div>` : ''}

<div class="progress-wrap">
  <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
  <p class="progress-label" id="progressLabel">0 / 0 published</p>
</div>

<div id="content"></div>

<footer>${logo}<p>${C.footer || ''}</p></footer>`;
  }

  /* ── Helpers ─────────────────────────────────────────────────────────  */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function readJson(k, fallback) {
    try { return JSON.parse(localStorage.getItem(k)) || fallback; }
    catch (e) { return fallback; }
  }

  global.HUB = HUB;
})(window);
