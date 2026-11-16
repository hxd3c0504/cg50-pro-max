import {readFile, writeFile, mkdir, rename, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(resolve(root, 'web/reset-manifest.json'), 'utf8'));
const source = process.env.CG50_ASSET_DIR ? resolve(process.env.CG50_ASSET_DIR) : null;
const valid = (bytes, file) => bytes.length === file.size && createHash('sha256').update(bytes).digest('hex') === file.sha256;
for (const file of manifest.files.filter(file => /\.(wasm|bin)$/.test(file.path))) {
  if (!/^[a-zA-Z0-9_./-]+$/.test(file.path) || file.path.split('/').includes('..') || file.path.startsWith('/')) throw Error('Invalid asset path');
  const target = resolve(root, 'web', file.path);
  try {if (valid(await readFile(target), file)) {console.log('Verified: ' + file.path); continue;}}
  catch (error) {if (error.code !== 'ENOENT') throw error;}
  let bytes;
  if (source) {
    try {bytes = await readFile(resolve(source, file.path));}
    catch (error) {if (error.code !== 'ENOENT') throw error;}
  }
  if (!bytes && file.path === 'cg50.wasm') {
    const response = await fetch('https://cg50promax.up.railway.app/cg50.wasm', {signal:AbortSignal.timeout(180000)});
    if (!response.ok) throw Error('WASM download failed: HTTP ' + response.status);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  if (!bytes) throw Error('Supply lawfully obtained matching asset: web/' + file.path + ' (or use CG50_ASSET_DIR). Firmware and default state are not downloaded by this script.');
  if (!valid(bytes, file)) throw Error('Asset size/SHA-256 mismatch: ' + file.path);
  await mkdir(dirname(target), {recursive:true});
  const temporary = target + '.download';
  try {await writeFile(temporary, bytes); await rename(temporary, target);}
  finally {await rm(temporary, {force:true});}
  console.log('Prepared and verified: ' + file.path);
}
