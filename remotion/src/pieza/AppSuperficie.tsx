/**
 * Pieza · una superficie de la app (§2.3): el mismo HTML embebido en un <IFrame> a su viewport
 * nativo, con el replay de la pieza aplicado por frame. Puede haber varias instancias (escritorio
 * y móvil), montadas desde el frame 0 y nunca desmontadas; cuando una no es visible en un frame
 * no recibe estado (pero sigue ahí).
 *
 * Contrato: delayRender("app-<cual>") hasta que existan contentWindow.app y las fuentes; por
 * frame, useLayoutEffect → delayRender("estado-<cual>") → replay → post-proceso → cursor/toque
 * → cámara → continueRender. Nada de setState en ese camino.
 */
import React, { useCallback, useRef, useState } from "react";
import { continueRender, delayRender, IFrame, staticFile, useCurrentFrame } from "remotion";
import { Camara, transformCamara } from "../demo/Camara";
import { CapaCursor, estadoCursorDe } from "../demo/Cursor";
import { inyectarHoverSim } from "../demo/hover";
import { CapaToque, estadoToqueEn, TOQUE_D } from "./Toque";
import type { GeometriaSuperficie, GuionSuperficie, Superficie, VentanaBase } from "./tipos";

/* Un fonts.ready pelado resuelve antes de que se pidan las caras que la app usa. */
const FUENTES_APP = [
  '700 26px "Archivo"',
  '600 17px "Archivo"',
  '400 15px "Inter Tight"',
  '600 15px "Inter Tight"',
  '500 11px "JetBrains Mono"',
];

export const HTML_APP = "app/tuvetia-app.html";

export function AppSuperficie<Ctx>({
  cual,
  geometria,
  guion,
}: {
  cual: Superficie;
  geometria: GeometriaSuperficie;
  guion: GuionSuperficie<Ctx>;
}): React.ReactElement {
  const { app, visibleEn, vistaEn, camaraEn } = geometria;
  const frame = useCurrentFrame();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const anilloRef = useRef<HTMLDivElement>(null);
  const toqueRef = useRef<HTMLDivElement>(null);
  const [cargaHandle] = useState(() =>
    delayRender(`app-${cual}: window.app + fuentes`, { timeoutInMilliseconds: 90000 }),
  );
  const [lista, setLista] = useState(false);

  const alCargar = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const esperar = (): void => {
      const win = iframe.contentWindow as VentanaBase | null;
      const doc = iframe.contentDocument;
      if (!win || !doc || !win.app) {
        setTimeout(esperar, 25);
        return;
      }
      Promise.all(FUENTES_APP.map((f) => doc.fonts.load(f)))
        .then(() => doc.fonts.ready)
        .then(() => {
          inyectarHoverSim(doc);
          setLista(true);
          continueRender(cargaHandle);
        });
    };
    esperar();
  }, [cargaHandle]);

  const vista = vistaEn(frame);

  React.useLayoutEffect(() => {
    if (!lista) return;
    const win = iframeRef.current?.contentWindow as VentanaBase | null;
    if (!win || !win.app) return;
    const cursor = cursorRef.current;
    const anillo = anilloRef.current;
    const toque = toqueRef.current;
    if (!visibleEn(frame)) {
      if (cursor) cursor.style.display = "none";
      if (anillo) anillo.style.display = "none";
      if (toque) toque.style.display = "none";
      return;
    }
    const handle = delayRender(`estado-${cual} f${frame}`);
    try {
      const doc = win.document;
      const ctx = guion.replay(win, frame);
      guion.postProceso(doc, frame, cual, ctx);

      if (cual === "escritorio") {
        const est = guion.cursor
          ? estadoCursorDe(frame, doc, { tramos: guion.cursor.tramos(ctx), clics: guion.cursor.clics, dims: app })
          : null;
        if (cursor) {
          cursor.style.display = est && est.visible ? "block" : "none";
          if (est) {
            cursor.style.left = `${est.x - 1.5}px`;
            cursor.style.top = `${est.y - 1.5}px`;
            cursor.style.transform = `scale(${est.escala.toFixed(3)})`;
          }
        }
        if (anillo) {
          if (est && est.visible && est.anillo) {
            const a = est.anillo;
            anillo.style.display = "block";
            anillo.style.left = `${est.x - a.radio}px`;
            anillo.style.top = `${est.y - a.radio}px`;
            anillo.style.width = `${a.radio * 2}px`;
            anillo.style.height = `${a.radio * 2}px`;
            anillo.style.opacity = a.opacidad.toFixed(3);
          } else {
            anillo.style.display = "none";
          }
        }
      } else {
        const est = estadoToqueEn(frame, doc, guion.toques ?? [], ctx, app);
        if (toque) {
          toque.style.display = est.visible ? "block" : "none";
          toque.style.left = `${est.x - TOQUE_D / 2}px`;
          toque.style.top = `${est.y - TOQUE_D / 2}px`;
          toque.style.opacity = est.opacidad.toFixed(3);
          toque.style.transform = `scale(${est.escala.toFixed(3)})`;
        }
      }

      const cam = camRef.current;
      if (cam) {
        cam.style.transform = transformCamara({ frame, doc, kfs: camaraEn(frame), app, vista: vistaEn(frame) });
      }
    } finally {
      continueRender(handle);
    }
  }, [frame, lista, cual, app, visibleEn, vistaEn, camaraEn, guion]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: vista.w,
        height: vista.h,
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <Camara ref={camRef} ancho={app.w} alto={app.h} x={-vista.x0} y={-vista.y0}>
        <IFrame
          ref={iframeRef}
          src={staticFile(HTML_APP)}
          onLoad={alCargar}
          style={{ width: app.w, height: app.h, border: 0, display: "block", background: "#ffffff" }}
          title={`Tuvetia · ${cual}`}
        />
        {cual === "escritorio" ? (
          <CapaCursor ref={cursorRef} anilloRef={anilloRef} />
        ) : (
          <CapaToque ref={toqueRef} />
        )}
      </Camara>
    </div>
  );
}
