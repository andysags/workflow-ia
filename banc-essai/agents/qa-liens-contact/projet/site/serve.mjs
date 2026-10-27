// Serveur d'aperçu minimal de dist/ : node serve.mjs --port 4321
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
const i = process.argv.indexOf("--port");
const port = i > 0 ? Number(process.argv[i + 1]) : 4321;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".svg": "image/svg+xml" };
createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  try {
    const f = join(process.cwd(), "dist", p.replace(/\.\.+/g, ""));
    res.writeHead(200, { "content-type": types[extname(f)] ?? "application/octet-stream" }).end(await readFile(f));
  } catch {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" }).end("<!doctype html><title>404</title><h1>Page introuvable</h1>");
  }
}).listen(port, () => console.log(`aperçu sur http://localhost:${port}/`));
