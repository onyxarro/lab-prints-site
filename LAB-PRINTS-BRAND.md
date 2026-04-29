# LAB Prints — Brand System

**Status:** active brand, locked 2026-04-29.
**Aesthetic lineage:** monochrome editorial, Nike-derived.
**Use this file** as the binding visual contract for any LAB Prints website,
deck, social asset, packaging, or print collateral. Supersedes all earlier LAB
Prints visual systems (the dark-gradient v2 from April 2026 is retired).

This file is LAB-specific. The Nike-inspired source it derives from is preserved
at `DESIGN.md` for reference.

---

## 1. Brand idea

LAB Prints is a print laboratory — a working studio that turns ideas into
wearable garments fast, with no minimums. The brand should read like an athletic
gear retailer crossed with a photo darkroom: confident, monochrome, photography-
driven. Color belongs on the printed garment, never on the interface.

**Voice:** direct, technical, confident. No marketing fluff. Short sentences.
Numbers over adjectives ("24-hour turnaround" not "blazing-fast").
**Audience:** sports teams, schools, merch brand owners, trades businesses,
streetwear builders. People who order again and again.
**Promise:** custom prints, no limits, no minimums, fast.

---

## 2. Color

Monochrome only. Color enters the frame exclusively through printed-garment
photography or printed product graphics — never through UI, type, gradients, or
illustration.

| Token | Hex | Use |
|-------|-----|-----|
| LAB Black | `#111111` | Primary text, button fills, dark surfaces. Never `#000000`. |
| LAB White | `#FFFFFF` | Page canvas, button text on dark. |
| Snow | `#FAFAFA` | Lightest section background, card surfaces. |
| Light Grey | `#F5F5F5` | Input fills, image placeholders, secondary surface. |
| Hover Grey | `#E5E5E5` | Hover states, disabled buttons. |
| Border | `#CACACB` | Input borders, dividers. |
| Muted Text | `#707072` | Secondary copy, captions, metadata. |
| Charcoal | `#28282A` | Dark inverse surface (rare). |
| Deep | `#1F1F21` | Primary inverse background (footer, banners). |

**Semantic accents** — only for functional UI states, never decorative:
- Error: `#D30005`
- Success: `#007D48`
- Link: `#1151FF`
- Focus ring: `rgba(39, 93, 197, 1)` 2px

**Banned:** the legacy LAB blue/purple/pink gradient is retired. Do not
reintroduce it in any digital surface. It may still appear inside a printed
garment in photography (because that's a real product), but never in CSS.

---

## 3. Typography

| Role | Family | Weight | Size | Line | Notes |
|------|--------|--------|------|------|-------|
| Display | Bebas Neue | 400 | 64–128px clamp | 0.90 | Uppercase, hero + section titles only |
| H1 | Inter Tight | 500 | 32px | 1.20 | Sub-section headings |
| H2 | Inter Tight | 500 | 24px | 1.20 | Card titles |
| H3 | Inter Tight | 500 | 16px | 1.50 | Item labels |
| Body | Inter Tight | 500 | 16px | 1.50–1.75 | All standard prose, **always weight 500** |
| Caption | Inter Tight | 500 | 14px | 1.50 | Prices, metadata |
| Eyebrow | Inter Tight | 500 | 12px | 1.50 | Uppercase, letter-spacing 0.04em |

**Rules:**
- Bebas Neue is **display-only**. Never below 24px.
- Bebas Neue is **always uppercase**.
- Inter Tight body is **always weight 500** for interactive text. 400 only for
  legal / footnote text.
- No drop shadows on type. No gradient fill on type. No outline strokes.
- Tracking: default. Don't add letter-spacing to body. Eyebrows get 0.04em.

**Free fonts (production stack):**
- Display: `Bebas Neue` (Google Fonts) — substitute for Nike Futura ND
- Body: `Inter Tight` (Google Fonts) — substitute for Helvetica Now

---

## 4. Components

### Buttons (pills, 30px radius)
- **Primary on light:** `#111111` fill / white text. Hover: `#707072`.
- **Primary on dark:** white fill / `#111111` text. Hover: `#CACACB`.
- **Secondary on light:** transparent / 1.5px `#CACACB` border / `#111111` text. Hover: border `#707072`, fill `#E5E5E5`.
- **Secondary on dark:** transparent / 1.5px `rgba(255,255,255,.4)` border / white text.
- Padding: 12px 24px (size-md), 8px 18px (size-sm), 16px 28px (size-lg).
- Always weight 500. Always 30px radius. No shadows.
- Focus state: 2px box-shadow ring `rgba(39, 93, 197, 1)`.

### Cards
- Background `#FFFFFF` or `#FAFAFA`. No shadows.
- Border `1px solid #E5E5E5` for interactive cards. Borderless for product image cards.
- Radius **0px** for image-led cards (full-bleed photography). **20px** for content/UI cards (pricing, testimonial).
- No hover lift. Hover treatment is a 2% image scale or an opacity shift on swap-image only.

### Inputs
- Fill `#FFFFFF`. Border 1px `#CACACB`. Radius 8px (form), 24px (search).
- Focus: border `#111111`, box-shadow ring `rgba(39, 93, 197, 1)` 2px.
- Padding 14px 16px. Inter Tight 500 16px text.
- Placeholder `#707072`.

### Promo banner
- Full-width `#111111` strip with white 12px/500 letter-spaced 0.04em text.
- 8–10px vertical padding. Top of page.
- Used for shipping promos, turnaround callouts, sale flags.

---

## 5. Layout

- Spacing scale (8px grid): 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 80 / 96.
- Section padding: 80px desktop / 48px tablet / 48px mobile.
- Container max width: 1440px. Outer padding 48 / 24 / 16.
- Product / category image grids: tight gaps (4–12px) for the dense Nike feel.
- Pricing / content card grids: standard 24–32px gaps.
- Border radii: 0px (imagery) · 8px (forms) · 20px (content cards) · 30px (buttons) · 50% (avatars/icon buttons).

---

## 6. Depth

Flat. No card shadows, no hover lifts, no floating elements anywhere on the
site. Depth is communicated through:
- Color shifts (dark sections recede, light sections advance)
- Grey scale state changes (`#F5F5F5` → `#E5E5E5` → `#CACACB` → `#707072`)
- A single 1px inset divider between sections when needed
- Focus rings (accessibility-required only)

The only "shadow" allowed is the 2px focus ring.

---

## 7. Photography

Photography carries 60% of the brand's emotional load. UI without strong
photography reads as empty white space.

**Required style across all LAB photography:**
- High contrast, low key, single-source key light
- Matte black, charcoal, or raw concrete backgrounds (no white seamless)
- Color comes from printed garment and ink only
- Cinematic 35mm or macro 50–100mm lens feel — never wide-angle distortion
- No fashion-soft filters, no Instagram presets, no oversaturation, no HDR

**Required slot types:**
- Hero: 1920×1080, full-bleed, with safe area for typography over a dark scrim
- Category card: 800×1000 (4:5), product-led, vertical
- Editorial split: 800×1000 (4:5), atelier or close-up
- CTA banner: 1920×1080, full-bleed, opacity 0.45 over black — pick high-contrast subjects only

**Banned in LAB photography:**
- Stock-art people in lifestyle poses
- Mockup-generator flat tee renders
- Studio cyclorama white-seamless shots (reads e-commerce-template, not premium)
- Color gradients in the background
- Floating product on white

See `IMAGES-NEEDED.md` for the website's specific shot list and `IMAGES-BATCH.md`
for the runnable AI prompts.

---

## 8. Logo

The LAB Prints logo should:
- Read on both white and `#111111` backgrounds at 24px height (nav size)
- Have a single-color version (black on light, white on dark) — no two-color logos
- Drop the legacy gradient mark entirely

See `LOGO-PROMPTS.md` for active regeneration directions.

---

## 9. Voice / copy

| Do | Don't |
|----|-------|
| "24-hour turnaround" | "Lightning-fast turnaround" |
| "No minimums" | "Order one or a thousand — we don't mind!" |
| "From $2.50 per transfer" | "Affordable transfers starting at just $2.50" |
| "We print and ship NZ-wide" | "We've got you covered across Aotearoa" |
| Sentences ≤ 18 words | Run-on marketing-speak |

Use uppercase only for: Bebas Neue display headlines, eyebrows, the promo banner,
and button labels (lowercase for buttons too is acceptable — just be consistent).

---

## 10. Do's & Don'ts

### Do
- Use `#111111` for all primary text — never pure black
- Keep buttons pill-shaped (30px) and limited to two variants
- Use full-bleed photography with **no border radius** on images
- Let printed-garment color be the only color source on the page
- Use Bebas Neue uppercase ONLY for display headlines (24px+)
- Maintain tight 4–12px product-grid gaps for density
- Reserve color for semantic UI meaning (red=error, green=success, blue=link)

### Don't
- Don't reintroduce the legacy blue/purple/pink gradient anywhere in UI
- Don't add card shadows or hover lifts
- Don't use border radius on product imagery
- Don't mix Bebas Neue below 24px or in non-uppercase
- Don't use Inter Tight regular (400) for buttons or links — always 500
- Don't soften the contrast — push black-on-white to maximum

---

## 11. File structure (recommended)

```
LAB Prints/
├── DESIGN.md                      # Nike source spec (reference only)
├── LAB-PRINTS-BRAND.md            # this file — official LAB brand system
├── IMAGES-NEEDED.md               # site-wide shot list
├── IMAGES-BATCH.md                # runnable AI image prompts for current site
├── ORDER-PHOTOS-REGEN.md          # img2img workflow for existing order photos
├── LOGO-PROMPTS.md                # logo regeneration prompt set
├── index.html                     # legacy v2 (dark gradient — retired)
├── index-nike.html                # active rebuild
└── assets/
    ├── img/                       # production photos (hero, category, editorial)
    ├── order-photos/
    │   ├── originals/             # raw real-order photos
    │   └── regenerated/           # AI-upgraded versions
    └── logo/                      # active + variant logos
```

---

**Updated:** 2026-04-29. Owner: Victory Peni. Implementation reference: `index-nike.html`.
