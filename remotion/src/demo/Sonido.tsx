/**
 * DemoSaaS · la capa de sonido (pasada 5).
 *
 * Música: la pista licenciada que puso Luciano (Epidemic Sound — «Bellini», West &
 * Zander) en public/musica/pista.mp3, a 0.35 con fade-in corto y fade-out en los
 * últimos 60 frames, como pedía el encargo.
 *
 * SFX: SOLO el tecleo bajo el typewriter de cada interludio (pedido de la pasada 5:
 * «borrar todos, excepto los de typing»). Los WAV de clic/pop/toast siguen en
 * public/sfx/ y audioData.ts por si vuelven, pero acá no suenan. El tecleo va a
 * 0.32 porque ahora carga solo la mezcla (a 0.22 la percusión de la pista lo tapaba).
 */
import React from "react";
import { Audio, interpolate, Sequence } from "remotion";
import { MUSICA, SFX_TECLEO } from "./audioData";
import { DURACION, ESCRITURA_SOAP, INTERLUDIOS } from "./guion";
import { framesDeEscritura } from "./Interludio";

const VOL_MUSICA = 0.35;
const VOL_TECLEO = 0.32;

const DUR_SOAP = ESCRITURA_SOAP.f1 - ESCRITURA_SOAP.f0;

export const Sonido: React.FC = () => {
  return (
    <>
      <Audio
        src={MUSICA}
        volume={(f) =>
          VOL_MUSICA *
          interpolate(f, [0, 20, DURACION - 60, DURACION], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {/* Pasada 6: Athos redactando la nota SOAP ante cámara también teclea (más bajo). */}
      <Sequence from={ESCRITURA_SOAP.f0} durationInFrames={DUR_SOAP} layout="none">
        <Audio
          src={SFX_TECLEO}
          volume={(f) =>
            0.24 *
            interpolate(f, [0, 2, DUR_SOAP - 4, DUR_SOAP], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>

      {INTERLUDIOS.map((i) => {
        const dur = framesDeEscritura(i.frase, i.f1 - i.f0);
        return (
          <Sequence key={`tecleo-${i.f0}`} from={i.f0 + 1} durationInFrames={dur} layout="none">
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
};
