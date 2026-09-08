/**
 * ExplainerRAG · el anuncio del acto 2 (§5): «También lo puedes usar desde tu celular.» en
 * Archivo 700 72, centrado sobre la nieve (el único beat en que el texto ocupa el centro),
 * cascada palabra por palabra (gap 4, y 22, d 24) y debajo el rótulo EL MISMO HILO.
 * Sale por opacidad en los últimos 12 frames, mientras el celular termina de subir.
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FUENTE } from "../marca/fuentes";
import { TRACKING, TV } from "../marca/tokens";
import { Entra } from "../motor/animar";
import { ANUNCIO, LIENZO } from "./guion";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Anuncio: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < ANUNCIO.f0 || frame >= ANUNCIO.f1) return null;
  const salida = interpolate(frame, [ANUNCIO.f1 - 12, ANUNCIO.f1], [1, 0], CLAMP);
  const palabras = ANUNCIO.frase.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: LIENZO.safeX,
        top: 880,
        width: LIENZO.w - 2 * LIENZO.safeX,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 30,
        opacity: salida,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: "0.26em",
          rowGap: 4,
          fontFamily: FUENTE.display,
          fontWeight: 700,
          fontSize: 72,
          lineHeight: 1.1,
          letterSpacing: `${TRACKING.titular}em`,
          color: TV.text,
          textAlign: "center",
        }}
      >
        {palabras.map((p, i) => (
          <Entra key={`${i}-${p}`} i={i} gap={4} y={22} d={24} delay={ANUNCIO.entra}>
            {p}
          </Entra>
        ))}
      </div>
      <Entra i={palabras.length} gap={4} y={22} d={24} delay={ANUNCIO.entra}>
        <div
          style={{
            fontFamily: FUENTE.mono,
            fontSize: 26,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: `${TRACKING.rotulo}em`,
            color: TV.muted,
          }}
        >
          {ANUNCIO.rotulo}
        </div>
      </Entra>
    </div>
  );
};
