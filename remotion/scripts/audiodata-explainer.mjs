// Regenera src/explainer/audioData.ts: la música del ExplainerRAG incrustada como data-URI.
// (El compositor de Remotion en Windows no descarga assets del server local: localhost → ::1.
// Ver src/demo/NOTAS.md. Los SFX siguen viniendo de src/demo/audioData.ts.)
//
// Uso, desde remotion/:   node scripts/audiodata-explainer.mjs
//
// La pista se prepara antes con el ffmpeg de Remotion (original de David en prompts/Musica/):
//   npx remotion ffmpeg -t 56 -i "prompts/Musica/alexguz-funk-amp-breakbeat-upbeat-advertising-happy-cook-541097.mp3" \
//     -af atempo=0.96 -c:a libmp3lame -b:a 192k public/musica/pista-funk-120.mp3
// -t 56 recorta a lo que usa la pieza (52 s) más margen; atempo=0.96 baja el tempo de 125 a
// 120 BPM sin cambiar el tono, para que los cortes del guion (§3.3, múltiplos de 15 frames)
// caigan en el beat.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRADA = resolve(raiz, "public/musica/pista-funk-120.mp3");
const SALIDA = resolve(raiz, "src/explainer/audioData.ts");

const b64 = readFileSync(ENTRADA).toString("base64");
const contenido = `/**
 * GENERADO por scripts/audiodata-explainer.mjs — no editar a mano.
 * Música del ExplainerRAG incrustada como data-URI (el compositor de Remotion en Windows
 * no puede descargar assets del server local: localhost resuelve a ::1).
 * Fuente: public/musica/pista-funk-120.mp3 (alexguz, «Funk & Breakbeat Upbeat Advertising
 * Happy Cook», Pixabay 541097; recortada a 58 s y llevada de 125 a 120 BPM con atempo=0.96).
 */
export const MUSICA_FUNK = "data:audio/mpeg;base64,${b64}";
`;
writeFileSync(SALIDA, contenido);
console.log(`${SALIDA}: ${(contenido.length / 1024 / 1024).toFixed(2)} MB`);
