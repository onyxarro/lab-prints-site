// POST /api/checkout  { items: [{ g, c, s, q }], customer: { name, email, phone, delivery, line1, suburb, city, postcode, notes } }
//   ->  { url }  (Stripe Checkout). Stripe emails the receipt to customer.email.
// GET  /api/checkout  ->  { courier }  (courier price shown on the page)
// Prices, deal and deadline are enforced here. The browser only says what was picked.
// Env: STRIPE_SECRET_KEY (required), COURIER_NZD (default 10)

const DEADLINE = Date.parse('2026-10-09T23:59:00+13:00');
const MULTI_BUY_MIN = 2;      // tees in the order
const MULTI_BUY_OFF = 500;    // cents off every tee

const GARMENTS = {
  boxfit: { name: 'Heavyweight Box Fit (Urban Collab 280GSM)', price: 6000, img: 'boxfit',
            sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] },
  adult:  { name: 'Standard Adult Tee (Cloke Outline)', price: 4500, img: 'adult',
            sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] },
  kids:   { name: 'Kids Tee (Cloke Outline Kids)', price: 3500, img: 'kids',
            sizes: ['2', '4', '6', '8', '10', '12', '14'] },
};
const COLOURS = { black: 'Black', royal: 'Royal Blue', grey: 'Grey', white: 'White' };
// The heavyweight's grey is the light Heather Grey; adult and kids are dark grey.
const colourName = (g, c) => (g === 'boxfit' && c === 'grey' ? 'Heather Grey' : COLOURS[c]);

// Stripe's API takes form encoding with bracketed keys: line_items[0][quantity]=2
function form(obj, prefix, out) {
  out = out || [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v !== null && typeof v === 'object') form(v, key, out);
    else if (v !== undefined) out.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return out.join('&');
}

module.exports = async (req, res) => {
  if (req.method === 'GET') return res.status(200).json({ courier: Number(process.env.COURIER_NZD || 10) });
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'Checkout is not set up yet.' });
  if (Date.now() > DEADLINE) return res.status(410).json({ error: 'Pre-orders have closed.' });

  const raw = (req.body && Array.isArray(req.body.items)) ? req.body.items : [];
  const items = [];
  for (const it of raw.slice(0, 30)) {
    const g = GARMENTS[it.g], colour = COLOURS[it.c] && colourName(it.g, it.c), q = Math.floor(Number(it.q));
    if (!g || !colour || !g.sizes.includes(String(it.s)) || !(q >= 1 && q <= 50)) {
      return res.status(400).json({ error: 'Something in your order is not valid. Please refresh and try again.' });
    }
    items.push({ g: it.g, garment: g, c: it.c, colour, s: String(it.s), q });
  }
  if (!items.length) return res.status(400).json({ error: 'Your order is empty.' });

  // customer details from the page's details step
  const c = (req.body && req.body.customer) || {};
  const clean = (v, max) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);
  const name = clean(c.name, 80), email = clean(c.email, 120).toLowerCase(), phone = clean(c.phone, 30);
  const courierChosen = c.delivery === 'courier';
  const addr = { line1: clean(c.line1, 120), line2: clean(c.suburb, 80), city: clean(c.city, 60), postal_code: clean(c.postcode, 8) };
  const notes = clean(c.notes, 300);
  if (name.length < 2) return res.status(400).json({ error: 'Please enter your name.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email for your receipt.' });
  if (phone.replace(/\D/g, '').length < 7) return res.status(400).json({ error: 'Please enter a phone number.' });
  if (courierChosen && (!addr.line1 || !addr.city || !/^\d{4}$/.test(addr.postal_code))) {
    return res.status(400).json({ error: 'Please enter your full delivery address, including a 4 digit postcode.' });
  }

  const totalTees = items.reduce((n, it) => n + it.q, 0);
  const deal = totalTees >= MULTI_BUY_MIN;
  const site = `https://${req.headers['x-forwarded-host'] || req.headers.host}`;
  const courier = Math.round(Number(process.env.COURIER_NZD || 10) * 100);
  const ref = 'TS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const addressText = courierChosen ? [addr.line1, addr.line2, addr.city, addr.postal_code].filter(Boolean).join(', ') : '';

  const meta = {
    order_ref: ref, campaign: 'toa-samoa-2026', name, phone,
    delivery: courierChosen ? 'courier' : 'pickup', address: addressText, notes,
    tees: String(totalTees), multi_buy: deal ? 'yes' : 'no',
  };
  const session = {
    mode: 'payment',
    currency: 'nzd',
    customer_email: email,
    client_reference_id: ref,
    success_url: `${site}/?order={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/?cancelled=1#order`,
    shipping_options: {
      0: { shipping_rate_data: courierChosen
        ? { display_name: 'NZ-wide courier', type: 'fixed_amount', fixed_amount: { amount: courier, currency: 'nzd' } }
        : { display_name: 'Pickup in Hastings (free)', type: 'fixed_amount', fixed_amount: { amount: 0, currency: 'nzd' } } },
    },
    custom_text: { submit: { message: `Order ${ref}. Pre-order: tees are printed after orders close on Fri 9 Oct.` } },
    metadata: meta,
    payment_intent_data: {
      description: `Toa Samoa pre-order ${ref}: ${totalTees} tee${totalTees > 1 ? 's' : ''} (${meta.delivery})`,
      receipt_email: email,
      metadata: meta,
    },
    line_items: {},
  };
  if (courierChosen) {
    session.payment_intent_data.shipping = { name, phone, address: { ...addr, country: 'NZ' } };
  }
  items.forEach((it, i) => {
    session.line_items[i] = {
      quantity: it.q,
      price_data: {
        currency: 'nzd',
        unit_amount: it.garment.price - (deal ? MULTI_BUY_OFF : 0),
        product_data: {
          name: `${it.garment.name} · ${it.colour} · Size ${it.s}`,
          description: deal ? 'Multi-buy price: $5 off every tee' : '685 Samoa supporters tee',
          images: { 0: `${site}/img/${it.garment.img}-${it.c}.jpg` },
          metadata: { garment: it.g, colour: it.colour, size: it.s },
        },
      },
    };
  });

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form(session),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('stripe', data.error && data.error.message);
      return res.status(502).json({ error: 'Payment page could not be opened. Please try again.' });
    }
    return res.status(200).json({ url: data.url });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'Payment page could not be opened. Please try again.' });
  }
};
