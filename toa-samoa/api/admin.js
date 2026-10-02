// Orders admin for /admin/. Stripe is the only store: paid Checkout Sessions are the orders,
// and the fulfilment status lives on each PaymentIntent's metadata.
// GET  /api/admin                         ->  { orders: [...] }
// POST /api/admin  { pi, status }         ->  { ok: true }
// Auth: header x-admin-key must equal the ADMIN_PASSWORD env var.
const crypto = require('crypto');

const CAMPAIGN = 'toa-samoa-2026';
const STATUSES = ['new', 'printed', 'packed', 'sent', 'collected'];

function authed(req) {
  const want = process.env.ADMIN_PASSWORD || '';
  const got = String(req.headers['x-admin-key'] || '');
  if (!want || got.length !== want.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

const stripe = (path, opts = {}) => fetch(`https://api.stripe.com/v1/${path}`, {
  ...opts,
  headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
             'Content-Type': 'application/x-www-form-urlencoded', ...(opts.headers || {}) },
}).then(async r => {
  const data = await r.json();
  if (!r.ok) throw new Error((data.error && data.error.message) || `Stripe ${r.status}`);
  return data;
});

// "Heavyweight Box Fit (Urban Collab 280GSM) · Black · Size M"  ->  { garment, colour, size }
function parseItem(desc) {
  const parts = String(desc || '').replace(/^TEST \$1 · /, '').split(' · ');
  const size = (parts.pop() || '').replace(/^Size /, '');
  const colour = parts.pop() || '';
  return { garment: parts.join(' · '), colour, size };
}

async function listOrders() {
  const orders = [];
  let after = '';
  for (let page = 0; page < 20; page++) {
    const q = 'checkout/sessions?limit=100&status=complete'
      + '&expand[]=data.line_items&expand[]=data.payment_intent.latest_charge'
      + (after ? `&starting_after=${after}` : '');
    const list = await stripe(q);
    for (const s of list.data) {
      const m = s.metadata || {};
      if (m.campaign !== CAMPAIGN || s.payment_status !== 'paid') continue;
      const pi = s.payment_intent && typeof s.payment_intent === 'object' ? s.payment_intent : null;
      const charge = pi && pi.latest_charge && typeof pi.latest_charge === 'object' ? pi.latest_charge : null;
      const refunded = charge ? charge.amount_refunded : 0;
      const cd = s.customer_details || {};
      orders.push({
        id: s.id,
        pi: pi ? pi.id : null,
        ref: m.order_ref || s.client_reference_id,
        created: s.created,
        name: m.name || cd.name || '',
        email: cd.email || s.customer_email || '',
        phone: m.phone || cd.phone || '',
        delivery: m.delivery || 'pickup',
        address: m.address || '',
        notes: m.notes || '',
        items: (s.line_items ? s.line_items.data : []).map(li => ({
          ...parseItem(li.description), qty: li.quantity, amount: li.amount_total / 100,
        })),
        shipping: (s.total_details ? s.total_details.amount_shipping : 0) / 100,
        total: s.amount_total / 100,
        refund: refunded ? (refunded >= s.amount_total ? 'full' : 'partial') : '',
        status: (pi && pi.metadata && pi.metadata.fulfilment) || 'new',
        test: /^TEST \$1/.test((s.line_items && s.line_items.data[0] && s.line_items.data[0].description) || ''),
      });
    }
    if (!list.has_more || !list.data.length) break;
    after = list.data[list.data.length - 1].id;
  }
  return orders;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  if (!process.env.STRIPE_SECRET_KEY || !process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'Admin is not set up.' });
  if (!authed(req)) return res.status(401).json({ error: 'Wrong password.' });

  try {
    if (req.method === 'GET') return res.status(200).json({ orders: await listOrders() });
    if (req.method === 'POST') {
      const pi = String((req.body && req.body.pi) || ''), status = String((req.body && req.body.status) || '');
      if (!/^pi_[A-Za-z0-9]+$/.test(pi) || !STATUSES.includes(status)) return res.status(400).json({ error: 'Bad request.' });
      await stripe(`payment_intents/${pi}`, { method: 'POST',
        body: `metadata[fulfilment]=${status}&metadata[fulfilment_at]=${new Date().toISOString()}` });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'GET or POST only' });
  } catch (e) {
    console.error('admin', e.message);
    return res.status(502).json({ error: 'Could not reach Stripe. Try again.' });
  }
};
