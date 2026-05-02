# LAB Prints — Phase 2 Handoff

Phase 1 polish is shipped (commit `1869f2a` on `origin/main`, lab-prints.vercel.app live). Phase 2 = Shopify dev-store upload + validation. **Use a fresh chat** for this work.

Theme structure was already built 2026-04-29 (commit `756daed`) and was lightly modified in Phase 1: SVG logo fallback added to `header.liquid` + `footer.liquid`, favicon fallback added to `layout/theme.liquid`, `assets/theme.css` synced. **No section schema was changed.**

Repo: `/Users/victorypeni/Desktop/The Victory Co. Limited/Onyx Studio - Website Build Agency/Client Sites/LAB Prints` · Theme dir: `shopify-theme/`

---

## 1. Theme zip command

Run from the project root. Excludes `.DS_Store`. Output `lab-prints-theme.zip` lands at the project root, not inside `shopify-theme/`.

```bash
cd "/Users/victorypeni/Desktop/The Victory Co. Limited/Onyx Studio - Website Build Agency/Client Sites/LAB Prints/shopify-theme" \
  && zip -r ../lab-prints-theme.zip . -x "*.DS_Store" \
  && cd .. \
  && du -sh lab-prints-theme.zip
```

Expect ~1.5 MB (mostly the 7 jpgs in `shopify-theme/assets/`). Shopify's hard limit is 50 MB.

**Use a dev store first** (`*.myshopify.com`), not labprints.co.nz. Live store stays on Horizon as instant rollback for ≥30 days post-publish.

---

## 2. Pages to create in Shopify admin (before upload)

**Online Store > Pages > Add page.** Leave content blank for the templated 5 (about, contact, gang-sheets, care, faq) — content is rendered by sections. Paste real policy text into Shipping.

| Title | Handle | Template suffix |
|---|---|---|
| Contact | `contact` | `contact` |
| Gang Sheets | `gang-sheets` | `gang-sheets` |
| Care & Application | `care` | `care` |
| FAQ | `faq` | `faq` |
| About | `about` | `about` |
| Shipping & Returns | `shipping` | `shipping` |

**Online Store > Navigation:**
- `main-menu`: Shop → `/collections/all` · Gang Sheets → `/pages/gang-sheets` · About → `/pages/about` · FAQ → `/pages/faq` · Contact → `/pages/contact`
- `footer-products`: DTF Transfers → `/products/dtf-transfers` · Gang Sheets → `/pages/gang-sheets` · Custom Garments → `/pages/contact` · All Products → `/collections/all`
- `footer-company`: About · Care Guide → `/pages/care` · FAQ · Contact
- `footer-help`: Shipping → `/pages/shipping` · Privacy → `/policies/privacy-policy` · Terms → `/policies/terms-of-service` · Email → `mailto:hello@labprints.co.nz`

**Settings > Policies:** fill all four (refund, privacy, terms, shipping) so footer-help links resolve.

**Products:** at least one published product (handle `dtf-transfers`) so PDP + collection pages can render. Optional metafields used by PDP tabs: `custom.spec` (rich-text), `custom.care` (rich-text), `custom.price_note` (single-line). Skip multi-variant products in Phase 2 — see PDP swatch limitation below.

**Settings > General > Contact email:** confirm it's a real inbox so the `/pages/contact` form delivery test (TESTING-CHECKLIST.md §7) actually receives mail.

---

## 3. Expected schema-risk sections

`templates/index.json` references 10 home sections — all must validate or upload fails. Sections with `{% schema %}` blocks (the surfaces most likely to error) and the specific risks each carries:

| File | What could fail | Fix |
|---|---|---|
| `sections/app-block.liquid` | Uses `"type": "@app"` block. Schema validates fine, but in the editor "Add block → Apps → Build-a-Gang-Sheet" only appears AFTER the app is installed. Phase 3 wiring — leave the placeholder text visible. | None for Phase 2. |
| `sections/main-product.liquid` | Variant `id` is not rewritten on swatch click — multi-variant products will add the first available variant regardless of swatch. Single-variant products work cleanly. | Test with a single-variant product in Phase 2. JS pass for multi-variant is Phase 3. |
| `sections/featured-collection.liquid` | Hybrid collection_picker + manual block schema. Has fallback `placehold.co` URLs at lines 24 + 43 — **leave them** (intentional empty-state fallbacks). | If editor crashes on this section, check the schema's `blocks` array for trailing comma. |
| `sections/price-tiers.liquid` | 3 tier blocks pre-loaded, "Featured (inverted black)" checkbox toggle on tier #2. | Verify the toggle still flips the inverted style after upload. |
| `sections/why-us.liquid` | 4 point blocks + 4 stat blocks + a "Show stat grid" checkbox. | If stat grid disappears in editor, recheck the checkbox default. |
| `sections/dtf-explainer.liquid` | 4 fact blocks. Phase 1 image fallback (`atelier.jpg`) was wired here. | Schema unchanged. |
| `sections/testimonials.liquid` | 3 review blocks with avatar initials. | None expected. |
| `sections/faq.liquid` | 6 Q&A blocks. First-question-open behaviour comes from `theme.js`. | None expected. |
| `sections/process.liquid` + `sections/info-strip.liquid` + `sections/instructions.liquid` | Block-based, simple. | None expected. |
| `sections/contact-form.liquid` | Uses Shopify's `{% form 'contact' %}` (NOT Formspree like the static site). Routes to **Settings > General > Contact email**. | If form silently doesn't deliver, that setting is wrong/blank. |
| `sections/header.liquid` + `sections/footer.liquid` | Phase 1 added inline-SVG fallback when `image_picker` is blank. The `image_picker` setting itself is unchanged. | Upload your hand-vectorised wordmark via the picker once Phase 3 produces it; meanwhile the inline SVG renders. |
| `snippets/product-card.liquid` + `sections/main-product.liquid` line 13 | `placehold.co` fallback for products with no image. **Intentional — do not swap.** | None. |

`locales/en.default.json` — if any liquid uses a translation key not in this file, the upload errors with the key name. None expected since the theme already shipped once, but if the editor shows raw `t:foo.bar` strings, add the key.

---

## 4. TESTING-CHECKLIST.md priority order for Phase 2

Phase 2 ends at "theme uploaded to dev store, previewable, all 🟡 (preview-only) items pass". The 🔴 (published-store) items mostly defer to a future Phase 2.5 on the real store.

| Order | Checklist section | Time | Why this order |
|---|---|---|---|
| 1 | §0 Pre-upload sanity | 5 min | Catches zip + working-tree issues before you waste an upload attempt |
| 2 | §1 Theme upload | 5 min | If upload fails, the error names the offending section file. Fix at this point — don't proceed. |
| 3 | §2 Theme editor schema smoke | 10 min | Open every section in the editor. Validates that all 10 home sections + the templated pages render their controls. Catches the schema-risk surfaces in §3 above. |
| 4 | §12 404 page | 2 min | Free win, validates `templates/404.json` + `main-404.liquid` |
| 5 | §3 Homepage rendering | 10 min | Confirms type loads, no legacy gradient, scrim/info-strip/cards all render |
| 6 | §13 Mobile responsiveness | 15 min | Verifies the Phase 1 480px polish made it through the file-copy CSS sync to Shopify. Test 390px first, then 768px. |
| 7 | §9 About / Care / FAQ | 10 min | Pages with no Shopify-data dependency. Fast confirmation. |
| 8 | §7 Contact form (🟡 only) | 5 min | UI + required-field validation only. Defer email delivery to published-store phase. |
| 9 | §4 PDP (single-variant product) | 15 min | Needs ≥1 product. Use a single-variant product to dodge the swatch limitation. |
| 10 | §5 Collection page | 10 min | Needs products. Test sort filters + product card grid. |
| 11 | §6 Cart page | 15 min | Add → update qty → remove → continue shopping. Don't checkout in dev store unless Bogus Gateway is on. |
| 12 | §14 Add-to-cart e2e | 10 min | Full path including Bogus Gateway test order. Confirms the checkout handoff. |
| 13 | §15 Performance + SEO | 5 min | Lighthouse mobile target 85/95/100/95. Verify hero `eager` + `fetchpriority="high"` survived. |

**Skip in Phase 2:**
- §8 Gang sheet app block — Phase 3.
- §10 Shipping & Returns content rendering — needs your real policy text.
- §11 Search — Shopify search relevance is unrelated to the theme.

---

## 5. What NOT to touch in Phase 2

| Out of scope | Why |
|---|---|
| Build-a-Gang-Sheet custom builder | Phase 3 — explicitly deferred by owner 2026-05-02. Leave the `app-block.liquid` placeholder text visible in `/pages/gang-sheets`. |
| Onyxarro `work.html` / case study card | Phase 4. Real-client (not concepts.html) per owner lock. |
| Hero AVIF/WebP exports | Phase 3. The commented `<source>` slots in `index-nike.html` are scaffolding. |
| Wordmark vectorisation | Phase 3. Current SVG is a Bebas Neue `<text>` placeholder. Production-quality hand-vectorise per LOGO-PROMPTS.md. |
| New editorial pages (`/process`, `/printing-101`) | Phase 3. |
| `index.html` (legacy v2) | Has a 1150-line pre-existing uncommitted diff. Owner's call — preserve as-is. |
| Static site (`index-nike.html`, `assets/css/`, `assets/js/`) | Phase 1 is done. Don't re-touch unless a Phase 2 finding requires it. |
| `placehold.co` fallback URLs in `snippets/product-card.liquid`, `sections/featured-collection.liquid:24,43`, `sections/main-product.liquid:13` | Intentional empty-state fallbacks for missing Shopify data. |
| PDP multi-variant swatch JS | Known limitation. Sell single-variant products only in Phase 2; JS pass is Phase 3 if/when multi-variant is needed. |
| Onyxarro / Wakefield / sprint / Upwork / niche-page files anywhere on disk | Different projects. |
| Production publish on labprints.co.nz | Phase 2 ships to a **dev store**. Real-store publish is a separate go/no-go decision after dev validation passes. |
| `--no-verify`, `git push --force`, deleting Horizon theme | Standard guardrails. Horizon stays as rollback ≥30 days post-publish. |

---

## Open prerequisites for the new chat

Before the new chat starts the upload, confirm:

1. Shopify dev store created (or pick which existing dev store to use) — `*.myshopify.com` URL needed.
2. Shopify CLI installed if going the iterative-dev route (`brew install shopify-cli`), otherwise plain ZIP upload is fine.
3. ≥1 single-variant product seeded with a featured image so the PDP test in §4 has something to render.
4. **Settings > General > Contact email** set to an inbox you own.
5. `Settings > Payments > Bogus Gateway` enabled if you plan to do the §14 test order.

---

## Resume one-liner for the fresh chat

> "Resume LAB Prints Phase 2 — read PHASE-2-HANDOFF.md and SHOPIFY-DEPLOY.md first. Repo at `Client Sites/LAB Prints/`. Phase 1 polish is shipped (commit 1869f2a on main). Phase 2 = dev-store theme upload + schema validation + walk TESTING-CHECKLIST.md priority order 1-13 listed in the handoff. Owner-locked: skip §8 (gang-sheet builder, Phase 3), skip §10 (needs policy text), do not touch static site, do not publish to labprints.co.nz."
