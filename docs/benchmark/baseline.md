# Prestanda – baslinje för fastatimer.se

**Mätt:** 2026-09-25 · **Version:** `main` b0d532c, cache `fasta-v26` · **Sida:** https://fastatimer.se/

Siffrorna är till för att jämföra mot framöver. Maskinläsbar version: [`baseline.json`](baseline.json). Mätskriptet: [`matning.js`](matning.js).

## Hur det mättes
- Riktig Chromium via Playwright. Varje laddning är **kall**: tom cache, ingen service worker, ny webbläsarprofil. Det motsvarar en förstagångsbesökare, alltså det värsta fallet. Återkommande användare får appen från service workern och laddar snabbare.
- **3 laddningar per profil, median** redovisas.
- **Desktop:** 1350×940, ingen strypning av nät eller processor.
- **Mobil:** 375×812 (3x skärm, touch, Android-webbläsare), nätet strypt till ungefär "Slow 4G" (150 ms fördröjning, 1,6 Mbit/s) och processorn 4 gånger långsammare. Samma nivå som Googles Lighthouse använder för mobil.
- INP (hur snabbt appen svarar på tryck) kräver riktiga användare och mäts inte här. TBT (tid då sidan är blockerad under laddning) används som ersättare.

## Resultat

| Mätvärde | Desktop | Mobil (Slow 4G, 4x CPU) | Googles gräns för "bra" |
|---|---|---|---|
| TTFB (servern svarar) | 4 ms | 4 ms* | < 800 ms |
| FCP (första innehållet syns) | 116 ms | 568 ms | < 1,8 s |
| **LCP** (största innehållet syns) | 308 ms | 1 136 ms | < 2,5 s |
| **CLS** (hur mycket sidan hoppar) | 0,002 | 0,0002 | < 0,1 |
| TBT (blockerad tid) | 0 ms | 30 ms | < 200 ms |
| DOM Interactive | 36 ms | 227 ms | – |
| Helt laddad | 244 ms | 1 133 ms | – |

\* Nätstrypningen syns inte i TTFB-värdet i Chromium; den syns i FCP, LCP och laddtiden.

Allt ligger väl inom Googles gränser för "bra" på båda enheterna.

Den allra första mätningen på desktop (inte med i medianen) gav FCP/LCP 1 340 ms, eftersom DNS-uppslag och krypterad anslutning till både fastatimer.se och Google Fonts gjordes första gången. En helt ny besökare kan alltså se ungefär en sekund längre start.

## Resursstorlekar (överförda byte, komprimerat)

| Typ | Antal | Storlek | Andel |
|---|---|---|---|
| JavaScript (egna moduler) | 13 | 40,0 KB | 49 % |
| Typsnitt (Outfit, Google Fonts) | 1 + 1 css | 32,3 KB + 0,9 KB | 40 % |
| CSS (`styles.css`) | 1 | 3,6 KB | 4 % |
| Ikon (`icon-192.png`) | 1 | 3,8 KB | 5 % |
| HTML | 1 | 1,6 KB | 2 % |
| **Totalt** | **18** | **80,3 KB** | |

Största filerna: typsnittet 32,3 KB, `js/data.js` 9,8 KB, `js/views/timer.js` 6,0 KB, `js/modals.js` 4,6 KB, `styles.css` 3,6 KB.

## Budget

| Mätvärde | Budget | Värde | Status |
|---|---|---|---|
| FCP (mobil) | < 1,8 s | 0,57 s | OK |
| LCP (mobil) | < 2,5 s | 1,14 s | OK |
| CLS | < 0,1 | 0,002 | OK |
| JS totalt | < 500 KB | 40 KB | OK |
| CSS totalt | < 100 KB | 4,5 KB | OK |
| Överfört totalt | < 2 MB | 80 KB | OK |
| Antal förfrågningar | < 50 | 18 | OK |

**Betyg: A (7/7).**

## Iakttagelser (inget åtgärdat, bara noterat)
1. **Modulerna laddas i kedja.** `app.js` importerar andra filer, som importerar fler. Webbläsaren upptäcker dem en nivå i taget, vilket på mobil ger några extra tur-och-retur-resor. Kan förbättras med `<link rel="modulepreload">` i `index.html` om appen växer. Inte värt det i dag.
2. **Typsnittet är 40 % av allt som laddas** och hämtas från Google (extra anslutning till två domäner). Att lägga Outfit-filen i appen själv skulle ge en anslutning mindre, fungera offline från första början och slippa skicka besökarens IP-adress till Google. Värt att tänka på inför cookiefri statistik och GDPR (fas 4).
3. **`data.js` (9,8 KB) laddas direkt vid start** fast mycket av innehållet bara behövs i Lära och Profil. Blir aktuellt när fler texter läggs till i fas 1–2.

## Jämföra framöver
Kör mätskriptet igen (be Claude Code: "kör /benchmark mot fastatimer.se och jämför med baslinjen"). Regler för varningar:
- Tider: mer än 50 % eller 500 ms långsammare = försämring, mer än 20 % = varning.
- Storlek (JS, CSS, totalt): mer än 25 % större = försämring, mer än 10 % = varning.
- Antal förfrågningar: mer än 30 % fler = varning.

Storlekarna är de pålitligaste siffrorna att följa; tiderna varierar med nätet.
