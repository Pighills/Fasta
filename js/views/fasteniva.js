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

let graphId = 0;
export function fastenivaGraphHTML(fast, from, to, now = to) {
  if (!FEATURES.fastenivaa || !(to > from)) return '';
  const id = `fasteniva-graph-${++graphId}`, meals = fast.meals || [], workouts = fast.workouts || [];
  const W = 600, left = 24, right = 576, top = 18, bottom = 188;
  const x = t => left + (t - from) / (to - from) * (right - left);
  const y = level => bottom - level * (bottom - top);
  const visible = t => t >= from && t <= to;
  const points = Array.from({ length: 181 }, (_, i) => {
    const t = from + (to - from) * i / 180;
    const hours = metabolicHoursAt(fast, t);
    return { t, x: x(t), y: y(estimateInsulinLevel(meals, workouts, t)), glyc: y(liverGlycogenShare(hours)), phase: PH.reduce((idx, p, n) => hours >= p.h ? n : idx, 0) };
  });
  const line = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const glyc = points.map(p => `${p.x.toFixed(1)},${p.glyc.toFixed(1)}`).join(' ');
  let zones = '', zoneStart = 0;
  for (let i = 1; i <= points.length; i++) {
    if (i < points.length && points[i].phase === points[zoneStart].phase) continue;
    const phase = points[zoneStart].phase, end = i < points.length ? points[i].x : right;
    zones += `<rect x="${points[zoneStart].x}" y="${top}" width="${end - points[zoneStart].x}" height="${bottom - top}" fill="${PH[phase].c}" opacity=".09"/><title>${esc(PH[phase].l)} · Fas ${phase + 1} av 8</title>`;
    zoneStart = i;
  }
  const reading = fastenivaReading(fast, now);
  const markers = meals.filter(m => visible(m.time)).map(m => {
    const cat = FASTENIVA.KATEGORIER.find(c => c.id === m.foodType);
    const label = cat?.etikett || 'Tidigare måltid · sparad paus';
    return `<g><title>${esc(label)} · ${fmtT(m.time)}</title><line x1="${x(m.time)}" x2="${x(m.time)}" y1="${top}" y2="${bottom}" stroke="#b5b5aa" stroke-dasharray="2 4"/><circle cx="${x(m.time)}" cy="${bottom}" r="3" fill="#c8a84e"/></g>`;
  }).join('');
  const training = workouts.filter(w => Number.isFinite(w.time)).map(w => {
    const start = Math.max(from, w.time - (w.durationMins || 0) * 60000), end = Math.min(to, w.time);
    return end > start ? `<rect x="${x(start)}" y="${top}" width="${Math.max(2, x(end) - x(start))}" height="${bottom - top}" fill="#b5b5aa" opacity=".25"><title>${esc(w.type)} · ${fmtT(start)}–${fmtT(end)}</title></rect>` : '';
  }).join('');
  const legacy = meals.filter(m => !FASTENIVA.KATEGORIER.some(c => c.id === m.foodType) && m.pauseHours > 0).map(m => {
    const a = Math.max(from, m.time), b = Math.min(to, m.time + m.pauseHours * H);
    return b > a ? `<rect x="${x(a)}" y="${bottom - 12}" width="${x(b) - x(a)}" height="12" fill="url(#${id}-hatch)"><title>Tidigare måltid · sparad paus</title></rect>` : '';
  }).join('');
  const ticks = Array.from({length:6}, (_, i) => {
    const t = from + (to - from) * i / 5;
    return `<text x="${x(t)}" y="212" text-anchor="${i === 0 ? 'start' : i === 5 ? 'end' : 'middle'}">${fmtT(t)}</text>`;
  }).join('');
  return `<div class="fasteniva-graph-wrap"><p class="fasteniva-note">${esc(FASTENIVA_TEXT.markning)}</p>
    <svg class="fasteniva-graph" viewBox="0 0 ${W} 222" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">Fastenivå ${Math.round(reading.fill)} %. ${esc(reading.text)}</title>
      <desc id="${id}-desc">Skrafferad måltidspåverkan, streckad tröskel, träningszoner och tunn linje för leverns glykogen. Fasnamn och måltider listas under grafen.</desc>
      <defs><pattern id="${id}-hatch" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6L6 0" stroke="#c8a84e" stroke-width="1"/></pattern></defs>
      ${zones}${training}<polygon points="${left},${bottom} ${line} ${right},${bottom}" fill="url(#${id}-hatch)"/>
      <polyline points="${line}" fill="none" stroke="#c8a84e" stroke-width="2"/>
      <line x1="${left}" x2="${right}" y1="${y(FASTENIVA.TROSKEL)}" y2="${y(FASTENIVA.TROSKEL)}" stroke="#b5b5aa" stroke-dasharray="5 4"/>
      <polyline points="${glyc}" fill="none" stroke="#f5f5f0" stroke-width="1.5"/>
      ${legacy}${markers}${visible(now) ? `<line x1="${x(now)}" x2="${x(now)}" y1="${top}" y2="${bottom}" stroke="#f5f5f0" stroke-dasharray="1 3"/>` : ''}${ticks}
    </svg>
    <div class="fasteniva-legend"><span>▧ Måltidspåverkan</span><span>┄ Tröskel för fastefönster</span><span>― Leverns glykogen</span><span>▥ Träning</span></div>
    <p class="fasteniva-row">${esc(reading.text)}</p>
    <ol class="fasteniva-graph-phases">${[...new Set(points.map(p => p.phase))].map(i => `<li class="phase-${i}">${esc(PH[i].l)} · Fas ${i + 1} av 8</li>`).join('')}</ol>
    ${meals.filter(m => visible(m.time)).length ? `<ul class="fasteniva-events">${meals.filter(m => visible(m.time)).map(m => `<li>${fmtT(m.time)} · ${esc(FASTENIVA.KATEGORIER.find(c => c.id === m.foodType)?.etikett || 'Tidigare måltid · sparad paus')}</li>`).join('')}</ul>` : ''}
    ${workouts.filter(w => visible(w.time)).length ? `<ul class="fasteniva-events">${workouts.filter(w => visible(w.time)).map(w => `<li>${fmtT(w.time)} · ${esc(w.type)} · ${w.durationMins || '–'} min</li>`).join('')}</ul>` : ''}
    </div>`;
}
