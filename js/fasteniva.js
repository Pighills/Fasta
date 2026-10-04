// Rena uppskattningsfunktioner. Tider är lokala tidsstämplar i ms;
// mealCurve tar t som absolut tidsstämpel, inte timmar sedan måltiden.
import { FASTENIVA } from './data.js';
const H = 3600000;
const MINUT = 60000;

function parameters(meal, workouts) {
  const category = FASTENIVA.KATEGORIER.find(c => c.id === meal.foodType);
  if (!category) return null; // Gamla måltider räknas aldrig om.
  const rule = FASTENIVA.TRANING;
  const nearby = workouts.some(w => {
    if (w.type === rule.undantag || !(w.durationMins >= rule.minMinuter) || !Number.isFinite(w.time)) return false;
    // Befintliga pass lagras vid slutet (loggningstiden).
    const end = w.time;
    const start = end - w.durationMins * MINUT;
    const window = rule.fonsterTimmar * H;
    return (end <= meal.time && meal.time - end <= window) ||
      (start >= meal.time && start - meal.time <= window) ||
      (start <= meal.time && end >= meal.time);
  });
  const factor = nearby ? rule.faktor : 1;
  return { ...category, A: category.A * factor, D: category.D * factor };
}

export function mealCurve(meal, workouts = [], t) {
  const p = parameters(meal, workouts);
  const hours = (t - meal.time) / H;
  if (!p || !Number.isFinite(hours) || hours <= 0 || hours >= p.D || !p.A) return 0;
  if (hours < p.tp) return p.A * Math.sin(Math.PI / 2 * hours / p.tp);
  return p.A * 0.5 * (1 + Math.cos(Math.PI * (hours - p.tp) / (p.D - p.tp)));
}

export function estimateInsulinLevel(meals, workouts = [], now) {
  return Math.min(1, meals.reduce((sum, meal) => sum + mealCurve(meal, workouts, now), 0));
}

export function timeToFastingWindow(meals, workouts = [], now) {
  // Vid måltidsögonblicket är kurvan ännu noll, enligt kurvformen.
  for (let ms = 0; ms <= 6 * H; ms += MINUT) {
    if (estimateInsulinLevel(meals, workouts, now + ms) < FASTENIVA.TROSKEL) return ms;
  }
  return 6 * H;
}

export function mealPauseHours(meal, workouts = []) {
  const p = parameters(meal, workouts);
  if (!p || p.A < FASTENIVA.TROSKEL) return 0;
  // Lös den fallande kurvan; sökning från t=0 skulle ge paus 0.
  return p.tp + (p.D - p.tp) * Math.acos(2 * FASTENIVA.TROSKEL / p.A - 1) / Math.PI;
}

export function liverGlycogenShare(metabolicHours) {
  const points = FASTENIVA.LEVERGLYKOGEN;
  if (!(metabolicHours > 0)) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [h, share] = points[i];
    const [prevH, prevShare] = points[i - 1];
    if (metabolicHours <= h) return prevShare + (share - prevShare) * (metabolicHours - prevH) / (h - prevH);
  }
  return points.at(-1)[1];
}
