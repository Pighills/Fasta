import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { LONG_FAST_TEXT } from '../js/data.js';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const timer = read('js/views/timer.js');
const reminderCode = timer.slice(timer.indexOf('let acknowledgedLongFast'), timer.indexOf('// What the metabolic time'))
  .replaceAll('export function', 'function');
const modalSource = read('js/modals.js');
const modalCode = modalSource.slice(modalSource.indexOf('export function openLongFastModal'), modalSource.indexOf('export function openFriskrivning'))
  .replace('export function', 'function');

function harness({ health = {}, saved = null, blocked = false } = {}) {
  const result = { started: [], html: '', saved, removed: 0 };
  const handlers = {};
  const slot = { hidden: true, childElementCount: 0, innerHTML: '', querySelector: () => ({ addEventListener: (_, fn) => { handlers.ok = fn; } }) };
  const context = {
    state: { fasting: true, rolling: true, startTime: 1234 }, profile: { health }, LONG_FAST_TEXT,
    esc: text => text,
    startFast: (...args) => result.started.push(args),
    document: { querySelector: () => null, getElementById: () => slot },
    localStorage: {
      getItem: key => { assert.equal(key, 'fasta-langfasta'); if (blocked) throw Error(); return result.saved; },
      setItem: (key, value) => { assert.equal(key, 'fasta-langfasta'); if (blocked) throw Error(); result.saved = value; },
    },
    openModal: html => {
      result.html = html;
      return { remove: () => result.removed++, querySelector: selector => ({ addEventListener: (_, fn) => { handlers[selector] = fn; } }) };
    },
  };
  runInNewContext(modalCode + reminderCode, context);
  return { context, result, handlers, slot };
}

test('alla tre längre scheman kräver aktiv start och bevarar bakåtdatering', () => {
  for (const hours of [36, 48, 72]) {
    const h = harness();
    h.context.requestFastStart(hours, false, 987);
    assert.equal(h.result.started.length, 0);
    assert.match(h.result.html, /Innan en längre fasta/);
    h.handlers['#long-fast-start']();
    assert.deepEqual(h.result.started, [[hours, false, 987]]);
  }
});

test('Avbryt startar inget och korta scheman samt löpande startar direkt', () => {
  const cancelled = harness();
  cancelled.context.requestFastStart(36, false);
  cancelled.handlers['#long-fast-cancel']();
  assert.equal(cancelled.result.started.length, 0);
  assert.equal(cancelled.result.removed, 1);
  for (const [hours, rolling] of [[16, false], [18, false], [20, false], [23, false], [24, false], [null, true]]) {
    const h = harness();
    h.context.requestFastStart(hours, rolling);
    assert.equal(h.result.started.length, 1);
    assert.equal(h.result.html, '');
  }
});

test('påminnelsen gäller från 24 faktiska timmar, bara aktiv löpande fasta', () => {
  const h = harness(), day = 24 * 3600000;
  assert.equal(h.context.longFastReminderDue(day - 1), false);
  assert.equal(h.context.longFastReminderDue(day), true);
  h.context.state.rolling = false;
  assert.equal(h.context.longFastReminderDue(day + 1), false);
  h.context.state.rolling = true;
  h.context.state.fasting = false;
  assert.equal(h.context.longFastReminderDue(day + 1), false);
});

test('OK döljer samma fasta efter tick/omladdning men ny fasta visas igen', () => {
  const h = harness(), day = 24 * 3600000;
  h.context.updateLongFastReminder(day);
  assert.equal(h.slot.hidden, false);
  h.handlers.ok();
  assert.equal(h.slot.hidden, true);
  assert.equal(h.result.saved, '1234');
  assert.equal(h.context.longFastReminderDue(day), false);
  assert.equal(harness({ saved: '1234' }).context.longFastReminderDue(day), false);
  h.context.state.startTime = 5678;
  assert.equal(h.context.longFastReminderDue(day), true);
});

test('blockerad lagring hindrar inte OK; svaret gäller tills sidan laddas om', () => {
  const h = harness({ blocked: true }), day = 24 * 3600000;
  h.context.updateLongFastReminder(day);
  h.handlers.ok();
  assert.equal(h.context.longFastReminderDue(day), false);
  h.context.state.startTime++;
  assert.equal(h.context.longFastReminderDue(day), true);
});

test('profilraden visas bara vid ett ikryssat hälsosvar i båda rutorna', () => {
  for (const health of [{}, { diabetes: false }, { diabetes: true }]) {
    const h = harness({ health }), expected = health.diabetes === true;
    h.context.openLongFastModal(() => {});
    assert.equal(h.result.html.includes(LONG_FAST_TEXT.profile), expected);
    h.context.updateLongFastReminder(24 * 3600000);
    assert.equal(h.slot.innerHTML.includes(LONG_FAST_TEXT.profile), expected);
  }
});

test('texterna är ordagrant kunskapsbasens godkända texter', () => {
  const knowledge = read('docs/kunskap/halsa-och-sakerhet.md');
  for (const [id, key] of [['halsa.langFasta', 'before'], ['halsa.langFasta.dygn', 'day'], ['halsa.langFasta.profil', 'profile']]) {
    const section = knowledge.split(`### ${id}\n`)[1]?.split('\n### ')[0];
    assert.ok(section, id);
    assert.match(section, /Status:\*\* (godkänd|inbyggd)/);
    assert.equal(section.match(/\*\*Text – (?:ny text|nu):\*\*\s*\n> ([^\r\n]+)/)[1], LONG_FAST_TEXT[key]);
  }
});

test('Radera all data tar bort svaret utan att ändra dataformatet', () => {
  const actions = read('js/actions.js');
  const fn = actions.slice(actions.indexOf('export function eraseAll()'), actions.indexOf('export function clearHistory()')).replace('export ', '');
  const removed = [];
  const context = { confirmModal: (...args) => args.at(-1)(), eraseAllData: () => {}, localStorage: { removeItem: key => removed.push(key) }, stopTicker: () => {}, setView: () => {}, showNotice: () => {}, openFriskrivning: () => {}, resetFastenivaSafety: () => {} };
  runInNewContext(fn, context);
  context.eraseAll();
  assert.ok(removed.includes('fasta-langfasta'));
});
