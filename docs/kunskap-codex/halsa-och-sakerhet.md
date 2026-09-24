# Hälsa och säkerhet

Kod: `js/data.js` → `HEALTH_FLAGS`

Kortet **Hälsa och säkerhet** i **Profil**. Frivilliga kryssrutor; kryss visar en kort varning, tryck på varningen visar en längre förklaring. Inget spärras (Antons beslut 2026-09-24).

**Obs:** Uppdrag 1 granskat av Codex 2026-09-24. Samtliga rutor har status förslag; inga texter är godkända eller inbyggda.

**Metodnotering för jämförelsen:** Denna leverans återanvänder den research som redan gjorts i chatten på Antons begäran. Då hade Codex läst Coworks förslag; jämförelsen är därför inte blind. Vid detta införande har docs/kunskap/ inte lästs. Källorna har kontrollerats mot forsknings- och myndighetskällor; begränsad åtkomst redovisas nedan.

Se [README.md](README.md) för hur filen används.

---

### halsa.diabetesMeds
- **Var i appen:** Profil → Hälsa och säkerhet → "Jag har diabetes och tar insulin eller blodsockersänkande medicin"
- **Status:** förslag

**Kryssruta – nu:**
> Jag har diabetes och tar insulin eller blodsockersänkande medicin

**Kryssruta – ny text:**
> Jag har diabetes eller tar en SGLT2-hämmare, till exempel Jardiance

**Kort varning – nu:**
> Fasta kan ge för lågt blodsocker när du tar sådan medicin. Prata med din läkare eller diabetessköterska innan du fastar.

**Kort varning – ny text:**
> Vid diabetes eller behandling med en SGLT2-hämmare behöver fasta planeras med vården. Prata med din läkare eller diabetessköterska innan du börjar.

**Lång förklaring – nu:**
> Insulin och vissa tabletter sänker blodsockret även när du inte äter. Under en fasta kan blodsockret då bli för lågt, vilket kan ge skakighet, svettningar, förvirring och i värsta fall medvetslöshet. Vissa andra diabetesmediciner kan ge en farlig syraförgiftning (ketoacidos) vid långvarig fasta. Ofta behöver doserna ändras före och under fastan, och det ska göras tillsammans med vården.

**Lång förklaring – ny text:**
> Risken beror på din sjukdom, dina läkemedel och hur länge du fastar. Insulin och vissa diabetesläkemedel kan ge för lågt blodsocker när du inte äter. SGLT2-hämmare används också vid hjärt- och njursjukdom och kan i vissa situationer orsaka ketoacidos, en allvarlig försurning av blodet. Risken ökar bland annat vid långvarig fasta eller vätskebrist, och blodsockret behöver inte vara högt. Planera därför fastan med vården och ändra inte medicineringen på egen hand.

**Källor nu:** Grajower & Horne 2019 (Nutrients); IDF-DAR, riktlinjer om diabetes och fasta 2021

**Källor – ny text (kort form i appen):** ADA 2026; EMA, produktinformation för Jardiance.

**Research-anteckning (Codex 2026-09-24):**

**Evidensstyrka:** Stark för de etablerade läkemedelsriskerna och stödet för individuell planering. Svag för att ange en generell säker fastelängd eller exakt risk vid 24–72 timmars fasta. Bedömningen är en redaktionell sammanvägning, inte en ny formell GRADE-analys.

**Bedömning:** Behåll varningen och den bredare identifieringen av SGLT2-läkemedel. Nyansera riskbeskrivningen och dosformuleringen.

ADA:s riktlinjer för 2026 tar upp hypoglykemirisk med insulin och vissa andra läkemedel samt ketoacidos och vätskeförlust vid SGLT2-behandling. Långvarig fasta anges som en risksituation. Därför är det missvisande att skriva om alla blodsockersänkande läkemedel som en enhetlig riskgrupp. ”Behandlingen kan behöva anpassas” är mer träffsäkert än ett generellt ”doserna behöver ofta ändras”. [3]

EMA bekräftar att Jardiance används vid typ 2-diabetes, hjärtsvikt och kronisk njursjukdom. Produktinformationen beskriver ketoacidos, ibland utan särskilt högt blodsocker, och riskfaktorer som begränsat matintag och uttorkning. Det finns alltså direkt stöd för att även fånga upp användare utan diabetes. [4]

IDF-DAR:s uppdaterade riskbedömning för 2026 finns publicerad, men avser ramadanfasta hos personer med diabetes. Den bedömer flera faktorer tillsammans; insulinbehandling innebär inte automatiskt samma riskklass för alla. Den ersätter inte bedömning av längre fastor i appen. [5]

**Redaktionellt:** Den bredare kryssrutan är mitt förslag, inte en medicinsk riskklassning. Den innebär vårdkontakt, inte ett påstående att alla personer med diabetes har samma risk. Det befintliga ID:t kan behållas.

**Kontroll av ursprungliga källor:**
- **Grajower & Horne 2019:** Finns: *Clinical Management of Intermittent Fasting in Patients with Diabetes Mellitus*. Nutrients 11(4):873. [DOI](https://doi.org/10.3390/nu11040873). Expertperspektiv, inte systematisk översikt. Behåll som bakgrund; prioritera aktuell läkemedelsinformation och riktlinjer.
- **IDF-DAR 2021:** Finns som Hassanein M m.fl., *Diabetes and Ramadan: Practical guidelines 2021*. Diabetes Research and Clinical Practice 2022;185:109185. [DOI](https://doi.org/10.1016/j.diabres.2021.109185). Årtalet i titeln skiljer sig från tidskriftens publiceringsår. Ramadan-specifikt.

**Fullständiga referenser och läsbegränsningar:**

**[3]** American Diabetes Association Professional Practice Committee for Diabetes (2026). *9. Pharmacologic Approaches to Glycemic Treatment: Standards of Care in Diabetes—2026*. Diabetes Care 49(Suppl 1), med början S183. DOI: 10.2337/dc26-S009. [Artikel](https://diabetesjournals.org/care/article/49/Supplement_1/S183/163934/9-Pharmacologic-Approaches-to-Glycemic-Treatment). Kontrollerade relevanta läkemedels- och riskavsnitt; inte en granskning av hela riktlinjesamlingen.

**[4]** European Medicines Agency. *Jardiance – EPAR* och produktinformation för empagliflozin. [Indikationer](https://www.ema.europa.eu/en/medicines/human/EPAR/jardiance), [produktinformation](https://www.ema.europa.eu/en/documents/product-information/jardiance-epar-product-information_en.pdf). Relevanta indikationer och varningar kontrollerade. Myndighetskälla, inte en forskningsstudie; åtkomstdatum 2026-09-24.

**[5]** Afandi B, Suliman M, Shaikh S, Beshyah SA, Hasannien M. *The 2026 Update of the IDF-DAR Risk Calculator for Fasting in People with Diabetes*. Journal of Diabetes and Endocrine Practice. Publicerad online 21 november 2025. DOI: 10.1055/s-0045-1813010. [Artikel hos IDF](https://idf.org/media/uploads/2026/02/IDF-DAR-Risk-Calculator-Update-2026.pdf). Kontrollerade abstract och relevanta fulltextavsnitt. Konsensusbaserad uppdatering med observationsunderlag; titeln säger 2026, onlinepubliceringen 2025.

---

### halsa.pregnant
- **Var i appen:** Profil → Hälsa och säkerhet → "Jag är gravid eller ammar"
- **Status:** förslag

**Kryssruta – nu:**
> Jag är gravid eller ammar

**Kryssruta – ny text:**
> _(ingen ändring)_

**Kort varning – nu:**
> Under graviditet och amning behöver kroppen jämn tillgång till energi och näring. Fasta rekommenderas inte utan att du först pratat med barnmorska eller läkare.

**Kort varning – ny text:**
> Under graviditet och amning är det särskilt viktigt att få tillräckligt med näring. Prata med barnmorska, BVC eller läkare innan du börjar fasta.

**Lång förklaring – nu:**
> När du är gravid eller ammar behöver du mer energi, näring och vätska än vanligt. Hos gravida går kroppen snabbare över till att bränna fett vid långa matuppehåll, och det är inte klarlagt hur det påverkar barnet. Därför rekommenderas regelbundna måltider. Vill du ändå prova fasta, gör det bara efter att ha pratat med din barnmorska eller läkare.

**Lång förklaring – ny text:**
> Forskningen räcker inte för att säga att fasta under graviditet är säker för barnet. Studier av ramadanfasta har ofta inte visat tydliga skillnader i födelsevikt, men det finns osäkerhet om andra och långsiktiga effekter. Resultaten kan inte utan vidare överföras till flera dygn utan mat eller till amning. När du ammar behöver kroppen extra energi och näring för att producera mjölk. Prata med barnmorska, BVC eller läkare om ett upplägg som passar dig.

**Källor nu:** Livsmedelsverket, råd om mat för gravida och ammande; Metzger m.fl. 1982 (Lancet)

**Källor – ny text (kort form i appen):** Al-Taiar m.fl. 2025; Pradella m.fl. 2024; Livsmedelsverket.

**Research-anteckning (Codex 2026-09-24):**

**Evidensstyrka:** Stark för behovet av tillräcklig näring. Svag för att fastställa säkerhet vid fasta under graviditet eller amning; vissa långsiktiga graviditetsutfall har låg till måttlig evidens i översikten. Vårdhänvisningen är ett försiktighetsråd.

**Bedömning:** Behåll rådet om vårdkontakt. Ta bort fysiologiska detaljer och skilj på vad som studerats under graviditet respektive amning.

Al-Taiar med flera 2025 sammanställde 13 översikter: nio systematiska och fyra narrativa. Många analyser visade ingen tydlig skillnad i exempelvis födelsevikt eller förtidsbörd. Det är dock inte liktydigt med att alla relevanta risker har uteslutits; utfallen och underlagets kvalitet varierade. [6]

Pradella med flera 2024 inkluderade 31 publikationer, varav 22 ingick i metaanalyser, och studerade även hälsa senare i livet. De rapporterade samband med vissa sämre senare utfall. Evidensen bedömdes som låg till måttlig. En central begränsning är att delar av forskningen mäter att graviditeten sammanföll med ramadan, inte säkert hur mycket kvinnan faktiskt fastade. Andra förändringar under ramadan kan bidra. Därför ska sambanden varken döljas eller beskrivas som bevis för att fasta orsakar skador. [7]

Livsmedelsverkets aktuella råd stöder att näringsbehovet förändras under graviditet och amning. Graviditetsöversikterna belägger däremot inte säkerheten vid amning. Jag hittade inte ett tillräckligt robust direkt underlag för att lova att fasta är säker för mjölkproduktion eller barnets tillväxt. [8–9]

**Redaktionellt:** Hänvisningen till vården är ett försiktighetsråd. Texten hävdar varken att all fasta är bevisat skadlig eller att kortare fasta är bevisat säker.

**Kontroll av ursprungliga källor:**
- **Livsmedelsverket L 2020 nr 08:** Rapporten *Hälsosamma matvanor under graviditet och amning* finns. [Rapport](https://www.livsmedelsverket.se/globalassets/publikationsdatabas/rapporter/2020/l-2020-nr-08-halsosamma-matvanor-under-graviditet-och-amning.pdf). Appförslagen stöds av aktuella råd [8–9].
- **Metzger m.fl. 1982:** Finns: *“Accelerated starvation” and the skipped breakfast in late normal pregnancy*. Lancet 1(8272):588–592. [DOI](https://doi.org/10.1016/S0140-6736(82)91750-0). Referens och abstract kontrollerade. Enskild fysiologisk studie; borttagen som grund för apptext enligt uppdragets evidenskrav.

**Fullständiga referenser och läsbegränsningar:**

**[6]** Al-Taiar A, Rahman ME, Salama M, Ziyab AH, Karmaus W (2025). *Impacts of Ramadan fasting during pregnancy on pregnancy and birth outcomes: An umbrella review*. International Journal of Gynecology & Obstetrics 169(3):968–978. DOI: 10.1002/ijgo.16127. [Artikel](https://obgyn.onlinelibrary.wiley.com/doi/10.1002/ijgo.16127). Kontrollerade metod, ingående översikter och relevanta utfall i fulltext.

**[7]** Pradella F, Witte P, van Ewijk R (2024). *Ramadan during pregnancy and offspring health outcomes over the life course: a systematic review and meta-analysis*. Human Reproduction Update 30(6):789–812. DOI: 10.1093/humupd/dmae026. [PubMed](https://pubmed.ncbi.nlm.nih.gov/39178355/). Abstract och tillgängliga metod-/slutsatsutdrag kontrollerade; inte fullständig granskning av varje ingående studie eller bilaga.

**[8]** Livsmedelsverket. *Bra mat när du är gravid*. Senast granskad 2025-05-23 enligt den lästa sidan. [Råd](https://www.livsmedelsverket.se/matvanor-halsa--miljo/kostrad/gravida/bra-mat-nar-du-ar-gravid). Myndighetsråd om näring, inte ett fastespecifikt säkerhetsutlåtande.

**[9]** Livsmedelsverket. *Kostråd för ammande*. [Råd](https://www.livsmedelsverket.se/matvanor-halsa--miljo/kostrad/ammande/). Kontrollerat stöd för ökat energi- och näringsbehov vid mjölkproduktion; åtkomstdatum 2026-09-24.

---

### halsa.eatingDisorder
- **Var i appen:** Profil → Hälsa och säkerhet → "Jag har eller har haft en ätstörning"
- **Status:** förslag

**Kryssruta – nu:**
> Jag har eller har haft en ätstörning

**Kryssruta – ny text:**
> _(ingen ändring)_

**Kort varning – nu:**
> Fasta bygger på strikta regler kring mat, vilket kan göra en ätstörning värre eller leda till återfall. Prata gärna med vården innan du börjar.

**Kort varning – ny text:**
> Om du har eller har haft en ätstörning, prata med vården innan du börjar fasta. Följ i första hand den måltidsplan du har fått i behandlingen.

**Lång förklaring – nu:**
> Att hoppa över måltider och följa fasta tider för mat liknar beteenden som hör ihop med ätstörningar. Studier har sett ett samband mellan periodisk fasta och fler ätstörningssymtom, särskilt hos unga. Om du har eller har haft en ätstörning är det klokt att prata med vården innan du provar fasta. Stöd finns hos 1177 och Frisk & Fri.

**Lång förklaring – ny text:**
> Regelbundet ätande är en del av behandlingen vid flera ätstörningar. Forskningen räcker inte för att säga att periodisk fasta är säker för personer som har eller har haft en ätstörning. Ta därför hjälp av din behandlare eller vårdcentral innan du ändrar när du äter. På 1177 finns information om hur du söker hjälp.

**Källor nu:** Ganson m.fl. 2022 (Eating Behaviors); Cuccolo m.fl. 2022 (Eating Disorders)

**Källor – ny text (kort form i appen):** NICE NG69; Vizthum m.fl. 2023; 1177.

**Research-anteckning (Codex 2026-09-24):**

**Evidensstyrka:** Stark riktlinjeförankring för regelbundet ätande inom behandling. Svag direkt evidens för hur fasta påverkar återfallsrisk och säkerhet hos personer med tidigare ätstörning. Samband i enkäter ska inte beskrivas som orsak.

**Bedömning:** Behåll tydlig försiktighet, men undvik att framställa ett orsakssamband eller en fastställd återfallsrisk som bevisad.

Vizthum, Katz och Pacanowskis systematiska översikt 2023 omfattade 16 studier. Den fann inte stora samlade förändringar i uppmätta ätstörningssymtom vid tidsbegränsat ätande, men kvalitativa resultat beskrev bland annat oro kring hunger och mat. Det är en bättre sammanställningskälla än att enbart hänvisa till enstaka enkäter. Översikten ger inte stöd för att garantera säkerhet för personer med tidigare ätstörning. [10]

NICE:s behandlingsriktlinje rekommenderar bland annat regelbundet ätande vid hetsätningsstörning och att undvika bantning under behandling eftersom det kan utlösa hetsätning. Det stöder ett försiktighetsråd, men är inte ett direkt experimentellt bevis om alla former av fasta eller återfall vid alla ätstörningsdiagnoser. [11]

Formuleringen att ”äta efter fasta tider liknar beteenden som hör ihop med ätstörningar” bör tas bort. Regelbundna tider kan tvärtom ingå i behandling. Den relevanta frågan är restriktion, otillräckligt intag och hur upplägget fungerar för personen. [11]

**Redaktionellt:** Detta är ett försiktighetsråd. Jag föreslår ingen siffra för återfallsrisk, eftersom det granskade underlaget inte ger en tillförlitlig sådan. [10–12]

**Kontroll av ursprungliga källor:**
- **Ganson m.fl. 2022:** Finns: *Intermittent fasting: Describing engagement and associations with eating disorder behaviors and psychopathology among Canadian adolescents and young adults*. Eating Behaviors 47:101681. [PubMed](https://pubmed.ncbi.nlm.nih.gov/36368052/), DOI 10.1016/j.eatbeh.2022.101681. Abstract kontrollerat; 2 762 deltagare. Observationssamband, inte belägg för orsak eller återfallsrisk.
- **Cuccolo m.fl. 2022:** Finns: *Intermittent fasting implementation and association with eating disorder symptomatology*. Eating Disorders 30(5):471–491. [PubMed](https://pubmed.ncbi.nlm.nih.gov/34191688/), DOI 10.1080/10640266.2021.1922145. Abstract beskriver 64 personer som fastade. För litet och fel studiedesign för att ensamt bära säkerhetspåståendet.

**Fullständiga referenser och läsbegränsningar:**

**[10]** Vizthum D, Katz SE, Pacanowski CR (2023). *The impact of time restricted eating on appetite and disordered eating in adults: A mixed methods systematic review*. Appetite 183:106452. DOI: 10.1016/j.appet.2023.106452. [PubMed](https://pubmed.ncbi.nlm.nih.gov/36610542/), [tidskrift](https://www.sciencedirect.com/science/article/pii/S0195666323000053). Kontrollerat abstract och bibliografi. Fulltextens samtliga urvalskriterier har inte granskats; därför inga precisa påståenden om hur ofta tidigare ätstörning uteslöts.

**[11]** NICE. *Eating disorders: recognition and treatment*, NG69. [Rekommendationer](https://www.nice.org.uk/guidance/NG69/chapter/recommendations), särskilt avsnitt 1.4 om hetsätningsstörning och 1.5 om bulimi. Relevanta behandlingsråd kontrollerade; åtkomstdatum 2026-09-24. Riktlinje, inte fastespecifik effektstudie.

**[12]** 1177. *Ätstörningar*. [Vårdinformation](https://www.1177.se/Vastra-Gotaland/sjukdomar--besvar/psykiska-sjukdomar-och-besvar/atstorningar/atstorningar/). Används för vårdhänvisning; åtkomstdatum 2026-09-24.

---

### halsa.under18
- **Var i appen:** Profil → Hälsa och säkerhet → "Jag är under 18 år"
- **Status:** förslag

**Kryssruta – nu:**
> Jag är under 18 år

**Kryssruta – ny text:**
> _(ingen ändring)_

**Kort varning – nu:**
> Kroppen växer fortfarande och behöver regelbunden energi. Fasta rekommenderas inte för barn och unga.

**Kort varning – ny text:**
> Är du under 18 år, börja inte med periodisk fasta på egen hand. Prata med skolsköterskan eller vården om frågor kring mat och vikt.

**Lång förklaring – nu:**
> Under uppväxten och puberteten behöver kroppen jämn tillgång till energi och näring för att växa och utvecklas. Hos unga har periodisk fasta också kopplats till ätstörningsbeteenden. Ät hellre regelbundet, och prata med skolsköterskan eller vården om du har frågor om mat och vikt.

**Lång förklaring – ny text:**
> Under uppväxten behöver du tillräckligt med energi och näring för att växa och utvecklas. Regelbundna måltider hjälper dig att få i dig det du behöver. Forskningen om periodisk fasta hos barn och ungdomar är fortfarande begränsad. Kostupplägg som används inom vården behöver anpassas och följas upp, och är inte samma sak som att själv följa ett fasteschema i en app.

**Källor nu:** Ganson m.fl. 2022 (Eating Behaviors); Livsmedelsverket, kostråd för barn och unga

**Källor – ny text (kort form i appen):** Livsmedelsverket; Bakhsh m.fl. 2024.

**Research-anteckning (Codex 2026-09-24):**

**Evidensstyrka:** Stark för allmänna näringsbehov under uppväxten. Svag för långsiktig säkerhet vid egeninitierad periodisk fasta hos minderåriga. Vårdhänvisning och 18-årsavgränsning är försiktighetsbedömningar, inte en biologiskt fastställd tröskel.

**Bedömning:** Behåll vårdhänvisningen. Ta bort uttryck som ”jämn tillgång till energi”, som kan låta som att ett kontinuerligt energiintag är fysiologiskt nödvändigt.

Livsmedelsverket ger råd om måltider för barn och ungdomar, men myndighetens svar om måltidsordning anger också att exakt fördelning över dagen har svagt vetenskapligt stöd. Därför bör ett bestämt antal mellanmål inte framställas som den vetenskapliga gränsen mellan säker och osäker fasta. [13]

Bakhsh med flera publicerade en kartläggande översikt av unga 10–25 år med 34 studier. Metoder och deltagare skilde sig mycket. Åldersspannet inkluderar vuxna och resultaten får inte beskrivas som om alla deltagare vore barn. Detta är en peer-reviewad kartläggning, inte en metaanalys som fastställer långsiktig säkerhet. [14]

**Redaktionellt:** 18-årsgränsen är en föreslagen avgränsning för appens egenanvändning, inte en påstådd biologisk tröskel. Översikten stöder att kunskapsläget är begränsat; rådet är en försiktighetsbedömning. [13–14]

**Kontroll av ursprungliga källor:**
- **Ganson m.fl. 2022:** Finns: *Intermittent fasting: Describing engagement and associations with eating disorder behaviors and psychopathology among Canadian adolescents and young adults*. Eating Behaviors 47:101681. [PubMed](https://pubmed.ncbi.nlm.nih.gov/36368052/), DOI 10.1016/j.eatbeh.2022.101681. Abstract kontrollerat; 2 762 deltagare. Observationssamband, inte belägg för orsak eller återfallsrisk.

**Fullständiga referenser och läsbegränsningar:**

**[13]** Livsmedelsverket. *Barn och ungdomar 2–17 år* samt *Måltidsordning i skola och förskola* (uppdaterad 2023-07-14). [Barnråd](https://www.livsmedelsverket.se/matvanor-halsa--miljo/kostrad/barn-och-ungdomar/barn-2-17-ar/), [förtydligande om evidensen](https://fragor.livsmedelsverket.se/org/livsmedelsverket/d/maltidsordning-i1zi/). Råd och förtydligande kontrollerade. Svaret från 2023 är inte en ny systematisk översikt.

**[14]** Bakhsh J, Salvy SJ, Vidmar AP (2024). *Intermittent fasting as a treatment for obesity in young people: a scoping review*. npj Metabolic Health and Disease. DOI: 10.1038/s44324-024-00041-2. [Publicerad artikel](https://www.nature.com/articles/s44324-024-00041-2), [PubMed](https://pubmed.ncbi.nlm.nih.gov/39744147/). Kontrollerade abstract och relevanta metod-/slutsatsavsnitt. Den tidigare versionen med titeln *Intermittent Fasting in Youth* används inte som huvudreferens.

---

### halsa.friskrivning
- **Var i appen:** Profil → Hälsa och säkerhet → raden längst ner
- **Status:** förslag

**Text – nu:**
> FASTA ger allmän information och ersätter inte råd från vården. Känner du dig sjuk under en fasta – ät och kontakta vården vid behov.

**Text – ny text:**
> FASTA ger allmän information och ersätter inte råd från vården. Avbryt fastan om du mår dåligt och ring 1177 för råd; ring 112 vid medvetslöshet eller annat livshotande tillstånd.

**Källor nu:** _(inga angivna)_

**Källor – ny text (kort form i appen):** 1177.

**Research-anteckning (Codex 2026-09-24):**

**Evidensstyrka:** Starkt stöd i svensk vårdinformation för vårdhänvisningen. Rådet att avbryta vid sjukdomskänsla är en försiktighetsregel; texten är inte ett fullständigt akutprotokoll.

**Bedömning:** Första meningen beskriver appens roll. Symtom och vårdhänvisningar är däremot säkerhetsinformation och bör ha källor i kunskapsbasen.

1177 beskriver att lågt blodsocker kan ge bland annat svettning, skakighet och förvirring och kan bli allvarligt. Vid medvetslöshet ska 112 kontaktas. Därför är det olämpligt att lägga förvirring i samma odifferentierade ”vid behov”-formulering som lindrigare besvär. [15]

**Redaktionellt:** Detta är en kort generell hänvisning, inte fullständig första hjälpen. Den ska inte ersätta en individuell plan för exempelvis diabetes. Bedömning av appens eventuella medicintekniska klassificering ingår inte i denna forskningsgranskning.

**Kontroll av ursprungliga källor:**
- Inga källor angavs ursprungligen. Vårdhänvisningen har nu källa [15].

**Fullständiga referenser och läsbegränsningar:**

**[15]** 1177. *Insulinkänning vid diabetes*. [Symtom och vårdhänvisning](https://www.1177.se/sjukdomar--besvar/diabetes/insulinkanning/). Relevanta säkerhetsråd kontrollerade; åtkomstdatum 2026-09-24.

---


## Gemensam research-anteckning: metod och säkerhetsunderlag

Jag sökte efter publicerade systematiska översikter, metaanalyser och riktlinjer, med särskilda sökningar efter material från 2025–2026. Jag kontrollerade också referenserna som redan stod i underlaget. Exempel på sökningar var ”intermittent fasting adverse events systematic review meta analysis”, ”Ramadan pregnancy umbrella review”, ”intermittent fasting disordered eating systematic review” och ”2026 prolonged fasting SGLT2”.

Detta är en riktad evidensgranskning, inte en fullständig systematisk litteraturöversikt med förregistrerat protokoll och två oberoende granskare. Jag anger när bara referens eller abstract har kunnat kontrolleras. En verifierad titel betyder inte att hela innehållet har granskats.

Peer review är ett grundkrav för de vetenskapliga huvudkällorna, men garanterar inte stark evidens. För läkemedel och svenska vårdhänvisningar använder jag även EMA, Livsmedelsverket och 1177. Dessa är myndighets- och vårdkällor, inte peer-reviewade forskningsartiklar. Kliniska riktlinjer innehåller dessutom professionella bedömningar där experimentella data saknas.

Inga föreslagna apptexter bygger enbart på en liten enskild studie. Sådana studier förekommer nedan endast för att granska befintliga hänvisningar. När kunskapsläget inte räcker föreslår jag en enklare text eller ett uttryckligt försiktighetsråd.

**Cochrane 2026:** Garegnani med flera inkluderade 22 randomiserade studier med 1 995 vuxna med övervikt eller obesitas. Evidensen om oönskade händelser var mycket osäker; jämförelsen med vanliga kostråd byggde för detta utfall på sju studier med 619 deltagare. Uppföljningen sträckte sig högst till tolv månader. Översikten publicerades 2026, men litteratursökningen slutade den 5 november 2024. Ett nytt publiceringsår betyder alltså inte automatiskt att de ingående studierna är nya. [1]

**Metaanalys 2024:** Zhong med flera sammanställde 15 randomiserade studier med 1 365 vuxna. De fann inte någon statistiskt säkerställd ökning av trötthet, huvudvärk eller avhopp. Uppläggen omfattade bland annat dagliga ätfönster, 5:2 och 4:3. Det är inte belägg för att sammanhängande 72-timmarsfasta är säker. Studiernas urval och begränsade uppföljning gör också att frånvaro av en påvisad riskskillnad inte kan användas som säkerhetsgaranti för appens samtliga användare. [2]

**Praktisk tolkning:** Håll isär tidsbegränsat ätande, dagar med minskat energiintag, ramadanfasta utan mat och dryck under dagen samt flera dygn utan mat. Skillnader i vätskeintag, läkemedel och deltagarurval påverkar om resultat går att överföra.

**Evidensstyrka:** Svag/mycket osäker för en generell säkerhetsgaranti, särskilt i riskgrupper och vid flera dygn utan mat. Detta ska inte förväxlas med starkare stöd för specifika läkemedelsrisker.

**[1]** Garegnani LI, Oltra G, Ivaldi D m.fl. (2026). *Intermittent fasting for adults with overweight or obesity*. Cochrane Database of Systematic Reviews, Issue 2, CD015610. DOI: 10.1002/14651858.CD015610.pub2. [Cochranes sammanfattning och bibliografi](https://www.cochrane.org/evidence/CD015610_intermittent-fasting-traditional-dietary-advice-or-no-treatment-which-works-better-help-adults). Lästa: publicerad sammanfattning, sökdatum, huvudresultat och begränsningar. Hela fulltexten och bilagorna har inte granskats.

**[2]** Zhong F, Zhu T, Jin X, Chen X, Wu R, Shao L, Wang S (2024). *Adverse events profile associated with intermittent fasting in adults with overweight or obesity: a systematic review and meta-analysis of randomized controlled trials*. Nutrition Journal 23:72. DOI: 10.1186/s12937-024-00975-9. [Artikel](https://link.springer.com/article/10.1186/s12937-024-00975-9). Kontrollerade i fulltext: resultat, sökdatum, populationer, upplägg och risk för bias.

## Förslag: riskgrupper som saknas

Inga nya rutor har skapats.

| Grupp | Bedömning och avgränsning | Underlag |
|---|---|---|
| Undervikt, ofrivillig viktnedgång eller undernäring | Hög prioritet för en kompletterande fråga. Använd inte BMI ensamt; även viktförlust och lågt intag spelar roll. | NICE CG32 [16]. Riktlinje om näringsrisk, inte ett fastespecifikt försök. |
| Skörhet, nedsatt aptit eller muskelförlust hos äldre | Hög prioritet när näringsrisk finns. Ålder över 70 år ensam är en alltför grov gräns. | ESPEN:s geriatriska riktlinje avråder generellt från kostrestriktioner och betonar individuell bedömning [17]. |
| Njur- eller hjärtsjukdom, läkemedel som påverkar vätska eller blodtryck | Motiverar vårdkontakt och läkemedelsgenomgång. Alla diagnoser eller läkemedel innebär inte samma risk. | ADA och EMA [3–4]; IDF-DAR gäller uttryckligen personer med diabetes [5]. |
| Läkemedel som ska tas med mat | Fråga läkare eller apotek om det egna läkemedlet. Undvik breda exempel som ”värktabletter” utan kontroll av respektive produktinformation. | Redaktionellt förslag om individuell kontroll, inget generellt påstående om hela läkemedelsgrupper. |

**Förslag till samlingsfråga:** ”Jag har en sjukdom eller tar läkemedel som kan påverkas av att jag inte äter.” Rådet kan vara att fråga vården eller apoteket innan fastan. Undervikt och ofrivillig viktnedgång bör ändå synas separat, eftersom användaren kanske inte betraktar det som en sjukdom.

Jag avråder från tillägget ”innan fastor över 24 timmar”. Varken den allmänna säkerhetsforskningen eller läkemedelsunderlaget här fastställer 24 timmar som en gemensam säkerhetsgräns. [1–5]

**Evidensstyrka:** Stark riktlinjeförankring för att identifiera undernäring och näringsrisk; svag direkt evidens för exakta fastetider inom dessa grupper. Förslagen är försiktighetsbedömningar och innebär inte nya rutor.

**[16]** NICE. *Nutrition support for adults: oral nutrition support, enteral tube feeding and parenteral nutrition*, CG32. [Rekommendationer, avsnitt 1.2–1.3](https://www.nice.org.uk/guidance/cg32/chapter/recommendations). Äldre riktlinje, använd här för etablerad identifiering av undernäring och näringsrisk, inte som ny forskning om fasta.

**[17]** Volkert D, Beck AM, Cederholm T m.fl. (2022). *ESPEN practical guideline: Clinical nutrition and hydration in geriatrics*. Clinical Nutrition 41:958–989. [PubMed](https://pubmed.ncbi.nlm.nih.gov/35306388/), [riktlinje](https://2022.espen.org/files/ESPEN-Guidelines/ESPEN_practical_guideline_Clinical_nutrition_and_hydration_in_geriatrics.pdf). Kontrollerat sammanfattat råd om att generellt undvika kostrestriktioner och individualisera nutritionsbehandling hos äldre.
