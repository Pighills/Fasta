// Local, deterministic meal interpretation. Never executes input or uses a service.
export const MAKRO_KEYS = ['kcal', 'kh', 'socker', 'fiber', 'protein', 'fett'];
const round = n => Math.round(n * 10) / 10;
const bounded = n => round(Math.min(1500, Math.max(1, n)));
const words = { en: 1, ett: 1, två: 2, tre: 3, fyra: 4, fem: 5, sex: 6, sju: 7, åtta: 8, nio: 9, tio: 10 };
export function normaliseraMat(text) {
  return String(text ?? '').toLocaleLowerCase('sv').replace(/(\d),(\d)/g, '$1.$2')
    .replace(/[^a-zåäö0-9.\s]/g, ' ').replace(/(?<![a-zåäö])(äggen|äggens)(?![a-zåäö])/g, 'ägg')
    .replace(/\bbananer(?:na)?\b/g, 'banan').replace(/\bskivor\b/g, 'skiva')
    .replace(/\bportioner\b/g, 'portion').replace(/\bglas\b/g, 'dl').replace(/\s+/g, ' ').trim();
}
function distance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  rows[0] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
  }
  return rows[a.length][b.length];
}
const foods = tabell => Array.isArray(tabell) ? tabell : tabell?.livsmedel || [];
export function sokMat(text, tabell, max = 3) {
  const q = normaliseraMat(text).slice(0, 100);
  if (!q) return [];
  const ranked = [];
  for (const f of foods(tabell)) {
    let score = Infinity;
    for (const name of [f.namn, ...(f.alias || [])]) {
      const n = normaliseraMat(name);
      if (n === q) score = 0;
      else if (n.startsWith(q + ' ') || n.includes(' ' + q + ' ') || n.endsWith(' ' + q)) score = Math.min(score, 10 + (n.length - q.length) / 100);
      else if (q.length >= 3 && n.includes(q)) score = Math.min(score, 20 + n.length / 100);
      else if (q.length >= 4) {
        const d = distance(q, n);
        if (d <= (q.length > 7 ? 2 : 1)) score = Math.min(score, 30 + d);
      }
    }
    if (Number.isFinite(score)) ranked.push({ ...f, score });
  }
  return ranked.sort((a, b) => a.score - b.score || String(a.id).localeCompare(String(b.id), 'sv')).slice(0, max);
}
export function summeraMat(items, tabell) {
  const byId = new Map(foods(tabell).map(f => [String(f.id), f]));
  const makron = Object.fromEntries(MAKRO_KEYS.map(k => [k, 0]));
  const forms = new Set();
  let total = 0;
  for (const row of items.slice(0, 12)) {
    const f = byId.get(String(row.matchning));
    if (!f || !Number.isFinite(row.mangd_g) || row.mangd_g <= 0) continue;
    const grams = Math.min(bounded(row.mangd_g), Math.max(0, 3000 - total));
    total += grams;
    if (!grams) continue;
    for (const k of MAKRO_KEYS) makron[k] += Math.max(0, Number(f[k]) || 0) * grams / 100;
    forms.add(f.form);
  }
  for (const k of MAKRO_KEYS) makron[k] = round(makron[k]);
  return { makron, form: forms.size > 1 ? 'blandad' : forms.has('flytande') ? 'flytande' : 'fast' };
}
// Temporary mapping to the existing model; T-56 will use the saved macros.
export function matKategori(items, tabell) {
  const fs = items.map(i => foods(tabell).find(f => String(f.id) === String(i.matchning))).filter(Boolean);
  const { makron: m } = summeraMat(items, tabell);
  if (!fs.length || m.kcal === 0) return 'ingenPaverkan';
  if (fs.some(f => /vassle|proteinshake|proteinpulver/i.test(f.namn))) return 'vassle';
  if (fs.every(f => /mjölk|yoghurt|kvarg|filmjölk|ost/i.test(f.namn))) return 'mejeri';
  if (fs.every(f => /frukt/i.test(f.grupp))) return 'frukt';
  if (m.kh >= 10 && m.protein >= 10 && m.fett >= 5) return 'blandad';
  if (m.kh >= m.protein && m.kh >= m.fett) return fs.some(f => f.tempo === 'snabb') ? 'snabbaKolhydrater' : 'langsammaKolhydrater';
  return m.protein >= m.fett ? 'protein' : 'fett';
}
function amount(text, f) {
  let s = text.replace(/\ben halv\b/g, '0.5').replace(/\bett halvt\b/g, '0.5');
  for (const [w, n] of Object.entries(words)) s = s.replace(new RegExp(`(?<![a-zåäö])${w}(?![a-zåäö])`, 'g'), String(n));
  const match = s.match(/^(\d+(?:\.\d+)?)\s*(kg|msk|tsk|dl|st|skiva|portion|kopp|handfull|g|l)?(?:\s|$)/) || s.match(/\s(\d+(?:\.\d+)?)\s*(portion|g|kg|dl)\s*$/);
  const unit = match?.[2] || (/handfull/.test(s) ? 'handfull' : /tallrik/.test(s) ? 'portion' : 'st');
  const count = match ? Number(match[1]) : 1;
  const scale = { g: 1, kg: 1000, l: (f?.portioner?.dl || 100) * 10 }[unit] ?? f?.portioner?.[unit];
  const assumed = !match || scale == null || /lite|handfull|tallrik/.test(s);
  let grams = count * (scale ?? f?.portioner?.portion ?? 100);
  if (/lite/.test(s)) grams *= 0.5;
  const clipped = grams > 1500 || grams <= 0;
  return { grams: bounded(grams), count, assumed, clipped, query: (match ? s.replace(match[0], ' ') : s).replace(/\b(lite|normal|normalt|mycket|handfull|tallrik|stekt|stekta|friterad|friterade|kokta|med fett|utan fett)\b/g, ' ').replace(/\s+/g, ' ').trim() };
}
export function matSokFras(text) { return amount(normaliseraMat(text)).query; }
export function tolkaMat(text, tabell) {
  const fritext = typeof text === 'string' ? text.slice(0, 300) : '';
  const oklarheter = [];
  if (typeof text === 'string' && text.length > 300) oklarheter.push('Texten har kortats till 300 tecken.');
  if ((fritext.match(/\b(fr ukost|frukost|lunch|middag|kvällsmat)\b/gi) || []).length > 1) oklarheter.push('fleraMaltider');
  // Protect compound dishes and decimal commas before splitting connectors.
  let source = fritext.toLocaleLowerCase('sv').replace(/(\d),(\d)/g, '$1.$2').replace(/pasta med köttfärssås/g, 'pasta_koettfaerssaas').replace(/smörgås med ost/g, 'ostmacka').replace(/stekt med fett/g, 'stekt').replace(/stekta med fett/g, 'stekta');
  source = source.replace(/,\s*(\d+(?:\.\d+)?\s+portioner?)\s*$/g, ' $1');
  const parts = source.split(/\s+(?:och|samt|med)\s+|[,;+]/).filter(s => s.trim());
  if (parts.length > 12) oklarheter.push('Högst 12 rader kan loggas.');
  const items = [], ovrigt = [];
  for (const raw of parts.slice(0, 12)) {
    if (/(?:^|\s)-\d/.test(raw)) { items.push({ namn: 'Ogiltig mängd', matchning: null, mangd_g: 1, mangd_text: raw, antagande: 'Mängden måste vara större än noll.', sakerhet: 'låg', kandidater: [] }); continue; }
    const part = normaliseraMat(raw.replace(/pasta_koettfaerssaas/g, 'pasta med köttfärssås'));
    if (!part || /^(?:med )?fett$/.test(part)) continue;
    if (/^(?:(?:\d+(?:\.\d+)?|en|ett|två)\s*(?:kopp|dl|g|l)?\s*)?(?:svart kaffe|kaffe|te|vatten|buljong)$/.test(part)) { ovrigt.push(part); continue; }
    const a = amount(part);
    const candidates = sokMat(a.query, tabell);
    const f = candidates[0];
    if (!f) { items.push({ namn: a.query || part, matchning: null, mangd_g: a.grams, mangd_text: part, antagande: '', sakerhet: 'låg', kandidater: [] }); continue; }
    const size = amount(part, f);
    const ambiguous = candidates[1]?.score === f.score;
    const variety = normaliseraMat(f.namn) !== size.query;
    const row = { namn: f.namn, matchning: f.id, mangd_g: size.grams, mangd_text: part, antagande: [size.assumed ? 'Standardportion antagen.' : '', variety ? 'Sort eller tillagning antagen – kontrollera matchningen.' : '', f.uppskattad ? 'Livsmedlets värden är en egen schablon.' : ''].filter(Boolean).join(' '), sakerhet: size.assumed || size.clipped || f.uppskattad || f.score >= 30 ? 'låg' : ambiguous || variety || f.score > 0 ? 'medel' : 'hög', kandidater: candidates.map(c => c.id) };
    if (size.clipped) row.antagande += ' Mängden begränsad till 1–1500 g.';
    items.push(row);
    if (/stekt|friterad/.test(part) && !/utan fett/.test(part) && items.length < 12) {
      const oil = sokMat('rapsolja', tabell)[0];
      if (oil) items.push({ namn: oil.namn, matchning: oil.id, mangd_g: bounded((/ägg/.test(part) ? size.count : 1) * 5), mangd_text: 'stekfett', antagande: 'Tillagningsfett antaget: 1 tsk per ägg eller portion.', sakerhet: 'låg', kandidater: [oil.id], stekfett: true });
    }
  }
  let total = 0;
  for (const row of items) {
    const grams = Math.min(row.mangd_g, 3000 - total);
    if (grams < row.mangd_g) { row.mangd_g = grams; row.sakerhet = 'låg'; oklarheter.push('Måltidens mängd har begränsats till 3000 g.'); }
    total += grams;
  }
  const limited = items.filter(i => i.mangd_g > 0).slice(0, 12);
  return { fritext, items: limited, ovrigt, oklarheter: [...new Set(oklarheter)], ...summeraMat(limited, tabell), foodType: matKategori(limited, tabell) };
}
let tablePromise;
export function laddaMatTabell() {
  if (!tablePromise) tablePromise = fetch(new URL('../data/livsmedel.json', import.meta.url)).then(r => {
    if (!r.ok) throw new Error('Matlistan kunde inte laddas. Välj en kategori eller försök igen.');
    return r.json().then(data => {
      if (!Array.isArray(data?.livsmedel)) throw new Error('Matlistan kunde inte laddas. Välj en kategori eller försök igen.');
      return data;
    });
  }).catch(e => { tablePromise = null; throw e; });
  return tablePromise;
}
