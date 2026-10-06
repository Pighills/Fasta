// Kör: node scripts/bygg-livsmedel.mjs [--cache <mapp>]. Endast byggtid, aldrig i appen.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

export const API = 'https://dataportal.livsmedelsverket.se/livsmedel/api/v1';
export const KALLA = 'Livsmedelsverkets livsmedelsdatabas (CC BY 4.0)';
const fields = { kcal: ['ENERC', 'kcal'], kh: ['CHO', 'g'], socker: ['SUGAR', 'g'],
  fiber: ['FIBT', 'g'], protein: ['PROT', 'g'], fett: ['FAT', 'g'], mattat: ['FASAT', 'g'] };
const round = n => Math.round(n * 10) / 10;

// Begränsade grupper, jämnt urval över namn – inte enbart de äldsta databasnumren.
const groups = [
  ['bröd och spannmål', /^(bröd|hårt bröd|knäckebröd|frukostflingor|havregryn|gröt|havregrynsgröt|müsli|pasta|ris |bulgur|couscous|quinoa|nudlar)/i, 110],
  ['mejeri och ägg', /^(ägg|.*mjölk|yoghurt|fruktyoghurt|fil |filmjölk|kvarg|ost |grädd|crème|keso|vassle)/i, 90],
  ['kött och fågel', /^(nöt |gris |kyckling|kalkon|kött|korv|falukorv|bacon|skinka|leverpastej|lamm)/i, 85],
  ['fisk och skaldjur', /^(lax |torsk|sill |strömming|tonfisk|makrill|sej |räk|fisk|regnbågslax|mussl)/i, 60],
  ['grönsaker och baljväxter', /^(potatis|morot|tomat|gurka|paprika|broccoli|blomkål|vitkål|rödkål|spenat|sallat|sallad|lök|rödlök|vitlök|majs|ärter|bönor|linser|kikärt|champinjon|avokado|tofu)/i, 85],
  ['frukt och bär', /^(banan|äpple|päron|apelsin|mandarin|clementin|kiwi|mango|ananas|vindruv|druv|jordgubb|hallon|blåbär|lingon|citron|persika|plommon|melon)/i, 65],
  ['nötter och fett', /^(sötmandel|jordnöt|valnöt|hasselnöt|cashew|pistage|nötter|solrosfrö|pumpafrö|chiafrö|linfrö|smör |rapsolja|olivolja|margarin)/i, 45],
  ['dryck', /^(kaffe|te |vatten|juice|.*juice|läsk|saft|smoothie|öl |vin |havredryck|sojadryck|mandeldryck)/i, 55],
  ['rätter och sötsaker', /^(pizza|lasagne|spagetti|köttfärssås|pannkak|ärtsoppa|pytt|hamburgare|sushi|falafel|gryta|soppa|glass|choklad|godis|socker|honung|sylt)/i, 90],
];
export const CONTROL_IDS = [2205,553,3794,150,702,846,2513,3243,1575,29,2189,951,1255,1957];
const requiredIds = [...CONTROL_IDS,202,124,97,171,677,858,1172];

export function selectFoods(list) {
  const selected = new Map();
  for (const [grupp, pattern, limit] of groups) {
    const candidates = list.filter(f => pattern.test(f.namn) && !selected.has(f.nummer))
      .sort((a,b) => a.namn.localeCompare(b.namn, 'sv') || a.nummer - b.nummer);
    for (let i = 0; i < Math.min(limit, candidates.length); i++) {
      const food = candidates[Math.floor(i * candidates.length / Math.min(limit, candidates.length))];
      selected.set(food.nummer, { ...food, grupp });
    }
  }
  for (const id of requiredIds) {
    const food = list.find(f => f.nummer === id);
    if (!food) throw new Error(`Obligatorisk källpost saknas: ${id}`);
    selected.set(id, { ...food, grupp: groups.find(([,p]) => p.test(food.namn))?.[0] ?? 'övrigt' });
  }
  return [...selected.values()].sort((a,b) => a.nummer - b.nummer);
}

export function classify(namn, grupp) {
  const n = namn.toLowerCase();
  // Rätter får tempo från kolhydratkällan; fullkorn prioriteras framför "vitt".
  const slow = /pasta|spagetti|makaron|havregryn|gröt|kornbröd|linser|bönor/.test(n)
    || (/bröd/.test(n) && /fullkorn/.test(n))
    || (grupp === 'nötter och fett' && /mandel|nöt/.test(n));
  const fast = /bröd vitt|potatis|cornflakes|frukostflingor|socker|godis|juice|läsk|saft/.test(n)
    || (/^ris /.test(n) && !/råris|vildris|fullkorn/.test(n));
  const explicitMedium = grupp === 'frukt och bär' || /bröd|müsli/.test(n);
  const tempo = /müsli/.test(n) ? 'medel' : slow ? 'långsam' : fast ? 'snabb' : 'medel';
  // Kompositrätter som nämner mjölk/ost får också flaggan; växtdrycker får den inte.
  const insulinotrop = /mjölk|yoghurt|filmjölk|\bfil\b|kvarg|\bost\b|keso|vassle|proteinpulver|glass/.test(n)
    && !/mjölkfri|mjölkchoklad|kokosmjölk/.test(n);
  const liquid = grupp === 'dryck' || /smoothie|shake|proteindryck|vassle flytande|yoghurtdryck/.test(n)
    || (/mjölk|^fil |filmjölk|^yoghurt/.test(n) && !/pulver|bröd|kokt|gröt|choklad/.test(n));
  return { tempo, insulinotrop, form: liquid ? 'flytande' : 'fast',
    tempoStandard: !slow && !fast && !explicitMedium };
}

// Schabloner för ätlig mängd. Inga volymmått på torra varor utan egen schablon.
export function portions(namn, grupp, form) {
  const n = namn.toLowerCase();
  if (/^ägg/.test(n)) return { st:50, portion:100 };
  if (n === 'banan') return { st:120, portion:120 };
  if (/^(knäckebröd|hårt bröd)/.test(n)) return { skiva:12, st:12, portion:24 };
  if (/^bröd/.test(n)) return { skiva:40, st:40, portion:80 };
  if (/^havregryn/.test(n) && !/gröt/.test(n)) return { dl:35, msk:5, portion:35 };
  if (/gröt/.test(n)) return { dl:100, portion:250 };
  if (/olja/.test(n)) return { dl:90, msk:14, tsk:5, portion:14 };
  if (/^smör /.test(n)) return { msk:15, tsk:5, portion:10 };
  if (/^ost /.test(n)) return { skiva:10, portion:20 };
  if (/^margarin/.test(n)) return { msk:15, tsk:5, portion:10 };
  if (grupp === 'nötter och fett' && /nöt|mandel|frö/.test(n)) return { handfull:30, portion:30 };
  if (form === 'flytande') return { dl:100, msk:15, tsk:5, kopp:200, portion:200 };
  if (grupp === 'mejeri och ägg') return { dl:100, msk:15, portion:200 };
  if (/^(pasta|ris |bulgur|couscous|quinoa|nudlar)/.test(n)) return { portion:/okokt/.test(n) ? 75 : 150 };
  if (grupp === 'rätter och sötsaker') return { portion:/^(glass|choklad|godis|socker|honung|sylt)/.test(n) ? 50 : 350 };
  if (grupp === 'kött och fågel' || grupp === 'fisk och skaldjur') return { portion:150 };
  return { portion:100 };
}

export function convertFood(food, values) {
  const item = { id:food.nummer, namn:food.namn, grupp:food.grupp };
  for (const [field, [code,unit]] of Object.entries(fields)) {
    const value = values.find(v => v.euroFIRkod === code && v.enhet.toLowerCase() === unit);
    if (!value || value.viktGram !== 100 || !Number.isFinite(value.varde)) throw new Error(`Saknat värde ${field}: ${food.nummer}`);
    item[field] = round(value.varde);
  }
  const { tempoStandard, ...classification } = classify(item.namn, item.grupp);
  Object.assign(item, classification);
  item.alias = [];
  item.portioner = portions(item.namn, item.grupp, item.form);
  return { item, tempoStandard };
}

export function validate(items) {
  const ids = new Set();
  for (const f of items) {
    if (!f || !['string','number'].includes(typeof f.id) || !f.id || ids.has(f.id)) throw new Error(`Ogiltigt/dubbelt id: ${f?.id}`);
    ids.add(f.id);
    for (const k of Object.keys(fields)) if (!Number.isFinite(f[k]) || f[k] < 0 || f[k] > (k === 'kcal' ? 950 : 100)) throw new Error(`Ogiltigt ${k}: ${f.id}`);
    // 0,15 g tolerans för tre oberoende avrundningar. Källans socker kan överstiga
    // tillgänglig KH (t.ex. smör); behåll källvärdet utan att ändra det.
    if (f.kh + f.protein + f.fett > 100.15 || f.mattat > f.fett + 0.1) throw new Error(`Orimliga makron: ${f.id}`);
    if (!f.namn || !f.grupp || !['fast','flytande'].includes(f.form) || !['snabb','medel','långsam'].includes(f.tempo)
      || typeof f.insulinotrop !== 'boolean' || !Array.isArray(f.alias) || f.alias.some(a => typeof a !== 'string' || !a)
      || !f.portioner || !Object.keys(f.portioner).length || Object.values(f.portioner).some(g => !Number.isFinite(g) || g <= 0)) throw new Error(`Ogiltig beskrivning: ${f.id}`);
  }
}

const aliases = {
  2205:['ägg','kokt ägg'],553:['banan'],3794:['grovt bröd','fullkornsbröd'],150:['mjölk','mellanmjölk'],
  702:['havregryn'],846:['pasta','kokt pasta','spaghetti','spagetti','makaroner'],2513:['ris','kokt ris','basmatiris'],
  3243:['kvarg'],1575:['mandel','mandlar','nötter'],29:['smör'],2189:['rapsolja'],951:['köttfärs','nötfärs'],
  1255:['lax'],1957:['kaffe','svart kaffe'],202:['vitt bröd'],124:['yoghurt','naturell yoghurt'],97:['ost','hårdost'],
  171:['knäckebröd','knäcke','knäckebrödsskiva'],677:['gröt','havregrynsgröt'],858:['pasta med köttfärssås','spaghetti med köttfärssås'],
};

export function addRecipes(items) {
  const get = id => { const f = items.find(f => f.id === id); if (!f) throw new Error(`Recept saknar ${id}`); return f; };
  // Vassle saknas i API:t som pulver. Coworks kalibreringsportion: 30 g = 2 KH, 24 protein, 1 fett.
  const whey = { id:'fasta-vassle',namn:'Vassleproteinpulver (schablon)',grupp:'mejeri och ägg',kcal:377,
    kh:6.7,socker:6.7,fiber:0,protein:80,fett:3.3,mattat:2,form:'fast',tempo:'medel',insulinotrop:true,
    alias:['proteinpulver','vassleprotein','vassle'],portioner:{ portion:30 },uppskattad:true,
    antagande:'Coworks kalibreringsschablon: 30 g innehåller 2 g kolhydrat, 24 g protein och 1 g fett. Socker/mättat uppskattat. Inte en Livsmedelsverkspost.' };
  items.push(whey);
  const recipes = [
    { id:'fasta-ostsmorgas',namn:'Smörgås med ost (schablon)',ingredienser:[{id:202,gram:40},{id:97,gram:10},{id:29,gram:5}],tempo:'snabb',form:'fast',alias:['smörgås med ost','ostsmörgås','ostmacka'] },
    { id:'fasta-proteinshake',namn:'Proteinshake med vatten (schablon)',ingredienser:[{id:whey.id,gram:30},{id:null,gram:200}],tempo:'medel',form:'flytande',alias:['proteinshake','proteindryck','vassleshake'] },
  ];
  for (const recipe of recipes) {
    const gram = recipe.ingredienser.reduce((sum,i) => sum+i.gram,0);
    const f = { ...recipe,grupp:'rätter och sötsaker',insulinotrop:true,portioner:{ portion:gram },uppskattad:true,
      antagande:'Viktat recept med ätliga gram enligt ingredienslistan; id null betyder vatten.' };
    for (const k of Object.keys(fields)) f[k] = round(recipe.ingredienser.reduce((sum,i) => sum+(i.id === null ? 0 : get(i.id)[k]*i.gram/gram),0));
    items.push(f);
  }
  for (const f of items) if (aliases[f.id]) f.alias = aliases[f.id];
}

export async function build({ cache, output = new URL('../data/livsmedel.json',import.meta.url), request = fetch } = {}) {
  if (cache) await mkdir(cache, { recursive:true });
  async function json(path, key) {
    const file = cache && join(cache,`${key}.json`);
    if (file) { try { return JSON.parse(await readFile(file,'utf8')); } catch(e) { if (e.code !== 'ENOENT') throw e; } }
    let last;
    for (let attempt=0; attempt<3; attempt++) {
      try {
        const response = await request(`${API}/${path}`, { signal:AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
        const value = await response.json();
        if (file) await writeFile(file,JSON.stringify(value));
        return value;
      } catch(e) { last=e; }
    }
    throw last;
  }
  const list = [];
  for (let offset=0;;) {
    const page = await json(`livsmedel?offset=${offset}&limit=500&sprak=1`,`lista-${offset}`);
    if (!Array.isArray(page.livsmedel) || !Number.isInteger(page._meta?.totalRecords)) throw new Error('Ogiltig API-sida');
    list.push(...page.livsmedel);
    offset += page.livsmedel.length;
    if (offset >= page._meta.totalRecords) break;
    if (!page.livsmedel.length) throw new Error('Ofullständig livsmedelslista');
  }
  const selected = selectFoods(list);
  const converted = new Array(selected.length);
  let next=0;
  // Fyra samtidiga hämtningar, återanvänd cache vid avbruten körning.
  await Promise.all(Array.from({length:4},async () => {
    while (next < selected.length) {
      const i = next++;
      converted[i] = convertFood(selected[i], await json(`livsmedel/${selected[i].nummer}/naringsvarden?sprak=1`,`naring-${selected[i].nummer}`));
    }
  }));
  const items = converted.map(c => c.item);
  addRecipes(items);
  validate(items);
  if (items.length < 400 || items.length > 800) throw new Error(`Urval utanför 400–800: ${items.length}`);
  const data = { kalla:KALLA,kallUrl:'https://dataportal.livsmedelsverket.se/livsmedel/swagger/index.html',
    licens:'https://creativecommons.org/licenses/by/4.0/deed.sv',hamtdatum:new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Stockholm'}),
    kallversioner:[...new Set(selected.map(f => f.version.slice(0,10)))].sort(),enhet:'per 100 g ätlig mängd',
    bearbetning:'Urval, avrundning till en decimal, alias, schablonportioner och klassning enligt T-54. Egna recept och vassle är märkta uppskattad.',
    tempoStandardIds:converted.filter(c => c.tempoStandard).map(c => c.item.id),
    portionsantagande:'Alla portionsmått är FASTA-schabloner i gram ätlig mängd, inte uppmätta av Livsmedelsverket.',livsmedel:items };
  const encoded = JSON.stringify(data)+'\n';
  const gzip = gzipSync(encoded).length;
  if (gzip > 150*1024) throw new Error(`För stor fil: ${gzip} gzip-byte`);
  await writeFile(output,encoded);
  return { poster:items.length,byte:Buffer.byteLength(encoded),gzipByte:gzip,tempoStandard: data.tempoStandardIds.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--cache')) throw new Error('Använd: --cache <mapp>');
  console.log(await build({ cache:args[1] && resolve(args[1]) }));
}
