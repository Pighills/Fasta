import { test } from 'node:test';
import assert from 'node:assert/strict';
import { migrate } from '../js/migrations.js';
import * as storage from '../js/state.js';
import { dayKey, addDays } from '../js/checkin.js';
import { saveDailyCheckin, deleteDailyCheckin, setWeighing } from '../js/actions.js';

const today = () => dayKey(Date.now());
const data = { energy: 3, hunger: null, sleep: 4, weight: 80, symptoms: [] };
function setup() {
  const values = new Map([['fasta-data', JSON.stringify(migrate({ schemaVersion: 2, active: {}, profile: { age: 42 }, events: [{ id: 'other', type: 'custom', t: 1, data: { keep: true } }] }))]]);
  globalThis.localStorage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) };
  storage.reload();
}
const saved = () => JSON.parse(localStorage.getItem('fasta-data'));

test('daily check-in saves, overwrites and deletes only its own event', () => {
  setup();
  const before = saved();
  saveDailyCheckin(today(), data, null);
  const first = saved().events.find(e => e.type === 'checkin');
  saveDailyCheckin(today(), { ...data, energy: 5 }, storage.checkinView(today()));
  assert.equal(saved().events.length, 2);
  assert.equal(saved().events.find(e => e.type === 'checkin').id, first.id);
  assert.equal(storage.checkinView(today()).energy, 5);
  deleteDailyCheckin(today(), storage.checkinView(today()));
  assert.deepEqual(saved(), before);
});

test('an old day and an empty check-in never write data', () => {
  setup(); const raw = localStorage.getItem('fasta-data');
  for (const day of [addDays(today(), -1), addDays(today(), 1)]) {
    assert.throws(() => saveDailyCheckin(day, data, null), /ny dag/);
    assert.throws(() => deleteDailyCheckin(day, null), /ny dag/);
  }
  assert.throws(() => saveDailyCheckin(today(), {}, null), /Fyll i minst en sak/);
  assert.equal(localStorage.getItem('fasta-data'), raw);
});

test('stale dialog refuses after another check-in was loaded', () => {
  setup(); saveDailyCheckin(today(), data, null);
  const expected = storage.checkinView(today());
  saveDailyCheckin(today(), { ...data, energy: 1 }, expected);
  storage.reload();
  const raw = localStorage.getItem('fasta-data');
  assert.throws(() => saveDailyCheckin(today(), data, expected), e => e.reason === 'stale');
  assert.throws(() => deleteDailyCheckin(today(), expected), e => e.reason === 'stale');
  assert.equal(localStorage.getItem('fasta-data'), raw);
});

test('unloaded changes in another tab are protected by persist', () => {
  setup(); const next = saved(); next.profile.age = 50;
  const raw = JSON.stringify(next); localStorage.setItem('fasta-data', raw);
  assert.throws(() => saveDailyCheckin(today(), data, null), e => e.reason === 'stale');
  assert.equal(localStorage.getItem('fasta-data'), raw);
});

test('weighing preference preserves existing weights and refuses an old selection', () => {
  setup(); saveDailyCheckin(today(), data, null);
  const before = saved();
  setWeighing('never', 'weekly');
  assert.equal(saved().profile.weighing, 'never');
  assert.equal(saved().profile.age, before.profile.age);
  assert.deepEqual(saved().events, before.events);
  assert.throws(() => setWeighing('daily', 'weekly'), e => e.reason === 'stale');
});
