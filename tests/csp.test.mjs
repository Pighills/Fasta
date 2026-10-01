import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const files = ['index.html', 'integritet.html', ...readdirSync('js').filter(f => f.endsWith('.js')).map(f => 'js/' + f),
  ...readdirSync('js/views').map(f => 'js/views/' + f)].filter(f => existsSync(f));

test('inga inline-händelser (CSP tillåter inte inline-skript)', () => {
  for (const f of files) {
    const hits = readFileSync(f, 'utf8').match(/\son[a-z]+\s*=\s*["']/g);
    assert.equal(hits, null, `${f}: ${hits}`);
  }
});

test('CSP-huvudet finns och tillåter bara egna skript', () => {
  const headers = JSON.parse(readFileSync('vercel.json', 'utf8')).headers.flatMap(h => h.headers);
  const csp = headers.find(h => h.key === 'Content-Security-Policy')?.value;
  assert.ok(csp);
  const scriptSrc = csp.split(';').map(s => s.trim()).find(s => s.startsWith('script-src'));
  assert.equal(scriptSrc, "script-src 'self'");
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
});
