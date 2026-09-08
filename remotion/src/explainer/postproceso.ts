/**
 * ExplainerRAG · lo vivo dentro de la app, por frame y determinista (§4.3, §4.4, §2.4):
 * hover/active simulados, spinner, cursor de escritura, puntos del «pensando», tuteo y scroll.
 * Las animaciones CSS de la copia están apagadas por el parche: todo lo que se mueve lo mueve
 * esto. Corre sobre el documento de cualquiera de los dos iframes, después de app.nav().
 */
import { aplicarTuteo } from "../demo/tuteo";
import type { Blanco } from "../demo/guion";
import { easeTuvetia } from "../motor/animar";
import { CARET_F0, CLICS, HOVERS, RELLENO_HILO_MOVIL, SCROLLS, TOQUES } from "./guion";
import type { Scroll } from "./guion";
import type { CtxExplainer } from "./tipos";

export type Superficie = "escritorio" | "movil";

function buscar(doc: Document, sel: string, texto?: string): HTMLElement | null {
  if (!texto) return doc.querySelector<HTMLElement>(sel);
  const todos = Array.from(doc.querySelectorAll<HTMLElement>(sel));
  return todos.find((el) => (el.textContent ?? "").indexOf(texto) >= 0) ?? null;
}

const buscarBlanco = (doc: Document, b: Blanco): HTMLElement | null =>
  b.sel ? buscar(doc, b.sel, b.texto) : null;

/* ── Hover y active simulados (§4.2) ─────────────────────────────────────────────────────── */
function aplicarHoverActive(doc: Document, frame: number, superficie: Superficie, ctx: CtxExplainer): void {
  if (superficie === "escritorio") {
    for (const h of HOVERS) {
      if (frame >= h.f0 && frame < h.f1) buscar(doc, h.sel, h.texto)?.classList.add("hover-sim");
    }
    for (const c of CLICS) {
      if (c.sobre && frame >= c.f && frame < c.f + 4) {
        buscar(doc, c.sobre.sel, c.sobre.texto)?.classList.add("active-sim");
      }
    }
    return;
  }
  /* En móvil no hay hover: sólo el active del toque. */
  for (const t of TOQUES) {
    if (frame >= t.f && frame < t.f + 4) buscarBlanco(doc, t.blanco(ctx))?.classList.add("active-sim");
  }
}

/* ── Spinner, cursor de escritura, puntos, caret del textarea ────────────────────────────── */
function aplicarVivo(doc: Document, frame: number): void {
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>(".girando"))) {
    el.style.transformOrigin = "50% 50%";
    el.style.setProperty("transform-box", "fill-box");
    el.style.transform = `rotate(${(frame * 12) % 360}deg)`;
  }
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>(".cursor"))) {
    /* Módulo positivo: con el % de JS un frame anterior a CARET_F0 daría negativo y el caret
       quedaría encendido fijo. */
    el.style.opacity = (((frame - CARET_F0) % 30) + 30) % 30 < 15 ? "1" : "0";
  }
  Array.from(doc.querySelectorAll<HTMLElement>(".puntos i")).forEach((el, k) => {
    const y = -3 * Math.max(0, Math.sin(2 * Math.PI * (frame / 24 - k / 6)));
    el.style.transform = `translateY(${y.toFixed(2)}px)`;
  });
  /* El textarea es rows=1 sin auto-resize: como haría un navegador con el caret al final,
     se muestra la última línea. En móvil la pregunta ocupa dos líneas (ver NOTAS.md). */
  for (const ta of Array.from(doc.querySelectorAll<HTMLTextAreaElement>("textarea[name=q]"))) {
    ta.scrollTop = ta.scrollHeight;
  }
}

/* ── Scroll: el contenedor se resuelve por overflow-y computado desde el ancla ───────────── */
function scrollerDe(el: HTMLElement): HTMLElement | null {
  const win = el.ownerDocument.defaultView;
  if (!win) return null;
  let n: HTMLElement | null = el;
  while (n) {
    const ov = win.getComputedStyle(n).overflowY;
    if ((ov === "auto" || ov === "scroll") && n.scrollHeight > n.clientHeight + 1) return n;
    n = n.parentElement;
  }
  return null;
}

function destino(cont: HTMLElement, ancla: HTMLElement, modo: Scroll["hasta"]): number {
  const max = cont.scrollHeight - cont.clientHeight;
  if (modo === "arriba") return 0;
  if (modo === "fondo") return max;
  const r = ancla.getBoundingClientRect();
  const rc = cont.getBoundingClientRect();
  const v = cont.scrollTop + (r.top - rc.top) - (rc.height - r.height) / 2;
  return Math.max(0, Math.min(max, v));
}

function aplicarScroll(doc: Document, frame: number): void {
  let activo: Scroll | null = null;
  for (const s of SCROLLS) if (frame >= s.f0) activo = s;
  if (!activo) return;
  /* En otra ruta el ancla no existe y no hay nada que scrollear. */
  const ancla = buscarBlanco(doc, activo.ancla);
  if (!ancla) return;
  const cont = scrollerDe(ancla);
  if (!cont) return;
  const hasta = destino(cont, ancla, activo.hasta);
  if (activo.desde === undefined || frame >= activo.f1) {
    cont.scrollTop = hasta;
    return;
  }
  const desde = destino(cont, ancla, activo.desde);
  const t = easeTuvetia((frame - activo.f0) / (activo.f1 - activo.f0));
  cont.scrollTop = desde + (hasta - desde) * t;
}

/** En móvil la banda de texto tapa el último tramo del hilo: el hilo gana relleno inferior para
 *  que lo último que se escribe (y las sugerencias de la abstención) queden por encima. */
function abrirEspacioBanda(doc: Document): void {
  const hilo = doc.getElementById("hilo-chat");
  if (hilo) hilo.style.paddingBottom = `${RELLENO_HILO_MOVIL}px`;
}

/** Todo el post-proceso de un documento, en orden. El tuteo va antes del scroll para que el
 *  layout que se scrollea ya sea el definitivo. */
export function postProceso(doc: Document, frame: number, superficie: Superficie, ctx: CtxExplainer): void {
  aplicarHoverActive(doc, frame, superficie, ctx);
  aplicarVivo(doc, frame);
  aplicarTuteo(doc);
  if (superficie === "movil") abrirEspacioBanda(doc);
  aplicarScroll(doc, frame);
}
