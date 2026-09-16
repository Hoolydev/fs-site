import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { handleDiagnostic } from '../api/diagnostic.js';
const root = path.resolve('dist');
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.txt': 'text/plain' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === '/api/diagnostic' || pathname === '/api/diagnostic/') {
      const chunks = [];
      let length = 0;
      for await (const chunk of req) {
        length += chunk.length;
        if (length > 14000) { res.writeHead(413, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'Solicitação muito longa.' })); return; }
        chunks.push(chunk);
      }
      const body = Buffer.concat(chunks);
      const request = new Request(url, { method: req.method, headers: req.headers, ...(['GET', 'HEAD'].includes(req.method) ? {} : { body }) });
      const response = await handleDiagnostic(request);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try { if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html'); }
    catch { if (!path.extname(file)) file = path.join(file, 'index.html'); }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
  } catch { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(await readFile(path.join(root, '404.html'))); }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://localhost:${port}`));
