/**
 * ExplainerRAG · la capa de sonido (§3.3): la máquina compartida de src/pieza/Sonido.tsx con la
 * pista funk (public/musica/pista-funk-120.mp3, elegida por David el 8-sep y llevada de 125 a 120
 * BPM para que los cortes caigan en el beat) y el único tramo de tecleo de la pieza.
 *
 * El encargo dice 0.35, medido sobre pista-corta.mp3 (−13.2 LUFS). La pista funk suena a −9.0 LUFS,
 * 4.2 dB más fuerte: 0.21 la deja al mismo nivel percibido en la mezcla (≈ −22.5 LUFS), con el
 * tecleo por encima como antes. Si se quiere más presente, subir aquí, no en el mp3.
 */
import React from "react";
import { Sonido as SonidoBase } from "../pieza/Sonido";
import { MUSICA_FUNK } from "./audioData";
import { DURACION, TECLEOS } from "./guion";

export const VOL_MUSICA = 0.21;

export const Sonido: React.FC = () => (
  <SonidoBase musica={MUSICA_FUNK} volumen={VOL_MUSICA} duracion={DURACION} tecleos={TECLEOS} />
);
