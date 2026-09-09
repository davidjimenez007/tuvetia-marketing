/**
 * DemoComunicaciones · estadoEn(frame): el replay puro (plantilla §2) sobre el iframe de escritorio.
 *
 * Cada frame se reconstruye desde cero: reset → reseed → login-demo → beats (desde <= frame) → nav
 * síncrono → toasts por ventana. La cadena (encargo §3) se resuelve acá: el titular con dos entrantes sin
 * responder y una propuesta pendiente que los contesta (hoy Julián Betancur y `ac-1`), o reventar.
 */
import { resetEstado } from "../demo/estado";
import { capturarToast, reponerToasts } from "../pieza/columna";
import { CORTE, RUTAS, TOASTS } from "./guion";
import type { AppComunicaciones, CtxComunicaciones, VentanaComunicaciones } from "./tipos";

interface Beat {
  desde: number;
  nombre: string;
  aplicar(app: AppComunicaciones, frame: number, ctx: CtxComunicaciones, win: VentanaComunicaciones): void;
}

export const BEATS: Beat[] = [
  {
    desde: 0,
    nombre: "1 · la bandeja: los entrantes sin leer, ningún hilo abierto",
    aplicar: (app, _f, ctx) => {
      /* El seed marca leídos todos los entrantes; el encargo parte de una bandeja recién llegada (NOTAS.md). */
      for (const m of app.DB.wa.mensajes) if (m.dir === "in") m.leido = null;
      const propuestas = app.DB.wa.propuestas.filter((p) => p.estado === "proposed");
      const conv = app.SEL.conversaciones().find((c) => c.sinLeer >= 2 && propuestas.some((p) => p.tel === c.tel));
      if (!conv) throw new Error("Replay · 1: ninguna conversación trae dos entrantes sin responder y una propuesta pendiente");
      const propuesta = propuestas.find((p) => p.tel === conv.tel);
      if (!propuesta) throw new Error("Replay · 1: sin propuesta para el hilo elegido");
      /* La propuesta tiene que contestar las dos preguntas del hilo (la hora y el ayuno): si el seed cambia,
         parar y avisar. */
      const cuerpo = propuesta.payload.body;
      const entrantes = conv.mensajes.filter((m) => m.dir === "in").map((m) => m.texto.toLowerCase());
      const preguntaAyuno = entrantes.some((t) => t.indexOf("ayun") >= 0);
      const preguntaHora = entrantes.some((t) => /\b3\b|las 3/.test(t));
      if (!preguntaAyuno || !preguntaHora || !/ayun/i.test(cuerpo) || !/\b3(:00)?\b/.test(cuerpo)) {
        throw new Error(`Replay · 1: la propuesta ${propuesta.id} ya no responde las dos preguntas del hilo de ${app.SEL.nombreDeTel(conv.tel)}`);
      }
      ctx.tel = conv.tel;
      ctx.idPropuesta = propuesta.id;
      app.COM.tel = null;
      ctx.ruta = RUTAS.comunicaciones;
    },
  },
  {
    desde: CORTE.hilo,
    nombre: "2 · abrir el hilo (los entrantes pasan a leídos: el badge desaparece)",
    aplicar: (app, _f, ctx) => {
      if (!ctx.tel) return;
      app.ACTIONS["wa-abrir"](ctx.tel);
    },
  },
  {
    desde: CORTE.aprueba,
    nombre: "4 · aprobar la propuesta: el mensaje sale con doble check",
    aplicar: (app, _f, ctx, win) => {
      if (!ctx.idPropuesta || !ctx.tel) return;
      const antes = app.DB.wa.mensajes.length;
      app.ACTIONS["accion-aprobar"](ctx.idPropuesta);
      if (app.DB.wa.mensajes.length !== antes + 1) throw new Error("Replay · 4: aprobar no dejó el mensaje en DB.wa.mensajes");
      const ultimo = app.DB.wa.mensajes[app.DB.wa.mensajes.length - 1];
      if (ultimo.tel !== ctx.tel || ultimo.dir !== "out" || !ultimo.entregado) {
        throw new Error("Replay · 4: el mensaje aprobado no salió al hilo con `entregado` (doble check)");
      }
      capturarToast(win.document, ctx.toasts, TOASTS.enviado, "4 · aprobar");
    },
  },
  {
    desde: CORTE.correo,
    nombre: "5 · la pestaña de Correo",
    aplicar: (_app, _f, ctx) => {
      ctx.ruta = RUTAS.correo;
    },
  },
  {
    desde: CORTE.conexiones,
    nombre: "6 · Integraciones",
    aplicar: (_app, _f, ctx) => {
      ctx.ruta = RUTAS.conexiones;
    },
  },
];

export function aplicarReplay(win: VentanaComunicaciones, frame: number): CtxComunicaciones {
  const app = win.app;
  const ctx: CtxComunicaciones = { ruta: RUTAS.comunicaciones, tel: null, idPropuesta: null, toasts: [] };

  win.__RENDER_MUDO = true;
  try {
    resetEstado(win);
    app.reseed();
    app.ACTIONS["login-demo"]();
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
