# Regressionstest före lansering (fasta-v45)

**Testat:** 2026-10-03 · **Version:** live fasta-v45 · **Sida:** https://fastatimer.se/ · **Uppgift:** T-09
**Metod:** Playwright/Chromium, ny tom profil, 390×844, touch. Hela flödet automatiskt, inga skärmbilder (designen granskades med före/efter-bilder i T-33–T-38).

| # | Flöde | Resultat |
|---|---|---|
| 1 | Första start: rutan "Om FASTA" med "Jag förstår" | OK, visas inte igen efter omladdning |
| 2 | Timer-vy utan aktiv fasta | OK, inget sidledes överflöde |
| 3 | Starta fasta | OK, `active` sparas i `fasta-data` |
| 4 | Timern tickar | OK, sekunderna räknas upp och samma element ligger kvar (ingen ombyggnad av DOM) |
| 5 | Check-in-kortet under aktiv fasta | OK, ligger i Timer-vyn |
| 6 | Avsluta fasta | OK, rutan "Fortsätt fasta / Ja, avsluta", fastan sparas i händelseloggen |
| 7 | Historik | OK, trender och statistik visas. Fastan på 3 s räknas inte (avsiktligt: under 1 minut, T-12) |
| 8 | Lära: öppna kort | OK, 19 kort, rutan öppnas och stängs med Esc |
| 9 | Profil | OK, export och länk till integritetssidan finns, inget överflöde |
| 10 | Exportera data | OK, filen `fasta-backup-2026-10-03.json` laddas ner |
| 11 | `/integritet` | OK, 200, rubriken "Integritetspolicy för FASTA" |
| 12 | Omladdning | OK, `schemaVersion` 2, händelsen kvar |
| 13 | Service worker | OK, cache `fasta-v45` |

**Konsolfel:** 0. **Hälsa:** 13/13 gröna. Lokalt: 157 enhetstester gröna.

Säkerhetshuvuden kontrollerade med curl efter publiceringen: CSP och HSTS finns, `sw.js` = fasta-v45, manifestets `theme_color` #0a0a0a.

## Inte testat
Riktig telefon, installerad app (PWA), offline, notch och Android-statusrad. Import av fil (testas av enhetstesterna i `tests/backup.test.mjs`).
