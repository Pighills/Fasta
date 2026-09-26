# Förstudie: FASTA i App Store och Google Play

**T-21 · 2026-09-26 · beslutsunderlag, ingen kod eller beställning.** Alla externa källor nedan är officiella och lästa detta datum. Regler och priser måste kontrolleras igen inför inlämning. Förslag för FASTA är tekniska bedömningar, inte beslut från Anton.

## 1. Behåll webbappen, lägg till ett appskal

**Bedömning:** FASTA kan behålla HTML, CSS och JavaScript. Capacitor kan läggas till i ett befintligt webbprojekt. Det kräver `package.json`, en separat katalog för webbmaterialet och `index.html` med `<head>`. Android- och iOS-projekt skapas och materialet kopieras med `cap sync`. [Capacitor: installation](https://capacitorjs.com/docs/getting-started).

Förslag på struktur:

- Befintliga `index.html`, `css/`, `js/` och `icons/` fortsätter vara källorna.
- Ett paketeringssteg kopierar endast appfiler till `www/`; `webDir` pekar dit. Tester, dokument och hemligheter följer inte med.
- `android/`, `ios/` och `capacitor.config.*` tillkommer. Capacitor och dess tillägg får låsta versioner. Pluginernas JavaScript måste paketeras så att deras npm-importer fungerar; det inför ett steg för mobilpaketet men kräver inget nytt UI-ramverk.
- Lägg lagring, filer, delning och påminnelser bakom små funktioner i `js/platform.js`. Vanliga webbversionen kan fortsatt publiceras separat.

**PWA-filer:** behåll `manifest.json` och `sw.js` för webben. Förslag: registrera service workern endast i webbversionen, så att en gammal cache inte blandas med mobilpaketets filer. Manifestet ersätter inte butikernas egna ikoner, behörigheter eller appmetadata. Mobilpaketet ska kunna starta från sina medföljande filer.

Använd relativa resurssökvägar och paketera även typsnittet när T-04 är klart. Nu hämtar `index.html` Outfit från Google Fonts. Canonical-/delningsadresser är metadata och behöver inte styra var appen körs. Undvik `server.url` i leveransen: Capacitor beskriver det som utvecklingsstöd. [Capacitor: konfiguration](https://capacitorjs.com/docs/config).

## 2. Flytta data med verifiering och återställning

`js/state.js` läser och skriver idag direkt och synkront till `localStorage`. `js/migrations.js` innehåller redan versionering och den gemensamma händelselistan. Detta är utgångspunkten för ett nytt lagringslager.

**Fakta:** mobiloperativsystem kan rensa WebView-lagring, inklusive localStorage; på iOS gäller risken även IndexedDB. Preferences passar mindre datamängder, SQLite större loggar och mer omfattande frågor. [Capacitor: lagring](https://capacitorjs.com/docs/guides/storage).

Preferences använder UserDefaults på iOS och SharedPreferences på Android. Det är ingen databas, fungerar med strängvärden och tas bort vid avinstallation. Webbversionen faller tillbaka till localStorage. Preferences kräver också Apples `PrivacyInfo.xcprivacy`; dokumentationen anger API-kategorin UserDefaults och skälet `CA92.1` för detta bruk. Det ersätter inte en integritetspolicy. [Preferences](https://capacitorjs.com/docs/apis/preferences).

**Två skilda flyttar:**

1. **Webb/PWA → ny butiksapp:** räkna inte med att appen kan läsa webbläsarens lagring. Capacitor använder ett eget lokalt ursprung och appmiljö. Förslaget är export i webbappen, filimport i appen, sedan kontroll av antal fastor, profil och aktiv fasta. Radera inte webbkopian. [Konfiguration och lokalt ursprung](https://capacitorjs.com/docs/config).
2. **Äldre mobilversion → nytt lagringslager:** läs befintlig data och kör samma `migrate()` innan den skrivs till Preferences eller SQLite. Preferences egen metod `migrate()` gäller det äldre Capacitor Storage-tillägget; den ersätter inte FASTA:s migrering från localStorage. [Preferences](https://capacitorjs.com/docs/apis/preferences#migrate).

**Föreslagen säker ordning:**

- Läs in lagringen färdigt innan appen tillåter ändringar. Köa skrivningar eftersom mobil-API:erna är asynkrona.
- Spara en orörd kopia och migrera i minnet. Behåll id:n, okända fält, aktiv fasta, pauser och träningspass.
- Skriv till en separat målpost eller inom en SQLite-transaktion. Läs tillbaka och jämför hela datan innan en markör säger att flytten är klar.
- Vid avbrott, fullt minne, trasig eller för ny version: visa fel och behåll källan. Samma flytt ska kunna köras igen utan dubbla händelser.
- Flytta också importbackup, orörda felkopior och möjligheten att ångra import. Byt lagringsformat först med egna migreringstester.

**Förslag:** prova Preferences med en realistisk stor historik; välj SQLite om storlek eller skrivmängd kräver det. Säker lagring för hälsosvaren, kryptering och systembackup behöver utredas före leverans. Anta inte att Preferences innebär kryptering. Kontrollera särskilt Apples regel om personlig hälsoinformation i iCloud, nedan. Ingen lokal lagring kan ensam garantera återställning efter avinstallation eller förlorad telefon; export och verifierad återställning behövs.

## 3. Påminnelser utan server

Local Notifications kan schemalägga meddelanden på enheten utan pushserver. Både tillstånd och schemalagda meddelanden måste hanteras. På Android 13+ krävs notifieringsbehörighet; från Android 12 finns särskilda villkor för exakt tid. Sparläge kan begränsa leveransen; `allowWhileIdle` begränsas till ungefär ett tillfälle per nio minuter och app. [Local Notifications](https://capacitorjs.com/docs/apis/local-notifications).

På iOS behöver användaren godkänna aviseringar och kan välja hur de levereras, exempelvis i en schemalagd sammanfattning. Räkna därför inte med att ett meddelande alltid visas omedelbart. [Apple: behörighet för aviseringar](https://developer.apple.com/documentation/usernotifications/asking-permission-to-use-notifications).

**Förslag för FASTA:** fråga när användaren slår på en påminnelse. Schemalägg få kommande meddelanden och ge dem stabila id:n. Avboka vid avslutad fasta; räkna om vid paus, målbyte, ändrad tidszon och återstart. Timerns riktiga tid ska beräknas från tidsstämplar även när appen varit stängd. Lova inte leverans på sekunden. Exakta larm och aktuell iOS-gräns för väntande meddelanden måste verifieras för vald pluginversion före implementation.

## 4. Butikernas krav och FASTA:s hälsosvar

### Apple

- **1.4.1:** medicinska funktioner och uppgifter kan granskas extra. Hälsomätningars noggrannhet och metod måste kunna styrkas; användare ska påminnas om vårdkontakt inför medicinska beslut. FASTA:s uppskattningar får inte beskrivas som uppmätta värden.
- **5.1.1:** integritetspolicy ska finnas i appen och App Store Connect och förklara användning, lagring och radering. Regeln om juridisk person för känsliga uppgifter/reglerade tjänster behöver bedömas för FASTA före kontoval.
- **5.1.3:** hälsodata har särskilda begränsningar, bland annat för marknadsföring och lagring av personlig hälsoinformation i iCloud. Granska även automatisk systembackup.
- **4.2:** paketering ensam räcker inte. Beskriv appnyttan: timer, lokal historik och påminnelser. Butiksgodkännande är inte garanterat.

[Apple: granskningsregler, avsnitt 1.4.1, 4.2 och 5.1](https://developer.apple.com/app-store/review/guidelines/).

### Google Play

Health apps-deklarationen ska fyllas i. **Bedömning:** FASTA hör åtminstone till kost/vikthantering, och träningsloggningen även till aktivitet/träning; deklarera de funktioner som faktiskt levereras. [Hälsodeklarationen](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en).

Google kräver offentlig integritetspolicy både i butik och app. Policyn ska beskriva personliga och känsliga uppgifter samt tillgång, användning och delning. För hälsoappar som inte är reglerade medicintekniska produkter krävs en tydlig friskrivning i appbeskrivningen om att appen inte är en medicinteknisk produkt och inte diagnostiserar, behandlar, botar eller förebygger sjukdom. Användare ska också hänvisas till vårdpersonal för medicinsk rådgivning. Cowork behöver ta fram godkänd svensk text inför leverans. [Google: hälsoregler](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en-GB).

### Vad ska redovisas?

Inventera profil, vikt, fastor, måltider, träning och de frivilliga svaren om läkemedel, graviditet/amning, ätstörning och under 18 år. Förklara lokalt bruk, export, radering och eventuell framtida överföring. Inventera även typsnittsanrop, kraschverktyg och andra tillägg innan några löften om datainsamling lämnas.

Apples App Privacy och Googles Data safety skiljer lokal behandling från insamling utanför enheten. Enbart lokala uppgifter räknas normalt inte som insamlade i formulären. Det upphäver inte policykraven. Hälsouppgifter som skickas till en server och data som tillägg skickar måste bedömas och deklareras enligt respektive definition. [Apple: integritetsdeklaration](https://developer.apple.com/app-store/app-privacy-details/), [Google: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en-AE).

**Ålder:** butikens åldersklassning ska besvaras efter innehållet. Den är skild från FASTA:s egna användningsvillkor; underlaget visar ingen generell regel om 18 år för alla fasteappar. Kön anger att beslut om 18-årsvillkor skjuts till fas 4. Ta upp målgrupp och åtkomst före butikslansering. [Apple: åldersklassning](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions), [Google: appinnehåll och målgrupp](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en-GB).

## 5. Kostnader och konton – inga beställningar

| Del | Kontrollerad uppgift |
|---|---|
| Apple Developer Program | 99 USD per medlemsår; lokal valuta/pris visas vid registrering. Organisationskonto kräver normalt D-U-N-S och behörig företrädare. [Apple](https://developer.apple.com/programs/enroll/) |
| Google Play Console | Engångsavgift 25 USD och identitetskontroll; person-/organisationskonto väljs vid registrering. [Google, EES](https://support.google.com/googleplay/android-developer/answer/14659200?hl=en) |
| iOS-bygge | macOS och Xcode krävs. Molnbygge är möjligt men ersätter inte alla lokala testbehov. Pris på Mac eller molntjänst är inte kontrollerat eller budgeterat. [Capacitor: utvecklingsmiljö](https://capacitorjs.com/docs/getting-started/environment-setup) |
| Android | Android Studio och Android SDK behövs; utveckling kan förberedas på Windows. Kontrollera verktygsversionerna för vald Capacitor-version. [Utvecklingsmiljö](https://capacitorjs.com/docs/getting-started/environment-setup) |

Nya personliga Google-konton skapade efter 13 november 2023 behöver minst 12 testare kontinuerligt anslutna i 14 dagar i slutet test innan ansökan om produktionsåtkomst. Det är ett separat planeringsbehov. [Google: testkrav](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB). Eventuella betalprodukter och butikernas försäljningsavgifter behöver en egen genomgång när betalning blir aktuell.

## 6. Föreslagen arbetsordning

1. Slutför importskydd, export/återställning och lokala typsnitt. Bestäm vilket innehåll första appversionen ska ha.
2. Lägg plattformsfunktionerna bakom ett gemensamt gränssnitt. Testa lagringsfel, avbrott och alla gamla dataversioner automatiskt på datorn.
3. Gör ett separat Capacitor-prov med appmaterialet lokalt. Android-emulator fungerar på Windows; iOS-simulator kräver Mac. Testa navigering, tangentbord, olika skärmar och simulerat offline.
4. Genomför dataflytt och påminnelser i emulator/simulator. Prova tidszoner, sommartid, nekade tillstånd och återstart; behåll export som räddningsväg.
5. Testa på **riktig iPhone och Android**: uppdatering med befintlig data, låst skärm, batterisparläge, filväljare/delning, aviseringar och safe-area. Datorsimulering räcker inte som leveransbevis för detta.
6. Granska integritetspolicy, hälsotexter, butikstexter, ålderssvar och deklarationer. Anton beslutar om konton/kostnader; därefter testdistribution och separat publiceringsbeslut.

**Rekommenderat nästa uppdrag:** ett avgränsat Android-prov med konstgjorda data och ett färdigt förslag till lagringsgränssnitt. Ingen användardata flyttas och ingen butikspublicering sker i förstudien.
