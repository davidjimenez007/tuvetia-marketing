/**
 * DemoPacientes · estadoEn(frame): el replay puro (plantilla §2) sobre el iframe de escritorio.
 *
 * Cada frame se reconstruye desde cero: reset → reseed → login-demo → beats (desde <= frame) → nav
 * síncrono → toasts por ventana. La cadena (encargo §3) se resuelve acá: Luna por nombre, su consulta
 * con nota que trae la guarda de alergia, su titular. La nota se pone en borrador (el estado en que
 * el producto la crea) para filmar el momento anterior al que el seed congela.
 */
import { resetEstado } from "../demo/estado";
import { capturarToast, reponerToasts } from "../pieza/columna";
import { CLIC, CORTE, PACIENTE, RUTAS, TOASTS, VUELTA_FICHA } from "./guion";
import type { AppPacientes, CtxPacientes, VentanaPacientes } from "./tipos";

interface Beat {
  desde: number;
  nombre: string;
  aplicar(app: AppPacientes, frame: number, ctx: CtxPacientes, win: VentanaPacientes): void;
}

export const BEATS: Beat[] = [
  {
    desde: 0,
    nombre: "1 · la ficha; la nota vuelve a borrador",
    aplicar: (app, _f, ctx) => {
      const p = app.DB.pacientes.find((x) => x.nombre === PACIENTE);
      if (!p) throw new Error(`Replay · 1: el seed no trae a «${PACIENTE}»`);
      const consultas = app.DB.consultas.filter((c) => c.pacienteId === p.id);
      const notas = app.DB.notas.filter((n) => consultas.some((c) => c.id === n.consultaId));
      const conGuarda = notas.find((n) => n.gateAlergia);
      if (!conGuarda) throw new Error(`Replay · 1: ninguna nota de ${PACIENTE} trae gateAlergia: sin la guarda la pieza pierde su acto central`);
      if (!app.DB.alergias.some((a) => a.patientId === p.id && a.severidad === "severe")) {
        throw new Error(`Replay · 1: ${PACIENTE} no tiene alergia severa registrada`);
      }
      /* Todas las notas de Luna nacen en borrador y sus consultas en revisión: así el botón del
         informe arranca deshabilitado (el seed trae dos notas aprobadas; ver NOTAS.md). */
      for (const n of notas) n.estado = "draft";
      for (const c of consultas) c.estado = "review";
      app.UI.gateOk = false;
      const o = app.getO(p.ownerId);
      if (!o || !o.tel) throw new Error(`Replay · 1: el titular de ${PACIENTE} no tiene teléfono`);
      ctx.idPaciente = p.id;
      ctx.idConsulta = conGuarda.consultaId;
      ctx.idTitular = o.id;
      ctx.tel = o.tel.replace(/\D/g, "");
      ctx.ruta = `${RUTAS.paciente}/${p.id}`;
    },
  },
  {
    desde: 360,
    nombre: "3 · la consulta con la nota en borrador",
    aplicar: (_app, _f, ctx) => {
      ctx.ruta = `${RUTAS.consulta}/${ctx.idConsulta ?? ""}`;
    },
  },
  {
    /* El primer intento (f640) no lleva beat: «Revisar y aprobar» está deshabilitado por la guarda
       y la app no hace nada. Es el freno de verdad; ver NOTAS.md. */
    desde: CLIC.guarda,
    nombre: "4 · el vet marca la casilla de la guarda",
    aplicar: (app) => {
      app.UI.gateOk = true;
    },
  },
  {
    desde: CORTE.aprueba,
    nombre: "5 · aprobar: la nota entra a la historia",
    aplicar: (app, _f, ctx, win) => {
      if (!ctx.idConsulta) return;
      app.ACTIONS["aprobar-nota"](ctx.idConsulta);
      const n = app.DB.notas.find((x) => x.consultaId === ctx.idConsulta);
      if (!n || n.estado !== "approved") throw new Error("Replay · 5: la nota no quedó aprobada tras aprobar-nota");
      capturarToast(win.document, ctx.toasts, TOASTS.aprobada, "5 · aprobar");
    },
  },
  {
    desde: VUELTA_FICHA,
    nombre: "5 · de vuelta a la ficha, la consulta aprobada",
    aplicar: (_app, _f, ctx) => {
      ctx.ruta = `${RUTAS.paciente}/${ctx.idPaciente ?? ""}`;
    },
  },
  {
    desde: CORTE.dialogo,
    nombre: "6 · el informe para el titular, desde el botón de la ficha",
    aplicar: (app, _f, ctx) => {
      if (!ctx.idConsulta) return;
      app.ACTIONS["informe-paciente"](ctx.idConsulta);
    },
  },
  {
    desde: CORTE.envia,
    nombre: "7 · enviar por WhatsApp y abrir el hilo de la titular",
    aplicar: (app, _f, ctx, win) => {
      if (!ctx.idConsulta || !ctx.tel) return;
      const antes = app.DB.wa.mensajes.length;
      app.ACTIONS["enviar-informe"](`${ctx.idConsulta}:wa`);
      if (app.DB.wa.mensajes.length !== antes + 1) throw new Error("Replay · 7: enviar-informe no dejó el mensaje en DB.wa.mensajes");
      capturarToast(win.document, ctx.toasts, TOASTS.enviado, "7 · enviar");
      app.ACTIONS["wa-abrir"](ctx.tel);
      ctx.ruta = RUTAS.comunicaciones;
    },
  },
];

export function aplicarReplay(win: VentanaPacientes, frame: number): CtxPacientes {
  const app = win.app;
  const ctx: CtxPacientes = { ruta: RUTAS.paciente, idPaciente: null, idConsulta: null, idTitular: null, tel: null, toasts: [] };

  win.__RENDER_MUDO = true;
  try {
    resetEstado(win);
    app.reseed();
    app.ACTIONS["login-demo"]();
    app.DB.wa.propuestas = [];
    for (const beat of BEATS) {
      if (beat.desde <= frame) beat.aplicar(app, frame, ctx, win);
    }
  } finally {
    win.__RENDER_MUDO = false;
  }

  app.nav(ctx.ruta, true);
  reponerToasts(win.document, frame, ctx.toasts);
  return ctx;
}
