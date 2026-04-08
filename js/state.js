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

// ── Load from localStorage ──

export function loadState() {
  try {
    const s = localStorage.getItem('fs4');
    if (s) {
      const p = JSON.parse(s);
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
  } catch (e) { /* ignore */ }
}

export function loadHistory() {
  try {
    const h = localStorage.getItem('fh2');
    if (h) state.history = JSON.parse(h);
  } catch (e) { /* ignore */ }
}

export function loadProfile() {
  try {
    const p = localStorage.getItem('fasta-profile');
    if (p) Object.assign(profile, JSON.parse(p));
  } catch (e) { /* ignore */ }
}

// ── Save to localStorage ──

export function save() {
  try {
    localStorage.setItem('fs4', JSON.stringify({
      fasting: state.fasting,
      startTime: state.startTime,
      goalHours: state.goalHours,
      rolling: state.rolling,
      meals: state.meals,
      workouts: state.workouts,
    }));
  } catch (e) { /* ignore */ }
}

export function saveHistory() {
  try {
    localStorage.setItem('fh2', JSON.stringify(state.history.slice(-50)));
  } catch (e) { /* ignore */ }
}

export function saveProfile() {
  try {
    localStorage.setItem('fasta-profile', JSON.stringify(profile));
  } catch (e) { /* ignore */ }
}

export function profileComplete() {
  return profile.gender && profile.age && profile.height && profile.weight && profile.activity;
}
