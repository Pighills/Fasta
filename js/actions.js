// ── FASTA — js/actions.js ──
// User actions: start/end fast, meals, workouts, delete

import { state, profile, profileComplete, save, addEvent, removeFast, clearFastHistory, SaveRefused } from './state.js';
import { newId } from './migrations.js';
import { fmt, fmtD, getPhase, calcElapsed, calcMetabolicElapsed } from './helpers.js';
import { confirmModal } from './modals.js';
import { render, startTicker, stopTicker } from './ui.js';

// The guards below catch a dialog opened before another tab changed the
// fast: the view is then out of date, so refuse (app.js shows the latest).

export function startFast(gh, rolling, customStartTime) {
  if (state.fasting) throw new SaveRefused('stale');
  const t = customStartTime || Date.now();
  state.fasting = true;
  state.activeId = newId();
  state.startTime = t;
  state.now = Date.now();
  state.meals = [];
  state.workouts = [];
  state.goalHours = gh;
  state.rolling = rolling;
  state.selectedVariant = null;
  state.showVariants = false;
  state.showBackdate = false;
  save();
  render();
  startTicker();
}

export function endFast() {
  const id = state.activeId;
  const elapsed = calcElapsed();
  const elh = elapsed / 3600000;
  const ph = getPhase(elh);
  const T2 = fmt(elapsed);

  confirmModal('Avsluta fastan?',
    `Du har fastat i ${T2.h}h ${T2.m}m och nått <strong style="color:${ph.c}">${ph.i} ${ph.l}</strong>.`,
    'Är du säker? Fastan registreras i historiken och kan inte återupptas.',
    'Fortsätt fasta', 'Ja, avsluta', () => _doEndFast(id));
}

function _doEndFast(id) {
  if (!state.fasting || state.activeId !== id) throw new SaveRefused('stale');
  const elapsed = calcElapsed();
  const metElapsed = calcMetabolicElapsed();
  // Health answers stay in the profile only, never copied into history
  const { health, ...prof } = profile;
  // The fast event gets the active id, so logged meals/workouts stay linked
  addEvent('fast', state.startTime, {
    end: Date.now(),
    duration: elapsed,
    metDuration: metElapsed,
    goal: state.rolling ? null : state.goalHours,
    reachedGoal: !state.rolling && state.goalHours && elapsed / 3600000 >= state.goalHours,
    rolling: state.rolling,
    profile: profileComplete() ? prof : null,
  }, state.activeId || newId());
  state.fasting = false;
  state.activeId = null;
  state.startTime = null;
  state.meals = [];
  state.workouts = [];
  save();
  stopTicker();
  render();
}

export function addMeal(meal) {
  if (!state.fasting) throw new SaveRefused('stale');
  const { time, ...data } = meal;
  addEvent('meal', time, { ...data, fastId: state.activeId });
  render();
}

export function addWorkout(wo) {
  if (!state.fasting) throw new SaveRefused('stale');
  const { time, ...data } = wo;
  addEvent('workout', time, { ...data, fastId: state.activeId });
  render();
}

export function deleteEntry(idx) {
  const entry = state.history[idx];
  const dh = entry.duration / 3600000;

  confirmModal('Radera fasta?',
    `${fmtD(entry.start)} · ${Math.round(dh * 10) / 10}h fasta`,
    'Denna fasta tas bort permanent och kan inte återställas.',
    'Avbryt', 'Radera', () => { removeFast(entry._id); render(); });
}

export function clearHistory() {
  if (!confirm('Rensa all historik?')) return;
  clearFastHistory();
  render();
}
