# Fastefaser, fördelar och scheman

Kod: `js/data.js` → `PH`, `BENEFITS`, `PRESETS`

Texterna på **Timer**-sidan: fasen du är i, fördelarna som låses upp och beskrivningen av varje fasteschema.

Se [README.md](README.md) för hur filen används.

---

## Metodnotering – uppdrag 2, 2026-09-24

Granskningen omfattar samtliga åtta faser, sju fördelsrutor och åtta scheman. Detta är en riktad källgranskning, inte en ny systematisk översikt. Sökning och kontroll gjordes via vetenskapliga förlag, PubMed/PMC och Cochrane, med ämnena fastefysiologi, ketoner, autofagi, tillväxthormon, BDNF/kognition, inflammation, immunförnyelse och tidsbegränsat ätande. Nyare systematiska översikter och metaanalyser prioriterades. Ingen identifierad klinisk riktlinje validerar appens timindelade hälsolöften. Äldre fysiologiska och metodologiska översikter används där de behövs för etablerade grundprocesser.

**Oberoende:** Under uppdrag 2 har jag inte läst `docs/kunskap/` eller `docs/jamforelse/`, och inte använt Coworks resultat från tidigare chattar. Före detta uppdrag, i samband med uppdrag 1, hade jag sett Coworks säkerhetstexter. Därför är granskningen inte blind för allt tidigare material om projektet. Coworks granskning av fastefaserna har inte lästs. Källor till denna bedömning har sökts och kontrollerats direkt; en egen tidigare kontrollerad Cochrane-källa återanvänds, tydligt angivet vid F12.

**Tolkning av evidens:** Stark/måttlig/svag är redaktionella sammanvägningar för det specifika påståendet, inte en egen formell GRADE-granskning. Stark grundfysiologi betyder inte stark evidens för en exakt timgräns eller hälsovinst. Saknat tillräckligt stöd betyder att löftet inte bör stå i appen, inte att effekten är bevisat omöjlig. F3–F5 är enskilda explorativa/mekanistiska studier eller djurförsök och används bara för att förklara mekanismer och begränsningar, aldrig som grund för ett hälsolöfte. Metodriktlinjen F13 är ingen klinisk rekommendation att fasta.

**Ungefärlig tid:** Där det finns stöd anges breda förlopp i anteckningarna. Inga nya exakta biologiska trösklar ersätter de gamla. Matens innehåll, tidigare kost, aktivitet och individens fysiologi påverkar förloppet. Resultat efter veckor eller månader av ett upplägg får inte flyttas till timern för en enda fasta. Djurens fastetider kan inte översättas timme för timme till människor.

**Förslag för presentationen:** Faserna blir tidsmarkeringar med saklig information. Samtliga sju fördelsrutor föreslås tas bort eftersom deras upplåsning gör biologiska hypoteser till individuella löften. ID:n och ursprungstexter behålls här. Scheman beskrivs utan en skala där längre fasta kallas bättre. Hänvisning till vården vid flerdygnsupplägg är ett försiktighetsråd, inte en bevisad risktröskel eller en klinisk riktlinje specifikt för 36 timmar. Inga ändringar har gjorts i appen.

Fullständiga referenser och åtkomstbegränsningar finns i slutet av filen. Varje rutas källhänvisningar avser både dess ersättningstext och bedömningen av ursprungstexten.

---

## Faser (PH)

### fas.0h
- **Var i appen:** Timer → fasen "Matsmältning" (från 0 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** förslag

**Rubrik – nu:**
> Matsmältning

**Rubrik – ny text:**
> _(ingen ändring)_

**Kort text – nu:**
> Kroppen bryter ner maten och tar upp näring. Blodsockret är förhöjt och kroppen lagrar överskott.

**Kort text – ny text:**
> Efter en måltid bryter kroppen ner maten och tar upp näring.

**Lång text – nu:**
> Blodsockret stiger → kroppen frisätter insulin (ett hormon som transporterar socker till cellerna) → överskottssockret lagras som glykogen (kroppens korttidslager av socker) i levern och musklerna, eller som fett.

**Lång text – ny text:**
> Näring från maten används som energi eller lagras för senare behov. Insulin hjälper kroppen att ta hand om bland annat glukos, en form av socker. Hur länge upptaget pågår beror på vad och hur mycket du har ätit.

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Insulin är en signal, inte ett hormon som fysiskt transporterar socker. Blodsockret behöver inte vara förhöjt efter alla måltider. Noll timmar är en startmarkering, inte ett uppmätt kroppstillstånd.

**Människor och ungefärlig tid:** Människor: matsmältning och upptag pågår under timmar efter en måltid, med stor variation. Ingen universell slutpunkt; noll timmar är appens start.

**Evidensstyrka:** Stark för grundfysiologin; svag för en bestämd tidskurva hos individen.

**Källor för förslag och bedömning:** [F1: Anton m.fl. 2018](#f1); [F2: Herman m.fl. 2025](#f2).

---

### fas.4h
- **Var i appen:** Timer → fasen "Tidig fasta" (från 4 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** förslag

**Rubrik – nu:**
> Tidig fasta

**Rubrik – ny text:**
> Mellan måltider

**Kort text – nu:**
> Matsmältningen är klar. Kroppen börjar använda sitt sockerlager (glykogen) som bränsle.

**Kort text – ny text:**
> Kroppen använder sina energilager och kan fortfarande ta upp näring från den senaste måltiden.

**Lång text – nu:**
> Levern bryter ner sitt glykogenlager och skickar socker till blodet för att hålla energin stabil. Insulinnivån börjar sjunka. Kroppen förbereder sig för att byta bränsle från mat till egna lager.

**Lång text – ny text:**
> Levern kan frigöra glukos från glykogen, ett lager av socker. Kroppen använder också fett som bränsle. Matsmältningen är inte alltid klar efter fyra timmar.

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Leverns och musklernas glykogen har olika roller; muskelglykogen försörjer främst muskeln. Ingen universell fyratimmarsgräns för färdig matsmältning, insulinfall eller början på fettanvändning har fastställts.

**Människor och ungefärlig tid:** Människor: insulin och leverns glukosproduktion förändras under timmar mellan måltider. Glykogen används successivt och fett används redan; ingen särskild start vid fyra timmar.

**Evidensstyrka:** Stark för grundprocesserna; svag för den exakta timgränsen.

**Källor för förslag och bedömning:** [F1: Anton m.fl. 2018](#f1); [F2: Herman m.fl. 2025](#f2).

---

### fas.12h
- **Var i appen:** Timer → fasen "Fettförbränning" (från 12 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** förslag

**Rubrik – nu:**
> Fettförbränning

**Rubrik – ny text:**
> 12 timmar utan mat

**Kort text – nu:**
> Sockerlagren börjar ta slut. Kroppen ökar fettförbränningen markant och börjar göra egna bränslekroppar av fett.

**Kort text – ny text:**
> Under fasta ökar vanligtvis användningen av fett som bränsle, men takten varierar.

**Lång text – nu:**
> Kroppen frigör fett från fettcellerna (processen kallas lipolys — kroppens sätt att plocka ut fett som bränsle). Levern omvandlar en del av detta fett till ketoner — ett alternativt bränsle som hjärnan och musklerna kan använda. Tillväxthormon börjar stiga.

**Lång text – ny text:**
> Levern kan bilda mer ketoner, ett alternativt bränsle från fett. Tidigare måltider och fysisk aktivitet påverkar förloppet. Timern visar inte om dina glykogenlager är tömda.

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Ta bort 'markant', bestämd start för ketoner och tillväxthormon vid tolv timmar. Fett används även innan fasta. Ökad fettanvändning under ett matuppehåll är inte liktydigt med varaktig minskning av kroppsfett.

**Människor och ungefärlig tid:** Människor: översikter beskriver ofta ökande ketoner efter cirka 8–12 timmar och en gradvis större övergång till fett/ketoner under cirka 12–36 timmar. Intervallen är grova fysiologiska beskrivningar, inte validerade gränser för individen. Ingen fastställd tolvtimmarsgräns för tömda lager, hormonökning, muskelskydd eller inflammationsminskning.

**Evidensstyrka:** Stark för metabol anpassning; svag för individens nivåer vid tolv timmar.

**Källor för förslag och bedömning:** [F1: Anton m.fl. 2018](#f1); [F2: Herman m.fl. 2025](#f2); [F9: Semnani-Azad m.fl. 2025](#f9).

---

### fas.16h
- **Var i appen:** Timer → fasen "Tidig ketos" (från 16 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** förslag

**Rubrik – nu:**
> Tidig ketos

**Rubrik – ny text:**
> 16 timmar utan mat

**Kort text – nu:**
> Kroppen kör nu till stor del på ketoner (fettbränsle). Hjärnan byter bränsle. Kroppens städprocess aktiveras.

**Kort text – ny text:**
> 16 timmar är en tidsmarkering, inte ett säkert tecken på ketos.

**Lång text – nu:**
> Ketoner (kroppens alternativa bränsle av fett) stiger i blodet. En signal i kroppen aktiveras när energilagren är låga — den talar om för cellerna att börja städa och reparera sig. Autofagi startar: celler bryter ner och återvinner skadade delar.

**Lång text – ny text:**
> Mängden ketoner i blodet varierar mellan personer och fasteupplägg. Hjärnan byter inte helt bränsle vid ett bestämt klockslag. Timern kan inte avgöra graden av ketos eller cellernas återvinning, som kallas autofagi.

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Ta bort 'till stor del på ketoner', 'hjärnan byter bränsle' och 'autofagi startar'. Varken ketos eller autofagi kan diagnostiseras av en 16-timmarsräknare. [F3] visar att människor har studerats men ger ingen akut starttid. Autofagi pågår också när man äter; reglering i en viss vävnad ska skiljas från en påstådd start i hela kroppen.

**Människor och ungefärlig tid:** Människor: ketoner kan stiga under första dygnet men bränsleanvändningen är blandad. Ingen fastställd 16-timmarsgräns för dominerande ketondrift, aktivering av autofagi eller bättre fokus. Autofagi är en löpande cellprocess, inte en av/på-funktion som börjar vid denna tid.

**Evidensstyrka:** Måttlig för allmän metabol beskrivning; svag/saknas för den utlovade 16-timmarsfasen.

**Källor för förslag och bedömning:** [F1: Anton m.fl. 2018](#f1); [F3: Bensalem m.fl. 2025](#f3); [F13: Klionsky m.fl. 2021](#f13).

---

### fas.24h
- **Var i appen:** Timer → fasen "Aktiv autofagi" (från 24 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** förslag

**Rubrik – nu:**
> Aktiv autofagi

**Rubrik – ny text:**
> Ett dygn utan mat

**Kort text – nu:**
> Cellernas städprocess (autofagi) är i full gång. Kroppen reparerar och förnyar sig inifrån.

**Kort text – ny text:**
> Efter ett dygn kan timern fortfarande inte visa hur mycket autofagi som sker.

**Lång text – nu:**
> Cellerna återvinner aktivt skadade och gamla delar. Ett ämne i hjärnan som stärker minne och inlärning ökar — många upplever skärpt fokus. Tillväxthormonet kan vara upp till 5 gånger högre än normalt, vilket skyddar muskelmassa.

**Lång text – ny text:**
> Forskningen ger ingen säker tidpunkt då cellernas återvinning når en viss nivå hos människor. Det finns inte heller tillräckligt stöd för att lova bättre fokus eller skyddad muskelmassa efter ett dygn. Förläng inte fastan för att nå en utlovad cellreparation.

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Stryk 'i full gång', generell reparation, BDNF-ökning och '5 gånger' med muskelskydd. BDNF-resultaten är blandade [F6]; kognitionsöversikten ger inget generellt fokuslyft [F7]. Hormonökning i en liten studie bevisar inte kliniskt muskelskydd [F5]. Sista meningen är försiktighetsråd.

**Människor och ungefärlig tid:** Människor: hormoner och ketoner kan förändras under första dygnet. Ingen validerad 24-timmarsgräns för intensiv autofagi, femfaldigt tillväxthormon, muskelskydd, BDNF-ökning eller mindre oxidativ stress. Studier av blodmarkörer och djurmekanismer fastställer inte klinisk nytta i hela kroppen.

**Evidensstyrka:** Svag/saknas för timbundna autofagi-, hjärn- och muskellöften.

**Källor för förslag och bedömning:** [F3: Bensalem m.fl. 2025](#f3); [F5: Horne m.fl. 2025](#f5); [F6: Alkurd m.fl. 2024](#f6); [F7: Bamberg & Moreau 2025](#f7); [F13: Klionsky m.fl. 2021](#f13).

---

### fas.36h
- **Var i appen:** Timer → fasen "Djup ketos" (från 36 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** förslag

**Rubrik – nu:**
> Djup ketos

**Rubrik – ny text:**
> Ett och ett halvt dygn utan mat

**Kort text – nu:**
> Kroppen är djupt inne i fettförbränning. Cellförnyelse accelererar.

**Kort text – ny text:**
> 36 timmar visar fastans längd, inte att ketoner eller cellförnyelse har nått en topp.

**Lång text – nu:**
> Ketonerna (fettbränslet) är på sin högsta nivå. Kroppen kan börja bilda nya celler för att ersätta gamla och skadade. Genernas aktivitetsmönster skiftar mot reparation och motståndskraft mot stress.

**Lång text – ny text:**
> Kroppens anpassning fortsätter utan en gemensam biologisk gräns vid 36 timmar. Det finns inte tillräckligt stöd för att lova snabbare cellförnyelse vid den här tidpunkten. Diskutera längre fastor med vården innan du börjar.

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Ingen validerad 36-timmarstopp för ketoner. 'Ny cellbildning' och genernas 'reparationsläge' saknar belagd starttid och säkerställd klinisk nytta. Vårdrådet är en försiktighetsbedömning, inte en bevisad riskgräns vid 36 timmar.

**Människor och ungefärlig tid:** Människor: ketoner kan fortsätta öka över flera dygn; 36 timmar är ingen allmän topp. Cellbildning förekommer även utan fasta. Det finns ingen fastställd tid för en fasteutlöst acceleration av cellförnyelse eller ett kliniskt gynnsamt 'reparations- och skyddsläge'.

**Evidensstyrka:** Svag för exakta toppar och kliniska cellförnyelseeffekter.

**Källor för förslag och bedömning:** [F2: Herman m.fl. 2025](#f2); [F11: Ezpeleta m.fl. 2024](#f11); [F13: Klionsky m.fl. 2021](#f13).

---

### fas.48h
- **Var i appen:** Timer → fasen "Cellförnyelse" (från 48 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** förslag

**Rubrik – nu:**
> Cellförnyelse

**Rubrik – ny text:**
> Två dygn utan mat

**Kort text – nu:**
> Immunsystemet förnyas. Gamla immunceller ersätts med nya.

**Kort text – ny text:**
> Två dygn utan mat innebär inte att immunsystemet har förnyats.

**Lång text – nu:**
> Kroppen börjar bilda nya immunceller från stamceller (kroppens egna reservceller som kan bli till olika celltyper). Kroppens tillväxtsignal pausas, vilket möjliggör djupare cellreparation.

**Lång text – ny text:**
> Påståenden om nya immunceller efter fasta bygger till stor del på djurförsök och tidiga studier i särskilda patientgrupper. De visar inte att friska personer får en förnyelse av immunsystemet efter 48 timmar. Planera inte en längre fasta för att uppnå den effekten.

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Stryk att gamla immunceller ersätts och att tillväxtsignal 'pausas' vid 48 timmar. [F4] omfattar främst möss, cytostatikakontext och fasta följd av återätning; det är inte en generell tidslinje för människor. Frånvaro av bevis är inte bevis för biologisk omöjlighet.

**Människor och ungefärlig tid:** Människor: ingen belagd 48-timmarsgräns för immunförnyelse eller en pausad tillväxtsignal. Hormonella signaler kan förändras, men det bevisar inte djupare reparation. Regenerationsfynden är framför allt från djur och kan inte få en mänsklig timgräns genom direkt överföring.

**Evidensstyrka:** Svag/otillräcklig för immunförnyelse vid 48 timmar hos människor.

**Källor för förslag och bedömning:** [F4: Cheng m.fl. 2014](#f4); [F2: Herman m.fl. 2025](#f2).

---

### fas.72h
- **Var i appen:** Timer → fasen "Systemreset" (från 72 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** förslag

**Rubrik – nu:**
> Systemreset

**Rubrik – ny text:**
> Tre dygn utan mat

**Kort text – nu:**
> Maximal cellförnyelse. Immunsystemet genomgår en djupgående omstart.

**Kort text – ny text:**
> Det finns inget tillräckligt stöd för att tre dygn ger kroppen en omstart.

**Lång text – nu:**
> Kroppen bildar nya, effektivare energifabriker i cellerna (mitokondrier är de delar av cellen som omvandlar näring till energi). Stamcellsaktiviteten är på topp.

**Lång text – ny text:**
> Forskningen visar inte att cellernas återvinning eller stamcellsaktivitet når ett maximum efter 72 timmar. Det går inte heller att lova ett förnyat immunsystem. Fler dygn utan mat är ingen garanti för större hälsovinst.

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Stryk 'systemreset', 'maximal', mitokondrielöftet och 'stamcellsaktivitet på topp'. Förändringar i proteiner eller signalvägar är inte samma sak som förbättrad hälsa; klockan mäter inget av detta. Flerdygnsstudier är heterogena och ofta små/övervakade.

**Människor och ungefärlig tid:** Människor: ingen fastställd tid för komplett immunförnyelse, maximal cellstädning, topp i stamcellsaktivitet eller nya och effektivare mitokondrier. Djur- och mekanismdata visar inte att dessa hälsovinster uppnås efter tre dygn.

**Evidensstyrka:** Svag/otillräcklig för samtliga angivna 72-timmarslöften.

**Källor för förslag och bedömning:** [F2: Herman m.fl. 2025](#f2); [F4: Cheng m.fl. 2014](#f4); [F11: Ezpeleta m.fl. 2024](#f11); [F13: Klionsky m.fl. 2021](#f13).

---

## Fördelar (BENEFITS)

### fordel.4h
- **Var i appen:** Timer → fördelar som låses upp vid 4 h
- **Status:** förslag

**Rubrik – nu:**
> Tidig fasta initierad

**Rubrik – ny text:**
> _(ta bort)_

**Punkter – nu:**
> - Insulinnivån sjunker
> - Sockerlagren börjar tömmas
> - Kroppen förbereder fettförbränning

**Punkter – ny text:**
> _(ta bort)_

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Insulin och bränsleanvändning förändras gradvis. Detta är inte tre nyvunna hälsovinster som kan fastställas vid fyra timmar. Förslag: ta bort rutan, inte dess ID i kunskapsbasen. Om den senare ersätts av allmän information behöver även ordet 'fördelar' och upplåsningsformen ändras; enbart ordet 'kan' räcker inte.

**Människor och ungefärlig tid:** Människor: insulin och leverns glukosproduktion förändras under timmar mellan måltider. Glykogen används successivt och fett används redan; ingen särskild start vid fyra timmar.

**Evidensstyrka:** Svag/saknas för utlovade individuella effekter vid angiven tid.

**Källor för förslag och bedömning:** [F1: Anton m.fl. 2018](#f1); [F2: Herman m.fl. 2025](#f2).

---

### fordel.12h
- **Var i appen:** Timer → fördelar som låses upp vid 12 h
- **Status:** förslag

**Rubrik – nu:**
> Fettförbränning aktiverad

**Rubrik – ny text:**
> _(ta bort)_

**Punkter – nu:**
> - Kroppen förbränner aktivt fett
> - Fettbränsle (ketoner) börjar produceras
> - Tillväxthormon stiger och skyddar muskler
> - Inflammationsnivån minskar

**Punkter – ny text:**
> _(ta bort)_

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Ingen visad aktiveringströskel för fett/ketoner, muskelskydd via tillväxthormon eller minskad inflammation vid tolv timmar. Förändrade inflammationsmarkörer efter ett kostprogram ger ingen sådan timgräns. Förslag: ta bort rutan, inte dess ID i kunskapsbasen. Om den senare ersätts av allmän information behöver även ordet 'fördelar' och upplåsningsformen ändras; enbart ordet 'kan' räcker inte.

**Människor och ungefärlig tid:** Människor: översikter beskriver ofta ökande ketoner efter cirka 8–12 timmar och en gradvis större övergång till fett/ketoner under cirka 12–36 timmar. Intervallen är grova fysiologiska beskrivningar, inte validerade gränser för individen. Ingen fastställd tolvtimmarsgräns för tömda lager, hormonökning, muskelskydd eller inflammationsminskning.

**Evidensstyrka:** Svag/saknas för utlovade individuella effekter vid angiven tid.

**Källor för förslag och bedömning:** [F1: Anton m.fl. 2018](#f1); [F5: Horne m.fl. 2025](#f5); [F8: Khalafi m.fl. 2025](#f8); [F2: Herman m.fl. 2025](#f2).

---

### fordel.16h
- **Var i appen:** Timer → fördelar som låses upp vid 16 h
- **Status:** förslag

**Rubrik – nu:**
> Ketos — fettbränsle aktivt

**Rubrik – ny text:**
> _(ta bort)_

**Punkter – nu:**
> - Hjärnan och kroppen drivs av fettbränsle
> - Kroppens städprocess (autofagi) aktiveras
> - Många upplever mentalt fokus och klarhet

**Punkter – ny text:**
> _(ta bort)_

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Varken dominerande ketondrift, aktiverad autofagi eller bättre fokus kan utläsas efter exakt 16 timmar. De tre punkterna tas bort som personliga prestationslöften. Förslag: ta bort rutan, inte dess ID i kunskapsbasen. Om den senare ersätts av allmän information behöver även ordet 'fördelar' och upplåsningsformen ändras; enbart ordet 'kan' räcker inte.

**Människor och ungefärlig tid:** Människor: ketoner kan stiga under första dygnet men bränsleanvändningen är blandad. Ingen fastställd 16-timmarsgräns för dominerande ketondrift, aktivering av autofagi eller bättre fokus. Autofagi är en löpande cellprocess, inte en av/på-funktion som börjar vid denna tid.

**Evidensstyrka:** Svag/saknas för utlovade individuella effekter vid angiven tid.

**Källor för förslag och bedömning:** [F1: Anton m.fl. 2018](#f1); [F3: Bensalem m.fl. 2025](#f3); [F7: Bamberg & Moreau 2025](#f7).

---

### fordel.24h
- **Var i appen:** Timer → fördelar som låses upp vid 24 h
- **Status:** förslag

**Rubrik – nu:**
> Aktiv cellstädning

**Rubrik – ny text:**
> _(ta bort)_

**Punkter – nu:**
> - Intensiv reparation av celler och vävnad
> - Ämne som stärker hjärnans funktion ökar
> - Tillväxthormon upp till 5x normalt
> - Oxidativ stress minskar

**Punkter – ny text:**
> _(ta bort)_

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Intensiv vävnadsreparation, BDNF-ökning, ett femfaldigt hormonvärde och mindre oxidativ stress är inte belagda som generella 24-timmarsvinster. BDNF är inte ett direkt test av hjärnfunktion. I granskningen hittades inget tillräckligt sammanställt människounderlag för den exakta oxidativa effekten vid 24 timmar. Förslag: ta bort rutan, inte dess ID i kunskapsbasen. Om den senare ersätts av allmän information behöver även ordet 'fördelar' och upplåsningsformen ändras; enbart ordet 'kan' räcker inte.

**Människor och ungefärlig tid:** Människor: hormoner och ketoner kan förändras under första dygnet. Ingen validerad 24-timmarsgräns för intensiv autofagi, femfaldigt tillväxthormon, muskelskydd, BDNF-ökning eller mindre oxidativ stress. Studier av blodmarkörer och djurmekanismer fastställer inte klinisk nytta i hela kroppen.

**Evidensstyrka:** Svag/saknas för utlovade individuella effekter vid angiven tid.

**Källor för förslag och bedömning:** [F3: Bensalem m.fl. 2025](#f3); [F5: Horne m.fl. 2025](#f5); [F6: Alkurd m.fl. 2024](#f6); [F9: Semnani-Azad m.fl. 2025](#f9).

---

### fordel.36h
- **Var i appen:** Timer → fördelar som låses upp vid 36 h
- **Status:** förslag

**Rubrik – nu:**
> Djup fettförbränning

**Rubrik – ny text:**
> _(ta bort)_

**Punkter – nu:**
> - Fettbränslenivån är på topp
> - Ny cellbildning kan ha startat
> - Kroppens gener aktiverar reparations- och skyddsläge

**Punkter – ny text:**
> _(ta bort)_

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Ingen fastställd toppnivå för ketoner, början på ny cellbildning eller mätbart allmänt reparationsläge vid 36 timmar. Mekanistiska hypoteser ska inte presenteras som upplåsta vinster. Förslag: ta bort rutan, inte dess ID i kunskapsbasen. Om den senare ersätts av allmän information behöver även ordet 'fördelar' och upplåsningsformen ändras; enbart ordet 'kan' räcker inte.

**Människor och ungefärlig tid:** Människor: ketoner kan fortsätta öka över flera dygn; 36 timmar är ingen allmän topp. Cellbildning förekommer även utan fasta. Det finns ingen fastställd tid för en fasteutlöst acceleration av cellförnyelse eller ett kliniskt gynnsamt 'reparations- och skyddsläge'.

**Evidensstyrka:** Svag/saknas för utlovade individuella effekter vid angiven tid.

**Källor för förslag och bedömning:** [F2: Herman m.fl. 2025](#f2); [F13: Klionsky m.fl. 2021](#f13).

---

### fordel.48h
- **Var i appen:** Timer → fördelar som låses upp vid 48 h
- **Status:** förslag

**Rubrik – nu:**
> Immunförnyelse inledd

**Rubrik – ny text:**
> _(ta bort)_

**Punkter – nu:**
> - Gamla immunceller bryts ner
> - Nya immunceller bildas från stamceller
> - Kroppens tillväxtsignal pausas för djupare reparation

**Punkter – ny text:**
> _(ta bort)_

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Stamcellsfynd i möss och pilotdata vid cancerbehandling visar inte att appanvändarens gamla immunceller nu ersätts. 'Pausad tillväxtsignal' är dessutom en alltför grov beskrivning. Förslag: ta bort rutan, inte dess ID i kunskapsbasen. Om den senare ersätts av allmän information behöver även ordet 'fördelar' och upplåsningsformen ändras; enbart ordet 'kan' räcker inte.

**Människor och ungefärlig tid:** Människor: ingen belagd 48-timmarsgräns för immunförnyelse eller en pausad tillväxtsignal. Hormonella signaler kan förändras, men det bevisar inte djupare reparation. Regenerationsfynden är framför allt från djur och kan inte få en mänsklig timgräns genom direkt överföring.

**Evidensstyrka:** Svag/saknas för utlovade individuella effekter vid angiven tid.

**Källor för förslag och bedömning:** [F4: Cheng m.fl. 2014](#f4); [F2: Herman m.fl. 2025](#f2).

---

### fordel.72h
- **Var i appen:** Timer → fördelar som låses upp vid 72 h
- **Status:** förslag

**Rubrik – nu:**
> Systemreset uppnått

**Rubrik – ny text:**
> _(ta bort)_

**Punkter – nu:**
> - Komplett förnyelse av immunsystemet
> - Kroppen bildar nya energifabriker i cellerna
> - Maximal cellstädning och reparation

**Punkter – ny text:**
> _(ta bort)_

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Komplett immunförnyelse, nya mitokondrier och maximal cellreparation saknar tillräckligt kliniskt stöd vid denna tid. En uppnådd tidsgräns bevisar inte någon av effekterna. Förslag: ta bort rutan, inte dess ID i kunskapsbasen. Om den senare ersätts av allmän information behöver även ordet 'fördelar' och upplåsningsformen ändras; enbart ordet 'kan' räcker inte.

**Människor och ungefärlig tid:** Människor: ingen fastställd tid för komplett immunförnyelse, maximal cellstädning, topp i stamcellsaktivitet eller nya och effektivare mitokondrier. Djur- och mekanismdata visar inte att dessa hälsovinster uppnås efter tre dygn.

**Evidensstyrka:** Svag/saknas för utlovade individuella effekter vid angiven tid.

**Källor för förslag och bedömning:** [F4: Cheng m.fl. 2014](#f4); [F11: Ezpeleta m.fl. 2024](#f11); [F13: Klionsky m.fl. 2021](#f13).

---

## Scheman (PRESETS)

### schema.∞
- **Var i appen:** Timer → välj schema "∞" (Löpande)
- **Status:** förslag

**Etikett – nu:**
> Löpande

**Etikett – ny text:**
> Utan sluttid

**Beskrivning – nu:**
> Ingen tidsgräns — fastan löper tills du väljer att avsluta. Perfekt för att lyssna på kroppen.

**Beskrivning – ny text:**
> Timern saknar en förinställd sluttid och avslutas av dig. Det betyder inte att obegränsad fasta är säker.

**Punkter – nu:**
> - Flexibelt
> - Inga tidskrav
> - Följ kroppen

**Punkter – ny text:**
> - Ingen förinställd sluttid
> - Avslutas manuellt

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Ta bort 'perfekt' och 'följ kroppen' som säkerhetsargument. Funktionsbeskrivningen kommer från befintligt underlag; ingen kod har lästs. Att må bra är ingen validerad kontroll av alla risker. Begränsat säkerhetsunderlag [F12] motiverar försiktighet, inte ett påstående att varje längre fasta skadar.

**Människor och ungefärlig tid:** Ingen medicinskt validerad obegränsad fastetid finns i underlaget. Timerns inställning ger ingen information om individuell säkerhet.

**Evidensstyrka:** Svag för säkerheten vid obegränsad fasta; tidsfunktionen är ingen medicinsk effekt.

**Källor för förslag och bedömning:** [F12: Garegnani m.fl. 2026](#f12); [F11: Ezpeleta m.fl. 2024](#f11).

---

### schema.16:8
- **Var i appen:** Timer → välj schema "16:8" (Klassikern)
- **Status:** förslag

**Etikett – nu:**
> Klassikern

**Etikett – ny text:**
> 8 timmars ätfönster

**Beskrivning – nu:**
> Det perfekta startläget. Aktiverar fettförbränning och tidig ketos. De flesta sover 8 av dessa timmar.

**Beskrivning – ny text:**
> 16 timmar utan mat och ett ätfönster på 8 timmar per dygn. Schemat beskriver när du äter, inte vilka hälsoeffekter du får.

**Punkter – nu:**
> - Fettförbränning
> - Bättre blodsockerkontroll
> - Vardagsvänlig

**Punkter – ny text:**
> - 16 timmars fasta
> - 8 timmars ätfönster

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** 'Perfekta startläget', garanterad ketos och bättre blodsockerkontroll tas bort. Sömnlängden är individuell. Samlade studier visar inte en tillförlitlig rangordning där kortare ätfönster alltid är bättre. Tid på dygnet, energiintag och population påverkar tolkningen.

**Människor och ungefärlig tid:** Människor: schemats timmar eller antal måltider är en definition. Metabola resultat i översikterna gäller upprepade kostupplägg under veckor eller månader, inte utlovade effekter efter dagens sista fastetimme. Ingen säker tidpunkt eller rangordning för fettförlust, autofagi, fokus eller inflammation kan anges för just detta schema.

**Evidensstyrka:** Måttlig för vissa effekter av återkommande tidsbegränsat ätande i studier; svag för schemats ursprungliga specifika löften.

**Källor för förslag och bedömning:** [F9: Semnani-Azad m.fl. 2025](#f9); [F10: Chen m.fl. 2026](#f10).

---

### schema.18:6
- **Var i appen:** Timer → välj schema "18:6" (Effektiv)
- **Status:** förslag

**Etikett – nu:**
> Effektiv

**Etikett – ny text:**
> 6 timmars ätfönster

**Beskrivning – nu:**
> Djupare fettförbränning och cellstädning aktiveras med bara två extra timmar.

**Beskrivning – ny text:**
> 18 timmar utan mat och ett ätfönster på 6 timmar per dygn. Schemat beskriver när du äter, inte vilka hälsoeffekter du får.

**Punkter – nu:**
> - Djupare fettförbränning
> - Bättre fokus
> - Minskad inflammation

**Punkter – ny text:**
> - 18 timmars fasta
> - 6 timmars ätfönster

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Två extra timmar har inte visats ge en särskild cellstädningsfas. Bättre fokus och minskad inflammation kan inte lovas för detta schema. Samlade studier visar inte en tillförlitlig rangordning där kortare ätfönster alltid är bättre. Tid på dygnet, energiintag och population påverkar tolkningen.

**Människor och ungefärlig tid:** Människor: schemats timmar eller antal måltider är en definition. Metabola resultat i översikterna gäller upprepade kostupplägg under veckor eller månader, inte utlovade effekter efter dagens sista fastetimme. Ingen säker tidpunkt eller rangordning för fettförlust, autofagi, fokus eller inflammation kan anges för just detta schema.

**Evidensstyrka:** Måttlig för vissa effekter av återkommande tidsbegränsat ätande i studier; svag för schemats ursprungliga specifika löften.

**Källor för förslag och bedömning:** [F9: Semnani-Azad m.fl. 2025](#f9); [F10: Chen m.fl. 2026](#f10); [F7: Bamberg & Moreau 2025](#f7); [F8: Khalafi m.fl. 2025](#f8); [F3: Bensalem m.fl. 2025](#f3); [F13: Klionsky m.fl. 2021](#f13).

---

### schema.20:4
- **Var i appen:** Timer → välj schema "20:4" (Kraftfull)
- **Status:** förslag

**Etikett – nu:**
> Kraftfull

**Etikett – ny text:**
> 4 timmars ätfönster

**Beskrivning – nu:**
> Warrior Diet — fyra timmars ätfönster ger kroppen lång tid för fettförbränning och cellreparation.

**Beskrivning – ny text:**
> 20 timmar utan mat och ett ätfönster på 4 timmar per dygn. Schemat beskriver när du äter, inte vilka hälsoeffekter du får.

**Punkter – nu:**
> - Intensiv fettförbränning
> - Cellstädning aktiveras
> - Mental skärpa

**Punkter – ny text:**
> - 20 timmars fasta
> - 4 timmars ätfönster

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** 'Kraftfull', intensiv fettförbränning, aktiverad cellstädning och mental skärpa tas bort. 'Warrior Diet' behövs inte som synonym för ett neutralt 20:4-schema. Samlade studier visar inte en tillförlitlig rangordning där kortare ätfönster alltid är bättre. Tid på dygnet, energiintag och population påverkar tolkningen.

**Människor och ungefärlig tid:** Människor: schemats timmar eller antal måltider är en definition. Metabola resultat i översikterna gäller upprepade kostupplägg under veckor eller månader, inte utlovade effekter efter dagens sista fastetimme. Ingen säker tidpunkt eller rangordning för fettförlust, autofagi, fokus eller inflammation kan anges för just detta schema.

**Evidensstyrka:** Måttlig för vissa effekter av återkommande tidsbegränsat ätande i studier; svag för schemats ursprungliga specifika löften.

**Källor för förslag och bedömning:** [F9: Semnani-Azad m.fl. 2025](#f9); [F10: Chen m.fl. 2026](#f10); [F7: Bamberg & Moreau 2025](#f7); [F8: Khalafi m.fl. 2025](#f8); [F3: Bensalem m.fl. 2025](#f3); [F13: Klionsky m.fl. 2021](#f13).

---

### schema.OMAD
- **Var i appen:** Timer → välj schema "OMAD" (Maximalt)
- **Status:** förslag

**Etikett – nu:**
> Maximalt

**Etikett – ny text:**
> En måltid om dagen

**Beskrivning – nu:**
> One Meal A Day. Kroppen spenderar nästan hela dygnet i fasta för maximala effekter.

**Beskrivning – ny text:**
> OMAD betyder att dagens mat äts vid en måltid. Det finns inte tillräckligt stöd för att kalla uppläggets effekter maximala.

**Punkter – nu:**
> - Max fettförbränning
> - Djup cellstädning
> - Förenklat ätande

**Punkter – ny text:**
> - En måltid per dag
> - Ingen fastställd överlägsen hälsoeffekt

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Behåll definitionen; ta bort maximal fettförbränning, djup cellstädning och antagandet att upplägget är enklare för alla. Resultat för grupper av korta ätfönster bevisar inte att en enda måltid är bäst. Ingen robust direkt jämförelse som motiverar 'maximalt' identifierades.

**Människor och ungefärlig tid:** Människor: schemats timmar eller antal måltider är en definition. Metabola resultat i översikterna gäller upprepade kostupplägg under veckor eller månader, inte utlovade effekter efter dagens sista fastetimme. Ingen säker tidpunkt eller rangordning för fettförlust, autofagi, fokus eller inflammation kan anges för just detta schema.

**Evidensstyrka:** Svag för OMAD:s överlägsenhet; otillräcklig för cellstädningslöftet.

**Källor för förslag och bedömning:** [F9: Semnani-Azad m.fl. 2025](#f9); [F10: Chen m.fl. 2026](#f10); [F13: Klionsky m.fl. 2021](#f13).

---

### schema.36h
- **Var i appen:** Timer → välj schema "36h" (Avancerad)
- **Status:** förslag

**Etikett – nu:**
> Avancerad

**Etikett – ny text:**
> Ett och ett halvt dygn

**Beskrivning – nu:**
> Djup fettförbränning och aktiv cellförnyelse. Tillväxthormonet skjuter i höjden.

**Beskrivning – ny text:**
> 36 timmar utan mat. Diskutera ett sådant upplägg med vården innan du börjar.

**Punkter – nu:**
> - Djup ketos
> - Kraftigt tillväxthormon
> - Stark cellstädning

**Punkter – ny text:**
> - 36 timmars fasta
> - Planera med vården

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Skilj en enstaka 36-timmarsfasta från återkommande varannandagsfasta i studier. Tillväxthormon och ketoner bevisar inte cellreparation. Vårdhänvisningen är ett försiktighetsråd med hänsyn till begränsad överförbarhet från övervakade studier, inte en absolut kontraindikation för alla. Inga dosråd eller elektrolytrecept ges.

**Människor och ungefärlig tid:** Människor: ketoner kan fortsätta öka över flera dygn; 36 timmar är ingen allmän topp. Cellbildning förekommer även utan fasta. Det finns ingen fastställd tid för en fasteutlöst acceleration av cellförnyelse eller ett kliniskt gynnsamt 'reparations- och skyddsläge'.

**Evidensstyrka:** Svag för schemats särskilda hälsolöften och generell säkerhet vid egenanvändning.

**Källor för förslag och bedömning:** [F9: Semnani-Azad m.fl. 2025](#f9); [F11: Ezpeleta m.fl. 2024](#f11); [F5: Horne m.fl. 2025](#f5).

---

### schema.48h
- **Var i appen:** Timer → välj schema "48h" (Utmanare)
- **Status:** förslag

**Etikett – nu:**
> Utmanare

**Etikett – ny text:**
> Två dygn

**Beskrivning – nu:**
> Immunsystemets förnyelse startar — gamla immunceller byts ut mot nya.

**Beskrivning – ny text:**
> 48 timmar utan mat. Diskutera ett sådant upplägg med vården innan du börjar.

**Punkter – nu:**
> - Immunförnyelse
> - Ny cellbildning
> - Djup reparation

**Punkter – ny text:**
> - 48 timmars fasta
> - Planera med vården

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Ta bort immunförnyelse, ny cellbildning och djup reparation; granskade stamcellsdata ger inte stöd för schemats löften. Vårdhänvisningen är ett försiktighetsråd med hänsyn till begränsad överförbarhet från övervakade studier, inte en absolut kontraindikation för alla. Inga dosråd eller elektrolytrecept ges.

**Människor och ungefärlig tid:** Människor: ingen belagd 48-timmarsgräns för immunförnyelse eller en pausad tillväxtsignal. Hormonella signaler kan förändras, men det bevisar inte djupare reparation. Regenerationsfynden är framför allt från djur och kan inte få en mänsklig timgräns genom direkt överföring.

**Evidensstyrka:** Svag för schemats särskilda hälsolöften och generell säkerhet vid egenanvändning.

**Källor för förslag och bedömning:** [F4: Cheng m.fl. 2014](#f4); [F11: Ezpeleta m.fl. 2024](#f11); [F12: Garegnani m.fl. 2026](#f12).

---

### schema.72h
- **Var i appen:** Timer → välj schema "72h" (Systemreset)
- **Status:** förslag

**Etikett – nu:**
> Systemreset

**Etikett – ny text:**
> Tre dygn

**Beskrivning – nu:**
> Tre dygn ger kroppen en djupgående omstart av immunsystem och cellförnyelse.

**Beskrivning – ny text:**
> 72 timmar utan mat. Diskutera ett sådant upplägg med vården innan du börjar.

**Punkter – nu:**
> - Komplett immunreset
> - Max cellförnyelse
> - Nya energifabriker i cellerna

**Punkter – ny text:**
> - 72 timmars fasta
> - Planera med vården

**Källor nu:** _(inga angivna)_

**Research-anteckning:**
**Bedömning:** Ta bort immunreset, maximal cellförnyelse och nya energifabriker. Tre dygn är ingen kliniskt fastställd gräns för dessa effekter. Vårdhänvisningen är ett försiktighetsråd med hänsyn till begränsad överförbarhet från övervakade studier, inte en absolut kontraindikation för alla. Inga dosråd eller elektrolytrecept ges.

**Människor och ungefärlig tid:** Människor: ingen fastställd tid för komplett immunförnyelse, maximal cellstädning, topp i stamcellsaktivitet eller nya och effektivare mitokondrier. Djur- och mekanismdata visar inte att dessa hälsovinster uppnås efter tre dygn.

**Evidensstyrka:** Svag för schemats särskilda hälsolöften och generell säkerhet vid egenanvändning.

**Källor för förslag och bedömning:** [F4: Cheng m.fl. 2014](#f4); [F11: Ezpeleta m.fl. 2024](#f11); [F12: Garegnani m.fl. 2026](#f12).

---

## Gemensam research-anteckning – fullständiga källor

<a id="f1"></a>

#### F1 – Anton m.fl. 2018

Anton SD m.fl. (2018). *Flipping the Metabolic Switch: Understanding and Applying the Health Benefits of Fasting*. Obesity 26(2):254–268. DOI: 10.1002/oby.22065. [Artikel](https://onlinelibrary.wiley.com/doi/10.1002/oby.22065). Narrativ översikt med både djur- och människodata; fysiologiavsnitt kontrollerade. Används för etablerade grundprocesser, inte för kliniska hälsolöften eller exakta individtider.

<a id="f2"></a>

#### F2 – Herman m.fl. 2025

Herman R, Trsan J, Lipar L, Jensterle M, Janez A (2025). *Endocrine Adaptations to Prolonged Fasting: From Physiology, Clinical Uncertainties, Translational Challenges to Healthspan Implications*. Nutrients 17(24):3949. DOI: 10.3390/nu17243949. [Fulltext](https://pmc.ncbi.nlm.nih.gov/articles/PMC12736288/). Strukturerad narrativ översikt, inte metaanalys. Relevanta fysiologi- och begränsningsavsnitt lästa. Små, heterogena människostudier begränsar slutsatser om hormontrösklar och klinisk nytta.

<a id="f3"></a>

#### F3 – Bensalem m.fl. 2025

Bensalem J, Teong XT, Hattersley KJ m.fl. (2025). *Intermittent time-restricted eating may increase autophagic flux in humans: an exploratory analysis*. The Journal of Physiology 603(10):3019–3032. DOI: 10.1113/JP287938. [Fulltext](https://physoc.onlinelibrary.wiley.com/doi/10.1113/JP287938). Metod, resultat och begränsningar lästa. Explorativ delstudie med 121 deltagare, mätningar i vissa blodceller efter två och sex månader. Gruppskillnad mot standardråd vid sex månader (parvis p=0,04; övergripande grupptest p=0,15), men ingen säker ökning inom fastegruppen. Detta är inte en kartläggning av när autofagi startar under ett fastedygn. Används endast för att granska det nya fyndets räckvidd; inget apppåstående om en ökning grundas på denna enskilda studie.

<a id="f4"></a>

#### F4 – Cheng m.fl. 2014

Cheng CW, Adams GB, Perin L m.fl. (2014). *Prolonged Fasting Reduces IGF-1/PKA to Promote Hematopoietic-Stem-Cell-Based Regeneration and Reverse Immunosuppression*. Cell Stem Cell 14(6):810–823. DOI: 10.1016/j.stem.2014.04.014. [Fulltext](https://pmc.ncbi.nlm.nih.gov/articles/PMC4102383/). Relevanta djur- och människodelar kontrollerade. Stamcells- och föryngringsresultat huvudsakligen från möss, fasta/återätning och cytostatika; människodelen var en tidig genomförbarhets-/säkerhetsstudie vid cancerbehandling. Källan spårar bakgrunden till påståendet; den används inte som bevis för immunförnyelse hos appanvändare.

<a id="f5"></a>

#### F5 – Horne m.fl. 2025

Horne BD, Anderson JL, May HT m.fl. (2025). *Weight loss-independent changes in human growth hormone during water-only fasting: a secondary evaluation of a randomized controlled trial*. Frontiers in Endocrinology 15:1401780. DOI: 10.3389/fendo.2024.1401780. [Artikel](https://www.frontiersin.org/journals/endocrinology/articles/10.3389/fendo.2024.1401780/full). Publicerad 2025 trots 2024 i DOI/volym. Metod- och resultatutdrag kontrollerade; 30 personer, sekundäranalys. Relativa hormonförändringar varierar och påverkas av utgångsnivån. Inget generellt femfaldigt värde eller bevis för bevarad muskelmassa kan utläsas. Enskild liten studie används enbart för källkritik.

<a id="f6"></a>

#### F6 – Alkurd m.fl. 2024

Alkurd R, Mahrous L, Zeb F m.fl. (2024). *Effect of Calorie Restriction and Intermittent Fasting Regimens on Brain-Derived Neurotrophic Factor Levels and Cognitive Function in Humans: A Systematic Review*. Medicina 60(1):191. DOI: 10.3390/medicina60010191. [Artikel](https://pmc.ncbi.nlm.nih.gov/articles/PMC10819730/). Abstract, bibliografi och relevanta resultat kontrollerade. Sexton studier; BDNF ökade i fem, minskade i fem och var oförändrat i sex. Olika upplägg och populationer; blodnivåer är inte en direkt mätning av hjärnfunktion. Inte stöd för en ökning vid 24 timmar.

<a id="f7"></a>

#### F7 – Bamberg & Moreau 2025

Bamberg C, Moreau D (2025). *Acute effects of fasting on cognitive performance: A systematic review and meta-analysis*. Psychological Bulletin 151(9):1147–1169. DOI: 10.1037/bul0000492. [PubMed](https://pubmed.ncbi.nlm.nih.gov/41182703/), [förlagets artikel](https://www.apa.org/pubs/journals/releases/bul-bul0000492.pdf). Abstract och tillgängliga slutsatsutdrag lästa, inte varje ingående försök. 3 484 deltagare; medianfastan var tolv timmar. Ingen meningsfull genomsnittlig skillnad i kognitiv prestation. Detta visar varken garanterat bättre fokus eller säker prestation efter två–tre dygn.

<a id="f8"></a>

#### F8 – Khalafi m.fl. 2025

Khalafi M, Maleki AH, Mojtahedi S m.fl. (2025). *The Effects of Intermittent Fasting on Inflammatory Markers in Adults: A Systematic Review and Pairwise and Network Meta-Analyses*. Nutrients 17(15):2388. DOI: 10.3390/nu17152388. [Fulltext](https://pmc.ncbi.nlm.nih.gov/articles/PMC12348594/). Abstract, metod och relevanta resultat lästa. 21 studier, 839 deltagare; både randomiserade och icke-randomiserade försök. Vissa markörer förbättrades, andra inte. Resultat för upprepade kostupplägg får inte översättas till en säker inflammationsminskning efter tolv timmar.

<a id="f9"></a>

#### F9 – Semnani-Azad m.fl. 2025

Semnani-Azad Z, Khan TA, Chiavaroli L m.fl. (2025). *Intermittent fasting strategies and their effects on body weight and other cardiometabolic risk factors: systematic review and network meta-analysis of randomised clinical trials*. BMJ 389:e082007. DOI: 10.1136/bmj-2024-082007. [Artikel](https://www.bmj.com/content/389/bmj-2024-082007). Abstract, relevant metod och resultat kontrollerade. 99 randomiserade studier med 6 582 vuxna. Små skillnader mot kontinuerlig energirestriktion; en viss genomsnittlig viktfördel för varannandagsfasta. Visar inte att varje längre fasta är bättre eller att en enskild 36-timmarsfasta ger samma resultat som ett behandlingsprogram.

<a id="f10"></a>

#### F10 – Chen m.fl. 2026

Chen YE, Tsai HL, Tu YK, Chen LW (2026). *Effects of timing and eating duration of time restricted eating on metabolic outcomes: systematic review and network meta-analysis*. BMJ Medicine 5:e001071. DOI: 10.1136/bmjmed-2024-001071. [PubMed](https://pubmed.ncbi.nlm.nih.gov/41586347/), [förlagets artikel](https://bmjmedicine.bmj.com/content/5/1/e001071). 41 randomiserade studier, 2 287 deltagare. Abstract och indexerade metod-/slutsatsutdrag kontrollerade; direktöppning av fulltext blockerades. Tidigare ätfönster hade vissa fördelar, men resultaten för ätfönstrets längd var inkonsekventa. Sökningen slutade 3 januari 2023: publikationsåret 2026 betyder inte att underlaget omfattar studier till 2026.

<a id="f11"></a>

#### F11 – Ezpeleta m.fl. 2024

Ezpeleta M, Cienfuegos S, Lin S, Pavlou V, Gabel K, Varady KA (2024; online 2023). *Efficacy and safety of prolonged water fasting: a narrative review of human trials*. Nutrition Reviews 82(5):664–675. DOI: 10.1093/nutrit/nuad081. [PubMed](https://pubmed.ncbi.nlm.nih.gov/37377031/). Referens och abstract kontrollerade. Narrativ sammanställning med begränsade människodata, inte stark evidens för egenstyrd flerdygnsfasta. Resultat från längre eller övervakade upplägg är indirekta för appens scheman; ingen exakt risk eller säker tidsgräns hämtas härifrån.

<a id="f12"></a>

#### F12 – Garegnani m.fl. 2026

Garegnani LI, Oltra G, Ivaldi D m.fl. (2026). *Intermittent fasting for adults with overweight or obesity*. Cochrane Database of Systematic Reviews, Issue 2, CD015610. DOI: 10.1002/14651858.CD015610.pub2. [Cochrane](https://www.cochrane.org/evidence/CD015610_intermittent-fasting-traditional-dietary-advice-or-no-treatment-which-works-better-help-adults). Offentlig sammanfattning, sökdatum och begränsningar kontrollerade i uppdrag 1. 22 randomiserade studier, 1 995 vuxna; evidensen om oönskade händelser mycket osäker. Sökstopp 5 november 2024, uppföljning högst tolv månader. Inte underlag för obegränsad fasta.

<a id="f13"></a>

#### F13 – Klionsky m.fl. 2021

Klionsky DJ, Abdel-Aziz AK, Abdelfatah S m.fl. (2021). *Guidelines for the use and interpretation of assays for monitoring autophagy (4th edition)*. Autophagy 17(1):1–382. DOI: 10.1080/15548627.2020.1797280. [PubMed](https://pubmed.ncbi.nlm.nih.gov/33634751/). Referens och abstract kontrollerade; hela det omfattande metodverket har inte lästs. Metodriktlinje om mätning och tolkning, inte en klinisk fastemanual. Används tillsammans med [F3] för att skilja mätningar av autofagi från antaganden utifrån en klocka.

