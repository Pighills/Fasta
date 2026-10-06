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

// Continuous growth between phase boundaries. Boundary changes animate in the view.
// A six-hour canvas is the only
// exception to the look-ahead limit, while a new fast is still short.
export function graphLookAhead(fast, now) {
  const elapsed = Math.max(0, now - fast.start);
  const ahead = Math.max(2 * H, elapsed * .15);
  const next = nextPhaseForecast(fast, now);
  return next ? Math.min(ahead, Math.max(0, next.time - now)) : ahead;
}
export function graphInterval(fast, now, choice = 'auto') {
  const elapsed = Math.max(0, now - fast.start);
  const span = ['6','12','24'].includes(choice) ? Number(choice)*H :
    choice === 'all' ? elapsed : Math.min(elapsed, 24*H);
  const from = Math.max(fast.start, now - span);
  return { from, to: Math.max(fast.start + 6*H, now + graphLookAhead(fast, now)) };
}
export function graphPhaseMarkers(hours) {
  const current = Math.min(PH.length-1, Math.floor(phasePosition(hours)));
  return PH.slice(0, Math.min(PH.length, current+2));
}
export function levelSamples(fast, from, to) {
  const count = Math.min(864, Math.max(1, Math.ceil((to-from)/300000)));
  return Array.from({length:count+1}, (_,i) => {
    const time = from + (to-from)*i/count;
    return {time, level: estimateInsulinLevel(fast.meals || [], fast.workouts || [], time)};
  });
}
// Monotone cubic interpolation: rounds corners without inventing extrema.
export function smoothGraphPath(points) {
  if (!points.length) return '';
  const slopes = points.slice(1).map((p,i)=>(p.y-points[i].y)/Math.max(.00001,p.x-points[i].x));
  const tangents = points.map((_,i)=>i===0 ? slopes[0] || 0 : i===points.length-1 ? slopes[i-1] :
    slopes[i-1]*slopes[i]<=0 ? 0 : 2*slopes[i-1]*slopes[i]/(slopes[i-1]+slopes[i]));
  return points.map((p,i)=>{
    if (!i) return 'M'+p.x.toFixed(2)+','+p.y.toFixed(2);
    const prev=points[i-1], dx=(p.x-prev.x)/3;
    return 'C'+(prev.x+dx).toFixed(2)+','+(prev.y+tangents[i-1]*dx).toFixed(2)+' '+
      (p.x-dx).toFixed(2)+','+(p.y-tangents[i]*dx).toFixed(2)+' '+p.x.toFixed(2)+','+p.y.toFixed(2);
  }).join(' ');
}

export function graphSamples(fast, from, to) {
  if (to < from) return [];
  // At most one regular sample per five minutes; event boundaries are exact.
  const step = Math.max(300000, (to-from)/864);
  const count = Math.floor((to - from) / step);
  const times = new Set([from, to]);
  for (let i = 1; i <= count; i++) times.add(from + i * step);
  for (const m of fast.meals || []) {
    for (const t of [m.time, m.time + m.pauseHours * H]) if (t >= from && t <= to) times.add(t);
  }
  for (const w of fast.workouts || []) {
    if (w.time >= from && w.time <= to) { times.add(Math.max(from, w.time - 1)); times.add(w.time); }
  }
  return [...times].sort((a, b) => a - b).map(time => ({ time, hours: metabolicHoursAt(fast, time) }));
}

let graphId = 0;
function savedInterval() {
  try { const value = localStorage.getItem('fasta-graf-intervall'); if (['auto','6','12','24','all'].includes(value)) return value; } catch { /* Optional preference. */ }
  return 'auto';
}

export function fastenivaGraphHTML(fast, from, to, now = to, live = false) {
  if (!FEATURES.fastenivaa) return '';
  const id = `fastegraf-${++graphId}`;
  return `<section class="fastegraf ${live ? 'fastegraf-hero' : ''}" data-fastegraf="${id}">
    <header class="fastegraf-focus">
      <div class="fastegraf-phase-copy"><h2 data-hero-name></h2><span data-quote class="fastegraf-quote"></span></div>
      <svg class="fastegraf-orbit" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="32" class="fastegraf-orbit-track"/><circle data-orbit cx="40" cy="40" r="32" pathLength="100"/><text data-progress x="40" y="45" text-anchor="middle"></text></svg>
    </header>
    <p data-phase-description class="fastegraf-description"></p>
    <div class="fastegraf-spectrum" aria-label="Fastans åtta faser">${PH.map((p,i)=>`<span class="phase-${i}" title="${esc(p.l)}"></span>`).join('')}</div>
    <div class="fastegraf-chart">
      <span class="fastegraf-estimate">${esc(FASTENIVA_TEXT.markning)}</span>
      ${live ? `<div class="fastegraf-interval" aria-label="Grafens tidsintervall">${[['auto','Auto'],['6','6 h'],['12','Senaste 12 h'],['24','24 h'],['all','Allt']].map(([v,l])=>`<button type="button" data-interval="${v}" aria-pressed="false">${l}</button>`).join('')}</div>` : ''}
      <svg viewBox="0 0 360 260" class="fastegraf-svg" role="img" tabindex="0" aria-label="Fastans framsteg. Använd piltangenter för att följa grafen.">
        <defs>
          <linearGradient id="${id}-line" gradientUnits="userSpaceOnUse" x1="0" y1="136" x2="0" y2="18" data-colors></linearGradient>
          <linearGradient id="${id}-fill" x1="0" y1="0" x2="0" y2="1"><stop data-fill-color stop-opacity=".24"/><stop offset="1" data-fill-color stop-opacity="0"/></linearGradient>
          <clipPath id="${id}-clip"><rect x="118" y="12" width="230" height="226"/></clipPath>
        </defs>
        <g data-bands></g>
        <g clip-path="url(#${id}-clip)"><g data-plot><path data-area fill="url(#${id}-fill)"/><path data-line class="fastegraf-line" stroke="url(#${id}-line)"/><path data-tail class="fastegraf-line"/><path data-forecast class="fastegraf-forecast"/><g data-events></g><g data-milestones></g><circle data-now r="4.5" class="fastegraf-now"/></g>
          <rect x="118" y="218.4" width="230" height="5.6" class="fastegraf-window"/>
          <g data-level-plot><path data-level class="fastegraf-level"/></g>
          <g data-cross hidden><line y1="18" y2="224" class="fastegraf-cross"/><circle r="4" class="fastegraf-cross-dot"/></g>
        </g>
        <text x="8" y="168" class="fastegraf-level-label">Insulinnivå</text><text x="8" y="185">Relativ · 0–100 %</text>
        <text x="8" y="223">Fastefönster</text>
        <text x="348" y="167" text-anchor="end" data-level-now></text>
        <g data-ticks></g>
      </svg>
    </div>
    <p data-inspect class="fastegraf-inspect" aria-live="polite" hidden></p>
    <div class="fastegraf-status"><p data-reading></p><p data-next class="fastegraf-next"></p></div>
    <details class="fastegraf-details"><summary>Visa mer</summary>
      <p data-detail-reading></p><p data-profile class="fasteniva-profile"></p>
      <p class="fasteniva-profile">${esc(FASTENIVA_TEXT.sakerhet[1])}</p>
      <div class="fastegraf-legend"><span>Måltidspåverkan · tunn kurva</span><span>Träning · markering på faslinjen</span></div>
      <ul class="fasteniva-events">${[...(fast.meals || []).filter(m=>m.time>=from && m.time<=now).map(m=>`${fmtT(m.time)} · ${esc(FASTENIVA.KATEGORIER.find(k=>k.id===m.foodType)?.etikett || 'Tidigare måltid · sparad paus')}`), ...(fast.workouts || []).filter(w=>w.time>=from && w.time<=now).map(w=>`${fmtT(w.time)} · ${esc(w.type)}`)].map(l=>`<li>${l}</li>`).join('')}</ul>
    </details>
  </section>`;
}

const controllers = new WeakMap();
export function bindFastegraf(root, fast, from, to, now = to, live = false) {
  if (!root) return;
  const controller = { fast, now, live, choice: savedInterval(), from, to, last: -Infinity, inspect: null };
  controllers.set(root, controller);
  root.querySelectorAll('[data-interval]').forEach(button => button.addEventListener('click', () => {
    controller.choice = button.dataset.interval;
    controller.inspect = null;
    try { localStorage.setItem('fasta-graf-intervall', controller.choice); } catch { /* Optional preference. */ }
    drawFastegraf(root, true);
  }));
  const svg = root.querySelector('.fastegraf-svg');
  const inspect = event => {
    const box = svg.getBoundingClientRect();
    controller.inspect = Math.max(controller.from, Math.min(controller.now, controller.from + ((event.clientX-box.left)/box.width*360-118)/230*(controller.to-controller.from)));
    showInspection(root);
  };
  svg.addEventListener('pointerdown', event => { svg.setPointerCapture(event.pointerId); inspect(event); });
  svg.addEventListener('pointermove', event => { if (event.pointerType === 'mouse' || svg.hasPointerCapture(event.pointerId)) inspect(event); });
  const reset = () => { controller.inspect = null; showInspection(root); };
  for (const name of ['pointerup','pointercancel','pointerleave','blur']) svg.addEventListener(name, reset);
  svg.addEventListener('keydown', event => {
    if (event.key === 'Escape') { reset(); return; }
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    controller.inspect = event.key === 'Home' ? controller.from : event.key === 'End' ? controller.now : Math.max(controller.from, Math.min(controller.now, (controller.inspect ?? controller.now) + (event.key === 'ArrowLeft' ? -1 : 1)*300000));
    showInspection(root);
  });
  drawFastegraf(root, true);
}

function fmtHours(hours) {
  const minutes = Math.floor(hours*60);
  return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
}
function showInspection(root) {
  const c = controllers.get(root), group = root.querySelector('[data-cross]');
  const visible = c.inspect !== null;
  group.toggleAttribute('hidden', !visible);
  const label = root.querySelector('[data-inspect]'); label.hidden = !visible;
  if (!visible) return;
  const t = c.inspect, hours = metabolicHoursAt(c.fast,t), phase = PH[Math.min(7, Math.floor(phasePosition(hours)))];
  const x=c.x(t), y=c.y(hours);
  group.querySelector('line').setAttribute('x1',x);group.querySelector('line').setAttribute('x2',x);
  group.querySelector('circle').setAttribute('cx',x);group.querySelector('circle').setAttribute('cy',y);
  label.textContent = `${fmtT(t)} · ${phase.l} · ${fmtHours(hours)} · nivå ${Math.round(estimateInsulinLevel(c.fast.meals || [],c.fast.workouts || [],t)*100)} %`;
}
export function updateFastegraf(root, fast, now) {
  const c=controllers.get(root);if(!c)return;
  c.fast=fast;c.now=now;drawFastegraf(root,false);
}
function drawFastegraf(root, force) {
  const c=controllers.get(root),q=s=>root.querySelector(s);
  const signature=JSON.stringify([c.fast.meals,c.fast.workouts,c.fast.profile]);
  // Expensive estimates and SVG paths run once per minute; the point moves each tick.
  const redraw=force || signature!==c.signature || c.now-c.last>=60000 || c.now<c.last;
  if(redraw) c.reading=fastenivaReading(c.fast,c.now);
  const r=c.reading, hours=metabolicHoursAt(c.fast,c.now), phaseIndex=Math.min(7,Math.floor(phasePosition(hours))),phase=PH[phaseIndex];
  root.classList.remove(...PH.map((_,i)=>`phase-${i}`));root.classList.add(`phase-${phaseIndex}`);
  if(redraw){
    const oldDomain=c.domain;
    if(c.live) Object.assign(c,graphInterval(c.fast,c.now,c.choice));
    c.to=Math.max(c.from+300000,c.to);
    const markers=graphPhaseMarkers(hours), bands=markers.length;
    c.x=t=>118+(t-c.from)/(c.to-c.from)*230;
    c.y=h=>136-Math.min(bands,phasePosition(h))*118/bands;
    c.domain={from:c.from,to:c.to,bands};
    const short=['Matsmältning','Tidig fasta','Mer fett','Lätt ketos','Ett dygn','Ketos','Två dygn','Tre dygn'];
    q('[data-bands]').innerHTML=markers.map((p,i)=>{
      const y=136-(i+1)*118/bands, height=118/bands;
      return `<rect x="118" y="${y}" width="230" height="${height}" fill="${p.c}" opacity=".12"/><line x1="118" x2="348" y1="${y+height}" y2="${y+height}" stroke="${p.c}" opacity=".2"/><circle cx="12" cy="${y+height/2}" r="3" fill="${p.c}"/><text x="21" y="${y+height/2+4}">${short[i]}</text>`;
    }).join('');
    q('[data-colors]').innerHTML=markers.flatMap((p,i)=>`<stop offset="${i/bands}" stop-color="${p.c}"/><stop offset="${(i+.85)/bands}" stop-color="${p.c}"/>`).join('');
    root.querySelectorAll('[data-fill-color]').forEach(stop=>stop.setAttribute('stop-color',phase.c));
    const samples=graphSamples(c.fast,Math.max(c.fast.start,c.from),Math.min(c.now,c.to));
    // A five-minute visual ease rounds the model's instantaneous workout bonus.
    // Inspection and the current point always retain the exact model values.
    const displayHours=p=>{
      let h=p.hours;
      for(const w of c.fast.workouts || []) if(p.time>=w.time && p.time<w.time+300000){
        const jump=metabolicHoursAt(c.fast,w.time)-metabolicHoursAt(c.fast,w.time-1);
        const t=(p.time-w.time)/300000;
        h-=Math.max(0,jump)*(1-t*t*(3-2*t));
      }
      return h;
    };
    const path=smoothGraphPath(samples.map(p=>({x:c.x(p.time),y:c.y(displayHours(p))})));
    q('[data-line]').setAttribute('d',path);
    q('[data-area]').setAttribute('d',samples.length ? `${path} L${c.x(samples.at(-1).time)},136 L${c.x(samples[0].time)},136 Z` : '');
    q('[data-level]').setAttribute('d',smoothGraphPath(levelSamples(c.fast,c.from,c.to).map(p=>({x:c.x(p.time),y:224-p.level*56}))));
    c.anchor=samples.at(-1);
    const visible=t=>t>=c.from && t<=Math.min(c.now,c.to);
    const markersEvents=[...(c.fast.meals || []).filter(m=>visible(m.time)).map(m=>({time:m.time,meal:true,label:FASTENIVA.KATEGORIER.find(k=>k.id===m.foodType)?.etikett || 'Tidigare måltid'})),...(c.fast.workouts || []).filter(w=>visible(w.time)).map(w=>({time:w.time,label:w.type || 'Träning'}))];
    q('[data-events]').innerHTML=markersEvents.map(e=>`<g><title>${esc(e.label)} · ${fmtT(e.time)}</title><circle cx="${c.x(e.time)}" cy="${c.y(metabolicHoursAt(c.fast,e.time))}" r="3" class="fastegraf-event"/>${!e.meal?`<path d="M${c.x(e.time)-3},${c.y(metabolicHoursAt(c.fast,e.time))+10} l3,-4 l3,4" class="fastegraf-workout"/>`:''}</g>`).join('');
    let lastMilestone=-Infinity;
    q('[data-milestones]').innerHTML=[16,24,36,48,72].map(h=>({h,t:c.fast.start+h*H})).filter(p=>visible(p.t)).map(p=>{
      const x=c.x(p.t),label=x-lastMilestone>=32 && x<332;
      if(label)lastMilestone=x;
      return `<g><line x1="${x}" x2="${x}" y1="138" y2="143" class="fastegraf-cross"/><title>${p.h} h faktisk fastetid</title>${label?`<text x="${x}" y="155" text-anchor="middle">${p.h} h</text>`:''}</g>`;
    }).join('');
    q('[data-ticks]').innerHTML=Array.from({length:3},(_,i)=>{const t=c.from+(c.to-c.from)*i/2;return `<text x="${c.x(t)}" y="249" text-anchor="${i===0?'start':i===2?'end':'middle'}">${fmtT(t)}</text>`;}).join('');
    root.querySelectorAll('[data-interval]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.interval===c.choice)));
    const forecast=c.live?nextPhaseForecast(c.fast,c.now):null;
    if(forecast){const end=Math.min(c.to,forecast.time);const projected=hours+Math.max(0,end-forecast.resume)*calcMetabolicMultiplier(c.fast.profile)/H;q('[data-forecast]').setAttribute('d',smoothGraphPath([{x:c.x(c.now),y:c.y(hours)},{x:c.x(Math.min(end,forecast.resume)),y:c.y(hours)},{x:c.x(end),y:c.y(projected)}]));}
    else q('[data-forecast]').setAttribute('d','');
    q('[data-reading]').textContent=r.wait>0?FASTENIVA_TEXT.rad[0].replace('{tid}',duration(r.wait)):FASTENIVA_TEXT.rad[1];
    q('[data-detail-reading]').textContent=r.text;q('[data-profile]').textContent=r.profileText;
    q('[data-next]').textContent=forecast?`Nästa: ${forecast.phase.l} om ${duration(forecast.wait)}`:'';
    q('[data-level-now]').textContent=`${Math.round(r.level*100)} %`;
    if(c.last!==-Infinity){q('[data-now]').classList.remove('is-updated');void q('[data-now]').getBoundingClientRect();q('[data-now]').classList.add('is-updated');}
    c.last=c.now;c.signature=signature;
    animateScale(root,c,oldDomain);
  }
  const x=c.x(Math.min(c.now,c.to)),y=c.y(hours);
  q('[data-now]').setAttribute('cx',x);q('[data-now]').setAttribute('cy',y);
  q('[data-tail]').setAttribute('d',c.anchor?`M${c.x(c.anchor.time)},${c.y(c.anchor.hours)} L${x},${y}`:'');
  const progress=Math.round((phasePosition(hours)-phaseIndex)*100);
  q('[data-orbit]').setAttribute('stroke-dasharray',`${progress} 100`);
  q('[data-progress]').textContent=`${progress} %`;
  q('[data-hero-name]').textContent=phase.l;
  q('[data-quote]').textContent=`Fas ${phaseIndex+1} av ${PH.length} · ${fmtHours(hours)}`;
  q('[data-phase-description]').textContent=phase.d.split('. ')[0]+'.';
  root.querySelector('.fastegraf-svg').setAttribute('aria-label',`${phase.l}, metabolisk tid ${fmtHours(hours)}. Relativ insulinnivå ${Math.round(r.level*100)} procent, uppskattning. ${q('[data-next]').textContent} Använd piltangenter för att följa grafen.`);
  showInspection(root);
}

function animateScale(root,c,old) {
  if(c.frame) cancelAnimationFrame(c.frame);
  const plot=root.querySelector('[data-plot]'),level=root.querySelector('[data-level-plot]');
  plot.removeAttribute('transform');level.removeAttribute('transform');
  if(!old || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  const sx=(c.to-c.from)/(old.to-old.from),sy=c.domain.bands/old.bands;
  const tx=118*(1-sx)+(c.from-old.from)/(old.to-old.from)*230;
  // Minute-by-minute growth is already subpixel; animate interval/phase jumps only.
  if(Math.abs(sx-1)<.02 && Math.abs(tx)<1 && sy===1)return;
  const began=performance.now();
  const frame=time=>{
    if(!root.isConnected)return;
    const progress=Math.min(1,(time-began)/240),remaining=(1-progress)**3;
    const x=1+(sx-1)*remaining,y=1+(sy-1)*remaining;
    plot.setAttribute('transform',`matrix(${x} 0 0 ${y} ${tx*remaining} ${136*(1-y)})`);
    level.setAttribute('transform',`matrix(${x} 0 0 1 ${tx*remaining} 0)`);
    if(progress<1)c.frame=requestAnimationFrame(frame);
    else{plot.removeAttribute('transform');level.removeAttribute('transform');c.frame=null;}
  };
  c.frame=requestAnimationFrame(frame);
}
