// ── FASTA — js/views/learn.js ──
// Learn section with science-based cards

import { LC } from '../data.js';
import { state } from '../state.js';

export function renderLearn() {
  const cats = ['Alla', ...new Set(LC.map(c => c.cat))];
  const showing = state.learnFilter === 'Alla' ? [...new Set(LC.map(c => c.cat))] : [state.learnFilter];

  let html = `<div style="font-size:21px;font-weight:800;color:#f5f5f0;margin-bottom:4px;letter-spacing:-.5px">Lär dig fasta</div>
    <div style="font-size:13px;color:#8a8a80;margin-bottom:18px">Tryck på ett kort för mer information</div>
    <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:22px">
      ${cats.map(c => {
        const w = c === 'Vanliga farhågor', act = state.learnFilter === c;
        return `<button onclick="state.learnFilter='${c}';window.renderLearn()" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;background:${act ? (w ? 'rgba(127,29,29,0.3)' : 'rgba(200,168,78,0.12)') : '#1a1a1a'};color:${act ? (w ? '#fca5a5' : '#c8a84e') : (w ? '#fca5a5' : '#8a8a80')};border:1px solid ${act ? (w ? 'rgba(239,68,68,0.3)' : 'rgba(200,168,78,0.22)') : (w ? 'rgba(239,68,68,0.2)' : '#2a2a2a')}">${w ? '⚠️ ' + c : c}</button>`;
      }).join('')}
    </div>`;

  showing.forEach(cat => {
    const cards = LC.filter(c => c.cat === cat);
    const w = cat === 'Vanliga farhågor';
    html += `<div style="margin-bottom:26px">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:10px">
        ${w ? '<span style="font-size:11px">⚠️</span>' : ''}
        <span style="font-size:10px;font-weight:700;color:${w ? '#fca5a5' : '#8a8a80'};text-transform:uppercase;letter-spacing:1.5px">${cat}</span>
        <div style="flex:1;height:1px;background:${w ? 'rgba(239,68,68,0.2)' : '#2a2a2a'}"></div>
      </div>
      ${w ? `<div class="warn-banner">Ersätter inte medicinsk rådgivning. Kontakta läkare vid befintlig hälsokondition.</div>` : ''}
      <div class="learn-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px">
        ${cards.map(card => `<div class="learn-card" style="border:1px solid ${w ? 'rgba(239,68,68,0.2)' : '#2a2a2a'}" onclick="window.openCardModal(${card.id - 1})"
          onmouseenter="this.style.borderColor='${w ? 'rgba(239,68,68,0.4)' : 'rgba(200,168,78,0.22)'}'"
          onmouseleave="this.style.borderColor='${w ? 'rgba(239,68,68,0.2)' : '#2a2a2a'}'">
          <div class="learn-icon-box">${card.i}</div>
          <div style="font-size:11px;font-weight:700;color:#f5f5f0;line-height:1.4;flex:1">${card.f}</div>
          <div style="font-size:10px;color:#8a8a80;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${card.fb}</div>
          <div style="font-size:10px;color:#c8a84e;font-weight:600">Läs mer →</div>
        </div>`).join('')}
      </div>
    </div>`;
  });

  document.getElementById('content').innerHTML = html;
}
