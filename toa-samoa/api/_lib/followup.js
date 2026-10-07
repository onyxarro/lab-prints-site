// "Your tees are still waiting" follow-up email for someone who pressed Pay but never paid.
// Sent from /admin/ (Not paid tab). Offers the COMEBACK5 code ($5 off, applied by api/checkout.js)
// and links back to the site with their exact cart in the URL, so it works on any device.

const CODE = 'COMEBACK5', CODE_OFF = 5;
const COLOUR_KEYS = { 'Black': 'black', 'Royal Blue': 'royal', 'Grey': 'grey', 'Heather Grey': 'grey', 'White': 'white' };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '$' + (n % 1 ? n.toFixed(2) : n);

// Stripe session (with line_items.data.price.product expanded) -> what the email needs.
function fromSession(s) {
  const m = s.metadata || {};
  const items = (s.line_items ? s.line_items.data : []).map(li => {
    const prod = (li.price && typeof li.price.product === 'object') ? li.price.product : {};
    const pm = prod.metadata || {};
    const parts = String(li.description || '').split(' · ');
    return {
      name: parts[0], colour: pm.colour || parts[1] || '', size: pm.size || String(parts[2] || '').replace(/^Size /, ''),
      g: pm.garment || '', qty: li.quantity, amount: li.amount_total / 100, img: prod.images && prod.images[0],
    };
  });
  return {
    ref: m.order_ref || s.client_reference_id, name: m.name || '', email: s.customer_email || '',
    delivery: m.delivery || 'pickup', items,
    shipping: (s.total_details ? s.total_details.amount_shipping : 0) / 100,
  };
}

function render(o, site) {
  const first = (o.name || '').split(' ')[0] || 'there';
  const cart = o.items.filter(i => i.g && COLOUR_KEYS[i.colour])
    .map(i => [i.g, COLOUR_KEYS[i.colour], i.size, i.qty].join('.')).join(',');
  const link = `${site}/?code=${CODE}${cart ? '&cart=' + encodeURIComponent(cart) : ''}#details`;
  const teesTotal = o.items.reduce((n, i) => n + i.amount, 0);
  const total = Math.max(0, teesTotal - CODE_OFF) + (o.shipping || 0);
  const tees = o.items.reduce((n, i) => n + i.qty, 0);

  const rows = o.items.map(it => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #E3DFD3;width:64px">${it.img ? `<img src="${esc(it.img)}" width="56" height="56" alt="" style="display:block;border-radius:6px;background:#F3F1EC">` : ''}</td>
          <td style="padding:12px 12px;border-bottom:1px solid #E3DFD3;font-size:14px;line-height:1.4;color:#2A2A28"><b style="color:#111">${esc(it.name)}</b><br><span style="color:#6B6B66">${esc(it.colour)} · Size ${esc(it.size)} · Qty ${it.qty}</span></td>
          <td style="padding:12px 0;border-bottom:1px solid #E3DFD3;font-size:14px;text-align:right;white-space:nowrap;color:#111">${money(it.amount)}</td>
        </tr>`).join('');
  const line = (label, val, style) => `<tr><td></td><td style="padding:10px 12px 0;font-size:14px;${style || 'color:#6B6B66'}">${label}</td><td style="padding:10px 0 0;font-size:14px;text-align:right;${style || ''}">${val}</td></tr>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Toa Samoa tees</title></head>
<body style="margin:0;padding:0;background:#F3F1EC;font-family:Helvetica,Arial,sans-serif;color:#111">
<div style="display:none;max-height:0;overflow:hidden">We saved your tees and took $${CODE_OFF} off. Orders close Friday 9 October.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F1EC"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:10px;overflow:hidden">
    <tr><td style="background:#111;padding:0;line-height:0"><img src="${site}/email-header.png" width="560" alt="LAB Prints" style="display:block;width:100%;max-width:560px;height:auto;border:0"></td></tr>
    <tr><td style="padding:30px 28px 8px">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C42A0E">Your order is saved</p>
      <h1 style="margin:0 0 12px;font-size:30px;line-height:1.1;font-weight:800;text-transform:uppercase">Hi ${esc(first)}, your tees are still waiting</h1>
      <p style="margin:0;font-size:15px;line-height:1.55;color:#2A2A28">Looks like your Toa Samoa order didn't quite go through. No stress, we saved your ${tees > 1 ? 'tees' : 'tee'} for you. Plus, here's <b>$${CODE_OFF} off</b> your order.</p>
    </td></tr>
    <tr><td style="padding:18px 28px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
        ${line(`Code ${CODE}`, `-${money(CODE_OFF)}`, 'color:#1F7A45;font-weight:700')}
        ${o.shipping ? line('Courier', money(o.shipping)) : ''}
        ${line('New total', money(total), 'font-size:16px;font-weight:700;color:#111')}
      </table>
    </td></tr>
    <tr><td align="center" style="padding:26px 28px 6px">
      <a href="${esc(link)}" style="display:inline-block;background:#E2381A;color:#fff;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:.06em;text-transform:uppercase;padding:16px 30px;border-radius:999px">Finish my order, $${CODE_OFF} off</a>
      <p style="margin:12px 0 0;font-size:13px;color:#6B6B66">Tap the button and your tees load with code <b style="color:#111">${CODE}</b> already applied.</p>
    </td></tr>
    <tr><td style="padding:24px 28px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F1EC;border-radius:8px"><tr><td style="padding:14px 16px;font-size:14px;line-height:1.5;color:#2A2A28">
        <b style="color:#111">Orders close Friday 9 October, 11:59pm.</b> Every tee is printed locally in Hastings and ready for pickup or shipped before the first game on Thursday 15 October.
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:24px 28px 30px">
      <p style="margin:0;font-size:14px;line-height:1.55;color:#6B6B66">Stuck on sizes, or had trouble paying? Just reply to this email and we will sort it.</p>
    </td></tr>
    <tr><td style="background:#111;color:#9A9A93;padding:18px 28px;font-size:12px">LAB Prints · Printed locally in Hastings, NZ</td></tr>
  </table>
</td></tr></table></body></html>`;

  const text = [
    `Hi ${first}, your Toa Samoa tees are still waiting.`, '',
    `Looks like your order didn't quite go through. No stress, we saved your ${tees > 1 ? 'tees' : 'tee'} for you. Plus, here's $${CODE_OFF} off your order.`, '',
    ...o.items.map(it => `${it.qty} x ${it.name}, ${it.colour}, size ${it.size}  ${money(it.amount)}`),
    `Code ${CODE}  -${money(CODE_OFF)}`, o.shipping ? `Courier  ${money(o.shipping)}` : null, `New total  ${money(total)}`, '',
    `Finish your order (your tees and code ${CODE} load automatically): ${link}`, '',
    'Orders close Friday 9 October, 11:59pm. Ready for pickup or shipped before the first game on Thursday 15 October.', '',
    'Stuck on sizes, or had trouble paying? Just reply to this email.',
  ].filter(l => l !== null).join('\n');

  return { html, text, subject: `Your Toa Samoa tees are still waiting ($${CODE_OFF} off inside)` };
}

module.exports = { fromSession, render, CODE };
