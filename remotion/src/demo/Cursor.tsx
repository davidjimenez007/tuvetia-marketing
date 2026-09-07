/**
 * DemoSaaS · el cursor (§4.1): flecha tipo macOS, viajes con arco leve, clic con
 * anillo menta. La posición se resuelve contra el DOM del iframe EN ESTE frame
 * (nunca se cachea entre frames); si un selector del guion no resuelve, revienta
 * con el nombre de la toma.
 */
import React from "react";
import { easeTuvetia } from "../motor/animar";
import { TV } from "../marca/tokens";
import { APP_H, APP_W, CLICS, CURSOR_TRAMOS } from "./guion";
import type { Blanco } from "./guion";

export interface EstadoCursor {
  visible: boolean;
  x: number;
  y: number;
  escala: number;
  anillo: { radio: number; opacidad: number } | null;
}

interface PuntoPx {
  x: number;
  y: number;
}

function buscarElemento(doc: Document, sel: string, texto?: string): Element | null {
  if (!texto) return doc.querySelector(sel);
  const candidatos = Array.from(doc.querySelectorAll(sel));
  return candidatos.find((el) => (el.textContent ?? "").includes(texto)) ?? null;
}

/** Centro de un blanco en px del área de app. `estricto` (cursor) revienta si el selector
 *  no resuelve y no hay punto de repuesto; la cámara usa el modo laxo. */
export function resolverBlanco(
  doc: Document,
  blanco: Blanco,
  estricto: boolean,
  toma: string,
): PuntoPx {
  if (blanco.sel) {
    const el = buscarElemento(doc, blanco.sel, blanco.texto);
    if (el) {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    if (typeof blanco.x === "number" && typeof blanco.y === "number") {
      return { x: blanco.x * APP_W, y: blanco.y * APP_H };
    }
    if (estricto) {
      throw new Error(`Cursor · toma "${toma}": el selector no resuelve: ${blanco.sel}`);
    }
    return { x: APP_W / 2, y: APP_H / 2 };
  }
  return { x: (blanco.x ?? 0.5) * APP_W, y: (blanco.y ?? 0.5) * APP_H };
}

/** Trayectoria recta con arco leve: bezier cuadrática con control desplazado 6 % de la
 *  distancia, perpendicular al trayecto. */
function puntoDeViaje(a: PuntoPx, b: PuntoPx, t: number): PuntoPx {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const mx = (a.x + b.x) / 2 - (dy / dist) * dist * 0.06;
  const my = (a.y + b.y) / 2 + (dx / dist) * dist * 0.06;
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * mx + t * t * b.x,
    y: u * u * a.y + 2 * u * t * my + t * t * b.y,
  };
}

export function estadoCursorEn(frame: number, doc: Document): EstadoCursor {
  let visible = false;
  let objetivo: Blanco | null = null;
  let objetivoToma = "";
  let viajeActivo: { desde: Blanco | null; hasta: Blanco; f0: number; f1: number; toma: string } | null =
    null;

  for (const tramo of CURSOR_TRAMOS) {
    if (tramo.tipo === "aparece" && frame >= tramo.f) {
      visible = true;
      objetivo = tramo.en;
      objetivoToma = tramo.toma;
      viajeActivo = null;
    } else if (tramo.tipo === "salta" && frame >= tramo.f) {
      objetivo = tramo.en;
      objetivoToma = tramo.toma;
      viajeActivo = null;
    } else if (tramo.tipo === "oculto" && frame >= tramo.f) {
      visible = false;
    } else if (tramo.tipo === "viaje") {
      if (frame >= tramo.f1) {
        objetivo = tramo.hasta;
        objetivoToma = tramo.toma;
        viajeActivo = null;
      } else if (frame >= tramo.f0) {
        viajeActivo = {
          desde: objetivo,
          hasta: tramo.hasta,
          f0: tramo.f0,
          f1: tramo.f1,
          toma: tramo.toma,
        };
      }
    }
  }

  let pos: PuntoPx = { x: APP_W / 2, y: APP_H / 2 };
  if (viajeActivo) {
    const a = viajeActivo.desde
      ? resolverBlanco(doc, viajeActivo.desde, true, `${viajeActivo.toma} (desde)`)
      : pos;
    const b = resolverBlanco(doc, viajeActivo.hasta, true, viajeActivo.toma);
    const t = easeTuvetia((frame - viajeActivo.f0) / (viajeActivo.f1 - viajeActivo.f0));
    pos = puntoDeViaje(a, b, t);
  } else if (objetivo) {
    pos = resolverBlanco(doc, objetivo, true, objetivoToma);
  }

  /* Clic: presión 3 frames antes, vuelta en 4; anillo de 14 frames desde el clic. */
  let escala = 1;
  let anillo: EstadoCursor["anillo"] = null;
  for (const clic of CLICS) {
    if (frame >= clic.f - 3 && frame < clic.f) {
      escala = 1 - 0.14 * easeTuvetia((frame - (clic.f - 3)) / 3);
    } else if (frame >= clic.f && frame < clic.f + 4) {
      escala = 0.86 + 0.14 * easeTuvetia((frame - clic.f) / 4);
    }
    if (frame >= clic.f && frame < clic.f + 14) {
      const t = (frame - clic.f) / 14;
      anillo = { radio: 44 * easeTuvetia(t), opacidad: 0.6 * (1 - t) };
    }
  }

  return { visible, x: pos.x, y: pos.y, escala, anillo };
}

/* ── Capa visual: flecha + anillo, posicionadas por ref desde AppEmbebida ────────────────── */
export const CapaCursor = React.forwardRef<
  HTMLDivElement,
  { anilloRef: React.RefObject<HTMLDivElement | null> }
>(({ anilloRef }, ref) => (
  <>
    <div
      ref={anilloRef}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        borderRadius: "50%",
        border: `2px solid ${TV.accent}`,
        pointerEvents: "none",
        display: "none",
      }}
    />
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 19,
        height: 26,
        pointerEvents: "none",
        display: "none",
        transformOrigin: "1.5px 1.5px",
        filter: "drop-shadow(0 2px 6px rgba(12,22,19,.28))",
      }}
    >
      <svg width="19" height="26" viewBox="0 0 19 26" style={{ display: "block" }}>
        <path
          d="M 1.5 1.5 L 1.5 20.6 L 6.2 16.4 L 9.2 23.6 L 12.6 22.2 L 9.6 15.1 L 16 14.9 Z"
          fill="#0c1613"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </>
));
CapaCursor.displayName = "CapaCursor";
