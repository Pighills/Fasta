@AGENTS.md

## gstack
Använd /browse från gstack för all webbläsning. Relevanta skills för FASTA:
/office-hours, /spec, /plan-ceo-review, /plan-eng-review, /plan-design-review, /review, /investigate, /health, /qa, /qa-only, /design-review, /benchmark, /canary, /cso, /codex, /careful, /context-save, /context-restore, /document-release, /learn
Använd INTE /ship, /land-and-deploy eller /retro.

## Projektregler (gäller även alla gstack-skills)
Reglerna nedan gäller före AGENTS.md där de krockar (t.ex. git-flödet: inga grenar eller PR:er).
- Jag kör Claude Code i desktop-appen och öppnar aldrig terminal själv. Du kör alla kommandon.
- Pusha direkt till main, inga PR:er. Vercel deployar automatiskt från main.
- Höj cache-versionen i sw.js vid varje push.
- Produktions-URL: https://fastatimer.se
- Stack: vanilla JS ES-moduler, PWA, localStorage. Inga ramverk eller byggsteg utan att fråga mig.
- All användartext på svenska, utan teknisk jargong.
- Hälsopåståenden ska bygga på aktuell, peer-reviewad forskning, aldrig på enstaka små studier.
- Tema: bakgrund #0a0a0a, guld #c8a84e, typsnitt Outfit, kort #1a1a1a med kant #2a2a2a.

## Plugins
- **ponytail**: använd för all kodändring. Enklaste lösningen som fungerar, men stryk aldrig validering, felhantering, säkerhet eller tillgänglighet.
- **ui-ux-pro-max**: använd vid UI-arbete, men följ FASTA:s befintliga designspråk (färger, typsnitt, komponenter). Föreslå inte ny stil utan att fråga mig först. All UI-text ska vara på svenska.
