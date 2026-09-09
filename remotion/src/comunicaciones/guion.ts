/**
 * DemoComunicaciones · el guion como datos (prompts/demo-comunicaciones.md §3–§7 sobre la plantilla): frames
 * de los actos, textos literales, encuadres, y las tablas de cámara, cursor, hover, scroll y toasts.
 * Cero DOM acá: todo lo que resuelve selectores vive en Cursor/Camara.
 *
 * Ritmo: 120 BPM → 1 beat = 15 frames, 1 compás = 60. Cortes en múltiplos de 15, actos en 60.
 */
import type { Vista } from "../demo/Camara";
import type { Blanco, Clic, Hover, KeyframeCamara, TramoCursor } from "../demo/guion";
import { MUSICA_FUNK } from "../explainer/audioData";
import type { Lienzo, Microrrotulo, Scroll, TextoBanda } from "../pieza/tipos";

export const FPS = 30;
export const DURACION = 1500;
export const CON_VOZ = false;

/** Música y cierre como DemoVentas (encargo §8). */
export const MUSICA = MUSICA_FUNK;
export const VOL_MUSICA = 0.21;

/* ── La cadena de datos (encargo §3): Julián, sus dos preguntas y la propuesta que las responde ─ */
export const RUTAS = {
  comunicaciones: "/dashboard/comunicaciones",
  correo: "/dashboard/comunicaciones/correo",
  conexiones: "/dashboard/conexiones",
} as const;

/* ── Lienzo y superficie (plantilla §3; encargo §2: sólo escritorio) ─────────────────────── */
export const ESCRITORIO = { w: 1440, h: 900 } as const;
export const LIENZO: Lienzo = { w: 1080, h: 1920, safeTop: 220, safeBottom: 250, safeX: 72 };
export const MARCO = { escala: 0.65, top: 700 } as const;

/* ── Los actos (encargo §4, corridos 60 frames: el acto 3 dura 240 y el cierre va completo) ── */
export const ACTOS = {
  bandeja: 0,
  dos: 120,
  redactada: 360,
  aprobar: 600,
  correo: 780,
  canales: 1020,
  aviso: 1260,
  cierre: 1380,
} as const;

/* ── Clics y cortes: cada clic un beat antes del beat que cambia la pantalla ─────────────── */
export const CLIC = {
  conversacion: 165,
  aprobar: 645,
  pestanaCorreo: 780,
} as const;
export const CORTE = {
  /** Dentro del acto 1: del plano general a la lista. */
  lista: 45,
  hilo: 180,
  aprueba: 660,
  /** Dentro del acto 4: corte al plano general para el clic en la pestaña «Correo» (las pestañas no caben en
   *  el encuadre del hilo); un beat después, la bandeja del correo. */
  pestanas: 765,
  correo: 795,
  /** Dentro del acto 5: de la bandeja a la cabecera de la cuenta. */
  cabecera: 900,
  conexiones: ACTOS.canales,
  aviso: ACTOS.aviso,
} as const;

/** Ventanas de los toasts que la app emite (el texto lo escribe la app). */
export const TOASTS = {
  enviado: { f0: CORTE.aprueba, f1: 735 },
} as const;

/* ── Encuadres: medidos con scripts/medir-pt-comunicaciones.mjs (CDP, 1440×900) ───────────
   La bandeja es lista (x 248→548) + hilo (x 564→1424). Para leer el hilo a tamaño de teléfono el post-proceso
   lo angosta a 730 px (`.col-hilo{max-width}`), como la columna de lectura de las otras piezas. */
export const ENCUADRES = {
  /** La lista de conversaciones con sus badges (filas desde y 142; badge en x 518). */
  lista: { vista: { x0: 232, y0: 86, w: 600, h: 600 } as Vista, escala: 1080 / 600, top: 250, anchoHilo: 730, anchoPagina: 820 },
  /** El hilo angostado: cabecera (y 143→192), burbujas, la propuesta bajo el hilo y el compositor (hasta y 883). */
  hilo: { vista: { x0: 560, y0: 143, w: 740, h: 740 } as Vista, escala: 1080 / 740, top: 250, anchoHilo: 730, anchoPagina: 820 },
  /** Las pestañas WhatsApp | Correo (y 48→86), la cabecera de la cuenta (y 98→117) y la bandeja del correo. */
  correo: { vista: { x0: 232, y0: 40, w: 700, h: 700 } as Vista, escala: 1080 / 700, top: 250, anchoHilo: 730, anchoPagina: 820 },
  /** Integraciones como columna de 820 (la de DemoVentas). */
  columna: { vista: { x0: 244, y0: 48, w: 860, h: 852 } as Vista, escala: 1080 / 860, top: 250, anchoHilo: 0, anchoPagina: 820 },
  /** El aviso verde: la misma columna, angostada a 640 para que el aviso quepa en tres líneas y admita ×1.3. */
  aviso: { vista: { x0: 244, y0: 48, w: 860, h: 852 } as Vista, escala: 1080 / 860, top: 250, anchoHilo: 0, anchoPagina: 640 },
} as const;
export type Encuadre = "general" | keyof typeof ENCUADRES;

export const encuadreEn = (f: number): Encuadre => {
  if (f < CORTE.lista) return "general";
  if (f < CORTE.hilo) return "lista";
  if (f < CORTE.pestanas) return "hilo";
  if (f < CORTE.correo) return "general";
  if (f < CORTE.conexiones) return "correo";
  if (f < CORTE.aviso) return "columna";
  return "aviso";
};

const VISTA_GENERAL: Vista = { x0: 0, y0: 0, w: ESCRITORIO.w, h: ESCRITORIO.h };
export const vistaEn = (f: number): Vista => {
  const enc = encuadreEn(f);
  return enc === "general" ? VISTA_GENERAL : ENCUADRES[enc].vista;
};
export const anchoPaginaEn = (f: number): number => {
  const enc = encuadreEn(f);
  return enc === "general" ? 820 : ENCUADRES[enc].anchoPagina;
};
/** Ancho al que el post-proceso deja el hilo de WhatsApp (0 = sin tocar). */
export const anchoHiloEn = (f: number): number => {
  const enc = encuadreEn(f);
  return enc === "general" ? 0 : ENCUADRES[enc].anchoHilo;
};

/* ── Textos en pantalla (encargo §4), literales salvo el hook (8 palabras) y el acto 7 (el aviso) ── */
export const TEXTOS: TextoBanda[] = [
  { f0: ACTOS.bandeja, f1: ACTOS.dos, rotulo: "TU WHATSAPP", frase: "Te escriben por WhatsApp. Eso no cambia." },
  { f0: ACTOS.dos, f1: ACTOS.redactada, rotulo: "SIN SALIR DE ACÁ", frase: "Y ahora te llegan acá, junto a la ficha del paciente." },
  { f0: ACTOS.redactada, f1: ACTOS.aprobar, rotulo: "YA REDACTADA", frase: "Leyó el hilo y la ficha, y dejó la respuesta lista." },
  { f0: ACTOS.aprobar, f1: ACTOS.correo, rotulo: "TÚ APRUEBAS", frase: "Nada sale hasta que tú lo apruebas." },
  { f0: ACTOS.correo, f1: ACTOS.canales, rotulo: "Y TU CORREO", frase: "El correo de la clínica, en la misma pantalla." },
  { f0: ACTOS.canales, f1: ACTOS.aviso, rotulo: "TODO CONECTADO", frase: "Tu número, tu correo y tu calendario. Los que ya usas." },
  /* El aviso verde de Integraciones, literal (tuteado por el mapa, como en pantalla). */
  { f0: ACTOS.aviso, f1: ACTOS.cierre, rotulo: "EL AVISO, LITERAL", frase: "VetGPT no responde solo, salvo que tú lo habilites." },
];

export const MICRORROTULO: Microrrotulo = { f0: 0, f1: ACTOS.cierre, texto: "DEMO · DATOS DE EJEMPLO" };

/* ── Selectores del DOM de la app (verificados sobre la copia) ───────────────────────────── */
export const SEL = {
  conversacion: ".col-lista .crece > .conv",
  badge: ".conv .sin-leer",
  cabHilo: ".col-hilo .entre",
  suya: ".burbujas > .burbuja.suya",
  tarjeta: ".col-hilo .accion",
  textareaBody: '.col-hilo textarea[data-act="accion-campo"]',
  aprobar: '.col-hilo button[data-act="accion-aprobar"]',
  burbujaMia: ".burbujas > .burbuja.mia:last-child",
  pestanaCorreo: '.tabnav a[data-arg="/dashboard/comunicaciones/correo"]',
  cabCuenta: ".entre span.xs.mut",
  aviso: ".aviso.ok",
  cardCorreo: "section.card",
} as const;

/** Puntos fijos (relativos 0..1 de 1440×900) de repuesto: sólo entran si el selector no resuelve.
 *  Medidos con `scripts/medir-pt-comunicaciones.mjs` (hilo sin angostar; en cámara mandan los selectores). */
export const PT = {
  centro: { x: 0.5, y: 0.5 },
  convJulian: { x: 0.276, y: 0.264 },
  cabHilo: { x: 0.69, y: 0.186 },
  textareaBody: { x: 0.623, y: 0.68 },
  aprobar: { x: 0.459, y: 0.837 },
  burbujaMia: { x: 0.748, y: 0.416 },
  pestanaCorreo: { x: 0.24, y: 0.075 },
  cabCuenta: { x: 0.229, y: 0.119 },
  aviso: { x: 0.406, y: 0.125 },
  /** Centros de los encuadres: un push con foco acá no panea. */
  centroLista: { x: 0.369, y: 0.429 },
  centroHilo: { x: 0.646, y: 0.57 },
  centroCorreo: { x: 0.404, y: 0.433 },
  centroColumna: { x: 0.468, y: 0.527 },
} as const;

/* ── Blancos ─────────────────────────────────────────────────────────────────────────────── */
const CONV_JULIAN: Blanco = { sel: SEL.conversacion, texto: "Julián", x: PT.convJulian.x, y: PT.convJulian.y };
const CAB_HILO: Blanco = { sel: SEL.cabHilo, x: PT.cabHilo.x, y: PT.cabHilo.y };
const TARJETA: Blanco = { sel: SEL.tarjeta, x: PT.textareaBody.x, y: PT.textareaBody.y };
const TEXTAREA_BODY: Blanco = { sel: SEL.textareaBody, x: PT.textareaBody.x, y: PT.textareaBody.y };
const APROBAR: Blanco = { sel: SEL.aprobar, x: PT.aprobar.x, y: PT.aprobar.y };
const PESTANA_CORREO: Blanco = { sel: SEL.pestanaCorreo, x: PT.pestanaCorreo.x, y: PT.pestanaCorreo.y };
const CAB_CUENTA: Blanco = { sel: SEL.cabCuenta, texto: "@", x: PT.cabCuenta.x, y: PT.cabCuenta.y };
const AVISO: Blanco = { sel: SEL.aviso, x: PT.aviso.x, y: PT.aviso.y };

/* ── Cámara (plantilla §4): pushes lentos y sin paneo; cámara fija donde el encuadre va justo ── */
export const CAMARA_GENERAL: KeyframeCamara[] = [
  { f: 0, s: 1, foco: PT.centro },
  { f: CORTE.lista - 1, s: 1.03, foco: PT.centro },
];
/** El plano general del clic en la pestaña «Correo» (f765→794), quieto. */
export const CAMARA_GENERAL_PESTANAS: KeyframeCamara[] = [
  { f: CORTE.pestanas, s: 1, foco: PT.centro },
  { f: CORTE.correo - 1, s: 1, foco: PT.centro },
];
export const CAMARA_LISTA: KeyframeCamara[] = [
  { f: CORTE.lista, s: 1, foco: PT.centroLista },
  { f: CORTE.hilo - 1, s: 1.05, foco: PT.centroLista },
];
/* Acto 2 fijo (las dos preguntas); acto 3 push ×1.15 sobre el texto de la propuesta; acto 4 fijo (la burbuja). */
export const CAMARA_HILO: KeyframeCamara[] = [
  { f: CORTE.hilo, s: 1, foco: PT.centroHilo },
  { f: ACTOS.redactada - 1, s: 1, foco: PT.centroHilo },
  { f: ACTOS.redactada, s: 1, foco: TEXTAREA_BODY },
  { f: 420, s: 1.15, foco: TEXTAREA_BODY },
  { f: ACTOS.aprobar - 1, s: 1.15, foco: TEXTAREA_BODY },
  { f: ACTOS.aprobar, s: 1, foco: PT.centroHilo },
  { f: CORTE.pestanas - 1, s: 1, foco: PT.centroHilo },
];
/* Acto 5: la bandeja del correo entera y luego la cabecera de la cuenta a ×1.2. */
export const CAMARA_CORREO: KeyframeCamara[] = [
  { f: CORTE.correo, s: 1, foco: PT.centroCorreo },
  { f: CORTE.cabecera - 1, s: 1, foco: PT.centroCorreo },
  { f: CORTE.cabecera, s: 1, foco: CAB_CUENTA },
  { f: CORTE.cabecera + 45, s: 1.2, foco: CAB_CUENTA },
  { f: CORTE.conexiones - 1, s: 1.2, foco: CAB_CUENTA },
];
export const CAMARA_COLUMNA: KeyframeCamara[] = [
  { f: CORTE.conexiones, s: 1, foco: PT.centroColumna },
  { f: CORTE.aviso - 1, s: 1.05, foco: PT.centroColumna },
];
/* Acto 7: el aviso, angostado a 640, a ×1.3 (640 × 1.3 = 832 < 860). */
export const CAMARA_AVISO: KeyframeCamara[] = [
  { f: CORTE.aviso, s: 1, foco: AVISO },
  { f: CORTE.aviso + 45, s: 1.3, foco: AVISO },
  { f: ACTOS.cierre, s: 1.3, foco: AVISO },
];

export const camaraEn = (f: number): readonly KeyframeCamara[] => {
  switch (encuadreEn(f)) {
    case "general":
      return f < CORTE.lista ? CAMARA_GENERAL : CAMARA_GENERAL_PESTANAS;
    case "lista":
      return CAMARA_LISTA;
    case "hilo":
      return CAMARA_HILO;
    case "correo":
      return CAMARA_CORREO;
    case "columna":
      return CAMARA_COLUMNA;
    default:
      return CAMARA_AVISO;
  }
};

/* ── Cursor de escritorio ────────────────────────────────────────────────────────────────── */
export const tramosCursor = (): TramoCursor[] => [
  { tipo: "aparece", f: 135, en: { sel: SEL.conversacion, texto: "Paula", x: 0.276, y: 0.2 }, toma: "1 · aparece sobre la lista" },
  { tipo: "viaje", f0: 145, f1: CLIC.conversacion, hasta: CONV_JULIAN, toma: "2 · viaje a la conversación de Julián" },
  { tipo: "oculto", f: CORTE.hilo, toma: "2 · el puntero se va con el corte" },
  { tipo: "aparece", f: 615, en: TARJETA, toma: "4 · aparece sobre la propuesta" },
  { tipo: "viaje", f0: 625, f1: CLIC.aprobar, hasta: APROBAR, toma: "4 · viaje a «Aprobar y enviar»" },
  { tipo: "oculto", f: CORTE.aprueba, toma: "4 · el puntero se va" },
  { tipo: "aparece", f: CORTE.pestanas, en: CAB_HILO, toma: "5 · aparece en la cabecera del hilo (plano general)" },
  { tipo: "viaje", f0: CORTE.pestanas + 3, f1: CLIC.pestanaCorreo, hasta: PESTANA_CORREO, toma: "5 · viaje a la pestaña Correo" },
  { tipo: "oculto", f: CORTE.correo, toma: "5 · el puntero se va con el corte" },
];

export const CLICS: Clic[] = [
  { f: CLIC.conversacion, sobre: { sel: SEL.conversacion, texto: "Julián" } },
  { f: CLIC.aprobar, sobre: { sel: SEL.aprobar } },
  { f: CLIC.pestanaCorreo, sobre: { sel: SEL.pestanaCorreo } },
];

export const HOVERS: Hover[] = [
  { f0: CLIC.conversacion - 7, f1: CLIC.conversacion, sel: SEL.conversacion, texto: "Julián" },
  { f0: CLIC.aprobar - 7, f1: CLIC.aprobar, sel: SEL.aprobar },
  { f0: CLIC.pestanaCorreo - 7, f1: CLIC.pestanaCorreo, sel: SEL.pestanaCorreo },
];

/* ── Scroll (plantilla §2.4): sólo Integraciones ─────────────────────────────────────────── */
export const SCROLLS: Scroll[] = [
  /* Acto 6: las cuatro tarjetas (centrar la del correo las deja todas en cuadro). */
  { f0: CORTE.conexiones, f1: CORTE.conexiones, ancla: { sel: SEL.cardCorreo, texto: "Correo de VetGPT" }, hasta: "centrar" },
  /* Acto 7: el aviso está arriba del todo. */
  { f0: CORTE.aviso, f1: CORTE.aviso, ancla: { sel: SEL.aviso }, hasta: "arriba" },
];

/** Voseo que sólo aparece en las pantallas de esta pieza (además de MAPA_TUTEO). «para que VetGPT escriba
 *  *por vos*» va en cursiva y la cursiva parte el texto en dos nodos: el patrón tiene que ser sólo «por vos». */
export const TUTEO_EXTRA: ReadonlyArray<readonly [RegExp, string]> = [
  [/salvo que vos lo habilites/g, "salvo que tú lo habilites"],
  [/cuando vos la aprobés/g, "cuando tú la apruebes"],
  [/que ya usás/g, "que ya usas"],
  [/sin pasar por vos/g, "sin pasar por ti"],
  [/hasta que usted apruebe/g, "hasta que tú apruebes"],
  [/por vos(?=[\s.,;:!?)]|$)/g, "por ti"],
];
