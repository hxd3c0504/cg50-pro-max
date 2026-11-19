import http from 'node:http';
import {readFile, realpath} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import {resolve, dirname, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const web = await realpath(resolve(root, 'web'));
const release = JSON.parse(await readFile(resolve(web, 'version.json'), 'utf8'));
const manifest = JSON.parse(await readFile(resolve(web, 'reset-manifest.json'), 'utf8'));
if (manifest.releaseId !== release.releaseId || manifest.version !== release.version) throw Error('Release manifest mismatch');
const allowed = new Set(['reset-manifest.json']);
for (const file of manifest.files) {
  if (typeof file.path !== 'string' || /[\\?#]/.test(file.path) || file.path.startsWith('/') || file.path.split('/').some(part => !part || part === '.' || part === '..') || allowed.has(file.path)) throw Error('Invalid manifest path');
  const path = await realpath(resolve(web, file.path));
  if (!path.startsWith(web + sep)) throw Error('Resource outside web directory');
  const bytes = await readFile(path);
  if (bytes.length !== file.size || createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw Error('Resource verification failed: ' + file.path);
  allowed.add(file.path);
}
const local = process.argv.includes('--local');
const port = Number(process.env.PORT || (local ? 8089 : 3000));
if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Invalid PORT');
const mime = {'.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.wasm':'application/wasm','.png':'image/png','.bin':'application/octet-stream'};
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, {'Allow':'GET, HEAD'}); response.end(); return;
    }
    if (url.pathname === '/healthz') {
      response.writeHead(200, {'Cache-Control':'no-store'}); response.end(request.method === 'HEAD' ? '' : 'ok'); return;
    }
    let name;
    try {name = decodeURIComponent(url.pathname).slice(1) || 'index.html';}
    catch {response.writeHead(400); response.end(); return;}
    if (!allowed.has(name)) {response.writeHead(404); response.end(); return;}
    const path = await realpath(resolve(web, name));
    if (!path.startsWith(web + sep)) {response.writeHead(404); response.end(); return;}
    response.writeHead(200, {'Content-Type':mime[extname(name)] || 'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':['version.json','reset-manifest.json','sw.js'].includes(name) ? 'no-store' : 'no-cache'});
    if (request.method === 'HEAD') {response.end(); return;}
    await pipeline(createReadStream(path), response);
  } catch {
    if (!response.headersSent) response.writeHead(503);
    response.end();
  }
});
server.listen(port, local ? '127.0.0.1' : '0.0.0.0', () => console.log('CG50 Pro Max: http://127.0.0.1:' + port + '/'));
server.on('error', error => {console.error(error.message); process.exitCode = 1;});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  const timer = setTimeout(() => process.exit(1), 10000); timer.unref();
  server.close(() => {clearTimeout(timer); process.exit(0);});
  server.closeIdleConnections();
});
