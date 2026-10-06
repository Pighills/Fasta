// Meal dialog only. The reference table is fetched when the dialog opens.
import { MAT_TEXT, FASTENIVA, FASTENIVA_TEXT, LONG_FAST_TEXT } from './data.js';
import { laddaMatTabell, tolkaMat, sokMat, matSokFras, summeraMat, matKategori, MAKRO_KEYS } from './matparser.js';
import { state, profile, saveProfile, SaveRefused } from './state.js';
import { addMeal } from './actions.js';
import { esc, toLocalDateTimeStr } from './helpers.js';
import { mealPauseHours } from './fasteniva.js';
import { showNotice } from './ui.js';

let accepted = false;
export function resetMatSafety() { accepted = false; }
function safety(openModal, next) {
  try { if (localStorage.getItem('fasta-mat-ok')) accepted = true; } catch { /* Session fallback. */ }
  if (accepted) return next();
  if (document.querySelector('.mat-safety')) return;
  const el = openModal(`<div class="modal-box mat-safety" aria-label="${esc(MAT_TEXT.sakerhetTitel)}"><div class="modal-header"><h2>${esc(MAT_TEXT.sakerhetTitel)}</h2></div><div class="modal-body">${MAT_TEXT.sakerhet.map(p => `<p>${esc(p)}</p>`).join('')}<button type="button" class="btn-gold">Jag förstår</button></div></div>`, { dismissible: false });
  el.querySelector('button').addEventListener('click', () => {
    try { localStorage.setItem('fasta-mat-ok', '1'); } catch { showNotice('Det gick inte att spara ditt svar. Rutan visas igen nästa gång.'); }
    accepted = true; el.remove(); next();
  });
}
export function openMatMeal(openModal, mode) { return safety(openModal, () => mealDialog(openModal, mode)); }

function mealDialog(openModal, mode) {
  const expectedFast = state.activeId;
  let table = null, draft = null, category = null;
  const el = openModal(`<div class="modal-box mat-modal" aria-label="Logga mat"><div class="modal-header"><div class="modal-heading"><h2>Logga mat</h2><button type="button" class="modal-close" aria-label="Stäng">✕</button></div></div><div class="modal-body">
    ${mode.intro ? `<p>${esc(FASTENIVA_TEXT.planera)}</p>` : ''}${mode.long ? `<p>${esc(LONG_FAST_TEXT.day)}</p>` : ''}
    <label for="mat-text">Vad åt du?</label><textarea id="mat-text" class="minput" maxlength="300" rows="2" placeholder="2 ägg och en banan" aria-describedby="mat-help mat-private"></textarea>
    <p id="mat-help">${esc(MAT_TEXT.fraga)}</p><p id="mat-private" class="mat-muted">${esc(MAT_TEXT.privat)}</p>
    <div id="mat-search" class="mat-chips" aria-label="Förslag på matvaror"></div><div id="mat-favorites" class="mat-chips" aria-label="Egna och senaste måltider"></div>
    <div id="mat-status" role="status">Matlistan laddas…</div><button id="mat-retry" class="btn-secondary" type="button" hidden>Försök igen</button>
    <section id="mat-result" aria-label="Tolkad måltid" hidden></section>
    <fieldset class="fasteniva-categories"><legend>Snabbval / välj kategori i stället</legend>${FASTENIVA.KATEGORIER.map(c => `<button type="button" data-mat-category="${c.id}" aria-pressed="false"><strong>${esc(c.etikett)}</strong><span>${esc(c.exempel)}</span></button>`).join('')}</fieldset>
    ${mode.preview ? '<p id="mat-preview" aria-live="polite"></p>' : ''}
    <label for="mat-time">Tid för måltiden</label><input id="mat-time" class="minput" type="datetime-local" value="${toLocalDateTimeStr(new Date())}">
    <div class="form-err" role="alert" hidden></div><button id="mat-log" class="btn-gold" type="button">Logga & fortsätt fastan</button>
  </div></div>`);
  const input = el.querySelector('#mat-text'), result = el.querySelector('#mat-result'), status = el.querySelector('#mat-status');
  const error = text => { const box = el.querySelector('.form-err'); box.textContent = text; box.hidden = false; };
  function update() {
    el.querySelector('.form-err').hidden = true;
    const detailsOpen = result.querySelector('details')?.open;
    if (draft && table) Object.assign(draft, summeraMat(draft.items, table), { foodType: matKategori(draft.items, table) });
    el.querySelectorAll('[data-mat-category]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.matCategory === category)));
    const preview = el.querySelector('#mat-preview');
    if (preview) {
      const type = category || draft?.foodType;
      const selectedTime = new Date(el.querySelector('#mat-time').value).getTime();
      const minutes = type ? Math.ceil(mealPauseHours({ time: Number.isFinite(selectedTime) ? selectedTime : Date.now(), foodType: type }, state.workouts) * 60) : 0;
      preview.hidden = !minutes;
      preview.textContent = type ? FASTENIVA_TEXT.forhandsvisning.replace('{Kategori}', FASTENIVA.KATEGORIER.find(c => c.id === type).etikett).replace('{tid}', `${Math.floor(minutes / 60)} h ${minutes % 60} min`) : '';
    }
    result.hidden = !draft || category !== null;
    if (!draft || category !== null) return;
    const summary = summeraMat(draft.items, table);
    Object.assign(draft, summary, { foodType: matKategori(draft.items, table) });
    result.innerHTML = `<p>${esc(MAT_TEXT.forslag)}</p><p class="mat-muted">${esc(MAT_TEXT.uppskattning)}</p>${draft.items.map((r, i) => `<div class="mat-row ${r.sakerhet === 'låg' ? 'mat-uncertain' : ''}"><strong>${esc(r.namn)}</strong>${r.matchning === null ? `<p>${esc(MAT_TEXT.okand.replace('{ord}', r.namn))}</p><label>Välj matvara<input class="minput" data-find-row="${i}" placeholder="Sök i matlistan"></label><div data-row-search="${i}" class="mat-chips"></div>` : `<div class="mat-quantity"><button type="button" data-adjust="${i}" data-factor="0.8" aria-label="Minska ${esc(r.namn)}">−</button><label>Mängd, g<input type="number" inputmode="decimal" min="1" max="1500" step="1" data-grams="${i}" value="${r.mangd_g}"></label><button type="button" data-adjust="${i}" data-factor="1.2" aria-label="Öka ${esc(r.namn)}">+</button></div>`}<p>Säkerhet: ${esc(r.sakerhet)}${r.sakerhet === 'låg' ? ` · ${esc(MAT_TEXT.lagSakerhet)}` : ''}</p>${r.antagande ? `<p>${esc(r.antagande)}</p>` : ''}<div class="mat-chips">${r.stekfett ? [5, 10, 20].map((g, j) => `<button type="button" data-fat="${i}" data-g="${g}">${['Lite', 'Normalt', 'Mycket'][j]}</button>`).join('') : (r.kandidater || []).map(id => table.livsmedel.find(f => String(f.id) === String(id))).filter(Boolean).map(f => `<button type="button" data-match-row="${i}" data-food-id="${esc(f.id)}" aria-pressed="${String(f.id) === String(r.matchning)}">${esc(f.namn)}</button>`).join('')}</div></div>`).join('')}
    ${draft.ovrigt.length ? `<p>Övrigt: ${esc(draft.ovrigt.join(', '))}</p>` : ''}${draft.oklarheter.map(s => `<p>${esc(s === 'fleraMaltider' ? MAT_TEXT.fleraMaltider : s)}</p>`).join('')}
    <p>Form: ${esc(draft.form)}</p><details><summary>Visa detaljer</summary><p>${esc(MAT_TEXT.detaljer)}</p><dl class="mat-macros">${MAKRO_KEYS.map((k, i) => `<dt>${['Energi', 'Kolhydrat', 'Varav socker', 'Fiber', 'Protein', 'Fett'][i]}</dt><dd>${draft.makron[k]} ${k === 'kcal' ? 'kcal' : 'g'}</dd>`).join('')}</dl><p>${esc(MAT_TEXT.kalla)}</p><p>Portioner och eventuella schablonposter är egna uppskattningar.</p></details>`;
    result.querySelector('details').open = !!detailsOpen;
  }
  function interpret() {
    if (!table) return;
    category = null; draft = input.value.trim() ? tolkaMat(input.value, table) : null;
    const last = matSokFras(input.value.replace(/(\d),(\d)/g, '$1.$2').split(/[,;+]|\s+(?:och|med|samt)\s+/).at(-1));
    el.querySelector('#mat-search').innerHTML = last.length > 1 && last !== 'fett' ? sokMat(last, table).map(f => `<button type="button" data-complete="${esc(f.id)}">${esc(f.namn)}</button>`).join('') : '';
    update();
  }
  input.addEventListener('input', interpret);
  el.querySelectorAll('[data-mat-category]').forEach(b => b.addEventListener('click', () => { category = b.dataset.matCategory; update(); }));
  el.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || !table) return;
    if (b.hasAttribute('data-complete')) {
      const f = table.livsmedel.find(f => String(f.id) === b.dataset.complete);
      const text = input.value, match = [...text.matchAll(/[,;+]|\s+(?:och|med|samt)\s+/g)].at(-1);
      const start = match ? match.index + match[0].length : 0;
      const tail = text.slice(start), quantity = tail.match(/^\s*((?:\d+(?:[.,]\d+)?|en halv|ett halvt|en|ett|två|tre|fyra|fem|sex|sju|åtta|nio|tio)\s*(?:g|kg|dl|msk|tsk|st|skivor|portioner)?\s*)/);
      input.value = (text.slice(0, start) + (quantity?.[0] || '') + f.namn).slice(0, 300); interpret(); input.focus();
    }
    const idx = b.dataset.adjust ?? b.dataset.fat ?? b.dataset.matchRow;
    if (idx !== undefined && draft?.items[idx]) {
      const row = draft.items[idx];
      if (b.hasAttribute('data-adjust')) row.mangd_g = Math.min(1500, Math.max(1, Math.round(row.mangd_g * Number(b.dataset.factor))));
      if (b.hasAttribute('data-fat')) row.mangd_g = Number(b.dataset.g);
      if (b.hasAttribute('data-match-row')) {
        const f = table.livsmedel.find(f => String(f.id) === b.dataset.foodId);
        row.matchning = f.id; row.namn = f.namn; row.sakerhet = 'medel';
      }
      row.antagande = 'Portion eller matchning justerad av dig.';
      update();
      result.querySelector(`[data-adjust="${idx}"]`)?.focus({ preventScroll: true });
    }
  });
  result.addEventListener('input', e => {
    if (e.target.hasAttribute('data-find-row')) {
      const idx = e.target.dataset.findRow;
      result.querySelector(`[data-row-search="${idx}"]`).innerHTML = sokMat(e.target.value, table).map(f => `<button type="button" data-match-row="${idx}" data-food-id="${esc(f.id)}">${esc(f.namn)}</button>`).join('');
    }
  });
  result.addEventListener('change', e => {
    if (!e.target.hasAttribute('data-grams')) return;
    const idx = e.target.dataset.grams, value = Number(e.target.value);
    if (!Number.isFinite(value) || value <= 0 || value > 1500) return error('Ange 1–1500 g per matvara.');
    draft.items[idx].mangd_g = value; draft.items[idx].antagande = 'Portion justerad av dig.'; update();
  });
  async function load() {
    try {
      table = await laddaMatTabell();
      if (!el.isConnected) return;
      status.textContent = ''; el.querySelector('#mat-retry').hidden = true; if (category === null) interpret(); renderFavorites();
    } catch { if (el.isConnected) { status.textContent = 'Matlistan kunde inte laddas. Välj en kategori eller försök igen.'; el.querySelector('#mat-retry').hidden = false; } }
  }
  el.querySelector('#mat-retry').addEventListener('click', load);
  const favorites = [];
  function renderFavorites() {
    favorites.splice(0, favorites.length, ...(Array.isArray(profile.matFavoriter) ? profile.matFavoriter : []).slice(0, 5));
    const recent = [...state.meals, ...state.history.flatMap(f => f.meals || [])].filter(m => m.items?.length).sort((a, b) => b.time - a.time);
    for (const m of recent) if (favorites.length < 5 && !favorites.some(f => f.fritext === m.fritext)) favorites.push({ ...m, namn: m.desc });
    el.querySelector('#mat-favorites').innerHTML = favorites.map((f, i) => `<div class="mat-favorite-pair"><button type="button" data-favorite="${i}">Logga ${esc(f.namn)}</button><button type="button" data-edit-favorite="${i}" aria-label="Justera ${esc(f.namn)}">✎</button></div>`).join('');
  }
  el.querySelector('#mat-favorites').addEventListener('click', e => {
    const b = e.target.closest('[data-favorite], [data-edit-favorite]'); if (!b) return;
    const f = favorites[Number(b.dataset.favorite ?? b.dataset.editFavorite)];
    input.value = String(f.fritext || f.namn).slice(0, 300);
    draft = { ...tolkaMat(input.value, table), items: JSON.parse(JSON.stringify(f.items)).map(r => ({ ...r, kandidater: sokMat(matSokFras(r.mangd_text) || r.namn, table).map(c => c.id), stekfett: r.mangd_text === 'stekfett' })), foodType: f.foodType };
    category = null; update();
    if (b.hasAttribute('data-favorite')) logCurrent(false);
  });
  el.querySelector('#mat-time').addEventListener('change', update);
  function logCurrent(offerFavorite = true) {
    if (!state.fasting || expectedFast !== state.activeId) throw new SaveRefused('stale');
    let time = new Date(el.querySelector('#mat-time').value).getTime();
    if (!Number.isFinite(time) || time < Math.floor(state.startTime / 60000) * 60000 || time > Date.now()) return error('Välj en tid under den pågående fastan, inte i framtiden.');
    time = Math.max(time, state.startTime);
    if (!category && (!draft || (!draft.items.length && !draft.ovrigt.length))) return error('Skriv vad du åt eller välj en kategori.');
    if (!category && (draft.items.some(r => !table.livsmedel.some(f => String(f.id) === String(r.matchning))) || draft.oklarheter.includes('fleraMaltider'))) return error('Kontrollera de okända raderna, logga en måltid i taget eller välj en kategori.');
    if (!category && draft.items.reduce((n, r) => n + r.mangd_g, 0) > 3000) return error('Måltiden kan vara högst 3000 g. Minska portionerna.');
    const foodType = category || draft.foodType;
    const meal = { time, desc: input.value.trim().slice(0, 300) || FASTENIVA.KATEGORIER.find(c => c.id === foodType).etikett, kcal: category ? 0 : draft.makron.kcal, protein: category ? 0 : draft.makron.protein, foodType, pauseHours: 0, ...(category ? { items: [] } : {}) };
    if (!category) Object.assign(meal, { items: draft.items.map(({ kandidater, stekfett, ...r }) => r), makron: draft.makron, form: draft.form, fritext: draft.fritext });
    addMeal(meal); el.remove();
    if (offerFavorite && meal.items?.length) favoriteDialog(openModal, meal);
  }
  el.querySelector('#mat-log').addEventListener('click', () => logCurrent());
  load();
}
function favoriteDialog(openModal, meal) {
  const el = openModal(`<div class="modal-box" aria-label="Måltiden är loggad"><div class="modal-header"><div class="modal-heading"><h2>Måltiden är loggad</h2><button class="modal-close" type="button" aria-label="Stäng">✕</button></div></div><div class="modal-body"><p>Fastenivå har uppdaterats. Vill du spara den här måltiden som en favorit?</p><label for="mat-favorite-name">Namn på din måltid</label><input id="mat-favorite-name" class="minput" maxlength="80" placeholder="Min vanliga frukost"><button class="btn-gold" type="button" id="mat-save-favorite">Spara favorit</button><div class="form-err" role="alert" hidden></div></div></div>`);
  el.querySelector('#mat-save-favorite').addEventListener('click', () => {
    const namn = el.querySelector('input').value.trim();
    if (!namn) { const box = el.querySelector('.form-err'); box.textContent = 'Ge måltiden ett namn.'; box.hidden = false; return; }
    const previous = profile.matFavoriter;
    profile.matFavoriter = [{ namn, items: meal.items, fritext: meal.fritext, foodType: meal.foodType }, ...(Array.isArray(previous) ? previous.filter(f => f.namn !== namn) : [])].slice(0, 5);
    try { saveProfile(); el.remove(); } catch (e) { profile.matFavoriter = previous; throw e; }
  });
}
