/**
 * DemoSaaS · la app real como motor de render (§2).
 *
 * Un iframe mismo-origen carga la copia parchada; en cada frame, un solo efecto
 * imperativo corre el pipeline completo, en este orden:
 *   replay puro (estado.ts) → toasts de la tabla → animaciones de overlay → hover/active
 *   → pulso/eq/spinner → scroll → anillos de atención → tuteo → cursor → cámara.
 * Nada de setState en ese camino: cursor y cámara se posicionan por ref.
 */
import React, { useCallback, useRef, useState } from "react";
import { continueRender, delayRender, IFrame, staticFile, useCurrentFrame } from "remotion";
import { easeTuvetia } from "../motor/animar";
import { Camara, transformCamaraEn } from "./Camara";
import { estadoCursorEn, resolverBlanco, CapaCursor } from "./Cursor";
import { FUENTE } from "../marca/fuentes";
import { TV } from "../marca/tokens";
import { aplicarReplay } from "./estado";
import {
  ANILLOS_ATENCION,
  APERTURAS_OVERLAY,
  APP_H,
  APP_W,
  BURBUJAS,
  CIERRE_CHAT_F0,
  CLICS,
  ESCRITURA_SOAP,
  GRABACION,
  HOVERS,
  SCROLLS,
  TOASTS,
} from "./guion";
import type { Blanco, CtxReplay, VentanaApp } from "./guion";
import { inyectarHoverSim } from "./hover";
import { aplicarTuteo } from "./tuteo";

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

function buscar(doc: Document, sel: string, texto?: string): HTMLElement | null {
  if (!texto) return doc.querySelector<HTMLElement>(sel);
  const todos = Array.from(doc.querySelectorAll<HTMLElement>(sel));
  return todos.find((el) => (el.textContent ?? "").includes(texto)) ?? null;
}

/* ── Toasts de la línea de tiempo (§4.4) ─────────────────────────────────────────────────── */
function aplicarToasts(win: VentanaApp, frame: number, ctx: CtxReplay): void {
  const doc = win.document;
  const avisos = doc.getElementById("avisos");
  if (avisos) avisos.innerHTML = "";
  for (const t of TOASTS) {
    if (frame < t.f0 || frame >= t.f1) continue;
    const { texto, opts } = t.crear(win.app, ctx);
    const id = win.app.toast(texto, opts);
    const nodo = doc.getElementById(id);
    if (!nodo) continue;
    const entrada = easeTuvetia(clamp01((frame - t.f0) / 5));
    const salida = clamp01((t.f1 - frame) / 6);
    nodo.style.opacity = String(Math.min(entrada, salida));
    nodo.style.transform = `translateY(${((1 - entrada) * 8).toFixed(2)}px)`;
  }
}

/* ── Post-proceso del DOM (§4.2, §4.6, §4.7) ─────────────────────────────────────────────── */
function resolverScroll(doc: Document, cont: HTMLElement, v: number | Blanco): number {
  if (typeof v === "number") return v;
  const el = v.sel ? buscar(doc, v.sel, v.texto) : null;
  if (!el) return 0;
  const rc = cont.getBoundingClientRect();
  const re = el.getBoundingClientRect();
  const objetivo = re.top + re.height / 2 - (rc.top + rc.height / 2) + cont.scrollTop;
  return Math.min(Math.max(0, objetivo), cont.scrollHeight - cont.clientHeight);
}

function postProceso(win: VentanaApp, frame: number): void {
  const doc = win.document;

  /* El panel del notch (la transcripción en miniatura): pop de entrada y de salida. */
  const panel = doc.querySelector<HTMLElement>(".notch-panel");
  if (panel) {
    const pIn = easeTuvetia(clamp01((frame - GRABACION.panelAbre) / 10));
    const pOut = clamp01((GRABACION.panelCierra - frame) / 8);
    const p = Math.min(pIn, pOut);
    panel.style.opacity = p.toFixed(3);
    panel.style.transformOrigin = "50% 0";
    panel.style.transform = `scale(${(0.95 + 0.05 * p).toFixed(4)})`;
  }

  /* Aperturas de diálogo/cajón: 10 frames de scale .96→1 + opacidad, velo 0→1. */
  for (const ap of APERTURAS_OVERLAY) {
    if (frame < ap.f || frame >= ap.f + 10) continue;
    const p = easeTuvetia((frame - ap.f) / 10);
    const velo = doc.querySelector<HTMLElement>("#overlays .velo");
    if (velo) velo.style.opacity = String(p);
    const caja = doc.querySelector<HTMLElement>(
      ap.tipo === "dialogo" ? "#overlays .dialogo" : "#overlays .cajon",
    );
    if (caja) {
      caja.style.opacity = String(p);
      if (ap.tipo === "dialogo") {
        caja.style.transform = `translate(-50%,-50%) scale(${(0.96 + 0.04 * p).toFixed(4)})`;
      } else {
        caja.style.transformOrigin = "100% 50%";
        caja.style.transform = `scale(${(0.96 + 0.04 * p).toFixed(4)})`;
      }
    }
  }

  /* Hover simulado + levantón interpolado (entrada 8 frames, salida 6). */
  for (const h of HOVERS) {
    const enHover = frame >= h.f0 && frame <= h.f1;
    const enSalida = frame > h.f1 && frame <= h.f1 + 6;
    if (!enHover && !enSalida) continue;
    const el = buscar(doc, h.sel, h.texto);
    if (!el) continue;
    if (enHover) el.classList.add("hover-sim");
    if (h.lift) {
      const p = enHover
        ? easeTuvetia(clamp01((frame - h.f0) / 8))
        : easeTuvetia(clamp01((h.f1 + 6 - frame) / 6));
      el.style.transform = `translateY(${(-2 * p).toFixed(2)}px)`;
      el.style.boxShadow = `0 1px 2px rgba(12,22,19,${(0.05 * (1 - p)).toFixed(3)}), 0 4px 12px rgba(12,22,19,${(0.08 * p).toFixed(3)})`;
    }
  }

  /* Active simulado: 4 frames sobre el elemento clicado (si sigue existiendo). */
  for (const c of CLICS) {
    if (!c.sobre || frame < c.f || frame >= c.f + 4) continue;
    const el = buscar(doc, c.sobre.sel, c.sobre.texto);
    if (el) el.classList.add("active-sim");
  }

  /* Lo vivo: punto que pulsa, barras del eq, spinner (§4.6). */
  const opPulso = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((2 * Math.PI * frame) / 48));
  for (const el of Array.from(
    doc.querySelectorAll<HTMLElement>('[style*="pulso"], .notch .vivo'),
  )) {
    el.style.opacity = opPulso.toFixed(3);
  }
  const barras = Array.from(doc.querySelectorAll<HTMLElement>(".eq i"));
  barras.forEach((barra, k) => {
    const sy = 0.7 + 0.3 * Math.sin(2 * Math.PI * (frame / 30 + k / 5));
    barra.style.transform = `scaleY(${sy.toFixed(3)})`;
    barra.style.transformOrigin = "bottom";
  });
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>(".girando"))) {
    el.style.transform = `rotate(${(frame * 12) % 360}deg)`;
  }

  /* Scroll del contenedor real (.cuerpo) según la tabla. */
  const cuerpo = doc.querySelector<HTMLElement>(".cuerpo");
  if (cuerpo) {
    let scrollY: number | null = null;
    for (const s of SCROLLS) {
      if (frame >= s.f1) {
        scrollY = resolverScroll(doc, cuerpo, s.hasta);
      } else if (frame >= s.f0) {
        const de = resolverScroll(doc, cuerpo, s.desde);
        const a = resolverScroll(doc, cuerpo, s.hasta);
        scrollY = de + (a - de) * easeTuvetia((frame - s.f0) / (s.f1 - s.f0));
      }
    }
    if (scrollY !== null) cuerpo.scrollTop = scrollY;
  }

  /* Pasada 6: la nota SOAP se escribe sola ante cámara (S → O → A → P). Antes vivía
     escondida bajo un interludio; ahora es el plano principal. Los campos arrancan
     vacíos al terminar la transcripción y se llenan en orden, con caret en el activo. */
  if (frame >= GRABACION.finTranscribiendo && frame <= ESCRITURA_SOAP.f1) {
    const campos = Array.from(doc.querySelectorAll<HTMLTextAreaElement>(ESCRITURA_SOAP.sel));
    const total = campos.reduce((n, c) => n + c.value.length, 0);
    const p = Math.max(
      0,
      Math.min(1, (frame - ESCRITURA_SOAP.f0) / (ESCRITURA_SOAP.f1 - ESCRITURA_SOAP.f0)),
    );
    let restante = Math.floor(total * p);
    let escribiendo = true;
    for (const c of campos) {
      const completo = c.value;
      if (!escribiendo) {
        c.value = "";
        continue;
      }
      if (restante >= completo.length) {
        restante -= completo.length;
        continue;
      }
      c.value = completo.slice(0, restante) + (p < 1 ? "|" : "");
      escribiendo = false;
    }
  }

  /* La tira «Se está oyendo» sigue al texto (cuando está montada). */
  if (frame >= GRABACION.inicio && frame <= GRABACION.finTranscribiendo) {
    const tira = doc.getElementById("tira-oyendo");
    if (tira) tira.scrollTop = tira.scrollHeight;
  }

  /* El chat del titular: scrolleado al último mensaje y con la tarjeta PDF puesta. */
  if (frame >= CIERRE_CHAT_F0) {
    const burbujas = doc.getElementById("burbujas");
    if (burbujas) burbujas.scrollTop = burbujas.scrollHeight;
  }
  inyectarTarjetaPdf(win);

  /* Anillo de atención de 3.3 sobre las pastillas que se movieron. */
  for (const a of ANILLOS_ATENCION) {
    if (frame < a.f0 || frame > a.f1) continue;
    const el = buscar(doc, a.sel, a.texto);
    if (!el) continue;
    const alfa = 0.5 * (1 - (frame - a.f0) / (a.f1 - a.f0));
    el.style.boxShadow = `0 0 0 1px rgba(18,133,106,${alfa.toFixed(3)})`;
  }

  /* Tuteo al final, sobre el DOM completo (incluye overlays y toasts). */
  aplicarTuteo(doc);
}

/* La burbuja de la factura lleva una tarjeta tipo documento, como un PDF adjunto real de
   WhatsApp. La app no modela adjuntos: la tarjeta se inyecta sobre la burbuja que el
   replay registró (número y total salen de la factura real del replay — ver NOTAS.md). */
function inyectarTarjetaPdf(win: VentanaApp): void {
  const doc = win.document;
  const burbuja = Array.from(doc.querySelectorAll<HTMLElement>("div.burbuja.mia")).find((b) =>
    (b.textContent ?? "").includes("Te comparto la factura"),
  );
  if (!burbuja || burbuja.querySelector(".pdf-demo")) return;
  const f = win.app.DB.facturas[0];
  if (!f || !f.numero) return;
  const total = win.app.fmtCOP(win.app.totalDeFactura(f));
  const tarjeta = doc.createElement("div");
  tarjeta.className = "pdf-demo";
  tarjeta.setAttribute(
    "style",
    "display:flex;align-items:center;gap:10px;margin:2px 0 8px;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,.16)",
  );
  tarjeta.innerHTML = `
    <svg width="34" height="34" viewBox="0 0 34 34" style="flex:none" aria-hidden="true">
      <rect width="34" height="34" rx="7" fill="#c03a2e"/>
      <text x="17" y="21.5" text-anchor="middle" font-family="'Inter Tight',system-ui,sans-serif" font-size="10.5" font-weight="700" fill="#ffffff">PDF</text>
    </svg>
    <span style="min-width:0">
      <span style="display:block;font-weight:600;font-size:13.5px;line-height:1.3">Factura ${f.numero}.pdf</span>
      <span style="display:block;font-size:11.5px;opacity:.85">PDF · 1 página · ${total}</span>
    </span>`;
  burbuja.insertBefore(tarjeta, burbuja.firstChild);
}

/* ── Burbujas explicativas: pop in/out ancladas a la interfaz (siguen a la cámara) ──────── */
function pintarBurbuja(win: VentanaApp, frame: number, el: HTMLDivElement | null): void {
  if (!el) return;
  const def = BURBUJAS.find((b) => frame >= b.f0 && frame < b.f1);
  if (!def) {
    el.style.display = "none";
    return;
  }
  const ancla = resolverBlanco(win.document, def.ancla, false, "burbuja");
  const pIn = easeTuvetia(clamp01((frame - def.f0) / 10));
  const pOut = clamp01((def.f1 - frame) / 8);
  const p = Math.min(pIn, pOut);
  el.style.display = "block";
  el.textContent = def.texto;
  el.style.left = `${(ancla.x + def.dx).toFixed(2)}px`;
  el.style.top = `${(ancla.y + def.dy).toFixed(2)}px`;
  el.style.opacity = p.toFixed(3);
  el.style.transform = `translateY(${((1 - pIn) * 8).toFixed(2)}px) scale(${(0.86 + 0.14 * pIn).toFixed(4)})`;
}

/* ── El pipeline de un frame ─────────────────────────────────────────────────────────────── */
function pintarFrame(
  win: VentanaApp,
  frame: number,
  camara: HTMLDivElement | null,
  cursor: HTMLDivElement | null,
  anillo: HTMLDivElement | null,
  burbuja: HTMLDivElement | null,
): void {
  const ctx = aplicarReplay(win, frame);
  aplicarToasts(win, frame, ctx);
  postProceso(win, frame);
  pintarBurbuja(win, frame, burbuja);

  const doc = win.document;
  const est = estadoCursorEn(frame, doc);
  if (cursor) {
    cursor.style.display = est.visible ? "block" : "none";
    if (est.visible) {
      cursor.style.left = `${(est.x - 1.5).toFixed(2)}px`;
      cursor.style.top = `${(est.y - 1.5).toFixed(2)}px`;
      cursor.style.transform = `scale(${est.escala.toFixed(4)})`;
    }
  }
  if (anillo) {
    const a = est.visible ? est.anillo : null;
    anillo.style.display = a ? "block" : "none";
    if (a) {
      anillo.style.left = `${(est.x - a.radio).toFixed(2)}px`;
      anillo.style.top = `${(est.y - a.radio).toFixed(2)}px`;
      anillo.style.width = `${(a.radio * 2).toFixed(2)}px`;
      anillo.style.height = `${(a.radio * 2).toFixed(2)}px`;
      anillo.style.opacity = a.opacidad.toFixed(3);
    }
  }
  if (camara) camara.style.transform = transformCamaraEn(frame, doc);
}

/* ── Componente ──────────────────────────────────────────────────────────────────────────── */
export const AppEmbebida: React.FC = () => {
  const frame = useCurrentFrame();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const anilloRef = useRef<HTMLDivElement>(null);
  const burbujaRef = useRef<HTMLDivElement>(null);
  const [cargaHandle] = useState(() => delayRender("app de tuvetia: window.app + fuentes"));
  const [lista, setLista] = useState(false);

  const alCargar = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const esperar = (): void => {
      const win = iframe.contentWindow as VentanaApp | null;
      const doc = iframe.contentDocument;
      if (!win || !doc || !win.app) {
        setTimeout(esperar, 25);
        return;
      }
      const fuentes = [
        '700 26px "Archivo"',
        '600 17px "Archivo"',
        '400 15px "Inter Tight"',
        '600 15px "Inter Tight"',
        '500 11px "JetBrains Mono"',
      ];
      Promise.all(fuentes.map((f) => doc.fonts.load(f)))
        .then(() => doc.fonts.ready)
        .then(() => {
          inyectarHoverSim(doc);
          setLista(true);
          continueRender(cargaHandle);
        });
    };
    esperar();
  }, [cargaHandle]);

  React.useLayoutEffect(() => {
    if (!lista) return;
    const win = iframeRef.current?.contentWindow as VentanaApp | null;
    if (!win || !win.app) return;
    const handle = delayRender(`DemoSaaS: estado del frame ${frame}`);
    try {
      pintarFrame(
        win,
        frame,
        camRef.current,
        cursorRef.current,
        anilloRef.current,
        burbujaRef.current,
      );
    } finally {
      continueRender(handle);
    }
  }, [frame, lista]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Camara ref={camRef}>
        <IFrame
          ref={iframeRef}
          src={staticFile("app/tuvetia-app.html")}
          onLoad={alCargar}
          style={{ width: APP_W, height: APP_H, border: 0, display: "block", background: "#ffffff" }}
          title="Tuvetia"
        />
        <div
          ref={burbujaRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            display: "none",
            maxWidth: 360,
            padding: "10px 14px",
            background: "#ffffff",
            border: `1px solid ${TV.border}`,
            borderLeft: `3px solid ${TV.accent}`,
            borderRadius: 12,
            boxShadow: TV.shadowPopover,
            fontFamily: FUENTE.sans,
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.35,
            color: TV.text,
            pointerEvents: "none",
            transformOrigin: "0 0",
          }}
        />
        <CapaCursor ref={cursorRef} anilloRef={anilloRef} />
      </Camara>
    </div>
  );
};
