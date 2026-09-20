---
name: ORINVA
description: A mature, premium, calm behavior-change and self-control companion for iOS and Android
colors:
  # Brand
  indigo-50: "#EEF1FA"
  indigo-100: "#DCE2F5"
  indigo-200: "#B9C5EB"
  indigo-300: "#93A4DD"
  indigo-400: "#6E82CC"
  indigo-500: "#4E5FB8"
  indigo-600: "#3E4C99"
  indigo-700: "#333F7D"
  indigo-800: "#293261"
  indigo-900: "#1C2247"
  # Petrol / Navy neutrals (base of both modes — never pure black/white)
  petrol-950: "#080B12"
  petrol-900: "#0B0F19"
  petrol-800: "#111726"
  petrol-700: "#182034"
  petrol-600: "#212B43"
  petrol-500: "#2C3854"
  petrol-100: "#EEF0F4"
  petrol-50: "#F5F6F9"
  # Light mode surfaces
  background-light: "#F4F5F9"
  surface-light: "#FFFFFF"
  surface-secondary-light: "#EAEDF3"
  surface-raised-light: "#FFFFFF"
  border-light: "#DFE2EA"
  border-strong-light: "#C7CCD9"
  text-primary-light: "#12172A"
  text-secondary-light: "#5A6178"
  text-tertiary-light: "#8890A3"
  # Dark mode surfaces
  background-dark: "#090C13"
  surface-dark: "#121726"
  surface-secondary-dark: "#1A2032"
  surface-raised-dark: "#1D2438"
  border-dark: "#262E44"
  border-strong-dark: "#38415C"
  text-primary-dark: "#F0F2F8"
  text-secondary-dark: "#9AA2BC"
  text-tertiary-dark: "#6B7591"
  # Semantic — clean time / success
  success-base: "#22A57C"
  success-on-dark: "#3FCC9C"
  success-soft-light: "#E1F5EC"
  success-soft-dark: "#132A22"
  # Semantic — craving / attention
  amber-base: "#C6841F"
  amber-on-dark: "#E3A54B"
  amber-soft-light: "#FBEEDA"
  amber-soft-dark: "#2B2210"
  # Semantic — relapse / critical (desaturated terracotta, never alarm-red)
  terracotta-base: "#BC5744"
  terracotta-on-dark: "#DD8570"
  terracotta-soft-light: "#F8E7E2"
  terracotta-soft-dark: "#2A1712"
  # Semantic — AI / insight / reflection
  violet-base: "#7566D6"
  violet-on-dark: "#9C8FEE"
  violet-soft-light: "#EEEBFB"
  violet-soft-dark: "#1C1830"
  # Semantic — journal / personal reflection
  slate-blue-base: "#54809E"
  slate-blue-on-dark: "#7FAAC6"
  slate-blue-soft-light: "#E7F0F5"
  slate-blue-soft-dark: "#12222B"
  # Secondary accent — mint/cyan (progress rings, clean-time highlight)
  cyan-base: "#2B96A0"
  cyan-on-dark: "#52C2CC"
  # Warm accent — used only for milestone/premium glow, very sparingly
  bronze-base: "#B98A4D"
  bronze-on-dark: "#D6AC76"
typography:
  fontFamily: "System (SF Pro Text/Display on iOS, Roboto/Roboto Flex on Android)"
  fontFamilySerifAccent: "New York (iOS) / Noto Serif (Android) — reflection quotes only, opt-in per component"
  display:
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.015em"
  title:
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  bodyLarge:
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  body:
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  label:
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.005em"
  caption:
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  statLarge:
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: "-0.02em"
    tabularNums: true
  statSmall:
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
    tabularNums: true
spacing:
  "2": "2px"
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "32": "32px"
  "40": "40px"
  "48": "48px"
  "64": "64px"
radius:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "22px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.indigo-500}"
    textColor: "#FFFFFF"
    rounded: "{radius.md}"
    height: "52px"
    padding: "0 20px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary-light}"
    border: "1px solid {colors.border-strong-light}"
    rounded: "{radius.md}"
    height: "48px"
    padding: "0 18px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.indigo-500}"
    rounded: "{radius.sm}"
    height: "44px"
    padding: "0 12px"
  button-critical:
    backgroundColor: "transparent"
    textColor: "{colors.terracotta-base}"
    border: "1px solid {colors.terracotta-base}"
    rounded: "{radius.md}"
    height: "48px"
  card:
    backgroundColor: "{colors.surface-light}"
    rounded: "{radius.lg}"
    padding: "20px"
    borderColorDark: "{colors.border-dark}"
  input:
    backgroundColor: "{colors.surface-secondary-light}"
    rounded: "{radius.sm}"
    height: "52px"
    padding: "0 16px"
---

# ORINVA Design System

## 0. How to use this document

This file is the single visual source of truth for ORINVA. Every screen, component and state built for this app should be traceable to a rule or token in this document. Where this document is silent, default to the calmest, least decorated option — never invent a second accent color, a new radius, or a new animation curve without adding it here first.

ORINVA is a behavior-change and self-control companion, not a generic habit tracker. Its users are quitting or reducing something that matters to them — nicotine, alcohol, social media, gaming, sugar, pornography, a relationship pattern, or a behavior they define themselves. Every visual decision below is filtered through one question: **does this help someone feel steady, respected and in control during a hard moment — or does it perform wellness at them?**

---

## 1. Design Philosophy

**Creative North Star: "Quiet Command."**

The interface behaves like a well-made instrument a person reaches for at their most self-conscious moments — never like a gamified tracker cheering at them, and never like a clinical intake form. Every screen is built around one honest thing at a time: today's plan, one number, one reflection, one decision. Chrome is minimal, hierarchy is unmistakable, and the product earns trust through precision rather than decoration.

Where Pocket Habit (our structural reference) reads as *bright, friendly, rounded* — ORINVA reads as *deep, composed, exact*. We keep Pocket Habit's discipline (clear card structure, legible spacing, one accent doing the pointing) but move the palette down into petrol/indigo darkness, tighten the radius so nothing feels toy-like, and replace cheerful illustration with typographic and data-driven confidence.

**Non-negotiables:**
- No pure black, no pure white. The base is always a tinted petrol-navy or a cool off-white.
- No more than one saturated accent visible on a screen at a time (see §3, One Voice Rule).
- No illustration mascots, no confetti-by-default, no "you're crushing it" tone.
- No aggressive red. Relapse and critical states use desaturated terracotta, never alarm-red.
- Radius stays moderate (10–22px). Full pill buttons (999px) are reserved for tags/chips only, never primary CTAs — pill-everything reads childish at this product's emotional weight.

## 2. Brand Personality

| Trait | Expressed as | Avoided as |
|---|---|---|
| Composed | Generous whitespace, one action per screen, slow confident motion | Dense dashboards, busy multi-CTA screens |
| Premium | Deep petrol/indigo palette, precise type scale, tabular numerals on stats | Gradients, glassmorphism, neon accents |
| Trustworthy | Consistent iconography, honest empty states, no fake urgency | Countdown timers, streak-loss guilt copy, dark patterns |
| Adult | Editorial tone, restrained celebration, serif accent only in reflection | Mascots, emoji-heavy copy, loot-box reward visuals |
| Steady | Same layout grammar whether the user is logging a craving or reading an insight | Mode-switching UI that looks like a different app per screen |

If a screen could be mistaken for a children's habit-tracker or a hospital intake form, it has failed brand personality.

## 3. Color Tokens

Color in ORINVA is semantic before it is decorative. Every hue maps to a specific meaning; nothing is chosen because it "looks nice" in isolation.

### Brand — Indigo
`indigo-500 #4E5FB8` is the one interactive voice of the product: primary buttons, active nav state, focus rings, links, selected states. `indigo-900 #1C2247` doubles as a deep tonal surface for hero/onboarding moments. Indigo is deliberately less saturated and darker than a typical SaaS blue — it should read as ink, not electricity.

### Neutral — Petrol
The entire canvas, in both modes, is built from the petrol family, never true gray, never true black/white:
- `petrol-950 #080B12` / `petrol-900 #0B0F19` — dark mode background
- `petrol-800 #111726` — dark mode primary surface (cards)
- `petrol-700 #182034` — dark mode secondary surface (nested rows, inputs)
- `petrol-50 #F5F6F9` / light background `#F4F5F9` — light mode canvas, cool-tinted, never warm-cream
- `surface-light #FFFFFF` — light mode cards

### Semantic status
| Role | Base | On dark | Soft bg (light) | Meaning |
|---|---|---|---|---|
| Success / clean time | `#22A57C` | `#3FCC9C` | `#E1F5EC` | streaks, milestones reached, positive deltas |
| Craving / attention | `#C6841F` | `#E3A54B` | `#FBEEDA` | active urge, "struggling now" state, moderate risk |
| Relapse / critical | `#BC5744` | `#DD8570` | `#F8E7E2` | logged slip, destructive actions — desaturated terracotta, never pure red |
| AI / insight / reflection | `#7566D6` | `#9C8FEE` | `#EEEBFB` | AI coach, pattern/insight cards, weekly review |
| Journal / personal | `#54809E` | `#7FAAC6` | `#E7F0F5` | journal entries, mood, evening reflection |
| Progress accent (secondary) | `#2B96A0` (cyan) | `#52C2CC` | — | rings, clean-time visual highlight, charts second series |
| Milestone glow (rare) | `#B98A4D` (bronze) | `#D6AC76` | — | premium celebration accents only, ≤1 use per screen |

### Named rules
- **The One Voice Rule.** Indigo appears on at most one primary action per screen. A screen with two indigo buttons has failed review.
- **The Semantic-Only Rule.** Success, amber, terracotta, violet, slate-blue and cyan are never used decoratively — each appearance must correspond to that exact meaning (a card is not tinted amber unless it represents a craving/attention state).
- **The No-Alarm Rule.** Relapse/critical states never use saturated red, flashing, or full-bleed color fills. Terracotta appears as a thin accent (icon, left border, small badge) — never as a full-screen wash.

## 4. Light Mode

Light mode is cool, quiet, slightly overcast — not bright-white SaaS, not warm-cream wellness.

- Background: `#F4F5F9`
- Surface (cards, sheets): `#FFFFFF`
- Surface secondary (nested rows, inputs, chips): `#EAEDF3`
- Border (hairline): `#DFE2EA`
- Border strong (input focus rest, dividers between sections): `#C7CCD9`
- Text primary: `#12172A`
- Text secondary: `#5A6178`
- Text tertiary / placeholder: `#8890A3`
- Shadow: soft, single ambient shadow only (see §7)

## 5. Dark Mode

Dark mode is the product's natural home, not an inverted afterthought — petrol, not black.

- Background: `#090C13`
- Surface (cards, sheets): `#121726`
- Surface secondary (nested rows, inputs, chips): `#1A2032`
- Surface raised (modals, active/selected cards): `#1D2438`
- Border (hairline): `#262E44`
- Border strong: `#38415C`
- Text primary: `#F0F2F8`
- Text secondary: `#9AA2BC`
- Text tertiary / placeholder: `#6B7591`
- Elevation: tonal layering only, no drop shadows (see §7)

Both modes share the exact same indigo `#4E5FB8` and semantic hues (with `-on-dark` variants swapped in for sufficient contrast) — the brand must feel identical in either mode, just lit differently.

## 6. Typography

**Primary face:** System (SF Pro on iOS, Roboto on Android) — native, legible at every Dynamic Type size, zero brand-font tax.
**Reflection accent face (optional, opt-in only):** New York (iOS) / Noto Serif (Android) — reserved exclusively for: the daily reflection quote on the evening screen, journal entry headers when the user re-reads past entries, and the user's own Reason/Future-Self note when displayed full-screen in the craving-help flow. Never used for buttons, navigation, or data.

| Style | Size | Weight | Line-height | Tracking | Use |
|---|---|---|---|---|---|
| Display | 34px | 700 | 1.15 | -0.02em | Milestone moments, onboarding hero |
| Headline | 28px | 700 | 1.18 | -0.015em | Screen titles ("Bugün", "Yolculuğun") |
| Title | 20px | 600 | 1.25 | -0.01em | Card headers, section titles |
| Body Large | 17px | 400 | 1.6 | 0 | Journal writing surface, reflection reading |
| Body | 15px | 400 | 1.55 | 0 | Standard UI copy, descriptions |
| Label | 14px | 500 | 1.4 | 0.005em | Buttons, form labels, tab labels |
| Caption | 12px | 500 | 1.4 | 0.02em | Timestamps, metadata, helper text |
| Stat Large | 40px | 700 | 1.0 | -0.02em | Streak day count, main journey number — tabular figures |
| Stat Small | 22px | 700 | 1.1 | -0.01em | Secondary stats in grids (savings, event counts) |

Rules: never mix in a second sans family "for variety." Never use the serif accent above 2 instances per screen. All numeric stats use tabular (monospaced) figures so digits don't jump width when they change.

## 7. Spacing Scale

Base unit 4px, used with intent — not arbitrary pixel-pushing.

`2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`

- `4` — icon-to-label gap, tight inline spacing
- `8` — internal gap between related elements (label + value)
- `12` — gap between rows inside a card
- `16` — card internal padding (default), gap between stacked cards
- `20` — screen horizontal margin, card internal padding (roomy variant)
- `24` — gap between distinct sections on a screen
- `32` / `40` — hero/onboarding vertical rhythm
- `48` / `64` — empty-state and celebration-moment breathing room

Screen horizontal margin is fixed at `20px` on phones; content never touches the edge.

## 8. Radius Scale

Deliberately moderate — premium and adult, not toy-rounded.

- `xs 6px` — chips inside dense rows, small tags
- `sm 10px` — secondary buttons, input fields, small icon buttons
- `md 14px` — primary buttons, standard cards
- `lg 18px` — large cards, bottom-sheet top corners, modals
- `xl 22px` — hero cards (Journey summary, onboarding panels)
- `pill 999px` — chips/tags and the craving-intensity selector only; **never** a primary CTA

This is the sharpest deviation from Pocket Habit's fully-pill button language (24–32px radius on every button): ORINVA buttons cap at `md 14px` so the product reads composed rather than bubbly.

## 9. Shadows / Elevation

Elevation is honest and nearly silent.

**Light mode** — one shadow vocabulary, used once per surface:
- Surface (cards): `0 1px 2px rgba(18,23,42,0.04), 0 4px 10px rgba(18,23,42,0.05)`
- Overlay (sheets, modals, popovers): `0 8px 24px rgba(18,23,42,0.10), 0 2px 6px rgba(18,23,42,0.05)`

**Dark mode** — no drop shadows anywhere. Depth comes purely from stepping surface lightness: background `#090C13` → surface `#121726` → surface secondary `#1A2032` → surface raised `#1D2438`. A glowing card in dark mode is a review-blocking defect.

**Exception:** AI/insight cards may carry a barely-visible `violet-base` glow at 6% opacity in dark mode only, to softly signal "this card thinks" — capped at one such card visible at a time.

## 10. Borders

Hairline `1px` borders do the work shadows can't in dark mode.

- Default card border: none in light mode (shadow carries it); `1px solid border-dark (#262E44)` in dark mode.
- Input rest: no visible border, `surface-secondary` fill only.
- Input focus: `1.5px solid indigo-500`, no glow/ring blur.
- Divider between list rows: `1px solid border-light/border-dark` at 100% — never a shadow-simulated divider.
- Destructive/critical outline (e.g. "Delete all data"): `1px solid terracotta-base`.

## 11. Iconography

Single icon set (Lucide/Phosphor-style single-weight line icons, ~1.5px stroke at 24px) — never mix filled and outline styles for the same semantic role.

- `16px` — inline with caption text, badges
- `20px` — inline with body/label text, list row leading icons
- `24px` — default: tab bar, buttons, card action icons
- `28px` — section header icons, empty-state icon
- `32px` — onboarding step icons
- `48px` — hero icon (craving-help entry point, milestone icon)

Icons inherit `text-secondary` by default; they take a semantic color (success/amber/terracotta/violet) only when representing that exact state, matching §3's Semantic-Only Rule. Filled icon variants are reserved for active/selected states only (e.g. active tab).

## 12. Buttons

| Variant | Height | Radius | Fill | Text | Use |
|---|---|---|---|---|---|
| Primary | 52px | md 14px | `indigo-500` | `#FFFFFF`, Label 14/600 | One per screen — the single next step |
| Secondary | 48px | md 14px | transparent | `text-primary`, 1px `border-strong` | Alternate action alongside primary |
| Ghost | 44px | sm 10px | transparent | `indigo-500` | Low-emphasis / tertiary action |
| Critical | 48px | md 14px | transparent, 1px `terracotta-base` border | `terracotta-base` | Destructive actions only (delete, log relapse confirm) |
| Craving-help CTA | 60px | lg 18px | `indigo-500`, subtle inner highlight | `#FFFFFF`, Label 15/600 | The single largest, most reachable button in the app — reserved for "Şu an zorlanıyorum" |

Press feedback: scale to `0.97`, 90ms ease-out, opacity unchanged. Disabled state: `opacity 0.4`, no press feedback. Minimum touch target `48×48pt` even when visual button is smaller (hit-slop padding).

## 13. Inputs

- Style: filled, no visible border at rest — `surface-secondary` background, `sm 10px` radius, `52px` height, `16px` horizontal padding.
- Label: `Label` style, placed above the field, `8px` gap.
- Placeholder: `text-tertiary`, must still clear 4.5:1 contrast.
- Focus: border appears at `1.5px indigo-500`, background lifts to `surface`.
- Error: border `1px terracotta-base`, helper text below in `terracotta-base`, `Caption` style.
- Multiline (journal entry): `Body Large` type, no visible box at all on the full-screen journal composer — just the canvas background, cursor in `indigo-500`.
- Slider / intensity inputs: see §23.

## 14. Cards / Surfaces

- Radius: `lg 18px` standard, `xl 22px` for hero cards (Journey summary, onboarding).
- Padding: `20px` internal, `16px` gap between stacked cards.
- Header/body structure: `Title` (20/600) + optional `Caption` meta on the same row, body content below with `12px` top gap.
- Nested rows inside a card use `surface-secondary` background with `sm 10px` radius, not another shadow layer.
- Cards never stack more than one visual "layer" of elevation — a card inside a card uses tone, not shadow-on-shadow.

## 15. Bottom Navigation

- Height: `64px` + safe-area inset.
- Background: `surface` with a `1px` top border (`border-light`/`border-dark`) — no shadow.
- 3–4 destinations max: **Bugün** (Today), **Yolculuk** (Journey), **Günlük** (Journal), **Sen** (You/Settings). The craving-help entry point is **not** a tab — it lives as a persistent floating action from the Today screen (see §29), because it must be reachable from the single most-used screen without a tab switch.
- Icon `24px`, Label `Caption 12/500` below, `4px` gap.
- Active state: icon switches to filled variant + `indigo-500`; label color shifts to `indigo-500`; no pill/bubble background behind the icon.

## 16. Top Navigation

- Height: `56px` content + safe-area inset.
- No large drop-title pattern by default — screens use a `Title 20/600` left-aligned header inline with the top bar, not a giant `Headline` that pushes content down on every screen. `Headline` size is reserved for the Today and Journey hero screens only.
- Leading: back/close `24px` icon button, `48×48pt` tap target.
- Trailing: at most one ghost icon action (e.g. settings, add).
- Screens in a stack (e.g. Journal entry detail) use a transparent top bar over the content background, not a filled bar, to keep continuity with the canvas.

## 17. Bottom Sheets

- Top corners: `lg 18px` radius, bottom corners square (0) to the device edge.
- Handle: `36×4px`, `border-strong`, centered, `12px` top margin.
- Background: `surface` (light) / `surface-raised` (dark).
- Max height: 90% of screen; content scrolls internally, header stays pinned.
- Entry animation: slide up `260ms` cubic-bezier(0.32, 0.72, 0, 1), backdrop fades to `rgba(9,12,19,0.5)` over the same duration.
- Used for: quick-log detail expansion, plan/intervention picker, filter/sort — never for the craving-help flow itself, which is always full-screen (see §29).

## 18. Modals

- Radius: `lg 18px` all corners, centered, max width `340px` on phones / `480px` on tablets.
- Background: `surface-raised`.
- Backdrop: `rgba(9,12,19,0.55)`, no blur (glassmorphism is not a base tool — see §36 exception for AI-only moments).
- Reserved for interruptive, must-decide moments only: delete confirmation, AI consent, crisis/escalation card. Never used for routine flows (those use full screens or sheets).
- Entry: scale from `0.96` → `1.0` + fade, `200ms` ease-out.

## 19. Toast / Snackbar

- Position: bottom, `16px` above the tab bar / safe area.
- Height: `48px` min, auto-grow for two-line messages.
- Radius: `md 14px`. Background: `surface-raised` with `1px border`. Never uses a semantic color fill as background — an icon (`20px`, semantic color) carries the meaning, text stays `text-primary`.
- Duration: `3200ms` auto-dismiss, swipe-to-dismiss always available.
- Reserved for confirmations ("Kaydedildi", "Dışa aktarıldı") — never for streak/guilt nudges.

## 20. Progress Indicators

- Linear progress (e.g. weekly plan adherence): `4px` height track, `999px` radius, track = `surface-secondary`, fill = `indigo-500` (or `cyan-base` when representing clean-time specifically).
- Circular ring (see §21 for streak-specific use): `8px` stroke width at default `96px` diameter, track at 12% opacity of the fill color, fill uses `cyan-base` → `indigo-500` depending on context, rounded line caps.
- Indeterminate spinner: thin `2px` stroke, `indigo-500`, used only for network/AI-wait states under 5s; anything longer gets a skeleton instead.
- Skeleton loading: `surface-secondary` blocks at `sm 10px` radius, shimmer opacity pulse `0.5 → 0.8`, `1200ms` ease-in-out loop.

## 21. Streak Visualization

Streak is present but explicitly **not** the dominant metric (per product direction — Journey, not streak, is the hero). Visual rules:

- Primary display: a single `Stat Large (40px/700)` number with `Caption` unit below ("gün temiz"), no ring, no flame icon, no countdown urgency.
- Optional ring variant (opt-in, Settings toggle): `96px` circular ring per §20, `cyan-base` fill, center holds the `Stat Large` number — calm, not gamified (no sparkle/flame iconography, no "on fire" copy).
- **A broken streak never resets to a red zero on screen.** On slip, the number simply reflects current clean-time; the Journey card (§ "Journey view") shows the 30-day pattern instead of a shamed zero — see §33.
- No streak leaderboard, no streak share-card with competitive framing.

## 22. Charts

- Chart family: simple bar and line only. No pie/donut charts (poor for time-series/behavior data and reads as dashboard-cliché), no dual-axis charts (implies false correlation — forbidden by product policy).
- Bar chart: bars in `indigo-500` (or context semantic color), `sm 10px` top-radius only, `surface-secondary` gridline baseline only (no full gridlines).
- Line chart (time-of-day intensity): `2px` stroke `cyan-base`, no fill-below-line gradient, dot markers only on data points with a value, `4px` radius.
- Every chart ships with a visible sample-size caption below it (e.g. "9 kayıttan"), per the product's evidence-card requirement — a chart without a denominator is not allowed to render.
- Axis labels: `Caption` style, `text-tertiary`.

## 23. Calendar / Heatmap

- Grid cell: `32×32px` (phones), `4px` gap, `xs 6px` radius per cell.
- Intensity encoding uses **shape + label, not color-alone**: a filled dot for "logged a plan-aligned day," a hollow ring for "logged a hard day," empty cell for "no data" (not "failure"). Color (success/amber/terracotta at low opacity fill) is a secondary reinforcement layer, never the only signal (accessibility requirement, §37).
- No dark-to-bright saturation heatmap ramp implying a "score" — this product explicitly rejects a self-control score (see product policy). Maximum 3 discrete states per cell.
- Today's cell: `1.5px indigo-500` outline ring, no fill change.

## 24. Mood Selector

- 5-point scale, word-labeled, not emoji-only: *çok gergin, gergin, nötr, sakin, çok sakin* (or equivalent per context). Each point is a `44×44pt` tappable dot/segment in a single horizontal row, `sm 10px` radius per segment.
- Selected state: `slate-blue-base` fill + `Label` text below stays visible (never relies on color alone — screen reader announces the word, not just "mood 3").
- Optional secondary "energy" axis (low–high) uses the same segmented control pattern, always below and clearly secondary in weight (`Caption` size vs `Label`).
- "Emin değilim" is always the last, equally-sized option — never smaller or grayed to discourage its use.

## 25. Craving Intensity Selector

- 5-point scale, word-labeled: *hafif, belirgin, güçlü, çok güçlü, bunaltıcı*.
- Rendered as a horizontal segmented pill row (`pill 999px` — the one approved primary use of full-pill radius, since this is a single-tap intensity gauge, not a CTA), each segment `44px` min-width × `44px` height.
- Unselected segments: `surface-secondary` fill, `text-secondary` label. Selected: `amber-base` fill (light) / `amber-on-dark` (dark), `#FFFFFF` or `petrol-900` label depending on contrast need.
- This control is always optional — a visible "Atla" (skip) ghost button sits inline, equal tap priority to the scale itself.

## 26. Milestone Components

- Trigger: meaningful, user-relevant thresholds (not arbitrary day-counts chosen by the system for engagement) — first 24h, 7 days, 30 days, user-set custom goal date, or a value the user defined themselves (e.g. money saved threshold).
- Visual: a single full-width card, `xl 22px` radius, `bronze-base` used only as a thin `1.5px` border + small `24px` icon — background stays standard `surface`, not a gold-filled celebration block.
- Motion: one restrained moment — icon scales `0.9 → 1.0` with a soft opacity fade, `400ms` ease-out, optional single haptic (`notificationSuccess`), **no confetti, no particle burst, no sound by default**.
- Copy tone: acknowledges specifically ("7 gün oldu. Bunu sen yaptın.") — never generic hype ("You're AMAZING!!").
- Milestone card is dismissible and archives into Journey history — it does not persist as a nag.

## 27. Daily Check-in

- Never a mandatory gate — no streak or badge is withheld for skipping it.
- Presented as a single card on the Today screen, `Title` + one open question (per content system) + three response affordances: short text, voice-note icon, "Şimdi değil" ghost button — all equal visual weight, skip is never the smallest/lightest element on screen.
- Once answered, the card collapses to a compact one-line summary state (`Caption` + checkmark icon in `success-base`), reclaiming vertical space rather than persisting as a filled block.

## 28. Journal UI

- Composer: full-bleed canvas in background color, `Body Large` (17px/1.6) type, cursor `indigo-500`, no visible text-box border — writing should feel like paper, not a form field.
- Entry list: each row is a compact card — first line of text (`Body`, truncated 2 lines), `Caption` timestamp + optional mood/behavior tag chip (`xs 6px` radius, semantic soft-bg color).
- Reading a past entry: header uses the serif accent face at `Title` size for the date/context line only; body text remains system font at `Body Large` for actual readability.
- AI summarize action is an explicit `Ghost` button ("Bu notu özetle") under the entry — never automatic, never pre-expanded.
- Voice note: waveform in `slate-blue-base`, `40px` height, play/pause `44×44pt` control — raw audio never auto-uploads (local playback icon shown until user explicitly shares/syncs).

## 29. AI Coach UI

- Entry point: a distinct `violet-base` accent — icon, thin left-border, or small avatar mark — used **only** for AI-originated content, so a user always knows instantly "this came from the assistant" vs. their own data.
- Message bubbles: AI messages sit in `violet-soft-light`/`violet-soft-dark` background, `md 14px` radius, `Body` text. User's own replies sit in standard `surface-secondary`, no color distinction needed since directionality (left/right or avatar) already disambiguates.
- Every AI output that references personal data carries a small inline `Caption` disclosure ("yerel verine göre") and a persistent "Bu doğru değil" / "Bu kartı gizle" affordance — never optional, never buried in a menu.
- No chat-app styling tropes that imply a peer/friend relationship (no "typing…" bubble with a smiling avatar, no read receipts). A calm "hazırlanıyor" text state with the thin `2px indigo` spinner (§20) is sufficient.

## 30. AI Insight Cards

- Card shell: standard `Card` (§14) with a `1px violet-base` left border accent (`4px` wide bar, not a full border) — the only card type permitted a colored border edge.
- Structure: plain-language observation first (`Body`), evidence line second (`Caption`, e.g. "19 kayıttan 9'u 22:00–00:00 arası"), then one action ("Bunu test etmek ister misin?" → ghost button into Pause Plan).
- Confidence language is mandatory in copy, never in a numeric "confidence score" UI element — no percentage-certainty badges, which would imply false precision.
- User verification control is always present: "Bu bana doğru geliyor mu?" with equal-weight Evet/Hayır/Bilmiyorum — a "Hayır" visibly suppresses that insight going forward (small confirmation toast, §19).

## 31. Emergency / Craving-Help UI

This is the product's most important screen family and gets the most deliberate, distraction-free treatment in the system.

- Full-screen only — never a sheet or modal (a hard moment deserves the user's full attention, not a partial overlay they can accidentally dismiss).
- Background: single flat `background` color (petrol-900 dark / petrol-50 light) — no imagery, no gradient, no motion behind the content.
- Entry button (from Today screen): the single largest touch target in the app, `60px` height (§12), reachable with one thumb, positioned in the lower third of the Today screen.
- Inside the flow: one decision per screen, `Headline` question, large touch targets (`≥56px`) for each choice, generous `32px` vertical rhythm — this is not the place for dense UI.
- A persistent, quiet "Kriz desteği" text link sits at the bottom of every screen in this flow, `Caption` size, `text-secondary` — present but not alarming, always reachable without hunting.
- No progress bar implying "3 more steps to relief" — pacing is the user's, not the system's clock.
- Timer element (e.g. 30-second breathing pause): a simple shrinking-ring or dot pulse in `cyan-base`, `1000ms` breathing-rate cycle, always skippable via a visible "Geç" ghost button.

## 32. Success States

- Confirmation is quiet: `success-base` icon (`24px`, checkmark, single-weight line style — filled only at the instant of the action, then settles to line) + `Body` text. No full-screen success takeover for routine actions (saving a log, completing a plan step).
- Reserved bigger success moment: milestone only (§26) — that is the ceiling of celebration intensity anywhere in the app.
- Copy avoids superlatives ("harika", "mükemmelsin") in routine confirmations; reserve warmer language for milestones specifically, and even then stays adult in tone.

## 33. Empty States

- Structure: `28px` line icon in `text-tertiary`, `Title` headline, one line of `Body` explanation, one `Ghost` or `Secondary` action — never a full illustration/mascot.
- Tone is informative, not guilt-inducing: "Henüz kayıt yok. İstediğinde buradan başlayabilirsin." — never "Hiçbir şey kaydetmedin!" or streak-shaped absence framing.
- Journey view with zero events explicitly avoids a blank/failed look: it shows the 30-day date range with all cells in the neutral "no data" state from §23, communicating "space is ready," not "you failed to fill this in."

## 34. Error States

- Inline field errors: `terracotta-base` `1px` border + `Caption` message directly below the field — never a modal for simple validation.
- System/network errors: a `Toast` (§19) with a `terracotta-base` icon and a retry ghost action — never blocks the whole screen unless data loss is genuinely at risk.
- Full-screen error (rare — e.g. corrupted local database) uses the same layout grammar as Empty States (§33) with a `terracotta-base` icon instead of neutral, plus a clear recovery action (retry / contact support / export-and-reset). No stack traces, no red screen.

## 35. Relapse Flow Visual Rules

This is the flow the whole system's restraint is judged on.

- **No red screen, ever.** The logging surface for a slip/relapse uses the exact same neutral background as every other logging screen — terracotta appears only as a small `20px` icon accent, never a background wash.
- **No reset-to-zero animation.** Any visible counter simply updates to reflect current state on the next view; it does not animate through a "losing" countdown or crumble/break effect.
- Copy leads with acknowledgment, not judgment: "Bunu kaydetmen değerli. Bu tek olay yolculuğunun tamamı değil." rendered in standard `Body`/`text-primary` — not a special "sad" typographic treatment.
- The flow's primary CTA is forward-looking ("Şimdi ne yardımcı olur?"), styled as a normal `Primary` button — not a `Critical` red button, because logging the event itself is not the destructive action.
- `Critical` styling (§12, terracotta outline) is reserved for actual destructive actions elsewhere in the app (delete data) — never applied to the act of being honest about a slip.
- This flow never triggers a paywall, upsell, or rating prompt at any point in its sequence or immediately after.

## 36. Onboarding

- Target: under 90 seconds to first value (matches product requirement), so visual pacing must move fast without feeling rushed.
- Each step: single `Headline` or `Display` (hero step only) question, one primary decision, `Ghost` "Geri" always available, no numbered "Step 4 of 12" pressure indicator — instead a minimal `4px` segmented progress line (§20 linear indicator) so users sense motion without a counted burden.
- Background may use a single subtle `indigo-900 → petrol-900` tonal gradient **only** on the hero/welcome step (the one sanctioned gradient use-case in the entire system) — every subsequent step returns to flat background.
- The live mini-demo step (tapping "Dürtü geldi" for real) uses the exact production Craving-Help visual language (§31), not a simplified mock — what they practice in onboarding is pixel-identical to what they'll use for real.
- Consent screens (notifications, AI, biometric lock) use the standard `Modal` (§18) treatment, plain-language copy, equal-weight Allow/Not now buttons — never a pre-checked or visually-dominant "Allow."

## 37. Paywall / Premium Visual Principles

- Never a modal interrupting a craving-help, slip-logging, export, or delete flow — paywalls only ever appear from an explicit user action (tapping a premium-labeled feature) or a dedicated "Premium" settings entry.
- Layout: full screen, calm — `Headline`, 3–5 concrete feature rows (icon + one line, not a marketing wall of text), single price line with `Caption` billing-period clarity, one `Primary` CTA, one `Ghost` "Belki sonra."
- No countdown timers, no "3 kişi şu an bakıyor" social-proof pressure patterns, no strikethrough-fake-discount pricing.
- Locked-feature affordance elsewhere in the app: a small `bronze-base` lock icon (`16px`) inline with the feature label — never a blurred/teased preview of the user's own data.
- Core safety features (craving-help, slip flow, export, delete, basic history) never carry a lock icon anywhere, per product policy — the system must make it visually impossible to mistake them for premium.

## 38. Motion / Micro-interactions

| Interaction | Duration | Easing |
|---|---|---|
| Button press scale | 90ms | ease-out |
| Toast/snackbar enter-exit | 180ms | ease-out / ease-in |
| Bottom sheet enter | 260ms | cubic-bezier(0.32,0.72,0,1) |
| Modal enter | 200ms | ease-out |
| Screen/stack transition | 280ms | platform-native (iOS push / Android shared-axis) |
| Milestone icon celebration | 400ms | ease-out, single play |
| Skeleton shimmer loop | 1200ms | ease-in-out, looping |
| Breathing pause pulse (craving-help) | 1000ms/cycle | ease-in-out, looping until dismissed |

Rules: every animation above 150ms must have a `prefers-reduced-motion`/OS reduce-motion fallback that cuts straight to end-state with only an opacity cross-fade (150ms). No animation ever blocks input — all transitions are interruptible.

## 39. Accessibility

- Text contrast: body text ≥ 4.5:1, large text (≥20px/600) ≥ 3:1, checked in both modes against actual token pairs above.
- Touch targets: ≥ 44×44pt (iOS) / 48×48dp (Android) minimum, enforced even when the visual element is smaller via hit-slop.
- Color is never the sole carrier of meaning: mood, craving intensity, calendar states and status badges all pair color with a word label, icon shape, or pattern (§23, §24, §25).
- Dynamic Type / font scaling: all text styles in §6 must reflow without truncation up to at least 130% scale; stat numbers may reduce tracking before wrapping.
- Screen reader: every icon-only control has an accessible label in Turkish reflecting its action, not its icon name ("Dürtü kaydet", not "artı butonu"). Charts (§22) expose their evidence caption to screen readers as the primary description.
- Reduce Motion respected system-wide per §38. Haptics have an independent OS-level off-switch respected without any in-app override.

## 40. Responsive / Device Considerations

- Design baseline: 390×844 (iOS standard). Scales up cleanly to 430pt-wide devices and down to 375pt (SE) by adjusting spacing tokens down one step (20→16 screen margin) below 380pt width — typography never shrinks below the defined scale.
- Tablet/foldable: content max-width `560px`, centered, cards move from single-column to a 2-column grid only on the Journey/Explore screens — Today and craving-help stay single-column and centered at all widths (this flow must never feel "spread thin").
- Safe areas: all bottom-anchored elements (tab bar, floating craving-help button, toasts) respect `safe-area-inset-bottom`; top bars respect `safe-area-inset-top` with no content underlap.
- Landscape: craving-help flow locks to portrait-preferred layout logic (single-column, vertical rhythm) even if the OS allows rotation, since this flow prioritizes calm over adaptability.

## 41. Haptic Feedback Principles

Haptics reinforce, they never nag.

- Quick Log tap ("Dürtü geldi"): `impactLight`.
- Primary button confirm (plan saved, entry saved): `impactMedium`.
- Milestone reached: `notificationSuccess`, once, never repeating.
- Craving-help breathing pulse: no haptic per cycle by default (would feel like pressure) — optional single `impactLight` only if the user explicitly enables "breathing haptics" in settings.
- Slip/relapse logged: **no haptic** — this moment gets acknowledgment, not a buzz.
- Error/validation: `notificationWarning`, once.
- Global respect for OS haptic-off setting; no custom override toggle inside the app pretends to be "stronger" than the system setting.

## 42. Do's and Don'ts

### Do
- **Do** keep indigo to one primary action per screen (§3 One Voice Rule).
- **Do** pair every semantic color with a non-color signal (word, icon, shape) — §23, §24, §25, §39.
- **Do** keep radius in the 10–22px band for structural components; reserve full-pill for tags and the intensity selector only.
- **Do** show the evidence/sample-size line under every chart and AI insight.
- **Do** treat the craving-help flow (§31) and relapse flow (§35) as the highest-craft, most distraction-free screens in the app.
- **Do** use tonal layering for dark-mode depth, never a drop shadow.
- **Do** let a milestone be the emotional ceiling of celebration — nothing above it, nothing routine near it.

### Don't
- **Don't** use pure black (`#000000`) or pure white (`#FFFFFF`) as a background anywhere — always the petrol/cool-neutral tokens.
- **Don't** use saturated/alarm red for relapse, error, or any state — terracotta only, and only as an accent, never a fill.
- **Don't** default to full-pill (999px) buttons — that reads as a children's habit-tracker, which this product explicitly is not.
- **Don't** add gradients outside the single sanctioned onboarding-hero use (§36) or glassmorphism as a base material anywhere.
- **Don't** animate a streak counter down to zero, add a countdown, or otherwise dramatize a relapse.
- **Don't** put a lock icon on any core safety feature (craving-help, slip flow, export, delete).
- **Don't** let AI content look visually identical to the user's own data — the violet accent (§29, §30) must always disambiguate.
- **Don't** add a second decorative accent color, a second base type family, or a new animation curve without adding it to this document first.

---

## Appendix A — Relationship to Pocket Habit's DESIGN.md

Kept from Pocket Habit's system: one-accent discipline ("One Voice Rule" lineage), tonal (not shadow) dark-mode depth, filled/no-border input style, system-font-first typography, card/header structure with 16–20px internal padding, restrained press-scale feedback on buttons.

Deliberately changed for ORINVA's Path B direction: palette moved from a bright signal-blue/near-white system to a deep petrol/indigo base with desaturated semantic hues; radius scale pulled down from a fully-pill button language (24–32px) to a moderate 10–22px band; added a distinct AI/insight semantic color (violet) and a journal/reflection semantic color (slate-blue) that Pocket Habit's simpler habit-tracker scope didn't need; added explicit relapse/crisis visual rules, milestone restraint rules, and paywall-placement rules specific to a sensitive behavior-change product; introduced an optional serif accent face for reflection moments, absent from Pocket Habit entirely.

## Appendix B — Token Quick Reference

| Token | Value |
|---|---|
| Indigo (brand/primary) | `#4E5FB8` |
| Background (light / dark) | `#F4F5F9` / `#090C13` |
| Surface (light / dark) | `#FFFFFF` / `#121726` |
| Surface secondary (light / dark) | `#EAEDF3` / `#1A2032` |
| Border (light / dark) | `#DFE2EA` / `#262E44` |
| Text primary (light / dark) | `#12172A` / `#F0F2F8` |
| Text secondary (light / dark) | `#5A6178` / `#9AA2BC` |
| Success | `#22A57C` / dark `#3FCC9C` |
| Craving/Amber | `#C6841F` / dark `#E3A54B` |
| Relapse/Terracotta | `#BC5744` / dark `#DD8570` |
| AI/Violet | `#7566D6` / dark `#9C8FEE` |
| Journal/Slate-blue | `#54809E` / dark `#7FAAC6` |
| Progress/Cyan | `#2B96A0` / dark `#52C2CC` |
| Milestone/Bronze | `#B98A4D` / dark `#D6AC76` |
| Radius sm / md / lg / xl / pill | 10 / 14 / 18 / 22 / 999 px |
| Spacing scale | 2·4·8·12·16·20·24·32·40·48·64 px |
| Primary button height | 52px (craving-help CTA 60px) |
| Bottom nav height | 64px + safe area |
| Top nav height | 56px + safe area |
| Min touch target | 44×44pt / 48×48dp |
| Button press scale · duration | 0.97 · 90ms ease-out |
| Sheet enter duration | 260ms cubic-bezier(0.32,0.72,0,1) |
