# LAB Prints — Logo Regeneration Prompts

Six directional prompts for generating new LAB Prints logo concepts that match
the rebranded monochrome editorial aesthetic. Run all six, pick the strongest
2-3, then refine.

**Important — AI logos are concepts, not finished marks.** Use AI gens to
explore directions and pick a winner, then either:
- Hand-redraw it as a vector in Figma / Illustrator (preferred for production), OR
- Pay an illustrator $200-400 to vectorise the chosen concept cleanly.

AI rasters won't scale crisply on packaging, embroidery, or signage. Vector is
non-negotiable for a real brand mark.

---

## Brand requirements (apply to every direction)

- Single-color only — must work as pure black on white AND pure white on black
- Must read at 24px height (the size in the website nav)
- No gradients, no two-tone, no soft shadows, no glow
- Must clearly say "LAB" or "LAB PRINTS" — not abstract beyond recognition
- Should evoke at least one of: print precision, photo lab, atelier craft,
  athletic confidence

---

## Tools

- **Higgsfield Plus** with **Logo / Vector** style preset — primary
- **Midjourney** with `--style raw --no color` — clean black-on-white outputs
- **Recraft.ai** — purpose-built for logos, exports SVG (if you can stomach
  the credit cost it's the best AI-to-vector path)
- **Ideogram** — best at generating readable text inside logos

For all gens, set aspect to **1:1** (square) for marks, **3:1** (wide) for
horizontal wordmarks.

**Global negative prompt:**
```
gradient, soft shadow, glow, multi-color, photoreal, 3d render, lifestyle
photo, mockup, watermark, low contrast, illegible text, grunge texture
```

---

## Direction 1 — Bold condensed wordmark

**Vibe:** the brand name *is* the logo. Bebas Neue territory but tighter.
Reads athletic-retail, confident.

**Prompt:**
```
Minimalist logo design, the words LAB PRINTS in a single confident line, set in
an extra-condensed all-uppercase sans-serif typeface with tight tracking, pure
solid black on a flat white background, geometric and slightly compressed
letterforms inspired by industrial signage and athletic wear branding, no
decoration, no icon, no shadow, vector-style flat design, sharp clean edges,
3:1 horizontal aspect ratio
```

Variation: drop "PRINTS" entirely and just use **LAB** at 4× the weight as a
square mark. Square aspect 1:1. Add: "single bold LAB monogram in extra-
condensed black sans-serif, square crop, takes up 80% of the frame".

---

## Direction 2 — Photo-lab darkroom monogram

**Vibe:** "LAB" as in laboratory and photographic lab. Square mark like a film
canister or contact-sheet square. Hyper-relevant to DTF (which is film-based).

**Prompt:**
```
Minimalist logo mark for a print laboratory, a perfect black square or rounded
square containing the white uppercase letters LP set in a geometric sans-serif
typeface, the square evokes a 35mm film canister end-cap or a contact sheet
frame, pure flat black and white, no gradients, no decoration, vector-style
flat design, sharp clean edges, 1:1 aspect ratio, single bold mark on a flat
white background
```

Variation: replace "LP" with "LAB" inside the square. Add a tiny film-sprocket
notch on the square's left edge for darkroom flavor.

---

## Direction 3 — Film-strip mark

**Vibe:** literal film strip with LAB punched into one of the frames. Loud
visual hook, immediately readable as photographic.

**Prompt:**
```
Minimalist logo of a horizontal 35mm film strip with three frames visible,
sprocket holes punched along the top and bottom edges, the centre frame
contains the bold uppercase letters LAB in a condensed sans-serif typeface in
white reversed out of solid black, the outer two frames are solid black, pure
flat black and white, no gradients, no shadows, vector-style flat design, sharp
clean edges, 4:1 horizontal aspect ratio, single mark on flat white background
```

Variation: stack two frames vertically (1:1.5 aspect) — top frame says "LAB",
bottom frame says "PRINTS". Reads like a wordmark with a structural hook.

---

## Direction 4 — Stencil industrial print-shop

**Vibe:** spray-stencilled crate / shipping pallet / print-shop authenticity.
Connects to the typographic slogan motif in the IMAGES-BATCH gen #2.

**Prompt:**
```
Industrial stencil-style logo for a print shop, the words LAB PRINTS set in a
heavy military-stencil all-uppercase typeface with the characteristic gaps in
each letter where the stencil bridges would be, pure solid black on a flat
white background, no spray-paint texture, no grunge, just clean stencil
letterforms, vector-style flat design, sharp clean edges, 3:1 horizontal aspect
ratio
```

Variation: add a horizontal rule above and below the wordmark with thick black
bars, like a shipping-crate label. Keeps the industrial vibe without grunge.

---

## Direction 5 — Single-letter geometric monogram

**Vibe:** ultra-minimal. A single beautifully drawn "L" that becomes a
recognizable mark on its own. Highest brand-equity ceiling but takes longest to
land — needs the typography to be perfect.

**Prompt:**
```
Minimalist single-letter logo mark, the uppercase letter L drawn as a
geometric form with extra weight on the vertical stem and a precise right-angle
foot, the letterform is bold and confident, pure solid black on a flat white
background, geometric construction visible in the proportions, no decoration,
no serifs, no shadows, vector-style flat design, sharp clean edges, 1:1 aspect
ratio, takes up 70% of the frame
```

Variation: integrate a small subtle right-angle notch or square in the foot of
the L to make it distinct from any other L mark. Or pair the L with a small
square dot above the cap line, like the dot of a lowercase i — nodding to
"LAB" without spelling it.

---

## Direction 6 — Halftone dot wordmark

**Vibe:** every printer knows halftone dots. Reference the print process inside
the logo itself. Subtle, technical, on-brand for a print laboratory.

**Prompt:**
```
Minimalist logo design, the words LAB PRINTS set in a bold uppercase
sans-serif typeface, where the letterforms are constructed entirely from a
dense halftone dot pattern of varying dot sizes — denser dots toward the centre
of each letter, sparser dots toward the edges — creating the impression of the
letterforms being printed via a halftone screen, pure solid black dots on a
flat white background, no gradients in the dots themselves, vector-style flat
design, sharp clean edges, 3:1 horizontal aspect ratio
```

Variation: keep the wordmark fully solid but **add a small halftone-dot square**
to the right of the wordmark as an icon — a 1:1 grid of black dots that
gradually thin out across the square, evoking a print test swatch.

---

## Recommendation

Run all six in parallel (4 gens each = 24 total) for a vibe board. The two most
likely to win for a DTF print business are:

- **Direction 1 (bold condensed wordmark)** — safest, fastest path to a clean
  brand. Pairs with Bebas Neue display type on the website so the logo and
  the display headlines feel like one system.
- **Direction 2 (photo-lab monogram)** — strongest narrative hook. Says "lab"
  visually and ties to the photographic brand aesthetic better than any other
  direction.

If you want a wordmark + icon combo (most flexible for nav, business cards,
favicons, embroidery), pick Direction 1 wordmark + Direction 5 single-letter L
as the icon. They're built from the same letterform DNA.

---

## Post-pick workflow

1. Generate 4 variants per direction.
2. Save winners into `assets/logo/concepts/` for review.
3. Pick the strongest 1-2.
4. **Vectorise** — either redraw in Figma using the AI as reference, or hand
   off to an illustrator. Recraft can export SVG directly if you want to
   shortcut.
5. Test at: 24px (nav), 48px (footer), 200px (about page), 800px (deck cover),
   embroidered 60mm chest patch.
6. Save final lockups as:
   ```
   assets/logo/lab-prints-wordmark-black.svg
   assets/logo/lab-prints-wordmark-white.svg
   assets/logo/lab-prints-mark-black.svg
   assets/logo/lab-prints-mark-white.svg
   assets/logo/favicon.svg
   ```
7. Drop the new logo into `index-nike.html` nav by replacing the current
   `<img src="https://labprints.co.nz/cdn/shop/files/LAB_LOGO_2025_Logo.png?...">`
   with the new SVG path.

---

**Brief filed:** 2026-04-29.
