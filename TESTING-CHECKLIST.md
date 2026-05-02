# LAB Prints — Shopify Upload Testing Checklist

Walk this top-to-bottom **after** uploading the theme via the steps in
[SHOPIFY-DEPLOY.md](SHOPIFY-DEPLOY.md). Don't publish until every checkbox passes.

**Legend:**
- 🟢 verifiable locally / in the theme editor preview
- 🟡 needs the theme uploaded but not published — test via "Preview" link
- 🔴 needs the theme **published** to a real store URL OR needs real product/page data, real apps installed, real DNS/domain, real payment gateway

If a 🔴 item fails, that's the blast radius — only customers see breakage. Catch them in preview where possible. The 🔴 list at the bottom of this doc summarises the ones I genuinely cannot verify without store access.

---

## 0. Pre-upload sanity (5 min)

- [ ] 🟢 `cd shopify-theme && zip -r ../lab-prints-theme.zip . -x "*.DS_Store"` runs without errors
- [ ] 🟢 `lab-prints-theme.zip` is < 50 MB (Shopify limit; should be ~150 KB)
- [ ] 🟢 No empty directories accidentally got into the zip (zip strips them by default)
- [ ] 🟢 `git status` shows no uncommitted changes you wanted to ship

## 1. Theme upload (5 min)

- [ ] 🟡 Theme appears in **Online Store > Themes > Theme library** as "LAB Prints" or "LAB Prints v1.0.0"
- [ ] 🟡 No upload errors (Shopify will refuse the upload if any required template is missing, or if any `{% schema %}` block is malformed)
- [ ] 🟡 Click **Customize** — theme editor opens without crashing
- [ ] 🟡 No red error banners on any template you preview

If upload fails: the error message names the offending file. Open it, check the `{% schema %}` JSON for trailing commas, missing closing braces, or invalid setting `type` values.

## 2. Theme editor (10 min)

- [ ] 🟡 **Header** section opens — logo picker, menu picker, CTA fields all visible
- [ ] 🟡 **Footer** section opens — 3 menu blocks pre-loaded
- [ ] 🟡 **Promo banner** section opens — message field editable
- [ ] 🟡 **Hero** section opens — image picker, all text fields editable
- [ ] 🟡 **Featured collection** opens — both collection picker AND manual card blocks visible
- [ ] 🟡 **Price tiers** opens — 3 tier blocks pre-loaded, "Featured (inverted black)" toggle on tier #2
- [ ] 🟡 **Process** opens — 4 numbered step blocks pre-loaded
- [ ] 🟡 **Why us** opens — 4 point blocks + 4 stat blocks pre-loaded, "Show stat grid" toggle visible
- [ ] 🟡 **DTF Explainer** opens — 4 fact blocks pre-loaded
- [ ] 🟡 **Testimonials** opens — 3 review blocks pre-loaded
- [ ] 🟡 **FAQ** opens — 6 Q&A blocks pre-loaded
- [ ] 🟡 **CTA banner** opens — image picker + text fields visible

Smoke test: hide a section, save, re-show it — should appear unchanged.

## 3. Homepage (10 min)

Test each in **theme preview** (don't need to publish):

### 3a. Visual rendering
- [ ] 🟡 Promo banner renders at top in black with white text
- [ ] 🟡 Header is white, sticky on scroll, with logo + menu + CTA + cart icon
- [ ] 🟡 Hero image fills viewport (full-bleed, edge-to-edge, no border radius)
- [ ] 🟡 Hero scrim darkens the bottom for text readability
- [ ] 🟡 Hero headline uses Bebas Neue uppercase at large size with line-height 0.90
- [ ] 🟡 Hero CTAs (white pill + outlined-on-dark pill) both render and click
- [ ] 🟡 Info strip shows 4 stat boxes with Bebas display numbers, separated by 1px borders
- [ ] 🟡 Featured collection: 3 cards with 4:5 aspect, scrim overlay, white meta text
- [ ] 🟡 Price tiers: 3 cards, middle one is inverted black ("Most popular")
- [ ] 🟡 Process: 4 big numbers (01–04) on snow-white background
- [ ] 🟡 Why us split: image on left, points + 4-cell stat grid on right
- [ ] 🟡 DTF explainer split: text on left, image on right, 2×2 fact grid
- [ ] 🟡 Testimonials: 3 cards on snow background, 5-star rating renders, initials in black squares
- [ ] 🟡 FAQ: first question open by default, others closed, plus icon visible
- [ ] 🟡 CTA banner: full-bleed image at 0.45 opacity behind centered black-overlay text
- [ ] 🟡 Footer: black background, 4 columns, copyright auto-shows current year

### 3b. Color discipline
- [ ] 🟡 No legacy blue/purple/pink gradient anywhere in the UI
- [ ] 🟡 Color appears only in printed-garment placeholder photography
- [ ] 🟡 All text is `#111111` on white or white on `#111111` — never pure black

### 3c. Typography
- [ ] 🟡 Bebas Neue loads (display headlines look condensed and uppercase)
- [ ] 🟡 Inter Tight loads (body copy is humanist sans, weight 500)
- [ ] 🟡 No system-font fallback flash that lasts > 200ms

### 3d. Behavior (homepage)
- [ ] 🟡 Anchor links scroll smoothly (#products, #how, #why, #faq, #contact)
- [ ] 🟡 FAQ accordion: clicking opens a question, clicking the open one closes it, clicking another closes the first and opens the second
- [ ] 🟡 Hero "Order Transfers" CTA goes to `/collections/all`
- [ ] 🟡 Hero "Get a Quote" CTA goes to `/pages/contact`

## 4. Product page (PDP) (15 min) 🔴 mostly

Visit `/products/<your-product-handle>` — needs at least one published product.

- [ ] 🔴 Product images render in the gallery (first image full-width, next 3 in 2-col grid)
- [ ] 🔴 Image fallback: if a product has no image, the placeholder renders `placehold.co` graphic with product title text
- [ ] 🔴 Product title renders in display Bebas (line-height 0.90)
- [ ] 🔴 Price renders in Bebas at large size with `{{ price | money }}` formatting (e.g. "$2.50")
- [ ] 🔴 Compare-at price renders strikethrough when set
- [ ] 🔴 Variant swatches render for each option (size, color, etc.) — see "Known limitation" below
- [ ] 🔴 Quantity stepper: + and − buttons increment/decrement, can't go below 1
- [ ] 🔴 "Add to Cart" button is enabled when variant available, disabled with "Sold Out" text when not
- [ ] 🔴 Tabs: Description renders by default, Specifications appears only if `metafields.custom.spec` is set, Care appears only if `metafields.custom.care` is set
- [ ] 🔴 Tab clicking switches the panel cleanly (active state on the tab, hidden panels stay hidden)
- [ ] 🔴 Below product: CTA banner appears with "Need something custom?"

### Known limitation flagged in this build
- 🔴 **The PDP swatches highlight on click but don't rewrite the variant `id` for products with multiple variants.** For single-variant products, Add-to-Cart works fine. For multi-variant products, the cart will receive the first available variant regardless of swatch selection. **Test with a single-variant product first.** Flag for a follow-up if/when you sell multi-variant products.

## 5. Collection page (10 min) 🔴 needs products

Visit `/collections/all` and any custom collection (e.g. `/collections/dtf-transfers`).

- [ ] 🔴 Page header renders with eyebrow + display title + product count
- [ ] 🔴 Sort filter pills render and the active sort is highlighted
- [ ] 🔴 Clicking a sort pill reloads the page with `?sort_by=<value>` and the new pill is active
- [ ] 🔴 Product grid renders: 4 columns desktop, 3 columns at 1024px, 2 columns at 768px, 1 column at 480px
- [ ] 🔴 Each product card has thumb (4:5), name, type, price, and links to `/products/<handle>`
- [ ] 🔴 If 25+ products: pagination controls render at bottom, "Page X of Y" shows correctly
- [ ] 🔴 If 0 products in collection: "No products yet. Come back soon." renders with no broken layout

## 6. Cart page (15 min) 🔴 needs add-to-cart flow

Add a product, visit `/cart`.

- [ ] 🔴 Cart shows item count in header (e.g. "Your cart (2)")
- [ ] 🔴 Each line item: thumb image, product title (linked), variant title, qty input, line total, "Remove" link
- [ ] 🔴 Sticky right rail: subtotal, total, "Shipping calculated at checkout" note, Checkout button, Update Cart button, Continue Shopping link
- [ ] 🔴 Changing qty + clicking "Update Cart" updates the line and totals
- [ ] 🔴 Clicking "Remove" removes the line cleanly
- [ ] 🔴 Clicking "Checkout" → goes to `/checkout` (Shopify's hosted checkout)
- [ ] 🔴 Empty cart state: lede text + "Shop Now" button rendering correctly when cart is empty
- [ ] 🔴 Checkout completes successfully (real or test order — Shopify Bogus Gateway is fine)

## 7. Contact form (10 min) 🔴 needs form delivery

Visit `/pages/contact`.

- [ ] 🟡 Page header renders with eyebrow "Contact" + display title + lede
- [ ] 🟡 Left column: 3 contact rows (Email, Location, Turnaround) with key-value layout
- [ ] 🟡 Email link is `mailto:hello@labprints.co.nz`
- [ ] 🟡 Right column: form with all 5 fields (Name, Email, Business, Product, Details)
- [ ] 🟡 Required validation fires on Name + Email if empty
- [ ] 🔴 Submitting a valid form triggers Shopify's contact form delivery (sends to the email set in **Settings > General > Contact email**)
- [ ] 🔴 After submit: page reloads showing the success message ("Thanks — we'll get back to you within a few hours")
- [ ] 🔴 Receiving inbox actually receives the email
- [ ] 🔴 Spam-bait test: submit a junk message and confirm it doesn't bounce or get caught in your spam filter

**Important:** the static `index-nike.html` uses Formspree (`mzdydrza`). The Shopify version uses Shopify's native `{% form 'contact' %}` and routes to your shop's contact email — not Formspree. This is intentional but worth knowing.

## 8. Gang sheet app block (15 min) 🔴 needs Build-a-Gang-Sheet installed

Visit `/pages/gang-sheets`.

- [ ] 🟡 Page header renders with eyebrow + display title + lede
- [ ] 🟡 Instructions section renders: 4 numbered steps (01–04)
- [ ] 🟡 App block container renders with `(Add your gang-sheet builder app here from the theme editor)` placeholder text
- [ ] 🔴 Build-a-Gang-Sheet app is installed in the store (Apps menu)
- [ ] 🔴 In the theme editor on the gang-sheets template, **Add block → Apps → Build-a-Gang-Sheet** option appears
- [ ] 🔴 After adding the app block, the placeholder text disappears and the real app embed renders
- [ ] 🔴 The builder loads its canvas / UI inside the bordered container (snow background, 1px border, 20px radius)
- [ ] 🔴 Drag-and-drop / file-upload / sheet-build interactions all work
- [ ] 🔴 The builder's "Add to Cart" path produces a cart line that the new cart page renders correctly

## 9. About / Care / FAQ pages (10 min)

Visit `/pages/about`, `/pages/care`, `/pages/faq`.

- [ ] 🟡 About: page header + Why-us split + DTF explainer + CTA banner all render in order
- [ ] 🟡 Care: page header + 6-step instruction list (each step has number, title, body, spec key-value rows) + CTA
- [ ] 🟡 FAQ: page header + accordion with 12 questions (first one open by default) + CTA
- [ ] 🟡 Spec rows on Care page render in 2-3 columns with key + value, not as plain text

## 10. Shipping & Returns (5 min) 🔴 needs page content

Visit `/pages/shipping`.

- [ ] 🔴 Shopify page exists at handle `shipping` with template `page.shipping`
- [ ] 🔴 Page content (your written policy) renders inside `.prose` styling — readable line-height, max-width 720px, proper heading hierarchy
- [ ] 🔴 Internal links inside the policy use brand link blue `#1151FF` and underline on hover

## 11. Search (5 min) 🔴 needs products

- [ ] 🔴 `/search?q=<term>` returns matching products in the collection grid layout
- [ ] 🔴 Empty search returns the empty state from the collection section
- [ ] 🔴 "No results" page header still renders cleanly

## 12. 404 (2 min)

Visit a fake URL like `/this-does-not-exist`.

- [ ] 🟡 Big "404" headline renders in display Bebas at viewport-filling size
- [ ] 🟡 Lede + "Back to Home" button render below
- [ ] 🟡 Button goes to `/`

## 13. Mobile responsiveness (15 min)

Test in Shopify's preview at viewport widths **390px** (iPhone) and **768px** (iPad).
Or open browser dev tools, set device emulation.

- [ ] 🟡 Mobile (≤768px): nav links collapse, hamburger appears
- [ ] 🟡 Hamburger tap opens full-screen overlay menu with display-style links
- [ ] 🟡 Tapping a menu link closes the menu and scrolls to the anchor
- [ ] 🟡 Hero text stays readable, headline scales down (clamp 64px → ~48px on mobile)
- [ ] 🟡 Info strip stacks to 1 column at 768px
- [ ] 🟡 Featured collection cards stack to 1 column with 4px gap on mobile
- [ ] 🟡 Price tiers stack vertically with 12px gap, all 3 readable
- [ ] 🟡 Process steps stack to 1 column, big numbers scale to ~64px
- [ ] 🟡 Editorial splits (Why us, DTF) stack image-above-text
- [ ] 🟡 Stat grid stacks to 1 column
- [ ] 🟡 Testimonials stack to 1 column
- [ ] 🟡 FAQ accordion still touches/taps cleanly (≥44px touch target)
- [ ] 🟡 CTA banner stays readable, buttons wrap to multiple lines if needed
- [ ] 🟡 Footer stacks to 1 column at 768px, all menu links remain tappable
- [ ] 🟡 PDP gallery stacks to 1 column on mobile
- [ ] 🟡 PDP info pane sits below gallery on mobile (sticky disabled)
- [ ] 🔴 Cart page: line items remain readable on mobile, sticky right rail moves to bottom
- [ ] 🟡 Form inputs: 16px font size (prevents iOS Safari from zooming on focus)

## 14. Add-to-cart end-to-end flow (10 min) 🔴

This is the money path. Walk it as if you were a real customer.

1. [ ] 🔴 Land on `/`
2. [ ] 🔴 Click **Order Transfers** → arrives at `/collections/all` (or wherever you configured the CTA)
3. [ ] 🔴 Click a product → arrives at `/products/<handle>`
4. [ ] 🔴 Pick a variant (if multi-variant — see PDP limitation flag in section 4)
5. [ ] 🔴 Increment quantity to 2
6. [ ] 🔴 Click **Add to Cart**
7. [ ] 🔴 Lands on `/cart` with the item added at qty 2 (Shopify default behavior unless cart drawer is enabled)
8. [ ] 🔴 Subtotal correct
9. [ ] 🔴 Click **Checkout** → enters Shopify's hosted checkout flow
10. [ ] 🔴 Complete a test order with Shopify Bogus Gateway (Settings > Payments > Bogus Gateway, card 1, exp any-future, CVV 111)
11. [ ] 🔴 Order confirmation email arrives
12. [ ] 🔴 Order appears in **Orders** in admin

## 15. Performance & SEO (5 min) 🔴

- [ ] 🔴 Lighthouse mobile score: aim ≥85 perf, ≥95 accessibility, ≥100 best-practices, ≥95 SEO
- [ ] 🔴 Hero image is `loading="eager" fetchpriority="high"` (already wired in hero.liquid — verify in DevTools)
- [ ] 🔴 No console errors in a clean browser session (incognito + no extensions)
- [ ] 🔴 No 404s in the network tab on first paint
- [ ] 🔴 Open Graph image renders correctly when sharing the URL on Slack/iMessage
- [ ] 🔴 `<title>` and `<meta description>` populate per page (not all "LAB Prints — LAB Prints")

---

## Things that genuinely require Shopify store access

These cannot be verified from this codebase alone. Walk them with the live store:

1. **Real product data with metafields.** Set up at least one DTF Transfer product with a featured image, variants, and the optional `custom.spec` / `custom.care` / `custom.price_note` metafields, then verify PDP renders all tabs.
2. **Build-a-Gang-Sheet app installation + theme-editor app block insertion.** I can't verify the app's UI inside the container without the app installed in your store.
3. **Shopify contact form email delivery.** Submit the form once, confirm the message arrives at your shop's contact email.
4. **Cart → checkout → order completion** via Bogus Gateway. The cart template handles the UI; the checkout itself is Shopify-hosted and not part of this theme.
5. **Pagination on collection pages with 25+ products.** I can't synthesize 25 products in code; either set them up or trust the `{% paginate %}` block.
6. **Multi-variant PDP swatches**. The current implementation is visual-only and will need a JS pass to wire variant `id` switching when you sell multi-variant products. Single-variant products work as-is.
7. **Search relevance.** Shopify's search engine returns results based on your real product catalog; nothing about the theme affects it.
8. **Mobile cart sticky rail behavior.** I implemented mobile reflow but couldn't test on actual iOS Safari — flag if it feels janky.
9. **Real photos behind hero/CTA scrims.** The placehold.co images render with high contrast; real photos may need their own contrast/scrim tuning.
10. **Vercel COMMIT_AUTHOR_REQUIRED:** Vercel will silently block deploys if the commit author email doesn't match a verified Vercel account. The local config is now set to `penivictory@gmail.com` — confirm this matches your Vercel account email.

---

**Last updated:** 2026-04-29.
**Theme version:** 1.0.0.
