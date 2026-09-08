/**
 * ExplainerRAG · la banda de texto (§3 capa 7, §4.5) y el microrrótulo de honestidad (capa 8).
 * Scrim de nieve a 0.94 entre y 1330 y y 1610 (sube 40 px respecto al encargo
 * para dejar libre el compositor del móvil, donde vive el chip de contexto — orden v2 §E); rótulo mono 26 y frase Archivo 700 62 en cascada
 * palabra por palabra con <Entra> (gap 3, y 18, d 22), salida a 0 en 8 frames. El scrim es una
 * capa aparte para que dos textos contiguos no lo hagan parpadear.
 */
import React from "react";
import { interpolate, Sequence, useCurrentFrame } from "remotion";
import { FUENTE } from "../marca/fuentes";
import { RADIUS, TRACKING, TV } from "../marca/tokens";
import { Entra } from "../motor/animar";
import { LIENZO, MICRORROTULO, TEXTOS } from "./guion";
import type { TextoBanda } from "./guion";

const BANDA = { top: 1330, alto: 280 } as const;
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** #rrggbb → rgba(). */
export const conAlfa = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const estiloRotulo: React.CSSProperties = {
  fontFamily: FUENTE.mono,
  fontSize: 26,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: `${TRACKING.rotulo}em`,
  color: TV.muted,
};

const Scrim: React.FC = () => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const t of TEXTOS) {
    o = Math.max(o, interpolate(frame, [t.f0 - 6, t.f0, t.f1, t.f1 + 8], [0, 1, 1, 0], CLAMP));
  }
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: BANDA.top,
        width: LIENZO.w,
        height: BANDA.alto,
        background: conAlfa(TV.surface2, 0.94),
        borderTop: `1px solid ${TV.border}`,
        opacity: o,
      }}
    />
  );
};

/** Cuerpo de la frase: 62 por defecto (§4.5); las frases largas de la orden v2 bajan para caber
 *  en las tres líneas que admite la banda (300 px). Umbrales comprobados en f0700 y f0880. */
const tamFrase = (frase: string): number => (frase.length > 68 ? 50 : frase.length > 54 ? 56 : 62);

const BloqueBanda: React.FC<{ texto: TextoBanda }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const dur = texto.f1 - texto.f0;
  const salida = interpolate(frame, [dur - 8, dur], [1, 0], CLAMP);
  const palabras = texto.frase.split(" ");
  const tam = tamFrase(texto.frase);
  return (
    <div
      style={{
        position: "absolute",
        left: LIENZO.safeX,
        top: BANDA.top + 32,
        width: LIENZO.w - 2 * LIENZO.safeX,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        opacity: salida,
      }}
    >
      <Entra i={0} gap={3} y={18} d={22}>
        <div style={estiloRotulo}>{texto.rotulo}</div>
      </Entra>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          columnGap: "0.26em",
          rowGap: 2,
          fontFamily: FUENTE.display,
          fontWeight: 700,
          fontSize: tam,
          lineHeight: 1.08,
          letterSpacing: `${TRACKING.titular}em`,
          color: TV.text,
        }}
      >
        {palabras.map((p, i) => (
          <Entra key={`${i}-${p}`} i={i + 1} gap={3} y={18} d={22}>
            {p}
          </Entra>
        ))}
      </div>
    </div>
  );
};

/** Línea roja 2: `DEMO · DATOS DE EJEMPLO` durante los nueve actos. Va a la derecha, en la fila
 *  del rótulo de la banda (no arriba a la derecha como pide §3: ahí tapaba la burbuja de la
 *  pregunta en las dos superficies — ver NOTAS.md). */
const Microrrotulo: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [MICRORROTULO.f1 - 8, MICRORROTULO.f1], [1, 0], CLAMP);
  if (frame < MICRORROTULO.f0 || o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        right: LIENZO.safeX,
        top: BANDA.top + 34,
        padding: "6px 14px",
        borderRadius: RADIUS.xxl,
        background: conAlfa(TV.surface, 0.9),
        fontFamily: FUENTE.mono,
        fontSize: 22,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: `${TRACKING.rotulo}em`,
        color: TV.muted,
        opacity: o,
        whiteSpace: "nowrap",
      }}
    >
      {MICRORROTULO.texto}
    </div>
  );
};

export const Banda: React.FC = () => (
  <>
    <Scrim />
    {TEXTOS.map((t) => (
      <Sequence key={`banda-${t.f0}`} from={t.f0} durationInFrames={t.f1 - t.f0} layout="none">
        <BloqueBanda texto={t} />
      </Sequence>
    ))}
    <Microrrotulo />
  </>
);
