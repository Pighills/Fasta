# Fas 1b – teknisk plan: daglig check-in och trender

**Uppgift:** T-06 (plan) → bygget delas i tre uppgifter (avsnitt 7) · **Skriven:** 2026-09-26 av Claude Code · **Status:** väntar på Cowork och Anton
**Underlag:** `docs/kunskap/fas1.md` (produktbeslut 4, avsnittet Daglig check-in), `docs/plan/fas1a.md`, `js/program.js`, `js/state.js`, `js/migrations.js`, AGENTS.md regel 4.
Påminnelser ingår inte (kommer efter Capacitor).

## Kort sammanfattning
- **Check-in** på Timer: Energi, Hunger och Sömn (1–5), vikt (valfri) och besvär att kryssa i (huvudvärk, yrsel, trötthet, illamående). En per dag, går att ändra och radera.
- **Trender** i Historik: staplar för de senaste 28 dagarna, snitt för den här veckan mot förra, viktkurva och målvikt från Fas 1a.
- **Inget nytt dataformat.** Check-in är en ny händelsetyp i loggen, som mål och program i 1a. `schemaVersion` stannar på 2, ingen migrering.
- **Hälsodata:** följer med i export och i "Radera all data". Ändra och radera tar verkligen bort det gamla värdet (skrivs över, inte en ny rad).

## 1. Flöden

### Dagens check-in (Timer → kortet "Dagens check-in")
1. Kortet syns på Timer både med och utan pågående fasta, under programkortet. Innan dagens check-in: knappen "Gör dagens check-in". Efteråt: en rad "Energi 4 · Hunger 2 · Sömn 3" och knappen "Ändra".
2. Knappen öppnar en ruta (samma stil som måltidsrutan). Första gången, tills en check-in sparats: `checkin.intro` överst.
3. **Energi, Hunger, Sömn:** fem knappar 1–5 per rad (≥ 44 px), med ord i ändarna (t.ex. "Låg" – "Hög"). Under Hunger: `checkin.hunger`. Varje skala kan lämnas tom.
4. **Vikt (valfritt):** sifferfält 30–250 kg (samma gränser som profilen, 16 px). Under fältet: `checkin.vikt` med källa. Visas enligt vägningsinställningen (nedan).
5. **Besvär:** fyra kryssrutor. Kryssas "Yrsel" i visas `checkin.besvarYrsel` direkt under (Coworks förslag).
6. "Spara". Minst ett värde krävs, annars appens felruta "Fyll i minst en sak."

### Ändra och radera
- **I dag:** "Ändra" öppnar rutan ifylld. I rutan finns "Radera dagens check-in" (med bekräftelse).
- **Äldre dagar:** i trenden i Historik trycker man på en dag → en liten ruta med dagens värden och "Radera". Äldre dagar kan inte fyllas i i efterhand (beslut 2).

### Hoppa över dagar
Ingen skuld och ingen "streak". En dag utan check-in är en tom stapel. Inga påminnelser i 1b.

### Vägningsinställning (Check-in-rutan → "Hur ofta vill du väga dig?")
- Tre val: **Varje dag** (fältet syns alltid), **En gång i veckan** (fältet syns på måndagar, andra dagar bakom "Lägg till vikt"), **Inte alls** (vikt syns varken i check-in eller trender). Under valen: `checkin.vagning` med källa.
- Standard: se beslut 3.

### Trender (Historik → kortet "Så har du mått", ovanför fastelistan)
- Syns när det finns minst en check-in. Innan dess inget kort.
- Detaljer i avsnitt 4.

### Målvikt och vikt
- Målvikten från Fas 1a (Profil → Mål) visas som en streckad linje i viktkurvan, med texten "Målvikt 75 kg". Om "ätstörning" eller "under 18 år" är ikryssat visas ingen "kvar"-siffra, bara linjen (beslut 4).

## 2. Datamodell

### Ny händelsetyp (schemaVersion 2, ingen migrering)
```
type 'checkin'  t = när den sparades senast
                data = { day: 'ÅÅÅÅ-MM-DD' (lokalt datum),
                         energy: 1–5 | null, hunger: 1–5 | null, sleep: 1–5 | null,
                         weight: kg | null,
                         symptoms: ['huvudvark', 'yrsel', 'trotthet', 'illamaende'] (delmängd) }
```
- **En händelse per dag.** Ändra skriver över `data` och `t` i samma händelse; radera tar bort händelsen. Skillnad mot mål/program (som bara läggs till): det här är hälsodata, och ett ändrat eller raderat värde ska inte ligga kvar i loggen.
- `day` sparas som text i lokal tid, så dagen inte flyttas vid resa eller sommartid (samma tanke som `dayNumber` i `program.js`).
- **Kontroll vid läsning** (`cleanCheckin`, samma mönster som `cleanGoal`): skalor utanför 1–5 = tomma, vikt utanför `LIMITS.weight` = tom, okända besvär hoppas över, fel `day` = händelsen hoppas över. Finns två händelser för samma dag (två flikar, import) gäller den med senast `t`.
- **Vägningsinställning:** nytt fält i profilen, `weighing: 'daily' | 'weekly' | 'never'`. Profilen behåller redan okända fält, och äldre versioner sparar hela profilen vidare.
- **Nya funktioner i `js/state.js`:** `putCheckin(day, data)` och `removeCheckin(day)`, båda via `persist()` (vägrar om en annan flik sparat, K2).
- **Ny ren fil `js/checkin.js`:** `cleanCheckin`, `checkinFor(events, day)`, `checkinDays(events, from, to)`, `weekAverages(events, now)`, `weightSeries(events, now)`, `firstWeekDrop(events)`. Ingen DOM, ingen localStorage.

### Skydd för befintlig data
- **Befintlig data:** ingenting skrivs om. Utan check-in ser appen ut som i dag.
- **Äldre version (v25–v39) som öppnar data med check-in:** `normalize()` behåller alla händelser med en typ, vyerna läser bara sina typer, "Rensa all historik" (`clearFastHistory`) tar bara fastor med måltider och pass. Check-in försvinner alltså inte. Testas.
- **Äldre versions "Radera all data" (v39):** tar bort allt, även check-in – det är rätt.
- **Två flikar (K2):** `putCheckin`/`removeCheckin` går genom `persist()`. Rutan kontrollerar också att dagens check-in inte ändrats sedan den öppnades.
- **Data från nyare version (L3):** oförändrat – appen låser och sparar inget.
- **Export/import:** hela loggen följer redan med. Importens kontroll (T-18) godtar okända typer. Importmeddelandet räknar i dag bara fastor; det utökas med "och N check-in".

### Integritet
- Check-in och vikt är hälsodata. De ligger bara i telefonen (localStorage), följer med i exporten och tas bort av "Radera all data" (T-05) inklusive dolda kopior.
- "Rensa all historik" tar inte bort check-in (beslut 6).
- Inget skickas någonstans. Ingen statistik.

## 3. Var varje ruta visas (texterna kopieras ordagrant från `fas1.md`)
| ID | Vy | Element | Konstant i `js/data.js` |
|---|---|---|---|
| `checkin.intro` | Timer → Check-in-rutan | text överst tills första check-in sparats | `CHECKIN_TEXT.intro` |
| `checkin.hunger` | Check-in-rutan | hjälptext under skalan Hunger | `CHECKIN_TEXT.hunger` |
| `checkin.besvarYrsel` | Check-in-rutan | visas direkt när "Yrsel" kryssas i | `CHECKIN_TEXT.besvarYrsel` |
| `checkin.vikt` | Check-in-rutan | hjälptext under "Vikt (valfritt)", "Källa: Turicchi m.fl., PLoS One 2020" | `CHECKIN_TEXT.vikt`, `.viktSrc` |
| `checkin.viktForstaVeckan` | Historik → Så har du mått | under viktkurvan, om vikten gått ner mer än 1 kg under de första 7 dagarna efter första vägningen. "Källa: Kreitzman m.fl., Am J Clin Nutr 1992" | `CHECKIN_TEXT.viktForstaVeckan`, `.viktForstaVeckanSrc` |
| `checkin.vagning` | Check-in-rutan → Hur ofta vill du väga dig? | under valen, "Källa: Madigan m.fl., IJBNPA 2015" | `CHECKIN_TEXT.vagning`, `.vagningSrc` |

När rutorna är inbyggda sätts status `inbyggd` i `fas1.md`. Knappar och rubriker ("Gör dagens check-in", "Låg"/"Hög", "Så har du mått", "Fyll i minst en sak.") är UI-texter utan hälsopåståenden; de listas i rapporten.

## 4. Trender (Historik → "Så har du mått")
Inga slutsatser om hälsa, bara siffror och staplar. Inga externa bibliotek: staplar och kurva ritas med inline-SVG eller `div`-staplar, som ringen på Timer.
- **Energi, Hunger, Sömn:** en rad per skala med 28 små staplar (en per dag, höjd = värde, tom dag = ingen stapel). Till höger: snittet de senaste 7 dagarna, och förra veckans snitt i grått ("3,6 · förra veckan 3,2"). Snitt visas först när perioden har minst 3 check-in; annars "–".
- **Besvär:** "Senaste 28 dagarna: Huvudvärk 3 dagar · Trötthet 5 dagar". Bara besvär som förekommit.
- **Vikt** (om inställningen inte är "Inte alls" och det finns minst 2 vägningar): kurva över de senaste 8 veckorna med punkter för varje vägning och en linje för 7-dagarssnittet (följer `checkin.vikt`: trenden, inte enskilda dagar). Målvikten som streckad linje. Under kurvan: "Snitt den här veckan 81,2 kg · förra veckan 81,8 kg" och ev. `checkin.viktForstaVeckan`.
- **Innan det finns underlag:** med 1–2 check-in visas staplarna och texten "Gör check-in några dagar till, så syns dina snitt här."
- Tryck på en stapel → dagens värden och "Radera" (avsnitt 1).
- Ingen koppling till fastorna i 1b (t.ex. "energi fastedagar mot andra dagar"). Det sparas till coachen i fas 3 (beslut 7).

## 5. Tester
**Enhetstester**, ny fil `tests/checkin.test.mjs`:
- `cleanCheckin`: skalor 0, 6, 2.5, "3", null → tomma; vikt utanför 30–250 → tom; okända besvär bort; trasig `day` → hoppas över.
- `checkinFor` med två händelser samma dag → den senaste gäller.
- `checkinDays` över månadsskifte och sommartid/vintertid (mars/oktober); dag räknas på lokalt datum.
- `weekAverages`: under 3 värden → null; måndag–söndag; tomma skalor räknas inte.
- `weightSeries` och 7-dagarssnitt; `firstWeekDrop` exakt 1 kg, strax över, bara en vägning.
- `putCheckin`/`removeCheckin` i `tests/state.test.mjs`: en händelse per dag, radera tar bort helt, gammal flik vägras.
- `clearFastHistory` behåller check-in; `eraseAllData` tar bort dem; export/import tar med dem.
- Befintliga tester oförändrade.

**Uppgradering** (💾): v39 (`main`) serveras under `/qa-main/` på samma adress så att båda delar localStorage.
1. Data från v39 (fastor, måltider, pass, profil, hälsa, mål, program) → nya versionen → allt identiskt, rådatan oförändrad tills användaren ändrar något.
2. Gör check-in i nya versionen → öppna v39 → avsluta/radera en fasta, "Rensa all historik", exportera → tillbaka: check-in kvar.
3. Två flikar: check-in i båda → den gamla fliken vägrar och visar meddelandet.
4. Import av fil från v39 och av fil med check-in.

**Flöden i 390×844:** första check-in med intro, bara en skala ifylld, tom → felruta, yrsel → rutan syns direkt, vikt med och utan hälsokryss, vägning "Inte alls" döljer vikt överallt, ändra och radera i dag, radera en äldre dag från Historik, trender med 0, 2, 5 och 28 dagars data, klockan flyttad över midnatt, inga konsolfel, touch-ytor ≥ 44 px, inputs 16 px.

## 6. Risker
- **Dagsgräns:** check-in strax efter midnatt hamnar på nya dagen. Det är avsiktligt (lokalt datum) men kan förvåna nattugglor. Beslut 2 gör det lättare om i går tillåts.
- **Timer blir längre** på liten skärm (program + check-in). Check-in-kortet hålls till en rad när dagens är gjord.
- **Viktfokus för sårbara användare:** hanteras med vägningsinställningen och beslut 3–4. Cowork bör granska texterna runt vikt en gång till när UI:t finns.
- **Filkrock:** T-15 (tillgänglighet) rör `js/views/*`, `js/modals.js` och `css/styles.css`, samma filer som bygget. Antingen görs T-15 före, eller efter hela 1b.
- **Radera skriver över:** skiljer sig från mål/program (som bara läggs till). Motiverat av integritet; testas särskilt.

## 7. Uppdelning i bygguppgifter
| Uppgift | Innehåll | Filer | Beroenden |
|---|---|---|---|
| **1b-1 Grund** 💾 | `js/checkin.js` (ren), `putCheckin`/`removeCheckin`, `CHECKIN_TEXT` ordagrant, `weighing` i profilen, importmeddelandet, tester | `js/checkin.js` (ny), `js/state.js`, `js/data.js`, `js/backup.js`, `tests/checkin.test.mjs` (ny), `tests/state.test.mjs`, `docs/kunskap/fas1.md` | planen godkänd |
| **1b-2 Check-in-rutan** | kortet på Timer, rutan, vägningsinställning, radera i dag | `js/views/timer.js`, `js/modals.js`, `js/actions.js`, `js/app.js`, `css/styles.css` | 1b-1 |
| **1b-3 Trender** | kortet i Historik, staplar, viktkurva, radera äldre dag | `js/views/history.js`, `js/views/trends.js` (ny) | 1b-1 |

1b-2 och 1b-3 har inga gemensamma filer och kan göras parallellt av två spår. 1b-3 använder inline-stilar som resten av vyerna, så att den inte rör `css/styles.css`. Vid publicering: `js/checkin.js` och `js/views/trends.js` läggs i `PRECACHE`.

## 8. Beslut som behövs från Anton
1. **Var görs check-in?** Förslag: ett kort på Timer (syns alltid), trender i Historik.
2. **Vilka dagar?** Förslag: bara i dag. Äldre dagar kan raderas men inte fyllas i. (Alternativ: även i går, för den som glömde.)
3. **Vägning som standard?** Förslag: "En gång i veckan". Om "ätstörning" eller "under 18 år" är ikryssat: "Inte alls" som standard (går att ändra).
4. **Målvikt i viktkurvan:** förslag att visa linjen och "X kg kvar", men bara linjen om "ätstörning" eller "under 18 år" är ikryssat.
5. **Trender:** 28 dagars staplar och veckosnitt, snitt först vid minst 3 check-in. Ok?
6. **"Rensa all historik"** tar bara fastor, inte check-in. "Radera all data" tar allt. Ok?
7. **Koppling check-in ↔ fasta** (t.ex. energi fastedagar mot andra dagar): förslag att vänta till coachen i fas 3.
8. **UI-texter** skriver Claude Code utan hälsopåståenden och listar dem i rapporten, som i 1a. Ok?

## 9. Granskning (eng-review-kontroll)
Egenkontroll mot /plan-eng-review:s punkter, som för 1a. Cowork kan begära full körning.
- **Omfattning:** minsta som uppfyller beslut 4 i `fas1.md`; inga påminnelser, ingen streak, inga slutsatser, ingen koppling till fastor.
- **Återanvändning:** händelseloggen, `persist()` (K2), `cleanGoal`-mönstret, `LIMITS.weight`, lokala dagnummer från `program.js`, `form-err`, `confirmModal`, måltidsrutans stil, `latestGoal` för målvikten.
- **Datarisk:** inget nytt format; äldre versioner skyddas av `normalize()` och `clearFastHistory()`, som redan finns och testas. Enda nyheten är att en händelse skrivs över på plats, vilket testas mot två flikar.
- **Testbarhet:** all räkning i en ren fil utan DOM och localStorage.
