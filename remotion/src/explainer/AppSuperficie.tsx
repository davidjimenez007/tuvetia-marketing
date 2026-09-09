/**
 * ExplainerRAG · una superficie de la app (§2.3): la máquina compartida de src/pieza/AppSuperficie
 * con el replay, el post-proceso, el cursor y los toques de esta pieza. Misma firma de siempre:
 * MarcoEscritorio y SuperficieMovil (ExplainerRAG.tsx) le pasan la geometría.
 */
import React from "react";
import type { Vista } from "../demo/Camara";
import type { DimsApp } from "../demo/Cursor";
import type { KeyframeCamara } from "../demo/guion";
import { AppSuperficie as AppSuperficieBase } from "../pieza/AppSuperficie";
import type { GuionSuperficie, Superficie } from "../pieza/tipos";
import { aplicarReplay } from "./estado";
import { CLICS, TOQUES, tramosCursor } from "./guion";
import { postProceso } from "./postproceso";
import type { CtxExplainer, VentanaExplainer } from "./tipos";

const GUION: GuionSuperficie<CtxExplainer> = {
  replay: (win, frame) => aplicarReplay(win as VentanaExplainer, frame),
  postProceso,
  cursor: { tramos: tramosCursor, clics: CLICS },
  toques: TOQUES,
};

export const AppSuperficie: React.FC<{
  cual: Superficie;
  app: DimsApp;
  visibleEn(frame: number): boolean;
  vistaEn(frame: number): Vista;
  camaraEn(frame: number): readonly KeyframeCamara[];
}> = ({ cual, app, visibleEn, vistaEn, camaraEn }) => (
  <AppSuperficieBase cual={cual} geometria={{ app, visibleEn, vistaEn, camaraEn }} guion={GUION} />
);
