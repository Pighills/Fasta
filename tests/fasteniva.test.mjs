import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FASTENIVA, FEATURES, SNITTPERSON } from '../js/data.js';
import { mealCurve, estimateInsulinLevel, timeToFastingWindow, mealPauseHours, liverGlycogenShare } from '../js/fasteniva.js';
import { effectiveProfile, calcMetabolicMultiplier } from '../js/helpers.js';
import { migrate, cleanMeal, logsFor, historyFromEvents } from '../js/migrations.js';
const H = 3600000, T = 1800000000000;
const meal = foodType => ({ time: T, foodType });
test('flaggan är av och modellens fallande tröskeltider följer underlaget', () => {
  assert.equal(FEATURES.fastenivaa, false);
  const times = [152,140,196,117,98,122,98,75,0];
  FASTENIVA.KATEGORIER.forEach((c, i) => {
    assert.ok(Math.abs(mealPauseHours(meal(c.id)) * 60 - times[i]) <= 5, c.id);
    if (c.A) {
      const now = T + c.tp * H;
      assert.ok(Math.abs((timeToFastingWindow([meal(c.id)], [], now) + now - T) / 60000 - times[i]) <= 5, c.id);
    }
  });
  assert.equal(estimateInsulinLevel([meal('ingenPaverkan')], [], T + H), 0);
  assert.equal(timeToFastingWindow([meal('ingenPaverkan')], [], T), 0);
  assert.ok(mealCurve(meal('vassle'), [], T + H) > 0);
  assert.ok(mealCurve(meal('snabbaKolhydrater'), [], T + .75 * H) > mealCurve(meal('protein'), [], T + .75 * H));
});
test('träningsfönster, varaktighet, överlapp och undantag', () => {
  const m = meal('blandad'), base = mealPauseHours(m);
  const workout = { time: T - H, durationMins: 30, type: 'Styrka' };
  assert.ok(mealPauseHours(m, [workout]) < base);
  for (const w of [{ ...workout, time: T - 3 * H }, { ...workout, durationMins: 19 }, { ...workout, type: 'Yoga/Stretch' }]) assert.equal(mealPauseHours(m, [w]), base);
  assert.ok(mealPauseHours(m, [{ ...workout, time: T + 1.5 * H }]) < base);
  assert.equal(mealPauseHours(m, [{ ...workout, time: T + 3 * H }]), base);
  assert.equal(mealPauseHours(m, [workout, workout]), mealPauseHours(m, [workout]));
  assert.equal(estimateInsulinLevel([meal('snabbaKolhydrater'), meal('snabbaKolhydrater')], [], T + .75 * H), 1);
  const protein = meal('protein');
  assert.equal(estimateInsulinLevel([protein, protein], [], T + .75 * H), .9);
  assert.equal(mealCurve(m, [], T), 0);
  assert.equal(mealCurve(m, [], T + 4 * H), 0);
  assert.equal(mealCurve({ time: T, pauseHours: 3 }, [], T + H), 0);
});
test('leverglykogen interpoleras och stannar på ändpunkterna', () => {
  for (const [h, share] of [[0,1],[12,.7],[22,.4],[72,.1],[100,.1],[-1,1],[8,.85]]) assert.equal(liverGlycogenShare(h), share);
});
test('profilens ifyllda fält används, saknade fylls från snittpersonen', () => {
  assert.equal(calcMetabolicMultiplier(SNITTPERSON), 1);
  assert.equal(calcMetabolicMultiplier({}), 1);
  const p = effectiveProfile({ weight: 95 });
  assert.equal(p.weight, 95);
  assert.deepEqual(p.filled, ['weight']);
  assert.deepEqual(p.missing, ['height','age','gender','activity']);
  assert.notEqual(calcMetabolicMultiplier({ weight: 95 }), 1);
  for (const [gender, weight, height, expected] of [['man',84,180,1.02],['kvinna',68,166,.98]]) assert.ok(Math.abs(calcMetabolicMultiplier({gender,weight,height,age:45,activity:'lätt'}) - expected) < .015);
});
test('v48-data och export/import behåller pauser, historiksummor och valfria kategorier', () => {
  const data = { schemaVersion: 2, active: null, profile: {}, events: [
    { id:'f', type:'fast', t:T, data:{end:T+16*H,duration:14*H,metDuration:14*H,goal:16} },
    { id:'m', type:'meal', t:T+H, data:{fastId:'f',pauseHours:2,kcal:400} },
  ]};
  const before = JSON.stringify(data);
  const loaded = migrate(data);
  assert.equal(JSON.stringify(data), before);
  assert.equal(logsFor(loaded.events, 'meal', 'f')[0].pauseHours, 2);
  assert.equal(historyFromEvents(loaded.events)[0].duration, 14*H);
  assert.equal(historyFromEvents(loaded.events)[0].metDuration, 14*H);
  assert.equal(cleanMeal({pauseHours:2,foodType:'okänd'}).foodType, undefined);
  loaded.events[1].data.foodType = 'protein';
  const imported = migrate(JSON.parse(JSON.stringify({app:'FASTA',...loaded})));
  assert.equal(logsFor(imported.events,'meal','f')[0].foodType, 'protein');
  assert.equal(logsFor(imported.events,'meal','f')[0].pauseHours, 2);
});
