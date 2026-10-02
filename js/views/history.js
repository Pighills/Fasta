// ── FASTA — js/views/history.js ──
// History view with past fasts

import { state } from '../state.js';
import { fmtD, getPhase, getBenefits, esc } from '../helpers.js';
import { trendsHTML, bindTrends, trendData } from './trends.js';
import { openHistoryModal } from '../modals.js';
import { PH } from '../data.js';
import { deleteEntry } from '../actions.js';

export function historyStats(history) {
  const counted = history.filter(entry => entry.duration >= 60000);
  const withGoal = counted.filter(entry => !entry.rolling && entry.goal > 0);
  return {
    count: counted.length,
    longestMs: counted.reduce((longest, entry) => Math.max(longest, entry.duration), 0),
    goalPercent: withGoal.length
      ? Math.round(withGoal.filter(entry => entry.reachedGoal).length / withGoal.length * 100)
      : null,
  };
}

function historyDuration(ms) {
  if (ms < 60000) return 'under 1 min';
  if (ms < 3600000) return `${Math.floor(ms / 60000)} min`;
  return `${Math.round(ms / 3600000 * 10) / 10}h`;
}

export function renderHistory() {
  const data = trendData();
  const h = state.history;
  const stats = historyStats(h);
  let html = `<h1 class="history-title">Historik</h1>
    ${data ? trendsHTML(data.events, data.profile) : ''}
    <h2 class="eyebrow history-section-title">Dina genomförda fastor</h2>
    <div class="stats-grid history-stats">
      ${[
        { l: 'Antal', v: stats.count },
        { l: 'Längsta', v: stats.count ? historyDuration(stats.longestMs) : '—' },
        { l: 'Mål nått', v: stats.goalPercent === null ? '—' : `${stats.goalPercent}%` },
      ].map(s => `<div class="stat-card"><div class="stat-val">${s.v}</div><div class="stat-label">${s.l}</div></div>`).join('')}
    </div>`;

  if (!h.length) {
    html += `<div class="history-empty"><p>Ingen historik ännu</p><button class="history-button" data-action="view" data-arg="timer">Timer</button></div>`;
  } else {
    [...h].reverse().forEach((entry, i) => {
      const realIdx = h.length - 1 - i;
      const dh = entry.duration / 3600000;
      const ph = getPhase(dh);
      const pct = entry.goal ? Math.min(dh / entry.goal, 1) : 1;
      const bens = getBenefits((entry.metDuration || entry.duration) / 3600000);
      const top = bens[bens.length - 1];

      html += `<div class="hist-card phase-${PH.indexOf(ph)}${entry.reachedGoal ? ' hist-goal-reached' : ''}">
        <div class="hist-details" role="button" tabindex="0" data-history="${realIdx}" aria-label="Visa fasta ${fmtD(entry.start)}, ${historyDuration(entry.duration)}">
        <div class="hist-heading">
          <div class="hist-summary">
            <span aria-hidden="true">${top ? top.i : '⏱'}</span>
            <span class="hist-duration">${entry.rolling && entry.duration > 0 ? '∞ ' : ''}${historyDuration(entry.duration)} fasta</span>
            ${entry.reachedGoal ? `<span class="hist-badge hist-badge-goal">✓ MÅL</span>` : ''}
            ${(entry.meals || []).length ? `<span class="hist-badge">🍳 ${entry.meals.length}</span>` : ''}
            ${(entry.workouts || []).length ? `<span class="hist-badge">🏋️ ${entry.workouts.length}</span>` : ''}
          </div>
          <span class="hist-date">${fmtD(entry.start)}</span>
        </div>
        <svg class="hist-progress" viewBox="0 0 100 1" preserveAspectRatio="none" aria-hidden="true"><rect class="hist-progress-track" width="100" height="1"/><rect class="hist-progress-fill" width="${pct * 100}" height="1"/></svg>
        <div class="hist-footer">
          <div class="hist-phase">${ph.i} ${ph.l} uppnådd</div>
          <div class="hist-link">Detaljer →</div>
        </div>
        </div>
        <button class="hist-del" data-id="${esc(entry._id)}" aria-label="Radera fasta ${fmtD(entry.start)}"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
      </div>`;
    });

    html += `<button data-action="clearHistory" class="history-button history-clear">Rensa all historik</button>`;
  }

  document.getElementById('content').innerHTML = html;
  document.querySelectorAll('[data-history]').forEach(card => {
    card.addEventListener('click', () => openHistoryModal(Number(card.dataset.history)));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
  document.querySelectorAll('.hist-del').forEach(button => {
    button.addEventListener('click', () => deleteEntry(button.dataset.id));
  });
  if (data) bindTrends(document.getElementById('content'), data.events, data.profile, renderHistory);
}
