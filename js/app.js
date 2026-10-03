// ── FASTA — js/app.js ──
// Entry point: load state, bind buttons, start app

import {
  state, profile, loadState, loadProfile, saveProfile, reload, lockReason, SaveRefused, setSaveFailedHandler,
} from './state.js';
import { render, setView, startTicker, stopTicker, showNotice } from './ui.js';
import { startFast, endFast, endPause, clearHistory, eraseAll } from './actions.js';
import { openMealModal, openWorkoutModal, openFriskrivning } from './modals.js';
import { renderProfile, toggleHealthInfo, setProfileNumber } from './views/profile.js';
import { exportData, importData, undoImport } from './backup.js';

// ── Load persisted data ──
loadState();
loadProfile();

// ── Buttons ──
// One listener for all buttons with data-action (no inline onclick, so the CSP
// in vercel.json can forbid inline scripts).

const ACTIONS = {
  view: d => setView(d.arg),
  start: d => (d.arg ? startFast(Number(d.arg), false) : startFast(null, true)),
  endFast: () => endFast(),
  endPause: () => endPause(),
  meal: () => openMealModal(),
  workout: () => openWorkoutModal(),
  clearHistory: () => clearHistory(),
  exportData: () => exportData(),
  importData: () => importData(),
  undoImport: () => undoImport(),
  eraseAll: () => eraseAll(),
  profileField: d => {
    profile[d.field] = d.arg;
    saveProfile();
    renderProfile();
  },
  toggleHealth: d => {
    profile.health = { ...profile.health, [d.arg]: !profile.health?.[d.arg] };
    saveProfile();
    renderProfile();
  },
  healthInfo: d => toggleHealthInfo(d.arg),
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (el && Object.hasOwn(ACTIONS, el.dataset.action)) ACTIONS[el.dataset.action](el.dataset);
});
document.addEventListener('change', e => {
  if (e.target.dataset?.number) setProfileNumber(e.target.dataset.number, e.target);
});
document.getElementById('notice').addEventListener('click', e => { e.currentTarget.textContent = ''; });

// ── Start ──
// Measure and focus the first-start dialog before building the underlying view.
// Yield between the two layouts to keep startup responsive on slower phones.
openFriskrivning();
if (document.querySelector(".friskrivning-modal")) {
  setTimeout(() => { render(); if (state.fasting) startTicker(); }, 0);
} else {
  render();
  if (state.fasting) startTicker();
}

// ── Several tabs/windows ──
// Show the latest data when another tab or window saves, and when a change
// here was refused (SaveRefused in state.js, reaches us as an uncaught error).

const SAVE_MESSAGES = {
  stale: 'Ändringen sparades inte, eftersom FASTA är öppen i ett annat fönster. Här visas nu det senaste – gör om det du just gjorde.',
  newer: 'Din data är sparad av en nyare version av FASTA. Ladda om appen för att uppdatera. Tills dess sparas inga ändringar.',
  error: 'Din sparade data kunde inte läsas. Den ligger kvar orörd. Du kan importera en säkerhetskopia under Profil → Din data.',
};

if (lockReason()) showNotice(SAVE_MESSAGES[lockReason()]);
setSaveFailedHandler(() => showNotice('Det gick inte att spara – lagringen på enheten kan vara full. Det du gör nu kan försvinna när appen stängs.'));

function refresh() {
  reload();
  render();
  if (state.fasting) startTicker(); else stopTicker();
  // e.g. a newer app version in another window upgraded the data
  if (lockReason()) showNotice(SAVE_MESSAGES[lockReason()]);
}

window.addEventListener('storage', e => {
  if (e.key === null || e.key === 'fasta-data') refresh();
});

function onRefused(e, err) {
  if (!(err instanceof SaveRefused)) return;
  e.preventDefault();
  refresh();
  showNotice(SAVE_MESSAGES[err.reason]);
}
window.addEventListener('error', e => onRefused(e, e.error));
window.addEventListener('unhandledrejection', e => onRefused(e, e.reason)); // exportData is async

// ── Service Worker ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
