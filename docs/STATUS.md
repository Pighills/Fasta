# FASTA – status

Uppdateras av AI-assistenten i slutet av varje arbetspass.

## Klart (live)
- **Säkerhetsgranskning, baslinje** (2026-09-25, cache fasta-v30): `docs/security/cso-baseline.md`. Statisk granskning, inget fixat. Inga kritiska/höga/medel. 2 låga (raderad data och gamla hälsosvar ligger kvar i dolda localStorage-kopior; IP skickas till Google Fonts) + 1 info (ingen CSP, inline onclick). XSS via innerHTML/import kontrollerad: allt sparat går genom esc(). Git-historik och Vercel-inställningar ej granskade.
- **Kodgranskning, baslinje** (2026-09-25, cache fasta-v29): `docs/review/review-baseline.md`. Hela kodbasen granskad, inget fixat. 3 P1, 7 P2, 12 P3. Viktigast: orsaken till att pausen inte syns är hittad, en andra måltid under pausen får timern att gå baklänges, och två öppna flikar kan skriva över varandras historik. Fältkontrollen `cleanLogs` (se säkerhetsfixen nedan) försvann i Fas 0, se P2-4.
- **QA-baslinje** (2026-09-25, cache fasta-v28): `docs/qa/qa-baseline.md` + `baseline.json` + 27 skärmdumpar. Hälsopoäng 89/100, inga konsolfel. 10 fynd, inget fixat. Viktigast: träningspass godtar negativ tid/orimliga kcal (+1250 h effekt), pausen efter måltid syns först efter omladdning, ingen loggning under paus.
- **Prestandabaslinje** (2026-09-25, cache fasta-v27): `docs/benchmark/baseline.md` + `baseline.json` + mätskript `matning.js`. Mobil (Slow 4G, 4x CPU): LCP 1,1 s, CLS 0,0002, 80 KB totalt i 18 förfrågningar. Betyg A. Jämför mot denna vid framtida /benchmark.
- **Fas 0: gemensam händelselogg** (2026-09-25, cache fasta-v25, PR #12). `fasta-data` har schemaVersion 2: `events` = [{id, type, t, data}] med typerna fast/meal/workout; måltider och pass pekar på sin fasta via `data.fastId`. Migrering 1→2 i `js/migrations.js`, orörd kopia av gammal data i `fasta-data-pre-v2`. Vyerna läser samma form som förut via `historyFromEvents()`. Export sparar v2, import tar v0/v1/v2. Testat: 9 enhetstester (`node --test tests/*.test.mjs`) och uppgradering i webbläsaren från main-koden med jämförelse av alla vyer (identiska).
- Lära-korten och startvyn (2026-09-24, cache fasta-v24): alla 19 Lära-kort (rubrik, framsida, baksida, källa) inbyggda ordagrant från `lara.md` i `LC` i `js/data.js`, maskinellt kontrollerade (76 fält). De tre raderna på Timers startvy (`ui.startchips`) beskriver nu vad appen gör i stället för hälsolöften. Alla rutor i kunskapsbasen har nu status inbyggd.
- Säkerhetsfix (2026-09-24, cache fasta-v23): all sparad och importerad text (måltider, träningspass, profilvärden, mål) görs ofarlig med `esc()` i `js/helpers.js` innan den visas. Trasiga måltids-/träningslistor i importerad data rensades vid inläsning (`cleanLogs` i `js/state.js`). OBS: `cleanLogs` togs bort i Fas 0 och finns inte längre; ersätts av fältkontroll i `normalize()` (H3 i `docs/fixplan.md`). Testat med en manipulerad fil: ingen kod körs, texten visas som vanlig text.
- Hälsotexter v2 + fastefaser (2026-09-24, cache fasta-v22): Coworks granskade texter (uppdrag 2, kompletterat med Codex) inbyggda ordagrant – 8 faser, 7 fördelslistor, 8 scheman (`PH`, `BENEFITS`, `PRESETS`), rubrikerna i Historik-detaljen (`ui.effekter` i `js/modals.js`) och reviderade texter för Hälsa och säkerhet. 108 texter maskinellt kontrollerade mot kunskapsbasen. Faser har bytt namn (t.ex. Systemreset → Tre dygn).
- Codex-researchyta `docs/kunskap-codex/` och jämförelser `docs/jamforelse/` committade (används aldrig som källa till appens texter).
- Kunskapsbas i `docs/kunskap/`: Cowork researchar och skriver exakta texter per ruta, Anton godkänner, Claude Code bygger in. PR #6.
- Hälsotexter v1: Coworks granskade och Antons godkända texter för Hälsa och säkerhet inbyggda ordagrant (`HEALTH_FLAGS`, `HEALTH_DISCLAIMER` i `js/data.js`). Kryssrutan för diabetes omfattar nu även SGLT2-hämmare (samma nyckel `diabetesMeds`, gamla svar gäller). Cache fasta-v21. Live 2026-09-24.
- Fas 0 (del 1): versionerad datamodell (`fasta-data`, schemaVersion 1) med migrering från fs4/fh2/fasta-profile, historiken är inte längre begränsad till 50 poster, export/import av data som JSON med backup och "Ångra senaste import" (kortet "Din data" i Profil). Cache fasta-v18. PR #2 – live 2026-09-24.
- Arbetsinstruktioner för AI-assistenten (`AGENTS.md`) och denna statusfil. PR #3 – live.
- Appikoner: guldring i timerstil med F på svart. `icons/icon-192.png`, `icon-512.png` (även maskable), `apple-touch-icon.png` (180 px). PR #4 – live 2026-09-24.
- Hälsa och säkerhet: kort i Profil med fyra frivilliga kryssrutor (diabetes med medicin, gravid/ammar, ätstörning, under 18). Kryss visar kort varning; tryck på varningen visar längre förklaring med källor. Inget spärras och inget visas på timersidan (Antons val 2026-09-24). Sparas i `profile.health`, kopieras inte in i historiken. Cache fasta-v20. PR #5 – live 2026-09-24.

## Pågår
- Inget.

## Klart (live) – senaste
- **CLAUDE.md följer AGENTS.md + beslut i fixplan** (2026-09-25, bara dokument, ingen cache-höjning): CLAUDE.md har inte längre en egen git-regel; git-flödet står bara i AGENTS.md. `docs/fixplan.md` har Antons beslut för K1 och H2 (begränsa/räkna om vid visning, rådatan ändras inte) och ny arbetsordning med dataskydd (H4 + K2 + L3–L6) först.
- **Åtgärdslista** (2026-09-25, cache fasta-v33): `docs/fixplan.md` slår ihop benchmark-, QA-, kod- och säkerhetsbaslinjen. 2 kritiska, 4 höga, 8 medel, 16 låga; 10 rör sparad data. Inget fixat. OBS: `cleanLogs` finns inte längre (se H3 i fixplan).
- **Förenkling efter /ponytail-audit + Escape-fix** (2026-09-25, cache fasta-v32, live): 13 punkter. Dubblerad kod sammanslagen (fasmätare i timern, bekräftelserutorna för avsluta/radera, träningsbonusen som nu räknas på ett ställe i `workoutBonusHours()`), `fmtClock()` för hh:mm:ss, oanvända globala funktioner och vidareexporter borttagna, vyerna laddas direkt i `ui.js`, hovring via CSS, `met`-värden bort ur `WORKOUT_TYPES` (`custom:true` på Eget). Ingen ändring av sparad data. Testat: 9 enhetstester och ett helt flöde i webbläsaren (start, måltid, träning, avsluta, historik, radera, Lära, profil), inga konsolfel. Escape-lyssnaren i `openModal` tas nu bort hur rutan än stängs (✕, bakgrund, knapp, Escape); testat med 5 rutor → 0 kvarvarande lyssnare.

## Nästa steg
0. Åtgärda enligt `docs/fixplan.md` (sammanslagen lista från alla fyra baslinjer, 30 punkter, arbetsordning sist i filen). Kör /qa med --regression mot `docs/qa/baseline.json` efteråt.
1. Anton: kontrollera på telefonen att historik och profil finns kvar, att appikonen syns och att kortet "Hälsa och säkerhet" fungerar.
2. Anton har beslutat att inga nya riskgrupper läggs till nu (2026-09-24). Kvar är bara frågan om 18-årsgräns i användarvillkoren.
3. Klart: He m.fl. 2025 är läst via PubMed, och ingen text i appen behövde ändras.
4. Ev. klickbara länkar till 1177 och Frisk & Fri i Hälsa och säkerhet.
5. Fas 0: cookiefri statistik.
6. Fas 1: mål i profilen, fasteprogram, daglig check-in. Texterna är godkända i `docs/kunskap/fas1.md` (13 rutor, `mal.viktSparr` utgår) – bygg på händelseloggen.
7. Förslag (ej beslutat av Anton): lägg in test med Playwright som fast steg före publicering i AGENTS.md.

## Verktyg (installerade 2026-09-24, gäller alla projekt)
- **frontend-design** – riktlinjer för snyggare gränssnitt. Temat i AGENTS.md gäller fortfarande.
- **playwright** – styr en riktig Chromium-webbläsare. Kan troligen testa service worker/offline lokalt, vilket den inbyggda webbläsaren inte kan.
- **security-guidance** – granskar ändringar automatiskt (vid filändring, när en uppgift är klar och vid commit).

## Kända problem
- Ny kod som visar sparad eller inmatad text måste använda `esc()` från `js/helpers.js`.
- Service worker går inte att testa i Claude-appens inbyggda webbläsare på localhost (fungerar på fastatimer.se). Testa offline-läget på riktig telefon.
- `/index.html` i PRECACHE omdirigeras (301) till `/` av servern – ofarligt.
- Hälsouppgifter är känsliga personuppgifter (GDPR art. 9). Idag bara lokalt på enheten – måste hanteras särskilt vid konto/backend (fas 4).
