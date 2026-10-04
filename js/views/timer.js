// ── FASTA — js/views/timer.js ──
// Timer view: start screen, active fasting, phase timeline
// tickTimer() updates only dynamic values (no DOM rebuild = no flicker)

import { applyFastenivaColors, fastenivaBarHTML, updateFastenivaBar, fastenivaGraphHTML, bindFastegraf, updateFastegraf } from './fasteniva.js';
import { PH, PRESETS, PROGRAMS, LONG_FAST_TEXT, FEATURES, FASTENIVA_TEXT } from '../data.js';
import { state, profile, profileComplete, programView, goalView, weekView, checkinView } from '../state.js';
import { fmtClock, fmtT, fmtD, getPhase, getNext, calcElapsed, calcMetabolicElapsed, calcMetabolicMultiplier, calcWorkoutBonusMs, getActivePause, toLocalDateTimeStr, esc, fmtHuman, fmtPause, defaultBackdate, checkBackdate } from '../helpers.js';

import { startFast, pauseProgram, resumeProgram, endProgram } from '../actions.js';
import { openProgramPicker, confirmModal, openCheckinModal, openLongFastModal, openFastenivaGraph, openFastenivaSafety, openMealModal, recentMealWorkout } from '../modals.js';
import { dayKey } from '../checkin.js';

// Track state to detect when a full re-render is needed
let _lastPhaseIdx = -1;
let _lastMealCount = 0;
let _lastWorkoutCount = 0;
let _lastExpandedPhase = undefined;
let _lastMPhaseIdx = -1;
let _lastPaused = false;

let acknowledgedLongFast = null;

export function requestFastStart(hours, rolling, startTime) {
  const start = () => startFast(hours, rolling, startTime);
  if (!rolling && [36, 48, 72].includes(hours)) openLongFastModal(start);
  else start();
}

export function longFastReminderDue(elapsed) {
  if (!state.fasting || !state.rolling || elapsed < 24 * 3600000) return false;
  if (acknowledgedLongFast === state.startTime) return false;
  try { return localStorage.getItem('fasta-langfasta') !== String(state.startTime); }
  catch { return true; }
}

function updateLongFastReminder(elapsed) {
  const slot = document.getElementById('long-fast-reminder');
  if (!slot) return;
  const due = longFastReminderDue(elapsed);
  slot.hidden = !due;
  if (!due || slot.childElementCount) return;
  slot.innerHTML = `<div class="long-fast-reminder-copy" role="status"><p>${esc(LONG_FAST_TEXT.day)}</p>
    ${Object.values(profile.health || {}).some(value => value === true) ? `<p>${esc(LONG_FAST_TEXT.profile)}</p>` : ''}</div>
    <button class="btn-secondary" type="button">OK</button>`;
  const fastStart = state.startTime;
  slot.querySelector('button').addEventListener('click', () => {
    acknowledgedLongFast = fastStart;
    try { localStorage.setItem('fasta-langfasta', String(fastStart)); } catch { /* Keep the answer for this page lifetime. */ }
    slot.hidden = true;
  });
}

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
  if ((!FEATURES.fastenivaa && (PH.indexOf(getPhase(elh)) !== _lastPhaseIdx ||
      PH.indexOf(getPhase(mElapsed / 3600000)) !== _lastMPhaseIdx)) ||
      !!activePause !== _lastPaused ||
      state.meals.length !== _lastMealCount ||
      state.workouts.length !== _lastWorkoutCount ||
      state.expandedPhase !== _lastExpandedPhase) {
    renderTimer();
    return;
  }

  updateLongFastReminder(elapsed);
  if (FEATURES.fastenivaa) {
    updateFastegraf(document.querySelector('.fastegraf-hero'), { start: state.startTime, meals: state.meals, workouts: state.workouts, profile }, state.now);
    updateFastenivaBar({ start: state.startTime, meals: state.meals, workouts: state.workouts, profile }, state.now);
    openFastenivaSafety();
    updateMealPlanning();
    _txt('tick-actual-phase', `${getPhase(elh).i} ${getPhase(elh).l}`);
    _txt('tick-metabolic-phase', `${getPhase(mElapsed / 3600000).i} ${getPhase(mElapsed / 3600000).l}`);
    document.querySelectorAll('.timer-phase .phase-row').forEach((row, i) => {
      row.classList.toggle('is-hit', mElapsed / 3600000 >= PH[i].h);
      row.classList.toggle('is-current', getPhase(mElapsed / 3600000) === PH[i]);
      row.querySelector('.timer-current-label')?.remove();
      if (getPhase(mElapsed / 3600000) === PH[i]) {
        const label = document.createElement('span'); label.className = 'timer-current-label'; label.textContent = 'NU';
        row.querySelector('.timer-phase-heading').append(label);
      }
    });
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
    if (bar) bar.setAttribute('width', phaseFill(i, timeToUse) * 100);
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
  applyFastenivaColors();
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
  const strokeOffset = C * (1 - (state.fasting && !state.rolling ? prog : 0));
  const program = programView();
  const suggestion = program && !program.paused && !program.complete ? program.hours : null;
  const sv = state.selectedVariant || (suggestion ? { h: suggestion, l: `${suggestion} h`, tag: 'Dagens förslag' } : null);
  const hasProfil = profileComplete();
  const checkin = checkinView(dayKey(Date.now()));
  const checkinCard = `<section class="card checkin-card" aria-labelledby="checkin-title">
    <h2 id="checkin-title">Dagens check-in</h2>
    ${checkin ? `<p>Energi ${checkin.energy ?? '–'} · Hunger ${checkin.hunger ?? '–'} · Sömn ${checkin.sleep ?? '–'}</p>` : ''}
    <button id="open-checkin" class="btn-secondary">${checkin ? 'Ändra' : 'Gör dagens check-in'}</button>
  </section>`;
  let html = state.fasting && FEATURES.fastenivaa ? '' : programCard(program);

  // Update tracking state
  _lastPhaseIdx = PH.indexOf(getPhase(elh));
  _lastMPhaseIdx = PH.indexOf(mPhase);
  _lastPaused = !!activePause;
  _lastMealCount = state.meals.length;
  _lastWorkoutCount = state.workouts.length;
  _lastExpandedPhase = state.expandedPhase;

  // ── Not fasting: start screen ──
  if (!state.fasting) {
    html += `<div class="timer-start">
      <div class="timer-ready-badge"><span class="timer-ready-dot"></span>Redo att fasta</div>
      <div class="timer-start-title">Starta din fasta nu</div>
      <div class="timer-start-description">${sv?.h ? `Schema valt: <strong class="timer-gold">${sv.l} · ${sv.tag}</strong>` : 'Löpande fasta — ingen tidsgräns.<br/>Pågår tills du väljer att avsluta.'}</div>
      ${!hasProfil ? `<div class="timer-profile-hint">💡 Fyll i din <button data-action="view" data-arg="profil" class="timer-profile-link">Profil</button> för att se din personliga metabola effekt.</div>` : ''}
      <button id="timer-start" class="timer-start-button">${sv?.h ? `▶ Starta ${sv.l} fasta` : '▶ Starta löpande fasta'}</button>

      <button id="backdate-toggle" class="timer-choice" aria-expanded="${state.showBackdate}">
        🕐 Glömde starta? Ange starttid bakåt ${state.showBackdate ? '▲' : '▼'}
      </button>

      ${state.showBackdate ? `<div class="card fade timer-backdate-card">
        <div class="eyebrow timer-backdate-label">Ange när du slutade äta</div>
        <p class="timer-backdate-help">Åt du middag kl 19 men glömde starta? Välj tidpunkten så räknar appen rätt från då.</p>
        <input type="datetime-local" id="backdate-input" value="${esc(state.backdateValue)}" aria-label="Starttid" aria-describedby="backdate-err backdate-preview"
         class="timer-backdate-input"/>
        <p id="backdate-preview" aria-live="polite" class="timer-backdate-preview"></p>
        <div id="backdate-err" class="form-err timer-backdate-error" role="alert" hidden></div>
        <button id="backdate-start" class="timer-backdate-submit">
          ▶ Starta från vald tidpunkt
        </button>
      </div>` : ''}

      <div class="timer-features">
        <span class="timer-helper">✓ Följ fastan i realtid</span>
        <span class="timer-helper">✓ Se vad som händer i kroppen</span>
        <span class="timer-helper">✓ Logga måltider och träning</span>
      </div>
      <button id="variants-toggle" class="timer-choice" aria-expanded="${state.showVariants}">
        📅 Testa ett fasta-schema <span class="timer-chevron">${state.showVariants ? '▲' : '▼'}</span>
      </button>
    </div>`;

    html += `<div class="program-controls"><button class="timer-choice" id="choose-program">📋 Välj program</button>
      ${suggestion && state.selectedVariant ? '<button class="btn-end" id="program-suggestion">Dagens förslag</button>' : ''}</div>`;
    const goal = goalView();
    if (!program && goal.fastsPerWeek) html += `<p class="week-progress">Den här veckan: ${weekView().fasts} av ${goal.fastsPerWeek} fastor</p>`;

    // Schema picker
    if (state.showVariants) {
      html += `<div class="card fade"><div class="eyebrow timer-schema-label">Välj schema</div>
        <div class="schema-grid timer-schema-grid">
          <div class="variant-card${!sv?.h ? ' selected' : ''} timer-schema-rolling" role="button" tabindex="0" data-variant="" aria-pressed="${!sv?.h}">
            <div class="timer-schema-heading">
              <span class="timer-schema-title">∞ Löpande</span>
              <span class="timer-badge">Standard</span>
              ${!sv?.h ? `<span class="timer-schema-selected">✓ Vald</span>` : ''}
            </div>
            <div class="timer-schema-description">Ingen tidsgräns — pågår tills du väljer att avsluta.</div>
          </div>
          ${PRESETS.filter(p => p.h !== null).map(p => {
            const sel = sv && sv.l === p.l;
            return `<div class="variant-card${sel ? ' selected' : ''}" role="button" tabindex="0" data-variant="${p.h}" aria-pressed="${!!sel}">
            <div class="timer-schema-heading">
              <span class="timer-schema-title">${p.l}</span>
              <span class="timer-badge">${p.tag}</span>
              ${sel ? `<span class="timer-schema-selected">✓</span>` : ''}
            </div>
            <div class="timer-schema-benefits">${p.b.map(b => '✓ ' + b).join('<br>')}</div>
            <div class="timer-schema-note">${p.p}</div>
          </div>`;
          }).join('')}
        </div>
      </div>`;
    }

  // ── Active fasting ──
  } else {
    html += `<div class="timer-heading-wrap">
      <div class="timer-heading">${state.rolling ? 'Löpande fasta' : 'Schema: ' + (PRESETS.find(p => p.h === state.goalHours)?.l || esc(state.goalHours) + ' h')}</div>
      <div class="timer-started">Startade ${fmtT(state.startTime)} · ${fmtD(state.startTime)}</div>
    </div>
`;

    if (FEATURES.fastenivaa) html += fastenivaGraphHTML({ start: state.startTime, meals: state.meals, workouts: state.workouts, profile }, state.startTime, state.now, state.now, true);
    // Ring + controls
    html += `<div class="card timer-active-card">
      ${activePause ? `<div class="pause-banner"><div><div class="timer-pause-title">⏸ ${esc(activePause.desc)}</div><div id="tick-pause" class="timer-helper">Återupptas om ${fmtClock(pauseLeft)}</div></div><span>🍳</span></div>` : ''}
      <div class="ring-wrap${FEATURES.fastenivaa ? ' timer-ring-fallback-hidden' : ''}">
        <svg viewBox="0 0 200 200" class="timer-ring-svg" aria-hidden="true">
          <circle cx="100" cy="100" r="${R}" fill="none" class="timer-ring-track" stroke-width="9"/>
          ${!state.rolling ? `<circle id="tick-ring-progress" cx="100" cy="100" r="${R}" fill="none" class="timer-ring-progress" stroke-width="9" stroke-dasharray="${C}" stroke-dashoffset="${strokeOffset}" stroke-linecap="round" />`
          : `<circle cx="100" cy="100" r="${R}" fill="none" class="timer-ring-progress" stroke-width="9" stroke-dasharray="16 9" stroke-linecap="round"/>`}
        </svg>
        <div class="ring-center">
          <span id="tick-ring-time" class="num timer-clock">${T2}</span>
          ${state.meals.length || state.workouts.length ? `<span class="timer-net-time">netto fastetid</span>` : ''}
          <span class="timer-phase-caption">${activePause ? '⏸ Paus' : phase.i + ' ' + phase.l}</span>
          ${!state.rolling && reached ? `<span class="timer-goal-reached">🎯 Mål nått!</span>` : !state.rolling && next && !activePause ? `<span id="tick-ring-next" class="timer-small">nästa om ${fmtClock(tnext)}</span>` : ''}
          ${state.rolling ? `<span class="timer-small">Löpande ∞</span>` : ''}
        </div>
      </div>
      ${FEATURES.fastenivaa ? '' : fastenivaBarHTML()}
      ${FEATURES.fastenivaa ? `<div class="fasteniva-planning"><p id="fasteniva-training" class="fasteniva-note" hidden>${esc(FASTENIVA_TEXT.traning)}</p><button type="button" id="plan-meal" class="fasteniva-plan-button">Planera måltid</button></div>` : ''}
      <section id="long-fast-reminder" class="long-fast-reminder" aria-label="Påminnelse vid längre fasta" hidden></section>
    <div class="dual-time${FEATURES.fastenivaa ? ' timer-compact-time' : ''}">
      <div class="time-box actual">
        <div class="time-box-label timer-subtle">⏱ Faktisk fastetid</div>
        <div id="tick-actual" class="time-box-value timer-text">${T2}</div>
        <div id="tick-actual-phase" class="time-box-phase timer-phase-caption">${phase.i} ${phase.l}</div>
      </div>
      <div class="time-box metabolic">
        <div class="time-box-label timer-gold">⚡ Metabol effekt</div>
        <div id="tick-metabolic" class="time-box-value timer-gold">~${fmtClock(mElapsed)}</div>
        <div id="tick-metabolic-phase" class="time-box-phase timer-phase-caption">${mPhase.i} ${mPhase.l}</div>
        ${(() => {
          const note = metNote(elapsed, mElapsed);
          if (note) return `<div id="tick-met-note" class="timer-met-note">${note}</div>`;
          if (!hasProfil) return `<div class="timer-profile-note">Fyll i profil för personlig beräkning</div>`;
          return '';
        })()}
      </div>
    </div>
      ${state.meals.length || state.workouts.length ? `<div class="timer-logs">
        ${state.meals.length ? `<div class="eyebrow">Måltider</div>${state.meals.map(m => `<div class="log-item"><span>🍳</span><div><div class="timer-log-title">${esc(m.desc)}</div><div class="timer-small">${fmtT(m.time)} · ${esc(m.kcal)} kcal · ${fmtPause(m.pauseHours)} paus</div></div></div>`).join('')}` : ''}
        ${state.workouts.length ? `<div class="eyebrow timer-workout-label">Träningspass</div>${state.workouts.map(wo => `<div class="log-item"><span>${esc(wo.icon)}</span><div><div class="timer-log-title">${esc(wo.type)}${wo.durationMins ? ` · ${esc(wo.durationMins)} min` : ''}</div><div class="timer-small">${fmtT(wo.time)}${wo.kcal ? ` · ${esc(wo.kcal)} kcal` : ''}${wo.avgHr ? ` · ♥ ${esc(wo.avgHr)} bpm` : ''}</div></div></div>`).join('')}` : ''}
      </div>` : ''}
      <div class="timer-actions">
        <button class="btn-secondary timer-end" data-action="endFast">⏹ Avsluta fasta</button>
        ${activePause ? `<button class="btn-secondary timer-end" data-action="endPause">▶ Avsluta paus</button>`
          : `<button class="btn-secondary" data-action="meal" title="Logga måltid" aria-label="Logga måltid">Måltid</button>`}
        <button class="btn-secondary" data-action="workout" title="Logga träning" aria-label="Logga träning">Träning</button>
      </div>
    </div>`;
    html += checkinCard;
    if (FEATURES.fastenivaa) html += programCard(program);
  }

  // ── Phase timeline ──
  html += `<div class="card"><div class="eyebrow">Kroppens faser${hasProfil && state.fasting ? ' (metabol tid)' : ''}</div>
    <div class="timer-timeline">
      <div class="timer-timeline-line"></div>
      ${PH.map((p, i) => {
        const last = i === PH.length - 1;
        const timeToUse = hasProfil && state.fasting ? mElh : elh;
        const hit = state.fasting && timeToUse >= p.h;
        const act = state.fasting && timeToUse >= p.h && (last || timeToUse < PH[i + 1].h);
        const ex = state.expandedPhase === i;
        const sp = state.fasting ? phaseFill(i, timeToUse) : 0;
        return `<div class="timer-phase phase-${i}">
          <div class="phase-row${hit ? ' is-hit' : ''}${act ? ' is-current' : ''}" role="button" tabindex="0" data-phase="${i}" aria-expanded="${ex}">
            <div class="phase-dot"></div>
            <span class="timer-phase-icon">${p.i}</span>
            <div class="timer-flex">
              <div class="timer-phase-heading">
                <span class="timer-phase-name">${p.l}${FEATURES.fastenivaa ? `<small class="fasteniva-phase-number">Fas ${i + 1} av ${PH.length}</small>` : ''}</span>
                ${act ? `<span class="timer-current-label">NU</span>` : ''}
                <span class="timer-phase-hour">${p.h === 0 ? '0h' : p.h + 'h'}</span>
              </div>
              ${state.fasting ? `<svg class="timer-phase-progress" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true"><rect id="tick-phase-${i}" width="${sp * 100}" height="2"/></svg>` : ''}
            </div>
            <span class="timer-phase-toggle">${ex ? '▲' : '▼'}</span>
          </div>
          ${ex ? `<div class="phase-detail"><p class="timer-phase-description">${p.d}</p><p class="timer-phase-explanation">${p.x}</p></div>` : ''}
        </div>`;
      }).join('')}
    </div>
  </div>`;

  document.getElementById('content').innerHTML = html;
  document.getElementById('timer-start')?.addEventListener('click', () => requestFastStart(sv?.h || null, !sv?.h));
  updateLongFastReminder(elapsed);
  if (FEATURES.fastenivaa && state.fasting) {
    const fast = { start: state.startTime, meals: state.meals, workouts: state.workouts, profile };
    bindFastegraf(document.querySelector('.fastegraf-hero'), fast, state.startTime, state.now, state.now, true);
    updateFastenivaBar(fast, state.now, true);
    document.getElementById('fasteniva-open')?.addEventListener('click', () => openFastenivaGraph());
    document.getElementById('plan-meal')?.addEventListener('click', () => openMealModal(true));
    updateMealPlanning();
    openFastenivaSafety();
  }
  document.getElementById('open-checkin')?.addEventListener('click', openCheckinModal);
  bindTimerChoices();
  bindProgramCard(program);
  bindBackdate(sv);
  scheduleProgramDay();
}

function updateMealPlanning() {
  const note = document.getElementById('fasteniva-training');
  if (note) note.hidden = !recentMealWorkout(state.workouts, state.now);
}

// Keep focus on a choice when its selection rebuilds the view.
function bindTimerChoices() {
  const bind = (selector, change) => {
    document.querySelectorAll(selector).forEach(control => {
      control.addEventListener('click', () => {
        const variant = control.dataset.variant;
        const phase = control.dataset.phase;
        change(control);
        renderTimer();
        const target = variant !== undefined ? `[data-variant="${variant}"]`
          : phase !== undefined ? `[data-phase="${phase}"]` : selector;
        document.querySelector(target)?.focus({ preventScroll: true });
      });
      if (control.getAttribute('role') === 'button') control.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); control.click(); }
      });
    });
  };
  bind('#variants-toggle', () => { state.showVariants = !state.showVariants; });
  bind('[data-variant]', control => {
    const preset = PRESETS.find(p => p.h === Number(control.dataset.variant));
    state.selectedVariant = !preset ? { l: 'Löpande', h: null, tag: '' }
      : state.selectedVariant?.l === preset.l ? null : { l: preset.l, h: preset.h, tag: preset.tag };
  });
  bind('[data-phase]', control => {
    const index = Number(control.dataset.phase);
    state.expandedPhase = state.expandedPhase === index ? null : index;
  });
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
    document.getElementById('backdate-toggle')?.focus({ preventScroll: true });
  };
  const input = document.getElementById('backdate-input');
  if (!input) return;
  const err = document.getElementById('backdate-err');
  const preview = document.getElementById('backdate-preview');
  const setMax = () => { input.max = toLocalDateTimeStr(Date.now() - 60000); };
  const show = () => {
    err.hidden = true;
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
    if (r.err) { err.textContent = r.err; err.hidden = false; return; }
    requestFastStart(sv?.h || null, !sv?.h, r.t);
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
