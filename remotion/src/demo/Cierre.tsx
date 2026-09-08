/**
 * DemoSaaS · el cierre (§6): logo, claim, CTA a WhatsApp y microrrótulo,
 * en cascada con <Entra> (gap 8) sobre el fondo nieve. Sin fundido a negro.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { FUENTE } from "../marca/fuentes";
import { PRIMITIVOS, TRACKING, TV } from "../marca/tokens";
import { Entra } from "../motor/animar";

/* El logo oficial de WhatsApp, del registro LOGOS de la maqueta, en blanco. */
const LogoWhatsApp: React.FC<{ tam: number }> = ({ tam }) => (
  <svg viewBox="0 0 24 24" style={{ width: tam, height: tam, flex: "none" }} aria-hidden="true">
    <path
      fill="#ffffff"
      fillRule="evenodd"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"
    />
  </svg>
);

/** Tamaños en px del lienzo. Los valores por defecto son los del demo 16:9; el reel 9:16
 *  pasa los suyos (logo 620, claim 72, cta 34, micro 22). */
export const Cierre: React.FC<{
  logo?: number;
  claim?: number;
  cta?: number;
  micro?: number;
  gap?: number;
}> = ({ logo = 520, claim = 64, cta = 30, micro = 14, gap = 48 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap,
    }}
  >
    <Entra i={0} gap={8} y={26} d={26}>
      <Img src={staticFile("marca/logo-horizontal.svg")} style={{ width: logo, display: "block" }} />
    </Entra>
    <Entra i={1} gap={8} y={26} d={26}>
      <div
        style={{
          fontFamily: FUENTE.display,
          fontWeight: 700,
          fontSize: claim,
          lineHeight: 1.12,
          letterSpacing: `${TRACKING.titular}em`,
          color: TV.text,
          textAlign: "center",
        }}
      >
        Ningún veterinario debería
        <br />
        volver a escribir una ficha.
      </div>
    </Entra>
    <Entra i={2} gap={8} y={26} d={26}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: PRIMITIVOS.whatsapp,
          color: "#ffffff",
          fontFamily: FUENTE.sans,
          fontWeight: 600,
          fontSize: cta,
          borderRadius: 999,
          padding: `${Math.round(cta * 0.67)}px ${Math.round(cta * 1.2)}px`,
        }}
      >
        <LogoWhatsApp tam={Math.round(cta * 1.13)} />
        Escríbenos al WhatsApp
      </div>
    </Entra>
    <Entra i={3} gap={8} y={26} d={26}>
      <div
        style={{
          fontFamily: FUENTE.mono,
          fontSize: micro,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: `${TRACKING.beta}em`,
          color: TV.muted,
        }}
      >
        BUSCAMOS 10 VETERINARIOS · 0/10
      </div>
    </Entra>
  </div>
);
