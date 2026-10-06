import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');

test('integritet.html har inga platshållare och ett publiceringsdatum', () => {
  const html = read('integritet.html');
  assert.match(html, /<p class="legal-date">Senast uppdaterad: \d{1,2} \p{L}+ \d{4}<\/p>/u);
  const withoutDate = html.replace(/<p class="legal-date">[^<]*<\/p>/, '');
  assert.doesNotMatch(withoutDate, /\[/);
  assert.doesNotMatch(html, /Vem ansvarar\?|Frågor:|Kontakt:/);
});

test('integritet.html finns i PRECACHE', () => {
  assert.match(read('sw.js'), /"\.\/integritet\.html"/);
});

test('Profil länkar till integritetssidan med en vanlig länk', () => {
  assert.match(read('js/views/profile.js'), /<a class="legal-link" href="integritet\.html">Integritet och villkor<\/a>/);
});

test('integritetens omskrivning behåller säkerhetshuvuden och service workerns cache-regel', () => {
  const config = JSON.parse(read('vercel.json'));
  const headers = config.headers.find(h => h.source === '/(.*)').headers;
  for (const name of ['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options', 'Content-Security-Policy']) {
    assert.ok(headers.some(h => h.key === name), `${name} saknas`);
  }
  const csp = headers.find(h => h.key === 'Content-Security-Policy').value;
  assert.ok(csp.split(';').map(s => s.trim()).includes("script-src 'self'"));
  assert.ok(config.headers.find(h => h.source === '/sw.js').headers.some(h => h.key === 'Cache-Control' && h.value === 'no-cache'));
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

test('matinmatningen förklaras lokalt och källan anges med licens', () => {
  const html=read('integritet.html');
  assert.ok(html.includes('Det du skriver när du loggar mat tolkas i din egen enhet och sparas bara där, tillsammans med dina andra uppgifter. Texten skickas inte till oss eller till någon annan tjänst.'));
  assert.ok(html.includes('Näringsvärden kommer från Livsmedelsverkets livsmedelsdatabas (Creative Commons Attribution 4.0, CC BY). Vi har räknat om och förenklat värdena. Livsmedelsverket ansvarar inte för uppskattningarna i appen.'));
  assert.match(html,/creativecommons.org\/licenses\/by\/4.0\//);
});
