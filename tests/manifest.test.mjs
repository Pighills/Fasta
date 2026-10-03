import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url));
const manifest = JSON.parse(read('manifest.json'));

test('installerad app har svenskt namn och beskrivning', () => {
  assert.equal(manifest.name, 'FASTA – Periodisk fasta');
  assert.equal(manifest.short_name, 'FASTA');
  assert.equal(manifest.description, 'Timer för periodisk fasta med kroppens faser i realtid.');
  assert.equal(manifest.lang, 'sv');
});

test('egen maskable-ikon är en 512×512 PNG och förladdas för offline', () => {
  const icon = manifest.icons.find(icon => icon.purpose === 'maskable');
  assert.equal(icon.src, 'icons/icon-maskable-512.png');
  assert.equal(icon.sizes, '512x512');
  assert.equal(icon.type, 'image/png');
  const png = read(icon.src);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.toString('ascii', 12, 16), 'IHDR');
  assert.equal(png.readUInt32BE(16), 512);
  assert.equal(png.readUInt32BE(20), 512);
  assert.ok(read('sw.js').toString().includes(`"./${icon.src}"`));
  assert.deepEqual(manifest.icons.filter(icon => icon.purpose === 'any').map(icon => icon.src),
    ['icons/icon-192.png', 'icons/icon-512.png']);
});
