/**
 * DemoAgentico · lo que el replay necesita de window.app y el tipo del demo no declara: el chat con sus
 * mensajes tipados, el motor de respuestas (`responderVetGPT`), el registro de acciones vivas que el botón
 * de aprobar consulta (`ACCIONES_VIVAS`, parche demo), la cartera y la agenda.
 */
import type { AppTuvetia, DbApp } from "../demo/guion";
import type { ToastCapturado } from "../pieza/columna";

/** Una acción propuesta por VetGPT (la tarjeta): la ejecuta `ACTIONS["accion-aprobar"]`. */
export interface AccionApp {
  id: string;
  herramienta: string;
  estado: string;
  resumen: string;
  payload: Record<string, string>;
  pasos?: string[];
  pasosHechos?: string[];
  destino?: { href: string; texto: string } | null;
  ejecutar?(): unknown;
}

export interface RespuestaVetGPT {
  texto: string;
  herramienta?: string | null;
  citas?: unknown;
  accion?: AccionApp;
  opciones?: unknown;
}

export interface MensajeChat {
  rol: "user" | "assistant";
  texto: string;
  escribiendo?: boolean;
  citas?: unknown;
  herramienta?: string | null;
  accion?: AccionApp;
  opciones?: unknown;
}

export interface FacturaCobro {
  id: string;
  numero: string | null;
  ownerId: string;
  vence?: string | Date | null;
}

export interface AppAgentico extends AppTuvetia {
  DB: Omit<DbApp, "wa"> & {
    citas: { id: string; inicio: Date | string; titulo: string }[];
    pacientes: { id: string; nombre: string; ownerId: string }[];
    wa: { mensajes: DbApp["wa"]["mensajes"]; contactos: { tel: string }[]; propuestas: unknown[] };
  };
  SEL: {
    porCobrarLista(): FacturaCobro[];
    pendientes(): { id: string; etiqueta: string; detalle: string }[];
    conversaciones(): { tel: string }[];
  };
  getO(id: string): { id: string; nombre: string; tel?: string } | undefined;
  responderVetGPT(pregunta: string): RespuestaVetGPT;
  ACCIONES_VIVAS: Map<string, AccionApp>;
}

/** `CHAT.mensajes` es `unknown[]` en el tipo base; acá se lee con su forma real. */
export type ChatAgentico = Omit<AppTuvetia["CHAT"], "mensajes"> & { mensajes: MensajeChat[] };

export type VentanaAgentico = Window &
  typeof globalThis & {
    app: AppAgentico;
    __RENDER_MUDO?: boolean;
    __resetAzar(): void;
  };

/** Lo que fluye entre beats: la ruta del frame y lo resuelto desde DB. */
export interface CtxAgentico {
  ruta: string;
  /** La pregunta que la app precarga en el compositor (`?pedir=cobros`), leída de `CHAT.entrada`. */
  pregunta: string | null;
  /** La respuesta de cartera y su acción (una sola vez por frame, es determinista). */
  respuesta: RespuestaVetGPT | null;
  /** Teléfono en dígitos del titular de la factura más vieja; el hilo nuevo se agrupa por él. */
  tel: string | null;
  /** El texto final del mensaje, con la frase que añadió el vet. */
  textoFinal: string | null;
  /** La cita creada en el acto 7 (para llevar la agenda a su semana). */
  inicioCita: Date | null;
  toasts: ToastCapturado[];
}
