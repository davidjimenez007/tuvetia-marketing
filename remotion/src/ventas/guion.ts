/**
 * DemoVentas · el guion como datos (prompts/remotion/prompts/demo-ventas.md §2–§7 sobre la
 * plantilla): frames de los actos, textos literales, encuadres, y las tablas de cámara, cursor,
 * hover, scroll y toasts. Cero DOM acá: todo lo que resuelve selectores vive en Cursor/Camara.
 *
 * Ritmo: 120 BPM → 1 beat = 15 frames, 1 compás = 60. Cortes en múltiplos de 15, actos en 60.
 */
import type { Vista } from "../demo/Camara";
import type { Blanco, Clic, Hover, KeyframeCamara, TramoCursor } from "../demo/guion";
import { MUSICA_FUNK } from "../explainer/audioData";
import type { Lienzo, Microrrotulo, Scroll, TextoBanda } from "../pieza/tipos";
import type { CtxVentas } from "./tipos";

export const FPS = 30;
/** El encargo dice 1440 en la cabecera del §4 y 1500 en la tabla y el §8: manda la tabla. */
export const DURACION = 1500;

/** La pieza sale sin voz. Si Luciano graba `public/voz/demo-ventas.mp3`, poner en true y agregar
 *  subtítulos quemados. El texto por acto está en NOTAS.md. */
export const CON_VOZ = false;

/** La funk (public/musica/pista-funk-120.mp3, ya a 120 BPM). Para volver a Bellini: MUSICA de
 *  src/demo/audioData.ts y 0.35. La funk suena 4,2 dB más fuerte que Bellini: 0.21 la deja al
 *  mismo nivel en la mezcla (medido en la v3 del explainer). */
export const MUSICA = MUSICA_FUNK;
export const VOL_MUSICA = 0.21;

/* ── La cadena de datos (encargo §3) ─────────────────────────────────────────────────────── */
/** El ítem protagonista: entra en la importación (fila del CSV), está en el plan de la consulta
 *  de Luna y baja de 4 a 3 al emitir. Se resuelve por nombre en DB.catalogo, nunca por id. */
export const ITEM_PROTAGONISTA = "Oclacitinib";

/** El CSV de encabezados raros, idéntico a public/app/_pruebas/catalogo-prueba-encabezados-raros.csv
 *  (scripts/verificar-maqueta.mjs lo comprueba). Incrustado para no depender de una lectura
 *  asíncrona en el render. */
export const NOMBRE_CSV = "catalogo-prueba-encabezados-raros.csv";
export const TEXTO_CSV = `Producto;Valor;Cantidad;Punto de pedido
Meloxicam 1,5 mg/mL;62.000;12;3
Gabapentina 100 mg x 30;88.000;8;3
Oclacitinib 16 mg x 20 tabl.;268.000;4;5
Collar isabelino M;24.000;15;3
Shampoo clorhexidina 250 mL;46.000;10;3
Guantes de examen (caja);32.000;20;5
"Alimento gastrointestinal, lata 400 g";9.800;24;6
Algodón hidrófilo 500 g;9.500;30;5
`;
/** La columna que el mapeo no reconoce y el vet manda a «Mínimo» en el acto 3. */
export const COLUMNA_MIN = "Punto de pedido";

export const RUTAS = {
  importar: "/dashboard/facturacion/inventario/importar",
  inventario: "/dashboard/facturacion/inventario",
  movimientos: "/dashboard/facturacion/inventario/movimientos",
  consulta: "/dashboard/consultas",
  nuevaFactura: "/dashboard/facturacion/nueva",
  factura: "/dashboard/facturacion",
} as const;

/* ── Lienzo y superficie (plantilla §3; encargo §2: sólo escritorio) ─────────────────────── */
export const ESCRITORIO = { w: 1440, h: 900 } as const;
export const LIENZO: Lienzo = { w: 1080, h: 1920, safeTop: 220, safeBottom: 250, safeX: 72 };
/** Plano general: la ventana a 0.65 con cromo, borde superior en y 700 (como el explainer). */
export const MARCO = { escala: 0.65, top: 700 } as const;

/* ── Los actos (encargo §4): cambios en múltiplos de 60 ──────────────────────────────────── */
export const ACTOS = {
  catalogo: 0,
  mapeo: 120,
  confirmar: 420,
  existencias: 600,
  consulta: 780,
  emitir: 960,
  bajo: 1080,
  rastro: 1260,
  cierre: 1380,
} as const;

/* ── Encuadres (encargo §2), medidos el 8-sep-2026 sobre la maqueta a 1440×900 ─────────────
   Medidas (CDP, `getBoundingClientRect`): barra lateral 232 px; `.cuerpo` x 232→1440, y 48→900
   (la cabecera de la app ocupa 48 px); la página de importar ya es angosta: cards en x 264→1084
   (820 px), tabla de mapeo x 286→1062 (776 px), filas de 59 px. Con esos números:
   La app pinta cada página como una columna de lectura (post-proceso: `.pagina>*{max-width}`),
   igual que su propia página de importar. El encuadre corta esa columna sin cromo, con 20 px de
   aire a cada lado (x 244→1104), y la escala a los 1080 de ancho.
   - columna (820): importación, Existencias y Movimientos. Cuerpo 15 px → 18,8 px; con push 1,4 → 26.
   - lectura (640): la consulta (el plan tiene que leerse entero) y el carrito. Cuerpo → 23,8 px.
     Vista cuadrada centrada en el cuerpo de la app: 680×680 → 1080×1080, de y 250 a y 1330. */
export const ENCUADRES = {
  columna: { vista: { x0: 244, y0: 48, w: 860, h: 852 } as Vista, escala: 1080 / 860, top: 250, anchoPagina: 820 },
  lectura: { vista: { x0: 244, y0: 134, w: 680, h: 680 } as Vista, escala: 1080 / 680, top: 250, anchoPagina: 640 },
} as const;
export type Encuadre = "general" | "columna" | "lectura";

export const encuadreEn = (f: number): Encuadre =>
  f < ACTOS.mapeo ? "general" : f >= ACTOS.consulta && f < ACTOS.bajo ? "lectura" : "columna";

const VISTA_GENERAL: Vista = { x0: 0, y0: 0, w: ESCRITORIO.w, h: ESCRITORIO.h };
export const vistaEn = (f: number): Vista => {
  const enc = encuadreEn(f);
  return enc === "general" ? VISTA_GENERAL : ENCUADRES[enc].vista;
};
/** Ancho de la columna de lectura que el post-proceso impone a la página en ese frame. */
export const anchoPaginaEn = (f: number): number => {
  const enc = encuadreEn(f);
  return enc === "general" ? ENCUADRES.columna.anchoPagina : ENCUADRES[enc].anchoPagina;
};

/* ── Textos en pantalla (encargo §4), literales ───────────────────────────────────────────── */
export const TEXTOS: TextoBanda[] = [
  /* El encargo decía «Está en una hoja de cálculo» (10 palabras): el hook en pantalla admite 8
     (skill guionista). «Planilla» es la palabra de la propia app («Desde una planilla en CSV»). */
  { f0: ACTOS.catalogo, f1: ACTOS.mapeo, rotulo: "EL CATÁLOGO", frase: "Tu catálogo ya existe. Está en una planilla." },
  { f0: ACTOS.mapeo, f1: ACTOS.confirmar, rotulo: "EL MAPEO", frase: "Tus encabezados no son los nuestros. Lo resuelve él." },
  { f0: ACTOS.confirmar, f1: ACTOS.existencias, rotulo: "TÚ CONFIRMAS", frase: "Propone el mapeo; tú lo apruebas antes de que entre nada." },
  { f0: ACTOS.existencias, f1: ACTOS.consulta, rotulo: "EXISTENCIAS", frase: "Y desde ahí el inventario ya sabe qué tienes y qué te falta." },
  { f0: ACTOS.consulta, f1: ACTOS.emitir, rotulo: "SIN BUSCAR NADA", frase: "Lo que recetaste en la consulta ya está en la factura." },
  /* El encargo deja el acto 6 sin frase: sólo el rótulo. */
  { f0: ACTOS.emitir, f1: ACTOS.bajo, rotulo: "EMITIR", frase: "" },
  { f0: ACTOS.bajo, f1: ACTOS.rastro, rotulo: "SIN TOCAR NADA", frase: "Vendiste una caja. El inventario ya lo sabe." },
  /* La frase es la del propio producto (subtítulo de Movimientos): «Cada movimiento deja rastro:
     las existencias son su saldo, no un número que alguien escribe.» El rótulo ya dice la primera
     mitad, así que la banda lleva la segunda, literal. */
  { f0: ACTOS.rastro, f1: ACTOS.cierre, rotulo: "CADA MOVIMIENTO DEJA RASTRO", frase: "Las existencias son su saldo, no un número que alguien escribe." },
];

/** Línea roja 2: se dice que es demo durante los ocho actos, hasta el cierre. */
export const MICRORROTULO: Microrrotulo = { f0: 0, f1: ACTOS.cierre, texto: "DEMO · DATOS DE EJEMPLO" };

/* ── Clics y cortes ─────────────────────────────────────────────────────────────────────────
   Cuando el botón desaparece en el mismo frame del clic (la zona al entrar el archivo, «Revisar»,
   «Importar», «Facturar»), el anillo del clic quedaba pintado sobre la pantalla nueva. Cada clic
   va 15 frames (un beat) antes del beat que cambia la pantalla: el anillo se ve sobre el botón y
   el corte llega en el beat siguiente. */
export const CLIC = {
  zona: 150,
  select: 450,
  revisar: 495,
  importar: 555,
  facturar: 915,
  emitir: 990,
} as const;
export const CORTE = {
  entraArchivo: 165,
  paso3: 510,
  importa: 570,
  carrito: 930,
  emite: 1005,
} as const;

/** Ventanas de los toasts que la app emite al importar y al emitir (el texto lo escribe la app). */
export const TOASTS = {
  importado: { f0: CORTE.importa, f1: 645 },
  emitida: { f0: CORTE.emite, f1: ACTOS.bajo },
} as const;

/* ── Selectores del DOM de la app (verificados sobre la copia) ───────────────────────────── */
export const SEL = {
  zonaSoltar: "label[data-soltar]",
  filaMapeo: (n: number): string => `.pagina.angosta table.tabla tbody tr:nth-child(${n})`,
  selectMapeo: (idx: number): string => `select[data-act="imp-mapeo"][data-arg="${idx}"]`,
  /** La columna suelta es la última del CSV: la cámara, que no conoce el contexto, la busca así. */
  selectUltimo: ".pagina.angosta table.tabla tbody tr:last-child select[data-act=\"imp-mapeo\"]",
  revisar: 'button[data-act="imp-paso"][data-arg="3"]',
  importar: 'button[data-act="imp-confirmar"]',
  toast: "#avisos .toast",
  fila: "table.tabla tbody tr",
  /** El bloque P de la nota SOAP: el .fila de la tarjeta «Nota clínica» que lleva el rótulo Plan. */
  bloquePlan: "section.card .pad-lg > .fila",
  informe: 'button[data-act="informe"]',
  facturar: 'button[data-act="facturar-recetado"]',
  lineaCarrito: ".linea-carrito",
  totales: "dl.totales",
  emitir: 'button[data-act="emitir-factura"]',
  pagina: ".pagina",
} as const;

/** Puntos fijos (relativos 0..1 del área de app de 1440×900) de repuesto para cuando el blanco
 *  deja de existir en el frame de la acción (la zona de carga al entrar el archivo, «Revisar» al
 *  pasar al paso 3, «Importar» al confirmar, «Facturar» al armar el carrito, «Emitir» al emitir).
 *
 *  MEDIDOS el 8-sep-2026 con chrome-headless-shell por CDP a 1440×900 (`getBoundingClientRect` del
 *  centro de cada blanco / 1440 y / 900), reproduciendo el estado del replay en cada acto: la
 *  importación con la columna de 820 (la página ya es angosta); la consulta y el carrito con la
 *  columna de 640 que impone el post-proceso y con el scroll que hace la pieza (botón «Facturar»
 *  centrado en `.cuerpo` → scrollTop 1095; «Emitir» centrado → scrollTop 866, el máximo que deja el
 *  relleno inferior, por eso queda en y 0.605 y no en 0.5). Si cambia la maqueta o el ancho de la
 *  columna, volver a medir: son repuestos, pero el cursor los usa en el frame del corte. */
export const PT = {
  centro: { x: 0.5, y: 0.5 },
  /** Donde aparece el puntero en el acto 1 (sobre la nieve de la app, bajo la zona de carga). */
  arranque: { x: 0.62, y: 0.68 },
  zonaSoltar: { x: 0.468, y: 0.398 },
  celdaMin: { x: 0.462, y: 0.655 },
  selectMin: { x: 0.638, y: 0.655 },
  revisar: { x: 0.384, y: 0.726 },
  importar: { x: 0.381, y: 0.841 },
  /** El toast de importación (316×65) alineado al borde de la columna: right 354, bottom 18. */
  toast: { x: 0.647, y: 0.944 },
  informe: { x: 0.476, y: 0.478 },
  facturar: { x: 0.258, y: 0.527 },
  totales: { x: 0.505, y: 0.486 },
  emitir: { x: 0.586, y: 0.605 },
} as const;

/* ── Blancos ─────────────────────────────────────────────────────────────────────────────── */
const ZONA: Blanco = { sel: SEL.zonaSoltar, x: PT.zonaSoltar.x, y: PT.zonaSoltar.y };
const FILA_MAPEO_2: Blanco = { sel: SEL.filaMapeo(2), x: 0.468, y: 0.49 };
/** La fila de la columna suelta (la última del CSV), para la cámara. */
const FILA_ULTIMA: Blanco = { sel: ".pagina.angosta table.tabla tbody tr:last-child", x: 0.468, y: PT.selectMin.y };
const REVISAR: Blanco = { sel: SEL.revisar, x: PT.revisar.x, y: PT.revisar.y };
const IMPORTAR: Blanco = { sel: SEL.importar, x: PT.importar.x, y: PT.importar.y };
const TOAST: Blanco = { sel: SEL.toast, x: PT.toast.x, y: PT.toast.y };
const FILA_ANTIRRABICA: Blanco = { sel: SEL.fila, texto: "antirrábica", x: 0.5, y: 0.6 };
const PLAN: Blanco = { sel: SEL.bloquePlan, texto: "Plan", x: 0.42, y: 0.45 };
const INFORME: Blanco = { sel: SEL.informe, x: PT.informe.x, y: PT.informe.y };
const FACTURAR: Blanco = { sel: SEL.facturar, x: PT.facturar.x, y: PT.facturar.y };
const LINEA_ITEM: Blanco = { sel: SEL.lineaCarrito, texto: ITEM_PROTAGONISTA, x: 0.42, y: 0.5 };
const TOTALES: Blanco = { sel: SEL.totales, x: PT.totales.x, y: PT.totales.y };
const EMITIR: Blanco = { sel: SEL.emitir, x: PT.emitir.x, y: PT.emitir.y };
const FILA_ITEM: Blanco = { sel: SEL.fila, texto: ITEM_PROTAGONISTA, x: 0.42, y: 0.5 };
/* Para la cámara, el foco va en la primera celda de la fila (el nombre): con el foco en el centro de
   la fila el zoom 1.4 dejaba el nombre fuera de cuadro (still f1180 de la primera pasada). Como el
   encuadre acota el pan, el cuadro arranca en el borde izquierdo de la columna y muestra nombre,
   tipo, existencias y mínimo. */
const CELDA_ITEM: Blanco = { sel: `${SEL.fila} td:first-child`, texto: ITEM_PROTAGONISTA, x: 0.28, y: 0.5 };
/* En Movimientos el foco va al centro de la fila: así el cuadro suelta la columna «Cuándo» (la
   menos importante) y muestra ítem, tipo, cantidad y la nota con el número de factura. */
const CELDA_MOV_2: Blanco = { sel: `${SEL.fila}:nth-child(2)`, x: 0.5, y: 0.32 };
/** Acto 4: foco algo a la izquierda del centro para que el push 1.06 no recorte los nombres. */
const IZQUIERDA = { x: 0.4, y: 0.5 };

/* ── Cámara (plantilla §4): keyframes {f, s, foco}, spring damping 200 ───────────────────────
   Una tabla por encuadre; los keyframes terminan exactamente en el frame del corte que hace
   desaparecer su blanco, y la vuelta a 1.0 al cambiar de acto es un corte. */
export const CAMARA_GENERAL: KeyframeCamara[] = [
  { f: 0, s: 1, foco: PT.centro },
  { f: ACTOS.mapeo, s: 1.04, foco: PT.centro },
];

/* La tabla de mapeo mide 776 px de los 860 del encuadre y la card empieza en x 264: a 1.3 (lo que
   pedía el encargo) se recortaban las dos columnas (still f0330 de la primera pasada); a 1.1 la tabla
   cabía justa pero se comía la «I» de «Importar catálogo» (f0200 y f0330 de la segunda). A 1.05 el
   recorte es de 21 px por lado (x 265→1083): la card y el título quedan enteros y el cuerpo sube de
   18,8 a 19,7 px. Es un push lento, como el de los actos 1 y 4. Lo mismo para la fila que se corrige. */
export const CAMARA_COLUMNA_A: KeyframeCamara[] = [
  { f: ACTOS.mapeo, s: 1, foco: PT.centro },
  { f: 180, s: 1, foco: FILA_MAPEO_2 },
  { f: 240, s: 1.05, foco: FILA_MAPEO_2 },
  { f: 390, s: 1.05, foco: FILA_MAPEO_2 },
  { f: ACTOS.confirmar, s: 1, foco: PT.centro },
  { f: 430, s: 1, foco: FILA_ULTIMA },
  { f: CLIC.select, s: 1.05, foco: FILA_ULTIMA },
  { f: 490, s: 1.05, foco: FILA_ULTIMA },
  { f: CLIC.revisar, s: 1, foco: PT.centro },
  { f: CORTE.importa - 1, s: 1, foco: PT.centro },
  { f: CORTE.importa, s: 1, foco: TOAST },
  { f: CORTE.importa + 20, s: 1.2, foco: TOAST },
  { f: 630, s: 1.2, foco: TOAST },
  { f: TOASTS.importado.f1, s: 1, foco: IZQUIERDA },
  { f: ACTOS.consulta, s: 1.06, foco: IZQUIERDA },
];

/* La consulta (plan + botón) y el carrito viven en la columna de 640: el push se queda en 1.15 y
   1.1 para no recortar las líneas (a 1.25 se perdía el inicio de cada concepto, still f0900 de la
   primera pasada). */
export const CAMARA_LECTURA: KeyframeCamara[] = [
  { f: ACTOS.consulta, s: 1, foco: PT.centro },
  { f: 840, s: 1, foco: PLAN },
  { f: 870, s: 1.15, foco: PLAN },
  { f: CORTE.carrito - 1, s: 1.15, foco: PLAN },
  { f: CORTE.carrito, s: 1, foco: PT.centro },
  { f: 945, s: 1.1, foco: LINEA_ITEM },
  { f: 960, s: 1.1, foco: LINEA_ITEM },
  { f: 970, s: 1, foco: PT.centro },
  { f: CORTE.emite - 1, s: 1, foco: PT.centro },
  { f: CORTE.emite, s: 1, foco: TOAST },
  { f: CORTE.emite + 20, s: 1.2, foco: TOAST },
  { f: ACTOS.bajo - 1, s: 1.2, foco: TOAST },
];

export const CAMARA_COLUMNA_B: KeyframeCamara[] = [
  { f: ACTOS.bajo, s: 1, foco: CELDA_ITEM },
  { f: 1120, s: 1.4, foco: CELDA_ITEM },
  { f: ACTOS.rastro - 1, s: 1.4, foco: CELDA_ITEM },
  { f: ACTOS.rastro, s: 1, foco: CELDA_MOV_2 },
  { f: 1300, s: 1.3, foco: CELDA_MOV_2 },
];

export const camaraEn = (f: number): readonly KeyframeCamara[] => {
  if (f < ACTOS.mapeo) return CAMARA_GENERAL;
  if (f < ACTOS.consulta) return CAMARA_COLUMNA_A;
  if (f < ACTOS.bajo) return CAMARA_LECTURA;
  return CAMARA_COLUMNA_B;
};

/* ── Cursor de escritorio (plantilla §4): cinco clics, cada uno con su viaje ─────────────── */
export const tramosCursor = (ctx: CtxVentas): TramoCursor[] => {
  const idx = ctx.idxColumnaMin ?? 3;
  const celdaMin: Blanco = { sel: `${SEL.filaMapeo(idx + 1)} td:nth-child(2)`, x: PT.celdaMin.x, y: PT.celdaMin.y };
  const selectMin: Blanco = { sel: SEL.selectMapeo(idx), x: PT.selectMin.x, y: PT.selectMin.y };
  return [
    { tipo: "aparece", f: 100, en: PT.arranque, toma: "1 · el puntero aparece" },
    { tipo: "viaje", f0: 110, f1: 140, hasta: ZONA, toma: "2 · viaje a la zona de carga" },
    { tipo: "oculto", f: CORTE.entraArchivo, toma: "2 · el puntero se va" },
    { tipo: "aparece", f: 415, en: celdaMin, toma: "3 · aparece junto a la columna suelta" },
    { tipo: "viaje", f0: 425, f1: 445, hasta: selectMin, toma: "3 · viaje al select de la columna suelta" },
    { tipo: "viaje", f0: 470, f1: 490, hasta: REVISAR, toma: "3 · viaje a «Revisar»" },
    { tipo: "viaje", f0: 535, f1: CLIC.importar, hasta: IMPORTAR, toma: "3 · viaje a «Importar»" },
    { tipo: "oculto", f: CORTE.importa, toma: "3 · el puntero se va" },
    { tipo: "aparece", f: 800, en: INFORME, toma: "5 · aparece en la fila de acciones de la nota" },
    { tipo: "viaje", f0: 880, f1: CLIC.facturar, hasta: FACTURAR, toma: "5 · viaje a «Facturar lo recetado»" },
    { tipo: "oculto", f: CORTE.carrito, toma: "5 · el puntero se va" },
    { tipo: "aparece", f: 975, en: TOTALES, toma: "6 · aparece junto a los totales" },
    { tipo: "viaje", f0: 980, f1: CLIC.emitir, hasta: EMITIR, toma: "6 · viaje a «Emitir»" },
    { tipo: "oculto", f: CORTE.emite, toma: "6 · el puntero se va" },
  ];
};

/** Clics: el active-sim se omite solo si el elemento ya no existe en el frame del clic. */
export const CLICS: Clic[] = [
  { f: CLIC.zona, sobre: { sel: SEL.zonaSoltar } },
  { f: CLIC.select, sobre: { sel: SEL.selectUltimo } },
  { f: CLIC.revisar, sobre: { sel: SEL.revisar } },
  { f: CLIC.importar, sobre: { sel: SEL.importar } },
  { f: CLIC.facturar, sobre: { sel: SEL.facturar } },
  { f: CLIC.emitir, sobre: { sel: SEL.emitir } },
];

export const HOVERS: Hover[] = [
  { f0: CLIC.select - 7, f1: CLIC.select, sel: SEL.selectUltimo },
  { f0: CLIC.revisar - 8, f1: CLIC.revisar, sel: SEL.revisar },
  { f0: CLIC.importar - 7, f1: CLIC.importar, sel: SEL.importar },
  { f0: CLIC.facturar - 8, f1: CLIC.facturar, sel: SEL.facturar },
  { f0: CLIC.emitir - 7, f1: CLIC.emitir, sel: SEL.emitir },
];

/* ── Scroll (plantilla §2.4): por overflow-y computado desde el ancla ────────────────────── */
export const SCROLLS: Scroll[] = [
  /* Acto 4: de los KPIs a la fila de la vacuna antirrábica, agotada, cuando el toast ya se fue. */
  { f0: TOASTS.importado.f1, f1: 705, ancla: FILA_ANTIRRABICA, desde: "arriba", hasta: "centrar" },
  /* Acto 5: el botón centrado deja el plan justo encima. */
  { f0: ACTOS.consulta, f1: ACTOS.consulta, ancla: { sel: SEL.facturar }, hasta: "centrar" },
  { f0: CORTE.carrito, f1: CORTE.carrito, ancla: { sel: SEL.lineaCarrito }, hasta: "arriba" },
  { f0: 970, f1: 985, ancla: { sel: SEL.emitir }, desde: "arriba", hasta: "centrar" },
  { f0: CORTE.emite, f1: CORTE.emite, ancla: { sel: SEL.pagina }, hasta: "arriba" },
  /* Acto 7: la fila del ítem, centrada. Acto 8: la primera fila de Movimientos. */
  { f0: ACTOS.bajo, f1: ACTOS.bajo, ancla: FILA_ITEM, hasta: "centrar" },
  { f0: ACTOS.rastro, f1: ACTOS.rastro, ancla: { sel: SEL.fila }, hasta: "arriba" },
];

/** Voseo que sólo aparece en las pantallas de esta pieza (además de MAPA_TUTEO). */
export const TUTEO_EXTRA: ReadonlyArray<readonly [RegExp, string]> = [
  [/que igual revisás y aprobás/g, "que igual revisas y apruebas"],
];
