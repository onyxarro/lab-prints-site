// Owner settings: staff, quick-sell products, card reader.
// GET  /api/settings -> { staff, products, reader, testMode }   (reader includes live online/offline from Stripe)
// POST /api/settings { action, ... }
//   addStaff { name, pin, role }      removeStaff { id }
//   addProduct { name, price, brand } removeProduct { id }
//   pairReader { code, label, address: { line1, city, postal_code } }   removeReader
//   Pairing code: shown on the WisePOS E (Settings > Generate pairing code). Test mode: 'simulated-wpe'.
const crypto = require('crypto');
const store = require('./_lib/store');
const { route, pinHash, fail } = require('./_lib/http');
const { BRANDS } = require('./_lib/pricing');
const { stripe, testMode } = require('./_lib/stripe');

const ENTITY = 'victoryco'; // the reader belongs to LAB's business; BFG would pair its own
const newId = () => crypto.randomBytes(5).toString('hex');

module.exports = route(async req => {
  if (req.method === 'GET') {
    const [staff, products, reader] = await Promise.all(['pos:staff', 'pos:products', 'pos:reader'].map(store.getJSON));
    let live = null;
    if (reader) {
      try { const r = await stripe(ENTITY, `terminal/readers/${reader.id}`); live = { status: r.status, device: r.device_type }; }
      catch (e) { live = { status: 'error', error: e.message }; }
    }
    return {
      staff: (staff || []).map(({ pinHash: _, ...s }) => s),
      products: (products || []).filter(p => !p.archived),
      reader: reader && { ...reader, ...live }, testMode: testMode(ENTITY),
      ownerFromEnv: !!process.env.OWNER_PIN,
    };
  }

  const b = req.body;
  switch (b.action) {
    case 'addStaff': {
      const name = String(b.name || '').trim().slice(0, 40);
      const pin = String(b.pin || '');
      if (!name) fail('Enter a name');
      if (!/^\d{4}$/.test(pin)) fail('PIN must be 4 digits');
      if (pin === process.env.OWNER_PIN) fail('That PIN is taken, pick another');
      const role = b.role === 'owner' ? 'owner' : 'staff';
      await store.update('pos:staff', (list = []) => {
        list = list || [];
        if (list.some(s => s.pinHash === pinHash(pin))) fail('That PIN is taken, pick another');
        return [...list, { id: newId(), name, role, pinHash: pinHash(pin), addedAt: Date.now() }];
      });
      return { ok: true };
    }
    case 'removeStaff':
      await store.update('pos:staff', list => (list || []).filter(s => s.id !== b.id));
      return { ok: true };
    case 'addProduct': {
      const name = String(b.name || '').trim().slice(0, 60);
      const price = Math.round(Number(b.price) * 100);
      if (!name) fail('Enter a product name');
      if (!(price > 0 && price <= 1000000)) fail('Enter a price');
      const brand = BRANDS[b.brand] ? b.brand : 'lab';
      await store.update('pos:products', list => [...(list || []), { id: newId(), name, price, brand }]);
      return { ok: true };
    }
    case 'removeProduct': // archived, not deleted, so old sales still make sense
      await store.update('pos:products', list => (list || []).map(p => (p.id === b.id ? { ...p, archived: true } : p)));
      return { ok: true };
    case 'pairReader': {
      const code = String(b.code || '').trim();
      if (!code) fail('Enter the pairing code shown on the reader');
      let location = await store.getJSON('pos:location');
      if (!location) {
        const a = b.address || {};
        if (!a.line1 || !a.city || !a.postal_code) fail('Enter the shop address (street, city, postcode) the first time');
        const loc = await stripe(ENTITY, 'terminal/locations', {
          display_name: 'LAB Prints shop',
          address: { line1: a.line1, city: a.city, postal_code: a.postal_code, country: 'NZ' },
        });
        location = { id: loc.id };
        await store.setJSON('pos:location', location);
      }
      const r = await stripe(ENTITY, 'terminal/readers', {
        registration_code: code, label: String(b.label || 'Counter reader').slice(0, 40), location: location.id,
      });
      await store.setJSON('pos:reader', { id: r.id, label: r.label, location: location.id, pairedAt: Date.now() });
      return { ok: true };
    }
    case 'removeReader':
      await store.cmd('DEL', 'pos:reader');
      return { ok: true };
  }
  fail('Unknown action');
}, { owner: true });
