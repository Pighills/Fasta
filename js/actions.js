// ── FASTA — js/actions.js ──
// User actions: start/end fast, meals, workouts, delete

import { state, profile, profileComplete, save, addEvent, removeFast, clearFastHistory } from './state.js';
import { newId } from './migrations.js';
import { fmt, fmtD, getPhase, calcElapsed, calcMetabolicElapsed } from './helpers.js';
import { openModal } from './modals.js';
import { render, startTicker, stopTicker } from './ui.js';

export function startFast(gh, rolling, customStartTime) {
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
  const elapsed = calcElapsed();
  const elh = elapsed / 3600000;
  const ph = getPhase(elh);
  const T2 = fmt(elapsed);

  openModal(`<div class="modal-box" onclick="event.stopPropagation()" style="max-width:340px">
    <div class="modal-header"><div style="font-size:16px;font-weight:700;color:#f5f5f0;margin-bottom:4px">Avsluta fastan?</div>
    <div style="font-size:12px;color:#8a8a80">Du har fastat i ${T2.h}h ${T2.m}m och nått <strong style="color:${ph.c}">${ph.i} ${ph.l}</strong>.</div></div>
    <div class="modal-body" style="padding:16px 18px">
      <div style="background:#141414;border:1px solid #2a2a2a;border-radius:10px;padding:12px 14px;margin-bottom:16px;font-size:12px;color:#8a8a80;line-height:1.6">Är du säker? Fastan registreras i historiken och kan inte återupptas.</div>
      <div style="display:flex;gap:10px">
        <button onclick="this.closest('.modal-backdrop').remove()" style="flex:1;padding:13px;border-radius:10px;font-size:14px;font-weight:600;background:#141414;color:#e8e4dc;border:1px solid #2a2a2a;cursor:pointer">Fortsätt fasta</button>
        <button onclick="this.closest('.modal-backdrop').remove();window._doEndFast()" style="flex:1;padding:13px;border-radius:10px;font-size:14px;font-weight:700;background:#1a1a1a;color:#ef4444;border:1px solid rgba(239,68,68,0.3);cursor:pointer">Ja, avsluta</button>
      </div>
    </div>
  </div>`);
}

export function _doEndFast() {
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
  const { time, ...data } = meal;
  addEvent('meal', time, { ...data, fastId: state.activeId });
  render();
}

export function addWorkout(wo) {
  const { time, ...data } = wo;
  addEvent('workout', time, { ...data, fastId: state.activeId });
  render();
}

export function deleteEntry(idx) {
  const entry = state.history[idx];
  const dh = entry.duration / 3600000;

  openModal(`<div class="modal-box" onclick="event.stopPropagation()" style="max-width:340px">
    <div class="modal-header"><div style="font-size:16px;font-weight:700;color:#f5f5f0;margin-bottom:4px">Radera fasta?</div>
    <div style="font-size:12px;color:#8a8a80">${fmtD(entry.start)} · ${Math.round(dh * 10) / 10}h fasta</div></div>
    <div class="modal-body" style="padding:16px 18px">
      <div style="background:#141414;border:1px solid #2a2a2a;border-radius:10px;padding:12px 14px;margin-bottom:16px;font-size:12px;color:#8a8a80;line-height:1.6">Denna fasta tas bort permanent och kan inte återställas.</div>
      <div style="display:flex;gap:10px">
        <button onclick="this.closest('.modal-backdrop').remove()" style="flex:1;padding:13px;border-radius:10px;font-size:14px;font-weight:600;background:#141414;color:#e8e4dc;border:1px solid #2a2a2a;cursor:pointer">Avbryt</button>
        <button onclick="this.closest('.modal-backdrop').remove();window._confirmDelete(${idx})" style="flex:1;padding:13px;border-radius:10px;font-size:14px;font-weight:700;background:#1a1a1a;color:#ef4444;border:1px solid rgba(239,68,68,0.3);cursor:pointer">Radera</button>
      </div>
    </div>
  </div>`);
}

export function _confirmDelete(idx) {
  const entry = state.history[idx];
  if (entry) removeFast(entry._id);
  render();
}

export function clearHistory() {
  if (!confirm('Rensa all historik?')) return;
  clearFastHistory();
  render();
}
