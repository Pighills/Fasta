// ── FASTA — js/state.js ──
// Application state, profile, event log and localStorage persistence

import {
  SCHEMA_VERSION, SchemaTooNewError, isObj, newId, migrate, normalize, historyFromEvents, logsFor,
} from './migrations.js';

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

const EMPTY_PROFILE = {
  gender: null,
  age: null,
  height: null,
  weight: null,
  activity: null,
};

export let profile = { ...EMPTY_PROFILE };

// ── Storage ──
// All persisted data lives in one key, fasta-data (format in migrations.js).
// Legacy keys (fs4, fh2, fasta-profile) are read once by the 0 → 1 migration
// and then left untouched as a fallback copy. Before an upgrade, the stored
// data is also copied untouched to fasta-data-pre-v<N>.

const DATA_KEY = 'fasta-data';
const BACKUP_KEY = 'fasta-data-backup';
const CORRUPT_KEY = 'fasta-data-corrupt';
const ERROR_KEY = 'fasta-data-error';
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

// Returns true if the copy was written
function copyTo(key, raw) {
  try {
    localStorage.setItem(key, raw);
    return true;
  } catch (e) {
    return false;
  }
}

let stored = null;
// fasta-data exactly as this tab last read or wrote it. If localStorage
// holds something else, another tab/window has saved since (see persist).
let lastRaw = null;
// Set when fasta-data must never be overwritten: 'newer' = written by a
// newer app version, 'error' = could not be read/migrated (unknown error).
let locked = false;

export const lockReason = () => locked;

function getStored() {
  if (stored) return stored;
  locked = false;
  let raw = null;
  try { raw = localStorage.getItem(DATA_KEY); } catch (e) { /* ignore */ }
  lastRaw = raw;
  let current = null;
  try { current = raw ? JSON.parse(raw) : null; } catch (e) { /* unreadable */ }

  if (raw && !isObj(current)) {
    // Unreadable data: keep a copy before rebuilding from legacy keys.
    // Without a copy, nothing is overwritten.
    if (!copyTo(CORRUPT_KEY, raw)) return lock('error');
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
    // Newer version: the data is fine, just not ours to change.
    // Anything else: keep an untouched copy and never overwrite fasta-data.
    if (e instanceof SchemaTooNewError) return lock('newer');
    if (raw) copyTo(ERROR_KEY, raw);
    return lock('error');
  }
  try { write(); } catch (e) { /* not saved yet; the next change tries again */ }
  return stored;
}

function lock(reason) {
  locked = reason;
  stored = normalize({});
  return stored;
}

// A change was refused and not saved. reason: 'stale' = another tab or
// window saved newer data, 'newer'/'error' = locked (see above),
// 'failed' = localStorage refused to save (e.g. full).
// app.js shows the latest data and a message.
export class SaveRefused extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

function isStale() {
  let now = null;
  try { now = localStorage.getItem(DATA_KEY); } catch (e) { /* ignore */ }
  return now !== lastRaw;
}

function write() {
  const json = JSON.stringify(stored);
  if (json === lastRaw) return;
  localStorage.setItem(DATA_KEY, json);
  lastRaw = json;
}

// Save a change. Every change is made on the in-memory copy first, so if
// another tab has saved since we read, our copy is old: drop it instead of
// writing it over the newer data.
function persist() {
  if (locked) throw new SaveRefused(locked);
  // Keeps refusing until reload()
  if (isStale()) throw new SaveRefused('stale');
  try {
    write();
  } catch (e) {
    throw new SaveRefused('failed');
  }
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
  const on = !!(p?.fasting && p.startTime);
  state.goalHours = p?.goalHours ?? null;
  state.rolling = p?.rolling ?? true;
  state.fasting = on;
  state.startTime = on ? p.startTime : null;
  state.activeId = on ? p.id : null;
  derive();
}

export function loadProfile() {
  for (const k in profile) delete profile[k];
  Object.assign(profile, EMPTY_PROFILE, getStored().profile);
}

// Read everything again from localStorage (after another tab saved)
export function reload() {
  stored = null;
  loadState();
  loadProfile();
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
  // Locked: the in-memory data is empty, never export it as the user's data
  if (locked) throw new SaveRefused(locked);
  return {
    schemaVersion: SCHEMA_VERSION,
    active: activeFromState(),
    profile: { ...profile },
    events: getStored().events,
  };
}

// Replace all data with already-migrated data. The current data is first
// copied to fasta-data-backup; if that fails nothing is overwritten.
export function replaceAllData(data) {
  if (locked) throw new Error('locked');
  if (isStale()) throw new SaveRefused('stale');
  localStorage.setItem(BACKUP_KEY, JSON.stringify({ ...snapshot(), backedUpAt: Date.now() }));
  localStorage.setItem(DATA_KEY, JSON.stringify(normalize(data)));
}

// Returns the backup timestamp, or null if there is no backup.
export function backupTime() {
  const b = readJSON(BACKUP_KEY);
  return isObj(b) ? (b.backedUpAt || 0) : null;
}

export function restoreBackup() {
  if (locked) throw new SaveRefused(locked);
  const b = readJSON(BACKUP_KEY);
  if (!isObj(b)) throw new Error('no backup');
  localStorage.setItem(DATA_KEY, JSON.stringify(migrate(b)));
  localStorage.removeItem(BACKUP_KEY);
}

export function profileComplete() {
  return profile.gender && profile.age && profile.height && profile.weight && profile.activity;
}
