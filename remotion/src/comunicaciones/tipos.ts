/**
 * DemoComunicaciones · lo que el replay necesita de window.app y el tipo del demo no declara: los mensajes
 * de WhatsApp con su dirección y sus acuses, los contactos, las propuestas pendientes de VetGPT y los
 * selectores de la bandeja.
 */
import type { AppTuvetia, DbApp } from "../demo/guion";
import type { ToastCapturado } from "../pieza/columna";

export interface MensajeWaApp {
  id: string;
  tel: string;
  dir: "in" | "out";
  texto: string;
  cuando: Date;
  leido: Date | null;
  entregado: Date | null;
  fallo: unknown;
}

/** Una propuesta de VetGPT que espera aprobación en la bandeja (seed: `DB.wa.propuestas`). */
export interface PropuestaApp {
  id: string;
  tel: string;
  herramienta: string;
  resumen: string;
  payload: { to: string; body: string };
  estado: string;
  pasosHechos?: string[];
}

export interface AppComunicaciones extends AppTuvetia {
  DB: Omit<DbApp, "wa"> & {
    wa: { mensajes: MensajeWaApp[]; contactos: { tel: string; nombre: string }[]; propuestas: PropuestaApp[] };
  };
  SEL: {
    conversaciones(): { tel: string; sinLeer: number; mensajes: MensajeWaApp[] }[];
    nombreDeTel(tel: string): string;
  };
}

export type VentanaComunicaciones = Window &
  typeof globalThis & {
    app: AppComunicaciones;
    __RENDER_MUDO?: boolean;
    __resetAzar(): void;
  };

/** Lo que fluye entre beats: la ruta del frame y lo resuelto desde DB. */
export interface CtxComunicaciones {
  ruta: string;
  /** Teléfono en dígitos del titular con dos preguntas sin responder y propuesta pendiente (hoy Julián). */
  tel: string | null;
  /** La propuesta de VetGPT que responde ese hilo (hoy `ac-1`). */
  idPropuesta: string | null;
  toasts: ToastCapturado[];
}
