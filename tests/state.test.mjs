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
