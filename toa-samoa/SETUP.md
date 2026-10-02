# Toa Samoa pre-order: setup

## How ordering works
1. Customers build an order on the page: garment, colour, size and quantity per line, mixed freely.
2. 2 or more tees in one order = $5 off every tee, applied automatically.
3. They fill in **Your details**: name, phone, email (for the receipt), pickup in Hastings or NZ courier (+ address).
4. **Pay securely** opens Stripe with their email already filled in. They only enter card details.
5. After paying they land back on a branded **order confirmation** screen: order number (e.g. `TS-IXN7ZQ`), items, delivery, total, what happens next.
6. Stripe emails the **receipt** to their address.
7. You see each order in Stripe > Payments: line items like
   `Heavyweight Box Fit (Urban Collab 280GSM) · Royal Blue · Size XL × 2`, the order number,
   name, phone, delivery method, and (for courier) the shipping address.

## Receipts: make them match the brand (2 min, do this once)
Stripe Dashboard > Settings > Branding: upload `logo-black.png`, set brand colour `#111111` and accent `#E2381A`.
Then Settings > Customer emails: turn on **Successful payments**. (Stripe does not send receipt emails in test mode.)

## Sending tracking numbers
When a courier order ships, open the payment in Stripe, copy the customer's email and order number, and email
them the tracking number from hello@labprints.co.nz. For pickup orders, email the pickup address and times.
(If volume gets big, this can be automated with a branded email later.)

Prices, the deal and the deadline are all enforced in `api/checkout.js`, so nobody can edit them in their browser.

## To go live (about 5 min)
1. Stripe Dashboard > Developers > API keys. Copy the **Secret key** (`sk_live_...`).
   Test first with the test key (`sk_test_...`) and card `4242 4242 4242 4242`.
2. Vercel project > Settings > Environment Variables:
   - `STRIPE_SECRET_KEY` = your secret key
   - `COURIER_NZD` = courier price in dollars, e.g. `10` (defaults to 10 if not set)
3. Redeploy.

Until `STRIPE_SECRET_KEY` is set, the Checkout button opens a pre-filled order email to hello@labprints.co.nz instead.

## Changing things
- **Prices / sizes / deal:** edit the top of `api/checkout.js` (what's charged) AND the matching values in `index.html` (what's shown).
- **Deadline:** `DEADLINE` in both files. Currently Fri 9 Oct 2026, 11:59pm NZT. After it, the page closes itself and checkout refuses new orders.

## New artwork
Export the final design as a transparent PNG, then run:

    python3 tools/make_mockups.py "/path/to/final-design.png" "/path/to/final-design-for-white-tees.png"

The second file is optional: a version of the design for **white tees** (white outlines/script swapped for
dark ones, or they vanish on white fabric). Without it, white tees use the main design.

It trims the artwork, fits it inside an A3 landscape box (42 × 29.7 cm) on the chest of all 12 garment photos
(Black, Royal Blue, Grey, White × box fit, adult and kids; kids use an A4 landscape box), adds a 9 cm Samoa flag
(7 cm on kids) centred on the top seam of the left sleeve (top edge toward the shoulder, long edge parallel to
the sleeve opening), and overwrites `img/`. The sleeve flag uses the same red and blue as the flag in the artwork.
Box fit grey = Urban Collab Heather Grey. Adult and kids grey = Cloke Dark Grey. Kids = Cloke T102 Outline Tee Kids.
Also replace `og.jpg` (the share image).

## After the 9th
Stripe > Payments > Export (include line items) gives you the print list.
