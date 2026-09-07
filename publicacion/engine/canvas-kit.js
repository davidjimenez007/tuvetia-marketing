/* ═══════════════════════════════════════════════════════════════════════
   MARKETING OS · CANVAS KIT
   Brand-agnostic drawing primitives for social cards, carousels and post
   visuals. Every colour, font and measure comes from window.BRAND — this
   file never hardcodes a brand.

   Load order in any generator page:
     <script src="../../engine/canvas-kit.js"></script>
     <script src="brand.config.js"></script>      → window.BRAND
     <script src="social/content.js"></script>    → window.CONTENT (uses CK)
     <script src="../../engine/hub-runtime.js"></script>

   Classic scripts on purpose: ES modules are blocked over file:// so the
   generators must open with a double click, no server and no build.
   ═══════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const CK = {};

  /* ── Theme resolution ────────────────────────────────────────────────
     A card is drawn in one of the two brand themes. Social assets use
     BRAND.socialTheme; documents and web previews usually use 'light'.   */

  let T = null;   // active theme object
  let B = null;   // active brand object

  CK.use = function (brand, themeName) {
    B = brand || global.BRAND;
    const name = themeName || B.socialTheme || 'dark';
    const t = B[name];
    T = {
      name,
      bg: t.bg,
      ink: t.ink,
      brand: t.brand,
      accent: t.accent || t.brand,
      muted: t.muted,
      soft: t.soft,
      border: t.border,
      card: t.card || t.bg,
    };
    return CK;
  };

  CK.theme = () => T;
  CK.brand = () => B;

  /* Canvas geometry. Defaults to 4:5 (1080×1350) — the one format that
     works as an Instagram post, a LinkedIn document slide and an X image. */
  CK.size = function (preset) {
    const c = (B && B.canvas) || {};
    const presets = {
      post: [1080, 1350],   // 4:5 — the default
      square: [1080, 1080], // 1:1
      story: [1080, 1920],  // 9:16
      wide: [1200, 675],    // 16:9 — X / OG images
    };
    const p = presets[preset || c.preset || 'post'] || presets.post;
    return { W: p[0], H: p[1] };
  };

  CK.margin = () => (B && B.canvas && B.canvas.margin) || 96;

  const F = {
    sans: () => (B && B.fonts && B.fonts.sans) || 'Inter',
    mono: () => (B && B.fonts && B.fonts.mono) || 'JetBrains Mono',
    serif: () => (B && B.fonts && B.fonts.serif) || 'Georgia',
    /* The headline family. A brand that has a separate display face declares
       it as fonts.display; otherwise headlines are set in the text sans. */
    display: () => (B && B.fonts && (B.fonts.display || B.fonts.sans)) || 'Inter',
  };
  CK.fonts = F;

  /* Quotes a family and appends a real fallback. Canvas falls back to a serif
     when a family is missing, so a font that failed to load would silently
     change the whole look instead of degrading to the nearest sans. */
  function q(family) {
    return `"${family}", system-ui, sans-serif`;
  }
  CK.q = q;

  /* ── Text measuring and wrapping ─────────────────────────────────────
     The original TESO cards hardcoded every line break. That does not
     survive a brand swap, so the kit wraps text itself and callers pass
     plain strings. An explicit array of lines is still honoured.          */

  CK.lines = function (ctx, text, maxWidth) {
    if (Array.isArray(text)) return text;
    const words = String(text).split(/\s+/);
    const out = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (line && ctx.measureText(test).width > maxWidth) {
        out.push(line);
        line = w;
      } else line = test;
    }
    if (line) out.push(line);
    return out;
  };

  /* Shrink-to-fit: reduces the font size until the block fits in maxLines. */
  CK.fit = function (ctx, text, maxWidth, size, weight, maxLines, family) {
    let s = size;
    for (let i = 0; i < 14; i++) {
      ctx.font = `${weight} ${s}px ${q(family || F.sans())}`;
      const ls = CK.lines(ctx, text, maxWidth);
      if (ls.length <= maxLines || s <= size * 0.55) return { size: s, lines: ls };
      s = Math.round(s * 0.93);
    }
    ctx.font = `${weight} ${s}px ${q(family || F.sans())}`;
    return { size: s, lines: CK.lines(ctx, text, maxWidth) };
  };

  /* ── Ground ──────────────────────────────────────────────────────────
     Flat brand background plus optional paper grain. The grain is what
     keeps a flat colour from looking like a default template.             */

  CK.base = function (ctx, opts) {
    const { W, H } = CK.size(opts && opts.preset);
    ctx.fillStyle = (opts && opts.bg) || T.bg;
    ctx.fillRect(0, 0, W, H);
    const grain = B && B.canvas && B.canvas.grain !== false;
    if (grain) {
      const rgb = hexToRgb(T.ink);
      const n = Math.round((W * H) / 560);
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = `rgba(${rgb},${0.006 + Math.random() * 0.018})`;
        ctx.fillRect(Math.random() * W, Math.random() * H, 1.3, 1.3);
      }
    }
    if (opts && opts.glow) CK.glow(ctx, opts.glow);
  };

  /* Soft radial glow — one per composition, never more. */
  CK.glow = function (ctx, o) {
    const { W, H } = CK.size();
    const cx = (o.x != null ? o.x : 0.5) * W;
    const cy = (o.y != null ? o.y : 0.35) * H;
    const r = (o.r != null ? o.r : 0.55) * W;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const rgb = hexToRgb(o.color || T.brand);
    g.addColorStop(0, `rgba(${rgb},${o.alpha != null ? o.alpha : 0.1})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };

  /* ── Eyebrow ─────────────────────────────────────────────────────────
     Mono, uppercase, wide tracking, with a brand dot. The single most
     recognisable piece of furniture in the system.                        */

  CK.eyebrow = function (ctx, text, y) {
    const M = CK.margin();
    const yy = y || 130;
    const tr = ((B.type && B.type.eyebrowTracking) || 0.19) * 25;
    ctx.beginPath();
    ctx.arc(M + 6, yy - 9, 7, 0, Math.PI * 2);
    ctx.fillStyle = T.brand;
    ctx.fill();
    ctx.font = `500 25px ${q(F.mono())}`;
    ctx.letterSpacing = tr.toFixed(1) + 'px';
    ctx.fillStyle = T.muted;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(String(text).toUpperCase(), M + 32, yy);
    ctx.letterSpacing = '0px';
  };

  /* ── Wordmark ────────────────────────────────────────────────────────
     Horizontal name + pulse dot on the left, domain on the right.        */

  CK.wordmark = function (ctx, y) {
    const { W, H } = CK.size();
    const M = CK.margin();
    const yy = y || H - 96;
    const word = B.wordmark || B.name;
    ctx.font = `900 40px ${q(F.sans())}`;
    ctx.letterSpacing = '-2px';
    ctx.fillStyle = T.ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(word, M, yy);
    const w = ctx.measureText(word).width;
    ctx.beginPath();
    ctx.arc(M + w + 16, yy + 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.letterSpacing = '0px';
    if (B.domain) {
      ctx.font = `400 24px ${q(F.mono())}`;
      ctx.fillStyle = T.soft;
      ctx.textAlign = 'right';
      ctx.fillText(B.domain, W - M, yy);
    }
    ctx.textBaseline = 'alphabetic';
  };

  /* Stacked mark (two short lines, e.g. TE / SO) for avatars and covers. */
  CK.mark = function (ctx, cx, cy, requested, opts) {
    const parts = (B.mark && B.mark.length ? B.mark : splitWord(B.wordmark || B.name));
    const o = opts || {};
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = o.color || T.ink;

    /* Shrink to the measured width: the tuned 0.388 ratio assumes very short
       lines, and a longer brand name would otherwise run past the margin. */
    let size = requested;
    const setFont = () => {
      ctx.font = `900 ${size}px ${q(F.sans())}`;
      ctx.letterSpacing = `${Math.round(-0.02 * size)}px`;
    };
    setFont();
    const safeW = CK.size().W - CK.margin() * 2;
    for (let i = 0; i < 24; i++) {
      const widest = Math.max(...parts.map(p => ctx.measureText(p).width));
      if (widest <= safeW) break;
      size = size * (safeW / widest) * 0.985;
      setFont();
    }
    const step = 0.853 * size;
    const draw = () => {
      parts.forEach((p, i) => {
        const off = (i - (parts.length - 1) / 2) * step;
        ctx.fillText(p, cx, cy + off);
      });
    };
    if (o.glow !== false && T.name === 'dark') {
      ctx.save();
      ctx.filter = `blur(${Math.round(0.16 * size)}px)`;
      ctx.globalAlpha = 0.9;
      draw();
      ctx.restore();
      ctx.save();
      ctx.filter = `blur(${Math.round(0.06 * size)}px)`;
      ctx.globalAlpha = 0.85;
      draw();
      ctx.restore();
    }
    draw();
    ctx.restore();
    ctx.letterSpacing = '0px';
  };

  /* ── Type blocks ─────────────────────────────────────────────────────
     Headlines are large at normal weight: the elegance comes from the
     size, not from the weight. Tracking tightens as size grows.          */

  CK.big = function (ctx, text, y, opts) {
    const o = opts || {};
    const { W } = CK.size();
    const M = CK.margin();
    const maxW = o.maxWidth || W - M * 2;
    const weight = o.weight || (B.type && B.type.headlineWeight) || 400;
    const tracking = (B.type && B.type.headlineTracking) != null ? B.type.headlineTracking : -0.035;
    const fitted = CK.fit(ctx, text, maxW, o.size || 84, weight, o.maxLines || 5, o.family || F.display());
    const size = fitted.size;
    ctx.letterSpacing = `${Math.round(tracking * size)}px`;
    ctx.fillStyle = o.color || T.ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const lh = size * (o.lineHeight || 1.08);
    fitted.lines.forEach((l, i) => ctx.fillText(l, o.x || M, y + i * lh));
    ctx.letterSpacing = '0px';
    return y + fitted.lines.length * lh;   // returns the next free baseline
  };

  CK.body = function (ctx, text, y, opts) {
    const o = opts || {};
    const { W } = CK.size();
    const M = CK.margin();
    const size = o.size || 33;
    const maxW = o.maxWidth || W - M * 2;
    ctx.font = `${o.weight || 400} ${size}px ${q(o.family || F.sans())}`;
    ctx.fillStyle = o.color || T.muted;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const lh = size * (o.lineHeight || 1.5);
    const ls = CK.lines(ctx, text, maxW);
    ls.forEach((l, i) => ctx.fillText(l, o.x || M, y + i * lh));
    return y + ls.length * lh;
  };

  /* ── Pills, bullets, tags ────────────────────────────────────────────  */

  CK.pill = function (ctx, text, x, y, active) {
    ctx.font = `500 30px ${q(F.sans())}`;
    const tw = ctx.measureText(text).width;
    const w = tw + 84, h = 72;
    const rgb = hexToRgb(T.ink);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 36);
    ctx.fillStyle = active ? T.ink : `rgba(${rgb},0.05)`;
    ctx.fill();
    ctx.strokeStyle = active ? T.ink : T.border;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 34, y + h / 2, 6, 0, Math.PI * 2);
    ctx.fillStyle = active ? T.bg : T.brand;
    ctx.fill();
    ctx.fillStyle = active ? T.bg : `rgba(${rgb},0.75)`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 56, y + h / 2 + 2);
    ctx.textBaseline = 'alphabetic';
    return w;
  };

  CK.bullets = function (ctx, items, y, opts) {
    const o = opts || {};
    const M = CK.margin();
    const size = o.size || 34;
    let yy = y;
    items.forEach(t => {
      ctx.beginPath();
      ctx.arc(M + 14, yy - 10, 6, 0, Math.PI * 2);
      ctx.fillStyle = T.brand;
      ctx.fill();
      ctx.font = `400 ${size}px ${q(F.sans())}`;
      ctx.fillStyle = o.color || T.ink;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(t, M + 46, yy);
      yy += size * (o.lineHeight || 2.3);
    });
    return yy;
  };

  CK.tag = function (ctx, text, y) {
    const { W, H } = CK.size();
    ctx.font = `500 22px ${q(F.mono())}`;
    ctx.letterSpacing = '3px';
    ctx.fillStyle = T.soft;
    ctx.textAlign = 'center';
    ctx.fillText(String(text).toUpperCase(), W / 2, y || H - 36);
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'left';
  };

  /* ── Composed card layouts ───────────────────────────────────────────
     These are the five shapes that carry almost every campaign. A brand's
     content.js composes them; it rarely needs raw canvas calls.           */

  /* Measures a title + optional body block and returns the baseline that
     centres it between the eyebrow and the wordmark. Hand-tuned y values only
     look right for one length of copy; this holds for any. */
  function centredStart(ctx, o) {
    const { W, H } = CK.size();
    const M = CK.margin();
    const maxW = o.maxWidth || W - M * 2;
    const weight = o.weight || (B.type && B.type.headlineWeight) || 400;
    const fitted = CK.fit(ctx, o.title, maxW, o.size || 96, weight, o.maxLines || 4, F.display());
    const titleH = fitted.lines.length * fitted.size * (o.lineHeight || 1.08);
    let extra = 0;
    if (o.body) {
      const bs = o.bodySize || 33;
      ctx.font = `400 ${bs}px ${q(F.sans())}`;
      extra = CK.lines(ctx, o.body, maxW).length * bs * 1.5 + 70;
    }
    if (o.items) extra = o.items.length * (o.itemSize || 34) * 2.3 + 90;
    const top = 250, bottom = H - 190;          // under the eyebrow, above the wordmark
    const free = bottom - top - (titleH + extra);
    return Math.round(top + Math.max(0, free) / 2 + fitted.size * 0.82);
  }

  /* Statement: eyebrow + one big line + optional body. The default card. */
  CK.cardStatement = function (ctx, o) {
    CK.base(ctx, o);
    if (o.eyebrow) CK.eyebrow(ctx, o.eyebrow);
    const startY = o.y != null ? o.y : centredStart(ctx, o);
    const after = CK.big(ctx, o.title, startY, { size: o.size || 96, maxLines: o.maxLines || 4 });
    if (o.body) CK.body(ctx, o.body, after + 70, { size: o.bodySize || 33 });
    CK.wordmark(ctx);
    if (o.tag) CK.tag(ctx, o.tag);
  };

  /* Dim setup → bright punchline. The highest-performing social shape. */
  CK.cardDimPunch = function (ctx, o) {
    CK.base(ctx, o);
    if (o.eyebrow) CK.eyebrow(ctx, o.eyebrow);
    const { W, H } = CK.size();
    const M = CK.margin();
    const size = o.size || 72;
    const maxW = W - M * 2;
    const weight = (B.type && B.type.headlineWeight) || 400;
    ctx.font = `${weight} ${size}px ${q(F.display())}`;
    const dim = CK.lines(ctx, o.dim, maxW);
    const punch = CK.lines(ctx, o.punch, maxW);
    const lh = size * 1.14;
    const total = (dim.length + punch.length) * lh + size * 0.5;
    let y = o.y || Math.round(H * 0.5 - total / 2 + size);
    const tracking = (B.type && B.type.headlineTracking) != null ? B.type.headlineTracking : -0.03;
    ctx.letterSpacing = `${Math.round(tracking * size)}px`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = T.muted;
    dim.forEach(l => { ctx.fillText(l, M, y); y += lh; });
    y += size * 0.5;
    ctx.fillStyle = T.ink;
    punch.forEach(l => { ctx.fillText(l, M, y); y += lh; });
    ctx.letterSpacing = '0px';
    CK.wordmark(ctx);
  };

  /* Numbered slide: the carousel workhorse (rule 01, step 02, myth 03…). */
  CK.cardNumbered = function (ctx, o) {
    CK.base(ctx, o);
    if (o.eyebrow) CK.eyebrow(ctx, o.eyebrow);
    const M = CK.margin();
    const num = String(o.number);
    ctx.font = `700 200px ${q(F.mono())}`;
    ctx.fillStyle = T.brand;
    ctx.globalAlpha = 0.22;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(num, M - 8, 430);
    ctx.globalAlpha = 1;
    ctx.font = `500 28px ${q(F.mono())}`;
    ctx.letterSpacing = '4px';
    ctx.fillStyle = T.brand;
    ctx.fillText(((o.label || 'rule') + ' ' + num).toUpperCase(), M, 520);
    ctx.letterSpacing = '0px';
    const after = CK.big(ctx, o.title, 630, { size: o.size || 78, maxLines: 3 });
    if (o.body) CK.body(ctx, o.body, after + 60, { size: 33 });
    CK.wordmark(ctx);
  };

  /* List card: a title plus dotted items (what happens on the call…). */
  CK.cardList = function (ctx, o) {
    CK.base(ctx, o);
    if (o.eyebrow) CK.eyebrow(ctx, o.eyebrow);
    const startY = o.y != null ? o.y : centredStart(ctx, Object.assign({ maxLines: 3, size: o.size || 90 }, o));
    const after = CK.big(ctx, o.title, startY, { size: o.size || 90, maxLines: 3 });
    CK.bullets(ctx, o.items, after + 90, { size: o.itemSize || 34 });
    CK.wordmark(ctx);
    if (o.tag) CK.tag(ctx, o.tag);
  };

  /* Pills card: loose chips over the frame, one highlighted. */
  CK.cardPills = function (ctx, o) {
    CK.base(ctx, o);
    if (o.eyebrow) CK.eyebrow(ctx, o.eyebrow);
    const M = CK.margin();
    const after = CK.big(ctx, o.title, o.y || 300, { size: o.size || 76, maxLines: 3 });
    let y = after + 60;
    const offsets = [0, 54, 14, 74, 0, 94, 34, 60];
    o.items.forEach((t, i) => {
      const active = (o.highlight != null ? i === o.highlight : false);
      CK.pill(ctx, t, M + offsets[i % offsets.length], y, active);
      y += 92;
    });
    CK.wordmark(ctx);
  };

  /* Cover card: the stacked mark centred, nothing else. Grid openers. */
  CK.cardMark = function (ctx, o) {
    const oo = o || {};
    CK.base(ctx, { glow: { alpha: 0.12, y: 0.42, r: 0.5 } });
    const { W, H } = CK.size();
    CK.mark(ctx, W / 2, H * 0.44, oo.size || Math.round(W * 0.19));
    if (oo.line) {
      ctx.font = `400 38px ${q(F.sans())}`;
      ctx.fillStyle = T.muted;
      ctx.textAlign = 'center';
      ctx.fillText(oo.line, W / 2, H * 0.78);
      ctx.textAlign = 'left';
    }
    if (oo.tag !== false) CK.tag(ctx, oo.tag || (B.domain || ''), H - 80);
  };

  /* ── Export ──────────────────────────────────────────────────────────  */

  CK.download = function (canvas, filename) {
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  };

  /* Renders every registered canvas once the webfonts are actually ready.
     Drawing before that silently falls back to a system font and every
     measurement is wrong, which is the classic bug in this pattern.      */
  CK.whenFontsReady = function (cb) {
    const specs = [
      [F.sans(), 400], [F.sans(), 900],
      [F.display(), (B && B.type && B.type.headlineWeight) || 400],
      [F.display(), 600], [F.display(), 700],
      [F.mono(), 500], [F.mono(), 700],
    ];

    /* Lay out a hidden sample of each face. This is the path that always
       triggers the download, including for families served with a percentage
       font-stretch (Archivo and every other Google variable font with a width
       axis), which the Font Loading API shorthand can fail to match. */
    const probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap';
    probe.innerHTML = specs.map(([fam, w]) =>
      `<span style="font-family:'${fam}';font-weight:${w};font-size:84px">Hg8</span>`).join('');
    document.body.appendChild(probe);

    const asked = specs.map(([fam, w]) => document.fonts.load(`${w} 84px "${fam}"`).catch(() => {}));
    const done = () => { probe.remove(); cb(); };

    Promise.all(asked).then(() => document.fonts.ready).then(done).catch(done);
  };

  /* ── Helpers ─────────────────────────────────────────────────────────  */

  function hexToRgb(hex) {
    const h = String(hex).replace('#', '').trim();
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
  }
  CK.hexToRgb = hexToRgb;

  function splitWord(w) {
    const s = String(w);
    if (s.length < 4) return [s];
    const half = Math.ceil(s.length / 2);
    return [s.slice(0, half), s.slice(half)];
  }

  global.CK = CK;
})(window);
