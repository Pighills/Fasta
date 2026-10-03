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
Riktig telefon. Installerad app, offline, notch och Android-statusrad: se "Lanseringstest" nedan. Import av fil (testas av enhetstesterna i `tests/backup.test.mjs`).

## Lanseringstest (fasta-v46, T-41)

**Testat:** 2026-10-03 · **Version:** live fasta-v46 · **Metod:** Playwright/Chromium, ny tom profil, touch.

| # | Test | Resultat |
|---|---|---|
| 1 | Offline (390×844): ladda, vänta på service workern, slå av nätet, ladda om | OK. Appen startar utan nät, fasta startas och avslutas ("Ja, avsluta"), händelsen sparas och finns kvar efter omladdning. Online igen: inget fel, datan kvar. 0 konsolfel. |
| 2 | Installerad app: `manifest.json` | OK. `display: standalone`, `start_url: /`, `theme_color`/`background_color` #0a0a0a, ikoner 192 + 512 + maskable. CSS har inga särskilda regler för installerat läge, så appen ser likadan ut som i webbläsaren (bara högre skärm). `display-mode: standalone` gick inte att emulera i Chromium. |
| 3 | Notch, iPhone 14 (390×844, säker yta 47/34 px) | OK. Översta raden börjar 13 px under kameran/statusraden, menyknapparna slutar ovanför hemindikatorn (810 av 844 px). Inget sidledes överflöde. [Skärmbild](screenshots-lansering/iphone-14.png) |
| 4 | Android, Pixel 7 (412×915, statusrad 24 px, navigering 16 px) | OK. Innehållet börjar under statusraden, menyn ovanför navigeringsfältet. Inget sidledes överflöde. [Skärmbild](screenshots-lansering/pixel-7.png) |
| 5 | `/robots.txt` och `/sitemap.xml` (curl) | OK. 200, `text/plain` resp. `application/xml`, robots pekar på sitemap, sitemap listar `/` och `/integritet`. |
| 6 | Ommätning (`matning.js`, median av 3) | Se nedan. |

Säker yta emulerades med Chromiums `Emulation.setSafeAreaInsetsOverride` (värdena för `env(safe-area-inset-*)` slog igenom: 47/34 resp. 24/16 px).

### Ommätning, samma miljö som v45 ([`v45.md`](../benchmark/v45.md))
| Median | Mobil v45 → v46 | Desktop v45 → v46 | Gräns för "bra" |
|---|---|---|---|
| LCP | 1 564 → 1 372 ms | 344 → 368 ms | < 2,5 s |
| FCP | 736 → 1 220 ms | 68 → 76 ms | < 1,8 s |
| TBT | 154 → 203 ms | 0 → 0 ms | < 200 ms |
| CLS | 0 → 0 | 0,002 → 0,002 | < 0,1 |
| Helt laddad | 1 371 → 1 011 ms | 148 → 118 ms | – |

LCP och full laddning blev snabbare. TBT varierar mellan körningarna (187–259 ms) och ligger på gränsen; T-39 mätte 0 ms i Edge, så skillnaden beror delvis på webbläsaren. Inget som stoppar lanseringen.

### Småsaker (inte fel, förslag till Cowork)
- `manifest.json`: namnet är "FASTA — Fasting Tracker" (engelska). Det syns när appen installeras. Förslag: svenskt namn.
- Maskable-ikonen är samma bild som den vanliga 512-ikonen. På Android kan kanterna beskäras. Förslag: egen maskable-ikon med marginal.

### Fortfarande inte testat
Riktig telefon (Safari på iPhone beter sig inte exakt som Chromium), installation via "Lägg till på hemskärmen" och offline efter en riktig appuppdatering.
