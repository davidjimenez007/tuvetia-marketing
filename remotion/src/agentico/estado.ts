/**
 * DemoAgentico · estadoEn(frame): el replay puro (plantilla §2) sobre el iframe de escritorio.
 *
 * Cada frame se reconstruye desde cero: reset → reseed → login-demo → beats (desde <= frame) → nav
 * síncrono → toasts por ventana. `SIM` es no-op, así que la mitad de `enviarChat` que depende de él (la
 * respuesta escribiéndose) la arma el replay con lo que devuelve `responderVetGPT`, y la acción se
 * registra en `ACCIONES_VIVAS` para que «Aprobar» la encuentre (public/app/NOTAS-MAQUETA.md §C).
 */
import { resetEstado } from "../demo/estado";
import { capturarToast, reponerToasts } from "../pieza/columna";
import { CORTE, FRASE_VET, PACIENTE_CITA, PREGUNTA_CITA, RUTAS, TOASTS } from "./guion";
import type { AccionApp, AppAgentico, ChatAgentico, CtxAgentico, MensajeChat, VentanaAgentico } from "./tipos";

interface Beat {
  desde: number;
  nombre: string;
  aplicar(app: AppAgentico, frame: number, ctx: CtxAgentico, win: VentanaAgentico): void;
}

const digitos = (s: string): string => s.replace(/\D/g, "");
const chatDe = (app: AppAgentico): ChatAgentico => app.CHAT as unknown as ChatAgentico;
const ultimoBot = (app: AppAgentico): MensajeChat => {
  const m = chatDe(app).mensajes[chatDe(app).mensajes.length - 1];
  if (!m || m.rol !== "assistant") throw new Error("Replay: el último mensaje del hilo no es de VetGPT");
  return m;
};

/** El texto hasta la palabra que toca según la fracción, cortando en límites de palabra pero conservando
 *  los saltos de línea y las viñetas: un split/join por espacios aplastaba la lista en una sola línea. */
function prefijoPorPalabras(texto: string, fraccion: number): string {
  const limites: number[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) limites.push(m.index + m[0].length);
  const n = Math.min(limites.length, Math.floor(limites.length * Math.max(0, fraccion)));
  return n <= 0 ? "" : texto.slice(0, limites[n - 1]);
}

/** La acción viva de la respuesta, o reventar: sin ella no hay tarjeta ni aprobación. */
const accionDe = (ctx: CtxAgentico, beat: string): AccionApp => {
  const a = ctx.respuesta?.accion;
  if (!a) throw new Error(`Replay · ${beat}: la respuesta de cartera no trae acción`);
  return a;
};

export const BEATS: Beat[] = [
  {
    desde: 0,
    nombre: "1 · la clínica hoy: la factura vencida más vieja y su titular, que no está en la bandeja",
    aplicar: (app, _f, ctx) => {
      const ahora = new Date();
      const vencidas = app.SEL.porCobrarLista().filter((f) => f.vence && new Date(f.vence) < ahora);
      if (!vencidas.length) throw new Error("Replay · 1: no hay cartera vencida en el seed; la pieza no tiene qué cobrar");
      const f = vencidas[0];
      const o = app.getO(f.ownerId);
      if (!o || !o.tel) throw new Error(`Replay · 1: el titular de ${f.numero ?? f.id} no tiene teléfono`);
      const tel = digitos(o.tel);
      /* La prueba del acto 6 es que la conversación no existía. Si el seed ya la trae, se cae: parar y avisar. */
      if (app.DB.wa.contactos.some((c) => c.tel === tel)) {
        throw new Error(`Replay · 1: ${o.nombre} (${tel}) ya está en DB.wa.contactos; la prueba del acto 6 no existe`);
      }
      ctx.tel = tel;
      ctx.ruta = RUTAS.asistente;
    },
  },
  {
    desde: CORTE.pregunta,
    nombre: "2 · el riel: al asistente con la pregunta precargada por la app",
    aplicar: (_app, _f, ctx) => {
      ctx.ruta = RUTAS.pedirCobros;
    },
  },
  {
    desde: CORTE.pensando,
    nombre: "2 · enviar: el mensaje del vet entra al hilo (la mitad de enviarChat que no depende de SIM)",
    aplicar: (app, _f, ctx, win) => {
      /* La pregunta la escribe la app al navegar con ?pedir=cobros (dentro del render de la vista); se lee
         de ahí, no del guion. Con el render mudo la vista no corre, así que se pinta una vez acá. */
      win.__RENDER_MUDO = false;
      app.nav(RUTAS.pedirCobros, true);
      win.__RENDER_MUDO = true;
      const chat = chatDe(app);
      const q = chat.entrada.trim();
      if (!q) throw new Error("Replay · 2: la app no precargó la pregunta en el compositor (?pedir=cobros)");
      ctx.pregunta = q;
      chat.mensajes.push({ rol: "user", texto: q });
      chat.entrada = "";
      chat.estado = "pensando";
      ctx.ruta = RUTAS.asistente;
    },
  },
  {
    desde: CORTE.respuesta,
    nombre: "3 · la respuesta llega: primero consulta la cartera",
    aplicar: (app, frame, ctx) => {
      const r = app.responderVetGPT(ctx.pregunta ?? "");
      if (!r.accion) throw new Error("Replay · 3: responderVetGPT no propuso ninguna acción para la cartera");
      if (digitos(r.accion.payload.to ?? "") !== ctx.tel) {
        throw new Error(`Replay · 3: la acción escribe a ${r.accion.payload.to} y la factura más vieja es de ${ctx.tel}`);
      }
      ctx.respuesta = r;
      const chat = chatDe(app);
      const escribe = frame >= CORTE.escribe;
      chat.mensajes.push({
        rol: "assistant",
        texto: escribe ? prefijoPorPalabras(r.texto, (frame - CORTE.escribe) / (540 - CORTE.escribe)) : "",
        escribiendo: true,
        citas: r.citas,
        herramienta: escribe ? null : r.herramienta,
      });
      chat.estado = "escribiendo";
    },
  },
  {
    desde: 540,
    nombre: "4 · texto completo: la tarjeta de acción, registrada para poder aprobarla",
    aplicar: (app, _f, ctx) => {
      const r = ctx.respuesta;
      if (!r) return;
      const m = ultimoBot(app);
      m.texto = r.texto;
      m.escribiendo = false;
      m.accion = r.accion;
      m.opciones = r.opciones;
      app.ACCIONES_VIVAS.set(accionDe(ctx, "4").id, accionDe(ctx, "4"));
      chatDe(app).estado = "libre";
    },
  },
  {
    desde: CORTE.edita,
    nombre: "4 · el vet añade su frase al final del mensaje (como la acción de editar campo)",
    aplicar: (_app, frame, ctx) => {
      const a = accionDe(ctx, "4b");
      const k = Math.min(FRASE_VET.length, Math.ceil((FRASE_VET.length * (frame - CORTE.edita)) / (CORTE.editaFin - CORTE.edita)));
      a.payload.body = `${a.payload.body}${FRASE_VET.slice(0, k)}`;
    },
  },
  {
    desde: CORTE.ejecutada,
    nombre: "5 · aprobar: el mensaje sale y el contacto aparece",
    aplicar: (app, _f, ctx, win) => {
      const a = accionDe(ctx, "5");
      const contactos = app.DB.wa.contactos.length;
      const mensajes = app.DB.wa.mensajes.length;
      app.ACTIONS["accion-aprobar"](a.id);
      if (a.estado !== "executed") throw new Error("Replay · 5: la acción no quedó ejecutada tras aprobar");
      if (app.DB.wa.contactos.length !== contactos + 1) throw new Error("Replay · 5: aprobar no creó el contacto en DB.wa.contactos");
      if (app.DB.wa.mensajes.length !== mensajes + 1) throw new Error("Replay · 5: aprobar no dejó el mensaje en DB.wa.mensajes");
      ctx.textoFinal = a.payload.body;
      capturarToast(win.document, ctx.toasts, TOASTS.ejecutada, "5 · aprobar");
    },
  },
  {
    desde: 1020,
    nombre: "6 · la prueba: la bandeja, con la conversación que antes no existía, abierta",
    aplicar: (app, _f, ctx) => {
      if (!ctx.tel) return;
      app.ACTIONS["wa-abrir"](ctx.tel);
      ctx.ruta = RUTAS.comunicaciones;
    },
  },
  {
    desde: 1260,
    nombre: "7 · la segunda petición: la cita, con su tarjeta ya en pantalla",
    aplicar: (app, _f, ctx) => {
      const p = app.DB.pacientes.find((x) => x.nombre === PACIENTE_CITA);
      if (!p) throw new Error(`Replay · 7: el seed no trae a «${PACIENTE_CITA}»`);
      const chat = chatDe(app);
      chat.pacienteId = p.id;
      chat.mensajes = [];
      chat.mensajes.push({ rol: "user", texto: PREGUNTA_CITA });
      const r = app.responderVetGPT(PREGUNTA_CITA);
      if (!r.accion || r.accion.herramienta !== "create_appointment") {
        throw new Error("Replay · 7: la petición de cita no produjo una acción create_appointment");
      }
      chat.mensajes.push({ rol: "assistant", texto: r.texto, escribiendo: false, citas: r.citas, herramienta: null, accion: r.accion, opciones: r.opciones });
      app.ACCIONES_VIVAS.set(r.accion.id, r.accion);
      chat.estado = "libre";
      ctx.respuesta = r;
      ctx.ruta = RUTAS.asistente;
    },
  },
  {
    desde: CORTE.agenda,
    nombre: "7 · aprobar la cita: entra a la agenda y el titular recibe el aviso",
    aplicar: (app, _f, ctx, win) => {
      const a = accionDe(ctx, "7");
      const citas = app.DB.citas.length;
      const mensajes = app.DB.wa.mensajes.length;
      app.ACTIONS["accion-aprobar"](a.id);
      if (app.DB.citas.length !== citas + 1) throw new Error("Replay · 7: aprobar no creó la cita en DB.citas");
      if (app.DB.wa.mensajes.length !== mensajes + 1) throw new Error("Replay · 7: aprobar no envió el aviso por WhatsApp (pasos prometidos: cita + aviso)");
      const nueva = app.DB.citas[app.DB.citas.length - 1];
      ctx.inicioCita = new Date(nueva.inicio);
      capturarToast(win.document, ctx.toasts, TOASTS.cita, "7 · aprobar la cita");
      /* La agenda abre en la semana de la cita, en vista Semana (la vista por defecto de la app). */
      app.CAL.fecha = new Date(nueva.inicio);
      app.CAL.vista = "Semana";
      ctx.ruta = RUTAS.agenda;
    },
  },
];

export function aplicarReplay(win: VentanaAgentico, frame: number): CtxAgentico {
  const app = win.app;
  const ctx: CtxAgentico = { ruta: RUTAS.asistente, pregunta: null, respuesta: null, tel: null, textoFinal: null, inicioCita: null, toasts: [] };

  win.__RENDER_MUDO = true;
  try {
    resetEstado(win);
    app.reseed();
    app.ACTIONS["login-demo"]();
    /* Las propuestas del seed (Julián, Ana) pintarían «Propuestas pendientes» al pie del hilo; ver NOTAS.md. */
    app.DB.wa.propuestas = [];
    const chat = chatDe(app);
    chat.mensajes = [];
    chat.pacienteId = null;
    chat.entrada = "";
    chat.estado = "libre";
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
