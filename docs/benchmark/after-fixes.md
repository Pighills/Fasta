# Prestanda efter fixplanens steg 1–3 (fasta-v36)

**Mätt:** 2026-09-26 · **Version:** live fasta-v36 · **Sida:** https://fastatimer.se/ · **Uppgift:** T-01
Samma metod som baslinjen (`matning.js` via Playwright/Chromium, kall laddning, median av 3) så att siffrorna går att jämföra med [`baseline.md`](baseline.md) (fasta-v26).

## Tider (median)
| Mätvärde | Desktop före → nu | Mobil före → nu | Gräns för "bra" |
|---|---|---|---|
| TTFB | 4 → 5 ms | 4 → 5 ms | < 800 ms |
| FCP | 116 → 120 ms | 568 → 568 ms | < 1,8 s |
| **LCP** | 308 → 172 ms | 1 136 → 1 180 ms (+4 %) | < 2,5 s |
| **CLS** | 0,0016 → 0,0016 | 0,0002 → 0,0002 | < 0,1 |
| TBT | 0 → 0 ms | 30 → 26 ms | < 200 ms |
| DOM Interactive | 36 → 54 ms | 227 → 234 ms | – |
| Helt laddad | 244 → 125 ms | 1 133 → 1 165 ms | – |

Första desktopladdningen (DNS och anslutningar) gav LCP 1 332 ms och första mobilladdningen TBT 141 ms; båda ligger utanför medianen, som i baslinjen.

## Storlekar (överfört, komprimerat)
| | Före | Nu | Ändring |
|---|---|---|---|
| JavaScript (13 filer) | 40,0 KB | 45,7 KB | +14 % ⚠ varning (> 10 %) |
| CSS | 3,6 KB | 3,8 KB | +7 % |
| Totalt | 82,2 KB | 88,2 KB | +7 % |
| Förfrågningar | 18 | 18 | 0 |

Ökningen kommer från fixarna: `migrations.js` 2,1 → 4,0 KB (fältkontroll, `pausedMs`), `state.js` 2,3 → 3,7 KB (dataskydd), `modals.js` 4,6 → 5,7 KB (felmeddelanden i rutorna), `app.js` 1,0 → 1,7 KB (meddelandetexter).

## Bedömning
Inga försämringar enligt reglerna i baslinjen (tider: > 50 % eller > 500 ms). En varning: JavaScript är 14 % större, vilket är väntat för ny kontroll- och skyddskod. Budgeten (JS < 500 KB, totalt < 2 MB) används till under 10 %. **Betyg: A (7/7), oförändrat.**
