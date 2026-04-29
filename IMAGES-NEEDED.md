# LAB Prints — Image Brief (Nike-style relaunch)

**Aesthetic guardrails (per Nike DESIGN.md):**
- All imagery is high-contrast, photographic, full-bleed, **no border radius**.
- Color in the image is welcome (printed garments are the color story). UI stays monochrome.
- Studio lighting, cinematic, athletic confidence — no fashion-soft lifestyle filters.
- People should feel kinetic / mid-action where applicable, not posed.
- Backgrounds: matte black, charcoal, deep grey, or raw concrete. Avoid white seamless.

**Spec for all photos:**
- Format: `.jpg` or `.webp`, sRGB, 80% quality.
- Optimise via `sips` or `cwebp` before drop-in.
- Save into `assets/img/` next to `index-nike.html` and update each `<img src="...">`.

---

## Slot 1 — HERO (full-bleed background)
**Where:** opens the page behind "Custom prints. No limits." headline.
**Dimensions:** **1920 × 1080** (also export 2880 × 1620 for retina).
**Crop:** wide / cinematic, with safe area on bottom-left for headline + sub + buttons.
**Subject:** stack of freshly printed tees in mixed colors (one black hero tee on top, other colors fanned beneath), shot from a low 3/4 angle on a matte-black surface. Or: hands lifting a printed transfer off the DTF film mid-peel, motion-blur on the peel, colored ink sharp on the film.
**Mood:** quiet, premium, confident. The dark gradient scrim in CSS will cover the bottom — make sure top half of frame has visual interest.
**Current placeholder URL to replace:** `placehold.co/1920x1080/111111/FFFFFF.png?text=HERO+%E2%80%94+STACKED+PRINTED+TEES`

---

## Slot 2 — DTF TRANSFERS (category card, 1 of 3)
**Where:** first card under "DTF transfers & custom garments."
**Dimensions:** **800 × 1000** (4:5 portrait).
**Crop:** product-led, vertical.
**Subject:** a single DTF transfer film sheet held vertically against a charcoal backdrop, full-color graphic visible on the film. Or: a hand peeling a transfer off a folded tee.
**Mood:** product hero, no people necessary.
**Replace:** `placehold.co/800x1000/111111/FFFFFF.png?text=DTF+TRANSFERS`

---

## Slot 3 — GANG SHEETS (category card, 2 of 3)
**Where:** middle card.
**Dimensions:** **800 × 1000**.
**Crop:** top-down or 3/4 angle of a full A3 gang sheet covered in mixed designs (logos, slogans, illustrations of varied sizes).
**Subject:** the sheet itself, edges sharp, on a black or concrete surface. A cropped detail shot also works — the goal is to show "many designs, one sheet."
**Mood:** abundance, value, density.
**Replace:** `placehold.co/800x1000/111111/FFFFFF.png?text=GANG+SHEETS`

---

## Slot 4 — CUSTOM GARMENTS (category card, 3 of 3)
**Where:** third card.
**Dimensions:** **800 × 1000**.
**Crop:** vertical.
**Subject:** a stack of 3-4 finished printed garments — printed black tee on top, printed hoodie underneath, printed cap on top of stack — folded crisply on a matte black surface. Alternative: a single garment on a hanger against a charcoal wall, showing the full print clearly.
**Mood:** finished, ready-to-ship, premium.
**Replace:** `placehold.co/800x1000/111111/FFFFFF.png?text=CUSTOM+GARMENTS`

---

## Slot 5 — ATELIER / DTF PRESS (Why Us split)
**Where:** left of "Built for businesses that move fast."
**Dimensions:** **800 × 1000**.
**Crop:** vertical, working environment.
**Subject:** the LAB Prints DTF printer in action — head moving across a sheet, ink visible, slightly shallow depth of field. Or: hands at a heat press locking down a transfer onto a tee, steam visible.
**Mood:** craft, precision, in-motion.
**Replace:** `placehold.co/800x1000/111111/FFFFFF.png?text=ATELIER+%E2%80%94+DTF+PRESS`

---

## Slot 6 — DTF PRINT CLOSE-UP (DTF Explainer split)
**Where:** right of "The print tech that does it all."
**Dimensions:** **800 × 1000**.
**Crop:** macro / extreme close-up.
**Subject:** macro of a finished DTF print on garment fabric showing fine ink detail, colour vibrancy, and soft fabric texture in the same frame. Show the print bonded into the weave.
**Mood:** technical, proof of quality.
**Replace:** `placehold.co/800x1000/111111/FFFFFF.png?text=PRINT+CLOSE-UP`

---

## Slot 7 — BIG CTA (full-bleed banner)
**Where:** behind "Get your quote in minutes." pre-footer banner.
**Dimensions:** **1920 × 1080**.
**Crop:** wide cinematic, with safe centre area for headline + buttons.
**Subject:** moody close-up of a printed tee being pressed, OR a model wearing a printed garment in low-key studio lighting (face cropped, focus on the print). The CSS sets opacity to 0.45 so the image sits behind black — pick something with strong silhouette/contrast.
**Mood:** atmospheric, low-key, brand-y.
**Replace:** `placehold.co/1920x1080/111111/FFFFFF.png?text=CTA+%E2%80%94+CUSTOM+TEE+CLOSE-UP`

---

## Optional / nice-to-have (not in current build)

- **Step icons / step photos** — small 400×400 photos for each How-It-Works step (upload screen, product selection, press machine, finished tee). The current build uses big numbered type instead, which works without photos. Add later if photos are strong.
- **Logo strip** — actual sports team / school / business logos for the trust strip, replacing the current INFO-NUM strip. Requires permission from each partner.

---

## Quick AI-image prompt seeds (if generating)

Drop these into Higgsfield / Midjourney / Seedream:

- **Hero:** `Cinematic studio photograph of a stack of freshly printed t-shirts on a matte black surface, low three-quarter angle, top tee is black with a vibrant printed graphic, mixed colors visible underneath, soft single-source key light from left, deep shadow, premium apparel campaign style, sharp focus, 35mm, dark moody atmosphere, no text overlay, leaving negative space in the lower left for typography`
- **DTF transfer:** `Macro studio photograph of a translucent DTF transfer film sheet held vertically against a charcoal background, full color printed graphic visible on the film, soft directional light revealing the film texture, premium product shot, 50mm, sharp detail, dark mood`
- **Gang sheet:** `Top-down studio photograph of an A3 DTF gang sheet covered in dozens of mixed printed designs — logos, slogans, illustrations in various sizes — on a matte black surface, soft overhead light, sharp detail, premium product photography, no text overlay`
- **Custom garments stack:** `Studio photograph of a neatly folded stack of printed apparel — black t-shirt on top with vibrant printed graphic, charcoal hoodie underneath, printed cap on top — on a matte black surface, low key lighting, premium e-commerce product shot, 35mm, sharp focus`
- **Atelier:** `Cinematic photograph of a DTF garment printer in action, print head moving across a film sheet, ink visible, shallow depth of field, dark atelier with industrial lighting, professional craft setting, premium documentary style, no text`
- **Print close-up:** `Macro photograph of a vibrant DTF print on cotton t-shirt fabric showing fine ink detail and soft fabric weave, extreme close-up, soft directional lighting, premium product photography, sharp focus on the bonded ink, 100mm macro lens`
- **CTA banner:** `Atmospheric cinematic photograph of a person wearing a printed t-shirt in low-key studio lighting, face cropped, strong silhouette and high contrast, focus on the printed graphic, dark moody atmosphere, premium streetwear campaign style`

---

## Drop-in workflow

1. Generate or shoot all 7 slots.
2. Optimise: `sips -Z 1920 -s format jpeg -s formatOptions 80 input.png --out output.jpg`
3. Save as `assets/img/hero.jpg`, `assets/img/dtf-transfers.jpg`, etc.
4. Update each `<img src="https://placehold.co/...">` in `index-nike.html` to point at the new file.
5. Open `index-nike.html` locally to QA — Nike aesthetic only works when photography lands.
6. When happy, rename current `index.html` → `index-v2.html` and `index-nike.html` → `index.html`, commit, deploy.
