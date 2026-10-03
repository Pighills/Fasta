// ── FASTA — js/modals.js ──
// Modal dialogs for cards, history details, meal logging, workout logging

import { LC, MEALS_PRE, WORKOUT_TYPES, ACTIVITY_LABELS, BENEFITS, PROGRAMS, PROGRAM_INTRO, CHECKIN_TEXT, CHECKIN_SYMPTOMS, WEIGHING_LABELS, LONG_FAST_TEXT } from './data.js';
import { state, programView, profile, snapshot, checkinView, SaveRefused } from './state.js';
import { fmtClock, fmtT, fmtD, fmtHuman, getPhase, getBenefits, glycogenShare, workoutBonusHours, calcElapsed, calcMetabolicElapsed, getActivePause, fmtPause, esc } from './helpers.js';
import { addMeal, addWorkout, startProgram, saveDailyCheckin, deleteDailyCheckin, setWeighing } from './actions.js';
import { render, showNotice } from './ui.js';
import { LIMITS, MAX_MET_FACTOR, isObj, cleanProfile, pauseAt } from './migrations.js';
import { dayKey, checkinMap, weighingFor } from './checkin.js';

export function openCheckinModal() {
  const day = dayKey(Date.now());
  const expected = checkinView(day);
  const draft = { energy: null, hunger: null, sleep: null, weight: null, symptoms: [], ...expected };
  let weighing = weighingFor(profile);
  let revealed = false;
  const first = checkinMap(snapshot().events).size === 0;
  const el = openModal(`<div class="modal-box checkin-modal" aria-label="Dagens check-in">
    <div class="modal-header program-heading"><h2>Dagens check-in</h2><button class="modal-close" aria-label="Stäng">✕</button></div>
    <form class="modal-body" novalidate>
      ${first ? `<p>${esc(CHECKIN_TEXT.intro)}</p>` : ''}
      ${Object.entries({ energy: 'Energi', hunger: 'Hunger', sleep: 'Sömn' }).map(([key, label]) => `<fieldset class="checkin-scale"><legend>${label}</legend>
        <div class="checkin-scale-buttons">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-scale="${key}" data-value="${n}" aria-label="${label} ${n}" aria-pressed="${draft[key] === n}">${n}</button>`).join('')}</div>
        <div class="checkin-scale-ends"><span>${key === 'sleep' ? 'Dålig' : 'Låg'}</span><span>${key === 'sleep' ? 'Bra' : 'Hög'}</span></div>
        ${key === 'hunger' ? `<p>${esc(CHECKIN_TEXT.hunger)}</p>` : ''}</fieldset>`).join('')}
      <p>Tryck på ett valt värde igen för att lämna skalan tom.</p>
      <label for="checkin-weighing">Hur ofta vill du väga dig?</label>
      <select id="checkin-weighing" class="profile-input" aria-describedby="checkin-weighing-help">${Object.entries(WEIGHING_LABELS).map(([key, label]) => `<option value="${key}" ${weighing === key ? 'selected' : ''}>${label}</option>`).join('')}</select>
      <p id="checkin-weighing-help">${esc(CHECKIN_TEXT.vagning)}<br><span class="health-src">Källa: ${esc(CHECKIN_TEXT.vagningSrc)}</span></p>
      <p>Vägningsvalet sparas direkt.</p>
      <button type="button" id="checkin-add-weight" class="checkin-secondary">Lägg till vikt</button>
      <div id="checkin-weight-section">
        <label for="checkin-weight">Vikt (valfritt), kg</label>
        <input id="checkin-weight" class="profile-input" type="number" inputmode="decimal" min="${LIMITS.weight[0]}" max="${LIMITS.weight[1]}" step="any" value="${draft.weight ?? ''}" aria-describedby="checkin-weight-help checkin-error">
        <p id="checkin-weight-help">${esc(CHECKIN_TEXT.vikt)}<br><span class="health-src">Källa: ${esc(CHECKIN_TEXT.viktSrc)}</span></p>
      </div>
      <fieldset class="checkin-symptoms"><legend>Besvär</legend>${Object.entries(CHECKIN_SYMPTOMS).map(([key, label]) => `<label><input type="checkbox" value="${key}" ${draft.symptoms.includes(key) ? 'checked' : ''}>${label}</label>${key === 'yrsel' ? `<p id="checkin-dizzy" role="status" ${draft.symptoms.includes('yrsel') ? '' : 'hidden'}>${esc(CHECKIN_TEXT.besvarYrsel)}</p>` : ''}`).join('')}</fieldset>
      <div id="checkin-error" class="form-err" role="alert" hidden tabindex="-1"></div>
      <button class="btn-gold" type="submit">Spara</button>
      ${expected ? '<button class="checkin-secondary" type="button" id="checkin-delete">Radera dagens check-in</button>' : ''}
      <div id="checkin-confirm" hidden><p>Radera dagens check-in? Dagens värden tas bort. Det går inte att ångra.</p><button type="button" class="checkin-secondary" id="checkin-cancel">Avbryt</button><button type="button" class="checkin-secondary" id="checkin-confirm-delete">Radera</button></div>
    </form></div>`);
  const form = el.querySelector('form');
  const weight = el.querySelector('#checkin-weight');
  const weightSection = el.querySelector('#checkin-weight-section');
  const revealButton = el.querySelector('#checkin-add-weight');
  const error = message => {
    showErr(el, message);
    el.querySelector('.form-err').focus();
  };
  const attempt = action => {
    try { action(); } catch (e) {
      if (e instanceof SaveRefused) {
        error('Uppgifterna har ändrats eller kan inte sparas. Stäng rutan och försök igen.');
        throw e; // Existing app handler reloads the latest data and explains the refusal.
      }
      error(e.message);
    }
  };
  const updateWeight = () => {
    const visible = weighing !== 'never' && (weighing === 'daily' || new Date().getDay() === 1 || draft.weight !== null || revealed);
    weightSection.hidden = !visible;
    revealButton.hidden = weighing !== 'weekly' || visible;
  };
  updateWeight();
  el.querySelectorAll('[data-scale]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.scale, value = Number(button.dataset.value);
    draft[key] = draft[key] === value ? null : value;
    el.querySelectorAll(`[data-scale="${key}"]`).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.value) === draft[key])));
  }));
  el.querySelector('#checkin-weighing').addEventListener('change', event => attempt(() => {
    setWeighing(event.target.value, weighing);
    weighing = event.target.value;
    updateWeight();
  }));
  revealButton.addEventListener('click', () => { revealed = true; updateWeight(); weight.focus(); });
  el.querySelector('input[value="yrsel"]').addEventListener('change', event => {
    el.querySelector('#checkin-dizzy').hidden = !event.target.checked;
  });
  const finish = () => { el.remove(); render(); document.getElementById('open-checkin')?.focus(); };
  form.addEventListener('submit', event => {
    event.preventDefault();
    attempt(() => {
      let nextWeight = draft.weight; // Hiding weight never erases an existing weighing.
      if (!weightSection.hidden) {
        const value = weight.value.trim();
        nextWeight = value === '' ? null : Number(value);
        if (weight.validity.badInput || (nextWeight !== null && (!Number.isFinite(nextWeight) || nextWeight < LIMITS.weight[0] || nextWeight > LIMITS.weight[1]))) {
          return error(`Ange en vikt mellan ${LIMITS.weight[0]} och ${LIMITS.weight[1]} kg.`);
        }
      }
      saveDailyCheckin(day, { ...draft, weight: nextWeight, symptoms: [...el.querySelectorAll('.checkin-symptoms input:checked')].map(input => input.value) }, expected);
      finish();
    });
  });
  el.querySelector('#checkin-delete')?.addEventListener('click', () => {
    el.querySelector('#checkin-confirm').hidden = false;
    el.querySelector('#checkin-cancel').focus();
  });
  el.querySelector('#checkin-cancel').addEventListener('click', () => {
    el.querySelector('#checkin-confirm').hidden = true;
    el.querySelector('#checkin-delete')?.focus();
  });
  el.querySelector('#checkin-confirm-delete').addEventListener('click', () => attempt(() => {
    deleteDailyCheckin(day, expected); finish();
  }));
}

// ── Generic modal ──

export function openModal(html, { dismissible = true } = {}) {
  const opener = document.activeElement;
  const el = document.createElement('div');
  el.className = 'modal-backdrop';
  el.innerHTML = html;
  const dialog = el.querySelector('.modal-box');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  if (!dialog.hasAttribute('aria-label')) {
    const header = dialog.querySelector('.modal-header') || dialog.firstElementChild;
    dialog.setAttribute('aria-label', header.textContent.replace('✕', '').trim());
  }
  dialog.tabIndex = -1;
  const focusable = () => [...dialog.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')]
    .filter(node => !node.disabled && node.getClientRects().length);
  el.addEventListener('click', e => { if (dismissible && e.target === el) el.remove(); });
  el.querySelectorAll('.modal-close').forEach(button => button.addEventListener('click', () => { if (dismissible) el.remove(); }));
  const onKey = e => {
    if ([...document.querySelectorAll('.modal-backdrop')].at(-1) !== el) return;
    if (e.key === 'Escape') { e.preventDefault(); if (dismissible) el.remove(); }
    if (e.key === 'Tab') {
      const controls = focusable(), first = controls[0], last = controls.at(-1);
      if (!first) { e.preventDefault(); dialog.focus(); }
      else if (!dialog.contains(document.activeElement) || document.activeElement === dialog
        || (e.shiftKey ? document.activeElement === first : document.activeElement === last)) {
        e.preventDefault(); (e.shiftKey ? last : first).focus();
      }
    }
  };
  document.addEventListener('keydown', onKey);
  const remove = el.remove.bind(el);
  el.remove = () => {
    document.removeEventListener('keydown', onKey);
    remove();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  };
  document.body.appendChild(el);
  (focusable()[0] || dialog).focus();
  return el;
}

export function openLongFastModal(onStart) {
  if (document.querySelector('.long-fast-modal')) return;
  const health = Object.values(profile.health || {}).some(value => value === true);
  const el = openModal(`<div class="modal-box long-fast-modal" aria-label="${esc(LONG_FAST_TEXT.title)}" aria-describedby="long-fast-copy">
    <div class="modal-header"><h2 class="modal-title">${esc(LONG_FAST_TEXT.title)}</h2></div>
    <div class="modal-body" id="long-fast-copy">
      <p>${esc(LONG_FAST_TEXT.before)}</p>
      ${health ? `<p>${esc(LONG_FAST_TEXT.profile)}</p>` : ''}
      <div class="modal-actions">
        <button class="btn-gold" type="button" id="long-fast-start">Starta fastan</button>
        <button class="btn-secondary" type="button" id="long-fast-cancel">Avbryt</button>
      </div>
    </div></div>`);
  el.querySelector('#long-fast-cancel').addEventListener('click', () => el.remove());
  el.querySelector('#long-fast-start').addEventListener('click', () => { el.remove(); onStart(); });
}

export function openFriskrivning() {
  try { if (localStorage.getItem('fasta-friskrivning')) return; } catch { /* Show it when storage is unavailable. */ }
  if (document.querySelector('.friskrivning-modal')) return;
  const el = openModal(`<div class="modal-box friskrivning-modal" aria-label="Om FASTA" aria-describedby="friskrivning-text">
    <div class="modal-header"><h2>Om FASTA</h2></div>
    <div class="modal-body">
      <p id="friskrivning-text">FASTA är ett hjälpmedel för att hålla koll på dina fastor. Appen är inte en medicinteknisk produkt och ställer inga diagnoser. Den behandlar, botar eller förebygger inte sjukdom. Tider, faser och värden i appen är uppskattningar, inte mätningar. Har du en sjukdom, tar läkemedel, är gravid eller ammar, har eller har haft en ätstörning eller är under 18 år – prata med vården innan du fastar. Avbryt fastan och sök vård om du mår dåligt.</p>
      <a class="legal-link" href="integritet.html">Integritet och villkor</a>
      <button class="btn-gold" type="button">Jag förstår</button>
    </div></div>`, { dismissible: false });
  const button = el.querySelector('button');
  button.addEventListener('click', () => {
    try { localStorage.setItem('fasta-friskrivning', new Date().toISOString()); }
    catch { showNotice('Det gick inte att spara ditt svar. Rutan visas igen nästa gång du öppnar appen.'); }
    el.remove();
  });
  button.focus();
}

// Read a number field. Returns the number, or null and shows msg if it is
// outside [lo, hi]. An empty field gives empty (when allowed).
function readNum(el, id, [lo, hi], msg, empty) {
  const v = el.querySelector(id).value.trim();
  if (v === '' && empty !== undefined) return empty;
  const n = Number(v);
  if (v === '' || !Number.isFinite(n) || n < lo || n > hi) return showErr(el, msg);
  return n;
}

function showErr(el, msg) {
  const box = el.querySelector('.form-err');
  box.textContent = msg;
  box.hidden = false;
  return null;
}

// Call fn with the data-i of the button clicked inside box
function onPick(box, fn) {
  box.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (b) {
      const index = b.dataset.i;
      fn(Number(index));
      box.querySelector(`[data-i="${index}"]`)?.focus({ preventScroll: true });
    }
  });
}

// ── Confirm dialog (red action button) ──

export function confirmModal(title, sub, text, cancel, ok, onOk) {
  const el = openModal(`<div class="modal-box confirm-modal">
    <div class="modal-header"><h2 class="modal-title">${title}</h2>
    <div class="modal-subtitle">${sub}</div></div>
    <div class="modal-body">
      <div class="confirm-copy">${text}</div>
      <div class="modal-actions">
        <button class="confirm-cancel modal-button">${cancel}</button>
        <button class="confirm-ok modal-button modal-danger">${ok}</button>
      </div>
    </div>
  </div>`);
  el.querySelector('.confirm-cancel').onclick = () => el.remove();
  el.querySelector('.confirm-ok').onclick = () => { el.remove(); onOk(); };
}

// ── Learn card modal ──

export function openProgramPicker() {
  const expected = programView()?.revision ?? null;
  const el = openModal(`<div class="modal-box program-picker" role="dialog" aria-modal="true" aria-label="Välj program">
    <div class="modal-header program-heading"><h2>Välj program</h2><button class="program-close" aria-label="Stäng">✕</button></div>
    <div class="modal-body"><p>${PROGRAM_INTRO}</p>
      ${Object.entries(PROGRAMS).map(([id, p]) => `<section class="program-card card">
        <button class="program-choice" data-program="${id}" aria-expanded="false">${p.name}</button>
        <p>${p.plan}</p><div data-program-detail="${id}" hidden><p>${p.description}</p>
        <div class="health-src">Källor: ${p.source}</div>
        <button class="btn-gold program-start" data-start-program="${id}">Starta programmet</button></div></section>`).join('')}
    </div></div>`);
  el.querySelector('.program-close').onclick = () => el.remove();
  el.querySelectorAll('[data-program]').forEach(button => {
    button.onclick = () => {
      el.querySelectorAll('[data-program]').forEach(b => b.setAttribute('aria-expanded', String(b === button)));
      el.querySelectorAll('[data-program-detail]').forEach(d => { d.hidden = d.dataset.programDetail !== button.dataset.program; });
    };
  });
  el.querySelectorAll('[data-start-program]').forEach(button => {
    button.onclick = () => {
      el.remove();
      const start = () => { startProgram(button.dataset.startProgram, expected); render(); };
      if (expected !== null) confirmModal('Byta program?', '', 'Det nuvarande programmet avslutas.', 'Avbryt', 'Byt program', start);
      else start();
    };
  });
}

export function openCardModal(idx) {
  const card = LC[idx];
  const warn = card.cat === 'Vanliga farhågor';
  openModal(`<div class="modal-box">
    <div class="modal-header"><div class="modal-heading">
      <div class="modal-heading-content"><div class="learn-icon-box">${card.i}</div><h2 class="modal-title modal-card-title">${card.f}</h2></div>
      <button type="button" class="modal-close" aria-label="Stäng">✕</button></div></div>
    <div class="modal-body">
      ${warn ? `<div class="modal-warning">⚠️ Ersätter inte medicinsk rådgivning.</div>` : ''}
      <p class="modal-copy">${card.bk}</p>
      <div class="modal-source">📖 ${card.src}</div>
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
  // Saved profile, checked like in Profil: unreasonable values are not shown
  const prof = isObj(entry.profile) ? cleanProfile(entry.profile) : null;
  // The fast reached the 1.4x cap: the workouts added less than their bonus
  const capped = entry.metDuration >= entry.duration * MAX_MET_FACTOR - 1000;

  openModal(`<div class="modal-box history-modal" aria-label="Fasta ${fmtD(entry.start)}">
    <div class="modal-header history-modal-header">
      <div class="modal-heading history-modal-heading">
        <div>
          <div class="modal-status">${entry.rolling ? 'Löpande' : entry.reachedGoal ? '✅ Mål uppnått' : 'Genomförd'}</div>
          <h2 class="modal-title">${top ? top.i : '⏱'} ${Math.round(dh * 10) / 10}h fasta</h2>
          <div class="modal-meta">${fmtD(entry.start)} · ${fmtT(entry.start)} → ${fmtT(entry.end)}</div>
        </div>
        <button type="button" class="modal-close" aria-label="Stäng">✕</button>
      </div>
      <div class="modal-time-grid">
        <div class="modal-time-box">
          <div class="num modal-time-value">${fmtClock(entry.duration)}</div>
          <div class="modal-time-label">Faktisk fastetid</div>
        </div>
        <div class="modal-time-box modal-time-metabolic">
          <div class="num modal-time-value modal-gold">~${fmtHuman(entry.metDuration || entry.duration)}</div>
          <div class="modal-time-label modal-gold">Metabol effekt</div>
        </div>
      </div>
      ${prof ? `<div class="modal-saved-profile">👤 ${prof.gender === 'man' ? 'Man' : prof.gender === 'kvinna' ? 'Kvinna' : 'Ej specificerat'}${[prof.age && `${prof.age} år`, prof.height && `${prof.height} cm`, prof.weight && `${prof.weight} kg`].filter(Boolean).map(s => ' · ' + s).join('')} · ${esc(ACTIVITY_LABELS[prof.activity] || prof.activity)}</div>` : ''}
    </div>
    <div class="modal-body">
      ${bens.length === 0
        ? `<div class="modal-empty"><div class="modal-empty-icon">⏳</div><div class="modal-copy">Fastan var kortare än 4 timmar.</div></div>`
        : `<div class="eyebrow">Vad som hände i kroppen (uppskattat)</div>
        ${[...bens].reverse().map((b, i) => `<div class="benefit-box modal-benefit">
          <div class="modal-benefit-heading">
            <span>${b.i}</span><div class="modal-flex"><div class="modal-label">${b.t}</div><div class="modal-meta">Uppnådd vid ${b.h}h</div></div>
            ${i === 0 ? `<span class="modal-badge">TOPP</span>` : ''}
          </div>
          ${b.e.map(ef => `<div class="modal-benefit-line"><span class="modal-gold">✓</span>${ef}</div>`).join('')}
        </div>`).join('')}`}
      ${notReached.length ? `<div class="eyebrow modal-section-title">Händer vid längre fastor</div>
        ${notReached.map(b => `<div class="not-reached"><span>${b.i}</span><div><div class="modal-label modal-muted">${b.t}</div><div class="modal-meta">Kräver ${b.h}h · ${Math.ceil(b.h - mDh)}h till</div></div></div>`).join('')}` : ''}
      ${(entry.meals || []).length ? `<div class="eyebrow modal-section-title">Måltider</div>
        ${entry.meals.map(m => `<div class="log-item"><span>🍳</span><div><div class="modal-label">${esc(m.desc)}</div><div class="modal-meta">${fmtT(m.time)} · ${esc(m.kcal)} kcal · ${fmtPause(m.pauseHours)} paus</div></div></div>`).join('')}` : ''}
      ${(entry.workouts || []).length ? `<div class="eyebrow modal-section-title">Träningspass</div>
        ${entry.workouts.map(wo => {
          const mhr = wo.maxHr > 0 ? wo.maxHr : (220 - (prof?.age || 35));
          const inPause = !!pauseAt(entry.meals || [], wo.time);
          const bonus = wo.kcal > 0 && !inPause ? workoutBonusHours({ ...wo, maxHr: mhr }).toFixed(1) : null;
          return `<div class="log-item"><span>${esc(wo.icon)}</span><div class="modal-flex"><div class="modal-label">${esc(wo.type)}${wo.durationMins ? ` · ${esc(wo.durationMins)} min` : ''}</div><div class="modal-meta">${fmtT(wo.time)}${wo.kcal ? ` · ${esc(wo.kcal)} kcal` : ''}${wo.avgHr ? ` · ♥ ${esc(wo.avgHr)} bpm` : ''}</div>${bonus ? `<div class="modal-time-label modal-gold">⚡ ${capped ? 'Metabol bonus begränsad (tak 1,4x)' : `+${bonus}h metabol bonus`}</div>` : inPause ? '<div class="modal-time-label">Ingen fastebonus – passet var under måltidspausen.</div>' : ''}</div></div>`;
        }).join('')}` : ''}
    </div>
  </div>`);
}

// ── Meal modal ──

export function openMealModal() {
  let selIdx = 0, pauseH = 2;
  const el = openModal(`<div class="modal-box">
    <div class="modal-header"><div class="modal-heading">
      <h2 class="modal-title">🍳 Logga måltid</h2>
      <button type="button" class="modal-close" aria-label="Stäng">✕</button></div></div>
    <div class="modal-body">
      <div class="eyebrow">Välj måltid</div>
      <div class="modal-choices" id="mp"></div>
      <div id="mi"></div>
      <div class="eyebrow">Paus-fönster</div>
      <div class="modal-pause-choices" id="pp"></div>
      <div class="form-err" role="alert" hidden></div>
      <button class="btn-gold modal-submit" id="mc">Logga & fortsätt fastan</button>
    </div></div>`);

  function renderPresets() {
    el.querySelector('#mp').innerHTML = MEALS_PRE.map((m, i) =>
      `<button class="modal-chip" data-i="${i}" aria-pressed="${i === selIdx}">${m.l}</button>`
    ).join('');
    const s = MEALS_PRE[selIdx];
    el.querySelector('.form-err').hidden = true;
    el.querySelector('#mi').innerHTML = s.k === null
      ? `<input id="cd" placeholder="Beskriv måltiden..." aria-label="Beskriv måltiden" maxlength="100" class="minput"/><input id="ck" placeholder="Kalorier (kcal)" aria-label="Kalorier (kcal)" type="number" inputmode="numeric" min="1" max="3000" class="minput modal-field-space"/>`
      : `<div class="modal-meal-summary"><span class="modal-copy">⚡ ${s.k} kcal</span><span class="modal-copy">🥩 ${s.pr}g protein</span></div>`;
  }

  function renderPause() {
    el.querySelector('#pp').innerHTML = [1, 2, 3, 4].map(h =>
      `<button class="modal-pause-button" data-i="${h}" aria-pressed="${h === pauseH}">${h}h</button>`
    ).join('');
  }

  onPick(el.querySelector('#mp'), i => { selIdx = i; renderPresets(); });
  onPick(el.querySelector('#pp'), h => { pauseH = h; renderPause(); });
  renderPresets(); renderPause();

  el.querySelector('#mc').onclick = () => {
    const s = MEALS_PRE[selIdx];
    let desc = s.d, kcal = s.k;
    if (s.k === null) {
      desc = el.querySelector('#cd').value.trim();
      if (!desc) return showErr(el, 'Skriv vad du åt.');
      kcal = readNum(el, '#ck', [1, LIMITS.mealKcal[1]], 'Kalorier måste vara 1–3000 kcal.');
      if (kcal === null) return;
    }
    el.remove();
    addMeal({ time: Date.now(), desc, kcal, protein: s.k === null ? 0 : s.pr, pauseHours: pauseH });
  };
}

// ── Workout modal ──

export function openWorkoutModal() {
  let selIdx = 0;
  const paused = !!getActivePause();
  const el = openModal(`<div class="modal-box">
    <div class="modal-header"><div class="modal-heading">
      <h2 class="modal-title">🏋️ Logga träningspass</h2>
      <button type="button" class="modal-close" aria-label="Stäng">✕</button></div></div>
    <div class="modal-body">
      <div class="eyebrow">Typ av träning</div>
      <div class="modal-choices" id="wt"></div>
      <div id="wname"></div>
      <div class="modal-field-grid">
        <div><div class="eyebrow">Tid (minuter)</div><input aria-label="Tid (minuter)" id="wmins" type="number" inputmode="numeric" min="1" max="300" placeholder="t.ex. 45" value="30" class="minput modal-field-flush"/></div>
        <div><div class="eyebrow">Kalorier (kcal)</div><input aria-label="Kalorier (kcal)" id="wkcal" type="number" inputmode="numeric" min="0" max="2000" placeholder="t.ex. 320" class="minput modal-field-flush"/></div>
      </div>
      <div class="modal-field-grid">
        <div><div class="eyebrow">Snittspuls (bpm)</div><input aria-label="Snittspuls (bpm)" id="wavghr" type="number" min="40" max="220" placeholder="t.ex. 145" class="minput modal-field-flush"/></div>
        <div><div class="eyebrow">Maxpuls (bpm)</div><input aria-label="Maxpuls (bpm)" id="wmaxhr" type="number" min="100" max="220" placeholder="t.ex. 178" class="minput modal-field-flush"/></div>
      </div>
      <div class="modal-bonus" id="wbonus"></div>
      <div class="form-err" role="alert" hidden></div>
      <button class="btn-gold modal-submit" id="wc">Logga träningspass</button>
    </div></div>`);

  function renderTypes() {
    el.querySelector('.form-err').hidden = true;
    el.querySelector('#wt').innerHTML = WORKOUT_TYPES.map((t, i) =>
      `<button class="modal-chip" data-i="${i}" aria-pressed="${i === selIdx}">${t.icon} ${t.l}</button>`
    ).join('');
    el.querySelector('#wname').innerHTML = WORKOUT_TYPES[selIdx].custom
      ? `<input aria-label="Beskriv träningstyp" id="wcname" placeholder="Beskriv träningstyp..." class="minput"/>` : '';
  }

  function updateBonus() {
    const wo = { kcal: Math.min(Number(el.querySelector('#wkcal').value) || 0, LIMITS.workoutKcal[1]), avgHr: Number(el.querySelector('#wavghr').value) || 0, maxHr: Number(el.querySelector('#wmaxhr').value) || 0 };
    const k = wo.kcal, glycFrac = glycogenShare(wo), bonus = workoutBonusHours(wo);
    const granted = Math.min(bonus, Math.max(0, calcElapsed() * MAX_MET_FACTOR - calcMetabolicElapsed()) / 3600000);
    const box = el.querySelector('#wbonus');
    if (paused) {
      box.hidden = false;
      box.textContent = 'Pass under måltidspausen ger ingen fastebonus, eftersom du äter då.';
    } else if (k > 0) {
      box.hidden = false;
      box.innerHTML = `⚡ Beräknad metabol bonus: ~<strong>${granted.toFixed(1)}h</strong> extra fastaeffekt nu${granted < bonus ? ' (tak 1,4x)' : ''}<br/><span class="modal-bonus-help">Baserat på ${Math.round(k * glycFrac)} kcal glykogen (${Math.round(glycFrac * 100)}% av kalorier vid denna intensitet). Metabol effekt blir högst 40 % längre än din faktiska fastetid.</span>`;
    } else {
      box.hidden = true;
    }
  }

  onPick(el.querySelector('#wt'), i => { selIdx = i; renderTypes(); });
  ['#wkcal', '#wavghr', '#wmaxhr'].forEach(id => el.querySelector(id).addEventListener('input', updateBonus));

  el.querySelector('#wc').onclick = () => {
    const type = WORKOUT_TYPES[selIdx];
    const name = type.custom ? el.querySelector('#wcname').value.trim() || 'Eget' : type.l;
    const durationMins = readNum(el, '#wmins', LIMITS.durationMins, 'Tiden måste vara 1–300 minuter.');
    if (durationMins === null) return;
    const kcal = readNum(el, '#wkcal', LIMITS.workoutKcal, 'Kalorier måste vara 0–2000 kcal.', 0);
    if (kcal === null) return;
    const avgHr = readNum(el, '#wavghr', LIMITS.avgHr, 'Snittpulsen måste vara 40–220 slag per minut.', 0);
    if (avgHr === null) return;
    const maxHr = readNum(el, '#wmaxhr', LIMITS.maxHr, 'Maxpulsen måste vara 100–220 slag per minut.', 0);
    if (maxHr === null) return;
    const wo = { time: Date.now(), type: name, icon: type.icon, durationMins, kcal, avgHr, maxHr };
    el.remove();
    addWorkout(wo);
  };

  renderTypes();
  updateBonus();
}
