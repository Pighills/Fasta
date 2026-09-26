// Pure views of goal/program events. Reading never repairs the stored log.
import { PROGRAMS } from './data.js';
import { historyFromEvents } from './migrations.js';

const HOUR = 3600000;
const validTime = t => Number.isFinite(t) && !Number.isNaN(new Date(t).getTime());
// UTC is only used to number local calendar dates, never to display a date.
const dayNumber = t => {
  const d = new Date(t);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000;
};
const ordered = (events, type, now) => (Array.isArray(events) ? events : [])
  .filter(e => e?.type === type && validTime(e.t) && e.t <= now && e.data && typeof e.data === 'object')
  .slice().sort((a, b) => a.t - b.t);
const knownProgram = id => Object.hasOwn(PROGRAMS, id);

export function cleanGoal(data = {}) {
  const { fastsPerWeek, targetWeight } = data || {};
  return {
    fastsPerWeek: Number.isInteger(fastsPerWeek) && fastsPerWeek >= 1 && fastsPerWeek <= 7 ? fastsPerWeek : null,
    targetWeight: Number.isFinite(targetWeight) && targetWeight >= 30 && targetWeight <= 250 ? targetWeight : null,
  };
}

export function latestGoal(events, now = Date.now()) {
  return cleanGoal(ordered(events, 'goal', now).at(-1)?.data);
}

export function programState(events, now = Date.now()) {
  let current = null;
  for (const e of ordered(events, 'program', now)) {
    const { action, programId } = e.data;
    if (!knownProgram(programId)) continue;
    if (action === 'start') {
      current = { programId, start: e.t, id: e.id, revision: e.id, pausedAt: null, pauseDays: 0 };
    } else if (current?.programId === programId) {
      if (action === 'end') current = null;
      else if (action === 'pause' && current.pausedAt === null) {
        current.pausedAt = e.t;
        current.revision = e.id;
      } else if (action === 'resume' && current.pausedAt !== null) {
        current.pauseDays += dayNumber(e.t) - dayNumber(current.pausedAt);
        current.pausedAt = null;
        current.revision = e.id;
      }
    }
  }
  if (!current) return null;
  const definition = PROGRAMS[current.programId];
  const day = Math.max(1, dayNumber(current.pausedAt ?? now) - dayNumber(current.start) - current.pauseDays + 1);
  return { ...current, day, week: Math.ceil(day / 7), days: definition.days,
    paused: current.pausedAt !== null, complete: day > definition.days,
    hours: current.programId === 'komIgang' ? (day <= 7 ? 12 : day <= 14 ? 14 : 16) : 16 };
}

// Completion dates determine the week. Net fasting time excludes meal pauses.
export function weekProgress(events, now = Date.now()) {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);
  const safeEvents = (Array.isArray(events) ? events : []).filter(e => e && e.data && validTime(e.t));
  const fasts = historyFromEvents(safeEvents).filter(h => h.end >= +monday && h.end < +nextMonday && h.end <= now);
  return { fasts: fasts.filter(h => h.duration >= 12 * HOUR).length,
    days16: new Set(fasts.filter(h => h.duration >= 16 * HOUR).map(h => dayNumber(h.end))).size };
}
