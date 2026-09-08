/**
 * DemoSaaS · la composición (§3): fondo nieve con grano de papel, ventana de app
 * con barra sobria, la app embebida (cámara + cursor adentro), banda inferior de
 * textos, fundidos por nieve entre los planos de la ráfaga y el cierre.
 */
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { FUENTE } from "../marca/fuentes";
import { TRACKING, TV } from "../marca/tokens";
import { easeTuvetia } from "../motor/animar";
import { Grano } from "../motor/Grano";
import { AppEmbebida } from "./AppEmbebida";
import { escalaCamaraEn } from "./Camara";
import { Cierre } from "./Cierre";
import { CORTES_RAFAGA, DURACION, FIN_VENTANA, INTERLUDIOS, INTRO, VENTANA } from "./guion";
import { Interludio } from "./Interludio";
import { Sonido } from "./Sonido";
import { BandaTextos } from "./Texto";


const Ventana: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();

  /* Pasada 5: la ventana entra después de la intro de marca (fade + escala + caída). */
  const pEntra = interpolate(frame, [INTRO.ventanaEntra, INTRO.ventanaLista], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeTuvetia,
  });

  /* Acto 4.2: la ventana se desvanece y baja de escala en 10 frames. */
  const pFin = interpolate(frame, [FIN_VENTANA, FIN_VENTANA + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeTuvetia,
  });

  /* Interludios: la ventana se desvanece 6 frames antes y vuelve 6 después (la frase ya
     está escribiéndose desde el frame 1, así que no queda nieve vacía); los de corte seco
     entran y salen a golpe. */
  let atenuacion = 1;
  for (const i of INTERLUDIOS) {
    const seco = i.corte === "seco";
    const entrada = seco ? 1 : 6;
    /* La ventana vuelve MIENTRAS la frase se desvanece (crossfade): cero nieve vacía. */
    const vuelta0 = seco ? i.f1 : i.f1 - 6;
    atenuacion *= interpolate(frame, [i.f0 - entrada, i.f0, vuelta0, i.f1 + 1], [1, 0, 0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  /* Pasada 6: viñeta hacia la nieve cuando la cámara cierra — el resto de la UI cede. */
  const vineta = interpolate(escalaCamaraEn(frame), [1.08, 1.3], [0, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  /* Pasada 6: el CTA se asoma en la barra desde el segundo 40 (mid-roll). */
  const cta = interpolate(frame, [1200, 1212], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* Ráfaga: fundido por nieve de ±3 frames en cada corte (una sola app embebida;
     no hay dos rutas vivas para un fundido cruzado real — ver NOTAS.md). */
  let velo = 0;
  for (const corte of CORTES_RAFAGA) {
    const d = Math.abs(frame - corte);
    if (d <= 3) velo = Math.max(velo, 1 - d / 3);
  }

  return (
    <div
      style={{
        position: "absolute",
        left: VENTANA.x,
        top: VENTANA.y,
        width: VENTANA.w,
        height: VENTANA.h,
        borderRadius: 16,
        border: `1px solid ${TV.border}`,
        boxShadow: TV.shadowPopover,
        background: TV.surface,
        overflow: "hidden",
        opacity: pEntra * (1 - pFin) * atenuacion,
        /* Respiración: además del fade, la ventana cede un 1% de escala al entrar a
           cada interludio y lo recupera al volver — el plano nunca está congelado. */
        transform: `translateY(${((1 - pEntra) * 16).toFixed(2)}px) scale(${(
          (0.97 + 0.03 * pEntra) *
          (1 - 0.04 * pFin) *
          (0.99 + 0.01 * atenuacion)
        ).toFixed(4)})`,
      }}
    >
      <div
        style={{
          height: VENTANA.barra,
          display: "flex",
          alignItems: "center",
          background: TV.surface,
          borderBottom: `1px solid ${TV.borderSoft}`,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", gap: 8, paddingLeft: 16 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: TV.borderStrong,
                opacity: 0.55,
              }}
            />
          ))}
        </div>
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FUENTE.mono,
            fontSize: 11,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: `${TRACKING.rotulo}em`,
            color: TV.muted,
          }}
        >
          <span style={{ opacity: 1 - cta, position: "absolute", left: 0, right: 0 }}>TUVETIA</span>
          <span style={{ opacity: cta }}>TUVETIA · ESCRÍBENOS AL WHATSAPP</span>
        </span>
      </div>
      <div
        style={{
          position: "relative",
          width: VENTANA.w,
          height: VENTANA.h - VENTANA.barra,
          overflow: "hidden",
        }}
      >
        {children}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 55%, ${TV.surface2} 100%)`,
            opacity: vineta,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: TV.surface2,
            opacity: velo,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

export const DemoSaaS: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: TV.surface2 }}>
      <Sequence durationInFrames={FIN_VENTANA + 12} layout="none">
        <Ventana>
          <AppEmbebida />
        </Ventana>
      </Sequence>

      <BandaTextos />

      {INTERLUDIOS.map((i) => (
        <Sequence
          key={`interludio-${i.f0}`}
          from={i.f0}
          durationInFrames={i.f1 - i.f0}
          layout="none"
        >
          <Interludio def={i} />
        </Sequence>
      ))}

      <Sequence from={FIN_VENTANA} durationInFrames={DURACION - FIN_VENTANA} layout="none">
        <Cierre />
      </Sequence>

      {/* El grano va encima de todo el lienzo, estático. */}
      <Grano ancho={1920} alto={1080} />

      {/* Música + el tecleo de los interludios (único SFX desde la pasada 5). */}
      <Sonido />
    </AbsoluteFill>
  );
};
