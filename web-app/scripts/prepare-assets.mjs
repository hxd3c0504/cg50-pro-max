import {readFile, writeFile, mkdir, rename, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(resolve(root, 'web/reset-manifest.json'), 'utf8'));
const origin = new URL('https://cg50promax.up.railway.app/');
const valid = (bytes, file) => bytes.length === file.size && createHash('sha256').update(bytes).digest('hex') === file.sha256;
for (const file of manifest.files.filter(file => /\.(wasm|bin)$/.test(file.path))) {
  if (!/^[a-zA-Z0-9_./-]+$/.test(file.path) || file.path.split('/').includes('..') || file.path.startsWith('/')) throw Error('Invalid asset path');
  const target = resolve(root, 'web', file.path);
  try { if (valid(await readFile(target), file)) {console.log('Verified: ' + file.path); continue;} }
  catch (error) {if (error.code !== 'ENOENT') throw error;}
  let downloaded = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const temporary = target + '.download';
    try {
      const response = await fetch(new URL(file.path, origin), {signal: AbortSignal.timeout(180000)});
      if (!response.ok) throw Error('HTTP ' + response.status);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!valid(bytes, file)) throw Error('Asset size/SHA-256 mismatch');
      await mkdir(dirname(target), {recursive: true});
      await writeFile(temporary, bytes);
      await rename(temporary, target);
      console.log('Downloaded and verified: ' + file.path);
      downloaded = true;
      break;
    } catch (error) {
      await rm(temporary, {force: true});
      if (attempt === 3) throw new Error('Cannot prepare ' + file.path + '. Supply the matching asset locally or restore the matching release at the source site.', {cause: error});
      console.log('Retrying: ' + file.path);
    }
  }
  if (!downloaded) throw Error('Asset unavailable: ' + file.path);
}
