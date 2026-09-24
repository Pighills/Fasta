# FASTA – instruktioner för AI-kodassistenter

FASTA är en svensk PWA för periodisk fasta, live på https://fastatimer.se.
Målet är att bygga ut den till en coach för fasta + träning (se roadmap nedan).

## Stack
- Vanilla JavaScript med ES-moduler. Inget ramverk, inget byggsteg, inga npm-beroenden i appen.
- Data sparas i `localStorage` (nycklar: `fs4` = aktiv fasta, `fh2` = historik, `fasta-profile` = profil).
- PWA: `manifest.json` + service worker `sw.js` (network-first).
- Hosting: Vercel, auto-deploy vid push. `main` = produktion, andra grenar = förhandsversioner.

## Struktur
- `index.html` – skal och bottenmeny
- `css/styles.css` – all styling
- `js/app.js` – startpunkt; exponerar funktioner på `window` för inline `onclick`
- `js/state.js` – state + läsning/skrivning mot localStorage
- `js/data.js` – scheman, faser, Learn-innehåll
- `js/helpers.js`, `js/actions.js`, `js/modals.js`, `js/ui.js`
- `js/views/` – `timer.js`, `learn.js`, `history.js`, `profile.js`

## Regler
1. **Höj cache-versionen i `sw.js`** (`const CACHE = "fasta-vNN"`) vid varje ändring som ska deployas. Nya filer ska också läggas till i `PRECACHE`.
2. **All text i appen är på svenska**, enkel och utan fackspråk.
3. **Vetenskapliga påståenden ska ha källor** och vara korrekta. Hellre försiktig än överdriven. Inga påståenden om att appen behandlar eller förebygger sjukdom.
4. **Bryt aldrig befintlig användardata.** Ändras formatet i localStorage krävs en migrering av gammal data.
5. **Mobile first:** touch-ytor ≥ 44px, input-fonter ≥ 16px (förhindrar zoom på iOS), safe-area för telefoner med notch.
6. **Tema:** bakgrund `#0a0a0a`, guld `#c8a84e`, kort `#1a1a1a` med kant `#2a2a2a`, typsnitt Outfit.
7. **Tid:** använd lokal tid, inte UTC, i datum-inputs (se `toLocalDateTimeStr()`).
8. Uppdatera timern utan att bygga om hela DOM:en (undvik blinkning).
9. Håll koden ren och modulär; en ansvarsfråga per fil.

## Köra lokalt
```
npx serve .
```
Öppna http://localhost:3000. Det måste vara via server, inte `file://`, eftersom ES-moduler kräver det.

## Arbetssätt – jobba självständigt
Anton är inte utvecklare. Han beskriver vad han vill ha på vanlig svenska; du sköter det tekniska.

- **Läs `docs/STATUS.md` först i varje session** och uppdatera den innan du avslutar: vad som är klart, vad som pågår, nästa steg.
- **Jobba så långt du kan utan att fråga.** Fatta själv rimliga tekniska beslut och skriv kort vilka du tog.
- **Stanna och fråga bara när:**
  - en ändring kan radera eller förvanska användardata,
  - något kostar pengar eller kräver konton (Stripe, Apple, Google, API-nycklar),
  - det finns flera produktval där Antons åsikt spelar roll (t.ex. vad en funktion ska göra, texter, pris),
  - ett hälso- eller vetenskapligt påstående är osäkert.
- **Större uppgifter:** visa en kort plan (punktlista), vänta på ok, och kör sedan hela planen utan att fråga per fil.
- **Innan du säger att något är klart:** kör `node --check` på ändrade JS-filer, kontrollera att appen startar lokalt och beskriv i 3–5 punkter vad Anton ska testa och var i appen han ser ändringen.
- **Förklara på svenska utan fackspråk.** Säg alltid *var i appen* en ändring syns, eller att den inte syns.
- Håll uppgifterna lagom stora: en funktion eller ett steg i roadmapen åt gången.

## Kunskapsbas: fakta och texter (`docs/kunskap/`)
Research och hälsotexter görs av **Claude Cowork** och läggs i `docs/kunskap/`. Claude Code kodar. Läs `docs/kunskap/README.md`.
- Varje ruta i appen har ett fast ID (t.ex. `halsa.diabetesMeds`, `fas.24h`, `lara.8`) som kopplar texten i kunskapsbasen till `js/data.js`.
- Bygg bara in texter med status **godkänd**, och kopiera dem **ordagrant**. Sätt sedan status `inbyggd` och uppdatera fältet *nu*.
- Skriv aldrig nya hälsopåståenden direkt i koden. Behövs en ny text: lägg till rutan i kunskapsbasen (enligt `_mall.md`) och ett uppdrag i `UPPDRAG.md`, och be Anton låta Cowork göra researchen.
- Ändras en text i koden av annan anledning, eller läggs en ny ruta till, uppdatera motsvarande fil i kunskapsbasen.
- `docs/kunskap-codex/` är en **parallell researchyta för Codex** som används för att jämföra researchverktyg. Den är aldrig källa till text i appen. Codex: följ `docs/kunskap-codex/README.md` när Anton ger dig ett researchuppdrag.
- Cowork kan ha sparat ändringar i mappen som inte committats. Committa dem, så att de inte försvinner.

## Slutmål: appar för Android och iPhone
FASTA ska på sikt finnas i App Store och Google Play. Planen är att paketera webbappen med **Capacitor**, inte att skriva om den.
Därför, redan nu:
- Håll appen som en fristående webbapp utan beroende av en viss server-URL (relativa sökvägar).
- Lägg webbläsarspecifika API:er (notiser, delning, filer, lagring) bakom små hjälpfunktioner i `js/platform.js` när de behövs, så de kan bytas mot Capacitor-plugins senare.
- Ingen funktion får kräva hover eller mus; allt ska fungera med touch.
- Planera för att data på sikt kan flyttas från localStorage till Capacitor Preferences/SQLite via samma migreringssystem.

## Git-flöde (sköts av AI-assistenten, inte av Anton)
Anton ska inte behöva köra git-kommandon själv. Sköt allt nedan automatiskt.

- **Ny uppgift:** utgå från senaste `main` (`git checkout main && git pull`) och skapa en gren med ett beskrivande namn, t.ex. `fas-1-checkin`. Fråga inte, gör det bara.
- **När Anton säger "förhandsvisa":** committa, pusha grenen och ge länken till Vercels förhandsversion (via `gh pr create` om ingen PR finns, annars `gh pr view`).
- **När Anton säger "publicera" (eller "kör live", "pusha"):**
  1. Kontrollera att cache-versionen i `sw.js` är höjd och att nya filer finns i `PRECACHE`.
  2. Committa med ett tydligt meddelande på svenska.
  3. Pusha grenen, skapa en PR om ingen finns och slå ihop den med `gh pr merge --merge --delete-branch`.
  4. Byt till `main` och kör `git pull`.
  5. Bekräfta kort vad som gick live.
- Om en ändring rör **lagrad användardata** (localStorage-format, migrering): påminn Anton om att testa förhandsversionen innan publicering.
- Committa aldrig hemligheter (API-nycklar, tokens). Repot är publikt.

## Roadmap (kortversion)
0. Grund: versionerad datamodell, gemensam händelselogg, export/import, säkerhetsscreening
1. Fördjupad fasta: mål, program, daglig check-in, trender, push-påminnelser
2. Träning: övningsbibliotek, set-logg, koppling fasta ↔ träning
3. Regelbaserad coach (regler som data, hårda säkerhetsgränser)
4. Konto, backend, betalning, GDPR
5. AI-coach ovanpå regelmotorn
6. Autonom drift och tillväxt
