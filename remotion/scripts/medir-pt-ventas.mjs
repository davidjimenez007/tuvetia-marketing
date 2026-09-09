// Uso, desde remotion/:  node scripts/medir-pt-ventas.mjs
// Mide los puntos fijos (PT, relativos 0..1 de 1440×900) de DemoVentas con la columna de lectura que
// impone el post-proceso (640 px en consulta y carrito; 820 en las tablas), en el estado exacto del
// replay en cada acto. Sólo lee.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HTML = pathToFileURL(resolve(raiz, "public/app/tuvetia-app.html")).href;
const CHROME = resolve(raiz, "node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe");
const PUERTO = 9335;
const CSV = readFileSync(resolve(raiz, "public/app/_pruebas/catalogo-prueba-encabezados-raros.csv"), "utf8");

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
const PT = (sel, texto) => `(() => { const todos = [...document.querySelectorAll(${JSON.stringify(sel)})]; const el = ${texto ? `todos.find(e => (e.textContent||"").includes(${JSON.stringify(texto)}))` : "todos[0]"}; if (!el) return null; const r = el.getBoundingClientRect(); return { x: +((r.left + r.width / 2) / 1440).toFixed(3), y: +((r.top + r.height / 2) / 900).toFixed(3), w: Math.round(r.width), h: Math.round(r.height) }; })()`;
const ESTILO = w => `(() => { let s = document.getElementById("pieza-ventas"); if (!s) { s = document.createElement("style"); s.id = "pieza-ventas"; document.head.appendChild(s); } s.textContent = ".pagina>*{max-width:${w}px!important}.pagina{padding-bottom:320px!important}.dock{display:none!important}"; return 1; })()`;
const CENTRAR = (sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); let n = el; while (n) { const ov = getComputedStyle(n).overflowY; if ((ov === "auto" || ov === "scroll") && n.scrollHeight > n.clientHeight + 1) break; n = n.parentElement; } if (!el || !n) return "sin scroller"; const r = el.getBoundingClientRect(), rc = n.getBoundingClientRect(); n.scrollTop = Math.max(0, Math.min(n.scrollHeight - n.clientHeight, n.scrollTop + (r.top - rc.top) - (rc.height - r.height) / 2)); return n.scrollTop; })()`;

const chrome = spawn(CHROME, [`--remote-debugging-port=${PUERTO}`, `--user-data-dir=${resolve(raiz, "out/qa/.perfil-pt")}`, "--allow-file-access-from-files", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
try {
  const cdp = await conectar();
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const cargado = cdp.espera("Page.loadEventFired"); await cdp.send("Page.navigate", { url: HTML }); await cargado;
  const mide = async (clave, sel, texto) => console.log(clave.padEnd(22), JSON.stringify(await cdp.eval(PT(sel, texto))));

  await cdp.eval(`app.ACTIONS["login-demo"](); app.DB.wa.propuestas = []; app.IMP.reset();`);
  // El estado del replay hasta el acto 5: importación hecha.
  await cdp.eval(`app.importarDesdeTexto(${JSON.stringify(CSV)}, "catalogo-prueba-encabezados-raros.csv", ${CSV.length}); app.IMP.mapeo["3"] = "min"; app.IMP.paso = 3; app.confirmarImportacion(); document.getElementById("avisos").innerHTML = "";`);

  console.log("\n-- columna 820 · importar (paso 1 y 2)");
  await cdp.eval(ESTILO(820)); await cdp.eval(`app.IMP.reset(); app.nav("/dashboard/facturacion/inventario/importar")`);
  await mide("zonaSoltar", "label[data-soltar]");
  await cdp.eval(`app.importarDesdeTexto(${JSON.stringify(CSV)}, "catalogo-prueba-encabezados-raros.csv", ${CSV.length})`);
  await mide("celdaMin", ".pagina.angosta table.tabla tbody tr:nth-child(4) td:nth-child(2)");
  await mide("selectMin", 'select[data-act="imp-mapeo"][data-arg="3"]');
  await mide("revisar", 'button[data-act="imp-paso"][data-arg="3"]');
  await cdp.eval(`app.IMP.mapeo["3"] = "min"; app.IMP.paso = 3; app.render()`);
  await mide("importar", 'button[data-act="imp-confirmar"]');
  await cdp.eval(`app.IMP.reset()`);

  console.log("\n-- lectura 640 · consulta c-1 (botón centrado)");
  await cdp.eval(ESTILO(640)); await cdp.eval(`app.nav("/dashboard/consultas/c-1")`);
  console.log("scrollTop:", await cdp.eval(CENTRAR('button[data-act="facturar-recetado"]')));
  await mide("informe", 'button[data-act="informe"]');
  await mide("facturar", 'button[data-act="facturar-recetado"]');
  await mide("bloquePlan", "section.card .pad-lg > .fila", "Plan");

  console.log("\n-- lectura 640 · carrito");
  await cdp.eval(`app.ACTIONS["facturar-recetado"]("c-1")`);
  await mide("lineaItem(arriba)", ".linea-carrito", "Oclacitinib");
  console.log("scrollTop:", await cdp.eval(CENTRAR('button[data-act="emitir-factura"]')));
  await mide("totales", "dl.totales");
  await mide("emitir", 'button[data-act="emitir-factura"]');

  console.log("\n-- columna 820 · inventario tras emitir");
  await cdp.eval(`app.ACTIONS["emitir-factura"](); document.getElementById("avisos").innerHTML = "";`);
  await cdp.eval(ESTILO(820)); await cdp.eval(`app.nav("/dashboard/facturacion/inventario")`);
  console.log("scrollTop:", await cdp.eval(CENTRAR("table.tabla tbody tr:nth-child(12)")));
  await mide("celdaItem", "table.tabla tbody tr td:first-child", "Oclacitinib");
  await cdp.eval(`app.nav("/dashboard/facturacion/inventario/movimientos")`);
  await mide("filaMov2", "table.tabla tbody tr:nth-child(2)");
  console.log("\n-- toast (columna 820, right 354 / bottom 18)");
  await cdp.eval(`(() => { const s = document.getElementById("pieza-ventas"); s.textContent += "#avisos{right:354px!important;bottom:18px!important}"; app.toast("prueba"); return 1; })()`);
  await mide("toast", "#avisos .toast");
} finally { chrome.kill(); }
