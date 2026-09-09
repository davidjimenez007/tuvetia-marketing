/**
 * DemoVentas · el post-proceso por frame: la máquina compartida de src/pieza/postproceso.ts con las
 * tablas de esta pieza, más tres ajustes propios (desviaciones documentadas en NOTAS.md):
 *  - la página se pinta como columna de lectura (`.pagina>*{max-width}`), 820 px en la importación y
 *    las tablas, 640 px en la consulta y el carrito, para que el encuadre la escale a los 1080;
 *  - los toasts se alinean al borde derecho de la columna (nacen fuera del encuadre) y entran por
 *    opacidad en 8 frames (las animaciones CSS están apagadas);
 *  - el dock flotante de VetGPT se oculta: comparte rincón con los toasts y no tiene papel acá.
 */
import { easeTuvetia } from "../motor/animar";
import { crearPostProceso } from "../pieza/postproceso";
import { anchoPaginaEn, CLICS, ESCRITORIO, HOVERS, SCROLLS, TUTEO_EXTRA, vistaEn } from "./guion";
import type { CtxVentas } from "./tipos";

const ID_ESTILO = "pieza-ventas";

function estiloPieza(doc: Document, frame: number): void {
  let estilo = doc.getElementById(ID_ESTILO) as HTMLStyleElement | null;
  if (!estilo) {
    estilo = doc.createElement("style");
    estilo.id = ID_ESTILO;
    doc.head.appendChild(estilo);
  }
  const vista = vistaEn(frame);
  const ancho = anchoPaginaEn(frame);
  /* 18 px entre el toast y los bordes derecho e inferior del encuadre (el de lectura termina en
     y 814 y el toast nace en y 819–884, fuera de cuadro); en el plano general, el rincón de siempre. */
  const general = vista.w >= ESCRITORIO.w;
  const derecha = general ? 16 : ESCRITORIO.w - (vista.x0 + vista.w) + 18;
  const abajo = general ? 16 : ESCRITORIO.h - (vista.y0 + vista.h) + 18;
  estilo.textContent = [
    `.pagina>*{max-width:${ancho}px!important}`,
    /* Aire al pie: sin esto el scroll no puede centrar «Emitir», que vive al final de la página. */
    ".pagina{padding-bottom:320px!important}",
    `#avisos{right:${derecha}px!important;bottom:${abajo}px!important}`,
    ".dock{display:none!important}",
    "#avisos .toast{animation:none!important}",
  ].join("\n");
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

function animarToasts(doc: Document, frame: number, ctx: CtxVentas): void {
  const activos = ctx.toasts.filter((t) => frame >= t.f0 && frame < t.f1);
  const nodos = Array.from(doc.querySelectorAll<HTMLElement>("#avisos .toast"));
  nodos.forEach((el, i) => {
    const t = activos[i];
    if (!t) return;
    const p = easeTuvetia(clamp01((frame - t.f0) / 8));
    el.style.opacity = p.toFixed(3);
    el.style.transform = `translateY(${((1 - p) * 10).toFixed(2)}px)`;
  });
}

export const postProceso = crearPostProceso<CtxVentas>({
  hovers: HOVERS,
  clics: CLICS,
  toques: [],
  scrolls: SCROLLS,
  caretF0: 0,
  tuteoExtra: TUTEO_EXTRA,
  extra: (doc, frame, _superficie, ctx) => {
    estiloPieza(doc, frame);
    animarToasts(doc, frame, ctx);
  },
});
