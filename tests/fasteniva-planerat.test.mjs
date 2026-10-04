import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { FEATURES, FASTENIVA, FASTENIVA_TEXT, MEALS_PRE, LONG_FAST_TEXT } from '../js/data.js';
import { mealPauseHours } from '../js/fasteniva.js';
const source = readFileSync(new URL('../js/modals.js', import.meta.url), 'utf8');
const code = source.slice(source.indexOf('export function recentMealWorkout'), source.indexOf('// ── Workout modal'))
  .replaceAll('export function', 'function');
const H = 3600000, now = 1800000000000;
const workout = {time: now-H, durationMins:30, type:'Styrketräning'};

function modal({planned=false, long=false, workouts=[], enabled=true}={}) {
  let html;
  const nodes = new Map();
  const buttons = FASTENIVA.KATEGORIER.map(c=>({dataset:{foodType:c.id},setAttribute(){},after(node){this.preview=node;},addEventListener(_,fn){this.click=fn;}}));
  const el = {querySelector:sel=>{if(sel.startsWith('[data-food-type='))return buttons.find(b=>sel.includes(`"${b.dataset.foodType}"`));if(!nodes.has(sel))nodes.set(sel,{hidden:false,textContent:'',innerHTML:''});return nodes.get(sel);},querySelectorAll:()=>buttons};
  const ctx = {FEATURES:{fastenivaa:enabled},FASTENIVA,FASTENIVA_TEXT,MEALS_PRE,LONG_FAST_TEXT,
    state:{fasting:true,startTime:now-(long?25:4)*H,workouts},
    Date:{now:()=>now},esc:x=>x,mealPauseHours,onPick(){},openModal:markup=>{html=markup;return el;}};
  runInNewContext(code,ctx);ctx.openMealModal(planned);
  return {html,nodes,buttons,ctx};
}

test('förhandsvisning visas bara efter pass, efter ett dygn eller vid explicit planering',()=>{
  assert.doesNotMatch(modal().html,/id="meal-preview"/);
  for(const options of [{workouts:[workout]},{long:true},{planned:true}]) {
    const m=modal(options);
    assert.match(m.html,/id="meal-preview"/);
    assert.match(m.nodes.get('#meal-preview').textContent,/Blandad: tillbaka i fastefönster om ungefär/);
  }
  assert.ok(modal({long:true}).html.includes(LONG_FAST_TEXT.day));
  assert.ok(modal({planned:true}).html.includes(FASTENIVA_TEXT.planera));
  assert.ok(!modal({workouts:[workout]}).html.includes(FASTENIVA_TEXT.planera));
});

test('tidsgränser, korta pass, yoga och framtida pass ger ingen träningsrad',()=>{
  const {ctx}=modal();
  assert.equal(ctx.recentMealWorkout([{...workout,time:now-2*H}],now),true);
  for(const patch of [{time:now-2*H-1},{time:now+1},{durationMins:19},{type:'Yoga/Stretch'}])
    assert.equal(ctx.recentMealWorkout([{...workout,...patch}],now),false);
  ctx.state.startTime=now-24*H;
  assert.equal(ctx.mealPlanningMode(false,now).preview,false);
  ctx.state.startTime--;
  assert.equal(ctx.mealPlanningMode(false,now).preview,true);
});

test('kategoribyte uppdaterar texten och samma kategori ger kortare tid efter pass',()=>{
  const normal=modal({planned:true}), trained=modal({workouts:[workout]});
  assert.notEqual(normal.nodes.get('#meal-preview').textContent,trained.nodes.get('#meal-preview').textContent);
  for(const c of FASTENIVA.KATEGORIER) {
    normal.buttons.find(b=>b.dataset.foodType===c.id).click();
    assert.ok(normal.nodes.get('#meal-preview').textContent.startsWith(c.etikett+':'));
    assert.equal(normal.buttons.find(b=>b.dataset.foodType===c.id).preview,normal.nodes.get('#meal-preview'));
    assert.ok(mealPauseHours({time:now,foodType:c.id},[workout]) <= mealPauseHours({time:now,foodType:c.id}));
  }
  const ids=m=>[...m.html.matchAll(/data-food-type="([^"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(ids(normal),ids(trained));
  assert.deepEqual(ids(normal),ids(modal({long:true})));
});

test('flaggan av behåller gamla måltidsrutan i samtliga lägen; texter är ordagranna',()=>{
  for(const options of [{},{planned:true},{long:true},{workouts:[workout]}]) {
    const m=modal({...options,enabled:false});
    assert.doesNotMatch(m.html,/meal-preview|data-food-type|Planerar du/);
    assert.match(m.html,/id="pp"/);
  }
  const knowledge=readFileSync(new URL('../docs/kunskap/fastenivaa.md',import.meta.url),'utf8');
  for(const key of ['traning','planera','forhandsvisning'])assert.ok(knowledge.includes('> '+FASTENIVA_TEXT[key]));
  assert.equal(FEATURES.fastenivaa,false);
});
