# FASTA – status

Uppdateras av AI-assistenten i slutet av varje arbetspass.

## Klart
- Fas 0 (del 1): versionerad datamodell (`fasta-data`, schemaVersion 1) med migrering från fs4/fh2/fasta-profile, historiken är inte längre begränsad till 50 poster, export/import av data som JSON med backup och "Ångra senaste import" (kortet "Din data" i Profil). Cache fasta-v18. PR #2 – **live sedan 2026-09-24**.
- Arbetsinstruktioner för AI-assistenten (`AGENTS.md`: arbetssätt, mål med Capacitor-appar) och denna statusfil publicerade.

## Pågår
- Appikoner (gren `appikoner`, PR #4, cache v19) – förhandsversion, väntar på "publicera".
- Säkerhetsfrågor i Profil (gren `sakerhetsfragor`, cache v20) – förhandsversion. Kortet "Hälsa och säkerhet": fyra frivilliga kryssrutor (diabetes med medicin, gravid/ammar, ätstörning, under 18). Kryss visar kort varning, tryck på varningen visar längre förklaring med källor. Inget spärras (Antons val). Sparas i `profile.health`, kopieras inte in i historiken. Texterna är ett första utkast – Anton vill precisera dem senare.
  - Vid publicering: slå ihop PR #4 först; lös sedan krock i `sw.js` (behåll v20) och STATUS.md.

## Nästa steg
1. Anton: kontrollera på telefonen att befintlig historik och profil finns kvar efter uppdateringen till v18.
2. Lägg till saknade manifest-ikoner (`icons/icon-192.png`, `icons/icon-512.png`) – ger 404 idag.
3. Fas 0 fortsättning: säkerhetsscreening i onboardingen (diabetes, graviditet/amning, ätstörningar → spärra fastor > 24 h), friskrivning på svenska, cookiefri statistik.
4. Fas 1: mål i profilen, fasteprogram, daglig check-in.

## Kända problem
- Manifest-ikonerna saknas (404).
- Hälsouppgifter är känsliga personuppgifter (GDPR art. 9). Idag bara lokalt på enheten – måste hanteras särskilt vid konto/backend (fas 4).
