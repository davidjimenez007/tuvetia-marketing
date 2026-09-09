// Uso, desde remotion/:  node scripts/medir-pt-comunicaciones.mjs
// Mide los puntos fijos (PT, relativos 0..1 de 1440×900) de DemoComunicaciones en el estado exacto del replay
// de cada acto: la bandeja con los entrantes sin leer, el hilo de Julián con sus dos preguntas, la propuesta
// de VetGPT bajo el hilo, la burbuja aprobada con doble check, la cabecera del correo, Integraciones y su aviso.
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HTML = pathToFileURL(resolve(raiz, "public/app/tuvetia-app.html")).href;
const CHROME = resolve(raiz, "node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe");
const PUERTO = 9341;

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
const ESTILO = w => `(() => { let s = document.getElementById("pieza-columna"); if (!s) { s = document.createElement("style"); s.id = "pieza-columna"; document.head.appendChild(s); } s.textContent = ".pagina>*{max-width:${w}px!important}.pagina{padding-bottom:320px!important}.dock{display:none!important}.autonomia{display:none!important}"; return 1; })()`;
const CENTRAR = (sel, texto) => `(() => { const todos = [...document.querySelectorAll(${JSON.stringify(sel)})]; const el = ${texto ? `todos.find(e => (e.textContent||"").includes(${JSON.stringify(texto)}))` : "todos[0]"}; let n = el; while (n) { const ov = getComputedStyle(n).overflowY; if ((ov === "auto" || ov === "scroll") && n.scrollHeight > n.clientHeight + 1) break; n = n.parentElement; } if (!el || !n) return "sin scroller"; const r = el.getBoundingClientRect(), rc = n.getBoundingClientRect(); n.scrollTop = Math.max(0, Math.min(n.scrollHeight - n.clientHeight, n.scrollTop + (r.top - rc.top) - (rc.height - r.height) / 2)); return n.scrollTop; })()`;

const chrome = spawn(CHROME, [`--remote-debugging-port=${PUERTO}`, `--user-data-dir=${resolve(raiz, "out/qa/.perfil-pt-comunicaciones")}`, "--allow-file-access-from-files", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
try {
  const cdp = await conectar();
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const cargado = cdp.espera("Page.loadEventFired"); await cdp.send("Page.navigate", { url: HTML }); await cargado;
  const mide = async (clave, sel, texto) => console.log(clave.padEnd(22), JSON.stringify(await cdp.eval(PT(sel, texto))));

  /* Beat 1: los entrantes sin leer (el seed los trae leídos), ningún hilo abierto. */
  await cdp.eval(`app.ACTIONS["login-demo"](); for (const m of app.DB.wa.mensajes) if (m.dir === "in") m.leido = null; app.COM.tel = null; app.nav("/dashboard/comunicaciones")`);
  console.log("\n-- acto 1 · bandeja");
  console.log("conversaciones:", await cdp.eval(`JSON.stringify(app.SEL.conversaciones().map(c => ({ nombre: app.SEL.nombreDeTel(c.tel), sinLeer: c.sinLeer })))`));
  console.log("propuesta pendiente:", await cdp.eval(`JSON.stringify(app.DB.wa.propuestas.filter(p => p.estado === "proposed").map(p => ({ id: p.id, tel: p.tel, nombre: app.SEL.nombreDeTel(p.tel), body: p.payload.body })))`));
  console.log("hilo Julián:", await cdp.eval(`JSON.stringify(app.DB.wa.mensajes.filter(m => m.tel === "573156629034").map(m => m.dir + ": " + m.texto))`));
  await mide("tabs", ".tabnav"); await mide("cabAutonomia", ".entre span.xs.mut", "autonomía"); await mide("btnAvisos", 'button[data-arg="/dashboard/comunicaciones/avisos"]'); await mide("inbox", ".inbox"); await mide("lista", ".col-lista");
  await mide("convJulian", ".conv", "Julián"); await mide("badgeJulian", ".conv .sin-leer"); await mide("convUltima", ".col-lista .crece > .conv:last-child"); await mide("hiloVacio", ".col-hilo .vacio");
  console.log("vacío dice:", await cdp.eval(`document.querySelector(".col-hilo .vacio")?.innerText`));
  console.log("\n-- acto 2 · hilo de Julián");
  await cdp.eval(`app.ACTIONS["wa-abrir"]("573156629034")`);
  await mide("cabHilo", ".col-hilo .entre"); await mide("burbujas", ".burbujas"); await mide("suya1", ".burbujas > .burbuja.suya:first-child"); await mide("suya2", ".burbujas > .burbuja.suya:last-child");
  console.log("badges tras abrir:", await cdp.eval(`JSON.stringify(app.SEL.conversaciones().map(c => app.SEL.nombreDeTel(c.tel).split(" ")[0] + ":" + c.sinLeer))`));
  console.log("\n-- acto 3 · propuesta bajo el hilo");
  await mide("bloquePropuestas", ".col-hilo .col[style*='border-top']"); await mide("rotuloPropuestas", ".col-hilo .rotulo", "Propuestas"); await mide("tarjeta", ".col-hilo .accion"); await mide("cabTarjeta", ".col-hilo .accion .cab"); await mide("textareaBody", ".col-hilo textarea[data-act='accion-campo']"); await mide("pasos", ".col-hilo .accion .pasos"); await mide("aprobar", ".col-hilo button[data-act='accion-aprobar']"); await mide("leyenda", ".col-hilo .accion .pie p.sm.mut"); await mide("form", ".col-hilo form");
  console.log("textarea scrollH/clientH:", await cdp.eval(`(() => { const t = document.querySelector(".col-hilo textarea[data-act='accion-campo']"); return t ? t.scrollHeight + "/" + t.clientHeight + " rows " + t.rows : "-"; })()`));
  console.log("\n-- acto 4 · aprobada");
  await cdp.eval(`app.ACTIONS["accion-aprobar"]("ac-1")`); await dormir(30);
  console.log("toast:", await cdp.eval(`document.querySelector("#avisos .toast")?.innerText.replace(/\\n/g, " · ")`));
  await mide("toast", "#avisos .toast"); await mide("burbujaMia", ".burbujas > .burbuja.mia:last-child"); await mide("acuse", ".burbujas > .burbuja.mia:last-child .acuse"); await mide("bloquePropuestas", ".col-hilo .col[style*='border-top']"); await mide("form", ".col-hilo form");
  console.log("acuse svg (doble):", await cdp.eval(`(() => { const a = document.querySelector(".burbujas > .burbuja.mia:last-child .acuse"); return a ? a.innerHTML.length + " chars · " + (a.innerHTML.includes("checkDoble") || a.querySelectorAll("svg").length + " svg") : "-"; })()`));
  console.log("burbujas scroll:", await cdp.eval(`(() => { const b = document.querySelector(".burbujas"); return b.scrollHeight + "/" + b.clientHeight + " top " + b.scrollTop; })()`));
  await cdp.eval(`document.getElementById("avisos").innerHTML = ""`);
  console.log("\n-- acto 5 · correo");
  await cdp.eval(`app.nav("/dashboard/comunicaciones/correo")`);
  await mide("tabs", ".tabnav"); await mide("cabCuenta", ".entre span.xs.mut"); await mide("lista", ".col-lista"); await mide("bandejaCab", ".col-lista .entre"); await mide("correo1", ".conv"); await mide("hilo", ".col-hilo"); await mide("asunto", ".col-hilo h2");
  console.log("cabecera correo:", await cdp.eval(`document.querySelector(".entre span.xs.mut")?.innerText`), "| bandeja:", await cdp.eval(`document.querySelector(".col-lista .entre")?.innerText.replace(/\\n/g, " · ")`));
  console.log("\n-- acto 6 · Integraciones (columna 820, .autonomia oculta)");
  await cdp.eval(ESTILO(820)); await cdp.eval(`app.nav("/dashboard/conexiones")`);
  await mide("aviso", ".aviso.ok"); await mide("cabPagina", ".cab-pagina"); await mide("cardWA", "section.card", "WhatsApp"); await mide("cardFact", "section.card", "Facturas y cobranza"); await mide("cardCorreo", "section.card", "Correo de VetGPT"); await mide("cardCal", "section.card", "Calendario"); await mide("badgeConectado", ".badge.ok", "Conectado");
  console.log("aviso literal:", await cdp.eval(`document.querySelector(".aviso.ok")?.innerText.replace(/\\n/g, " ")`));
  console.log("scroll a las tarjetas (centrar Correo):", await cdp.eval(CENTRAR("section.card", "Correo de VetGPT")));
  await mide("cardWA", "section.card", "WhatsApp"); await mide("cardFact", "section.card", "Facturas y cobranza"); await mide("cardCorreo", "section.card", "Correo de VetGPT"); await mide("cardCal", "section.card", "Calendario");
  console.log("scroll arriba:", await cdp.eval(`(() => { const n = document.querySelector(".cuerpo"); if (n) n.scrollTop = 0; return n ? n.scrollTop : "-"; })()`));
  console.log("voseo Integraciones (crudo):", await cdp.eval(`(() => { const t = document.getElementById("app").innerText; const m = t.match(/\\b[A-Za-záéíóúñ]+(á|é|í|ás|és|ís)\\b|\\bvos\\b/g) || []; return [...new Set(m)].join(", "); })()`));
} finally { chrome.kill(); }
