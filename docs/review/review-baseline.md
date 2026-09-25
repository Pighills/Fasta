# Kodgranskning – baslinje (hela kodbasen)

**Datum:** 2026-09-25 · **Commit:** `ad47487` · **Cache vid granskning:** `fasta-v28`
**Omfattning:** all kod i `index.html`, `sw.js`, `manifest.json`, `js/*.js`, `js/views/*.js` (ca 1 960 rader). Texter i `js/data.js` granskades inte i sak (de kommer från kunskapsbasen).
**Fokus:** buggar, ES-moduler, localStorage, tidszoner, service worker-cachning.
**Inget är fixat.** Rapporten är en baslinje att jobba mot.

Kontroller som kördes: `node --check` på alla JS-filer (inga fel), `node --test tests/*.test.mjs` (9 av 9 gröna). Fynden nedan bygger på att läsa koden rad för rad; varje fynd citerar raden som orsakar det.

## Sammanfattning

| Allvar | Antal | Vad det betyder |
|---|---|---|
| P1 – hög | 3 | Fel som användare råkar ut för i vanlig användning, eller som kan radera data |
| P2 – medel | 7 | Fel i mindre vanliga lägen, eller risker som växer när appen byggs ut |
| P3 – låg | 12 | Småfel, städning och saker att tänka på inför Capacitor |

**Viktigast på vanlig svenska:**
1. Orsaken till QA-fyndet "pausen syns inte" är hittad (P1-1). Samma fel gör att man kan logga en andra måltid under pausen, och då **går timern baklänges** (P1-2).
2. Har man FASTA öppen på två ställen samtidigt (t.ex. två flikar, eller installerad app och webbläsare på Android/dator) kan det ena stället **skriva över historik** som det andra sparat (P1-3).
3. Utan nät eller med dåligt nät kan appen hänga länge vid start eller visa webbläsarens felsida (P2-1, P2-2).

Kopplingar till QA-baslinjen (`docs/qa/qa-baseline.md`) anges som *QA ISSUE-00N*.

---

## P1 – hög

### P1-1 · Pausen efter måltid visas inte, och pausrutan försvinner inte när pausen är slut
(confidence: 9/10) `js/views/timer.js:25-31`, `js/actions.js:72-75`, `js/helpers.js:165-167` · *Orsaken till QA ISSUE-002*

**Vad händer:** `addMeal()` sparar måltiden med `time: Date.now()` och ritar om direkt. Men `state.now` uppdateras bara av tickern en gång per sekund, så vid omritningen är `state.now` äldre än måltiden:

```js
// helpers.js:166
return state.meals.find(m => state.now >= m.time && ...);   // falskt: state.now < m.time
```

`renderTimer()` ritar därför utan paus och sparar `_lastMealCount`. Vid nästa tick räknar `calcElapsed()` rätt (klockorna står still), men `tickTimer()` ritar bara om helt när fas, antal måltider/pass eller öppen fas ändras:

```js
// timer.js:25-28
if (phaseIdx !== _lastPhaseIdx ||
    state.meals.length !== _lastMealCount ||
    state.workouts.length !== _lastWorkoutCount ||
    state.expandedPhase !== _lastExpandedPhase) {
```

Att en paus börjar eller slutar finns inte med. Pausrutan dyker alltså inte upp förrän något annat tvingar fram en omritning, och när pausen väl syns och sedan tar slut ligger rutan kvar ("Återupptas om 00:00:01") och måltids-/träningsknapparna förblir dolda tills nästa fasbyte.

**Förslag:** räkna med "paus aktiv ja/nej" i villkoret för hel omritning, och sätt `state.now = Date.now()` i `addMeal`/`addWorkout` innan `render()`.

### P1-2 · En andra måltid under pausen får timern att gå baklänges
(confidence: 9/10) `js/helpers.js:72-81`

Eftersom pausen inte syns (P1-1) är måltidsknappen 🍳 kvar, så man kan logga en måltid till mitt i en pågående paus. `calcElapsed()` drar av varje måltids paus för sig, utan att slå ihop överlappande pauser:

```js
// helpers.js:75-79
const paused = state.meals.reduce((a, m) => {
  const pe = m.time + m.pauseHours * 3600000;
  if (state.now < m.time) return a;
  return a + Math.min(state.now, pe) - m.time;
}, 0);
```

Med två överlappande pauser växer `paused` med 2 sekunder per sekund medan tiden bara går 1 sekund, så fastetiden **minskar** så länge båda pauserna pågår. Den felaktiga tiden sparas sedan i historiken när fastan avslutas.

**Förslag:** slå ihop överlappande pausintervall innan de dras av (och fixa P1-1 så att knappen döljs som tänkt).

### P1-3 · Två öppna flikar/appfönster skriver över varandras data
(confidence: 8/10) `js/state.js:67-104`

All data läses in **en gång** till minnet och skrivs sedan tillbaka i sin helhet vid varje ändring:

```js
// state.js:71-72
function getStored() {
  if (stored) return stored;
// state.js:102
localStorage.setItem(DATA_KEY, JSON.stringify(stored));
```

Det finns ingen lyssnare på `storage`-händelsen. Scenario: flik A avslutar en fasta (sparas). Flik B, som öppnades tidigare, loggar sedan något – B skriver då sin gamla kopia och **fastan från A försvinner ur historiken**. Gäller två webbläsarflikar, och på Android/dator även installerad app + webbläsare (de delar lagring). På iPhone har hemskärmsappen egen lagring, så där är risken mindre.

Samma mekanism gör att en gammal flik med gammal kod kan skriva tillbaka äldre dataformat efter att en ny version har migrerat datan (blir viktigt vid schemaVersion 3).

**Förslag:** lyssna på `storage`-händelsen och läs om datan (och rita om) när en annan flik ändrat den; eller läs alltid färskt från localStorage precis före varje skrivning.

---

## P2 – medel

### P2-1 · Service workern väntar på nätet utan tidsgräns
(confidence: 8/10) `sw.js:45-56`

Strategin är "nätet först, cache som reserv", men cachen används bara när `fetch` **misslyckas**. På segt nät (tunnelbana, dålig 4G) misslyckas den inte, den bara hänger, och appen visar en tom skärm tills webbläsaren ger upp (ofta 30–60+ sekunder). Det drabbar också varje JS-fil för sig.

**Förslag:** ge nätet t.ex. 3 sekunder och svara sedan från cachen (nätet får fortsätta uppdatera cachen i bakgrunden).

### P2-2 · Offline med en adress som har `?…` på slutet ger webbläsarens felsida
(confidence: 8/10) `sw.js:53-56`

```js
.catch(() => caches.match(e.request));
```

`caches.match` jämför hela adressen inklusive frågedelen. Öppnas appen offline via t.ex. `https://fastatimer.se/?utm_source=…` (delad länk, annons) finns ingen träff, `respondWith` får `undefined` och användaren ser "Ingen internetanslutning" i stället för appen. Samma sak för alla sidladdningar som inte exakt matchar en sparad adress.

**Förslag:** för sidnavigering, fall tillbaka till den sparade startsidan (`caches.match('/')` eller `ignoreSearch: true`), och returnera aldrig `undefined`.

### P2-3 · Service workern sparar felsvar över fungerande filer
(confidence: 8/10) `sw.js:47-51`

```js
.then(response => {
  const clone = response.clone();
  caches.open(CACHE).then(c => c.put(e.request, clone));
```

Alla svar sparas, även 404 och 500. Råkar Vercel svara med ett fel en gång (driftstörning, halvfärdig deploy) ersätts den fungerande kopian i cachen, och appen går sedan inte att starta offline. Varje unik adress (t.ex. med `?utm=`) sparas dessutom som en ny post, så cachen växer utan gräns.

**Förslag:** spara bara om `response.ok` (och helst bara filer i PRECACHE-listan eller sidnavigering till `/`).

### P2-4 · Kontrollen av importerad och gammal data försvann med händelseloggen
(confidence: 8/10) `js/migrations.js:95-106`, `js/helpers.js:76` · `docs/STATUS.md:10` är inaktuell

STATUS.md säger att trasiga måltids-/träningslistor rensas av `cleanLogs` i `js/state.js`. Den funktionen togs bort i commit `da8a8d8` (Fas 0). Nu kontrolleras bara att händelser är objekt med en `type`; fälten i `data` och `t` kontrolleras inte. En måltid utan `pauseHours` (från en importerad fil eller gammal data) ger:

```js
const pe = m.time + m.pauseHours * 3600000;   // NaN
```

och timern visar `NaN:NaN:NaN` under hela fastan. Samma sak om `time`, `kcal` eller `duration` är text i stället för tal. Visningen är fortfarande säker mot kodinjektion (allt går genom `esc()`), det är räkningen som går sönder.

**Förslag:** lägg tillbaka en fältkontroll i `normalize()` (tal där det ska vara tal, rimliga gränser), med enhetstester. Uppdatera STATUS.md.

### P2-5 · Vid oväntat fel under inläsning skrivs datan över med tom data
(confidence: 7/10) `js/state.js:89-95`, `js/migrations.js:110-118`

```js
try {
  stored = migrate(isObj(current) ? current : readLegacy());
} catch (e) {
  locked = e instanceof SchemaTooNewError;
  stored = normalize({});
}
persist();
```

Kastar migreringen något annat fel än "för ny version" sparas tom data direkt över användarens data. En kopia (`fasta-data-pre-v2`) görs bara när versionen är lägre än 2, inte för data som redan är v2. Konkret exempel: om `schemaVersion` är texten `"2"` i stället för talet 2 behandlas datan som version 0, alla händelser tappas i migreringen och resultatet sparas – utan felmeddelande och utan kopia. Kräver ovanlig data i dag, men varje ny migrering (Fas 1) ökar risken.

**Förslag:** vid okänt fel, spara en kopia av rådatan (som redan görs för oläsbar data) och sätt `locked = true` i stället för att skriva över.

### P2-6 · Fasbytet i "metabol tid" ritas inte om
(confidence: 8/10) `js/views/timer.js:24`, `js/views/timer.js:242-260`

`tickTimer()` avgör om allt ska ritas om utifrån **faktisk** tid (`elh`), men tidslinjen och rutan "Metabol effekt" använder **metabol** tid när profilen är ifylld. När den metabola tiden passerar en fasgräns före den faktiska uppdateras bara stapelbredden: "NU"-märket, prickens färg, stapelns färg (den växer i grått) och fasnamnet under "Metabol effekt" står kvar på förra fasen tills den faktiska tiden också byter fas.

**Förslag:** räkna även med metabol fas i villkoret för hel omritning.

### P2-7 · Träningsbonusen har ingen gräns
(confidence: 9/10) `js/helpers.js:144-154`, `js/modals.js:201-211` · *Kodorsaken till QA ISSUE-001*

`calcWorkoutBonusMs()` räknar `kcal` rakt av, utan övre eller undre gräns, och `Number(...) || 30` släpper igenom negativa tal. Därav +1250 h och negativa pass i QA-testet. Utöver QA-fyndet: bonusen läggs på direkt vid loggning, oavsett när passet gjordes, och gäller även pass loggade under en paus.

**Förslag:** begränsa värden i modalen och i `normalize()` (se P2-4), och ett tak för bonus per pass.

---

## P3 – låg

| # | Fil:rad | Fynd | Förslag |
|---|---|---|---|
| P3-1 | `js/state.js:92-100` | När datan är från en nyare appversion (`locked`) visas en tom app och allt man gör kastas tyst. Ingen text säger varför. | Visa en ruta: "Ladda om för att uppdatera appen". |
| P3-2 | `js/state.js:214-219` | `restoreBackup()` kontrollerar inte `locked` (vilket `replaceAllData()` gör på rad 203), så "Ångra import" kan skriva över data från en nyare version. | Samma kontroll som i `replaceAllData`. |
| P3-3 | `js/state.js:99-104` | `persist()` sväljer alla fel. Om lagringen blir full (backup + `pre-v2` + `corrupt` dubblerar datan) slutar appen spara utan att säga något. | Visa ett meddelande vid misslyckad sparning. |
| P3-4 | `js/modals.js:16-18` | Escape-lyssnaren tas bara bort om man trycker Escape. Stängs rutan med ✕ eller klick utanför ligger lyssnaren kvar; efter några öppningar stänger ett Escape-tryck alla rutor samtidigt. | Ta bort lyssnaren när rutan tas bort. |
| P3-5 | `js/modals.js:132-134`, `194-195` | Måltids- och träningsrutan använder globala variabler (`window._ms`, `_ph`, `_rmp`, `_wi`, `_rwt`). Två rutor samtidigt (t.ex. sidopanel + timer på dator) styr varandras val. | Använd `addEventListener` inne i rutan. |
| P3-6 | `js/actions.js:84-104`, `js/views/history.js:41` | Radera använder plats i listan (`idx`), inte fastans id. Ändras listan mellan tryck och bekräftelse (annan flik, P1-3) raderas fel fasta. | Skicka `_id` i stället för index. |
| P3-7 | `js/helpers.js:30-32` | `fmtD()` visar dag och månad utan år. Efter årsskiftet går historiken inte att skilja åt mellan år. | Visa år när det inte är innevarande år. |
| P3-8 | `js/views/timer.js:125` | `max` på fältet för bakåtdatering räknas ut vid omritning. Står sidan öppen länge blir gränsen gammal och nyliga tider går inte att välja i vissa webbläsares väljare. Kontrollen vid tryck (rad 131) är däremot rätt. | Sätt `max` när fältet får fokus. |
| P3-9 | `js/views/timer.js:130` | Under timmen när sommartid går över till vintertid finns klockslag två gånger (t.ex. 02:30). `new Date("…T02:30")` väljer ett av dem, så en bakåtdatering den natten kan hamna en timme fel. Mycket ovanligt. | Godta, eller visa vald tid tydligt före start. |
| P3-10 | `index.html:26`, `sw.js:43` | Typsnittet Outfit hämtas från Google Fonts, som service workern inte sparar (bara egen domän). Offline visas ett reservtypsnitt. | Lägg typsnittsfilen i appen (krävs ändå för Capacitor). |
| P3-11 | `sw.js:3-22`, `sw.js:50` | Absoluta sökvägar (`/js/app.js`) i PRECACHE går emot regeln om relativa sökvägar inför Capacitor. `cache.put` ligger utanför `waitUntil` och kan avbrytas. | Relativa sökvägar; lägg `put` i `e.waitUntil`. |
| P3-12 | `js/actions.js:7` ↔ `js/modals.js:7`; `js/ui.js:97-100` | ES-moduler: `actions.js` och `modals.js` importerar varandra (fungerar i dag eftersom inget används vid inläsning, men blir fel om någon av dem börjar köra kod direkt). `ui.js` laddar vyerna med `import()` fast `app.js` redan laddat dem, vilket gör varje omritning asynkron i onödan. Inline-`onclick` förutsätter att `window.state` och funktionerna finns globalt. | Flytta `openModal` till en egen fil; vanliga importer i `ui.js`. |

---

## Kontrollerat och i sin ordning

- **Tidszoner:** alla tider sparas som millisekunder sedan 1970 (`Date.now()`), så längder på fastor och pauser blir rätt över sommartid/vintertid och vid resor. `toLocalDateTimeStr()` används för datumfältet och exportens filnamn, och `new Date("ÅÅÅÅ-MM-DDTHH:MM")` tolkas som lokal tid. Inga `toISOString()` i datumfält.
- **Kodinjektion:** all sparad och importerad text som visas går genom `esc()`. Tal används bara i beräkningar, där fel värden blir `NaN`, inte kod.
- **Import:** kräver `app: "FASTA"` och ett heltal som version, gör kopia före ersättning och kan ångras.
- **Migrering v0→v1→v2:** gammal data kopieras orörd till `fasta-data-pre-v2`, oläsbar data till `fasta-data-corrupt`, och de gamla nycklarna lämnas kvar. Täcks av 9 enhetstester.
- **iOS-zoom:** alla inmatningsfält har 16 px på mobil (`css/styles.css:142`).
- **Cacheversion:** PRECACHE innehåller alla JS-filer som finns i `js/`.

## Föreslagen ordning för åtgärder

1. P1-1 + P1-2 (samma område, löser QA ISSUE-002 och en del av 003).
2. P1-3 (skydd mot dataförlust mellan flikar).
3. P2-4 + P2-7 + P2-5 (fältkontroll i `normalize()` med tester; täcker även QA ISSUE-001, 004 och 005).
4. P2-1 + P2-2 + P2-3 (service workern, testa offline på riktig telefon).
5. Resten efter hand.
