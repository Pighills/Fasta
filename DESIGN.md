---
name: FASTA
description: Svensk fastetimer – lugn, mörk och exakt, med guld som enda accent.
colors:
  gold: "#c8a84e"
  gold-soft: "rgba(200,168,78,0.12)"
  gold-line: "rgba(200,168,78,0.30)"
  bg: "#0a0a0a"
  surface-sunken: "#0a0a0a"
  surface-chrome: "#111111"
  surface-raised: "#141414"
  surface-card: "#1a1a1a"
  line: "#2a2a2a"
  line-strong: "#4a4a44"
  text: "#f5f5f0"
  text-muted: "#b5b5aa"
  text-subtle: "#8a8a80"
  danger: "#ef4444"
  danger-text: "#fca5a5"
  danger-soft: "rgba(239,68,68,0.10)"
  caution-text: "#e8d9b0"
  caution-line: "rgba(239,168,68,0.30)"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  body-small:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
  eyebrow:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.12em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
components:
  card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.lg}"
    padding: "16px"
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.bg}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "48px"
  button-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger-text}"
    rounded: "{rounded.md}"
    height: "48px"
  chip:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.text-subtle}"
    rounded: "{rounded.pill}"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.gold-soft}"
    textColor: "{colors.gold}"
    rounded: "{rounded.pill}"
  input:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    height: "48px"
  sheet:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# FASTA – designspråk

Skrivet i T-32 (2026-10-01) utifrån den befintliga appen. Följs av T-33–T-38. Granskningen som ligger bakom finns i `docs/design/granskning.md`, före-bilderna i `docs/design/fore/`.

## Overview

**Ledstjärna: "Urverket i mörkret".** Ett fint urverk i ett mörkt rum: svart botten, guld som visar vad som är viktigt *nu*, och siffror som är exakta och lugna. Appen används ofta på kvällen eller tidigt på morgonen, med telefonen i handen, ibland hungrig. Den ska kännas stillsam, pålitlig och vuxen – aldrig stressande eller lekfull.

- Läge: **Operate** (app som används varje dag). Läsbarhet och samma mönster överallt går före effekter.
- Temat är låst (AGENTS.md punkt 6): `#0a0a0a`, guld `#c8a84e`, kort `#1a1a1a` med kant `#2a2a2a`, Outfit. Lyft det, byt det inte.
- Mobil först (390 px). Dator är en bredare variant med sidomeny, inte en egen design.

## Colors

- **Guld är den enda accenten.** Den används för: primär knapp, vald/aktiv sak, viktigaste siffran på skärmen, länkar. Högst ett guldfyllt element per skärm (primärknappen); resten är guldtext eller guldkant.
- **Ytor i tre lager:** botten `bg` → kort `surface-card` → fält/insänkt `surface-sunken` (samma svart som botten, inne i kort). `surface-raised` för sekundära knappar och rutor i rutor. Meny och topbar använder `surface-chrome`.
- **Text i tre steg:** `text` (rubriker, värden), `text-muted` (brödtext), `text-subtle` (etiketter, hjälptext). Inga andra gråtoner för text.
- **Kanter:** `line` för kort, `line-strong` för kryssrutor och skalknappar.
- **Fara/varning:** rött bara för radering och hälsovarningar; bärnsten (`caution-*`) för "tänk på"-rutor i Profil.
- **Fasernas färger** (`js/data.js`) är i dag sju regnbågsfärger. De får finnas kvar tills Anton bestämt något annat, men ska bara synas som små markeringar (punkt, tunn linje) – aldrig som stora ytor eller hela ringen. Se "Beslut för Anton" i granskningen.
- Kontrast minst 4,5:1 för all text. `text-subtle` på `surface-card` ≈ 5:1 – mörkare grå än så får inte användas för text.

## Typography

- Bara **Outfit** (variabel, vikt 300–800, `css/fonts.css`). Ingen `monospace`.
- Alla siffror som ändras (timer, statistik) har `font-variant-numeric: tabular-nums`.
- Sju steg: display 40 · headline 24 · title 18 · body 15 · label 14 · body-small 13 · eyebrow 11. Inget under 11 px. På mobil får display gå upp till 48 px i ringen.
- Vikter: 400 brödtext, 600 etiketter/knappar, 700 rubriker, 800 bara för headline och stora siffror.
- Eyebrow = versaler, 11 px, 0,12em spärrning, `text-subtle`. Används som avsnittsrubrik i kort, inte som dekoration.

## Layout

- Avståndsskala: 4 · 8 · 12 · 16 · 24 · 32 · 48 px. Inga andra värden.
- Mobil (≤ 700 px): sidomarginal 16 px, topbar 52 px, bottenmeny 60 px + safe-area. Innehållet slutar ovanför bottenmenyn.
- Dator (> 700 px): sidomeny 220 px, innehåll max 620 px och **centrerat** i ytan bredvid.
- Mellan kort: 12 px (mobil) / 16 px (dator). Inne i kort: 16 px. Mellan avsnitt (eyebrow-rubrik): 24 px.
- En skärm = en huvudsak. På Timer är det ringen.

## Elevation & Depth

Platt med tonlager – inga stora skuggor. Djup skapas av ytlagren och kanten `line`.
- Rutor (sheet/modal): skugga `0 -8px 32px rgba(0,0,0,0.6)` på mobil (bottenruta), bakgrund `rgba(0,0,0,0.8)` + `blur(4px)`.
- Primärknapp: högst `0 2px 12px rgba(200,168,78,0.18)` – ingen stark glöd.
- Fokus: `outline: 2px solid gold; outline-offset: 3px` (från T-15, ändras inte).

## Shapes

- Radier: 6 (små märken, kryssrutor) · 10 (knappar, fält, små kort) · 14 (kort) · 20 (rutor/sheets upptill) · rund (chips, piller).
- Kanter 1 px. Kryssrutor 1,5 px.
- Bottenrutor på mobil: rundade bara upptill, med en liten handtagslinje (36×4 px, `line-strong`) överst.

## Components

- **Kort (`card`):** `surface-card`, kant `line`, radie 14, padding 16. Kort i kort undviks – använd `surface-sunken`-rad i stället.
- **Primärknapp:** guld, svart text, 52 px hög, full bredd på mobil. En per skärm/ruta.
- **Sekundärknapp:** `surface-raised`, kant `line`, text `text` (inte grå – grå text ser avstängd ut).
- **Fareknapp:** `danger-soft` + `danger-text`, används bara för radering.
- **Ikonknapp:** minst 44×44, alltid `aria-label`; på mobil gärna ikon + kort text.
- **Chip/val:** rund, 44 px hög; vald = `gold-soft` + guldtext + `gold-line`.
- **Fält:** `surface-sunken`, radie 10, 48 px, 16 px text (förhindrar zoom på iOS), fokus = guldkant.
- **Ring (Timer):** spår `line`, förlopp guld (eller fasfärg som tunn markering, se Colors), tid i display-stil med tabular-nums.
- **Eyebrow-rubrik + kort:** standardmönstret för avsnitt.
- **Bottenmeny:** enfärgade linjeikoner (inline SVG, `currentColor`), aktiv = guld ikon + text + liten markering; inaktiv = `text-subtle`.
- **Tomt läge:** kort med en mening om vad som syns här och en knapp till nästa steg – aldrig tomma staplar eller streck.
- **Notis (`.notice`):** som i dag – kort med guldkant ovanför bottenmenyn.

## Do's and Don'ts

**Gör**
- Använd CSS-variablerna från `:root` (T-33) – aldrig hårdkodade färger eller storlekar i JS.
- Lägg stil i `css/styles.css` med klasser, inte `style=` i JS.
- Håll texterna exakt som i kunskapsbasen.
- Testa i 390×844 och 1280×800; ta före/efter-bilder.
- Respektera `prefers-reduced-motion` (stäng av rörelse, behåll toningar ≤ 150 ms).

**Gör inte**
- Inga nya färger, typsnitt eller gradienter. Ingen glassmorfism, ingen neon.
- Ingen text under 11 px, ingen text med kontrast under 4,5:1.
- Inga emojis som gränssnittsikoner i meny och knappar (emojis i innehåll, t.ex. Lära-kort, får vara kvar tills T-36 bestämt annat).
- Ingen `transition: all`, inga animationer längre än 300 ms, ingen studs.
- Ingen hover som enda signal – allt ska fungera med touch.
