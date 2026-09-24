# Fastefaser, fördelar och scheman

Kod: `js/data.js` → `PH`, `BENEFITS`, `PRESETS`

Texterna på **Timer**-sidan: fasen du är i, fördelarna som låses upp och beskrivningen av varje fasteschema.

Se [README.md](README.md) för hur filen används.

---

## Sammanfattning från Cowork (uppdrag 2, 2026-09-24)

- **Det som stämmer:** grundförloppet – socker från maten → leverns sockerlager → mer fett som bränsle → ketoner. Tidsgränserna varierar mycket mellan personer (omställningen sker ofta mellan 12 och 36 h).
- **Det som var överdrivet eller fel:** ketos "till stor del" vid 16 h, ketontopp vid 36 h, tillväxthormon "5 gånger" vid 24 h, BDNF och skärpt fokus, minskad inflammation vid 12 h, autofagi vid exakta tidpunkter, och allt om immunförnyelse, stamceller och nya mitokondrier vid 48–72 h. Det sista bygger på musförsök.
- **Nytt som talar emot tidigare texter:** långa fastor (ca 10 dygn) kan *öka* inflammationsmarkörer, och en stor del av viktnedgången vid långa fastor är muskler och annan fettfri vävnad.
- **Scheman:** den starkaste nya evidensen (BMJ 2025, nätverksmetaanalys) visar att 16:8 och andra fastemetoder ger ungefär samma viktnedgång som att äta mindre, utan extra effekt på blodsocker eller hjärt-kärlmarkörer. Därför tas påståenden om att längre scheman är "effektivare" bort.
- **Faser som byter namn:** Tidig ketos → Lätt ketos, Aktiv autofagi → Ett dygn, Djup ketos → Ketos, Cellförnyelse → Två dygn, Systemreset → Tre dygn. Schemaetiketter: Effektiv → Lite längre, Kraftfull → Kort ätfönster, Maximalt → En måltid, Systemreset → Tre dygn.
- **Efter jämförelse med Codex:** två källor tillagda (R14 kognition, R15 tidigt ätfönster), en mening om att timern bara är en uppskattning, och rättat förstaförfattare för R6. Se `docs/jamforelse/uppdrag-2.md`.
- **Beslut (2026-09-24, Anton bad Cowork färdigställa):** (1) Fördelslistorna behålls men beskriver vad som händer, inklusive vanliga besvär; rubrikerna i historiken byts, se `ui.effekter`. (2) 72-timmarsschemat behålls med hänvisning till vården. Kan ändras senare.

---

## Faser (PH)

### fas.0h
- **Var i appen:** Timer → fasen "Matsmältning" (från 0 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Matsmältning

**Rubrik – ny text:**
> _(ingen ändring)_

**Kort text – nu:**
> Kroppen bryter ner maten och tar upp näring. Blodsockret är förhöjt och kroppen lagrar överskott.

**Kort text – ny text:**
> _(ingen ändring)_

**Lång text – nu:**
> Blodsockret stiger → kroppen frisätter insulin (ett hormon som hjälper cellerna att ta upp socker) → socker lagras som glykogen (kroppens korttidslager av socker) i levern och musklerna. Fett från maten lagras i fettvävnaden.

**Lång text – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Bedömning:** Stämmer i stort (grundläggande fysiologi). Justering: hos människor blir socker från maten bara i liten utsträckning till fett; det mesta fett som lagras kommer från fett i maten. Därför ändrad formulering.
- **Evidens:** Stark (lärobokskunskap). Källa: Cahill 2006, se källförteckningen [R2].

---

### fas.4h
- **Var i appen:** Timer → fasen "Tidig fasta" (från 4 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Tidig fasta

**Rubrik – ny text:**
> _(ingen ändring)_

**Kort text – nu:**
> Det mesta av maten är nu uppsugen. Kroppen börjar använda sitt sockerlager (glykogen) som bränsle.

**Kort text – ny text:**
> _(ingen ändring)_

**Lång text – nu:**
> Levern bryter ner sitt glykogenlager och skickar socker till blodet för att hålla energin stabil. Insulinnivån börjar sjunka. Kroppen förbereder sig för att byta bränsle från mat till egna lager.

**Lång text – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Bedömning:** Stämmer. Liten ändring: "Matsmältningen är klar" var för absolut – magsäcken töms ofta på 2–4 timmar, men upptaget i tarmen kan pågå längre efter en stor måltid.
- **Evidens:** Stark (grundläggande fysiologi) [R2].

---

### fas.12h
- **Var i appen:** Timer → fasen "Fettförbränning" (från 12 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Mer fett som bränsle

**Rubrik – ny text:**
> _(ingen ändring)_

**Kort text – nu:**
> Levern har använt en stor del av sitt sockerlager. Kroppen hämtar allt mer energi från fett, och små mängder ketoner börjar bildas.

**Kort text – ny text:**
> _(ingen ändring)_

**Lång text – nu:**
> Kroppen frigör fett från fettcellerna (lipolys – kroppens sätt att plocka ut fett som bränsle). Levern gör om en del av fettet till ketoner, ett reservbränsle som hjärnan och musklerna kan använda. När omställningen sker varierar mycket, ofta någonstans mellan 12 och 36 timmar, beroende på vad du ätit och hur aktiv du varit. Timern visar en uppskattning, inte vad som faktiskt händer i just din kropp.

**Lång text – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Bedömning:** Delvis överdrivet. "Ökar fettförbränningen markant" och att sockerlagren "tar slut" vid 12 h stämmer inte för alla – omställningen ("metabolic switch") sker enligt översikten Anton m.fl. 2018 vanligen mellan 12 och 36 h. Levern är inte tom förrän efter 2–3 dygn enligt Cahill 2006.
- **Borttaget:** "Tillväxthormon börjar stiga" – stödet gäller fastor på flera dygn i små studier (se fas.24h), inte 12 h.
- **Evidens:** Måttlig–stark för tidsspannet 12–36 h (översiktsartiklar) [R1, R2].

---

### fas.16h
- **Var i appen:** Timer → fasen "Tidig ketos" (från 16 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Lätt ketos

**Rubrik – ny text:**
> _(ingen ändring)_

**Kort text – nu:**
> Ketonerna i blodet ökar, men nivåerna är fortfarande låga. Kroppen använder allt mer fett som bränsle.

**Kort text – ny text:**
> _(ingen ändring)_

**Lång text – nu:**
> Ketoner (kroppens reservbränsle av fett) börjar stiga i blodet, men den verkliga ketosen kommer först efter något eller några dygn. I djurstudier ökar cellernas städprocess (autofagi) vid fasta, där cellerna bryter ner och återvinner gamla delar. Hos människor är autofagi svår att mäta, och man vet ännu inte säkert när eller hur mycket den ökar.

**Lång text – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Bedömning:** Överdrivet. "Kör nu till stor del på ketoner" och "hjärnan byter bränsle" stämmer inte vid 16 h. Enligt Cahill 2006 och Fazeli & Steinhauser 2025 kommer tydlig ketonbildning efter ungefär ett dygn, och hjärnan får stora delar av sin energi från ketoner först efter flera dagar till veckor.
- **Autofagi:** "Autofagi startar" vid en exakt tid saknar stöd hos människor. Nästan all forskning är gjord på djur och celler. Hos människor finns bara ett fåtal små, utforskande studier (t.ex. Bensalem m.fl. 2025, J Physiol, som själva kallar sin analys "exploratory"), och forskare beskriver mätbarheten som ett stort hinder (Bensalem m.fl. 2021, Trends Mol Med) [R11].
- **Rubrik:** "Tidig ketos" → "Lätt ketos", eftersom nivåerna är låga.
- **Evidens:** Stark för att ketoner är låga vid 16 h; svag för autofagi hos människor.

---

### fas.24h
- **Var i appen:** Timer → fasen "Aktiv autofagi" (från 24 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Ett dygn

**Rubrik – ny text:**
> _(ingen ändring)_

**Kort text – nu:**
> Ketonerna fortsätter att stiga och kroppen hämtar allt mer energi från fett. Hunger kommer ofta i vågor, och en del får huvudvärk.

**Kort text – ny text:**
> _(ingen ändring)_

**Lång text – nu:**
> Efter ungefär ett dygn bildar levern tydligt mer ketoner, som hjärnan och musklerna kan använda. I små studier ökar tillväxthormonet under fastor på flera dygn, samtidigt som kroppen sänker tillväxtsignalen IGF-1 för att spara energi. Ämnet BDNF, som har med minne och inlärning att göra, har i studier på människor ibland ökat, ibland minskat och ibland inte förändrats. Drick vatten och avbryt fastan om du blir yr eller mår dåligt.

**Lång text – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Bedömning:** Flera påståenden saknar stöd och tas bort eller mildras.
- **"Tillväxthormon upp till 5 gånger högre":** Siffran kommer från mycket små studier. Ho m.fl. 1988 (JCI 81:968–975) studerade **6 män** under en **5-dygnsfasta**; integrerat tillväxthormon steg ungefär 3 gånger (2,82 → 8,75 µg·min/ml) – alltså inte 5 gånger och inte efter 24 h. Enligt användarens regel om att inte bygga på enskilda små studier tas siffran bort. Fazeli & Steinhauser 2025 (Endocr Rev) bekräftar mönstret: tillväxthormonet är normalt eller förhöjt vid fasta medan IGF-1 sjunker [R3, R5].
- **"Vilket skyddar muskelmassa":** Borttaget. Vid längre fastor förloras en betydande del muskler och annan fettfri vävnad (Ezpeleta m.fl. 2024: ungefär två tredjedelar av viktnedgången vid 5–20 dygns fasta var fettfri massa) [R9].
- **"Ämne i hjärnan som stärker minne ökar – skärpt fokus":** Systematisk översikt (Alkurd m.fl. 2024, 16 studier på människor): BDNF ökade i 5, minskade i 5 och var oförändrat i 6 studier. Stödet för en ökning saknas [R6].
- **Huvudvärk och hunger:** Vanliga biverkningar enligt Ezpeleta m.fl. 2024 [R9].
- **Rubrik:** "Aktiv autofagi" → "Ett dygn", eftersom autofagi vid 24 h inte är visat hos människor (se fas.16h).

---

### fas.36h
- **Var i appen:** Timer → fasen "Djup ketos" (från 36 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Ketos

**Rubrik – ny text:**
> _(ingen ändring)_

**Kort text – nu:**
> Kroppen får nu en stor del av sin energi från fett och ketoner.

**Kort text – ny text:**
> _(ingen ändring)_

**Lång text – nu:**
> Ketonerna fortsätter att stiga i flera dagar och når sin högsta nivå först efter en till två veckors fasta. Påståenden om att nya celler bildas eller att generna ställer om till "reparationsläge" vid den här tiden bygger främst på djurstudier. Vid längre fastor bryter kroppen också ner en del muskler, så en del av viktnedgången är inte fett.

**Lång text – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Bedömning:** "Ketonerna är på sin högsta nivå" vid 36 h är fel. Cahill 2006: vuxna når i genomsnitt 4–7 mmol/l först efter ungefär två veckors fasta [R2].
- **"Kroppen kan börja bilda nya celler" / "genernas aktivitetsmönster skiftar mot reparation":** Inget stöd hos människor vid 36 h; bygger på djurförsök och cellstudier. Borttaget som påstående och förklarat i texten.
- **Muskelförlust:** Ezpeleta m.fl. 2024 [R9].
- **Rubrik:** "Djup ketos" → "Ketos".
- **Evidens:** Stark för ketontidslinjen (klassisk fysiologi).

---

### fas.48h
- **Var i appen:** Timer → fasen "Cellförnyelse" (från 48 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Två dygn

**Rubrik – ny text:**
> _(ingen ändring)_

**Kort text – nu:**
> Fett och ketoner är nu kroppens huvudbränsle. Så långa fastor passar bara friska vuxna, och helst efter att du pratat med vården.

**Kort text – ny text:**
> _(ingen ändring)_

**Lång text – nu:**
> Tillväxtsignalen IGF-1 sjunker, vilket är kroppens sätt att spara energi. I försök på möss har flera dygns fasta följt av vanlig mat satt igång nybildning av blodceller från stamceller, men det är inte visat hos friska människor. Under långa fastor kan salter som natrium sjunka i blodet. Vanliga besvär är huvudvärk, trötthet och sömnproblem.

**Lång text – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Bedömning:** "Immunsystemet förnyas", "gamla immunceller ersätts med nya" och "nya immunceller bildas från stamceller" saknar stöd hos människor. Påståendena kommer från Cheng m.fl. 2014 (Cell Stem Cell), där effekten visades i **möss** efter upprepade fastecykler och återuppfödning; människodelen var en liten fas 1-studie på cancerpatienter under cellgiftsbehandling [R12]. Borttaget som påstående om människor.
- **IGF-1 sjunker:** Stöds av Fazeli & Steinhauser 2025 [R3]. "Tillväxtsignalen pausas" är ungefär rätt men "möjliggör djupare cellreparation" är spekulativt – borttaget.
- **Salter och biverkningar:** Ezpeleta m.fl. 2024: sänkt natrium och klorid; huvudvärk, sömnproblem, hunger, muntorrhet och trötthet [R9].
- **Rubrik:** "Cellförnyelse" → "Två dygn".

---

### fas.72h
- **Var i appen:** Timer → fasen "Systemreset" (från 72 h). Kort text syns direkt, lång text när man fäller ut fasen.
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Tre dygn

**Rubrik – ny text:**
> _(ingen ändring)_

**Kort text – nu:**
> Kroppen har ställt om helt till fett och ketoner som bränsle. Fastor längre än så här bör bara göras under medicinsk övervakning.

**Kort text – ny text:**
> _(ingen ändring)_

**Lång text – nu:**
> Efter tre dygn får kroppen den allra största delen av sin energi från fett, och hjärnan använder allt mer ketoner. Påståenden om en "omstart" av immunsystemet, nya mitokondrier (cellernas energifabriker) eller maximal stamcellsaktivitet är inte visade hos människor. En studie av fastor på omkring tio dygn såg dessutom att inflammationsmarkörer i blodet ökade. Vill du fasta längre än tre dygn, gör det bara med stöd från vården.

**Lång text – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Bedömning:** Rubrik och text ("Systemreset", "immunsystemet genomgår en djupgående omstart", "nya, effektivare energifabriker", "stamcellsaktiviteten är på topp") saknar stöd hos människor och tas bort. Källan till idéerna är främst djurstudier (Cheng m.fl. 2014) [R12].
- **Inflammation vid lång fasta:** Commissati m.fl. 2025 (Mol Metab 96:102152): 20 personer, vattenfasta i ca 10 dygn – CRP (inflammationsmarkör) ökade med 129 %, bekräftat i en valideringskohort med 1 422 deltagare [R8]. Det talar emot att lång fasta generellt minskar inflammation.
- **Omställningen:** Cahill 2006; i en studie av 7 dygns fasta på 12 personer syntes omfattande förändringar i blodets proteiner först efter ca 3 dygn (Pietzner m.fl. 2024, Nat Metab 6:764–777) – liten studie, används inte som påstående i appen [R2, R13].
- **Rubrik:** "Systemreset" → "Tre dygn".

---

## Fördelar (BENEFITS)

### fordel.4h
- **Var i appen:** Timer → fördelar som låses upp vid 4 h
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Tidig fasta initierad

**Rubrik – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Insulinnivån sjunker
> - Sockerlagren börjar tömmas
> - Kroppen förbereder fettförbränning

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Bedömning:** Stämmer (grundläggande fysiologi) [R2].

---

### fordel.12h
- **Var i appen:** Timer → fördelar som låses upp vid 12 h
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Mer fett som bränsle

**Rubrik – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Kroppen använder allt mer fett som bränsle
> - Små mängder ketoner börjar bildas
> - Insulinnivån är låg

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Borttaget:** "Tillväxthormon stiger och skyddar muskler" (se fas.24h) och "Inflammationsnivån minskar". Den senaste metaanalysen (Khalafi m.fl. 2025, Nutrients, 21 studier, 839 deltagare) fann att periodisk fasta under **veckor till månader** gav en liten minskning av CRP och TNF-α, men att det inte gick att skilja effekten från viktnedgång. Det finns inget stöd för att inflammationen minskar efter 12 timmar [R7].
- **Tillagt:** "Insulinnivån är låg" – stämmer efter en natts fasta [R2].

---

### fordel.16h
- **Var i appen:** Timer → fördelar som låses upp vid 16 h
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Lätt ketos

**Rubrik – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Ketonerna i blodet börjar öka
> - Cellernas städprocess (autofagi) kan öka – visat i djur, osäkert hos människor
> - Tankeförmågan påverkas oftast inte av kortare fastor, men en del blir trötta eller får huvudvärk

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Bedömning:** "Hjärnan och kroppen drivs av fettbränsle" är överdrivet vid 16 h (se fas.16h). Autofagi hos människor är osäker [R11]. Upplevt fokus är subjektivt. Metaanalysen Bamberg & Moreau 2025 (Psychological Bulletin, 3 484 deltagare, medianfasta 12 h) fann ingen meningsfull genomsnittlig skillnad i kognitiv prestation – varken bättre eller sämre [R14, tillagd efter jämförelse med Codex]. Huvudvärk och trötthet är vanliga biverkningar [R9].

---

### fordel.24h
- **Var i appen:** Timer → fördelar som låses upp vid 24 h
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Ett dygn

**Rubrik – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Kroppen hämtar allt mer energi från fett
> - Ketonerna fortsätter att stiga
> - Tillväxthormonet ökar vid längre fastor

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Borttaget:** "Intensiv reparation av celler och vävnad" (inget stöd hos människor), "Ämne som stärker hjärnans funktion ökar" (BDNF, motstridiga resultat [R6]), "Tillväxthormon upp till 5x normalt" (små studier, fel tid [R5]) och "Oxidativ stress minskar" (inget stöd vid 24 h hos människor hittades).
- "Tillväxthormonet ökar vid längre fastor" stöds av Fazeli & Steinhauser 2025 och Ho m.fl. 1988 – utan siffra [R3, R5].

---

### fordel.36h
- **Var i appen:** Timer → fördelar som låses upp vid 36 h
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Ketos

**Rubrik – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Fett och ketoner är nu ett huvudbränsle
> - Ketonerna fortsätter att stiga i flera dagar

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Borttaget:** "Fettbränslenivån är på topp" (fel – toppen nås efter ca 2 veckor [R2]), "Ny cellbildning kan ha startat" och "Kroppens gener aktiverar reparations- och skyddsläge" (djurdata).

---

### fordel.48h
- **Var i appen:** Timer → fördelar som låses upp vid 48 h
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Två dygn

**Rubrik – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Tillväxtsignalen IGF-1 sjunker för att spara energi
> - Kroppen har ställt om till fett och ketoner
> - Vanliga besvär: huvudvärk, trötthet, sömnproblem

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Borttaget:** "Gamla immunceller bryts ner" och "Nya immunceller bildas från stamceller" (musdata, Cheng m.fl. 2014 [R12]).
- **Produktfråga till Anton:** Listan heter "fördelar". Att ta med vanliga besvär är ärligare men bryter mot rubriken. Alternativ: byt rubriken i appen till "Vad händer nu" för alla tidpunkter.

---

### fordel.72h
- **Var i appen:** Timer → fördelar som låses upp vid 72 h
- **Status:** inbyggd (2026-09-24)

**Rubrik – nu:**
> Tre dygn

**Rubrik – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Kroppen har ställt om helt till fett och ketoner
> - Hjärnan använder allt mer ketoner
> - Längre fastor bör göras under medicinsk övervakning

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Borttaget:** "Komplett förnyelse av immunsystemet", "Kroppen bildar nya energifabriker i cellerna" och "Maximal cellstädning och reparation" – inget stöd hos människor [R12]. Lång fasta kan tvärtom öka inflammationsmarkörer [R8].

---

### ui.effekter
- **Var i appen:** Historik → tryck på en fasta (detaljrutan). Rubrikerna ovanför fördelslistorna.
- **Status:** inbyggd (2026-09-24)

**Rubrik uppnått – nu:**
> Vad som hände i kroppen (uppskattat)

**Rubrik uppnått – ny text:**
> _(ingen ändring)_

**Rubrik ej uppnått – nu:**
> Händer vid längre fastor

**Rubrik ej uppnått – ny text:**
> _(ingen ändring)_

**Kort fasta – nu:**
> Fastan var kortare än 4 timmar.

**Kort fasta – ny text:**
> _(ingen ändring)_

**Källor nu:** –

**Research-anteckning (Cowork 2026-09-24):**
- Följer beslutet att fördelslistorna beskriver vad som händer, inte "effekter" eller "fördelar" som låses upp (Codex påpekade att upplåsta fördelar gör hypoteser till personliga löften). "Mätbara effekter" var fel – appen mäter ingenting i kroppen.
- **För Claude Code:** texterna finns i `js/modals.js` (ca rad 74–83), inte i `js/data.js`. Kontrollera om samma ord används på andra ställen (t.ex. Timer) och använd då samma formuleringar.

---

## Scheman (PRESETS)

### schema.∞
- **Var i appen:** Timer → välj schema "∞" (Löpande)
- **Status:** inbyggd (2026-09-24)

**Etikett – nu:**
> Löpande

**Etikett – ny text:**
> _(ingen ändring)_

**Beskrivning – nu:**
> Ingen tidsgräns – fastan pågår tills du väljer att avsluta. Lyssna på kroppen och avbryt om du mår dåligt.

**Beskrivning – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Flexibelt
> - Inga tidskrav
> - Följ kroppen

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Bedömning:** Inga hälsopåståenden. "Perfekt för att lyssna på kroppen" ersatt med en uppmaning att avbryta vid obehag.

---

### schema.16:8
- **Var i appen:** Timer → välj schema "16:8" (Klassikern)
- **Status:** inbyggd (2026-09-24)

**Etikett – nu:**
> Klassikern

**Etikett – ny text:**
> _(ingen ändring)_

**Beskrivning – nu:**
> Den vanligaste formen av periodisk fasta och ett bra sätt att börja. De flesta sover en stor del av fastan. I studier ger den ungefär samma viktnedgång som att äta mindre på vanligt sätt. Ett tidigt ätfönster, till exempel 08–16, verkar vara något bättre för ämnesomsättningen än ett sent.

**Beskrivning – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Enkel att börja med
> - Kan göra det lättare att äta mindre
> - Vardagsvänlig

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Nyaste och starkaste underlaget:** Semnani-Azad m.fl. 2025 (BMJ; systematisk översikt och nätverksmetaanalys av randomiserade studier, ca 100 studier). Periodisk fasta, inklusive tidsbegränsat ätande som 16:8, gav ungefär **samma viktnedgång** som vanlig kalorirestriktion och **ingen extra fördel** för hjärt-kärl- och blodsockermarkörer; båda var bättre än att inte ändra kosten [R10].
- **Tidigt ätfönster:** Chen m.fl. 2026 (BMJ Medicine, nätverksmetaanalys av 41 RCT, 2 287 deltagare) fann vissa fördelar med tidigare ätfönster, medan resultaten för fönstrets längd var inkonsekventa. Sökningen slutade jan 2023 [R15, tillagd efter jämförelse med Codex].
- **Borttaget:** "Aktiverar fettförbränning och tidig ketos" (ketonerna är låga vid 16 h, se fas.16h) och "Bättre blodsockerkontroll" (ingen fördel jämfört med att äta mindre enligt R10).

---

### schema.18:6
- **Var i appen:** Timer → välj schema "18:6" (Effektiv)
- **Status:** inbyggd (2026-09-24)

**Etikett – nu:**
> Lite längre

**Etikett – ny text:**
> _(ingen ändring)_

**Beskrivning – nu:**
> Två timmar längre fasta än 16:8. Det finns inga säkra belägg för att det ger mer effekt, men det kan passa dig som vill ha ett kortare ätfönster.

**Beskrivning – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Kortare ätfönster
> - Lite längre tid med fett som bränsle
> - Ett steg upp från 16:8

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Borttaget:** "Djupare fettförbränning och cellstädning", "Bättre fokus", "Minskad inflammation" – inget stöd för skillnad mot 16:8 i randomiserade studier [R10]; inflammation se fordel.12h [R7].
- **Etikett:** "Effektiv" → "Lite längre", eftersom "effektiv" antyder bättre resultat som inte är visat.

---

### schema.20:4
- **Var i appen:** Timer → välj schema "20:4" (Kraftfull)
- **Status:** inbyggd (2026-09-24)

**Etikett – nu:**
> Kort ätfönster

**Etikett – ny text:**
> _(ingen ändring)_

**Beskrivning – nu:**
> Kallas ibland Warrior Diet. Med bara fyra timmar att äta på kan det vara svårt att få i sig tillräckligt med protein och näring.

**Beskrivning – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Längre tid med fett som bränsle
> - Kräver planering av måltiderna
> - Passar inte alla

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Borttaget:** "Intensiv fettförbränning", "Cellstädning aktiveras", "Mental skärpa" – saknar stöd [R10, R11, R6].
- **Tillagt:** Risken att inte få i sig tillräckligt protein och näring på kort tid – rimligt praktiskt råd, särskilt för den som tränar. Ingen specifik studie citeras; formulerat som "kan vara svårt".
- **Etikett:** "Kraftfull" → "Kort ätfönster".

---

### schema.OMAD
- **Var i appen:** Timer → välj schema "OMAD" (Maximalt)
- **Status:** inbyggd (2026-09-24)

**Etikett – nu:**
> En måltid

**Etikett – ny text:**
> _(ingen ändring)_

**Beskrivning – nu:**
> One Meal A Day – en måltid per dygn. Det är svårt att få i sig all näring på en måltid, och forskningen om hur det påverkar hälsan på lång sikt är begränsad.

**Beskrivning – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Förenklat ätande
> - Lång tid med fett som bränsle
> - Kräver en stor, näringsrik måltid

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Borttaget:** "Maximala effekter", "Max fettförbränning", "Djup cellstädning" – inget stöd för att fler fastetimmar ger större hälsoeffekt i randomiserade studier [R10].
- **Osäkerhet:** Randomiserade studier av en måltid per dag är få och små; därför "forskningen är begränsad".
- **Etikett:** "Maximalt" → "En måltid".

---

### schema.36h
- **Var i appen:** Timer → välj schema "36h" (Avancerad)
- **Status:** inbyggd (2026-09-24)

**Etikett – nu:**
> Avancerad

**Etikett – ny text:**
> _(ingen ändring)_

**Beskrivning – nu:**
> En och en halv dygns fasta. Kroppen hämtar en stor del av energin från fett och ketoner. Passar bara friska vuxna som provat kortare fastor.

**Beskrivning – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Ketos
> - Tillväxthormonet ökar
> - För dig med erfarenhet

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Borttaget:** "Aktiv cellförnyelse" och "Tillväxthormonet skjuter i höjden" / "Kraftigt tillväxthormon" (små studier, överdriven formulering [R5]). "Tillväxthormonet ökar" behålls utan förstärkning [R3].

---

### schema.48h
- **Var i appen:** Timer → välj schema "48h" (Utmanare)
- **Status:** inbyggd (2026-09-24)

**Etikett – nu:**
> Utmanare

**Etikett – ny text:**
> _(ingen ändring)_

**Beskrivning – nu:**
> Två dygns fasta. Kroppen har ställt om till fett och ketoner som huvudbränsle. Prata med vården först om du har en sjukdom eller tar mediciner.

**Beskrivning – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Djup ketos
> - Tillväxtsignalen IGF-1 sjunker
> - För dig med erfarenhet

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Borttaget:** "Immunsystemets förnyelse startar – gamla immunceller byts ut mot nya", "Immunförnyelse", "Ny cellbildning", "Djup reparation" – musdata [R12].

---

### schema.72h
- **Var i appen:** Timer → välj schema "72h" (Systemreset)
- **Status:** inbyggd (2026-09-24)

**Etikett – nu:**
> Tre dygn

**Etikett – ny text:**
> _(ingen ändring)_

**Beskrivning – nu:**
> Tre dygns fasta. Påståenden om att immunsystemet "startar om" är inte visade hos människor. Så långa fastor bör bara göras med stöd från vården.

**Beskrivning – ny text:**
> _(ingen ändring)_

**Punkter – nu:**
> - Appens längsta schema
> - Kräver god hälsa och stöd från vården
> - Inte för nybörjare

**Punkter – ny text:**
> _(ingen ändring)_

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- **Borttaget:** "Djupgående omstart av immunsystem och cellförnyelse", "Komplett immunreset", "Max cellförnyelse", "Nya energifabriker i cellerna" – inget stöd hos människor [R12]; lång fasta kan öka inflammationsmarkörer [R8].
- **Säkerhet:** Ezpeleta m.fl. 2024 rapporterade inga allvarliga biverkningar i studier av 5–20 dygns fasta, men där var deltagarna utvalda och **medicinskt övervakade** [R9]. Därför rådet om stöd från vården.
- **Etikett:** "Systemreset" → "Tre dygn".

---

---

## Källförteckning (uppdrag 2)

Evidensnivå: **R** = riktlinje/myndighet, **SÖ** = systematisk översikt/metaanalys, **Ö** = översiktsartikel, **S** = enskild studie (antal deltagare anges).

| # | Referens | Typ | Läst av Cowork |
|---|---|---|---|
| R1 | Anton SD, Moehl K, Donahoo WT m.fl. Flipping the Metabolic Switch: Understanding and Applying the Health Benefits of Fasting. *Obesity* 2018;26(2):254–268. doi:10.1002/oby.22065 · https://onlinelibrary.wiley.com/doi/full/10.1002/oby.22065 | Ö | Ja (fulltext) |
| R2 | Cahill GF Jr. Fuel metabolism in starvation. *Annual Review of Nutrition* 2006;26:1–22. doi:10.1146/annurev.nutr.26.061505.111258 · https://www.annualreviews.org/content/journals/10.1146/annurev.nutr.26.061505.111258 | Ö | Ja (fulltext) |
| R3 | Fazeli PK, Steinhauser ML. A Critical Assessment of Fasting to Promote Metabolic Health and Longevity. *Endocrine Reviews* 2025;46(6):856–876. doi:10.1210/endrev/bnaf021 · https://academic.oup.com/edrv/article/46/6/856/8211151 | Ö | Ja (fulltext) |
| R4 | de Cabo R, Mattson MP. Effects of Intermittent Fasting on Health, Aging, and Disease. *N Engl J Med* 2019;381:2541–2551. doi:10.1056/NEJMra1905136 · https://www.nejm.org/doi/abs/10.1056/NEJMra1905136 | Ö | Nej (bakgrund, citeras inte i appen) |
| R5 | Ho KY, Veldhuis JD, Johnson ML m.fl. Fasting enhances growth hormone secretion and amplifies the complex rhythms of growth hormone secretion in man. *J Clin Invest* 1988;81:968–975 · https://www.jci.org/articles/view/113450 | S (n=6) | Ja (sammanfattning) |
| R6 | Alkurd R, Mahrous L, Zeb F m.fl. (förstaförfattare enligt Codex; Cowork angav först Faris ME – kontrollera på https://pubmed.ncbi.nlm.nih.gov/38276070/). Effect of Calorie Restriction and Intermittent Fasting Regimens on Brain-Derived Neurotrophic Factor Levels and Cognitive Function in Humans: A Systematic Review. *Medicina* 2024;60(1):191. doi:10.3390/medicina60010191 · https://www.mdpi.com/1648-9144/60/1/191 | SÖ (16 studier) | Ja |
| R7 | Khalafi M m.fl. The Effects of Intermittent Fasting on Inflammatory Markers in Adults: A Systematic Review and Pairwise and Network Meta-Analyses. *Nutrients* 2025;17(15):2388. doi:10.3390/nu17152388 · https://www.mdpi.com/2072-6643/17/15/2388 | SÖ (21 studier, 839 delt.) | Ja |
| R8 | Commissati S m.fl. Prolonged fasting promotes systemic inflammation and platelet activation in humans: A medically supervised, water-only fasting and refeeding study. *Molecular Metabolism* 2025;96:102152. doi:10.1016/j.molmet.2025.102152 · https://www.sciencedirect.com/science/article/pii/S2212877825000596 | S (n=20 + validering n=1 422) | Ja (sammanfattning) |
| R9 | Ezpeleta M, Cienfuegos S, Lin S m.fl. Efficacy and safety of prolonged water fasting: a narrative review of human trials. *Nutrition Reviews* 2024;82(5):664–675. doi:10.1093/nutrit/nuad081 · https://academic.oup.com/nutritionreviews/article/82/5/664/7209209 | Ö (8 studier) | Ja |
| R10 | Semnani-Azad Z m.fl. Intermittent fasting strategies and their effects on body weight and other cardiometabolic risk factors: systematic review and network meta-analysis of randomised clinical trials. *BMJ* 2025;389:e082007. doi:10.1136/bmj-2024-082007 · https://www.bmj.com/content/389/bmj-2024-082007 | SÖ (99 RCT, 6 582 vuxna) | Delvis (huvudresultat via Science Media Centre; siffror från Codex) |
| R11 | Bensalem J m.fl. Intermittent time-restricted eating may increase autophagic flux in humans: an exploratory analysis. *J Physiol* 2025. doi:10.1113/JP287938 · Bensalem J m.fl. Human autophagy measurement: an underappreciated barrier to translation. *Trends Mol Med* 2021 · https://pubmed.ncbi.nlm.nih.gov/34629294/ | S / Ö | Titel och typ bekräftade; sammanfattning ej läst |
| R12 | Cheng CW, Adams GB, Perin L m.fl. Prolonged fasting reduces IGF-1/PKA to promote hematopoietic-stem-cell-based regeneration and reverse immunosuppression. *Cell Stem Cell* 2014;14(6):810–823 · https://www.cell.com/cell-stem-cell/fulltext/S1934-5909(14)00151-9 | S (främst möss) | Titel bekräftad |
| R13 | Pietzner M, Uluvar B, Kolnes KJ m.fl. Systemic proteome adaptions to 7-day complete caloric restriction in humans. *Nature Metabolism* 2024;6:764–777. doi:10.1038/s42255-024-01008-9 | S (n=12) | Ja (sammanfattning) |

| R14 | Bamberg C, Moreau D. Acute effects of fasting on cognitive performance: A systematic review and meta-analysis. *Psychological Bulletin* 2025;151(9):1147–1169. doi:10.1037/bul0000492 · https://pubmed.ncbi.nlm.nih.gov/41182703/ | SÖ (3 484 delt.) | Titel bekräftad; resultat enligt Codex och APA:s pressmeddelande |
| R15 | Chen YE, Tsai HL, Tu YK, Chen LW. Effects of timing and eating duration of time restricted eating on metabolic outcomes: systematic review and network meta-analysis. *BMJ Medicine* 2026;5:e001071. doi:10.1136/bmjmed-2024-001071 · https://bmjmedicine.bmj.com/content/5/1/e001071 | SÖ (41 RCT) | Titel bekräftad; resultat enligt Codex |

**Inte längre använda källor:** Ingen av de ursprungliga texterna hade källor. Påståendet om "5 gånger" tillväxthormon, immunförnyelse och stamceller kommer sannolikt från R5 och R12 och från populärvetenskapliga sammanställningar.

---

### ui.startchips
- **Var i appen:** Timer → startvyn (ingen fasta igång), tre små rader under "Glömde starta?"
- **Status:** förslag

**Rader – nu:**
> - ✓ Fettförbränning
> - ✓ Cellstädning
> - ✓ Tillväxthormon

**Rader – ny text:**
> - Följ fastan i realtid
> - Se vad som händer i kroppen
> - Logga måltider och träning

**Källor nu:** _(inga angivna)_

**Research-anteckning (Cowork 2026-09-24):**
- Raderna med bock ("✓ Fettförbränning", "✓ Cellstädning", "✓ Tillväxthormon") fungerar som löften om effekter innan användaren ens börjat. Cellstädning och tillväxthormon är inte belagda hos människor vid appens tider (se fas.16h, fas.24h, fordel.16h, fordel.24h), och fettförbränning ökar vid all fasta men varierar mellan personer.
- Förslaget beskriver i stället vad **appen gör** – inga hälsopåståenden, så ingen källa behövs. Alternativ: ta bort raderna helt.
- **För Claude Code:** texten finns i `js/views/timer.js`. Behåll gärna bocken som ikon, eftersom raderna nu beskriver funktioner.
---
