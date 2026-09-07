/**
 * DemoSaaS · la cámara (§4.3): keyframes {f, s, foco} interpolados con spring
 * (damping 200) estirado a la duración del tramo. transform-origin 0 0 fijo;
 * el translate centra el foco y se acota para no enseñar el borde del iframe.
 * Sin will-change: queremos que Chrome re-rasterice al escalar.
 */
import React from "react";
import { spring } from "remotion";
import { APP_H, APP_W, CAMARA, FPS } from "./guion";
import { resolverBlanco } from "./Cursor";

const acotar = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

/** El tramo de cámara activo en este frame y el avance del spring dentro de él. */
function tramoEn(frame: number) {
  const kfs = CAMARA;
  let i = 0;
  while (i < kfs.length - 1 && kfs[i + 1].f <= frame) i++;
  const a = kfs[i];
  const b = kfs[Math.min(i + 1, kfs.length - 1)];
  let p = 1;
  if (b.f > a.f && frame < b.f) {
    p = spring({
      frame: frame - a.f,
      fps: FPS,
      durationInFrames: b.f - a.f,
      config: { damping: 200 },
    });
  }
  return { a, b, p };
}

/** Solo la escala de la cámara (sin DOM): la usa la viñeta de la ventana. */
export function escalaCamaraEn(frame: number): number {
  const { a, b, p } = tramoEn(frame);
  return a.s + (b.s - a.s) * p;
}

export function transformCamaraEn(frame: number, doc: Document): string {
  const { a, b, p } = tramoEn(frame);

  const focoA = resolverBlanco(doc, a.foco, false, "camara");
  const focoB = resolverBlanco(doc, b.foco, false, "camara");
  const s = a.s + (b.s - a.s) * p;
  const cx = focoA.x + (focoB.x - focoA.x) * p;
  const cy = focoA.y + (focoB.y - focoA.y) * p;

  const tx = acotar(APP_W / 2 - cx * s, APP_W - APP_W * s, 0);
  const ty = acotar(APP_H / 2 - cy * s, APP_H - APP_H * s, 0);
  return `translate(${tx.toFixed(3)}px, ${ty.toFixed(3)}px) scale(${s.toFixed(4)})`;
}

/** El wrapper que la cámara transforma: iframe + capa de cursor. */
export const Camara = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: APP_W,
        height: APP_H,
        transformOrigin: "0 0",
      }}
    >
      {children}
    </div>
  ),
);
Camara.displayName = "Camara";
