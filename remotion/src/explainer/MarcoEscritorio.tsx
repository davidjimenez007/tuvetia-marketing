/**
 * ExplainerRAG · la ventana del escritorio (§3.1) y sus dos encuadres (§3.2):
 *  - general: la ventana completa a 0.65 con barra sobria, en y 700; en el acto 4 se encoge a
 *    0.30 y sube a y 520 antes de que el celular la tape;
 *  - columna: corte seco a la región del chat (x 232→1120, y 48→880) escalada a 1080 de ancho,
 *    sin cromo; ahí la cámara hace el push de tecleo.
 * Un solo iframe; lo que cambia por frame son estilos, nunca la estructura.
 * La ventana recorta con overflow hidden: es la única excepción permitida (marco de dispositivo).
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { Vista } from "../demo/Camara";
import type { KeyframeCamara } from "../demo/guion";
import { FUENTE } from "../marca/fuentes";
import { TRACKING, TV } from "../marca/tokens";
import { easeTuvetia } from "../motor/animar";
import { AppSuperficie } from "./AppSuperficie";
import {
  CAMARA_ESCRITORIO_COLUMNA,
  CAMARA_ESCRITORIO_GENERAL,
  COLUMNA,
  ESCRITORIO,
  LIENZO,
  MARCO,
  MARCO_CHICO,
  modoEscritorioEn,
  TRANSICION,
  VISIBLE,
} from "./guion";

const VISTA_GENERAL: Vista = { x0: 0, y0: 0, w: ESCRITORIO.w, h: ESCRITORIO.h };
const VISTA_COLUMNA: Vista = { x0: COLUMNA.x0, y0: COLUMNA.y0, w: COLUMNA.w, h: COLUMNA.h };

const vistaEn = (f: number): Vista => (modoEscritorioEn(f) === "columna" ? VISTA_COLUMNA : VISTA_GENERAL);
const camaraEn = (f: number): readonly KeyframeCamara[] =>
  modoEscritorioEn(f) === "columna" ? CAMARA_ESCRITORIO_COLUMNA : CAMARA_ESCRITORIO_GENERAL;

const DIMS: { w: number; h: number } = { w: ESCRITORIO.w, h: ESCRITORIO.h };
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const MarcoEscritorio: React.FC = () => {
  const frame = useCurrentFrame();
  const modo = modoEscritorioEn(frame);
  const vista = vistaEn(frame);

  /* Acto 4: la ventana se encoge de 0.65 a 0.30 y sube a y 520 (TRANSICION.encoge0 → encoge1). */
  const encoge = interpolate(frame, [TRANSICION.encoge0, TRANSICION.encoge1], [0, 1], { ...CLAMP, easing: easeTuvetia });
  const escala =
    modo === "columna" ? COLUMNA.escala : MARCO.escala + (MARCO_CHICO.escala - MARCO.escala) * encoge;
  /* Factor del cromo: la barra y los puntos encogen con la ventana; en el encuadre de columna no hay. */
  const k = modo === "columna" ? 0 : escala / MARCO.escala;
  const barra = MARCO.barra * k;
  const anchoApp = vista.w * escala;
  const altoApp = vista.h * escala;
  const top = modo === "columna" ? COLUMNA.top : MARCO.top + (MARCO_CHICO.top - MARCO.top) * encoge;
  const left = (LIENZO.w - anchoApp) / 2;
  /* La ventana sale por opacidad en los últimos 12 frames de la transición. */
  const opacidad = interpolate(frame, [TRANSICION.ventanaSale0, TRANSICION.ventanaSale1], [1, 0], CLAMP);
  const conCromo = modo !== "columna";

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: anchoApp,
        height: barra + altoApp,
        borderRadius: conCromo ? MARCO.radio * k : 0,
        boxShadow: conCromo ? TV.shadowPopover : "none",
        outline: conCromo ? `1px solid ${TV.border}` : "none",
        background: TV.surface,
        overflow: "hidden",
        opacity: opacidad,
        visibility: VISIBLE.escritorio(frame) ? "visible" : "hidden",
      }}
    >
      <div
        style={{
          height: barra,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: TV.surface,
          borderBottom: barra > 0 ? `1px solid ${TV.borderSoft}` : "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 10 * k,
            top: 0,
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: 5 * k,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ width: 7 * k, height: 7 * k, borderRadius: "50%", background: TV.borderStrong }}
            />
          ))}
        </div>
        <span
          style={{
            fontFamily: FUENTE.mono,
            fontSize: 8 * k,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: `${TRACKING.rotulo}em`,
            color: TV.muted,
          }}
        >
          TUVETIA
        </span>
      </div>
      <div style={{ position: "relative", width: anchoApp, height: altoApp }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: vista.w,
            height: vista.h,
            transform: `scale(${escala.toFixed(5)})`,
            transformOrigin: "0 0",
          }}
        >
          <AppSuperficie
            cual="escritorio"
            app={DIMS}
            visibleEn={VISIBLE.escritorio}
            vistaEn={vistaEn}
            camaraEn={camaraEn}
          />
        </div>
      </div>
    </div>
  );
};
