# Hälsa och säkerhet

Kod: `js/data.js` → `HEALTH_FLAGS`

Kortet **Hälsa och säkerhet** i **Profil**. Frivilliga kryssrutor; kryss visar en kort varning, tryck på varningen visar en längre förklaring. Inget spärras (Antons beslut 2026-09-24).

**Obs:** källorna har granskats av Cowork 2026-09-24 (uppdrag 1). Se research-anteckningen under varje ruta; texterna godkändes av Anton och byggdes in i appen 2026-09-24.

Se [README.md](README.md) för hur filen används.

---

### halsa.diabetesMeds
- **Var i appen:** Profil → Hälsa och säkerhet → första kryssrutan (diabetesmedicin)
- **Status:** inbyggd (2026-09-24)

**Kryssruta – nu:**
> Jag tar insulin, blodsockersänkande medicin eller en SGLT2-hämmare

**Kryssruta – ny text:**
> _(ingen ändring)_

**Kort varning – nu:**
> Fasta kan ge för lågt blodsocker eller en farlig syraförgiftning när du tar sådan medicin. Prata med din läkare eller diabetessköterska innan du fastar – behandlingen kan behöva anpassas.

**Kort varning – ny text:**
> _(ingen ändring)_

**Lång förklaring – nu:**
> Insulin och vissa tabletter (till exempel sulfonylureider) sänker blodsockret även när du inte äter. Under en fasta kan blodsockret då bli för lågt, vilket kan ge skakighet, svettningar, förvirring och i värsta fall medvetslöshet. SGLT2-hämmare (till exempel Jardiance eller Forxiga) ges vid diabetes, hjärtsvikt och njursjukdom. Vid långa matuppehåll eller vätskebrist kan de ge en allvarlig syraförgiftning (ketoacidos), även när blodsockret ser normalt ut. Behandlingen kan behöva anpassas före och under fastan. Ändra aldrig medicineringen på egen hand, utan planera fastan tillsammans med vården.

**Lång förklaring – ny text:**
> _(ingen ändring)_

**Källor nu:** ADA 2026; EMA (Jardiance); IDF-DAR 2021/2026

**Research-anteckning (Cowork 2026-09-24):**
- **Slutsats:** Påståendena stämmer och är väl belagda. Starkaste underlaget är internationella kliniska riktlinjer och läkemedelsmyndigheter, inte enskilda studier.
- **Hypoglykemi med insulin och sulfonylureider:** Stöds av IDF-DAR:s riktlinjer, som klassar personer med insulin eller sulfonylureider som högre risk och rekommenderar läkarbedömning och dosjustering före fasta. *Hassanein M, Afandi B, Yakoob Ahmedani M m.fl. Diabetes and Ramadan: Practical guidelines 2021. Diabetes Research and Clinical Practice 2022;185:109185.* https://www.sciencedirect.com/science/article/abs/pii/S0168822721005453 · Fullständiga riktlinjer (IDF): https://idf.org/news-and-resources/resources/diabetes-and-ramadan-practical-guidelines-2021/
- **Uppdatering 2025:** *Ibrahim M m.fl. Recommendations for the Management of Diabetes During Ramadan Applying the Principles of the ADA/EASD Consensus: Update 2025. Diabetes/Metabolism Research and Reviews 2025. doi:10.1002/dmrr.70057.* https://onlinelibrary.wiley.com/doi/10.1002/dmrr.70057 – Existens och titel bekräftade; sammanfattningen gick inte att läsa (sidan blockerade automatisk läsning). Bör läsas manuellt innan godkännande.
- **SGLT2-hämmare och ketoacidos:** EMA (2016) anger "tillstånd som begränsar matintaget eller leder till svår uttorkning" som riskfaktor för ketoacidos vid SGLT2-hämmare. *European Medicines Agency. EMA confirms recommendations to minimise ketoacidosis risk with SGLT2 inhibitors for diabetes. 26 februari 2016.* https://www.ema.europa.eu/en/news/ema-confirms-recommendations-minimise-ketoacidosis-risk-sglt2-inhibitors-diabetes · Ketoacidos med normalt blodsocker (euglykemisk) vid SGLT2-hämmare är väldokumenterad: *Rosenstock J, Ferrannini E. Euglycemic Diabetic Ketoacidosis: A Predictable, Detectable, and Preventable Safety Concern With SGLT2 Inhibitors. Diabetes Care 2015;38(9):1638–1642.* https://diabetesjournals.org/care/article/38/9/1638/37307/
- **Grajower & Horne 2019** finns (*Nutrients 2019;11(4):873, doi:10.3390/nu11040873*) och stöder texten, men är en expertöversikt, inte en systematisk översikt. Behålls som bakgrund, inte som huvudkälla.
- **Ändring av kryssrutan:** SGLT2-hämmare ges idag även utan diabetes, vid hjärtsvikt och kronisk njursjukdom (standardbehandling enligt europeiska riktlinjer; ej källkontrollerat i detta uppdrag). Den gamla kryssrutan missade de personerna, därför föreslås en bredare formulering.
- **Osäkerhet:** Riktlinjerna gäller ramadanfasta (ca 12–18 h dagligen). För längre fastor (24–72 h) finns inga riktlinjer för personer med diabetesmedicin; risken bedöms rimligen som högre. Det är ytterligare ett skäl att inte ge dosråd i appen.


**Research-anteckning v2 (Cowork 2026-09-24, efter jämförelse med Codex):**
- **Ändring:** "doserna behöver ofta ändras" → "behandlingen kan behöva anpassas" + "ändra aldrig medicineringen på egen hand". Codex påpekade med rätta att risken skiljer sig mellan läkemedel och att en generell dosformulering är för stark.
- **Bättre källor från Codex (kontrollerade av Cowork: finns):** ADA Standards of Care 2026, avsnitt 9 (*Diabetes Care* 2026;49(Suppl 1):S183), https://diabetesjournals.org/care/article/49/Supplement_1/S183/163934/ · EMA Jardiance EPAR/produktinformation (aktuell, ersätter EMA 2016 som huvudkälla) · Afandi m.fl. 2026 IDF-DAR riskkalkylator (*J Diabetes Endocr Pract*, doi:10.1055/s-0045-1813010).
- **Källor – kort form i appen (ny):** ADA 2026; EMA (Jardiance); IDF-DAR 2021/2026

---

### halsa.pregnant
- **Var i appen:** Profil → Hälsa och säkerhet → "Jag är gravid eller ammar"
- **Status:** inbyggd (2026-09-24)

**Kryssruta – nu:**
> Jag är gravid eller ammar

**Kryssruta – ny text:**
> _(ingen ändring)_

**Kort varning – nu:**
> Under graviditet och amning ökar kroppens behov av energi och näring, och forskningen om fasta är begränsad. Prata med barnmorska, BVC eller läkare innan du fastar.

**Kort varning – ny text:**
> _(ingen ändring)_

**Lång förklaring – nu:**
> När du är gravid eller ammar behöver du mer energi och näring än vanligt, särskilt sent i graviditeten och när du ammar. Det mesta vi vet om fasta under graviditet kommer från studier av ramadanfasta. De visar oftast ingen skillnad i födelsevikt, men stora studier har sett samband med vissa sämre utfall senare i barnets liv, särskilt när fastan skett tidigt i graviditeten. Forskningen är osäker och gäller inte fastor på flera dygn. Prata därför med din barnmorska, BVC eller läkare innan du provar fasta.

**Lång förklaring – ny text:**
> _(ingen ändring)_

**Källor nu:** Pradella m.fl. 2024; Al-Taiar m.fl. 2025; Livsmedelsverket

**Research-anteckning (Cowork 2026-09-24):**
- **Rättelse:** Den gamla texten sa "Därför rekommenderas regelbundna måltider" med Livsmedelsverket som källa. Livsmedelsverkets underlag för gravida och ammande ger **inga** råd om måltidsordning, bara om ökat energibehov och att en del behöver större portioner eller extra mellanmål. Meningen är därför borttagen.
- **Ökat energibehov:** Livsmedelsverket anger ca +100 kcal/dag (trimester 1), ca +330 (trimester 2), ca +540 (trimester 3) och ca +360–720 kcal/dag vid amning (tabell s. 16). *Livsmedelsverket. Hälsosamma matvanor under graviditet och amning. Rapport L 2020 nr 08.* https://www.livsmedelsverket.se/om-oss/publikationer/artiklar/2020/l-2020-nr-08-halsosamma-matvanor-under-graviditet-och-amning/
- **Snabbare fettförbränning ("accelerated starvation"):** *Metzger BE, Ravnikar V, Vileisis RA, Freinkel N. "Accelerated starvation" and the skipped breakfast in late normal pregnancy. Lancet 1982;1(8272):588–592.* https://pubmed.ncbi.nlm.nih.gov/6121184/ – Liten fysiologisk studie från 1982. Fenomenet är dock etablerad fysiologi och återkommer i senare litteratur, så det används bara som förklaring av mekanismen, inte som bevis för skada. Texten är därför begränsad till "sent i graviditeten".
- **Nyaste samlade evidensen:** En paraplyöversikt av 13 översikter (2025) fann "lite belägg" för att ramadanfasta under graviditet försämrar graviditets- eller förlossningsutfall (oddskvot för låg födelsevikt 1,05–1,37 mellan studierna; otillräckligt underlag för förtidsbörd och graviditetsdiabetes). Författarna betonar stora metodbrister och att bättre studier behövs. *Al-Taiar A, Rahman MS, Salama H, Ziyab AH, Karmaus W. Impacts of Ramadan fasting during pregnancy on pregnancy and birth outcomes: An umbrella review. International Journal of Gynecology & Obstetrics 2025;169(3). doi:10.1002/ijgo.16127.* https://digitalcommons.odu.edu/epidemiology_biostats_environhealth_pubs/1/
- **Tolkning:** Evidensen visar inte skada, men den visar inte heller säkerhet, och den gäller ramadanfasta (ingen mat i dagsljus) – inte 24–72 h-fastor. Den nya texten säger det ärligt i stället för att påstå en rekommendation som inte finns.


**Research-anteckning v2 (Cowork 2026-09-24, efter jämförelse med Codex):**
- **Viktig rättelse (Codex hittade, Cowork missade):** *Pradella F, Witte P, van Ewijk R. Ramadan during pregnancy and offspring health outcomes over the life course: a systematic review and meta-analysis. Human Reproduction Update 2024;30(6):789–812. doi:10.1093/humupd/dmae026.* https://academic.oup.com/humupd/article/30/6/789/7740001 – Kontrollerad av Cowork: 31 studier (22 i metaanalyser). Ingen skillnad i födelsevikt eller förtidsbörd, men samband med något lägre längd och kognitiva testresultat i barndomen, fler hörselnedsättningar (26 % högre odds) och kroniska sjukdomar i vuxen ålder; första trimestern framstår som känslig. Evidensens säkerhet: låg till måttlig. Många studier mäter bara att graviditeten sammanföll med ramadan, inte faktisk fasta.
- Den inbyggda texten ("De har inte visat tydliga skador") var därför för optimistisk och ersätts.
- **Borttaget:** meningen om snabbare fettförbränning sent i graviditeten, eftersom den byggde på en enskild liten studie (Metzger 1982) – Codex påpekade detta i linje med dina regler.
- **Tillagt:** BVC, som är rätt kontakt under amning (från Codex).
- **Källor – kort form i appen (ny):** Pradella m.fl. 2024; Al-Taiar m.fl. 2025; Livsmedelsverket

---

### halsa.eatingDisorder
- **Var i appen:** Profil → Hälsa och säkerhet → "Jag har eller har haft en ätstörning"
- **Status:** inbyggd (2026-09-24)

**Kryssruta – nu:**
> Jag har eller har haft en ätstörning

**Kryssruta – ny text:**
> _(ingen ändring)_

**Kort varning – nu:**
> Om du har eller har haft en ätstörning, prata med vården innan du börjar fasta. Följ i första hand den måltidsplan du fått i behandlingen.

**Kort varning – ny text:**
> _(ingen ändring)_

**Lång förklaring – nu:**
> Regelbundna måltider är en viktig del av behandlingen vid flera ätstörningar, och att hoppa över måltider eller äta för lite kan göra besvären värre. Enkätstudier har sett ett samband mellan periodisk fasta och fler ätstörningssymtom, särskilt hos unga, men de kan inte visa vad som är orsak och verkan. Kontrollerade studier har oftast inte sett någon sådan ökning, men nästan inga har gjorts på personer som har eller har haft en ätstörning. Prata därför med din behandlare eller vårdcentral innan du ändrar när du äter. Stöd finns hos 1177 och Frisk & Fri.

**Lång förklaring – ny text:**
> _(ingen ändring)_

**Källor nu:** NICE NG69; Vizthum m.fl. 2023; Ganson m.fl. 2022

**Research-anteckning (Cowork 2026-09-24):**
- **Slutsats:** Båda de gamla källorna finns och stöder ett *samband*, men båda är tvärsnittsstudier (enkäter vid ett tillfälle). Den gamla texten var korrekt men sa inte att sambandet inte bevisar orsak. Den nya texten lägger till det och vad kontrollerade studier visar.
- *Ganson KT, Cuccolo K, Hallward L, Nagata JM. Intermittent fasting: Describing engagement and associations with eating disorder behaviors and psychopathology among Canadian adolescents and young adults. Eating Behaviors 2022;47:101681.* https://www.sciencedirect.com/science/article/abs/pii/S1471015322000873 – Stor kanadensisk enkätstudie (16–30 år). Samband med ätstörningsbeteenden, tydligast hos kvinnor. (Volym/artikelnummer ej kontrollerade.)
- *Cuccolo K, Kramer R, Petros T, Thoennes M. Intermittent fasting implementation and association with eating disorder symptomatology. Eating Disorders 2022;30(5). doi:10.1080/10640266.2021.1922145.* https://www.tandfonline.com/doi/abs/10.1080/10640266.2021.1922145 – Enkätstudie på vuxna; samband mellan fasta och ätstörningssymtom.
- **Nyare, starkare design:** *He J m.fl. Engagement in Intermittent Fasting is Prospectively Associated With Higher Body Mass Index, Higher Eating Disorder Psychopathology, and Lower Intuitive Eating in Chinese Adults. International Journal of Eating Disorders 2025. doi:10.1002/eat.24322.* https://onlinelibrary.wiley.com/doi/10.1002/eat.24322 – Prospektiv (följer personer över tid), vilket är starkare än tvärsnitt men fortfarande inte experiment. Titel bekräftad; sammanfattningen gick inte att läsa automatiskt.
- **Motbild från kontrollerade studier:** *Blumberg J, Hahn SL, Bakke J. Intermittent fasting: consider the risks of disordered eating for your patient. Clinical Diabetes and Endocrinology 2023;9. doi:10.1186/s40842-023-00152-7.* https://link.springer.com/article/10.1186/s40842-023-00152-7 – Översikt: korta randomiserade studier ser minimala negativa effekter (och ibland minskat hetsätande), men de utesluter oftast personer med ätstörningshistorik, så resultaten kan inte överföras till riskgrupper. Rekommenderar screening före fasta.
- **Stödorganisationer:** 1177 och Frisk & Fri (Riksföreningen mot ätstörningar) – finns; länkar bör läggas in i appen av Claude Code.


**Research-anteckning v2 (Cowork 2026-09-24, efter jämförelse med Codex):**
- **Rättelse (Codex hittade):** Den inbyggda texten sa att "äta efter fasta tider liknar beteenden som hör ihop med ätstörningar". Det är missvisande – regelbundna, planerade måltider är tvärtom en del av behandlingen (NICE NG69, avsnitt 1.4–1.5). Problemet är restriktion och för litet intag. Meningen är omskriven.
- **Ny källa från Codex (kontrollerad av Cowork: finns):** *Vizthum D, Katz SE, Pacanowski CR. The impact of time restricted eating on appetite and disordered eating in adults: A mixed methods systematic review. Appetite 2023;183:106452.* https://www.sciencedirect.com/science/article/abs/pii/S0195666323000053 – systematisk översikt (16 studier), starkare än enskilda enkäter.
- **NICE NG69:** Cowork kunde inte läsa sidan (403); innehållet är kontrollerat av Codex. https://www.nice.org.uk/guidance/NG69/chapter/recommendations
- **Behålls från Cowork:** He m.fl. 2025 (prospektiv studie) och Blumberg m.fl. 2023 (översikt), som Codex inte tog med.
- **Källor – kort form i appen (ny):** NICE NG69; Vizthum m.fl. 2023; Ganson m.fl. 2022

---

### halsa.under18
- **Var i appen:** Profil → Hälsa och säkerhet → "Jag är under 18 år"
- **Status:** inbyggd (2026-09-24)

**Kryssruta – nu:**
> Jag är under 18 år

**Kryssruta – ny text:**
> _(ingen ändring)_

**Kort varning – nu:**
> Kroppen växer fortfarande och behöver jämn tillgång till energi. Fasta rekommenderas inte för barn och unga utan stöd från vården.

**Kort varning – ny text:**
> _(ingen ändring)_

**Lång förklaring – nu:**
> Under uppväxten och puberteten behöver kroppen ungefär lika mycket näring som en vuxen för att växa och utvecklas. Livsmedelsverket råder barn och unga att fördela maten på flera måltider under dagen. Forskningen om periodisk fasta hos barn och unga är begränsad, och hos unga har fasta kopplats till ätstörningsbeteenden. Ät hellre regelbundet, och prata med skolsköterskan eller vården om du har frågor om mat och vikt.

**Lång förklaring – ny text:**
> _(ingen ändring)_

**Källor nu:** Livsmedelsverket; Ganson m.fl. 2022

**Research-anteckning (Cowork 2026-09-24):**
- **Måltidsfördelning:** Livsmedelsverket: "För att täcka behovet av energi och näringsämnen behöver matintaget fördelas på flera måltider under dagen, vanligtvis frukost, två huvudmål och två till tre näringsrika mellanmål." *Livsmedelsverket, Fråga oss: Måltidsordning i skola och förskola.* https://fragor.livsmedelsverket.se/org/livsmedelsverket/d/maltidsordning-i1zi/ – Livsmedelsverket noterar själva att de inte längre anger exakta tidsintervall, eftersom evidensen för måltidsfördelning är svag. Rådet bygger alltså på näringsbehov och praxis snarare än starka studier.
- **Ätstörningskoppling hos unga:** Ganson m.fl. 2022, se `halsa.eatingDisorder`.
- **Nyans – övervakad behandling:** Det finns randomiserade studier där tonåringar med fetma provat periodisk energirestriktion *under täta kontroller av ett vårdteam*, t.ex. *Jebeile H m.fl. Intermittent Energy Restriction for Adolescents With Obesity: The Fast Track to Health Randomized Clinical Trial. JAMA Pediatrics 2024.* https://pubmed.ncbi.nlm.nih.gov/39186288/ (titel bekräftad; sammanfattningen gick inte att läsa automatiskt). Det stöder inte egen fasta via en app, men förklarar varför texten säger "utan stöd från vården" i stället för ett absolut förbud.
- **Fråga till Anton (produktbeslut):** Appen säger idag inget om åldersgräns i villkoren. Överväg en 18-årsgräns i användarvillkoren, både av detta skäl och för GDPR (barns hälsodata).


**Research-anteckning v2 (Cowork 2026-09-24, efter jämförelse med Codex):**
- **Ändring:** Det exakta antalet mellanmål är borttaget, eftersom Livsmedelsverket själva anger att evidensen för måltidsfördelning är svag (Codex och Cowork var överens om det i anteckningarna, men Coworks text tog ändå med antalet).
- **Ny källa från Codex (kontrollerad av Cowork: finns):** *Bakhsh J, Salvy SJ, Vidmar AP. Intermittent fasting as a treatment for obesity in young people: a scoping review. npj Metabolic Health and Disease 2024.* https://pmc.ncbi.nlm.nih.gov/articles/PMC11685102/ – stöder "forskningen är begränsad".

---

### halsa.friskrivning
- **Var i appen:** Profil → Hälsa och säkerhet → raden längst ner
- **Status:** inbyggd (2026-09-24)

**Text – nu:**
> FASTA ger allmän information och ersätter inte råd från vården. Mår du dåligt under en fasta, till exempel blir yr eller förvirrad, avbryt fastan och kontakta vården vid behov – ring 1177 för rådgivning eller 112 vid akuta besvär.

**Text – ny text:**
> _(ingen ändring)_

**Källor nu:** – (ingen källa behövs)

**Research-anteckning (Cowork 2026-09-24):**
- Ingen källa krävs. Tillägg: konkreta varningstecken (yrsel, förvirring) och svenska nummer (1177 sjukvårdsrådgivning, 112 vid akut fara) så att användaren vet vad hen ska göra.
- "Avbryt fastan" i stället för "ät", eftersom det är tydligare och fungerar även för den som mår illa.
- Texten påstår inte att appen behandlar eller förebygger sjukdom, vilket är viktigt för att FASTA inte ska räknas som en medicinteknisk produkt.


---

---

## Förslag från Cowork: riskgrupper som saknas

_Inga rutor är tillagda. Anton beslutar om någon ska läggas till; då skapar Cowork texterna i ett nytt uppdrag._

| Förslag | Varför | Prioritet |
|---|---|---|
| **Undervikt** (BMI under 18,5) eller ofrivillig viktnedgång | Fasta minskar ofta energiintaget ytterligare. Undervikt är också ett vanligt tecken på ätstörning. | Hög |
| **Äldre eller sköra** (t.ex. över 70 år, tappat muskler eller vikt) | Risk för muskelförlust, yrsel och fall vid lågt intag. | Medel |
| **Blodtrycks- eller vätskedrivande medicin** | Uttorkning och yrsel vid långa fastor; IDF-DAR tar upp vätskebalans och vätskedrivande. | Medel |
| **Njur- eller leversjukdom** | Klassas som ökad risk i IDF-DAR:s riskindelning (för personer med diabetes). | Medel |
| **Mediciner som ska tas med mat** (t.ex. vissa värktabletter, kortison) | Magbesvär eller sämre effekt om de tas på tom mage. | Låg–medel |

Samlat alternativ: en enda extra ruta, *"Jag har en kronisk sjukdom eller tar regelbundet mediciner"*, med rådet att prata med vården innan fastor över 24 timmar. Den är enklare för användaren och täcker det mesta.

