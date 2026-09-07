/**
 * DemoSaaS · la banda inferior (§3.5, §4.5): rótulo mono + frase display en cascada
 * palabra por palabra con <Entra> (gap 3, y 18, d 22), salida a opacidad 0 en 8 frames.
 * A la derecha, el microrrótulo de honestidad `DEMO · DATOS DE EJEMPLO`.
 */
import React from "react";
import { interpolate, Sequence, useCurrentFrame } from "remotion";
import { FUENTE } from "../marca/fuentes";
import { TRACKING, TV } from "../marca/tokens";
import { Entra } from "../motor/animar";
import { MICRORROTULO, TEXTOS } from "./guion";
import type { TextoPantalla } from "./guion";

const estiloRotulo: React.CSSProperties = {
  fontFamily: FUENTE.mono,
  fontSize: 14,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: `${TRACKING.rotulo}em`,
  color: TV.muted,
};

const BloqueTexto: React.FC<{ texto: TextoPantalla }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const dur = texto.f1 - texto.f0;
  const salida = interpolate(frame, [dur - 8, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const palabras = texto.frase ? texto.frase.split(" ") : [];
  return (
    <div
      style={{
        position: "absolute",
        left: 160,
        top: 968,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: salida,
      }}
    >
      <Entra i={0} gap={3} y={18} d={22}>
        <span style={estiloRotulo}>{texto.rotulo}</span>
      </Entra>
      {palabras.length > 0 ? (
        <div style={{ display: "flex", gap: "0.28em", whiteSpace: "nowrap" }}>
          {palabras.map((palabra, i) => (
            <Entra key={`${palabra}-${i}`} i={i + 1} gap={3} y={18} d={22}>
              <span
                style={{
                  fontFamily: FUENTE.display,
                  fontWeight: 700,
                  fontSize: 44,
                  letterSpacing: `${TRACKING.titular}em`,
                  color: TV.text,
                  lineHeight: 1.1,
                }}
              >
                {palabra}
              </span>
            </Entra>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const BandaTextos: React.FC = () => {
  const frame = useCurrentFrame();
  const micro = interpolate(
    frame,
    [MICRORROTULO.f0, MICRORROTULO.f0 + 20, MICRORROTULO.f1 - 8, MICRORROTULO.f1],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <>
      {TEXTOS.map((t) => (
        <Sequence
          key={`${t.f0}-${t.rotulo}`}
          from={t.f0}
          durationInFrames={t.f1 - t.f0}
          layout="none"
        >
          <BloqueTexto texto={t} />
        </Sequence>
      ))}
      <div
        style={{
          position: "absolute",
          right: 160,
          top: 1014,
          fontFamily: FUENTE.mono,
          fontSize: 13,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: `${TRACKING.rotulo}em`,
          color: TV.muted,
          opacity: micro,
        }}
      >
        {MICRORROTULO.texto}
      </div>
    </>
  );
};
