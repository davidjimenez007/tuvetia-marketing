/**
 * ExplainerRAG · el guion como datos (prompts/explainer-rag.md §3–§5 + orden de cambio v2 §C):
 * frames de los actos, textos literales, geometría de las dos superficies y las tablas de cámara,
 * cursor, toque, hover, scroll y tecleo. Cero DOM acá: todo lo que resuelve selectores vive en
 * Cursor/Camara.
 *
 * Ritmo: 120 BPM → 1 beat = 15 frames, 1 compás = 60. Cortes en múltiplos de 15, actos en 60.
 */
import type { Blanco, Clic, Hover, KeyframeCamara, TramoCursor } from "../demo/guion";
import type { CtxExplainer } from "./tipos";

export const FPS = 30;
export const DURACION = 1560;

/**
 * Tamaño del corpus: 120.000 fuentes veterinarias, confirmado por David en la orden de cambio v2
 * (§A). Reemplaza las 61.540 que declaraba CLAUDE.md (actualizado en el mismo cambio). Es el único
 * número nuestro en la pieza, junto con los años y el locus de las citas.
 */
export const CORPUS = 120000;

/** La pieza sale sin voz. Si Luciano graba `public/voz/explainer-rag.mp3`, poner en true y
 *  agregar subtítulos quemados (skill remotion-tuvetia: el 80 % ve sin audio). */
export const CON_VOZ = false;

/* ── Las dos preguntas (literales, §5) ───────────────────────────────────────────────────── */
/** Cae en la rama /malassezia|otitis/ de responderVetGPT: dos citas reales. */
export const PREGUNTA_1 = "¿Qué dice la literatura sobre otitis por Malassezia?";
/** Cae en la rama por defecto: abstención con tres sugerencias. Se verifica en el still f1400. */
export const PREGUNTA_2 = "¿Cuánto vive un perro con soplo grado III?";

/** El paciente del contexto (acto 2): Luna, `p-1`. No es capricho: la nota con dos citas que se
 *  abre en el acto 8 es de una consulta de Luna. El replay lo verifica contra DB.notas (estado.ts)
 *  y, si el seed cambiara, manda la nota (orden v2 §C.2). */
export const PACIENTE_CONTEXTO = "p-1";

/* ── Superficies (§2.1) ──────────────────────────────────────────────────────────────────── */
export const ESCRITORIO = { w: 1440, h: 900 } as const;
export const MOVIL = { w: 540, h: 960, escala: 2 } as const;

/** Marco de ventana (§3.1): app a 0.65 → 936×585, barra de 24 encima, borde superior en y 700. */
export const MARCO = { escala: 0.65, top: 700, barra: 24, radio: 16 } as const;
/** Acto 4: la ventana se encoge y sube. */
export const MARCO_CHICO = { escala: 0.3, top: 520 } as const;
/** Encuadre de la columna del chat (§3.2), región en px de app; 888 → 1080 de ancho. */
export const COLUMNA = { x0: 232, y0: 48, w: 888, h: 832, escala: 1080 / 888, top: 250 } as const;

/* ── Los actos (orden v2 §C): cambios de acto en múltiplos de 60 ─────────────────────────── */
export const ACTOS = {
  titulo: 0,
  contexto: 120,
  pregunta: 300,
  celular: 480,
  repregunta: 600,
  corpus: 780,
  respuesta: 960,
  prueba: 1200,
  limite: 1320,
  cierre: 1440,
} as const;

/** Hitos de la transición al celular (acto 4): el encuadre de columna va de columna0 a columna1
 *  (corte seco a los dos lados); la ventana se encoge entre encoge0 y encoge1 mientras entra el
 *  anuncio; el celular sube entre sube0 y sube1; la ventana sale por opacidad al final. */
export const TRANSICION = {
  columna0: 120,
  columna1: 480,
  encoge0: 500,
  encoge1: 530,
  sube0: 530,
  sube1: 600,
  ventanaSale0: 588,
  ventanaSale1: 600,
} as const;

/** Modo del encuadre de escritorio por frame. */
export const modoEscritorioEn = (f: number): "general" | "columna" =>
  f >= TRANSICION.columna0 && f < TRANSICION.columna1 ? "columna" : "general";

/** Qué superficie recibe estado en cada frame. Las dos a la vez sólo en la transición. */
export const VISIBLE = {
  escritorio: (f: number): boolean => f < TRANSICION.sube1,
  movil: (f: number): boolean => f >= TRANSICION.sube0 && f < ACTOS.cierre,
} as const;

export const LIENZO = { w: 1080, h: 1920, safeTop: 220, safeBottom: 250, safeX: 72 } as const;

/* ── Textos en pantalla (§3 capa 7, §4.5, orden v2 §C) ───────────────────────────────────── */
/** El título del acto 1 (§C.1): sobre la nieve, entre y 300 y y 600, encima de la ventana. */
export const TITULO = {
  f0: 0,
  f1: 120,
  sale: 110,
  top: 300,
  alto: 300,
  linea1: "VetGPT",
  linea2: "una IA especializada para veterinarios",
} as const;

export interface TextoBanda {
  f0: number;
  f1: number;
  rotulo: string;
  frase: string;
}

export const TEXTOS: TextoBanda[] = [
  { f0: ACTOS.contexto, f1: ACTOS.pregunta, rotulo: "EL CONTEXTO", frase: "Le preguntas en general, o sobre un paciente tuyo." },
  { f0: ACTOS.pregunta, f1: ACTOS.celular, rotulo: "LA PREGUNTA", frase: "Le preguntas como le preguntarías a un colega." },
  { f0: ACTOS.repregunta, f1: ACTOS.corpus, rotulo: "LA REPREGUNTA", frase: "Antes de responder, pregunta. Así la respuesta le queda a tu caso." },
  { f0: ACTOS.corpus, f1: ACTOS.respuesta, rotulo: "ESQUEMA", frase: "Evitamos las alucinaciones: cada respuesta se apoya en fuentes que puedes abrir." },
  { f0: ACTOS.respuesta, f1: ACTOS.prueba, rotulo: "LA RESPUESTA", frase: "Lo que se apoya en literatura trae su marca." },
  { f0: ACTOS.prueba, f1: ACTOS.limite, rotulo: "LA PRUEBA", frase: "Título, revista, año. Puedes ir al artículo." },
  { f0: ACTOS.limite, f1: ACTOS.cierre, rotulo: "EL LÍMITE", frase: "Cuando no tiene fuente, lo dice." },
];

/** El anuncio del acto 4 va al centro, sobre la nieve, no en la banda. */
export const ANUNCIO = {
  f0: TRANSICION.encoge0,
  f1: TRANSICION.sube1,
  entra: TRANSICION.encoge0 + 5,
  rotulo: "EL MISMO HILO",
  frase: "También lo puedes usar desde tu celular.",
} as const;

/** Línea roja 2: se dice que es demo durante los nueve actos, hasta el cierre. */
export const MICRORROTULO = { f0: 0, f1: ACTOS.cierre, texto: "DEMO · DATOS DE EJEMPLO" } as const;

export const CIERRE_F0 = ACTOS.cierre;

/* ── Selectores del DOM de la app (verificados sobre la copia) ───────────────────────────── */
export const SEL = {
  textarea: "form.compositor textarea[name=q]",
  enviar: "form.compositor button.redondo.enviar",
  /** El chip de contexto del compositor (orden v2 §C.2): «Consulta general» o el paciente. */
  ctxChip: "form.compositor button.ctx-chip",
  dialogo: ".dialogo",
  filaContexto: (idPaciente: string): string =>
    `.dialogo button[data-act="elegir-contexto"][data-arg="${idPaciente}"]`,
  /** Las opciones de la repregunta (orden v2 §B.3); se distinguen por texto. */
  opcionRepregunta: ".repreguntas button.sug",
  mensajeBot: "#hilo-chat .msg-bot",
  primeraCita: "#hilo-chat .msg-bot .cita",
  tarjetaReferencias: "section.card.pad",
  referencia: "section.card.pad ol.divide li",
  /** El ordinal de la primera referencia: con foco ahí el zoom queda pegado al borde izquierdo
   *  y se leen título, revista, año y «Abrir artículo» completos. */
  ordinalReferencia: "section.card.pad ol.divide li .av",
  filaConsulta: (id: string): string => `a.fila[data-act="ir"][data-arg="/dashboard/consultas/${id}"]`,
} as const;

/** Tramos en que se escribe algo: la pregunta se teclea por caracteres; la repregunta, la
 *  respuesta y la abstención se escriben por palabras seguras (texto.ts). */
export const ESCRITURA = {
  pregunta: [310, 430],
  repregunta: [600, 630],
  respuesta: [990, 1140],
  abstencion: [1330, 1400],
} as const;

/** El caret parpadea en fase con la primera escritura del asistente (la repregunta, f600):
 *  990 − 600 = 13·30 y 1330 − 600 ≡ 10 (mod 30), así que la respuesta y la abstención también
 *  arrancan con el caret encendido. */
export const CARET_F0 = ESCRITURA.repregunta[0];

/** En móvil la banda (y 1330–1610) tapa el último tramo del hilo; el hilo gana este relleno
 *  inferior (px de app) para que lo último que se escribe quede por encima de la banda. */
export const RELLENO_HILO_MOVIL = 150;

/** Puntos fijos (relativos 0..1 del área de app) para cuando el blanco deja de existir en el
 *  frame de la acción. `enviarHero`: el botón de enviar del compositor del hero, que se muda al
 *  pie del hilo en el frame del clic (medido a 1440×900; con el chip en «Luna» no se mueve).
 *  `filaContexto`: la fila de Luna en el diálogo de contexto, que se cierra en el frame del clic
 *  (medida con el diálogo abierto a 1440×900). */
export const PT = {
  centro: { x: 0.5, y: 0.5 },
  enviarHero: { x: 0.6743, y: 0.5496 },
  /** Foco del push de tecleo y del envío: a 1.62 el encuadre muestra 548 px de app; centrado
   *  acá caben el inicio de la pregunta y el botón (medido sobre el still f0269 de la primera
   *  versión; con foco en el textarea el botón quedaba cortado, still f0430 de la primera pasada v2). */
  compositorAlEnviar: { x: 0.503, y: 0.5496 },
  filaContexto: { x: 0.5, y: 0.4069 },
} as const;

/* ── Cámara (§4.2): keyframes {f, s, foco}, spring damping 200 estirado al tramo ────────── */
const TEXTAREA: Blanco = { sel: SEL.textarea, x: 0.47, y: 0.53 };
/** El diálogo de contexto; cuando no está (antes de abrirse, después del clic) cae al centro. */
const DIALOGO: Blanco = { sel: SEL.dialogo, x: 0.5, y: 0.5 };

/** Plano general de la ventana: push lento bajo el título y quieto al volver. */
export const CAMARA_ESCRITORIO_GENERAL: KeyframeCamara[] = [
  { f: 0, s: 1, foco: PT.centro },
  { f: ACTOS.contexto, s: 1.04, foco: PT.centro },
  { f: TRANSICION.columna1, s: 1, foco: PT.centro },
];

/** Encuadre de la columna (f120–480): push 1.2 sobre el diálogo de contexto mientras está abierto
 *  (el diálogo mide 720 de los 888 px del encuadre: 1.2 es lo máximo que lo deja entero), vuelta a
 *  1.0 al elegir, push de tecleo 1.0 → 1.62 sobre el compositor (§3.2, foco en el punto que deja
 *  ver la pregunta y el botón) y vuelta a 1.0 en 20 frames al enviar. */
export const CAMARA_ESCRITORIO_COLUMNA: KeyframeCamara[] = [
  { f: 120, s: 1, foco: TEXTAREA },
  { f: 155, s: 1, foco: DIALOGO },
  { f: 175, s: 1.2, foco: DIALOGO },
  { f: 238, s: 1.2, foco: DIALOGO },
  { f: 240, s: 1.2, foco: TEXTAREA },
  { f: 260, s: 1, foco: TEXTAREA },
  { f: ESCRITURA.pregunta[0], s: 1, foco: PT.compositorAlEnviar },
  { f: ESCRITURA.pregunta[1], s: 1.62, foco: PT.compositorAlEnviar },
  { f: 450, s: 1.62, foco: PT.compositorAlEnviar },
  { f: 470, s: 1, foco: PT.compositorAlEnviar },
];

const CITA_1: Blanco = { sel: SEL.primeraCita, x: 0.5, y: 0.45 };
const REFERENCIA_1: Blanco = { sel: SEL.ordinalReferencia, x: 0.1, y: 0.5 };

/** Móvil: zoom a la pastilla [1] (acto 7), zoom a la primera referencia (acto 8), 1.0 en el 9. */
export const CAMARA_MOVIL: KeyframeCamara[] = [
  { f: TRANSICION.sube0, s: 1, foco: PT.centro },
  { f: ESCRITURA.respuesta[1], s: 1, foco: PT.centro },
  { f: 1155, s: 1.35, foco: CITA_1 },
  { f: 1188, s: 1.35, foco: CITA_1 },
  { f: ACTOS.prueba, s: 1, foco: PT.centro },
  { f: 1260, s: 1, foco: PT.centro },
  { f: 1275, s: 1.4, foco: REFERENCIA_1 },
  { f: 1305, s: 1.4, foco: REFERENCIA_1 },
  { f: ACTOS.limite, s: 1, foco: PT.centro },
];

/* ── Cursor de escritorio (§4.1): elegir el contexto (acto 2) y enviar la pregunta (acto 3) ── */
const CHIP: Blanco = { sel: SEL.ctxChip };

/** Los tramos dependen del contexto: la fila que se clica es la del paciente de la nota citada.
 *  Al clic (f240) el diálogo ya se cerró, así que la fila lleva su punto de repuesto. */
export const tramosCursor = (ctx: CtxExplainer): TramoCursor[] => {
  const fila: Blanco = {
    sel: SEL.filaContexto(ctx.idPaciente ?? PACIENTE_CONTEXTO),
    x: PT.filaContexto.x,
    y: PT.filaContexto.y,
  };
  return [
    { tipo: "aparece", f: 135, en: CHIP, toma: "2 · el puntero aparece sobre el chip de contexto" },
    { tipo: "viaje", f0: 165, f1: 200, hasta: fila, toma: "2 · viaje a la fila de Luna en el diálogo" },
    { tipo: "oculto", f: 255, toma: "2 · el puntero se va" },
    { tipo: "aparece", f: 415, en: TEXTAREA, toma: "3 · el puntero aparece sobre el compositor" },
    { tipo: "viaje", f0: 420, f1: 440, hasta: { sel: SEL.enviar }, toma: "3 · viaje al botón de enviar" },
    /* Al clic el compositor se muda del hero al pie del hilo: el puntero se queda donde estaba. */
    { tipo: "salta", f: 450, en: PT.enviarHero, toma: "3 · clic en enviar (punto fijo)" },
    { tipo: "oculto", f: 470, toma: "3 · el puntero se va" },
  ];
};

/** Clics: el chip (existe al clic, lleva active-sim); la fila de Luna y el botón del hero dejan
 *  de existir en el frame del clic (el diálogo se cierra, el compositor se muda): sin `sobre`. */
export const CLICS: Clic[] = [{ f: 150, sobre: { sel: SEL.ctxChip } }, { f: 240 }, { f: 450 }];

/** `.ctx-chip:hover` y `.redondo.enviar:hover` sólo cambian el fondo: sin lift. */
export const HOVERS: Hover[] = [
  { f0: 142, f1: 150, sel: SEL.ctxChip },
  { f0: 438, f1: 450, sel: SEL.enviar },
];

/* ── Toques en móvil (§4.1): las dos opciones de la repregunta y entrar a la consulta ─────── */
export interface Toque {
  f: number;
  /** El blanco se resuelve con el contexto del replay (ids dinámicos). Sin repuesto x/y:
   *  si el elemento no está, revienta con el nombre de la toma. */
  blanco(ctx: CtxExplainer): Blanco;
  toma: string;
}

export const TOQUES: Toque[] = [
  { f: 690, blanco: () => ({ sel: SEL.opcionRepregunta, texto: "Perro" }), toma: "5 · toque en «Perro»" },
  { f: 735, blanco: () => ({ sel: SEL.opcionRepregunta, texto: "Recurrente" }), toma: "5 · toque en «Recurrente»" },
  {
    f: 1245,
    blanco: (ctx) => ({ sel: SEL.filaConsulta(ctx.idConsulta ?? "") }),
    toma: "8 · toque en la consulta con citas",
  },
];

/* ── Scroll (§2.4): el contenedor se resuelve por overflow-y computado desde el ancla ────── */
export interface Scroll {
  f0: number;
  f1: number;
  ancla: Blanco;
  desde?: "arriba" | "fondo";
  hasta: "arriba" | "fondo" | "centrar";
}

export const SCROLLS: Scroll[] = [
  { f0: ACTOS.repregunta, f1: ESCRITURA.respuesta[1], ancla: { sel: SEL.mensajeBot }, hasta: "fondo" },
  { f0: ESCRITURA.respuesta[1], f1: 1155, ancla: { sel: SEL.primeraCita }, desde: "fondo", hasta: "centrar" },
  /* Sin `desde`: al llegar a la consulta (f1260) la tarjeta ya está centrada, que es lo que pide
     el still f1260; el zoom 1.4 hace el resto. */
  { f0: 1260, f1: 1260, ancla: { sel: SEL.tarjetaReferencias, texto: "Referencias citadas" }, hasta: "centrar" },
  { f0: ACTOS.limite, f1: ACTOS.cierre, ancla: { sel: SEL.mensajeBot }, hasta: "fondo" },
];

/* ── Tecleo (§3.3): un solo tramo con SFX; la segunda pregunta ya no se teclea (orden v2) ─── */
export const TECLEOS = [{ f0: ESCRITURA.pregunta[0], f1: ESCRITURA.pregunta[1] }] as const;
