# FASTA – status

Uppdateras av AI-assistenten i slutet av varje arbetspass.

## Klart
- Fas 0 (del 1): versionerad datamodell (`fasta-data`, schemaVersion 1) med migrering från fs4/fh2/fasta-profile, historiken är inte längre begränsad till 50 poster, export/import av data som JSON med backup och "Ångra senaste import" (kortet "Din data" i Profil). Cache fasta-v18. PR #2 – **live sedan 2026-09-24**.
- Arbetsinstruktioner för AI-assistenten (`AGENTS.md`: arbetssätt, mål med Capacitor-appar) och denna statusfil publicerade.

## Pågår
- Inget.

## Nästa steg
1. Anton: kontrollera på telefonen att befintlig historik och profil finns kvar efter uppdateringen till v18.
2. Lägg till saknade manifest-ikoner (`icons/icon-192.png`, `icons/icon-512.png`) – ger 404 idag.
3. Fas 0 fortsättning: säkerhetsscreening i onboardingen (diabetes, graviditet/amning, ätstörningar → spärra fastor > 24 h), friskrivning på svenska, cookiefri statistik.
4. Fas 1: mål i profilen, fasteprogram, daglig check-in.

## Kända problem
- Manifest-ikonerna saknas (404).
