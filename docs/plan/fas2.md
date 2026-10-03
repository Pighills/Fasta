# Fas 2 – teknisk plan: träning

**Uppgift:** T-30 · **Skriven:** 2026-10-03 av Codex · **Status:** förslag, väntar på Coworks granskning och Antons beslut.

**Underlag:** `js/actions.js`, `js/modals.js`, `js/views/timer.js`, `js/views/trends.js`, `js/state.js`, `js/migrations.js`, `js/backup.js`, `docs/plan/fas1b.md` och Coworks `D:\FASTA\docs\plan\konkurrentanalys-2026-10-03.md`. Konkurrentanalysen är inspiration från sekundärt underlag, inte verifierade produktfakta. Den senaste kön anger lansering 17 oktober; det äldre datumet i T-30:s arbetsbeskrivning används inte.

## Kort sammanfattning

- Logga träning även utan fasta, med en egen ingång och historik.
- Börja med dagens enkla passlogg. Lägg därefter till ett litet övningsbibliotek, set, upprepningar och vikt.
- Återanvänd senaste värden så att ett likadant set kan loggas med **ett tryck**. Vilotimer är frivillig och personbästa kan döljas.
- Spara i den gemensamma händelseloggen. Förslag: dataversion 3 med testad uppgradering och oförändrade äldre pass.
- Fas 2 visar det användaren registrerat. Belastningsråd, dagsformspoäng och automatisk anpassning behöver mer underlag och hör till senare coachsteg.
- Allt i Fas 2 kan fungera lokalt utan server eller konto. En extern AI-tjänst är ett separat framtida beslut.
- Detta dokument ändrar ingen kod, sparad data eller hälsotext.

## 1. Vad appen kan i dag

| Område | Faktiskt beteende | Kod |
|---|---|---|
| Starta loggning | Timer → Träning visas under aktiv fasta, också under måltidspaus. Datorns sidopanel har också en genväg under aktiv fasta utan paus. `addWorkout()` vägrar utan aktiv fasta. | `js/views/timer.js`, `js/ui.js`, `js/actions.js` |
| Passuppgifter | Förvalda träningstyper eller eget namn, minuter (1–300), kalorier (valfritt, 0–2000), snittspuls och maxpuls (valfria). Sparas med aktuell tid. | `js/modals.js`, `js/migrations.js` |
| Lagring | `workout`-händelse med `fastId`, typ, ikon, minuter, kalorier och puls. Ingen övningslista eller set. | `js/migrations.js`, `js/state.js` |
| Visning | Pass syns under aktuell Timer och i en avslutad fastas detaljruta. Ingen fristående träningshistorik. | `js/views/timer.js`, `js/modals.js` |
| Fasteberäkning | Befintlig modell använder kalorier/puls för en uppskattad bonus; pass under måltidspaus undantas och total metabol tid begränsas till 1,4 gånger faktisk tid. Detta är en beskrivning av koden, inte en vetenskaplig bedömning. | `js/helpers.js`, `js/modals.js` |
| Trender | Energi, hunger, sömn, vikt och besvär från check-in. Ingen träningsutveckling eller jämförelse mellan träning och fasta. | `js/views/trends.js` |
| Radering | Radera fasta tar även bort dess pass. Rensa fastehistorik tar bort pass kopplade till avslutade fastor. | `js/state.js` |
| Säkerhetskopiering | Export innehåller hela händelseloggen. Import kontrollerar format, migrerar och ersätter datan efter bekräftelse. Det finns återställning av föregående import. | `js/backup.js`, `js/state.js` |

## 2. Flöden och första versionens omfattning

### Egen ingång: Träning

Förslag: femte menyvalet **Träning** på mobil och dator. Testa att fem val får plats vid 390 px med minst 44 px tryckyta och läsbara etiketter. Timer-knappen Träning öppnar samma flöde och kan förvälja koppling till fastan. Ingen funktion kräver hover.

1. Träning → **Nytt pass** → välj träningstyp → ange minuter → Spara.
2. Datum/tid kan ändras i lokal tid. Kalorier och puls ligger bakom **Fler uppgifter** och är aldrig obligatoriska.
3. Passet syns i Träning → Historik även när ingen fasta pågår. Ändra och radera sker där, med bekräftelse vid radering.
4. Under en aktiv fasta kan användaren välja **Koppla till pågående fasta**, förvalt på vid loggning från Timer. Ingen gissad koppling till äldre fastor vid bakåtdatering i första versionen.
5. Att radera en fasta tar bort länken från nya träningspass, men behåller passet. Bekräftelserna behöver beskriva detta. Äldre pass följer samma nya princip efter uppgradering; Anton godkänner förändringen före bygge.

### Övningsbibliotek och set

Biblioteket börjar litet (förslag: 12–20 övningar som Cowork granskar) och har sök samt **Egen övning**. Inga nätanrop eller externa bildbibliotek behövs. Första setversionen stöder vikt i kg och antal upprepningar samt kroppsvikt utan viktfält. Kondition loggas fortsatt som ett enkelt pass med minuter. Ingen träningsplan föreskrivs.

1. Nytt styrkepass → välj övning → fyll i första setet → **Spara set**.
2. Senaste sparade värden för samma övning förfylls, men kan ändras. Tomt fält är inte noll; kroppsvikt är ett uttryckligt val.
3. Ett sparat set visas omedelbart med **Ändra** och **Ta bort**. Pågående pass sparas efter varje ändring, inte bara vid avslut.
4. **Avsluta pass** gör det färdigt. Efter omladdning visas **Fortsätt pass**; en ofärdig logg får inte räknas som ett färdigt pass i veckosammanfattningen.
5. Egen övning får ett stabilt ID. Namn sparas också i passet så att äldre loggar går att läsa efter namnbyte eller om övningen tas bort ur biblioteket.

### Snabbhet som mätbart mål (C1)

- Mät tryck, tangenttryck och eventuell rullning separat i 390×844.
- Från öppen övning med förfyllda värden: **1 tryck per likadant set**, inklusive sparande. Ingen bekräftelseruta för varje set.
- Med ändrade värden: **högst 3 tryck** (viktfält, upprepningsfält, spara), plus nödvändiga tangenttryck. Kan värdet ändras med en direkt knapp ska det också gå med tangentbord.
- Ett nytt enkelt pass med förvald typ/tid: mål **2 tryck från Träning** (Nytt pass, Spara). Ändringar och första val av övning mäts separat.
- Timer visar vilan utan att bygga om hela vyn; fokus och inmatning ska vara kvar när tiden uppdateras.

### Vilotimer och personbästa (C1)

Förslag: vilotimer startas manuellt eller automatiskt efter set, med ett användarvalt tidsvärde. Den mäter vald vila och rekommenderar inte hur länge man bör vila. Spara sluttid, räkna om vid återkomst till appen och visa att tiden gått ut. Webbsidan kan inte lova ljud eller väckning när telefonen är låst; notiser väntar till plattformssteget.

Personbästa är valfri och beskriver bara loggen: högsta registrerade kg för **samma övning, samma antal upprepningar och samma viktläge** i färdiga pass. Första registreringen är en startpunkt, lika resultat är ingen ny rekordmarkering. Ingen beräknad maxstyrka, jämförelse mellan användare eller press att slå rekord. Ändring/radering räknar om resultatet; uppvärmningsset undantas.

## 3. Datamodell och uppgradering (💾)

### Föreslagna händelser

Behåll `fasta-data`, `active`, `profile` och `events`. Ny passmodell får egen typ **`trainingSession`**, så att äldre `workout` och befintlig bonus inte blandas ihop med set. Följande är ett formatförslag som ska godkännas och preciseras i grunduppgiften:

```js
{
  id: 'stabilt-pass-id', type: 'trainingSession', t: startTime,
  data: {
    version: 1,
    status: 'draft', // 'draft' | 'completed'
    endedAt: null,
    day: '2026-10-03', // lokalt datum vid passets start
    fastId: null,     // frivillig koppling, ingen ägarrelation
    kind: 'strength', // stabil kod, visningsnamn separat
    name: 'Styrka', durationMins: null,
    kcal: null, avgHr: null, maxHr: null,
    exercises: [{
      exerciseId: 'squat', name: 'Knäböj', loadMode: 'external',
      sets: [{ id: 'stabilt-set-id', reps: 8, weightKg: 40,
               warmup: false, loggedAt: 1791021600000 }]
    }],
    restEndsAt: null,
    legacy: null // migrerade originaluppgifter, se nedan
  }
}
```

- För enkla konditionspass är `exercises` tom. Minuter anges; set krävs endast i setflödet. Färdigt styrkepass kräver minst ett giltigt set.
- Egen övning sparas som `trainingExercise` i loggen med stabilt ID och namn. Träningsinställningar kan vara `profile.training = { restSeconds, autoRest, showRecords }`. Ingen ny parallell lagringsnyckel.
- Ett pågående pass åt gången som första avgränsning. Alla ändringar skriver över samma passhändelse via befintligt skydd mot gamla flikar. Import ersätter fortsatt datan, den slår inte ihop två loggar.
- Kvantiteter måste vara ändliga tal. Förslag till tekniska gränser: upprepningar 1–999 heltal, extern vikt 0–1000 kg, vila 0–3600 sekunder; inga hälsoanvisningar. Begränsa dessutom pass till 100 övningar och 100 set per övning. Exakta gränser och maximal filstorlek fastställs/testas i grunduppgiften.
- Namn trimmas och begränsas (förslag 80 tecken), visas med befintlig text-escaping. Okända övnings-ID:n får ett neutralt reservnamn; de får inte kasta bort passet.
- Håll sluttider som tidsstämplar och datum som lokala dagnycklar. Datumfält använder `toLocalDateTimeStr()`. Ett datum flyttas inte tyst vid resa; redigering av starttid uppdaterar dagnyckeln uttryckligt.
- Rekord, veckosummor och framtida samband härleds ur händelserna. De sparas inte som en andra sanning och räknas om efter redigering/import.

### Varför dataversion 3?

Nya eventtyper kan tekniskt bevaras av dagens `normalize()`, men äldre appversioner kan ändå radera händelser med `data.fastId` när en fasta tas bort. Dessutom känner de inte till den nya relationens betydelse. Därför föreslås **schemaVersion 3**, så att gamla versioner låser skrivning i stället för att bearbeta det nya formatet. Detta är en stor ändring och kräver Antons godkännande; ingen dataversion ändras i T-30.

### Migrering 2 → 3

1. Bevara fastor, aktiv fasta, måltider, profil, check-in, mål, program och okända händelser med alla fält.
2. Bevara varje äldre `workout` oförändrat. Skapa en motsvarande färdig `trainingSession` med deterministiskt ID utifrån originalets ID och `legacy.sourceWorkoutId`. Saknade minuter/puls/kalorier förblir okända; inga set hittas på. Äldre `t` beskriver loggningstid, inte säkert passets start. Markera därför migrerade pass med `timeBasis: 'logged'`, lämna `endedAt` okänt och använd inte tiden för exakta överlapp eller coachråd. Ogiltiga tider bevaras men placeras inte i daterade trender; användaren kan rätta dem.
3. Äldre `workout` fortsätter som källa till den befintliga fasteberäkningen; den migrerade passhändelsen visas i träningshistoriken. Träningssammanställningen använder bara passhändelser och dubbelräknar inte originalet.
4. För framtida enkla pass kopplade till en aktiv fasta kan en kompatibel `workout`-post skapas/uppdateras i **samma sparoperation** för befintlig bonus. Stabil länk via `legacy.sourceWorkoutId` eller `bonusWorkoutId` används. Set, kilo och upprepningar får aldrig omvandlas till kalorier eller bonus. Okända kalorier ger ingen bonus. Nya fristående pass skapar ingen bonuspost.
5. Ändring/radering av träningspass uppdaterar/raderar dess bonuspost atomärt och uppdaterar Timers läsvy. Radering av fasta tar bort bonusposten men sätter passets `fastId` till null och behåller passet. Samma policy gäller Rensa fastehistorik.
6. Migreringen är deterministisk och körs endast vid uppgradering. Export/import av redan uppgraderad data skapar aldrig nya kopior. Nyare data än appen förblir skrivlåst.

Grunduppgiften måste särskilt verifiera hur ändrade bonusposter påverkar redan avslutade fastors sparade `metDuration`. Förslag: pass på en avslutad fasta kan redigeras som träningslogg, men den historiska fasteuppskattningen fryses; visa tydligt om kopplade träningsuppgifter ändrats och återanvänd ingen felaktig bonusvisning. Detaljer och text kräver granskning innan implementation. Ingen tyst omräkning av äldre fastor.

### Export, import och radering

- Export tar med pass, utkast, egna övningar och inställningar i samma fil. Import behöver uttryckligt stöd för version 3 i `validateImportLists()`; dagens kontroll för version 2 räcker inte för en ny dataversion.
- Testa export → import med exakt samma ID:n, set, tid, länkar och okända fält. Importens bekräftelse räknar färdiga träningspass och utkast separat.
- Radera ett träningspass tar bort hela passet och dess kopplade bonuspost. Ändring skriver över gamla värden i huvudloggen. Appens befintliga dolda import-/felkopior kan fortfarande innehålla äldre värden; lova inte fullständig radering av kopior vid enskild radering.
- Rensa fastehistorik behåller träningspass och check-in enligt den föreslagna nya policyn; text och tester uppdateras tillsammans.
- Radera all data tar även bort egna övningar, passutkast, inställningar och dolda kopior enligt befintligt raderingsflöde. Ny raderingstext ska hanteras i kunskapsbasens process om integritetstext berörs.
- localStorage kan bli fullt. Misslyckat sparande får inte visa lyckad setloggning eller starta en ny vilotimer. `persist()` fångar i dag lagringsfel; grunduppgiften måste ge träningsflödet ett tydligt lyckat/misslyckat resultat och behålla användarens osparade inmatning. Export erbjuds utan att skriva över fungerande data.

## 4. Hälsotexter och övningsinnehåll före bygge

Codex skriver inte hälsopåståenden i planen eller appen. Cowork behöver förbereda nedanstående innehåll med fasta ID:n i `docs/kunskap/` och researchuppdrag i `UPPDRAG.md`; Anton godkänner. Tabellen är en uppdragslista, **inga nya kunskapsbasfiler skapas av T-30**.

| Föreslaget ID | Var | Underlag som behövs |
|---|---|---|
| `traning.intro` | Träning → första start | Avgränsning av vad loggen visar och vad appen inte kan bedöma. |
| `traning.ovning.<id>` | Övningsbibliotek → övning | Namn, rörelsebeskrivning och eventuella instruktioner/risktexter, källor och godkänd omfattning. |
| `traning.fasta` | Koppla pass till fasta | Eventuell hjälptext om kombinationen; säkerhetsgränser och riskgrupper får inte uppfinnas av programmeraren. |
| `traning.bonus` | Timer och träningsruta | Granskning av befintlig bonusmodell och text innan den breddas. Ingen ny modell i Fas 2. |
| `traning.personbasta` | Resultatmarkering | Vid behov hjälptext som förklarar loggens jämförelse utan att utlova fysiologisk utveckling. |
| `coach.belastning`, `coach.dagsform`, `coach.veckoforslag` | Framtida Fas 3 | Evidens, osäkerhet, minimiunderlag och hårda säkerhetsregler innan något råd aktiveras. |

Neutrala knappar som Nytt pass, Upprepningar och Spara set kan skrivas vid bygget. Övningsinstruktioner, råd om belastning eller fasta och juridiska texter får bara byggas från godkänt underlag, ordagrant.

## 5. Konkurrentförslagen och vägen till Fas 3

| Förslag | Ställningstagande | Motivering och nästa steg |
|---|---|---|
| C1 Snabb logg, vilotimer, personbästa | Ta med i små steg. | Ett tryck per upprepat set är designmått. Timer och rekord är valfria och beskriver loggen. |
| C2 Optimalt spann för belastning mot fasteläge | Skjut råd och beteckningen optimalt till Fas 3. | Fasteklocka, kalorier och set räcker inte för att fastställa ett individuellt säkert/optimalt spann. Fas 2 kan visa registrerade minuter, set och faktisk fastetid sida vid sida, utan grönt/rött godkännande av träning. |
| C3 Daglig poäng | Avstå i Fas 2. | Vikter i en sammanvägd poäng saknar godkänt underlag. Visa de enskilda registrerade värdena och luckorna. Fler dagar gör inte i sig en poäng giltig. |
| C4 Coach som citerar egna data | Förbered lokal, spårbar sammanställning. | Varje framtida slutsats måste kunna peka på händelse-ID:n, datum, period och antal observationer. Orsakssamband får inte härledas från samtidiga loggar. AI-dialog hör till Fas 5. |
| C5 Veckovis anpassning | Veckosummering i Fas 2; rekommendationer i Fas 3. | Minuter, antal pass och set per övning kan räknas lokalt. Anpassning kräver godkända regler, tillräckligt underlag och bekräftelse före programändring. |
| 3D Undvik | Följ samtliga avgränsningar. | Ingen kostdatabas, standarddelning/sociala funktioner, maskot, straffande streak, betalvägg i onboarding, pastellpalett eller överdrivna hälsopåståenden. Behåll svart/guld/Outfit. |

### Koppling check-in ↔ fasta ↔ träning

Förbered rena funktioner för tidsintervall och datakvalitet, men aktivera ingen coach i Fas 2. Check-in kopplas via lokal dag, pass via registrerad start/slut och fasta via **faktisk tid**, med separat markering för måltidspaus. Metabol uppskattning är ingen mätning av återhämtning. Om sluttid saknas är överlapp okänt; gissa inte från enbart minuter. En dags check-in betyder inte att svaret gavs under ett visst pass eller en viss fasta.

Fas 3 kan bygga regler som data i `js/coach-rules.js` och rena beräkningar i `js/coach.js`. Reglerna ska ange version, nödvändiga fält, minsta antal observationer, källa och säkerhetsvillkor. Resultatet innehåller användarens underlag och varför en regel aktiverades eller avstod. Ändrad/raderad logg gör tidigare slutsatser inaktuella. Exakta miniminivåer bestäms genom godkänd research, inte en godtycklig siffra i denna plan.

### Behövs server eller konto för C4/C5?

**Teknisk bedömning:** egna data, veckosummeringar och deterministiska regelråd kan beräknas på enheten med Vanilla JS och localStorage. Ingen server eller inloggning behövs för detta. Kör vid öppning/aktiv användning; en webbapp kan inte garantera en veckokörning när den är stängd. Export/import förblir användarens väg mellan enheter.

En extern språkmodell kräver en separat säker serverlösning om API-nycklar används; hemliga nycklar får inte läggas i webbappen. Konto behövs för identifierad molnsynk, men är inte ett tekniskt krav för lokala råd. Kostnader, datamottagare, lagring, säkerhet och rättsliga frågor måste beslutas före någon integration. Modeller på enheten utreds inte i Fas 2; inget sådant stöd utlovas.

### Integritet – frågor, inte juridiska beslut

IMY beskriver hälsouppgifter som känsliga personuppgifter och anger att behandling kräver ett tillämpligt undantag från huvudförbudet. Se [IMY: vad är personuppgifter om hälsa?](https://www.imy.se/vanliga-fragor-och-svar/vad-ar-personuppgifter-om-halsa/) och [IMY: när får ni behandla känsliga personuppgifter?](https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/introduktion-till-gdpr/personuppgifter/kansliga-personuppgifter/nar-far-ni-behandla-kansliga-personuppgifter/), kontrollerade 2026-10-03.

Planen avgör inte ansvar eller rättslig grund. Inför ett bygge behöver Anton/Cowork bedöma om integritetssidan ska kompletteras med träningslogg, utkast, lokala analyser, kopior och raderingsbeteende. Inför moln/AI behöver de också utreda ansvar, rättslig grund och artikel 9-undantag, mottagare/biträden, eventuella tredjelandsöverföringar, lagringstid, återkallelse/radering och behov av konsekvensbedömning. LocalStorage eller avsaknad av konto är inte i sig ett juridiskt besked om att inga skyldigheter finns. Dessa beslut återfinns som frågor i avsnitt 8.

## 6. Tester och risker

**Grunduppgiften:** gamla versioner 0/1/2 → version 3 med fastor, aktiv fasta, pass i måltidspaus, check-in, hälsoprofil, mål/program och okända event. Kontrollera att ursprungsdata bevaras och att samma migrering inte skapar dubbla pass. Gammal app med version 3 ska vägra skriva. Testa malformed import, nyare version, full lagring, två flikar, export/import och återställning av import.

**Loggningen:** skapa utan fasta, koppla/inte koppla vid aktiv fasta, bakåtdatera och ändra/radera, oavslutat pass efter omladdning, borttagen fasta med kvarvarande pass, ingen dubbel bonus och inga kalorier från set. Testa historiska fastevärden särskilt enligt avsnitt 3.

**Rena beräkningar:** ofullständiga pass, saknade värden, lika rekord, olika antal upprepningar/övningar/viktlägen, uppvärmningsset, ändring/radering, veckogräns och lokal sommartid/vintertid. Inga totalsummor i kg mellan övningar eller typer som ger en missvisande belastningspoäng.

**Mobil 390×844:** fem menyval, sök/egna namn, nummerfält minst 16 px, tryckytor minst 44 px, tangentbord synligt, snabbhetsmåtten, skärmläsaretiketter, fokus efter sparande, valfri rekordmarkering och vilotimer utan DOM-blinkning. Timer verifieras efter flikbyte/omladdning; offline och installerad app testas så långt emulering medger och verkliga telefonbegränsningar redovisas.

**Risker:** dubbla läsvyer av gamla pass/bonus kräver atomiska ändringar; data växer och kan fylla lagringen; bibliotekets övningsinstruktioner behöver research; fem menyval kan bli trångt; kroppsvikt/extern vikt får inte jämföras som samma mätning. Byggningen stoppas före respektive steg om underlag eller data-/produktbeslut saknas, men fristående rena moduler kan förberedas enligt godkänd omfattning.

## 7. Små bygguppgifter och filägande

Nedan är **föreslagna arbets-ID:n**, inte bokade nummer i kön. Cowork sätter lediga T-nummer efter godkännande. Delade filer byggs i turordning; bara rena moduler utan gemensamma filer kan göras parallellt.

| Arbets-ID | Innehåll | Filer | Beroenden |
|---|---|---|---|
| F2-A Grund 💾 | Version 3, migrering, läsvyer, atomiskt sparande, länkar/radering, export/import och felhantering. Ingen ny vy. | `js/training.js` (ny ren datamodul), `js/migrations.js`, `js/state.js`, `js/backup.js`, `js/actions.js`, `js/helpers.js`, `js/modals.js` (historisk bonusvisning), `tests/training.test.mjs`, berörda befintliga tester | Antons data-/raderings-/bonusbeslut |
| F2-B Enkel logg | Träning-ingång, enkla pass utan fasta, historik, ändra/radera, kopplingsval; återanvänd godkända texter. | `js/views/training.js`, `js/training-dialogs.js` (nya), `js/app.js`, `js/ui.js`, `js/actions.js`, `js/modals.js` (hänvisa befintlig knapp), `index.html`, `css/styles.css` | A, godkänd introduktion/integritet vid behov |
| F2-C Bibliotek | Stabil katalog, sök, egen övning och egenövningshändelser. Först ren modul och tester. | `js/exercises.js`, `tests/exercises.test.mjs` (nya); godkänt kunskapsunderlag hanteras av Cowork/Code | Plan godkänd; katalogtexter godkända före UI |
| F2-D Setlogg | Pågående pass, ett tryck per upprepat set, redigering/återupptagning. | `js/training.js`, `js/state.js`, `js/training-dialogs.js`, `js/views/training.js`, `css/styles.css`, `tests/training.test.mjs`, `tests/state.test.mjs` | A, B, C |
| F2-E Vila och resultat | Frivillig vilotimer och definierad rekordjämförelse, utan nya råd. | `js/training-results.js`, `tests/training-results.test.mjs` (nya rena moduler), därefter `js/training-dialogs.js`, `js/views/training.js`, `css/styles.css`; `js/platform.js` endast om webbläsarspecifikt ljud behövs | D; rena resultatmodulen kan förberedas tidigare när formatet är låst |
| F2-F Veckosummering | Träning → Utveckling: pass/minuter och set per övning med datum/antal och luckor. Ingen poäng eller automatisk anpassning. | `js/training-summary.js`, `tests/training-summary.test.mjs`, `js/views/training-trends.js` (nya), därefter `js/views/training.js`, `css/styles.css` | D; UI-integration efter E för att undvika filkrock |

A och C har inga gemensamma kodfiler; B och C kan utvecklas åtskilt, men D väntar på båda. D/E/F delar vy och stil och integreras seriellt. Ingen träningstext läggs i `js/data.js` medan T-43 pågår där; granskade träningstexter placeras i den avgränsade katalogmodulen eller en senare separat textmodul enligt kunskapsbasens Kod-fält. Code höjer cache-version och lägger nya appmoduler i PRECACHE vid respektive publicering. Nya vyer och datamigreringar är stora ändringar och väntar på Anton.

## 8. Beslut och frågor till Anton

1. **Första leveransen:** börja med en fristående enkel passlogg, sedan övningar/set, vila/resultat och veckosummering enligt A–F?
2. **Var i appen:** godkänna ett femte menyval Träning, med Timer-knappen som genväg? Alternativet är en ingång i Historik, men den är mindre lätt att hitta.
3. **Koppling och radering:** ska pass vara självständiga och behållas när en fasta raderas, även äldre migrerade pass? Koppling förväljs bara från Timer och kan väljas bort.
4. **Datauppgradering:** godkänna version 3 och det föreslagna bevarandet av gamla pass/bonusposter, med uppgraderingstest före publicering?
5. **Bonus:** behålla befintlig uppskattning för enkla kopplade pass, men aldrig omvandla set till bonus? Ska historiska fasteuppskattningar frysas vid senare passändring enligt förslaget? Cowork måste granska modell/text innan breddning.
6. **Bibliotek och enheter:** ett litet granskat bibliotek samt egna övningar, kg/upprepningar/kroppsvikt först; kondition som enkelt minutpass? Andra enheter och avancerade settyper väntar.
7. **Vila och personbästa:** frivillig vilotimer och valfri markering av loggresultat enligt avsnitt 2? Förslag: automatisk vila och rekordmarkering av som standard, användaren väljer själv.
8. **Omfattning C2/C3:** godkänna att optimalt belastningsspann och daglig poäng väntar, medan Fas 2 visar registrerade värden utan råd?
9. **C4/C5 och server:** vill du börja med lokala veckosummeringar och senare lokal regelcoach, utan konto/server? Extern AI, synk och automatisk veckokörning när appen är stängd behöver ett separat uppdrag/beslut.
10. **Hälsotexter:** ge Cowork uppdragen i avsnitt 4 före övningsinstruktioner, breddad bonus eller råd?
11. **Integritet nu:** låta Cowork granska vilka tillägg träningslogg, utkast, analyser och ändrad radering kräver på integritetssidan, och lägga fram exakta texter för ditt godkännande?
12. **Integritet före moln/AI:** vill du beställa separat utredning av ansvar, rättslig grund/undantag för hälsodata, mottagare, lagring, rättigheter och eventuell konsekvensbedömning innan något lämnar enheten?

## 9. Egen granskning av planen

- **Omfattning:** en fungerande logg före coach; C1–C5 och samtliga 3D-avgränsningar är behandlade.
- **Återanvändning:** gemensam händelselogg, äldre pass, migrering, export/import, lokala datum och skydd mot gamla flikar.
- **Datarisk:** egen passmodell skyddas av ny dataversion; gamla råvärden bevaras. Atomiska ändringar och lagringsfel måste testas innan UI.
- **Spårbarhet:** rena funktioner för sammanställning; datum/ID:n kan bli underlag för Fas 3, utan att hälsoslutledningar aktiveras nu.
- **Filkrockar:** seriell integration av delade filer; nya rena katalog/resultat/sammanställningsmoduler är avgränsade.
- **Godkännande:** T-30 är endast ett planförslag. Ingen feature, dataändring, hälsotext eller extern tjänst är godkänd genom att dokumentet skrivs.
