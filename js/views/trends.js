// Presentation of check-ins; all summaries come from checkin.js.
import { checkinDays, dayKey, addDays, weekAverages, weightSeries, firstWeekDrop, symptomCounts, weighingFor, targetInfo, checkinFor } from '../checkin.js';
import { CHECKIN_TEXT, CHECKIN_SYMPTOMS } from '../data.js';
import { latestGoal } from '../program.js';
import { snapshot, removeCheckin, checkinView, SaveRefused } from '../state.js';
import { esc } from '../helpers.js';

const labels = { energy: 'Energi', hunger: 'Hunger', sleep: 'Sömn' };
const number = n => n === null ? '–' : n.toLocaleString('sv-SE', { maximumFractionDigits: 1 });
const date = day => new Date(`${day}T12:00:00`).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
const buttonStyle = 'min-width:44px;min-height:44px;border:1px solid #444;border-radius:8px;background:#1a1a1a;color:#f5f5f0;font:inherit;cursor:pointer;padding:8px';

function weightChart(series, target, today) {
  const values = series.flatMap(p => [p.weight, p.avg7]);
  if (target) values.push(target.target);
  const low = Math.min(...values) - 0.5, high = Math.max(...values) + 0.5;
  const days = checkinDays([], addDays(today, -55), today).map(d => d.day);
  const x = day => 40 + days.indexOf(day) / 55 * 270;
  const y = value => 16 + (high - value) / (high - low) * 128;
  return `<svg viewBox="0 0 330 175" role="img" aria-label="Vikt de senaste åtta veckorna. Punkter visar vägningar och linjen visar sjudagarssnitt." style="display:block;width:100%">
    <text x="0" y="20" fill="#b6b6aa" font-size="12">${number(high)}</text>
    <text x="0" y="148" fill="#b6b6aa" font-size="12">${number(low)}</text>
    ${target ? `<path d="M40 ${y(target.target)} H310" stroke="#b6b6aa" stroke-dasharray="5 4"/>` : ''}
    <polyline points="${series.map(p => `${x(p.day)},${y(p.avg7)}`).join(' ')}" fill="none" stroke="#c8a84e" stroke-width="2"/>
    ${series.map(p => `<circle cx="${x(p.day)}" cy="${y(p.weight)}" r="3" fill="#f5f5f0"><title>${date(p.day)}: ${number(p.weight)} kg</title></circle>`).join('')}
    <text x="40" y="170" fill="#b6b6aa" font-size="12">${date(days[0])}</text>
    <text x="310" y="170" text-anchor="end" fill="#b6b6aa" font-size="12">I dag</text>
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
  return `<section id="trends" aria-labelledby="trends-title" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:16px;margin-bottom:22px">
    <h2 id="trends-title" style="font-size:19px;margin:0 0 8px">Så har du mått</h2>
    <p style="color:#b6b6aa;font-size:13px">Senaste 28 dagarna · skalor 1–5. Bläddra i sidled och tryck på en dag för detaljer.</p>
    ${!hasCheckins ? '<p>Inga check-in ännu.</p>' : ''}
    ${Object.keys(labels).every(k => weeks.thisWeek[k] === null) ? '<p>Gör check-in några dagar till, så syns dina snitt här.</p>' : ''}
    ${Object.entries(labels).map(([key, label]) => `<p style="font-size:13px;margin:8px 0"><strong>${label}</strong>: ${number(weeks.thisWeek[key])} den här veckan · förra veckan ${number(weeks.lastWeek[key])}</p>`).join('')}
    <div data-trend-scroll tabindex="0" role="region" aria-label="Dagliga värden, bläddra i sidled" style="overflow-x:auto;margin-top:14px">
      <div style="display:flex;width:max-content;gap:2px">
        ${days.map(({ day, checkin: c }) => `<button data-trend-day="${day}" aria-label="${date(day)}. ${Object.entries(labels).map(([k, l]) => `${l} ${c?.[k] ?? 'saknas'}`).join(', ')}" style="${buttonStyle};width:44px;padding:3px;border-color:transparent">
          ${Object.keys(labels).map(k => `<span style="display:flex;height:46px;align-items:flex-end;justify-content:center;border-bottom:1px solid #444;margin-bottom:8px"><span style="display:block;width:12px;height:${(c?.[k] ?? 0) * 8}px;background:#c8a84e;border-radius:3px 3px 0 0"></span></span>`).join('')}
          <span style="font-size:11px">${Number(day.slice(8))}/${Number(day.slice(5, 7))}</span>
        </button>`).join('')}
      </div>
    </div>
    <p style="font-size:12px;color:#b6b6aa">Uppifrån: Energi, Hunger, Sömn. Tom stapel = inget värde.</p>
    ${Object.keys(symptoms).length ? `<p style="font-size:13px">Senaste 28 dagarna: ${Object.entries(symptoms).map(([k, n]) => `${CHECKIN_SYMPTOMS[k]} ${n} ${n === 1 ? 'dag' : 'dagar'}`).join(' · ')}</p>` : ''}
    ${showWeight ? `<h3 style="font-size:16px;margin:20px 0 8px">Vikt</h3>${series.length >= 2 ? weightChart(series, target, today) : '<p>Viktkurvan visas när det finns minst två vägningar under de senaste åtta veckorna.</p>'}
      ${target ? `<p>Målvikt: ${number(target.target)} kg${target.left === null ? '' : ` · ${number(target.left)} kg kvar`}${series.length >= 2 ? ' (streckad linje)' : ''}</p>` : ''}
      <p style="font-size:13px">Snitt den här veckan ${number(weeks.thisWeek.weight)} kg · förra veckan ${number(weeks.lastWeek.weight)} kg</p>
      ${series.length >= 2 ? `<p style="font-size:12px;color:#b6b6aa">Punkter: vägningar · guldlinje: sjudagarssnitt</p><details><summary style="${buttonStyle}">Visa vägningar som text</summary>${series.map(p => `<button data-trend-day="${p.day}" style="${buttonStyle};display:block;width:100%;text-align:left;margin-top:4px">${date(p.day)}: ${number(p.weight)} kg · snitt ${number(p.avg7)} kg</button>`).join('')}</details>` : ''}
      ${series.length >= 2 && firstWeekDrop(events) ? `<p style="font-size:13px;line-height:1.6">${esc(CHECKIN_TEXT.viktForstaVeckan)}<br><span style="color:#b6b6aa">Källa: ${esc(CHECKIN_TEXT.viktForstaVeckanSrc)}</span></p>` : ''}` : ''}
    <div data-trend-detail tabindex="-1" aria-live="polite"></div>
  </section>`;
}

export function bindTrends(content, events, profile, refresh) {
  // Handler on the section, so it goes away with the History view.
  const root = content.querySelector?.('#trends');
  if (root) root.onclick = e => {
    const button = e.target.closest('[data-trend-day]');
    if (!button) return;
    const day = button.dataset.trendDay;
    const c = checkinFor(events, day);
    const detail = content.querySelector('[data-trend-detail]');
    detail.innerHTML = `<h3>${date(day)}</h3>${c ? `<p>${Object.entries(labels).map(([k, l]) => `${l}: ${number(c[k])}`).join(' · ')}</p>
      ${weighingFor(profile) !== 'never' && c.weight !== null ? `<p>Vikt: ${number(c.weight)} kg</p>` : ''}
      <p>Besvär: ${c.symptoms.map(k => CHECKIN_SYMPTOMS[k]).join(', ') || 'Inga angivna'}</p>
      <button data-trend-delete style="${buttonStyle}">Radera denna check-in</button>` : '<p>Ingen check-in sparad denna dag.</p>'}`;
    detail.focus();
    detail.querySelector('[data-trend-delete]')?.addEventListener('click', () => {
      detail.innerHTML = `<h3>Radera check-in för ${date(day)}?</h3><p>Dagens värden tas bort. Det går inte att ångra.</p><button data-cancel style="${buttonStyle}">Avbryt</button> <button data-confirm style="${buttonStyle}">Radera</button>`;
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
