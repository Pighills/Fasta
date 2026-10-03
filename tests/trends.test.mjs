import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trendsHTML } from '../js/views/trends.js';
import { CHECKIN_TEXT } from '../js/data.js';
import { addDays, dayKey } from '../js/checkin.js';

const now = new Date(2026, 8, 27, 12).getTime();
const today = dayKey(now);
const checks = n => Array.from({ length: n }, (_, i) => ({
  id: `c${i}`, type: 'checkin', t: now - i * 86400000,
  data: { day: addDays(today, -i), energy: 3, hunger: 2, sleep: 4, weight: 80 + i * 0.3, symptoms: ['huvudvark'] },
}));
const goal = { id: 'goal', type: 'goal', t: now, data: { targetWeight: 75 } };

test('empty history offers check-in without empty daily bars or averages', () => {
  const html = trendsHTML([], {}, now);
  assert.match(html, /Inga check-in ännu/);
  assert.match(html, /data-trend-checkin>Gör dagens check-in/);
  assert.doesNotMatch(html, /data-trend-day|data-trend-scroll|den här veckan|style=/);
});

test('two-day history shows daily slots but no scale averages', () => {
  const html = trendsHTML(checks(2), {}, now);
  assert.equal((html.match(/aria-label=".*?Energi/g) || []).length, 28);
  assert.match(html, /Gör check-in några dagar till/);
  assert.match(html, /Energi<\/strong>: – den här veckan/);
  assert.doesNotMatch(html, /onclick=|style=/);
});

test('ten days show weekly averages, symptoms, weight trend and approved copy', () => {
  const html = trendsHTML([...checks(10), goal], {}, now);
  assert.match(html, /Energi<\/strong>: 3 den här veckan · förra veckan 3/);
  assert.match(html, /Huvudvärk 10 dagar/);
  assert.match(html, /<polyline/);
  assert.match(html, /5 kg kvar/);
  assert.ok(html.includes(CHECKIN_TEXT.viktForstaVeckan));
  assert.ok(html.includes(CHECKIN_TEXT.viktForstaVeckanSrc));
});

test('never weighing hides weight, target and weight advice', () => {
  const html = trendsHTML([...checks(10), goal], { weighing: 'never' }, now);
  assert.doesNotMatch(html, /\bkg\b|polyline|Kreitzman/);
});

test('sensitive profiles can see an opted-in target line without distance', () => {
  for (const flag of ['under18', 'eatingDisorder']) {
    const html = trendsHTML([...checks(10), goal], { weighing: 'weekly', health: { [flag]: true } }, now);
    assert.match(html, /stroke-dasharray/);
    assert.doesNotMatch(html, /kg kvar/);
  }
});

test('no weight and no target are handled separately', () => {
  const noWeights = checks(10).map(e => ({ ...e, data: { ...e.data, weight: null } }));
  assert.doesNotMatch(trendsHTML(noWeights, {}, now), /polyline|kg kvar/);
  const html = trendsHTML(checks(10), {}, now);
  assert.match(html, /polyline/);
  assert.doesNotMatch(html, /Målvikt|stroke-dasharray/);
});
