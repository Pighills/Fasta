# Åtgärdslista – sammanslagen från de fyra baslinjerna

**Datum:** 2026-09-25 · **Kod:** `main`, cache `fasta-v32`
**Källor:**
- **BENCH** = `docs/benchmark/baseline.md` (prestanda)
- **QA** = `docs/qa/qa-baseline.md` (test i webbläsaren)
- **REV** = `docs/review/review-baseline.md` (kodgranskning)
- **CSO** = `docs/security/cso-baseline.md` (säkerhet)

Inget är fixat. Dubbletter (samma problem hittat av flera granskningar) är sammanslagna till en punkt med alla källor angivna.
Radnummer i rapporterna kan ha flyttat sig efter förenklingen i `fasta-v32`; leta på funktionsnamnet.

**💾 DATA** = punkten påverkar användarnas sparade data i localStorage (`fasta-data` och dess kopior). Sådana fixar kräver migrering eller försiktig hantering av befintlig data, enhetstester och test i förhandsversion innan publicering.

**Storlek:** liten = några rader i en fil · medel = flera filer eller nya tester · stor = ombyggnad av en hel del.

## Översikt

| Nivå | Antal | Varav 💾 DATA |
|---|---|---|
| Kritisk | 2 | 2 |
| Hög | 4 | 3 |
| Medel | 8 | 1 |
| Låg | 16 | 4 |
| **Totalt** | **30** | **10** |

Dessutom: 1 punkt redan åtgärdad och 2 prestandaiakttagelser utan åtgärd nu (sist i filen).

**Så har nivåerna satts:**
- **Kritisk:** appen visar fel hälsoinformation eller kan radera användarens historik i vanlig användning.
- **Hög:** fel som användare råkar ut för i vanligt flöde, eller som kan förvanska/radera sparad data.
- **Medel:** fel i mindre vanliga lägen (offline, dåligt nät), inmatning utan kontroll, tillgänglighet, integritet kring hälsodata.
- **Låg:** småfel, städning, förberedelse inför Capacitor.

---

## Kritisk

### K1 · Träningspass utan gränser ger falsk hälsoinformation 💾 DATA
**Källor:** QA ISSUE-001 (Hög), REV P2-7 · **Filer:** `js/modals.js` (träningsrutan), `js/helpers.js` (`workoutBonusHours`, `calcWorkoutBonusMs`), `js/migrations.js` (`normalize`) · **Storlek:** medel

Negativ tid och orimliga kalorier (t.ex. `-20` min, `99999` kcal) godtas. Timern visar då +1250 h "metabol effekt", och en fasta på 17 sekunder beskrivs som "Tre dygn" med kroppseffekter i Historik. Profilen lovar samtidigt "max ±40 % justering". Bonusen läggs också på direkt oavsett när passet gjordes, även under paus.
**Åtgärd:** gränser i rutan (tydligt meddelande), tak för bonus per pass, och samma gränser i `normalize()` så att redan sparade orimliga pass inte fortsätter ge fel siffror.
**Data:** redan sparade pass med orimliga värden ligger i händelseloggen och påverkar sparade fastor. Beslut behövs om de ska begränsas vid inläsning (utan att ändra rådatan) eller rättas.
**Beslut (Anton 2026-09-25):** gamla orimliga pass begränsas vid inläsning/visning, rådatan ändras inte.

### K2 · Två öppna flikar/appfönster skriver över varandras historik 💾 DATA
**Källor:** REV P1-3 · **Fil:** `js/state.js` (`getStored`, `persist`) · **Storlek:** medel

All data läses in en gång och skrivs tillbaka i sin helhet. Flik A avslutar en fasta, flik B (öppnad tidigare) loggar något och skriver sin gamla kopia – fastan från A försvinner. Gäller två flikar, och på Android/dator även installerad app + webbläsare. En gammal flik kan dessutom skriva tillbaka ett äldre dataformat efter en migrering (viktigt inför schemaVersion 3).
**Åtgärd:** lyssna på `storage`-händelsen och läs om/rita om, eller läs färskt från localStorage precis före varje skrivning.

---

## Hög

### H1 · Pausen efter måltid syns inte, och pausrutan försvinner inte när pausen är slut
**Källor:** QA ISSUE-002 (Medel), REV P1-1 · **Filer:** `js/views/timer.js` (`tickTimer`), `js/actions.js` (`addMeal`, `addWorkout`), `js/helpers.js` (`getActivePause`) · **Storlek:** liten

Klockorna stannar men inget säger "Paus" förrän sidan laddas om – det ser ut som att appen hängt sig. När pausen tar slut ligger rutan kvar ("Återupptas om 00:00:01") och knapparna är dolda till nästa fasbyte.
**Åtgärd:** ta med "paus aktiv ja/nej" i villkoret för hel omritning, och sätt `state.now = Date.now()` före `render()` i `addMeal`/`addWorkout`.

### H2 · En andra måltid under pausen får timern att gå baklänges 💾 DATA
**Källor:** REV P1-2 (följd av H1) · **Fil:** `js/helpers.js` (`calcElapsed`) · **Storlek:** liten

Eftersom pausen inte syns går det att logga en måltid till mitt i pausen. Överlappande pauser dras av dubbelt, så fastetiden minskar – och den felaktiga tiden sparas i historiken när fastan avslutas.
**Åtgärd:** slå ihop överlappande pausintervall innan de dras av (plus H1).
**Data:** fastor som redan sparats med för kort tid rättas inte automatiskt. Om längden räknas om från händelseloggen vid visning rättas de; annars ligger felet kvar.
**Beslut (Anton 2026-09-25):** längden räknas om vid visning från händelseloggen, rådatan ändras inte.

### H3 · Kontrollen av importerad och gammal data försvann – timern kan visa NaN 💾 DATA
**Källor:** REV P2-4 · **Filer:** `js/migrations.js` (`normalize`), `js/helpers.js` (`calcElapsed`), `docs/STATUS.md` · **Storlek:** medel

`cleanLogs` togs bort i Fas 0. Nu kontrolleras bara att händelser har en `type`. En måltid utan `pauseHours`, eller med text i stället för tal, ger `NaN:NaN:NaN` under hela fastan. (Säkert mot kodinjektion – det är räkningen som går sönder.) STATUS.md påstår fortfarande att `cleanLogs` finns.
**Åtgärd:** fältkontroll i `normalize()` (tal där det ska vara tal, rimliga gränser) med enhetstester. Görs lämpligen tillsammans med K1. Rätta STATUS.md.

### H4 · Vid oväntat fel under inläsning skrivs datan över med tom data 💾 DATA
**Källor:** REV P2-5 · **Filer:** `js/state.js` (inläsningen i `getStored`), `js/migrations.js` (`migrate`) · **Storlek:** liten

Kastar migreringen ett annat fel än "för ny version" sparas tom data direkt över användarens data, utan kopia (kopia görs bara för data äldre än v2). Exempel: `schemaVersion: "2"` (text) tolkas som version 0 och alla händelser tappas tyst. Risken ökar med varje ny migrering i Fas 1.
**Åtgärd:** vid okänt fel, spara en kopia av rådatan och sätt `locked = true` i stället för att skriva över.

---

## Medel

### M1 · Service workern väntar på nätet utan tidsgräns
**Källor:** REV P2-1 · **Fil:** `sw.js` · **Storlek:** liten
På segt nät hänger appen på tom skärm i 30–60+ s innan cachen används. **Åtgärd:** svara från cachen efter ca 3 s, låt nätet uppdatera i bakgrunden.

### M2 · Offline med `?…` i adressen ger webbläsarens felsida
**Källor:** REV P2-2 · **Fil:** `sw.js` · **Storlek:** liten
T.ex. `fastatimer.se/?utm_source=…` offline ger "Ingen internetanslutning". **Åtgärd:** för sidnavigering fall tillbaka till sparad `/` (eller `ignoreSearch`), returnera aldrig `undefined`.

### M3 · Service workern sparar felsvar (404/500) över fungerande filer
**Källor:** REV P2-3, CSO (kontrollerat utan fynd, noterat som robusthetsbrist) · **Fil:** `sw.js` · **Storlek:** liten
Ett enstaka felsvar från Vercel kan göra att appen inte startar offline. Varje unik adress sparas också, så cachen växer utan gräns. **Åtgärd:** spara bara `response.ok`, helst bara PRECACHE-filer och `/`.
*M1–M3 görs lämpligen tillsammans och testas offline på riktig telefon.*

### M4 · Fasbyte i "metabol tid" ritas inte om
**Källor:** REV P2-6 · **Fil:** `js/views/timer.js` (`tickTimer`) · **Storlek:** liten
När metabol tid passerar en fasgräns före faktisk tid står "NU"-märket, färgerna och fasnamnet kvar på förra fasen. **Åtgärd:** ta med metabol fas i villkoret för hel omritning (samma ställe som H1).

### M5 · Under måltidspausen går det inte att logga träning eller avbryta pausen
**Källor:** QA ISSUE-003 · **Fil:** `js/views/timer.js` · **Storlek:** medel
Bara "Avsluta fasta" finns kvar. **Produktfråga till Anton:** ska träning kunna loggas under paus, och ska pausen kunna avbrytas? (Hänger ihop med K1: ska träning under paus ge bonus?)

### M6 · Profilen godtar orimliga värden och räknar på dem 💾 DATA
**Källor:** QA ISSUE-005 · **Filer:** `js/views/profile.js`, `js/migrations.js` (`normalize`) · **Storlek:** liten
Ålder 500 och vikt -5 godtas, "✓ Profil klar" står kvar och multiplikatorn ändras. **Åtgärd:** gränser i fälten och i `normalize()` (samma arbete som H3).

### M7 · Mycket går inte att nå med skärmläsare eller tangentbord
**Källor:** QA ISSUE-007 · **Filer:** `js/views/timer.js`, `js/views/history.js`, `js/views/learn.js`, `js/modals.js` · **Storlek:** medel
Fasrader, schemakort, historikkort och Lära-kort är klickbara `div` utan roll. Emoji-knappar (🍳 🏋️ ✕) saknar namn. Stängkrysset är en `span`. Flera fält saknar etikett. **Åtgärd:** `<button>` eller `role="button"` + `tabindex`, `aria-label` på ikonknappar, `<label>` på fält.

### M8 · Raderad data och gamla hälsosvar ligger kvar i dolda kopior 💾 DATA
**Källor:** CSO-1 (Låg, uppgraderad här eftersom det gäller hälsouppgifter och appen säger "permanent") · **Filer:** `js/state.js`, `js/actions.js`, `js/views/profile.js` · **Storlek:** medel
`fh2`, `fs4`, `fasta-profile`, `fasta-data-pre-v2`, `fasta-data-backup` och ev. `fasta-data-corrupt` finns kvar efter radering. **Åtgärd:** knapp "Radera all data" i Din data, automatisk städning av gamla kopior en tid efter lyckad migrering, backup som går ut efter t.ex. 30 dagar, rätta texten "permanent". Texten till knappen behöver Antons ok.

---

## Låg

| # | Problem | Källor | Fil | Storlek | 💾 |
|---|---|---|---|---|---|
| L1 | Typsnittet hämtas från Google: IP skickas till Google, fungerar inte offline, 40 % av allt som laddas. **Snabb vinst** – hittat av tre granskningar. | CSO-2, REV P3-10, BENCH iakttagelse 2 | `index.html`, `css/styles.css`, `sw.js` | liten | |
| L2 | Inget andra skyddslager mot kodinjektion (ingen CSP); inline `onclick` och funktioner på `window` gör CSP omöjlig. `actions.js` och `modals.js` importerar varandra. | CSO-3 (Info), REV P3-12 | `index.html`, `js/app.js`, alla vyer, ny `vercel.json` | stor | |
| L3 | Data från nyare appversion (`locked`): tom app, allt man gör kastas tyst. | REV P3-1 | `js/state.js`, `js/ui.js` | liten | 💾 |
| L4 | "Ångra import" kontrollerar inte `locked` och kan skriva över data från nyare version. | REV P3-2 | `js/state.js` (`restoreBackup`) | liten | 💾 |
| L5 | Sparning som misslyckas (full lagring) sväljs tyst. | REV P3-3 | `js/state.js` (`persist`) | liten | 💾 |
| L6 | Radera fasta använder plats i listan i stället för id – fel fasta kan raderas om listan ändrats (t.ex. K2). | REV P3-6 | `js/actions.js`, `js/views/history.js` | liten | 💾 |
| L7 | Måltids- och träningsrutan använder globala variabler (`window._ms` m.fl.). | REV P3-5 | `js/modals.js` | medel | |
| L8 | Datum i historiken saknar år. | REV P3-7 | `js/helpers.js` (`fmtD`) | liten | |
| L9 | `max` på bakåtdateringsfältet blir gammalt om sidan står öppen länge. | REV P3-8 | `js/views/timer.js` | liten | |
| L10 | Bakåtdatering natten sommartid→vintertid kan hamna en timme fel. Mycket ovanligt. | REV P3-9 | `js/views/timer.js` | liten | |
| L11 | Absoluta sökvägar i PRECACHE (emot Capacitor-regeln); `cache.put` utanför `waitUntil`. | REV P3-11 | `sw.js` | liten | |
| L12 | Tryckytor under 44 px (stängkryss 16×20, radera 28×26, Lära-filter 29 px, "Rensa all historik" 39 px). Bryter mot regeln i AGENTS.md. | QA ISSUE-008 | `css/styles.css` | liten | |
| L13 | Egen måltid sparas utan namn och med 0 kcal. | QA ISSUE-004 | `js/modals.js` | liten | |
| L14 | Flikbyte behåller scrollläget från förra fliken. | QA ISSUE-006 | `js/ui.js` | liten | |
| L15 | Småfel i historik: 17 s fasta visas som "∞ 0h" och räknas; löpande fastor drar ner "Mål nått"; "Schema: 16h" i stället för "16:8". | QA ISSUE-009 | `js/views/history.js`, `js/views/timer.js` | liten | |
| L16 | Bakåtdateringen visar webbläsarens grå rutor i stället för appens egna; fältet är tomt från början. | QA ISSUE-010 | `js/views/timer.js`, `js/modals.js` | liten | |

---

## Redan åtgärdat
- **REV P3-4** Escape-lyssnaren i dialogrutor – fixad i `fasta-v32` (`openModal` i `js/modals.js`).
- **REV P3-12 (del)** vyerna laddas inte längre med `import()` i `js/ui.js` (fixat i `fasta-v32`). Resten av P3-12 ligger i L2.

## Noterat, ingen åtgärd nu (BENCH)
- Modulerna laddas i kedja; `<link rel="modulepreload">` kan hjälpa om appen växer.
- `js/data.js` laddas direkt vid start fast mycket bara behövs i Lära/Profil; blir aktuellt i Fas 1–2.

## Arbetsordning (beslutad av Anton 2026-09-25)
1. **H4 + K2 + L3–L6** – dataskydd. Först, eftersom `migrate()` anropar `normalize()` och ett fel där annars skriver över datan med tom data. 💾
2. **H1 + H2 + M4** – pausen.
3. **K1 + H3 + M6 + L13** – fältkontroll. 💾
4. **Fas 1a.**
5. **M1–M3 + L11** – service workern.
6. **L1** – typsnittet lokalt.
7. **M8** – "Radera all data". 💾
8. **M7 + L12** – tillgänglighet.
9. **M5** – efter Antons beslut.
10. Resten, **L2** sist.

Kör `/qa` med `--regression` mot `docs/qa/baseline.json` och `/benchmark` mot baslinjen efteråt.
