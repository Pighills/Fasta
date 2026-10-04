// Presentation för Fastenivå. Modellen finns i ../fasteniva.js.
import { FEATURES, FASTENIVA, FASTENIVA_TEXT, PH } from '../data.js';
import { estimateInsulinLevel, timeToFastingWindow, liverGlycogenShare } from '../fasteniva.js';
import { effectiveProfile, calcMetabolicMultiplier, workoutBonusHours, fmtT, esc } from '../helpers.js';
import { pausedMs, pauseAt, MAX_MET_FACTOR } from '../migrations.js';
const H = 3600000;

export function applyFastenivaColors() {
  if (!FEATURES.fastenivaa) return;
  document.documentElement?.classList.add('fasteniva-enabled');
  PH.forEach((p, i) => document.documentElement?.style.setProperty(`--fas-${i}`, p.c));
}

export function metabolicHoursAt(fast, time) {
  const until = Math.max(fast.start, time);
  const elapsed = Math.max(0, until - fast.start - pausedMs(fast.meals || [], fast.start, until));
  const bonus = (fast.workouts || []).filter(w => w.time >= fast.start && w.time <= until && !pauseAt(fast.meals || [], w.time))
    .reduce((sum, w) => sum + workoutBonusHours({ ...w, maxHr: w.maxHr || 220 - effectiveProfile(fast.profile).age }) * H, 0);
  return Math.min(elapsed * calcMetabolicMultiplier(fast.profile) + bonus, elapsed * MAX_MET_FACTOR) / H;
}

function duration(ms) {
  const minutes = Math.ceil(ms / 60000);
  return minutes >= 60 ? `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}` : `${minutes} min`;
}

export function fastenivaReading(fast, now) {
  const meals = fast.meals || [], workouts = fast.workouts || [];
  const level = estimateInsulinLevel(meals, workouts, now);
  const wait = timeToFastingWindow(meals, workouts, now);
  const hours = metabolicHoursAt(fast, now);
  const text = wait > 0 ? FASTENIVA_TEXT.rad[0].replace('{tid}', duration(wait)) :
    hours >= 12 ? FASTENIVA_TEXT.rad[2].replace('{andel}', `${Math.round((1 - liverGlycogenShare(hours)) * 10) * 10} %`) : FASTENIVA_TEXT.rad[1];
  const profile = effectiveProfile(fast.profile);
  const profileText = !profile.filled.length ? FASTENIVA_TEXT.snittperson :
    profile.missing.length ? FASTENIVA_TEXT.profil : FASTENIVA_TEXT.profil.split('. ')[0] + '.';
  const phaseIndex = PH.reduce((idx, p, i) => hours >= p.h ? i : idx, 0);
  return { level, wait, hours, text, profileText, phaseIndex, fill: wait === 0 ? 100 : Math.min(99, (1 - level) * 100) };
}

export function fastenivaBarHTML() {
  if (!FEATURES.fastenivaa) return '';
  return `<section class="fasteniva-panel" aria-label="Fastenivå">
    <button id="fasteniva-open" class="fasteniva-open" aria-haspopup="dialog">
      <span class="fasteniva-heading">Fastenivå <span aria-hidden="true">↗</span></span>
      <span class="fasteniva-track"><span id="fasteniva-fill" class="fasteniva-fill"></span><span id="fasteniva-hatch" class="fasteniva-hatch"></span></span>
      <span id="fasteniva-row" class="fasteniva-row"></span>
      <span id="fasteniva-phase" class="fasteniva-phase"></span>
    </button>
    <p class="fasteniva-note">${esc(FASTENIVA_TEXT.markning)}</p>
    <p id="fasteniva-profile" class="fasteniva-profile"></p>
  </section>`;
}

let lastReading = null, lastFast = null, lastAt = -Infinity;
export function updateFastenivaBar(fast, now, force = false) {
  if (!FEATURES.fastenivaa || !document.getElementById('fasteniva-fill')) return;
  if (force || fast.start !== lastFast || now < lastAt || now - lastAt >= 10000) {
    lastReading = fastenivaReading(fast, now); lastAt = now; lastFast = fast.start;
  }
  const r = lastReading;
  const fill = document.getElementById('fasteniva-fill');
  fill.style.width = `${r.fill}%`;
  fill.style.backgroundColor = PH[r.phaseIndex].c;
  const hatch = document.getElementById('fasteniva-hatch');
  hatch.style.width = `${r.level * 100}%`;
  document.getElementById('fasteniva-row').textContent = r.text;
  document.getElementById('fasteniva-phase').textContent = `${PH[r.phaseIndex].l} · Fas ${r.phaseIndex + 1} av ${PH.length}`;
  document.getElementById('fasteniva-profile').textContent = r.profileText;
}

// Equal-height bands preserve phase boundaries without implying measured values.
export function phasePosition(hours) {
  const index = PH.reduce((n, p, i) => hours >= p.h ? i : n, 0);
  const end = PH[index + 1]?.h ?? PH[index].h + 24;
  return index + Math.max(0, Math.min(1, (hours - PH[index].h) / (end - PH[index].h)));
}

export function nextPhaseForecast(fast, now) {
  const hours = metabolicHoursAt(fast, now);
  const phase = PH.find(p => p.h > hours);
  if (!phase) return null;
  const pause = pauseAt(fast.meals || [], now);
  let resume = pause ? pause.time + pause.pauseHours * H : now;
  // A pause may continue into another logged meal's pause.
  if (pause) for (const meal of [...(fast.meals || [])].sort((a,b)=>a.time-b.time)) {
    if (meal.time <= resume && meal.time + meal.pauseHours * H > resume) resume = meal.time + meal.pauseHours * H;
  }
  const wait = Math.max(0, resume - now) + (phase.h - hours) * H / calcMetabolicMultiplier(fast.profile);
  return { time: now + wait, hours: phase.h, phase, wait, resume };
}

export function graphInterval(fast, now, choice = 'all') {
  const span = choice === '6' ? 6 * H : choice === '24' ? 24 * H : now - fast.start;
  return { from: Math.max(fast.start, now - span), to: now };
}

export function graphSamples(fast, from, to) {
  if (to < from) return [];
  // At most one regular sample per five minutes; event boundaries are exact.
  const count = Math.floor((to - from) / 300000);
  const times = new Set([from, to]);
  for (let i = 1; i <= count; i++) times.add(from + i * 300000);
  for (const m of fast.meals || []) {
    for (const t of [m.time, m.time + m.pauseHours * H]) if (t >= from && t <= to) times.add(t);
  }
  for (const w of fast.workouts || []) {
    if (w.time >= from && w.time <= to) { times.add(Math.max(from, w.time - 1)); times.add(w.time); }
  }
  return [...times].sort((a, b) => a - b).map(time => ({ time, hours: metabolicHoursAt(fast, time) }));
}

let graphId = 0;
function savedInterval(fast, now) {
  try { const value = localStorage.getItem('fasta-graf-intervall'); if (['6','24','all'].includes(value)) return value; } catch { /* Optional preference. */ }
  return now - fast.start < 24 * H ? 'all' : '24';
}

export function fastenivaGraphHTML(fast, from, to, now = to, live = false) {
  if (!FEATURES.fastenivaa) return '';
  const id = `fastegraf-${++graphId}`;
  return `<section class="fastegraf ${live ? 'fastegraf-hero' : ''}" data-fastegraf="${id}">
    <div class="fastegraf-heading"><span class="eyebrow">Fastans framsteg</span><span data-quote class="fastegraf-quote"></span></div>
    ${live ? `<div class="fastegraf-interval" aria-label="Grafens tidsintervall">${[['6','6 h'],['24','24 h'],['all','Hela fastan']].map(([v,l]) => `<button type="button" data-interval="${v}" aria-pressed="false">${l}</button>`).join('')}</div>` : ''}
    <svg viewBox="0 0 360 420" preserveAspectRatio="none" class="fastegraf-svg" role="img" tabindex="0" aria-label="Fastans framsteg. Använd piltangenter för att följa grafen.">
      <defs><linearGradient id="${id}-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c8a84e" stop-opacity=".22"/><stop offset="1" stop-color="#c8a84e" stop-opacity="0"/></linearGradient><pattern id="${id}-hatch" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6L6 0" stroke="#c8a84e" stroke-opacity=".5"/></pattern></defs>
      ${PH.map((p,i) => `<rect x="0" y="${18+(7-i)*46}" width="360" height="46" fill="var(--fas-${i}, ${p.c})" opacity=".08"/><line x1="0" x2="360" y1="${18+(8-i)*46}" y2="${18+(8-i)*46}" stroke="${p.c}" opacity=".18"/><text x="8" y="${18+(7-i)*46+15}" class="fastegraf-band">${esc(p.l)}</text>`).join('')}
      <path data-area fill="url(#${id}-fill)"/><path data-line class="fastegraf-line"/><path data-tail class="fastegraf-line"/><path data-forecast class="fastegraf-forecast"/>
      <path data-glyc class="fastegraf-glyc" hidden/><g data-hatch></g><g data-events></g><g data-ticks></g>
      <circle data-now r="4" class="fastegraf-now"/><g data-now-label aria-hidden="true"><text class="fastegraf-price"></text><text class="fastegraf-price"></text></g><g data-cross hidden><line y1="18" y2="386" class="fastegraf-cross"/><circle r="4" fill="#f5f5f0"/></g>
    </svg>
    <p data-inspect class="fastegraf-inspect" aria-live="polite"></p>
    <p class="fasteniva-note">${esc(FASTENIVA_TEXT.markning)}</p>
    <p data-reading class="fasteniva-row"></p><p data-next class="fastegraf-next"></p>
    <div class="fastegraf-legend"><span>▧ Måltidspåverkan</span><span>↑ Träning</span><label><input type="checkbox" data-glyc-toggle> Visa leverns sockerlager</label></div>
    <p data-profile class="fasteniva-profile"></p>
    <ul class="fasteniva-events">${[...(fast.meals || []).filter(m=>m.time>=from && m.time<=now).map(m=>`${fmtT(m.time)} · ${esc(FASTENIVA.KATEGORIER.find(k=>k.id===m.foodType)?.etikett || 'Tidigare måltid · sparad paus')}`), ...(fast.workouts || []).filter(w=>w.time>=from && w.time<=now).map(w=>`${fmtT(w.time)} · ${esc(w.type)}`)].map(l=>`<li>${l}</li>`).join('')}</ul>
  </section>`;
}

const controllers = new WeakMap();
export function bindFastegraf(root, fast, from, to, now = to, live = false) {
  if (!root) return;
  const q = selector => root.querySelector(selector);
  const controller = { fast, now, live, choice: savedInterval(fast, now), from, to, last: -Infinity, inspect: null };
  controllers.set(root, controller);
  const redraw = () => drawFastegraf(root, true);
  root.querySelectorAll('[data-interval]').forEach(button => button.addEventListener('click', () => {
    controller.choice = button.dataset.interval;
    try { localStorage.setItem('fasta-graf-intervall', controller.choice); } catch { /* Optional preference. */ }
    redraw();
  }));
  q('[data-glyc-toggle]').addEventListener('change', e => { q('[data-glyc]').toggleAttribute('hidden', !e.target.checked); });
  const svg = q('svg');
  const inspect = event => {
    const box = svg.getBoundingClientRect();
    controller.inspect = Math.max(controller.from, Math.min(controller.now, controller.from + ((event.clientX-box.left)/box.width*360-8)/344*(controller.to-controller.from)));
    showInspection(root);
  };
  svg.addEventListener('pointerdown', event => { svg.setPointerCapture(event.pointerId); inspect(event); });
  svg.addEventListener('pointermove', event => { if (event.pointerType === 'mouse' || svg.hasPointerCapture(event.pointerId)) inspect(event); });
  const reset = () => { controller.inspect = null; showInspection(root); };
  svg.addEventListener('pointerup', reset); svg.addEventListener('pointercancel', reset); svg.addEventListener('pointerleave', reset);
  svg.addEventListener('blur', reset);
  svg.addEventListener('keydown', event => {
    if (event.key === 'Escape') { reset(); return; }
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    controller.inspect = event.key === 'Home' ? controller.from : event.key === 'End' ? controller.now : Math.max(controller.from, Math.min(controller.now, (controller.inspect ?? controller.now) + (event.key === 'ArrowLeft' ? -1 : 1)*300000));
    showInspection(root);
  });
  redraw();
}

function showInspection(root) {
  const c = controllers.get(root), group = root.querySelector('[data-cross]');
  group.toggleAttribute('hidden', c.inspect === null);
  const t = c.inspect ?? c.now, hours = metabolicHoursAt(c.fast, t);
  const phase = PH[Math.min(7, Math.floor(phasePosition(hours)))];
  if (c.inspect !== null) {
    const x = c.x(t), y = c.y(hours);
    group.querySelector('line').setAttribute('x1', x); group.querySelector('line').setAttribute('x2', x);
    group.querySelector('circle').setAttribute('cx', x); group.querySelector('circle').setAttribute('cy', y);
  }
  const events = [...(c.fast.meals || []).map(m => ({time:m.time, label:FASTENIVA.KATEGORIER.find(k => k.id === m.foodType)?.etikett || m.desc || 'Måltid'})), ...(c.fast.workouts || []).map(w => ({time:w.time,label:w.type || 'Träning'}))].filter(e => Math.abs(e.time-t) <= 150000);
  root.querySelector('[data-inspect]').textContent = `${fmtT(t)} · ${phase.l} · ${fmtHours(hours)}${c.inspect !== null && events.length ? ' · '+events.map(e => e.label).join(', ') : ''}`;
}
function fmtHours(hours) {
  const minutes = Math.floor(hours * 60);
  return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
}

export function updateFastegraf(root, fast, now) {
  const c = controllers.get(root); if (!c) return;
  c.fast = fast; c.now = now;
  drawFastegraf(root, false);
}
function drawFastegraf(root, force) {
  const c = controllers.get(root), q = s => root.querySelector(s), r = fastenivaReading(c.fast, c.now);
  const forecast = c.live ? nextPhaseForecast(c.fast, c.now) : null;
  const signature = JSON.stringify([c.fast.meals,c.fast.workouts,c.fast.profile]);
  if (force || signature !== c.signature || c.now-c.last >= 60000 || c.now < c.last) {
    if (c.live) {
      c.from = graphInterval(c.fast,c.now,c.choice).from;
      c.to = Math.max(c.now + Math.max(300000,(c.now-c.from)*.25), forecast?.time || 0);
    }
    c.to = Math.max(c.from+300000,c.to);
    c.x = t => 8+(t-c.from)/(c.to-c.from)*344;
    c.y = h => 386-phasePosition(h)*46;
    const samples = graphSamples(c.fast,Math.max(c.fast.start,c.from),Math.min(c.now,c.to));
    const path = samples.map((p,i) => `${i?'L':'M'}${c.x(p.time).toFixed(2)},${c.y(p.hours).toFixed(2)}`).join(' ');
    q('[data-line]').setAttribute('d',path);
    q('[data-area]').setAttribute('d',samples.length ? `${path} L${c.x(samples.at(-1).time)},386 L${c.x(samples[0].time)},386 Z` : '');
    q('[data-glyc]').setAttribute('d',samples.map((p,i) => `${i?'L':'M'}${c.x(p.time)},${386-liverGlycogenShare(p.hours)*368}`).join(' '));
    c.anchor = samples.at(-1); c.last = c.now; c.signature = signature;
    const visible = t => t >= c.from && t <= Math.min(c.now,c.to);
    const markers = [...(c.fast.meals || []).filter(m => visible(m.time)).map(m => ({time:m.time, icon:'•', label:FASTENIVA.KATEGORIER.find(k=>k.id===m.foodType)?.etikett || 'Tidigare måltid'})), ...(c.fast.workouts || []).filter(w=>visible(w.time)).map(w=>({time:w.time,icon:'↑',label:w.type || 'Träning'}))];
    q('[data-events]').innerHTML = markers.map(e=>`<g><title>${esc(e.label)} · ${fmtT(e.time)}</title><circle cx="${c.x(e.time)}" cy="${c.y(metabolicHoursAt(c.fast,e.time))}" r="4" fill="#c8a84e"/><text x="${c.x(e.time)}" y="${c.y(metabolicHoursAt(c.fast,e.time))-10}" text-anchor="middle" class="fastegraf-marker">${e.icon}</text></g>`).join('');
    q('[data-hatch]').innerHTML = (c.fast.meals || []).map(m=> {
      const a=Math.max(c.from,m.time), b=Math.min(c.to,c.now,m.time+(m.pauseHours || 0)*H);
      return b>a ? `<rect x="${c.x(a)}" y="374" width="${c.x(b)-c.x(a)}" height="12" fill="url(#${root.dataset.fastegraf}-hatch)"/>` : '';
    }).join('');
    q('[data-ticks]').innerHTML = Array.from({length:4},(_,i)=>{ const t=c.from+(c.to-c.from)*i/3; return `<text x="${c.x(t)}" y="409" text-anchor="${i===0?'start':i===3?'end':'middle'}">${fmtT(t)}</text>`; }).join('');
    root.querySelectorAll('[data-interval]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.interval===c.choice)));
  }
  const x=c.x(c.now), y=c.y(r.hours);
  const labelX = Math.min(270, x + 10), labelY = Math.max(30, Math.min(356, y + 18));
  q('[data-now-label]').setAttribute('transform', `translate(${labelX},${labelY})`);
  const labels = q('[data-now-label]').querySelectorAll('text');
  labels[0].textContent = PH[r.phaseIndex].l; labels[1].textContent = `${fmtHours(r.hours)} · Fas ${r.phaseIndex+1}`; labels[1].setAttribute('y',14);
  q('[data-now]').setAttribute('cx',x); q('[data-now]').setAttribute('cy',y);
  q('[data-tail]').setAttribute('d',c.anchor ? `M${c.x(c.anchor.time)},${c.y(c.anchor.hours)} L${x},${y}` : '');
  q('[data-forecast]').setAttribute('d',forecast ? `M${x},${y} L${c.x(forecast.resume)},${y} L${c.x(forecast.time)},${c.y(forecast.hours)}` : '');
  q('[data-quote]').textContent = `${PH[r.phaseIndex].l} · Fas ${r.phaseIndex+1} av ${PH.length} · ${fmtHours(r.hours)}`;
  q('[data-reading]').textContent=r.text; q('[data-profile]').textContent=r.profileText;
  q('[data-next]').textContent=forecast ? `Nästa: ${forecast.phase.l} om ${duration(forecast.wait)}` : '';
  q('svg').setAttribute('aria-label',`${PH[r.phaseIndex].l}, metabolisk tid ${fmtHours(r.hours)}. ${q('[data-next]').textContent} Använd piltangenter för att följa grafen.`);
  showInspection(root);
}
