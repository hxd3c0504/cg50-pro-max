import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {execFile} from 'node:child_process';
import {createApp} from '../server/http.mjs';
import {openStores} from '../server/store.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.CG50_PREVIEW_PORT || 8089);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw Error('Invalid local preview port');
}
const database = openStores(resolve(root, 'data/local-preview/cg50.sqlite'));
const url = `http://127.0.0.1:${port}/`;
const openBrowser = () => execFile('/usr/bin/open', [url], error => {
  if (error) console.error(`请在浏览器打开 ${url}`);
});
const server = await createApp({
  web:resolve(root, 'web'),
  database,
  password:randomBytes(32).toString('base64url'),
  origin:`http://127.0.0.1:${port}`,
  trustProxy:false
});
server.listen(port, '127.0.0.1', () => {
  console.log(`CG50 本地预览：${url}`);
  console.log('请通过上面的本地网址使用计算器，不要直接打开 index.html。');
  if (process.argv.includes('--open')) openBrowser();
});
server.on('error', async error => {
  database.close();
  if (error.code === 'EADDRINUSE' && process.argv.includes('--open')) {
    try {
      const response = await fetch(new URL('version.json', url), {signal:AbortSignal.timeout(3000)});
      if (response.ok && (await response.json()).app === 'CG50 Pro Max') {
        openBrowser();
        return;
      }
    } catch {}
  }
  console.error(error.message);
  process.exitCode = 1;
});
for (const signal of ['SIGINT','SIGTERM']) {
  process.on(signal, () => {
    server.closeAllConnections();
    server.close(() => {database.close();process.exit(0);});
  });
}
