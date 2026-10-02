// POST /api/stripe-webhook  <- Stripe event checkout.session.completed
// Sends the Brevo order confirmation even if the buyer closes the tab before the confirmation screen.
// Env: STRIPE_WEBHOOK_SECRET (whsec_..., from Stripe > Developers > Webhooks), plus those in _lib/confirm.js.
const crypto = require('crypto');
const { sendConfirmation } = require('./_lib/confirm');

// Read the raw body ourselves (req.body must not be touched, Stripe signs the exact bytes).
const rawBody = req => new Promise((ok, fail) => {
  const chunks = [];
  req.on('data', c => chunks.push(c)); req.on('end', () => ok(Buffer.concat(chunks).toString('utf8'))); req.on('error', fail);
});

function verified(raw, header, secret) {
  const parts = Object.fromEntries(String(header || '').split(',').map(p => p.split('=')).filter(p => p.length === 2 && p[0] !== 'v1'));
  const sigs = String(header || '').split(',').filter(p => p.startsWith('v1=')).map(p => p.slice(3));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300 || !sigs.length) return false;
  const want = crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  return sigs.some(s => s.length === want.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(want)));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'Webhook not set up.' });

  const raw = await rawBody(req);
  if (!verified(raw, req.headers['stripe-signature'], secret)) return res.status(400).json({ error: 'Bad signature.' });

  const event = JSON.parse(raw);
  if (event.type !== 'checkout.session.completed') return res.status(200).json({ ignored: event.type });
  const s = event.data.object;
  if (!s.metadata || s.metadata.campaign !== 'toa-samoa-2026') return res.status(200).json({ ignored: 'other campaign' });

  try {
    const site = `https://${req.headers['x-forwarded-host'] || req.headers.host}`;
    return res.status(200).json({ email: await sendConfirmation(s.id, site) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'send failed' }); // Stripe retries
  }
};

module.exports.config = { api: { bodyParser: false } };
