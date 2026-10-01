@AGENTS.md

## gstack
Använd /browse från gstack för all webbläsning. Relevanta skills för FASTA:
/office-hours, /spec, /plan-ceo-review, /plan-eng-review, /plan-design-review, /review, /investigate, /health, /qa, /qa-only, /design-review, /benchmark, /canary, /cso, /codex, /careful, /context-save, /context-restore, /document-release, /learn
Använd INTE /ship, /land-and-deploy eller /retro.

## Projektregler
- **Spara tokens:** följ avsnittet "Spara tokens" i `docs/ARBETSFLODE.md`. En uppgift per session.
AGENTS.md gäller alltid, även för alla gstack-skills och plugins. Git-flödet ("förhandsvisa"/"publicera"), cache-versionen, temat och textreglerna står i AGENTS.md och upprepas inte här. Nedan står bara tillägg.
- Jag kör Claude Code i desktop-appen och öppnar aldrig terminal själv. Du kör alla kommandon.
- Produktion: https://fastatimer.se. Förhandsversion: Vercel-länken från PR:en.
- gstack-skills som committar (t.ex. /qa, /review, /document-release) gör det på arbetsgrenen enligt AGENTS.md, aldrig direkt på main.
- Inga ramverk, byggsteg eller npm-beroenden i appen utan att fråga mig.

## Plugins
- **ponytail**: använd för all kodändring. Enklaste lösningen som fungerar, men stryk aldrig validering, felhantering, säkerhet eller tillgänglighet.
- **ui-ux-pro-max**: använd bara när en ny vy eller ny design byggs (inte vid små ändringar, se "Spara tokens" i `docs/ARBETSFLODE.md`), men följ FASTA:s befintliga designspråk (färger, typsnitt, komponenter). Föreslå inte ny stil utan att fråga mig först. All UI-text ska vara på svenska.
- **impeccable** (`.claude/skills/impeccable/`) och **frontend-design** (plugin): använd vid design-uppgifterna T-32–T-38. Se avsnittet "Design-skills" i AGENTS.md.
