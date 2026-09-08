/**
 * ExplainerRAG · estadoEn(frame): el replay puro (§2.4) sobre cualquiera de los dos iframes.
 *
 * Cada frame se reconstruye desde cero: reset de singletons → reseed → login-demo (que siembra
 * la DB y abre sesión) → beats en orden (sólo los de desde <= frame) → nav síncrono final.
 * Remotion renderiza en varias pestañas que arrancan en frames arbitrarios; nada de acá puede
 * depender del frame anterior, y el mismo replay corre en el escritorio y en el celular: por
 * eso el hilo que quedó escrito en uno es el que aparece en el otro.
 *
 * Los beats siguen la línea de tiempo de la orden de cambio v2 (§C, §C.3).
 */
import { resetEstado } from "../demo/estado";
import { ESCRITURA, PACIENTE_CONTEXTO, PREGUNTA_1, PREGUNTA_2 } from "./guion";
import { cortarPorCaracteres, cortarPorPalabras } from "./texto";
import type { AppExplainer, CtxExplainer, MensajeChat, Repregunta, VentanaExplainer } from "./tipos";

interface Beat {
  desde: number;
  nombre: string;
  aplicar(app: AppExplainer, frame: number, ctx: CtxExplainer): void;
}

const RUTA_ASISTENTE = "/dashboard/asistente";

function ultimoDelAsistente(app: AppExplainer, beat: string): MensajeChat {
  const m = app.CHAT.mensajes[app.CHAT.mensajes.length - 1];
  if (!m || m.rol !== "assistant") {
    throw new Error(`Replay · ${beat}: el último mensaje del hilo no es del asistente`);
  }
  return m;
}

/** La repregunta de la maqueta (parche §B de la orden v2). Si no está, el parche no se aplicó. */
function repreguntaMalassezia(app: AppExplainer): Repregunta {
  const rp = app.REPREGUNTAS?.malassezia;
  if (!rp) throw new Error("Replay: window.app.REPREGUNTAS.malassezia no existe (parche §B sin aplicar)");
  return rp;
}

/**
 * La nota con citas del seed, su consulta y su paciente: es lo que ata el contexto que se elige
 * en el acto 2 con la ficha que se abre en el acto 8 (orden v2 §C.2). Hoy es Luna (`p-1`,
 * consulta `c-1`, nota `n-1`). Si el seed cambiara y dejaran de coincidir, manda la nota: el
 * contexto se elige a partir de ella y el cursor la sigue por ctx.idPaciente.
 */
function resolverConsultaCitada(app: AppExplainer, ctx: CtxExplainer): void {
  const n = app.DB.notas.find((x) => (x.citas?.length ?? 0) > 0);
  if (!n) throw new Error("Replay: el seed no trae ninguna nota con citas");
  const c = app.getC(n.consultaId);
  if (!c) throw new Error(`Replay: la nota ${n.id} apunta a una consulta que no existe (${n.consultaId})`);
  ctx.idConsulta = n.consultaId;
  ctx.idPaciente = c.pacienteId;
  if (c.pacienteId !== PACIENTE_CONTEXTO) {
    console.warn(
      `Replay: la nota con citas es de ${c.pacienteId}, no de ${PACIENTE_CONTEXTO}: el contexto se elige a partir de la nota (anotar en NOTAS.md)`,
    );
  }
}

/* ── Los beats del guion (orden v2 §C), en orden ─────────────────────────────────────────── */
export const BEATS: Beat[] = [
  {
    desde: 0,
    nombre: "1 · el asistente, hilo vacío",
    aplicar: (app, _f, ctx) => {
      ctx.ruta = RUTA_ASISTENTE;
      resolverConsultaCitada(app, ctx);
    },
  },
  {
    /* La acción real: abre el diálogo «Contexto de la conversación» en #overlays. */
    desde: 150,
    nombre: "2 · se abre el selector de contexto",
    aplicar: (app) => {
      app.ACTIONS["selector-contexto"]();
    },
  },
  {
    /* La acción real: pacienteId, hiloId «p:…», cierra el diálogo y **vacía el hilo**. Por eso
       el contexto se elige antes de preguntar y nunca al revés (§C.2). */
    desde: 240,
    nombre: "2 · se elige a Luna",
    aplicar: (app, _f, ctx) => {
      app.ACTIONS["elegir-contexto"](ctx.idPaciente ?? PACIENTE_CONTEXTO);
    },
  },
  {
    desde: ESCRITURA.pregunta[0],
    nombre: "3 · se teclea la pregunta",
    aplicar: (app, f) => {
      app.CHAT.entrada = cortarPorCaracteres(PREGUNTA_1, f, ESCRITURA.pregunta[0], ESCRITURA.pregunta[1]);
    },
  },
  {
    /* La mitad de enviarChat que no depende de SIM: empuja el mensaje del vet, deja el estado
       en «pensando», vacía el compositor y fija PENSANDO_DESDE (sin eso, con el reloj congelado,
       la fila diría «Sigo en ello…»). La respuesta NO sale de acá: SIM es no-op. */
    desde: 450,
    nombre: "3 · se envía",
    aplicar: (app) => {
      app.enviarChat(PREGUNTA_1);
    },
  },
  {
    /* §C.3: la repregunta entra como cualquier mensaje del asistente, escribiéndose; los dos
       campos aparecen cuando el texto está completo. */
    desde: ESCRITURA.repregunta[0],
    nombre: "5 · la repregunta se escribe",
    aplicar: (app, f) => {
      const rp = repreguntaMalassezia(app);
      app.CHAT.mensajes.push({
        rol: "assistant",
        texto: cortarPorPalabras(rp.texto, f, ESCRITURA.repregunta[0], ESCRITURA.repregunta[1]),
        escribiendo: true,
        herramienta: null,
      });
      app.CHAT.estado = "escribiendo";
    },
  },
  {
    desde: ESCRITURA.repregunta[1],
    nombre: "5 · la repregunta con sus dos campos",
    aplicar: (app) => {
      const rp = repreguntaMalassezia(app);
      const m = ultimoDelAsistente(app, "5 · repregunta");
      m.texto = rp.texto;
      m.escribiendo = false;
      m.repregunta = rp;
      app.CHAT.estado = "libre";
    },
  },
  {
    desde: 690,
    nombre: "5 · «Perro»",
    aplicar: (app) => {
      ultimoDelAsistente(app, "5 · Perro").elegidas = { especie: "Perro" };
    },
  },
  {
    desde: 735,
    nombre: "5 · «Recurrente»",
    aplicar: (app) => {
      ultimoDelAsistente(app, "5 · Recurrente").elegidas = { especie: "Perro", recurrencia: "Recurrente" };
    },
  },
  {
    /* El mensaje de repregunta se queda arriba en el hilo; la respuesta entra debajo (§C.3). */
    desde: 960,
    nombre: "7 · «Consultando la literatura veterinaria…»",
    aplicar: (app) => {
      const r = app.responderVetGPT(PREGUNTA_1);
      app.CHAT.mensajes.push({
        rol: "assistant",
        texto: "",
        escribiendo: true,
        citas: r.citas,
        herramienta: r.herramienta,
      });
      app.CHAT.estado = "escribiendo";
    },
  },
  {
    /* Como en enviarChat real: la herramienta se apaga cuando empieza a llegar el texto. */
    desde: ESCRITURA.respuesta[0],
    nombre: "7 · la respuesta se escribe",
    aplicar: (app, f) => {
      const r = app.responderVetGPT(PREGUNTA_1);
      const m = ultimoDelAsistente(app, "7 · respuesta");
      m.herramienta = null;
      m.texto = cortarPorPalabras(r.texto, f, ESCRITURA.respuesta[0], ESCRITURA.respuesta[1]);
    },
  },
  {
    desde: ESCRITURA.respuesta[1],
    nombre: "7 · respuesta completa",
    aplicar: (app) => {
      const r = app.responderVetGPT(PREGUNTA_1);
      const m = ultimoDelAsistente(app, "7 · respuesta completa");
      m.texto = r.texto;
      m.escribiendo = false;
      m.opciones = r.opciones;
      m.accion = r.accion;
      app.CHAT.estado = "libre";
    },
  },
  {
    /* La lista agrupa por paciente y sólo abre el primer grupo; con el filtro por nombre se
       abren todos y se lista sólo el del paciente (es lo que haría el vet: buscarlo). */
    desde: 1200,
    nombre: "8 · la lista de consultas",
    aplicar: (app, _f, ctx) => {
      const p = ctx.idPaciente ? app.getP(ctx.idPaciente) : undefined;
      app.FL.consultasQ = p ? p.nombre : "";
      ctx.ruta = "/dashboard/consultas";
    },
  },
  {
    desde: 1260,
    nombre: "8 · la consulta con la nota citada",
    aplicar: (_app, _f, ctx) => {
      ctx.ruta = `/dashboard/consultas/${ctx.idConsulta ?? ""}`;
    },
  },
  {
    /* Sin teclear (§C): al volver, la segunda pregunta ya está enviada. */
    desde: 1320,
    nombre: "9 · vuelta al asistente, la segunda pregunta ya enviada",
    aplicar: (app, _f, ctx) => {
      ctx.ruta = RUTA_ASISTENTE;
      app.enviarChat(PREGUNTA_2);
    },
  },
  {
    desde: ESCRITURA.abstencion[0],
    nombre: "9 · la abstención se escribe",
    aplicar: (app, f) => {
      const r = app.responderVetGPT(PREGUNTA_2);
      app.CHAT.mensajes.push({
        rol: "assistant",
        texto: cortarPorPalabras(r.texto, f, ESCRITURA.abstencion[0], ESCRITURA.abstencion[1]),
        escribiendo: true,
        citas: r.citas,
        herramienta: null,
      });
      app.CHAT.estado = "escribiendo";
    },
  },
  {
    desde: ESCRITURA.abstencion[1],
    nombre: "9 · abstención completa, tres sugerencias",
    aplicar: (app) => {
      const r = app.responderVetGPT(PREGUNTA_2);
      const m = ultimoDelAsistente(app, "9 · abstención completa");
      m.texto = r.texto;
      m.escribiendo = false;
      m.opciones = r.opciones;
      app.CHAT.estado = "libre";
    },
  },
];

/**
 * El replay completo de un frame sobre un iframe. Deja la app pintada (nav síncrono al final)
 * y devuelve la ruta del frame y los ids dinámicos (consulta citada, paciente del contexto).
 */
export function aplicarReplay(win: VentanaExplainer, frame: number): CtxExplainer {
  const app = win.app;
  const ctx: CtxExplainer = { ruta: RUTA_ASISTENTE, idConsulta: null, idPaciente: null };

  win.__RENDER_MUDO = true;
  try {
    resetEstado(win);
    app.reseed();
    /* login-demo siembra la DB (seedDemo), marca el onboarding hecho y abre la sesión de la
       Dra. Valentina Restrepo (admin). No se llama seedDemo() aparte: sería sembrar dos veces. */
    app.ACTIONS["login-demo"]();
    /* Sin esto, «Propuestas pendientes» mete dos tarjetas de WhatsApp al pie del hilo. */
    app.DB.wa.propuestas = [];
    app.CHAT.hiloId = "general";
    app.CHAT.pacienteId = null;

    for (const beat of BEATS) {
      if (beat.desde <= frame) beat.aplicar(app, frame, ctx);
    }
  } finally {
    win.__RENDER_MUDO = false;
  }

  app.nav(ctx.ruta, true);
  /* Esta pieza no usa toasts. */
  const avisos = win.document.getElementById("avisos");
  if (avisos) avisos.innerHTML = "";
  return ctx;
}
