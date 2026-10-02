// ── FASTA — js/views/learn.js ──
// Learn section with science-based cards

import { LC } from '../data.js';
import { state } from '../state.js';
import { esc } from '../helpers.js';
import { openCardModal } from '../modals.js';

export function renderLearn() {
  const filterScroll = document.querySelector('.learn-filters')?.scrollLeft || 0;
  const cats = ['Alla', ...new Set(LC.map(c => c.cat))];
  const showing = state.learnFilter === 'Alla' ? [...new Set(LC.map(c => c.cat))] : [state.learnFilter];

  let html = `<div class="learn-view"><h1 class="view-title">Lär dig fasta</h1>
    <p class="view-intro">Tryck på ett kort för mer information</p>
    <div class="learn-filters" role="group" aria-label="Filtrera kort">
      ${cats.map(c => {
        const w = c === 'Vanliga farhågor', act = state.learnFilter === c;
        return `<button class="learn-filter${w ? ' learn-filter-warn' : ''}" data-filter="${c}" aria-pressed="${act}">${w ? '⚠️ ' + c : c}</button>`;
      }).join('')}
    </div>`;

  showing.forEach(cat => {
    const cards = LC.filter(c => c.cat === cat);
    const w = cat === 'Vanliga farhågor';
    html += `<section class="learn-section${w ? ' learn-section-warn' : ''}">
      <h2 class="eyebrow learn-category">${w ? '<span aria-hidden="true">⚠️</span>' : ''}${cat}</h2>
      ${w ? `<div class="warn-banner">Ersätter inte medicinsk rådgivning. Kontakta läkare vid befintlig hälsokondition.</div>` : ''}
      <div class="learn-grid">
        ${cards.map(card => `<div class="learn-card${w ? ' warn' : ''}" role="button" tabindex="0" data-card="${card.id - 1}" aria-label="${esc(card.f)}">
          <div class="learn-icon-box">${card.i}</div>
          <h3 class="learn-card-title">${card.f}</h3>
          <p class="learn-card-preview">${card.fb}</p>
          <div class="learn-card-link">Läs mer →</div>
        </div>`).join('')}
      </div>
    </section>`;
  });

  document.getElementById('content').innerHTML = html + '</div>';
  document.querySelector('.learn-filters').scrollLeft = filterScroll;
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      state.learnFilter = button.dataset.filter;
      renderLearn();
      [...document.querySelectorAll('[data-filter]')].find(b => b.dataset.filter === state.learnFilter)?.focus({ preventScroll: true });
    });
  });
  document.querySelectorAll('[data-card]').forEach(card => {
    card.addEventListener('click', () => openCardModal(Number(card.dataset.card)));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
}
