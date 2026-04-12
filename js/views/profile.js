// ── FASTA — js/views/profile.js ──
// Profile page for metabolic personalization

import { ACTIVITY_LABELS } from '../data.js';
import { profile, profileComplete, saveProfile } from '../state.js';
import { calcMetabolicMultiplier } from '../helpers.js';

export function renderProfile() {
  const pc = profileComplete();
  const mult = calcMetabolicMultiplier(profile);

  function radio(field, val, label) {
    const sel = profile[field] === val;
    return `<button class="profile-radio${sel ? ' selected' : ''}" onclick="window._setProfileField('${field}','${val}')">${label}</button>`;
  }

  let html = `<div style="font-size:21px;font-weight:800;color:#f5f5f0;margin-bottom:4px;letter-spacing:-.5px">Din profil</div>
    <div style="font-size:13px;color:#8a8a80;margin-bottom:20px">Används för att beräkna din personliga metabola fasttid</div>`;

  if (pc) {
    html += `<div style="background:rgba(200,168,78,0.08);border:1px solid rgba(200,168,78,0.22);border-radius:10px;padding:12px 14px;margin-bottom:16px;font-size:12px;color:#b5b5aa;line-height:1.6">
      <div style="font-weight:700;color:#c8a84e;margin-bottom:4px">✓ Profil klar</div>
      Din uppskattade multiplikator: <strong style="color:#c8a84e">${mult.toFixed(2)}x</strong> — din kropp ${mult > 1 ? 'når fasteeffekterna uppskattningsvis snabbare' : 'tar uppskattningsvis något längre tid att nå fasteeffekterna'} jämfört med referensvärdet.
    </div>`;
  }

  html += `<div class="card">
    <div class="profile-field"><label class="profile-label">Kön</label><div class="profile-radio-group">${radio('gender', 'man', 'Man')}${radio('gender', 'kvinna', 'Kvinna')}${radio('gender', 'annat', 'Ej specificerat')}</div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="profile-field"><label class="profile-label">Ålder (år)</label><input class="profile-input" type="number" min="10" max="110" placeholder="t.ex. 34" value="${profile.age || ''}" onchange="window._setProfileNum('age',parseInt(this.value)||null)"/></div>
      <div class="profile-field"><label class="profile-label">Vikt (kg)</label><input class="profile-input" type="number" min="30" max="250" placeholder="t.ex. 78" value="${profile.weight || ''}" onchange="window._setProfileNum('weight',parseFloat(this.value)||null)"/></div>
    </div>
    <div class="profile-field"><label class="profile-label">Längd (cm)</label><input class="profile-input" type="number" min="100" max="230" placeholder="t.ex. 178" value="${profile.height || ''}" style="max-width:180px" onchange="window._setProfileNum('height',parseFloat(this.value)||null)"/></div>
    <div class="profile-field" style="margin-bottom:0"><label class="profile-label">Aktivitetsnivå</label>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${Object.entries(ACTIVITY_LABELS).map(([val, label]) => {
          const sel = profile.activity === val;
          return `<button class="profile-radio${sel ? ' selected' : ''}" style="text-align:left;border-radius:10px;padding:10px 14px" onclick="window._setProfileField('activity','${val}')">${label}</button>`;
        }).join('')}
      </div>
    </div>
  </div>
  <div class="card"><div class="eyebrow">Hur beräknas den metabola effekten?</div>
    <p style="font-size:13px;color:#b5b5aa;line-height:1.7;margin-bottom:10px">Beräkningen uppskattar hur snabbt just din kropp förbrukar sina sockerlager (glykogen) baserat på din ämnesomsättning. Högre energiförbrukning = snabbare tömning = tidigare fasteeffekter.</p>
    <p style="font-size:12px;color:#8a8a80;line-height:1.7;margin-bottom:10px">En aktiv person med hög ämnesomsättning bränner igenom sina sockerlager snabbare och når ketos och cellstädning tidigare. Sockerlagren är ungefär lika stora i förhållande till kroppsstorlek — det som skiljer är hur snabbt du förbränner dem. Träningspass du loggar räknas in som extra bonus.</p>
    <p style="font-size:11px;color:#8a8a80;line-height:1.7;opacity:0.8">⚠️ Detta är en uppskattning, inte en exakt mätning. Verklig tid till ketos varierar mellan 12–36 timmar beroende på individ, kost och andra faktorer. Multiplikatorn ger max ±40% justering. Källor: Mifflin-St Jeor (BMR), Boer 1984 (kroppsmassa), Anton et al. 2018 (metabolic switch).</p>
  </div>`;

  document.getElementById('content').innerHTML = html;
}
