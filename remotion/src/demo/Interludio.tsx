/**
 * DemoSaaS · interludios (pasada 3): plantillas de texto a pantalla completa.
 * La ventana de la app se atenúa (eso lo hace DemoSaaS) y la frase se escribe
 * en tiempo real, con caret menta parpadeando; el rótulo mono entra arriba.
 * Pasada 6: la escritura arranca en el frame 1 (cero nieve vacía); `logo` pone el
 * logo horizontal en vez del rótulo (el gancho de apertura) y `corte: "seco"` entra
 * y sale sin fundido (el cierre por pares).
 */
import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FUENTE } from "../marca/fuentes";
import { TRACKING, TV } from "../marca/tokens";
import { easeTuvetia } from "../motor/animar";
import type { Interludio as InterludioDef } from "./guion";

/* La velocidad se adapta a la duración: la frase siempre queda completa antes de la
   salida (mínimo ~1.2 caracteres por frame; los interludios cortos escriben más rápido). */
export function velocidadDeEscritura(frase: string, dur: number): number {
  return Math.max(1.2, (frase.length + 2) / Math.max(1, dur - 14));
}

/** Frames que dura la escritura (la usa Sonido.tsx para el tecleo). */
export function framesDeEscritura(frase: string, dur: number): number {
  return Math.min(dur, Math.ceil(frase.length / velocidadDeEscritura(frase, dur)) + 6);
}

export const Interludio: React.FC<{ def: InterludioDef }> = ({ def }) => {
  const lf = useCurrentFrame();
  const dur = def.f1 - def.f0;
  const seco = def.corte === "seco";
  const velocidad = velocidadDeEscritura(def.frase, dur);
  const n = Math.max(0, Math.min(def.frase.length, Math.floor((lf - 1) * velocidad)));
  const colorFrase = def.tono === "rojo" ? TV.danger : TV.text;
  const completo = n >= def.frase.length;
  const caretVisible = !completo || lf % 30 < 15;
  const salida = interpolate(lf, [dur - (seco ? 2 : 8), dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotuloEntra = interpolate(lf, [0, seco ? 4 : 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeTuvetia,
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: def.logo ? 36 : 28,
        opacity: salida,
        padding: "0 160px",
      }}
    >
      {def.logo ? (
        <Img
          src={staticFile("marca/logo-horizontal.svg")}
          style={{
            width: 250,
            display: "block",
            opacity: rotuloEntra,
            transform: `translateY(${((1 - rotuloEntra) * 14).toFixed(2)}px)`,
          }}
        />
      ) : (
        <div
          style={{
            fontFamily: FUENTE.mono,
            fontSize: 15,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: `${TRACKING.rotulo}em`,
            color: TV.muted,
            opacity: rotuloEntra,
            transform: `translateY(${((1 - rotuloEntra) * 14).toFixed(2)}px)`,
          }}
        >
          {def.rotulo}
        </div>
      )}
      <div
        style={{
          fontFamily: FUENTE.display,
          fontWeight: 700,
          fontSize: 56,
          lineHeight: 1.15,
          letterSpacing: `${TRACKING.titular}em`,
          color: colorFrase,
          textAlign: "center",
          maxWidth: 1400,
        }}
      >
        {def.frase.slice(0, n)}
        <span
          style={{
            display: "inline-block",
            width: 5,
            height: "0.92em",
            marginLeft: 6,
            verticalAlign: "-0.12em",
            background: def.tono === "rojo" ? TV.danger : TV.accent,
            opacity: caretVisible ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};
