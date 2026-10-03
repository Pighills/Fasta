// ── FASTA — js/views/profile.js ──
// Profile page for metabolic personalization

import { ACTIVITY_LABELS, HEALTH_FLAGS, HEALTH_DISCLAIMER, GOALS } from '../data.js';
import { profile, profileComplete, backupTime, saveProfile, goalView, weekView } from '../state.js';
import { setGoal } from '../actions.js';
import { calcMetabolicMultiplier, esc } from '../helpers.js';
import { LIMITS } from '../migrations.js';

// Which health warnings are expanded (not saved)
const openHealth = new Set();

export function renderProfile() {
  const pc = profileComplete();
  const mult = calcMetabolicMultiplier(profile);

  function radio(field, val, label) {
    const sel = profile[field] === val;
    return `<button class="profile-radio${sel ? ' selected' : ''}" aria-pressed="${sel}" data-action="profileField" data-field="${field}" data-arg="${val}">${label}</button>`;
  }

  let html = `<div class="profile-view"><h1 class="view-title">Din profil</h1>
    <p class="view-intro">Används för att beräkna din personliga metabola fasttid</p>`;

  if (pc) {
    html += `<div class="profile-complete">
      <div class="profile-complete-title">✓ Profil klar</div>
      Din uppskattade multiplikator: <strong class="profile-multiplier">${mult.toFixed(2)}x</strong> — din kropp ${mult > 1 ? 'når fasteeffekterna uppskattningsvis snabbare' : 'tar uppskattningsvis något längre tid att nå fasteeffekterna'} jämfört med referensvärdet.
    </div>`;
  }

  html += `<div class="card profile-section">
    <div class="profile-field"><label class="profile-label">Kön</label><div class="profile-radio-group">${radio('gender', 'man', 'Man')}${radio('gender', 'kvinna', 'Kvinna')}${radio('gender', 'annat', 'Ej specificerat')}</div></div>
    <div class="profile-number-grid">
      ${numField('age', 'Ålder (år)', 't.ex. 34', 'numeric')}
      ${numField('weight', 'Vikt (kg)', 't.ex. 78', 'decimal')}
    </div>
    ${numField('height', 'Längd (cm)', 't.ex. 178', 'numeric', 'profile-height')}
    <div class="profile-field profile-activity"><label class="profile-label">Aktivitetsnivå</label>
      <div class="profile-activity-options">
        ${Object.entries(ACTIVITY_LABELS).map(([val, label]) => {
          const sel = profile.activity === val;
          return `<button class="profile-radio profile-activity-option${sel ? ' selected' : ''}" aria-pressed="${sel}" data-action="profileField" data-field="activity" data-arg="${val}">${label}</button>`;
        }).join('')}
      </div>
    </div>
  </div>
  <div class="card profile-section"><h2 class="eyebrow profile-section-title">Hur beräknas den metabola effekten?</h2>
    <p class="profile-copy">Beräkningen uppskattar hur snabbt just din kropp förbrukar sina sockerlager (glykogen) baserat på din ämnesomsättning. Högre energiförbrukning = snabbare tömning = tidigare fasteeffekter.</p>
    <p class="profile-copy profile-copy-muted">En aktiv person med hög ämnesomsättning bränner igenom sina sockerlager snabbare och når ketos och cellstädning tidigare. Sockerlagren är ungefär lika stora i förhållande till kroppsstorlek — det som skiljer är hur snabbt du förbränner dem. Träningspass du loggar räknas in som extra bonus.</p>
    <p class="profile-copy profile-copy-muted">⚠️ Detta är en uppskattning, inte en exakt mätning. Verklig tid till ketos varierar mellan 12–36 timmar beroende på individ, kost och andra faktorer. Multiplikatorn ger max ±40% justering. Källor: Mifflin-St Jeor (BMR), Boer 1984 (kroppsmassa), Anton et al. 2018 (metabolic switch).</p>
  </div>`;

  html += renderGoalCard();
  html += renderHealthCard();
  html += renderDataCard();
  html += `<div class="card profile-section"><h2 class="eyebrow profile-section-title">Om appen</h2>
    <p class="profile-copy">FASTA är ett hjälpmedel för att hålla koll på dina fastor. Appen är inte en medicinteknisk produkt och ställer inga diagnoser. Den behandlar, botar eller förebygger inte sjukdom. Tider, faser och värden i appen är uppskattningar, inte mätningar. Har du en sjukdom, tar läkemedel, är gravid eller ammar, har eller har haft en ätstörning eller är under 18 år – prata med vården innan du fastar. Avbryt fastan och sök vård om du mår dåligt.</p>
    <a class="legal-link" href="integritet.html">Integritet och villkor</a></div>`;

  document.getElementById('content').innerHTML = html + '</div>';
  bindGoalCard();
}

function renderGoalCard() {
  const goal = goalView();
  const warning = profile.health?.eatingDisorder || profile.health?.under18;
  return `<section class="card goal-card profile-section" aria-label="Mål"><h2 class="eyebrow profile-section-title">Mål</h2>
    <p>${GOALS.intro}</p><div class="profile-label">Fastor per vecka</div>
    <div class="profile-radio-group">${[null, 1, 2, 3, 4, 5, 6, 7].map(n => `<button class="profile-radio${goal.fastsPerWeek === n ? ' selected' : ''}" data-week-goal="${n ?? ''}" aria-pressed="${goal.fastsPerWeek === n}">${n ?? 'Inget mål'}</button>`).join('')}</div>
    ${goal.fastsPerWeek ? `<p>Den här veckan: ${weekView().fasts} av ${goal.fastsPerWeek} fastor</p>` : ''}
    <label class="profile-label" for="goal-weight">Målvikt (kg, valfri)</label>
    <input id="goal-weight" class="profile-input" type="number" inputmode="decimal" min="30" max="250" step="any" value="${goal.targetWeight ?? ''}" aria-describedby="goal-error goal-help"/>
    <div id="goal-error" class="form-err" role="alert" hidden></div>
    <p id="goal-help">${warning ? GOALS.viktHalsa : GOALS.vikt}</p>
    ${warning ? '' : `<div class="health-src">Källa: ${GOALS.source}</div>`}</section>`;
}

function bindGoalCard() {
  const expected = goalView();
  document.querySelectorAll('[data-week-goal]').forEach(button => {
    button.addEventListener('click', () => {
      setGoal({ ...expected, fastsPerWeek: button.dataset.weekGoal === '' ? null : Number(button.dataset.weekGoal) }, expected);
      renderProfile();
    });
  });
  const input = document.getElementById('goal-weight');
  input.addEventListener('blur', () => {
    const n = input.value === '' ? null : Number(input.value);
    if (input.validity.badInput || (n !== null && (!Number.isFinite(n) || n < 30 || n > 250))) {
      const error = document.getElementById('goal-error');
      error.textContent = 'Målvikt måste vara 30–250 kg.';
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      return;
    }
    setGoal({ ...goalView(), targetWeight: n }, expected);
    // Keep the buttons in place so a click that blurs this field still works.
    Object.assign(expected, goalView());
    document.getElementById('goal-error').hidden = true;
    input.removeAttribute('aria-invalid');
  });
}

const NUM_ERR = {
  age: 'Ålder måste vara 10–110 år.',
  weight: 'Vikt måste vara 30–250 kg.',
  height: 'Längd måste vara 100–230 cm.',
};

function numField(k, label, ph, mode, fieldClass = '') {
  const [lo, hi] = LIMITS[k];
  return `<div class="profile-field"><label class="profile-label" for="pf-${k}">${label}</label><input id="pf-${k}" class="profile-input ${fieldClass}" type="number" inputmode="${mode}" min="${lo}" max="${hi}" placeholder="${ph}" value="${esc(profile[k] || '')}" aria-describedby="pe-${k}" data-number="${k}"/><div id="pe-${k}" class="form-err" role="alert" hidden></div></div>`;
}

// Empty = not filled in. Outside the limits: message, nothing saved.
export function setProfileNumber(k, input) {
  const v = input.value.trim();
  const n = v === '' ? null : Number(v);
  const [lo, hi] = LIMITS[k];
  if (n !== null && !(Number.isFinite(n) && n >= lo && n <= hi)) {
    const err = document.getElementById(`pe-${k}`);
    err.textContent = NUM_ERR[k];
    err.hidden = false;
    return;
  }
  profile[k] = n;
  saveProfile();
  renderProfile();
}

export function toggleHealthInfo(k) {
  if (openHealth.has(k)) openHealth.delete(k); else openHealth.add(k);
  renderProfile();
}

function renderHealthCard() {
  const h = profile.health || {};
  let html = `<div class="card profile-section"><h2 class="eyebrow profile-section-title">Hälsa och säkerhet</h2>
    <p class="profile-copy">Frivilligt. Kryssa i det som stämmer in på dig, så får du veta vad du bör tänka på innan du fastar. Svaren sparas bara på den här enheten.</p>
    <div class="profile-health-options">`;
  for (const f of HEALTH_FLAGS) {
    const on = !!h[f.k], open = openHealth.has(f.k);
    html += `<div>
      <button class="health-check${on ? ' checked' : ''}" role="checkbox" aria-checked="${on}" data-action="toggleHealth" data-arg="${f.k}">
        <span class="health-box">${on ? '✓' : ''}</span><span>${f.q}</span>
      </button>`;
    if (on) {
      html += `<button class="health-warn" aria-expanded="${open}" data-action="healthInfo" data-arg="${f.k}">
        ⚠️ ${f.s}<span class="health-more">${open ? 'Visa mindre ▲' : 'Läs mer ▼'}</span>
        ${open ? `<div class="health-long">${f.l}<span class="health-src">Källor: ${f.src}</span></div>` : ''}
      </button>`;
    }
    html += `</div>`;
  }
  return html + `</div>
    <p class="profile-copy profile-copy-muted">${HEALTH_DISCLAIMER}</p>
  </div>`;
}

function renderDataCard() {
  const bt = backupTime();
  let html = `<div class="card profile-section"><h2 class="eyebrow profile-section-title">Din data</h2>
    <p class="profile-copy">Din data sparas bara på den här enheten. Exportera en backupfil för att spara den eller flytta den till en annan enhet.</p>
    <button class="btn-gold profile-data-button" data-action="exportData">Exportera data</button>
    <button class="btn-secondary profile-data-button" data-action="importData">Importera data</button>`;
  if (bt !== null) {
    const when = bt ? ` (sparad ${new Date(bt).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })})` : '';
    html += `<button class="btn-secondary profile-data-button" data-action="undoImport">Ångra senaste import</button>
      <div class="profile-backup-help">Återställer datan från före importen${when}.</div>`;
  }
  html += `<button class="profile-data-button profile-erase" data-action="eraseAll">Radera all data</button>`;
  return html + `</div>`;
}
