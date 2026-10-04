// Meta Conversions API: server-side Purchase, deduplicated with the browser pixel by event_id = order ref.
// Catches purchases the browser pixel misses (ad blockers, iOS, closed tabs).
// Env: META_PIXEL_ID + META_CAPI_TOKEN (Events Manager > pixel > Settings > Conversions API > Generate access token).
// Optional META_TEST_CODE (Events Manager > Test events) while checking it works.
const crypto = require('crypto');

const sha = v => (v ? crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex') : undefined);
// NZ numbers to E.164 digits: 021 123 4567 -> 64211234567
const nzPhone = p => {
  let d = String(p || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '64' + d.slice(1);
  return d.length >= 8 ? d : '';
};

async function sendPurchase(s, site) {
  const id = process.env.META_PIXEL_ID, token = process.env.META_CAPI_TOKEN;
  if (!id || !token) return 'capi off';
  const m = s.metadata || {}, cd = s.customer_details || {};
  const parts = String(m.name || cd.name || '').trim().split(/\s+/);
  const addr = cd.address || {};
  const user_data = {
    em: [sha(cd.email || s.customer_email)].filter(Boolean),
    ph: [sha(nzPhone(m.phone || cd.phone))].filter(Boolean),
    fn: [sha(parts[0])].filter(Boolean),
    ln: [sha(parts.length > 1 ? parts[parts.length - 1] : '')].filter(Boolean),
    ct: [sha(String(addr.city || '').replace(/\s+/g, ''))].filter(Boolean),
    zp: [sha(addr.postal_code)].filter(Boolean),
    country: [sha('nz')],
    client_ip_address: m.px_ip || undefined,
    client_user_agent: m.px_ua || undefined,
    fbp: m.px_fbp || undefined,
    fbc: m.px_fbc || undefined,
  };
  const body = {
    data: [{
      event_name: 'Purchase',
      event_time: s.created || Math.floor(Date.now() / 1000),
      event_id: m.order_ref || s.client_reference_id,
      action_source: 'website',
      event_source_url: `${site}/`,
      user_data,
      custom_data: { currency: 'NZD', value: (s.amount_total || 0) / 100, num_items: Number(m.tees) || undefined, content_type: 'product' },
    }],
  };
  if (process.env.META_TEST_CODE) body.test_event_code = process.env.META_TEST_CODE;
  const r = await fetch(`https://graph.facebook.com/v21.0/${id}/events?access_token=${encodeURIComponent(token)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data.error && data.error.message) || `Meta ${r.status}`);
  return 'capi sent';
}

module.exports = { sendPurchase };
