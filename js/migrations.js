// ── FASTA — js/migrations.js ──
// Versioned data model: format description, migrations and normalization.
// Pure functions without localStorage, so they can be tested with Node and
// reused when data moves to Capacitor Preferences/SQLite.
//
// Current format (schemaVersion 2):
//   {
//     schemaVersion: 2,
//     active:  { id, fasting, startTime, goalHours, rolling } | null,
//     profile: { gender, age, height, weight, activity, health, ... },
//     events:  [ { id, type, t, data }, ... ]
//   }
//
// events is one flat log of everything the user records. One row per event,
// so it maps directly to an SQLite table (id TEXT, type TEXT, t INTEGER, data JSON).
//   type 'fast'     t = start   data = { end, duration, metDuration, goal, reachedGoal, rolling, profile }
//   type 'meal'     t = time    data = { fastId, desc, kcal, protein, pauseHours }
//   type 'workout'  t = time    data = { fastId, type, icon, durationMins, kcal, avgHr, maxHr }
// Future types (checkin, weight, program) are added without a migration.
// Unknown fields are always kept.
//
// History: v0 = legacy keys fs4/fh2/fasta-profile, v1 = { active, history, profile }.

export const SCHEMA_VERSION = 2;

export class SchemaTooNewError extends Error {
  constructor(version) {
    super(`schemaVersion ${version} > ${SCHEMA_VERSION}`);
    this.version = version;
  }
}

export const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);

export function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

const objList = x => (Array.isArray(x) ? x.filter(isObj) : []);

// Turn a fast's meals and workouts (old nested format) into events
function logEvents(fastId, fallbackT, meals, workouts) {
  const out = [];
  for (const m of objList(meals)) {
    const { time, ...rest } = m;
    out.push({ id: newId(), type: 'meal', t: time ?? fallbackT, data: { ...rest, fastId } });
  }
  for (const w of objList(workouts)) {
    const { time, ...rest } = w;
    out.push({ id: newId(), type: 'workout', t: time ?? fallbackT, data: { ...rest, fastId } });
  }
  return out;
}

// MIGRATIONS[n] upgrades data from version n-1 to version n.
const MIGRATIONS = {
  // 0 → 1: separate legacy keys gathered into one object
  1: d => ({
    schemaVersion: 1,
    active: d.active ?? null,
    history: d.history ?? [],
    profile: d.profile ?? {},
  }),

  // 1 → 2: history and the active fast's meals/workouts become one event log
  2: d => {
    const events = [];
    for (const entry of objList(d.history)) {
      const { start, meals, workouts, ...rest } = entry;
      const id = newId();
      events.push({ id, type: 'fast', t: start ?? null, data: rest });
      events.push(...logEvents(id, start ?? null, meals, workouts));
    }

    let active = null;
    if (isObj(d.active)) {
      const { meals, workouts, ...rest } = d.active;
      active = { ...rest };
      if (active.fasting && active.startTime) {
        active.id = newId();
        events.push(...logEvents(active.id, active.startTime, meals, workouts));
      }
    }

    return {
      schemaVersion: 2,
      active,
      profile: isObj(d.profile) ? d.profile : {},
      events,
    };
  },
};

// Checks the shape only and never throws. Values are kept as they are:
// the result is written back to storage, and the stored log is never
// changed (Anton 2026-09-25). Values are checked on read, see clean*().
export function normalize(d) {
  if (!isObj(d)) d = {};
  const active = isObj(d.active) ? { ...d.active } : null;
  if (active && active.fasting && active.startTime && !active.id) active.id = newId();
  return {
    schemaVersion: SCHEMA_VERSION,
    active,
    profile: isObj(d.profile) ? d.profile : {},
    events: objList(d.events)
      .filter(e => typeof e.type === 'string')
      .map(e => ({ ...e, id: typeof e.id === 'string' && e.id ? e.id : newId(), data: isObj(e.data) ? e.data : {} })),
  };
}

// Upgrade any supported version to the current one. Throws SchemaTooNewError
// if the data comes from a newer app version.
// Throws a plain Error for data it does not understand (e.g. schemaVersion
// "2" as text, or a list that is not a list), instead of guessing and
// silently dropping it.
export function migrate(data) {
  let d = { ...data };
  let v = d.schemaVersion ?? 0;
  if (!Number.isInteger(v) || v < 0) throw new Error(`invalid schemaVersion ${JSON.stringify(v)}`);
  if (v > SCHEMA_VERSION) throw new SchemaTooNewError(v);
  const list = v === 1 ? d.history : v === 2 ? d.events : null;
  if (list != null && !Array.isArray(list)) throw new Error(`schemaVersion ${v}: list is not an array`);
  while (v < SCHEMA_VERSION) {
    d = MIGRATIONS[v + 1](d);
    v = d.schemaVersion;
  }
  return normalize(d);
}

// ── Field check on read ──
// Stored values may be broken (text, missing, negative) or unreasonable
// (old versions had no limits, or an edited backup file). They are fixed
// when read into the views, so the timer never shows NaN. Stored data is
// not changed. The same limits are used by the input dialogs.

export const LIMITS = {
  pauseHours: [0, 4], mealKcal: [0, 3000],
  durationMins: [1, 300], workoutKcal: [0, 2000], avgHr: [40, 220], maxHr: [100, 220],
  age: [10, 110], height: [100, 230], weight: [30, 250],
};

// Metabolic time is at most 40 % longer than the actual time, profile and
// workouts together (Anton 2026-09-26: "max ±40 % justering" in Profil).
export const MAX_MET_FACTOR = 1.4;

const num = x => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const clampTo = (x, [lo, hi]) => Math.min(hi, Math.max(lo, x));

// Number within range: clamped. Not a number: fallback.
function clampNum(x, range, fallback) {
  const n = num(x);
  return n === null ? fallback : clampTo(n, range);
}

// Number within range: kept. Anything else: fallback ("not given").
function inRange(x, [lo, hi], fallback) {
  const n = num(x);
  return n !== null && n >= lo && n <= hi ? n : fallback;
}

export function cleanMeal(m) {
  return { ...m, pauseHours: clampNum(m.pauseHours, LIMITS.pauseHours, 0), kcal: clampNum(m.kcal, LIMITS.mealKcal, 0) };
}

export function cleanWorkout(w) {
  const out = {
    ...w,
    kcal: clampNum(w.kcal, LIMITS.workoutKcal, 0),
    avgHr: inRange(w.avgHr, LIMITS.avgHr, 0),
    maxHr: inRange(w.maxHr, LIMITS.maxHr, 0),
  };
  const mins = clampNum(w.durationMins, LIMITS.durationMins, null);
  if (mins === null) delete out.durationMins; else out.durationMins = mins;
  return out;
}

// Age, height and weight outside the limits count as not filled in, so the
// profile is incomplete and the user is asked again (no guessing).
export function cleanProfile(p) {
  const out = { ...p };
  for (const k of ['age', 'height', 'weight']) out[k] = inRange(p[k], LIMITS[k], null);
  return out;
}

// ── Event log → old shapes ──
// Views use the same shapes as before the event log:
//   history entry = { start, end, duration, ..., meals: [...], workouts: [...] }
//   meal = { time, desc, ... }, workout = { time, type, ... }

const CLEAN = { meal: cleanMeal, workout: cleanWorkout };

function logItem(e) {
  const { fastId, ...rest } = e.data;
  const item = { time: e.t, ...rest };
  return CLEAN[e.type] ? CLEAN[e.type](item) : item;
}

// Items without a valid time cannot be placed in the fast and are skipped
export function logsFor(events, type, fastId) {
  return events.filter(e => e.type === type && e.data.fastId === fastId && num(e.t) !== null).map(logItem);
}

// Time (ms) between from and to covered by meal pauses. Overlapping pauses
// are merged so the same time is never subtracted twice.
export function pausedMs(meals, from, to) {
  const iv = meals
    .filter(m => Number.isFinite(m.time) && Number.isFinite(m.pauseHours) && m.pauseHours > 0)
    .map(m => [Math.max(m.time, from), Math.min(m.time + m.pauseHours * 3600000, to)])
    .filter(([a, b]) => b > a)
    .sort((x, y) => x[0] - y[0]);
  let sum = 0, end = -Infinity;
  for (const [a, b] of iv) {
    if (b > end) { sum += b - Math.max(a, end); end = b; }
  }
  return sum;
}

// Saved fasts may have a too short duration (overlapping pauses were
// subtracted twice before fasta-v35). The length is recomputed from the log
// when shown; the stored data is never changed. multOf(profile) gives the
// metabolic multiplier that was used for metDuration.
// Fasts without a valid start, or without a length, are not shown.
export function historyFromEvents(events, multOf = () => 1) {
  return events
    .filter(e => e.type === 'fast' && num(e.t) !== null)
    .map(e => {
      const h = {
        ...e.data,
        start: e.t,
        meals: logsFor(events, 'meal', e.id),
        workouts: logsFor(events, 'workout', e.id),
        _id: e.id,
      };
      if (num(h.metDuration) === null) delete h.metDuration;
      if (num(h.end) !== null && h.end >= h.start) {
        const net = Math.max(0, h.end - h.start - pausedMs(h.meals, h.start, h.end));
        if (net !== h.duration) {
          if (h.metDuration !== undefined && num(h.duration) !== null) h.metDuration += (net - h.duration) * multOf(h.profile);
          h.duration = net;
          h.reachedGoal = !h.rolling && !!h.goal && net / 3600000 >= h.goal;
        }
      } else if (num(h.duration) !== null && h.duration >= 0) {
        h.end = h.start + h.duration;
      } else {
        return null;
      }
      if (h.metDuration !== undefined) h.metDuration = Math.min(h.metDuration, h.duration * MAX_MET_FACTOR);
      return h;
    })
    .filter(Boolean);
}
