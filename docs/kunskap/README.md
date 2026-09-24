# Kunskapsbas – gemensam arbetsyta för fakta och texter

Den här mappen är **den enda källan till sanning för allt innehåll i FASTA som påstår något om kropp och hälsa**, och för den exakta texten i varje ruta.

## Roller

| Vem | Gör |
|---|---|
| **Claude Cowork** | Researchar, kontrollerar påståenden mot källor och skriver färdig svensk text per ruta i appen. Skriver bara i den här mappen. Rör aldrig koden. |
| **Anton** | Läser, ändrar och godkänner. Bara Anton sätter status "godkänd". |
| **Claude Code** | Bygger in godkända texter i appen på rätt ställe och sätter status "inbyggd". Skriver aldrig egna hälsopåståenden utan att de först finns här. |

**Regel för Cowork:** När något ska göras av Claude Code (committa, bygga in texter, ändra kod) ska Cowork alltid ge Anton en färdig prompt att klistra in i Claude Code, i ett kodblock – inte bara skriva "be Claude Code göra X".

## Arbetsflöde

1. Anton ger Cowork ett uppdrag, se [UPPDRAG.md](UPPDRAG.md).
2. Cowork fyller i **ny text**, **källor** och **research-anteckning** för varje berörd ruta och sätter status `förslag`.
3. Anton läser och sätter status `godkänd`, eller skriver en kommentar och ber Cowork ändra.
4. Anton säger till Claude Code: *"bygg in godkända texter från kunskapsbasen"*.
5. Claude Code kopierar texten **ordagrant** till koden, sätter status `inbyggd` och kopierar den nya texten till fältet *nu*.

## Filer

| Fil | Innehåll | Var i appen |
|---|---|---|
| [halsa-och-sakerhet.md](halsa-och-sakerhet.md) | Riskfrågor, varningar, friskrivning | Profil → Hälsa och säkerhet |
| [fastefaser.md](fastefaser.md) | Faser, fördelar, scheman | Timer |
| [lara.md](lara.md) | Lära-korten | Lära |
| [UPPDRAG.md](UPPDRAG.md) | Kö med research-uppdrag till Cowork | – |
| [_mall.md](_mall.md) | Mall för en ny ruta eller ett nytt ämne | – |

## Format för en ruta

Varje ruta har ett **fast ID** (t.ex. `halsa.diabetesMeds`, `fas.24h`, `lara.8`) som rubrik. **Ändra aldrig ID:t**. Det är så Claude Code hittar rätt ställe i koden.

```
### <id>
- **Var i appen:** Flik → kort → ruta
- **Status:** i appen, ej granskad | förslag | godkänd | inbyggd

**<Fält> – nu:**        ← texten som står i appen idag (ändras bara av Claude Code)
**<Fält> – ny text:**   ← Coworks förslag, exakt som det ska stå i appen
**Källor nu:**          ← källorna som står i appen idag
**Research-anteckning:** ← vad källorna faktiskt visar, osäkerheter, länkar
```

Lämna *ny text* som `_(ingen ändring)_` om den nuvarande texten är korrekt.
Vill man ta bort en ruta: skriv `_(ta bort)_` och förklara varför.

## Regler för innehållet

1. **Svenska, enkelt, utan fackspråk.** Förklara facktermer i en bisats första gången.
2. **Varje påstående om kroppen ska ha en källa**, helst en översiktsartikel, en randomiserad studie på människor eller en svensk myndighet (Livsmedelsverket, 1177, Socialstyrelsen).
3. **Hellre försiktigt än överdrivet.** Skriv "kan", "i studier har man sett" när forskningen är osäker. Skilj på fynd hos möss och fynd hos människor.
4. **Inga påståenden om att appen eller fasta behandlar, botar eller förebygger sjukdom.**
5. **Källor anges fullständigt** i research-anteckningen: författare, år, titel, tidskrift, DOI eller länk. I själva appen räcker en kort form, t.ex. "Ganson m.fl. 2022".
6. **Längd:** kort text ≤ 2 meningar, lång text ≤ 6 meningar, om inget annat sägs i uppdraget. Appen visas på mobil.
7. **Hitta inte på källor.** Går något inte att belägga, skriv det i research-anteckningen och föreslå en försiktigare text.

## Tekniskt (för Claude Code)

- Texterna finns i `js/data.js` (`PH`, `BENEFITS`, `PRESETS`, `LC`, `HEALTH_FLAGS`).
- Cowork kan ha sparat ändringar här utan att de committats. Committa dem tillsammans med nästa ändring (eller separat) så att de inte försvinner vid grenbyte.
- Efter inbyggnad: höj cache-versionen i `sw.js` enligt AGENTS.md.
