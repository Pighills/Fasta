# Säkerhetsgranskning – baslinje (CSO)

**Datum:** 2026-09-25 · **Kod:** `main` @ 0b94e8e (cache `fasta-v29`) · **Körning:** `1790329992916-3114d26a8ee00b90` (gstack-cso 3.0.0, statisk granskning)
**Status: delvis (partial).** Ingenting är åtgärdat, det här är bara en rapport.

## Sammanfattning på vanlig svenska

- **Inga allvarliga säkerhetshål hittades.** Det finns inget kritiskt, högt eller medelhögt fynd.
- **XSS (att någon får in egen kod i appen):** Alla ställen där sparad eller importerad text visas är kontrollerade, och alla går genom `esc()`. En manipulerad backupfil kan i dag inte köra kod.
- **Två små integritetsfynd:** raderad historik och gamla hälsosvar ligger kvar i dolda kopior i webbläsaren, och varje besök skickar besökarens IP-adress till Google (typsnittet).
- **Ett råd för framtiden:** appen har inget andra skyddslager. Skyddet mot XSS hänger helt på att `esc()` aldrig glöms bort.
- **Beroenden:** appen har inga npm-paket. Det enda utomstående är Google Fonts.

## Fynd, sorterade efter allvarlighetsgrad

| ID | Allvar | Säkerhet i bedömningen | Bevis | Plats | Följd |
|---|---|---|---|---|---|
| CSO-1 | Låg | Hög | Kodspårning | `js/state.js:565` | Raderade fastor och gamla hälsosvar går att läsa i dolda kopior |
| CSO-2 | Låg | Hög | Kodspårning | `index.html:27` | Besökarens IP-adress skickas till Google vid varje sidladdning |
| CSO-3 | Info | Hög | Kodspårning | `js/app.js:162`, alla vyer | Inget andra skyddslager (CSP) om `esc()` glöms någon gång |

Bevisnivå: alla fynd bygger på att koden har lästs och följts steg för steg. Inget har körts eller återskapats i en testmiljö (det är en daglig statisk granskning).

---

### CSO-1 · Låg · Raderad data finns kvar i dolda kopior

**Vad:** "Radera fasta" säger att fastan tas bort *permanent* (`js/actions.js:93`), och "Rensa all historik" rensar listan. Men bara huvudnyckeln `fasta-data` skrivs om (`js/state.js:565-581`). Kvar i webbläsaren ligger:
- `fh2`, `fs4`, `fasta-profile`: den gamla datan från före Fas 0. Den läses vid migreringen och lämnas sedan orörd med avsikt (`js/state.js:437-463`).
- `fasta-data-pre-v2`: en orörd kopia från före uppgraderingen till version 2 (`js/state.js:480-485`). Den innehåller också svaren i Hälsa och säkerhet om de fanns då.
- `fasta-data-backup`: en fullständig kopia från före senaste import (`js/state.js:600-604`). Den ligger kvar tills man trycker på "Ångra senaste import".
- `fasta-data-corrupt` om datan någon gång har gått sönder.

**Vem kan utnyttja det:** någon som senare får tillgång till samma webbläsare, t.ex. på en lånad, delad eller såld telefon eller dator, och öppnar utvecklarverktygen.
**Följd:** fastor som användaren tror är borta, och hälsosvar som användaren har kryssat ur, går att läsa.
**Motbevis som har vägts in:** kopiorna finns med avsikt, som skyddsnät vid migrering. Datan lämnar aldrig enheten. Den som kommer åt webbläsaren ser ändå den nuvarande datan. Därför är fyndet lågt, men det bryter mot vad appen lovar om hälsouppgifter, som är känsliga personuppgifter.
**Förslag på åtgärd:** lägg till "Radera all data" i kortet Din data, som tar bort alla `fasta-*`-nycklar och de gamla nycklarna. Ta bort de gamla kopiorna automatiskt en tid efter en lyckad migrering, låt `fasta-data-backup` gå ut efter t.ex. 30 dagar, och skriv om texten "permanent" så att den stämmer.

### CSO-2 · Låg · IP-adressen skickas till Google Fonts

**Vad:** typsnittet Outfit hämtas från `fonts.googleapis.com` och `fonts.gstatic.com` (`index.html:27`). Service workern hanterar bara filer från den egna domänen (`sw.js:108`), så typsnittet sparas inte för offlinebruk av appen själv.
**Följd:** varje besökares IP-adress, webbläsare och varifrån besöket kom skickas till Google, utan något samtycke. Appen säger samtidigt att datan bara sparas på enheten. Det här är en integritetsfråga, inget sätt att köra kod. Någon juridisk bedömning görs inte här.
**Förslag på åtgärd:** lägg Outfit-filerna (woff2) i projektet, peka på dem från `css/styles.css` och lägg till dem i `PRECACHE`. Det gör också att typsnittet fungerar offline.

### CSO-3 · Info · Inget andra skyddslager mot XSS

**Vad:** alla vyer byggs som HTML-text med `innerHTML`, knapparna använder inline `onclick`, och funktionerna läggs på `window` (`js/app.js:162-214`, `index.html:37-57`). Det finns ingen Content-Security-Policy och inga säkerhetshuvuden (ingen `vercel.json`). Med inline `onclick` går det inte att slå på en strikt CSP.
**Läget i dag:** all sparad och importerad text är kontrollerad och går genom `esc()` (se nedan). Därför är det här ingen sårbarhet i dag.
**Risken:** om någon ny funktion visar ett importerat fält utan `esc()` kan en manipulerad backupfil köra kod. Koden kommer då åt all historik och alla hälsosvar via `window.state` och `window.profile`.
**Förslag på åtgärd:** byt steg för steg från inline `onclick` till `addEventListener`/`data-action`. Lägg sedan till en `vercel.json` med `Content-Security-Policy: script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'` samt `X-Content-Type-Options: nosniff` och `Referrer-Policy: strict-origin-when-cross-origin`.

---

## Kontrollerat utan fynd

**XSS via innerHTML och inline onclick.** Varje ställe där HTML byggs är genomgånget: `ui.js` (sidopanel), `views/timer.js`, `views/history.js`, `views/profile.js`, `views/learn.js`, `modals.js` och `actions.js`.
- Text som användaren skrivit eller som kommer från en fil: måltidens beskrivning, träningstyp, ikon, kcal, puls, minuter, pausens längd, profilvärden, `goalHours` och bakåtdateringen. Allt går genom `esc()`.
- Tal från sparad data (längd, starttid, mål, procent) visas bara efter en uträkning (`Math.round`, `fmt`, `toFixed`) eller som datum (`toLocaleTimeString`). En sträng med HTML blir då `NaN` eller "Invalid Date", aldrig kod.
- Texterna inuti `onclick` byggs bara av fasta värden från `js/data.js` eller av räknare, aldrig av sparad eller inmatad text.
- `esc()` (`js/helpers.js:265-268`) hanterar `& < > " '` och fungerar både i vanlig text och inuti attribut med citattecken.

**Import av backupfil.** Filen måste ha `app: 'FASTA'` och en heltalsversion. Versioner som är för nya avvisas. Fel ger ett meddelande, och ingen data ändras. Nuvarande data kopieras innan den skrivs över. Ett `__proto__`-fält i profilen ändrar bara profilobjektet, inte hela appen, och ger ingen ny åtkomst.

**localStorage.** Allt ligger lokalt för domänen. Det finns inga konton, ingen server och inga nycklar som skickas någonstans. Hälsosvaren kopieras inte in i historiken (`js/actions.js:52`). Observera att exportfilen innehåller hälsosvaren (`snapshot()` tar med hela profilen). Det är användarens eget val att exportera, men det står inte i texten.

**Service worker (`sw.js`).** Den hanterar bara GET-anrop från den egna domänen, så andra sajter kan inte förgifta cachen. Gamla cacheversioner rensas vid aktivering. Det finns ingen `importScripts` och ingen fjärrkod. Svaga punkter som gäller robusthet, inte säkerhet: även felsvar (404/500) sparas i cachen, och en uppdatering tar över alla öppna flikar direkt (`skipWaiting` + `clients.claim`).

**Beroenden och leveranskedja.** Det finns ingen `package.json` eller låsfil. Testerna använder bara Nodes inbyggda `node:test`. Det enda utomstående som laddas är Google Fonts (CSO-2). Google Fonts går inte att skydda med SRI, eftersom innehållet ändras. Att ta hem typsnittet löser även det.

**Hemligheter.** Den nuvarande koden innehåller inga nycklar eller tokens. De tre träffarna från verktyget var falsklarm: ett versionsnummer för Chrome i `docs/benchmark/matning.js` och siffror i researchtexterna i `docs/kunskap/`.

**Inte relevant för appen:** API:er, webhooks, inloggning och AI-funktioner finns inte.

## Luckor (därför bara "delvis")

- **Git-historiken** är inte genomsökt efter hemligheter, eftersom verktyget inte kunde läsa loggen (storleksgräns). Bara den nuvarande koden är kontrollerad.
- **`.claude/`, `AGENTS.md` och `CLAUDE.md`** uteslöts av verktyget (konfiguration för AI-assistenter). De är inte granskade.
- **Vercel:** svarshuvudena från fastatimer.se och inställningarna i Vercel (t.ex. skydd mot förhandsversioner från forkar) är inte kontrollerade. Det här är en granskning av koden, inte av den körande sajten.
- **Inga skannrar körda** (Gitleaks, OSV, Semgrep m.fl.). Det krävs Docker-profiler som inte finns. För den här koden finns det dock inga beroenden att skanna.
- **Verktygets arkiv:** fynden kunde inte sparas i granskningsverktygets egen rapport. Registreringen avvisades på ett formatfel och körningen stängdes innan felet hann rättas. Verktygets arkiv visar därför körningen som *delvis utan fynd*. Den här filen är den gällande rapporten.
- **Publikt:** Vercel publicerar hela repot, så den här filen syns också på fastatimer.se/docs/security/. Repot är ändå publikt på GitHub, och rapporten innehåller inga allvarliga, oåtgärdade hål.

## Förslag på ordning när det är dags att åtgärda

1. CSO-2: ta hem typsnittet. Litet jobb som ger bättre integritet och fungerar offline.
2. CSO-1: "Radera all data" och städning av gamla kopior. Rör lagrad data, så förhandsversionen ska testas först.
3. CSO-3: byt från inline `onclick` och lägg sedan till CSP i `vercel.json`. Större ombyggnad, gärna samtidigt med fixarna i kodgranskningen.
