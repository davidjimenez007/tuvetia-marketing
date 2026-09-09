/**
 * Pieza · la ventana del escritorio (§3.1) y sus encuadres (§3.2). Un solo iframe; lo que cambia
 * por frame son estilos, nunca la estructura. Cada pieza decide el layout de cada frame
 * (`layoutEn`): plano general con cromo (barra sobria, tres puntos, rótulo mono, radio, sombra) o
 * corte seco a una región de la app sin cromo, escalada a lo que la pieza pida.
 * La ventana recorta con overflow hidden: es la única excepción permitida (marco de dispositivo).
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { FUENTE } from "../marca/fuentes";
import { TRACKING, TV } from "../marca/tokens";
import { AppSuperficie } from "./AppSuperficie";
import type { GeometriaSuperficie, GuionSuperficie, LayoutVentana } from "./tipos";

/** Cromo a escala natural: barra de 24 px, radio 16. */
export const CROMO = { barra: 24, radio: 16 } as const;

export function Ventana<Ctx>({
  layoutEn,
  geometria,
  guion,
  lienzoAncho,
}: {
  layoutEn(frame: number): LayoutVentana;
  geometria: GeometriaSuperficie;
  guion: GuionSuperficie<Ctx>;
  lienzoAncho: number;
}): React.ReactElement {
  const frame = useCurrentFrame();
  const { vista, escala, top, conCromo, k, opacidad, visible } = layoutEn(frame);
  const barra = conCromo ? CROMO.barra * k : 0;
  const anchoApp = vista.w * escala;
  const altoApp = vista.h * escala;
  const left = (lienzoAncho - anchoApp) / 2;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: anchoApp,
        height: barra + altoApp,
        borderRadius: conCromo ? CROMO.radio * k : 0,
        boxShadow: conCromo ? TV.shadowPopover : "none",
        outline: conCromo ? `1px solid ${TV.border}` : "none",
        background: TV.surface,
        overflow: "hidden",
        opacity: opacidad,
        visibility: visible ? "visible" : "hidden",
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
          <AppSuperficie cual="escritorio" geometria={geometria} guion={guion} />
        </div>
      </div>
    </div>
  );
}
