# LAB Prints — AI Image Generation Batch

Runnable copy-paste prompts for the 7 image slots in `index-nike.html`.
Tested for **Higgsfield Plus** (primary) and **Seedream 4.0** / **Midjourney** as
fallbacks.

**Variety rule:** every slot showcases a **different** print motif so the site
reads as a portfolio reel, not the same shirt seven times. Across the page the
viewer sees streetwear, sports, slogan typography, sheet-of-many, workwear,
photographic gradient, and band-merch — implicitly proving LAB serves every
customer segment.

**Aesthetic glue (kept identical across all 7 slots):**
- Matte black, charcoal, or raw concrete backgrounds
- Single-source low-key key light, deep shadow falloff
- 35mm or 50–100mm macro lens feel
- No fashion-soft filters, no HDR, no oversaturation
- Sharp focus on the print, premium campaign style

**Generation order (by impact):** 1 → 4 → 6 → 2 → 5 → 7 → 3.

**Global negative prompt** (paste into negatives on every gen):
```
text labels, watermark, signature, lowres, blurry, oversaturated, hdr, cartoon,
illustration of the shirt, mockup template, plastic skin, fashion soft filter,
instagram filter, fish-eye, warped perspective, white seamless background,
floating shirt, e-commerce flat-lay
```

---

## #1 — HERO (streetwear photoreal print, 16:9)

**Slot:** opens the page. Headline sits over the bottom-left.
**Aspect:** 16:9 · **Resolution:** 1920×1080+ · **Higgsfield model:** Soul
**Print motif:** large photoreal-style streetwear graphic — abstract mountain
landscape or rolling wave illustration in moody colors (deep navy, rust orange,
bone white).

**Prompt:**
```
Cinematic studio photograph of a stack of freshly printed t-shirts on a matte
black surface, low three-quarter camera angle, top tee is a heather-grey cotton
shirt featuring a large photoreal-style printed graphic of a moody mountain
landscape at dusk in deep navy, rust orange, and bone white tones, three more
tees fanned beneath in solid colors (forest green, charcoal, off-white) with no
visible prints showing, single-source soft key light from camera-left, deep
falloff into shadow on the right, premium streetwear apparel campaign aesthetic,
35mm lens, shallow but not blurry depth of field, dark moody atmosphere, lots
of negative space in the lower-left quadrant for typography overlay, rich
blacks, sharp focus on the top tee print
```

---

## #2 — DTF TRANSFERS card (typographic slogan, 4:5)

**Slot:** product card #1.
**Aspect:** 4:5 · **Resolution:** 800×1000+ · **Higgsfield model:** Soul
**Print motif:** bold typographic lockup — a stencilled all-caps phrase like
"RUN THE BLOCK" or "TEAM ALPHA" in a single accent color (electric red or hi-vis
yellow), 1-color print only.

**Prompt:**
```
Macro studio photograph of a translucent DTF transfer film sheet held vertically
against a deep charcoal backdrop, the film carries a bold single-color
stencilled all-caps typographic lockup in vivid electric red, the lettering is
condensed and industrial like a stencil sprayed on a shipping crate, soft
directional light from above-right revealing the film texture and the printed
ink layer, premium product shot, 50mm lens, razor-sharp detail on the printed
typography, dark moody atmosphere, professional product photography
```

---

## #3 — GANG SHEETS card (sheet-of-many, 4:5)

**Slot:** product card #2 (the inverted black card).
**Aspect:** 4:5 · **Resolution:** 800×1000+ · **Higgsfield model:** Soul
**Print motif:** the whole point — many distinct designs on one sheet.
Variety is the subject.

**Prompt:**
```
Top-down studio photograph of a full A3 DTF gang sheet completely covered in
dozens of distinct printed designs of varying sizes and colors — including a
vintage circular sports crest, a bold uppercase wordmark, a small floral
illustration, an abstract geometric logo, a numbered jersey graphic, a
hand-drawn cartoon character, a minimalist mountain icon, and several text-only
slogans — arranged tightly to maximize sheet usage, placed on a matte black
surface, soft even overhead lighting with subtle shadow falloff at the sheet
edges, sharp detail across the full sheet, premium product photography, no
glare on the film, dark moody background
```

---

## #4 — CUSTOM GARMENTS stack (sports/team, 4:5)

**Slot:** product card #3.
**Aspect:** 4:5 · **Resolution:** 800×1000+ · **Higgsfield model:** Soul
**Print motif:** sports team identity. Top tee carries a circular embroidered-
style team crest. Hoodie underneath shows a large jersey-style number.

**Prompt:**
```
Studio photograph of a neatly folded stack of finished printed apparel on a
matte black surface, top item is a black cotton t-shirt with a vintage-style
circular sports team crest printed centered on the chest in cream, gold, and
deep maroon — the crest features lettering around the perimeter and a stylised
mascot in the middle, charcoal hoodie folded underneath showing a large
two-digit jersey number printed in bone-white on its chest, printed cap
balanced on top with a small embroidered-look monogram, low-key key light from
the left, premium e-commerce product photography, 35mm lens, sharp focus on
the top tee crest, dark moody atmosphere with rich blacks
```

---

## #5 — ATELIER / DTF PRESS (workwear motif, 4:5)

**Slot:** "Why LAB Prints" left side.
**Aspect:** 4:5 · **Resolution:** 800×1000+ · **Higgsfield model:** Soul
**Print motif:** the film going through the printer carries a clean
**workwear / trades** logo — a wordmark plus simple icon — in a single hi-vis
or corporate color.

**Prompt:**
```
Cinematic photograph of a DTF garment printer mid-print, print head moving
across a translucent film sheet that carries a clean workwear logo — a bold
sans-serif company wordmark beside a simple geometric icon (wrench, hard hat
silhouette, or shield) — printing in a single hi-vis safety yellow ink, the
print head is sharp and ink is visible mid-application, shallow depth of field
with the print head and logo in focus, dark industrial atelier environment
with overhead industrial lighting and soft falloff, professional documentary
photography, 50mm lens, premium craft and manufacturing aesthetic, moody
atmosphere, vertical composition
```

---

## #6 — DTF PRINT CLOSE-UP (photographic gradient print, 4:5)

**Slot:** "What is DTF?" right side.
**Aspect:** 4:5 · **Resolution:** 800×1000+ · **Higgsfield model:** Soul
**Print motif:** photoreal gradient print — proves DTF handles gradients and
fine detail. Subject: a sunset gradient or close-up of a botanical illustration
with smooth color blending.

**Prompt:**
```
Macro photograph of a vibrant photoreal sunset gradient print bonded into the
cotton weave of a folded black t-shirt, extreme close-up showing smooth color
transitions from deep magenta through orange into golden yellow with fine
detail in the gradient banding, the print edge transitions visibly into the
fabric texture at the bottom of the frame, soft directional lighting from
camera-left to reveal the bonded ink layer and the soft fabric hand, 100mm
macro lens, razor-sharp focus on the ink-fabric transition and the gradient
detail, premium technical product photography, dark moody background
```

---

## #7 — CTA BANNER (band-merch / poster art, 16:9, scrim 0.45)

**Slot:** pre-footer banner. **CSS sets opacity to 0.45**, so pick high-contrast
subjects.
**Aspect:** 16:9 · **Resolution:** 1920×1080+ · **Higgsfield model:** Soul
**Print motif:** band-merch style oversized graphic — vintage poster
illustration aesthetic, single off-white ink on dark tee. Different from the
streetwear hero (#1), the sports stack (#4), and everything else.

**Prompt:**
```
Atmospheric cinematic photograph of a person wearing a printed black oversized
t-shirt in low-key studio lighting, face cropped above the chest line, strong
rim light on the shoulder silhouette, large vintage band-merch style graphic
printed centered on the chest in a single bone-white ink — the graphic is an
illustrated skull with rays radiating outward in the style of a 70s rock
poster, dark moody atmosphere with deep blacks and high contrast, premium
streetwear campaign style, 35mm lens, sharp focus on the printed graphic,
shallow depth, no facial features visible
```

---

## Quick reference — what each slot is "saying"

| Slot | Print motif | Customer segment implied |
|------|-------------|--------------------------|
| 1 Hero | Photoreal landscape illustration | Premium streetwear brand |
| 2 Transfer | Stencilled typographic slogan | Event / casual merch |
| 3 Gang sheet | 8+ distinct mini-designs | "Try us with anything" |
| 4 Garments | Vintage team crest + jersey number | Sports teams, schools |
| 5 Atelier | Hi-vis workwear logo | Trades businesses |
| 6 Close-up | Photoreal gradient | "We do photographic detail" |
| 7 CTA | Vintage band-merch skull | Bands, music, poster-art creators |

That's seven different customer stories told through seven photos. None of them
shares a graphic with another.

---

## Post-gen workflow

1. 3-4 variants per slot → 28 total gens.
2. Upscale winners 2× via Higgsfield's upscaler.
3. Optimise to web sizes:
   ```bash
   cd "/Users/victorypeni/Desktop/The Victory Co. Limited/Onyx Studio - Website Build Agency/Client Sites/LAB Prints"
   mkdir -p assets/img
   sips -Z 1920 -s format jpeg -s formatOptions 80 ~/Downloads/hero-final.png --out assets/img/hero.jpg
   sips -Z 1000 -s format jpeg -s formatOptions 80 ~/Downloads/transfers-final.png --out assets/img/dtf-transfers.jpg
   sips -Z 1000 -s format jpeg -s formatOptions 80 ~/Downloads/gang-final.png --out assets/img/gang-sheets.jpg
   sips -Z 1000 -s format jpeg -s formatOptions 80 ~/Downloads/garments-final.png --out assets/img/custom-garments.jpg
   sips -Z 1000 -s format jpeg -s formatOptions 80 ~/Downloads/atelier-final.png --out assets/img/atelier.jpg
   sips -Z 1000 -s format jpeg -s formatOptions 80 ~/Downloads/closeup-final.png --out assets/img/print-closeup.jpg
   sips -Z 1920 -s format jpeg -s formatOptions 80 ~/Downloads/cta-final.png --out assets/img/cta.jpg
   ```
4. Replace each `placehold.co` URL in `index-nike.html` with the new asset path.
5. QA in browser — inspect both scrim sections (hero + CTA) so the typography
   sits over a dark area, not an already-bright spot in the image.

## Budget guide

- 28 gens at Higgsfield Plus: comfortably inside one billing cycle if you
  reserve quota from Aria/Mira pipelines.
- Seedream 4.0 produces near-identical photoreal results for these scenes —
  paste the prompts verbatim if Higgsfield runs dry.

---

**Brief filed:** 2026-04-29.
