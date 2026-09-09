/**
 * Pieza · lo que comparten los demos de producto (plantilla `_plantilla-demo-producto.md` §2–§4):
 * los tipos de las tablas por frame que cada guion declara y las máquinas de `src/pieza/` ejecutan.
 * Cada pieza trae su propio `Ctx` (los ids dinámicos que fluyen entre beats) y su propio tipo de
 * `window.app`; acá todo es genérico sobre eso.
 */
import type { Blanco, Clic, Hover, KeyframeCamara, TramoCursor } from "../demo/guion";
import type { Vista } from "../demo/Camara";
import type { DimsApp } from "../demo/Cursor";

export type Superficie = "escritorio" | "movil";

/** La ventana del iframe antes de saber qué app trae: el replay de cada pieza la afina. */
export type VentanaBase = Window &
  typeof globalThis & {
    app?: unknown;
    __RENDER_MUDO?: boolean;
  };

export interface Lienzo {
  w: number;
  h: number;
  safeTop: number;
  safeBottom: number;
  safeX: number;
}

/** Un toque en móvil: el blanco se resuelve con el contexto del replay (ids dinámicos). */
export interface Toque<Ctx> {
  f: number;
  blanco(ctx: Ctx): Blanco;
  toma: string;
}

/** Scroll (§2.4): el contenedor se resuelve por overflow-y computado desde el ancla. */
export interface Scroll {
  f0: number;
  f1: number;
  ancla: Blanco;
  desde?: "arriba" | "fondo";
  hasta: "arriba" | "fondo" | "centrar";
}

export interface TextoBanda {
  f0: number;
  f1: number;
  rotulo: string;
  frase: string;
}

export interface Microrrotulo {
  f0: number;
  f1: number;
  texto: string;
}

/** Lo que el post-proceso de un documento necesita saber de la pieza. */
export interface ConfigPostProceso<Ctx> {
  hovers: readonly Hover[];
  clics: readonly Clic[];
  toques: readonly Toque<Ctx>[];
  scrolls: readonly Scroll[];
  /** Frame en que el caret arranca encendido (parpadea a 30 frames). */
  caretF0: number;
  /** Relleno inferior (px de app) del hilo del chat en móvil, para que la banda no lo tape. */
  rellenoHiloMovil?: number;
  /** Reemplazos de tuteo propios de la pieza, además del mapa compartido. */
  tuteoExtra?: ReadonlyArray<readonly [RegExp, string]>;
  /** Cualquier otro ajuste por frame (ocultar el dock, mover los toasts, angostar la página…). */
  extra?(doc: Document, frame: number, superficie: Superficie, ctx: Ctx): void;
}

export type PostProceso<Ctx> = (doc: Document, frame: number, superficie: Superficie, ctx: Ctx) => void;

/** El replay puro de una pieza: reconstruye el frame sobre un iframe y devuelve su contexto. */
export type Replay<Ctx> = (win: VentanaBase, frame: number) => Ctx;

/** Lo que una superficie necesita de su pieza, además de la geometría. */
export interface GuionSuperficie<Ctx> {
  replay: Replay<Ctx>;
  postProceso: PostProceso<Ctx>;
  /** Escritorio: el puntero. */
  cursor?: { tramos(ctx: Ctx): readonly TramoCursor[]; clics: readonly Clic[] };
  /** Móvil: los toques. */
  toques?: readonly Toque<Ctx>[];
}

/** Geometría de una superficie por frame. */
export interface GeometriaSuperficie {
  app: DimsApp;
  visibleEn(frame: number): boolean;
  vistaEn(frame: number): Vista;
  camaraEn(frame: number): readonly KeyframeCamara[];
}

/** La ventana de escritorio en un frame: qué región de la app muestra, a qué escala y dónde. */
export interface LayoutVentana {
  vista: Vista;
  escala: number;
  /** Borde superior de la ventana en el lienzo (incluye la barra si hay cromo). */
  top: number;
  /** Con barra, puntos, radio y sombra (plano general) o corte seco sin cromo (encuadre). */
  conCromo: boolean;
  /** Factor del cromo respecto a su tamaño natural (la ventana encogida lo encoge con ella). */
  k: number;
  opacidad: number;
  visible: boolean;
}
