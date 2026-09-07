/**
 * servir.mjs — sirve la app HTML en localhost sin dependencias.
 *
 *   npm run serve            → http://localhost:8080
 *   node servir.mjs 3005     → otro puerto
 *
 * La raíz responde tuvetia-app-rediseno-full.html. Se necesita cuando hace
 * falta una URL http:// de verdad (en vez de file://): pruebas en el navegador,
 * Playwright, herramientas que solo aceptan URLs, etc.
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const INDEX = "tuvetia-app-rediseno-full.html";
const PUERTO = Number(process.argv[2] ?? process.env.PORT ?? 8080);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let rel = decodeURIComponent(url.pathname);
    if (rel === "/" || rel === "") rel = `/${INDEX}`;

    // Sin salir de la carpeta.
    const archivo = path.normalize(path.join(RAIZ, rel));
    if (!archivo.startsWith(RAIZ)) {
      res.writeHead(403).end("403");
      return;
    }

    const info = await stat(archivo);
    if (info.isDirectory()) {
      res.writeHead(302, { Location: "/" }).end();
      return;
    }

    const cuerpo = await readFile(archivo);
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(archivo).toLowerCase()] ?? "application/octet-stream",
      "Content-Length": cuerpo.length,
      "Cache-Control": "no-store",
    });
    res.end(cuerpo);
  } catch (e) {
    res.writeHead(e.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(e.code === "ENOENT" ? "404 — no existe" : `500 — ${e.message}`);
  }
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error(`✗ El puerto ${PUERTO} está ocupado. Probá: node servir.mjs ${PUERTO + 1}`);
    process.exit(1);
  }
  throw e;
});

server.listen(PUERTO, "127.0.0.1", () => {
  console.log(`\n  Tuvetia (rediseño full) corriendo en:\n\n    http://localhost:${PUERTO}\n\n  Ctrl+C para parar.\n`);
});
