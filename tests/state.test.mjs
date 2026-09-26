// Tests for loading and saving in js/state.js with a fake localStorage.
// Run with: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCHEMA_VERSION, migrate } from '../js/migrations.js';

const T0 = Date.UTC(2026, 8, 1, 18, 0);
const H = 3600000;

function fakeStorage(init) {
  const m = new Map(Object.entries(init));
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: k => { m.delete(k); },
  };
}

// Each call gives a fresh state.js (its own in-memory copy), like a new tab
let n = 0;
async function openApp(init = {}) {
  globalThis.localStorage = fakeStorage(init);
  const m = await import(`../js/state.js?tab=${n++}`);
  m.loadState();
  m.loadProfile();
  return m;
}

const v2 = () => ({
  schemaVersion: 2,
  active: { id: 'act', fasting: true, startTime: T0 + 100 * H, goalHours: 16, rolling: false },
  profile: { age: 40 },
  events: [
    { id: 'f1', type: 'fast', t: T0, data: { end: T0 + 16 * H, duration: 16 * H } },
    { id: 'm1', type: 'meal', t: T0 + 2 * H, data: { fastId: 'f1', desc: 'Ägg', pauseHours: 1 } },
    { id: 'f2', type: 'fast', t: T0 + 24 * H, data: { end: T0 + 42 * H, duration: 18 * H } },
    { id: 'w2', type: 'workout', t: T0 + 30 * H, data: { fastId: 'f2', type: 'Löpning' } },
  ],
});

// Try a change; it must not reach fasta-data (it may throw or be ignored)
function attemptChanges(m) {
  for (const f of [() => m.save(), () => m.saveProfile(), () => m.addEvent('meal', T0, {}), () => m.removeFast('f1')]) {
    try { f(); } catch (e) { /* refused */ }
  }
}

// ── H4: unknown error while loading ──

test('migrate refuses data it does not understand instead of dropping it', () => {
  assert.throws(() => migrate({ ...v2(), schemaVersion: '2' }));
  assert.throws(() => migrate({ ...v2(), schemaVersion: -1 }));
  assert.throws(() => migrate({ ...v2(), events: { a: 1 } }));
  assert.throws(() => migrate({ schemaVersion: 1, history: 'x' }));
});

test('H4: schemaVersion as text locks and keeps the data untouched', async () => {
  const raw = JSON.stringify({ ...v2(), schemaVersion: '2' });
  const m = await openApp({ 'fasta-data': raw });
  assert.equal(localStorage.getItem('fasta-data'), raw);
  assert.equal(localStorage.getItem('fasta-data-error'), raw, 'untouched copy in its own key');
  assert.deepEqual(m.state.history, []);
  attemptChanges(m);
  assert.equal(localStorage.getItem('fasta-data'), raw, 'never overwritten');
});

test('H4: events that are not a list lock and keep the data untouched', async () => {
  const raw = JSON.stringify({ ...v2(), events: { f1: {} } });
  const m = await openApp({ 'fasta-data': raw });
  attemptChanges(m);
  assert.equal(localStorage.getItem('fasta-data'), raw);
  assert.equal(localStorage.getItem('fasta-data-error'), raw);
});

test('H4: data from a newer version is kept, no error copy', async () => {
  const raw = JSON.stringify({ ...v2(), schemaVersion: SCHEMA_VERSION + 1 });
  const m = await openApp({ 'fasta-data': raw });
  attemptChanges(m);
  assert.equal(localStorage.getItem('fasta-data'), raw);
  assert.equal(localStorage.getItem('fasta-data-error'), null);
});

test('H4: unparseable data is copied before rebuilding from legacy keys', async () => {
  const history = [{ start: T0, end: T0 + 16 * H, duration: 16 * H }];
  const m = await openApp({ 'fasta-data': '{trasig', fh2: JSON.stringify(history) });
  assert.equal(localStorage.getItem('fasta-data-corrupt'), '{trasig');
  assert.equal(m.state.history.length, 1);
  assert.equal(JSON.parse(localStorage.getItem('fasta-data')).schemaVersion, SCHEMA_VERSION);
});

test('normal v2 data loads and is not changed by loading', async () => {
  const raw = JSON.stringify(v2());
  const m = await openApp({ 'fasta-data': raw });
  assert.equal(m.state.history.length, 2);
  assert.equal(m.state.fasting, true);
  assert.deepEqual(JSON.parse(localStorage.getItem('fasta-data')), v2());
  assert.equal(localStorage.getItem('fasta-data-error'), null);
});

// ── K2: an old tab never overwrites newer data ──

test('K2: an old tab cannot save over what another tab saved', async () => {
  const a = await openApp({ 'fasta-data': JSON.stringify(v2()) });
  const b = await import(`../js/state.js?tab=${n++}`); // second tab, same storage
  b.loadState();
  b.loadProfile();

  a.removeFast('f2');
  const afterA = localStorage.getItem('fasta-data');

  assert.throws(() => b.addEvent('meal', T0, { fastId: 'act' }), e => e instanceof b.SaveRefused && e.reason === 'stale');
  assert.throws(() => b.save(), b.SaveRefused);
  assert.equal(localStorage.getItem('fasta-data'), afterA, 'B did not overwrite A');

  b.reload();
  assert.deepEqual(b.state.history.map(h => h._id), ['f1']);
  b.addEvent('meal', T0 + 101 * H, { fastId: 'act', desc: 'Kaffe' });
  const d = JSON.parse(localStorage.getItem('fasta-data'));
  assert.deepEqual(d.events.map(e => e.id).slice(0, 2), ['f1', 'm1'], 'A:s change kept');
  assert.equal(d.events.length, 3);
});

// ── L3: locked data refuses changes with a reason (shown as a message) ──

test('L3: changes and export are refused with a reason when locked', async () => {
  const bad = await openApp({ 'fasta-data': JSON.stringify({ ...v2(), schemaVersion: '2' }) });
  assert.equal(bad.lockReason(), 'error');
  assert.throws(() => bad.save(), e => e instanceof bad.SaveRefused && e.reason === 'error');
  assert.throws(() => bad.snapshot(), bad.SaveRefused);

  const newer = await openApp({ 'fasta-data': JSON.stringify({ ...v2(), schemaVersion: SCHEMA_VERSION + 1 }) });
  assert.equal(newer.lockReason(), 'newer');
  assert.throws(() => newer.addEvent('meal', T0, {}), e => e.reason === 'newer');

  const ok = await openApp({ 'fasta-data': JSON.stringify(v2()) });
  assert.equal(ok.lockReason(), false);
});

// ── L4: "Ångra import" respects the lock ──

test('L4: undo import does not overwrite locked data', async () => {
  const raw = JSON.stringify({ ...v2(), schemaVersion: SCHEMA_VERSION + 1 });
  const backup = JSON.stringify({ ...v2(), events: [], backedUpAt: 1 });
  const m = await openApp({ 'fasta-data': raw, 'fasta-data-backup': backup });
  assert.throws(() => m.restoreBackup(), m.SaveRefused);
  assert.equal(localStorage.getItem('fasta-data'), raw);
  assert.equal(localStorage.getItem('fasta-data-backup'), backup, 'backup kept');
});

// ── L5: a failed save is reported, not swallowed ──

test('L5: full storage calls the handler, keeps the change and saves it later', async () => {
  const raw = JSON.stringify(v2());
  const m = await openApp({ 'fasta-data': raw });
  let failed = 0;
  m.setSaveFailedHandler(() => failed++);
  const setItem = localStorage.setItem;
  localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  m.addEvent('meal', T0 + 101 * H, { fastId: 'act', desc: 'Kaffe' });
  assert.equal(failed, 1, 'the user is told');
  assert.equal(localStorage.getItem('fasta-data'), raw, 'nothing half-written');
  assert.equal(m.state.meals.length, 1, 'the change is kept in memory');

  localStorage.setItem = setItem;
  m.saveProfile();
  assert.equal(failed, 1);
  assert.equal(JSON.parse(localStorage.getItem('fasta-data')).events.length, 5, 'saved with the next change');
});

// ── L6: deleting a fast uses its id, not its place in the list ──

test('L6: removeFast deletes the right fast and its logs after the list changed', async () => {
  const m = await openApp({ 'fasta-data': JSON.stringify(v2()) });
  const id = m.state.history[1]._id; // f2, second in the list when drawn
  m.removeFast('f1'); // the list changes: f2 is now first
  m.removeFast(id);
  assert.deepEqual(m.state.history, []);
  const d = JSON.parse(localStorage.getItem('fasta-data'));
  assert.deepEqual(d.events, [], 'f2 and its workout gone, nothing else touched');
});

test('L6: removing an id that is already gone changes nothing', async () => {
  const m = await openApp({ 'fasta-data': JSON.stringify(v2()) });
  const before = localStorage.getItem('fasta-data');
  m.removeFast('finns-inte');
  assert.deepEqual(JSON.parse(localStorage.getItem('fasta-data')), JSON.parse(before));
  m.removeFast('f2');
  assert.deepEqual(JSON.parse(localStorage.getItem('fasta-data')).events.map(e => e.id), ['f1', 'm1']);
});

// ── Review fixes ──

test('ending a fast adds its event and clears active in one write', async () => {
  const m = await openApp({ 'fasta-data': JSON.stringify(v2()) });
  let writes = 0;
  const setItem = localStorage.setItem;
  localStorage.setItem = (k, v) => { writes++; setItem(k, v); };
  m.endActiveFast({ end: T0 + 120 * H, duration: 20 * H });
  assert.equal(writes, 1);
  const d = JSON.parse(localStorage.getItem('fasta-data'));
  assert.equal(d.active.fasting, false);
  assert.equal(d.events.at(-1).id, 'act');
  assert.equal(m.state.history.length, 3);
});

test('undo import refuses when another tab saved since', async () => {
  const backup = JSON.stringify({ ...v2(), events: [], backedUpAt: 1 });
  const m = await openApp({ 'fasta-data': JSON.stringify(v2()), 'fasta-data-backup': backup });
  const newer = JSON.stringify({ ...v2(), events: [] });
  localStorage.setItem('fasta-data', newer); // another tab
  assert.throws(() => m.restoreBackup(), e => e.reason === 'stale');
  assert.equal(localStorage.getItem('fasta-data'), newer);
  assert.equal(localStorage.getItem('fasta-data-backup'), backup);
});

// ── H4 decision (Anton 2026-09-25): import over locked data ──

test('H4: import may replace unreadable data, the untouched copy stays', async () => {
  const raw = JSON.stringify({ ...v2(), schemaVersion: '2' });
  const oldBackup = JSON.stringify({ ...v2(), backedUpAt: 1 });
  const m = await openApp({ 'fasta-data': raw, 'fasta-data-backup': oldBackup });
  assert.equal(m.lockReason(), 'error');
  const imported = migrate({ ...v2(), events: [] });
  m.replaceAllData(imported);
  assert.deepEqual(JSON.parse(localStorage.getItem('fasta-data')), imported);
  assert.equal(localStorage.getItem('fasta-data-error'), raw, 'copy untouched');
  assert.equal(localStorage.getItem('fasta-data-backup'), oldBackup, 'backup untouched');
  const again = await import(`../js/state.js?tab=${n++}`); // the app reloads after import
  again.loadState();
  assert.equal(again.lockReason(), false);
});

test('H4: import is refused when unreadable data has no untouched copy', async () => {
  const raw = JSON.stringify({ ...v2(), schemaVersion: '2' });
  globalThis.localStorage = fakeStorage({ 'fasta-data': raw });
  const setItem = localStorage.setItem;
  localStorage.setItem = (k, v) => { if (k === 'fasta-data-error') throw new Error('full'); setItem(k, v); };
  const m = await import(`../js/state.js?tab=${n++}`);
  m.loadState();
  localStorage.setItem = setItem;
  assert.throws(() => m.replaceAllData(migrate(v2())), m.SaveRefused);
  assert.equal(localStorage.getItem('fasta-data'), raw);
});

test('H4: import is refused over data from a newer version', async () => {
  const raw = JSON.stringify({ ...v2(), schemaVersion: SCHEMA_VERSION + 1 });
  const m = await openApp({ 'fasta-data': raw });
  assert.throws(() => m.replaceAllData(migrate(v2())), e => e.reason === 'newer');
  assert.equal(localStorage.getItem('fasta-data'), raw);
  assert.equal(localStorage.getItem('fasta-data-backup'), null);
});

// ── H3: broken values in stored data ──

test('H3: broken active fast and log values load without NaN, stored data untouched', async () => {
  const d = v2();
  d.active = { id: 'act', fasting: true, startTime: 'abc', goalHours: 'x', rolling: false };
  d.events.push({ id: 'm9', type: 'meal', t: T0 + 3 * H, data: { fastId: 'f1', pauseHours: 'två', kcal: -50 } });
  const raw = JSON.stringify(d);
  const m = await openApp({ 'fasta-data': raw });
  assert.equal(m.state.fasting, false);
  assert.equal(m.state.goalHours, null);
  assert.ok(m.state.history.every(h => Number.isFinite(h.duration)));
  assert.equal(localStorage.getItem('fasta-data'), raw, 'loading does not rewrite the log');
});
