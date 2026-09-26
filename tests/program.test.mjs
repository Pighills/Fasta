import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanGoal, latestGoal, programState, weekProgress } from '../js/program.js';
import * as storage from '../js/state.js';
import { setGoal, startProgram, pauseProgram, resumeProgram, endProgram } from '../js/actions.js';
import { migrate } from '../js/migrations.js';

process.env.TZ = 'Europe/Stockholm';
const at = s => new Date(s).getTime();
const ev = (action, date, programId = 'komIgang', id = action + date) => ({ id, type: 'program', t: at(date), data: { action, programId } });
const start = ev('start', '2026-09-01T23:50');
test('program days, weekly increases and completion use local midnight', () => {
  assert.equal(programState([], at('2026-09-01')), null);
  for (const [date, day, hours, complete] of [
    ['01T23:59', 1, 12, false], ['02T00:00', 2, 12, false], ['08T00:00', 8, 14, false],
    ['15T00:00', 15, 16, false], ['28T23:59', 28, 16, false], ['29T00:00', 29, 16, true],
  ]) {
    const p = programState([start], at('2026-09-' + date));
    assert.deepEqual([p.day, p.hours, p.complete, p.week], [day, hours, complete, Math.ceil(day / 7)]);
  }
});
test('pause freezes day, resume subtracts calendar dates; repeated actions do not double count', () => {
  const events = [start, ev('pause', '2026-09-03T10:00'), ev('pause', '2026-09-04T10:00')];
  assert.equal(programState(events, at('2026-09-06T09:00')).day, 3);
  events.push(ev('resume', '2026-09-06T10:00'), ev('resume', '2026-09-06T11:00'));
  assert.equal(programState(events, at('2026-09-06T12:00')).day, 3);
  assert.equal(programState(events, at('2026-09-07T00:00')).day, 4);
});
test('replace paused program resets day; unrelated actions ignored; end removes card', () => {
  const events = [start, ev('pause', '2026-09-03'), ev('start', '2026-09-06', 'vana168'), ev('end', '2026-09-07')];
  const p = programState(events, at('2026-09-06T12:00'));
  assert.deepEqual([p.day, p.paused, p.hours, p.days], [1, false, 16, 56]);
  assert.equal(programState(events, at('2026-09-07')).programId, 'vana168');
  events.push(ev('end', '2026-09-08', 'vana168'));
  assert.equal(programState(events, at('2026-09-08')), null);
});
test('spring and autumn DST days and pauses count calendar dates', () => {
  for (const [before, after] of [['2026-03-28T23:50', '2026-03-30T00:10'], ['2026-10-24T23:50', '2026-10-26T00:10']]) {
    assert.equal(programState([ev('start', before)], at(after)).day, 3);
    const events = [ev('start', before), ev('pause', before), ev('resume', after)];
    assert.equal(programState(events, at(after)).day, 1);
  }
});
test('invalid, unknown and future events are ignored; sorting does not mutate input', () => {
  const events = [ev('end', '2027-01-01'), null, start, { ...start, t: '123' }, ev('oops', '2026-09-02'), ev('start', '2026-09-02', '__proto__'), {type:'program',t:Infinity,data:{}}];
  const before = structuredClone(events);
  assert.equal(programState(events, at('2026-09-03')).day, 3);
  assert.deepEqual(events, before);
});
test('goals read valid numbers only, including boundaries and removal', () => {
  for (const v of [null, {}, {fastsPerWeek:'5', targetWeight:'70'}, {fastsPerWeek:1.5,targetWeight:251}]) assert.deepEqual(cleanGoal(v), {fastsPerWeek:null,targetWeight:null});
  for (const [fastsPerWeek,targetWeight] of [[1,30],[7,250]]) assert.deepEqual(cleanGoal({fastsPerWeek,targetWeight}), {fastsPerWeek,targetWeight});
  const events = [{type:'goal',t:1,data:{fastsPerWeek:5,targetWeight:70}}, {type:'goal',t:2,data:{fastsPerWeek:null,targetWeight:null}}];
  assert.equal(latestGoal(events,1).fastsPerWeek,5);
  assert.equal(latestGoal(events,2).fastsPerWeek,null);
});
test('Monday–Sunday counts net twelve-hour fasts and unique sixteen-hour completion days', () => {
  const fast = (id, end, hours) => ({id,type:'fast',t:at(end)-hours*3600000,data:{end:at(end),duration:hours*3600000}});
  const events = [fast('old','2026-09-20T23:59',16),fast('a','2026-09-21T00:00',12),fast('b','2026-09-22T10:00',16),fast('c','2026-09-22T20:00',16),fast('d','2026-09-23T20:00',16),fast('e','2026-09-24T20:00',16),fast('short','2026-09-25T20:00',11.99),fast('paused','2026-09-26T20:00',12),fast('next','2026-09-28T00:00',16)];
  events.push({id:'meal',type:'meal',t:at('2026-09-26T10:00'),data:{fastId:'paused',pauseHours:1}});
  assert.deepEqual(weekProgress(events,at('2026-09-27T23:59')), {fasts:5,days16:3});
  assert.deepEqual(weekProgress(events,at('2026-09-28T00:00')), {fasts:1,days16:1});
});

function setup(data = {}) {
  const raw = JSON.stringify(migrate({ schemaVersion: 2, active: {}, profile: {}, events: [], ...data }));
  const values = new Map([['fasta-data', raw]]);
  globalThis.localStorage = { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,String(v)), removeItem: k => values.delete(k) };
  storage.reload();
  return raw;
}
test('goal/program actions append events without changing active fast, profile or old events', () => {
  const raw = setup({active:{id:'active',fasting:true,startTime:Date.now()-3600000,goalHours:16,rolling:false},profile:{age:40,health:{under18:true}},events:[{id:'old',type:'custom',t:1,data:{anything:42}}]});
  assert.equal(localStorage.getItem('fasta-data'),raw);
  setGoal({fastsPerWeek:5,targetWeight:70});
  startProgram('komIgang'); pauseProgram(); resumeProgram();
  const after = JSON.parse(localStorage.getItem('fasta-data'));
  const before = JSON.parse(raw);
  assert.deepEqual(after.active,before.active);
  assert.deepEqual(after.profile,before.profile);
  assert.deepEqual(after.events[0],before.events[0]);
  assert.equal(storage.programView().day,1);
  assert.equal(storage.programView().paused,false);
  endProgram(); assert.equal(storage.programView(),null);
});
test('old dialog revisions refuse after a reload, including another start of the same program', () => {
  setup(); startProgram('komIgang');
  const old = storage.programView().revision;
  startProgram('komIgang'); storage.reload();
  const raw = localStorage.getItem('fasta-data');
  for (const action of [pauseProgram,resumeProgram,endProgram]) assert.throws(() => action(old), e => e.reason === 'stale');
  assert.throws(() => startProgram('tidigt',old), e => e.reason === 'stale');
  assert.equal(localStorage.getItem('fasta-data'),raw);
});
test('goals and programs refuse stale writes and newer schemas', () => {
  for (const action of [() => setGoal({fastsPerWeek:3}), () => startProgram('komIgang')]) {
    setup();
    const newer = JSON.stringify({...JSON.parse(localStorage.getItem('fasta-data')),profile:{age:50}});
    localStorage.setItem('fasta-data',newer);
    assert.throws(action,e => e.reason === 'stale');
    assert.equal(localStorage.getItem('fasta-data'),newer);
    const locked = JSON.stringify({schemaVersion:99,important:'keep'});
    localStorage.setItem('fasta-data',locked); storage.reload();
    assert.throws(action,e => e.reason === 'newer');
    assert.equal(localStorage.getItem('fasta-data'),locked);
  }
});
test('history deletion and export/import keep goals and programs', () => {
  setup({events:[{id:'f',type:'fast',t:1,data:{end:43200001,duration:43200000}},{id:'w',type:'workout',t:2,data:{fastId:'f',kcal:50}}]});
  setGoal({fastsPerWeek:7,targetWeight:80}); startProgram('tidigt');
  const keep = storage.snapshot().events.filter(e => ['goal','program'].includes(e.type));
  storage.removeFast('f'); storage.clearFastHistory();
  assert.deepEqual(storage.snapshot().events,keep);
  const exported = JSON.parse(JSON.stringify(storage.snapshot()));
  storage.replaceAllData(migrate(exported)); storage.reload();
  assert.deepEqual(storage.snapshot().events,keep);
  assert.equal(storage.goalView().targetWeight,80);
  assert.equal(storage.programView().programId,'tidigt');
});
