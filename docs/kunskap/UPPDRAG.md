# Uppdrag till Cowork

Kö med research-uppdrag. Anton lägger till uppdrag; Cowork tar dem uppifrån och markerar dem som klara.
Läs [README.md](README.md) först – särskilt reglerna för innehållet.

---

## 1. Verifiera källorna för Hälsa och säkerhet
- **Status:** inbyggd (2026-09-24). Kvarvarande källor kontrollerade via PubMed 2026-09-24 (He m.fl., Ganson m.fl., ESC/KDIGO-riktlinjerna för SGLT2-hämmare). Kvar: NICE NG69 går inte att läsa från Cowork (403) men är kontrollerad av Codex. Inga inbyggda texter behöver ändras.
- **Fil:** [halsa-och-sakerhet.md](halsa-och-sakerhet.md)
- **Bakgrund:** Texterna skrevs av Claude Code och källorna angavs ur minnet, utan kontroll.
- **Gör:**
  - Kontrollera att varje källa finns och faktiskt stöder texten. Lägg fullständig referens och länk i research-anteckningen.
  - Byt ut källor som inte finns eller inte stöder texten.
  - Föreslå förbättrad text där det behövs. Behåll tonen: vänlig, inte skrämmande, uppmanar till att prata med vården.
  - Bedöm om någon viktig riskgrupp saknas (t.ex. undervikt, äldre, vissa mediciner) – skriv det som förslag, lägg inte till rutor på egen hand.

## 2. Granska fastefaserna och fördelarna
- **Status:** klart och godkänt (2026-09-24) – 23 rutor + ny ruta `ui.effekter`. Kompletterat med Codex fynd, se docs/jamforelse/uppdrag-2.md. Inbyggd 2026-09-24.
- **Fil:** [fastefaser.md](fastefaser.md)
- **Bakgrund:** Flera påståenden verkar starkare än forskningen stödjer, t.ex. "immunsystemet genomgår en djupgående omstart" (72 h), "tillväxthormon upp till 5 gånger högre" (24 h), "nya immunceller bildas från stamceller" (48 h), "inflammationsnivån minskar" (12 h) och exakta timgränser för ketos och autofagi.
- **Gör:**
  - Gå igenom varje fas, fördel och schema. Stämmer påståendet för **människor**? Vid ungefär vilken tid?
  - Föreslå försiktigare text där det behövs. Behåll gärna fasernas namn om de går att försvara, annars föreslå nya.
  - Ange källor för det som är kvar.

## 3. Granska Lära-korten
- **Status:** inbyggd (2026-09-24) – alla 19 kort, inklusive nya källor.
- **Fil:** [lara.md](lara.md)
- **Gör:** Samma som uppdrag 2 för alla 19 kort. Kontrollera särskilt siffror (t.ex. "~7 mmHg", "12 %", "upp till 20 % högre", "insulin sjunker med upp till 60 %") och att källorna stämmer.
  - Se till att korten inte motsäger de granskade texterna i [halsa-och-sakerhet.md](halsa-och-sakerhet.md). Exempel: `lara.14` säger att fasta "kan påverka fostrets tillväxt negativt", medan `halsa.pregnant` (granskad) säger att studierna inte visat tydliga skador men är för osäkra. Samma sak gäller `lara.12`, `lara.13` och `lara.16`.

## 4. Startvyns tre påståenden på Timer
- **Status:** inbyggd (2026-09-24) – `ui.startchips`.
- **Fil:** [fastefaser.md](fastefaser.md), ruta `ui.startchips`
- **Bakgrund:** Claude Code upptäckte vid inbyggnaden av uppdrag 2 att startvyn på Timer visar "✓ Fettförbränning", "✓ Cellstädning" och "✓ Tillväxthormon". De ligger direkt i koden och är inte granskade.
- **Gör:** Föreslå nya rader (eller att de tas bort) så att de stämmer med de granskade faserna och fördelarna.

## 5. Fas 1: mål, fasteprogram och daglig check-in
- **Status:** godkänd (2026-09-25) – 13 rutor att bygga in (`mal.viktSparr` utgår). Antons produktbeslut står överst i filen.
- **Fil:** [fas1.md](fas1.md)
- **Bakgrund:** Claude Code bygger den gemensamma händelseloggen (Fas 0). Nästa steg i roadmapen är mål, program och check-in, som behöver texter innan de byggs.
- **Gör:** Skriv texter för mål (Profil), program (Timer) och check-in (Timer/Historik). Inga löften som inte stöds, t.ex. att hungern minskar med tiden.
