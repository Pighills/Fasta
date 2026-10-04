import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { FEATURES, PH, FASTENIVA_TEXT, FASTENIVA_CARD, localFastenivaPreview, SNITTPERSON } from '../js/data.js';
import { fastenivaReading, fastenivaGraphHTML, fastenivaBarHTML, updateFastenivaBar, metabolicHoursAt } from '../js/views/fasteniva.js';
const H = 3600000, now = 1800000000000;
const fast = { start:now-14*H, meals:[], workouts:[], profile:{} };
beforeEach(() => { FEATURES.fastenivaa = false; });
const read = file => readFileSync(new URL('../'+file, import.meta.url),'utf8');

test('avstängd flagga döljer bar/graf och behåller v48-paletten, produktion kan inte aktiveras via adressen', () => {
  assert.equal(fastenivaBarHTML(), '');
  assert.equal(fastenivaGraphHTML(fast,now-H,now), '');
  assert.deepEqual(PH.map(p=>p.c), ['#8a8a80','#b5b5aa','#b99a69','#c8a84e','#e8d9b0','#ae9977','#d6bd7a','#f5f5f0']);
  for (const hostname of ['fastatimer.se','preview.vercel.app','localhost.evil.example']) assert.equal(localFastenivaPreview({hostname,search:'?fastenivaa=1'}),false);
  assert.equal(localFastenivaPreview({hostname:'localhost',search:'?fastenivaa=1'}),true);
  assert.equal(localFastenivaPreview({hostname:'localhost',search:''}),false);
});

test('tre barlägen, profiler och gammal paus följer modellen utan att ändra data', () => {
  const m = {time:now-H,foodType:'blandad',pauseHours:3.2666666666666666};
  assert.match(fastenivaReading({...fast,meals:[m]},now).text,/Ungefär .* till fastefönster\./);
  assert.equal(fastenivaReading({...fast,start:now-H},now).text,FASTENIVA_TEXT.rad[1]);
  assert.match(fastenivaReading(fast,now).text,/Levern har använt ungefär 40 %/);
  assert.equal(fastenivaReading(fast,now).profileText,FASTENIVA_TEXT.snittperson);
  assert.equal(fastenivaReading({...fast,profile:{weight:90}},now).profileText,FASTENIVA_TEXT.profil);
  assert.equal(fastenivaReading({...fast,profile:SNITTPERSON},now).profileText,'Beräknat utifrån din profil.');
  const old = {...fast,meals:[{time:now-2*H,pauseHours:2}]};
  assert.equal(metabolicHoursAt(old,now),12);
  const before=JSON.stringify(old); FEATURES.fastenivaa=true;
  const graph=fastenivaGraphHTML(old,now-24*H,now+6*H,now);
  assert.match(graph,/Tidigare måltid · sparad paus/);
  assert.equal(JSON.stringify(old),before);
});

test('grafen innehåller tillgänglig beskrivning, fasnamn, kategori, pass och säker HTML', () => {
  FEATURES.fastenivaa=true;
  const graph=fastenivaGraphHTML({...fast,meals:[{time:now-H,foodType:'protein'}],workouts:[{time:now-2*H,durationMins:30,type:'<script>x</script>'}]},now-24*H,now+6*H,now);
  for (const re of [/role="img"/,/aria-labelledby=/,/<title/,/<desc/,/stroke-dasharray="5 4"/,/Protein/,/Fas 3 av 8/,/Leverns glykogen/,/Uppskattning, inte en mätning\./,/&lt;script&gt;/]) assert.match(graph,re);
  assert.doesNotMatch(graph,/<script>/);
});

test('barens element behålls och beräkningen ändras först efter tio sekunder', () => {
  FEATURES.fastenivaa=true;
  const previous=globalThis.document;
  const nodes=new Map(['fasteniva-fill','fasteniva-hatch','fasteniva-row','fasteniva-phase','fasteniva-profile'].map(id=>[id,{style:{},textContent:''}]));
  globalThis.document={getElementById:id=>nodes.get(id)};
  try {
    const m={time:now-H,foodType:'blandad'};
    const active={...fast,meals:[m]};
    updateFastenivaBar(active,now,true);
    const node=nodes.get('fasteniva-fill'),width=node.style.width;
    updateFastenivaBar(active,now+1000);
    assert.equal(node.style.width,width);
    updateFastenivaBar(active,now+10000);
    assert.notEqual(node.style.width,width);
    assert.equal(nodes.get('fasteniva-fill'),node);
  } finally {globalThis.document=previous;}
});

test('förslagspaletten uppfyller AA för vanlig text mot båda bakgrunderna', () => {
  FEATURES.fastenivaa=true;
  const lum=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
  for(const p of PH) for(const bg of ['#0a0a0a','#1a1a1a']) assert.ok((lum(p.c)+.05)/(lum(bg)+.05)>=4.5,p.l);
});

test('alla hälso- och Lär-texter är ordagranna från kunskapsbasen', () => {
  const source=read('docs/kunskap/fastenivaa.md');
  for(const text of [FASTENIVA_TEXT.markning,...FASTENIVA_TEXT.rad,FASTENIVA_TEXT.snittperson,FASTENIVA_TEXT.profil,...FASTENIVA_TEXT.sakerhet,FASTENIVA_CARD.fb,FASTENIVA_CARD.bk]) assert.ok(source.includes('> '+text),text);
  assert.ok(source.includes(FASTENIVA_CARD.src));
});

test('säkerhetsrutan kräver svar, visas en gång och klarar otillgänglig lagring', () => {
  const source=read('js/modals.js');
  const code=source.slice(source.indexOf('let fastenivaAccepted'),source.indexOf('export function openFastenivaGraph')).replaceAll('export function','function');
  for(const denied of [false,true]) {
    let handler, saved=null, count=0, removed=0;
    const ctx={FEATURES:{fastenivaa:true},FASTENIVA_TEXT,esc:x=>x,document:{querySelector:()=>null},localStorage:{getItem:()=>{if(denied)throw Error();return saved;},setItem:(k,v)=>{assert.equal(k,'fasta-fasteniva-ok');if(denied)throw Error();saved=v;}},showNotice:()=>{},openModal:(html,options)=>{assert.equal(options.dismissible,false);assert.ok(html.includes(FASTENIVA_TEXT.sakerhet[0]));count++;return {querySelector:()=>({addEventListener:(_,fn)=>handler=fn}),remove:()=>removed++};}};
    runInNewContext(code,ctx);ctx.openFastenivaSafety();assert.equal(count,1);handler();assert.equal(removed,1);ctx.openFastenivaSafety();assert.equal(count,1);ctx.resetFastenivaSafety();if(denied){ctx.openFastenivaSafety();assert.equal(count,2);}
  }
});

test('radering tar bort kvitto och nollställer svar i minnet', () => {
  const source=read('js/actions.js');
  const fn=source.slice(source.indexOf('export function eraseAll()'),source.indexOf('export function clearHistory()')).replace('export ','');
  let reset=0;const removed=[];
  const ctx={confirmModal:(...args)=>args.at(-1)(),eraseAllData:()=>{},localStorage:{removeItem:k=>removed.push(k)},resetFastenivaSafety:()=>reset++,stopTicker:()=>{},setView:()=>{},showNotice:()=>{},openFriskrivning:()=>{}};
  runInNewContext(fn,ctx);ctx.eraseAll();assert.ok(removed.includes('fasta-fasteniva-ok'));assert.equal(reset,1);
});

test('Timer med flaggan på behåller hela DOM:en vid tick och visar profiler på baren', async () => {
  const { state, profile } = await import('../js/state.js');
  const { renderTimer, tickTimer } = await import('../js/views/timer.js');
  FEATURES.fastenivaa=true;
  const oldDoc=globalThis.document,oldTimeout=globalThis.setTimeout,oldStorage=globalThis.localStorage;
  const savedState=structuredClone(state),savedProfile=structuredClone(profile);
  let builds=0;const nodes=new Map();
  const content={set innerHTML(value){builds++;nodes.clear();for(const m of value.matchAll(/id="([^"]+)"/g))nodes.set(m[1],{style:{},textContent:'',addEventListener(){},setAttribute(k,v){this[k]=v;}});}};
  globalThis.document={getElementById:id=>id==='content'?content:nodes.get(id),querySelector:()=>null,querySelectorAll:()=>[]};
  globalThis.localStorage={getItem:()=> 'accepted'};
  globalThis.setTimeout=()=>0;
  Object.assign(state,{fasting:true,rolling:true,startTime:now-14*H,now,meals:[],workouts:[],expandedPhase:null});
  for(const k of Object.keys(profile))delete profile[k];profile.weight=95;
  try {
    renderTimer();const count=builds,node=nodes.get('fasteniva-fill');
    assert.equal(nodes.get('fasteniva-profile').textContent,FASTENIVA_TEXT.profil);
    state.now+=11000;tickTimer();assert.equal(builds,count);assert.equal(nodes.get('fasteniva-fill'),node);
  } finally {
    globalThis.document=oldDoc;globalThis.setTimeout=oldTimeout;globalThis.localStorage=oldStorage;
    Object.assign(state,savedState);for(const k of Object.keys(profile))delete profile[k];Object.assign(profile,savedProfile);
  }
});
