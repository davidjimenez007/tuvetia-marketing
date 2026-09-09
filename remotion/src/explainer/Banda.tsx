/**
 * ExplainerRAG · la banda de texto (§3 capa 7, §4.5) y el microrrótulo (capa 8): la máquina
 * compartida de src/pieza/Banda.tsx con los textos de esta pieza. Scrim entre y 1330 y y 1610
 * (sube 40 px respecto al encargo para dejar libre el compositor del móvil, orden v2 §E).
 */
import React from "react";
import { Banda as BandaBase } from "../pieza/Banda";
import { LIENZO, MICRORROTULO, TEXTOS } from "./guion";

export { conAlfa } from "../pieza/Banda";

export const Banda: React.FC = () => <BandaBase textos={TEXTOS} microrrotulo={MICRORROTULO} lienzo={LIENZO} />;
