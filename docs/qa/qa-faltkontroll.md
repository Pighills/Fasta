# QA – fältkontroll (gren `fix-faltkontroll`, cache fasta-v36)

**Datum:** 2026-09-26 · **Verktyg:** /qa-only med gstacks headless-webbläsare (`browse`), fönster 390×844
**Mål:** http://localhost:3000 (`npx serve`). Vercels förhandsversion (PR #17) kräver inloggning hos Vercel, därför lokalt.
**Hälsopoäng:** 99/100 (preliminär: konsol, funktion, innehåll, visuellt, UX testat; länkar, prestanda och tillgänglighet inte testade i denna körning)
**Resultat:** 2 fynd (1 medel, 1 låg), båda i Historik-detaljen, båda fixade på grenen och kontrollerade. Inga konsolfel.

## Uppgradering från main med orimliga värden
Main-koden (`origin/main`, fasta-v35) serverades från `/qa-main/` på samma adress, så båda versionerna delade samma localStorage. Datan skapades **med main-versionens egna rutor**: träningspass −20 min / 99 999 kcal (två gånger), egen måltid utan namn och 0 kcal, profil ålder 500 och vikt −5, en avslutad fasta på 5 h och en pågående på 3 h.

| Test | main | grenen |
|---|---|---|
| Timer, metabol effekt (pågående 3 h) | – | ~4:12 = 1,4 × 3 h, "+1.2h träning (tak 1,4x)" |
| Timer, metabol effekt (5 h, före avslut) | ~1253:59, "💎 Tre dygn", "+1250.0h träning" | – |
| Historik: den avslutade fastan | – | "⏳ 5h fasta", "Tidig fasta uppnådd", metabol ~7h 0m |
| Passet i listan | "Promenad · −20 min · 99999 kcal" | "Promenad · 1 min · 2000 kcal" |
| Profil | ålder 500, vikt −5, multiplikator 0,80x | ålder och vikt tomma, "Profil klar" borta |
| Rådatan i `fasta-data` efter öppning i grenen | – | **identisk** med main (byte för byte) |

Skärmdumpar: `screenshots-faltkontroll/01-main-timer.png`, `02-gren-timer.png`, `03-gren-historik.png`, `04-gren-historikdetalj.png`, `05-gren-profil.png`.

## Uppgradering från v1 med trasig data
schemaVersion 1 skrevs direkt: pågående fasta med starttid `"igår"`, måltid med kcal `"mycket"`, fasta på 17 s med metabol tid 1250 h och pass −20 min / 99 999 kcal / puls 500, fasta med längd `"sexton"` och paus `"två"`, fasta med start `"trasig"`, profil med längd `"lång"` och vikt 1e308.

| Test | Resultat |
|---|---|
| Pågående fasta med trasig starttid | ingen aktiv fasta (startvyn) |
| Historik | 3 fastor; den med trasig start visas inte (ligger kvar i datan) |
| Fasta med längd "sexton" | räknas från start/slut: 16 h, MÅL |
| 17 s-fastan | "0h fasta", metabol ~0m, "Fastan var kortare än 4 timmar" |
| "NaN" eller "Invalid" någonstans i appen | nej |
| Profil | ålder 30 kvar, längd och vikt tomma |
| Uppgraderad till v2, kopia i `fasta-data-pre-v2` | ja, 8 händelser |

Skärmdumpar: `06-v1-historik.png`, `07-v1-detalj.png`.

## Rutorna
| Test | Resultat |
|---|---|
| Träning −20 min | "Tiden måste vara 1–300 minuter.", inget sparat |
| Träning 99 999 kcal | "Kalorier måste vara 0–2000 kcal." |
| Snittpuls 300 / maxpuls 50 | "Snittpulsen måste vara 40–220 slag per minut." / "Maxpulsen måste vara 100–220 slag per minut." |
| Egen måltid utan namn / 0 kcal / 5000 kcal | "Skriv vad du åt." / "Kalorier måste vara 1–3000 kcal." |
| Profil: ålder 500 | "Ålder måste vara 10–110 år.", inget sparat; 40 och 80 kg ger "Profil klar" |

Skärmdumpar: `10-traning-fel.png`, `11-maltid-fel.png`.

## Pausen (regression från session 8b)
Klockan flyttades fram i sidan (`Date.now` med tillägg) för att slippa vänta en timme.

| Test | Resultat |
|---|---|
| Logga måltid (1 h paus) efter 6 h | "Återupptas om …" syns direkt, klockan står på 06:00:00 |
| Andra måltid 30 min in i pausen | klockan 06:00:00 före och efter, går inte baklänges |
| 90 min + 5 s efter första måltiden | 06:00:06, pausrutan borta, måltids-/träningsknapparna tillbaka |

Skärmdumpar: `08-paus-direkt.png`, `09-paus-slut.png`.

## Fynd

### ISSUE-001 · Medel · Innehåll – passets bonus visar orimligt värde i Historik-detaljen
**Var:** Historik → tryck på en fasta med ett orimligt pass (v1-datan ovan).
**Såg:** "⚡ +25.0h metabol bonus (tak 1,4x)" under passet, fast fastan var 17 sekunder och metabol effekt ~0m.
**Väntat:** inget orimligt tal; taket gör att passet i praktiken la till nästan inget.
**Bevis:** `07-v1-detalj.png` (längst ned i rutan).
**Fixat (commit d7a0464):** visar nu "⚡ Metabol bonus begränsad (tak 1,4x)" när fastan nått taket. Kontrollerat: `12-efter-fix-detalj.png`.

### ISSUE-002 · Låg · Innehåll – sparad profil i Historik-detaljen visar orimliga värden
**Var:** Historik → detalj för en fasta som sparades med orimlig profil.
**Såg:** "👤 Man · 500 år · 180 cm · -5 kg" (main-data) och "abc år" (v1-data).
**Väntat:** orimliga värden visas inte (samma regel som i Profil).
**Bevis:** `04-gren-historikdetalj.png`, `07-v1-detalj.png`.
**Fixat (commit 45f20c5):** profilen kontrolleras som i Profil; v1-datan visar nu "Man · 180 cm · 80 kg", en normal profil visar allt ("Kvinna · 40 år · 168 cm · 62.5 kg").

## Konsol
Inga fel i någon del av körningen.

## Inte testat
- Riktig telefon (installerad app, offline, notch).
- Service worker-byte fasta-v35 → v36 (fungerar inte på localhost i test-webbläsaren).
- Länkar, prestanda och tillgänglighet (utanför denna körnings omfång).
