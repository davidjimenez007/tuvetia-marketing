/**
 * ExplainerRAG · la capa de sonido (§3.3). Música: `public/musica/pista-funk-120.mp3` (pista que
 * David eligió el 8-sep, llevada de 125 a 120 BPM para que los cortes del guion caigan en el beat)
 * con fade-in de 20 frames y fade-out en los últimos 60. SFX: sólo el tecleo bajo el tramo en que
 * se teclea (la segunda pregunta ya no se teclea, orden v2), a 0.30, con el mismo envolvente. Nada más.
 *
 * Los dos audios van incrustados como data-URI (la música desde ./audioData.ts, generado por
 * scripts/audiodata-explainer.mjs; el tecleo desde src/demo/audioData.ts): el compositor de
 * Remotion en Windows no puede descargar del server local (localhost resuelve a ::1), ver
 * src/demo/NOTAS.md.
 */
import React from "react";
import { Audio, interpolate, Sequence } from "remotion";
import { SFX_TECLEO } from "../demo/audioData";
import { MUSICA_FUNK } from "./audioData";
import { DURACION, TECLEOS } from "./guion";

/** El encargo dice 0.35, medido sobre pista-corta.mp3 (−13.2 LUFS). La pista funk suena a
 *  −9.0 LUFS, 4.2 dB más fuerte: 0.21 la deja al mismo nivel percibido en la mezcla (≈ −22.5 LUFS),
 *  con el tecleo por encima como antes. Si se quiere más presente, subir aquí, no en el mp3. */
const VOL_MUSICA = 0.21;
const VOL_TECLEO = 0.3;

export const Sonido: React.FC = () => (
  <>
    <Audio
      src={MUSICA_FUNK}
      volume={(f) =>
        VOL_MUSICA *
        interpolate(f, [0, 20, DURACION - 60, DURACION], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
    {TECLEOS.map((t) => {
      const dur = t.f1 - t.f0;
      return (
        <Sequence key={`tecleo-${t.f0}`} from={t.f0} durationInFrames={dur} layout="none">
          <Audio
            src={SFX_TECLEO}
            volume={(f) =>
              VOL_TECLEO *
              interpolate(f, [0, 2, dur - 4, dur], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </Sequence>
      );
    })}
  </>
);
