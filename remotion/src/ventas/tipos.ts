/**
 * DemoVentas · lo que el replay necesita de window.app y el tipo del demo no declara: la
 * importación (parche de la maqueta del 8-sep: `IMP`, `importarDesdeTexto`, `confirmarImportacion`),
 * las notas con su plan, el catálogo con existencias y el carrito con sus líneas.
 */
import type { AppTuvetia, DbApp } from "../demo/guion";

export interface ItemCatalogo {
  id: string;
  tipo: string;
  nombre: string;
  sku: string | null;
  stock?: boolean;
  unidades?: number;
  min?: number;
}

export interface NotaApp {
  id: string;
  consultaId: string;
  estado: string;
  /** El plan (P) de la nota SOAP: donde `facturar-recetado` busca los nombres de los fármacos. */
  p: string;
}

export interface Movimiento {
  id: string;
  itemId: string;
  tipo: string;
  cant: number;
  nota: string;
}

export interface LineaCarrito {
  itemId: string | null;
  desc: string;
  qty: number;
}

export interface ResultadoImportacion {
  creados: number;
  actualizados: number;
  movimientos: number;
}

export interface EstadoImportacion {
  paso: number;
  archivo: { nombre: string; tam: number; ext: string } | null;
  encabezados: string[];
  filas: string[][];
  mapeo: Record<string, string>;
  fixture: boolean;
  error: string | null;
  reset(): void;
}

export interface AppVentas extends Omit<AppTuvetia, "DB" | "CARRITO"> {
  DB: Omit<DbApp, "catalogo"> & {
    notas: NotaApp[];
    catalogo: ItemCatalogo[];
    movimientos: Movimiento[];
  };
  CARRITO: Omit<AppTuvetia["CARRITO"], "lineas"> & { lineas: LineaCarrito[] };
  /* PARCHE DEMO (videos de producto) sobre la copia: expuestos en window.app. */
  IMP: EstadoImportacion;
  importarDesdeTexto(texto: string, nombreArchivo: string, tam?: number): EstadoImportacion;
  confirmarImportacion(): ResultadoImportacion | null;
  getC(id: string): { id: string; pacienteId: string } | undefined;
  getItem(id: string): ItemCatalogo | undefined;
  SEL: { notaDe(consultaId: string): NotaApp | null };
}

export type VentanaVentas = Window &
  typeof globalThis & {
    app: AppVentas;
    __RENDER_MUDO?: boolean;
    __resetAzar(): void;
  };

/** Un toast que la app emitió en un beat y que la línea de tiempo vuelve a mostrar en su ventana. */
export interface ToastCapturado {
  f0: number;
  f1: number;
  html: string;
}

/** Lo que fluye entre beats: la ruta del frame y los ids dinámicos, resueltos desde DB y nunca
 *  escritos a mano. */
export interface CtxVentas {
  ruta: string;
  /** El ítem protagonista (hoy el Oclacitinib, `it-12`). */
  idItem: string | null;
  /** La consulta con nota aprobada cuyo plan receta el ítem (hoy `c-1`, Luna). */
  idConsulta: string | null;
  /** La columna del CSV que el vet mapea a mano en el acto 3 («Punto de pedido»). */
  idxColumnaMin: number | null;
  idFactura: string | null;
  numeroFactura: string | null;
  importe: ResultadoImportacion | null;
  toasts: ToastCapturado[];
}
