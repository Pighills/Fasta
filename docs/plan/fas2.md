# Fas 2 – teknisk plan v2: fasta och träning tillsammans

**Uppgift:** T-44 · **Datum:** 2026-10-03 · **Status:** planförslag, väntar på Anton.

Underlag: T-30-planen (hämtad från `codex/T-30`), Coworks arbetsbeskrivning T-44 och Antons beslut där, samt nuvarande `js/migrations.js`, `js/state.js`, `js/backup.js`, `js/helpers.js`, `js/data.js` och `js/views/trends.js`. T-44 ändrar bara dokument. Ingen ändring av sparad data publiceras före lanseringen **17 oktober 2026**.

## Kort sammanfattning

FASTA ska samla fasta och träning för samma person. Inriktningen ”fasta utan att tappa muskler” är ett produktmål, inte ett löfte om ett hälsoresultat. Appen visar registrerade uppgifter; eventuella riktvärden och förklaringar kräver godkända kunskapstexter.

- Fasta, ätfönster och pass visas på samma tidslinje. Samband räknas från tiden utan sparad fastelänk eller kopplingsval.
- Femte menyvalet **Träning** ger mallar och snabb styrkelogg. Kondition loggas som ett enkelt minutpass.
- Veckokortet **Muskelskydd** visar styrkepass och registrerat protein per dag.
- En gemensam grafvy visar kroppsvikt och registrerade bästa set, utan slutsatser.
- Dataversion 3, gemensam händelselogg, källa och externa ID:n förbereder senare Synk. Fas 2 fungerar lokalt utan konto, server eller AI.

## 1. Vad appen kan i dag

Nuvarande Timer kan logga minuter, kalorier och puls under aktiv fasta. `workout` har `data.fastId`, och radering av en fasta tar bort dess pass. Övningar, set, mallar och fristående träningshistorik saknas. Bonusmodellen använder passuppgifter för en uppskattad metabol tid; den behöver avgränsas enligt det nya kaloribeslutet.

Måltider sparar `data.protein`; `MEALS_PRE.pr` är förvalet i gram, inte ett separat register över intag. Check-in har redan kroppsvikt och viktserie. Export/import använder den gemensamma händelseloggen. Import ersätter data efter bekräftelse och sparar en återställningskopia. Dessa flöden återanvänds.

## 2. Flöden och första versionens omfattning

### Träning, mallar och set

Femte menyvalet **Träning** finns på mobil och dator. Timer-knappen öppnar samma flöde. Styrka kan loggas även utan fasta. Vyn visar sparade mallar, Fortsätt pass och tidigare pass. Mallar som ”Ben” och ”Push” är användarens egna namn, inte färdiga träningsprogram.

1. Tryck på en mall för att starta dagens pass med dess övningar. Utan mall: Nytt styrkepass → välj övningar.
2. Föregående färdiga passets vikter och upprepningar för samma övning/viktläge förfylls. Mallens ordning behålls; inget tidigare resultat är en rekommendation.
3. Spara set eller Upprepa set. Ett tryck sparar ett upprepat set med samma värden. Set kan ändras och tas bort.
4. Varje ändring sparas på samma utkast. Omladdning visar Fortsätt pass; Avsluta pass gör det färdigt. Utkast räknas inte som genomförda pass.
5. Spara som mall kopierar övningsordningen, inte passets datum/resultat. Ändra/radera mall påverkar aldrig redan loggade pass. Namn och övningsnamn sparas även i passet.

Litet granskat övningsbibliotek samt egna övningar, kg/upprepningar/kroppsvikt är beslutat. Ingen övningsbild, avancerad settyp eller färdigt program. Kondition har namn/typ, starttid och minuter samt valfria angivna kcal/puls. Vid bakåtdatering är det tydligt att tiden avser start. Datumfält använder lokal tid och `toLocalDateTimeStr()`.

**Designmått i 390×844:** ett tryck från mall till pågående pass; ett tryck per upprepat set; ändrat set högst tre tryck (vikt, upprepningar, spara) plus tangenttryck. Första övningsval, rullning och tangenttryck mäts separat. Ingen bekräftelse per set. Vilotimer är av som standard; den mäter användarvald vila utan råd. Rekordmarkering är på som standard och kan döljas.

Rekord jämför högsta registrerade kg för samma övning, upprepningsantal och viktläge i färdiga pass, utan uppvärmningsset. Första värdet är startpunkt; lika värden är inget nytt rekord. Kroppsvikt utan registrerad belastning visar upprepningar separat. Ingen uppskattad maxstyrka eller sammanvägd styrkepoäng.

### Timer/Idag: en tidslinje

”Idag” är ett avsnitt i Timer, inte ett sjätte menyval. Dagens pass visas även när ingen fasta pågår, med genväg till passet. Fasteintervall, registrerade måltidspauser och pass delar tidsaxel; ätfönster utanför fastor märks bara där start och slut kan härledas. Avsaknad av fasteloggar betyder okänt, inte ett uppmätt ätfönster.

Kopplingen beräknas av en ren funktion från passets start/slut och fastornas faktiska start/slut. Intervall är halvt öppna `[start, slut)`: exakt fastestart räknas in, exakt slut räknas inte in. Aktiv fasta begränsas till nu. Pass som korsar en gräns delas visuellt i segment och räknas bara en gång i totalsummor. Måltidspaus visas separat och ger ingen bonus.

Exempeltext **”Styrkepass 14 h in i fastan”** bygger på faktisk klocktid från fastestart, aldrig metabol uppskattning. Överlappande fastor i importerad data ger tvetydig koppling som märks, inte ett godtyckligt valt ID. Saknade/ogiltiga tider ger okänt läge. Samma beräkning används för manuella, migrerade och senare externa pass; äldre loggningstid märks som sådan och ger inget påstående om exakt träningsläge.

### Muskelskydd

Veckokortet finns i Träning med samma sammanfattning i Timer/Idag. Veckan är lokal måndag–söndag. Visa antal färdiga styrkepass och en rad per dag med summan av registrerat `meal.data.protein` i gram. Förvalets `MEALS_PRE.pr` används bara när måltiden sparas.

Saknad måltidslogg visas som ”Inget registrerat”, aldrig noll intag. Måltider utan proteinvärde ger en markering att summan är ofullständig. Ett uttryckligt nollvärde är giltigt. Även en fullständig logg är bara registrerat intag; appen kan inte avgöra om alla måltider loggats. Pass räknas efter lokal startdag och färdigt status. Migrerade pass med okänd träningstyp räknas inte automatiskt som styrka.

Riktvärde och förklaring är platshållare för **uppdrag 6 i kunskapsbasen**. Föreslagna, ännu inte fastställda ID:n: `traning.muskelskydd.intro`, `.styrka`, `.protein`, `.begransning`. Cowork fastställer ID:n och text; bara godkända texter kopieras ordagrant. Inga egna gränser, råd, färgade hälsobedömningar eller garantier byggs.

### Kroppsvikt och styrka i samma grafvy

Återanvänd kroppsvikt från check-in. Gemensam datumaxel och två tydligt märkta delgrafer i samma figur undviker att kroppsvikt och träningsvikt förväxlas. Välj övning och upprepningsantal; styrkeserien visar dagens högsta giltiga arbetsset i samma viktläge från färdiga pass. Kroppsvikt utan belastningsvärde visar upprepningar med egen enhet. Inga värden jämförs över olika övningar eller viktlägen.

Visa datum, enhet, registrerade värden och texttabell. Luckor fylls inte med noll eller påhittade värden, och serierna behöver inte ha samma dagar. Ingen normalisering till poäng, sambandstolkning eller slutsats om muskelförlust. Respektera befintligt val att dölja vägning. Redigering/import/radering räknar om grafen.

## 3. Datamodell och uppgradering (💾)

Behåll `fasta-data`, `active`, `profile`, `events`. **SchemaVersion 3 är beslutat som riktning**, men exakt format och migrering ska granskas innan bygge/publicering. Äldre appar ska skrivlåsa nyare data. Ingen ny dataversion införs i T-44.

```js
{
  id: 'stabilt-pass-id', type: 'trainingSession', t: startTime,
  data: {
    version: 1, status: 'draft', endedAt: null,
    day: '2026-10-03', timeBasis: 'start',
    source: 'manual', externalId: null, sourceProvider: null,
    kind: 'strength', name: 'Ben', durationMins: null,
    kcal: null, avgHr: null, maxHr: null,
    exercises: [{ exerciseId: 'squat', name: 'Knäböj',
      loadMode: 'external', sets: [{ id: 'set-id', reps: 8,
        weightKg: 40, warmup: false, loggedAt: 1791021600000 }] }],
    restEndsAt: null,
    legacy: null // originalets ID och tidskvalitet vid migrering
  }
}
```

Ingen `fastId` lagras i nya pass, inte heller som mallfält. Ingen pass→fasta-länk väljs av användaren. Eventtyperna `trainingTemplate` och `trainingExercise` har stabila ID:n och redigerbar data. Inställningar föreslås i `profile.training = { autoRest: false, showRecords: true, restSeconds: null }`. Ett passutkast åt gången. Mallar och utkast ingår i samma export.

Källfält används konsekvent för nya registreringar och framtida vikt/sömn: `source: 'manual' | 'external'`, `sourceProvider`, `externalId`. Migrerade uppgifter utan säker källa får uttryckligt okänd proveniens, inte påhittad klockkälla. Extern identitet är kombinationen leverantör + eventtyp + externt ID, aldrig ID ensamt. Uppdatering av samma identitet uppdaterar befintlig post. Manuella pass utan externt ID slås inte ihop genom gissning från tid/namn. FASTA-backup importeras fortsatt genom ersättning; Synk är ett separat senare flöde.

Validera ändliga tal, rimliga tekniska storleksgränser och stabila ID:n. Tomt värde är inte noll. Namn trimmas, begränsas och escapear vid visning. Okända övningar får reservnamn utan att passet kastas bort. Maximal filstorlek/antal set fastställs i grunduppgiften. Dagnyckel bygger på lokal startdag, bevaras vid resa och uppdateras uttryckligt när starttiden ändras. Överlapp beräknas från tidsstämplar, inte dagnyckeln.

### Migrering 2 → 3 och bonus

1. Bevara aktiv fasta, fastor, måltider, check-in, profil, mål, program och okända event/fält. Lägg till källmetadata utan att ersätta originaluppgifter.
2. Bevara äldre `workout` som historiskt original. Skapa exakt en färdig `trainingSession` per original med deterministiskt ID och `legacy.sourceWorkoutId`. Inga set hittas på. Gamla `t` är loggningstid: `timeBasis: 'logged'`, okänd sluttid. Ogiltiga tider bevaras men ger inget exakt överlapp. När användaren rättar start/slut kan tidsbasen bli säker.
3. Träningslistor och veckor räknar endast passhändelsen, aldrig både den och originalet. Typmappningen ska vara explicit; okända typer blir inte styrka.
4. Nya styrkepass med okända kcal ger **ingen bonus**. Inga kcal härleds ur set, kilo, upprepningar, minuter eller puls. Bonus får bara använda uttryckligt angivna kcal (manuellt eller senare från klocka), med befintliga begränsningar och undantag för måltidspaus. Ett styrkepass kan få bonus endast om kcal faktiskt angivits.
5. Ingen ny kompatibel `workout` med sparad fastelänk skapas. Grunduppgiften inför en härledd läsvy för nuvarande helpers/Timer från tidsbestämda pass. Kopplings-ID:n finns bara i beräkningsresultatet i minnet. Pass som sträcker sig över gränser får inte hela kalorimängden tilldelad flera intervall. Tills fördelningsbeslut finns ges ingen ny bonus för sådana pass.
6. Äldre råvärden och avslutade fastors `metDuration` skrivs inte om tyst. Förslag: fryst historisk fasteuppskattning; aktiv fasta vid uppgradering får separat kompatibilitetsunderlag från originalen så att redan visad bonus inte plötsligt byts utan beslutad policy (öppen fråga nedan). Ingen dubbel bonus från original och migrerat pass.
7. Radera fasta/rensa fastehistorik behåller alla träningspass och originalens träningsuppgifter. Originalets gamla fastId är en historisk uppgift, inte en ny relation eller grund för kaskadradering. Aktuell koppling försvinner när tidsintervallet försvinner. Radera ett migrerat träningspass tar bort dess original i samma sparoperation så att det inte återuppstår.
8. Migreringen är deterministisk och upprepningssäker. Import av v3 skapar inga migreringskopior. Ett misslyckat sparande lämnar föregående data intakt.

Sparandet behöver ett tydligt lyckat/misslyckat resultat. Vid full lagring eller gammal flik får setet inte visas som sparat, utkastet tappas eller vilotimern startas. Behåll inmatningen och erbjud export. Inga tysta omräkningar eller förlorade okända fält.

### Export/import och radering

Importvalideringen måste uttryckligen stödja v3, inklusive pass, mallar, set, inställningar och externa identiteter. Export→import bevarar samma ID:n, tider, källa och okända fält. Importens bekräftelse räknar färdiga pass, utkast och mallar; återställning av tidigare import fortsätter fungera.

Radera en mall påverkar inga pass; radera egen övning förstör inte sparade övningsnamn. Radera all data omfattar även mallar, utkast, inställningar och dolda kopior enligt befintligt flöde. Enskild radering kan fortfarande lämna äldre uppgifter i import-/felkopior, vilket inte får döljas i integritetstexten. Cowork granskar lokala tränings-/raderingstexter före bygge enligt redan taget beslut.

## 4. Kunskapsunderlag före bygge

| Innehåll/ID (förslag där ID saknas) | Var | Ansvar |
|---|---|---|
| Uppdrag 6, `traning.muskelskydd.*` | Veckokort | Cowork fastställer protein-/styrketexter och riktvärden; Anton godkänner. |
| `traning.ovning.<id>` | Bibliotek | Granskade namn/instruktioner, inga egenpåhittade råd. |
| `traning.intro`, `traning.fasta` | Träning/tidslinje | Avgränsning och eventuell hälsotext bara från godkänt underlag. |
| `traning.bonus` | Timer | Granska befintlig modell/text mot beslutet om angivna kcal före breddning. |
| Befintlig integritetstext med träningsutkast/mallar/radering | Profil → Integritet | Cowork tar fram exakta ändringar för Anton. |

T-44 skapar inget nytt kunskapsinnehåll och skriver inga egna hälsopåståenden. Neutrala loggknappar kan skrivas vid implementation; godkända hälsotexter kopieras ordagrant och uppdateras till inbyggd av ansvarig integratör. Namnet Muskelskydd är beslutat men får inte presenteras som ett uppmätt skydd eller garanterat resultat.

## 5. Senare steg och avgränsningar

Synk från Apple Hälsa/Health Connect hör till Capacitor/appbutiksversionen och planeras som betalfunktion. Fas 2 bygger bara källmetadata och dubblettskydd; inga behörigheter, betalningar eller hälsointegrationer aktiveras. Webbläsarspecifika funktioner läggs bakom `js/platform.js` när de behövs. Inga nya npm-beroenden eller serveradresser krävs.

Lokala tidslinjer, veckosummor och grafer kräver ingen server eller AI. Regelbaserade råd, dagsformpoäng, belastningsråd, anpassning, övningsbilder, färdiga program och avancerad konditionslogg väntar till Fas 3 eller senare. Extern AI och juridisk molnutredning beställs först när de blir aktuella, enligt Anton. Planen gör inget juridiskt ställningstagande.

Senare coach kan få spårbart underlag med event-ID:n, tid och datakvalitet från rena funktioner. Fas 2 drar inga slutsatser från samtidiga vikt-/styrke-/fastevärden. Ingen kostdatabas, social standarddelning, maskot, straffande streak eller betalvägg i onboarding. Svart/guld/Outfit gäller.

## 6. Tester och risker

- **Uppgradering:** v0/v1/v2→v3 med aktiv fasta, pass under måltidspaus, avslutade metDuration, saknade kcal/tider, profil/program/check-in och okända fält. Upprepning ger samma ID:n och inga dubletter. Gammal app vägrar skriva v3.
- **Lagring/import:** felaktiga listor/set/källfält, nyare schema, full lagring, gamla flikar, utkast efter omladdning, exakt export/import och återställning. Samma externa ID hos olika leverantörer bevaras; samma fullständiga identitet uppdateras en gång.
- **Tidslinje:** exakt start/slut, midnatt, sommar-/vintertid, bakåtdatering, måltidspaus, flera/överlappande fastor, pass över gräns och okänd loggningstid. Samma data via backup ger samma beräkning. Raderad fasta behåller pass och tar bort härledd koppling.
- **Bonus:** inga kcal från set/minuter/puls, explicit noll ger noll, inga kcal ger ingen ny bonus, ingen dubbelräkning, undantag under paus, oförändrade historiska uppskattningar enligt valt beslut.
- **Mallar/set:** mallstart med ett tryck, tidigare värden per övning/viktläge, egna/borttagna övningar, ändring utan påverkan på historik, utkast undantas från veckor/rekord.
- **Veckokort/graf:** måndag–söndag, protein från måltidens sparade fält, okänt skilt från noll, ofullständiga dagar, samma pass räknas en gång, rekordens avgränsningar, olika enheter och luckor, dold vikt och omräkning efter ändring.
- **Mobil 390×844:** fem menyval, minst 44 px tryckyta, input minst 16 px, tangentbord/fokus, tryckmåtten, textalternativ till graf, svensk text och uppdatering utan att bygga om hela DOM. Offline/notch/installering emuleras; begränsningar på riktig telefon redovisas.

Varje bygguppgift kör JS-syntaxkontroll och enhetstester. Dataändringar kräver uppgraderingstest och mobilgranskning innan publicering. Största riskerna är bonuskompatibilitet, otydliga tidsuppgifter, lagringsstorlek och att registrerat protein/grafen misstolkas som en hälsobedömning.

## 7. Små bygguppgifter och filägande

Arbets-ID:n nedan är förslag; Cowork tilldelar T-nummer. Alla delade filer ägs av ett steg i taget. Ingen dataändring publiceras före 17 oktober.

| Steg | Leverans | Filer | Beroende |
|---|---|---|---|
| F2-A Grund 💾 | v3, källa/extern identitet, migrering, pass/mallformat, radering, bonusläsvy och export/import | `js/training.js` (ny), `js/migrations.js`, `js/state.js`, `js/backup.js`, `js/helpers.js`, `js/actions.js`, `js/modals.js`, berörda tester | Plan och öppna bonus-/tidsbeslut godkända; inga UI-steg före granskad grund |
| F2-B1 Mallar + setlogg | Litet bibliotek/egna övningar, Träning-meny, mallstart, sparat utkast, upprepade set och enkla minutpass | `js/exercises.js`, `js/training-dialogs.js`, `js/views/training.js` (nya), `js/training.js`, `js/state.js`, `js/app.js`, `js/ui.js`, `index.html`, `js/modals.js`, `css/styles.css`, tester | A, godkända katalog-/introduktions-/integritetstexter |
| F2-B2 Vila + rekord | Vila av och rekord på som standard, rena resultatberäkningar | `js/training-results.js` (ny), träningsdialog/vy, `css/styles.css`, tester | B1; dela B om den annars blir för stor |
| F2-C Tidslinje | Timer/Idag, faktisk tid/ätfönster/paus, samma härledning för alla källor | `js/training-timeline.js` (ny), `js/views/timer.js`, `js/views/training.js`, `js/ui.js`, `css/styles.css`, tester | B2; granskad tidsberäkning från A |
| F2-D Muskelskydd | Pass per vecka/protein per dag med okända värden och godkänd förklaring | `js/training-summary.js` (ny), Timer/Träning, avgränsad textmodul enligt kunskapsbasens Kod-fält, `css/styles.css`, tester | C och uppdrag 6 godkänt |
| F2-E Gemensam graf | Kroppsvikt och valda övningar på samma datumaxel, tabell | `js/training-results.js`, `js/views/training-trends.js` (ny), `js/views/training.js`, `js/views/trends.js` (återanvändning), `css/styles.css`, tester | D; rena grafdata kan förberedas efter låst format |

Följ ordningen A→B1→B2→C→D→E vid integration. Rena moduler kan förberedas separat först efter låst format och utan att ändra filer som ett annat spår arbetar i. Code granskar och publicerar, höjer cache och lägger nya moduler i PRECACHE. Nya vyer/migreringar är stora ändringar som väntar på Anton.

## 8. Verkligt öppna frågor till Anton

Redan beslutat: femte Träning-valet, tidsbaserad koppling utan sparad länk, pass behålls efter fasteradering, v3, litet bibliotek/egna övningar, kg/reps/kroppsvikt, angivna kcal som bonusvillkor, vila av/rekord på, lokalt bygge och research före hälsotexter. De frågorna ställs inte igen.

1. **Bonus vid uppgradering:** frysa avslutade fastors uppskattningar och bevara redan beräknad bonus för en pågående fasta tills den avslutas, sedan använda nya kcal-villkoret? Alternativet är ett uttryckligt byte även för den pågående fastan.
2. **Pass över gräns:** avstå bonus när angivna kcal gäller ett helt pass som delvis ligger i paus/ätfönster, tills bättre tidsunderlag finns? Det föreslagna alternativet undviker att hitta på kalorifördelning.
3. **Måltider utan fasta:** godkänna fristående måltidslogg från Timer/Idag så att protein kan registreras varje dag? Dagens måltidsflöde är knutet till aktiv fasta; utan utbyggnad visar kortet bara redan loggade måltider. Om ja behövs ett eget avgränsat steg efter A, med datavalidering och granskning av radering, före D.
4. **Grafens plats:** Träning → Utveckling som huvudplats med genväg från Historik? Förslaget återanvänder check-in-vikt och lämnar registreringen där.

Den omskrivna planen inklusive format och byggordning behöver godkännas innan bygguppgifter bokas. Frågorna ovan kan avgöras vid samma avstämning; inga blockerande produktfrågor behöver besvaras för att färdigställa själva T-44-dokumentet.

## 9. Egen granskning

Sex beslutade principer finns i konkreta flöden, data och tester. Gamla fastelänkar bevaras endast som äldre original, aldrig som ny passrelation. Källmetadata är redo för senare integration utan att utlova Synk nu. Protein summeras från sparade måltider, inte katalogen; dess nuvarande begränsning är en öppen produktfråga. Grafen visar loggresultat utan hälsotolkning. Delade filer integreras i turordning. Planen ändrar inga användaruppgifter, hälsotexter eller appfunktioner.
