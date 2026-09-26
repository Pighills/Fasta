import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { state, profile } from '../js/state.js';
import { PH } from '../js/data.js';
import {
  fmtClock, getPhase, getNext, calcMetabolicMultiplier, workoutBonusHours,
  calcWorkoutBonusMs, calcElapsed, calcMetabolicElapsed, esc, defaultBackdate, checkBackdate,
} from '../js/helpers.js';

const H = 3600000;
const T0 = new Date(2026, 8, 1, 18).getTime();
const reference = { gender: 'man', age: 35, weight: 78, height: 178, activity: 'lätt' };
let originalState, originalProfile;
function restore(target, values) {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, values);
}
beforeEach(() => {
  originalState = structuredClone(state);
  originalProfile = structuredClone(profile);
  Object.assign(state, { fasting: true, startTime: T0, now: T0 + 10 * H, meals: [], workouts: [] });
  restore(profile, reference);
});
afterEach(() => {
  restore(state, originalState);
  restore(profile, originalProfile);
});
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} ≈ ${expected}`);

test('fmtClock handles zero, broken and negative durations and does not wrap at a day', () => {
  for (const value of [0, -1000, NaN, undefined, null]) assert.equal(fmtClock(value), '00:00:00');
  assert.equal(fmtClock(999), '00:00:00');
  assert.equal(fmtClock(1000), '00:00:01');
  assert.equal(fmtClock(60 * 1000), '00:01:00');
  assert.equal(fmtClock(H + 2 * 60000 + 3999), '01:02:03');
  assert.equal(fmtClock(25 * H), '25:00:00');
  assert.equal(fmtClock(100 * H), '100:00:00');
});

test('getPhase and getNext select the correct phase on both sides of every boundary', () => {
  assert.equal(getPhase(-1), PH[0]);
  assert.equal(getNext(-1), PH[0]);
  for (let i = 0; i < PH.length; i++) {
    const phase = PH[i];
    assert.equal(getPhase(phase.h), phase);
    assert.equal(getNext(phase.h), PH[i + 1] || null);
    if (i > 0) {
      assert.equal(getPhase(phase.h - 0.001), PH[i - 1]);
      assert.equal(getNext(phase.h - 0.001), phase);
    }
  }
  assert.equal(getPhase(1000), PH.at(-1));
  assert.equal(getNext(1000), null);
});

test('metabolic multiplier defaults to one with absent or incomplete profiles', () => {
  for (const value of [undefined, null, {}]) assert.equal(calcMetabolicMultiplier(value), 1);
  for (const key of Object.keys(reference)) {
    assert.equal(calcMetabolicMultiplier({ ...reference, [key]: null }), 1, key);
  }
});

test('reference profile gives one and ordinary activity levels stay ordered within the limits', () => {
  near(calcMetabolicMultiplier(reference), 1);
  for (const gender of ['man', 'kvinna', 'annat']) {
    const values = ['stillasittande', 'lätt', 'aktiv', 'atlet'].map(activity =>
      calcMetabolicMultiplier({ ...reference, gender, activity }));
    for (let i = 0; i < values.length; i++) {
      assert.ok(Number.isFinite(values[i]) && values[i] >= 0.8 && values[i] <= 1.4);
      if (i) assert.ok(values[i] >= values[i - 1]);
    }
  }
});

test('extreme and non-finite profile values respect lower and upper limits', () => {
  assert.equal(calcMetabolicMultiplier({ ...reference, age: 200 }), 0.8);
  assert.equal(calcMetabolicMultiplier({ ...reference, age: -100, activity: 'atlet' }), 1.4);
  for (const key of ['weight', 'height', 'age']) {
    assert.equal(calcMetabolicMultiplier({ ...reference, [key]: Infinity }), 1);
  }
});

test('workout bonus uses heart rate zones including exact boundaries', () => {
  assert.equal(workoutBonusHours({}), 0);
  for (const [avgHr, expected] of [[119, 3], [120, 5], [149, 5], [150, 7], [169, 7], [170, 8.5], [250, 8.5]]) {
    near(workoutBonusHours({ kcal: 400, avgHr, maxHr: 200 }), expected);
  }
  near(workoutBonusHours({ kcal: 400 }), 5);
  profile.age = 40;
  near(workoutBonusHours({ kcal: 400, avgHr: 135 }), 7);
});

test('workout totals convert hours to milliseconds and combine multiple sessions', () => {
  assert.equal(calcWorkoutBonusMs(), 0);
  state.workouts = [{ kcal: 400, avgHr: 100, maxHr: 200 }, { kcal: 200, avgHr: 150, maxHr: 200 }];
  near(calcWorkoutBonusMs(), 6.5 * H);
  // Raw workout bonuses are inputs; the combined result enforces the 1.4× cap.
  near(calcMetabolicElapsed(), 14 * H);
});

for (const scenario of [
  { name: 'no pauses', meals: [], hours: 10 },
  { name: 'overlapping pauses', meals: [[1, 3], [3, 3]], hours: 5 },
  { name: 'pause inside another pause', meals: [[1, 4], [2, 1]], hours: 6 },
  { name: 'touching pauses', meals: [[1, 2], [3, 2]], hours: 6 },
  { name: 'pauses clipped to both ends of the fast', meals: [[-1, 2], [9, 3], [12, 1]], hours: 8 },
]) {
  test(`elapsed and metabolic time: ${scenario.name}`, () => {
    state.meals = scenario.meals.map(([hour, pauseHours]) => ({ time: T0 + hour * H, pauseHours }));
    assert.equal(calcElapsed(), scenario.hours * H);
    near(calcMetabolicElapsed(), scenario.hours * H);
    state.workouts = [{ kcal: 4000, avgHr: 180, maxHr: 200 }];
    near(calcMetabolicElapsed(), scenario.hours * H * 1.4);
  });
}

test('paused, inactive, missing and future start times cannot yield negative or positive bonus-only time', () => {
  state.workouts = [{ kcal: 4000 }];
  state.meals = [{ time: T0, pauseHours: 10 }];
  assert.equal(calcElapsed(), 0);
  assert.equal(calcMetabolicElapsed(), 0);
  state.meals = [];
  for (const settings of [{ fasting: false }, { fasting: true, startTime: null }, { fasting: true, startTime: state.now + H }]) {
    Object.assign(state, settings);
    assert.equal(calcElapsed(), 0);
    assert.equal(calcMetabolicElapsed(), 0);
  }
});

test('metabolic time includes small bonuses but limits profile and workout effects together', () => {
  state.workouts = [{ kcal: 40 }];
  near(calcMetabolicElapsed(), 10.5 * H);
  Object.assign(profile, { age: -100, activity: 'atlet' });
  near(calcMetabolicElapsed(), 14 * H);
});

test('esc quotes imported HTML and handles missing and numeric values as text', () => {
  assert.equal(esc(`<script a="x" b='y'>&</script>`), '&lt;script a=&quot;x&quot; b=&#39;y&#39;&gt;&amp;&lt;/script&gt;');
  assert.equal(esc('åäö &amp;'), 'åäö &amp;amp;');
  assert.equal(esc(null), '');
  assert.equal(esc(undefined), '');
  assert.equal(esc(42), '42');
  assert.equal(esc(false), 'false');
});


test('defaultBackdate is one hour ago, rounded down to a quarter', () => {
  assert.equal(defaultBackdate(new Date(2026, 8, 26, 14, 37, 20).getTime()), '2026-09-26T13:30');
  assert.equal(defaultBackdate(new Date(2026, 8, 26, 0, 10).getTime()), '2026-09-25T23:00');
  assert.equal(defaultBackdate(new Date(2026, 8, 26, 14, 45).getTime()), '2026-09-26T13:45');
});

test('checkBackdate accepts past times within 7 days and explains the rest', () => {
  const now = new Date(2026, 8, 26, 14, 0).getTime();
  assert.deepEqual(checkBackdate('2026-09-26T12:30', now), { t: new Date(2026, 8, 26, 12, 30).getTime() });
  assert.equal(checkBackdate('', now).err, 'Välj en tidpunkt.');
  assert.equal(checkBackdate('nonsens', now).err, 'Välj en tidpunkt.');
  assert.equal(checkBackdate('2026-09-26T14:00', now).err, 'Tidpunkten måste vara i det förflutna.');
  assert.equal(checkBackdate('2026-09-19T13:59', now).err, 'Du kan inte starta mer än 7 dagar bakåt.');
  assert.ok(checkBackdate(defaultBackdate(now), now).t);
});
