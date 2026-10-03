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

test('delningsbilden är en liten PNG i rätt storlek och anges på båda sidorna', () => {
  const png = readFileSync(new URL('../icons/og-image.png', import.meta.url));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.ok(png.length < 200 * 1024);
  for (const file of ['index.html', 'integritet.html']) {
    const head = read(file).split('</head>')[0];
    const metas = new Map([...head.matchAll(/<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)"\s*\/?\s*>/g)].map(m => [m[1], m[2]]));
    assert.equal(metas.get('og:image'), 'https://fastatimer.se/icons/og-image.png');
    assert.equal(metas.get('twitter:image'), metas.get('og:image'));
    assert.equal(metas.get('og:image:width'), '1200');
    assert.equal(metas.get('og:image:height'), '630');
    assert.equal(metas.get('twitter:card'), 'summary_large_image');
    assert.match(metas.get('og:image:alt'), /FASTA.*Periodisk fasta/);
    for (const key of ['og:title', 'og:description', 'og:url']) assert.ok(metas.get(key));
    if (file === 'integritet.html') {
      assert.equal(metas.get('og:title'), head.match(/<title>([^<]+)<\/title>/)[1]);
      assert.equal(metas.get('og:description'), metas.get('description'));
    }
  }
  assert.doesNotMatch(read('sw.js'), /og-image\.png/);
});
