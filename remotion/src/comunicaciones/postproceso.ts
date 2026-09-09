/**
 * DemoComunicaciones · el post-proceso por frame: la máquina compartida de src/pieza/postproceso.ts con
 * las tablas de esta pieza, más la columna de lectura (Integraciones), el hilo de WhatsApp angostado, los
 * toasts dentro de lo que la cámara deja ver, el dock y la barra de autonomía ocultos (src/pieza/columna.ts).
 */
import { tramoCamara } from "../demo/Camara";
import { resolverBlanco } from "../demo/Cursor";
import { animarToasts, estiloColumna, ocultarAutonomia, visibleDe } from "../pieza/columna";
import { crearPostProceso } from "../pieza/postproceso";
import { anchoHiloEn, anchoPaginaEn, camaraEn, CLICS, ESCRITORIO, HOVERS, SCROLLS, TUTEO_EXTRA, vistaEn } from "./guion";
import type { CtxComunicaciones } from "./tipos";

const APP = { w: ESCRITORIO.w, h: ESCRITORIO.h };

/** El hilo de WhatsApp (`.col-hilo`, 860 px en la bandeja) se deja en `ancho` px para leerlo a tamaño de
 *  teléfono: la misma idea que la columna de lectura de las páginas. 0 = sin tocar. Ver NOTAS.md. */
function angostarHilo(doc: Document, ancho: number): void {
  const ID = "pieza-hilo";
  let estilo = doc.getElementById(ID) as HTMLStyleElement | null;
  if (!estilo) {
    estilo = doc.createElement("style");
    estilo.id = ID;
    doc.head.appendChild(estilo);
  }
  estilo.textContent = ancho > 0 ? `.inbox .col-hilo{max-width:${ancho}px}` : "";
}

export const postProceso = crearPostProceso<CtxComunicaciones>({
  hovers: HOVERS,
  clics: CLICS,
  toques: [],
  scrolls: SCROLLS,
  caretF0: 0,
  tuteoExtra: TUTEO_EXTRA,
  extra: (doc, frame, _superficie, ctx) => {
    const vista = vistaEn(frame);
    const { b } = tramoCamara(camaraEn(frame), frame);
    const foco = resolverBlanco(doc, b.foco, false, "toast", APP);
    estiloColumna(doc, { vista, app: APP, anchoPagina: anchoPaginaEn(frame), visible: visibleDe(vista, b.s, foco) });
    angostarHilo(doc, anchoHiloEn(frame));
    animarToasts(doc, frame, ctx.toasts);
    ocultarAutonomia(doc);
  },
});
