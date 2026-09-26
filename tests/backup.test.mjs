import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportData, importData, undoImport } from '../js/backup.js';
import { reload, snapshot, lockReason } from '../js/state.js';
import { esc } from '../js/helpers.js';

const H = 3600000;
const T0 = new Date(2026, 8, 1, 18).getTime();
const DATA = 'fasta-data';
const BACKUP = 'fasta-data-backup';
const sample = () => ({
  schemaVersion: 2,
  active: { id: 'active', fasting: true, startTime: T0 + 48 * H, goalHours: 16, rolling: false },
  profile: { gender: 'man', age: 40, height: 180, weight: 80, activity: 'lätt', extra: 'behåll' },
  events: [
    { id: 'f1', type: 'fast', t: T0, data: { end: T0 + 16 * H, duration: 16 * H, goal: 16 } },
    { id: 'm1', type: 'meal', t: T0 + H, data: { fastId: 'f1', desc: 'Ägg', pauseHours: 1 } },
    { id: 'w1', type: 'workout', t: T0 + 2 * H, data: { fastId: 'f1', type: 'Promenad', kcal: 100 } },
    { id: 'm2', type: 'meal', t: T0 + 49 * H, data: { fastId: 'active', desc: 'Soppa', pauseHours: 1 } },
  ],
});
const fileData = data => ({ app: 'FASTA', ...data });

function fakeStorage(initial) {
  const entries = new Map(Object.entries(initial));
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => { entries.set(key, String(value)); },
    removeItem: key => { entries.delete(key); },
  };
}

// The actual public export/import functions run against a minimal fake DOM.
// No production file is rewritten and no real browser storage is touched.
function app(t, initial = sample()) {
  const storage = fakeStorage({ [DATA]: JSON.stringify(initial) });
  const alerts = [], confirms = [], anchors = [], timers = [], revoked = [];
  let input, blob, reloads = 0, confirmAnswer = true;
  const globals = {
    localStorage: storage,
    window: { navigator: { standalone: false } },
    HTMLAnchorElement: class { get download() { return ''; } },
    alert: message => alerts.push(message),
    confirm: message => { confirms.push(message); return confirmAnswer; },
    location: { reload() { reloads++; reload(); } },
    document: {
      body: { appendChild(element) { element.appended = true; } },
      createElement(tag) {
        if (tag === 'input') {
          input = { files: [], click() {} };
          return input;
        }
        assert.equal(tag, 'a');
        const anchor = { click() { this.clicked = true; }, remove() { this.removed = true; } };
        anchors.push(anchor);
        return anchor;
      },
    },
    setTimeout: (callback, ms) => { timers.push({ callback, ms }); return timers.length; },
  };
  for (const [key, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, writable: true, configurable: true });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, key, previous);
      else delete globalThis[key];
    });
  }
  t.mock.method(URL, 'createObjectURL', value => { blob = value; return 'blob:fasta-test'; });
  t.mock.method(URL, 'revokeObjectURL', value => revoked.push(value));
  reload();
  return {
    storage, alerts, confirms, anchors, timers, revoked,
    get reloads() { return reloads; },
    get blob() { return blob; },
    confirmWith(value) { confirmAnswer = value; },
    async importText(text) {
      importData();
      assert.equal(input.type, 'file');
      assert.equal(input.accept, '.json,application/json');
      input.files = [{ text: async () => text }];
      input.onchange();
      // handleFile awaits only file.text(); drain its resolved promise chain.
      await new Promise(resolve => setImmediate(resolve));
    },
    async import(data) { await this.importText(JSON.stringify(fileData(data))); },
  };
}

test('public export and import round trip preserves active fast, profile and all events', async t => {
  const a = app(t);
  const before = snapshot();
  const originalRaw = a.storage.getItem(DATA);
  await exportData();
  assert.equal(a.blob.type, 'application/json');
  const json = await a.blob.text();
  const exported = JSON.parse(json);
  assert.equal(exported.app, 'FASTA');
  assert.ok(Number.isFinite(Date.parse(exported.exportedAt)));
  const { app: marker, exportedAt, ...contents } = exported;
  assert.deepEqual(contents, before);
  assert.equal(a.storage.getItem(DATA), originalRaw, 'export is read-only');
  assert.equal(a.anchors[0].href, 'blob:fasta-test');
  assert.match(a.anchors[0].download, /^fasta-backup-\d{4}-\d{2}-\d{2}\.json$/);
  assert.ok(a.anchors[0].appended && a.anchors[0].clicked && a.anchors[0].removed);
  assert.equal(a.timers[0].ms, 1000);
  a.timers[0].callback();
  assert.deepEqual(a.revoked, ['blob:fasta-test']);
  await a.importText(json);
  assert.equal(a.reloads, 1);
  assert.deepEqual(a.alerts, []);
  assert.deepEqual(snapshot(), before);
  assert.deepEqual(JSON.parse(a.storage.getItem(DATA)), before);
});

for (const version of [0, 1]) {
  test(`import migrates a version ${version} file including nested meals and workouts`, async t => {
    const a = app(t);
    const data = {
      schemaVersion: version,
      profile: { age: 50, custom: 'sparas' },
      active: { fasting: true, startTime: T0 + 24 * H, rolling: true, meals: [{ time: T0 + 25 * H, desc: 'Soppa', pauseHours: 1 }] },
      history: [{ start: T0, end: T0 + 16 * H, duration: 16 * H, custom: 'historik',
        meals: [{ time: T0 + H, desc: 'Ägg', pauseHours: 1 }],
        workouts: [{ time: T0 + 2 * H, type: 'Promenad', kcal: 100 }],
      }],
    };
    await a.import(data);
    assert.equal(a.reloads, 1);
    assert.deepEqual(a.alerts, []);
    const stored = JSON.parse(a.storage.getItem(DATA));
    assert.equal(stored.schemaVersion, 2);
    assert.deepEqual(stored.profile, data.profile);
    assert.equal(stored.events.length, 4);
    const fast = stored.events.find(e => e.type === 'fast');
    assert.equal(fast.t, T0);
    assert.equal(fast.data.duration, 16 * H);
    assert.equal(fast.data.custom, 'historik');
    const meal = stored.events.find(e => e.data.desc === 'Ägg');
    assert.equal(meal.data.fastId, fast.id);
    assert.equal(meal.t, T0 + H);
    assert.equal(stored.events.find(e => e.type === 'workout').data.fastId, fast.id);
    assert.equal(stored.events.find(e => e.data.desc === 'Soppa').data.fastId, stored.active.id);
    assert.ok(a.storage.getItem(BACKUP));
  });
}

test('version 2 import keeps identifiers, unknown fields and unfamiliar event types', async t => {
  const a = app(t);
  const data = sample();
  data.events.push({ id: 'future', type: 'checkin', t: T0, extra: 'kept', data: { mood: 'bra' } });
  await a.import(data);
  assert.deepEqual(JSON.parse(a.storage.getItem(DATA)), data);
  assert.equal(a.reloads, 1);
});

test('broken JSON, a foreign file and a malformed event list are refused without changing data', async t => {
  const a = app(t);
  const before = a.storage.getItem(DATA);
  for (const text of ['{broken', 'null', '{}', JSON.stringify({ app: 'other', schemaVersion: 2, events: [] }), JSON.stringify({ app: 'FASTA', schemaVersion: 2, events: {} })]) {
    await a.importText(text);
    assert.equal(a.storage.getItem(DATA), before);
    assert.equal(a.storage.getItem(BACKUP), null);
  }
  assert.equal(a.alerts.length, 5);
  assert.equal(a.confirms.length, 0);
  assert.equal(a.reloads, 0);
});

test('a version 2 file without events is refused without replacing data', async t => {
  const a = app(t);
  const before = a.storage.getItem(DATA);
  await a.import({ schemaVersion: 2, active: null, profile: {} });
  assert.equal(a.storage.getItem(DATA), before, 'a missing event list must not replace the existing history');
  assert.equal(a.reloads, 0);
  assert.equal(a.confirms.length, 0);
  assert.equal(a.alerts.length, 1);
});

for (const version of [0, 1, 2]) {
  test(`version ${version} requires its history list before confirmation and preserves the previous backup`, async t => {
    const a = app(t);
    const before = a.storage.getItem(DATA);
    a.storage.setItem(BACKUP, 'previous backup');
    const field = version === 2 ? 'events' : 'history';
    for (const invalid of [undefined, null, {}, '[]', 0, false]) {
      await a.import({ schemaVersion: version, active: null, profile: {}, [field]: invalid });
      assert.equal(a.storage.getItem(DATA), before);
      assert.equal(a.storage.getItem(BACKUP), 'previous backup');
    }
    assert.equal(a.confirms.length, 0);
    assert.equal(a.reloads, 0);
    assert.equal(a.alerts.length, 6);
    assert.ok(a.alerts.every(message => message.startsWith('Filen kunde inte läsas.')));
  });

  test(`version ${version} allows an explicitly empty history list`, async t => {
    const a = app(t);
    await a.import({ schemaVersion: version, active: null, profile: {}, [version === 2 ? 'events' : 'history']: [] });
    assert.equal(a.reloads, 1);
    assert.equal(a.confirms.length, 1);
    assert.deepEqual(a.alerts, []);
    assert.deepEqual(snapshot().events, []);
  });
}

for (const version of [0, 1]) {
  test(`version ${version} accepts omitted optional logs but refuses malformed nested lists`, async t => {
    const a = app(t);
    const old = { schemaVersion: version, active: { fasting: true, startTime: T0 },
      history: [{ start: T0 - 24 * H, end: T0 - 8 * H, duration: 16 * H }], profile: {} };
    const before = a.storage.getItem(DATA);
    for (const target of ['active', 'history']) {
      for (const field of ['meals', 'workouts']) {
        const invalid = structuredClone(old);
        (target === 'active' ? invalid.active : invalid.history[0])[field] = {};
        await a.import(invalid);
        assert.equal(a.storage.getItem(DATA), before);
      }
    }
    assert.equal(a.confirms.length, 0);
    assert.equal(a.reloads, 0);
    await a.import(old);
    assert.equal(a.reloads, 1);
    assert.equal(snapshot().events.length, 1);
    assert.equal(snapshot().events[0].data.duration, 16 * H);
  });
}

test('cancelling import leaves data and backup untouched', async t => {
  const a = app(t);
  const before = a.storage.getItem(DATA);
  a.confirmWith(false);
  await a.import({ schemaVersion: 2, active: null, profile: {}, events: [] });
  assert.equal(a.storage.getItem(DATA), before);
  assert.equal(a.storage.getItem(BACKUP), null);
  assert.equal(a.reloads, 0);
});

test('undo import restores the complete previous snapshot after reload', async t => {
  const a = app(t);
  const before = snapshot();
  await a.import({ schemaVersion: 2, active: null, profile: { age: 60 }, events: [] });
  assert.equal(snapshot().events.length, 0);
  assert.ok(a.storage.getItem(BACKUP));
  undoImport();
  assert.equal(a.reloads, 2);
  assert.deepEqual(snapshot(), before);
  assert.deepEqual(JSON.parse(a.storage.getItem(DATA)), before);
  assert.equal(a.storage.getItem(BACKUP), null);
});

test('cancelling undo preserves the import and its backup', async t => {
  const a = app(t);
  await a.import({ schemaVersion: 2, active: null, profile: {}, events: [] });
  const imported = a.storage.getItem(DATA), backup = a.storage.getItem(BACKUP);
  a.confirmWith(false);
  undoImport();
  assert.equal(a.storage.getItem(DATA), imported);
  assert.equal(a.storage.getItem(BACKUP), backup);
  assert.equal(a.reloads, 1);
});

test('import cannot overwrite storage locked by a newer app version', async t => {
  const a = app(t, { ...sample(), schemaVersion: 999 });
  const before = a.storage.getItem(DATA);
  assert.equal(lockReason(), 'newer');
  await a.import(sample());
  assert.equal(a.storage.getItem(DATA), before);
  assert.equal(a.storage.getItem(BACKUP), null);
  assert.equal(a.reloads, 0);
  assert.match(a.alerts[0], /Importen misslyckades/);
});

test('a file from a newer app version is refused before confirmation', async t => {
  const a = app(t);
  const before = a.storage.getItem(DATA);
  await a.import({ ...sample(), schemaVersion: 999 });
  assert.equal(a.storage.getItem(DATA), before);
  assert.equal(a.confirms.length, 0);
  assert.match(a.alerts[0], /nyare version/);
});

test('imported script-like text is preserved as data and escaped for display', async t => {
  const a = app(t);
  const data = sample();
  const text = '<script>alert("x")</script>';
  data.events[1].data.desc = text;
  await a.import(data);
  const saved = JSON.parse(a.storage.getItem(DATA)).events[1].data.desc;
  assert.equal(saved, text);
  assert.equal(esc(saved), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  assert.deepEqual(a.alerts, []);
});

test('failure to save a backup refuses import before current data is touched', async t => {
  const a = app(t);
  const before = a.storage.getItem(DATA);
  const write = a.storage.setItem;
  t.mock.method(a.storage, 'setItem', (key, value) => {
    if (key === BACKUP) throw new Error('quota');
    write(key, value);
  });
  await a.import({ schemaVersion: 2, active: null, profile: {}, events: [] });
  assert.equal(a.storage.getItem(DATA), before);
  assert.equal(a.reloads, 0);
  assert.match(a.alerts[0], /Ingen data har ändrats/);
});
