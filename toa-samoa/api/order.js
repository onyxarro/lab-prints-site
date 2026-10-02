// GET /api/order?id=cs_...  ->  paid order summary for the confirmation screen.
// The Checkout Session id is long and unguessable, and only comes back to the buyer's browser.
const { sendConfirmation } = require('./_lib/confirm');

module.exports = async (req, res) => {
  const id = String((req.query && req.query.id) || '');
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return res.status(400).json({ error: 'Bad order link.' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'Not set up.' });

  try {
    const r = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${id}?expand[]=line_items`,
      { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` } });
    const s = await r.json();
    if (!r.ok) return res.status(404).json({ error: 'Order not found.' });
    if (s.payment_status !== 'paid') return res.status(402).json({ error: 'Payment not completed.' });

    const m = s.metadata || {};
    // Without the webhook, the confirmation screen is what triggers the email (sent once only).
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      const site = `https://${req.headers['x-forwarded-host'] || req.headers.host}`;
      await sendConfirmation(id, site).catch(e => console.error('confirm email', e.message));
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      ref: m.order_ref || s.client_reference_id,
      name: m.name,
      email: s.customer_details && s.customer_details.email,
      delivery: m.delivery,
      address: m.address,
      items: (s.line_items ? s.line_items.data : []).map(li => ({
        name: li.description, qty: li.quantity, amount: li.amount_total / 100,
      })),
      shipping: (s.total_details ? s.total_details.amount_shipping : 0) / 100,
      total: s.amount_total / 100,
    });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'Could not load order.' });
  }
};
