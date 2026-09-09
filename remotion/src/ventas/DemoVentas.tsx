/**
 * DemoVentas · la composición (prompts/remotion/prompts/demo-ventas.md sobre la plantilla): reel
 * 1080×1920 · 30 fps · 1500 frames, sólo escritorio. Capas de atrás hacia adelante (plantilla §3):
 * nieve con grano → ventana de escritorio (plano general con cromo en el acto 1; corte a la columna
 * de lectura del acto 2 en adelante) → banda de texto + microrrótulo → cierre → sonido → voz opcional.
 *
 * La superficie vive fuera de cualquier <Sequence>: se monta en el frame 0 y no se desmonta nunca.
 */
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Cierre } from "../demo/Cierre";
import { FUENTE } from "../marca/fuentes";
import { TV } from "../marca/tokens";
import { Grano } from "../motor/Grano";
import { Banda } from "../pieza/Banda";
import { Sonido } from "../pieza/Sonido";
import type { GeometriaSuperficie, GuionSuperficie, LayoutVentana } from "../pieza/tipos";
import { Ventana } from "../pieza/Ventana";
import { aplicarReplay } from "./estado";
import {
  ACTOS,
  camaraEn,
  CLICS,
  CON_VOZ,
  DURACION,
  ESCRITORIO,
  LIENZO,
  MARCO,
  MICRORROTULO,
  MUSICA,
  TEXTOS,
  tramosCursor,
  vistaEn,
  VOL_MUSICA,
  encuadreEn,
  ENCUADRES,
} from "./guion";
import { postProceso } from "./postproceso";
import type { CtxVentas, VentanaVentas } from "./tipos";

/** Acto 1: la ventana completa a 0.65 con cromo, en y 700. Del acto 2 en adelante: corte seco a la
 *  columna de lectura, sin cromo, escalada a los 1080 de ancho, en y 250. Visible hasta el cierre. */
const layoutEn = (frame: number): LayoutVentana => {
  const enc = encuadreEn(frame);
  const vista = vistaEn(frame);
  if (enc === "general") {
    return { vista, escala: MARCO.escala, top: MARCO.top, conCromo: true, k: 1, opacidad: 1, visible: frame < ACTOS.cierre };
  }
  return { vista, escala: ENCUADRES[enc].escala, top: ENCUADRES[enc].top, conCromo: false, k: 0, opacidad: 1, visible: frame < ACTOS.cierre };
};

const GEOMETRIA: GeometriaSuperficie = {
  app: { w: ESCRITORIO.w, h: ESCRITORIO.h },
  visibleEn: (f) => f < ACTOS.cierre,
  vistaEn,
  camaraEn,
};

const GUION: GuionSuperficie<CtxVentas> = {
  replay: (win, frame) => aplicarReplay(win as VentanaVentas, frame),
  postProceso,
  cursor: { tramos: tramosCursor, clics: CLICS },
};

export const DemoVentas: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: TV.surface2, color: TV.text, fontFamily: FUENTE.sans }}>
      {frame < ACTOS.cierre ? <Grano ancho={LIENZO.w} alto={LIENZO.h} id="grano-ventas" /> : null}
      <Ventana layoutEn={layoutEn} geometria={GEOMETRIA} guion={GUION} lienzoAncho={LIENZO.w} />
      {/* El microrrótulo baja bajo la banda (y 1622, dentro de la zona segura): el rótulo del acto 8,
          «CADA MOVIMIENTO DEJA RASTRO», ocupa toda la fila del rótulo. */}
      <Banda textos={TEXTOS} microrrotulo={MICRORROTULO} lienzo={LIENZO} microTop={1622} />
      <Sequence from={ACTOS.cierre} durationInFrames={DURACION - ACTOS.cierre} layout="none">
        <Cierre logo={620} claim={72} cta={34} micro={22} gap={56} />
      </Sequence>
      <Sonido musica={MUSICA} volumen={VOL_MUSICA} duracion={DURACION} />
      {CON_VOZ ? (
        <Sequence layout="none">
          <Audio src={staticFile("voz/demo-ventas.mp3")} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
