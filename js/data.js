// ── FASTA — js/data.js ──
// All constant data: phases, benefits, presets, meals, workouts, learn cards

export const PH = [
  {h:0, l:"Matsmältning",   i:"🍽️",c:"#f97316",
   d:"Kroppen bryter ner maten och tar upp näring. Blodsockret är förhöjt och kroppen lagrar överskott.",
   x:"Blodsockret stiger → kroppen frisätter insulin (ett hormon som transporterar socker till cellerna) → överskottssockret lagras som glykogen (kroppens korttidslager av socker) i levern och musklerna, eller som fett."},
  {h:4, l:"Tidig fasta",    i:"⏳",c:"#fb923c",
   d:"Matsmältningen är klar. Kroppen börjar använda sitt sockerlager (glykogen) som bränsle.",
   x:"Levern bryter ner sitt glykogenlager och skickar socker till blodet för att hålla energin stabil. Insulinnivån börjar sjunka. Kroppen förbereder sig för att byta bränsle från mat till egna lager."},
  {h:12,l:"Fettförbränning",i:"🔥",c:"#ef4444",
   d:"Sockerlagren börjar ta slut. Kroppen ökar fettförbränningen markant och börjar göra egna bränslekroppar av fett.",
   x:"Kroppen frigör fett från fettcellerna (processen kallas lipolys — kroppens sätt att plocka ut fett som bränsle). Levern omvandlar en del av detta fett till ketoner — ett alternativt bränsle som hjärnan och musklerna kan använda. Tillväxthormon börjar stiga."},
  {h:16,l:"Tidig ketos",    i:"⚡",c:"#a855f7",
   d:"Kroppen kör nu till stor del på ketoner (fettbränsle). Hjärnan byter bränsle. Kroppens städprocess aktiveras.",
   x:"Ketoner (kroppens alternativa bränsle av fett) stiger i blodet. En signal i kroppen aktiveras när energilagren är låga — den talar om för cellerna att börja städa och reparera sig. Autofagi startar: celler bryter ner och återvinner skadade delar."},
  {h:24,l:"Aktiv autofagi", i:"♻️",c:"#06b6d4",
   d:"Cellernas städprocess (autofagi) är i full gång. Kroppen reparerar och förnyar sig inifrån.",
   x:"Cellerna återvinner aktivt skadade och gamla delar. Ett ämne i hjärnan som stärker minne och inlärning ökar — många upplever skärpt fokus. Tillväxthormonet kan vara upp till 5 gånger högre än normalt, vilket skyddar muskelmassa."},
  {h:36,l:"Djup ketos",     i:"🧬",c:"#3b82f6",
   d:"Kroppen är djupt inne i fettförbränning. Cellförnyelse accelererar.",
   x:"Ketonerna (fettbränslet) är på sin högsta nivå. Kroppen kan börja bilda nya celler för att ersätta gamla och skadade. Genernas aktivitetsmönster skiftar mot reparation och motståndskraft mot stress."},
  {h:48,l:"Cellförnyelse",  i:"✨",c:"#10b981",
   d:"Immunsystemet förnyas. Gamla immunceller ersätts med nya.",
   x:"Kroppen börjar bilda nya immunceller från stamceller (kroppens egna reservceller som kan bli till olika celltyper). Kroppens tillväxtsignal pausas, vilket möjliggör djupare cellreparation."},
  {h:72,l:"Systemreset",    i:"💎",c:"#8b5cf6",
   d:"Maximal cellförnyelse. Immunsystemet genomgår en djupgående omstart.",
   x:"Kroppen bildar nya, effektivare energifabriker i cellerna (mitokondrier är de delar av cellen som omvandlar näring till energi). Stamcellsaktiviteten är på topp."},
];

export const BENEFITS = [
  {h:4, t:"Tidig fasta initierad",    i:"⏳",c:"#fb923c",e:["Insulinnivån sjunker","Sockerlagren börjar tömmas","Kroppen förbereder fettförbränning"]},
  {h:12,t:"Fettförbränning aktiverad",i:"🔥",c:"#ef4444",e:["Kroppen förbränner aktivt fett","Fettbränsle (ketoner) börjar produceras","Tillväxthormon stiger och skyddar muskler","Inflammationsnivån minskar"]},
  {h:16,t:"Ketos — fettbränsle aktivt",i:"⚡",c:"#a855f7",e:["Hjärnan och kroppen drivs av fettbränsle","Kroppens städprocess (autofagi) aktiveras","Många upplever mentalt fokus och klarhet"]},
  {h:24,t:"Aktiv cellstädning",       i:"♻️",c:"#06b6d4",e:["Intensiv reparation av celler och vävnad","Ämne som stärker hjärnans funktion ökar","Tillväxthormon upp till 5x normalt","Oxidativ stress minskar"]},
  {h:36,t:"Djup fettförbränning",     i:"🧬",c:"#3b82f6",e:["Fettbränslenivån är på topp","Ny cellbildning kan ha startat","Kroppens gener aktiverar reparations- och skyddsläge"]},
  {h:48,t:"Immunförnyelse inledd",    i:"✨",c:"#10b981",e:["Gamla immunceller bryts ner","Nya immunceller bildas från stamceller","Kroppens tillväxtsignal pausas för djupare reparation"]},
  {h:72,t:"Systemreset uppnått",      i:"💎",c:"#8b5cf6",e:["Komplett förnyelse av immunsystemet","Kroppen bildar nya energifabriker i cellerna","Maximal cellstädning och reparation"]},
];

export const PRESETS = [
  {l:"∞",    h:null,tag:"Löpande",    p:"Ingen tidsgräns — fastan löper tills du väljer att avsluta. Perfekt för att lyssna på kroppen.",               b:["Flexibelt","Inga tidskrav","Följ kroppen"]},
  {l:"16:8", h:16,  tag:"Klassikern", p:"Det perfekta startläget. Aktiverar fettförbränning och tidig ketos. De flesta sover 8 av dessa timmar.",          b:["Fettförbränning","Bättre blodsockerkontroll","Vardagsvänlig"]},
  {l:"18:6", h:18,  tag:"Effektiv",   p:"Djupare fettförbränning och cellstädning aktiveras med bara två extra timmar.",                                  b:["Djupare fettförbränning","Bättre fokus","Minskad inflammation"]},
  {l:"20:4", h:20,  tag:"Kraftfull",  p:"Warrior Diet — fyra timmars ätfönster ger kroppen lång tid för fettförbränning och cellreparation.",              b:["Intensiv fettförbränning","Cellstädning aktiveras","Mental skärpa"]},
  {l:"OMAD", h:23,  tag:"Maximalt",   p:"One Meal A Day. Kroppen spenderar nästan hela dygnet i fasta för maximala effekter.",                             b:["Max fettförbränning","Djup cellstädning","Förenklat ätande"]},
  {l:"36h",  h:36,  tag:"Avancerad",  p:"Djup fettförbränning och aktiv cellförnyelse. Tillväxthormonet skjuter i höjden.",                               b:["Djup ketos","Kraftigt tillväxthormon","Stark cellstädning"]},
  {l:"48h",  h:48,  tag:"Utmanare",   p:"Immunsystemets förnyelse startar — gamla immunceller byts ut mot nya.",                                           b:["Immunförnyelse","Ny cellbildning","Djup reparation"]},
  {l:"72h",  h:72,  tag:"Systemreset",p:"Tre dygn ger kroppen en djupgående omstart av immunsystem och cellförnyelse.",                                   b:["Komplett immunreset","Max cellförnyelse","Nya energifabriker i cellerna"]},
];

export const MEALS_PRE = [
  {l:"2 ägg",    k:140,pr:12,d:"2 kokta/stekta ägg"},
  {l:"3 ägg",    k:210,pr:18,d:"3 kokta/stekta ägg"},
  {l:"Ägg+ost",  k:260,pr:20,d:"2 ägg + 30g ost"},
  {l:"Kyckling", k:165,pr:31,d:"100g kycklingbröst"},
  {l:"Lax",      k:180,pr:25,d:"100g lax"},
  {l:"Eget",     k:null,pr:null,d:""},
];

export const WORKOUT_TYPES = [
  {l:"Promenad",     met:3.5, icon:"🚶"},
  {l:"Löpning",      met:9.0, icon:"🏃"},
  {l:"Cykling",      met:7.5, icon:"🚴"},
  {l:"Styrketräning",met:5.0, icon:"🏋️"},
  {l:"HIIT",         met:10.0,icon:"⚡"},
  {l:"Simning",      met:7.0, icon:"🏊"},
  {l:"Yoga/Stretch", met:2.5, icon:"🧘"},
  {l:"Eget...",      met:null,icon:"🏅"},
];

export const LC = [
  {id:1, cat:"Grunder",         i:"🌱",c:"#c8a84e",f:"Vad är periodisk fasta?",      fb:"Inte en diet — ett ätmönster. Du bestämmer när du äter, inte vad.",bk:"Periodisk fasta innebär att du cyklar mellan perioder av fasta och ätande. Du behöver inte räkna kalorier eller undvika specifika livsmedel. Forskning (Longo & Mattson, 2014) visar att fasteperioderna i sig ger starka hälsoeffekter — blodsockret stabiliseras, kroppen börjar bränna fett och startar sina egna reparationsprocesser.",src:"Longo & Mattson, Cell Metabolism 2014"},
  {id:2, cat:"Grunder",         i:"⚡",c:"#c8a84e",f:"Varför fungerar det?",          fb:"Nyckeln är insulin — det hormon som styr om kroppen lagrar eller bränner fett.",bk:"Insulin är ett hormon som frisätts när du äter, framför allt kolhydrater. Högt insulin = kroppen lagrar fett. Lågt insulin = kroppen kan frigöra och bränna fett. Under fasta sjunker insulinnivån med upp till 60% — kroppen låses upp och kan komma åt fettlagren som bränsle.",src:"Cahill GF Jr, Ann Rev Nutrition 2006"},
  {id:3, cat:"Grunder",         i:"🔄",c:"#c8a84e",f:"Vad händer timme för timme?",  fb:"Kroppen går igenom tydliga faser: matsmältning → sockerlager töms → fett bränns → fettbränsle → cellstädning.",bk:"0–4h: Insulin högt. 4–12h: Sockerlagren börjar tömmas. 12–16h: Fettförbränning ökar, fettbränsle (ketoner) produceras. 16–24h: Cellstädning aktiveras, tillväxthormon stiger. 24h+: Djup fettförbränning och cellförnyelse.",src:"Anton et al., Obesity Reviews 2018"},
  {id:4, cat:"Vetenskap",       i:"♻️",c:"#06b6d4",f:"Vad är autofagi (cellstädning)?",fb:"Kroppens inbyggda städ- och reparationssystem. Celler bryter ner och återvinner sina egna skadade delar.",bk:"Autofagi (från grekiskans 'självätande') är processen där celler identifierar och bryter ner skadade komponenter och återanvänder dem. Yoshinori Ohsumi fick Nobelpriset i medicin 2016 för att ha kartlagt hur autofagi fungerar. Kopplas till minskad risk för demens, cancer och åldrande.",src:"Ohsumi Y, Nobel Lecture 2016"},
  {id:5, cat:"Vetenskap",       i:"🧬",c:"#06b6d4",f:"När startar cellstädningen?",   fb:"Gradvis från ungefär 16 timmar, och är mest aktiv runt 24–48 timmar.",bk:"Cellstädningen ökar mätbart vid 24 timmars fasta. Den ökar gradvis — inte som en knapp. Att träna på fastande mage kan snabba på starten. Att äta protein eller kolhydrater stänger av cellstädningen via kroppens tillväxtsignal.",src:"Alirezaei et al., Autophagy 2010"},
  {id:6, cat:"Vetenskap",       i:"🧠",c:"#06b6d4",f:"Fasta och hjärnan",            fb:"Fettbränsle (ketoner) är ett renare bränsle för hjärnan. Många rapporterar skärpt fokus och klarhet.",bk:"Ketoner passerar lätt till hjärnan och ger energi med mindre biproduktsskador jämfört med socker. Dessutom ökar fasta ett ämne som stärker kopplingar mellan hjärnceller — kopplat till förbättrat minne, inlärning och skydd mot depression.",src:"Mattson MP, Nature Reviews Neuroscience 2019"},
  {id:7, cat:"Vetenskap",       i:"❤️",c:"#06b6d4",f:"Fasta och hjärtat",            fb:"Regelbunden fasta förbättrar blodtryck, kolesterol och kroppens förmåga att hantera socker.",bk:"En studie (Wilkinson et al., 2020) visade att 16:8-fasta sänkte det övre blodtrycket med ~7 mmHg och minskade mängden skadligt kolesterol med 12% under 12 veckor. Fetthalten i blodet minskade med 20%.",src:"Wilkinson et al., Cell Metabolism 2020"},
  {id:8, cat:"Träning",         i:"💪",c:"#f97316",f:"Tappar man muskler av att fasta?",fb:"Nej — kroppen skyddar aktivt muskelmassa under fasta genom att öka tillväxthormonet kraftigt.",bk:"Tillväxthormon kan stiga upp till 5 gånger normala nivåer vid 24 timmars fasta. Kroppen sparar muskelvävnad och bränner i stället fett. Styrketräning i fastat tillstånd ger likvärdig muskeluppbyggnad — förutsatt att du äter tillräckligt med protein efter.",src:"Ho et al., Journal of Clinical Investigation 1988"},
  {id:9, cat:"Träning",         i:"🏃",c:"#f97316",f:"Kan man träna under fasta?",   fb:"Ja — konditionsträning och lättare styrka fungerar utmärkt. Fettförbränningen är dessutom förhöjd.",bk:"Under fasta är kroppen redan i fettförbränningsläge, vilket gör att fettförbränningen under konditionsträning kan vara upp till 20% högre. För tung styrketräning rekommenderas att äta 1–2 timmar innan för bästa prestation.",src:"Schoenfeld & Aragon, Strength & Cond. Journal 2014"},
  {id:10,cat:"Träning",         i:"🥩",c:"#f97316",f:"När ska man äta efter träning?",fb:"Ät ett proteinrikt mål inom 1–2 timmar efter träning för att maximera muskelreparation.",bk:"Musklernas förmåga att ta upp protein och reparera sig är som störst direkt efter träning. Livsmedel rika på aminosyran leucin — som ägg, kyckling och vassleprotein — är mest effektiva.",src:"Morton et al., Am J Clinical Nutrition 2018"},
  {id:11,cat:"Vanliga farhågor",i:"🤒",c:"#ef4444",f:"Ska man fasta vid sjukdom?",   fb:"Vid feber eller allvarligare sjukdom — ät och drick normalt.",bk:"⚠️ Vid feber ökar kroppens energibehov med ungefär 10% per grad temperaturökning. Immunsystemet behöver socker och protein som bränsle. Fasta under pågående sjukdom kan förlänga återhämtningstiden.",src:"WHO 2020"},
  {id:12,cat:"Vanliga farhågor",i:"💊",c:"#ef4444",f:"Fasta och mediciner",          fb:"Många mediciner måste tas med mat för att fungera rätt. Rådgör alltid med din läkare.",bk:"⚠️ Insulin och blodsockersänkande mediciner kan ge farligt lågt blodsocker om du fastar. Blodtrycksmediciner och antiinflammatoriska smärtstillare behöver ofta tas med mat. Kontrollera alltid med läkare eller apotekare.",src:"Klinisk rekommendation"},
  {id:13,cat:"Vanliga farhågor",i:"🩸",c:"#ef4444",f:"Fasta vid diabetes",           fb:"Typ 2-diabetes kan förbättras märkbart. Typ 1-diabetes kräver alltid medicinsk övervakning.",bk:"⚠️ Periodisk fasta kan förbättra blodsockerkontroll vid typ 2-diabetes, men blodsockersänkande mediciner måste justeras av läkare. Personer med typ 1-diabetes bör ALDRIG fasta utan läkarövervakning.",src:"Sutton et al., Cell Metabolism 2018"},
  {id:14,cat:"Vanliga farhågor",i:"🤰",c:"#ef4444",f:"Graviditet & amning",          fb:"Rekommenderas inte — fostret och barnet behöver regelbunden tillförsel av näring.",bk:"⚠️ Under graviditet ökar energibehovet markant. Fasta kan påverka fostrets tillväxt negativt. Under amning kan ett energiunderskott minska mjölkproduktionen. Undvik fasta under dessa perioder.",src:"Academy of Nutrition and Dietetics 2021"},
  {id:15,cat:"Vanliga farhågor",i:"👴",c:"#ef4444",f:"Fasta och ålder (65+)",        fb:"Äldre bör vara försiktiga — risken för att förlora muskelmassa ökar med åldern.",bk:"⚠️ Från ca 30-årsåldern förlorar kroppen naturligt muskelmassa med åren. Fasta kan förstärka detta om man inte äter tillräckligt protein. Kortare fasteperioder (12–14 timmar) är ofta mer lämpliga än längre protokoll.",src:"Bauer et al., J Am Med Dir Assoc 2013"},
  {id:16,cat:"Vanliga farhågor",i:"😰",c:"#ef4444",f:"Ätstörningar & psykisk hälsa", fb:"Fasta kan trigga eller förvärra ätstörningar hos känsliga personer.",bk:"⚠️ Restriktiva ätmönster kan förstärka tvångsmässiga tankar kring mat och kropp. Vid depression eller ångest kan blodsockersvängningar förvärra humöret. Om du är osäker — konsultera en läkare eller psykolog.",src:"APA Clinical Recommendations 2022"},
  {id:17,cat:"Praktiskt",       i:"☕",c:"#8b5cf6",f:"Vad bryter fastan?",            fb:"Kalorier bryter fastan. Vatten, svart kaffe och osötat te håller dig i fastans tillstånd.",bk:"Det som avgör om fastan är bruten är framför allt insulinnivån. Kalorier höjer insulinet och avbryter de metabola fördelarna. Svart kaffe påverkar inte insulin märkbart.",src:"Maukonen et al., Nutrients 2020"},
  {id:18,cat:"Praktiskt",       i:"😣",c:"#8b5cf6",f:"Vanliga bieffekter",            fb:"Hunger, lätt yrsel och irritabilitet är vanligt de första 1–2 veckorna. Det går över.",bk:"De flesta bieffekter beror på brist på salter och mineraler (natrium, magnesium och kalium) som kroppen utsöndrar mer av i urinen under fasta. Lösning: drick saltat vatten eller buljong under längre fastor.",src:"Genoni et al., Nutrients 2019"},
  {id:19,cat:"Praktiskt",       i:"🌙",c:"#8b5cf6",f:"Bästa sättet att börja",        fb:"Börja försiktigt med 12 timmar och öka gradvis. Låt kroppen vänja sig i din takt.",bk:"Vecka 1: Sluta äta efter 20:00. Vecka 2: Skjut upp frukosten till 10:00. Vecka 3–4: Testa 16:8 konsekvent. De flesta märker tydliga fördelar efter 3–4 veckor när kroppen blivit van.",src:"Gabel et al., Nutrition and Healthy Aging 2018"},
];

export const ACTIVITY_LABELS = {
  stillasittande:"Stillasittande (kontorsarbete, lite rörelse)",
  lätt:"Lätt aktiv (promenader, lätt träning 1–2 ggr/v)",
  aktiv:"Regelbundet aktiv (träning 3–5 ggr/v)",
  atlet:"Atlet (intensiv träning 6–7 ggr/v)"
};
