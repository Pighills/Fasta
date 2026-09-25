// ── FASTA — js/app.js ──
// Entry point: load state, expose globals, start app

import {
  state, profile, loadState, loadProfile, saveProfile, reload, lockReason, SaveRefused, setSaveFailedHandler,
} from './state.js';
import { render, setView, startTicker, stopTicker, showNotice } from './ui.js';
import { startFast, endFast, deleteEntry, clearHistory } from './actions.js';
import { openCardModal, openHistoryModal, openMealModal, openWorkoutModal } from './modals.js';
import { renderTimer } from './views/timer.js';
import { renderLearn } from './views/learn.js';
import { renderProfile, toggleHealthInfo } from './views/profile.js';
import { exportData, importData, undoImport } from './backup.js';

// ── Load persisted data ──
loadState();
loadProfile();

// ── Expose functions to window for inline onclick handlers ──
Object.assign(window, {
  // State (needed by some inline handlers)
  state,

  // Navigation
  setView,

  // Actions
  startFast,
  endFast,
  deleteEntry,
  clearHistory,

  // Modals
  openCardModal,
  openHistoryModal,
  openMealModal,
  openWorkoutModal,

  // View renders (for re-render from onclick)
  renderTimer,
  renderLearn,

  // Data export / import
  exportData,
  importData,
  undoImport,

  // Profile helpers
  _setProfileField(field, val) {
    profile[field] = val;
    saveProfile();
    renderProfile();
  },
  _toggleHealth(key) {
    profile.health = { ...profile.health, [key]: !profile.health?.[key] };
    saveProfile();
    renderProfile();
  },
  _toggleHealthInfo: toggleHealthInfo,
});

// ── Start ──
render();
if (state.fasting) startTicker();

// ── Several tabs/windows ──
// Show the latest data when another tab or window saves, and when a change
// here was refused (SaveRefused in state.js, reaches us as an uncaught error).

const SAVE_MESSAGES = {
  stale: 'FASTA är öppen i ett annat fönster. Här visas nu det senaste – gör om det du just gjorde.',
  newer: 'Din data är sparad av en nyare version av FASTA. Ladda om appen för att uppdatera den. Tills dess sparas inga ändringar.',
  error: 'Din sparade data kunde inte läsas. Den ligger kvar orörd, men inga ändringar sparas just nu.',
};

if (lockReason()) showNotice(SAVE_MESSAGES[lockReason()]);
setSaveFailedHandler(() => showNotice('Det gick inte att spara. Lagringen på enheten kan vara full.'));

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
