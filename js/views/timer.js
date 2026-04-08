// ── FASTA — js/views/timer.js ──
// Timer view: start screen, active fasting, phase timeline

import { PH, PRESETS } from '../data.js';
import { state, profileComplete } from '../state.js';
import { fmt, fmtT, fmtD, fmtHuman, getPhase, getNext, calcElapsed, calcMetabolicElapsed, getActivePause } from '../helpers.js';

export function renderTimer() {
  const elapsed = calcElapsed(), elh = elapsed / 3600000;
  const mElapsed = calcMetabolicElapsed(), mElh = mElapsed / 3600000;
  const phase = getPhase(elh), mPhase = getPhase(mElh);
  const next = getNext(elh), activePause = getActivePause();
  const goalMs = state.rolling || !state.goalHours ? null : state.goalHours * 3600000;
  const prog = goalMs ? Math.min(elapsed / goalMs, 1) : 0;
  const reached = !state.rolling && state.goalHours && elh >= state.goalHours;
  const T2 = fmt(elapsed), tnext = next ? (next.h - elh) * 3600000 : null;
  const pauseLeft = activePause ? (activePause.time + activePause.pauseHours * 3600000 - state.now) : 0;
  const R = 84, C = 2 * Math.PI * R;
  const rc = activePause ? '#c8a84e' : state.fasting ? phase.c : '#c8a84e';
  const strokeOffset = C * (1 - (state.fasting && !state.rolling ? prog : 0));
  const sv = state.selectedVariant, hasProfil = profileComplete();
  let html = '';

  // ── Not fasting: start screen ──
  if (!state.fasting) {
    html += `<div style="text-align:center;padding:4px 0 16px">
      <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(200,168,78,0.12);border:1px solid rgba(200,168,78,0.22);padding:4px 14px;border-radius:20px;font-size:10px;font-weight:700;color:#c8a84e;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:14px"><span style="width:6px;height:6px;border-radius:50%;background:#c8a84e;display:inline-block"></span>Redo att fasta</div>
      <div style="font-size:24px;font-weight:800;color:#f5f5f0;letter-spacing:-.5px;line-height:1.2;margin-bottom:8px">Starta din fasta nu</div>
      <div style="font-size:13px;color:#8a8a80;margin-bottom:20px;line-height:1.6">${sv ? `Schema valt: <strong style="color:#c8a84e">${sv.l} · ${sv.tag}</strong>` : 'Löpande fasta — ingen tidsgräns.<br/>Pågår tills du väljer att avsluta.'}</div>
      ${!hasProfil ? `<div style="background:rgba(200,168,78,0.06);border:1px solid rgba(200,168,78,0.2);border-radius:10px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#8a8a80;line-height:1.6">💡 Fyll i din <button onclick="window.setView('profil')" style="color:#c8a84e;font-weight:600;cursor:pointer;text-decoration:underline">Profil</button> för att se din personliga metabola effekt.</div>` : ''}
      <button onclick="${sv ? `window.startFast(${sv.h},false)` : 'window.startFast(null,true)'}" style="width:100%;padding:17px;border-radius:12px;font-size:16px;font-weight:700;background:#c8a84e;color:#0a0a0a;border:none;box-shadow:0 4px 24px rgba(200,168,78,0.3);letter-spacing:.3px;margin-bottom:10px;cursor:pointer">${sv ? `▶ Starta ${sv.l} fasta` : '▶ Starta löpande fasta'}</button>

      <button onclick="state.showBackdate=!state.showBackdate;state.backdateValue='';window.renderTimer()" style="display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:600;background:transparent;color:${state.showBackdate ? '#c8a84e' : '#8a8a80'};border:1px solid ${state.showBackdate ? 'rgba(200,168,78,0.22)' : '#2a2a2a'};cursor:pointer;margin-bottom:16px">
        🕐 Glömde starta? Ange starttid bakåt ${state.showBackdate ? '▲' : '▼'}
      </button>

      ${state.showBackdate ? `<div class="card fade" style="margin-bottom:16px;text-align:left">
        <div class="eyebrow" style="margin-bottom:8px">Ange när du slutade äta</div>
        <p style="font-size:12px;color:#8a8a80;margin-bottom:12px;line-height:1.6">Ät du middag kl 19 men glömde starta? Välj tidpunkten så räknar appen rätt från då.</p>
        <input type="datetime-local" id="backdate-input" value="${state.backdateValue}"
          onchange="state.backdateValue=this.value"
          max="${new Date(Date.now() - 60000).toISOString().slice(0, 16)}"
          style="width:100%;padding:11px 14px;border-radius:10px;border:1px solid #2a2a2a;background:#0a0a0a;color:#f5f5f0;font-size:14px;outline:none;font-family:inherit;margin-bottom:12px;cursor:pointer"/>
        <button onclick="
          const v=document.getElementById('backdate-input').value;
          if(!v){alert('Välj en tidpunkt');return;}
          const t=new Date(v).getTime();
          if(t>=Date.now()){alert('Tidpunkten måste vara i det förflutna');return;}
          if(Date.now()-t>7*24*3600000){alert('Kan inte starta mer än 7 dagar bakåt');return;}
          window.startFast(${sv ? sv.h : 'null'},${sv ? 'false' : 'true'},t)
        " style="width:100%;padding:13px;border-radius:10px;font-size:14px;font-weight:700;background:#c8a84e;color:#0a0a0a;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(200,168,78,0.25)">
          ▶ Starta från vald tidpunkt
        </button>
      </div>` : ''}

      <div style="display:flex;gap:14px;justify-content:center;margin-bottom:20px">
        <span style="font-size:11px;color:#8a8a80">✓ Fettförbränning</span>
        <span style="font-size:11px;color:#8a8a80">✓ Cellstädning</span>
        <span style="font-size:11px;color:#8a8a80">✓ Tillväxthormon</span>
      </div>
      <button onclick="state.showVariants=!state.showVariants;window.renderTimer()" style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;background:transparent;color:${state.showVariants ? '#c8a84e' : '#8a8a80'};border:1px solid ${state.showVariants ? 'rgba(200,168,78,0.22)' : '#2a2a2a'};cursor:pointer">
        📅 Testa ett fasta-schema <span style="font-size:10px">${state.showVariants ? '▲' : '▼'}</span>
      </button>
    </div>`;

    // Schema picker
    if (state.showVariants) {
      html += `<div class="card fade"><div class="eyebrow" style="margin-bottom:12px">Välj schema</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="variant-card${!sv ? ' selected' : ''}" onclick="state.selectedVariant=null;window.renderTimer()" style="grid-column:1/-1">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:14px;font-weight:700;color:#f5f5f0">∞ Löpande</span>
              <span style="font-size:9px;padding:2px 6px;border-radius:20px;background:${!sv ? 'rgba(200,168,78,0.2)' : 'rgba(200,168,78,0.08)'};color:#c8a84e;font-weight:700">Standard</span>
              ${!sv ? `<span style="margin-left:auto;font-size:12px;color:#c8a84e">✓ Vald</span>` : ''}
            </div>
            <div style="font-size:11px;color:#b5b5aa;line-height:1.5">Ingen tidsgräns — pågår tills du väljer att avsluta.</div>
          </div>
          ${PRESETS.filter(p => p.h !== null).map(p => {
            const sel = sv && sv.l === p.l;
            return `<div class="variant-card${sel ? ' selected' : ''}" onclick="state.selectedVariant=${sel ? 'null' : `{l:'${p.l}',h:${p.h},tag:'${p.tag}'}`};window.renderTimer()">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:14px;font-weight:700;color:#f5f5f0">${p.l}</span>
              <span style="font-size:9px;padding:2px 6px;border-radius:20px;background:${sel ? 'rgba(200,168,78,0.2)' : 'rgba(200,168,78,0.08)'};color:#c8a84e;font-weight:700">${p.tag}</span>
              ${sel ? `<span style="margin-left:auto;font-size:12px;color:#c8a84e">✓</span>` : ''}
            </div>
            <div style="font-size:10px;color:#8a8a80;line-height:1.6">${p.b.map(b => '✓ ' + b).join('<br>')}</div>
            <div style="font-size:11px;color:#b5b5aa;margin-top:6px;line-height:1.5">${p.p}</div>
          </div>`;
          }).join('')}
        </div>
      </div>`;
    }

  // ── Active fasting ──
  } else {
    html += `<div style="margin-bottom:14px">
      <div style="font-size:20px;font-weight:800;color:#f5f5f0;letter-spacing:-.5px">${state.rolling ? 'Löpande fasta' : 'Schema: ' + state.goalHours + 'h'}</div>
      <div style="font-size:12px;color:#8a8a80;margin-top:2px">Startade ${fmtT(state.startTime)} · ${fmtD(state.startTime)}</div>
    </div>
    <div class="dual-time">
      <div class="time-box actual">
        <div class="time-box-label" style="color:#8a8a80">⏱ Faktisk fastetid</div>
        <div class="time-box-value" style="color:#f5f5f0">${T2.h}:${T2.m}:${T2.s}</div>
        <div class="time-box-phase" style="color:${phase.c}">${phase.i} ${phase.l}</div>
      </div>
      <div class="time-box metabolic">
        <div class="time-box-label" style="color:#c8a84e">⚡ Metabol effekt</div>
        <div class="time-box-value" style="color:#c8a84e">${hasProfil ? `~${fmtHuman(mElapsed)}` : T2.h + ':' + T2.m + ':' + T2.s}</div>
        <div class="time-box-phase" style="color:${hasProfil ? mPhase.c : phase.c}">${hasProfil ? mPhase.i + ' ' + mPhase.l : phase.i + ' ' + phase.l}</div>
        ${!hasProfil ? `<div style="font-size:9px;color:#8a8a80;margin-top:3px">Fyll i profil för personlig beräkning</div>` : ''}
      </div>
    </div>`;

    // Ring + controls
    html += `<div class="card" style="display:flex;flex-direction:column;align-items:center;margin-bottom:14px">
      ${activePause ? `<div class="pause-banner"><div><div style="font-size:12px;font-weight:700;color:#c8a84e">⏸ ${activePause.desc}</div><div style="font-size:11px;color:#8a8a80">Återupptas om ${fmt(pauseLeft).h}:${fmt(pauseLeft).m}:${fmt(pauseLeft).s}</div></div><span>🍳</span></div>` : ''}
      <div class="ring-wrap">
        <svg width="200" height="200" style="transform:rotate(-90deg)">
          <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${rc}" stop-opacity=".6"/><stop offset="100%" stop-color="${rc}"/></linearGradient></defs>
          <circle cx="100" cy="100" r="${R}" fill="none" stroke="#2a2a2a" stroke-width="9"/>
          ${!state.rolling ? `<circle cx="100" cy="100" r="${R}" fill="none" stroke="url(#rg)" stroke-width="9" stroke-dasharray="${C}" stroke-dashoffset="${strokeOffset}" stroke-linecap="round" style="transition:stroke-dashoffset .9s ease"/>`
          : `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${rc}" stroke-width="9" stroke-dasharray="16 9" stroke-linecap="round"/>`}
        </svg>
        <div class="ring-center">
          <span style="font-size:28px;font-weight:800;color:#f5f5f0;font-family:monospace;letter-spacing:2px">${T2.h}:${T2.m}:${T2.s}</span>
          ${state.meals.length || state.workouts.length ? `<span style="font-size:9px;color:#8a8a80">netto fastetid</span>` : ''}
          <span style="font-size:11px;font-weight:600;color:${activePause ? '#c8a84e' : phase.c}">${activePause ? '⏸ Paus' : phase.i + ' ' + phase.l}</span>
          ${!state.rolling && reached ? `<span style="font-size:11px;color:#c8a84e;font-weight:700">🎯 Mål nått!</span>` : !state.rolling && next && !activePause ? `<span style="font-size:10px;color:#8a8a80">nästa om ${fmt(tnext).h}:${fmt(tnext).m}:${fmt(tnext).s}</span>` : ''}
          ${state.rolling ? `<span style="font-size:10px;color:#8a8a80">Löpande ∞</span>` : ''}
        </div>
      </div>
      ${state.meals.length || state.workouts.length ? `<div style="width:100%;margin-bottom:12px">
        ${state.meals.length ? `<div class="eyebrow">Måltider</div>${state.meals.map(m => `<div class="log-item"><span>🍳</span><div><div style="font-size:11px;font-weight:600;color:#f5f5f0">${m.desc}</div><div style="font-size:10px;color:#8a8a80">${fmtT(m.time)} · ${m.kcal} kcal · ${m.pauseHours}h paus</div></div></div>`).join('')}` : ''}
        ${state.workouts.length ? `<div class="eyebrow" style="margin-top:8px">Träningspass</div>${state.workouts.map(wo => `<div class="log-item"><span>${wo.icon}</span><div><div style="font-size:11px;font-weight:600;color:#f5f5f0">${wo.type} · ${wo.durationMins} min</div><div style="font-size:10px;color:#8a8a80">${fmtT(wo.time)}${wo.kcal ? ` · ${wo.kcal} kcal` : ''}${wo.avgHr ? ` · ♥ ${wo.avgHr} bpm` : ''}</div></div></div>`).join('')}` : ''}
      </div>` : ''}
      <div style="display:flex;gap:8px;width:100%">
        <button class="btn-end" style="flex:1" onclick="window.endFast()">⏹ Avsluta fasta</button>
        ${!activePause ? `<button class="btn-icon" onclick="window.openMealModal()" title="Logga måltid">🍳</button>
        <button class="btn-icon" onclick="window.openWorkoutModal()" title="Logga träning">🏋️</button>` : ''}
      </div>
    </div>`;
  }

  // ── Phase timeline ──
  html += `<div class="card"><div class="eyebrow">Kroppens faser${hasProfil && state.fasting ? ' (metabol tid)' : ''}</div>
    <div style="position:relative;padding-left:20px">
      <div style="position:absolute;left:7px;top:8px;bottom:8px;width:1px;background:#2a2a2a"></div>
      ${PH.map((p, i) => {
        const last = i === PH.length - 1;
        const timeToUse = hasProfil && state.fasting ? mElh : elh;
        const hit = state.fasting && timeToUse >= p.h;
        const act = state.fasting && timeToUse >= p.h && (last || timeToUse < PH[i + 1].h);
        const ex = state.expandedPhase === i;
        const pe = last ? Math.max(state.goalHours || 72, p.h) : PH[i + 1].h;
        const sl = pe - p.h || 1;
        let sp = 0;
        if (state.fasting) { if (timeToUse >= pe) sp = 1; else if (timeToUse > p.h) sp = (timeToUse - p.h) / sl; }
        return `<div>
          <div class="phase-row" onclick="state.expandedPhase=${ex ? 'null' : i};window.renderTimer()" style="display:flex;gap:11px;padding:8px 7px;border-radius:7px;cursor:pointer;background:${act ? p.c + '0d' : 'transparent'};margin-left:-3px">
            <div class="phase-dot" style="margin-top:6px;background:${hit ? p.c : '#2a2a2a'};box-shadow:${act ? `0 0 7px ${p.c}80` : 'none'}"></div>
            <span style="font-size:16px;opacity:${hit ? 1 : .2};margin-top:1px">${p.i}</span>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
                <span style="font-size:12px;font-weight:600;color:${hit ? '#f5f5f0' : '#8a8a80'}">${p.l}</span>
                ${act ? `<span style="font-size:9px;padding:1px 6px;border-radius:20px;background:${p.c}20;color:${p.c};font-weight:700">NU</span>` : ''}
                <span style="font-size:10px;color:#8a8a80;margin-left:auto">${p.h === 0 ? '0h' : p.h + 'h'}</span>
              </div>
              ${state.fasting ? `<div class="phase-bar"><div class="phase-bar-fill" style="width:${sp * 100}%;background:${hit ? p.c : '#2a2a2a'}"></div></div>` : ''}
            </div>
            <span style="font-size:9px;color:#8a8a80;margin-top:2px">${ex ? '▲' : '▼'}</span>
          </div>
          ${ex ? `<div class="phase-detail fade" style="border-left:1.5px solid ${p.c}50"><p style="font-size:12px;color:#b5b5aa;line-height:1.6;margin-bottom:6px">${p.d}</p><p style="font-size:11px;color:#8a8a80;line-height:1.7">${p.x}</p></div>` : ''}
        </div>`;
      }).join('')}
    </div>
  </div>`;

  document.getElementById('content').innerHTML = html;
}
