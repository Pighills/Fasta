# FASTA – status

Kort nuläge. Äldre historik: `docs/historik.md`.

## Live nu
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
