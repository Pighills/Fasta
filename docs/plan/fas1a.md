# Fas 1a – teknisk plan: mål och fasteprogram

**Uppgift:** T-02 (plan) → T-03 (bygg) · **Skriven:** 2026-09-26 av Claude Code · **Status:** väntar på Cowork och Anton
**Underlag:** `docs/kunskap/fas1.md` (Antons produktbeslut 2026-09-25, avsnitten Mål och Program), `js/migrations.js`, `js/state.js`, AGENTS.md regel 4.
Check-in och trender hör till Fas 1b (T-06) och ingår inte.

## Kort sammanfattning
- **Mål** i Profil: fastor per vecka (1–7) och målvikt (valfri). Framsteg "3 av 5 fastor den här veckan".
- **Program** på Timer: Kom igång (4 v), 16:8 som vana (8 v), Tidigt ätfönster (8 v). Appen föreslår dagens fasta; pausa, byt och avsluta när du vill.
- **Inget nytt dataformat.** Mål och program sparas som nya händelsetyper i den befintliga händelseloggen. `schemaVersion` stannar på 2, ingen migrering, ingen befintlig data ändras.
- "Schema: 16h" på Timer visas som "Schema: 16:8".

## 1. Flöden

### Sätta eller ändra mål (Profil → kortet "Mål")
1. Kortet visar `mal.intro` överst.
2. **Fastor per vecka:** sju knappar 1–7 (samma stil som Aktivitetsnivå) och "Inget mål". Tryck = sparat direkt.
3. **Målvikt (kg):** sifferfält 30–250 som profilens fält (sparas när fältet lämnas, felmeddelande "Målvikt måste vara 30–250 kg."). Under fältet: `mal.vikt` med källa, eller `mal.viktHalsa` om "ätstörning" eller "under 18 år" är ikryssat. Inget spärras (Antons beslut 3).
4. Med veckomål visas "Den här veckan: 3 av 5 fastor" i kortet och som en rad på Timers startvy.
5. Ändra = välj nytt värde. Tidigare mål ligger kvar i loggen (bra för coachen i fas 3), bara det senaste används.

### Välja program (Timer → startvyn → "Välj program")
1. Knappen "📋 Välj program" ligger bredvid "Testa ett fasta-schema". Den öppnar en panel med `program.intro` och tre kort: namn, upplägg (veckoplan), beskrivning och källa.
2. Tryck på ett kort → "Starta programmet" → programmet börjar i dag (dag 1).
3. Startvyn visar då ett programkort överst: "Kom igång · Dag 9 av 28 · Vecka 2" och **dagens förslag**, t.ex. "Fasta 14 timmar". Stora startknappen startar en fasta med det målet (`startFast(14, false)`). Löpande fasta och andra scheman går fortfarande att välja; programmet stör inte.

### Hur appen föreslår dagens fasta
| Program | Förslag |
|---|---|
| Kom igång | Vecka 1: 12 h · vecka 2: 14 h · vecka 3–4: 16 h |
| 16:8 som vana | 16 h varje dag, och "3 av 5 dagar den här veckan" |
| Tidigt ätfönster | 16 h. Texten påminner: "Ät inom 8 timmar, sista målet före kl. 17." Inget spärras om man startar senare. |

Programdagen räknas i **kalenderdagar i lokal tid** från startdagen, minus dagar då programmet var pausat.

### Missade dagar ("behöver inte ta igen")
Programmet följer kalendern. En dag utan fasta är bara en dag som gått: vecka 2 börjar dag 8 oavsett hur många fastor man gjort. Ingen "ta igen"-logik, ingen varning, ingen skuld. 16:8 som vana visar bara hur många dagar den här veckan som nått 16 h.

### Pausa, fortsätta, byta, avsluta (programkortet → "⋯")
- **Pausa:** programmet står still. Kortet visar "Pausat · Fortsätt programmet". Pausdagar räknas inte.
- **Fortsätt:** räkningen fortsätter från samma dag.
- **Byta:** välj ett annat program i panelen → bekräftelse "Byta program? Det nuvarande avslutas." → det nya börjar på dag 1.
- **Avsluta:** bekräftelse → kortet försvinner.
- **Klart:** efter sista dagen visar kortet "Programmet är klart" med knapparna "Välj nytt program" och "Stäng".
- En pågående fasta påverkas aldrig av att programmet pausas, byts eller avslutas.

## 2. Datamodell

### Nya händelsetyper (schemaVersion 2, ingen migrering)
`js/migrations.js` säger redan: "Future types … are added without a migration. Unknown fields are always kept."
```
type 'goal'     t = när målet sattes   data = { fastsPerWeek: 1–7 | null, targetWeight: kg | null }
type 'program'  t = när det hände      data = { action: 'start' | 'pause' | 'resume' | 'end', programId }
```
- **Mål:** det senaste `goal`-eventet gäller. Värden kontrolleras vid läsning (`cleanGoal`, samma mönster som `cleanProfile`): utanför gränserna = inget mål.
- **Program:** läget räknas fram av en ren funktion `programState(events, now)` i nya `js/program.js` (ingen lagring där): aktivt program, dag, vecka, pausat, klart. `start` när ett program redan är aktivt betyder byte. Händelser med trasig tid eller okänt `programId` hoppas över.
- **Ingen koppling fasta ↔ program** i 1a. Framsteg räknas från avslutade fastor i loggen (se beslut 1). Fastans händelse får inga nya fält.
- **Varför händelser och inte profilen:** profilen kopieras in i varje avslutad fasta (`_doEndFast`), och ett ändrat mål skulle skriva över det gamla. Händelser ger historik för coachen och är redan en rad per sak för SQLite senare.

### Skydd för befintlig data
- **Befintlig data:** ingenting skrivs om. Utan `goal`/`program`-händelser ser appen ut som i dag.
- **Äldre version (fasta-v25 till v36) som öppnar data med de nya händelserna:** `normalize()` behåller alla händelser med en typ, vyerna filtrerar på `fast`/`meal`/`workout`, "Rensa all historik" (`clearFastHistory`) tar bara fastor med deras måltider och pass, och export tar med allt. De nya händelserna försvinner alltså inte. Testas i uppgraderingstestet nedan.
- **Två flikar (K2):** alla ändringar går genom `addEvent()` → `persist()`, som vägrar skriva om en annan flik sparat sedan. Programpanelen och målkortet kontrollerar som `startFast` att läget inte ändrats innan de sparar.
- **Data från nyare version (L3):** oförändrat – appen låser och sparar inget.
- **Radera fasta (L6):** påverkar inte mål- eller programhändelser (de har ingen `fastId`).

## 3. Var varje ruta visas (texterna kopieras ordagrant från `fas1.md`)
| ID | Vy | Element | Konstant i `js/data.js` |
|---|---|---|---|
| `mal.intro` | Profil | kortet "Mål", text överst | `GOAL_TEXT.intro` |
| `mal.vikt` | Profil → Mål | hjälptext under "Målvikt", "Källa: Wharton m.fl., CMAJ 2020" | `GOAL_TEXT.vikt`, `GOAL_TEXT.viktSrc` |
| `mal.viktHalsa` | Profil → Mål | ersätter `mal.vikt` om `health.eatingDisorder` eller `health.under18` | `GOAL_TEXT.viktHalsa` |
| `program.intro` | Timer → Välj program | text överst i panelen | `PROGRAM_INTRO` |
| `program.komIgang` | Timer → Välj program | kort: namn, upplägg, beskrivning, källa | `PROGRAMS[0]` |
| `program.vana168` | Timer → Välj program | kort | `PROGRAMS[1]` |
| `program.tidigt` | Timer → Välj program | kort | `PROGRAMS[2]` |

`mal.viktSparr` byggs inte in (utgår). När rutorna är inbyggda sätts status `inbyggd` i `fas1.md`.
Knappar och rubriker (t.ex. "Välj program", "Pausa", "Fastor per vecka", "Den här veckan: 3 av 5 fastor") är vanliga UI-texter utan hälsopåståenden; de listas i rapporten så att Anton kan se dem (beslut 6).

## 4. L15-resten: "16:8" på Timer
`js/views/timer.js` rad 202 visar `'Schema: ' + goalHours + 'h'`. Ändras till namnet från `PRESETS` när timmarna matchar (16 → "16:8", 23 → "OMAD", 36 → "36h"), annars "Schema: 14 h". Historikens del av L15 görs i T-12 (Codex).

## 5. Tester
**Enhetstester** (`node --test tests/*.test.mjs`), ny fil `tests/program.test.mjs`:
- `programState`: inga händelser → inget program; start → dag 1, 12 h; dag 8 → vecka 2, 14 h; dag 15 och 28 → 16 h; dag 29 → klart.
- Paus 3 dagar och fortsätt → dagräkningen hoppar inte; paus följd av byte; avsluta → inget program; start medan aktivt → byte, dag 1.
- Dagsgränser i lokal tid, inklusive sommartid/vintertid (mars/oktober), och start sent på kvällen.
- Trasiga händelser (tid som text, okänt program, okänd action) hoppas över, inget kastar.
- `cleanGoal` och senaste mål; veckoräkning måndag–söndag; bara fastor som uppfyller beslut 1 räknas.
- 16:8 som vana: antal dagar med 16 h den här veckan.
- Befintliga tester i `tests/` ska gå igenom oförändrade.

**Uppgradering** (💾, som `docs/qa/qa-faltkontroll.md`): v36 (`origin/main`) serveras under `/qa-main/` på samma adress så att båda delar localStorage.
1. Data skapad i v36 med rutorna (fastor, måltider, pass, profil, hälsa) → öppna nya versionen → allt identiskt, rådatan byte för byte oförändrad tills användaren ändrar något.
2. Sätt mål och starta program i nya versionen → öppna v36 → avsluta en fasta, radera en fasta, "Rensa all historik", exportera → tillbaka i nya versionen: mål och program kvar.
3. Två flikar: mål i ena, program i andra → den gamla fliken vägrar och visar meddelandet.
4. Import av en fil från v36 och av en fil med program.

**Flöden i 390×844:** sätt/ändra/ta bort veckomål och målvikt (med och utan hälsokryss), välj program, starta dagens fasta, pausa/fortsätt/byt/avsluta, programmet klart (klockan flyttad fram), vecka 2 i Kom igång, "3 av 5" i 16:8, inga konsolfel, touch-ytor ≥ 44 px, inputs 16 px.

## 6. Commits i ordning (gren `fas-1a`)
1. `js/data.js`: `GOAL_TEXT`, `PROGRAM_INTRO`, `PROGRAMS` ordagrant + `fas1.md` status `inbyggd`.
2. `js/program.js` (ny, ren) + `tests/program.test.mjs`: `programState`, `latestGoal`, `cleanGoal`, `weekProgress`.
3. `js/state.js`, `js/actions.js`: läsa mål/program ur loggen, `setGoal`, `startProgram`, `pauseProgram`, `resumeProgram`, `endProgram` via `addEvent`, med stale-kontroll.
4. `js/views/profile.js`, `css/styles.css`: kortet "Mål".
5. `js/views/timer.js`, `js/modals.js`, `css/styles.css`: Välj program, programkortet, dagens förslag, veckorad.
6. `js/views/timer.js`: "Schema: 16:8" (L15).
7. `sw.js`: `js/program.js` i `PRECACHE` (cache höjs först vid publicering).
8. Rapport `docs/rapporter/T-03.md`, QA-rapport `docs/qa/qa-fas1a.md`.

**Filer:** `js/data.js`, `js/program.js` (ny), `js/state.js`, `js/actions.js`, `js/views/profile.js`, `js/views/timer.js`, `js/modals.js`, `css/styles.css`, `sw.js`, `tests/program.test.mjs`, `docs/kunskap/fas1.md`.

## 7. Risker
- **Dagräkning och sommartid:** fel dag vid tidsomställning eller resa över tidszoner. Räknas på lokala kalenderdatum (inte 24 h-block) och testas särskilt.
- **Äldre version före fasta-v34 (utan K2-skydd)** i en gammal flik kan skriva över nyare data. Samma risk finns redan i dag; service workern uppdaterar normalt appen.
- **Timer-vyn blir längre** på liten skärm. Programkortet hålls till 2–3 rader; panelen öppnas bara på begäran.
- **Filkrock med Codex:** T-12 (`history.js`, `helpers.js`) och T-13 (`setView`) ska vara live innan T-03 börjar (står redan i kön).
- **Tidigt ätfönster** kan uppfattas som en spärr. Texten är en påminnelse; ingenting blockeras.

## 8. Beslut som behövs från Anton
1. **Vad räknas som en fasta för veckomålet?** Förslag: en avslutad fasta på minst 12 timmar.
2. **Vilken vecka?** Förslag: måndag–söndag.
3. **Var syns veckomålet?** Förslag: i Profil → Mål och som en rad på Timers startvy ("3 av 5 fastor den här veckan").
4. **Pausat program:** förslag att pausdagar inte räknas (programmet står still).
5. **Program och vanliga scheman:** förslag att man fortfarande kan välja löpande fasta eller ett annat schema när ett program är aktivt, utan att programmet påverkas.
6. **UI-texter** (knappar, rubriker, "Programmet är klart") skriver Claude Code utan hälsopåståenden och listar dem i rapporten. Ok?
7. **Målvikt:** förslag att bara visa målvikten nu. Framsteg mot målvikten kommer i 1b när vikt loggas i check-in.

## 9. Granskning (eng-review-kontroll)
Gjord som egenkontroll mot /plan-eng-review:s punkter i stället för hela den interaktiva körningen, eftersom den ställer många tekniska frågor till Anton. Cowork kan begära full körning.
- **Omfattning:** minsta som uppfyller besluten; ingen koppling fasta ↔ program, inga påminnelser, ingen BMI.
- **Återanvändning:** `addEvent`/`persist` (K2), `cleanProfile`-mönstret, `LIMITS.weight`, `startFast`, `confirmModal`, profilens knappstil.
- **Datarisk:** inget nytt format; skyddet för äldre versioner vilar på `normalize()` och `clearFastHistory()`, som redan finns och testas.
- **Testbarhet:** all räkning i en ren fil utan DOM och localStorage.
