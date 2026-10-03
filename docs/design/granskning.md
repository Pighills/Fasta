# Designgranskning (T-32, 2026-10-01)

Metod: Impeccable `audit` + `critique` (utan launcher), kodinventering av `css/styles.css` och vyerna, och före-bilder i `docs/design/fore/` (390×844 och 1280×800, med testdata: aktiv 16:8-fasta 13,5 h, 7 fastor i historiken). /design-review (gstack) kördes inte – den rättar själv i koden, och här ska fynden gå till Codex.

**Helhetsomdöme:** grunden är bra – mörkt, lugnt, en tydlig guldaccent, bra tryckytor och fokusringar efter T-15. Det som drar ner känslan är *brist på system*: varje vy har egna storlekar, radier och gråtoner, mycket stil sitter direkt i JS-koden, och emojis + åtta regnbågsfärger på faserna gör att appen ser mer hobby än premium ut.

## Systemfel (gäller alla vyer) → T-33
1. **~255 inline `style=` i JS** (timer.js 82, modals.js 75, profile.js 24, trends.js 23, history.js 21, ui.js 17, learn.js 13). Därför går stilen inte att lyfta från CSS. Flytta till klasser vy för vy (T-34–T-37), med variablerna från T-33.
2. **16 textstorlekar** (9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 24, 28, 32 px). Ska bli 7 steg (se `DESIGN.md`). 9–10 px förekommer 42 gånger – för litet på telefon.
3. **10 hörnradier** (2, 3, 6, 7, 8, 10, 12, 14, 16, 20 px) → 4 steg + rund.
4. **Snarlika gråtoner:** `#b5b5aa`/`#b6b6aa`, `#0e0e0e`/`#141414`/`#1a1a1a`, `#444`/`#4a4a44`/`#52525b`/`#2a2a2a`. Samla till skalan i `DESIGN.md`.
5. **Kontrastfel:** `.hist-del` (`#52525b` på `#1a1a1a`) ≈ 2,2:1 – under 4,5:1.
6. **Siffror i `monospace`** (systemets Courier-liknande typsnitt, 5 ställen) bryter mot Outfit. Använd Outfit med `font-variant-numeric: tabular-nums` så siffrorna inte hoppar.
7. **`transition: all`** på flera klasser – ange bara egenskaperna som ändras.

## Timer → T-34 (viktigast)
1. Med aktiv fasta visas **samma tid tre gånger** (topbar-pillret, "Faktisk fastetid", ringens mitt) plus metabol tid. Ringen ska vara hjälten; rutorna under/över blir sekundära.
2. Ringen är **röd** (fasfärgen för "Mer fett som bränsle") – rött läses som varning. Se beslut nedan.
3. "Avsluta fasta" är en stor grå knapp med text i `#8a8a80` – ser avstängd ut. Ikonknapparna (🍳, 🏋️) saknar text på mobil.
4. Tomt läge (ingen fasta): tre pill-knappar i rad ("Glömde starta?", "Testa ett fasta-schema", "Välj program") har olika stil – samma typ av val ska se likadana ut.
5. Fasernas lista: understrykningen under varje rad ser ut som länkar; "NU"-märket och emojis konkurrerar.
6. Rubriken "Schema: 16:8" och startraden sitter tätt utan luft mot rutorna.

## Historik och trender → T-35
1. Check-in-trenderna utan data visar **tomma staplar och streck** ("– den här veckan · förra veckan –") – ser trasigt ut. Behöver ett riktigt tomt läge.
2. Rubriker och brödtext i trend-kortet har för liten skillnad (storlek/vikt), "Vikt" har samma vikt som brödtext.
3. Varje fasta-kort har en stor tom ruta med ett svagt "×" (radera) – dominerar kortet och har för låg kontrast.
4. Färgade progress-linjer (lila, röd) per kort = regnbåge i listan.
5. "Dina genomförda fastor" är en svag rubrik; statistikrutorna är fina men tätt mot listan.

## Lära och Profil → T-36
1. Lära: filterknapparna radbryts (två rader på 390 px) – gör dem till en vågrät rad som går att svepa.
2. Lära: emojis i guldrutor varierar i stil och färg; korttexterna klipps med "…" mitt i ord.
3. Lära: varningsrutan (röd) under "Vanliga farhågor" är bra men tät (11 px).
4. Profil: väldigt lång sida (≈ 2 800 px) utan tydliga avsnitt – samma kortstil överallt gör att inget sticker ut.
5. Profil: "Profil klar"-rutan och förklaringsrutan har små texter (11–12 px) i grått på grått.
6. Profil: "Radera all data" (röd text på grå knapp) och "Importera data" ser för lika ut.

## Rutor, meny, integritetssidan → T-37
1. Rutorna (måltid, träning, check-in, "Jag förstår") har olika rubrikstorlekar och olika avstånd; bottenrutan på mobil har ingen "handtagslinje" och skuggan syns inte mot svart.
2. Check-in-rutan: skalknapparna har grå kant `#444` (egen grå), "Låg/Hög" är för små.
3. Bottenmenyn: emojis (⏱ 📚 📋 👤) i full färg – ser inkonsekvent ut och aktiv flik syns bara på textfärgen. Byt till enfärgade ikoner (inline SVG, ingen ny fil krävs) och en tydligare aktiv markering.
4. Topbar: "FASTA" + pill är okej men logotypen är bara text; pillret upprepar tiden.
5. Dator: sidomenyn har en mörkare ton (`#0e0e0e`) och innehållet ligger vänsterställt med stor tom yta till höger.
6. Integritetssidan: ren men "lång text-vägg"; rubrikerna (14 px) skiljer sig knappt från texten.

## Känsla och detaljer → T-38
1. Ingen gemensam rörelse: `fadeIn`/`popUp` finns men används olika; ingen `prefers-reduced-motion`.
2. Hover-effekter (`translateY` på Lära-kort) betyder inget på touch.
3. Ikoner och `theme-color` (`#c8a84e` – gul statusrad på Android) – överväg `#0a0a0a`.
4. Gula skuggor (`box-shadow` med guld) på stora knappar ser "glödande" ut – kan tonas ned.

## Beslut för Anton (via Cowork)
**Beslutat 2026-10-01 (avstämning 21):** fasfärgerna byts till guld/brons/grått; check-in-kortet visas bara under aktiv fasta, under ringen. Genomförs i T-34.

- **Fasernas färger** (`js/data.js`: orange, röd, lila, cyan, blå, grön, violett). Förslag: byt till en skala av guld/brons/grått så appen håller sig i temat. Det är en färgändring – kräver ditt ok. Utan ok behåller T-34/T-35 färgerna.
- **Check-in-kortet överst på Timer** skjuter ned timern på mobil. Förslag: flytta det under ringen. Ordningen är ett produktval.
