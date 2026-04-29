# LAB Prints — Order Photo Regeneration (img2img)

Workflow for taking real photos of completed LAB Prints orders and regenerating
them in the new monochrome editorial brand style. Output is portfolio-grade
imagery for the website's product cards, social posts, and case studies.

This is **image-to-image** with style guidance — the original print and garment
stay recognisable, but the lighting, background, and styling are upgraded to
match `LAB-PRINTS-BRAND.md`.

---

## When to use this

- You have a real customer-order photo (printed tee, hoodie, cap) shot in a
  cluttered studio, on a person, or under poor light.
- You want to use it on the website / Instagram / portfolio.
- You can't legally show the customer's face or context (privacy).
- You want the output to feel like the rest of the LAB Prints brand reel.

**Don't use** for the website's primary slots (hero, category cards, CTA banner) —
those slots need original generated photos via `IMAGES-BATCH.md`. Order regens
are best as supporting / portfolio imagery.

---

## Tool stack (in order of preference)

### 1. Higgsfield Plus — Soul Style Transfer
Best for full restyling of an existing photo. Upload the original, paste the
master prompt below, set strength to 0.55–0.70 (lower = preserves more of the
original; higher = more aggressive restyling). Iterate strength until the print
stays sharp but the background, lighting, and crop change.

### 2. Flux Kontext (via Replicate or fal.ai)
Best for **surgical edits** — "change the background to matte black", "relight
this from the left", "remove the cluttered desk". Paste the original + a short
instruction. Cheap, fast, very precise.

### 3. Seedream 4.0
Use the reference-image input. Paste the master prompt verbatim. Good fallback
for whole-image regeneration.

### 4. Midjourney (`--cref` + `--sref`)
Use `--cref <original>` to lock the print + garment, `--sref <hero photo>` to
lock the lighting style. Less reliable for products than Higgsfield, but cheap
to test.

---

## Master style-transfer prompt (wrap any original photo)

Paste this, then add a 1-line description of what's actually in the original
photo so the AI doesn't drift.

```
Restyle this photograph as a premium LAB Prints brand product image. Keep the
exact garment, the exact printed graphic, the exact colors of the print, and
the same general framing. Replace the background entirely with a matte black or
deep charcoal studio surface. Replace the lighting with a single soft key light
from camera-left producing deep shadow falloff to the right, low-key studio
mood. Remove all clutter, hands, faces, and identifying environment. Sharp
focus on the printed graphic. 35mm lens or 50mm macro lens feel. No fashion
soft filter, no HDR, no oversaturation. Premium streetwear product
photography. Output should feel cinematic and editorial.

Subject in the original photo: [ONE-LINE DESCRIPTION HERE — e.g. "black cotton
t-shirt with a printed multi-color sports team crest centered on the chest"]
```

**Negative prompt:**
```
white seamless background, e-commerce template lighting, mockup, flat-lay,
floating shirt, fashion magazine soft filter, instagram filter, hdr,
oversaturated, cluttered desk, hands, face, watermark, text labels
```

**Higgsfield strength setting:** start at **0.65**. If the print drifts
(letters change, colors shift), drop to 0.50. If the background still looks
like the original room, push to 0.75.

---

## Worked example

**Original:** photo of a tee with a printed band logo lying on a desk in
fluorescent light, you can see a coffee cup and a laptop in the corner.

**One-line description to add to the prompt:**
> "black cotton t-shirt with a printed white circular band logo centered on the
> chest, the logo features a stylised eagle inside the circle"

**Higgsfield steps:**
1. Upload original to Higgsfield Soul, select **Image-to-Image**.
2. Paste master prompt with the one-liner appended.
3. Strength 0.65, aspect 4:5, generate 4 variants.
4. Pick the variant where the eagle logo is most readable and the background is
   pure black.
5. Run a 2× upscale.
6. Optimise:
   ```bash
   sips -Z 1000 -s format jpeg -s formatOptions 85 ~/Downloads/regen.png \
     --out "assets/order-photos/regenerated/band-tee.jpg"
   ```

---

## Batch workflow (10+ orders)

If you have a folder of order photos to regenerate:

1. **Stage originals:**
   ```bash
   cd "/Users/victorypeni/Desktop/The Victory Co. Limited/Onyx Studio - Website Build Agency/Client Sites/LAB Prints"
   mkdir -p assets/order-photos/originals assets/order-photos/regenerated
   # drop the originals into assets/order-photos/originals/
   ```

2. **Inventory** — for each original, write a `description.txt` next to it
   (one-line subject description). This forces clarity before any AI work.

3. **Generate** — Higgsfield batch isn't supported in the UI; run them
   sequentially. Budget ~3 minutes per photo (4 variants + pick + upscale).

4. **QA gate** — before saving as final, every regen should pass:
   - [ ] Print is identical to the original (no letter changes, no color shifts)
   - [ ] Garment color is identical
   - [ ] Background is pure matte black or deep charcoal
   - [ ] Lighting is single-source, deep falloff, no fluorescent flatness
   - [ ] No people, hands, faces, watermarks
   - [ ] Sharp focus on the print

5. **Optimise + name** — use semantic filenames so they're easy to use later:
   ```bash
   sips -Z 1000 -s format jpeg -s formatOptions 85 input.png \
     --out "assets/order-photos/regenerated/sports-crest-tee.jpg"
   ```

   Naming pattern: `<segment>-<garment>.jpg`
   Examples: `sports-crest-tee.jpg`, `band-merch-hoodie.jpg`,
   `workwear-polo.jpg`, `event-tee.jpg`, `streetwear-tee.jpg`.

---

## Where to use the regenerated photos

| Surface | Slot | Best regen type |
|---------|------|------------------|
| Website portfolio section (future addition) | 6-12 image grid | Mix all segments |
| Instagram feed | 4:5 vertical posts | Sports / streetwear / band |
| Instagram reels covers | 9:16 portrait | Single-product close-ups |
| LinkedIn case studies | 16:9 landscape | Workwear / corporate |
| Onyxarro work page | LAB Prints case-study card | Strongest 3 (one per segment) |
| Email signatures / quote PDFs | Footer image | Single hero garment |

---

## What this is NOT

- **Not** a way to fake order photos for orders you didn't fulfil. Only restyle
  real completed orders. Otherwise the portfolio is fraud bait.
- **Not** a logo regenerator — see `LOGO-PROMPTS.md`.
- **Not** a substitute for actual product photography once you have a camera +
  studio set up. The regen pipeline buys 6-12 months of brand-quality imagery
  while the studio matures.

---

**Brief filed:** 2026-04-29.
