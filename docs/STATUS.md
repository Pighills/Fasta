# FASTA – status

Uppdateras av AI-assistenten i slutet av varje arbetspass.

## Klart
- Fas 0 (del 1): versionerad datamodell (`fasta-data`, schemaVersion 1) med migrering från fs4/fh2/fasta-profile, historiken är inte längre begränsad till 50 poster, export/import av data som JSON med backup och "Ångra senaste import" (kortet "Din data" i Profil). Cache fasta-v18. PR #2 – **live sedan 2026-09-24**.
- Arbetsinstruktioner för AI-assistenten (`AGENTS.md`) och denna statusfil. PR #3 – live.
- Appikoner: guldring i timerstil med F på svart (`icons/icon-192.png`, `icon-512.png` även maskable, `apple-touch-icon.png` 180 px). Cache fasta-v19. PR #4 – förhandsversion, väntar på "publicera".

## Pågår
- Fas 0: säkerhetsscreening + friskrivning – plan visad, väntar på Antons produktval.

## Nästa steg
1. Anton: kontrollera på telefonen att historik och profil finns kvar efter v18.
2. Publicera PR #4 (appikoner) när Anton godkänt förhandsversionen.
3. Fas 0: säkerhetsscreening vid första start, friskrivning på svenska, cookiefri statistik.
4. Granska hälsopåståendena i `js/data.js` (PH, BENEFITS, PRESETS) mot källor – flera är starkare än forskningen stödjer (t.ex. "immunsystemet förnyas", "tillväxthormon 5x", "systemreset").
5. Fas 1: mål i profilen, fasteprogram, daglig check-in.

## Kända problem
- Service worker går inte att testa i Claude-appens inbyggda webbläsare på localhost (fungerar på fastatimer.se). Testa offline-läget på riktig telefon.
- `/index.html` i PRECACHE omdirigeras (301) till `/` av servern – ofarligt.
