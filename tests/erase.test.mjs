// Tests for "Radera all data" and the 30-day cleanup of hidden copies (T-05).
// Run with: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';

const DAY = 24 * 3600000;
const v2 = JSON.stringify({ schemaVersion: 2, active: null, profile: { age: 40 }, events: [] });

let store;
function fakeStorage(init) {
  store = new Map(Object.entries(init));
  return {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: k => { store.delete(k); },
  };
}

// Each call gives a fresh state.js, like a new tab
let n = 0;
async function openApp(init) {
  globalThis.localStorage = fakeStorage(init);
  const m = await import(`../js/state.js?erase=${n++}`);
  m.loadState();
  m.loadProfile();
  return m;
}

const allKeys = () => ({
  'fasta-data': v2,
  'fasta-data-backup': JSON.stringify({ schemaVersion: 2, events: [], backedUpAt: Date.now() }),
  'fasta-data-pre-v2': '{"schemaVersion":1}',
  'fasta-data-corrupt': 'x',
  'fasta-data-error': 'y',
  'fasta-data-migrated-at': String(Date.now()),
  fs4: 'null', fh2: '[]', 'fasta-profile': '{}',
  'other-app': 'keep',
});

test('erase removes exactly the FASTA keys and starts over empty', async () => {
  const m = await openApp(allKeys());
  m.eraseAllData();
  assert.deepEqual([...store.keys()].sort(), ['fasta-data', 'other-app']);
  assert.equal(store.get('other-app'), 'keep');
  assert.deepEqual(JSON.parse(store.get('fasta-data')).events, []);
  assert.equal(m.state.fasting, false);
});

test('erase is refused when another tab saved since', async () => {
  const m = await openApp(allKeys());
  store.set('fasta-data', v2.replace('40', '50'));
  assert.throws(() => m.eraseAllData(), e => e instanceof m.SaveRefused && e.reason === 'stale');
  assert.equal(store.get('fasta-data-backup') !== undefined, true);
  assert.equal(store.size, 10);
});

test('erase is refused when a newer app version owns the data', async () => {
  const newer = JSON.stringify({ schemaVersion: 99, events: [] });
  const m = await openApp({ 'fasta-data': newer, fs4: 'null' });
  assert.throws(() => m.eraseAllData(), e => e instanceof m.SaveRefused && e.reason === 'newer');
  assert.equal(store.get('fasta-data'), newer);
  assert.equal(store.get('fs4'), 'null');
});

test('old copies get a timestamp and are kept before 30 days', async () => {
  await openApp({ 'fasta-data': v2, 'fasta-data-pre-v2': 'old', fh2: '[]' });
  assert.ok(Number(store.get('fasta-data-migrated-at')) > 0);
  store.set('fasta-data-migrated-at', String(Date.now() - 29 * DAY));
  await openApp(Object.fromEntries(store));
  assert.equal(store.get('fasta-data-pre-v2'), 'old');
  assert.equal(store.get('fh2'), '[]');
});

test('old copies and the import backup are removed after 30 days', async () => {
  const old = Date.now() - 31 * DAY;
  await openApp({
    'fasta-data': v2,
    'fasta-data-pre-v2': 'old', fs4: 'null', fh2: '[]', 'fasta-profile': '{}',
    'fasta-data-migrated-at': String(old),
    'fasta-data-backup': JSON.stringify({ schemaVersion: 2, events: [], backedUpAt: old }),
    'fasta-data-error': 'y', 'fasta-data-corrupt': 'x',
  });
  assert.deepEqual([...store.keys()].sort(), ['fasta-data', 'fasta-data-corrupt', 'fasta-data-error']);
});

test('a recent import backup is kept', async () => {
  const b = JSON.stringify({ schemaVersion: 2, events: [], backedUpAt: Date.now() - 29 * DAY });
  await openApp({ 'fasta-data': v2, 'fasta-data-backup': b });
  assert.equal(store.get('fasta-data-backup'), b);
});

test('nothing is cleaned up while the data is locked', async () => {
  const old = String(Date.now() - 365 * DAY);
  const broken = JSON.stringify({ schemaVersion: '2' });
  await openApp({ 'fasta-data': broken, 'fasta-data-pre-v2': 'old', 'fasta-data-migrated-at': old });
  assert.equal(store.get('fasta-data-pre-v2'), 'old');
  assert.equal(store.get('fasta-data-migrated-at'), old);
  assert.equal(store.get('fasta-data-error'), broken);
});
