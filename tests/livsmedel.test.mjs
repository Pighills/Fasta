import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { validate, convertFood, classify, selectFoods, build, CONTROL_IDS, KALLA } from '../scripts/bygg-livsmedel.mjs';

const bytes = readFileSync(new URL('../data/livsmedel.json',import.meta.url));
const data = JSON.parse(bytes);
const fixture = JSON.parse(readFileSync(new URL('./fixtures/standardportioner.json',import.meta.url)));
const items = data.livsmedel;
const food = id => { const f = items.find(f => f.id === id); assert.ok(f,`Saknad post ${id}`); return f; };

test('referenstabell har källa, versionsdatum, 400–800 poster och liten gzip-fil', () => {
  assert.equal(data.kalla,KALLA);
  assert.match(data.hamtdatum,/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(data.kallversioner.length);
  assert.match(data.licens,/creativecommons.org\/licenses\/by\/4.0/);
  assert.ok(items.length >= 400 && items.length <= 800);
  assert.ok(gzipSync(bytes).length < 150*1024);
  validate(items);
  for (const f of items) for (const key of ['kcal','kh','socker','fiber','protein','fett','mattat']) {
    assert.ok(Math.abs(f[key]*10-Math.round(f[key]*10)) < 1e-9,`${f.id}: ${key}`);
  }
});

test('14 kontrollposter matchar oberoende sparade API-värden, inte genererade schabloner', () => {
  assert.deepEqual(fixture.kontrollposter.map(f => f.id),CONTROL_IDS);
  for (const ref of fixture.kontrollposter) {
    const f = food(ref.id);
    assert.equal(f.uppskattad,undefined);
    for (const [key,value] of Object.entries(ref.per100g)) {
      assert.ok(Math.abs(f[key]-value) <= 0.051,`${f.namn} ${key}: ${f[key]} mot ${value}`);
    }
  }
});

test('proteinpulver är femtonde kontrollposten och tydligt en uppskattning, shake räknar vatten', () => {
  const powder=food('fasta-vassle'), shake=food('fasta-proteinshake');
  assert.equal(powder.uppskattad,true);
  assert.match(powder.antagande,/Inte en Livsmedelsverkspost/);
  assert.equal(powder.protein,80);
  assert.equal(powder.portioner.portion,30);
  assert.equal(shake.form,'flytande');
  assert.ok(Math.abs(shake.protein*2.3-24) < 0.15);
  assert.ok(Math.abs(shake.kh*2.3-2) < 0.15);
  assert.ok(Math.abs(shake.fett*2.3-1) < 0.15);
});

test('tempo följer uppdraget, pasta och fullkorn prioriteras i kompositnamn', () => {
  for (const id of [202,2513]) assert.equal(food(id).tempo,'snabb');
  for (const id of [846,702,677,3794,1575,858]) assert.equal(food(id).tempo,'långsam');
  assert.equal(food(553).tempo,'medel');
  assert.equal(classify('Bröd vitt fullkorn graham','bröd och spannmål').tempo,'långsam');
  assert.equal(classify('Pasta m. potatis','rätter och sötsaker').tempo,'långsam');
  assert.equal(classify('Frukostflingor müsli fullkorn m. socker','bröd och spannmål').tempo,'medel');
  for (const id of data.tempoStandardIds) assert.equal(food(id).tempo,'medel');
  assert.ok(data.tempoStandardIds.includes(2205));
});

test('mejeriflagga och flytande form skiljer mjölk, ost, pulver och shake', () => {
  for (const id of [150,124,3243,97,'fasta-vassle','fasta-proteinshake']) assert.equal(food(id).insulinotrop,true);
  for (const id of [553,2205,2189,846]) assert.equal(food(id).insulinotrop,false);
  assert.equal(food(150).form,'flytande');
  assert.equal(food(97).form,'fast');
  assert.equal(food('fasta-vassle').form,'fast');
  assert.equal(classify('Kokosmjölk','övrigt').insulinotrop,false);
  assert.equal(classify('Havredryck','dryck').insulinotrop,false);
});

test('portioner, alias och standardrätter är användbara och nio kalibreringsportioner kan byggas', () => {
  assert.equal(food(2205).portioner.st,50);
  assert.equal(food(553).portioner.st,120);
  assert.equal(food(202).portioner.skiva,40);
  assert.equal(food(150).portioner.dl,100);
  assert.equal(food(2189).portioner.msk,14);
  assert.equal(food(1575).portioner.handfull,30);
  assert.ok(food(846).alias.includes('makaroner'));
  assert.ok(food(677).alias.includes('gröt'));
  assert.ok(food(171).alias.includes('knäckebröd'));
  assert.equal(food(171).portioner.skiva,12);
  assert.ok(food('fasta-proteinshake').alias.includes('proteindryck'));
  assert.equal(food('fasta-ostsmorgas').uppskattad,true);
  assert.equal(fixture.standardportioner.length,9);
  assert.equal(new Set(fixture.standardportioner.map(p => p.kategori)).size,9);
  for (const p of fixture.standardportioner) for (const i of p.ingredienser) {
    food(i.id);
    assert.ok(i.gram > 0);
  }
});

test('validering vägrar negativa värden, dubbletter, saknade fält och orimliga makron', () => {
  const valid=food(553);
  for (const override of [{kcal:-1},{kcal:951},{kh:90,protein:20},{fett:NaN},{fiber:undefined},
    {form:'gas'},{tempo:'annan'},{insulinotrop:1},{portioner:{st:-2}},{alias:[3]}]) {
    assert.throws(() => validate([{...valid,...override}]));
  }
  assert.throws(() => validate([valid,valid]),/dubbelt id/);
});

test('API-konvertering skiljer kcal från kJ och vägrar bortfall i stället för nollor', () => {
  const source={nummer:1,namn:'Banan',grupp:'frukt och bär'};
  const values=Object.entries({CHO:20,SUGAR:10,FIBT:2,PROT:1,FAT:0.3,FASAT:0.1})
    .map(([euroFIRkod,varde]) => ({euroFIRkod,varde,enhet:'g',viktGram:100}));
  values.unshift({euroFIRkod:'ENERC',varde:400,enhet:'kJ',viktGram:100});
  values.push({euroFIRkod:'ENERC',varde:95.26,enhet:'kcal',viktGram:100});
  assert.equal(convertFood(source,values).item.kcal,95.3);
  assert.throws(() => convertFood(source,values.slice(0,-1)),/Saknat värde kcal/);
  assert.throws(() => convertFood(source,values.map(v=>({...v,viktGram:50}))),/Saknat värde/);
});

test('urval är deterministiskt och behåller alla obligatoriska poster', () => {
  const small = [...CONTROL_IDS,202,124,97,171,677,858,1172].map(nummer => ({nummer,namn:`Bröd ${nummer}`}));
  assert.deepEqual(selectFoods(small),selectFoods([...small].reverse()));
});

test('byggskript avvisar trasiga/avbrutna svar och skriver aldrig över den gamla filen', async () => {
  const dir=await mkdtemp(join(tmpdir(),'fasta-livsmedel-test-'));
  const output=join(dir,'livsmedel.json');
  try {
    const {writeFile}=await import('node:fs/promises');
    await writeFile(output,'tidigare fil');
    await assert.rejects(build({output,request:async()=>({ok:true,json:async()=>({})})}),/Ogiltig API/);
    await assert.rejects(build({output,request:async()=>({ok:true,json:async()=>({_meta:{totalRecords:2},livsmedel:[]})})}),/Ofullständig/);
    let calls=0;
    await assert.rejects(build({output,request:async()=>{calls++;return {ok:false,status:503};}}),/HTTP 503/);
    assert.equal(calls,3);
    assert.equal(await readFile(output,'utf8'),'tidigare fil');
  } finally { await rm(dir,{recursive:true,force:true}); }
});
