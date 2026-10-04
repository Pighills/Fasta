# Fastenivå – forskningsunderlag (fas 0)

Kod: `js/data.js` → `FASTENIVA` _(ny, fylls i av Codex/Claude Code)_ · Uppdrag: `claude/fastenivaa-insulinfonster-2026-10-04.md` (projektet)

Underlag för funktionen **Fastenivå**: en uppskattad kurva över hur mycket en måltid påverkar fastan, när kroppen är tillbaka i ett fastefönster, och hur en **snittperson** går vidare genom fastefaserna (levern använder sitt glykogen, insulinet sjunker, ketoner börjar bildas). Allt är en **uppskattning**, ingen mätning.

Skrivet av Cowork 2026-10-04. **Status för hela filen: förslag** – Anton godkänner. Codex får bara använda siffrorna i avsnitt 2–5, och de ska ligga på ett ställe i `js/data.js`.

---

## 0. Det viktigaste för Anton (läs detta först)

1. **Snittpersonen** = svensk vuxen enligt SCB: 173 cm, 76 kg, 45 år, könsneutral, "lätt aktiv". Den är bara en **referenspunkt**: fyller man i profilen räknas allt på ens egna värden, och saknas ett enskilt fält fylls just det i med snittpersonens värde (Anton 2026-10-04). **Inga nya profilfält behövs** – se avsnitt 1b.
2. **Pasta är inte en "snabb kolhydrat" i forskningen.** I den mest citerade studien (Holt 1997) gav vit pasta ungefär samma insulinsvar som ost (40 % mot 45 % av vitt bröd), medan potatis gav 121 % och yoghurt 115 %. Platshållarna i uppdraget stämde därför inte – kategorierna är omgjorda (avsnitt 2).
3. **Vassle ger ett tydligt insulinsvar** (välbelagt, metaanalys) men det går snabbt över. Din upplevelse efter passet stämmer i riktning: shaken ger kortast påverkan av de proteinrika alternativen.
4. **Träningseffekten är mindre än platshållaren** (0,5–0,7×). Sammanställningar visar en *liten till måttlig* minskning av insulinsvaret när man rört på sig runt måltiden. Förslag: 0,9× på både topp och längd (≈ 20 % mindre påverkan). Precis efter hårda pass kan blodsockret dessutom vara *högre* en stund. Vi skriver därför försiktigt.
5. **Leverns glykogen tar inte slut vid 12 h.** Mätningar (Rothman 1991) visar att ungefär en tredjedel är använd efter 12 h, drygt hälften efter ca 20 h och det mesta (~85–90 %) efter 2–3 dygn. Fasen `fas.12h` säger i dag "Levern har använt en stor del av sitt sockerlager" – det är i överkant men inte fel. Föreslår ingen ändring nu, men Fastenivå-grafen ska följa siffrorna här.
6. **Tröskeln "fastefönster nått" = 10 %** av största möjliga måltidspåverkan. Ingen studie definierar detta – det är ett **designval**, och det står så i Lär-kortet.

---

## 1. Snittpersonen (referensperson)

| Mått | Värde | Källa | Säkerhet |
|---|---|---|---|
| Längd | 173 cm | Medel av män 180 cm och kvinnor 166 cm, 16–84 år, ULF 2016–17 [K1] | Välbelagt (självrapporterat) |
| Vikt | 76 kg | Medel av män 84 kg och kvinnor 68 kg, ULF 2016–17 [K1] | Välbelagt (självrapporterat, troligen något lågt) |
| Ålder | 45 år | Avrundat mittvärde för vuxna. **Designval** – påverkar modellen lite (10 år ≈ 2–3 % i ämnesomsättning) | Antagande |
| Kön | könsneutral | Medel av Mifflin-St Jeor och Boer för man/kvinna (koden har redan "annat" = medel) | – |
| Aktivitet | lätt aktiv (1,375) | Samma som dagens referens i koden | Antagande |

**Anton 2026-10-04:** snittpersonen är en referenspunkt; med ifylld profil räknas allt på användarens egna värden.

**Konsekvens i koden:** dagens referens i `js/helpers.js` (man, 78 kg, 178 cm, 35 år) byts mot snittpersonen. Då flyttas den metaboliska tiden för den som har fyllt i profilen med **ca +4–5 %** (Cowork har räknat: man 84 kg/180 cm/45 år 0,97 → 1,02; kvinna 68/166/45 0,93 → 0,98). Det ligger väl inom osäkerheten men är en ändring Anton ska godkänna (💾-nära, stor). Alternativ: behåll gamla referensen för multiplikatorn och använd snittpersonen bara som text. **Beslut: byt** – annars stämmer inte "beräknat för en genomsnittlig vuxen" för den som inte fyllt i profilen.

**Delvis ifylld profil:** i dag ger ett enda saknat fält multiplikatorn 1 (allt ignoreras). Nytt: varje saknat fält ersätts med snittpersonens värde, och resten av profilen används. Kön saknas = könsneutralt.

## 1b. Vad profilen påverkar – och varför inga nya fält behövs

| Del av modellen | Personlig? | Hur | Profilfält |
|---|---|---|---|
| Fastefaser och leverns glykogen över tid | Ja | Befintlig metabolisk multiplikator (energiförbrukning delat med glykogenlager, jämfört med snittpersonen), 0,80–1,40× | kön, ålder, längd, vikt, aktivitet (finns redan) |
| Träningens effekt på fastan | Ja | Befintlig träningsbonus (kcal, puls) + regeln i avsnitt 3 | loggade pass (finns redan) |
| Måltidskurvan (topp och längd per matkategori) | **Nej, lika för alla** | Studierna (Holt m.fl.) är gjorda på friska normalviktiga; det finns inget underlag för en formel per person | – |

Fält som *skulle* kunna påverka insulinsvaret – midjemått, BMI-gränser, insulinkänslighet, diabetes – har Cowork **inte** lagt till: (1) det finns inget underlag för att räkna om kurvan utifrån dem, så siffrorna skulle bli påhittade, och (2) personer med diabetes eller insulinbehandling ska inte använda funktionen alls (säkerhetsrutan, befintliga hälsofrågor i Profil). Lär-kortet säger att svaret varierar mellan personer. Kan tas upp igen med bättre underlag eller via Apple Hälsa/Health Connect (t.ex. glukosmätare) i Fas 3.

## 2. Måltidskategorier (parametertabell)

Kurvan för en måltid: stiger till en topp (A) vid tiden *tp*, sjunker sedan mjukt till noll vid tiden *D*. Fastefönstret nås när summan av alla aktiva måltider är under tröskeln (avsnitt 4). Kolumnen "Tid till fastefönster" är vad modellen ger för en ensam måltid (Cowork har räknat ut den med kurvformen i avsnitt 6).

| Kategori (id) | Exempel i appen | A (0–1) | tp | D | Tid till fastefönster | Underlag | Säkerhet |
|---|---|---|---|---|---|---|---|
| `snabbaKolhydrater` | bröd, potatis, vitt ris, flingor, godis, juice, läsk | 1,0 | 45 min | 3 h | ca 2 h 30 min | Holt: vitt bröd 100, potatis 121, vitt ris 79, cornflakes 75, godis 160 [K2] | Välbelagt (ordning), osäkert (exakt längd) |
| `langsammaKolhydrater` | pasta, gröt, fullkornsbröd, linser, bönor | 0,5 | 45 min | 3 h | ca 2 h 20 min | Holt: pasta 40, gröt 40, kornbröd 56, linser 58 [K2] | Välbelagt (ordning) |
| `blandad` | vanlig lunch/middag (kolhydrat + protein + fett) | 0,7 | 60 min | 4 h | ca 3 h 15 min | Insulinet hos friska går tillbaka till utgångsläget mellan måltiderna (ca 4–5 h) [K3]; fett och protein drar ut förloppet | Osäkert |
| `protein` | ägg, kött, fisk, kyckling, ost | 0,45 | 45 min | 2 h 30 min | ca 2 h | Holt: ägg 31, ost 45, nötkött 51, fisk 59 [K2] | Välbelagt (lägre än kolhydrater, inte noll) |
| `vassle` | proteinshake (vassle) | 0,7 | 30 min | 2 h | ca 1 h 40 min | Vassle höjer insulintoppen tydligt (metaanalys, hög säkerhet) men svaret är snabbt [K4, K5] | Välbelagt (tydligt svar), osäkert (topp i förhållande till bröd) |
| `mejeri` | yoghurt, fil, mjölk, kvarg | 0,8 | 30 min | 2 h 30 min | ca 2 h | Holt: yoghurt 115, glass 89 [K2]; mjölkprotein är insulindrivande [K4] | Osäkert (sötad/osötad skiljer) |
| `frukt` | äpple, apelsin, banan, druvor | 0,7 | 30 min | 2 h | ca 1 h 40 min | Holt: äpple 59, apelsin 60, banan 81, druvor 82 [K2] | Välbelagt (ordning) |
| `fett` | nötter, smör, olja, avokado (små mängder) | 0,2 | 60 min | 1 h 30 min | ca 1 h 15 min | Holt: jordnötter 20 [K2]; ren fettdryck gav minimal insulinförändring [K6] | Välbelagt (lågt), osäkert (längd) |
| `ingenPaverkan` | vatten, svart kaffe, te, (buljong) | 0 | – | – | 0 | Ingen energi att tala om (`lara.17`) | Välbelagt för vatten/kaffe/te |

**Gamla måltider** (utan kategori) behåller sin nuvarande paus (`pauseHours`) – de räknas inte om. Nya måltider utan vald kategori = `blandad`.

**Begränsningar att skriva ut i Lär-kortet:** Holt mätte bara 2 timmar, i lika stora energiportioner (240 kcal), hos unga smala personer (11–13 per livsmedel). Stora portioner ger större och längre svar. Modellen tar **inte** hänsyn till portionsstorlek i första versionen (öppen fråga 3).

## 3. Träning

| Regel | Värde | Underlag | Säkerhet |
|---|---|---|---|
| Pass som räknas | ≥ 20 min, vilken typ som helst utom "Yoga/Stretch" | Designval (enkel regel) | Antagande |
| Fönster runt måltiden | Passet slutar högst 2 h före, eller börjar högst 2 h efter, måltiden | Arbetande muskel tar upp socker utan insulin, och insulinkänsligheten är förhöjd efter passet [K7, K8] | Välbelagt (mekanism) |
| Effekt | A × 0,9 och D × 0,9 (≈ 20 % mindre påverkan) | Aktivitet runt måltiden sänker insulinsvaret lite till måttligt (SMD −0,30; promenad −0,44) [K9] | Osäkert (storleken) |
| Fastande pass | Ingen extra effekt i första versionen | Underlaget räcker inte för en egen siffra | – |

Ärlighetsnot: precis efter ett hårt pass kan blodsockret efter en kolhydratrik måltid vara *högre* en stund, trots att musklerna tar upp mer socker [K8]. Därför ger modellen bara en liten effekt och texten lovar inget om "förbränning".

Befintlig träningsbonus (`workoutBonusHours`, glykogen från passet) behålls oförändrad – den gäller fastefaserna, inte måltidskurvan.

## 4. Tröskel och nivå

- **Tröskel "fastefönster nått":** uppskattad måltidspåverkan < **10 %** (konstant `TROSKEL = 0.10`). Designval.
- **Nivå på baren:** 100 % − måltidspåverkan (begränsad 0–100 %). 100 % = "i fastefönster".
- **Tid till fastefönster:** första tidpunkt framåt då summan av måltidskurvor < tröskeln.
- **Pausen i timern:** en ny måltid pausar fastetiden lika länge som "tid till fastefönster" (ersätter dagens fasta 0–4 h-val för nya måltider). Både förfluten tid och metabolisk tid använder samma paus, så den dubbla tidslinjen hålls ihop.

## 5. Snittpersonens tidslinje (efter sista måltiden, fasta utan mat)

Detta är vad grafen och raden under baren visar för snittpersonen. Med ifylld profil skalas tiden med den befintliga metaboliska multiplikatorn. Faserna (`PH`) och deras tider ändras inte.

| Tid efter måltid | Leverns glykogen kvar (uppskattning) | Insulin | Fas (befintlig) | Underlag | Säkerhet |
|---|---|---|---|---|---|
| 0–4 h | stiger till fullt (100 %) | förhöjt efter maten, tillbaka på fastenivå inom ca 2–4 h beroende på mat | Matsmältning | [K3, K10] | Välbelagt |
| 12 h | ca 70 % | låg (fastevärde) | Mer fett som bränsle | Rothman: nära linjär minskning 4–22 h [K10, K11] | Välbelagt (mätt hos friska) |
| ca 20 h | ca 50 % ("ungefär hälften använt") | låg och sjunker långsamt | Lätt ketos | [K10, K11] | Välbelagt |
| 24 h | ca 40 % | fortsätter sjunka | Ett dygn | Härledd från [K10]: levern gör mest nytt socker själv efter 22 h (82–96 %) | Osäkert (härlett) |
| 48 h | ca 15 % | lågt | Två dygn | Härledd från [K10]; Cahill: levern i stort sett tömd efter 2–3 dygn [K12] | Osäkert (härlett) |
| 72 h | ca 10 % | lågt | Tre dygn | [K12] | Osäkert |

Brytpunkter för koden (linjär interpolation mellan punkterna, tid i metabolisk tid):
`LEVERGLYKOGEN = [[0,1.0],[4,1.0],[12,0.70],[22,0.40],[46,0.14],[72,0.10]]`
(Punkterna 4–22 h är mätta: 396 → 251 mmol/l mellan 4 och 15 h, samma takt till 22 h [K10]. Efter 22 h är takten härledd från andelen glukos som levern nybildar [K11].)

**Ketoner:** visas inte som egen kurva. Faserna säger redan "någonstans mellan 12 och 36 timmar" (Anton m.fl. 2018) – grafen ska inte låtsas att det finns en exakt tid.

**Muskelglykogen** visas inte: musklernas socker används av musklerna själva och kan inte hålla uppe blodsockret. Därför handlar "glykogen tar slut" i appen om **levern**.

## 6. Kurvform (för Codex)

För en måltid vid tiden 0, med t i timmar:
- 0 < t < tp: `nivå = A × sin(π/2 × t/tp)`
- tp ≤ t < D: `nivå = A × 0,5 × (1 + cos(π × (t − tp)/(D − tp)))`
- annars 0.
Total påverkan = summan av aktiva måltider, begränsad till 0–1. Cowork har kontrollräknat "Tid till fastefönster" i tabellen med exakt denna form.

---

## 7. Texter i appen

### fastenivaa.markning
- **Var i appen:** Timer → under Fastenivå-baren, och i grafen
- **Status:** förslag

**Text – ny text:**
> Uppskattning, inte en mätning.

### fastenivaa.rad
- **Var i appen:** Timer → raden under baren
- **Status:** förslag

**Text – ny text (tre lägen):**
> Ungefär {tid} till fastefönster.
> Du är i ett fastefönster.
> Du är i ett fastefönster. Levern har använt ungefär {andel} av sitt sockerlager.

(Tredje raden visas från 12 h, med `{andel}` avrundad till närmaste tiotal procent från avsnitt 5: "en tredjedel", "hälften", "det mesta" går också bra.)

### fastenivaa.snittperson
- **Var i appen:** Timer → liten text under baren när profilen är tom
- **Status:** förslag

**Text – ny text:**
> Beräknat för en genomsnittlig vuxen (173 cm, 76 kg, 45 år). Fyll i din profil för en uppskattning som passar dig bättre.

### fastenivaa.profil
- **Var i appen:** Timer → liten text under baren när profilen är ifylld (helt eller delvis)
- **Status:** förslag

**Text – ny text:**
> Beräknat utifrån din profil. Saknade uppgifter ersätts med värden för en genomsnittlig vuxen.

(Andra meningen visas bara om något fält saknas.)

### fastenivaa.traning
- **Var i appen:** Timer → rad efter ett loggat pass (planerat läge)
- **Status:** förslag

**Text – ny text:**
> Efter träning tar musklerna upp mer socker. En måltid nu påverkar fastan något kortare tid.

### fastenivaa.planera
- **Var i appen:** Måltidsrutan → "Planera måltid" / fasta över 24 h
- **Status:** förslag

**Text – ny text:**
> Planerar du att äta? Så här påverkar olika mat fastan. Allt är uppskattningar, och regelbunden, tillräcklig mat är alltid viktigast.

### fastenivaa.forhandsvisning
- **Var i appen:** Måltidsrutan → under vald kategori (planerat läge)
- **Status:** förslag

**Text – ny text:**
> {Kategori}: tillbaka i fastefönster om ungefär {tid}.

### fastenivaa.sakerhet
- **Var i appen:** Ruta första gången Fastenivå visas
- **Status:** förslag

**Kort text – ny text:**
> Fastenivå är en grov uppskattning för friska vuxna. Den passar inte om du har diabetes, tar insulin eller blodsockersänkande medicin, eller har eller har haft en ätstörning.

**Lång text – ny text:**
> Appen mäter inte ditt insulin eller blodsocker. Kurvan bygger på medelvärden från studier av friska personer, och ditt svar kan skilja sig mycket. Fastenivå är tänkt som stöd när du redan har planerat att äta, till exempel efter träning eller under en lång fasta – inte som ett skäl att äta mindre. Regelbunden och tillräcklig mat är normen. Har du eller har du haft en ätstörning, prata med vården innan du använder fasta. Stöd finns hos 1177 och Frisk & Fri.

### lara.20 (nytt Lär-kort: "Fastenivå – vad visar den?")
- **Var i appen:** Lära → Praktiskt
- **Status:** förslag

**Framsida – ny text:**
> En uppskattning av hur länge en måltid påverkar fastan. Den bygger på studier av insulinsvar, inte på mätningar i din kropp.

**Baksida – ny text:**
> När du äter frisätter kroppen insulin, mest efter kolhydrater som bröd och potatis, mindre efter ägg och fisk och nästan inget efter fett. Även proteinshake och mejeriprodukter ger ett tydligt, men kort, insulinsvar. Appen räknar med att du är tillbaka i ett fastefönster när den uppskattade påverkan är under en tiondel, vilket är ett val vi gjort och inte en gräns från forskningen. Kurvan visar inte ketoner, cellstädning (autofagi) eller fettförbränning, och för den som räknar strikt bryter all mat med energi fastan. Rörelse runt måltiden minskar påverkan något. Portionens storlek, sömn, stress och gener påverkar också, men räknas inte.

**Källor (kort):** Holt m.fl., Am J Clin Nutr 1997; Smedegaard m.fl., Am J Clin Nutr 2023; Gale m.fl., Obes Rev 2026

---

## 8. Källor

| # | Källa | Typ | Läst |
|---|---|---|---|
| K1 | SCB. Varannan svensk har övervikt eller fetma (ULF 2016–17: män 180 cm/84 kg, kvinnor 166 cm/68 kg, 16–84 år, självrapporterat). 2018. https://www.scb.se/hitta-statistik/artiklar/2018/varannan-svensk-har-overvikt-eller-fetma/ | Myndighet | Ja (siffrorna) |
| K2 | Holt SH, Brand Miller JC, Petocz P. An insulin index of foods: the insulin demand generated by 1000-kJ portions of common foods. *Am J Clin Nutr* 1997;66(5):1264–76. doi:10.1093/ajcn/66.5.1264 | S (38 livsmedel, 11–13 pers./grupp, 2 h) | Ja (tabell 4) |
| K3 | Polonsky KS, Given BD, Van Cauter E. Twenty-four-hour profiles and pulsatile patterns of insulin secretion in normal and obese subjects. *J Clin Invest* 1988;81(2):442–8. doi:10.1172/JCI113339 | S | Sammanfattning: hos normalviktiga återgick insulinutsöndringen till utgångsläget mellan måltiderna; hos personer med fetma inte |
| K4 | Smedegaard S m.fl. Whey protein premeal lowers postprandial glucose concentrations in adults compared with water – the effect of timing, dose, and metabolic status: a systematic review and meta-analysis. *Am J Clin Nutr* 2023;118(2):391–405. doi:10.1016/j.ajcnut.2023.05.012 | SÖ (16 RCT, 244 pers.) | Sammanfattning: vassle höjer insulintoppen (hög säkerhet) |
| K5 | Dao GM m.fl. Mechanistic insights into postprandial insulin-glucagon interactions … after protein-glucose coingestion in humans. *Diabetes* 2025;74(11):1946–56. doi:10.2337/db25-0395 | RCT (n=11) | Sammanfattning (stöd, inte ensam grund) |
| K6 | Deru LS m.fl. Understanding the metabolic and endocrine effects of macronutrient boluses in the context of a low-carbohydrate diet: a randomized crossover study. *Nutrients* 2026;18(16):2669. doi:10.3390/nu18162669 | RCT (n=24) | Sammanfattning: insulin steg mest av socker, mindre av vassle, minimalt av olivolja (stöd, inte ensam grund) |
| K7 | Sylow L, Kleinert M, Richter EA, Jensen TE. Exercise-stimulated glucose uptake – regulation and implications for glycaemic control. *Nat Rev Endocrinol* 2017;13(3):133–48. doi:10.1038/nrendo.2016.162 | Ö | Sammanfattning |
| K8 | Soo J m.fl. The role of exercise and hypoxia on glucose transport and regulation. *Eur J Appl Physiol* 2023;123(6):1147–65. doi:10.1007/s00421-023-05135-1 | Ö | Sammanfattning: blodsockersvaret kan vara förhöjt tidigt efter träning trots ökat upptag i muskel |
| K9 | Gale JT, Martin H, Haszard JJ, Peddie MC. The acute effects of interrupting prolonged sitting with regular activity breaks on postprandial glucose and insulin in adults: a systematic review and meta-analysis. *Obes Rev* 2026:e70152. doi:10.1111/obr.70152 | SÖ (39 studier i metaanalys) | Sammanfattning: insulin-iAUC SMD −0,30; promenad −0,44 |
| K10 | Rothman DL, Magnusson I, Katz LD, Shulman RG, Shulman GI. Quantitation of hepatic glycogenolysis and gluconeogenesis in fasting humans with 13C NMR. *Science* 1991;254(5031):573–6. doi:10.1126/science.1948033 — siffror via Roden M, Petersen KF, Shulman GI. Nuclear magnetic resonance studies of hepatic glucose metabolism in humans. *Recent Prog Horm Res* 2001;56:219–37 | S (mätt hos friska) + Ö | Sammanfattning + översiktens siffror: 396 → 251 mmol/l mellan 4 och 15 h; 4,3 µmol/kg/min; nybildning 64 % (0–22 h), 82 % (22–36 h), 96 % (46–64 h) |
| K11 | Petersen KF m.fl. Contributions of net hepatic glycogenolysis and gluconeogenesis to glucose production in cirrhosis. *Am J Physiol* 1999;276(3):E529–35. doi:10.1152/ajpendo.1999.276.3.E529 | S | Sammanfattning: friska kontroller, glykogen stod för ca 40 % av sockerproduktionen över natten |
| K12 | Cahill GF Jr. Fuel metabolism in starvation. *Annu Rev Nutr* 2006;26:1–22 (R2 i fastefaser.md) | Ö | Redan godkänd källa |

Ingen källa är ensam grund för ett påstående. Där bara en mindre studie finns (K5, K6) används den som stöd till en översikt eller större studie.

## 9. Öppna frågor till Anton

1. ~~Snittpersonen~~ **Avgjort 2026-10-04:** referenspunkt, profilens egna värden används när de finns, saknade fält fylls med snittpersonen. Inga nya profilfält.
2. Godkänner du att pasta flyttas till "långsamma kolhydrater" (enligt Holt) och att träningseffekten blir 0,9× i stället för 0,5–0,7×?
3. Portionsstorlek: vill du att energin (kcal), om den fylls i, ska förlänga/förkorta kurvan i en senare version? (Kräver mer underlag – inte i första versionen.)
