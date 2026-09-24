# FASTA – status

Uppdateras av AI-assistenten i slutet av varje arbetspass.

## Klart (live)
- Säkerhetsfix (2026-09-24, cache fasta-v23, gren `sakerhet-escape`): all sparad och importerad text (måltider, träningspass, profilvärden, mål) görs ofarlig med `esc()` i `js/helpers.js` innan den visas. Trasiga måltids-/träningslistor i importerad data rensas vid inläsning (`cleanLogs` i `js/state.js`). Testat med en manipulerad fil: ingen kod körs, texten visas som vanlig text.
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

## Nästa steg
1. Anton: kontrollera på telefonen att historik och profil finns kvar, att appikonen syns och att kortet "Hälsa och säkerhet" fungerar.
2. Lära-korten (uppdrag 3) och `ui.startchips` (uppdrag 4) är godkända enligt `UPPDRAG.md` – bygg in dem (Lära-korten i `LC` i `js/data.js`, startchips i `js/views/timer.js`).
3. Anton beslutar om Coworks förslag: fler riskgrupper (undervikt, äldre, kronisk sjukdom/mediciner – se slutet av `halsa-och-sakerhet.md`) och 18-årsgräns i användarvillkoren.
4. Tre källor kunde Cowork inte läsa i sin helhet (ADA/EASD 2025, He m.fl. 2025, Jebeile m.fl. 2024) – läs manuellt vid tillfälle.
5. Ev. klickbara länkar till 1177 och Frisk & Fri i Hälsa och säkerhet.
6. Fas 0: cookiefri statistik.
7. Fas 1: mål i profilen, fasteprogram, daglig check-in.
8. Förslag (ej beslutat av Anton): lägg in test med Playwright som fast steg före publicering i AGENTS.md.

## Verktyg (installerade 2026-09-24, gäller alla projekt)
- **frontend-design** – riktlinjer för snyggare gränssnitt. Temat i AGENTS.md gäller fortfarande.
- **playwright** – styr en riktig Chromium-webbläsare. Kan troligen testa service worker/offline lokalt, vilket den inbyggda webbläsaren inte kan.
- **security-guidance** – granskar ändringar automatiskt (vid filändring, när en uppgift är klar och vid commit).

## Kända problem
- Ny kod som visar sparad eller inmatad text måste använda `esc()` från `js/helpers.js`.
- Service worker går inte att testa i Claude-appens inbyggda webbläsare på localhost (fungerar på fastatimer.se). Testa offline-läget på riktig telefon.
- `/index.html` i PRECACHE omdirigeras (301) till `/` av servern – ofarligt.
- Hälsouppgifter är känsliga personuppgifter (GDPR art. 9). Idag bara lokalt på enheten – måste hanteras särskilt vid konto/backend (fas 4).
