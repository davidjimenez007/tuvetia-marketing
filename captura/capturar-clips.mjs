/**
 * capturar-clips.mjs — graba los 13 clips de UI real que consume el video de Remotion.
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node capturar-clips.mjs ./tuvetia-app-rediseno-full.html
 *
 * Sale un .webm por clip en ./clips-raw. Despues, para pasarlos a mp4 CFR 30fps
 * (Remotion odia el framerate variable de Playwright):
 *
 *   for f in clips-raw/*.webm; do
 *     ffmpeg -i "$f" -vf "fps=30,scale=1920:1080:flags=lanczos" \
 *            -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p \
 *            "clips/$(basename "${f%.webm}").mp4"
 *   done
 *
 * Por que este script y no una grabacion de pantalla a mano:
 *   · determinista — se fija Math.random, asi que la transcripcion siempre sale igual
 *   · sin cursor del sistema, sin barra del navegador, sin notificaciones
 *   · reproducible: si cambias el guion, volves a correrlo y listo
 */

import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const APP = path.resolve(process.argv[2] ?? "./tuvetia-app-rediseno-full.html");
const OUT = path.resolve("./clips-raw");
const VIEWPORT = { width: 1920, height: 1080 };

if (!existsSync(APP)) {
  console.error(`\n✗ No encuentro el HTML de la app en:\n  ${APP}\n`);
  console.error(`Pasá la ruta como argumento:\n  node capturar-clips.mjs "C:\\ruta\\a\\tuvetia-app-rediseno-full.html"\n`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

/* Math.random determinista (mulberry32). La app lo usa en SIM.stream y en la
   cadencia entre lineas; sin esto cada toma dura distinto. */
const SEED_SCRIPT = `
  (() => {
    let s = 0x9E3779B9;
    Math.random = () => {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();
`;

/* Estilos de captura: sin barras de scroll, sin caret, cursor invisible
   (el cursor lo dibuja Remotion encima con control frame a frame). */
const CSS_CAPTURA = `
  *, *::before, *::after { cursor: none !important; caret-color: transparent !important; }
  ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
  html { scrollbar-width: none !important; }
`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Abre un contexto nuevo por clip (Playwright graba un video por contexto),
 * corre `guion(page)` y cierra. `pre` corre ANTES de que empiece a importar
 * la imagen: es donde se navega al estado inicial sin que se vea el salto.
 */
async function clip(browser, nombre, { pre, guion, calentar = 900 }) {
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: VIEWPORT },
    reducedMotion: "no-preference",
  });
  await ctx.addInitScript(SEED_SCRIPT);
  const page = await ctx.newPage();

  await page.goto(pathToFileURL(APP).href);
  await page.addStyleTag({ content: CSS_CAPTURA });
  await page.waitForFunction(() => !!window.app);

  // Entrar a la clinica demo (La Arboleda, siete meses de historia).
  await page.evaluate(() => window.app.ACTIONS["login-demo"]());
  await page.waitForTimeout(500);

  if (pre) await pre(page);
  await page.waitForTimeout(calentar); // deja asentar la pintura antes de la accion util

  await guion(page);

  await page.waitForTimeout(600); // cola, para tener margen de trim en Remotion
  await ctx.close();

  const destino = path.join(OUT, `${nombre}.webm`);
  await (await page.video()).saveAs(destino);
  console.log(`  ✓ ${nombre}.webm`);
  return destino;
}

/* Helper: mueve el raton por una curva suave para disparar los :hover reales
   de las cards. Remotion dibuja SU propio cursor encima siguiendo el mismo
   camino, asi que estas coordenadas y las del spec deben coincidir. */
async function pasear(page, puntos, pasosPorTramo = 22) {
  for (let i = 1; i < puntos.length; i++) {
    const [ax, ay] = puntos[i - 1], [bx, by] = puntos[i];
    for (let s = 1; s <= pasosPorTramo; s++) {
      const t = s / pasosPorTramo;
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
      await page.mouse.move(ax + (bx - ax) * e, ay + (by - ay) * e);
      await sleep(16);
    }
    await sleep(180);
  }
}

const CLIPS = {
  "01-dashboard": {
    pre: (p) => p.evaluate(() => window.app.nav("/dashboard/tablero")),
    guion: async (p) => {
      await pasear(p, [[960, 900], [640, 385], [1010, 385], [1200, 520]]);
      await sleep(1200);
    },
  },

  "02-agenda": {
    pre: (p) => p.evaluate(() => window.app.nav("/dashboard/tablero")),
    guion: async (p) => {
      await pasear(p, [[1200, 520], [116, 268]]);
      // Clic real en el item de la barra lateral, para que se vea el estado activo.
      await p.getByRole("link", { name: /agenda/i }).first().click().catch(async () => {
        await p.evaluate(() => window.app.nav("/dashboard/agenda"));
      });
      await sleep(600);
      await pasear(p, [[116, 268], [900, 480]]);
      await sleep(2200);
    },
  },

  "03-abrir-consulta": {
    pre: (p) => p.evaluate(() => window.app.nav("/dashboard/agenda")),
    guion: async (p) => {
      // La cita de Luna es la consulta c-1 del seed (dermatitis / otitis).
      await p.evaluate(() => {
        const c = window.app.getC("c-1");
        window.app.nav("/dashboard/consultas");
      });
      await sleep(700);
      await pasear(p, [[900, 480], [760, 420]]);
      await sleep(900);
    },
  },

  "04-cockpit-transcribiendo": {
    pre: async (p) => {
      await p.evaluate(() => {
        const c = window.app.getC("c-1");
        const o = window.app.getO(window.app.getP(c.pacienteId).ownerId);
        if (o) o.consentimiento = true;           // salta el dialogo de consentimiento
        window.app.iniciarGrabacion(c);
        window.app.nav("/dashboard/consultas/c-1");
      });
    },
    calentar: 400,
    guion: () => sleep(12_000),                    // 12s: el spec corta a 10
  },

  "05-alerta-alergia": {
    pre: async (p) => {
      await p.evaluate(() => {
        const c = window.app.getC("c-1");
        const o = window.app.getO(window.app.getP(c.pacienteId).ownerId);
        if (o) o.consentimiento = true;
        window.app.iniciarGrabacion(c);
        window.app.nav("/dashboard/consultas/c-1");
      });
      // Espera a que Athos dispare la alerta de alergia severa a penicilina.
      await p.waitForFunction(() => window.app.VIVO.alerta === true, { timeout: 60_000 });
    },
    calentar: 0,
    guion: () => sleep(10_000),
  },

  "06-generar-soap": {
    pre: async (p) => {
      await p.evaluate(() => {
        const c = window.app.getC("c-1");
        const o = window.app.getO(window.app.getP(c.pacienteId).ownerId);
        if (o) o.consentimiento = true;
        window.app.iniciarGrabacion(c);
        window.app.nav("/dashboard/consultas/c-1");
      });
      await sleep(6000); // deja acumular transcripcion real antes de organizar
    },
    calentar: 300,
    guion: async (p) => {
      await pasear(p, [[900, 700], [1500, 980]]);
      await p.evaluate(() => window.app.terminarGrabacion());
      await sleep(5000);
      await p.mouse.wheel(0, 420);   // baja hasta las citas [1] [2]
      await sleep(3500);
    },
  },

  "07-facturar-recetado": {
    pre: async (p) => {
      await p.evaluate(() => {
        window.app.generarNotaSOAP?.(window.app.getC("c-1"));
        window.app.nav("/dashboard/consultas?nota=c-1");
      });
    },
    guion: async (p) => {
      await pasear(p, [[900, 700], [1400, 940]]);
      await sleep(1800);
    },
  },

  "08-carrito-emitir": {
    pre: (p) => p.evaluate(() => window.app.nav("/dashboard/facturacion/nueva")),
    guion: async (p) => {
      await pasear(p, [[700, 400], [700, 470], [1520, 880]]);
      await p.getByRole("button", { name: /emitir/i }).first().click().catch(() => {});
      await sleep(3000);
    },
  },

  "09-athos-whatsapp": {
    pre: (p) => p.evaluate(() => window.app.nav("/dashboard/comunicaciones")),
    guion: async (p) => {
      await pasear(p, [[900, 500], [1100, 700]]);
      await p.getByRole("button", { name: /aprobar/i }).first().click().catch(() => {});
      await sleep(3200);   // hay que capturar el toast flotante entero
    },
  },

  "10-flash-agenda":         { pre: (p) => p.evaluate(() => window.app.nav("/dashboard/agenda")),                   guion: () => sleep(2200) },
  "11-flash-comunicaciones": { pre: (p) => p.evaluate(() => window.app.nav("/dashboard/comunicaciones")),           guion: () => sleep(2200) },
  "12-flash-facturacion":    { pre: (p) => p.evaluate(() => window.app.nav("/dashboard/facturacion")),              guion: () => sleep(2200) },
  "13-flash-inventario":     { pre: (p) => p.evaluate(() => window.app.nav("/dashboard/facturacion/inventario")),   guion: () => sleep(2200) },
};

const browser = await chromium.launch({
  args: ["--force-device-scale-factor=1", "--hide-scrollbars", "--font-render-hinting=none"],
});

console.log(`Capturando desde ${APP}\n`);
for (const [nombre, cfg] of Object.entries(CLIPS)) {
  console.log(`→ ${nombre}`);
  try { await clip(browser, nombre, cfg); }
  catch (e) { console.log(`  ✗ ${nombre}: ${e.message}`); }
}
await browser.close();

console.log(`
Los .webm quedaron en ${OUT}. Renombralos segun el orden en que salieron
(Playwright los nombra con hashes) y pasalos a mp4 con el ffmpeg del encabezado.
Los nombres finales tienen que coincidir con assets.clips del spec.
`);
