// ── FASTA — js/app.js ──
// Entry point: load state, expose globals, start app

import { state, profile, loadState, loadHistory, loadProfile, saveProfile } from './state.js';
import { render, setView, startTicker } from './ui.js';
import { startFast, endFast, _doEndFast, addMeal, addWorkout, deleteEntry, _confirmDelete } from './actions.js';
import { openCardModal, openHistoryModal, openMealModal, openWorkoutModal } from './modals.js';
import { renderTimer } from './views/timer.js';
import { renderLearn } from './views/learn.js';
import { renderHistory } from './views/history.js';
import { renderProfile } from './views/profile.js';

// ── Load persisted data ──
loadState();
loadHistory();
loadProfile();

// ── Expose functions to window for inline onclick handlers ──
Object.assign(window, {
  // State (needed by some inline handlers)
  state,
  profile,

  // Navigation
  setView,

  // Actions
  startFast,
  endFast,
  _doEndFast,
  addMeal,
  addWorkout,
  deleteEntry,
  _confirmDelete,

  // Modals
  openCardModal,
  openHistoryModal,
  openMealModal,
  openWorkoutModal,

  // View renders (for re-render from onclick)
  renderTimer,
  renderLearn,
  renderHistory,
  renderProfile,

  // Profile helpers
  _setProfileField(field, val) {
    profile[field] = val;
    saveProfile();
    renderProfile();
  },
  _setProfileNum(field, val) {
    profile[field] = val;
    saveProfile();
    renderProfile();
  },
});

// ── Start ──
render();
if (state.fasting) startTicker();

// ── Service Worker ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
