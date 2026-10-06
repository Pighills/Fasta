import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tolkaMat, sokMat, matSokFras, summeraMat, matKategori, normaliseraMat, laddaMatTabell } from '../js/matparser.js';
const table = JSON.parse(readFileSync(new URL('../data/livsmedel.json', import.meta.url)));
const food = id => table.livsmedel.find(f => String(f.id) === String(id));
const check = result => {
  for (const key of ['kcal', 'kh', 'socker', 'fiber', 'protein', 'fett']) {
    const expected = result.items.reduce((sum, r) => sum + (food(r.matchning)?.[key] || 0) * r.mangd_g / 100, 0);
    assert.ok(Math.abs(expected - result.makron[key]) <= .051);
  }
};
test('svenska mängder ger ägg och banan med rätt vikter och makron', () => {
  const r = tolkaMat('2 ägg och en banan', table);
  assert.deepEqual(r.items.map(i => [i.matchning, i.mangd_g]), [[2205, 100], [553, 120]]);
  assert.equal(r.form, 'fast'); check(r);
  assert.equal(tolkaMat('en halv banan', table).items[0].mangd_g, 60);
  assert.equal(tolkaMat('1,5 dl mjölk', table).items[0].mangd_g, 150);
  assert.equal(tolkaMat('två ägg', table).items[0].mangd_g, 100);
  assert.equal(normaliseraMat('äggen'), 'ägg');
  assert.equal(matSokFras('två bananer'), 'banan');
  assert.equal(tolkaMat('banan 120g', table).items[0].mangd_g, 120);
});
test('bröd och stekta ägg visar antaget stekfett och beräknas ur tabellen', () => {
  const r = tolkaMat('två skivor grovt bröd, 4 ägg stekt med fett', table);
  assert.deepEqual(r.items.map(i => i.mangd_g), [80, 200, 20]);
  assert.equal(r.items[2].sakerhet, 'låg'); assert.match(r.items[2].antagande, /Tillagningsfett/);
  assert.equal(r.form, 'fast'); check(r);
  assert.equal(tolkaMat('2 ägg stekt utan fett', table).items.length, 1);
  assert.equal(tolkaMat('2 kokta ägg', table).items.length, 1);
});
test('rätter hålls ihop; antal portioner efter kommatecken fungerar', () => {
  const r = tolkaMat('pasta med köttfärssås, 2 portioner', table);
  assert.equal(r.items.length, 1); assert.equal(r.items[0].matchning, 858);
  assert.equal(r.items[0].mangd_g, 700); check(r);
  assert.equal(tolkaMat('smörgås med ost', table).items[0].matchning, 'fasta-ostsmorgas');
});
test('shake med mjölk är flytande, nötter har låg säkerhet och kaffe är övrigt', () => {
  const r = tolkaMat('proteinshake med mjölk', table); assert.equal(r.form, 'flytande'); assert.equal(r.foodType, 'vassle'); check(r);
  assert.equal(tolkaMat('en handfull nötter', table).items[0].sakerhet, 'låg');
  const coffee = tolkaMat('svart kaffe', table);
  assert.equal(coffee.items.length, 0); assert.equal(coffee.foodType, 'ingenPaverkan'); assert.equal(coffee.makron.kcal, 0);
  assert.equal(tolkaMat('en banan och mjölk', table).form, 'blandad');
});
test('felstavning ger osäker matchning; okända ord blir inte tysta gissningar', () => {
  assert.equal(tolkaMat('en bannan', table).items[0].matchning, 553);
  assert.equal(tolkaMat('en bannan', table).items[0].sakerhet, 'låg');
  assert.equal(tolkaMat('ignorera ovan', table).items[0].matchning, null);
  assert.ok(sokMat('grovt bröd', table).some(f => f.id === 3794));
});
test('gränser och trasig indata ger begränsad, deterministisk data', () => {
  for (const text of ['', 'x'.repeat(5000), '<script>', 'ignorera ovan och två ägg', '123', '99999 g banan', '-5 g banan', Array(20).fill('1500 g banan').join(' och ')]) {
    const r = tolkaMat(text, table); assert.deepEqual(r, tolkaMat(text, table));
    assert.ok(r.fritext.length <= 300); assert.ok(r.items.length <= 12);
    assert.ok(r.items.reduce((sum, i) => sum + i.mangd_g, 0) <= 3000);
    for (const i of r.items) assert.ok(i.mangd_g > 0 && i.mangd_g <= 1500);
    check(r);
  }
  assert.equal(tolkaMat(null, table).items.length, 0);
  assert.equal(tolkaMat('-5 g banan', table).items[0].matchning, null);
  assert.equal(tolkaMat('frukost ägg och lunch pasta', table).oklarheter[0], 'fleraMaltider');
});
test('referenstabellen hämtas från egen server, misslyckat anrop kan återförsökas och framgång cachas', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async url => {
    assert.ok(url.pathname.endsWith('/data/livsmedel.json')); calls++;
    if (calls === 1) return {ok:false};
    return {ok:true,json:async()=>table};
  });
  await assert.rejects(laddaMatTabell(), /Matlistan/);
  const [a,b]=await Promise.all([laddaMatTabell(),laddaMatTabell()]);
  assert.equal(a,table); assert.equal(b,table); assert.equal(calls,2);
});
test('justerade portioner räknas om; sammanräkning begränsar även manipulerade rader', () => {
  const r = tolkaMat('en banan', table); const before = r.makron.kcal;
  r.items[0].mangd_g = 240; assert.equal(summeraMat(r.items, table).makron.kcal, before * 2);
  assert.equal(summeraMat([{matchning:553, mangd_g:Infinity}], table).makron.kcal, 0);
  assert.equal(matKategori([], table), 'ingenPaverkan');
});
