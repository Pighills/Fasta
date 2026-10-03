import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('robots.txt tillåter alla sökmotorer och pekar på sitemapen', () => {
  const lines = read('robots.txt').trim().split(/\r?\n/).filter(line => line.trim());
  assert.deepEqual(lines, [
    'User-agent: *',
    'Allow: /',
    'Sitemap: https://fastatimer.se/sitemap.xml',
  ]);
});

test('sitemap har giltig enkel XML-struktur och bara de två publika adresserna', () => {
  const xml = read('sitemap.xml');
  // Match the entire supported XML structure, including paired tags and namespace.
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\s*(?:<url>\s*<loc>https:\/\/fastatimer\.se\/(?:integritet)?<\/loc>\s*<\/url>\s*){2}<\/urlset>\s*$/);
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(locations, ['https://fastatimer.se/', 'https://fastatimer.se/integritet']);
  for (const location of locations) assert.equal(new URL(location).origin, 'https://fastatimer.se');
  assert.doesNotMatch(xml, /lastmod/);
});

test('sökmotorfilerna sparas inte i service workerns förladdning', () => {
  assert.doesNotMatch(read('sw.js'), /["'][^"']*(?:robots\.txt|sitemap\.xml)["']/);
});
