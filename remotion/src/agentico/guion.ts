/**
 * DemoAgentico · el guion como datos (prompts/demo-vetgpt-agentico.md §3–§7 sobre la plantilla): frames de
 * los actos, textos literales, encuadres, y las tablas de cámara, cursor, hover y toasts.
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

/* ── La cadena de datos (encargo §3) ─────────────────────────────────────────────────────── */
export const RUTAS = {
  asistente: "/dashboard/asistente",
  /** El punto de entrada de la propia app: el riel navega acá con la pregunta ya escrita. */
  pedirCobros: "/dashboard/asistente?pedir=cobros",
  comunicaciones: "/dashboard/comunicaciones",
  agenda: "/dashboard/calendario",
} as const;

/** Lo que el vet añade al final del mensaje antes de aprobar (acto 4). Se escribe por caracteres y
 *  tiene que leerse igual, carácter por carácter, en el hilo de WhatsApp del acto 6. En tuteo. */
export const FRASE_VET = " Si necesitas un plazo, escríbeme y lo cuadramos.";

/** La segunda petición (acto 7). En tuteo; cae en la rama de cita por «control» + «Luna». */
export const PREGUNTA_CITA = "Agéndame un control para Luna la próxima semana.";
export const PACIENTE_CITA = "Luna";

/* ── Lienzo y superficie (plantilla §3; encargo §2: sólo escritorio) ─────────────────────── */
export const ESCRITORIO = { w: 1440, h: 900 } as const;
export const LIENZO: Lienzo = { w: 1080, h: 1920, safeTop: 220, safeBottom: 250, safeX: 72 };
export const MARCO = { escala: 0.65, top: 700 } as const;

/* ── Los actos (encargo §4) ──────────────────────────────────────────────────────────────── */
export const ACTOS = {
  clinica: 0,
  pedir: 120,
  lee: 300,
  propuesta: 540,
  aprobar: 840,
  prueba: 1020,
  agenda: 1260,
  cierre: 1380,
} as const;

/* ── Clics y cortes: cada clic un beat antes del beat que cambia la pantalla ─────────────── */
export const CLIC = {
  resolver: 105,
  enviar: 225,
  campo: 690,
  aprobar: 870,
  aprobarCita: 1290,
} as const;
export const CORTE = {
  /** El riel navega al asistente con la pregunta precargada. */
  pregunta: 120,
  /** El mensaje del vet entra al hilo; VetGPT «piensa». */
  pensando: 240,
  /** Llega la respuesta: primero «Consultando la cartera de la clínica…». */
  respuesta: ACTOS.lee,
  /** Empieza a escribirse el texto, palabra por palabra, hasta el inicio del acto 4. */
  escribe: 330,
  /** El vet añade su frase al mensaje: por caracteres, 700 → 760. */
  edita: 700,
  editaFin: 760,
  ejecutada: 885,
  /** Dentro del acto 6: de la lista (fila nueva) al hilo (el mensaje con la frase). */
  hilo: 1140,
  /** La cita aprobada: corte a la agenda de esa semana. */
  agenda: 1305,
} as const;

/** Ventanas de los toasts que la app emite (el texto lo escribe la app). */
export const TOASTS = {
  ejecutada: { f0: CORTE.ejecutada, f1: 975 },
  cita: { f0: CORTE.agenda, f1: ACTOS.cierre },
} as const;

/* ── Encuadres: medidos con scripts/medir-pt-agentico.mjs (CDP, 1440×900) ─────────────────
   El asistente no tiene `.pagina`: el hilo es una columna de 780 (x 286→1066) con el riel de la clínica
   a la derecha (x 1120→1440). Cada encuadre es cuadrado para que quepa en los 1080 px sobre la banda. */
export const ENCUADRES = {
  /** El riel «Requiere atención» (x 1141→1420, y 614→792) y el botón «Resolverlo con VetGPT». */
  riel: { vista: { x0: 1000, y0: 460, w: 440, h: 440 } as Vista, escala: 1080 / 440, top: 250 },
  /** La bienvenida del asistente con el compositor centrado (x 356→996, y 468→522). */
  compositor: { vista: { x0: 296, y0: 140, w: 760, h: 760 } as Vista, escala: 1080 / 760, top: 250 },
  /** El hilo entero, anclado abajo: del mensaje del vet (y 72) al pie «VetGPT propone — tú apruebas»
   *  (y 859→876), que el encargo quiere en cámara en cada plano del asistente. */
  chat: { vista: { x0: 266, y0: 56, w: 820, h: 820 } as Vista, escala: 1080 / 820, top: 250 },
  /** La tarjeta de acción (x 324→931, y 281→674; la de la cita, y 236→711) con el compositor y el pie
   *  (y 797→876) debajo: anclado abajo por lo mismo. */
  tarjeta: { vista: { x0: 284, y0: 226, w: 660, h: 660 } as Vista, escala: 1080 / 660, top: 250 },
  /** La lista de conversaciones (x 248→548, filas desde y 196) con el borde del hilo. */
  lista: { vista: { x0: 232, y0: 86, w: 600, h: 600 } as Vista, escala: 1080 / 600, top: 250 },
  /** El hilo nuevo: de su cabecera (y 143→192) al compositor (y 822→883), con la única burbuja (x 746→1407,
   *  y 208→304); arranca en y 143 para dejar fuera la fila «número · nivel de autonomía · Avisos a titulares»
   *  (y 90→121), que salía partida. Cámara fija: un push recortaría cabecera o compositor. */
  hilo: { vista: { x0: 700, y0: 143, w: 740, h: 740 } as Vista, escala: 1080 / 740, top: 250 },
  /** La agenda en vista Semana (la página es una columna hasta x ≈ 1140): de martes a domingo, con la cabecera
   *  «7 Sep — 13 Sep 2026» y las pestañas; la cita nueva (`.ev`, x 947→1061, y 374→392) en la columna del jueves. */
  agenda: { vista: { x0: 420, y0: 100, w: 720, h: 720 } as Vista, escala: 1080 / 720, top: 250 },
} as const;
export type Encuadre = "general" | keyof typeof ENCUADRES;

/** Acto 1: plano general y luego el riel; 2: el compositor; 3: el hilo; 4–5: la tarjeta; 6: lista y
 *  hilo de WhatsApp; 7: la tarjeta de la cita y la agenda. */
export const encuadreEn = (f: number): Encuadre => {
  if (f < 60) return "general";
  if (f < CORTE.pregunta) return "riel";
  if (f < CORTE.pensando) return "compositor";
  if (f < ACTOS.propuesta) return "chat";
  if (f < ACTOS.prueba) return "tarjeta";
  if (f < CORTE.hilo) return "lista";
  if (f < ACTOS.agenda) return "hilo";
  if (f < CORTE.agenda) return "tarjeta";
  return "agenda";
};

const VISTA_GENERAL: Vista = { x0: 0, y0: 0, w: ESCRITORIO.w, h: ESCRITORIO.h };
export const vistaEn = (f: number): Vista => {
  const enc = encuadreEn(f);
  return enc === "general" ? VISTA_GENERAL : ENCUADRES[enc].vista;
};

/* ── Textos en pantalla (encargo §4), literales; el 7 ajustado a lo que hace la acción ───── */
export const TEXTOS: TextoBanda[] = [
  { f0: ACTOS.clinica, f1: ACTOS.pedir, rotulo: "LA CLÍNICA HOY", frase: "Hay plata sin cobrar. Alguien tiene que escribir." },
  { f0: ACTOS.pedir, f1: ACTOS.lee, rotulo: "SE LO PIDES", frase: "Se lo pides como se lo pedirías a alguien del equipo." },
  { f0: ACTOS.lee, f1: ACTOS.propuesta, rotulo: "MIRA TUS DATOS", frase: "No inventa: lee la cartera que tienes." },
  { f0: ACTOS.propuesta, f1: ACTOS.aprobar, rotulo: "TÚ MANDAS", frase: "Te lo deja escrito. Y lo puedes cambiar antes de que salga." },
  { f0: ACTOS.aprobar, f1: ACTOS.prueba, rotulo: "APROBAR", frase: "Nada sale hasta que aprietas esto." },
  { f0: ACTOS.prueba, f1: ACTOS.agenda, rotulo: "NO EXISTÍA", frase: "Le escribió. Con lo que tú escribiste." },
  { f0: ACTOS.agenda, f1: ACTOS.cierre, rotulo: "TAMBIÉN AGENDA", frase: "Crea la cita y le avisa al titular. Tú apruebas." },
];

export const MICRORROTULO: Microrrotulo = { f0: 0, f1: ACTOS.cierre, texto: "DEMO · DATOS DE EJEMPLO" };

/* ── Selectores del DOM de la app (verificados sobre la copia) ───────────────────────────── */
export const SEL = {
  rielAtencion: ".riel-clinica section",
  rielResolver: 'button[data-act="ir"][data-arg="/dashboard/asistente?pedir=cobros"]',
  textareaChat: 'textarea[data-act="chat-input"]',
  enviar: ".compositor button.enviar",
  bloques: ".msg-bot .bloques",
  tarjeta: ".accion",
  textareaBody: 'textarea[data-act="accion-campo"]',
  aprobar: 'button[data-act="accion-aprobar"]',
  campoMotivo: 'input[data-act="accion-campo"][data-arg$=":titulo"]',
  /** La conversación nueva es la primera de la lista (la más reciente). */
  convNueva: ".col-lista .crece > .conv:first-child",
  burbuja: ".burbujas > .burbuja.mia:last-child",
  evCita: ".ev",
} as const;

/** Puntos fijos (relativos 0..1 de 1440×900) de repuesto: sólo entran si el selector no resuelve.
 *  Medidos con `scripts/medir-pt-agentico.mjs` en el estado de cada acto. */
export const PT = {
  centro: { x: 0.5, y: 0.5 },
  rielAtencion: { x: 0.889, y: 0.781 },
  rielResolver: { x: 0.889, y: 0.864 },
  textareaChat: { x: 0.506, y: 0.55 },
  enviar: { x: 0.674, y: 0.55 },
  bloques: { x: 0.436, y: 0.239 },
  tarjeta: { x: 0.436, y: 0.531 },
  textareaBody: { x: 0.415, y: 0.529 },
  aprobar: { x: 0.283, y: 0.686 },
  aparte: { x: 0.62, y: 0.6 },
  campoMotivo: { x: 0.415, y: 0.532 },
  aprobarCita: { x: 0.267, y: 0.727 },
  convNueva: { x: 0.276, y: 0.252 },
  burbuja: { x: 0.748, y: 0.285 },
  evCita: { x: 0.698, y: 0.425 },
  /** Centros de los encuadres: un push con foco acá no panea. */
  centroRiel: { x: 0.847, y: 0.756 },
  centroCompositor: { x: 0.469, y: 0.578 },
  centroChat: { x: 0.469, y: 0.518 },
  centroTarjeta: { x: 0.426, y: 0.618 },
  centroLista: { x: 0.369, y: 0.429 },
  centroHilo: { x: 0.743, y: 0.57 },
} as const;

/* ── Blancos ─────────────────────────────────────────────────────────────────────────────── */
const RIEL_ATENCION: Blanco = { sel: SEL.rielAtencion, texto: "Requiere atención", x: PT.rielAtencion.x, y: PT.rielAtencion.y };
const RIEL_RESOLVER: Blanco = { sel: SEL.rielResolver, x: PT.rielResolver.x, y: PT.rielResolver.y };
const TEXTAREA_CHAT: Blanco = { sel: SEL.textareaChat, x: PT.textareaChat.x, y: PT.textareaChat.y };
const ENVIAR: Blanco = { sel: SEL.enviar, x: PT.enviar.x, y: PT.enviar.y };
const TARJETA: Blanco = { sel: SEL.tarjeta, x: PT.tarjeta.x, y: PT.tarjeta.y };
const TEXTAREA_BODY: Blanco = { sel: SEL.textareaBody, x: PT.textareaBody.x, y: PT.textareaBody.y };
/** Un punto vacío de la tarjeta, a la derecha de los pasos: el puntero se aparta ahí del texto que se escribe. */
const APARTE: Blanco = { x: PT.aparte.x, y: PT.aparte.y };
const APROBAR: Blanco = { sel: SEL.aprobar, x: PT.aprobar.x, y: PT.aprobar.y };
const CAMPO_MOTIVO: Blanco = { sel: SEL.campoMotivo, x: PT.campoMotivo.x, y: PT.campoMotivo.y };
const APROBAR_CITA: Blanco = { sel: SEL.aprobar, x: PT.aprobarCita.x, y: PT.aprobarCita.y };
const EV_CITA: Blanco = { sel: SEL.evCita, texto: "Control", x: PT.evCita.x, y: PT.evCita.y };

/* ── Cámara (plantilla §4): pushes lentos, uno por tramo, sin paneo salvo sobre el riel y la cita ─
   Los encuadres van justos (la tarjeta de 607 px en 660): pushes a ×1.05 con foco en el centro; ×1.1
   sobre la sección del riel (279 px en 440) y ×1.2 sobre la cita en la agenda (114 px). ──────────── */
export const CAMARA_GENERAL: KeyframeCamara[] = [
  { f: 0, s: 1, foco: PT.centro },
  { f: 59, s: 1.04, foco: PT.centro },
];
export const CAMARA_RIEL: KeyframeCamara[] = [
  { f: 60, s: 1, foco: PT.centroRiel },
  { f: CORTE.pregunta - 1, s: 1.1, foco: RIEL_ATENCION },
];
export const CAMARA_COMPOSITOR: KeyframeCamara[] = [
  { f: CORTE.pregunta, s: 1, foco: PT.centroCompositor },
  { f: CORTE.pensando - 1, s: 1.05, foco: PT.centroCompositor },
];
/* En el hilo y sobre la tarjeta la cámara no se mueve: cualquier push recortaría el pie del compositor
   («VetGPT propone — tú apruebas»), que va pegado al borde inferior del encuadre. */
export const CAMARA_CHAT: KeyframeCamara[] = [
  { f: CORTE.pensando, s: 1, foco: PT.centroChat },
  { f: ACTOS.propuesta - 1, s: 1, foco: PT.centroChat },
];
export const CAMARA_TARJETA: KeyframeCamara[] = [
  { f: ACTOS.propuesta, s: 1, foco: PT.centroTarjeta },
  { f: ACTOS.prueba - 1, s: 1, foco: PT.centroTarjeta },
];
export const CAMARA_LISTA: KeyframeCamara[] = [
  { f: ACTOS.prueba, s: 1, foco: PT.centroLista },
  { f: CORTE.hilo - 1, s: 1.05, foco: PT.centroLista },
];
export const CAMARA_HILO: KeyframeCamara[] = [
  { f: CORTE.hilo, s: 1, foco: PT.centroHilo },
  { f: ACTOS.agenda - 1, s: 1, foco: PT.centroHilo },
];
export const CAMARA_TARJETA_CITA: KeyframeCamara[] = [
  { f: ACTOS.agenda, s: 1, foco: PT.centroTarjeta },
  { f: CORTE.agenda - 1, s: 1, foco: PT.centroTarjeta },
];
export const CAMARA_AGENDA: KeyframeCamara[] = [
  { f: CORTE.agenda, s: 1, foco: EV_CITA },
  { f: 1350, s: 1.2, foco: EV_CITA },
  { f: ACTOS.cierre, s: 1.2, foco: EV_CITA },
];

export const camaraEn = (f: number): readonly KeyframeCamara[] => {
  switch (encuadreEn(f)) {
    case "general":
      return CAMARA_GENERAL;
    case "riel":
      return CAMARA_RIEL;
    case "compositor":
      return CAMARA_COMPOSITOR;
    case "chat":
      return CAMARA_CHAT;
    case "tarjeta":
      return f < ACTOS.agenda ? CAMARA_TARJETA : CAMARA_TARJETA_CITA;
    case "lista":
      return CAMARA_LISTA;
    case "hilo":
      return CAMARA_HILO;
    default:
      return CAMARA_AGENDA;
  }
};

/* ── Cursor de escritorio ────────────────────────────────────────────────────────────────── */
export const tramosCursor = (): TramoCursor[] => [
  { tipo: "aparece", f: 75, en: RIEL_ATENCION, toma: "1 · aparece sobre «Requiere atención»" },
  { tipo: "viaje", f0: 85, f1: CLIC.resolver, hasta: RIEL_RESOLVER, toma: "1 · viaje a «Resolverlo con VetGPT»" },
  { tipo: "oculto", f: CORTE.pregunta, toma: "1 · el puntero se va con el corte" },
  { tipo: "aparece", f: 180, en: TEXTAREA_CHAT, toma: "2 · aparece sobre la pregunta escrita" },
  { tipo: "viaje", f0: 195, f1: CLIC.enviar, hasta: ENVIAR, toma: "2 · viaje al botón de enviar" },
  { tipo: "oculto", f: CORTE.pensando, toma: "2 · el puntero se va" },
  { tipo: "aparece", f: 660, en: TARJETA, toma: "4 · aparece sobre la tarjeta" },
  { tipo: "viaje", f0: 670, f1: CLIC.campo, hasta: TEXTAREA_BODY, toma: "4 · viaje al campo del mensaje" },
  /* Tras el clic el puntero se aparta del texto que se va a escribir (como quien suelta el mouse). */
  { tipo: "viaje", f0: CLIC.campo + 5, f1: CLIC.campo + 20, hasta: APARTE, toma: "4 · el puntero se aparta del texto" },
  { tipo: "viaje", f0: 845, f1: CLIC.aprobar, hasta: APROBAR, toma: "5 · viaje a «Aprobar y enviar»" },
  { tipo: "oculto", f: 900, toma: "5 · el puntero se va" },
  { tipo: "aparece", f: 1268, en: CAMPO_MOTIVO, toma: "7 · aparece sobre el motivo de la cita" },
  { tipo: "viaje", f0: 1275, f1: CLIC.aprobarCita, hasta: APROBAR_CITA, toma: "7 · viaje a «Aprobar»" },
  { tipo: "oculto", f: CORTE.agenda, toma: "7 · el puntero se va con el corte" },
];

export const CLICS: Clic[] = [
  { f: CLIC.resolver, sobre: { sel: SEL.rielResolver } },
  { f: CLIC.enviar, sobre: { sel: SEL.enviar } },
  { f: CLIC.campo, sobre: { sel: SEL.textareaBody } },
  { f: CLIC.aprobar, sobre: { sel: SEL.aprobar } },
  { f: CLIC.aprobarCita, sobre: { sel: SEL.aprobar } },
];

export const HOVERS: Hover[] = [
  { f0: CLIC.resolver - 7, f1: CLIC.resolver, sel: SEL.rielResolver },
  { f0: CLIC.enviar - 7, f1: CLIC.enviar, sel: SEL.enviar },
  { f0: CLIC.aprobar - 7, f1: CLIC.aprobar, sel: SEL.aprobar },
  { f0: CLIC.aprobarCita - 7, f1: CLIC.aprobarCita, sel: SEL.aprobar },
];

/* ── Scroll (plantilla §2.4): nada que desplazar, el hilo y la tarjeta caben en el viewport ─ */
export const SCROLLS: Scroll[] = [];

/** Voseo que sólo aparece en las pantallas de esta pieza (además de MAPA_TUTEO): el mensaje de cobro que
 *  redacta la app arranca con «Tenés» en mayúscula (el mapa sólo trae la minúscula). */
export const TUTEO_EXTRA: ReadonlyArray<readonly [RegExp, string]> = [
  [/Tenés/g, "Tienes"],
  /* La leyenda de la tarjeta trata de usted; el pie del compositor, de tú. Se unifica en tuteo. */
  [/hasta que usted apruebe/g, "hasta que tú apruebes"],
];
