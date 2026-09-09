/**
 * DemoPacientes · el post-proceso por frame: la máquina compartida de src/pieza/postproceso.ts con
 * las tablas de esta pieza, más la columna de lectura, los toasts dentro de lo que la cámara deja ver
 * y el dock oculto (src/pieza/columna.ts, los mismos ajustes que DemoVentas).
 */
import { tramoCamara } from "../demo/Camara";
import { resolverBlanco } from "../demo/Cursor";
import { animarToasts, estiloColumna, visibleDe } from "../pieza/columna";
import { crearPostProceso } from "../pieza/postproceso";
import { anchoPaginaEn, camaraEn, CLICS, ESCRITORIO, HOVERS, SCROLLS, TUTEO_EXTRA, vistaEn } from "./guion";
import type { CtxPacientes } from "./tipos";

const APP = { w: ESCRITORIO.w, h: ESCRITORIO.h };

export const postProceso = crearPostProceso<CtxPacientes>({
  hovers: HOVERS,
  clics: CLICS,
  toques: [],
  scrolls: SCROLLS,
  caretF0: 0,
  tuteoExtra: TUTEO_EXTRA,
  extra: (doc, frame, _superficie, ctx) => {
    const vista = vistaEn(frame);
    /* El destino del tramo de cámara: el toast queda quieto dentro de un tramo aunque haya push. */
    const { b } = tramoCamara(camaraEn(frame), frame);
    const foco = resolverBlanco(doc, b.foco, false, "toast", APP);
    estiloColumna(doc, { vista, app: APP, anchoPagina: anchoPaginaEn(frame), visible: visibleDe(vista, b.s, foco) });
    animarToasts(doc, frame, ctx.toasts);
  },
});
