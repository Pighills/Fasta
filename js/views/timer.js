// ── FASTA — js/views/timer.js ──
// Timer view: start screen, active fasting, phase timeline
// tickTimer() updates only dynamic values (no DOM rebuild = no flicker)

import { PH, PRESETS, PROGRAMS } from '../data.js';
import { state, profile, profileComplete, programView, goalView, weekView } from '../state.js';
import { fmtClock, fmtT, fmtD, getPhase, getNext, calcElapsed, calcMetabolicElapsed, calcMetabolicMultiplier, calcWorkoutBonusMs, getActivePause, toLocalDateTimeStr, esc, fmtHuman, defaultBackdate, checkBackdate } from '../helpers.js';

import { pauseProgram, resumeProgram, endProgram } from '../actions.js';
import { openProgramPicker, confirmModal } from '../modals.js';

// Track state to detect when a full re-render is needed
let _lastPhaseIdx = -1;
let _lastMealCount = 0;
let _lastWorkoutCount = 0;
let _lastExpandedPhase = undefined;
let _lastMPhaseIdx = -1;
let _lastPaused = false;

// What the metabolic time is made of. Training shows what is actually
// added, which is less than the workouts' bonus when the 1.4x cap applies.
function metNote(elapsed, mElapsed) {
  const mult = calcMetabolicMultiplier(profile);
  const bonus = calcWorkoutBonusMs();
  const parts = [];
  if (profileComplete() && mult !== 1) parts.push(`${mult.toFixed(2)}x profil`);
  if (bonus > 0) {
    const added = Math.max(0, mElapsed - elapsed * mult);
    parts.push(`+${(added / 3600000).toFixed(1)}h träning${added < bonus - 1000 ? ' (tak 1,4x)' : ''}`);
  }
  return parts.join(' · ');
}

// ── Tick: lightweight update of time values only ──
export function tickTimer() {
  if (!state.fasting) return;

  const elapsed = calcElapsed(), elh = elapsed / 3600000;
  const hasProfil = profileComplete();
  const mElapsed = calcMetabolicElapsed();
  const timeToUse = hasProfil ? mElapsed / 3600000 : elh;
  const activePause = getActivePause();

  // Detect if structure changed → full re-render
  if (PH.indexOf(getPhase(elh)) !== _lastPhaseIdx ||
      PH.indexOf(getPhase(mElapsed / 3600000)) !== _lastMPhaseIdx ||
      !!activePause !== _lastPaused ||
      state.meals.length !== _lastMealCount ||
      state.workouts.length !== _lastWorkoutCount ||
      state.expandedPhase !== _lastExpandedPhase) {
    renderTimer();
    return;
  }

  const T2 = fmtClock(elapsed);
  const mT2 = fmtClock(mElapsed);
  const next = getNext(elh);

  // Dual time boxes
  _txt('tick-actual', T2);
  _txt('tick-metabolic', `~${mT2}`);
  _txt('tick-met-note', metNote(elapsed, mElapsed));

  // Ring center
  _txt('tick-ring-time', T2);

  // Next phase countdown
  if (next && !activePause && !state.rolling) {
    const tn = fmtClock((next.h - elh) * 3600000);
    _txt('tick-ring-next', `nästa om ${tn}`);
  }

  // Pause countdown
  if (activePause) {
    const pl = fmtClock(activePause.time + activePause.pauseHours * 3600000 - state.now);
    _txt('tick-pause', `Återupptas om ${pl}`);
  }

  // Phase progress bars
  PH.forEach((p, i) => {
    const bar = document.getElementById(`tick-phase-${i}`);
    if (bar) bar.style.width = `${phaseFill(i, timeToUse) * 100}%`;
  });

  // Ring stroke progress (schema mode)
  if (!state.rolling && state.goalHours) {
    const prog = Math.min(elapsed / (state.goalHours * 3600000), 1);
    const R = 84, C = 2 * Math.PI * R;
    const circle = document.getElementById('tick-ring-progress');
    if (circle) circle.setAttribute('stroke-dashoffset', C * (1 - prog));
  }
}

// How far (0–1) time t has come through phase i
function phaseFill(i, t) {
  const p = PH[i];
  const pe = i === PH.length - 1 ? Math.max(state.goalHours || 72, p.h) : PH[i + 1].h;
  if (t >= pe) return 1;
  return t > p.h ? (t - p.h) / (pe - p.h || 1) : 0;
}

function _txt(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Full render ──
export function renderTimer() {
  const elapsed = calcElapsed(), elh = elapsed / 3600000;
  const mElapsed = calcMetabolicElapsed(), mElh = mElapsed / 3600000;
  const phase = getPhase(elh), mPhase = getPhase(mElh);
  const next = getNext(elh), activePause = getActivePause();
  const goalMs = state.rolling || !state.goalHours ? null : state.goalHours * 3600000;
  const prog = goalMs ? Math.min(elapsed / goalMs, 1) : 0;
  const reached = !state.rolling && state.goalHours && elh >= state.goalHours;
  const T2 = fmtClock(elapsed), tnext = next ? (next.h - elh) * 3600000 : null;
  const pauseLeft = activePause ? (activePause.time + activePause.pauseHours * 3600000 - state.now) : 0;
  const R = 84, C = 2 * Math.PI * R;
  const rc = activePause ? '#c8a84e' : state.fasting ? phase.c : '#c8a84e';
  const strokeOffset = C * (1 - (state.fasting && !state.rolling ? prog : 0));
  const program = programView();
  const suggestion = program && !program.paused && !program.complete ? program.hours : null;
  const sv = state.selectedVariant || (suggestion ? { h: suggestion, l: `${suggestion} h`, tag: 'Dagens förslag' } : null);
  const hasProfil = profileComplete();
  let html = programCard(program);

  // Update tracking state
  _lastPhaseIdx = PH.indexOf(getPhase(elh));
  _lastMPhaseIdx = PH.indexOf(mPhase);
  _lastPaused = !!activePause;
  _lastMealCount = state.meals.length;
  _lastWorkoutCount = state.workouts.length;
  _lastExpandedPhase = state.expandedPhase;

  // ── Not fasting: start screen ──
  if (!state.fasting) {
    html += `<div style="text-align:center;padding:4px 0 16px">
      <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(200,168,78,0.12);border:1px solid rgba(200,168,78,0.22);padding:4px 14px;border-radius:20px;font-size:10px;font-weight:700;color:#c8a84e;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:14px"><span style="width:6px;height:6px;border-radius:50%;background:#c8a84e;display:inline-block"></span>Redo att fasta</div>
      <div style="font-size:24px;font-weight:800;color:#f5f5f0;letter-spacing:-.5px;line-height:1.2;margin-bottom:8px">Starta din fasta nu</div>
      <div style="font-size:13px;color:#8a8a80;margin-bottom:20px;line-height:1.6">${sv?.h ? `Schema valt: <strong style="color:#c8a84e">${sv.l} · ${sv.tag}</strong>` : 'Löpande fasta — ingen tidsgräns.<br/>Pågår tills du väljer att avsluta.'}</div>
      ${!hasProfil ? `<div style="background:rgba(200,168,78,0.06);border:1px solid rgba(200,168,78,0.2);border-radius:10px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#8a8a80;line-height:1.6">💡 Fyll i din <button onclick="window.setView('profil')" style="color:#c8a84e;font-weight:600;cursor:pointer;text-decoration:underline">Profil</button> för att se din personliga metabola effekt.</div>` : ''}
      <button onclick="${sv?.h ? `window.startFast(${sv.h},false)` : 'window.startFast(null,true)'}" style="width:100%;padding:17px;border-radius:12px;font-size:16px;font-weight:700;background:#c8a84e;color:#0a0a0a;border:none;box-shadow:0 4px 24px rgba(200,168,78,0.3);letter-spacing:.3px;margin-bottom:10px;cursor:pointer">${sv?.h ? `▶ Starta ${sv.l} fasta` : '▶ Starta löpande fasta'}</button>

      <button id="backdate-toggle" aria-expanded="${state.showBackdate}" style="display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:600;background:transparent;color:${state.showBackdate ? '#c8a84e' : '#8a8a80'};border:1px solid ${state.showBackdate ? 'rgba(200,168,78,0.22)' : '#2a2a2a'};cursor:pointer;margin-bottom:16px">
        🕐 Glömde starta? Ange starttid bakåt ${state.showBackdate ? '▲' : '▼'}
      </button>

      ${state.showBackdate ? `<div class="card fade" style="margin-bottom:16px;text-align:left">
        <div class="eyebrow" style="margin-bottom:8px">Ange när du slutade äta</div>
        <p style="font-size:12px;color:#8a8a80;margin-bottom:12px;line-height:1.6">Åt du middag kl 19 men glömde starta? Välj tidpunkten så räknar appen rätt från då.</p>
        <input type="datetime-local" id="backdate-input" value="${esc(state.backdateValue)}" aria-label="Starttid" aria-describedby="backdate-err backdate-preview"
          style="width:100%;padding:11px 14px;border-radius:10px;border:1px solid #2a2a2a;background:#0a0a0a;color:#f5f5f0;font-size:16px;outline:none;font-family:inherit;margin-bottom:8px;cursor:pointer"/>
        <p id="backdate-preview" aria-live="polite" style="font-size:12px;color:#c8a84e;margin-bottom:12px;line-height:1.6"></p>
        <div id="backdate-err" class="form-err" role="alert"></div>
        <button id="backdate-start" style="width:100%;padding:13px;border-radius:10px;font-size:14px;font-weight:700;background:#c8a84e;color:#0a0a0a;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(200,168,78,0.25)">
          ▶ Starta från vald tidpunkt
        </button>
      </div>` : ''}

      <div style="display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;margin-bottom:20px">
        <span style="font-size:11px;color:#8a8a80">✓ Följ fastan i realtid</span>
        <span style="font-size:11px;color:#8a8a80">✓ Se vad som händer i kroppen</span>
        <span style="font-size:11px;color:#8a8a80">✓ Logga måltider och träning</span>
      </div>
      <button onclick="state.showVariants=!state.showVariants;window.renderTimer()" style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;background:transparent;color:${state.showVariants ? '#c8a84e' : '#8a8a80'};border:1px solid ${state.showVariants ? 'rgba(200,168,78,0.22)' : '#2a2a2a'};cursor:pointer">
        📅 Testa ett fasta-schema <span style="font-size:10px">${state.showVariants ? '▲' : '▼'}</span>
      </button>
    </div>`;

    html += `<div class="program-controls"><button class="btn-end" id="choose-program">📋 Välj program</button>
      ${suggestion && state.selectedVariant ? '<button class="btn-end" id="program-suggestion">Dagens förslag</button>' : ''}</div>`;
    const goal = goalView();
    if (!program && goal.fastsPerWeek) html += `<p class="week-progress">Den här veckan: ${weekView().fasts} av ${goal.fastsPerWeek} fastor</p>`;

    // Schema picker
    if (state.showVariants) {
      html += `<div class="card fade"><div class="eyebrow" style="margin-bottom:12px">Välj schema</div>
        <div class="schema-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="variant-card${!sv?.h ? ' selected' : ''}" onclick="state.selectedVariant={l:'Löpande',h:null,tag:''};window.renderTimer()" style="grid-column:1/-1">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:14px;font-weight:700;color:#f5f5f0">∞ Löpande</span>
              <span style="font-size:9px;padding:2px 6px;border-radius:20px;background:${!sv?.h ? 'rgba(200,168,78,0.2)' : 'rgba(200,168,78,0.08)'};color:#c8a84e;font-weight:700">Standard</span>
              ${!sv?.h ? `<span style="margin-left:auto;font-size:12px;color:#c8a84e">✓ Vald</span>` : ''}
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
      <div style="font-size:20px;font-weight:800;color:#f5f5f0;letter-spacing:-.5px">${state.rolling ? 'Löpande fasta' : 'Schema: ' + (PRESETS.find(p => p.h === state.goalHours)?.l || esc(state.goalHours) + ' h')}</div>
      <div style="font-size:12px;color:#8a8a80;margin-top:2px">Startade ${fmtT(state.startTime)} · ${fmtD(state.startTime)}</div>
    </div>
    <div class="dual-time">
      <div class="time-box actual">
        <div class="time-box-label" style="color:#8a8a80">⏱ Faktisk fastetid</div>
        <div id="tick-actual" class="time-box-value" style="color:#f5f5f0">${T2}</div>
        <div class="time-box-phase" style="color:${phase.c}">${phase.i} ${phase.l}</div>
      </div>
      <div class="time-box metabolic">
        <div class="time-box-label" style="color:#c8a84e">⚡ Metabol effekt</div>
        <div id="tick-metabolic" class="time-box-value" style="color:#c8a84e">~${fmtClock(mElapsed)}</div>
        <div class="time-box-phase" style="color:${mPhase.c}">${mPhase.i} ${mPhase.l}</div>
        ${(() => {
          const note = metNote(elapsed, mElapsed);
          if (note) return `<div id="tick-met-note" style="font-size:9px;color:#c8a84e;margin-top:3px">${note}</div>`;
          if (!hasProfil) return `<div style="font-size:9px;color:#8a8a80;margin-top:3px">Fyll i profil för personlig beräkning</div>`;
          return '';
        })()}
      </div>
    </div>`;

    // Ring + controls
    html += `<div class="card" style="display:flex;flex-direction:column;align-items:center;margin-bottom:14px">
      ${activePause ? `<div class="pause-banner"><div><div style="font-size:12px;font-weight:700;color:#c8a84e">⏸ ${esc(activePause.desc)}</div><div id="tick-pause" style="font-size:11px;color:#8a8a80">Återupptas om ${fmtClock(pauseLeft)}</div></div><span>🍳</span></div>` : ''}
      <div class="ring-wrap">
        <svg width="200" height="200" style="transform:rotate(-90deg)">
          <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${rc}" stop-opacity=".6"/><stop offset="100%" stop-color="${rc}"/></linearGradient></defs>
          <circle cx="100" cy="100" r="${R}" fill="none" stroke="#2a2a2a" stroke-width="9"/>
          ${!state.rolling ? `<circle id="tick-ring-progress" cx="100" cy="100" r="${R}" fill="none" stroke="url(#rg)" stroke-width="9" stroke-dasharray="${C}" stroke-dashoffset="${strokeOffset}" stroke-linecap="round" style="transition:stroke-dashoffset .9s ease"/>`
          : `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${rc}" stroke-width="9" stroke-dasharray="16 9" stroke-linecap="round"/>`}
        </svg>
        <div class="ring-center">
          <span id="tick-ring-time" style="font-size:28px;font-weight:800;color:#f5f5f0;font-family:monospace;letter-spacing:2px">${T2}</span>
          ${state.meals.length || state.workouts.length ? `<span style="font-size:9px;color:#8a8a80">netto fastetid</span>` : ''}
          <span style="font-size:11px;font-weight:600;color:${activePause ? '#c8a84e' : phase.c}">${activePause ? '⏸ Paus' : phase.i + ' ' + phase.l}</span>
          ${!state.rolling && reached ? `<span style="font-size:11px;color:#c8a84e;font-weight:700">🎯 Mål nått!</span>` : !state.rolling && next && !activePause ? `<span id="tick-ring-next" style="font-size:10px;color:#8a8a80">nästa om ${fmtClock(tnext)}</span>` : ''}
          ${state.rolling ? `<span style="font-size:10px;color:#8a8a80">Löpande ∞</span>` : ''}
        </div>
      </div>
      ${state.meals.length || state.workouts.length ? `<div style="width:100%;margin-bottom:12px">
        ${state.meals.length ? `<div class="eyebrow">Måltider</div>${state.meals.map(m => `<div class="log-item"><span>🍳</span><div><div style="font-size:11px;font-weight:600;color:#f5f5f0">${esc(m.desc)}</div><div style="font-size:10px;color:#8a8a80">${fmtT(m.time)} · ${esc(m.kcal)} kcal · ${esc(m.pauseHours)}h paus</div></div></div>`).join('')}` : ''}
        ${state.workouts.length ? `<div class="eyebrow" style="margin-top:8px">Träningspass</div>${state.workouts.map(wo => `<div class="log-item"><span>${esc(wo.icon)}</span><div><div style="font-size:11px;font-weight:600;color:#f5f5f0">${esc(wo.type)}${wo.durationMins ? ` · ${esc(wo.durationMins)} min` : ''}</div><div style="font-size:10px;color:#8a8a80">${fmtT(wo.time)}${wo.kcal ? ` · ${esc(wo.kcal)} kcal` : ''}${wo.avgHr ? ` · ♥ ${esc(wo.avgHr)} bpm` : ''}</div></div></div>`).join('')}` : ''}
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
        const sp = state.fasting ? phaseFill(i, timeToUse) : 0;
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
              ${state.fasting ? `<div class="phase-bar"><div id="tick-phase-${i}" class="phase-bar-fill" style="width:${sp * 100}%;background:${hit ? p.c : '#2a2a2a'}"></div></div>` : ''}
            </div>
            <span style="font-size:9px;color:#8a8a80;margin-top:2px">${ex ? '▲' : '▼'}</span>
          </div>
          ${ex ? `<div class="phase-detail" style="border-left:1.5px solid ${p.c}50"><p style="font-size:12px;color:#b5b5aa;line-height:1.6;margin-bottom:6px">${p.d}</p><p style="font-size:11px;color:#8a8a80;line-height:1.7">${p.x}</p></div>` : ''}
        </div>`;
      }).join('')}
    </div>
  </div>`;

  document.getElementById('content').innerHTML = html;
  bindProgramCard(program);
  bindBackdate(sv);
  scheduleProgramDay();
}

// "Glömde starta?": max follows the clock (not the last render), and the
// chosen time is shown with how long ago it was, so a time that occurs
// twice when the clocks go back is visible before starting.
function bindBackdate(sv) {
  const toggle = document.getElementById('backdate-toggle');
  if (toggle) toggle.onclick = () => {
    state.showBackdate = !state.showBackdate;
    state.backdateValue = state.showBackdate ? defaultBackdate() : '';
    renderTimer();
  };
  const input = document.getElementById('backdate-input');
  if (!input) return;
  const err = document.getElementById('backdate-err');
  const preview = document.getElementById('backdate-preview');
  const setMax = () => { input.max = toLocalDateTimeStr(Date.now() - 60000); };
  const show = () => {
    err.style.display = 'none';
    const r = checkBackdate(input.value);
    preview.textContent = r.t ? `Startar ${fmtD(r.t)} ${fmtT(r.t)} · för ${fmtHuman(Date.now() - r.t)} sedan` : '';
    return r;
  };
  setMax();
  show();
  input.onfocus = setMax;
  input.oninput = () => { state.backdateValue = input.value; show(); };
  document.getElementById('backdate-start').onclick = () => {
    setMax();
    const r = show();
    if (r.err) { err.textContent = r.err; err.style.display = 'block'; return; }
    window.startFast(sv?.h || null, !sv?.h, r.t);
  };
}


function programCard(p) {
  if (!p) return '';
  const definition = PROGRAMS[p.programId];
  return `<section class="card program-card" aria-label="Ditt program">
    <div class="program-heading"><h2>${definition.name}</h2><button class="btn-icon" id="program-menu" aria-label="Programval" aria-expanded="false">⋯</button></div>
    ${p.complete ? '<p>Programmet är klart</p><div class="program-controls"><button class="btn-gold" id="new-program">Välj nytt program</button><button class="btn-end" id="close-program">Stäng</button></div>' :
      `<p>Dag ${p.day} av ${p.days} · Vecka ${p.week}${p.paused ? ' · Pausat' : ''}</p>
       <p>Fasta ${p.hours} timmar${p.programId === 'vana168' ? ` · ${weekView().days16} av 5 dagar den här veckan` : ''}</p>
       ${p.programId === 'tidigt' ? `<p>${definition.plan}</p>` : ''}
       ${p.paused ? '<div class="program-controls"><button class="btn-gold" id="resume-program">Fortsätt programmet</button></div>' : ''}`}
    <div id="program-options" class="program-controls" hidden>
      ${!p.complete ? `<button class="btn-end" id="pause-program">${p.paused ? 'Fortsätt programmet' : 'Pausa programmet'}</button>` : ''}
      <button class="btn-end" id="change-program">Byt program</button><button class="btn-end" id="end-program">Avsluta programmet</button>
    </div></section>`;
}

function bindProgramCard(p) {
  const on = (id, callback) => { const b = document.getElementById(id); if (b) b.onclick = callback; };
  on('choose-program', openProgramPicker);
  on('new-program', openProgramPicker);
  on('change-program', openProgramPicker);
  on('program-suggestion', () => { state.selectedVariant = null; renderTimer(); });
  on('program-menu', () => {
    const options = document.getElementById('program-options');
    options.hidden = !options.hidden;
    document.getElementById('program-menu').setAttribute('aria-expanded', String(!options.hidden));
  });
  on('pause-program', () => {
    (p.paused ? resumeProgram : pauseProgram)(p.revision);
    renderTimer();
  });
  on('resume-program', () => { resumeProgram(p.revision); renderTimer(); });
  on('close-program', () => { endProgram(p.revision); renderTimer(); });
  on('end-program', () => confirmModal('Avsluta programmet?', '', 'Programmet avslutas. Dina sparade fastor finns kvar.', 'Avbryt', 'Avsluta programmet', () => {
    endProgram(p.revision); renderTimer();
  }));
}

// Update calendar-based suggestions at midnight, including an idle timer.
let programDayTimer;
function scheduleProgramDay() {
  clearTimeout(programDayTimer);
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  programDayTimer = setTimeout(() => {
    if (state.view === 'timer') renderTimer();
  }, Math.max(1000, midnight.getTime() - Date.now() + 50));
}
