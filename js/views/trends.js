// Presentation of check-ins; all summaries come from checkin.js.
import { checkinDays, dayKey, addDays, weekAverages, weightSeries, firstWeekDrop, symptomCounts, weighingFor, targetInfo, checkinFor } from '../checkin.js';
import { CHECKIN_TEXT, CHECKIN_SYMPTOMS } from '../data.js';
import { latestGoal } from '../program.js';
import { snapshot, removeCheckin, checkinView, SaveRefused } from '../state.js';
import { esc } from '../helpers.js';
import { openCheckinModal } from '../modals.js';

const labels = { energy: 'Energi', hunger: 'Hunger', sleep: 'Sömn' };
const number = n => n === null ? '–' : n.toLocaleString('sv-SE', { maximumFractionDigits: 1 });
const date = day => new Date(`${day}T12:00:00`).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });

function weightChart(series, target, today) {
  const values = series.flatMap(p => [p.weight, p.avg7]);
  if (target) values.push(target.target);
  const low = Math.min(...values) - 0.5, high = Math.max(...values) + 0.5;
  const days = checkinDays([], addDays(today, -55), today).map(d => d.day);
  const x = day => 40 + days.indexOf(day) / 55 * 270;
  const y = value => 16 + (high - value) / (high - low) * 128;
  return `<svg class="trend-weight-chart" viewBox="0 0 330 175" role="img" aria-label="Vikt de senaste åtta veckorna. Punkter visar vägningar och linjen visar sjudagarssnitt.">
    <text x="0" y="20">${number(high)}</text>
    <text x="0" y="148">${number(low)}</text>
    ${target ? `<path class="trend-target" d="M40 ${y(target.target)} H310" stroke-dasharray="5 4"/>` : ''}
    <polyline class="trend-average" points="${series.map(p => `${x(p.day)},${y(p.avg7)}`).join(' ')}"/>
    ${series.map(p => `<circle cx="${x(p.day)}" cy="${y(p.weight)}" r="3"><title>${date(p.day)}: ${number(p.weight)} kg</title></circle>`).join('')}
    <text x="40" y="170">${date(days[0])}</text>
    <text x="310" y="170" text-anchor="end">I dag</text>
  </svg>`;
}

export function trendsHTML(events, profile, now = Date.now()) {
  const today = dayKey(now), from = addDays(today, -27);
  const days = checkinDays(events, from, today);
  const weeks = weekAverages(events, now);
  const symptoms = symptomCounts(events, from, today);
  const showWeight = weighingFor(profile) !== 'never';
  const series = showWeight ? weightSeries(events, now) : [];
  const target = targetInfo(latestGoal(events, now).targetWeight, events, profile);
  const hasCheckins = days.some(d => d.checkin);
  return `<section id="trends" class="trend-card" aria-labelledby="trends-title">
    <h2 id="trends-title" class="trend-title">Så har du mått</h2>
    ${!hasCheckins ? '<div class="trend-empty"><p>Inga check-in ännu.</p><button class="history-button" data-trend-checkin>Gör dagens check-in</button></div>' : `
    <p class="trend-intro">Senaste 28 dagarna · skalor 1–5. Bläddra i sidled och tryck på en dag för detaljer.</p>
    ${Object.keys(labels).every(k => weeks.thisWeek[k] === null) ? '<p>Gör check-in några dagar till, så syns dina snitt här.</p>' : ''}
    ${Object.entries(labels).map(([key, label]) => `<p class="trend-week"><strong>${label}</strong>: ${number(weeks.thisWeek[key])} den här veckan · förra veckan ${number(weeks.lastWeek[key])}</p>`).join('')}
    <div class="trend-scroll" data-trend-scroll tabindex="0" role="region" aria-label="Dagliga värden, bläddra i sidled">
      <div class="trend-days">
        ${days.map(({ day, checkin: c }) => `<button class="trend-day" data-trend-day="${day}" aria-label="${date(day)}. ${Object.entries(labels).map(([k, l]) => `${l} ${c?.[k] ?? 'saknas'}`).join(', ')}">
          ${Object.keys(labels).map(k => `<span class="trend-bar-track"><span class="trend-bar trend-level-${c?.[k] ?? 0}"></span></span>`).join('')}
          <span class="trend-day-label">${Number(day.slice(8))}/${Number(day.slice(5, 7))}</span>
        </button>`).join('')}
      </div>
    </div>
    <p class="trend-caption">Uppifrån: Energi, Hunger, Sömn. Tom stapel = inget värde.</p>
    ${Object.keys(symptoms).length ? `<p>Senaste 28 dagarna: ${Object.entries(symptoms).map(([k, n]) => `${CHECKIN_SYMPTOMS[k]} ${n} ${n === 1 ? 'dag' : 'dagar'}`).join(' · ')}</p>` : ''}`}
    ${showWeight && (hasCheckins || series.length || target) ? `<h3 class="trend-title trend-weight-title">Vikt</h3>${series.length >= 2 ? weightChart(series, target, today) : '<p>Viktkurvan visas när det finns minst två vägningar under de senaste åtta veckorna.</p>'}
      ${target ? `<p>Målvikt: ${number(target.target)} kg${target.left === null ? '' : ` · ${number(target.left)} kg kvar`}${series.length >= 2 ? ' (streckad linje)' : ''}</p>` : ''}
      ${hasCheckins ? `<p>Snitt den här veckan ${number(weeks.thisWeek.weight)} kg · förra veckan ${number(weeks.lastWeek.weight)} kg</p>` : ''}
      ${series.length >= 2 ? `<p class="trend-caption">Punkter: vägningar · guldlinje: sjudagarssnitt</p><details class="trend-weighings"><summary class="history-button">Visa vägningar som text</summary>${series.map(p => `<button class="history-button trend-weighing" data-trend-day="${p.day}">${date(p.day)}: ${number(p.weight)} kg · snitt ${number(p.avg7)} kg</button>`).join('')}</details>` : ''}
      ${series.length >= 2 && firstWeekDrop(events) ? `<p>${esc(CHECKIN_TEXT.viktForstaVeckan)}<br><span class="trend-source">Källa: ${esc(CHECKIN_TEXT.viktForstaVeckanSrc)}</span></p>` : ''}` : ''}
    <div class="trend-detail" data-trend-detail tabindex="-1" aria-live="polite"></div>
  </section>`;
}

export function bindTrends(content, events, profile, refresh) {
  // Handler on the section, so it goes away with the History view.
  const root = content.querySelector?.('#trends');
  root?.querySelector('[data-trend-checkin]')?.addEventListener('click', openCheckinModal);
  if (root) root.onclick = e => {
    const button = e.target.closest('[data-trend-day]');
    if (!button) return;
    const day = button.dataset.trendDay;
    const c = checkinFor(events, day);
    const detail = content.querySelector('[data-trend-detail]');
    detail.innerHTML = `<h3>${date(day)}</h3>${c ? `<p>${Object.entries(labels).map(([k, l]) => `${l}: ${number(c[k])}`).join(' · ')}</p>
      ${weighingFor(profile) !== 'never' && c.weight !== null ? `<p>Vikt: ${number(c.weight)} kg</p>` : ''}
      <p>Besvär: ${c.symptoms.map(k => CHECKIN_SYMPTOMS[k]).join(', ') || 'Inga angivna'}</p>
      <button data-trend-delete class="history-button trend-delete">Radera denna check-in</button>` : '<p>Ingen check-in sparad denna dag.</p>'}`;
    detail.focus();
    detail.querySelector('[data-trend-delete]')?.addEventListener('click', () => {
      detail.innerHTML = `<h3>Radera check-in för ${date(day)}?</h3><p>Dagens värden tas bort. Det går inte att ångra.</p><button data-cancel class="history-button">Avbryt</button> <button data-confirm class="history-button trend-delete">Radera</button>`;
      detail.querySelector('[data-cancel]').addEventListener('click', () => button.click());
      detail.querySelector('[data-cancel]').focus();
      detail.querySelector('[data-confirm]').addEventListener('click', () => {
        if (JSON.stringify(checkinView(day)) !== JSON.stringify(c)) {
          detail.textContent = 'Dagens uppgifter har ändrats. Öppna Historik igen innan du raderar.';
          return;
        }
        try {
          removeCheckin(day);
          refresh();
          const result = content.querySelector('[data-trend-detail]');
          result.textContent = 'Check-in raderad.';
          result.focus();
        } catch (error) {
          detail.textContent = error instanceof SaveRefused ? 'Kunde inte radera. Ladda om appen och försök igen.' : 'Kunde inte radera. Försök igen.';
        }
      });
    });
  };
  const scroll = content.querySelector?.('[data-trend-scroll]');
  if (scroll) scroll.scrollLeft = scroll.scrollWidth;
}

export function trendData() {
  try { return snapshot(); } catch { return null; }
}
