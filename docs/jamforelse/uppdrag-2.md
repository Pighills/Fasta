# Jämförelse Cowork vs Codex – uppdrag 2 (fastefaser, fördelar, scheman)

Granskat av Cowork 2026-09-24. Codex läser inte den här mappen.

**Förbehåll:** Cowork bedömer delvis sitt eget arbete. Den här gången var jämförelsen **nästan blind**: Codex uppger att den inte läst Coworks granskning av fastefaserna (men hade sett uppdrag 1-texterna). Cowork gjorde sin research innan Codex fil fanns.

## Källkontroll av Codex (13 källor)

Alla 13 källor finns och har rätt titel, tidskrift och år. **Ingen påhittad källa.**

- Sex källor delas med Cowork: Anton 2018, Bensalem 2025, Cheng 2014, Khalafi 2025, Semnani-Azad 2025, Ezpeleta 2024.
- **Nya hos Codex:** Herman 2025 (Nutrients, översikt), Horne 2025 (Front Endocrinol, tillväxthormon, n=30), Alkurd 2024 (samma BDNF-översikt som Cowork), **Bamberg & Moreau 2025** (Psychological Bulletin, metaanalys om kognition, 3 484 deltagare), **Chen 2026** (BMJ Medicine, tidigt vs sent ätfönster), Garegnani 2026 (Cochrane), Klionsky 2021 (metodriktlinje för autofagi).
- **Nya hos Cowork:** Cahill 2006 (ketontidslinje), **Fazeli & Steinhauser 2025** (Endocrine Reviews), Ho 1988 (ursprunget till "5x"), **Commissati 2025** (lång fasta *ökar* inflammation), Pietzner 2024.
- **Författarfel:** BDNF-översikten i Medicina 2024. Codex anger Alkurd R m.fl., Cowork angav Faris ME m.fl. Cowork har rättat till Alkurd (Codex hade läst PMC-sidan), men kontrollera på PubMed 38276070.

## Samma slutsatser

Båda kom fram till att följande saknar stöd hos människor: ketos "till stor del" vid 16 h, ketontopp vid 36 h, "5x tillväxthormon", BDNF/skärpt fokus, minskad inflammation vid 12 h, autofagi vid exakta klockslag, immunförnyelse/stamceller/"systemreset" (musdata), och att längre scheman är "effektivare". Samma evidensnivåer. Det är ett gott tecken – två oberoende granskningar landar lika.

## Skillnader

| Område | Cowork | Codex |
|---|---|---|
| **Grundhållning i apptexterna** | Berättar vad som faktiskt händer (ketoner stiger, IGF-1 sjunker, muskler förloras, vanliga besvär) och vad som inte är visat. | Berättar mest vad timern **inte** kan visa och vad som **inte** är visat. Mycket säkert, men ger användaren lite kunskap. |
| **Fördelslistorna** | Omskrivna, föreslår rubriken "Vad händer nu". | **Tas bort helt** – upplåsta "fördelar" gör hypoteser till personliga löften. |
| **Scheman** | Neutrala namn + kort, belagd information (t.ex. samma viktnedgång som att äta mindre). | Rent tekniska namn ("8 timmars ätfönster") och "beskriver när du äter, inte hälsoeffekter". |
| **Inflammation vid lång fasta** | Hittade att CRP steg 129 % vid ~10 dygns fasta (Commissati 2025). | Saknas. |
| **Ketontidslinje** | Cahill: topp efter ca 2 veckor. | Säger bara "ingen topp vid 36 h". |
| **Kognition** | BDNF-översikten. | Även en **metaanalys av faktisk tankeförmåga** (ingen skillnad vid korta fastor) – starkare. |
| **Tidigt ätfönster** | Saknas. | Chen 2026: tidigt ätfönster något bättre. |
| **Metod och öppenhet** | Källförteckning med "läst av Cowork". | Utförligare metodnotering, evidensstyrka per ruta, noterar sökdatum för nya översikter. |
| **Textkvalitet** | Enklare, mer informativ, något längre. | Korrekt men torr och negativ; flera texter handlar om vad appen inte kan. |

## Samlad bedömning

| Kriterium | Cowork | Codex |
|---|---|---|
| Källor finns och stöder texten | Ja | Ja |
| Nyhet och styrka | Bra | Något bättre (fler metaanalyser 2025–2026) |
| Hittade viktig evidens som den andra missade | Commissati 2025, Fazeli 2025, Cahill | Bamberg & Moreau 2025, Chen 2026 |
| Öppenhet om osäkerhet | Bra | Mycket bra |
| Användbarhet som apptext | **Bättre** | Sämre (för negativt och torrt) |

**Slutsats för uppdrag 2:** Jämnt. Codex är något mer rigorös och försiktig, Cowork skriver mer användbara texter och hittade viktiga människodata som Codex saknade.

**Sammantaget efter två uppdrag:** Codex är den starkare *granskaren* (hittar fler nya översikter, mer metodisk), Cowork är den starkare *skribenten* (texter som passar appen). Bäst resultat får du av att låta båda göra researchen och slå ihop – som här.

## Åtgärd

Coworks fil `docs/kunskap/fastefaser.md` är uppdaterad med det bästa från Codex (status fortfarande `förslag`):
- Bamberg & Moreau 2025 → fordel.16h säger nu att tankeförmågan oftast inte påverkas av kortare fastor.
- Chen 2026 → schema.16:8 nämner att ett tidigt ätfönster verkar vara något bättre.
- fas.12h: "Timern visar en uppskattning, inte vad som faktiskt händer i just din kropp" (Codex idé).
- Rättat förstaförfattare för BDNF-översikten och siffrorna för BMJ-metaanalysen.

## Beslut (fattade 2026-09-24)

1. **Fördelslistorna** behålls men beskriver vad som händer (Coworks förslag). Codex invändning tas tillvara: rubrikerna "Uppnådda effekter" och "mätbara effekter" i historiken byts ut (ny ruta `ui.effekter`).
2. **72-timmarsschemat** behålls med hänvisning till vården (båda var överens).
