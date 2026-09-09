/**
 * Pieza · la banda de texto (§3 capa 7) y el microrrótulo de honestidad (capa 8).
 * Scrim de nieve a 0.94 entre `top` y `top + alto` (1330–1610 por defecto: 40 px más arriba que
 * el encargo original para dejar libre el compositor del móvil); rótulo mono 26 y frase Archivo
 * 700 62 en cascada palabra por palabra con <Entra> (gap 3, y 18, d 22), salida a 0 en 8 frames.
 * El scrim es una capa aparte para que dos textos contiguos no lo hagan parpadear.
 */
import React from "react";
import { interpolate, Sequence, useCurrentFrame } from "remotion";
import { FUENTE } from "../marca/fuentes";
import { RADIUS, TRACKING, TV } from "../marca/tokens";
import { Entra } from "../motor/animar";
import type { Lienzo, Microrrotulo, TextoBanda } from "./tipos";

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

interface Geometria {
  top: number;
  alto: number;
  lienzo: Lienzo;
}

const Scrim: React.FC<{ textos: readonly TextoBanda[]; geo: Geometria }> = ({ textos, geo }) => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const t of textos) {
    o = Math.max(o, interpolate(frame, [t.f0 - 6, t.f0, t.f1, t.f1 + 8], [0, 1, 1, 0], CLAMP));
  }
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: geo.top,
        width: geo.lienzo.w,
        height: geo.alto,
        background: conAlfa(TV.surface2, 0.94),
        borderTop: `1px solid ${TV.border}`,
        opacity: o,
      }}
    />
  );
};

/** Cuerpo de la frase: 62 por defecto (§4.5); las frases largas bajan para caber en las tres
 *  líneas que admite la banda (300 px). Umbrales comprobados en f0700 y f0880 del explainer. */
const tamFrase = (frase: string): number => (frase.length > 68 ? 50 : frase.length > 54 ? 56 : 62);

const BloqueBanda: React.FC<{ texto: TextoBanda; geo: Geometria }> = ({ texto, geo }) => {
  const frame = useCurrentFrame();
  const dur = texto.f1 - texto.f0;
  const salida = interpolate(frame, [dur - 8, dur], [1, 0], CLAMP);
  const palabras = texto.frase.split(" ");
  const tam = tamFrase(texto.frase);
  return (
    <div
      style={{
        position: "absolute",
        left: geo.lienzo.safeX,
        top: geo.top + 32,
        width: geo.lienzo.w - 2 * geo.lienzo.safeX,
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

/** Línea roja 2: `DEMO · DATOS DE EJEMPLO` durante todos los actos. Va a la derecha, en la fila
 *  del rótulo de la banda (no arriba a la derecha: ahí tapaba la burbuja de la pregunta), salvo que
 *  la pieza le dé otra altura (`microTop`) porque su rótulo más largo se lo come. */
const MicrorrotuloCapa: React.FC<{ micro: Microrrotulo; geo: Geometria; top: number }> = ({ micro, geo, top }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [micro.f1 - 8, micro.f1], [1, 0], CLAMP);
  if (frame < micro.f0 || o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        right: geo.lienzo.safeX,
        top,
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
      {micro.texto}
    </div>
  );
};

export const Banda: React.FC<{
  textos: readonly TextoBanda[];
  microrrotulo: Microrrotulo;
  lienzo: Lienzo;
  top?: number;
  alto?: number;
  /** Borde superior del microrrótulo; por defecto, la fila del rótulo de la banda. */
  microTop?: number;
}> = ({ textos, microrrotulo, lienzo, top = 1330, alto = 280, microTop }) => {
  const geo: Geometria = { top, alto, lienzo };
  return (
    <>
      <Scrim textos={textos} geo={geo} />
      {textos.map((t) => (
        <Sequence key={`banda-${t.f0}`} from={t.f0} durationInFrames={t.f1 - t.f0} layout="none">
          <BloqueBanda texto={t} geo={geo} />
        </Sequence>
      ))}
      <MicrorrotuloCapa micro={microrrotulo} geo={geo} top={microTop ?? top + 34} />
    </>
  );
};
