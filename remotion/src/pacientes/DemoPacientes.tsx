/**
 * DemoPacientes · la composición (prompts/demo-pacientes.md sobre la plantilla): reel 1080×1920 ·
 * 30 fps · 1500 frames, sólo escritorio. Capas (plantilla §3): nieve con grano → ventana de
 * escritorio (plano general con cromo en el acto 1; columnas de lectura del acto 2 en adelante) →
 * banda de texto + microrrótulo → cierre → sonido → voz opcional.
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
  ENCUADRES,
  encuadreEn,
  ESCRITORIO,
  LIENZO,
  MARCO,
  MICRORROTULO,
  MUSICA,
  TEXTOS,
  tramosCursor,
  vistaEn,
  VOL_MUSICA,
} from "./guion";
import { postProceso } from "./postproceso";
import type { CtxPacientes, VentanaPacientes } from "./tipos";

const layoutEn = (frame: number): LayoutVentana => {
  const enc = encuadreEn(frame);
  const vista = vistaEn(frame);
  const visible = frame < ACTOS.cierre;
  if (enc === "general") return { vista, escala: MARCO.escala, top: MARCO.top, conCromo: true, k: 1, opacidad: 1, visible };
  return { vista, escala: ENCUADRES[enc].escala, top: ENCUADRES[enc].top, conCromo: false, k: 0, opacidad: 1, visible };
};

const GEOMETRIA: GeometriaSuperficie = {
  app: { w: ESCRITORIO.w, h: ESCRITORIO.h },
  visibleEn: (f) => f < ACTOS.cierre,
  vistaEn,
  camaraEn,
};

const GUION: GuionSuperficie<CtxPacientes> = {
  replay: (win, frame) => aplicarReplay(win as VentanaPacientes, frame),
  postProceso,
  cursor: { tramos: tramosCursor, clics: CLICS },
};

export const DemoPacientes: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: TV.surface2, color: TV.text, fontFamily: FUENTE.sans }}>
      {frame < ACTOS.cierre ? <Grano ancho={LIENZO.w} alto={LIENZO.h} id="grano-pacientes" /> : null}
      <Ventana layoutEn={layoutEn} geometria={GEOMETRIA} guion={GUION} lienzoAncho={LIENZO.w} />
      <Banda textos={TEXTOS} microrrotulo={MICRORROTULO} lienzo={LIENZO} microTop={1622} />
      <Sequence from={ACTOS.cierre} durationInFrames={DURACION - ACTOS.cierre} layout="none">
        <Cierre logo={620} claim={72} cta={34} micro={22} gap={56} />
      </Sequence>
      <Sonido musica={MUSICA} volumen={VOL_MUSICA} duracion={DURACION} />
      {CON_VOZ ? (
        <Sequence layout="none">
          <Audio src={staticFile("voz/demo-pacientes.mp3")} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
