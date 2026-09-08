/**
 * Grano de papel sobre la nieve: feTurbulence estático (no cambia por frame), multiplicado
 * encima. Lo usan DemoSaaS (1920×1080) y ExplainerRAG (1080×1920).
 */
import React from "react";

export const Grano: React.FC<{ ancho: number; alto: number; id?: string }> = ({
  ancho,
  alto,
  id = "grano-papel",
}) => (
  <svg
    width={ancho}
    height={alto}
    style={{
      position: "absolute",
      inset: 0,
      opacity: 0.18,
      mixBlendMode: "multiply",
      pointerEvents: "none",
    }}
    aria-hidden="true"
  >
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#${id})`} />
  </svg>
);
