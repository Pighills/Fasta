// Tests for the pure check-in views in js/checkin.js (T-22).
// Run with: node --test tests/
process.env.TZ = 'Europe/Stockholm'; // local days and DST as for Swedish users
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  dayKey, validDay, addDays, cleanCheckin, isEmptyCheckin, checkinFor, checkinDays, weekAverages,
  weightSeries, firstWeekDrop, symptomCounts, weighingFor, targetInfo,
} from '../js/checkin.js';
import { CHECKIN_TEXT } from '../js/data.js';

const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime();
let n = 0;
const ev = (day, data, t = at(2026, 9, 1) + n++) => ({ id: `c${n}`, type: 'checkin', t, data: { day, ...data } });

test('dayKey uses the local date, also just after midnight', () => {
  assert.equal(dayKey(at(2026, 9, 27, 0) + 60000), '2026-09-27');
  assert.equal(dayKey(at(2026, 9, 26, 23) + 59 * 60000), '2026-09-26');
});

test('validDay and addDays over month end and DST changes', () => {
  assert.ok(validDay('2026-02-28'));
  for (const d of ['2026-02-30', '2026-13-01', '26-09-01', '2026-9-1', null, 20260901]) assert.equal(validDay(d), false);
  assert.equal(addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(addDays('2026-03-28', 2), '2026-03-30'); // summer time 29 March
  assert.equal(addDays('2026-10-24', 2), '2026-10-26'); // winter time 25 October
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
});

test('cleanCheckin empties bad values and skips a broken day', () => {
  for (const x of [0, 6, 2.5, '3', null, undefined]) assert.equal(cleanCheckin({ day: '2026-09-01', energy: x }).energy, null);
  assert.equal(cleanCheckin({ day: '2026-09-01', sleep: 5 }).sleep, 5);
  assert.equal(cleanCheckin({ day: '2026-09-01', weight: 29.9 }).weight, null);
  assert.equal(cleanCheckin({ day: '2026-09-01', weight: 250.1 }).weight, null);
  assert.equal(cleanCheckin({ day: '2026-09-01', weight: 80.4 }).weight, 80.4);
  assert.deepEqual(cleanCheckin({ day: '2026-09-01', symptoms: ['yrsel', 'okänt', 'huvudvark'] }).symptoms, ['huvudvark', 'yrsel']);
  assert.deepEqual(cleanCheckin({ day: '2026-09-01', symptoms: 'yrsel' }).symptoms, []);
  for (const d of [{ day: 'x' }, {}, null, 'text']) assert.equal(cleanCheckin(d), null);
  assert.ok(isEmptyCheckin(cleanCheckin({ day: '2026-09-01', energy: 9 })));
  assert.ok(!isEmptyCheckin(cleanCheckin({ day: '2026-09-01', symptoms: ['yrsel'] })));
});

test('checkinFor: two events for the same day, the latest wins', () => {
  const events = [ev('2026-09-01', { energy: 2 }, 200), ev('2026-09-01', { energy: 4 }, 100), { type: 'fast', t: 1, data: {} }];
  assert.equal(checkinFor(events, '2026-09-01').energy, 2);
  assert.equal(checkinFor(events, '2026-09-02'), null);
  assert.equal(checkinFor(undefined, '2026-09-01'), null);
});

test('checkinDays lists every local day, also over DST and month end', () => {
  const days = checkinDays([ev('2026-10-25', { sleep: 3 })], '2026-10-24', '2026-11-01');
  assert.deepEqual(days.map(d => d.day), ['2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28',
    '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
  assert.equal(days[1].checkin.sleep, 3);
  assert.equal(days[0].checkin, null);
  assert.equal(checkinDays([], '2026-03-01', '2026-03-31').length, 31);
  assert.equal(checkinDays([], '2026-09-01', '2026-09-28').length, 28);
});

test('weekAverages: Monday–Sunday, at least 3 values, empty scales not counted', () => {
  const now = at(2026, 9, 27); // Sunday
  const events = [
    ev('2026-09-21', { energy: 4, hunger: 2 }), ev('2026-09-23', { energy: 3 }), ev('2026-09-27', { energy: 5, weight: 80 }),
    ev('2026-09-20', { energy: 1 }), // last week's Sunday
    ev('2026-09-14', { energy: 2, weight: 82 }), ev('2026-09-15', { energy: 3 }),
  ];
  const { thisWeek, lastWeek } = weekAverages(events, now);
  assert.equal(thisWeek.energy, 4);
  assert.equal(thisWeek.hunger, null); // only one value
  assert.equal(thisWeek.sleep, null);
  assert.equal(thisWeek.weight, 80);
  assert.equal(lastWeek.energy, 2);
  assert.equal(lastWeek.weight, 82);
  // Monday starts a new week
  assert.equal(weekAverages(events, at(2026, 9, 28)).thisWeek.energy, null);
});

test('weightSeries: 8 weeks back, 7-day trend', () => {
  const now = at(2026, 9, 27);
  const events = [ev('2026-07-01', { weight: 90 }), ev('2026-09-20', { weight: 82 }), ev('2026-09-24', { weight: 81 }),
    ev('2026-09-27', { weight: 80 }), ev('2026-09-26', { energy: 3 }), ev('2026-09-28', { weight: 70 })];
  const s = weightSeries(events, now);
  assert.deepEqual(s.map(x => x.day), ['2026-09-20', '2026-09-24', '2026-09-27']);
  assert.equal(s[1].avg7, 81.5);
  assert.equal(s[2].avg7, 80.5); // 20 Sep is outside the 7 days
});

test('firstWeekDrop: more than 1 kg in the first 7 days after the first weighing', () => {
  assert.equal(firstWeekDrop([ev('2026-09-01', { weight: 80 })]), false);
  assert.equal(firstWeekDrop([ev('2026-09-01', { weight: 80 }), ev('2026-09-08', { weight: 79 })]), false); // exactly 1 kg
  assert.equal(firstWeekDrop([ev('2026-09-01', { weight: 80 }), ev('2026-09-08', { weight: 78.9 })]), true);
  assert.equal(firstWeekDrop([ev('2026-09-01', { weight: 80 }), ev('2026-09-09', { weight: 75 })]), false); // day 8
  assert.equal(firstWeekDrop([ev('2026-09-01', { weight: 80.3 }), ev('2026-09-04', { weight: 79.2 })]), true);
});

test('symptomCounts counts days per symptom in the period', () => {
  const events = [ev('2026-09-01', { symptoms: ['yrsel', 'trotthet'] }), ev('2026-09-02', { symptoms: ['trotthet'] }),
    ev('2026-08-31', { symptoms: ['huvudvark'] })];
  assert.deepEqual(symptomCounts(events, '2026-09-01', '2026-09-28'), { yrsel: 1, trotthet: 2 });
});

test('weighingFor: weekly by default, never for eating disorder or under 18, own choice kept', () => {
  assert.equal(weighingFor({}), 'weekly');
  assert.equal(weighingFor(undefined), 'weekly');
  assert.equal(weighingFor({ health: { eatingDisorder: true } }), 'never');
  assert.equal(weighingFor({ health: { under18: true } }), 'never');
  assert.equal(weighingFor({ health: { under18: true }, weighing: 'daily' }), 'daily');
  assert.equal(weighingFor({ weighing: 'ofta' }), 'weekly');
});

test('targetInfo: kg left hidden for eating disorder / under 18 and without weighing', () => {
  const events = [ev('2026-09-01', { weight: 82 }), ev('2026-09-05', { weight: 80.26 })];
  assert.deepEqual(targetInfo(75, events, {}), { target: 75, left: 5.3 });
  assert.deepEqual(targetInfo(75, events, { health: { eatingDisorder: true } }), { target: 75, left: null });
  assert.deepEqual(targetInfo(75, [], {}), { target: 75, left: null });
  assert.equal(targetInfo(null, events, {}), null);
});

test('CHECKIN_TEXT is copied verbatim from docs/kunskap/fas1.md', () => {
  const doc = readFileSync(new URL('../docs/kunskap/fas1.md', import.meta.url), 'utf8');
  for (const [k, text] of Object.entries(CHECKIN_TEXT)) assert.ok(doc.includes(text), k);
});
