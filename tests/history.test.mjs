import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fmtD } from '../js/helpers.js';
import { state } from '../js/state.js';
import { historyStats, renderHistory } from '../js/views/history.js';

const H = 3600000;

test('fmtD shows a year only outside the current local year', () => {
  const year = new Date().getFullYear();
  for (const offset of [-1, 0, 1]) {
    const date = new Date(year + offset, 9, 3, 12);
    const formatted = fmtD(date.getTime());
    assert.match(formatted, /3 okt/);
    assert.equal(formatted.includes(String(year + offset)), offset !== 0);
  }
});

test('empty history and fasts below one minute have no statistics', () => {
  for (const entries of [[], [{ duration: 17000, goal: 0.001, reachedGoal: true }]]) {
    assert.deepEqual(historyStats(entries), { count: 0, longestMs: 0, goalPercent: null });
  }
});

test('rolling fasts count toward length but not the goal percentage', () => {
  const history = [
    { duration: 17000, goal: 0.001, reachedGoal: true },
    { duration: 16 * H, goal: 16, reachedGoal: true },
    { duration: 10 * H, goal: 16, reachedGoal: false },
    { duration: 30 * H, rolling: true, goal: 16, reachedGoal: true },
    { duration: 2 * H, goal: null, reachedGoal: false },
  ];
  const before = structuredClone(history);
  assert.deepEqual(historyStats(history), { count: 4, longestMs: 30 * H, goalPercent: 50 });
  assert.deepEqual(history, before, 'statistics must not change saved data');
});

test('a full minute counts and no goal gives a dash rather than zero percent', () => {
  assert.deepEqual(historyStats([{ duration: 60000, rolling: true }]), {
    count: 1, longestMs: 60000, goalPercent: null,
  });
  assert.equal(historyStats([{ duration: H, goal: 2, reachedGoal: false }]).goalPercent, 0);
});

test('history retains short entries and renders minutes, hours and rolling prefixes', () => {
  const originalHistory = state.history;
  const originalDocument = globalThis.document;
  const content = { innerHTML: '' };
  try {
    globalThis.document = { getElementById(id) { assert.equal(id, 'content'); return content; } };
    state.history = [0, 17000, 17 * 60000, 3599999, H, 16 * H].map((duration, i) => ({
      _id: `f${i}`, start: new Date(2025, 9, 3).getTime(), duration, rolling: true,
    }));
    const before = structuredClone(state.history);
    renderHistory();
    assert.equal((content.innerHTML.match(/class="hist-card fade"/g) || []).length, 6);
    assert.match(content.innerHTML, />under 1 min fasta</);
    assert.match(content.innerHTML, />∞ under 1 min fasta</);
    assert.match(content.innerHTML, />∞ 17 min fasta</);
    assert.match(content.innerHTML, />∞ 59 min fasta</);
    assert.match(content.innerHTML, />∞ 1h fasta</);
    assert.match(content.innerHTML, />∞ 16h fasta</);
    assert.doesNotMatch(content.innerHTML, />∞ 0h fasta</);
    assert.match(content.innerHTML, /<div class="stat-val">4<\/div>/);
    assert.match(content.innerHTML, /<div class="stat-val">—<\/div><div class="stat-label">Mål nått/);
    assert.deepEqual(state.history, before);
    state.history = [{ _id: 'short', start: Date.now(), duration: 17 * 60000 }];
    renderHistory();
    assert.match(content.innerHTML, /<div class="stat-val">17 min<\/div><div class="stat-label">Längsta/);
  } finally {
    state.history = originalHistory;
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  }
});
