/**
 * DemoSaaS · la cámara (§4.3): keyframes {f, s, foco} interpolados con spring
 * (damping 200) estirado a la duración del tramo. transform-origin 0 0 fijo;
 * el translate centra el foco y se acota para no enseñar el borde del iframe.
 * Sin will-change: queremos que Chrome re-rasterice al escalar.
 *
 * Las funciones genéricas (`tramoCamara`, `escalaCamara`, `transformCamara`) reciben la tabla
 * de keyframes, el tamaño de la app y la `vista` (la región de la app que el encuadre muestra a
 * escala 1). `escalaCamaraEn` / `transformCamaraEn` son los wrappers del demo con sus tablas.
 */
import React from "react";
import { spring } from "remotion";
import { APP_H, APP_W, CAMARA, FPS } from "./guion";
import type { KeyframeCamara } from "./guion";
import { resolverBlanco } from "./Cursor";
import type { DimsApp } from "./Cursor";

/** Región de la app (px de app) que el contenedor muestra a escala 1. */
export interface Vista {
  x0: number;
  y0: number;
  w: number;
  h: number;
}

const acotar = (v: number, min: number, max: number): number =>
  Math.min(Math.max(min, max), Math.max(Math.min(min, max), v));

/** El tramo de cámara activo en este frame y el avance del spring dentro de él. */
export function tramoCamara(kfs: readonly KeyframeCamara[], frame: number, fps: number = FPS) {
  let i = 0;
  while (i < kfs.length - 1 && kfs[i + 1].f <= frame) i++;
  const a = kfs[i];
  const b = kfs[Math.min(i + 1, kfs.length - 1)];
  let p = 1;
  if (b.f > a.f && frame < b.f) {
    p = spring({
      frame: frame - a.f,
      fps,
      durationInFrames: b.f - a.f,
      config: { damping: 200 },
    });
  }
  return { a, b, p };
}

/** Solo la escala de la cámara (sin DOM). */
export function escalaCamara(kfs: readonly KeyframeCamara[], frame: number, fps: number = FPS): number {
  const { a, b, p } = tramoCamara(kfs, frame, fps);
  return a.s + (b.s - a.s) * p;
}

/**
 * El transform del grupo [iframe + cursor] colocado en `left:-vista.x0, top:-vista.y0` dentro
 * del contenedor que recorta la vista. Un punto p de la app cae en `-x0 + tx + p·s`, así que
 * `tx = vista.w/2 + x0 − cx·s` centra el foco. Se acota a `[(x0+w)(1−s), x0(1−s)]`: a s=1 el
 * corte muestra exactamente la vista (tx = 0, sin pan) y el zoom nunca sale de la región. Con
 * x0 = y0 = 0 y vista = app queda `[W − W·s, 0]`, la fórmula original del demo.
 */
export function transformCamara({
  frame,
  doc,
  kfs,
  app,
  vista,
  fps = FPS,
}: {
  frame: number;
  doc: Document;
  kfs: readonly KeyframeCamara[];
  app: DimsApp;
  vista: Vista;
  fps?: number;
}): string {
  const { a, b, p } = tramoCamara(kfs, frame, fps);

  const focoA = resolverBlanco(doc, a.foco, false, "camara", app);
  const focoB = resolverBlanco(doc, b.foco, false, "camara", app);
  const s = a.s + (b.s - a.s) * p;
  const cx = focoA.x + (focoB.x - focoA.x) * p;
  const cy = focoA.y + (focoB.y - focoA.y) * p;

  const tx = acotar(vista.w / 2 + vista.x0 - cx * s, (vista.x0 + vista.w) * (1 - s), vista.x0 * (1 - s));
  const ty = acotar(vista.h / 2 + vista.y0 - cy * s, (vista.y0 + vista.h) * (1 - s), vista.y0 * (1 - s));
  return `translate(${tx.toFixed(3)}px, ${ty.toFixed(3)}px) scale(${s.toFixed(4)})`;
}

const VISTA_DEMO: Vista = { x0: 0, y0: 0, w: APP_W, h: APP_H };
const APP_DEMO: DimsApp = { w: APP_W, h: APP_H };

/** Solo la escala de la cámara del demo (sin DOM): la usa la viñeta de la ventana. */
export function escalaCamaraEn(frame: number): number {
  return escalaCamara(CAMARA, frame);
}

export function transformCamaraEn(frame: number, doc: Document): string {
  return transformCamara({ frame, doc, kfs: CAMARA, app: APP_DEMO, vista: VISTA_DEMO });
}

/** El wrapper que la cámara transforma: iframe + capa de cursor. `x`/`y` lo desplazan para
 *  que la región `vista` del encuadre quede en el origen del contenedor. */
export const Camara = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; ancho?: number; alto?: number; x?: number; y?: number }
>(({ children, ancho = APP_W, alto = APP_H, x = 0, y = 0 }, ref) => (
  <div
    ref={ref}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: ancho,
      height: alto,
      transformOrigin: "0 0",
    }}
  >
    {children}
  </div>
));
Camara.displayName = "Camara";
