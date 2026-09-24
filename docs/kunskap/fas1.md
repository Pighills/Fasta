# Fas 1 – mål, fasteprogram och daglig check-in

Kod: `js/data.js` → _(nya konstanter, fylls i av Claude Code, t.ex. `GOALS`, `PROGRAMS`, `CHECKIN`)_

Texter för de nya funktionerna i Fas 1: mål i Profil, fasteprogram på Timer och daglig check-in med trender i Historik. Skrivna av Cowork 2026-09-25 (uppdrag 5). Alla rutor är nya och har status `förslag`.

Se [README.md](README.md) för hur filen används.

---

## Frågor till Anton (produktbeslut)

Texterna nedan bygger på förslagen i den här listan. Ändra gärna direkt i filen.

1. **Vilka program ska finnas från start?** Förslag: tre program – *Kom igång* (4 veckor, 12 → 16 timmar), *16:8 som vana* (8 veckor) och *Tidigt ätfönster* (8 veckor). Längre fastor (36–72 h) som program föreslås **inte**, eftersom de redan kräver vårdhänvisning.
2. **Viktmål under normalvikt:** Förslag: appen **tillåter inte** en målvikt som ger BMI under 18,5 (kräver att längd finns i profilen). Alternativet är bara en varning. Skäl att spärra: appen ska inte hjälpa någon att sikta på undervikt.
3. **Hälsofrågorna och viktmål:** Om "ätstörning" eller "under 18 år" är ikryssat – ska viktmål och vägning i check-in döljas? Du har tidigare valt att hälsofrågorna inte spärrar något. Förslag: behåll det, men visa rutan `mal.viktHalsa` i stället för hjälptexten.
4. **Check-in-skalor:** Förslag: Energi, Hunger och Sömn (1–5), vikt (valfri) och besvär att kryssa i (huvudvärk, yrsel, trötthet, illamående). Humör föreslås inte – det kan ge intryck av att appen följer psykisk hälsa.

---

## Mål (Profil → Mål)

### mal.intro
- **Var i appen:** Profil → kortet "Mål" → text överst
- **Status:** förslag

**Text – nu:**
> _(ny ruta, finns inte i appen än)_

**Text – ny text:**
> Sätt ett mål som du kan följa, till exempel hur många fastor du vill göra i veckan eller en målvikt. Målet är ditt eget, och du kan ändra det när du vill.

**Källor nu:** –

**Research-anteckning (Cowork 2026-09-25):**
- Inget hälsopåstående, ingen källa behövs.

---

### mal.vikt
- **Var i appen:** Profil → Mål → hjälptext under fältet "Målvikt"
- **Status:** förslag

**Text – nu:**
> _(ny ruta, finns inte i appen än)_

**Text – ny text:**
> Ett rimligt första mål är ofta att gå ner 3–5 procent av din vikt. Vid övervikt kan redan det ge tydliga hälsovinster.

**Källor nu:** –

**Källa i appen – ny text:** Wharton m.fl., CMAJ 2020

**Research-anteckning (Cowork 2026-09-25):**
- **Underlag:** Kanadas kliniska riktlinje för obesitas hos vuxna: *Wharton S, Lau DCW, Vallis M m.fl. Obesity in adults: a clinical practice guideline. CMAJ 2020;192(31):E875–E891. doi:10.1503/cmaj.191707* (PMID 32753461; bekräftad via PubMed). Citat ur riktlinjen (läst på cmaj.ca): "The weight loss achieved with health behavioural changes is usually 3%–5% of body weight, which can result in meaningful improvement in obesity-related comorbidities."
- **Formulering:** Riktlinjen talar om förbättring av följdsjukdomar till obesitas i allmänhet, inte specifikt blodtryck eller blodsocker, därför den allmänna formuleringen "hälsovinster".
- **Därför "vid övervikt":** riktlinjen gäller personer med övervikt och obesitas. För normalviktiga finns inget stöd för att viktnedgång ger hälsovinster, och texten ska inte uppmuntra det.
- **Ingen takt per vecka:** Jag hittade ingen svensk myndighet (1177, Livsmedelsverket) som anger en rekommenderad takt i kg per vecka, och den kanadensiska riktlinjen anger ingen heller. Därför anger texten ingen takt.
- **Förkastad källa:** Tahrani & Morton 2022 (*Obesity*, doi:10.1002/oby.23371) säger också att 5–10 % är kliniskt betydelsefullt, men förstaförfattaren är anställd på Novo Nordisk. Den används inte.

---

### mal.viktSparr
- **Var i appen:** Profil → Mål → meddelande när målvikten ger BMI under 18,5
- **Status:** förslag

**Text – nu:**
> _(ny ruta, finns inte i appen än)_

**Text – ny text:**
> Den här målvikten ger ett BMI under 18,5, vilket räknas som undervikt. Välj en högre målvikt. Vill du gå ner mer, prata först med vården.

**Källor nu:** –

**Källa i appen – ny text:** 1177

**Research-anteckning (Cowork 2026-09-25):**
- **BMI-gränser:** 1177, *Så bedömer du din vikt* (senast uppdaterad 2022-09-13, faktagranskad av läkare vid Obesitascentrum): under 18,5 = undervikt, 18,5–24,9 = normalvikt, 25–29,9 = övervikt, 30 eller högre = obesitas. https://www.1177.se/liv--halsa/sunda-vanor/sa-bedomer-du-din-vikt/
- **För Claude Code:** BMI = vikt (kg) / längd (m)². Kräver att längd finns i profilen; saknas längd visas ingen spärr. Se fråga 2 till Anton om spärr eller varning.
- Kopplar till Coworks tidigare förslag om undervikt som riskgrupp (`halsa-och-sakerhet.md`), som Anton valde att inte lägga till som kryssruta. Det här är en mindre åtgärd som täcker det viktigaste fallet.

---

### mal.viktHalsa
- **Var i appen:** Profil → Mål → visas i stället för `mal.vikt` om "ätstörning" eller "under 18 år" är ikryssat i Hälsa och säkerhet
- **Status:** förslag

**Text – nu:**
> _(ny ruta, finns inte i appen än)_

**Text – ny text:**
> Du har angett något i Hälsa och säkerhet som gör att ett viktmål kan vara olämpligt. Prata med vården innan du sätter ett mål för din vikt.

**Källor nu:** –

**Research-anteckning (Cowork 2026-09-25):**
- Bygger på de redan granskade texterna `halsa.eatingDisorder` och `halsa.under18` (se `halsa-och-sakerhet.md`). Inget nytt hälsopåstående.
- Se fråga 3 till Anton.

---

## Program (Timer → Program)

### program.intro
- **Var i appen:** Timer → "Välj program" → text överst
- **Status:** förslag

**Text – nu:**
> _(ny ruta, finns inte i appen än)_

**Text – ny text:**
> Ett program är en plan för några veckor där appen föreslår hur länge du fastar varje dag. Du kan pausa, byta eller avsluta när du vill, och du behöver inte ta igen missade dagar.

**Källor nu:** –

**Research-anteckning (Cowork 2026-09-25):**
- Inget hälsopåstående, ingen källa behövs.

---

### program.komIgang
- **Var i appen:** Timer → Välj program → "Kom igång"
- **Status:** förslag

**Namn – ny text:**
> Kom igång

**Upplägg – ny text (för Claude Code, visas som veckoplan):**
> Vecka 1: 12 timmar · Vecka 2: 14 timmar · Vecka 3–4: 16 timmar

**Beskrivning – nu:**
> _(ny ruta, finns inte i appen än)_

**Beskrivning – ny text:**
> För dig som inte har fastat förut. Fastan ökar stegvis från 12 till 16 timmar under fyra veckor, så att du hinner känna efter hur kroppen reagerar. Det finns inga studier som visar att en viss upptrappning är bäst – det här är ett sätt att prova dig fram. Huvudvärk, trötthet och hunger är vanligt, men i studier har besvären oftast varit lindriga. Blir du yr eller mår dåligt, avbryt fastan.

**Källor nu:** –

**Källa i appen – ny text:** Allaf m.fl., Cochrane 2021; Chen m.fl., Front Nutr 2025

**Research-anteckning (Cowork 2026-09-25):**
- **Upptrappning:** Jag hittade inga studier som jämför olika sätt att trappa upp. Därför säger texten det rakt ut i stället för att påstå att stegvis start är bättre.
- **Lindriga besvär:** *Allaf M m.fl. Intermittent fasting for the prevention of cardiovascular disease. Cochrane Database Syst Rev 2021;1:CD013496. doi:10.1002/14651858.CD013496.pub2* (sammanfattning läst via PubMed): fyra studier rapporterade biverkningar, några deltagare fick lindrig huvudvärk. *Chen S, Zhang X, Kortas J, Liu H. Effects of time-restricted eating on body composition and metabolic parameters in overweight and obese women: a systematic review and meta-analysis. Front Nutr 2025;12:1664412. doi:10.3389/fnut.2025.1664412* (13 RCT, 612 deltagare; sammanfattning läst): fyra studier rapporterade lindriga biverkningar (t.ex. hunger, huvudvärk) som gick över av sig själva.
- **Trötthet och hunger:** *Hamsho M m.fl. Is isocaloric intermittent fasting superior to calorie restriction? Nutr Metab Cardiovasc Dis 2025;35(3):103805. doi:10.1016/j.numecd.2024.103805* (20 RCT; sammanfattning läst): grupperna som åt mindre på vanligt sätt hade mindre hunger och trötthet än fastegrupperna.
- **Osäkerhet:** Evidensen för biverkningar är svag – Cochrane 2026 (Garegnani m.fl.) bedömer den som mycket osäker. "Oftast lindriga" är det mesta man kan säga.
- **Avbryt-meningen** följer den godkända friskrivningen (`halsa.friskrivning`).

---

### program.vana168
- **Var i appen:** Timer → Välj program → "16:8 som vana"
- **Status:** förslag

**Namn – ny text:**
> 16:8 som vana

**Upplägg – ny text (för Claude Code):**
> 8 veckor · 16 timmars fasta minst 5 dagar i veckan

**Beskrivning – nu:**
> _(ny ruta, finns inte i appen än)_

**Beskrivning – ny text:**
> För dig som klarar 16:8 och vill göra det till en vana. Målet är 16 timmars fasta minst fem dagar i veckan i åtta veckor. I studier ger periodisk fasta ungefär samma viktnedgång som att äta mindre på vanligt sätt. Det viktigaste är därför att upplägget passar din vardag, så att du kan hålla fast vid det.

**Källor nu:** –

**Källa i appen – ny text:** Semnani-Azad m.fl., BMJ 2025; Garegnani m.fl., Cochrane 2026

**Research-anteckning (Cowork 2026-09-25):**
- **Samma viktnedgång som vanlig kalorirestriktion:** *Garegnani LI m.fl. Intermittent fasting for adults with overweight or obesity. Cochrane Database Syst Rev 2026;2:CD015610. doi:10.1002/14651858.CD015610.pub2* (22 RCT, 1 995 deltagare; sammanfattning läst via PubMed): jämfört med vanliga kostråd ger periodisk fasta kanske liten eller ingen skillnad i viktnedgång (låg evidenssäkerhet). Semnani-Azad m.fl. 2025 (BMJ, se fastefaser R10) visar samma sak.
- **"Minst fem dagar i veckan"** är ett produktförslag, inte ett forskningsresultat. Många studier av tidsbegränsat ätande har låtit deltagarna fasta alla dagar, men jag hittade inget stöd för ett visst antal dagar.
- **Följsamhet:** Cochrane-översikten skriver själv att valet bör bygga på vad som är praktiskt och hållbart för personen – det är grunden för sista meningen.

---

### program.tidigt
- **Var i appen:** Timer → Välj program → "Tidigt ätfönster"
- **Status:** förslag

**Namn – ny text:**
> Tidigt ätfönster

**Upplägg – ny text (för Claude Code):**
> 8 veckor · ät inom 8 timmar, sista målet före kl. 17 · till exempel 08–16 eller 09–17

**Beskrivning – nu:**
> _(ny ruta, finns inte i appen än)_

**Beskrivning – ny text:**
> Du äter inom åtta timmar och tar dagens sista mål före klockan 17. En stor sammanställning av randomiserade studier fann att ett tidigt ätfönster gav lite större viktnedgång och bättre insulinvärden än ett sent, i genomsnitt drygt ett kilo. Det kan vara svårt att få ihop med jobb, träning och middag med familjen, så välj det bara om det passar din vardag.

**Källor nu:** –

**Källa i appen – ny text:** Chen m.fl., BMJ Medicine 2026

**Research-anteckning (Cowork 2026-09-25):**
- **Underlag:** *Chen YE, Tsai HL, Tu YK, Chen LW. Effects of timing and eating duration of time restricted eating on metabolic outcomes: systematic review and network meta-analysis. BMJ Medicine 2026;5(1):e001071. doi:10.1136/bmjmed-2024-001071* (PMID 41586347; sammanfattning läst via PubMed 2026-09-25). 41 RCT, 2 287 deltagare. "Tidigt" = sista målet före kl. 17. Jämfört med sent ätfönster (sista målet efter kl. 19) gav tidigt ätfönster 1,15 kg större viktnedgång (95 % KI 0,45–1,86) och lägre fasteinsulin, med **hög** evidenssäkerhet. Resultaten för ätfönstrets **längd** var inkonsekventa.
- **Begränsning:** sökningen slutade januari 2023, så nyare studier saknas. Skillnaden är liten i praktiken.
- **Uppdaterar fastefaser R15:** resultaten var tidigare bara kontrollerade av Codex; nu läst av Cowork.

---

## Daglig check-in (Timer → Check-in, trender i Historik)

### checkin.intro
- **Var i appen:** Check-in → text överst första gången
- **Status:** förslag

**Text – nu:**
> _(ny ruta, finns inte i appen än)_

**Text – ny text:**
> Skatta hur du mår en gång om dagen – det tar tio sekunder. Efter några veckor kan du se mönster, till exempel om du sover sämre eller har mer energi vissa dagar.

**Källor nu:** –

**Research-anteckning (Cowork 2026-09-25):**
- Inget hälsopåstående, ingen källa behövs. Texten lovar inte att check-in ger bättre resultat, eftersom det inte är visat för den här typen av skattning.

---

### checkin.hunger
- **Var i appen:** Check-in → hjälptext vid skalan "Hunger"
- **Status:** förslag

**Text – nu:**
> _(ny ruta, finns inte i appen än)_

**Text – ny text:**
> Hunger är vanligt när man fastar. Är hungern stark de flesta dagar kan ett kortare fastefönster passa dig bättre.

**Källor nu:** –

**Research-anteckning (Cowork 2026-09-25):**
- **Viktigt – påstående som medvetet utelämnas:** Det sägs ofta att hungern "försvinner efter några veckor" eller att fasta minskar hungern. Det stöds inte:
  - *Elsworth RL m.fl. The Effect of Intermittent Fasting on Appetite: A Systematic Review and Meta-Analysis. Nutrients 2023;15(11):2604. doi:10.3390/nu15112604* (17 RCT, 1 111 deltagare): ingen skillnad i hunger jämfört med att äta mindre på vanligt sätt.
  - *Silva AD m.fl. Time-restricted eating increases hunger in adults with overweight and obesity: a systematic review and meta-analysis of randomized controlled studies. Nutr Res 2025;138:76–88. doi:10.1016/j.nutres.2025.04.003* (4 studier, 323 deltagare): tidsbegränsat ätande gav **mer** hunger än lika mycket mat utan tidsbegränsning.
  - Hamsho m.fl. 2025 (se `program.komIgang`): mindre hunger vid vanlig kalorirestriktion.
- Rådet om kortare fönster är praktiskt och innehåller inget hälsopåstående.

---

### checkin.besvarYrsel
- **Var i appen:** Check-in → visas om användaren kryssar i "yrsel"
- **Status:** förslag

**Text – nu:**
> _(ny ruta, finns inte i appen än)_

**Text – ny text:**
> Yrsel kan bero på för lite vätska eller mat. Drick, ät något och avbryt fastan om det inte går över. Ring 1177 för råd, eller 112 vid akuta besvär.

**Källor nu:** –

**Research-anteckning (Cowork 2026-09-25):**
- Följer den godkända friskrivningen `halsa.friskrivning` (yrsel som varningstecken, 1177/112). Sänkt blodtryck och uttorkning vid fasta: se fastefaser R9 (Ezpeleta m.fl. 2024) och `halsa.diabetesMeds`.
- Förslag till Claude Code: visa rutan direkt när yrsel kryssas i, inte bara i trenderna.

---

### checkin.vikt
- **Var i appen:** Check-in → hjälptext vid fältet "Vikt (valfritt)"
- **Status:** förslag

**Text – nu:**
> _(ny ruta, finns inte i appen än)_

**Text – ny text:**
> Väg dig på samma sätt varje gång, till exempel på morgonen efter toalettbesök. Vikten svänger från dag till dag, bland annat beroende på hur mycket vätska och mat du har i kroppen. Titta därför på trenden över flera veckor, inte på enskilda dagar.

**Källor nu:** –

**Källa i appen – ny text:** Turicchi m.fl., PLoS One 2020

**Research-anteckning (Cowork 2026-09-25):**
- **Veckosvängningar:** *Turicchi J m.fl. Weekly, seasonal and holiday body weight fluctuation patterns among individuals engaged in a European multi-centre behavioural weight loss maintenance intervention. PLoS One 2020;15(4):e0232152. doi:10.1371/journal.pone.0232152* (1 421 deltagare, uppkopplade vågar; sammanfattning läst via PubMed): vikten svängde i genomsnitt 0,35 % inom veckan, högre efter helgen och lägre under veckan.
- **Vätska och glykogen:** se `checkin.viktForstaVeckan`.
- **Siffra utelämnad:** Det sägs ofta att vikten kan variera "1–2 kg per dag". Jag hittade ingen bra källa för den siffran, så texten har ingen siffra.
- Rådet om samma tid och samma sätt är praktiskt och innehåller inget hälsopåstående.

---

### checkin.viktForstaVeckan
- **Var i appen:** Historik → trenden för vikt, visas om vikten gått ner mer än 1 kg den första veckan
- **Status:** förslag

**Text – nu:**
> _(ny ruta, finns inte i appen än)_

**Text – ny text:**
> Går vikten ner snabbt i början är en stor del ofta vatten. Kroppens sockerlager (glykogen) lagras tillsammans med vatten, och när lagret minskar försvinner vattnet också.

**Källor nu:** –

**Källa i appen – ny text:** Kreitzman m.fl., Am J Clin Nutr 1992

**Research-anteckning (Cowork 2026-09-25):**
- *Kreitzman SN, Coxon AY, Szaz KF. Glycogen storage: illusions of easy weight loss, excessive weight regain, and distortions in estimates of body composition. Am J Clin Nutr 1992;56(1 Suppl):292S–293S. doi:10.1093/ajcn/56.1.292S* (PMID 1615908; sammanfattning läst via PubMed): glykogen lagras med tre till fyra delar vatten, vilket påverkar vikten tidigt i en diet.
- **Begränsning:** Källan är gammal och liten (11 deltagare på mycket kalorifattig kost), men mekanismen är etablerad fysiologi och beskrivs också i Cahill 2006 (fastefaser R2).
- Gränsen "1 kg första veckan" är ett förslag för när rutan visas, inte ett forskningsresultat.

---

### checkin.vagning
- **Var i appen:** Check-in → inställningar → "Hur ofta vill du väga dig?"
- **Status:** förslag

**Text – nu:**
> _(ny ruta, finns inte i appen än)_

**Text – ny text:**
> Du väljer själv hur ofta du väger dig, eller om du vill låta bli. I studier av viktprogram har regelbunden vägning gett något bättre resultat, och det verkar inte spela någon roll om man väger sig varje dag eller varje vecka. Känns vägningen stressande, väg dig mer sällan.

**Källor nu:** –

**Källa i appen – ny text:** Madigan m.fl., IJBNPA 2015

**Research-anteckning (Cowork 2026-09-25):**
- *Madigan CD m.fl. Is self-weighing an effective tool for weight loss: a systematic literature review and meta-analysis. Int J Behav Nutr Phys Act 2015;12:104. doi:10.1186/s12966-015-0267-4* (sammanfattning läst via PubMed): att lägga till vägning i ett viktprogram gav 1,7 kg mer viktnedgång (4 RCT); ingen skillnad mellan daglig och veckovis vägning. Vägning **ensamt** hade inget stöd (1 studie). Därför säger texten "i studier av viktprogram".
- *Zheng Y m.fl. Self-weighing in weight management: a systematic literature review. Obesity 2015;23(2):256–265. doi:10.1002/oby.20946* (17 studier): regelbunden vägning hängde ihop med mer viktnedgång och **inte** med nedstämdhet eller oro.
- **Nyare översikter saknas:** PubMed-sökning 2020–2026 gav inga nyare systematiska översikter om vägning för viktnedgång. Källorna är från 2015 men är de bästa som finns.
- **Försiktighet:** Studierna gällde vuxna som ville gå ner i vikt. För personer med ätstörning kan täta vägningar vara olämpliga (se `halsa.eatingDisorder` och fråga 3 till Anton). Därför erbjuder texten att låta bli.

---

## Källförteckning (uppdrag 5)

Alla lästa via PubMed 2026-09-25 (sammanfattning) om inget annat anges. **R** = riktlinje/myndighet, **SÖ** = systematisk översikt/metaanalys, **S** = enskild studie.

| Referens | Typ | Används i |
|---|---|---|
| Wharton S m.fl. Obesity in adults: a clinical practice guideline. *CMAJ* 2020;192(31):E875–E891. doi:10.1503/cmaj.191707 (läst på cmaj.ca) | R | mal.vikt |
| 1177. Så bedömer du din vikt. 2022-09-13. https://www.1177.se/liv--halsa/sunda-vanor/sa-bedomer-du-din-vikt/ | R | mal.viktSparr |
| Garegnani LI m.fl. *Cochrane Database Syst Rev* 2026;2:CD015610. doi:10.1002/14651858.CD015610.pub2 | SÖ (22 RCT) | program.vana168 |
| Semnani-Azad Z m.fl. *BMJ* 2025;389:e082007 (se fastefaser R10) | SÖ (99 RCT) | program.vana168 |
| Chen YE m.fl. *BMJ Medicine* 2026;5(1):e001071. doi:10.1136/bmjmed-2024-001071 | SÖ (41 RCT) | program.tidigt |
| Allaf M m.fl. *Cochrane Database Syst Rev* 2021;1:CD013496. doi:10.1002/14651858.CD013496.pub2 | SÖ (26 studier) | program.komIgang |
| Chen S m.fl. *Front Nutr* 2025;12:1664412. doi:10.3389/fnut.2025.1664412 | SÖ (13 RCT) | program.komIgang |
| Hamsho M m.fl. *Nutr Metab Cardiovasc Dis* 2025;35(3):103805. doi:10.1016/j.numecd.2024.103805 | SÖ (20 RCT) | program.komIgang, checkin.hunger |
| Elsworth RL m.fl. *Nutrients* 2023;15(11):2604. doi:10.3390/nu15112604 | SÖ (17 RCT) | checkin.hunger |
| Silva AD m.fl. *Nutr Res* 2025;138:76–88. doi:10.1016/j.nutres.2025.04.003 | SÖ (4 RCT i huvudanalys) | checkin.hunger |
| Turicchi J m.fl. *PLoS One* 2020;15(4):e0232152. doi:10.1371/journal.pone.0232152 | S (1 421 delt.) | checkin.vikt |
| Kreitzman SN m.fl. *Am J Clin Nutr* 1992;56(1 Suppl):292S–293S. doi:10.1093/ajcn/56.1.292S | S (11 delt.) | checkin.viktForstaVeckan |
| Madigan CD m.fl. *Int J Behav Nutr Phys Act* 2015;12:104. doi:10.1186/s12966-015-0267-4 | SÖ | checkin.vagning |
| Zheng Y m.fl. *Obesity* 2015;23(2):256–265. doi:10.1002/oby.20946 | SÖ (17 studier) | checkin.vagning |

**Undersökt men inte använt:** Tahrani & Morton 2022 (industrikoppling), Xing m.fl. 2026 och Couto-Alfonso m.fl. 2026 (*Nutrients*; låg evidenssäkerhet, åldersanalyser som inte behövs här).
