// ── FASTA — js/ui.js ──
// Sidebar widget, mobile status, ticker, navigation

import { state } from './state.js';
import { PH } from './data.js';
import { renderTimer, tickTimer } from './views/timer.js';
import { renderLearn } from './views/learn.js';
import { renderHistory } from './views/history.js';
import { renderProfile } from './views/profile.js';
import { fmtClock, getPhase, calcElapsed, calcMetabolicElapsed, getActivePause, esc } from './helpers.js';

// ── Navigation ──

export function setView(v) {
  if (state.view === v) return;
  state.view = v;
  render();
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.getElementById('main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

// ── Sidebar widget ──

function widgetHTML() {
  const elapsed = calcElapsed();
  const elh = elapsed / 3600000;
  const mElapsed = calcMetabolicElapsed();
  const phase = getPhase(elh);
  const activePause = getActivePause();
  const goalMs = state.rolling || !state.goalHours ? null : state.goalHours * 3600000;
  const prog = goalMs ? Math.min(elapsed / goalMs, 1) : 0;
  const T2 = fmtClock(elapsed);
  const pauseLeft = activePause ? (activePause.time + activePause.pauseHours * 3600000 - state.now) : 0;

  if (!state.fasting) {
    return `<div class="sidebar-status sidebar-status-empty"><div class="sidebar-empty-label">Ingen aktiv fasta</div><div class="sidebar-meta">Starta i Timer</div></div>`;
  }

  return `<div class="sidebar-status">
    <div class="sidebar-status-label">${activePause ? '⏸ Paus' : '● Aktiv fasta'}</div>
    ${activePause
      ? `<div class="sidebar-pause-title">${esc(activePause.desc)}</div><div class="sidebar-meta">Om ${fmtClock(pauseLeft)}</div>`
      : `<div class="num sidebar-time">${T2}</div>
       <div class="sidebar-phase phase-${PH.indexOf(phase)}"><div class="sidebar-phase-dot"></div><span class="sidebar-phase-label">${phase.l}</span></div>
       ${mElapsed !== elapsed ? `<div class="sidebar-metabolic">⚡ ~${fmtClock(mElapsed)}</div>` : ''}`}
    ${!state.rolling && !activePause && goalMs ? `<svg class="sidebar-progress" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true"><rect class="sidebar-progress-track" width="100" height="2"/><rect class="sidebar-progress-fill" width="${prog * 100}" height="2"/></svg>` : ''}
    ${!activePause ? `<div class="sidebar-actions">
      <button class="sidebar-action" data-action="meal">🍳 Måltid</button>
      <button class="sidebar-action" data-action="workout">🏋️ Träning</button>
    </div>` : ''}
  </div>`;
}

export function renderSidebar() {
  const sw = document.getElementById('sidebar-widget');
  if (sw) sw.innerHTML = widgetHTML();
  document.querySelectorAll('.nav-btn[data-view]').forEach(b => {
    b.className = 'nav-btn ' + (b.dataset.view === state.view ? 'active' : 'inactive');
  });
  document.querySelectorAll('.tab-btn[data-view]').forEach(b => {
    b.classList.toggle('active', b.dataset.view === state.view);
  });
}

export function renderMobileStatus() {
  const el = document.getElementById('mobile-status-pill');
  if (!el) return;
  if (!state.fasting) {
    el.textContent = 'Ingen fasta';
    el.className = 'mobile-status-pill';
    return;
  }
  el.textContent = `● ${fmtClock(calcElapsed())}`;
  el.className = 'mobile-status-pill active-pill';
}

// ── Ticker ──

let ticker = null;

export function startTicker() {
  if (!ticker) {
    ticker = setInterval(() => {
      state.now = Date.now();
      renderSidebar();
      renderMobileStatus();
      if (state.view === 'timer') tickTimer();
    }, 1000);
  }
}

export function stopTicker() {
  clearInterval(ticker);
  ticker = null;
}

// ── Short message at the bottom of the screen ──

let noticeTimer = null;

export function showNotice(text) {
  const el = document.getElementById('notice');
  if (!el) return;
  el.textContent = text;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { el.textContent = ''; }, 8000);
}

// ── Main render ──

const VIEWS = { timer: renderTimer, 'lära': renderLearn, historik: renderHistory, profil: renderProfile };

export function render() {
  renderSidebar();
  renderMobileStatus();
  VIEWS[state.view]?.();
}
