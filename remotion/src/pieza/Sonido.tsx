/**
 * Pieza · la capa de sonido (§3.3): música con fade-in de 20 frames y fade-out en los últimos
 * 60; tecleo sólo bajo los tramos en que se teclea, con el mismo envolvente. Nada más.
 * Los audios van incrustados como data-URI: el compositor de Remotion en Windows no puede
 * descargar del server local (localhost resuelve a ::1), ver src/demo/NOTAS.md.
 */
import React from "react";
import { Audio, interpolate, Sequence } from "remotion";
import { SFX_TECLEO } from "../demo/audioData";

export const Sonido: React.FC<{
  musica: string;
  volumen: number;
  duracion: number;
  tecleos?: ReadonlyArray<{ readonly f0: number; readonly f1: number }>;
  volumenTecleo?: number;
}> = ({ musica, volumen, duracion, tecleos = [], volumenTecleo = 0.3 }) => (
  <>
    <Audio
      src={musica}
      volume={(f) =>
        volumen *
        interpolate(f, [0, 20, duracion - 60, duracion], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
    {tecleos.map((t) => {
      const dur = t.f1 - t.f0;
      return (
        <Sequence key={`tecleo-${t.f0}`} from={t.f0} durationInFrames={dur} layout="none">
          <Audio
            src={SFX_TECLEO}
            volume={(f) =>
              volumenTecleo *
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
