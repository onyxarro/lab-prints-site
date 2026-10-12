// Stripe REST via fetch (same approach as toa-samoa). The key is chosen per legal entity,
// so a second business can bring its own Stripe account later.
const { ENTITIES } = require('./pricing');

const keyFor = entity => process.env[(ENTITIES[entity] || ENTITIES.victoryco).stripeKeyEnv] || '';
const testMode = entity => keyFor(entity).startsWith('sk_test');

// Stripe's API takes form encoding with bracketed keys: metadata[sale]=S-00001
function form(obj, prefix, out) {
  out = out || [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v !== null && typeof v === 'object') form(v, key, out);
    else if (v !== undefined) out.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return out.join('&');
}

async function stripe(entity, path, body, idempotencyKey) {
  const key = keyFor(entity);
  if (!key) throw new Error('Card payments are not set up yet (no Stripe key)');
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  const r = await fetch('https://api.stripe.com/v1/' + path, {
    method: body ? 'POST' : 'GET', headers, body: body ? form(body) : undefined,
  });
  const data = await r.json();
  if (!r.ok) throw new Error((data.error && data.error.message) || `Stripe ${r.status}`);
  return data;
}

module.exports = { stripe, testMode, keyFor };
