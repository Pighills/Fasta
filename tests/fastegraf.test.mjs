import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PH } from '../js/data.js';
import { phasePosition, metabolicHoursAt, graphSamples, graphInterval, nextPhaseForecast, graphLookAhead, graphPhaseMarkers, levelSamples, smoothGraphPath, fastenivaGraphHTML } from '../js/views/fasteniva.js';
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
 assert.deepEqual(graphInterval(fast,start+30*H,'6'),{from:start+24*H,to:start+34.5*H});
 assert.equal(graphInterval(fast,start+3*H,'24').from,start);
 assert.equal(graphInterval(fast,start+30*H,'all').from,start);
 const points=graphSamples(fast,start+24*H,start+30*H);
 assert.equal(points.length,73);assert.equal(points[0].time,start+24*H);assert.equal(points.at(-1).time,start+30*H);
});
test('skalan har sex timmars minimum och växer monotont, med begränsad framåtblick',()=>{
 let previous=0;
 for(let minutes=0;minutes<=100*60;minutes++){
  const now=start+minutes*60000, interval=graphInterval(fast,now,'all');
  assert.ok(interval.to-start>=6*H);assert.ok(interval.to>=previous);previous=interval.to;
  assert.ok(interval.to<=Math.max(start+6*H,now+Math.max(2*H,(now-start)*.15)));
  // Phase-boundary and selected-interval changes are animated by the view.
  if(minutes && !PH.some(p=>p.h*60===minutes)) assert.ok(interval.to-graphInterval(fast,now-60000,'all').to<=69000);
 }
 assert.equal(graphInterval(fast,start+60*H).from,start+36*H);
 assert.equal(graphInterval(fast,start+60*H,'12').from,start+48*H);
 assert.equal(graphLookAhead(fast,start+3*H),H);
 assert.equal(graphLookAhead(fast,start+17*H),2.55*H);
 assert.equal(graphLookAhead(fast,start+23*H),H);
 assert.equal(graphLookAhead(fast,start+60*H),9*H);
});
test('fasmarkörer visar nådda faser och endast nästa',()=>{
 for(const h of [3,17,30,60,80]){
  const current=Math.min(7,Math.floor(phasePosition(h))),markers=graphPhaseMarkers(h);
  assert.deepEqual(markers,PH.slice(0,Math.min(8,current+2)));
 }
});
test('nivåkurvan är noll utan måltider och använder befintlig modell vid måltid',()=>{
 assert.ok(levelSamples(fast,start,start+10*H).every(p=>p.level===0));
 const meals={...fast,meals:[{time:start+H,foodType:'blandad',pauseHours:3}]};
 const points=levelSamples(meals,start,start+8*H);
 assert.ok(points.some(p=>p.level>.6));assert.ok(points.every(p=>p.level>=0&&p.level<=1));
 assert.equal(points.at(-1).level,0);
});
test('grafens struktur skiljer nivå från fas och lägger extra text i detaljvyn',()=>{
 const html=fastenivaGraphHTML(fast,start,start+17*H,start+17*H,true);
 assert.match(html,/data-level/);assert.match(html,/Relativ · 0–100 %/);
 assert.doesNotMatch(html,/data-glyc|type="checkbox"|Visa leverns sockerlager/);
 assert.match(html,/<details[\s\S]*data-detail-reading/);
 assert.match(html,/Senaste 12 h/);assert.match(html,/data-interval="all"/);
});
test('mjuk kurva använder kubiska segment och lämnar ändpunkterna intakta',()=>{
 assert.equal(smoothGraphPath([]),'');
 const path=smoothGraphPath([{x:0,y:100},{x:50,y:70},{x:100,y:70}]);
 assert.match(path,/^M0.00,100.00 C/);assert.match(path,/100.00,70.00$/);
 assert.doesNotMatch(path,/NaN|Infinity/);
 assert.ok(graphSamples(fast,start,start+1000*H).length<=866);
});
