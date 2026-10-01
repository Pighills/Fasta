# Integritet, friskrivning och villkor

Kod: `integritet.html` (integritet, friskrivning, villkor), `js/views/profile.js` (kortet "Om appen": friskrivning + länk) och `js/modals.js` (rutan "Jag förstår" vid första start, `openFriskrivning`). Adressen /integritet via `vercel.json` (rewrites).

Texter för integritetspolicy, medicinsk friskrivning och användarvillkor inför webblanseringen 3 oktober. Krävs även för App Store och Google Play (se `docs/plan/capacitor-forstudie.md` avsnitt 4). Cowork är inte jurist – texterna bygger på hur appen fungerar i dag (all data bara på enheten).

Se [README.md](README.md) för hur filen används. **Anton fyller i det som står inom [hakparentes].**

---

### juridik.friskrivning
- **Var i appen:** Profil → längst ned + första gången appen öppnas (kort ruta med "Jag förstår")
- **Status:** inbyggd (T-25, 2026-09-27; namn, e-post och datum fylls i före publicering)

**Text – ny:**
> FASTA är ett hjälpmedel för att hålla koll på dina fastor. Appen är inte en medicinteknisk produkt och ställer inga diagnoser. Den behandlar, botar eller förebygger inte sjukdom. Tider, faser och värden i appen är uppskattningar, inte mätningar. Har du en sjukdom, tar läkemedel, är gravid eller ammar, har eller har haft en ätstörning eller är under 18 år – prata med vården innan du fastar. Avbryt fastan och sök vård om du mår dåligt.

**Källor nu:** –

**Research-anteckning:**
- Google Play kräver för hälsoappar som inte är medicintekniska produkter en tydlig friskrivning om att appen inte diagnostiserar, behandlar, botar eller förebygger sjukdom, och hänvisning till vården. Google Play Console Help, "Health apps" (answer/16679511).
- Apple 1.4.1: uppskattningar får inte beskrivas som mätningar; påminn om vårdkontakt. App Review Guidelines.
- Osäkerheter: 18-årsgränsen som villkor är skjuten till fas 4 (Antons beslut) – här står den bara som råd.

---

### juridik.integritet
- **Var i appen:** egen sida "Integritet" (länk i Profil och i sidfoten), även på adressen fastatimer.se/integritet
- **Status:** inbyggd (T-25, 2026-09-27; namn, e-post och datum fylls i före publicering)

**Text – ny:**
> **Integritetspolicy för FASTA**
> Senast uppdaterad: [datum – Claude Code sätter publiceringsdatum]
>
> **Vem ansvarar?** FASTA drivs av [Anton Zingmark / företagsnamn och org.nr]. Kontakt: [e-post].
>
> **Din data stannar hos dig.** Allt du fyller i – fastor, måltider, träning, profil, vikt, mål, dagliga check-ins och svar på hälsofrågor – sparas bara i webbläsaren på din egen enhet. Vi har inget konto, ingen databas och tar aldrig emot dessa uppgifter. Vi kan därför inte se, ändra eller lämna ut dem.
>
> **Så raderar du.** Profil → "Radera all data" tar bort allt. Du kan också rensa webbplatsdata för fastatimer.se i webbläsaren. Avinstallerar du appen eller byter enhet försvinner datan, om du inte först har sparat en säkerhetskopia med "Exportera".
>
> **Säkerhetskopior.** En exporterad fil sparas där du själv väljer. Den innehåller dina hälsouppgifter i klartext – förvara den säkert.
>
> **Drift.** Webbplatsen levereras av Vercel Inc. (USA). Som alla webbservrar behandlar Vercel tekniska uppgifter som IP-adress kortvarigt för att kunna visa sidan och skydda mot angrepp. Vercel är anslutet till EU–USA:s dataskyddsramverk. Typsnitt och alla filer hämtas från vår egen server – inga anrop till Google eller andra tjänster.
>
> **Dina rättigheter.** Enligt dataskyddsförordningen (GDPR) har du rätt att få veta vilka uppgifter vi behandlar om dig, få dem rättade eller raderade. Eftersom dina fasteuppgifter bara finns på din enhet har du själv full kontroll över dem. Frågor: [e-post]. Du kan också klaga hos Integritetsskyddsmyndigheten (imy.se).
>
> **Ändringar.** Om vi ändrar hur data hanteras – till exempel inför konton – uppdaterar vi den här sidan och berättar det i appen innan ändringen gäller.

**Källor nu:** –

**Research-anteckning:**
- Hälsouppgifter är känsliga personuppgifter (GDPR art. 9); så länge de bara ligger på enheten behandlas de inte av oss. Se `docs/STATUS.md`, kända problem.
- Ingen besöksstatistik (T-26 utgick 2026-09-27). Läggs statistik till senare måste policyn uppdateras först.
- Vercel och EU–USA Data Privacy Framework: kontrollera att Vercel fortfarande är certifierat innan publicering.
- Osäkerheter: personuppgiftsansvarig (privatperson eller företag) avgör texten under "Vem ansvarar?".

---

### juridik.villkor
- **Var i appen:** samma sida som integritetspolicyn, rubrik "Villkor"
- **Status:** inbyggd (T-25, 2026-09-27; namn, e-post och datum fylls i före publicering)

**Text – ny:**
> **Villkor för att använda FASTA**
> FASTA är gratis och tillhandahålls i befintligt skick. Vi gör vårt bästa för att appen ska fungera och att texterna ska stämma med aktuell forskning, men vi kan inte lova att den alltid är felfri eller tillgänglig. Du använder appen på eget ansvar, och den ersätter inte råd från vården (se friskrivningen ovan). Du ansvarar själv för att spara säkerhetskopior av din data. Vi kan ändra eller lägga ner tjänsten; större ändringar meddelas i appen i förväg. Svensk lag gäller.

**Källor nu:** –

**Research-anteckning:**
- Konsumenttjänst utan betalning; ansvarsbegränsning kan inte ta bort konsumentens lagstadgade rättigheter. Behöver ses över om appen blir betald.

---
