// ── FASTA — js/modals.js ──
// Modal dialogs for cards, history details, meal logging, workout logging

import { LC, MEALS_PRE, WORKOUT_TYPES, ACTIVITY_LABELS, BENEFITS } from './data.js';
import { state, profile, profileComplete, saveHistory } from './state.js';
import { fmt, fmtT, fmtD, fmtHuman, getPhase, getBenefits } from './helpers.js';
import { addMeal, addWorkout } from './actions.js';

// ── Generic modal ──

export function openModal(html) {
  const el = document.createElement('div');
  el.className = 'modal-backdrop';
  el.innerHTML = html;
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { el.remove(); document.removeEventListener('keydown', esc); }
  });
  document.body.appendChild(el);
  return el;
}

// ── Learn card modal ──

export function openCardModal(idx) {
  const card = LC[idx];
  const warn = card.cat === 'Vanliga farhågor';
  openModal(`<div class="modal-box" onclick="event.stopPropagation()">
    <div class="modal-header"><div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div style="display:flex;gap:10px;align-items:center"><div class="learn-icon-box">${card.i}</div><div style="font-size:15px;font-weight:700;color:#f5f5f0;max-width:220px;line-height:1.3">${card.f}</div></div>
      <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span></div></div>
    <div class="modal-body">
      ${warn ? `<div style="background:rgba(127,29,29,0.3);border:1px solid rgba(239,68,68,0.25);border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;color:#fca5a5">⚠️ Ersätter inte medicinsk rådgivning.</div>` : ''}
      <p style="font-size:13px;color:#b5b5aa;line-height:1.7;margin-bottom:14px">${card.bk}</p>
      <div style="border-top:1px solid #2a2a2a;padding-top:10px;font-size:11px;color:#8a8a80;font-style:italic">📖 ${card.src}</div>
    </div>
  </div>`);
}

// ── History detail modal ──

export function openHistoryModal(idx) {
  const entry = state.history[idx];
  const dh = entry.duration / 3600000;
  const mDh = (entry.metDuration || entry.duration) / 3600000;
  const bens = getBenefits(mDh), top = bens[bens.length - 1];
  const notReached = BENEFITS.filter(b => mDh < b.h);
  const prof = entry.profile;

  openModal(`<div class="modal-box" style="max-height:90vh;overflow:hidden;display:flex;flex-direction:column" onclick="event.stopPropagation()">
    <div style="background:linear-gradient(135deg,rgba(200,168,78,0.12),transparent);border-bottom:1px solid #2a2a2a;padding:18px">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px">
        <div>
          <div style="font-size:10px;color:#c8a84e;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px">${entry.rolling ? 'Löpande' : entry.reachedGoal ? '✅ Mål uppnått' : 'Genomförd'}</div>
          <div style="font-size:20px;font-weight:800;color:#f5f5f0">${top ? top.i : '⏱'} ${Math.round(dh * 10) / 10}h fasta</div>
          <div style="font-size:11px;color:#8a8a80;margin-top:2px">${fmtD(entry.start)} · ${fmtT(entry.start)} → ${fmtT(entry.end)}</div>
        </div>
        <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:${prof ? '10px' : '0'}">
        <div style="background:#0a0a0a;border-radius:8px;padding:9px;text-align:center;border:1px solid #2a2a2a">
          <div style="font-size:13px;font-weight:700;color:#8a8a80;font-family:monospace">${fmt(entry.duration).h}:${fmt(entry.duration).m}:${fmt(entry.duration).s}</div>
          <div style="font-size:10px;color:#8a8a80;margin-top:2px">Faktisk fastetid</div>
        </div>
        <div style="background:rgba(200,168,78,0.08);border-radius:8px;padding:9px;text-align:center;border:1px solid rgba(200,168,78,0.3)">
          <div style="font-size:13px;font-weight:700;color:#c8a84e;font-family:monospace">~${fmtHuman(entry.metDuration || entry.duration)}</div>
          <div style="font-size:10px;color:#c8a84e;margin-top:2px">Metabol effekt</div>
        </div>
      </div>
      ${prof ? `<div style="background:#0a0a0a;border-radius:8px;padding:8px 12px;border:1px solid #2a2a2a;font-size:11px;color:#8a8a80">👤 ${prof.gender === 'man' ? 'Man' : prof.gender === 'kvinna' ? 'Kvinna' : 'Ej specificerat'} · ${prof.age} år · ${prof.height} cm · ${prof.weight} kg · ${ACTIVITY_LABELS[prof.activity] || prof.activity}</div>` : ''}
    </div>
    <div class="modal-body">
      ${bens.length === 0
        ? `<div style="text-align:center;padding:20px;color:#8a8a80"><div style="font-size:28px;margin-bottom:8px">⏳</div><div style="font-size:13px">Fastan var för kort för mätbara effekter.<br/>Minst 4 timmar krävs.</div></div>`
        : `<div class="eyebrow">Uppnådda effekter (metabol tid)</div>
        ${[...bens].reverse().map((b, i) => `<div class="benefit-box" style="border:1px solid ${b.c}25;background:${b.c}08">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <span>${b.i}</span><div style="flex:1"><div style="font-size:12px;font-weight:700;color:#f5f5f0">${b.t}</div><div style="font-size:10px;color:${b.c}">Uppnådd vid ${b.h}h</div></div>
            ${i === 0 ? `<span style="font-size:10px;padding:2px 7px;border-radius:20px;background:rgba(200,168,78,0.12);color:#c8a84e;border:1px solid rgba(200,168,78,0.22);font-weight:700">TOPP</span>` : ''}
          </div>
          ${b.e.map(ef => `<div style="display:flex;gap:5px;font-size:12px;color:#b5b5aa;margin-bottom:2px"><span style="color:${b.c}">✓</span>${ef}</div>`).join('')}
        </div>`).join('')}`}
      ${notReached.length ? `<div class="eyebrow" style="margin-top:12px">Ej uppnått</div>
        ${notReached.map(b => `<div class="not-reached"><span>${b.i}</span><div><div style="font-size:12px;color:#8a8a80;font-weight:600">${b.t}</div><div style="font-size:10px;color:#8a8a80">Kräver ${b.h}h · ${Math.ceil(b.h - mDh)}h till</div></div></div>`).join('')}` : ''}
      ${(entry.meals || []).length ? `<div class="eyebrow" style="margin-top:12px">Måltider</div>
        ${entry.meals.map(m => `<div class="log-item"><span>🍳</span><div><div style="font-size:12px;font-weight:600;color:#f5f5f0">${m.desc}</div><div style="font-size:11px;color:#8a8a80">${fmtT(m.time)} · ${m.kcal} kcal · ${m.pauseHours}h paus</div></div></div>`).join('')}` : ''}
      ${(entry.workouts || []).length ? `<div class="eyebrow" style="margin-top:12px">Träningspass</div>
        ${entry.workouts.map(wo => {
          const mhr = wo.maxHr > 0 ? wo.maxHr : (220 - (prof?.age || 35));
          const hrPct = wo.avgHr > 0 ? Math.min(wo.avgHr / mhr, 1) : 0.65;
          const glycFrac = hrPct < 0.6 ? 0.3 : hrPct < 0.75 ? 0.5 : hrPct < 0.85 ? 0.7 : 0.85;
          const bonus = wo.kcal > 0 ? (wo.kcal * glycFrac / 4 / 10).toFixed(1) : null;
          return `<div class="log-item"><span>${wo.icon}</span><div style="flex:1"><div style="font-size:12px;font-weight:600;color:#f5f5f0">${wo.type} · ${wo.durationMins} min</div><div style="font-size:11px;color:#8a8a80">${fmtT(wo.time)}${wo.kcal ? ` · ${wo.kcal} kcal` : ''}${wo.avgHr ? ` · ♥ ${wo.avgHr} bpm` : ''}</div>${bonus ? `<div style="font-size:10px;color:#c8a84e;margin-top:2px">⚡ +${bonus}h metabol bonus</div>` : ''}</div></div>`;
        }).join('')}` : ''}
    </div>
  </div>`);
}

// ── Meal modal ──

export function openMealModal() {
  let selIdx = 0, pauseH = 2;
  const el = openModal(`<div class="modal-box" onclick="event.stopPropagation()">
    <div class="modal-header"><div style="display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:15px;font-weight:700;color:#f5f5f0">🍳 Logga måltid</div>
      <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span></div></div>
    <div class="modal-body">
      <div class="eyebrow">Välj måltid</div>
      <div id="mp" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px"></div>
      <div id="mi"></div>
      <div class="eyebrow">Paus-fönster</div>
      <div id="pp" style="display:flex;gap:6px;margin-bottom:16px"></div>
      <button id="mc" style="width:100%;padding:13px;border-radius:10px;font-size:14px;font-weight:700;background:#c8a84e;color:#0a0a0a;border:none;cursor:pointer">Logga & fortsätt fastan</button>
    </div></div>`);

  function renderPresets() {
    el.querySelector('#mp').innerHTML = MEALS_PRE.map((m, i) =>
      `<button onclick="window._ms=${i};window._rmp()" style="padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;background:${i === selIdx ? 'rgba(200,168,78,0.12)' : '#141414'};color:${i === selIdx ? '#c8a84e' : '#8a8a80'};border:1px solid ${i === selIdx ? 'rgba(200,168,78,0.22)' : '#2a2a2a'}">${m.l}</button>`
    ).join('');
    const s = MEALS_PRE[selIdx];
    el.querySelector('#mi').innerHTML = s.k === null
      ? `<input id="cd" placeholder="Beskriv måltiden..." class="minput"/><input id="ck" placeholder="Kalorier (kcal)" type="number" class="minput" style="margin-bottom:12px"/>`
      : `<div style="background:#0a0a0a;border-radius:8px;padding:9px 12px;margin-bottom:12px;display:flex;gap:14px;border:1px solid #2a2a2a"><span style="font-size:12px;color:#b5b5aa">⚡ ${s.k} kcal</span><span style="font-size:12px;color:#b5b5aa">🥩 ${s.pr}g protein</span></div>`;
  }

  function renderPause() {
    el.querySelector('#pp').innerHTML = [1, 2, 3, 4].map(h =>
      `<button onclick="window._ph=${h};window._rpause()" style="flex:1;padding:8px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:${h === pauseH ? 'rgba(200,168,78,0.12)' : '#141414'};color:${h === pauseH ? '#c8a84e' : '#8a8a80'};border:1px solid ${h === pauseH ? 'rgba(200,168,78,0.22)' : '#2a2a2a'}">${h}h</button>`
    ).join('');
  }

  window._ms = 0; window._ph = 2;
  window._rmp = () => { selIdx = window._ms; renderPresets(); };
  window._rpause = () => { pauseH = window._ph; renderPause(); };
  renderPresets(); renderPause();

  el.querySelector('#mc').onclick = () => {
    const s = MEALS_PRE[selIdx];
    const desc = s.k === null ? (el.querySelector('#cd') || { value: '' }).value : s.d;
    const kcal = s.k === null ? Number((el.querySelector('#ck') || { value: 0 }).value) || 0 : s.k;
    addMeal({ time: Date.now(), desc, kcal, protein: s.k === null ? 0 : s.pr, pauseHours: pauseH });
    el.remove();
  };
}

// ── Workout modal ──

export function openWorkoutModal() {
  let selIdx = 0;
  const el = openModal(`<div class="modal-box" onclick="event.stopPropagation()">
    <div class="modal-header"><div style="display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:15px;font-weight:700;color:#f5f5f0">🏋️ Logga träningspass</div>
      <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span></div></div>
    <div class="modal-body">
      <div class="eyebrow">Typ av träning</div>
      <div id="wt" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px"></div>
      <div id="wname"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div><div class="eyebrow">Tid (minuter)</div><input id="wmins" type="number" min="1" max="300" placeholder="t.ex. 45" value="30" class="minput" style="margin-bottom:0"/></div>
        <div><div class="eyebrow">Kalorier (kcal)</div><input id="wkcal" type="number" min="0" placeholder="t.ex. 320" class="minput" style="margin-bottom:0"/></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div><div class="eyebrow">Snittspuls (bpm)</div><input id="wavghr" type="number" min="40" max="220" placeholder="t.ex. 145" class="minput" style="margin-bottom:0"/></div>
        <div><div class="eyebrow">Maxpuls (bpm)</div><input id="wmaxhr" type="number" min="100" max="220" placeholder="t.ex. 178" class="minput" style="margin-bottom:0"/></div>
      </div>
      <div id="wbonus" style="display:none;background:rgba(200,168,78,0.08);border:1px solid rgba(200,168,78,0.22);border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;color:#c8a84e"></div>
      <button id="wc" style="width:100%;padding:13px;border-radius:10px;font-size:14px;font-weight:700;background:#c8a84e;color:#0a0a0a;border:none;cursor:pointer">Logga träningspass</button>
    </div></div>`);

  function renderTypes() {
    el.querySelector('#wt').innerHTML = WORKOUT_TYPES.map((t, i) =>
      `<button onclick="window._wi=${i};window._rwt()" style="padding:5px 11px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;background:${i === selIdx ? 'rgba(200,168,78,0.12)' : '#141414'};color:${i === selIdx ? '#c8a84e' : '#8a8a80'};border:1px solid ${i === selIdx ? 'rgba(200,168,78,0.22)' : '#2a2a2a'}">${t.icon} ${t.l}</button>`
    ).join('');
    el.querySelector('#wname').innerHTML = WORKOUT_TYPES[selIdx].met === null
      ? `<input id="wcname" placeholder="Beskriv träningstyp..." class="minput"/>` : '';
  }

  function updateBonus() {
    const k = Number(el.querySelector('#wkcal')?.value) || 0;
    const hr = Number(el.querySelector('#wavghr')?.value) || 0;
    const mhr = Number(el.querySelector('#wmaxhr')?.value) || (220 - (profile.age || 35));
    const hrPct = hr > 0 ? Math.min(hr / mhr, 1) : 0.65;
    const glycFrac = hrPct < 0.6 ? 0.3 : hrPct < 0.75 ? 0.5 : hrPct < 0.85 ? 0.7 : 0.85;
    const bonus = (k * glycFrac / 4) / 10;
    const box = el.querySelector('#wbonus');
    if (k > 0) {
      box.style.display = 'block';
      box.innerHTML = `⚡ Beräknad metabol bonus: ~<strong>${bonus.toFixed(1)}h</strong> extra fastaeffekt<br/><span style="font-size:10px;opacity:.8">Baserat på ${Math.round(k * glycFrac)} kcal glykogen (${Math.round(glycFrac * 100)}% av kalorier vid denna intensitet)</span>`;
    } else {
      box.style.display = 'none';
    }
  }

  window._wi = 0;
  window._rwt = () => { selIdx = window._wi; renderTypes(); };
  ['#wkcal', '#wavghr', '#wmaxhr'].forEach(id => {
    const el2 = el.querySelector(id);
    if (el2) el2.addEventListener('input', updateBonus);
  });

  el.querySelector('#wc').onclick = () => {
    const type = WORKOUT_TYPES[selIdx];
    const name = type.met === null ? (el.querySelector('#wcname') || { value: 'Eget' }).value || 'Eget' : type.l;
    addWorkout({
      time: Date.now(), type: name, icon: type.icon,
      durationMins: Number(el.querySelector('#wmins').value) || 30,
      kcal: Number(el.querySelector('#wkcal').value) || 0,
      avgHr: Number(el.querySelector('#wavghr').value) || 0,
      maxHr: Number(el.querySelector('#wmaxhr').value) || 0,
    });
    el.remove();
  };

  renderTypes();
}
