// ── FASTA — js/state.js ──
// Application state, profile, event log and localStorage persistence

import {
  SCHEMA_VERSION, SchemaTooNewError, isObj, newId, migrate, normalize, historyFromEvents, logsFor,
} from './migrations.js';

export { SCHEMA_VERSION, SchemaTooNewError, migrate };

export let state = {
  fasting: false,
  activeId: null,
  startTime: null,
  goalHours: null,
  rolling: true,
  // meals, workouts and history are read-only views built from the event log
  meals: [],
  workouts: [],
  history: [],
  view: 'timer',
  showVariants: false,
  selectedVariant: null,
  expandedPhase: null,
  learnFilter: 'Alla',
  now: Date.now(),
  showBackdate: false,
  backdateValue: '',
};

export let profile = {
  gender: null,
  age: null,
  height: null,
  weight: null,
  activity: null,
};

// ── Storage ──
// All persisted data lives in one key, fasta-data (format in migrations.js).
// Legacy keys (fs4, fh2, fasta-profile) are read once by the 0 → 1 migration
// and then left untouched as a fallback copy. Before an upgrade, the stored
// data is also copied untouched to fasta-data-pre-v<N>.

const DATA_KEY = 'fasta-data';
const BACKUP_KEY = 'fasta-data-backup';
const CORRUPT_KEY = 'fasta-data-corrupt';
const PRE_UPGRADE_KEY = `fasta-data-pre-v${SCHEMA_VERSION}`;

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function readLegacy() {
  return {
    schemaVersion: 0,
    active: readJSON('fs4'),
    history: readJSON('fh2'),
    profile: readJSON('fasta-profile'),
  };
}

let stored = null;
// Set when fasta-data was written by a newer app version: we never overwrite it.
let locked = false;

function getStored() {
  if (stored) return stored;
  let raw = null;
  try { raw = localStorage.getItem(DATA_KEY); } catch (e) { /* ignore */ }
  const current = readJSON(DATA_KEY);

  if (raw && !current) {
    // Unreadable data: keep a copy before rebuilding from legacy keys
    try { localStorage.setItem(CORRUPT_KEY, raw); } catch (e) { /* ignore */ }
  }

  if (isObj(current) && (current.schemaVersion ?? 0) < SCHEMA_VERSION) {
    // Keep an untouched copy of the old format before upgrading
    try {
      if (localStorage.getItem(PRE_UPGRADE_KEY) === null) localStorage.setItem(PRE_UPGRADE_KEY, raw);
    } catch (e) { /* ignore */ }
  }

  try {
    stored = migrate(isObj(current) ? current : readLegacy());
  } catch (e) {
    locked = e instanceof SchemaTooNewError;
    stored = normalize({});
  }
  persist();
  return stored;
}

function persist() {
  if (locked) return;
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(stored));
  } catch (e) { /* ignore */ }
}

// ── Event log → views ──

function derive() {
  const ev = getStored().events;
  state.history = historyFromEvents(ev);
  state.meals = state.activeId ? logsFor(ev, 'meal', state.activeId) : [];
  state.workouts = state.activeId ? logsFor(ev, 'workout', state.activeId) : [];
}

// ── Load ──

export function loadState() {
  const p = getStored().active;
  if (p) {
    state.goalHours = p.goalHours ?? null;
    state.rolling = p.rolling ?? true;
    if (p.fasting && p.startTime) {
      state.fasting = p.fasting;
      state.startTime = p.startTime;
      state.activeId = p.id;
    }
  }
  derive();
}

export function loadProfile() {
  Object.assign(profile, getStored().profile);
}

// ── Save ──

function activeFromState() {
  return {
    id: state.activeId,
    fasting: state.fasting,
    startTime: state.startTime,
    goalHours: state.goalHours,
    rolling: state.rolling,
  };
}

export function save() {
  getStored().active = activeFromState();
  persist();
}

export function saveProfile() {
  getStored().profile = { ...profile };
  persist();
}

// ── Event log operations ──

// Add an event. Returns its id.
export function addEvent(type, t, data, id = newId()) {
  getStored().events.push({ id, type, t, data });
  persist();
  derive();
  return id;
}

// Remove a finished fast and the meals/workouts logged during it
export function removeFast(fastId) {
  const s = getStored();
  s.events = s.events.filter(e => e.id !== fastId && e.data.fastId !== fastId);
  persist();
  derive();
}

// Remove all finished fasts with their meals/workouts. Other event types
// (and the active fast's logs) are kept.
export function clearFastHistory() {
  const s = getStored();
  const fastIds = new Set(s.events.filter(e => e.type === 'fast').map(e => e.id));
  s.events = s.events.filter(e => !fastIds.has(e.id) && !fastIds.has(e.data.fastId));
  persist();
  derive();
}

// ── Whole-dataset operations (export / import) ──

export function snapshot() {
  return {
    schemaVersion: SCHEMA_VERSION,
    active: activeFromState(),
    profile: { ...profile },
    events: getStored().events,
  };
}

export function countFasts(data) {
  return data.events.filter(e => e.type === 'fast').length;
}

// Replace all data with already-migrated data. The current data is first
// copied to fasta-data-backup; if that fails nothing is overwritten.
export function replaceAllData(data) {
  if (locked) throw new Error('locked');
  localStorage.setItem(BACKUP_KEY, JSON.stringify({ ...snapshot(), backedUpAt: Date.now() }));
  localStorage.setItem(DATA_KEY, JSON.stringify(normalize(data)));
}

// Returns the backup timestamp, or null if there is no backup.
export function backupTime() {
  const b = readJSON(BACKUP_KEY);
  return isObj(b) ? (b.backedUpAt || 0) : null;
}

export function restoreBackup() {
  const b = readJSON(BACKUP_KEY);
  if (!isObj(b)) throw new Error('no backup');
  localStorage.setItem(DATA_KEY, JSON.stringify(migrate(b)));
  localStorage.removeItem(BACKUP_KEY);
}

export function profileComplete() {
  return profile.gender && profile.age && profile.height && profile.weight && profile.activity;
}
