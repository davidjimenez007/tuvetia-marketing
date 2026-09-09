// Uso, desde remotion/:  node scripts/medir-pt-agentico.mjs
// Mide los puntos fijos (PT, relativos 0..1 de 1440×900) de DemoAgentico en el estado exacto del replay de
// cada acto: asistente vacío con el riel, pregunta precargada, respuesta de cartera con la tarjeta, tarjeta
// ejecutada, bandeja con la conversación nueva, cita y agenda. Sin columna de lectura: el chat ya es angosto.
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HTML = pathToFileURL(resolve(raiz, "public/app/tuvetia-app.html")).href;
const CHROME = resolve(raiz, "node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe");
const PUERTO = 9340;

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pend = new Map(); this.oyentes = new Map(); ws.onmessage = e => this.recibir(JSON.parse(e.data)); }
  recibir(m) { if (m.id) { const p = this.pend.get(m.id); this.pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } else for (const f of this.oyentes.get(m.method) || []) f(m.params); }
  send(method, params = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => this.pend.set(id, { res, rej })); }
  on(method, f) { const l = this.oyentes.get(method) || []; l.push(f); this.oyentes.set(method, l); }
  espera(method) { return new Promise(res => this.on(method, p => res(p))); }
  async eval(expr) { const r = await this.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error("En la página: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return r.result.value; }
}
const dormir = ms => new Promise(r => setTimeout(r, ms));
async function conectar() {
  for (let i = 0; i < 60; i++) {
    try { const lista = await (await fetch(`http://127.0.0.1:${PUERTO}/json`)).json(); const pag = lista.find(t => t.type === "page");
      if (pag) { const ws = new WebSocket(pag.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; }); return new CDP(ws); } } catch { /* aún no */ }
    await dormir(250);
  }
  throw new Error("sin conexión");
}
const PT = (sel, texto) => `(() => { const todos = [...document.querySelectorAll(${JSON.stringify(sel)})]; const el = ${texto ? `todos.find(e => (e.textContent||"").includes(${JSON.stringify(texto)}))` : "todos[0]"}; if (!el) return null; const r = el.getBoundingClientRect(); return { x: +((r.left + r.width / 2) / 1440).toFixed(3), y: +((r.top + r.height / 2) / 900).toFixed(3), x0: Math.round(r.left), y0: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; })()`;

const chrome = spawn(CHROME, [`--remote-debugging-port=${PUERTO}`, `--user-data-dir=${resolve(raiz, "out/qa/.perfil-pt-agentico")}`, "--allow-file-access-from-files", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
try {
  const cdp = await conectar();
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const cargado = cdp.espera("Page.loadEventFired"); await cdp.send("Page.navigate", { url: HTML }); await cargado;
  const mide = async (clave, sel, texto) => console.log(clave.padEnd(22), JSON.stringify(await cdp.eval(PT(sel, texto))));

  await cdp.eval(`app.ACTIONS["login-demo"](); app.DB.wa.propuestas = []; app.CHAT.mensajes = []; app.CHAT.pacienteId = null; app.CHAT.entrada = ""; app.nav("/dashboard/asistente")`);
  console.log("\n-- acto 1 · asistente vacío + riel");
  await mide("riel", ".riel-clinica"); await mide("rielAtencion", ".riel-clinica section", "Requiere atención"); await mide("rielResolver", 'button[data-arg="/dashboard/asistente?pedir=cobros"]');
  await mide("hiloCaja", ".hilo-caja"); await mide("compositor", ".compositor");
  console.log("riel scroll:", await cdp.eval(`(() => { const r = document.querySelector(".riel-clinica"); return r ? r.scrollHeight + "/" + r.clientHeight : "-"; })()`));
  console.log("bienvenida:", await cdp.eval(`(document.querySelector(".hilo-caja")?.innerText || "").slice(0, 160).replace(/\\n/g, " · ")`));

  console.log("\n-- acto 2 · pregunta precargada");
  await cdp.eval(`app.nav("/dashboard/asistente?pedir=cobros")`);
  await mide("compositor", ".compositor"); await mide("textarea", 'textarea[data-act="chat-input"]'); await mide("enviar", ".compositor button.enviar");
  console.log("textarea rows · alto · scrollH:", await cdp.eval(`(() => { const t = document.querySelector('textarea[data-act="chat-input"]'); return t.rows + " · " + Math.round(t.getBoundingClientRect().height) + " · " + t.scrollHeight; })()`));

  console.log("\n-- acto 2b · pensando");
  await cdp.eval(`(() => { const q = app.CHAT.entrada; app.CHAT.mensajes.push({ rol: "user", texto: q }); app.CHAT.entrada = ""; app.CHAT.estado = "pensando"; window.__q = q; app.nav("/dashboard/asistente"); })()`);
  await mide("msgUser", ".msg-user"); await mide("puntos", ".puntos"); await mide("compositorAbajo", ".compositor"); await mide("piePropone", ".hilo-caja p.xxs.faint", "propone");

  console.log("\n-- acto 3 · respuesta a medias (20 palabras)");
  await cdp.eval(`(() => { const r = app.responderVetGPT(window.__q); window.__r = r; const m = { rol: "assistant", texto: r.texto.split(/\\s+/).slice(0, 20).join(" "), escribiendo: true, citas: r.citas, herramienta: null }; app.CHAT.mensajes.push(m); app.CHAT.estado = "escribiendo"; app.nav("/dashboard/asistente"); })()`);
  await mide("msgBot", ".msg-bot"); await mide("bloques", ".msg-bot .bloques");

  console.log("\n-- acto 4 · respuesta completa + tarjeta");
  await cdp.eval(`(() => { const r = window.__r; const m = app.CHAT.mensajes[app.CHAT.mensajes.length - 1]; m.texto = r.texto; m.escribiendo = false; m.accion = r.accion; m.opciones = r.opciones; app.ACCIONES_VIVAS.set(r.accion.id, r.accion); app.CHAT.estado = "libre"; app.nav("/dashboard/asistente"); })()`);
  await mide("bloques", ".msg-bot .bloques"); await mide("tarjeta", ".accion"); await mide("cabTarjeta", ".accion .cab"); await mide("textareaBody", 'textarea[data-act="accion-campo"]'); await mide("pasos", ".accion .pasos"); await mide("aprobar", 'button[data-act="accion-aprobar"]'); await mide("leyenda", ".accion .pie p.sm.mut"); await mide("compositorAbajo", ".compositor"); await mide("piePropone", ".hilo-caja p.xxs.faint", "propone");
  console.log("scroller:", await cdp.eval(`(() => { let n = document.querySelector(".accion"); while (n) { const ov = getComputedStyle(n).overflowY; if ((ov === "auto" || ov === "scroll") && n.scrollHeight > n.clientHeight + 1) return n.className + " " + n.scrollHeight + "/" + n.clientHeight; n = n.parentElement; } return "ninguno"; })()`));

  console.log("\n-- acto 4b · frase añadida");
  await cdp.eval(`(() => { window.__r.accion.payload.body += " Si necesitas un plazo, escríbeme y lo cuadramos."; app.nav("/dashboard/asistente"); })()`);
  await mide("textareaBody", 'textarea[data-act="accion-campo"]'); console.log("textarea scrollH/clientH:", await cdp.eval(`(() => { const t = document.querySelector('textarea[data-act="accion-campo"]'); return t.scrollHeight + "/" + t.clientHeight; })()`));

  console.log("\n-- acto 5 · ejecutada");
  await cdp.eval(`app.ACTIONS["accion-aprobar"](window.__r.accion.id)`); await dormir(30);
  await mide("tarjeta", ".accion"); await mide("ejecutada", ".accion p.xs.semi.mut"); await mide("pasosHechos", ".accion ul.pasos"); await mide("toast", "#avisos .toast");
  console.log("toast:", await cdp.eval(`document.querySelector("#avisos .toast")?.innerText.replace(/\\n/g, " · ")`));
  await cdp.eval(`document.getElementById("avisos").innerHTML = ""`);

  console.log("\n-- acto 6 · bandeja");
  await cdp.eval(`(() => { const tel = String(window.__r.accion.payload.to).replace(/[^0-9]/g, ""); window.__tel = tel; app.ACTIONS["wa-abrir"](tel); app.nav("/dashboard/comunicaciones"); })()`);
  await mide("lista", ".col-lista"); await mide("convNueva", ".conv", "Andrés"); await mide("conv2", ".conv", "Ana"); await mide("cabAutonomia", ".entre span.xs.mut", "autonomía"); await mide("tabs", ".tabnav"); await mide("hilo", ".col-hilo"); await mide("cabHilo", ".col-hilo .entre"); await mide("burbuja", ".burbujas > .burbuja.mia:last-child");

  console.log("\n-- acto 7 · cita");
  await cdp.eval(`(() => { app.CHAT.pacienteId = "p-1"; app.CHAT.mensajes = []; const q = "Agéndame un control para Luna la próxima semana."; app.CHAT.mensajes.push({ rol: "user", texto: q }); const r = app.responderVetGPT(q); window.__r2 = r; app.CHAT.mensajes.push({ rol: "assistant", texto: r.texto, escribiendo: false, citas: r.citas, herramienta: null, accion: r.accion }); app.ACCIONES_VIVAS.set(r.accion.id, r.accion); app.CHAT.estado = "libre"; app.nav("/dashboard/asistente"); })()`);
  await mide("tarjetaCita", ".accion"); await mide("campoMotivo", 'input[data-act="accion-campo"][data-arg$=":titulo"]'); await mide("campoFecha", 'input[data-act="accion-campo"][data-arg$=":cuando"]'); await mide("aprobarCita", 'button[data-act="accion-aprobar"]');
  await cdp.eval(`app.ACTIONS["accion-aprobar"](window.__r2.accion.id); document.getElementById("avisos").innerHTML = ""; (() => { const c = app.DB.citas[app.DB.citas.length - 1]; app.CAL.fecha = new Date(c.inicio); app.CAL.vista = "Día"; app.nav("/dashboard/calendario"); })()`);
  console.log("agenda día · hojas con «Control»:", await cdp.eval(`[...document.querySelectorAll("*")].filter(e => e.children.length === 0 && (e.textContent || "").trim().startsWith("Control")).map(e => { const r = e.getBoundingClientRect(); const p = e.closest("[class]"); return (p ? p.className : "?") + " @" + Math.round(r.left) + "," + Math.round(r.top) + " " + Math.round(r.width) + "x" + Math.round(r.height); }).join(" | ")`));
  console.log("agenda día · texto:", await cdp.eval(`(document.querySelector("#app")?.innerText || "").split("\\n").filter(Boolean).slice(0, 20).join(" · ")`));
  await cdp.eval(`app.CAL.vista = "Semana"; app.nav("/dashboard/calendario")`);
  await mide("evSemana", ".ev", "Control");
  console.log("agenda semana · cabecera:", await cdp.eval(`(document.querySelector("#app")?.innerText || "").split("\\n").filter(Boolean).slice(0, 8).join(" · ")`));
} finally { chrome.kill(); }
