/**
 * ExplainerRAG · el esquema del corpus (§5.1 del encargo; acto 6 en la orden v2): el único
 * momento que no es la app.
 * Scrim grafito a 0.92; rótulo «ESQUEMA — NO ES LA INTERFAZ» (sin esto no se publica); un campo
 * de 40×25 marcas que entra en cascada por columnas; el contador a CORPUS con formatoNumero;
 * dos marcas fijas que pasan a menta, crecen y bajan hasta volverse las pastillas [1] y [2].
 * Prohibido: cualquier otro número, cronómetros, porcentajes, barras de relevancia. Las marcas
 * son una representación, no un conteo.
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FUENTE } from "../marca/fuentes";
import { TRACKING, TV_DARK } from "../marca/tokens";
import { contador, easeTuvetia, Entra, formatoNumero } from "../motor/animar";
import { ACTOS, CORPUS, LIENZO } from "./guion";

const F0 = ACTOS.corpus;
const F1 = ACTOS.respuesta;
/* Hitos relativos al acto (orden v2 §C): scrim F0→F0+20, retícula F0+20→F0+80, contador desde
   F0+20 (d 90), marcas en menta F0+90→F0+130, bajada F0+130→F0+160 (las pastillas cuajan en los
   últimos 8 frames), scrim fuera F1−20→F1. */
const RETICULA = F0 + 20;
const CONTADOR = F0 + 20;
const RESALTE = [F0 + 90, F0 + 130] as const;
const BAJADA = [F0 + 130, F0 + 160] as const;
const PASTILLA = [F0 + 152, F0 + 160] as const;
const COLS = 40;
const FILAS = 25;
const PUNTO = 3;
const GAP = 14;
const PASO = PUNTO + GAP;
const CAMPO_W = COLS * PUNTO + (COLS - 1) * GAP;
const CAMPO_H = FILAS * PUNTO + (FILAS - 1) * GAP;
const CAMPO = { left: (LIENZO.w - CAMPO_W) / 2, top: 380 } as const;
/** Posiciones fijas, elegidas a mano (no aleatorias). */
const MARCAS = [
  { col: 12, fila: 8 },
  { col: 27, fila: 15 },
] as const;
/** Lejos del borde del campo: a un tercio de la bajada las dos ya tienen que verse fuera. */
const PASTILLA_Y = CAMPO.top + CAMPO_H + 120;
const PASTILLA_X = [LIENZO.w / 2 - 46, LIENZO.w / 2 + 46] as const;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const COLUMNAS = Array.from({ length: COLS }, (_, c) => c);
const FILAS_IDX = Array.from({ length: FILAS }, (_, r) => r);

const estiloRotulo: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  textAlign: "center",
  fontFamily: FUENTE.mono,
  fontSize: 22,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: `${TRACKING.rotulo}em`,
  color: TV_DARK.muted,
};

/** La forma de `.cita` de la app, a ×2 (como se ve en el móvil). */
const estiloPastilla: React.CSSProperties = {
  position: "absolute",
  transform: "translate(-50%, -50%)",
  display: "inline-block",
  padding: "0 8px",
  border: `2px solid ${TV_DARK.border}`,
  borderRadius: 12,
  background: TV_DARK.accentSoft,
  fontFamily: FUENTE.mono,
  fontSize: 22,
  fontWeight: 700,
  lineHeight: "36px",
  color: TV_DARK.text,
  textDecoration: "underline dotted",
  textUnderlineOffset: 4,
};

export const Esquema: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < F0 || frame >= F1) return null;

  const velo = interpolate(frame, [F0, F0 + 20, F1 - 20, F1], [0, 1, 1, 0], CLAMP);
  const n = contador({ frame, desde: 0, hasta: CORPUS, inicio: CONTADOR, d: 90 });
  const resalte = interpolate(frame, [RESALTE[0], RESALTE[1]], [0, 1], { ...CLAMP, easing: easeTuvetia });
  const bajada = interpolate(frame, [BAJADA[0], BAJADA[1]], [0, 1], { ...CLAMP, easing: easeTuvetia });
  const pastilla = interpolate(frame, [PASTILLA[0], PASTILLA[1]], [0, 1], CLAMP);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: TV_DARK.surface, opacity: 0.92 * velo }} />
      <div style={{ position: "absolute", inset: 0, opacity: velo }}>
        <div style={{ ...estiloRotulo, top: 300 }}>ESQUEMA — NO ES LA INTERFAZ</div>

        {/* El campo: 40 columnas × 25 filas, cascada por columnas en los 60 frames desde RETICULA. */}
        <div style={{ position: "absolute", left: CAMPO.left, top: CAMPO.top, display: "flex", gap: GAP }}>
          {COLUMNAS.map((c) => (
            <Entra
              key={c}
              i={c}
              gap={1}
              y={8}
              d={14}
              delay={RETICULA}
              style={{ display: "flex", flexDirection: "column", gap: GAP }}
            >
              {FILAS_IDX.map((r) => {
                const esMarca = MARCAS.some((m) => m.col === c && m.fila === r);
                return (
                  <span
                    key={r}
                    style={{
                      width: PUNTO,
                      height: PUNTO,
                      borderRadius: 1,
                      background: TV_DARK.borderStrong,
                      opacity: esMarca && frame >= RESALTE[0] ? 0 : 0.35,
                    }}
                  />
                );
              })}
            </Entra>
          ))}
        </div>

        {/* Las dos fuentes: pasan a menta y crecen (RESALTE), bajan rectas (BAJADA) y se vuelven
            las pastillas [1] y [2]. */}
        {frame >= RESALTE[0]
          ? MARCAS.map((m, i) => {
              const x0 = CAMPO.left + m.col * PASO + PUNTO / 2;
              const y0 = CAMPO.top + m.fila * PASO + PUNTO / 2;
              const x = x0 + (PASTILLA_X[i] - x0) * bajada;
              const y = y0 + (PASTILLA_Y - y0) * bajada;
              const tam = PUNTO + (9 - PUNTO) * resalte;
              return (
                <React.Fragment key={i}>
                  <span
                    style={{
                      position: "absolute",
                      left: x - tam / 2,
                      top: y - tam / 2,
                      width: tam,
                      height: tam,
                      borderRadius: 2,
                      background: TV_DARK.accent,
                      opacity: (0.35 + 0.65 * resalte) * (1 - pastilla),
                    }}
                  />
                  <span style={{ ...estiloPastilla, left: PASTILLA_X[i], top: PASTILLA_Y, opacity: pastilla }}>
                    [{i + 1}]
                  </span>
                </React.Fragment>
              );
            })
          : null}

        {/* El contador: el único número del esquema. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: PASTILLA_Y + 60,
            textAlign: "center",
            fontFamily: FUENTE.mono,
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: TV_DARK.text,
          }}
        >
          {formatoNumero(Math.round(n))}
        </div>
        <div style={{ ...estiloRotulo, top: PASTILLA_Y + 186 }}>FUENTES VETERINARIAS</div>
      </div>
    </div>
  );
};
