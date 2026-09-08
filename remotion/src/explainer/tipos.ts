/**
 * ExplainerRAG · lo que el replay necesita de window.app y el tipo del demo no declara:
 * el hilo del chat, las notas con citas, los internos expuestos por el parche §2.2.1 y la
 * repregunta de la orden v2 (§B).
 */
import type { AppTuvetia, DbApp } from "../demo/guion";

export interface Cita {
  n: number;
  titulo: string;
  revista: string;
  anio: number;
  loc: string;
  url?: string;
}

/** Un campo de la repregunta (orden v2 §B.1): rótulo y opciones cerradas. */
export interface CampoRepregunta {
  id: string;
  rotulo: string;
  opciones: string[];
}

/** Una entrada de REPREGUNTAS en la app. */
export interface Repregunta {
  texto: string;
  campos: CampoRepregunta[];
}

/** La forma que consume MensajeChat en la app. */
export interface MensajeChat {
  rol: "user" | "assistant";
  texto: string;
  escribiendo?: boolean;
  citas?: Cita[];
  herramienta?: string | null;
  opciones?: string[];
  accion?: unknown;
  /* Orden v2 §B.2: { rol: "assistant", texto, repregunta, elegidas }. */
  repregunta?: Repregunta;
  elegidas?: Record<string, string>;
}

export interface RespuestaVetGPT {
  texto: string;
  herramienta?: string;
  citas?: Cita[];
  opciones?: string[];
  accion?: unknown;
}

export interface NotaApp {
  id: string;
  consultaId: string;
  citas?: Cita[];
}

export interface AppExplainer extends AppTuvetia {
  DB: DbApp & { notas: NotaApp[] };
  CHAT: Omit<AppTuvetia["CHAT"], "mensajes"> & { mensajes: MensajeChat[] };
  /* PARCHE DEMO (ExplainerRAG) sobre la copia: expuestos en window.app. */
  responderVetGPT(pregunta: string): RespuestaVetGPT;
  repintarChat(enDock?: boolean): void;
  REPREGUNTAS: Record<string, Repregunta>;
  enviarChat(texto: string, destino?: string): void;
  getC(id: string): { id: string; pacienteId: string } | undefined;
  getP(id: string): { id: string; nombre: string } | undefined;
}

export type VentanaExplainer = Window &
  typeof globalThis & {
    app: AppExplainer;
    __RENDER_MUDO?: boolean;
    __resetAzar(): void;
  };

/** Lo que fluye entre beats: la ruta del frame, el id dinámico de la consulta con citas y el
 *  paciente de esa consulta (el contexto que se elige en el acto 2, orden v2 §C.2). */
export interface CtxExplainer {
  ruta: string;
  idConsulta: string | null;
  idPaciente: string | null;
}
