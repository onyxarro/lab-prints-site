// Public social-proof count for the landing page: how many tees have been pre-ordered.
// GET /api/stats  ->  { tees: 42 }
// Counts paid, non-refunded, non-test Checkout Sessions for this campaign. Cached at the edge for 5 min
// so page views do not hit Stripe each time.
const CAMPAIGN = 'toa-samoa-2026';

const stripe = path => fetch(`https://api.stripe.com/v1/${path}`, {
  headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
}).then(async r => {
  const data = await r.json();
  if (!r.ok) throw new Error((data.error && data.error.message) || `Stripe ${r.status}`);
  return data;
});

async function countTees() {
  let tees = 0, after = '';
  for (let page = 0; page < 20; page++) {
    const list = await stripe('checkout/sessions?limit=100&status=complete'
      + '&expand[]=data.line_items&expand[]=data.payment_intent.latest_charge'
      + (after ? `&starting_after=${after}` : ''));
    for (const s of list.data) {
      if ((s.metadata || {}).campaign !== CAMPAIGN || s.payment_status !== 'paid') continue;
      const charge = s.payment_intent && s.payment_intent.latest_charge;
      if (charge && typeof charge === 'object' && charge.amount_refunded >= s.amount_total) continue;
      const lines = s.line_items ? s.line_items.data : [];
      if (lines[0] && /^TEST \$1/.test(lines[0].description || '')) continue;
      lines.forEach(li => { tees += li.quantity || 0; });
    }
    if (!list.has_more || !list.data.length) break;
    after = list.data[list.data.length - 1].id;
  }
  return tees;
}

module.exports = async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'Not set up.' });
  try {
    const tees = await countTees();
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ tees });
  } catch (e) {
    console.error('stats', e.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Unavailable.' });
  }
};
