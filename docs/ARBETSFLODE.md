# Arbetsflöde: Cowork, Claude Code och Codex

Gäller alla AI-assistenter i FASTA. Kompletterar AGENTS.md (som alltid gäller).

## Roller
| Vem | Roll |
|---|---|
| **Anton** | Chef. Godkänner planer, texter, produktval och publicering. |
| **Claude Cowork** | Projektledare. Håller kön (`docs/arbete/KO.md`), skriver arbetsbeskrivningar (`docs/arbete/T-xx.md`), fördelar uppgifter, granskar rapporter och presenterar för Anton. Researchar hälsotexter i `docs/kunskap/`. Rör inte koden. |
| **Claude Code** | Huvudprogrammerare och integratör. Gör Code-spåret, granskar och testar Codex arbete, och är den enda som publicerar. |
| **Codex** | Extra programmerare. Gör Codex-spåret i en egen kopia av repot. Publicerar och pushar aldrig. |

## Filer
- `docs/arbete/KO.md` – kön med status. **Levande fil, ligger inte i git** (se `.gitignore`), så alla ser samma version oavsett gren. Skrivs av Cowork (nya uppgifter, Antons godkännanden) och Claude Code (status). Codex läser bara.
- `docs/arbete/T-xx.md` – arbetsbeskrivning per uppgift. Skrivs av Cowork. Också utanför git.
- `docs/rapporter/T-xx.md` – rapport när en uppgift är klar (i git, på uppgiftens gren). Högst ca 30 rader: vad ändrades, var i appen det syns, hur det testats, vad som inte kunde testas, risker, 3–5 saker Anton kan se på datorn.
- `docs/STATUS.md` – kort nuläge (vad som är live, kända problem). Äldre historik i `docs/historik.md`.

## Status i kön
`redo` → `pågår` → `klar på gren` (Codex) → `granskas` (Code granskar Codex arbete) → `väntar på Anton` → `godkänd` (Anton har sagt ok till publicering) → `live`.
Övriga: `väntar` (beroende inte klart), `blockerad` (beslut från Anton saknas), `underkänd` (se anteckning).

Märkning:
- 🔒 = Code ensam. Medan en 🔒-uppgift pågår får Codex bara ta uppgifter märkta **fri**.
- **fri** = rör bara `tests/` eller `docs/` och kan alltid köras parallellt.
- 💾 = rör sparad data. Kräver test av uppgradering från befintlig data.
- **förgodkänd** = uppgifter som bara ändrar `docs/` eller `tests/` (ingen ändring i appen). Claude Code publicerar dem direkt efter granskning, utan att vänta på Anton.

**Krockregel:** börja aldrig en uppgift vars filer (kolumnen *Filer*) finns i en uppgift från det andra spåret som inte är `live`. Ta då nästa uppgift i ditt spår, eller stanna och skriv varför.

## "Jobba vidare" – Claude Code (arbetsmapp `D:\FASTA`)
1. Läs `docs/arbete/KO.md`. Läs `docs/STATUS.md` bara om du behöver nuläget.
2. **Publicera** allt med status `godkänd` i **en** publicering (sparar tid och tokens): ny gren `publicera-vNN` från `main`, slå ihop alla godkända grenar i den, höj cache-versionen i `sw.js` **en gång** till nästa lediga nummer (och lägg nya filer i `PRECACHE`), kör `node --check` och `node --test tests/*.test.mjs`, gör ett kort test i 390×844, skapa en PR och slå ihop enligt git-flödet i AGENTS.md (stäng de enskilda PR:erna som sammanslagna). Sätt status `live (fasta-vNN)` i kön och uppdatera "Live nu" i `docs/STATUS.md`. Publicera aldrig något som inte har status `godkänd` eller är förgodkänt.
3. **Ta hand om Codex arbete:** `git fetch codex`. För varje gren `codex/T-xx` med commit "T-xx klar": sätt `granskas`, pusha grenen till GitHub och skapa en PR, kör /review, tester och /qa-only i 390×844 (plus uppgraderingstest vid 💾). Rätta småfel själv på grenen. Är något fel i grunden: sätt `underkänd` med en rad om varför. Annars komplettera rapporten och sätt `väntar på Anton`.
4. **Nästa egna uppgift:** första `redo` i Code-spåret vars beroenden är uppfyllda. Sätt `pågår`, läs `docs/arbete/T-xx.md` och följ den. Ny gren från senaste `main`, en commit per fix, /review, /qa-only i 390×844. Höj **inte** cache-versionen på grenen (det görs vid publicering). Skriv rapporten, förhandsvisa, sätt `väntar på Anton`.
5. Fortsätt med nästa uppgift tills kön är tom för dig, en uppgift kräver Antons beslut, eller sessionen blivit lång. Sluta alltid med 3–5 rader: vad som är klart, vad som väntar på Anton, vad som är nästa.
6. Cowork kan ha sparat ändringar i `docs/kunskap/` som inte committats: ta med dem i din nästa gren.

## "Jobba vidare" – Codex (arbetsmapp `D:\FASTA-codex`, egen kopia)
1. Läs kön från **huvudmappen**: `D:\FASTA\docs\arbete\KO.md` (inte från din kopia – den finns inte där).
2. Välj första uppgift i Codex-spåret med status `redo` (eller `pågår` om det är din egen), vars beroenden är uppfyllda, som följer krockregeln och som du inte redan har en gren för. Läs `D:\FASTA\docs\arbete\T-xx.md`.
3. Hämta senaste koden: `git fetch lokal` och `git switch -c codex/T-xx lokal/main`.
4. Gör uppgiften. En commit per fix, meddelande på svenska. Kör `node --check` på ändrade JS-filer och `node --test tests/*.test.mjs`.
5. Skriv `docs/rapporter/T-xx.md` och avsluta med en commit med meddelandet `T-xx klar`.
6. Ta nästa uppgift. Stanna när ingen uppgift är ledig och skriv 3–5 rader om vad du gjort.

Codex får **inte**: publicera, pusha, slå ihop grenar, ändra `sw.js`-raden `const CACHE`, ändra `docs/STATUS.md`, `docs/fixplan.md`, `AGENTS.md`, `CLAUDE.md` eller något i `docs/kunskap/`, eller ändra dataformatet i localStorage. Behövs något av det: skriv det i rapporten.
Kan du inte köra git (behörighet): säg det direkt och stanna – försök inte gå runt det.

## Cowork – "avstämning"
Läs `docs/arbete/KO.md` och rapporterna för uppgifter som `väntar på Anton` (`git show <gren>:docs/rapporter/T-xx.md`). Presentera kort för Anton: vad som är klart och rekommendation (publicera / inte), beslut som behövs. Efter Antons ok: sätt `godkänd (Anton <datum>)` i kön. Fyll på kön och skriv arbetsbeskrivningar när färre än två uppgifter per spår är `redo`.

**Vad Cowork gör till 🔒 / Code-spåret:** ändrat dataformat eller migrering, stora funktioner (Fas 1a, 1b, träning), ändringar som rör många filer, allt i `AGENTS.md`/`CLAUDE.md`, och all publicering. Codex får avgränsade fixar, tester och förberedande arbete med tydliga filer.
