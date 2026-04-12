// ── FASTA — js/helpers.js ──
// Formatting, phase lookup, and metabolic calculations

import { PH, BENEFITS } from './data.js';
import { state, profile, profileComplete } from './state.js';

// ── Formatters ──

export function fmt(ms) {
  if (ms < 0) ms = 0;
  const t = Math.floor(ms / 1000);
  return {
    h: String(Math.floor(t / 3600)).padStart(2, '0'),
    m: String(Math.floor((t % 3600) / 60)).padStart(2, '0'),
    s: String(t % 60).padStart(2, '0'),
  };
}

export function fmtHuman(ms) {
  if (ms < 0) ms = 0;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function fmtT(d) {
  return new Date(d).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
}

export function fmtD(d) {
  return new Date(d).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

// ── Phase & benefit lookup ──

export function getPhase(h) {
  let c = PH[0];
  for (const p of PH) { if (h >= p.h) c = p; else break; }
  return c;
}

export function getNext(h) {
  for (const p of PH) { if (h < p.h) return p; }
  return null;
}

export function getBenefits(h) {
  return BENEFITS.filter(b => h >= b.h);
}

// ── Time calculations ──

export function calcElapsed() {
  if (!state.fasting || !state.startTime) return 0;
  const raw = state.now - state.startTime;
  const paused = state.meals.reduce((a, m) => {
    const pe = m.time + m.pauseHours * 3600000;
    if (state.now < m.time) return a;
    return a + Math.min(state.now, pe) - m.time;
  }, 0);
  return Math.max(0, raw - paused);
}

// ── Metabolic calculations ──
// The metabolic multiplier estimates how fast you deplete glycogen and enter
// fasting states relative to a reference person. It is an APPROXIMATION based
// on established formulas (Mifflin-St Jeor BMR, Boer LBM) and published
// glycogen data (Acheson et al. 1988, Murray & Rosenbloom 2018).
//
// Key assumptions:
// - Higher TDEE → faster glycogen depletion → earlier metabolic switch
// - Active individuals start with partially depleted glycogen from training
// - The multiplier is applied linearly, which is a simplification
// - Real individual variation in time-to-ketosis is ~12–36h (Anton et al. 2018)
//
// Glycogen values per kg LBM (note: LBM ≈ 1.5× muscle mass):
//   Sedentary ~7g/kg → ~500g total (full stores, mixed diet)
//   Light     ~6g/kg → ~450g total (slight depletion)
//   Active    ~5g/kg → ~390g total (regular training depletion)
//   Athlete   ~4g/kg → ~330g total (frequent heavy training)
// Liver glycogen: ~90g (research range: 80–120g)
// Clamped to 0.80–1.40 (max ±20–40% vs reference)

export function calcMetabolicMultiplier(prof) {
  if (!prof || !prof.weight || !prof.height || !prof.age || !prof.gender || !prof.activity) return 1;
  const { weight, height, age, gender, activity } = prof;

  // BMR — Mifflin-St Jeor (kcal/day)
  let bmr;
  if (gender === 'man') bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  else if (gender === 'kvinna') bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  else bmr = 10 * weight + 6.25 * height - 5 * age - 78;

  // TDEE — Harris-Benedict activity factors
  const actMult = { stillasittande: 1.2, lätt: 1.375, aktiv: 1.55, atlet: 1.725 };
  const tdee = bmr * (actMult[activity] || 1.375);

  // LBM — Boer formula (1984), validated against DEXA
  let lbm;
  if (gender === 'man') lbm = 0.407 * weight + 0.267 * height - 19.2;
  else lbm = 0.252 * weight + 0.473 * height - 48.3;
  lbm = Math.max(lbm, weight * 0.45);

  // Glycogen stores (g) — per kg LBM + liver
  // Based on: muscle glycogen 300–500g at 1–2% wet weight (Wikipedia/Glycogen),
  // total ~400–600g (Murray & Rosenbloom, PMC6019055), liver 80–120g
  const LIVER_GLYCOGEN = 90;
  const glycPerKg = { stillasittande: 7, lätt: 6, aktiv: 5, atlet: 4 };
  const totalGlycogen = lbm * (glycPerKg[activity] || 6) + LIVER_GLYCOGEN;

  // Reference: man, 78kg, 178cm, 35y, "lätt aktiv" → ~450g glycogen
  const refBMR = 10 * 78 + 6.25 * 178 - 5 * 35 + 5;
  const refTDEE = refBMR * 1.375;
  const refLBM = 0.407 * 78 + 0.267 * 178 - 19.2;
  const refGlycogen = refLBM * 6 + LIVER_GLYCOGEN;

  // Ratio: (energy burn speed) / (glycogen to deplete) vs reference
  const mult = (tdee / refTDEE) / (totalGlycogen / refGlycogen);
  return Math.min(1.4, Math.max(0.8, mult));
}

export function calcWorkoutBonusMs() {
  return state.workouts.reduce((acc, wo) => {
    const kcal = wo.kcal || 0;
    const maxHr = wo.maxHr > 0 ? wo.maxHr : (220 - (profile.age || 35));
    const hrPct = wo.avgHr > 0 ? Math.min(wo.avgHr / maxHr, 1) : 0.65;
    const glycFrac = hrPct < 0.6 ? 0.3 : hrPct < 0.75 ? 0.5 : hrPct < 0.85 ? 0.7 : 0.85;
    const glycGrams = (kcal * glycFrac) / 4;
    const bonusHours = glycGrams / 10;
    return acc + bonusHours * 3600000;
  }, 0);
}

export function calcMetabolicElapsed() {
  const elapsed = calcElapsed();
  const mult = calcMetabolicMultiplier(profile);
  const bonus = calcWorkoutBonusMs();
  return elapsed * mult + bonus;
}

// ── Pause detection ──

export function getActivePause() {
  return state.meals.find(m => state.now >= m.time && state.now < m.time + m.pauseHours * 3600000);
}
