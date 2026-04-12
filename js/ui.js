// ── FASTA — js/ui.js ──
// Sidebar widget, drawer, mobile status, ticker, navigation

import { state, profile, profileComplete } from './state.js';
import { fmt, getPhase, calcElapsed, calcMetabolicElapsed, getActivePause } from './helpers.js';

// ── Drawer ──

export function toggleDrawer() {
  const d = document.getElementById('drawer');
  const o = document.getElementById('drawer-overlay');
  const open = d.classList.toggle('open');
  if (open) o.classList.add('open'); else o.classList.remove('open');
}

export function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
}

// ── Navigation ──

export function setView(v) {
  state.view = v;
  render();
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
  const T2 = fmt(elapsed);
  const pauseLeft = activePause ? (activePause.time + activePause.pauseHours * 3600000 - state.now) : 0;

  if (!state.fasting) {
    return `<div style="background:#0a0a0a;border-radius:8px;padding:10px 12px;border:1px solid #2a2a2a;text-align:center"><div style="font-size:10px;color:#8a8a80;font-weight:600;margin-bottom:3px">Ingen aktiv fasta</div><div style="font-size:11px;color:#8a8a80">Starta i Timer</div></div>`;
  }

  return `<div style="background:#0a0a0a;border-radius:8px;padding:10px 12px;border:1px solid rgba(200,168,78,0.22)">
    <div style="font-size:9px;color:#c8a84e;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px">${activePause ? '⏸ Paus' : '● Aktiv fasta'}</div>
    ${activePause
      ? `<div style="font-size:11px;font-weight:700;color:#f5f5f0;margin-bottom:2px">${activePause.desc}</div><div style="font-size:10px;color:#8a8a80;margin-bottom:6px">Om ${fmt(pauseLeft).h}:${fmt(pauseLeft).m}:${fmt(pauseLeft).s}</div>`
      : `<div style="font-size:16px;font-weight:800;color:#f5f5f0;font-family:monospace;margin-bottom:2px">${T2.h}:${T2.m}:${T2.s}</div>
       <div style="display:flex;align-items:center;gap:5px;margin-bottom:${mElapsed !== elapsed ? '3px' : '6px'}"><div style="width:5px;height:5px;border-radius:50%;background:${phase.c}"></div><span style="font-size:10px;color:#b5b5aa">${phase.l}</span></div>
       ${mElapsed !== elapsed ? `<div style="font-size:10px;color:#c8a84e;font-weight:600;margin-bottom:6px">⚡ ~${fmt(mElapsed).h}:${fmt(mElapsed).m}:${fmt(mElapsed).s}</div>` : ''}`}
    ${!state.rolling && !activePause && goalMs ? `<div style="height:2px;border-radius:2px;background:#2a2a2a;overflow:hidden;margin-bottom:6px"><div style="height:100%;background:#c8a84e;width:${prog * 100}%;transition:width .9s ease"></div></div>` : ''}
    ${!activePause ? `<div style="display:flex;gap:5px">
      <button onclick="window.openMealModal()" style="flex:1;padding:5px;border-radius:6px;font-size:10px;font-weight:600;background:#1a1a1a;color:#8a8a80;border:1px solid #2a2a2a;cursor:pointer">🍳 Måltid</button>
      <button onclick="window.openWorkoutModal()" style="flex:1;padding:5px;border-radius:6px;font-size:10px;font-weight:600;background:#1a1a1a;color:#8a8a80;border:1px solid #2a2a2a;cursor:pointer">🏋️ Träning</button>
    </div>` : ''}
  </div>`;
}

export function renderSidebar() {
  const sw = document.getElementById('sidebar-widget');
  const dw = document.getElementById('drawer-widget');
  if (sw) sw.innerHTML = widgetHTML();
  if (dw) dw.innerHTML = widgetHTML();
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
    el.textContent = '⏱ Ingen fasta';
    el.className = 'mobile-status-pill';
    return;
  }
  const T2 = fmt(calcElapsed());
  el.textContent = `● ${T2.h}:${T2.m}:${T2.s}`;
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
      if (state.view === 'timer') {
        // Dynamically import to avoid circular dependency at module load
        import('./views/timer.js').then(m => m.renderTimer());
      }
    }, 1000);
  }
}

export function stopTicker() {
  clearInterval(ticker);
  ticker = null;
}

// ── Main render ──

export function render() {
  renderSidebar();
  renderMobileStatus();
  if (state.view === 'timer') import('./views/timer.js').then(m => m.renderTimer());
  else if (state.view === 'lära') import('./views/learn.js').then(m => m.renderLearn());
  else if (state.view === 'historik') import('./views/history.js').then(m => m.renderHistory());
  else if (state.view === 'profil') import('./views/profile.js').then(m => m.renderProfile());
}
