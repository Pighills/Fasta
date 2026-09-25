# QA-baslinje: fastatimer.se

| | |
|---|---|
| **Datum** | 2026-09-25 |
| **Adress** | https://fastatimer.se (live, cache fasta-v27) |
| **Skärmstorlek** | 390×844 (mobil) |
| **Webbläsare** | gstacks headless Chromium (Aside finns inte på Windows) |
| **Läge** | Fullständig, bara rapport (inget är fixat) |
| **Ramverk** | Vanilla JS, PWA, en sida (SPA) med bottenmeny |
| **Tid** | ca 15 min |
| **Vyer** | Timer, Lära, Historik, Profil |
| **Skärmdumpar** | 27 st i `docs/qa/screenshots/` |
| **Testdata** | Tom webbläsare (ny användare). All data låg bara i testwebbläsaren, ingen riktig användardata berördes. |

## Sammanfattning

**Hälsopoäng: 89/100**

Appen är stabil: **inga konsolfel** i hela flödet, inga trasiga nätverksanrop, service workern är aktiv och all data finns kvar efter omladdning. Grundflödena fungerar: starta/avsluta fasta, välja schema, bakåtdatera, logga måltid och träning, öppna och radera historik, fylla i profil, läsa Lära-korten.

Problemen sitter i **inmatningskontroll** och **pausläget efter måltid**. Det allvarligaste: ett träningspass med negativ tid och orimliga kalorier ger en "metabol effekt" på 1250 timmar, och appen påstår sedan att en fasta på 17 sekunder nått "Tre dygn" med tillhörande kroppseffekter.

| Allvarlighet | Antal |
|---|---|
| Kritisk | 0 |
| Hög | 1 |
| Medel | 5 |
| Låg | 4 |

## Topp 3 att åtgärda

1. **ISSUE-001** Träningspass godtar negativ tid och orimliga kalorier, vilket ger +1250 h metabol effekt och felaktiga hälsobeskrivningar.
2. **ISSUE-002** Pausen efter en loggad måltid syns inte förrän sidan laddas om; timern ser ut att ha hängt sig.
3. **ISSUE-003** Under måltidspausen går det inte att logga träning eller avbryta pausen.

## Poäng per kategori

| Kategori | Vikt | Poäng | Underlag |
|---|---|---|---|
| Konsol | 15 % | 100 | 0 fel i hela flödet och efter omladdning |
| Länkar/navigering | 10 % | 100 | Alla fyra flikar och alla dialoger går att nå och stänga |
| Visuellt | 10 % | 100 | Inga layoutfel i 390×844 |
| Funktion | 20 % | 66 | 001 (hög), 002 (medel), 005 (medel), 004 (låg) |
| Användbarhet | 15 % | 83 | 003 (medel), 006, 009, 010 (låga) |
| Prestanda | 10 % | 100 | TTFB 16 ms, sidan klar på 57 ms (varm cache). Se även `docs/benchmark/baseline.md` |
| Innehåll | 5 % | 100 | Texterna i Lära och Profil läste rätt |
| Tillgänglighet | 15 % | 89 | 007 (medel), 008 (låg) |
| **Totalt** | | **89** | |

## Vad som testades

| Flöde | Resultat |
|---|---|
| Starta löpande fasta | OK |
| Avsluta fasta (med bekräftelse) | OK |
| Byt schema (16:8) | OK, startknappen byter till "Starta 16:8 fasta" |
| Bakåtdatering: tomt fält | Stoppas med ruta "Välj en tidpunkt" |
| Bakåtdatering: tid i framtiden | Stoppas med ruta "Tidpunkten måste vara i det förflutna" |
| Bakåtdatering: igår 19:00 | OK, 16:37 fastetid, "Mål nått!", rätt fas |
| Logga måltid (Lax, 2 h paus) | Sparas, men se ISSUE-002 |
| Logga egen måltid utan text | Sparas tom, se ISSUE-004 |
| Logga träning med ogiltiga värden | Sparas, se ISSUE-001 |
| Historik: öppna detaljer | OK |
| Historik: radera (Avbryt, sedan Radera) | OK, posten borta även efter omladdning |
| Profil: fyll i och spara | Sparas automatiskt, "✓ Profil klar", kvar efter omladdning |
| Profil: hälsokryss | OK, varningstext visas och krysset finns kvar efter omladdning |
| Profil: orimliga värden | Godtas, se ISSUE-005 |
| Lära: filter och kort | OK, 19 kort, filtret Träning visar rätt kort, kortet öppnas med källa |
| Omladdning med pågående fasta | OK, fasta, måltid och pass finns kvar |
| Konsolfel | Inga |

---

## Fynd

### ISSUE-001: Träningspass godtar negativ tid och orimliga kalorier, ger +1250 h effekt

**Allvarlighet:** Hög · **Kategori:** Funktion

**Steg:**
1. Starta en fasta på Timer.
2. Tryck på träningsknappen (🏋️), välj Löpning.
3. Skriv tid `-20` och kalorier `99999`. Tryck "Logga träningspass".

**Förväntat:** Negativ tid och orimliga värden stoppas med ett tydligt meddelande.

**Faktiskt:** Passet sparas som "Löpning · -20 min · 99999 kcal". Rutan Metabol effekt hoppar till **~1249:59:32** och "+1250.0h träning", och fasen blir "Tre dygn" efter 17 sekunders fasta. I Historik visar detaljen för fastan "Tre dygn – Uppnådd vid 72h", "Två dygn", "Ketos" osv. med kroppseffekter som aldrig inträffat. Profilen lovar samtidigt att "Multiplikatorn ger max ±40% justering".

**Varför det spelar roll:** Appen visar hälsoinformation som är fel. En användare som skriver fel (t.ex. kalorier i fel fält) får veta att kroppen ställt om helt till ketoner.

**Bevis:** `screenshots/07-ogiltigt-pass.png`, `screenshots/19-historik-0h-detalj.png`

---

### ISSUE-002: Pausen efter en loggad måltid syns inte förrän sidan laddas om

**Allvarlighet:** Medel · **Kategori:** Funktion

**Steg:**
1. Starta eller bakåtdatera en fasta.
2. Tryck på måltidsknappen (🍳), välj en måltid och 2h paus, tryck "Logga & fortsätt fastan".
3. Vänta några sekunder.

**Förväntat:** Timern visar direkt att fastan är pausad och när den fortsätter.

**Faktiskt:** Alla klockor stannar (t.ex. på 16:37:46) men ringen, fasen och knapparna ser ut som vanligt. Inget säger "Paus". Pausrutan "Återupptas om 01:59:47" och "⏸ Paus" i ringen syns först efter omladdning eller efter nästa loggning. Det går att reproducera varje gång (testat två gånger). Sidan har en pausruta, men den ligger i sidopanelen som är dold på mobil.

**Varför det spelar roll:** Det ser ut som att appen har hängt sig.

**Bevis:** `screenshots/15-tom-maltid-ingen-paus-visas.png` (före omladdning), `screenshots/16-efter-omladdning-paus-visas.png` (efter)

---

### ISSUE-003: Under måltidspausen går det inte att logga träning eller avbryta pausen

**Allvarlighet:** Medel · **Kategori:** Användbarhet

**Steg:**
1. Logga en måltid med 2h paus.
2. Ladda om sidan så att pausen syns.

**Förväntat:** Det går att logga ett träningspass och att avbryta pausen om man åt kortare tid än väntat.

**Faktiskt:** Knapparna för måltid och träning försvinner. Kvar finns bara "Avsluta fasta". Ikonen i pausrutan går inte att trycka på.

**Varför det spelar roll:** Den som tränar direkt efter maten kan inte logga passet förrän pausen är slut, eller måste avsluta hela fastan.

**Bevis:** `screenshots/16-efter-omladdning-paus-visas.png`

---

### ISSUE-004: Egen måltid sparas utan namn och med 0 kcal

**Allvarlighet:** Låg · **Kategori:** Funktion

**Steg:** Måltidsknappen → "Eget" → lämna båda fälten tomma → "Logga & fortsätt fastan".

**Förväntat:** Påminnelse om att beskriva måltiden.

**Faktiskt:** En namnlös måltid sparas som "11:37 · 0 kcal · 2h paus" och startar en paus.

**Bevis:** `screenshots/14-eget-maltid.png`, `screenshots/15-tom-maltid-ingen-paus-visas.png`

---

### ISSUE-005: Profilen godtar orimliga värden och räknar på dem

**Allvarlighet:** Medel · **Kategori:** Funktion

**Steg:** Profil → skriv ålder `500` och vikt `-5`.

**Förväntat:** Värdena stoppas eller markeras som fel.

**Faktiskt:** "✓ Profil klar" står kvar och multiplikatorn räknas om till 0.80x.

**Varför det spelar roll:** Felaktiga siffror ger fel metabol effekt på timern utan att användaren märker det.

**Bevis:** `screenshots/24-profil-ogiltig.png`

---

### ISSUE-006: Flikbyte behåller scrollläget från förra fliken

**Allvarlighet:** Låg · **Kategori:** Användbarhet

**Steg:** Profil → scrolla ner (1200 px) → tryck Lära.

**Förväntat:** Lära öppnas överst med rubrik och filter.

**Faktiskt:** Lära öppnas 1200 px ner, mitt bland korten under "Vanliga farhågor". Rubriken och filterknapparna syns inte.

**Bevis:** `screenshots/26-lara-scroll-arvs.png`

---

### ISSUE-007: Mycket går inte att nå med skärmläsare eller tangentbord

**Allvarlighet:** Medel · **Kategori:** Tillgänglighet

**Faktiskt:**
- Fasraderna under "Kroppens faser", schemakorten, historikkorten och alla 19 Lära-kort är klickbara rutor, inte knappar. De saknar roll och går inte att nå med tangentbord eller skärmläsare.
- Knapparna för måltid (🍳), träning (🏋️) och radera (✕) har bara en emoji som namn. En skärmläsare läser "stekpanna" eller "kryss".
- Stängkrysset i dialogerna är en `span` utan namn.
- Flera fält saknar kopplad etikett och får namn från exempeltexten ("t.ex. 45", "t.ex. 34"). Datumfältet för bakåtdatering saknar namn helt.

**Bevis:** `screenshots/02-fasta-startad.png`, `screenshots/10-scheman.png`, `screenshots/25-lara.png`

---

### ISSUE-008: Flera tryckytor är mindre än 44 px

**Allvarlighet:** Låg · **Kategori:** Tillgänglighet

**Uppmätt:** stängkrysset i dialoger 16×20 px, raderaknappen i Historik 28×26 px, filterknapparna i Lära 29 px höga, "Rensa all historik" 39 px hög. AGENTS.md kräver minst 44 px.

**Bevis:** `screenshots/17-historik.png`, `screenshots/27-lara-kort.png`

---

### ISSUE-009: Små fel i historik och rubriker

**Allvarlighet:** Låg · **Kategori:** Användbarhet

- En fasta på 17 sekunder sparas i Historik som "∞ 0h fasta" och räknas i "Antal".
- "Mål nått" visade 50 % med två fastor, där den ena var löpande fasta utan mål. Löpande fastor dras alltså ner i andelen.
- Med 16:8 valt heter timern "Schema: 16h" i stället för "16:8", som på startsidan.

**Bevis:** `screenshots/17-historik.png`, `screenshots/13-bakatdaterad-fasta.png`

---

### ISSUE-010: Bakåtdateringen använder webbläsarens standardrutor

**Allvarlighet:** Låg · **Kategori:** Användbarhet

**Steg:** "Glömde starta?" → tryck "Starta från vald tidpunkt" utan tid, eller med en tid i framtiden.

**Faktiskt:** Kontrollen fungerar, men meddelandet kommer som webbläsarens grå ruta ("Välj en tidpunkt", "Tidpunkten måste vara i det förflutna"), inte i appens eget utseende. Datumfältet är dessutom tomt från början.

**Bevis:** `screenshots/12-bakatdatering.png`

---

## Konsol

Inga fel och inga varningar i något steg: start, alla flikar, alla dialoger, loggningar, radering och tre omladdningar. Inga nätverksanrop misslyckades. Service workern (`/sw.js`) styr sidan.

## Inte testat

- Export och import av data (laddar ner eller läser in filer).
- "Rensa all historik" (raderar allt; enskild radering testades i stället).
- Offline-läge och installation som app på hemskärmen.
- Riktig telefon med iOS Safari. Testet gjordes i Chromium med mobilstorlek.
