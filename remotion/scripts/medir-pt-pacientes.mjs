// Uso, desde remotion/:  node scripts/medir-pt-pacientes.mjs
// Mide los puntos fijos (PT, relativos 0..1 de 1440×900) de DemoPacientes con la columna de lectura que
// impone el post-proceso (820 en la ficha y WhatsApp, 640 en la consulta), en el estado exacto del replay
// en cada acto (las notas de Luna en borrador, la guarda marcada, la nota aprobada, el diálogo abierto).
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HTML = pathToFileURL(resolve(raiz, "public/app/tuvetia-app.html")).href;
const CHROME = resolve(raiz, "node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe");
const PUERTO = 9337;

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
const PT = (sel, texto) => `(() => { const todos = [...document.querySelectorAll(${JSON.stringify(sel)})]; const el = ${texto ? `todos.find(e => (e.textContent||"").includes(${JSON.stringify(texto)}))` : "todos[0]"}; if (!el) return null; const r = el.getBoundingClientRect(); return { x: +((r.left + r.width / 2) / 1440).toFixed(3), y: +((r.top + r.height / 2) / 900).toFixed(3), w: Math.round(r.width), h: Math.round(r.height), disabled: el.disabled === true }; })()`;
const ESTILO = w => `(() => { let s = document.getElementById("pieza-columna"); if (!s) { s = document.createElement("style"); s.id = "pieza-columna"; document.head.appendChild(s); } s.textContent = ".pagina>*{max-width:${w}px!important}.pagina{padding-bottom:320px!important}.dock{display:none!important}"; return 1; })()`;
const CENTRAR = (sel, texto) => `(() => { const todos = [...document.querySelectorAll(${JSON.stringify(sel)})]; const el = ${texto ? `todos.find(e => (e.textContent||"").includes(${JSON.stringify(texto)}))` : "todos[0]"}; let n = el; while (n) { const ov = getComputedStyle(n).overflowY; if ((ov === "auto" || ov === "scroll") && n.scrollHeight > n.clientHeight + 1) break; n = n.parentElement; } if (!el || !n) return "sin scroller"; const r = el.getBoundingClientRect(), rc = n.getBoundingClientRect(); n.scrollTop = Math.max(0, Math.min(n.scrollHeight - n.clientHeight, n.scrollTop + (r.top - rc.top) - (rc.height - r.height) / 2)); return n.scrollTop; })()`;

const chrome = spawn(CHROME, [`--remote-debugging-port=${PUERTO}`, `--user-data-dir=${resolve(raiz, "out/qa/.perfil-pt-pacientes")}`, "--allow-file-access-from-files", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
try {
  const cdp = await conectar();
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const cargado = cdp.espera("Page.loadEventFired"); await cdp.send("Page.navigate", { url: HTML }); await cargado;
  const mide = async (clave, sel, texto) => console.log(clave.padEnd(24), JSON.stringify(await cdp.eval(PT(sel, texto))));

  // El estado del beat 1: Luna, notas en borrador, consultas en revisión, guarda sin marcar.
  await cdp.eval(`app.ACTIONS["login-demo"](); app.DB.wa.propuestas = [];
    const p = app.DB.pacientes.find(x => x.nombre === "Luna"); const cs = app.DB.consultas.filter(c => c.pacienteId === p.id);
    for (const n of app.DB.notas.filter(n => cs.some(c => c.id === n.consultaId))) n.estado = "draft"; for (const c of cs) c.estado = "review"; app.UI.gateOk = false;`);
  console.log("\n-- columna 820 · ficha de Luna (acto 1/2)");
  await cdp.eval(ESTILO(820)); await cdp.eval(`app.nav("/dashboard/patients/p-1")`);
  await mide("fichaCab", ".ficha-cab"); await mide("informe (deshabilitado)", 'button[data-act="informe-paciente"]'); await mide("chatPaciente", 'button[data-act="chat-paciente"]');
  console.log("scroll a la historia:", await cdp.eval(CENTRAR("details.hist-consulta > summary")));
  await mide("resumen1", "details.hist-consulta > summary"); await mide("details1", "details.hist-consulta");
  console.log("badges historia:", await cdp.eval(`[...document.querySelectorAll("details.hist-consulta summary .badge")].map(b => b.innerText).join(" | ")`));
  console.log("scroll al plan:", await cdp.eval(CENTRAR("details.hist-consulta .rotulo", "Plan")));
  await mide("planHistoria", "details.hist-consulta .rotulo", "Plan");

  console.log("\n-- lectura 640 · consulta (acto 3/4)");
  await cdp.eval(ESTILO(640)); await cdp.eval(`app.nav("/dashboard/consultas/c-1")`);
  await mide("badgeBorrador", ".pagina .badge", "Borrador"); await mide("badgeRedactada", ".pagina .badge", "Redactada");
  console.log("scroll a la nota:", await cdp.eval(CENTRAR("section.card", "Nota clínica"))); await mide("notaClinica", "section.card", "Nota clínica");
  console.log("scroll al botón:", await cdp.eval(CENTRAR('button[data-act="aprobar-nota"]')));
  await mide("guardarNota", 'button[data-act="guardar-nota"]'); await mide("aprobar (bloqueado)", 'button[data-act="aprobar-nota"]');
  console.log("scroll a la guarda:", await cdp.eval(CENTRAR('input[data-act="gate"]')));
  await mide("gate", 'input[data-act="gate"]'); await mide("bloqueGate", "details.card summary", "Alergia severa");
  await cdp.eval(`app.UI.gateOk = true; app.render()`);
  console.log("scroll al botón (habilitado):", await cdp.eval(CENTRAR('button[data-act="aprobar-nota"]')));
  await mide("aprobar (habilitado)", 'button[data-act="aprobar-nota"]');
  await cdp.eval(`app.ACTIONS["aprobar-nota"]("c-1")`); await dormir(30);
  console.log("toast:", await cdp.eval(`document.querySelector("#avisos .toast")?.innerText.replace(/\\n/g, " · ")`));
  await mide("toast", "#avisos .toast");
  await cdp.eval(`document.getElementById("avisos").innerHTML = ""`);

  console.log("\n-- columna 820 · ficha de vuelta (acto 5b/6)");
  await cdp.eval(ESTILO(820)); await cdp.eval(`app.nav("/dashboard/patients/p-1")`);
  console.log("scroll a la historia:", await cdp.eval(CENTRAR("details.hist-consulta > summary")));
  console.log("badges historia:", await cdp.eval(`[...document.querySelectorAll("details.hist-consulta summary .badge")].map(b => b.innerText).join(" | ")`));
  await cdp.eval(`(() => { const n = document.querySelector(".cuerpo"); if (n) n.scrollTop = 0; })()`);
  await mide("informe (activo)", 'button[data-act="informe-paciente"]');
  await cdp.eval(`app.ACTIONS["informe-paciente"]("c-1")`);
  await mide("dialogo", ".dialogo"); await mide("textoInforme", "#informe-texto"); await mide("enviarWA", 'button[data-act="enviar-informe"][data-arg$=":wa"]');
  console.log("texto del informe:", await cdp.eval(`document.getElementById("informe-texto")?.value.slice(0, 200)`));
  await cdp.eval(`app.ACTIONS["enviar-informe"]("c-1:wa")`); await dormir(30);
  console.log("toast:", await cdp.eval(`document.querySelector("#avisos .toast")?.innerText.replace(/\\n/g, " · ")`));
  await cdp.eval(`document.getElementById("avisos").innerHTML = ""; app.ACTIONS["wa-abrir"]("573104482210"); app.nav("/dashboard/comunicaciones")`);
  console.log("\n-- columna 820 · WhatsApp (acto 7)");
  await mide("inbox", ".inbox"); await mide("burbujas", ".burbujas");
  console.log("scroll al fondo:", await cdp.eval(`(() => { const b = document.querySelector(".burbujas"); if (b) b.scrollTop = b.scrollHeight; return b ? b.scrollTop : "sin burbujas"; })()`));
  const mias = await cdp.eval(`[...document.querySelectorAll(".burbuja.mia")].map(b => { const r = b.getBoundingClientRect(); return { x: +((r.left + r.width / 2) / 1440).toFixed(3), y: +((r.top + r.height / 2) / 900).toFixed(3), w: Math.round(r.width), h: Math.round(r.height), texto: b.innerText.slice(0, 40) }; })`);
  console.log("burbujas mías:", JSON.stringify(mias));
  console.log("voseo en las pantallas:", await cdp.eval(`(() => { const out = []; for (const ruta of ["/dashboard/patients/p-1", "/dashboard/consultas/c-1", "/dashboard/comunicaciones"]) { app.nav(ruta); const t = document.getElementById("app").innerText + " " + document.getElementById("overlays").innerText; const m = t.match(/\\b[A-Za-záéíóúñ]+(á|é|í|ás|és|ís|ate|ame|ime|elo|alo|inos)\\b/g) || []; out.push(ruta + ": " + [...new Set(m)].slice(0, 30).join(", ")); } return out.join("\\n"); })()`));
} finally { chrome.kill(); }
