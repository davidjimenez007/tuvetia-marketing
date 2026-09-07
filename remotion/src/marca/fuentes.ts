/**
 * Fuentes de marca (skill remotion-tuvetia + marca/tokens/tuvetia.ts):
 *   display  Archivo 600/700               → titulos, frases
 *   sans     Inter Tight 400–700           → cuerpo, CTA
 *   mono     JetBrains Mono 400/500/700    → numeros, timestamps, rotulos
 * Prohibido: Bricolage Grotesque (marca vieja) y fuentes por defecto.
 * @remotion/google-fonts bloquea el render hasta que la fuente esta cargada.
 */
import { loadFont as cargarArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as cargarInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as cargarJetBrains } from "@remotion/google-fonts/JetBrainsMono";

const archivo = cargarArchivo("normal", {
  weights: ["600", "700"],
  subsets: ["latin", "latin-ext"],
});
const interTight = cargarInterTight("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});
const jetbrains = cargarJetBrains("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin", "latin-ext"],
});

export const FUENTE = {
  display: archivo.fontFamily,
  sans: interTight.fontFamily,
  mono: jetbrains.fontFamily,
} as const;

export const fuentesListas = () =>
  Promise.all([archivo.waitUntilDone(), interTight.waitUntilDone(), jetbrains.waitUntilDone()]);
