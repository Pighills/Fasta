// Tests for the data model migrations. Run with: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_VERSION, SchemaTooNewError, migrate, normalize, historyFromEvents, logsFor, pausedMs, MAX_MET_FACTOR, cleanProfile,
} from '../js/migrations.js';

const H = 3600000;
const T0 = Date.UTC(2026, 8, 1, 18, 0);

// Realistic v1 data, same shape as the app wrote before the event log
function v1Data() {
  return {
    schemaVersion: 1,
    active: {
      fasting: true, startTime: T0 + 100 * H, goalHours: 16, rolling: false,
      meals: [{ time: T0 + 102 * H, desc: 'Kaffe med mjölk', kcal: 40, protein: 2, pauseHours: 1 }],
      workouts: [{ time: T0 + 103 * H, type: 'Promenad', icon: '🚶', durationMins: 30, kcal: 120, avgHr: 0, maxHr: 0 }],
    },
    history: [
      {
        start: T0, end: T0 + 16.5 * H, duration: 16.5 * H, metDuration: 17 * H,
        goal: 16, reachedGoal: true, rolling: false, meals: [], workouts: [],
        profile: { gender: 'man', age: 40, height: 180, weight: 80, activity: 'aktiv' },
      },
      {
        start: T0 + 24 * H, end: T0 + 44 * H, duration: 19 * H, metDuration: 20 * H,
        goal: null, reachedGoal: false, rolling: true,
        meals: [{ time: T0 + 30 * H, desc: 'Äggröra', kcal: 250, protein: 18, pauseHours: 1 }],
        workouts: [
          { time: T0 + 35 * H, type: 'Löpning', icon: '🏃', durationMins: 45, kcal: 500, avgHr: 150, maxHr: 185 },
          { time: T0 + 40 * H, type: 'Eget: <b>yoga</b>', icon: '🧘', durationMins: 20, kcal: 0, avgHr: 0, maxHr: 0 },
        ],
        profile: null,
        extraFieldFromOldVersion: 'kept',
      },
      // Very old entry without meals/workouts fields
      { start: T0 + 60 * H, end: T0 + 72 * H, duration: 12 * H, goal: 12, reachedGoal: true, rolling: false },
    ],
    profile: { gender: 'man', age: 40, height: 180, weight: 80, activity: 'aktiv', health: { diabetesMeds: true } },
  };
}

const strip = h => h.map(({ _id, ...e }) => e);
const withLogs = e => ({ ...e, meals: e.meals ?? [], workouts: e.workouts ?? [] });

test('v1 → v2 keeps every fast, meal, workout and field', () => {
  const old = v1Data();
  const d = migrate(structuredClone(old));
  assert.equal(d.schemaVersion, SCHEMA_VERSION);
  assert.deepEqual(strip(historyFromEvents(d.events)), old.history.map(withLogs));
  assert.deepEqual(d.profile, old.profile);
  assert.equal(d.events.filter(e => e.type === 'fast').length, 3);
  assert.equal(d.events.filter(e => e.type === 'meal').length, 2);
  assert.equal(d.events.filter(e => e.type === 'workout').length, 3);
  for (const e of d.events) {
    assert.equal(typeof e.id, 'string');
    assert.ok(Number.isFinite(e.t));
  }
  assert.equal(new Set(d.events.map(e => e.id)).size, d.events.length, 'ids are unique');
});

test('v1 → v2 moves the active fast with its meals and workouts', () => {
  const old = v1Data();
  const d = migrate(structuredClone(old));
  const { meals, workouts, ...rest } = old.active;
  assert.deepEqual({ ...d.active, id: undefined }, { ...rest, id: undefined });
  assert.ok(d.active.id);
  assert.deepEqual(logsFor(d.events, 'meal', d.active.id), meals);
  assert.deepEqual(logsFor(d.events, 'workout', d.active.id), workouts);
  // Active logs do not show up in history
  assert.equal(historyFromEvents(d.events).flatMap(h => h.meals).length, 1);
});

test('v1 without an active fast keeps goal and rolling', () => {
  const old = v1Data();
  old.active = { fasting: false, startTime: null, goalHours: 18, rolling: false, meals: [], workouts: [] };
  const d = migrate(old);
  assert.equal(d.active.goalHours, 18);
  assert.equal(d.active.rolling, false);
  assert.equal(d.active.id, undefined);
  assert.equal(d.events.length, 3 + 1 + 2);
});

test('v0 (legacy keys) → v2', () => {
  const old = v1Data();
  const v0 = { schemaVersion: 0, active: old.active, history: old.history, profile: old.profile };
  const d = migrate(structuredClone(v0));
  assert.deepEqual(strip(historyFromEvents(d.events)), old.history.map(withLogs));
  assert.deepEqual(d.profile, old.profile);
});

test('v0 with nothing stored gives empty data', () => {
  const d = migrate({ schemaVersion: 0, active: null, history: null, profile: null });
  assert.deepEqual(d, { schemaVersion: SCHEMA_VERSION, active: null, profile: {}, events: [] });
});

test('v2 export → import round trip is identical', () => {
  const d = migrate(v1Data());
  const file = JSON.parse(JSON.stringify({ app: 'FASTA', exportedAt: 'x', ...d }));
  const again = migrate(file);
  assert.deepEqual(again, d);
});

test('broken data does not crash and keeps what is valid', () => {
  const d = migrate({
    schemaVersion: 1,
    active: 'nonsense',
    history: [null, 5, { start: T0, duration: H, meals: 'trasig', workouts: null }, { start: T0 + H, duration: H, meals: [null, { time: T0 + H, desc: 'ok' }] },
      { start: T0 + 5 * H, meals: [] }],
    profile: [],
  });
  const h = historyFromEvents(d.events);
  // The fast without a length is kept in the log but not shown
  assert.equal(d.events.filter(e => e.type === 'fast').length, 3);
  assert.equal(h.length, 2);
  assert.deepEqual(h[0].meals, []);
  assert.deepEqual(h[1].meals, [{ time: T0 + H, desc: 'ok', pauseHours: 0, kcal: 0 }]);
  assert.equal(d.active, null);
  assert.deepEqual(d.profile, {});
});

test('broken v2 events are cleaned', () => {
  const d = migrate({
    schemaVersion: 2, active: { fasting: true, startTime: T0 }, profile: {},
    events: [null, { type: 5 }, { type: 'fast', t: T0 }, { id: 'a', type: 'weight', t: T0, data: { kg: 80 } }],
  });
  assert.equal(d.events.length, 2);
  assert.ok(d.events[0].id);
  assert.deepEqual(d.events[0].data, {});
  assert.deepEqual(d.events[1], { id: 'a', type: 'weight', t: T0, data: { kg: 80 } });
  assert.ok(d.active.id, 'active fast without id gets one');
});

test('data from a newer app version is refused', () => {
  assert.throws(() => migrate({ schemaVersion: SCHEMA_VERSION + 1 }), SchemaTooNewError);
});

test('pausedMs merges overlapping pauses and clips to the fast', () => {
  // 1h pause at +2h, second meal at +2.5h with 1h pause → 1.5h, not 2h
  const meals = [{ time: T0 + 2 * H, pauseHours: 1 }, { time: T0 + 2.5 * H, pauseHours: 1 }];
  assert.equal(pausedMs(meals, T0, T0 + 10 * H), 1.5 * H);
  // Pause still running at "now" counts only up to now
  assert.equal(pausedMs(meals, T0, T0 + 3 * H), 1 * H);
  // Pause before the start and broken values are ignored
  assert.equal(pausedMs([{ time: T0 - 2 * H, pauseHours: 1 }, { time: T0 + H, pauseHours: 'x' }, { time: T0 + H }], T0, T0 + 5 * H), 0);
});

test('history recomputes a fast saved with double-subtracted pauses', () => {
  const events = [
    // 20h fast, overlapping pauses 1.5h real → 18.5h, but saved as 18h
    { id: 'f', type: 'fast', t: T0, data: { end: T0 + 20 * H, duration: 18 * H, metDuration: 20 * H, goal: 18.5, reachedGoal: false, rolling: false, profile: { p: 1 } } },
    { id: 'm1', type: 'meal', t: T0 + 2 * H, data: { fastId: 'f', pauseHours: 1 } },
    { id: 'm2', type: 'meal', t: T0 + 2.5 * H, data: { fastId: 'f', pauseHours: 1 } },
  ];
  const before = structuredClone(events);
  const [h] = historyFromEvents(events, () => 1.2);
  assert.equal(h.duration, 18.5 * H);
  assert.equal(h.metDuration, 20 * H + 0.5 * H * 1.2);
  assert.equal(h.reachedGoal, true);
  assert.deepEqual(events, before, 'stored data is not changed');
});

test('pausedMs: a pause wholly inside another counts once', () => {
  // 4h pause at +1h, second meal at +2h with 1h pause (ends at +3h, inside)
  const meals = [{ time: T0 + H, pauseHours: 4 }, { time: T0 + 2 * H, pauseHours: 1 }];
  assert.equal(pausedMs(meals, T0, T0 + 10 * H), 4 * H);
  // Same, logged in the other order
  assert.equal(pausedMs([...meals].reverse(), T0, T0 + 10 * H), 4 * H);
});

test('pausedMs: a pause ending exactly when the next starts adds both', () => {
  const meals = [{ time: T0 + H, pauseHours: 2 }, { time: T0 + 3 * H, pauseHours: 1 }];
  assert.equal(pausedMs(meals, T0, T0 + 10 * H), 3 * H);
});

// ── H3: field check ──

// Garbage of every kind a hand-edited or broken backup file could hold
const GARBAGE = [undefined, null, 'x', '', -5, 1e308, Infinity, NaN, [], {}, true];

test('H3: normalize never throws and never changes stored values', () => {
  for (const g of [...GARBAGE, 'text', 42]) assert.doesNotThrow(() => normalize(g));
  assert.deepEqual(normalize(null), { schemaVersion: SCHEMA_VERSION, active: null, profile: {}, events: [] });
  const events = [
    { id: 'm', type: 'meal', t: T0, data: { fastId: 'f', pauseHours: -3, kcal: 'mycket' } },
    { id: 'w', type: 'workout', t: 'igår', data: { fastId: 'f', durationMins: -20, kcal: 99999 } },
  ];
  const d = normalize({ active: { fasting: true, startTime: 'abc', id: 'f' }, profile: { age: 500 }, events });
  assert.deepEqual(d.events, events, 'values in the log are kept as they are');
  assert.equal(d.active.startTime, 'abc');
  assert.equal(d.profile.age, 500);
  for (const g of GARBAGE) {
    assert.doesNotThrow(() => normalize({ active: g, profile: g, events: [{ type: 'meal', t: g, data: g }, g] }));
  }
});

test('H3: meals with broken fields give numbers, never NaN', () => {
  for (const g of GARBAGE) {
    const events = [
      { id: 'f', type: 'fast', t: T0, data: { end: T0 + 16 * H, duration: 16 * H } },
      { id: 'm', type: 'meal', t: T0 + H, data: { fastId: 'f', desc: 'x', kcal: g, pauseHours: g } },
    ];
    const [m] = logsFor(events, 'meal', 'f');
    assert.ok(Number.isFinite(m.pauseHours) && m.pauseHours >= 0 && m.pauseHours <= 4, `pauseHours ${String(g)}`);
    assert.ok(Number.isFinite(m.kcal) && m.kcal >= 0 && m.kcal <= 3000, `kcal ${String(g)}`);
    assert.ok(Number.isFinite(pausedMs([m], T0, T0 + 16 * H)));
    const [h] = historyFromEvents(events);
    assert.ok(Number.isFinite(h.duration) && h.duration <= 16 * H);
  }
  // Missing pauseHours = no pause
  const [m] = logsFor([{ id: 'm', type: 'meal', t: T0, data: { fastId: 'f' } }], 'meal', 'f');
  assert.equal(m.pauseHours, 0);
  assert.equal(m.kcal, 0);
});

test('H3: fasts with broken start, end or length', () => {
  const events = [
    { id: 'a', type: 'fast', t: 'igår', data: { end: T0, duration: H } },       // no valid start: hidden
    { id: 'b', type: 'fast', t: T0, data: {} },                                // no length: hidden
    { id: 'c', type: 'fast', t: T0, data: { duration: 2 * H } },               // no end: end = start + length
    { id: 'd', type: 'fast', t: T0, data: { end: T0 + 3 * H, duration: 'x' } }, // length from start/end
    { id: 'e', type: 'fast', t: T0, data: { end: T0 + H, duration: H, metDuration: NaN } },
    { id: 'm', type: 'meal', t: NaN, data: { fastId: 'd', pauseHours: 1 } },  // no valid time: skipped
  ];
  const h = historyFromEvents(events);
  assert.deepEqual(h.map(x => x._id), ['c', 'd', 'e']);
  assert.equal(h[0].end, T0 + 2 * H);
  assert.equal(h[1].duration, 3 * H);
  assert.deepEqual(h[1].meals, []);
  assert.equal(h[2].metDuration, undefined);
});

// ── K1: workouts ──

test('K1: unreasonable workouts are limited on read, stored data untouched', () => {
  const events = [
    { id: 'w1', type: 'workout', t: T0, data: { fastId: 'f', durationMins: -20, kcal: 99999, avgHr: 500, maxHr: 20 } },
    { id: 'w2', type: 'workout', t: T0, data: { fastId: 'f', durationMins: 'lång', kcal: 'x' } },
    { id: 'w3', type: 'workout', t: T0, data: { fastId: 'f', durationMins: 45, kcal: 500, avgHr: 150, maxHr: 185 } },
  ];
  const before = structuredClone(events);
  const [a, b, c] = logsFor(events, 'workout', 'f');
  assert.deepEqual([a.durationMins, a.kcal, a.avgHr, a.maxHr], [1, 2000, 0, 0]);
  assert.equal('durationMins' in b, false, 'no valid length: not shown');
  assert.equal(b.kcal, 0);
  assert.deepEqual([c.durationMins, c.kcal, c.avgHr, c.maxHr], [45, 500, 150, 185], 'normal values kept');
  assert.deepEqual(events, before);
});

test('K1: metabolic time in history is at most 1.4 × the actual time', () => {
  const events = [
    // 17 s fast saved with +1250 h "metabolic effect"
    { id: 'a', type: 'fast', t: T0, data: { end: T0 + 17000, duration: 17000, metDuration: 1250 * H } },
    // Normal fast: kept
    { id: 'b', type: 'fast', t: T0, data: { end: T0 + 16 * H, duration: 16 * H, metDuration: 18 * H } },
  ];
  const before = structuredClone(events);
  const [a, b] = historyFromEvents(events);
  assert.equal(a.metDuration, 17000 * MAX_MET_FACTOR);
  assert.equal(b.metDuration, 18 * H);
  assert.deepEqual(events, before);
});

// ── M6: profile ──

test('M6: unreasonable profile values count as not filled in', () => {
  const p = { gender: 'man', age: 500, height: 'lång', weight: -5, activity: 'aktiv', health: { under18: true } };
  assert.deepEqual(cleanProfile(p), { gender: 'man', age: null, height: null, weight: null, activity: 'aktiv', health: { under18: true } });
  const ok = { age: 40, height: 180, weight: 80.5 };
  assert.deepEqual(cleanProfile(ok), ok);
  for (const g of GARBAGE) {
    const c = cleanProfile({ age: g, height: g, weight: g });
    assert.ok([c.age, c.height, c.weight].every(v => v === null || Number.isFinite(v)));
  }
  assert.deepEqual(cleanProfile({}), { age: null, height: null, weight: null });
});
