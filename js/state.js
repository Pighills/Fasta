// ── FASTA — js/state.js ──
// Application state, profile, and localStorage persistence

export let state = {
  fasting: false,
  startTime: null,
  goalHours: null,
  rolling: true,
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

// ── Versioned data model ──
// All persisted data lives in one key:
//   fasta-data = { schemaVersion, active, history, profile }
// Legacy keys (fs4, fh2, fasta-profile) are read once by the 0 → 1 migration
// and then left untouched as a fallback copy.

export const SCHEMA_VERSION = 1;
const DATA_KEY = 'fasta-data';
const BACKUP_KEY = 'fasta-data-backup';
const CORRUPT_KEY = 'fasta-data-corrupt';

// MIGRATIONS[n] upgrades data from version n-1 to version n.
const MIGRATIONS = {
  // 0 → 1: separate legacy keys gathered into one object
  1: d => ({
    schemaVersion: 1,
    active: d.active ?? null,
    history: d.history ?? [],
    profile: d.profile ?? {},
  }),
};

export class SchemaTooNewError extends Error {
  constructor(version) {
    super(`schemaVersion ${version} > ${SCHEMA_VERSION}`);
    this.version = version;
  }
}

const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);

function normalize(d) {
  return {
    schemaVersion: SCHEMA_VERSION,
    active: isObj(d.active) ? d.active : null,
    history: Array.isArray(d.history) ? d.history.filter(isObj) : [],
    profile: isObj(d.profile) ? d.profile : {},
  };
}

// Upgrade any supported version to the current one. Throws SchemaTooNewError
// if the data comes from a newer app version.
export function migrate(data) {
  let d = { ...data };
  let v = Number.isInteger(d.schemaVersion) ? d.schemaVersion : 0;
  if (v > SCHEMA_VERSION) throw new SchemaTooNewError(v);
  while (v < SCHEMA_VERSION) {
    d = MIGRATIONS[v + 1](d);
    v = d.schemaVersion;
  }
  return normalize(d);
}

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

// ── Load ──

export function loadState() {
  const p = getStored().active;
  if (!p) return;
  if (p.fasting && p.startTime) {
    state.fasting = p.fasting;
    state.startTime = p.startTime;
    state.goalHours = p.goalHours ?? null;
    state.rolling = p.rolling ?? true;
    state.meals = p.meals || [];
    state.workouts = p.workouts || [];
  } else {
    state.goalHours = p.goalHours ?? null;
    state.rolling = p.rolling ?? true;
  }
}

export function loadHistory() {
  state.history = getStored().history;
}

export function loadProfile() {
  Object.assign(profile, getStored().profile);
}

// ── Save ──

function activeFromState() {
  return {
    fasting: state.fasting,
    startTime: state.startTime,
    goalHours: state.goalHours,
    rolling: state.rolling,
    meals: state.meals,
    workouts: state.workouts,
  };
}

export function save() {
  getStored().active = activeFromState();
  persist();
}

export function saveHistory() {
  getStored().history = state.history;
  persist();
}

export function saveProfile() {
  getStored().profile = { ...profile };
  persist();
}

// ── Whole-dataset operations (export / import) ──

export function snapshot() {
  return {
    schemaVersion: SCHEMA_VERSION,
    active: activeFromState(),
    history: state.history,
    profile: { ...profile },
  };
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
