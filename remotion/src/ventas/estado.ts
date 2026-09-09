/**
 * DemoVentas · estadoEn(frame): el replay puro (plantilla §2) sobre el iframe de escritorio.
 *
 * Cada frame se reconstruye desde cero: reset de singletons → reseed → login-demo → IMP.reset →
 * beats en orden (sólo los de desde <= frame) → nav síncrono final → toasts por ventana. Nada
 * depende del frame anterior: Remotion renderiza en varias pestañas que arrancan donde quieren.
 *
 * La cadena de datos (encargo §3) se resuelve acá, nunca a mano: el ítem protagonista por su
 * nombre en el catálogo, la consulta por la nota aprobada cuyo plan lo receta, el número de
 * factura leyendo DB.facturas[0] después de emitir. Si el seed cambia y la cadena se rompe, el
 * replay revienta con el nombre del beat: el encargo pide parar, no forzar otro ítem.
 */
import { resetEstado } from "../demo/estado";
import { ACTOS, CLIC, COLUMNA_MIN, CORTE, ITEM_PROTAGONISTA, NOMBRE_CSV, RUTAS, TEXTO_CSV, TOASTS } from "./guion";
import type { AppVentas, CtxVentas, VentanaVentas } from "./tipos";

interface Beat {
  desde: number;
  nombre: string;
  aplicar(app: AppVentas, frame: number, ctx: CtxVentas, win: VentanaVentas): void;
}

/** Guarda el toast que la app acaba de emitir y limpia #avisos: la línea de tiempo decide cuándo
 *  se ve (plantilla §2), pero el texto lo escribió la app. */
function capturarToast(win: VentanaVentas, ctx: CtxVentas, f0: number, f1: number, beat: string): void {
  const avisos = win.document.getElementById("avisos");
  if (!avisos || !avisos.firstElementChild) {
    throw new Error(`Replay · ${beat}: la app no emitió ningún toast`);
  }
  ctx.toasts.push({ f0, f1, html: avisos.innerHTML });
  avisos.innerHTML = "";
}

/* ── Los beats (encargo §5), en orden ────────────────────────────────────────────────────── */
export const BEATS: Beat[] = [
  {
    desde: 0,
    nombre: "1 · la pantalla de importar, vacía; se resuelve la cadena de datos",
    aplicar: (app, _f, ctx) => {
      ctx.ruta = RUTAS.importar;
      app.IMP.reset();
      const item = app.DB.catalogo.find((i) => i.nombre.toLowerCase().indexOf(ITEM_PROTAGONISTA.toLowerCase()) === 0);
      if (!item) throw new Error(`Replay · 1: el catálogo no trae el ítem protagonista («${ITEM_PROTAGONISTA}»)`);
      /* El mismo emparejamiento que usa facturar-recetado: la primera palabra del nombre, en el plan. */
      const clave = item.nombre.split(" ")[0].toLowerCase();
      const nota = app.DB.notas.find((n) => n.estado === "approved" && (n.p || "").toLowerCase().indexOf(clave) >= 0);
      if (!nota) throw new Error(`Replay · 1: ninguna nota aprobada receta «${clave}» en su plan: la cadena de datos se rompió`);
      ctx.idItem = item.id;
      ctx.idConsulta = nota.consultaId;
    },
  },
  {
    desde: CORTE.entraArchivo,
    nombre: "2 · entra el CSV (entrada síncrona, sin FileReader)",
    aplicar: (app, _f, ctx) => {
      const imp = app.importarDesdeTexto(TEXTO_CSV, NOMBRE_CSV, TEXTO_CSV.length);
      if (imp.paso !== 2 || imp.error) throw new Error(`Replay · 2: la importación no llegó al paso 2 (${imp.error ?? "paso " + imp.paso})`);
      const idx = imp.encabezados.findIndex((h) => h.trim().toLowerCase() === COLUMNA_MIN.toLowerCase());
      if (idx < 0) throw new Error(`Replay · 2: el CSV no trae la columna «${COLUMNA_MIN}» que el vet corrige en el acto 3`);
      if (imp.mapeo[String(idx)]) throw new Error(`Replay · 2: «${COLUMNA_MIN}» ya se mapeó sola (${imp.mapeo[String(idx)]}); el acto 3 no tendría nada que corregir`);
      ctx.idxColumnaMin = idx;
      ctx.ruta = RUTAS.importar;
    },
  },
  {
    desde: CLIC.select,
    nombre: "3 · el vet manda la columna suelta a «Mínimo»",
    aplicar: (app, _f, ctx) => {
      if (ctx.idxColumnaMin === null) return;
      app.IMP.mapeo[String(ctx.idxColumnaMin)] = "min";
    },
  },
  {
    desde: CORTE.paso3,
    nombre: "3 · «Revisar»: la previsualización",
    aplicar: (app) => {
      app.IMP.paso = 3;
    },
  },
  {
    desde: CORTE.importa,
    nombre: "3 · «Importar»: entra al catálogo y deja movimientos",
    aplicar: (app, _f, ctx, win) => {
      const r = app.confirmarImportacion();
      if (!r) throw new Error("Replay · 3: confirmarImportacion no importó nada");
      ctx.importe = r;
      capturarToast(win, ctx, TOASTS.importado.f0, TOASTS.importado.f1, "3 · importar");
      /* confirmarImportacion ya navegó a Existencias: es lo que hace la app. */
      ctx.ruta = RUTAS.inventario;
    },
  },
  {
    desde: ACTOS.consulta,
    nombre: "5 · la consulta de Luna con el plan",
    aplicar: (_app, _f, ctx) => {
      ctx.ruta = `${RUTAS.consulta}/${ctx.idConsulta ?? ""}`;
    },
  },
  {
    desde: CORTE.carrito,
    nombre: "5 · «Facturar lo recetado»: el carrito ya armado",
    aplicar: (app, _f, ctx) => {
      if (!ctx.idConsulta) return;
      app.ACTIONS["facturar-recetado"](ctx.idConsulta);
      if (!app.CARRITO.lineas.some((l) => l.itemId === ctx.idItem)) {
        throw new Error("Replay · 5: el carrito no trae el ítem protagonista: la cadena de datos se rompió");
      }
      ctx.ruta = RUTAS.nuevaFactura;
    },
  },
  {
    desde: CORTE.emite,
    nombre: "6 · «Emitir»: factura real, stock descontado",
    aplicar: (app, _f, ctx, win) => {
      app.ACTIONS["emitir-factura"]();
      const f = app.DB.facturas[0];
      if (!f || !f.numero) throw new Error("Replay · 6: no hay factura emitida en DB.facturas[0]");
      ctx.idFactura = f.id;
      ctx.numeroFactura = f.numero;
      capturarToast(win, ctx, TOASTS.emitida.f0, TOASTS.emitida.f1, "6 · emitir");
      ctx.ruta = `${RUTAS.factura}/${f.id}`;
    },
  },
  {
    desde: ACTOS.bajo,
    nombre: "7 · Existencias: el ítem bajó solo",
    aplicar: (_app, _f, ctx) => {
      ctx.ruta = RUTAS.inventario;
    },
  },
  {
    desde: ACTOS.rastro,
    nombre: "8 · Movimientos: el rastro",
    aplicar: (_app, _f, ctx) => {
      ctx.ruta = RUTAS.movimientos;
    },
  },
];

/**
 * El replay completo de un frame sobre el iframe. Deja la app pintada (nav síncrono al final) con
 * los toasts que la línea de tiempo pide para ese frame, y devuelve el contexto.
 */
export function aplicarReplay(win: VentanaVentas, frame: number): CtxVentas {
  const app = win.app;
  const ctx: CtxVentas = {
    ruta: RUTAS.importar,
    idItem: null,
    idConsulta: null,
    idxColumnaMin: null,
    idFactura: null,
    numeroFactura: null,
    importe: null,
    toasts: [],
  };

  win.__RENDER_MUDO = true;
  try {
    resetEstado(win);
    app.reseed();
    /* login-demo siembra la DB (seedDemo), marca el onboarding hecho y abre la sesión de la
       Dra. Valentina Restrepo (admin). No se llama seedDemo() aparte: sería sembrar dos veces. */
    app.ACTIONS["login-demo"]();
    app.DB.wa.propuestas = [];
    for (const beat of BEATS) {
      if (beat.desde <= frame) beat.aplicar(app, frame, ctx, win);
    }
  } finally {
    win.__RENDER_MUDO = false;
  }

  app.nav(ctx.ruta, true);
  const avisos = win.document.getElementById("avisos");
  if (avisos) {
    avisos.innerHTML = ctx.toasts
      .filter((t) => frame >= t.f0 && frame < t.f1)
      .map((t) => t.html)
      .join("");
  }
  return ctx;
}
