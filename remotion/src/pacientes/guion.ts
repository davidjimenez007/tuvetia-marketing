/**
 * DemoPacientes · el guion como datos (prompts/demo-pacientes.md §2–§7 sobre la plantilla): frames de
 * los actos, textos literales, encuadres, y las tablas de cámara, cursor, hover, scroll y toasts.
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

/* ── La cadena de datos (encargo §3): Luna, su nota con guarda, su titular ─────────────────── */
export const PACIENTE = "Luna";

export const RUTAS = {
  paciente: "/dashboard/patients",
  consulta: "/dashboard/consultas",
  comunicaciones: "/dashboard/comunicaciones",
} as const;

/* ── Lienzo y superficie (plantilla §3; encargo §2: sólo escritorio) ─────────────────────── */
export const ESCRITORIO = { w: 1440, h: 900 } as const;
export const LIENZO: Lienzo = { w: 1080, h: 1920, safeTop: 220, safeBottom: 250, safeX: 72 };
export const MARCO = { escala: 0.65, top: 700 } as const;

/* ── Los actos (encargo §4) ──────────────────────────────────────────────────────────────── */
export const ACTOS = {
  ficha: 0,
  historia: 120,
  nota: 360,
  freno: 600,
  aprobada: 840,
  informe: 1020,
  enviado: 1260,
  cierre: 1380,
} as const;

/** Vuelta a la ficha dentro del acto 5 (la consulta figura aprobada). */
export const VUELTA_FICHA = 960;
/** El corte al hilo de WhatsApp (acto 7): un beat después del clic en «Enviar por WhatsApp». */
export const CORTE_ENVIA = 1290;

/* ── Encuadres: los mismos de DemoVentas (medidos ahí) ───────────────────────────────────── */
export const ENCUADRES = {
  columna: { vista: { x0: 244, y0: 48, w: 860, h: 852 } as Vista, escala: 1080 / 860, top: 250, anchoPagina: 820 },
  /** Como en DemoVentas pero 38 px más arriba (y0 96): la cabecera de la consulta («Luna · Perro · Prurito…»)
   *  queda entera al entrar al acto 3 (a y0 134 el título salía partido por el borde). */
  lectura: { vista: { x0: 244, y0: 96, w: 680, h: 680 } as Vista, escala: 1080 / 680, top: 250, anchoPagina: 640 },
  /** El hilo de WhatsApp: la bandeja no es una `.pagina` (lista a la izquierda, hilo a la derecha); se
   *  encuadra la mitad derecha, donde `.burbujas` (x 564→1422) y la burbuja del informe (x 746→1408); y0 100
   *  deja fuera la fila «número · nivel de autonomía · Avisos a titulares», que a y0 48 salía partida. */
  hilo: { vista: { x0: 700, y0: 100, w: 740, h: 740 } as Vista, escala: 1080 / 740, top: 250, anchoPagina: 820 },
} as const;
export type Encuadre = "general" | "columna" | "lectura" | "hilo";

/** Acto 1 general; la historia (acto 2), la ficha de vuelta y el diálogo en columna de 820; la consulta
 *  (actos 3, 4 y 5a) en la columna de lectura de 640, para leer badges, nota y guarda; el hilo de
 *  WhatsApp (acto 7, desde el corte) en su propio encuadre. */
export const encuadreEn = (f: number): Encuadre =>
  f < ACTOS.historia ? "general" : f >= ACTOS.nota && f < VUELTA_FICHA ? "lectura" : f >= CORTE_ENVIA ? "hilo" : "columna";

const VISTA_GENERAL: Vista = { x0: 0, y0: 0, w: ESCRITORIO.w, h: ESCRITORIO.h };
export const vistaEn = (f: number): Vista => {
  const enc = encuadreEn(f);
  return enc === "general" ? VISTA_GENERAL : ENCUADRES[enc].vista;
};
export const anchoPaginaEn = (f: number): number => {
  const enc = encuadreEn(f);
  return enc === "general" ? ENCUADRES.columna.anchoPagina : ENCUADRES[enc].anchoPagina;
};

/* ── Textos en pantalla (encargo §4), literales ───────────────────────────────────────────── */
export const TEXTOS: TextoBanda[] = [
  { f0: ACTOS.ficha, f1: ACTOS.historia, rotulo: "LA HISTORIA", frase: "Todo lo de tu paciente, en una pantalla." },
  { f0: ACTOS.historia, f1: ACTOS.nota, rotulo: "S · O · A · P", frase: "Cada consulta queda escrita, con la literatura que la respalda." },
  { f0: ACTOS.nota, f1: ACTOS.freno, rotulo: "LA REDACTÓ VetGPT", frase: "La escribe él, con lo que se dijo en la consulta." },
  { f0: ACTOS.freno, f1: ACTOS.aprobada, rotulo: "NO ENTRA SIN TI", frase: "Luna es alérgica a la penicilina. Hasta que no lo confirmes, no aprueba." },
  { f0: ACTOS.aprobada, f1: ACTOS.informe, rotulo: "APROBADA", frase: "Tú firmas. Recién ahí entra a la historia." },
  { f0: ACTOS.informe, f1: ACTOS.enviado, rotulo: "PARA EL TITULAR", frase: "Y lo que el dueño necesita saber, ya está escrito." },
  { f0: ACTOS.enviado, f1: ACTOS.cierre, rotulo: "UN CLIC", frase: "Le llega por WhatsApp, sin que copies nada." },
];

export const MICRORROTULO: Microrrotulo = { f0: 0, f1: ACTOS.cierre, texto: "DEMO · DATOS DE EJEMPLO" };

/* ── Clics y cortes: cada clic un beat antes del beat que cambia la pantalla ─────────────── */
export const CLIC = {
  /** El intento sobre «Revisar y aprobar» deshabilitado: el gesto ocurre, la app no hace nada. */
  aprobarBloqueado: 640,
  guarda: 750,
  aprobar: 870,
  informe: 1065,
  enviar: 1275,
} as const;
export const CORTE = {
  aprueba: 885,
  dialogo: 1080,
  envia: CORTE_ENVIA,
} as const;

/** Ventanas de los toasts que la app emite (el texto lo escribe la app). */
export const TOASTS = {
  aprobada: { f0: CORTE.aprueba, f1: VUELTA_FICHA },
  enviado: { f0: CORTE.envia, f1: 1350 },
} as const;

/* ── Selectores del DOM de la app (verificados sobre la copia) ───────────────────────────── */
export const SEL = {
  fichaCab: ".ficha-cab",
  primeraConsulta: "details.hist-consulta",
  primeraConsultaResumen: "details.hist-consulta > summary",
  badgeBorrador: ".pagina .badge",
  notaClinica: "section.card",
  guardarNota: 'button[data-act="guardar-nota"]',
  aprobar: 'button[data-act="aprobar-nota"]',
  gate: 'input[data-act="gate"]',
  chatPaciente: 'button[data-act="chat-paciente"]',
  informe: 'button[data-act="informe-paciente"]',
  dialogo: ".dialogo",
  textoInforme: "#informe-texto",
  enviarWA: 'button[data-act="enviar-informe"][data-arg$=":wa"]',
  /** El informe recién enviado: la última burbuja del hilo (verificado en el DOM: es la última hija de `.burbujas`). */
  burbujaMia: ".burbujas > .burbuja.mia:last-child",
} as const;

/** Puntos fijos (relativos 0..1 de 1440×900) de repuesto: sólo entran si el selector no resuelve. Medidos
 *  con `scripts/medir-pt-pacientes.mjs` (chrome-headless-shell por CDP, 1440×900, la columna de lectura del
 *  post-proceso puesta y el scroll de cada acto aplicado; `getBoundingClientRect` del centro de cada blanco).
 *  Los de la consulta están sobre la columna de 640 con el botón de aprobar (o la guarda) centrado; los del
 *  diálogo, sobre el diálogo centrado en el viewport. */
export const PT = {
  centro: { x: 0.5, y: 0.5 },
  arranqueConsulta: { x: 0.252, y: 0.526 },
  aprobar: { x: 0.365, y: 0.526 },
  gate: { x: 0.215, y: 0.527 },
  chatPaciente: { x: 0.569, y: 0.201 },
  informe: { x: 0.686, y: 0.201 },
  textoInforme: { x: 0.5, y: 0.499 },
  enviarWA: { x: 0.611, y: 0.772 },
  /** Centros de los encuadres columna (x 244→1104) y lectura (x 244→924, y 134→814): un push con foco
   *  acá no panea, y la columna (820 o 640 px) sólo cabe entera hasta ×1.05 (860/820, 680/640). */
  centroColumna: { x: 0.468, y: 0.527 },
  centroLectura: { x: 0.406, y: 0.484 },
  /** Centro del encuadre hilo (x 700→1440, y 100→840): el push sobre la burbuja paneaba hacia abajo y
   *  cortaba la cabecera del hilo («Ver ficha del titular»); centrado, la burbuja (y 420→746) sigue entera. */
  centroHilo: { x: 0.743, y: 0.522 },
} as const;

/* ── Blancos ─────────────────────────────────────────────────────────────────────────────── */
const APROBAR: Blanco = { sel: SEL.aprobar, x: PT.aprobar.x, y: PT.aprobar.y };
const GATE: Blanco = { sel: SEL.gate, x: PT.gate.x, y: PT.gate.y };
const GUARDAR: Blanco = { sel: SEL.guardarNota, x: PT.arranqueConsulta.x, y: PT.arranqueConsulta.y };
const CHAT_PACIENTE: Blanco = { sel: SEL.chatPaciente, x: PT.chatPaciente.x, y: PT.chatPaciente.y };
const INFORME: Blanco = { sel: SEL.informe, x: PT.informe.x, y: PT.informe.y };
const TEXTO_INFORME: Blanco = { sel: SEL.textoInforme, x: PT.textoInforme.x, y: PT.textoInforme.y };
const ENVIAR_WA: Blanco = { sel: SEL.enviarWA, x: PT.enviarWA.x, y: PT.enviarWA.y };

/* ── Cámara (plantilla §4): pushes lentos, uno por acto, con foco en el centro del encuadre ───────
   La columna llena el encuadre (820 en 860, 640 en 680), así que un push mayor a ×1.05 recorta la
   columna (stills de la 1.ª pasada: casilla y botones cortados a ×1.2–1.25). Los pushes van a ×1.05 y
   sin paneo; sólo el diálogo (540 px) y el hilo admiten más. Vuelta a 1.0 por corte. ────────────── */
export const CAMARA_GENERAL: KeyframeCamara[] = [
  { f: 0, s: 1, foco: PT.centro },
  { f: ACTOS.historia, s: 1.04, foco: PT.centro },
];

/* Acto 2: la primera consulta de la historia, abierta y centrada, con S/O/A/P. */
export const CAMARA_COLUMNA_A: KeyframeCamara[] = [
  { f: ACTOS.historia, s: 1, foco: PT.centroColumna },
  { f: 150, s: 1, foco: PT.centroColumna },
  { f: 240, s: 1.05, foco: PT.centroColumna },
  { f: ACTOS.nota - 1, s: 1.05, foco: PT.centroColumna },
];

/* Actos 3, 4 y 5a, en la columna de 640: un push lento por acto, centrado. */
export const CAMARA_LECTURA: KeyframeCamara[] = [
  { f: ACTOS.nota, s: 1, foco: PT.centroLectura },
  { f: ACTOS.freno - 1, s: 1.05, foco: PT.centroLectura },
  { f: ACTOS.freno, s: 1, foco: PT.centroLectura },
  { f: ACTOS.aprobada - 1, s: 1.05, foco: PT.centroLectura },
  { f: ACTOS.aprobada, s: 1, foco: PT.centroLectura },
  { f: VUELTA_FICHA - 1, s: 1.05, foco: PT.centroLectura },
];

/* Actos 5b y 6, en la columna de 820; el diálogo del informe admite ×1.2 (540 px en 860). */
export const CAMARA_COLUMNA_B: KeyframeCamara[] = [
  { f: VUELTA_FICHA, s: 1, foco: PT.centroColumna },
  { f: ACTOS.informe - 1, s: 1.05, foco: PT.centroColumna },
  { f: ACTOS.informe, s: 1, foco: PT.centroColumna },
  { f: CORTE.dialogo - 1, s: 1.05, foco: PT.centroColumna },
  { f: CORTE.dialogo, s: 1, foco: TEXTO_INFORME },
  { f: 1125, s: 1.2, foco: TEXTO_INFORME },
  { f: CORTE.envia - 1, s: 1.2, foco: TEXTO_INFORME },
];

/* Acto 7, el hilo: la burbuja del informe (661 px en 740) admite ×1.1. */
export const CAMARA_HILO: KeyframeCamara[] = [
  { f: CORTE.envia, s: 1, foco: PT.centroHilo },
  { f: 1335, s: 1.1, foco: PT.centroHilo },
  { f: ACTOS.cierre, s: 1.1, foco: PT.centroHilo },
];

export const camaraEn = (f: number): readonly KeyframeCamara[] => {
  if (f < ACTOS.historia) return CAMARA_GENERAL;
  if (f < ACTOS.nota) return CAMARA_COLUMNA_A;
  if (f < VUELTA_FICHA) return CAMARA_LECTURA;
  if (f < CORTE.envia) return CAMARA_COLUMNA_B;
  return CAMARA_HILO;
};

/* ── Cursor de escritorio ────────────────────────────────────────────────────────────────── */
/** Los blancos del cursor no dependen del contexto (Luna y su consulta se resuelven por selector). */
export const tramosCursor = (): TramoCursor[] => [
  { tipo: "aparece", f: 605, en: GUARDAR, toma: "4 · aparece en la fila de acciones de la nota" },
  { tipo: "viaje", f0: 615, f1: CLIC.aprobarBloqueado, hasta: APROBAR, toma: "4 · viaje a «Revisar y aprobar» (deshabilitado)" },
  { tipo: "viaje", f0: 720, f1: CLIC.guarda, hasta: GATE, toma: "4 · viaje a la casilla de la guarda" },
  { tipo: "viaje", f0: 845, f1: CLIC.aprobar, hasta: APROBAR, toma: "5 · viaje a «Revisar y aprobar», ya habilitado" },
  { tipo: "oculto", f: 905, toma: "5 · el puntero se va" },
  { tipo: "aparece", f: 1030, en: CHAT_PACIENTE, toma: "6 · aparece en la fila de acciones de la ficha" },
  { tipo: "viaje", f0: 1040, f1: CLIC.informe, hasta: INFORME, toma: "6 · viaje a «Informe para el titular»" },
  { tipo: "oculto", f: CORTE.dialogo + 5, toma: "6 · el puntero se va tras el diálogo" },
  { tipo: "aparece", f: 1250, en: TEXTO_INFORME, toma: "7 · aparece sobre el texto del informe" },
  { tipo: "viaje", f0: 1258, f1: CLIC.enviar, hasta: ENVIAR_WA, toma: "7 · viaje a «Enviar por WhatsApp»" },
  { tipo: "oculto", f: CORTE.envia, toma: "7 · el puntero se va" },
];

export const CLICS: Clic[] = [
  /* Sin `sobre`: el botón está deshabilitado y la app no reacciona; sólo se ve el gesto. */
  { f: CLIC.aprobarBloqueado },
  { f: CLIC.guarda, sobre: { sel: SEL.gate } },
  { f: CLIC.aprobar, sobre: { sel: SEL.aprobar } },
  { f: CLIC.informe, sobre: { sel: SEL.informe } },
  { f: CLIC.enviar, sobre: { sel: SEL.enviarWA } },
];

export const HOVERS: Hover[] = [
  { f0: CLIC.guarda - 7, f1: CLIC.guarda, sel: SEL.gate },
  { f0: CLIC.aprobar - 7, f1: CLIC.aprobar, sel: SEL.aprobar },
  { f0: CLIC.informe - 7, f1: CLIC.informe, sel: SEL.informe },
  { f0: CLIC.enviar - 7, f1: CLIC.enviar, sel: SEL.enviarWA },
];

/* ── Scroll (plantilla §2.4) ─────────────────────────────────────────────────────────────── */
export const SCROLLS: Scroll[] = [
  /* Acto 2: la primera consulta de la historia, abierta, centrada entera (431 px caben en el encuadre). */
  { f0: ACTOS.historia, f1: ACTOS.historia, ancla: { sel: SEL.primeraConsulta }, hasta: "centrar" },
  /* Acto 3: la consulta desde arriba (badges), luego la nota. */
  { f0: ACTOS.nota, f1: ACTOS.nota, ancla: { sel: SEL.badgeBorrador, texto: "Borrador" }, hasta: "arriba" },
  { f0: 480, f1: 480, ancla: { sel: SEL.notaClinica, texto: "Nota clínica" }, hasta: "centrar" },
  /* Acto 4: el botón deshabilitado, después la guarda. */
  { f0: ACTOS.freno, f1: ACTOS.freno, ancla: { sel: SEL.aprobar }, hasta: "centrar" },
  /* Del botón (abajo) a la guarda (arriba) por corte: 1230 px de scroll no se animan. */
  { f0: 690, f1: 690, ancla: { sel: SEL.gate }, hasta: "centrar" },
  /* Acto 5: de vuelta al botón. */
  { f0: ACTOS.aprobada, f1: 855, ancla: { sel: SEL.aprobar }, desde: "arriba", hasta: "centrar" },
  { f0: VUELTA_FICHA, f1: VUELTA_FICHA, ancla: { sel: SEL.primeraConsultaResumen }, hasta: "centrar" },
  /* Acto 6: la cabecera de la ficha, con los tres botones. */
  { f0: ACTOS.informe, f1: ACTOS.informe, ancla: { sel: SEL.fichaCab }, hasta: "arriba" },
  /* Acto 7: el hilo al fondo, donde está el informe. */
  { f0: CORTE.envia, f1: CORTE.envia, ancla: { sel: SEL.burbujaMia }, hasta: "fondo" },
];

/** Voseo que sólo aparece en las pantallas de esta pieza (además de MAPA_TUTEO). */
export const TUTEO_EXTRA: ReadonlyArray<readonly [RegExp, string]> = [
  [/Verificá el plan/g, "Verifica el plan"],
  [/que igual revisás y aprobás/g, "que igual revisas y apruebas"],
];
