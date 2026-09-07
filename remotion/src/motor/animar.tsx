/**
 * Motor de movimiento Tuvetia (skill remotion-tuvetia).
 *
 * Regla madre: cada elemento se anima solo, con su propio timing.
 *   --i   orden del elemento          --y   distancia que recorre (px)
 *   --d   duración de su entrada      --gap separación entre elementos (frames)
 * delay = i * gap. Spring suave (sin rebote). Nunca overflow:hidden alrededor.
 */
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "../marca/tokens";

export type Cascada = {
  /** Orden del elemento en la cascada. */
  i?: number;
  /** Frames entre un elemento y el siguiente. */
  gap?: number;
  /** Distancia vertical de entrada en px. */
  y?: number;
  /** Duración de la entrada en frames. */
  d?: number;
  /** Retraso base (frames) que se suma a i * gap. */
  delay?: number;
};

/** Curva del sistema (cubic-bezier .2,0,0,1) como easing de Remotion. */
export const easeTuvetia = Easing.bezier(EASE[0], EASE[1], EASE[2], EASE[3]);

/** Progreso 0→1 de la entrada de un elemento; spring suave, sin rebote. */
export const progresoEntrada = ({
  frame,
  fps,
  i = 0,
  gap = 6,
  y: _y,
  d = 24,
  delay = 0,
}: Cascada & { frame: number; fps: number }) => {
  void _y;
  const inicio = delay + i * gap;
  return spring({
    frame: frame - inicio,
    fps,
    config: { damping: 200 },
    durationInFrames: d,
  });
};

/** Estilo de entrada (opacidad + traslación) listo para poner en un `style`. */
export const estiloEntrada = (args: Cascada & { frame: number; fps: number }) => {
  const p = progresoEntrada(args);
  const y = args.y ?? 40;
  return {
    progreso: p,
    opacity: p,
    transform: `translateY(${((1 - p) * y).toFixed(2)}px)`,
  };
};

/**
 * Envuelve un elemento y lo hace entrar en cascada.
 * <Entra i={2} gap={18} y={40}>…</Entra>
 */
export const Entra: React.FC<
  Cascada & { style?: React.CSSProperties; children: React.ReactNode }
> = ({ style, children, ...cascada }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, transform } = estiloEntrada({ frame, fps, ...cascada });
  return <div style={{ opacity, transform, willChange: "transform", ...style }}>{children}</div>;
};

/** Contador: valor que crece de `desde` a `hasta` entre `inicio` e `inicio + d` frames, con la curva de la marca. */
export const contador = ({
  frame,
  desde = 0,
  hasta,
  inicio = 0,
  d,
  easing = easeTuvetia,
}: {
  frame: number;
  desde?: number;
  hasta: number;
  inicio?: number;
  d: number;
  easing?: (t: number) => number;
}) =>
  interpolate(frame, [inicio, inicio + d], [desde, hasta], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Formato numérico colombiano: punto de miles, coma decimal. 86400 → "86.400". */
export const formatoNumero = (n: number, decimales = 0) => {
  const fijo = Math.abs(n).toFixed(decimales);
  const [entero, dec] = fijo.split(".");
  const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${n < 0 ? "-" : ""}${miles}${dec ? `,${dec}` : ""}`;
};
