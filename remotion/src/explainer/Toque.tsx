/**
 * ExplainerRAG · el toque en móvil (§4.1): sin flecha, un círculo de contacto que aparece y se
 * desvanece en 10 frames. Se posiciona por ref, en px de app, contra el DOM de ESTE frame.
 * Si la fila tocada no está, revienta con el nombre de la toma (sin repuesto x/y).
 */
import React from "react";
import { resolverBlanco } from "../demo/Cursor";
import type { DimsApp } from "../demo/Cursor";
import { TV } from "../marca/tokens";
import { easeTuvetia } from "../motor/animar";
import type { Toque } from "./guion";
import type { CtxExplainer } from "./tipos";

/** Diámetro en px de app: el móvil va a ×2, así que son 64 px en el lienzo. */
export const TOQUE_D = 32;

export interface EstadoToque {
  visible: boolean;
  x: number;
  y: number;
  opacidad: number;
  escala: number;
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

export function estadoToqueEn(
  frame: number,
  doc: Document,
  toques: readonly Toque[],
  ctx: CtxExplainer,
  dims: DimsApp,
): EstadoToque {
  for (const t of toques) {
    if (frame < t.f - 10 || frame >= t.f + 10) continue;
    const p = resolverBlanco(doc, t.blanco(ctx), true, t.toma, dims);
    const entra = easeTuvetia(clamp01((frame - (t.f - 10)) / 10));
    const sale = easeTuvetia(clamp01((t.f + 10 - frame) / 10));
    return {
      visible: true,
      x: p.x,
      y: p.y,
      opacidad: 0.25 * Math.min(entra, sale),
      escala: 0.7 + 0.3 * entra,
    };
  }
  return { visible: false, x: 0, y: 0, opacidad: 0, escala: 1 };
}

export const CapaToque = React.forwardRef<HTMLDivElement, { id?: string }>(({ id }, ref) => (
  <div
    ref={ref}
    id={id}
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: TOQUE_D,
      height: TOQUE_D,
      borderRadius: "50%",
      background: TV.accent,
      opacity: 0,
      display: "none",
      pointerEvents: "none",
      transformOrigin: "50% 50%",
    }}
  />
));
CapaToque.displayName = "CapaToque";
