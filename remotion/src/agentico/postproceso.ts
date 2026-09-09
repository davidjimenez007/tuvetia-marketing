/**
 * DemoAgentico · el post-proceso por frame: la máquina compartida de src/pieza/postproceso.ts con las
 * tablas de esta pieza, más los toasts dentro de lo que la cámara deja ver, el dock oculto, la barra de
 * autonomía oculta (src/pieza/columna.ts) y el compositor estirado a la altura de su texto.
 */
import { tramoCamara } from "../demo/Camara";
import { resolverBlanco } from "../demo/Cursor";
import { animarToasts, estiloColumna, ocultarAutonomia, visibleDe } from "../pieza/columna";
import { crearPostProceso } from "../pieza/postproceso";
import { camaraEn, CLICS, ESCRITORIO, HOVERS, SCROLLS, SEL, TUTEO_EXTRA, vistaEn } from "./guion";
import type { CtxAgentico } from "./tipos";

const APP = { w: ESCRITORIO.w, h: ESCRITORIO.h };

/** El compositor del asistente es un textarea de una fila y la app sólo lo agranda al teclear (no en
 *  render): con la pregunta precargada por `?pedir=cobros` se estira a la altura de su texto, como
 *  quedaría después de escribirla. Ver NOTAS.md. */
function estirarCompositor(doc: Document): void {
  const t = doc.querySelector<HTMLTextAreaElement>(SEL.textareaChat);
  if (!t || !t.value) return;
  t.style.height = "auto";
  t.style.height = `${t.scrollHeight}px`;
}

export const postProceso = crearPostProceso<CtxAgentico>({
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
    /* Sin `.pagina` en estas pantallas el ancho de columna no actúa; lo que importa es el toast y el dock. */
    estiloColumna(doc, { vista, app: APP, anchoPagina: 820, visible: visibleDe(vista, b.s, foco) });
    animarToasts(doc, frame, ctx.toasts);
    ocultarAutonomia(doc);
    estirarCompositor(doc);
  },
});
