/**
 * ExplainerRAG · el post-proceso por frame (§4.3, §4.4, §2.4) es la máquina compartida de
 * src/pieza/postproceso.ts con las tablas de esta pieza: hovers, clics, toques, scrolls, el frame
 * en que arranca el caret y el relleno del hilo en móvil (para que la banda no tape lo último que
 * se escribe).
 */
import { crearPostProceso } from "../pieza/postproceso";
import { CARET_F0, CLICS, HOVERS, RELLENO_HILO_MOVIL, SCROLLS, TOQUES } from "./guion";
import type { CtxExplainer } from "./tipos";

export type { Superficie } from "../pieza/tipos";

export const postProceso = crearPostProceso<CtxExplainer>({
  hovers: HOVERS,
  clics: CLICS,
  toques: TOQUES,
  scrolls: SCROLLS,
  caretF0: CARET_F0,
  rellenoHiloMovil: RELLENO_HILO_MOVIL,
});
