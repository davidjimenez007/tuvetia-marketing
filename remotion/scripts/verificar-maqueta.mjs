// Verifica a mano —pero por script— los tres cambios de la maqueta (encargo maqueta-cambios-para-videos.md)
// en un navegador real sin cabeza, a dos viewports (1440×900 y 540×960), y deja stills en out/qa/maqueta/.
//
// Uso, desde remotion/:   node scripts/verificar-maqueta.mjs
// Necesita el chrome-headless-shell que Remotion ya descargó en node_modules/.remotion/ (sin Playwright,
// sin dependencias: CDP por WebSocket nativo de Node ≥ 22).
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HTML = pathToFileURL(resolve(raiz, "public/app/tuvetia-app.html")).href;
const CHROME = resolve(raiz, "node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe");
const SALIDA = resolve(raiz, "out/qa/maqueta");
const PUERTO = 9333;
const CSV1 = readFileSync(resolve(raiz, "public/app/_pruebas/catalogo-prueba-encabezados-raros.csv"), "utf8");
const CSV2 = readFileSync(resolve(raiz, "public/app/_pruebas/catalogo-prueba-repetidos.csv"), "utf8");
const VIEWPORTS = [[1440, 900], [540, 960]];

/* ── CDP mínimo ─────────────────────────────────────────────────────────────────────────────── */
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pend = new Map(); this.oyentes = new Map(); ws.onmessage = e => this.recibir(JSON.parse(e.data)); }
  recibir(m) {
    if (m.id) { const p = this.pend.get(m.id); this.pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    else for (const f of this.oyentes.get(m.method) || []) f(m.params);
  }
  send(method, params = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => this.pend.set(id, { res, rej })); }
  on(method, f) { const l = this.oyentes.get(method) || []; l.push(f); this.oyentes.set(method, l); }
  espera(method) { return new Promise(res => this.on(method, function una(p) { res(p); })); }
  async eval(expr) {
    const r = await this.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error("En la página: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result.value;
  }
}
const dormir = ms => new Promise(r => setTimeout(r, ms));

async function conectar() {
  for (let i = 0; i < 60; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PUERTO}/json`)).json();
      const pag = lista.find(t => t.type === "page");
      if (pag) { const ws = new WebSocket(pag.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; }); return new CDP(ws); }
    } catch { /* todavía no */ }
    await dormir(250);
  }
  throw new Error("No se pudo conectar al chrome-headless-shell");
}

/* ── El recorrido ───────────────────────────────────────────────────────────────────────────── */
const resultados = [];
let erroresConsola = [];
function ok(nombre, cond, detalle = "") { resultados.push({ nombre, ok: !!cond, detalle }); console.log(`${cond ? "  ✓" : "  ✗"} ${nombre}${detalle ? "  — " + detalle : ""}`); }

/* Empuja al chat lo que responderVetGPT devuelve, y registra la acción para poder aprobarla:
   el mismo comando que va en NOTAS-MAQUETA.md. */
const PREGUNTAR = q => `(q => { const r = app.responderVetGPT(q);
  app.CHAT.mensajes.push({ rol: "user", texto: q });
  app.CHAT.mensajes.push({ rol: "assistant", texto: r.texto, escribiendo: false, citas: r.citas, herramienta: null, accion: r.accion, opciones: r.opciones });
  if (r.accion) app.ACCIONES_VIVAS.set(r.accion.id, r.accion);
  app.CHAT.estado = "libre"; app.repintarChat(false); return r.accion ? r.accion.id : null; })(${JSON.stringify(q)})`;

async function recorrido(cdp, ancho, alto) {
  const dir = resolve(SALIDA, String(ancho));
  mkdirSync(dir, { recursive: true });
  /* Antes de cada still: los toasts se limpian (en la copia demo SIM.after es no-op y se acumulan),
     salvo cuando el toast es lo que se quiere ver; y lo que se quiere ver se trae a la vista. */
  const foto = async (nombre, { toasts = false, ver = null } = {}) => {
    await cdp.eval(`(() => { ${toasts ? "" : 'document.getElementById("avisos").innerHTML = "";'} ${ver ? `const el = document.querySelector(${JSON.stringify(ver)}); if (el) el.scrollIntoView({ block: "center" });` : ""} return 1; })()`);
    const r = await cdp.send("Page.captureScreenshot", { format: "png" }); writeFileSync(resolve(dir, nombre + ".png"), Buffer.from(r.data, "base64"));
  };
  const clic = sel => cdp.eval(`(() => { const b = document.querySelector(${JSON.stringify(sel)}); if (!b) return "no existe"; b.click(); return "ok"; })()`);
  const T = `[${ancho}×${alto}]`;
  console.log(`\n${T}`);

  await cdp.send("Emulation.setDeviceMetricsOverride", { width: ancho, height: alto, deviceScaleFactor: 1, mobile: false });
  const cargado = cdp.espera("Page.loadEventFired");
  await cdp.send("Page.navigate", { url: HTML });
  await cargado;
  await cdp.eval(`app.ACTIONS["login-demo"]()`);
  ok(`${T} entra como clínica demo`, (await cdp.eval(`app.UI.ruta`)) === "/dashboard/tablero");

  /* ── A · Informe para el titular desde la ficha ── */
  await cdp.eval(`app.nav("/dashboard/patients/p-1")`);
  const botonA = await cdp.eval(`(() => { const b = document.querySelector('button[data-act="informe-paciente"]'); return b ? { disabled: b.disabled, arg: b.dataset.arg, title: b.title } : null; })()`);
  ok(`${T} A · botón en la ficha de Luna, activo, apunta a la consulta más reciente aprobada (c-1)`, botonA && !botonA.disabled && botonA.arg === "c-1", JSON.stringify(botonA));
  await foto("A1-ficha-luna");
  await clic('button[data-act="informe-paciente"]');
  const textoInforme = await cdp.eval(`document.getElementById("informe-texto")?.value || ""`);
  ok(`${T} A · abre el mismo diálogo de informe (texto redactado con Luna y Mariana)`, /Luna/.test(textoInforme) && /Mariana/.test(textoInforme));
  await foto("A2-dialogo-informe");
  const antesWA = await cdp.eval(`app.DB.wa.mensajes.length`);
  await clic('button[data-act="enviar-informe"][data-arg$=":wa"]');
  const ultimoWA = await cdp.eval(`(m => ({ tel: m.tel, dir: m.dir, texto: m.texto.slice(0, 40) }))(app.DB.wa.mensajes[app.DB.wa.mensajes.length - 1])`);
  ok(`${T} A · «Enviar por WhatsApp» escribe en el hilo de Mariana Osorio (573104482210)`, (await cdp.eval(`app.DB.wa.mensajes.length`)) === antesWA + 1 && ultimoWA.tel === "573104482210" && ultimoWA.dir === "out", JSON.stringify(ultimoWA));
  await cdp.eval(`app.nav("/dashboard/comunicaciones"); app.ACTIONS["wa-abrir"]("573104482210")`);
  ok(`${T} A · el mensaje se ve en Comunicaciones`, await cdp.eval(`document.querySelector("#app").innerText.includes("Te cuento cómo le fue a Luna")`));
  await foto("A3-comunicaciones");
  const sinNota = await cdp.eval(`(app.DB.pacientes.find(p => !app.SEL.consultasDe(p.id).some(c => app.SEL.notaDe(c.id)?.estado === "approved")) || {}).id || null`);
  await cdp.eval(`app.nav("/dashboard/patients/${sinNota}")`);
  const botonA2 = await cdp.eval(`(() => { const b = document.querySelector('button[data-act="informe-paciente"]'); return b ? { disabled: b.disabled, title: b.title } : null; })()`);
  ok(`${T} A · paciente sin nota aprobada (${sinNota}): botón visible, deshabilitado y con tooltip`, botonA2 && botonA2.disabled && /Todavía no hay una nota aprobada/.test(botonA2.title), JSON.stringify(botonA2));
  await foto("A4-ficha-sin-nota");

  /* ── B · Importar catálogo ── */
  await cdp.eval(`app.IMP.reset(); app.nav("/dashboard/facturacion/inventario/importar")`);
  ok(`${T} B · paso 1: zona de arrastre con <input type="file"> real`, await cdp.eval(`!!document.querySelector('label[data-soltar] input[type="file"][data-act="imp-archivo"]')`));
  await foto("B1-paso1-archivo");
  const catAntes = await cdp.eval(`app.DB.catalogo.length`), movAntes = await cdp.eval(`app.DB.movimientos.length`);
  const imp1 = await cdp.eval(`(i => ({ paso: i.paso, mapeo: i.mapeo, filas: i.filas.length, nombre: i.archivo.nombre, enc: i.encabezados }))(app.importarDesdeTexto(${JSON.stringify(CSV1)}, "catalogo-prueba-encabezados-raros.csv", 271))`);
  ok(`${T} B · CSV con «;» y encabezados raros → paso 2, 7 filas, mapeo propuesto Producto→nombre, Valor→precio, Cantidad→unidades`,
    imp1.paso === 2 && imp1.filas === 7 && imp1.mapeo[0] === "nombre" && imp1.mapeo[1] === "precio" && imp1.mapeo[2] === "unidades", JSON.stringify(imp1));
  ok(`${T} B · paso 2 pinta un <select> por columna`, (await cdp.eval(`document.querySelectorAll('select[data-act="imp-mapeo"]').length`)) === 3);
  await foto("B2-paso2-mapeo");
  await cdp.eval(`app.IMP.paso = 3; app.render()`);
  await foto("B3-paso3-revisar");
  const r1 = await cdp.eval(`app.confirmarImportacion()`);
  const creado = await cdp.eval(`(i => i ? { precio: i.precio, unidades: i.unidades, tipo: i.tipo, stock: i.stock } : null)(app.DB.catalogo.find(i => i.nombre === "Meloxicam 1,5 mg/mL"))`);
  const conComa = await cdp.eval(`!!app.DB.catalogo.find(i => i.nombre === "Alimento gastrointestinal, lata 400 g")`);
  const conTilde = await cdp.eval(`!!app.DB.catalogo.find(i => i.nombre === "Solución salina 500 mL")`);
  ok(`${T} B · confirma: 7 creados, 0 actualizados, precio «62.000» → $62.000, comillas y tildes bien`,
    r1 && r1.creados === 7 && r1.actualizados === 0 && creado && creado.precio === 6200000 && creado.unidades === 12 && conComa && conTilde, JSON.stringify({ r1, creado, conComa, conTilde }));
  ok(`${T} B · cada existencia importada dejó una CARGA_INICIAL`, (await cdp.eval(`app.DB.movimientos.filter(m => m.tipo === "CARGA_INICIAL").length`)) === 7 && (await cdp.eval(`app.DB.catalogo.length`)) === catAntes + 7);
  ok(`${T} B · vuelve al inventario`, (await cdp.eval(`app.UI.ruta`)) === "/dashboard/facturacion/inventario");
  await foto("B4-inventario", { toasts: true });
  await cdp.eval(`app.nav("/dashboard/facturacion/inventario/movimientos")`);
  ok(`${T} B · «Carga inicial» aparece en Salidas y reservas`, await cdp.eval(`document.querySelector("#app").innerText.includes("Carga inicial")`));
  await foto("B5-movimientos");

  const imp2 = await cdp.eval(`(i => ({ paso: i.paso, mapeo: i.mapeo, filas: i.filas.length }))(app.importarDesdeTexto(${JSON.stringify(CSV2)}, "catalogo-prueba-repetidos.csv", 318))`);
  ok(`${T} B · CSV con SKU: mapeo completo (sku, nombre, tipo, precio, unidades, min)`,
    imp2.paso === 2 && ["sku", "nombre", "tipo", "precio", "unidades", "min"].every((c, i) => imp2.mapeo[i] === c), JSON.stringify(imp2.mapeo));
  await cdp.eval(`app.IMP.paso = 3; app.render()`);
  ok(`${T} B · el plan marca 2 «Actualiza» y 3 «Nuevo»`, (await cdp.eval(`document.querySelectorAll("#app .badge.neutro").length`)) === 2 && (await cdp.eval(`document.querySelectorAll("#app .badge.ok").length`)) === 3);
  await foto("B6-paso3-repetidos");
  const r2 = await cdp.eval(`app.confirmarImportacion()`);
  const med101 = await cdp.eval(`(i => ({ unidades: i.unidades, precio: i.precio }))(app.DB.catalogo.find(i => i.sku === "MED-101"))`);
  const med102 = await cdp.eval(`(i => ({ unidades: i.unidades, precio: i.precio }))(app.DB.catalogo.find(i => i.sku === "MED-102"))`);
  const ajustes = await cdp.eval(`app.DB.movimientos.filter(m => m.tipo === "AJUSTE" && /Importación/.test(m.nota)).map(m => m.cant)`);
  ok(`${T} B · repetidos: 2 actualizados (MED-101 18→30, MED-102 4→12) sin duplicar, 3 creados`,
    r2 && r2.actualizados === 2 && r2.creados === 3 && med101.unidades === 30 && med101.precio === 9900000 && med102.unidades === 12
    && (await cdp.eval(`app.DB.catalogo.filter(i => i.sku === "MED-101").length`)) === 1, JSON.stringify({ r2, med101, med102 }));
  ok(`${T} B · el cambio de existencias de los repetidos quedó como AJUSTE (+12, +8)`, ajustes.length === 2 && ajustes.includes(12) && ajustes.includes(8), JSON.stringify(ajustes));
  await cdp.eval(`app.nav("/dashboard/facturacion/inventario/movimientos")`);
  await foto("B7-movimientos-repetidos");

  await cdp.eval(`app.importarDesdeTexto("", "catalogo-caja.xlsx", 20480)`);
  ok(`${T} B · .xlsx: fixture con aviso «La maqueta no lee Excel»`, await cdp.eval(`app.IMP.fixture && document.querySelector("#app").innerText.includes("La maqueta no lee Excel")`));
  await foto("B8-xlsx-aviso");
  await cdp.eval(`app.IMP.paso = 3; app.render()`);
  ok(`${T} B · .xlsx: el botón de importar queda deshabilitado`, await cdp.eval(`document.querySelector('button[data-act="imp-confirmar"]')?.disabled === true`));
  await foto("B9-xlsx-paso3");

  /* El camino asíncrono real: FileReader, el <input type="file"> por el listener de `input`, y el drop. */
  const asinc = await cdp.eval(`(async () => { app.IMP.reset(); const f = new File([${JSON.stringify(CSV1)}], "asincrono.csv", { type: "text/csv" }); app.cargarArchivoImportado(f); await new Promise(r => setTimeout(r, 300)); return { paso: app.IMP.paso, nombre: app.IMP.archivo?.nombre, tam: app.IMP.archivo?.tam }; })()`);
  ok(`${T} B · cargarArchivoImportado(File) lee con FileReader y llega al paso 2 con nombre y tamaño reales`, asinc.paso === 2 && asinc.nombre === "asincrono.csv" && asinc.tam > 0, JSON.stringify(asinc));
  const porInput = await cdp.eval(`(async () => { app.IMP.reset(); app.nav("/dashboard/facturacion/inventario/importar");
    const dt = new DataTransfer(); dt.items.add(new File([${JSON.stringify(CSV2)}], "por-input.csv", { type: "text/csv" }));
    const inp = document.querySelector('input[data-act="imp-archivo"]'); inp.files = dt.files; inp.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise(r => setTimeout(r, 300)); return { paso: app.IMP.paso, nombre: app.IMP.archivo?.nombre }; })()`);
  ok(`${T} B · elegir archivo en el <input> dispara la lectura (listener global de input)`, porInput.paso === 2 && porInput.nombre === "por-input.csv", JSON.stringify(porInput));
  const porDrop = await cdp.eval(`(async () => { app.IMP.reset(); app.nav("/dashboard/facturacion/inventario/importar");
    const dt = new DataTransfer(); dt.items.add(new File([${JSON.stringify(CSV1)}], "soltado.csv", { type: "text/csv" }));
    const zona = document.querySelector("[data-soltar]"); zona.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: dt }));
    const resaltada = zona.classList.contains("sobre"); zona.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    await new Promise(r => setTimeout(r, 300)); return { resaltada, paso: app.IMP.paso, nombre: app.IMP.archivo?.nombre }; })()`);
  ok(`${T} B · arrastrar y soltar sobre la zona la resalta y lee el archivo`, porDrop.resaltada && porDrop.paso === 2 && porDrop.nombre === "soltado.csv", JSON.stringify(porDrop));
  await cdp.eval(`app.IMP.reset()`);

  /* ── C · Las tres acciones ── */
  await cdp.eval(`app.nav("/dashboard/asistente"); app.CHAT.pacienteId = null; app.CHAT.mensajes = []`);
  const idHueco = await cdp.eval(PREGUNTAR("Se me liberó un hueco de 30 minutos hoy, ¿a quién le ofrezco?"));
  ok(`${T} C.1 · la pregunta del hueco produce una tarjeta send_whatsapp_message`, !!idHueco && (await cdp.eval(`app.ACCIONES_VIVAS.get(${JSON.stringify(idHueco)}).herramienta`)) === "send_whatsapp_message");
  await foto("C1-tarjeta-hueco", { ver: ".accion" });
  const waAntes = await cdp.eval(`app.DB.wa.mensajes.length`);
  const bodyHueco = await cdp.eval(`app.ACCIONES_VIVAS.get(${JSON.stringify(idHueco)}).payload.body`);
  await clic(`button[data-act="accion-aprobar"][data-arg="${idHueco}"]`);
  const ultimoHueco = await cdp.eval(`(m => ({ texto: m.texto, tel: m.tel }))(app.DB.wa.mensajes[app.DB.wa.mensajes.length - 1])`);
  ok(`${T} C.1 · aprobar el hueco SÍ manda el mensaje: entra a DB.wa.mensajes con el texto de la tarjeta`, (await cdp.eval(`app.DB.wa.mensajes.length`)) === waAntes + 1 && ultimoHueco.texto === bodyHueco && /^\d{10,}$/.test(ultimoHueco.tel), JSON.stringify(ultimoHueco).slice(0, 120));
  ok(`${T} C.1 · la tarjeta muestra los pasos hechos y el botón «Ver la conversación»`, await cdp.eval(`document.querySelector("#app").innerText.includes("Ver la conversación")`));
  await foto("C1-ejecutada", { ver: ".accion" });

  await cdp.eval(`app.CHAT.pacienteId = "p-1"; app.CHAT.mensajes = []`);
  const idAlergia = await cdp.eval(PREGUNTAR("¿Qué alergias tiene Luna?"));
  const campos = await cdp.eval(`({ input: !!document.querySelector('input[data-act="accion-campo"][data-arg$=":alergeno"]'), select: !!document.querySelector('select[data-act="accion-campo"][data-arg$=":severidad"]'), guion: document.querySelector("#app").innerText.includes("—") })`);
  ok(`${T} C.2 · la tarjeta de alergia trae el alérgeno editable y la severidad como <select>`, campos.input && campos.select, JSON.stringify(campos));
  await foto("C2-tarjeta-alergia", { ver: ".accion" });
  const alAntes = await cdp.eval(`app.SEL.alergiasDe("p-1").length`);
  await clic(`button[data-act="accion-aprobar"][data-arg="${idAlergia}"]`);
  const guarda = await cdp.eval(`({ toastMal: !!document.querySelector(".toast.mal"), estado: app.ACCIONES_VIVAS.get(${JSON.stringify(idAlergia)}).estado, alergias: app.SEL.alergiasDe("p-1").length })`);
  ok(`${T} C.2 · aprobar con el alérgeno en blanco NO ejecuta: toast en tono mal y la tarjeta sigue propuesta`, guarda.toastMal && guarda.estado === "proposed" && guarda.alergias === alAntes, JSON.stringify(guarda));
  await foto("C2-guarda-alergeno-vacio", { toasts: true, ver: ".accion" });
  await cdp.eval(`(() => { const i = document.querySelector('input[data-act="accion-campo"][data-arg$=":alergeno"]'); i.value = "Ibuprofeno"; i.dispatchEvent(new Event("input", { bubbles: true }));
    const s = document.querySelector('select[data-act="accion-campo"][data-arg$=":severidad"]'); s.value = "severe"; s.dispatchEvent(new Event("change", { bubbles: true })); })()`);
  await clic(`button[data-act="accion-aprobar"][data-arg="${idAlergia}"]`);
  const nueva = await cdp.eval(`(a => a ? { alergeno: a.alergeno, severidad: a.severidad, patientId: a.patientId } : null)(app.DB.alergias[app.DB.alergias.length - 1])`);
  ok(`${T} C.2 · con alérgeno escrito y severidad severa, la alergia entra a DB.alergias de Luna`, nueva && nueva.alergeno === "Ibuprofeno" && nueva.severidad === "severe" && nueva.patientId === "p-1" && (await cdp.eval(`app.SEL.alergiasDe("p-1").length`)) === alAntes + 1, JSON.stringify(nueva));
  await foto("C2-ejecutada", { ver: ".accion" });
  await cdp.eval(`app.nav("/dashboard/patients/p-1")`);
  ok(`${T} C.2 · la ficha muestra Ibuprofeno en la banda roja de alergia severa`, await cdp.eval(`(document.querySelector(".aviso.mal")?.innerText || "").includes("Ibuprofeno")`));
  await foto("C2-ficha-con-alergia");

  await cdp.eval(`app.nav("/dashboard/asistente"); app.CHAT.pacienteId = "p-1"; app.CHAT.mensajes = []`);
  const idCita = await cdp.eval(PREGUNTAR("Agendame un control para Luna la próxima semana"));
  const pasosCita = await cdp.eval(`app.ACCIONES_VIVAS.get(${JSON.stringify(idCita)}).pasos`);
  ok(`${T} C.3 · la cita promete sólo lo que hace: crear la cita y avisar por WhatsApp (sin invitación de calendario)`, pasosCita.length === 2 && !/nvitar/.test(pasosCita.join(" ")), JSON.stringify(pasosCita));
  await cdp.eval(`(() => { const i = document.querySelector('input[data-act="accion-campo"][data-arg$=":titulo"]'); i.value = "Control de dermatitis"; i.dispatchEvent(new Event("input", { bubbles: true })); })()`);
  const citasAntes = await cdp.eval(`app.DB.citas.length`), waAntes2 = await cdp.eval(`app.DB.wa.mensajes.length`);
  await clic(`button[data-act="accion-aprobar"][data-arg="${idCita}"]`);
  const cita = await cdp.eval(`(c => ({ titulo: c.titulo, pacienteId: c.pacienteId, inicio: String(c.inicio) }))(app.DB.citas[app.DB.citas.length - 1])`);
  const avisoCita = await cdp.eval(`(m => ({ tel: m.tel, texto: m.texto }))(app.DB.wa.mensajes[app.DB.wa.mensajes.length - 1])`);
  ok(`${T} C.3 · aprobar crea la cita con el motivo editado y manda el aviso a Mariana`, (await cdp.eval(`app.DB.citas.length`)) === citasAntes + 1 && cita.titulo === "Control de dermatitis" && cita.pacienteId === "p-1"
    && (await cdp.eval(`app.DB.wa.mensajes.length`)) === waAntes2 + 1 && avisoCita.tel === "573104482210" && /te confirmamos la cita de Luna/.test(avisoCita.texto), JSON.stringify({ cita, aviso: avisoCita.texto.slice(0, 90) }));
  ok(`${T} C.3 · los pasos hechos son exactamente dos`, (await cdp.eval(`app.ACCIONES_VIVAS.get(${JSON.stringify(idCita)}).pasosHechos.length`)) === 2);
  await foto("C3-ejecutada", { ver: ".accion" });
  await cdp.eval(`(() => { const c = app.DB.citas[app.DB.citas.length - 1]; app.CAL.vista = "Día"; app.CAL.fecha = new Date(c.inicio); app.nav("/dashboard/calendario"); })()`);
  ok(`${T} C.3 · la cita está en la agenda`, await cdp.eval(`document.querySelector("#app").innerText.includes("Control de dermatitis")`));
  await foto("C3-agenda");

  await cdp.eval(`app.nav("/dashboard/comunicaciones"); app.ACTIONS["wa-abrir"]("573156629034")`);
  await foto("C4-bandeja-propuesta", { ver: ".accion" });
  await clic('button[data-act="accion-aprobar"][data-arg="ac-1"]');
  const ac1 = await cdp.eval(`(a => ({ estado: a.estado, destino: a.destino }))(app.DB.wa.propuestas.find(x => x.id === "ac-1"))`);
  ok(`${T} C.4 · aprobar en la bandeja deja destino a Comunicaciones`, ac1.estado === "executed" && ac1.destino?.href === "/dashboard/comunicaciones", JSON.stringify(ac1));
  await foto("C4-bandeja-ejecutada");

  /* ── Smoke: todas las rutas sin parámetros, buscando artefactos (el app.smoke() de la maqueta
        usa el hash y el parche demo lee __RUTA_DEMO, así que acá se recorre con app.nav). ── */
  const smoke = await cdp.eval(`(() => { const ART = [/Algo se rompió al pintar/, /\\[object Object\\]/, /\\bundefined\\b/, /\\bNaN\\b/]; const malas = []; let n = 0;
    for (const r of app.ROUTES) { if (r.p.includes(":") || r.capa === "plataforma" || r.capa === "acceso") continue; app.nav(r.p); n++;
      const t = document.getElementById("app").innerText || ""; const a = ART.find(re => re.test(t)); if (a) malas.push(r.p + " → " + a); }
    app.nav("/dashboard/tablero"); return { n, malas }; })()`);
  ok(`${T} smoke · ${smoke.n} rutas de la clínica sin artefactos`, smoke.malas.length === 0, smoke.malas.join(" · "));
}

/* ── Arranque ───────────────────────────────────────────────────────────────────────────────── */
if (!existsSync(CHROME)) { console.error("No está el chrome-headless-shell de Remotion:", CHROME); process.exit(2); }
mkdirSync(SALIDA, { recursive: true });
const perfil = resolve(SALIDA, ".perfil-chrome");
const chrome = spawn(CHROME, [`--remote-debugging-port=${PUERTO}`, `--user-data-dir=${perfil}`, "--allow-file-access-from-files", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
try {
  const cdp = await conectar();
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable");
  cdp.on("Runtime.exceptionThrown", p => erroresConsola.push("excepción: " + (p.exceptionDetails.exception?.description || p.exceptionDetails.text)));
  cdp.on("Runtime.consoleAPICalled", p => { if (p.type === "error" || p.type === "warning") erroresConsola.push(`${p.type}: ${p.args.map(a => a.value ?? a.description ?? "").join(" ")}`); });
  for (const [w, h] of VIEWPORTS) await recorrido(cdp, w, h);
  ok("consola sin errores ni advertencias en los dos recorridos", erroresConsola.length === 0, erroresConsola.slice(0, 5).join(" | "));
} finally {
  chrome.kill();
}
const fallas = resultados.filter(r => !r.ok);
writeFileSync(resolve(SALIDA, "resultados.json"), JSON.stringify({ cuando: new Date().toISOString(), resultados, erroresConsola }, null, 2));
console.log(`\n${fallas.length ? "✗ " + fallas.length + " falla(s)" : "✓ todo pasa"} · ${resultados.length} comprobaciones · stills en ${SALIDA}`);
process.exit(fallas.length ? 1 : 0);
