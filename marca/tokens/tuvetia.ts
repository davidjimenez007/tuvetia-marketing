/**
 * TUVETIA · tokens de marca para Remotion (y cualquier TS).
 * Mismos valores que tuvetia.css / tuvetia.tokens.json. Fuente: globals.css de la app (2-sep-2026).
 *
 * Uso en una composición:
 *   import { TV, TV_DARK, FONTS } from "../../marca/tokens/tuvetia";
 *   <div style={{ background: TV.surface, color: TV.text, fontFamily: FONTS.display }} />
 *
 * Reglas (ver marca/sistema-visual.md): el menta es ACCIÓN, no decoración; TV.accent pinta
 * rellenos con TV.onBrand encima; TV.accentText es el menta que va en texto; el grafito
 * (TV_DARK) sólo cuando es VetGPT.
 */
export const PRIMITIVOS = {
  white: "#ffffff", snow: "#f5f8f7", graphite: "#0c1613",
  mint100: "#e6f2ee", mint200: "#c2e2d8", mint300: "#7ed0ba", mint500: "#12856a", mint600: "#0f6e58", mint700: "#0b5847", mint900: "#07332a",
  red100: "#fae9e7", red500: "#c03a2e", red600: "#a83226", red700: "#93291f",
  amber100: "#f8efdc", amber700: "#8a5a0b",
  whatsapp: "#25D366",
} as const;

export const TV = {
  ink: PRIMITIVOS.white, ink2: PRIMITIVOS.snow, surface: PRIMITIVOS.white, surface2: PRIMITIVOS.snow, panel: PRIMITIVOS.snow, card: PRIMITIVOS.white,
  border: "#e2e9e5", borderSoft: "#edf2f0", borderStrong: "#7a8a82",
  muted: "#5d706a", text2: "#46534f", text: PRIMITIVOS.graphite,
  accent: PRIMITIVOS.mint500, accentBright: PRIMITIVOS.mint600, brandDeep: PRIMITIVOS.mint700, onBrand: PRIMITIVOS.white, accentText: PRIMITIVOS.mint700, accentSoft: PRIMITIVOS.mint100,
  danger: PRIMITIVOS.red500, dangerSoft: PRIMITIVOS.red100, ok: PRIMITIVOS.mint500, okSoft: PRIMITIVOS.mint100, warn: PRIMITIVOS.amber700, warnSoft: PRIMITIVOS.amber100, info: "#3f6670",
  chart: ["#12876a", "#aa5f00", "#6f68cf", "#a8425f", "#256fb4"],
  shadowSm: "0 1px 2px rgba(12,22,19,.05)", shadowMd: "0 4px 12px rgba(12,22,19,.08)", shadowPopover: "0 4px 16px rgba(12,22,19,.12), 0 1px 2px rgba(12,22,19,.08)",
} as const;

/** Superficie grafito: el tema oscuro de la app y el contexto `.consulta` de VetGPT (notch, cockpit). */
export const TV_DARK = {
  ink: PRIMITIVOS.graphite, ink2: "#0a1210", surface: PRIMITIVOS.graphite, surface2: "#14211c", panel: PRIMITIVOS.graphite, card: "#14211c",
  border: "#223129", borderSoft: "#1a2620", borderStrong: "#5c7066",
  muted: "#7b8d85", text2: "#9dafa7", text: PRIMITIVOS.snow,
  accent: PRIMITIVOS.mint300, accentBright: "#99dcc9", brandDeep: "#99dcc9", onBrand: PRIMITIVOS.graphite, accentText: PRIMITIVOS.mint300, accentSoft: "rgba(126,208,186,.12)",
  danger: "#d6584c", dangerSoft: "rgba(214,88,76,.16)", ok: PRIMITIVOS.mint300, okSoft: "rgba(126,208,186,.12)", warn: "#e5c078", warnSoft: "rgba(229,192,120,.14)", info: "#7fb0bd",
  chart: ["#2ba57e", "#bc8028", "#9184ea", "#d7688c", "#4a8cc7"],
  shadowSm: "0 1px 2px rgba(0,0,0,.3)", shadowMd: "0 4px 12px rgba(0,0,0,.4)", shadowPopover: "0 4px 16px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.3)",
} as const;

export const RADIUS = { base: 10, sm: 6, md: 8, lg: 10, xl: 12, xxl: 16 } as const;

/** Display: Archivo. Bricolage Grotesque es marca vieja y está prohibida (skill remotion-tuvetia, corregido 2-sep-2026). */
export const FONTS = {
  display: '"Archivo", system-ui, sans-serif',
  sans: '"Inter Tight", "Segoe UI", system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, Consolas, "Courier New", monospace',
} as const;

/** Tracking de las tres firmas tipográficas, en em. */
export const TRACKING = { display: -0.015, titular: -0.022, wordmark: -0.02, rotulo: 0.15, beta: 0.16 } as const;

/** Escala para 1080×1920 / 1080×1350: la app corre a 15px de cuerpo; en un reel se lee a ~3.4×. */
export const ESCALA_SOCIAL = 3.4;

/** La curva del sistema. En Remotion: spring suave por elemento, delay = i * gap (skill remotion-tuvetia). */
export const EASE: [number, number, number, number] = [0.2, 0, 0, 1];
