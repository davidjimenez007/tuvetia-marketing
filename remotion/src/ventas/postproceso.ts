/**
 * DemoVentas · el post-proceso por frame: la máquina compartida de src/pieza/postproceso.ts con las
 * tablas de esta pieza, más la columna de lectura, los toasts alineados y el dock oculto de
 * src/pieza/columna.ts (desviaciones 8 y 9 en NOTAS.md).
 *
 * Los toasts se ponen dentro de lo que la cámara deja ver: con la escala fija de cada acto (1.05,
 * 1.2) el cuadro no llega al borde del encuadre, y un toast pegado al encuadre salía cortado
 * (still f0600 de la cuarta pasada). `visibleDe` usa el destino del tramo de cámara del frame, así
 * el toast no se mueve dentro de un acto.
 */
import { tramoCamara } from "../demo/Camara";
import { resolverBlanco } from "../demo/Cursor";
import { animarToasts, estiloColumna, visibleDe } from "../pieza/columna";
import { crearPostProceso } from "../pieza/postproceso";
import { anchoPaginaEn, camaraEn, CLICS, ESCRITORIO, HOVERS, SCROLLS, TUTEO_EXTRA, vistaEn } from "./guion";
import type { CtxVentas } from "./tipos";

const APP = { w: ESCRITORIO.w, h: ESCRITORIO.h };

export const postProceso = crearPostProceso<CtxVentas>({
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
    animarToasts(doc, frame, ctx.toasts);
  },
});
