# QA – live efter fixplanens steg 1–3 (fasta-v36)

**Datum:** 2026-09-26 · **Uppgift:** T-01 · **Verktyg:** /qa med gstacks headless-webbläsare (`browse`; Aside finns inte på Windows), 390×844
**Mål:** https://fastatimer.se (service worker `fasta-v36` bekräftad). All data skapades i den tillfälliga webbläsarens egen localStorage; ingen riktig användardata och inget skickas till någon server.
**Läge:** regression mot `docs/qa/baseline.json` (2026-09-25, fasta-v27, 89/100). Inget fixat (T-01 är bara kontroll).
**Hälsopoäng:** 99/100, preliminär (konsol, länkar, visuellt, funktion, UX, innehåll testat; prestanda i `docs/benchmark/after-fixes.md`; tillgänglighet inte testad).
**Resultat:** alla 15 fixade punkter fungerar live. 1 nytt fynd (Låg). Inga konsolfel i någon vy eller flik.

## Fixade punkter
| Punkt | Test | Resultat |
|---|---|---|
| K1 | Träning −20 min, 99 999 kcal, snittpuls 300 | Ett fel i taget: "Tiden måste vara 1–300 minuter.", "Kalorier måste vara 0–2000 kcal.", "Snittpulsen måste vara 40–220 slag per minut." Inget sparat. Giltigt pass: metabol tid = 1,4 × faktisk, "+X h träning (tak 1,4x)" |
| L13 | Egen måltid utan namn / 0 kcal | "Skriv vad du åt." / "Kalorier måste vara 1–3000 kcal." |
| H1 | Logga måltid (2 h paus) | Pausrutan "Återupptas om 02:00:00" syns direkt, klockan står still. Klockan flyttad 3 h fram: pausrutan borta, måltids-/träningsknapparna tillbaka |
| H2 | Andra måltid (1 h) under pausen | Klockan 00:00:29 före och efter. Efter 3 h: 1:01:00 netto = överlappet räknat en gång |
| M4 | Klockan så att metabol tid passerar 4 h | Metabol-kortet byter till "⏳ Tidig fasta" utan omladdning |
| M6 | Profil ålder 500 | "Ålder måste vara 10–110 år.", gammalt värde kvar; 40 år/80 kg/180 cm ger "✓ Profil klar" |
| H3 | Trasig v2-data (start "igår", kcal "mycket", ålder "gammal", vikt 1e308, längd "sexton", tider "trasig") | Ingen "NaN"/"undefined" någonstans, trasiga poster visas inte, rådatan kvar |
| H4 | Giltig JSON som inte går att läsa in (`schemaVersion:"abc"`) | Rådatan orörd i både `fasta-data` och `fasta-data-error`; åtgärd ger "Din sparade data kunde inte läsas. Den ligger kvar orörd. …" |
| – | Text som inte är JSON | Kopia orörd i `fasta-data-corrupt`, appen börjar om (avsiktligt enligt koden) |
| L3 | `schemaVersion: 99` | Åtgärd ger "Din data är sparad av en nyare version av FASTA. …", datan oförändrad |
| K2 | Två flikar: flik 2 startar fasta → flik 1 visar den. Data ändrad bakom flik 1 → radera i flik 1 | "Ändringen sparades inte, eftersom FASTA är öppen i ett annat fönster. …", den nya datan kvar |
| L6 | Radera fastan på nytt | Bara den fastan (med sina måltider/pass) borta; pågående fasta och annan måltid kvar |
| L4 | Import av backupfil → ändring bakom appen → "Ångra import" | "Det gick inte att återställa. Ingen data har ändrats." Efter omladdning fungerar ångra |
| L5 | Lagringen full (simulerad) → avsluta fasta | "Det gick inte att spara – lagringen på enheten kan vara full. …" |

## Nya fynd
| ID | Allvar | Var | Hur det återskapas |
|---|---|---|---|
| ISSUE-001 | Låg (UX/innehåll) | Timer → 🏋️ Träning | Starta en fasta, öppna träningsrutan, skriv 2000 kcal (eller ogiltiga 99 999). Rutan visar "Beräknad metabol bonus: ~25.0h extra fastaeffekt" fast taket gör att en ny fasta bara får några sekunder. Texten under förklarar taket, men den stora siffran lovar mer än appen ger. Skärmdump `18-traning-bonus-ruta.png`. |

Anteckning till kodgranskning (inte ett synligt fel): Historik-detaljen räknar passets bonus med en egen formel (`js/modals.js` rad 138–141) i stället för `workoutBonusHours()`.

## Regression mot baslinjen (2026-09-25)
| Baslinjen | Nu |
|---|---|
| ISSUE-001 träning utan gränser (Hög) | fixad (K1) |
| ISSUE-002 pausen syns först efter omladdning (Medel) | fixad (H1) |
| ISSUE-003 ingen loggning under paus (Medel) | kvar, väntar på Antons beslut (M5/T-07) |
| ISSUE-004 egen måltid utan namn (Låg) | fixad (L13) |
| ISSUE-005 orimlig profil (Medel) | fixad (M6) |
| ISSUE-006–010 (flikbyte, tillgänglighet, tryckytor, historikrubrik, bakåtdatering) | inte testade här; ligger i kön (T-12–T-15) |

Poäng 89 → 99 (preliminär, olika täckning: tillgänglighet och prestanda ingår inte i 99).

## Inte testat
Riktig telefon (installerad app, offline, notch), service worker-byte från v35, tillgänglighet, bakåtdatering. Tiden flyttades fram i sidan i stället för att vänta.

Skärmdumpar: `screenshots-efter-fixar/01–18`.
