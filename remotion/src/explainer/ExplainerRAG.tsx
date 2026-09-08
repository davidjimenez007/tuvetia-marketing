/**
 * ExplainerRAG · la composición (prompts/explainer-rag.md + orden de cambio v2): reel 1080×1920 ·
 * 30 fps · 1560 frames. Capas de atrás hacia adelante (§3): nieve con grano (actos 1–4) →
 * ventana de escritorio → celular a sangre → esquema del corpus → banda de texto + microrrótulo →
 * anuncio del acto 4 → título del acto 1 → cierre → sonido → voz opcional.
 *
 * Las dos superficies de la app viven fuera de cualquier <Sequence>: se montan en el frame 0
 * y no se desmontan nunca (§2.1).
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Vista } from "../demo/Camara";
import { Cierre } from "../demo/Cierre";
import { FUENTE } from "../marca/fuentes";
import { TV } from "../marca/tokens";
import { Grano } from "../motor/Grano";
import { Anuncio } from "./Anuncio";
import { AppSuperficie } from "./AppSuperficie";
import { Banda } from "./Banda";
import { Esquema } from "./Esquema";
import { CAMARA_MOVIL, CIERRE_F0, CON_VOZ, DURACION, LIENZO, MOVIL, TRANSICION, VISIBLE } from "./guion";
import { MarcoEscritorio } from "./MarcoEscritorio";
import { Sonido } from "./Sonido";
import { Titulo } from "./Titulo";

const DIMS_MOVIL = { w: MOVIL.w, h: MOVIL.h };
const VISTA_MOVIL: Vista = { x0: 0, y0: 0, w: MOVIL.w, h: MOVIL.h };
const vistaMovil = (): Vista => VISTA_MOVIL;
const camaraMovil = () => CAMARA_MOVIL;

/** El celular a sangre: entra desde abajo entre TRANSICION.sube0 y sube1 y tapa todo hasta el cierre.
 *  Curva simétrica (no easeTuvetia): con la del sistema a f450 ya iba por el 85 % y tapaba la
 *  ventana, y §9 pide verla todavía a medio camino. Ver NOTAS.md. */
const SuperficieMovil: React.FC = () => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [TRANSICION.sube0, TRANSICION.sube1], [LIENZO.h, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: LIENZO.w,
        height: LIENZO.h,
        background: TV.surface,
        transform: `translateY(${y.toFixed(2)}px)`,
        visibility: VISIBLE.movil(frame) ? "visible" : "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: MOVIL.w,
          height: MOVIL.h,
          transform: `scale(${MOVIL.escala})`,
          transformOrigin: "0 0",
        }}
      >
        <AppSuperficie
          cual="movil"
          app={DIMS_MOVIL}
          visibleEn={VISIBLE.movil}
          vistaEn={vistaMovil}
          camaraEn={camaraMovil}
        />
      </div>
    </div>
  );
};

export const ExplainerRAG: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: TV.surface2, color: TV.text, fontFamily: FUENTE.sans }}>
      {frame < TRANSICION.sube1 ? <Grano ancho={LIENZO.w} alto={LIENZO.h} id="grano-explainer" /> : null}
      <MarcoEscritorio />
      <SuperficieMovil />
      <Esquema />
      <Banda />
      <Anuncio />
      <Titulo />
      <Sequence from={CIERRE_F0} durationInFrames={DURACION - CIERRE_F0} layout="none">
        <Cierre logo={620} claim={72} cta={34} micro={22} gap={56} />
      </Sequence>
      <Sonido />
      {CON_VOZ ? (
        <Sequence layout="none">
          <Audio src={staticFile("voz/explainer-rag.mp3")} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
