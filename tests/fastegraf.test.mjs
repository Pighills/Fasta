import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PH } from '../js/data.js';
import { phasePosition, metabolicHoursAt, graphSamples, graphInterval, nextPhaseForecast } from '../js/views/fasteniva.js';
const H=3600000, start=1800000000000;
const fast={start,profile:{},meals:[],workouts:[]};
test('fasgränser ligger exakt på bandgränser och sista bandet är begränsat',()=>{
 PH.forEach((p,i)=>{assert.equal(phasePosition(p.h),i); if(PH[i+1]) assert.equal(phasePosition((p.h+PH[i+1].h)/2),i+.5);});
 assert.equal(phasePosition(-1),0);assert.equal(phasePosition(1000),8);
});
test('måltidspauser planar ut, även när de överlappar',()=>{
 const f={...fast,meals:[{time:start+2*H,pauseHours:2},{time:start+3*H,pauseHours:2}]};
 assert.equal(metabolicHoursAt(f,start+2*H),2);
 assert.equal(metabolicHoursAt(f,start+4*H),2);
 assert.equal(metabolicHoursAt(f,start+6*H),3);
});
test('träningspass ger ett skutt och pausträning ger inget skutt',()=>{
 const w={time:start+10*H,kcal:200,avgHr:140,maxHr:185};
 const f={...fast,workouts:[w]};
 assert.ok(metabolicHoursAt(f,w.time)>metabolicHoursAt(f,w.time-1)+.1);
 const paused={...f,meals:[{time:start+9*H,pauseHours:2}]};
 assert.equal(metabolicHoursAt(paused,w.time),9);
 const samples=graphSamples(f,start,start+12*H);
 assert.ok(samples.some(p=>p.time===w.time-1));assert.ok(samples.some(p=>p.time===w.time));
});
test('prognos når nästa fas och väntar ut aktiv paus',()=>{
 const forecast=nextPhaseForecast(fast,start+3*H);
 assert.equal(forecast.hours,4);assert.equal(forecast.time,start+4*H);
 const f={...fast,meals:[{time:start+2*H,pauseHours:2}]};
 const p=nextPhaseForecast(f,start+3*H);assert.equal(p.resume,start+4*H);assert.equal(p.time,start+6*H);
 assert.equal(nextPhaseForecast(fast,start+80*H),null);
});
test('intervall skär vid start och sampling följer femminutersgränsen',()=>{
 assert.deepEqual(graphInterval(fast,start+30*H,'6'),{from:start+24*H,to:start+30*H});
 assert.equal(graphInterval(fast,start+3*H,'24').from,start);
 assert.equal(graphInterval(fast,start+30*H,'all').from,start);
 const points=graphSamples(fast,start+24*H,start+30*H);
 assert.equal(points.length,73);assert.equal(points[0].time,start+24*H);assert.equal(points.at(-1).time,start+30*H);
});
