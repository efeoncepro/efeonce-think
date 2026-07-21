# Efeonce Design System

**Empower your Growth.**

Efeonce is a modern growth-technology brand — a unified workspace for growth and
marketing teams (acquisition → activation → retention). This design system codifies
the Efeonce brand into tokens, components and full-screen UI kits so any team can
build on-brand interfaces, prototypes and assets quickly.

---

## Sources

This system was assembled from material supplied by the brand owner:

- **Brand palette** — `uploads/Paleta de color.jpg` (8 master swatches). Sampled
  to exact hex; see `tokens/colors.css`.
- **Logos** — `uploads/Logo_Fondo-claro (1).jpg` (navy on light). A transparent
  navy logo (`assets/logo.png`) and a reversed white logo (`assets/logo-white.png`)
  were derived from it. *(The supplied dark-background logo file was a blank/white
  export and could not be used — see CAVEATS.)*
- **Type** — DM Sans is **self-hosted** from the supplied `.ttf` files
  (`assets/fonts/`, weights 400/500/600/700 + italics) via `@font-face` in
  `tokens/fonts.css`. Inter (body) still loads from Google Fonts.
- **Figma file** — *"Ohio 3.6.8 Source (copia).fig"* (the "Ohio" multipurpose
  template), mounted read-only. Its **token structure** (radius/spacing/sizing
  scales, DM Sans title + Inter body, 2px control borders, 12px button radius)
  informed the foundations. Its demo color themes were **not** adopted — the
  Efeonce palette is the single source of truth for color.

> The Figma is a generic template; treat the **uploaded brand assets** as canonical
> whenever they disagree with it.

---

## Brand snapshot

- **Wordmark:** lowercase `efeonce` in a rounded, friendly geometric sans, with a
  rocket-in-orbit glyph replacing the "o" — momentum, lift-off, growth.
- **Tagline:** *Empower your Growth* (title-case "Growth").
- **Primary color:** bright blue `#0475db`, anchored by a deep navy ink `#022a4e`.
- **Personality:** confident, optimistic, technical-but-human. Energetic without
  being loud.

---

## Content fundamentals

How Efeonce writes:

- **Voice:** confident and encouraging, never hype-y. We help teams *win*, framed
  around the customer's growth, not our features.
- **Person:** address the reader as **you / your** ("Empower **your** growth",
  "everything **your** team needs"). Efeonce refers to itself by name or "we" sparingly.
- **Tone:** plainspoken and active. Short, declarative sentences. Verbs lead
  ("Launch experiments", "Unify your data", "Start free").
- **Casing:** Sentence case for headings and UI labels (`Start free trial`, not
  `Start Free Trial`). The tagline is the one fixed exception ("Empower your Growth").
  UPPERCASE only for small eyebrows/overlines with wide tracking.
- **Numbers:** concrete and rounded for proof ("+38.2%", "4,000+ growth teams",
  "60+ integrations"). Don't manufacture stats — use real ones or omit.
- **Emoji:** not used in product or marketing surfaces.
- **Punctuation:** em dashes for asides, no exclamation marks in body copy.
- **Examples:**
  - Hero: *"Empower your growth, end to end."*
  - Sub: *"Efeonce unifies your acquisition, activation and retention data into one
    workspace — so every team ships growth experiments with confidence."*
  - CTA: *"Ready to empower your growth?"* / button *"Start free trial"*.

---

## Visual foundations

**Color.** A four-step blue ramp (ink `#022a4e` → navy `#033c71` → deep `#034c8f`
→ bright `#0475db`) carries the brand; **bright blue is the primary action color**
and **ink navy** is the heading/inverse surface. Four accent hues — purple
`#623f93`, green `#6ec208`, magenta `#bb1953`, orange `#ff6501` — appear *sparingly*
for emphasis, illustration and feature differentiation (one accent per feature card,
never a rainbow in running UI). Neutrals are a cool slate ramp tuned toward the navy.
Semantic: success = green, warning = orange, danger = magenta, info = blue.

**Type.** **DM Sans** for titles/display (weights 600–700, tight tracking −0.02 to
−0.03em); **Inter** for body and UI (400–600, 1.5 line-height). Display runs large
and tight; body stays comfortable and readable. Eyebrows are 13px Inter 600,
uppercase, +0.04em, in primary blue.

**Spacing & layout.** 8-pt grid with 4px half-steps (`--space-*`). Generous section
padding (88px vertical on marketing). Content maxes around 1180px. Cards and grids
use `gap`, not margins.

**Radius.** Soft but not pill-y: controls use **12px** (`--radius-md`), cards **16px**
(`--radius-lg`), feature/CTA panels **24–32px**. Pills for badges/tags and avatars.

**Borders.** Confident **2px** borders on interactive controls (buttons, inputs,
checkboxes); hairline 1px for dividers and card outlines.

**Elevation.** Shadows are **navy-tinted** (built on `rgba(2,42,78,…)`, not neutral
black) so elevation feels native to the brand — soft, diffuse, cool. A dedicated
`--shadow-brand` blue glow is reserved for primary CTAs / featured cards.

**Backgrounds.** Predominantly clean white / faint slate. Brand moments use the deep
ink navy with a soft radial blue glow (hero wash, CTA band) — no heavy gradients, no
noise. Translucent blurred surfaces (`backdrop-filter`) for the sticky header only.

**Motion.** Quick and confident — 120–200ms, standard ease `cubic-bezier(0.2,0,0,1)`,
no bounce. Hovers: solids **darken**, soft/ghost variants gain a **tint**, cards
**lift −3px** with a larger shadow. Press/active deepens color (no shrink).

**Imagery vibe.** Cool, bright, optimistic — product UI, data viz, real people.
Avoid stocky warmth, grain, or moody dark photography.

---

## Iconography

- **System:** **Lucide** (geometric line icons, **2px stroke, rounded caps/joins**)
  — the closest open match to the friendly-geometric wordmark, and CDN-available.
  *No bespoke icon set shipped with the source, so Lucide is a documented substitution
  — see CAVEATS.*
- **In code:** a curated subset is inlined as exact Lucide paths in
  `ui_kits/marketing/icons.jsx` (exposed on `window.EfIcons`). For new work, pull
  more from `https://unpkg.com/lucide-static` or `lucide-react`, keeping stroke 2.
- **Sizing:** 18 (sm controls) / 20 (md) / 24 (lg & feature tiles). Icons inherit
  `currentColor`; tint feature icons with a single accent hue on a 12%-tinted square.
- **Unicode / emoji:** not used as icons anywhere.
- **The rocket glyph** from the logo is brand iconography — don't redraw it; use the
  supplied logo assets.

---

## Index / manifest

**Root**
- `styles.css` — global entry point (@import manifest only). Consumers link this.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `effects.css`,
  `fonts.css`, `base.css`.
- `assets/` — `logo.png` (navy/transparent), `logo-white.png` (reversed),
  `logo-light-bg.jpg` (original), `palette.jpg`.
- `SKILL.md` — Agent-Skills-compatible entry for downloadable use.

**Components** (`components/`, namespace `EfeonceDesignSystem_01d769`)
- `buttons/` — **Button**, **IconButton**
- `forms/` — **Input**, **Textarea**, **Select**, **Checkbox**, **Radio**, **Switch**
- `data/` — **Badge**, **Tag**, **Avatar**, **Card**
- `feedback/` — **Alert**, **Tooltip**, **Progress**
- `navigation/` — **Tabs**, **Accordion**, **Pagination**

**Foundation cards** (`guidelines/`) — Colors, Type, Spacing, Brand specimen cards
for the Design System tab.

**UI kits** (`ui_kits/`)
- `marketing/` — Efeonce marketing site (hero, features, pricing, CTA, footer);
  interactive landing → pricing view. Entry `ui_kits/marketing/index.html`.

---

## Using the system

Link the stylesheet and read components off the namespace:

```html
<link rel="stylesheet" href="styles.css" />
<script src="_ds_bundle.js"></script>
<script type="text/babel">
  const { Button, Card, Badge } = window.EfeonceDesignSystem_01d769;
</script>
```

Reference tokens by their semantic aliases (`var(--color-primary)`,
`var(--text-strong)`, `var(--surface-card)`, `var(--radius-md)`) rather than raw
scale values where possible. Dark mode: add `data-theme="dark"` (or `.dark`) on an
ancestor.

---

## Caveats & open items

1. **Inter not self-hosted.** DM Sans is self-hosted; Inter (body) still loads from
   Google Fonts. Upload Inter `.ttf`/`.woff2` files to self-host it too.
2. **Dark-background logo unusable.** The supplied `Logo_Fondo-oscuro.jpg` was a blank
   white export. The reversed logo (`assets/logo-white.png`) was derived from the
   light version instead — please confirm or send a proper transparent asset.
3. **Iconography is a substitution.** No icon set came with the source; Lucide was
   chosen to match the wordmark. Swap if Efeonce has an official set.
4. **One UI kit so far.** A marketing site is built. If Efeonce also has a product
   app / dashboard, share screens or Figma frames and I'll add that kit.
