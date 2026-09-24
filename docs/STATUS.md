# FASTA – status

Uppdateras av AI-assistenten i slutet av varje arbetspass.

## Klart
- Fas 0 (del 1): versionerad datamodell (`fasta-data`, schemaVersion 1) med migrering från fs4/fh2/fasta-profile, historiken är inte längre begränsad till 50 poster, export/import av data som JSON med backup och "Ångra senaste import" (kortet "Din data" i Profil). Cache fasta-v18. PR #2 – **live sedan 2026-09-24**.
- Arbetsinstruktioner för AI-assistenten (`AGENTS.md`) och denna statusfil. PR #3 – live.

## Pågår (förhandsversioner, väntar på "publicera")
- **PR #4 Appikoner** (gren `appikoner`, cache v19): guldring i timerstil med F på svart. `icons/icon-192.png`, `icon-512.png` (även maskable), `apple-touch-icon.png` (180 px).
- **PR #5 Hälsa och säkerhet** (gren `sakerhetsfragor`, cache v20): kort i Profil med fyra frivilliga kryssrutor (diabetes med medicin, gravid/ammar, ätstörning, under 18). Kryss visar kort varning; tryck på varningen visar längre förklaring med källor. Inget spärras och inget visas på timersidan (Antons val 2026-09-24). Sparas i `profile.health`, kopieras inte in i historiken. Texterna (`HEALTH_FLAGS` i `js/data.js`) är ett första utkast som Anton vill precisera.
  - Vid publicering: slå ihop #4 först, sedan #5. Lös krock i `sw.js` (behåll v20) och i denna fil.

## Nästa steg
1. Anton: kontrollera på telefonen att historik och profil finns kvar efter v18.
2. Publicera #4 och #5 när Anton godkänt förhandsversionerna.
3. Finputsa säkerhetstexterna med Anton.
4. Granska hälsopåståendena i `js/data.js` (PH, BENEFITS, PRESETS) mot källor – flera är starkare än forskningen stödjer (t.ex. "immunsystemet förnyas", "tillväxthormon 5x", "systemreset").
5. Fas 0: cookiefri statistik.
6. Fas 1: mål i profilen, fasteprogram, daglig check-in.

## Kända problem
- Service worker går inte att testa i Claude-appens inbyggda webbläsare på localhost (fungerar på fastatimer.se). Testa offline-läget på riktig telefon.
- `/index.html` i PRECACHE omdirigeras (301) till `/` av servern – ofarligt.
- Hälsouppgifter är känsliga personuppgifter (GDPR art. 9). Idag bara lokalt på enheten – måste hanteras särskilt vid konto/backend (fas 4).
