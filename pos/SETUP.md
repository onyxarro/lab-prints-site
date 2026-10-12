# LAB POS: setup

iPad till for the LAB Prints shop. Web app (add to iPad home screen) + Stripe Terminal
BBPOS WisePOS E card reader on wifi. Prices = the LAB quote calculator (api/_lib/pricing.js).

## What it does (v1)
- Staff log in with a 4-digit PIN. Every sale records who made it. Auto-locks after 15 min idle.
- Sell: quote builder (6 garments x qty brackets, front / front + back, sleeves, extras, artwork, rush),
  quick-sell products, custom items (DTF, gang sheets, 100+ orders).
- Pay by card (reader) or cash (change worked out, rounded to 10c).
- Custom jobs: 50% deposit or paid in full -> job number -> Received / Printing / Ready / Collected.
  Ready emails the customer (if email given). Balance taken at pickup.
- Email receipts via Brevo (every payment, when an email is entered).
- Owner only: Today (takings, card/cash, GST, by staff, void cash walk-ins, CSV export) and Settings
  (staff, products, reader pairing).
- BFG-ready: every product/sale carries a brand + legal entity (pricing.js ENTITIES / BRANDS).
  A cart that mixes two legal entities is refused. BFG is added there once its business details are confirmed.

## Run locally
    OWNER_PIN=1234 OWNER_NAME=Victory node dev.js      # http://localhost:4321
In-memory data (wiped on restart). Add `STRIPE_SECRET_KEY=sk_test_...` to try card payments with
Stripe's simulated reader (Settings > pairing code `simulated-wpe`).

## Deploy (new Vercel project `lab-pos`)
1. From this folder: `~/.npm-global/bin/vercel --prod --yes` (first run creates the project).
2. Vercel dashboard > lab-pos > Storage > Marketplace > **Upstash Redis** (free tier) > connect to the project.
   This sets KV_REST_API_URL / KV_REST_API_TOKEN.
3. Environment variables (Production), then redeploy:
   | Var | Value |
   |---|---|
   | `SESSION_SECRET` | long random string (`openssl rand -hex 32`) |
   | `OWNER_PIN` | owner's 4-digit PIN |
   | `OWNER_NAME` | Victory |
   | `STRIPE_SECRET_KEY` | start with `sk_test_...`, swap to the live key when the reader arrives |
   | `BREVO_API_KEY` | same key as lab-toa-samoa |
   | `BREVO_SENDER_EMAIL` | hello@onyxarro.com (verified sender, same as toa-samoa) |
   | `BREVO_SENDER_NAME` | LAB Prints |
   | `BREVO_REPLY_TO` | sales@labprints.co.nz (or penivictory@gmail.com) |
   | `GST_NUMBER` | optional, printed on receipts |

## Test card payments (before the reader arrives)
1. `STRIPE_SECRET_KEY` = test key. Yellow TEST MODE flag shows in the top bar.
2. Settings > Card reader > pairing code `simulated-wpe` + shop address > Pair.
3. Ring up a sale > Card > tap **Simulate tap** (or Simulate decline).

## When the WisePOS E arrives
1. Plug in, connect to shop wifi.
2. Swap `STRIPE_SECRET_KEY` to the live key, redeploy. Settings > Unpair the simulated reader.
3. On the reader: swipe right from the left edge > Settings > admin PIN 07139 > Generate pairing code.
4. Settings > type the code > Pair. Do a $1 test sale and refund it in the Stripe dashboard.

## iPad
Safari > open the lab-pos URL > Share > Add to Home Screen. Opens full screen like an app.

## Notes
- Card payments only count as paid when Stripe says so. If the iPad closes mid-payment, the sale is
  settled from Stripe next time Jobs or Today is opened.
- Card refunds: Stripe dashboard (search the sale number, e.g. S-00012). Cash walk-ins: Void in Today.
- Later: stock tracking, SMS, receipt printer, online orders, BFG & Co.
