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
