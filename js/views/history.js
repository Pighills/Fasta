// ── FASTA — js/views/history.js ──
// History view with past fasts

import { state } from '../state.js';
import { fmtD, getPhase, getBenefits, esc } from '../helpers.js';

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
  const h = state.history;
  const stats = historyStats(h);
  let html = `<div style="font-size:21px;font-weight:800;color:#f5f5f0;margin-bottom:4px;letter-spacing:-.5px">Historik</div>
    <div style="font-size:13px;color:#8a8a80;margin-bottom:18px">Dina genomförda fastor</div>
    <div class="stats-grid" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-bottom:18px">
      ${[
        { l: 'Antal', v: stats.count },
        { l: 'Längsta', v: stats.count ? historyDuration(stats.longestMs) : '—' },
        { l: 'Mål nått', v: stats.goalPercent === null ? '—' : `${stats.goalPercent}%` },
      ].map(s => `<div class="stat-card"><div class="stat-val">${s.v}</div><div class="stat-label">${s.l}</div></div>`).join('')}
    </div>`;

  if (!h.length) {
    html += `<div style="text-align:center;padding:50px 20px;color:#8a8a80"><div style="font-size:32px;margin-bottom:10px">📋</div><p>Ingen historik ännu</p></div>`;
  } else {
    [...h].reverse().forEach((entry, i) => {
      const realIdx = h.length - 1 - i;
      const dh = entry.duration / 3600000;
      const ph = getPhase(dh);
      const pct = entry.goal ? Math.min(dh / entry.goal, 1) : 1;
      const bens = getBenefits((entry.metDuration || entry.duration) / 3600000);
      const top = bens[bens.length - 1];

      html += `<div class="hist-card fade" style="animation-delay:${i * 0.04}s">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px">
          <div style="display:flex;align-items:center;gap:7px;cursor:pointer;flex:1" onclick="window.openHistoryModal(${realIdx})">
            <span style="font-size:15px">${top ? top.i : '⏱'}</span>
            <span style="font-size:13px;font-weight:700;color:#f5f5f0">${entry.rolling && entry.duration > 0 ? '∞ ' : ''}${historyDuration(entry.duration)} fasta</span>
            ${entry.reachedGoal ? `<span style="font-size:9px;padding:2px 6px;border-radius:20px;background:rgba(200,168,78,0.12);color:#c8a84e;border:1px solid rgba(200,168,78,0.22);font-weight:700">✓ MÅL</span>` : ''}
            ${(entry.meals || []).length ? `<span style="font-size:9px;padding:2px 6px;border-radius:20px;background:#1a1a1a;color:#8a8a80;border:1px solid #2a2a2a;font-weight:700">🍳 ${entry.meals.length}</span>` : ''}
            ${(entry.workouts || []).length ? `<span style="font-size:9px;padding:2px 6px;border-radius:20px;background:rgba(200,168,78,0.08);color:#c8a84e;border:1px solid rgba(200,168,78,0.2);font-weight:700">🏋️ ${entry.workouts.length}</span>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:11px;color:#8a8a80">${fmtD(entry.start)}</span>
            <button class="hist-del" data-id="${esc(entry._id)}" onclick="window.deleteEntry(this.dataset.id)">✕</button>
          </div>
        </div>
        <div style="height:2px;border-radius:2px;background:#2a2a2a;margin-bottom:7px;overflow:hidden;cursor:pointer" onclick="window.openHistoryModal(${realIdx})"><div style="height:100%;border-radius:2px;width:${pct * 100}%;background:${entry.reachedGoal ? '#c8a84e' : ph.c}"></div></div>
        <div style="display:flex;justify-content:space-between;cursor:pointer" onclick="window.openHistoryModal(${realIdx})">
          <div style="font-size:11px;color:#8a8a80">${ph.i} ${ph.l} uppnådd</div>
          <div style="font-size:11px;color:#c8a84e;font-weight:600">Detaljer →</div>
        </div>
      </div>`;
    });

    html += `<button onclick="window.clearHistory()" style="width:100%;margin-top:6px;padding:11px;border-radius:8px;font-size:12px;color:#8a8a80;border:1px solid #2a2a2a;background:transparent;cursor:pointer">Rensa all historik</button>`;
  }

  document.getElementById('content').innerHTML = html;
}
