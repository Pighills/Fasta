# Arbetsflöde: Cowork, Claude Code och Codex

Gäller alla AI-assistenter i FASTA. Kompletterar AGENTS.md (som alltid gäller).

## Roller
| Vem | Roll |
|---|---|
| **Anton** | Chef. Godkänner planer, texter, produktval och **stora** publiceringar (se "Små och stora ändringar"). Kontrollerar resten efter publicering. |
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

### Små och stora ändringar (Anton 2026-10-03)
Anton granskar inte före publicering i det här skedet – han kontrollerar efteråt. Därför:
- **Liten ändring = publiceras automatiskt** av Claude Code direkt efter godkänd granskning och gröna tester (status `granskas` → `live`, hoppa över `väntar på Anton`): rättelser av fel, design/polish inom `DESIGN.md`, tillgänglighet, prestanda, textjusteringar inom redan godkända texter, och genomförande av beslut Anton redan tagit.
- **Stor ändring = väntar på Anton** (`väntar på Anton`): 💾 dataformat/migrering, 🔒-uppgifter, ny eller borttagen funktion/vy, nya hälso- eller juridiska texter, ny stil eller färg utöver `DESIGN.md`, säkerhetshuvuden/CSP, och planer för nya faser.
- Osäker? Välj **stor**. Code skriver i kön vad som gick live automatiskt (rad under "Live nu"), så Cowork kan visa Anton det vid avstämning.

### Arbetssätt – självständighet (gäller Code och Codex)
- Jobba vidare så länge uppgiften går att föra framåt. Fråga inte om lov för rutinsteg (läsa, ändra filer i uppgiften, testa, committa på arbetsgrenen).
- Väntar du på en annan agent: gör allt som inte beror på den och skriv exakt vad som återstår.
- Stanna och fråga **bara** vid sådant som inte går att ångra eller ligger utanför uppdraget: radera användardata, force-push, kostnader/köp, lösenord/inloggningar, meddelanden till andra personer, ändrad omfattning.
- Vid osäkerhet: välj det rimligaste, skriv antagandet i rapporten och fortsätt.

**Krockregel:** börja aldrig en uppgift vars filer (kolumnen *Filer*) finns i en uppgift från det andra spåret som inte är `live`. Ta då nästa uppgift i ditt spår, eller stanna och skriv varför.

## "Kör" – Claude Code (arbetsmapp `D:\FASTA`)
1. Läs `docs/arbete/KO.md`. Läs `docs/STATUS.md` bara om du behöver nuläget.
2. **Publicera** allt med status `godkänd` i **en** publicering (sparar tid och tokens): ny gren `publicera-vNN` från `main`, slå ihop alla godkända grenar i den, höj cache-versionen i `sw.js` **en gång** till nästa lediga nummer (och lägg nya filer i `PRECACHE`), kör `node --check` och `node --test tests/*.test.mjs`, gör ett kort test i 390×844, skapa en PR och slå ihop enligt git-flödet i AGENTS.md (stäng de enskilda PR:erna som sammanslagna). Sätt status `live (fasta-vNN)` i kön och uppdatera "Live nu" i `docs/STATUS.md`. Publicera aldrig något som inte har status `godkänd`, är förgodkänt eller är en liten ändring enligt "Små och stora ändringar".
3. **Ta hand om Codex arbete:** `git fetch codex`. För varje gren `codex/T-xx` med commit "T-xx klar": sätt `granskas`, pusha grenen till GitHub och skapa en PR, läs diffen, kör testerna och kontrollera i 390×844 enligt "Spara tokens" nedan (/review och /qa-only bara vid 💾/🔒). Rätta småfel själv på grenen. Är något fel i grunden: sätt `underkänd` med en rad om varför. Annars komplettera rapporten och sätt `väntar på Anton`.
4. **Nästa egna uppgift:** första `redo` i Code-spåret vars beroenden är uppfyllda. Sätt `pågår`, läs `docs/arbete/T-xx.md` och följ den. Ny gren från senaste `main`, en commit per fix, test enligt "Spara tokens" nedan. Höj **inte** cache-versionen på grenen (det görs vid publicering). Skriv rapporten, förhandsvisa, och sätt `väntar på Anton` (stor ändring) eller publicera direkt (liten ändring).
5. **Stanna efter EN uppgift** (steg 2 och 3 räknas inte som uppgifter om de är små). Ta inte nästa uppgift i samma session – Anton startar en ny session. Sluta alltid med 3–5 rader: vad som är klart, vad som väntar på Anton, vad som är nästa.
6. Cowork kan ha sparat ändringar i `docs/kunskap/` som inte committats: ta med dem i din nästa gren.

## Spara tokens (Anton 2026-09-26)
Claude Code, Cowork och chatten delar samma användningsgräns. Varje steg i en session skickar om hela samtalet, så långa sessioner blir dyra.
- **En uppgift per session/tråd.** Hellre fler korta sessioner än en lång.
- **Läs bara det du behöver:** kön, din `T-xx.md` och filerna du ändrar. Läs inte `docs/kunskap/`, `docs/fixplan.md`, `docs/historik.md` eller planer i helhet om uppgiften inte kräver det – sök (grep) efter rätt avsnitt.
- **Webbläsaren sparsamt:** testa i 390×844 bara det som ändrats. Kontrollera med text/DOM/JS (t.ex. läs text, mät storlek, läs konsolen) i stället för skärmbilder. Högst ett par skärmbilder per uppgift, bara när utseendet är poängen. Ingen fullständig genomgång av hela appen.
- **Uppgraderingstest (💾):** i första hand som automatiskt test i `tests/` med sparad data från förra versionen. Webbläsartest med `/qa-main/` bara när uppgiften ändrar dataformat eller migrering.
- **Tunga verktyg bara vid behov:** /review och /qa-only bara vid 💾 eller 🔒. /plan-eng-review bara för planer för nya faser. `ui-ux-pro-max` bara när en ny vy eller ny design byggs, inte vid små ändringar. /benchmark, /cso, /qa (hela appen) bara när kön säger det.
- **Enhetstesterna (`node --test`) körs alltid, men tyst:** `node --test tests/*.test.mjs 2>&1 | tail -8`. De tar under 2 sekunder och kostar inga tokens att köra – bara utskriften kostar (hela ≈ 8 000 tokens, sammanfattningen ≈ 100). Vid rött: visa bara de röda testerna.
- **Arbetsfördelning (Anton 2026-09-27):** Codex bygger så mycket som möjligt, även stora och 🔒-uppgifter. Claude Code granskar, testar i 390×844, rättar småfel och publicerar – bygger bara själv när Codex inte kan (t.ex. gstack-verktyg som /qa och /benchmark). Claude Code och Cowork delar samma användningsgräns; Codex har en egen.
- **Korta rapporter:** högst ca 30 rader. Klistra inte in långa loggar eller testutskrifter i svaret – skriv antal gröna/röda.

## "Kör" – Codex (arbetsmapp `D:\FASTA-codex`, egen kopia)
1. Läs kön från **huvudmappen**: `D:\FASTA\docs\arbete\KO.md` (inte från din kopia – den finns inte där).
2. Välj första uppgift i Codex-spåret med status `redo` (eller `pågår` om det är din egen), vars beroenden är uppfyllda, som följer krockregeln och som du inte redan har en gren för. Läs `D:\FASTA\docs\arbete\T-xx.md`.
3. Hämta senaste koden: `git fetch lokal` och `git switch -c codex/T-xx lokal/main`.
4. Gör uppgiften. En commit per fix, meddelande på svenska. Kör `node --check` på ändrade JS-filer och `node --test tests/*.test.mjs`.
5. Skriv `docs/rapporter/T-xx.md` och avsluta med en commit med meddelandet `T-xx klar`.
6. **Stanna efter EN uppgift** och skriv 3–5 rader om vad du gjort. Anton startar en ny tråd för nästa.

Codex får **inte**: publicera, pusha, slå ihop grenar, ändra `sw.js`-raden `const CACHE`, ändra `docs/STATUS.md`, `docs/fixplan.md`, `AGENTS.md`, `CLAUDE.md` eller något i `docs/kunskap/`, eller ändra dataformatet i localStorage. Behövs något av det: skriv det i rapporten.
Git-kommandon som skriver (`git fetch`, `git switch`, `git add`, `git commit`) blockeras av Codex sandlåda (`.git` är skrivskyddad). Då ska du **be om godkännande för kommandot** (köra utanför sandlådan) – Anton godkänner i Codex-appen. Stanna bara om Anton nekar. Gå aldrig runt det på annat sätt (t.ex. kopiera repot eller ändra behörigheter).

## Cowork – "avstämning"
Läs `docs/arbete/KO.md` och rapporterna för uppgifter som `väntar på Anton` (`git show <gren>:docs/rapporter/T-xx.md`). Presentera kort för Anton: vad som är klart och rekommendation (publicera / inte), beslut som behövs. Efter Antons ok: sätt `godkänd (Anton <datum>)` i kön. Fyll på kön och skriv arbetsbeskrivningar när färre än två uppgifter per spår är `redo`.

**Vad Cowork gör till 🔒 / Code-spåret:** ändrat dataformat eller migrering, stora funktioner (Fas 1a, 1b, träning), ändringar som rör många filer, allt i `AGENTS.md`/`CLAUDE.md`, och all publicering. Codex får avgränsade fixar, tester och förberedande arbete med tydliga filer.
