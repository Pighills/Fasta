# FASTA – status

Uppdateras av AI-assistenten i slutet av varje arbetspass.

## Klart (live)
- Fas 0 (del 1): versionerad datamodell (`fasta-data`, schemaVersion 1) med migrering från fs4/fh2/fasta-profile, historiken är inte längre begränsad till 50 poster, export/import av data som JSON med backup och "Ångra senaste import" (kortet "Din data" i Profil). Cache fasta-v18. PR #2 – live 2026-09-24.
- Arbetsinstruktioner för AI-assistenten (`AGENTS.md`) och denna statusfil. PR #3 – live.
- Appikoner: guldring i timerstil med F på svart. `icons/icon-192.png`, `icon-512.png` (även maskable), `apple-touch-icon.png` (180 px). PR #4 – live 2026-09-24.
- Hälsa och säkerhet: kort i Profil med fyra frivilliga kryssrutor (diabetes med medicin, gravid/ammar, ätstörning, under 18). Kryss visar kort varning; tryck på varningen visar längre förklaring med källor. Inget spärras och inget visas på timersidan (Antons val 2026-09-24). Sparas i `profile.health`, kopieras inte in i historiken. Cache fasta-v20. PR #5 – live 2026-09-24.

## Pågår
- Inget.

## Nästa steg
1. Anton: kontrollera på telefonen att historik och profil finns kvar, att appikonen syns och att kortet "Hälsa och säkerhet" fungerar.
2. Finputsa säkerhetstexterna (`HEALTH_FLAGS` i `js/data.js`) med Anton. Källorna är angivna ur minnet och behöver verifieras.
3. Granska hälsopåståendena i `js/data.js` (PH, BENEFITS, PRESETS) mot källor – flera är starkare än forskningen stödjer (t.ex. "immunsystemet förnyas", "tillväxthormon 5x", "systemreset").
4. Fas 0: cookiefri statistik.
5. Fas 1: mål i profilen, fasteprogram, daglig check-in.

## Kända problem
- Service worker går inte att testa i Claude-appens inbyggda webbläsare på localhost (fungerar på fastatimer.se). Testa offline-läget på riktig telefon.
- `/index.html` i PRECACHE omdirigeras (301) till `/` av servern – ofarligt.
- Hälsouppgifter är känsliga personuppgifter (GDPR art. 9). Idag bara lokalt på enheten – måste hanteras särskilt vid konto/backend (fas 4).
