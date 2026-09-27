import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');

test('integritet.html finns i PRECACHE och fungerar offline', () => {
  assert.match(read('sw.js'), /"\.\/integritet\.html"/);
});

test('integritet.html har tillbakalänk och inget inline-JavaScript (inför CSP)', () => {
  const html = read('integritet.html');
  assert.match(html, /href="\.\/">← Tillbaka till FASTA/);
  assert.doesNotMatch(html, /<script|\son[a-z]+=/i);
});

test('/integritet pekar på integritet.html', () => {
  const { rewrites } = JSON.parse(read('vercel.json'));
  assert.ok(rewrites.some(r => r.source === '/integritet' && r.destination === '/integritet.html'));
});
