import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { migrate, cleanMeal, cleanProfile, logsFor } from '../js/migrations.js';
import { tolkaMat } from '../js/matparser.js';
import { MAT_TEXT } from '../js/data.js';
import { runInNewContext } from 'node:vm';
const table = JSON.parse(readFileSync(new URL('../data/livsmedel.json', import.meta.url)));
const read = f => readFileSync(new URL('../'+f, import.meta.url), 'utf8');
test('fasta-v50 schema 2 laddas oförändrat och nya måltider överlever migrering', () => {
  const old = {schemaVersion:2, active:{id:'f',fasting:true,startTime:1000}, profile:{age:40}, events:[{id:'m',type:'meal',t:2000,data:{fastId:'f',desc:'Ägg',kcal:136,foodType:'protein',pauseHours:2}}]};
  const before = JSON.stringify(old); assert.deepEqual(migrate(old), old); assert.equal(JSON.stringify(old), before);
  const fresh = {...old, events:[...old.events,{id:'m2',type:'meal',t:3000,data:{fastId:'f', ...tolkaMat('2 ägg och en banan',table)}}]};
  assert.deepEqual(migrate(JSON.parse(JSON.stringify(fresh))), fresh);
  const meal = logsFor(fresh.events, 'meal', 'f')[1]; assert.equal(meal.items.length, 2); assert.equal(meal.makron.kcal,250);
});
test('läsvalidering skyddar rader, makron och favoriter utan att röra rådata', () => {
  const raw={items:Array(20).fill({namn:'a',matchning:553,mangd_g:9999,sakerhet:'hög'}),fritext:'a'.repeat(400),form:'fel',makron:{kcal:-5,kh:Infinity}};
  const r=cleanMeal(raw); assert.equal(r.items.reduce((n,i)=>n+i.mangd_g,0),3000); assert.equal(r.fritext.length,300); assert.equal(r.form,undefined); assert.equal(r.makron.kcal,0); assert.equal(raw.items[0].mangd_g,9999);
  const p=cleanProfile({matFavoriter:[{namn:'Min mat',items:r.items,fritext:'ägg',foodType:'protein'},{namn:'trasig',items:null}]}); assert.equal(p.matFavoriter.length,1);
});
test('nya matinmatningen saknar externa anrop och skyddar alla utskrifter',()=>{
  const ui=read('js/matinmatning.js'), parser=read('js/matparser.js');
  assert.doesNotMatch(ui,/fetch\(|https?:\/\//); assert.match(parser,/new URL\('\.\.\/data\/livsmedel.json', import.meta.url\)/);
  assert.match(ui,/esc\(r.namn\)/); assert.match(ui,/expectedFast !== state.activeId/);
  assert.match(ui,/mode.preview \?/); assert.match(ui,/<details><summary>Visa detaljer/);
  assert.doesNotMatch(read('js/views/history.js'),/makron/);
});
test('matens säkerhetsruta är separat, visas först och återställs efter radering',()=>{
  const source=read('js/matinmatning.js');
  const code=source.slice(source.indexOf('let accepted = false;'),source.indexOf('function mealDialog')).replaceAll('export function','function');
  let callback, saved=null, next=0, shown=0;
  const ctx={MAT_TEXT,esc:x=>x,document:{querySelector:()=>null},showNotice:()=>{},localStorage:{getItem:()=>saved,setItem:(key,value)=>{assert.equal(key,'fasta-mat-ok');saved=value;}}};
  const openModal=(html,options)=>{shown++;assert.ok(html.includes(MAT_TEXT.sakerhet[1]));assert.equal(options.dismissible,false);return {querySelector:()=>({addEventListener:(_,fn)=>callback=fn}),remove(){}};};
  runInNewContext(code,ctx);ctx.safety(openModal,()=>next++);assert.equal(next,0);callback();assert.equal(next,1);
  ctx.safety(openModal,()=>next++);assert.equal(shown,1);assert.equal(next,2);
  saved=null;ctx.resetMatSafety();ctx.safety(openModal,()=>next++);assert.equal(shown,2);assert.equal(next,2);
});
