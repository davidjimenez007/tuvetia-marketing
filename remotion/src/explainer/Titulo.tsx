/**
 * ExplainerRAG · el título del acto 1 (orden v2 §C.1): dos líneas centradas entre y 300 y y 600,
 * sobre la nieve y por encima de la ventana de escritorio (que empieza en y 700). Línea 1
 * «VetGPT» en Archivo 700 108 como un solo elemento (i 0); línea 2 en Archivo 700 52, TV.text2,
 * palabra por palabra (i 1…n). Cascada <Entra> gap 4, y 24, d 26; sale por opacidad en 10 frames
 * desde TITULO.sale. Grafía «VetGPT», una palabra, exactamente así.
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FUENTE } from "../marca/fuentes";
import { TRACKING, TV } from "../marca/tokens";
import { Entra } from "../motor/animar";
import { LIENZO, TITULO } from "./guion";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Titulo: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < TITULO.f0 || frame >= TITULO.f1) return null;
  const salida = interpolate(frame, [TITULO.sale, TITULO.f1], [1, 0], CLAMP);
  const palabras = TITULO.linea2.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: LIENZO.safeX,
        top: TITULO.top,
        width: LIENZO.w - 2 * LIENZO.safeX,
        height: TITULO.alto,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        opacity: salida,
      }}
    >
      <Entra i={0} gap={4} y={24} d={26}>
        <div
          style={{
            fontFamily: FUENTE.display,
            fontWeight: 700,
            fontSize: 108,
            lineHeight: 1,
            letterSpacing: `${TRACKING.titular}em`,
            color: TV.text,
          }}
        >
          {TITULO.linea1}
        </div>
      </Entra>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: "0.26em",
          rowGap: 4,
          fontFamily: FUENTE.display,
          fontWeight: 700,
          fontSize: 52,
          lineHeight: 1.1,
          letterSpacing: `${TRACKING.titular}em`,
          color: TV.text2,
          textAlign: "center",
        }}
      >
        {palabras.map((p, i) => (
          <Entra key={`${i}-${p}`} i={i + 1} gap={4} y={24} d={26}>
            {p}
          </Entra>
        ))}
      </div>
    </div>
  );
};
