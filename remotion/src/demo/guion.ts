/**
 * DemoSaaS · la línea de tiempo completa de §5 del encargo, como datos puros.
 * Nada acá toca el DOM: son tomas, viajes, clics, hovers, cámara, textos, toasts
 * y scroll que AppEmbebida ejecuta cuadro a cuadro sobre la app embebida.
 */

/* ── Lienzo ──────────────────────────────────────────────────────────────────────────────── */
export const APP_W = 1600;
export const APP_H = 864;
export const VENTANA = { x: 160, y: 60, w: 1600, h: 900, barra: 36 } as const;
export const FPS = 30;
export const DURACION = 2400;

/* ── La superficie tipada de window.app que el replay usa ────────────────────────────────── */
export interface VivoApp {
  fase: string;
  consultaId: string | null;
  pacienteNombre: string | null;
  segundos: number;
  pausada: boolean;
  estable: string;
  provisional: string;
  guion: string[];
  idx: number;
  notas: string;
  sugerencias: string;
  alergias: string[];
  pensando: boolean;
  llamadas: number;
  techo: number;
  alerta: boolean;
  panelAbierto: boolean;
  tab: string;
  tabCockpit: string;
  arrastre: { x: number; y: number };
}

export interface MensajeWa {
  id: string;
  tel: string;
  dir: string;
  texto: string;
  cuando: Date;
  leido: Date | null;
  entregado: Date | null;
  fallo: unknown;
}

export interface DbApp {
  consultas: { id: string; estado: string; motivo: string; audioSeg: number; pacienteId: string }[];
  facturas: { id: string; numero: string | null }[];
  clinica: { nombre: string };
  wa: { mensajes: MensajeWa[]; contactos: unknown[]; propuestas: unknown[] };
  transcripciones: Record<string, string>;
  titulares: { id: string; nombre: string; consentimiento: boolean }[];
  catalogo: { id: string; tipo: string; nombre: string }[];
  tablero: {
    metricas: { id: string; visible: boolean }[];
    widgets: { id: string; visible: boolean }[];
  };
  onboardingHecho: boolean;
}

export interface UiApp {
  sesion: unknown;
  tema: string;
  barraChica: boolean;
  barraMovil: boolean;
  ruta: string;
  query: Record<string, string>;
  histTab: string;
  histQ: string;
  rielPlegado: boolean;
  rielClinicaPlegado: boolean;
  tiraAbierta: boolean;
  hoyAbierto: boolean;
  capturaAbierta: boolean;
  gateOk: boolean;
  soapEdit: Record<string, unknown>;
  menuAbierto: unknown;
}

export interface ToastOpts {
  detalle?: string;
  tono?: string;
  duracion?: number;
  accion?: { texto: string; act: string; arg: string } | null;
}

export interface AppTuvetia {
  DB: DbApp;
  UI: UiApp;
  VIVO: VivoApp;
  CHAT: {
    hiloId: string | null;
    pacienteId: string | null;
    mensajes: unknown[];
    estado: string;
    entrada: string;
    adjuntos: string[];
    dockAbierto: boolean;
    dockMensajes: unknown[];
    dockEstado: string;
  };
  CARRITO: {
    reset(ownerId: string | null): void;
    agregar(itemId: string): void;
    pacienteId: string | null;
    consultaId: string | null;
    lineas: unknown[];
  };
  CAL: { vista: string; fecha: Date; mes: string; vets: unknown; q: string; filtro: string };
  COM: {
    tel: string | null;
    borrador: string;
    sugiriendo: boolean;
    accionPendiente: unknown;
    correoId: string | null;
    segmento: string;
  };
  FL: {
    pacientesQ: string;
    pacientesEspecie: string;
    consultasQ: string;
    consultasNota: string;
    consultasOrden: string;
    titularesQ: string;
    ventasQ: string;
    ventasEstado: string;
    ventasTipo: string;
    ventasTodo: boolean;
    ventasPag: number;
    ventasPorPag: number;
    invQ: string;
    invCat: string;
    invTipo: string;
  };
  ACC: {
    email: string;
    enviado: boolean;
    codigo: string;
    usarCodigo: boolean;
    error: unknown;
    paseCodigo: unknown;
    errorPuerta: unknown;
  };
  OV: { pila: unknown[] };
  ACTIONS: Record<string, (arg?: string, e?: Event, el?: Element | null) => void>;
  GUION_POR_DEFECTO: string[];
  nav(ruta: string, reemplazar?: boolean): void;
  render(): void;
  toast(texto: string, opts?: ToastOpts): string;
  seedDemo(): void;
  reseed(): void;
  resetWZ(): void;
  cerrarTodo(): void;
  generarNotaSOAP(id: string): unknown;
  fmtCOP(centavos: number): string;
  totalDeFactura(f: unknown): number;
  renderFlotantes(): void;
}

export type VentanaApp = Window &
  typeof globalThis & {
    app: AppTuvetia;
    __RENDER_MUDO?: boolean;
    __resetAzar(): void;
  };

/* ── Tipos de la línea de tiempo ─────────────────────────────────────────────────────────── */
/** Punto relativo (0..1) del área de app. */
export interface Punto {
  x: number;
  y: number;
}
/** Un blanco: selector CSS del DOM del iframe (con filtro de texto opcional) o punto relativo.
 *  Si trae `sel` y también x/y, x/y actúan de repuesto cuando el selector no resuelve
 *  (sólo la cámara usa el repuesto; el cursor revienta, como manda §4.1). */
export interface Blanco {
  sel?: string;
  texto?: string;
  x?: number;
  y?: number;
}

export type TramoCursor =
  | { tipo: "aparece"; f: number; en: Blanco; toma: string }
  | { tipo: "viaje"; f0: number; f1: number; hasta: Blanco; toma: string }
  | { tipo: "salta"; f: number; en: Blanco; toma: string }
  | { tipo: "oculto"; f: number; toma: string };

export interface Clic {
  f: number;
  /** Para el active-sim; si al aplicarse la acción el elemento ya no existe, se omite. */
  sobre?: { sel: string; texto?: string };
}

export interface Hover {
  f0: number;
  f1: number;
  sel: string;
  texto?: string;
  /** Interpolar el levantón (translateY + sombra) además de la clase .hover-sim. */
  lift?: boolean;
}

export interface KeyframeCamara {
  f: number;
  s: number;
  foco: Blanco;
}

export interface TextoPantalla {
  f0: number;
  f1: number;
  rotulo: string;
  frase: string;
}

export interface CtxReplay {
  idConsulta: string | null;
  idFactura: string | null;
  ruta: string;
}

export interface ToastGuion {
  f0: number;
  f1: number;
  crear(app: AppTuvetia, ctx: CtxReplay): { texto: string; opts?: ToastOpts };
}

export interface Scroll {
  f0: number;
  f1: number;
  desde: number | Blanco;
  hasta: number | Blanco;
}

export interface AperturaOverlay {
  f: number;
  tipo: "dialogo" | "cajon";
}

export interface AnilloAtencion {
  f0: number;
  f1: number;
  sel: string;
  texto?: string;
}

/** Plantilla de texto a pantalla completa: la ventana se desvanece y la frase se
 *  escribe en tiempo real (máquina de escribir con caret menta). */
export interface Interludio {
  f0: number;
  f1: number;
  rotulo: string;
  frase: string;
  /** "rojo" pinta la frase y el caret en TV.danger (el aviso de la guarda de alergias). */
  tono?: "rojo";
  /** el logo horizontal en vez del rótulo (el gancho de apertura) */
  logo?: boolean;
  /** "seco": entra y sale sin fundido, la ventana corta a golpe (el cierre por pares) */
  corte?: "seco";
}

/** Burbuja explicativa que hace pop sobre la interfaz, anclada a un elemento
 *  (resuelto por frame, como el cursor) y arrastrada por la cámara. */
export interface Burbuja {
  f0: number;
  f1: number;
  ancla: Blanco;
  /** desplazamiento en px del borde sup-izq de la burbuja respecto del centro del ancla */
  dx: number;
  dy: number;
  texto: string;
}

/* ── Selectores con nombre (verificados contra la maqueta) ───────────────────────────────── */
const SEL = {
  loginDemo: { sel: '[data-act="login-demo"]' },
  statCitas7d: { sel: "button.stat", texto: "Citas (próx. 7 días)" },
  statFacturado: { sel: "button.stat", texto: "Facturado este mes" },
  statNotas: { sel: "button.stat", texto: "Notas por revisar" },
  donaVentas: { sel: ".bloque", texto: "Ventas del mes" },
  navCalendario: { sel: '.nav-item[data-arg="/dashboard/calendario"]' },
  navTablero: { sel: '.nav-item[data-arg="/dashboard/tablero"]' },
  navPacientes: { sel: '.nav-item[data-arg="/dashboard/patients"]' },
  navComunicaciones: { sel: '.nav-item[data-arg="/dashboard/comunicaciones"]' },
  vistaSemana: { sel: '[data-act="cal-vista"][data-arg="Semana"]' },
  vistaDia: { sel: '[data-act="cal-vista"][data-arg="Día"]' },
  citaLuna: { sel: "button.ev", texto: "Control de dermatitis" },
  filaLuna: { sel: "tr.cliqueable", texto: "Luna" },
  /* La 2ª de la historia: la más reciente de las pasadas (la 1ª es la consulta en curso).
     Con nota aprobada, el summary muestra el análisis, no el motivo — por eso es posicional. */
  consultaPasada: { sel: "details.hist-consulta:nth-of-type(2) summary" },
  abrirConsultaActual: { sel: '.hist-consulta button[data-act="ir"]' },
  historiaConsultas: { sel: ".hist-consulta" },
  notch: { sel: ".notch", x: 0.5, y: 0.11 },
  notchPanel: { sel: ".notch-panel", x: 0.5, y: 0.3 },
  btnNuevaConsulta: { sel: '.btn.btn-barra[data-act="nueva-consulta"]' },
  selPaciente: { sel: "#cpp" },
  campoMotivo: { sel: "#cmm" },
  checkGrabar: { sel: '#form-cons input[name="grabar"]' },
  btnIniciarConsulta: { sel: 'button[form="form-cons"]' },
  consentir: { sel: '[data-act="consentir"]' },
  tabSugerencias: { sel: '[data-act="cockpit-tab"][data-arg="sugerencias"]' },
  terminarGrabacion: { sel: '.cockpit button[data-act="terminar-grabacion"]' },
  gate: { sel: 'input[data-act="gate"]' },
  aprobarNota: { sel: 'button[data-act="aprobar-nota"]' },
  informe: { sel: 'button[data-act="informe"]' },
  enviarWa: { sel: 'button[data-act="enviar-informe"][data-arg$=":wa"]' },
  facturarRecetado: { sel: 'button[data-act="facturar-recetado"]' },
  lineaServicio: { sel: ".linea-carrito", texto: "Consulta general" },
  lineaAntiemetico: { sel: ".linea-carrito", texto: "Maropitant" },
  totalesFactura: { sel: "dl.totales" },
  guardarBorrador: { sel: 'button[data-act="guardar-borrador"]' },
  emitirBorrador: { sel: 'button[data-act="emitir-borrador"]' },
  enviarCliente: { sel: 'button[data-act="enviar-factura"]' },
  cajon: { sel: ".cajon", x: 0.86, y: 0.5 },
  dialogo: { sel: ".dialogo", x: 0.5, y: 0.5 },
  transcripcionVivo: { x: 0.5, y: 0.4 },
  bloqueSugerencias: { sel: ".vivo-bloque", x: 0.5, y: 0.42 },
  markPenicilina: { sel: "mark", x: 0.5, y: 0.55 },
  notaClinica: { sel: "section.card", texto: "Nota clínica" },
  seccionReferencias: { sel: "section.card.pad", texto: "Referencias citadas" },
} as const;

/* Puntos fijos para cuando la pantalla cambió bajo el cursor (§4.1: nunca cachear posiciones;
   si el selector murió con el clic, el reposo es un punto declarado acá y afinado con stills). */
const PT = {
  loginBoton: { x: 0.5, y: 0.659 },
  cajonPie: { x: 0.858, y: 0.868 },
  consentirBoton: { x: 0.617, y: 0.66 },
  filaLuna: { x: 0.5, y: 0.47 },
  abrirConsulta: { x: 0.42, y: 0.6 },
  terminarBoton: { x: 0.77, y: 0.115 },
  dialogoPie: { x: 0.64, y: 0.665 },
  facturarBoton: { x: 0.79, y: 0.5 },
  guardarBoton: { x: 0.72, y: 0.86 },
  emitirBorradorPos: { x: 0.76, y: 0.16 },
} as const;

/* ── El arranque (pasada 6): gancho sobre nieve, la ventana entra debajo, sin login ──────── */
export const INTRO = {
  /** la ventana de la app empieza a entrar (fade + escala), bajo el gancho */
  ventanaEntra: 50,
  /** la ventana quedó quieta */
  ventanaLista: 62,
} as const;

/* ── Cursor: tramos en orden cronológico ─────────────────────────────────────────────────── */
export const CURSOR_TRAMOS: TramoCursor[] = [
  /* Pasada 6: sin login — la ventana entra ya en el tablero, bajo el gancho. */
  { tipo: "aparece", f: 60, en: { x: 0.55, y: 0.62 }, toma: "1.2 tablero" },
  { tipo: "viaje", f0: 66, f1: 86, hasta: SEL.statCitas7d, toma: "1.2 pastilla citas" },
  { tipo: "viaje", f0: 94, f1: 112, hasta: SEL.statFacturado, toma: "1.2 pastilla facturado" },
  { tipo: "viaje", f0: 120, f1: 136, hasta: SEL.statNotas, toma: "1.2 pastilla notas" },
  { tipo: "viaje", f0: 144, f1: 161, hasta: SEL.donaVentas, toma: "1.2 dona de ventas" },
  { tipo: "viaje", f0: 171, f1: 188, hasta: SEL.navCalendario, toma: "1.3 nav agenda" },
  /* 1.3 · Las tres vistas: llega en Mes, pasa por Semana y aterriza en Día. */
  { tipo: "viaje", f0: 296, f1: 312, hasta: SEL.vistaSemana, toma: "1.3 boton vista semana" },
  { tipo: "viaje", f0: 330, f1: 346, hasta: SEL.vistaDia, toma: "1.3 boton vista dia" },
  { tipo: "viaje", f0: 364, f1: 392, hasta: SEL.citaLuna, toma: "1.3 cita de Luna" },
  { tipo: "viaje", f0: 425, f1: 450, hasta: SEL.btnNuevaConsulta, toma: "2.1 iniciar consulta" },
  { tipo: "viaje", f0: 470, f1: 482, hasta: SEL.selPaciente, toma: "2.1 select paciente" },
  { tipo: "viaje", f0: 496, f1: 508, hasta: SEL.campoMotivo, toma: "2.1 campo motivo" },
  { tipo: "viaje", f0: 560, f1: 572, hasta: SEL.checkGrabar, toma: "2.1 check grabar" },
  { tipo: "viaje", f0: 574, f1: 588, hasta: SEL.btnIniciarConsulta, toma: "2.1 boton iniciar" },
  { tipo: "salta", f: 592, en: PT.cajonPie, toma: "2.1→2.2 cajon cerrado" },
  { tipo: "viaje", f0: 640, f1: 678, hasta: SEL.consentir, toma: "2.2 consentir" },
  { tipo: "salta", f: 690, en: PT.consentirBoton, toma: "2.2→2.3 dialogo cerrado" },
  { tipo: "oculto", f: 696, toma: "2.3 interludio + panel del notch" },
  /* 2.3 · Tras el interludio y el zoom al panel, la grabación sigue de fondo y el vet
     usa el CRM: Pacientes → ficha de Luna → historia → abrir la consulta en curso. */
  { tipo: "aparece", f: 872, en: { x: 0.42, y: 0.4 }, toma: "2.3 de vuelta al CRM" },
  { tipo: "viaje", f0: 874, f1: 892, hasta: SEL.navPacientes, toma: "2.3 nav pacientes" },
  { tipo: "viaje", f0: 904, f1: 920, hasta: SEL.filaLuna, toma: "2.3 fila de Luna" },
  { tipo: "salta", f: 926, en: PT.filaLuna, toma: "2.3 ficha de Luna" },
  { tipo: "viaje", f0: 936, f1: 948, hasta: SEL.consultaPasada, toma: "2.3 consulta pasada" },
  { tipo: "viaje", f0: 958, f1: 972, hasta: SEL.abrirConsultaActual, toma: "2.3 abrir la consulta" },
  { tipo: "salta", f: 978, en: PT.abrirConsulta, toma: "2.3→2.4 cockpit abierto" },
  { tipo: "viaje", f0: 1026, f1: 1038, hasta: SEL.tabSugerencias, toma: "2.4 tab sugerencias" },
  { tipo: "viaje", f0: 1078, f1: 1090, hasta: SEL.terminarGrabacion, toma: "2.5 acabar" },
  { tipo: "salta", f: 1094, en: PT.terminarBoton, toma: "2.5 cerrando" },
  { tipo: "oculto", f: 1098, toma: "2.5 cerrando" },
  { tipo: "aparece", f: 1235, en: { x: 0.7, y: 0.5 }, toma: "2.6 nota bloqueada" },
  { tipo: "viaje", f0: 1436, f1: 1445, hasta: SEL.gate, toma: "2.7 gate" },
  { tipo: "viaje", f0: 1460, f1: 1485, hasta: SEL.aprobarNota, toma: "2.7 aprobar" },
  { tipo: "oculto", f: 1540, toma: "2.7 fin" },
  { tipo: "aparece", f: 1565, en: { x: 0.6, y: 0.45 }, toma: "3.1 informe" },
  { tipo: "viaje", f0: 1568, f1: 1588, hasta: SEL.informe, toma: "3.1 boton informe" },
  { tipo: "viaje", f0: 1660, f1: 1672, hasta: SEL.enviarWa, toma: "3.1 enviar por whatsapp" },
  { tipo: "salta", f: 1678, en: PT.dialogoPie, toma: "3.1→3.2 dialogo cerrado" },
  { tipo: "viaje", f0: 1730, f1: 1755, hasta: SEL.facturarRecetado, toma: "3.2 facturar" },
  { tipo: "salta", f: 1762, en: PT.facturarBoton, toma: "3.2 carrito" },
  { tipo: "viaje", f0: 1780, f1: 1804, hasta: SEL.lineaServicio, toma: "3.2 linea servicio" },
  { tipo: "viaje", f0: 1806, f1: 1830, hasta: SEL.lineaAntiemetico, toma: "3.2 linea antiemetico" },
  { tipo: "viaje", f0: 1832, f1: 1852, hasta: SEL.totalesFactura, toma: "3.2 totales" },
  /* 3.2 · Aprobación explícita: guardar borrador → Emitir (aprobar) → Enviar al cliente. */
  { tipo: "viaje", f0: 1858, f1: 1876, hasta: SEL.guardarBorrador, toma: "3.2 guardar borrador" },
  { tipo: "salta", f: 1882, en: PT.guardarBoton, toma: "3.2 borrador guardado" },
  { tipo: "viaje", f0: 1890, f1: 1908, hasta: SEL.emitirBorrador, toma: "3.2 aprobar y emitir" },
  { tipo: "salta", f: 1914, en: PT.emitirBorradorPos, toma: "3.2 factura emitida" },
  { tipo: "viaje", f0: 1922, f1: 1942, hasta: SEL.enviarCliente, toma: "3.2 enviar al cliente" },
  { tipo: "viaje", f0: 1956, f1: 1976, hasta: SEL.navComunicaciones, toma: "3.3 al chat del cliente" },
  { tipo: "oculto", f: 2005, toma: "3.3 fin" },
];

/* ── Clics ───────────────────────────────────────────────────────────────────────────────── */
export const CLICS: Clic[] = [
  { f: 192, sobre: SEL.navCalendario },
  { f: 318, sobre: SEL.vistaSemana },
  { f: 352, sobre: SEL.vistaDia },
  { f: 456, sobre: SEL.btnNuevaConsulta },
  { f: 486, sobre: SEL.selPaciente },
  { f: 512, sobre: SEL.campoMotivo },
  { f: 592, sobre: SEL.btnIniciarConsulta },
  { f: 690, sobre: SEL.consentir },
  { f: 896, sobre: SEL.navPacientes },
  { f: 926, sobre: SEL.filaLuna },
  { f: 978, sobre: SEL.abrirConsultaActual },
  { f: 1042, sobre: SEL.tabSugerencias },
  { f: 1094, sobre: SEL.terminarGrabacion },
  { f: 1447, sobre: SEL.gate },
  { f: 1492, sobre: SEL.aprobarNota },
  { f: 1592, sobre: SEL.informe },
  { f: 1678, sobre: SEL.enviarWa },
  { f: 1762, sobre: SEL.facturarRecetado },
  { f: 1882, sobre: SEL.guardarBorrador },
  { f: 1914, sobre: SEL.emitirBorrador },
  { f: 1948, sobre: SEL.enviarCliente },
  { f: 1982, sobre: SEL.navComunicaciones },
];

/* ── Hovers simulados (§4.2). lift sólo donde la app tiene :hover que levanta ────────────── */
export const HOVERS: Hover[] = [
  { f0: 66, f1: 94, sel: "button.stat", texto: "Citas (próx. 7 días)", lift: true },
  { f0: 94, f1: 120, sel: "button.stat", texto: "Facturado este mes", lift: true },
  { f0: 120, f1: 144, sel: "button.stat", texto: "Notas por revisar", lift: true },
  { f0: 144, f1: 171, sel: ".bloque", texto: "Ventas del mes" },
  { f0: 188, f1: 192, sel: '.nav-item[data-arg="/dashboard/calendario"]' },
  { f0: 312, f1: 318, sel: '[data-act="cal-vista"][data-arg="Semana"]' },
  { f0: 346, f1: 352, sel: '[data-act="cal-vista"][data-arg="Día"]' },
  { f0: 392, f1: 420, sel: "button.ev", texto: "Control de dermatitis" },
  { f0: 450, f1: 456, sel: '.btn.btn-barra[data-act="nueva-consulta"]' },
  { f0: 678, f1: 690, sel: '[data-act="consentir"]' },
  { f0: 892, f1: 896, sel: '.nav-item[data-arg="/dashboard/patients"]' },
  { f0: 920, f1: 926, sel: "tr.cliqueable", texto: "Luna" },
  { f0: 948, f1: 958, sel: "details.hist-consulta:nth-of-type(2) summary" },
  { f0: 972, f1: 978, sel: '.hist-consulta button[data-act="ir"]' },
  { f0: 1038, f1: 1042, sel: '[data-act="cockpit-tab"][data-arg="sugerencias"]' },
  { f0: 1090, f1: 1094, sel: '.cockpit button[data-act="terminar-grabacion"]' },
  { f0: 1445, f1: 1447, sel: "input[data-act='gate']" },
  { f0: 1485, f1: 1492, sel: "button[data-act='aprobar-nota']" },
  { f0: 1588, f1: 1592, sel: "button[data-act='informe']" },
  { f0: 1672, f1: 1678, sel: "button[data-act='enviar-informe'][data-arg$=':wa']" },
  { f0: 1755, f1: 1762, sel: "button[data-act='facturar-recetado']" },
  { f0: 1780, f1: 1806, sel: ".linea-carrito", texto: "Consulta general" },
  { f0: 1806, f1: 1832, sel: ".linea-carrito", texto: "Maropitant" },
  { f0: 1876, f1: 1882, sel: "button[data-act='guardar-borrador']" },
  { f0: 1908, f1: 1914, sel: "button[data-act='emitir-borrador']" },
  { f0: 1942, f1: 1948, sel: "button[data-act='enviar-factura']" },
  { f0: 1976, f1: 1982, sel: '.nav-item[data-arg="/dashboard/comunicaciones"]' },
];

/* ── Cámara (§4.3): keyframes {f, s, foco}; entre keyframes, spring damping 200 ──────────── */
export const CAMARA: KeyframeCamara[] = [
  { f: 0, s: 1, foco: { x: 0.5, y: 0.5 } },
  { f: 62, s: 1, foco: { x: 0.5, y: 0.45 } },
  { f: 171, s: 1.04, foco: { x: 0.5, y: 0.45 } },
  { f: 192, s: 1, foco: { x: 0.5, y: 0.5 } },
  { f: 364, s: 1, foco: SEL.citaLuna },
  { f: 398, s: 1.22, foco: SEL.citaLuna },
  { f: 424, s: 1.22, foco: SEL.citaLuna },
  { f: 445, s: 1, foco: { x: 0.5, y: 0.5 } },
  { f: 460, s: 1, foco: SEL.cajon },
  { f: 490, s: 1.28, foco: SEL.cajon },
  { f: 600, s: 1.28, foco: SEL.cajon },
  { f: 615, s: 1.15, foco: SEL.dialogo },
  { f: 640, s: 1.3, foco: SEL.dialogo },
  { f: 690, s: 1.3, foco: SEL.dialogo },
  /* 2.3 · El interludio del modo fantasma tapa el salto; al volver, la cámara ya está
     sobre el panel del notch con la transcripción cayendo en vivo (≥3 s). */
  { f: 742, s: 1.24, foco: SEL.notchPanel },
  { f: 858, s: 1.24, foco: SEL.notchPanel },
  { f: 878, s: 1, foco: { x: 0.5, y: 0.5 } },
  { f: 970, s: 1, foco: { x: 0.5, y: 0.5 } },
  { f: 1012, s: 1.22, foco: SEL.transcripcionVivo },
  { f: 1042, s: 1.22, foco: SEL.transcripcionVivo },
  { f: 1070, s: 1.28, foco: SEL.bloqueSugerencias },
  { f: 1080, s: 1.28, foco: SEL.bloqueSugerencias },
  { f: 1092, s: 1, foco: { x: 0.5, y: 0.5 } },
  /* 2.6 · Pasada 6: la nota SOAP se escribe sola ante cámara (ESCRITURA_SOAP); el push
     entra con el scroll a la nota y se queda hasta la guarda roja. */
  { f: 1172, s: 1, foco: { x: 0.5, y: 0.5 } },
  { f: 1196, s: 1.18, foco: { x: 0.5, y: 0.48 } },
  { f: 1389, s: 1.18, foco: { x: 0.5, y: 0.48 } },
  { f: 1435, s: 1, foco: { x: 0.5, y: 0.5 } },
  { f: 1505, s: 1, foco: SEL.markPenicilina },
  { f: 1540, s: 1.4, foco: SEL.markPenicilina },
  { f: 1560, s: 1.4, foco: SEL.markPenicilina },
  { f: 1580, s: 1, foco: { x: 0.5, y: 0.5 } },
  { f: 1596, s: 1, foco: SEL.dialogo },
  { f: 1620, s: 1.2, foco: SEL.dialogo },
  { f: 1680, s: 1.2, foco: SEL.dialogo },
  { f: 1700, s: 1, foco: { x: 0.5, y: 0.5 } },
  /* 3.2 · Facturación sin zoom que tape botones: apenas un push de 1.02 y todo visible
     (el paso aprobar → enviar al cliente queda siempre en cuadro). */
  { f: 1770, s: 1, foco: { x: 0.5, y: 0.5 } },
  { f: 1810, s: 1.02, foco: { x: 0.5, y: 0.45 } },
  { f: 1876, s: 1.02, foco: { x: 0.5, y: 0.45 } },
  { f: 1894, s: 1, foco: { x: 0.5, y: 0.5 } },
  /* 3.3 · El chat de Mariana: push a las dos últimas burbujas (resumen + factura PDF). */
  { f: 1990, s: 1, foco: { x: 0.62, y: 0.72 } },
  { f: 2030, s: 1.16, foco: { x: 0.62, y: 0.72 } },
  { f: 2040, s: 1.16, foco: { x: 0.62, y: 0.72 } },
  /* 4.0 · El cierre por pares: pantalla de texto → pantalla de la app, cinco veces,
     con ángulos alternados (entra, sale, entra, sale). Los saltos van bajo interludios. */
  { f: 2085, s: 1, foco: { x: 0.5, y: 0.5 } },
  { f: 2115, s: 1.05, foco: { x: 0.5, y: 0.5 } },
  { f: 2139, s: 1, foco: { x: 0.5, y: 0.32 } },
  { f: 2169, s: 1.07, foco: { x: 0.5, y: 0.32 } },
  { f: 2193, s: 1.07, foco: { x: 0.42, y: 0.5 } },
  { f: 2223, s: 1, foco: { x: 0.42, y: 0.5 } },
  { f: 2247, s: 1, foco: { x: 0.62, y: 0.68 } },
  { f: 2277, s: 1.07, foco: { x: 0.62, y: 0.68 } },
  { f: 2301, s: 1.07, foco: { x: 0.5, y: 0.45 } },
  { f: 2331, s: 1, foco: { x: 0.5, y: 0.45 } },
];

/* ── Textos en pantalla (§4.5) ───────────────────────────────────────────────────────────── */
export const TEXTOS: TextoPantalla[] = [
  /* Pasada 5: «Toda tu clínica…» pasó a interludio propio y «Revisa tu clínica
     mientras tanto» se eliminó. */
  /* Pasada 6: el «antes» cae justo donde ocurre la magia — la nota escribiéndose sola. */
  { f0: 1178, f1: 1236, rotulo: "ATHOS REDACTA", frase: "Antes, la ficha la escribías tú." },
  { f0: 1240, f1: 1388, rotulo: "LA NOTA", frase: "La nota está lista. Pero no entra sin ti." },
  { f0: 1780, f1: 1935, rotulo: "LA CAJA", frase: "Manda la factura apenas termina la consulta." },
  {
    f0: 1992,
    f1: 2055,
    rotulo: "COMUNICACIONES",
    frase: "Todo tu WhatsApp en un lugar — Athos lo hace por ti.",
  },
];

/** Cortes con fundido por nieve (±3 frames). El cierre por pares ya no los necesita:
 *  cada salto de pantalla queda tapado por su interludio. */
export const CORTES_RAFAGA: readonly number[] = [];

/* ── Toasts (§4.4): los decide esta tabla, no la app ─────────────────────────────────────── */
export const TOASTS: ToastGuion[] = [
  {
    f0: 594,
    f1: 700,
    crear: () => ({ texto: "Consulta iniciada" }),
  },
  {
    f0: 1232,
    f1: 1352,
    crear: (_app, ctx) => ({
      texto: "Consulta transcrita — Athos redactó la nota",
      opts: {
        detalle: "Revísala y apruébala; nada entra a la historia sin tu aprobación.",
        accion: { texto: "Abrir", act: "ir", arg: `/dashboard/consultas/${ctx.idConsulta ?? ""}` },
      },
    }),
  },
  {
    f0: 1492,
    f1: 1618,
    crear: () => ({
      texto: "Nota aprobada y añadida a la historia clínica",
      opts: { detalle: "Ya cuenta en el tablero y baja el contador de borradores." },
    }),
  },
  {
    f0: 1678,
    f1: 1804,
    crear: () => ({
      texto: "Informe enviado por WhatsApp",
      opts: { accion: { texto: "Ver", act: "ir", arg: "/dashboard/comunicaciones" } },
    }),
  },
  {
    f0: 1914,
    f1: 2014,
    crear: (app) => {
      const f = app.DB.facturas[0];
      return {
        texto: `${f.numero ?? "Factura"} emitida por ${app.fmtCOP(app.totalDeFactura(f))}`,
        opts: { detalle: "Ya se ve en el tablero, en la dona de ventas y en la cartera." },
      };
    },
  },
  {
    /* Muere antes del push al chat: no puede tapar la burbuja de la factura. */
    f0: 1948,
    f1: 2005,
    crear: () => ({
      texto: "Factura enviada al cliente",
      opts: { detalle: "Le llegó a Mariana por WhatsApp y quedó registrada en la conversación." },
    }),
  },
];

/* ── Scroll del contenedor .cuerpo (§4.6) ────────────────────────────────────────────────── */
export const SCROLLS: Scroll[] = [
  /* 1.2: la dona de ventas vive bajo el pliegue del tablero; el scroll la trae antes
     de que el cursor la señale (y con el clic de f276 la pantalla cambia). */
  { f0: 138, f1: 158, desde: 0, hasta: SEL.donaVentas },
  /* 2.3: en la ficha de Luna, bajar a la historia de consultas mientras el notch graba. */
  { f0: 930, f1: 952, desde: 0, hasta: SEL.historiaConsultas },
  /* 2.6: el scroll se queda en la nota SOAP (antes seguía hasta las referencias y la
     nota quedaba fuera de foco); la vuelta arriba pasa bajo el interludio rojo. */
  { f0: 1176, f1: 1196, desde: 0, hasta: SEL.notaClinica },
  { f0: 1395, f1: 1420, desde: SEL.notaClinica, hasta: 0 },
  { f0: 1500, f1: 1535, desde: 0, hasta: SEL.markPenicilina },
  /* 3.1→3.2: en vez de volver arriba, el scroll baja a la fila de acciones — el diálogo
     del informe se abre sobre ella y, al cerrarse, «Facturar lo recetado» ya está en
     cuadro (antes el clic ocurría bajo el pliegue y el corte se sentía abrupto). */
  { f0: 1560, f1: 1580, desde: SEL.markPenicilina, hasta: SEL.facturarRecetado },
  /* 3.2: el pie del carrito (totales + Guardar borrador/Emitir) vive bajo el pliegue con
     las líneas expandidas — ESTO era lo que dejaba el botón de aprobar fuera de cámara. */
  { f0: 1830, f1: 1854, desde: 0, hasta: SEL.guardarBorrador },
];

/* ── Aperturas de overlay: 10 frames de scale .96→1 + opacidad (§4.6) ────────────────────── */
export const APERTURAS_OVERLAY: AperturaOverlay[] = [
  { f: 456, tipo: "cajon" },
  { f: 592, tipo: "dialogo" },
  { f: 1592, tipo: "dialogo" },
];

/* ── Anillo de atención de la toma 3.3 ───────────────────────────────────────────────────── */
export const ANILLOS_ATENCION: AnilloAtencion[] = [
  { f0: 2087, f1: 2114, sel: "button.stat", texto: "Facturado este mes" },
  { f0: 2087, f1: 2114, sel: "button.stat", texto: "Notas por revisar" },
];

/* ── Interludios: plantillas de texto a pantalla completa, escritas en tiempo real ───────── */
export const INTERLUDIOS: Interludio[] = [
  /* Pasada 6 · el gancho: problema en el segundo 0, logo como sello, UI antes de los 2 s. */
  {
    f0: 0,
    f1: 58,
    logo: true,
    rotulo: "TUVETIA",
    frase: "¿Cuánto de tu consulta se te va escribiendo la ficha?",
  },
  /* Pasada 5/6: la promesa en su propia pantalla, como puente del tablero a la agenda. */
  { f0: 204, f1: 256, rotulo: "LA CLÍNICA", frase: "Toda tu clínica en una sola pantalla." },
  /* Cambio 1 (pasada 4): el modo fantasma se anuncia ANTES de mostrar la transcripción. */
  { f0: 699, f1: 753, rotulo: "LA CONSULTA", frase: "Athos escucha mientras tú consultas." },
  /* Cambio 5: el aviso rojo de la guarda, antes de volver a la alergia severa. */
  { f0: 1389, f1: 1433, rotulo: "LA GUARDA", frase: "Athos te evita errores graves.", tono: "rojo" },
  /* Pasada 6 · el cierre por pares a corte seco: cada pantalla queda 30 frames enteros
     en cámara (antes, 27 menos 16 de fundidos = 0,4 s). El primero es el beat de resultado. */
  {
    f0: 2040,
    f1: 2085,
    rotulo: "CONSULTA TERMINADA",
    frase: "Ficha, informe y factura: hechos. Todo se conecta solo.",
    corte: "seco",
  },
  { f0: 2115, f1: 2139, rotulo: "VENTAS", frase: "La caja, al día.", corte: "seco" },
  { f0: 2169, f1: 2193, rotulo: "INVENTARIO", frase: "El stock se descuenta solo.", corte: "seco" },
  { f0: 2223, f1: 2247, rotulo: "COMUNICACIONES", frase: "El WhatsApp, ordenado.", corte: "seco" },
  { f0: 2277, f1: 2301, rotulo: "PACIENTES", frase: "La historia de cada paciente.", corte: "seco" },
];

/* ── Burbujas: explicaciones que hacen pop sobre la interfaz ─────────────────────────────── */
export const BURBUJAS: Burbuja[] = [
  {
    f0: 96,
    f1: 146,
    ancla: { sel: "button.stat", texto: "Notas por revisar" },
    dx: -150,
    dy: 66,
    texto: "Los borradores de Athos esperan tu firma",
  },
  {
    f0: 300,
    f1: 410,
    ancla: { sel: '[data-act="cal-vista"][data-arg="Mes"]', x: 0.53, y: 0.23 },
    dx: -60,
    dy: 36,
    texto: "Tus citas del día, de la semana y del mes",
  },
  {
    f0: 520,
    f1: 585,
    ancla: { sel: "#cmm", x: 0.84, y: 0.42 },
    dx: -640,
    dy: -20,
    texto: "Con el motivo alcanza — Athos hace el resto",
  },
  {
    f0: 984,
    f1: 1026,
    ancla: { x: 0.5, y: 0.28 },
    dx: -150,
    dy: 70,
    texto: "Todo lo que se habló, ya transcrito",
  },
  {
    f0: 1778,
    f1: 1852,
    ancla: { sel: ".linea-carrito", texto: "Maropitant", x: 0.5, y: 0.5 },
    dx: -130,
    dy: 54,
    texto: "Lo recetado ya entró a la cuenta",
  },
];

/* ── La grabación (toma 2.3–2.5): cronología del vivo ────────────────────────────────────── */
export const GRABACION = {
  /** consentir → fase grabando */
  inicio: 690,
  /** el panel del notch se abre bajo el interludio del modo fantasma */
  panelAbre: 744,
  /** el panel se cierra y el vet sigue navegando el CRM */
  panelCierra: 864,
  /** primera palabra de la transcripción (≥3 s de texto cayendo en cámara) */
  inicioTexto: 756,
  /** frames por palabra (≈12 palabras/s; ver NOTAS.md: a 5 palabras/s el guion no cabe) */
  framesPorPalabra: 2.5,
  /** pausa entre líneas, en frames */
  pausaLineas: 6,
  /** VIVO.sugerencias + alerta ámbar */
  sugerencias: 920,
  /** clic en «Acabar y organizar con Athos» → fase subiendo */
  terminar: 1094,
  /** fase transcribiendo */
  finSubiendo: 1128,
  /** cierre: transcripción guardada, nota generada, fase terminada */
  finTranscribiendo: 1170,
  /** clic en la pestaña Sugerencias */
  tabSugerencias: 1042,
} as const;

export const NOTAS_VIVO = "- Abdomen depresible, sin dolor a la palpación profunda.";
export const SUGERENCIAS_VIVO = [
  "- Si el vómito persiste 24 h, considerar ecografía para descartar cuerpo extraño.",
  "- Registrar el antiemético en la ficha para que quede en la historia.",
  "- Evitar Penicilina y su clase: alergia severa en la ficha.",
].join("\n");

export const MOTIVO_CONSULTA = "Vómito y decaimiento";
/** Tipeo del motivo: 1 carácter cada 2 frames desde f514. */
export const TIPEO = { f0: 514, cadencia: 2 } as const;

/* ── Microrrótulo de honestidad (§3.5) ───────────────────────────────────────────────────── */
export const MICRORROTULO = { f0: 0, f1: 2331, texto: "DEMO · DATOS DE EJEMPLO" } as const;

/** Desde acá el chat de Mariana (payoff del envío y plano de la ráfaga) queda
 *  scrolleado al último mensaje, y la burbuja de la factura lleva su tarjeta PDF. */
export const CIERRE_CHAT_F0 = 1982;

/** Fin de la ventana de la app: se desvanece 10 frames desde acá (acto 4.2). */
export const FIN_VENTANA = 2331;

/** Pasada 6: la nota SOAP se escribe sola ante cámara, campo por campo (S → O → A → P),
 *  a hipervelocidad. Los campos arrancan vacíos al terminar la transcripción. */
export const ESCRITURA_SOAP = { f0: 1182, f1: 1234, sel: 'textarea[data-act="soap"]' } as const;
