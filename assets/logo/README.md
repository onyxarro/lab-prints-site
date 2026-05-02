# LAB Prints — Logo files (Phase 1 placeholder direction)

These SVGs are the **placeholder vector direction** locked during the Phase 1 rebrand polish. They are not the final production wordmark.

## Files

| File | Use |
|------|-----|
| `lab-mark-black.svg` | Square L monogram, black on transparent. Path-based, scales perfectly. Direction 5. |
| `lab-mark-white.svg` | Square L monogram, white on transparent. |
| `lab-prints-wordmark-black.svg` | Full "LAB PRINTS" wordmark using Bebas Neue. Direction 1. **Placeholder.** Renders correctly when used inline in pages that already load Bebas Neue (the LAB Prints site does). When used as `<img src>` it embeds Google Fonts via `@import` — works in modern browsers, may flash to fallback briefly. |
| `lab-prints-wordmark-white.svg` | Same, white. |
| `favicon.svg` | L mark on solid black square, optimised for tiny scale. |

## Production status

- **Mark + favicon:** production-safe. Pure paths, single colour, work at any size, no font dependency.
- **Wordmark:** placeholder direction. Per [LOGO-PROMPTS.md](../../LOGO-PROMPTS.md), the production wordmark must be hand-vectorised (Figma/Illustrator) or generated via Recraft.ai → SVG. The `<text>`-based SVG here matches the live site's nav rendering (which loads Bebas Neue) but is not robust for embroidery, packaging, or signage where Bebas Neue is not present.

## How they are wired into the site

- **Static `index-nike.html`:** inline SVG `<text>` rendered directly in nav and footer (uses the page's loaded Bebas Neue, no flash).
- **Shopify `header.liquid` and `footer.liquid`:** when no admin-uploaded logo image is set, the same inline SVG renders as fallback.
- **Favicon:** referenced as `<link rel="icon" href="assets/logo/favicon.svg">`.

## Phase 3 task

Vectorise the wordmark by hand-drawing the LAB PRINTS letterforms as paths in Figma using Bebas Neue as a reference, then exporting outlined SVG. Save as `lab-prints-wordmark-black.svg` (overwriting this placeholder). The mark + favicon do not need any further work.
