// ── FASTA — js/actions.js ──
// User actions: start/end fast, meals, workouts, delete

import {
  state, profile, profileComplete, save, addEvent, endActiveFast, endMealPause, removeFast, clearFastHistory, eraseAllData, SaveRefused, goalView, programView,
} from './state.js';
import { newId } from './migrations.js';
import { fmt, fmtD, getPhase, calcElapsed, calcMetabolicElapsed } from './helpers.js';
import { confirmModal } from './modals.js';
import { render, setView, showNotice, startTicker, stopTicker } from './ui.js';
import { cleanGoal } from './program.js';
import { PROGRAMS } from './data.js';

export function setGoal(data, expected = goalView()) {
  if (JSON.stringify(goalView()) !== JSON.stringify(expected)) throw new SaveRefused('stale');
  const goal = cleanGoal(data);
  if (JSON.stringify(goal) === JSON.stringify(expected)) return;
  addEvent('goal', Date.now(), goal);
}

// Dialogs retain their revision even if a storage event reloads this tab.
function checkProgram(expected) {
  if ((programView()?.revision ?? null) !== expected) throw new SaveRefused('stale');
}
export function startProgram(programId, expected = programView()?.revision ?? null) {
  checkProgram(expected);
  if (!Object.hasOwn(PROGRAMS, programId)) return;
  addEvent('program', Date.now(), { action: 'start', programId });
  state.selectedVariant = null;
}
function changeProgram(action, expected) {
  checkProgram(expected);
  const p = programView();
  if (!p || (action === 'pause' && (p.paused || p.complete)) || (action === 'resume' && (!p.paused || p.complete))) return;
  addEvent('program', Date.now(), { action, programId: p.programId });
}
export function pauseProgram(expected = programView()?.revision ?? null) { changeProgram('pause', expected); }
export function resumeProgram(expected = programView()?.revision ?? null) { changeProgram('resume', expected); }
export function endProgram(expected = programView()?.revision ?? null) { changeProgram('end', expected); }

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
  endActiveFast({
    end: Date.now(),
    duration: elapsed,
    metDuration: metElapsed,
    goal: state.rolling ? null : state.goalHours,
    reachedGoal: !state.rolling && state.goalHours && elapsed / 3600000 >= state.goalHours,
    rolling: state.rolling,
    profile: profileComplete() ? prof : null,
  });
  stopTicker();
  render();
}

export function addMeal(meal) {
  if (!state.fasting) throw new SaveRefused('stale');
  const { time, ...data } = meal;
  addEvent('meal', time, { ...data, fastId: state.activeId });
  state.now = Date.now(); // so the pause shows at once, not after reload
  render();
}

export function endPause() {
  if (!state.fasting) throw new SaveRefused('stale');
  state.now = Date.now();
  endMealPause(state.now);
  render();
}

export function addWorkout(wo) {
  if (!state.fasting) throw new SaveRefused('stale');
  const { time, ...data } = wo;
  addEvent('workout', time, { ...data, fastId: state.activeId });
  state.now = Date.now();
  render();
}

// By id, not position: the list may have changed since it was drawn
export function deleteEntry(id) {
  const entry = state.history.find(e => e._id === id);
  if (!entry) return;
  const dh = entry.duration / 3600000;

  confirmModal('Radera fasta?',
    `${fmtD(entry.start)} · ${Math.round(dh * 10) / 10}h fasta`,
    'Fastan tas bort från historiken. En dold säkerhetskopia i appen kan finnas kvar en tid. Välj Radera all data under Profil för att ta bort allt.',
    'Avbryt', 'Radera', () => { removeFast(id); render(); });
}

export function eraseAll() {
  confirmModal('Radera all data', '',
    'All din data raderas från den här enheten: fastor, måltider, träningspass, profil och svar i Hälsa och säkerhet – även appens dolda säkerhetskopior. Det går inte att ångra. Vill du spara en kopia först, tryck på Exportera.',
    'Avbryt', 'Radera allt', () => {
      eraseAllData();
      stopTicker();
      setView('timer');
      showNotice('All data är raderad.');
    });
}

export function clearHistory() {
  if (!confirm('Rensa all historik?')) return;
  clearFastHistory();
  render();
}
