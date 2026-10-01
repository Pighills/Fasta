import { test } from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { PH } from '../js/data.js';
import { renderTimer, tickTimer } from '../js/views/timer.js';

function timerDOM(run) {
  const originalDocument = globalThis.document;
  const originalTimeout = globalThis.setTimeout;
  let builds = 0, html = '';
  const nodes = new Map();
  const content = {
    set innerHTML(value) {
      builds++; html = value; nodes.clear();
      for (const match of value.matchAll(/id="([^"]+)"/g)) nodes.set(match[1], {
        textContent: '', addEventListener() {}, setAttribute(key, value) { this[key] = value; },
      });
    },
  };
  globalThis.document = { getElementById: id => id === 'content' ? content : nodes.get(id) || null,
    querySelectorAll: () => [], querySelector: () => null };
  globalThis.setTimeout = () => 0; // do not leave the midnight refresh running in Node
  Object.assign(state, { fasting: false, startTime: null, goalHours: null, rolling: true,
    meals: [], workouts: [], expandedPhase: null, showVariants: false, showBackdate: false, selectedVariant: null });
  try { run({ html: () => html, builds: () => builds, nodes }); }
  finally { globalThis.document = originalDocument; globalThis.setTimeout = originalTimeout; }
}

test('Timer: check-in only during a fast, after ring and controls; empty state still renders', () => {
  timerDOM(view => {
    renderTimer();
    assert.ok(view.html().includes('Starta din fasta nu'));
    assert.ok(!view.html().includes('id="open-checkin"'));
    state.fasting = true; state.startTime = state.now - 3600000;
    renderTimer();
    assert.ok(view.html().indexOf('id="open-checkin"') > view.html().indexOf('data-action="endFast"'));
    assert.ok(view.html().includes('>Måltid</button>'));
    assert.ok(view.html().includes('>Träning</button>'));
    assert.ok(!view.html().includes('style='));
    state.fasting = false;
    renderTimer();
    assert.ok(!view.html().includes('id="open-checkin"'));
  });
});

test('Timer: tick changes numbers and SVG progress without rebuilding the view', () => {
  timerDOM(view => {
    state.fasting = true; state.rolling = false; state.goalHours = 16;
    state.startTime = state.now - 3600000;
    renderTimer(); const builds = view.builds();
    state.now += 1000; tickTimer();
    assert.equal(view.builds(), builds);
    assert.equal(view.nodes.get('tick-ring-time').textContent, '01:00:01');
    assert.ok(view.nodes.get('tick-phase-0').width > 25);
    assert.ok(view.nodes.get('tick-ring-progress')['stroke-dashoffset'] > 0);
  });
});

function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(x => parseInt(x, 16) / 255)
    .map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
test('Phase graphics: every palette colour has at least 3:1 contrast on the card surface', () => {
  for (const phase of PH) assert.ok((luminance(phase.c) + .05) / (luminance('#1a1a1a') + .05) >= 3, phase.l);
  assert.equal(new Set(PH.map(p => p.c)).size, PH.length);
});
