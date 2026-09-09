// Uso, desde remotion/:  node scripts/voseo-restante.mjs pacientes
// Abre la maqueta en chrome-headless-shell, reproduce el estado de la pieza, aplica MAPA_TUTEO (leído de
// src/demo/tuteo.ts) más el TUTEO_EXTRA de la pieza (leído de src/<pieza>/guion.ts) a los nodos de texto,
// y lista el voseo que queda en cada pantalla, con contexto. Cero = las pantallas salen en tuteo.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HTML = pathToFileURL(resolve(raiz, "public/app/tuvetia-app.html")).href;
const CHROME = resolve(raiz, "node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe");
const PUERTO = 9338;
const pieza = process.argv[2] || "pacientes";

/** Extrae los pares [/regex/flags, "reemplazo"] de un archivo TS, tal como están escritos. */
const pares = (ruta) => {
  let src = "";
  try { src = readFileSync(resolve(raiz, ruta), "utf8"); } catch { return []; } // la pieza puede no existir todavía
  const out = [];
  for (const m of src.matchAll(/\[\s*\/((?:\\.|[^\/\n])+)\/([gimsuy]*)\s*,\s*"((?:\\.|[^"\n])*)"\s*\]/g)) out.push([m[1], m[2], JSON.parse(`"${m[3]}"`)]);
  return out;
};
const MAPA = [...pares("src/demo/tuteo.ts"), ...pares(`src/${pieza}/guion.ts`)];

const PIEZAS = {
  pacientes: {
    preparar: `app.ACTIONS["login-demo"](); app.DB.wa.propuestas = [];
      const p = app.DB.pacientes.find(x => x.nombre === "Luna"); const cs = app.DB.consultas.filter(c => c.pacienteId === p.id);
      for (const n of app.DB.notas.filter(n => cs.some(c => c.id === n.consultaId))) n.estado = "draft"; for (const c of cs) c.estado = "review"; app.UI.gateOk = false;`,
    pantallas: [
      ["ficha (borrador)", `app.nav("/dashboard/patients/p-1")`],
      ["consulta (borrador, guarda sin marcar)", `app.nav("/dashboard/consultas/c-1")`],
      ["consulta (aprobada)", `app.UI.gateOk = true; app.ACTIONS["aprobar-nota"]("c-1"); app.nav("/dashboard/consultas/c-1")`],
      ["ficha (aprobada) + diálogo del informe", `app.nav("/dashboard/patients/p-1"); app.ACTIONS["informe-paciente"]("c-1")`],
      ["WhatsApp con el informe enviado", `app.ACTIONS["enviar-informe"]("c-1:wa"); app.ACTIONS["wa-abrir"]("573104482210"); app.nav("/dashboard/comunicaciones")`, `[...document.querySelector(".burbujas").children].map(e => e.className + " · " + (e.textContent || "").trim().slice(0, 32)).join(" | ")`],
    ],
  },
  agentico: {
    preparar: `app.ACTIONS["login-demo"](); app.DB.wa.propuestas = [];
      window.__preguntar = (q) => { app.CHAT.mensajes.push({ rol: "user", texto: q }); const r = app.responderVetGPT(q);
        app.CHAT.mensajes.push({ rol: "assistant", texto: r.texto, escribiendo: false, citas: r.citas, herramienta: null, accion: r.accion, opciones: r.opciones });
        if (r.accion) app.ACCIONES_VIVAS.set(r.accion.id, r.accion); app.CHAT.estado = "libre"; app.CHAT.entrada = ""; return r.accion; };`,
    pantallas: [
      ["asistente · bienvenida + riel (pregunta precargada)", `app.CHAT.mensajes = []; app.CHAT.pacienteId = null; app.CHAT.entrada = ""; app.nav("/dashboard/asistente?pedir=cobros")`],
      ["asistente · respuesta de cartera + tarjeta", `window.__ac = window.__preguntar(app.CHAT.entrada); app.nav("/dashboard/asistente")`],
      ["asistente · tarjeta ejecutada", `app.ACTIONS["accion-aprobar"](window.__ac.id); app.nav("/dashboard/asistente")`],
      ["comunicaciones · hilo nuevo", `app.ACTIONS["wa-abrir"](String(window.__ac.payload.to).replace(/[^0-9]/g, "")); app.nav("/dashboard/comunicaciones")`],
      ["asistente · cita + tarjeta", `app.CHAT.pacienteId = "p-1"; app.CHAT.mensajes = []; window.__ac2 = window.__preguntar("Agéndame un control para Luna la próxima semana."); app.nav("/dashboard/asistente")`],
      ["agenda · día de la cita", `app.ACTIONS["accion-aprobar"](window.__ac2.id); const c = app.DB.citas[app.DB.citas.length - 1]; app.CAL.fecha = new Date(c.inicio); app.CAL.vista = "Día"; app.nav("/dashboard/calendario")`],
    ],
  },
  comunicaciones: {
    preparar: `app.ACTIONS["login-demo"]();`,
    pantallas: [
      ["comunicaciones", `app.nav("/dashboard/comunicaciones")`],
      ["comunicaciones · hilo Julián", `app.ACTIONS["wa-abrir"]("573156629034"); app.nav("/dashboard/comunicaciones")`],
      ["correo", `app.nav("/dashboard/comunicaciones/correo")`],
      ["conexiones", `app.nav("/dashboard/conexiones")`],
    ],
  },
};

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

/* Aplica el mapa a los nodos de texto (como aplicarTuteo) y devuelve el voseo que queda, con contexto. */
const ESCANEO = `(() => {
  const MAPA = ${JSON.stringify(MAPA)}.map(([re, fl, rep]) => [new RegExp(re, fl.includes("g") ? fl : fl + "g"), rep]);
  const raices = [document.getElementById("app"), document.getElementById("overlays")].filter(Boolean);
  for (const raiz of raices) {
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) { let t = n.nodeValue; for (const [re, rep] of MAPA) t = t.replace(re, rep); if (t !== n.nodeValue) n.nodeValue = t; }
    for (const el of raiz.querySelectorAll("[placeholder]")) { let t = el.getAttribute("placeholder"); for (const [re, rep] of MAPA) t = t.replace(re, rep); el.setAttribute("placeholder", t); }
    for (const el of raiz.querySelectorAll("textarea, input[type=text]")) { let t = el.value || ""; for (const [re, rep] of MAPA) t = t.replace(re, rep); if (t !== el.value) el.value = t; }
  }
  const texto = raices.map(r => r.innerText + " " + [...r.querySelectorAll("textarea,[placeholder]")].map(e => (e.value || "") + " " + (e.getAttribute("placeholder") || "")).join(" ")).join("\\n");
  // Voseo: verbo en -á/-é/-í tónica (+s) («revisá», «aprobás», «tenés», «decís») o imperativo con clítico sin
  // tilde en la raíz («decime», «acordate», «contale», «llevalo», «escribinos»); «vos» suelto.
  const re = /(^|[^A-Za-záéíóúñÁÉÍÓÚÑ])((?:[A-Za-záéíóúñ]{2,}(?:á|é|í)s?)|(?:[A-Za-zñ]{2,}(?:ame|ate|ale|alo|elo|ime|inos|ilo|ila|ilas|ilos|enos|anos)))(?=$|[^A-Za-záéíóúñÁÉÍÓÚÑ])|(^|[^A-Za-záéíóúñ])(vos)(?=$|[^A-Za-záéíóúñ])/gi;
  const falsos = /^(está|estás|más|aquí|así|allí|ahí|acá|allá|será|serás|serán|habrá|podrá|podrás|deberá|deberás|hará|irá|dirá|tendrá|vendrá|quedará|dará|verá|sabrá|llegará|pasará|saldrá|entrará|volverá|seguirá|bajará|subirá|abrirá|cerrará|sí|qué|quién|también|además|después|José|Andrés|Tomás|Inés|Nicolás|café|bebé|comité|carné|pagaré|reí|leí|oí|creí|caí|Bogotá|Panamá|Canadá|jamás|quizás|atrás|detrás|demás|través|interés|revés|estrés|Moisés|cortés|marqués|ciprés|compás|gas|fe|pie|tomate|tomates|frame|llame|reclame|examinos|marinos|caninos|felinos|equinos|bovinos|porcinos|vecinos|destinos|caminos|termin[ao]s|humanos|sanos|planos|granos|manos|lejanos|cercanos|ancianos|hermanos|órganos|gusanos|desayunos|alumnos|internos|externos|modernos|inviernos|gobiernos|cuadernos|turnos|nocturnos|diurnos|tiernos|buenos|menos|llenos|ajenos|senos|venenos|terrenos|serenos|centenos|estrenos|frenos|truenos|rellenos|morenos|plenos|amenos|obscenos|fenómenos|chilenos|filo|hilo|kilo|estilo|asilo|sigilo|tranquilo|vigilo|cocodrilo|pupilo|Camilo|Danilo|fila|pila|mochila|pupila|clorofila|tequila|vainilla|tila|axila|Manila|Ávila|dactila|ángelo|modelo|cielo|hielo|pelo|suelo|vuelo|duelo|abuelo|anzuelo|pañuelo|consuelo|desvelo|celo|recelo|caramelo|paralelo|gemelo|camelo|Marcelo|halo|palo|regalo|malo|intervalo|escalo|búfalo|sándalo|gato|dato|rato|plato|trato|retrato|contrato|barato|zapato|inmediato|candidato|aparato|olfato|formato|relato|remate|debate|combate|rescate|tomate|aguacate|chocolate|disparate|empate|escaparate|magnate|pasante|entrante|late|mate|ate|dame|dime|ponme|hazme|tenme|ríeme)$/i;
  const vistos = new Map();
  let m; while ((m = re.exec(texto))) { const palabra = m[2] || m[4]; if (!palabra || falsos.test(palabra)) continue; const i = m.index + (m[1] || m[3] || "").length; const ctx = texto.slice(Math.max(0, i - 40), i + palabra.length + 40).replace(/\\s+/g, " "); if (!vistos.has(palabra.toLowerCase())) vistos.set(palabra.toLowerCase(), ctx); }
  return [...vistos.entries()].map(([p, c]) => p + "  ←  …" + c + "…");
})()`;

const chrome = spawn(CHROME, [`--remote-debugging-port=${PUERTO}`, `--user-data-dir=${resolve(raiz, "out/qa/.perfil-voseo")}`, "--allow-file-access-from-files", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
try {
  const cdp = await conectar();
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const cargado = cdp.espera("Page.loadEventFired"); await cdp.send("Page.navigate", { url: HTML }); await cargado;
  const def = PIEZAS[pieza]; if (!def) throw new Error(`pieza desconocida: ${pieza}`);
  console.log(`Mapa: ${MAPA.length} pares (MAPA_TUTEO + TUTEO_EXTRA de ${pieza}).`);
  await cdp.eval(def.preparar);
  let total = 0;
  for (const [nombre, js, dump] of def.pantallas) {
    await cdp.eval(js); await dormir(20);
    if (dump) console.log(`== DOM (${nombre}): ` + (await cdp.eval(dump)));
    const resto = await cdp.eval(ESCANEO);
    total += resto.length;
    console.log(`\n-- ${nombre}: ${resto.length ? resto.length + " candidato(s)" : "limpio"}`);
    for (const r of resto) console.log("   " + r);
  }
  console.log(`\nTotal de candidatos: ${total} (revisar a mano: la lista incluye falsos positivos que no estén en la lista blanca).`);
} finally { chrome.kill(); }
