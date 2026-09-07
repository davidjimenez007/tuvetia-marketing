/**
 * Formato base Reel — 1080×1920 @ 30fps (IG/TikTok).
 * Fondo sobrio, tipografía grande. Zona segura: evita los 250px inferiores (UI de IG),
 * los ~220px superiores y 72px a cada lado. `guia` dibuja la zona en el Studio.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { TV } from "../marca/tokens";
import { FUENTE } from "../marca/fuentes";

export const REEL = {
  width: 1080,
  height: 1920,
  fps: 30,
  safeTop: 220,
  safeBottom: 250,
  safeX: 72,
} as const;

export const Reel: React.FC<{
  fondo?: string;
  color?: string;
  guia?: boolean;
  children: React.ReactNode;
}> = ({ fondo = TV.surface2, color = TV.text, guia = false, children }) => {
  return (
    <AbsoluteFill style={{ background: fondo, color, fontFamily: FUENTE.sans }}>
      <div
        style={{
          position: "absolute",
          top: REEL.safeTop,
          bottom: REEL.safeBottom,
          left: REEL.safeX,
          right: REEL.safeX,
        }}
      >
        {children}
      </div>
      {guia ? (
        <div
          style={{
            position: "absolute",
            top: REEL.safeTop,
            bottom: REEL.safeBottom,
            left: REEL.safeX,
            right: REEL.safeX,
            border: `2px dashed ${TV.danger}`,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
