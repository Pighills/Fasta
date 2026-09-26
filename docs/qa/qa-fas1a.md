# QA · Fas 1a (T-03) – uppgradering och flöden

2026-09-26, Claude Code. Lokalt med `npx serve` (port 3000), viewport 390×844. v37 (`origin/main`) serverad under `/qa-main/` så att båda versionerna delar localStorage.

## Uppgradering (planens avsnitt 5)
| # | Test | Resultat |
|---|---|---|
| 1 | Data skapad i v37 (profil, 2 avslutade fastor med måltid och pass, 1 pågående fasta) → nya versionen | ✅ rådatan byte för byte oförändrad; Timer visar "Schema: 16:8" |
| 2 | Mål + program i nya → v37: avsluta fasta, radera fasta, "Rensa all historik" | ✅ alla `goal`/`program`-händelser kvar oförändrade; v37:s export tar med hela lagringen (`snapshot()`) |
| 2b | Tillbaka i nya | ✅ programmet (Tidigt ätfönster, dag 1) och målet (5/vecka, 80 kg) kvar |
| 3 | Annan flik sparar mål / avslutar program medan kortet/panelen är öppen | ✅ båda vägras, meddelandet "…öppen i ett annat fönster…" visas, senaste läget visas |
| 4 | Import | ⚠️ inte i webbläsaren; täcks av `tests/program.test.mjs` (export/import behåller mål och program) |

## Flöden
- Veckomål 5 → "Den här veckan: 2 av 5 fastor" (fastor ≥ 12 h, 3 h-fastan räknas inte) ✅
- Målvikt 20 → felmeddelande, inget sparas; 80 → sparas ✅. Hälsokryss "ätstörning" → `mal.viktHalsa`, ingen källa ✅
- Kom igång: dag 1, 12 h, startknapp "Starta 12 h fasta"; veckoraden dold när program finns ✅
- Pausa → "Pausat" + "Fortsätt programmet" (rättat: syns nu på kortet), fortsätt → dag oförändrad ✅
- Löpande vald under program → "Starta löpande fasta" + knapp "Dagens förslag" som går tillbaka ✅
- Byt till 16:8 som vana (bekräftelse) → dag 1 av 56, "1 av 5 dagar den här veckan" ✅
- Start flyttad 57 dagar bakåt → "Programmet är klart", "Stäng" avslutar och veckoraden kommer tillbaka ✅
- Tidigt ätfönster visar påminnelsen om ätfönstret, inget spärras ✅
- Touch-ytor: veckoknappar 44×44 (Inget mål 44×89), ⋯ och ✕ ≥ 44 px; målviktsfältet 16 px ✅
- Konsolfel: inga ✅
