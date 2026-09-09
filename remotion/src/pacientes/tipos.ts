/**
 * DemoPacientes · lo que el replay necesita de window.app y el tipo del demo no declara: las notas
 * con su estado y su guarda, los pacientes con su titular, y el botón nuevo de la ficha
 * (`informe-paciente`, parche de la maqueta del 8-sep).
 */
import type { AppTuvetia, DbApp } from "../demo/guion";
import type { ToastCapturado } from "../pieza/columna";

export interface NotaApp {
  id: string;
  consultaId: string;
  estado: string;
  gateAlergia: boolean;
  citas?: unknown[];
}

export interface AppPacientes extends AppTuvetia {
  DB: DbApp & {
    notas: NotaApp[];
    pacientes: { id: string; nombre: string; ownerId: string }[];
    alergias: { patientId: string; severidad: string }[];
  };
  getO(id: string): { id: string; nombre: string; tel?: string } | undefined;
}

export type VentanaPacientes = Window &
  typeof globalThis & {
    app: AppPacientes;
    __RENDER_MUDO?: boolean;
    __resetAzar(): void;
  };

/** Lo que fluye entre beats: la ruta del frame y los ids dinámicos, resueltos desde DB. */
export interface CtxPacientes {
  ruta: string;
  idPaciente: string | null;
  /** La consulta cuya nota tiene la guarda de alergia (hoy `c-1`, nota `n-1`). */
  idConsulta: string | null;
  idTitular: string | null;
  /** Teléfono del titular en dígitos: el hilo de WhatsApp se agrupa por él. */
  tel: string | null;
  toasts: ToastCapturado[];
}
