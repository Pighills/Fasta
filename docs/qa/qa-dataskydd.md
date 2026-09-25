# QA – dataskydd (gren `fix-dataskydd`, cache fasta-v34)

**Datum:** 2026-09-25 · **Verktyg:** /qa-only med gstacks headless-webbläsare (`browse`), fönster 390×844
**Mål:** http://localhost:3000 (`npx serve`). Förhandsversionen på Vercel kräver inloggning hos Vercel (302 till `vercel.com/sso-api`), därför testat lokalt enligt Antons instruktion.
**Resultat:** inga fel orsakade av grenen. Inga konsolfel.

## Uppgradering från main
Main-koden (commit `741cbb0`) serverades från `/qa-main/` på samma adress, så båda versionerna delade samma localStorage.

| Test | Resultat |
|---|---|
| Data skapad i main via appen: profil + hälsokryss, fasta 40 h med måltid och träningspass, fasta 20 h, pågående löpande fasta med måltid (paus) | skapad utan fel |
| Samma data öppnad i grenen: Historik, Profil, historikdetalj, Timer (klockslag bortfiltrerade) | **identisk** text |
| Rådatan i `fasta-data` efter öppning i grenen | **identisk**, inte omskriven |
| Äldre format (schemaVersion 1) öppnat direkt i grenen jämfört med main | Historik och Profil identiska; Timer skiljer bara i två klockslag (testdatan skapades en minut isär). Uppgraderad till v2, orörd kopia i `fasta-data-pre-v2` |

## Flöden (390×844)
| Test | Resultat |
|---|---|
| Avsluta pågående fasta | fastan i historiken, "ingen aktiv fasta" sparad i samma skrivning |
| Starta fasta, logga måltid, logga träning | fungerar, rutorna stängs |
| Avsluta, Historik | 4 kort, rätt siffror |
| Radera andra kortet | rätt fasta borta, övriga kvar |
| Meddelanderutan: tryck | försvinner direkt |

## Två flikar
| Test | Resultat |
|---|---|
| Flik 2 startar fasta | flik 1 visar fastan utan omladdning |
| Flik 1 har "Avsluta fastan?" öppen, flik 2 avslutar, flik 1 trycker "Ja, avsluta" | vägras, meddelandet visas, ingen dubblett (8 unika id av 8) |
| Flik 2 raderar en fasta | flik 1:s historik uppdateras utan omladdning |

## Meddelanden (390×844)
Alla fyra texterna visas exakt som Anton skrev dem. Rutan ligger 679–768 px, bottenmenyn börjar 784 px: menyn täcks inte. Bredd 358 av 390 px.
- Annat fönster, nyare version, oläslig data, full lagring (simulerad): OK.
- Oläslig data: orörd kopia i `fasta-data-error`. Import via Profil → Din data → Importera: bekräftelserutan visar den nya texten, datan ersätts, kopian är orörd, appen är inte längre låst.

## Kunde inte testas
- Riktig telefon: installerad app, offline, notch/safe-area, iOS Safari. Service worker kan inte testas på localhost i den här miljön.
- Uppdatering av service workern från fasta-v33 till fasta-v34 på fastatimer.se.
- En flik som telefonen har "frusit" i bakgrunden (då kommer ingen storage-händelse). Skyddet för det fallet (vägran vid sparning) är testat genom att datan ändrades utan händelse i samma flik och i enhetstester.

## Skärmdumpar
`screenshots-dataskydd/`: 01 historik efter flödet, 02 två flikar med meddelande, 03 oläslig data, 04 full lagring.
