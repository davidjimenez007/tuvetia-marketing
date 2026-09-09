/**
 * Pieza · la columna de lectura y los toasts, compartidos por los demos de producto de escritorio.
 *
 * - `estiloColumna`: la app pinta cada página como columna de lectura (`.pagina>*{max-width}`), los
 *   toasts se alinean al borde del encuadre (nacen en x 1108–1424 / y 819–884, fuera de cuadro) y el
 *   dock flotante de VetGPT se oculta (comparte rincón con los toasts y no tiene papel en estas piezas).
 * - `capturarToast`: guarda el HTML que la app acaba de dejar en `#avisos` y lo limpia; la línea de
 *   tiempo decide cuándo se ve, pero el texto lo escribió la app (plantilla §2).
 * - `reponerToasts` / `animarToasts`: los vuelve a poner sólo en su ventana, con entrada por opacidad
 *   de 8 frames (las animaciones CSS de la copia están apagadas).
 */
import type { Vista } from "../demo/Camara";
import type { DimsApp } from "../demo/Cursor";
import { easeTuvetia } from "../motor/animar";

export interface ToastCapturado {
  f0: number;
  f1: number;
  html: string;
}

const ID_ESTILO = "pieza-columna";

const acotar = (v: number, min: number, max: number): number => Math.min(Math.max(min, max), Math.max(Math.min(min, max), v));

/** La región de la app (px) que el cuadro muestra con la cámara a escala `s` y foco `foco` (px de app),
 *  con el mismo acotamiento que `transformCamara`: el zoom nunca sale del encuadre. Sirve para poner
 *  los toasts dentro de lo que se ve, no sólo dentro del encuadre. */
export function visibleDe(vista: Vista, s: number, foco: { x: number; y: number }): { x1: number; y1: number } {
  const w = vista.w / s;
  const h = vista.h / s;
  const cx = acotar(foco.x, vista.x0 + w / 2, vista.x0 + vista.w - w / 2);
  const cy = acotar(foco.y, vista.y0 + h / 2, vista.y0 + vista.h - h / 2);
  return { x1: cx + w / 2, y1: cy + h / 2 };
}

export function estiloColumna(
  doc: Document,
  opts: {
    vista: Vista;
    app: DimsApp;
    anchoPagina: number;
    rellenoInferior?: number;
    /** Borde derecho e inferior de lo que la cámara deja ver (`visibleDe`); si no viene, el encuadre. */
    visible?: { x1: number; y1: number };
  },
): void {
  let estilo = doc.getElementById(ID_ESTILO) as HTMLStyleElement | null;
  if (!estilo) {
    estilo = doc.createElement("style");
    estilo.id = ID_ESTILO;
    doc.head.appendChild(estilo);
  }
  const { vista, app, anchoPagina } = opts;
  /* 18 px entre el toast y los bordes derecho e inferior de lo visible; en el plano general, el
     rincón de siempre. */
  const general = vista.w >= app.w;
  const x1 = opts.visible ? opts.visible.x1 : vista.x0 + vista.w;
  const y1 = opts.visible ? opts.visible.y1 : vista.y0 + vista.h;
  const derecha = general ? 16 : Math.round(app.w - x1 + 18);
  const abajo = general ? 16 : Math.round(app.h - y1 + 18);
  estilo.textContent = [
    `.pagina>*{max-width:${anchoPagina}px!important}`,
    /* Aire al pie: sin esto el scroll no puede centrar lo que vive al final de la página. */
    `.pagina{padding-bottom:${opts.rellenoInferior ?? 320}px!important}`,
    `#avisos{right:${derecha}px!important;bottom:${abajo}px!important}`,
    ".dock{display:none!important}",
    "#avisos .toast{animation:none!important}",
  ].join("\n");
}

/** Después del beat que emite un toast: lo guarda con su ventana y deja `#avisos` vacío. */
export function capturarToast(
  doc: Document,
  toasts: ToastCapturado[],
  ventana: { readonly f0: number; readonly f1: number },
  beat: string,
): void {
  const avisos = doc.getElementById("avisos");
  if (!avisos || !avisos.firstElementChild) {
    throw new Error(`Replay · ${beat}: la app no emitió ningún toast`);
  }
  toasts.push({ f0: ventana.f0, f1: ventana.f1, html: avisos.innerHTML });
  avisos.innerHTML = "";
}

/** Al final del replay de un frame: sólo los toasts cuya ventana incluye el frame. */
export function reponerToasts(doc: Document, frame: number, toasts: readonly ToastCapturado[]): void {
  const avisos = doc.getElementById("avisos");
  if (!avisos) return;
  avisos.innerHTML = toasts
    .filter((t) => frame >= t.f0 && frame < t.f1)
    .map((t) => t.html)
    .join("");
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Entrada por opacidad y 10 px de subida en los primeros 8 frames de cada toast. */
export function animarToasts(doc: Document, frame: number, toasts: readonly ToastCapturado[]): void {
  const activos = toasts.filter((t) => frame >= t.f0 && frame < t.f1);
  const nodos = Array.from(doc.querySelectorAll<HTMLElement>("#avisos .toast"));
  nodos.forEach((el, i) => {
    const t = activos[i];
    if (!t) return;
    const p = easeTuvetia(clamp01((frame - t.f0) / 8));
    el.style.opacity = p.toFixed(3);
    el.style.transform = `translateY(${((1 - p) * 10).toFixed(2)}px)`;
  });
}
