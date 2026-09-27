// Pure views of daily check-in events (plan: docs/plan/fas1b.md).
// One 'checkin' event per local day, overwritten in place when changed.
// Reading never repairs the stored log. No DOM, no localStorage.
import { CHECKIN_SYMPTOMS } from './data.js';
import { LIMITS } from './migrations.js';

export const SCALES = ['energy', 'hunger', 'sleep'];
const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const pad = n => String(n).padStart(2, '0');

// Local calendar date as 'YYYY-MM-DD' (not UTC: the day never moves with time zone)
export function dayKey(t) {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Noon, so adding days never lands on a skipped or doubled DST hour
function dayDate(day) {
  const m = DAY_RE.exec(day);
  return m ? new Date(+m[1], m[2] - 1, +m[3], 12) : null;
}

export function validDay(day) {
  const d = typeof day === 'string' && dayDate(day);
  return !!d && dayKey(d) === day;
}

export function addDays(day, n) {
  const d = dayDate(day);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

// Monday of the week the day belongs to
const mondayOf = day => addDays(day, -((dayDate(day).getDay() + 6) % 7));

const scale = x => (Number.isInteger(x) && x >= 1 && x <= 5 ? x : null);
const [WMIN, WMAX] = LIMITS.weight;

// Checked copy of stored check-in data, or null if the day is broken
export function cleanCheckin(data) {
  if (!data || typeof data !== 'object' || !validDay(data.day)) return null;
  const w = data.weight;
  const symptoms = Array.isArray(data.symptoms) ? data.symptoms : [];
  return {
    day: data.day,
    energy: scale(data.energy),
    hunger: scale(data.hunger),
    sleep: scale(data.sleep),
    weight: Number.isFinite(w) && w >= WMIN && w <= WMAX ? w : null,
    symptoms: Object.keys(CHECKIN_SYMPTOMS).filter(k => symptoms.includes(k)),
  };
}

export const isEmptyCheckin = c => !c || (SCALES.every(k => c[k] === null) && c.weight === null && !c.symptoms.length);

// Checked check-ins by day. Two events for the same day (two tabs, import):
// the one saved last wins.
export function checkinMap(events) {
  const best = new Map();
  for (const e of Array.isArray(events) ? events : []) {
    if (e?.type !== 'checkin') continue;
    const c = cleanCheckin(e.data);
    const t = Number.isFinite(e.t) ? e.t : -Infinity;
    if (c && !(best.get(c.day)?.t > t)) best.set(c.day, { t, c });
  }
  return new Map([...best].map(([day, { c }]) => [day, c]));
}

export const checkinFor = (events, day) => checkinMap(events).get(day) ?? null;

// Every day from..to (inclusive), with its check-in or null
export function checkinDays(events, from, to) {
  const map = checkinMap(events);
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push({ day: d, checkin: map.get(d) ?? null });
  return out;
}

const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;

// Averages for this week and last week (Monday–Sunday). A scale needs at
// least 3 values in the week (Anton 2026-09-26, decision 5), weight at least
// one weighing (weighing weekly is the default); otherwise null.
export function weekAverages(events, now = Date.now()) {
  const monday = mondayOf(dayKey(now));
  const week = from => {
    const cs = checkinDays(events, from, addDays(from, 6)).map(x => x.checkin).filter(Boolean);
    const out = {};
    for (const k of SCALES) {
      const v = cs.map(c => c[k]).filter(x => x !== null);
      out[k] = v.length >= 3 ? mean(v) : null;
    }
    const w = cs.map(c => c.weight).filter(x => x !== null);
    out.weight = w.length ? mean(w) : null;
    return out;
  };
  return { thisWeek: week(monday), lastWeek: week(addDays(monday, -7)) };
}

// Weighings in the last 8 weeks, each with the mean of the weighings in the
// 7 days up to and including that day (the trend, not single days)
export function weightSeries(events, now = Date.now()) {
  const today = dayKey(now);
  const all = [...checkinMap(events).values()].filter(c => c.weight !== null && c.day <= today)
    .sort((a, b) => (a.day < b.day ? -1 : 1));
  const from = addDays(today, -55);
  return all.filter(c => c.day >= from).map(c => {
    const since = addDays(c.day, -6);
    return { day: c.day, weight: c.weight, avg7: mean(all.filter(x => x.day >= since && x.day <= c.day).map(x => x.weight)) };
  });
}

// True if the weight went down more than 1 kg in the first 7 days after the
// first weighing (shows checkin.viktForstaVeckan)
export function firstWeekDrop(events) {
  const ws = [...checkinMap(events).values()].filter(c => c.weight !== null).sort((a, b) => (a.day < b.day ? -1 : 1));
  if (ws.length < 2) return false;
  const end = addDays(ws[0].day, 7);
  const low = Math.min(...ws.filter(c => c.day > ws[0].day && c.day <= end).map(c => c.weight));
  return ws[0].weight - low > 1 + 1e-9;
}

// Symptom → number of days with it, from..to (only symptoms that occurred)
export function symptomCounts(events, from, to) {
  const out = {};
  for (const { checkin } of checkinDays(events, from, to)) {
    for (const s of checkin?.symptoms ?? []) out[s] = (out[s] || 0) + 1;
  }
  return out;
}

const sensitive = profile => !!(profile?.health?.eatingDisorder || profile?.health?.under18);

// 'daily' | 'weekly' | 'never'. Not chosen yet: weekly, or never if the user
// has ticked eating disorder or under 18 (Anton 2026-09-26, decision 3).
export function weighingFor(profile) {
  const w = profile?.weighing;
  if (w === 'daily' || w === 'weekly' || w === 'never') return w;
  return sensitive(profile) ? 'never' : 'weekly';
}

// Target weight line and "X kg kvar". left is hidden (null) for eating
// disorder / under 18 (decision 4), and when there is no weighing yet.
export function targetInfo(targetWeight, events, profile) {
  if (!Number.isFinite(targetWeight)) return null;
  const latest = [...checkinMap(events).values()].filter(c => c.weight !== null)
    .sort((a, b) => (a.day < b.day ? -1 : 1)).at(-1);
  const left = latest && !sensitive(profile) ? Math.round(Math.abs(latest.weight - targetWeight) * 10) / 10 : null;
  return { target: targetWeight, left };
}
