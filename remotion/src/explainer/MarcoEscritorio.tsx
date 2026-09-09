/**
 * ExplainerRAG · la ventana del escritorio (§3.1) y sus dos encuadres (§3.2), sobre la máquina
 * compartida de src/pieza/Ventana.tsx:
 *  - general: la ventana completa a 0.65 con barra sobria, en y 700; en el acto 4 se encoge a
 *    0.30 y sube a y 520 antes de que el celular la tape;
 *  - columna: corte seco a la región del chat (x 232→1120, y 48→880) escalada a 1080 de ancho,
 *    sin cromo; ahí la cámara hace el push de tecleo.
 * Lo único propio de la pieza es el layout por frame.
 */
import React from "react";
import { interpolate } from "remotion";
import type { Vista } from "../demo/Camara";
import type { KeyframeCamara } from "../demo/guion";
import { easeTuvetia } from "../motor/animar";
import type { GeometriaSuperficie, GuionSuperficie, LayoutVentana } from "../pieza/tipos";
import { Ventana } from "../pieza/Ventana";
import { aplicarReplay } from "./estado";
import {
  CAMARA_ESCRITORIO_COLUMNA,
  CAMARA_ESCRITORIO_GENERAL,
  CLICS,
  COLUMNA,
  ESCRITORIO,
  LIENZO,
  MARCO,
  MARCO_CHICO,
  modoEscritorioEn,
  TOQUES,
  tramosCursor,
  TRANSICION,
  VISIBLE,
} from "./guion";
import { postProceso } from "./postproceso";
import type { CtxExplainer, VentanaExplainer } from "./tipos";

const VISTA_GENERAL: Vista = { x0: 0, y0: 0, w: ESCRITORIO.w, h: ESCRITORIO.h };
const VISTA_COLUMNA: Vista = { x0: COLUMNA.x0, y0: COLUMNA.y0, w: COLUMNA.w, h: COLUMNA.h };

const vistaEn = (f: number): Vista => (modoEscritorioEn(f) === "columna" ? VISTA_COLUMNA : VISTA_GENERAL);
const camaraEn = (f: number): readonly KeyframeCamara[] =>
  modoEscritorioEn(f) === "columna" ? CAMARA_ESCRITORIO_COLUMNA : CAMARA_ESCRITORIO_GENERAL;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Acto 4: la ventana se encoge de 0.65 a 0.30 y sube a y 520 (TRANSICION.encoge0 → encoge1); sale
 *  por opacidad en los últimos 12 frames de la transición. En el encuadre de columna no hay cromo. */
const layoutEn = (frame: number): LayoutVentana => {
  const modo = modoEscritorioEn(frame);
  const encoge = interpolate(frame, [TRANSICION.encoge0, TRANSICION.encoge1], [0, 1], { ...CLAMP, easing: easeTuvetia });
  const escala =
    modo === "columna" ? COLUMNA.escala : MARCO.escala + (MARCO_CHICO.escala - MARCO.escala) * encoge;
  return {
    vista: vistaEn(frame),
    escala,
    top: modo === "columna" ? COLUMNA.top : MARCO.top + (MARCO_CHICO.top - MARCO.top) * encoge,
    conCromo: modo !== "columna",
    k: modo === "columna" ? 0 : escala / MARCO.escala,
    opacidad: interpolate(frame, [TRANSICION.ventanaSale0, TRANSICION.ventanaSale1], [1, 0], CLAMP),
    visible: VISIBLE.escritorio(frame),
  };
};

const GEOMETRIA: GeometriaSuperficie = {
  app: { w: ESCRITORIO.w, h: ESCRITORIO.h },
  visibleEn: VISIBLE.escritorio,
  vistaEn,
  camaraEn,
};

const GUION: GuionSuperficie<CtxExplainer> = {
  replay: (win, frame) => aplicarReplay(win as VentanaExplainer, frame),
  postProceso,
  cursor: { tramos: tramosCursor, clics: CLICS },
  toques: TOQUES,
};

export const MarcoEscritorio: React.FC = () => (
  <Ventana layoutEn={layoutEn} geometria={GEOMETRIA} guion={GUION} lienzoAncho={LIENZO.w} />
);
