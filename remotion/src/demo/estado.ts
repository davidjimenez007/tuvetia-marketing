/**
 * DemoSaaS · estadoEn(frame): el replay puro de §2.4.
 *
 * Cada frame se reconstruye desde cero: reseed → seedDemo → acciones reales de la app
 * en orden (sólo las de desde <= frame) → VIVO por frame → nav síncrono final.
 * Remotion renderiza en varias pestañas que arrancan en frames arbitrarios; por eso
 * nada de acá puede depender de lo que quedó del frame anterior.
 */
import { GRABACION, MOTIVO_CONSULTA, TIPEO } from "./guion";
import type { AppTuvetia, CtxReplay, VentanaApp } from "./guion";
import { aplicarVivo, segundosDeGrabacion } from "./vivo";

interface Paso {
  desde: number;
  nombre: string;
  aplicar(app: AppTuvetia, win: VentanaApp, frame: number, ctx: CtxReplay): void;
}

const evFalso = (): Event => ({ preventDefault: () => undefined }) as unknown as Event;

/** Caracteres tipeados del motivo en este frame (1 cada 2 frames desde f514). */
export function motivoTipeado(frame: number): string {
  if (frame < TIPEO.f0) return "";
  const n = Math.floor((frame - TIPEO.f0) / TIPEO.cadencia) + 1;
  return MOTIVO_CONSULTA.slice(0, Math.min(MOTIVO_CONSULTA.length, n));
}

/* ── Los pasos del guion (§5), en orden. Acciones REALES de la app + rutas ───────────────── */
const PASOS: Paso[] = [
  {
    desde: 0,
    nombre: "1.1 entrar como clínica demo (pasada 6: sin login en cámara)",
    aplicar(app, _win, _frame, ctx) {
      app.ACTIONS["login-demo"]();
      /* La pastilla «Facturado este mes» no viene visible por defecto y el guion la
         necesita en 1.2 (hover) y en 3.3 (anillo). Entra en lugar de «Pacientes» para
         que la fila queden 4 pastillas completas dentro de la ventana — la misma
         personalización que un admin hace desde «Arma tu tablero». Ver NOTAS.md. */
      const facturado = app.DB.tablero.metricas.find((x) => x.id === "facturado-mes");
      if (facturado) facturado.visible = true;
      const pacientes = app.DB.tablero.metricas.find((x) => x.id === "pacientes");
      if (pacientes) pacientes.visible = false;
      ctx.ruta = "/dashboard/tablero";
    },
  },
  {
    desde: 192,
    nombre: "1.3 agenda en vista mes",
    aplicar(app, _win, _frame, ctx) {
      app.CAL.vista = "Mes";
      ctx.ruta = "/dashboard/calendario";
    },
  },
  {
    desde: 318,
    nombre: "1.3 cambiar a la vista de semana",
    aplicar(app) {
      app.ACTIONS["cal-vista"]("Semana");
    },
  },
  {
    desde: 352,
    nombre: "1.3 cambiar a la vista de día",
    aplicar(app) {
      app.ACTIONS["cal-vista"]("Día");
    },
  },
  {
    desde: 456,
    nombre: "2.1 abrir cajón de nueva consulta",
    aplicar(app) {
      app.ACTIONS["nueva-consulta"]();
    },
  },
  {
    desde: 486,
    nombre: "2.1 elegir a Luna",
    aplicar(_app, win) {
      const sel = win.document.querySelector<HTMLSelectElement>("#cpp");
      if (sel) sel.value = "p-1";
    },
  },
  {
    desde: 512,
    nombre: "2.1 tipear el motivo",
    aplicar(_app, win, frame) {
      const campo = win.document.querySelector<HTMLInputElement>("#cmm");
      if (campo) campo.value = motivoTipeado(frame);
    },
  },
  {
    desde: 592,
    nombre: "2.1 crear la consulta (Mariana sin consentimiento)",
    aplicar(app, win, _frame, ctx) {
      const o = app.DB.titulares.find((t) => t.id === "o-1");
      if (o) o.consentimiento = false;
      const form = win.document.querySelector<HTMLFormElement>("#form-cons");
      app.ACTIONS["crear-consulta"](undefined, evFalso(), form);
      ctx.idConsulta = app.DB.consultas[0].id;
    },
  },
  {
    desde: 690,
    nombre: "2.2 el titular autoriza (la grabación queda en el notch)",
    aplicar(app, _win, _frame, ctx) {
      if (!ctx.idConsulta) return;
      app.ACTIONS.consentir(ctx.idConsulta);
      /* Sin navegar: el vet sigue en la agenda y la grabación corre de fondo. */
      ctx.ruta = "/dashboard/calendario";
    },
  },
  {
    desde: 896,
    nombre: "2.3 pacientes mientras el notch graba",
    aplicar(_app, _win, _frame, ctx) {
      ctx.ruta = "/dashboard/patients";
    },
  },
  {
    desde: 926,
    nombre: "2.3 la ficha de Luna",
    aplicar(_app, _win, _frame, ctx) {
      ctx.ruta = "/dashboard/patients/p-1";
    },
  },
  {
    desde: 978,
    nombre: "2.3 abrir la consulta en curso (cockpit)",
    aplicar(_app, _win, _frame, ctx) {
      if (ctx.idConsulta) ctx.ruta = `/dashboard/consultas/${ctx.idConsulta}`;
    },
  },
  {
    desde: GRABACION.finTranscribiendo,
    nombre: "2.5 cierre de la grabación (mismos efectos que terminarGrabacion)",
    aplicar(app, _win, _frame, ctx) {
      const id = ctx.idConsulta;
      if (!id) return;
      const c = app.DB.consultas.find((x) => x.id === id);
      app.DB.transcripciones[id] = app.GUION_POR_DEFECTO.join("\n");
      if (c) {
        c.estado = "review";
        c.audioSeg = segundosDeGrabacion(GRABACION.terminar);
      }
      app.generarNotaSOAP(id);
    },
  },
  {
    desde: 1447,
    nombre: "2.7 confirmar que revisó la alergia",
    aplicar(app) {
      app.UI.gateOk = true;
    },
  },
  {
    desde: 1492,
    nombre: "2.7 aprobar la nota",
    aplicar(app, _win, _frame, ctx) {
      if (ctx.idConsulta) app.ACTIONS["aprobar-nota"](ctx.idConsulta);
    },
  },
  {
    desde: 1592,
    nombre: "3.1 abrir el informe para el titular",
    aplicar(app, _win, _frame, ctx) {
      if (ctx.idConsulta) app.ACTIONS.informe(ctx.idConsulta);
    },
  },
  {
    desde: 1678,
    nombre: "3.1 enviar el informe por WhatsApp",
    aplicar(app, _win, _frame, ctx) {
      if (ctx.idConsulta) app.ACTIONS["enviar-informe"](`${ctx.idConsulta}:wa`);
    },
  },
  {
    desde: 1762,
    nombre: "3.2 facturar lo recetado",
    aplicar(app, _win, _frame, ctx) {
      if (!ctx.idConsulta) return;
      app.ACTIONS["facturar-recetado"](ctx.idConsulta);
      /* El emparejador de la app busca el nombre del fármaco en el plan, y el plan dice
         «Antiemético según peso» — ningún nombre comercial. El antiemético del catálogo
         es el maropitant: entra acá a mano, como lo agregaría el vet. Ver NOTAS.md. */
      const anti = app.DB.catalogo.find(
        (i) => i.tipo === "MEDICAMENTO" && i.nombre.startsWith("Maropitant"),
      );
      if (anti) app.CARRITO.agregar(anti.id);
      ctx.ruta = "/dashboard/facturacion/nueva";
    },
  },
  {
    desde: 1882,
    nombre: "3.2 guardar el borrador de la factura",
    aplicar(app, _win, _frame, ctx) {
      app.ACTIONS["guardar-borrador"]();
      ctx.idFactura = app.DB.facturas[0].id;
      ctx.ruta = `/dashboard/facturacion/${ctx.idFactura}`;
    },
  },
  {
    desde: 1914,
    nombre: "3.2 aprobar: emitir el borrador",
    aplicar(app, _win, _frame, ctx) {
      if (ctx.idFactura) app.ACTIONS["emitir-borrador"](ctx.idFactura);
    },
  },
  {
    desde: 1948,
    nombre: "3.2 enviar la factura al cliente",
    aplicar(app, win, _frame, ctx) {
      if (!ctx.idFactura) return;
      app.ACTIONS["enviar-factura"](ctx.idFactura);
      /* La acción real marca la entrega y avisa; el cierre del video termina en el chat
         de Mariana, así que la factura queda además registrada en la conversación de
         WhatsApp — pedido de la revisión del 3-sep. Ver NOTAS.md. */
      app.DB.wa.mensajes.push({
        id: "w-demo-factura",
        tel: "573104482210",
        dir: "out",
        texto: `Te comparto la factura de la consulta de Luna de hoy. Cualquier duda me escribes por acá. — ${app.DB.clinica.nombre}`,
        cuando: new win.Date(),
        leido: null,
        entregado: new win.Date(),
        fallo: null,
      });
    },
  },
  {
    desde: 1982,
    nombre: "3.3 el chat del cliente: resumen + factura PDF",
    aplicar(app, _win, _frame, ctx) {
      app.COM.tel = "573104482210";
      ctx.ruta = "/dashboard/comunicaciones";
    },
  },
  /* El cierre por pares: cada cambio de ruta ocurre BAJO su interludio, así la
     pantalla nueva aparece justo cuando la frase la anuncia. */
  {
    desde: 2050,
    nombre: "4.1 tablero movido (bajo «Todo se conecta solo»)",
    aplicar(_app, _win, _frame, ctx) {
      ctx.ruta = "/dashboard/tablero";
    },
  },
  {
    desde: 2120,
    nombre: "4.1 ventas (bajo «La caja, al día»)",
    aplicar(_app, _win, _frame, ctx) {
      ctx.ruta = "/dashboard/facturacion";
    },
  },
  {
    desde: 2172,
    nombre: "4.1 inventario (bajo «El stock se descuenta solo»)",
    aplicar(_app, _win, _frame, ctx) {
      ctx.ruta = "/dashboard/facturacion/inventario";
    },
  },
  {
    desde: 2225,
    nombre: "4.1 comunicaciones (bajo «El WhatsApp, ordenado»)",
    aplicar(app, _win, _frame, ctx) {
      app.COM.tel = "573104482210";
      ctx.ruta = "/dashboard/comunicaciones";
    },
  },
  {
    desde: 2278,
    nombre: "4.1 pacientes (bajo «La historia de cada paciente»)",
    aplicar(_app, _win, _frame, ctx) {
      ctx.ruta = "/dashboard/patients";
    },
  },
];

/** Devuelve UI/VIVO/CARRITO/CAL/COM/FL/ACC/CHAT/overlays al estado de arranque de la app.
 *  seedDemo() reasigna DB, pero estos singletons viven fuera y hay que resetearlos a mano. */
function resetEstado(win: VentanaApp): void {
  const app = win.app;
  app.cerrarTodo();
  app.resetWZ();
  Object.assign(app.UI, {
    sesion: null,
    tema: "claro",
    barraChica: false,
    barraMovil: false,
    ruta: "/login",
    query: {},
    histTab: "consultas",
    histQ: "",
    rielPlegado: false,
    rielClinicaPlegado: false,
    tiraAbierta: false,
    hoyAbierto: false,
    capturaAbierta: true,
    gateOk: false,
    soapEdit: {},
    menuAbierto: null,
  });
  Object.assign(app.VIVO, {
    fase: "inactiva",
    consultaId: null,
    pacienteNombre: null,
    segundos: 0,
    pausada: false,
    estable: "",
    provisional: "",
    guion: [],
    idx: 0,
    notas: "",
    sugerencias: "",
    alergias: [],
    pensando: false,
    llamadas: 0,
    techo: 12,
    alerta: false,
    panelAbierto: false,
    tab: "transcripcion",
    tabCockpit: "consulta",
    arrastre: { x: 0, y: 0 },
  });
  Object.assign(app.CHAT, {
    hiloId: null,
    pacienteId: null,
    mensajes: [],
    estado: "libre",
    entrada: "",
    adjuntos: [],
    dockAbierto: false,
    dockMensajes: [],
    dockEstado: "libre",
  });
  app.CARRITO.reset(null);
  const hoy = new win.Date();
  hoy.setHours(0, 0, 0, 0);
  Object.assign(app.CAL, {
    vista: "Semana",
    fecha: hoy,
    mes: `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`,
    vets: null,
    q: "",
    filtro: "todas",
  });
  Object.assign(app.COM, {
    tel: null,
    borrador: "",
    sugiriendo: false,
    accionPendiente: null,
    correoId: null,
    segmento: "todos",
  });
  Object.assign(app.FL, {
    pacientesQ: "",
    pacientesEspecie: "",
    consultasQ: "",
    consultasNota: "",
    consultasOrden: "desc",
    titularesQ: "",
    ventasQ: "",
    ventasEstado: "",
    ventasTipo: "",
    ventasTodo: true,
    ventasPag: 1,
    ventasPorPag: 10,
    invQ: "",
    invCat: "",
    invTipo: "",
  });
  Object.assign(app.ACC, {
    email: "",
    enviado: false,
    codigo: "",
    usarCodigo: false,
    error: null,
    paseCodigo: null,
    errorPuerta: null,
  });
}

/**
 * El replay completo de un frame. Deja la app pintada (nav síncrono al final)
 * y devuelve el contexto con los ids dinámicos y la ruta del frame.
 */
export function aplicarReplay(win: VentanaApp, frame: number): CtxReplay {
  const app = win.app;
  const ctx: CtxReplay = { idConsulta: null, idFactura: null, ruta: "/login" };

  win.__RENDER_MUDO = true;
  try {
    resetEstado(win);
    app.reseed();
    app.seedDemo();
    app.DB.onboardingHecho = true;

    for (const paso of PASOS) {
      if (paso.desde <= frame) paso.aplicar(app, win, frame, ctx);
    }
    aplicarVivo(app, frame, ctx.idConsulta);
  } finally {
    win.__RENDER_MUDO = false;
  }

  app.nav(ctx.ruta, true);
  return ctx;
}
