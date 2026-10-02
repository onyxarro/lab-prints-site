// Order confirmation email via Brevo. Sent once per paid order: the Stripe PaymentIntent is
// stamped with metadata.confirm_email = 'sent' afterwards, so retries and page reloads skip it.
// Files under api/_lib are not routes (Vercel ignores underscore paths).
// Env: STRIPE_SECRET_KEY, BREVO_API_KEY, BREVO_SENDER_EMAIL (default hello@labprints.co.nz),
//      BREVO_SENDER_NAME (default LAB Prints), ORDER_NOTIFY_EMAIL (optional copy of every order).

const STRIPE = 'https://api.stripe.com/v1';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '$' + (n % 1 ? n.toFixed(2) : n);

async function stripe(path, body) {
  const r = await fetch(STRIPE + path, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await r.json();
  if (!r.ok) throw new Error('stripe ' + (data.error && data.error.message));
  return data;
}

function render(o, site) {
  const first = esc((o.name || '').split(' ')[0] || 'there');
  const rows = o.items.map(it => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #E3DFD3;width:64px">${it.img ? `<img src="${esc(it.img)}" width="56" height="56" alt="" style="display:block;border-radius:6px;background:#F3F1EC">` : ''}</td>
          <td style="padding:12px 12px;border-bottom:1px solid #E3DFD3;font-size:14px;line-height:1.4;color:#2A2A28">${esc(it.name)}<br><span style="color:#6B6B66">Qty ${it.qty}</span></td>
          <td style="padding:12px 0;border-bottom:1px solid #E3DFD3;font-size:14px;text-align:right;white-space:nowrap;color:#111">${money(it.amount)}</td>
        </tr>`).join('');
  const deliv = o.delivery === 'courier'
    ? `NZ-wide courier to:<br>${esc(o.address)}<br><span style="color:#6B6B66">We will email your tracking number when it ships.</span>`
    : `Free pickup in Hastings.<br><span style="color:#6B6B66">We will email pickup details when your order is ready.</span>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Order ${esc(o.ref)}</title></head>
<body style="margin:0;padding:0;background:#F3F1EC;font-family:Helvetica,Arial,sans-serif;color:#111">
<div style="display:none;max-height:0;overflow:hidden">Order ${esc(o.ref)} is confirmed. Fa'afetai for repping the 685.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F1EC"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:10px;overflow:hidden">
    <tr><td style="background:#111;padding:22px 28px" align="left"><img src="${site}/logo-white-web.png" width="72" alt="LAB Prints" style="display:block"></td></tr>
    <tr><td style="padding:30px 28px 8px">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C42A0E">Order confirmed</p>
      <h1 style="margin:0 0 12px;font-size:30px;line-height:1.1;font-weight:800;text-transform:uppercase">Fa'afetai, ${first}!</h1>
      <p style="margin:0;font-size:15px;line-height:1.55;color:#2A2A28">Your Toa Samoa pre-order is locked in. Your order number is <b>${esc(o.ref)}</b>. Keep this email, you will need the number if you contact us.</p>
    </td></tr>
    <tr><td style="padding:18px 28px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
        ${o.shipping ? `<tr><td></td><td style="padding:10px 12px 0;font-size:14px;color:#6B6B66">Courier</td><td style="padding:10px 0 0;font-size:14px;text-align:right">${money(o.shipping)}</td></tr>` : ''}
        <tr><td></td><td style="padding:10px 12px 0;font-size:16px;font-weight:700">Total paid</td><td style="padding:10px 0 0;font-size:16px;font-weight:700;text-align:right">${money(o.total)}</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:24px 28px 0">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6B6B66">Getting your tees</p>
      <p style="margin:0;font-size:15px;line-height:1.55">${deliv}</p>
    </td></tr>
    <tr><td style="padding:24px 28px 0">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6B6B66">What happens next</p>
      <p style="margin:0;font-size:15px;line-height:1.55">Pre-orders close Friday 9 October at 11:59pm. Then we print every tee locally in Hastings and let you know as soon as yours is ready.</p>
    </td></tr>
    <tr><td style="padding:28px 28px 30px">
      <p style="margin:0;font-size:14px;line-height:1.55;color:#6B6B66">Questions? Just reply to this email or write to <a href="mailto:hello@labprints.co.nz" style="color:#111">hello@labprints.co.nz</a> with your order number.</p>
    </td></tr>
    <tr><td style="background:#111;color:#9A9A93;padding:18px 28px;font-size:12px">LAB Prints · Printed locally in Hastings, NZ</td></tr>
  </table>
</td></tr></table></body></html>`;

  const text = [
    `Fa'afetai, ${(o.name || '').split(' ')[0] || 'there'}! Your Toa Samoa pre-order is confirmed.`,
    `Order number: ${o.ref}`, '',
    ...o.items.map(it => `${it.qty} x ${it.name}  ${money(it.amount)}`),
    o.shipping ? `Courier  ${money(o.shipping)}` : '', `Total paid  ${money(o.total)}`, '',
    o.delivery === 'courier' ? `NZ courier to: ${o.address}. Tracking number emailed when it ships.` : 'Free pickup in Hastings. Pickup details emailed when your order is ready.',
    'Pre-orders close Fri 9 Oct, 11:59pm. Then we print every tee locally in Hastings.', '',
    'Questions? Reply to this email or write to hello@labprints.co.nz with your order number.',
  ].filter(l => l !== null).join('\n');
  return { html, text };
}

// Load a paid session, send the email if it has not gone yet. Returns 'sent' | 'already' | 'skipped'.
async function sendConfirmation(sessionId, site) {
  if (!process.env.BREVO_API_KEY) return 'skipped';
  const s = await stripe(`/checkout/sessions/${sessionId}?expand[]=line_items.data.price.product&expand[]=payment_intent`);
  if (s.payment_status !== 'paid') return 'skipped';
  const pi = s.payment_intent;
  if (pi && pi.metadata && pi.metadata.confirm_email === 'sent') return 'already';

  const m = s.metadata || {};
  const o = {
    ref: m.order_ref || s.client_reference_id, name: m.name, delivery: m.delivery, address: m.address,
    email: (s.customer_details && s.customer_details.email) || s.customer_email,
    items: (s.line_items ? s.line_items.data : []).map(li => ({
      name: li.description, qty: li.quantity, amount: li.amount_total / 100,
      img: li.price && li.price.product && li.price.product.images && li.price.product.images[0],
    })),
    shipping: (s.total_details ? s.total_details.amount_shipping : 0) / 100,
    total: s.amount_total / 100,
  };
  const { html, text } = render(o, site);
  const sender = { name: process.env.BREVO_SENDER_NAME || 'LAB Prints', email: process.env.BREVO_SENDER_EMAIL || 'hello@labprints.co.nz' };
  const msg = {
    sender, replyTo: { email: sender.email, name: sender.name },
    to: [{ email: o.email, name: o.name || undefined }],
    subject: `Order ${o.ref} confirmed: your Toa Samoa tees`,
    htmlContent: html, textContent: text, tags: ['toa-samoa', 'order-confirmation'],
  };
  if (process.env.ORDER_NOTIFY_EMAIL) msg.bcc = [{ email: process.env.ORDER_NOTIFY_EMAIL }];

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(msg),
  });
  if (!r.ok) throw new Error('brevo ' + r.status + ' ' + (await r.text()).slice(0, 200));
  if (pi) await stripe(`/payment_intents/${pi.id}`, 'metadata[confirm_email]=sent');
  return 'sent';
}

module.exports = { sendConfirmation, render };
