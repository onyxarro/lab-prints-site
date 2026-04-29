# LAB Prints — Shopify Theme Deploy Guide

The theme lives at `shopify-theme/`. This is a **drop-in custom theme** that
replaces Horizon (or any existing theme) on labprints.co.nz with the rebranded
monochrome editorial aesthetic.

---

## What's in the theme

```
shopify-theme/
├── assets/
│   ├── theme.css          # 600+ lines, the full LAB design system
│   └── theme.js           # mobile menu, FAQ, PDP tabs, qty stepper
├── config/
│   ├── settings_schema.json   # theme editor settings
│   └── settings_data.json     # default values
├── layout/
│   └── theme.liquid       # base HTML wrapper, font loading, asset includes
├── locales/
│   └── en.default.json    # translations
├── sections/              # 17 reusable sections
│   ├── header-group.json
│   ├── footer-group.json
│   ├── promo-banner.liquid
│   ├── header.liquid
│   ├── footer.liquid
│   ├── hero.liquid
│   ├── info-strip.liquid
│   ├── featured-collection.liquid
│   ├── price-tiers.liquid
│   ├── process.liquid
│   ├── why-us.liquid
│   ├── dtf-explainer.liquid
│   ├── testimonials.liquid
│   ├── faq.liquid
│   ├── cta-banner.liquid
│   ├── page-header.liquid
│   ├── instructions.liquid
│   ├── app-block.liquid
│   ├── contact-form.liquid
│   ├── main-product.liquid
│   ├── main-collection.liquid
│   ├── main-cart.liquid
│   ├── main-page.liquid
│   └── main-404.liquid
├── snippets/
│   ├── product-card.liquid
│   └── meta-tags.liquid
└── templates/             # JSON templates compose pages from sections
    ├── index.json         # home
    ├── product.json       # PDP
    ├── collection.json    # /collections/all + per-collection
    ├── cart.json
    ├── page.json          # generic Page
    ├── page.contact.json  # quote form
    ├── page.gang-sheets.json   # gang-sheet builder + app embed slot
    ├── page.care.json     # heat-press application guide
    ├── page.faq.json      # full FAQ page
    ├── page.about.json    # about us
    ├── page.shipping.json # shipping + returns (uses page.json structure)
    ├── 404.json
    └── search.json
```

---

## Pre-deploy checklist

Run through these BEFORE uploading the theme. Skipping will cause broken pages.

### 1. Set up Shopify Pages

In Shopify admin → **Online Store > Pages**, create these pages:

| Title | Handle | Template suffix |
|-------|--------|----------------|
| Contact | `contact` | `contact` |
| Gang Sheets | `gang-sheets` | `gang-sheets` |
| Care & Application | `care` | `care` |
| FAQ | `faq` | `faq` |
| About | `about` | `about` |
| Shipping & Returns | `shipping` | `shipping` |

For each: leave the page content **blank** for the templated pages (about, contact, gang-sheets, care, faq) — content comes from theme sections. For Shipping, paste your actual policy text into the page editor since it uses `main-page.liquid` which renders `page.content`.

### 2. Set up the navigation menu

**Online Store > Navigation > Main menu** — set these links:

- Shop → `/collections/all`
- Gang Sheets → `/pages/gang-sheets`
- About → `/pages/about`
- FAQ → `/pages/faq`
- Contact → `/pages/contact`

### 3. Set up footer menus

Create three menus in **Navigation**:
- **Footer products**: DTF Transfers (`/products/dtf-transfers`), Gang Sheets (`/pages/gang-sheets`), Custom Garments (`/pages/contact`), All Products (`/collections/all`)
- **Footer company**: About (`/pages/about`), Care Guide (`/pages/care`), FAQ (`/pages/faq`), Contact (`/pages/contact`)
- **Footer help**: Shipping & Returns (`/pages/shipping`), Privacy Policy (`/policies/privacy-policy`), Terms (`/policies/terms-of-service`), Email Us (`mailto:hello@labprints.co.nz`)

### 4. Set up your products

The home page expects three primary products. In **Products**, ensure these exist:
- **DTF Transfers** (handle: `dtf-transfers`)
- **Custom Tees / Hoodies** (handle: `custom-garments` or set up a collection)

Optional product metafields (used by the PDP for tabs):
- `custom.spec` (rich-text) — Specifications tab content
- `custom.care` (rich-text) — Care tab content
- `custom.price_note` (single-line) — caption under the price

### 5. Set up policies

**Settings > Policies** — fill in:
- Refund policy
- Privacy policy
- Terms of service
- Shipping policy

These auto-link from the footer menus above.

---

## Upload the theme

**Method A — Manual ZIP upload (simplest):**

```bash
cd "/Users/victorypeni/Desktop/The Victory Co. Limited/Onyx Studio - Website Build Agency/Client Sites/LAB Prints"
cd shopify-theme && zip -r ../lab-prints-theme.zip . -x "*.DS_Store" && cd ..
```

Then in Shopify admin:
1. **Online Store > Themes**
2. Scroll to "Theme library" → **Add theme** → **Upload zip file**
3. Pick `lab-prints-theme.zip`
4. Wait for upload (1–2 min)
5. The theme appears as **LAB Prints** in your library, **unpublished**.

**Method B — Shopify CLI (recommended for iterative dev):**

```bash
# Install once
brew install shopify-cli

# In shopify-theme/ directory:
cd shopify-theme
shopify theme dev --store labprints.co.nz
# Opens a localhost dev preview wired to your live store data.
# Edits to liquid/css/js hot-reload.

# When happy:
shopify theme push --store labprints.co.nz
# Pushes as a new unpublished theme.
```

---

## Configure in the theme editor

After upload, click **Customize** on the LAB Prints theme.

### Header settings
- Upload your **logo** image (24px height — black version for the white nav)
- Set the **menu** to `main-menu`
- CTA label → `Shop Now`
- CTA URL → `/collections/all`

### Header > Promo banner
- Edit the message text if needed.
- Or hide the section.

### Footer settings
- Upload **footer logo** (white version)
- Tagline already filled in
- Each menu column: pick the menu you set up earlier.

### Home page sections
The home page comes pre-loaded with all 10 sections from `templates/index.json`. Customise each in the theme editor:
- **Hero** — upload background image (1920×1080+)
- **Featured collection** — point at your `frontpage` or `all` collection, OR keep manual cards and set their URLs
- **Why us > Side image** — upload atelier photo (4:5)
- **DTF Explainer > Side image** — upload close-up photo (4:5)
- **CTA banner > Background image** — upload print-on-tee photo (16:9)

You can hide / reorder / duplicate any section without touching code.

---

## Set up the gang sheet builder

Your existing **Build-a-Gang-Sheet** app is preserved — drop it into the new theme:

1. The Gang Sheets page at `/pages/gang-sheets` uses `template = page.gang-sheets`.
2. In the theme editor, navigate to that page (URL bar in editor: `?key=templates%2Fpage.gang-sheets.json`).
3. Find the **App block container** section.
4. Click **Add block → Apps → Build-a-Gang-Sheet**.
5. Save.

The placeholder text disappears once a real app block is dropped in.

---

## Publish

1. Theme library → LAB Prints → **Publish**.
2. Confirm.
3. Browse to labprints.co.nz — the new theme is live.

The previous Horizon theme stays in your library as an instant rollback. Don't delete it for at least 30 days.

---

## Post-publish QA

Walk through every page on desktop **and** mobile:

- [ ] Home — hero loads, all sections render, CTA buttons go to right URLs
- [ ] Product pages — image gallery, swatches, qty stepper, Add to Cart works
- [ ] Collection pages — products show, sort filters work, pagination if 24+ products
- [ ] Cart — add, update qty, remove, checkout button reaches Shopify checkout
- [ ] Gang Sheets — builder app renders inside the container
- [ ] Care guide — all 6 steps render with spec rows
- [ ] FAQ — all 12 questions, accordion opens/closes
- [ ] About — full page renders, links work
- [ ] Contact — form submits, success message appears
- [ ] Shipping & Returns — your written policy renders cleanly
- [ ] 404 — visit a fake URL, see the big "404" with back-home button
- [ ] Search — search bar at `/search`, results render in collection grid
- [ ] Footer — all menu links work, copyright year auto-updates

---

## Troubleshooting

**Theme upload fails "missing required template"** — check `templates/` contains all required JSON/Liquid files. Shopify requires at minimum: `index`, `product`, `collection`, `cart`, `page`, `404`, `search`, `list-collections` (we don't include list-collections — Shopify falls back to its default).

**404 page styled wrong** — make sure `templates/404.json` references `main-404` section.

**Fonts not loading** — check `layout/theme.liquid` Google Fonts link is intact. If your browser blocks Google Fonts, host them locally via `assets/` instead.

**Section won't add in editor** — check the section file has a `{% schema %}` block with a `presets` array. Sections without presets are only usable inside templates, not via the "Add section" button.

**Gang Sheet app doesn't appear** — ensure the Build-a-Gang-Sheet app is installed (Apps menu in admin) and that you used **Add block → Apps** inside the App Block Container section, not just any section.

**Pricing tier "$" symbols rendering wrong** — Shopify auto-formats `{{ product.price | money }}`. Static dollar signs in section text are fine. If a tier shows `{{ }}` literal, you've left a Liquid block uneval'd — re-save the section.

**Mobile nav doesn't open** — check `theme.js` is loading. Browser console will show JS errors. Test in incognito to rule out extensions.

---

## Updating the theme later

The theme is in this repo. To update:
1. Edit files in `shopify-theme/`
2. Either re-zip and re-upload, OR
3. `shopify theme push` if you set up the CLI

Major edits should go through the **Theme library**, not directly on the published theme. Workflow:
1. Duplicate the published theme → "LAB Prints (working)"
2. Edit and preview the duplicate
3. When happy, **Publish** the duplicate
4. Old theme moves back into the library as auto-rollback

---

## Related docs

- `LAB-PRINTS-BRAND.md` — the binding brand system. Read before making visual changes.
- `IMAGES-NEEDED.md` + `IMAGES-BATCH.md` — the photography brief and AI prompts.
- `LOGO-PROMPTS.md` — logo regeneration directions.
- `ORDER-PHOTOS-REGEN.md` — restyle existing order photos via Higgsfield.

---

**Theme built:** 2026-04-29 · **Version:** 1.0.0 · **Author:** Onyxarro
