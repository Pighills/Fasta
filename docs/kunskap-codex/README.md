# Kunskapsbas – Codex (parallell research)

Den här mappen är **Codex arbetsyta** för research om hälsotexterna i FASTA. Den används för att jämföra Codex och Claude Cowork som researchverktyg.

**Viktigt:** Det här är *inte* källan till sanning för appen. Appen byggs bara från [`docs/kunskap/`](../kunskap/). Inget härifrån byggs in i koden utan att först ha flyttats dit och godkänts av Anton.

## Regler för Codex

1. **Skriv bara i den här mappen** (`docs/kunskap-codex/`). Rör ingen kod och inga andra mappar.
2. **Läs inte `docs/kunskap/` eller `docs/jamforelse/`**, och använd inte Coworks resultat från chatten, innan du är klar med ett uppdrag. Researchen ska vara oberoende så att jämförelsen blir rättvis.
3. **Ändra aldrig ID:n** (t.ex. `halsa.diabetesMeds`). De används för att jämföra rutor mellan mapparna.
4. Följ uppdragen i [UPPDRAG.md](UPPDRAG.md) uppifrån och ned. Sätt status `förslag` på rutor du ändrar och markera uppdraget som klart.
5. Committa inte själv om Anton inte ber om det.

## Krav på källor

- Så **ny** forskning som möjligt. Ange publiceringsår.
- **Referentgranskad** forskning (peer review). Föredra i ordning: kliniska riktlinjer och myndigheter (Livsmedelsverket, 1177, Socialstyrelsen, EMA, WHO), systematiska översikter och metaanalyser, stora randomiserade studier på människor.
- **Inga påståenden får bygga på enskilda små studier.** Används en sådan ändå (t.ex. för att förklara en mekanism), skriv det tydligt.
- Skilj på fynd hos djur och fynd hos människor.
- **Hitta inte på källor.** Varje källa ska finnas och faktiskt stödja texten. Ange författare, år, titel, tidskrift, volym/sidor och DOI eller länk. Kunde du inte läsa en källa själv (t.ex. betalvägg), skriv det.
- Ange i research-anteckningen hur stark evidensen är (stark / måttlig / svag) och vad som är osäkert.

## Regler för texterna i appen

1. Svenska, enkelt, utan fackspråk. Förklara facktermer i en bisats första gången.
2. Hellre försiktigt än överdrivet. Skriv "kan" och "i studier har man sett" när forskningen är osäker.
3. Inga påståenden om att appen eller fasta behandlar, botar eller förebygger sjukdom.
4. Längd: kort text ≤ 2 meningar, lång text ≤ 6 meningar. Appen visas på mobil.
5. I appen räcker en kort källa, t.ex. "Ganson m.fl. 2022". Fullständig referens hör hemma i research-anteckningen.

## Format för en ruta

Samma som i `docs/kunskap/`, så att text kan flyttas mellan mapparna:

```
### <id>
- **Var i appen:** Flik → kort → ruta
- **Status:** i appen, ej granskad | förslag

**<Fält> – nu:**        ← texten som står i appen (ursprunglig version)
**<Fält> – ny text:**   ← Codex förslag, exakt som det ska stå i appen
**Källor nu:**          ← källorna som stod i appen
**Research-anteckning:** ← vad källorna visar, evidensstyrka, osäkerheter, länkar
```

Skriv `_(ingen ändring)_` om nuvarande text är korrekt, eller `_(ta bort)_` med motivering.

## Filer

| Fil | Innehåll | Var i appen |
|---|---|---|
| [halsa-och-sakerhet.md](halsa-och-sakerhet.md) | Riskfrågor, varningar, friskrivning | Profil → Hälsa och säkerhet |
| [fastefaser.md](fastefaser.md) | Faser, fördelar, scheman | Timer |
| [lara.md](lara.md) | Lära-korten | Lära |
| [UPPDRAG.md](UPPDRAG.md) | Uppdrag till Codex | – |
| [_mall.md](_mall.md) | Mall för en ny ruta | – |

Filerna innehåller texterna i den **ursprungliga** versionen (före granskning), så att Codex börjar från samma utgångsläge som Cowork gjorde.
