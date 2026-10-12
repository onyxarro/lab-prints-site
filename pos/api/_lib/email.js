// Customer emails via Brevo: receipts after every payment, and "your order is ready" for jobs.
// Env: BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME (default LAB Prints), BREVO_REPLY_TO.
// Without BREVO_API_KEY emails are skipped (the sale still goes through).
const { BRANDS, ENTITIES } = require('./pricing');

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = c => '$' + (c / 100).toFixed(2);

async function brevo(to, subject, html, text) {
  if (!process.env.BREVO_API_KEY) return 'skipped';
  const sender = process.env.BREVO_SENDER_EMAIL || 'sales@labprints.co.nz';
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: process.env.BREVO_SENDER_NAME || 'LAB Prints', email: sender },
      replyTo: { email: process.env.BREVO_REPLY_TO || sender },
      to: [{ email: to }], subject, htmlContent: html, textContent: text,
    }),
  });
  if (!r.ok) throw new Error('brevo ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return 'sent';
}

function shell(title, inner) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#F3F1EC;font-family:Helvetica,Arial,sans-serif;color:#111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F1EC"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:12px">
<tr><td style="background:#111;color:#fff;padding:18px 24px;border-radius:12px 12px 0 0;font-size:22px;font-weight:800;letter-spacing:2px">LAB PRINTS</td></tr>
<tr><td style="padding:24px">${inner}</td></tr>
</table></td></tr></table></body></html>`;
}

const MODE_TITLE = { sale: 'Receipt', deposit: 'Deposit receipt', jobfull: 'Receipt', balance: 'Final payment receipt' };

function receipt(sale) {
  const ent = ENTITIES[sale.entity];
  const rows = sale.lines.map(l => `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #E3DFD3;font-size:14px">${esc(l.label)}${l.detail ? `<br><span style="color:#6B6B66;font-size:12px">${esc(l.detail)}</span>` : ''}<br><span style="color:#6B6B66;font-size:12px">Qty ${l.qty}</span></td>
    <td style="padding:10px 0;border-bottom:1px solid #E3DFD3;font-size:14px;text-align:right;white-space:nowrap">${money(l.amount)}</td></tr>`).join('');
  const row = (k, v, b) => `<tr><td style="padding:4px 0;font-size:14px;color:${b ? '#111' : '#6B6B66'}">${k}</td><td style="padding:4px 0;font-size:14px;text-align:right;${b ? 'font-weight:700' : ''}">${v}</td></tr>`;
  const job = sale.jobId ? row('Job number', esc(sale.jobId), true) : '';
  const summary = [
    row('Order total', money(sale.orderTotal)),
    sale.mode === 'deposit' && row('Deposit paid today', money(sale.amount), true),
    sale.mode === 'balance' && row('Paid today', money(sale.amount), true),
    (sale.mode === 'sale' || sale.mode === 'jobfull') && row('Paid', money(sale.amount), true),
    sale.balanceAfter > 0 && row('Balance due at pickup', money(sale.balanceAfter), true),
    row(`Includes GST (${Math.round(ent.gstRate * 100)}%)`, money(sale.gst)),
    row('Paid by', sale.method === 'card' ? 'Card' : 'Cash'),
  ].filter(Boolean).join('');
  const when = new Date(sale.paidAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland', dateStyle: 'medium', timeStyle: 'short' });
  const title = MODE_TITLE[sale.mode];
  const next = sale.mode === 'deposit' ? '<p style="font-size:14px;line-height:1.5">We will let you know when your order is ready. Pay the balance when you pick it up.</p>'
    : sale.mode === 'jobfull' ? '<p style="font-size:14px;line-height:1.5">Fully paid. We will let you know when your order is ready to pick up.</p>' : '';
  const html = shell(title, `
    <h1 style="margin:0 0 4px;font-size:22px">${title}</h1>
    <p style="margin:0 0 16px;color:#6B6B66;font-size:13px">${esc(sale.id)} · ${esc(when)}</p>
    <table width="100%" cellpadding="0" cellspacing="0">${job}</table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px">${rows}</table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">${summary}</table>
    ${next}
    <p style="margin:20px 0 0;color:#6B6B66;font-size:12px;line-height:1.5">${esc(BRANDS[sale.brand].name)} · ${esc(ent.name)}${process.env.GST_NUMBER ? ' · GST ' + esc(process.env.GST_NUMBER) : ''}<br>Questions? Reply to this email.</p>`);
  const text = [`LAB Prints ${title}`, `${sale.id} · ${when}`, sale.jobId && `Job ${sale.jobId}`, '',
    ...sale.lines.map(l => `${l.qty} x ${l.label}${l.detail ? ' (' + l.detail + ')' : ''}  ${money(l.amount)}`), '',
    `Order total ${money(sale.orderTotal)}`, `Paid today ${money(sale.amount)} (${sale.method})`,
    sale.balanceAfter > 0 && `Balance due at pickup ${money(sale.balanceAfter)}`,
    `Includes GST ${money(sale.gst)}`, process.env.GST_NUMBER && `GST ${process.env.GST_NUMBER}`, `${ent.name}`].filter(Boolean).join('\n');
  return brevo(sale.customer.email, `LAB Prints ${title.toLowerCase()} ${sale.jobId || sale.id}`, html, text);
}

function ready(job) {
  const first = esc((job.customer.name || '').split(' ')[0] || 'there');
  const bal = job.total - job.paid;
  const html = shell('Your order is ready', `
    <h1 style="margin:0 0 12px;font-size:22px">Kia ora ${first}, your order is ready</h1>
    <p style="font-size:14px;line-height:1.5">Job <b>${esc(job.id)}</b> is printed and ready to pick up from the shop.</p>
    <p style="font-size:14px;line-height:1.5">${bal > 0 ? `Balance to pay at pickup: <b>${money(bal)}</b>` : 'It is fully paid, just come and grab it.'}</p>
    <p style="margin:20px 0 0;color:#6B6B66;font-size:12px">Questions? Reply to this email.</p>`);
  const text = `Kia ora ${job.customer.name}, your LAB Prints order ${job.id} is ready to pick up.\n${bal > 0 ? 'Balance to pay at pickup: ' + money(bal) : 'Fully paid.'}`;
  return brevo(job.customer.email, `Your LAB Prints order ${job.id} is ready`, html, text);
}

module.exports = { receipt, ready };
