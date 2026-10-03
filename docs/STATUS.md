# FASTA – status

Kort nuläge. Äldre historik: `docs/historik.md`.

## Live nu
fasta-v46 (PR #65, 2026-10-03) – snabbare start på mobil (T-39), robots.txt och sitemap.xml (T-40).

Innan: fasta-v45 (PR #61, 2026-10-03) – designlyftet T-33–T-38: CSS-variabler, fasfärger guld/grått, check-in under ringen, nya Historik/Lära/Profil/rutor/meny, mjuka övergångar, mörk statusrad.

Innan: fasta-v44 (PR #51, 2026-10-01) – T-27, T-28, T-29: sidan /integritet, länk i Profil, rutan "Jag förstår" vid första start.

Innan: fasta-v42 (PR #43, 2026-09-27) – T-23, T-24:
- Timer: kortet Dagens check-in (energi, hunger, sömn, valfri vikt, besvär).
- Historik: rutan Så har du mått (28 dagars staplar, veckosnitt, viktkurva, radera en dag).

fasta-v41 (PR #39, 2026-09-27) – T-22, T-15:
- Grund för daglig check-in (data, sparning, export/import). Rutan på Timer kommer i T-23.
- Tillgänglighet: dialoger stängs med Escape, bättre etiketter och fokus (M7, L12).

fasta-v40 (PR #36, 2026-09-27) – T-14, T-07, T-06-planen:
- Bakåtdatering av start, måltid och träning fungerar bättre (L9, L10, L16).
- Under måltidspausen går det att logga träning och avsluta pausen; pass under paus ger ingen bonus.
- Plan för Fas 1b (check-in och trender) i `docs/plan/fas1b.md`.

Innan: fasta-v39 (PR #32) – T-05, Radera all data.

fasta-v38 (PR #30, 2026-09-26) – T-02, T-03, T-04, T-18, T-19:
- Fas 1a: mål och fasteprogram (Profil och Timer), plan i `docs/plan/fas1a.md`.
- Typsnittet Outfit laddas från appen själv i stället för Google Fonts.
- Import vägrar ofullständiga filer.
- Säkerhetshuvuden i `vercel.json` (kontrollerade live med curl, ingen CSP än).

fasta-v37 (2026-09-26) – T-10, T-11, T-12, T-13, T-17, T-21:
- Service workern: säkrare cache och uppdatering (M1, M2, M3, L11).
- Historik: året visas för fastor från tidigare år, rättad statistik (L8, L15).
- Flikbyte börjar överst på sidan (L14).
- Nya enhetstester för `helpers.js` och export/import; förstudie om appbutikerna (`docs/plan/capacitor-forstudie.md`).

fasta-v36 (PR #17, 2026-09-26) – fixplanens steg 1–3 klara:
- 8a dataskydd: oläslig data låses och sparas orörd, en gammal flik skriver aldrig över nyare data, korta meddelanden längst ned.
- 8b pausen: pausrutan syns direkt efter måltid, överlappande pauser räknas en gång.
- 8c fältkontroll: rimliga gränser för träning, profil och måltider; träningsbonus högst 1,4 × faktisk tid; aldrig NaN i timern.

## Pågår
Se `docs/arbete/KO.md`.

## Verktyg (installerade 2026-09-24, gäller alla projekt)
- **frontend-design** – riktlinjer för snyggare gränssnitt. Temat i AGENTS.md gäller fortfarande.
- **playwright** – styr en riktig Chromium-webbläsare. Kan troligen testa service worker/offline lokalt, vilket den inbyggda webbläsaren inte kan.
- **security-guidance** – granskar ändringar automatiskt (vid filändring, när en uppgift är klar och vid commit).

## Kända problem
- Ny kod som visar sparad eller inmatad text måste använda `esc()` från `js/helpers.js`.
- Service worker går inte att testa i Claude-appens inbyggda webbläsare på localhost (fungerar på fastatimer.se). Testa offline-läget på riktig telefon.
- Vercels förhandsversioner kräver inloggning hos Vercel (Deployment Protection). QA görs därför lokalt med `npx serve`.
- `/index.html` i PRECACHE omdirigeras (301) till `/` av servern – ofarligt.
- Hälsouppgifter är känsliga personuppgifter (GDPR art. 9). Idag bara lokalt på enheten – måste hanteras särskilt vid konto/backend (fas 4).
