// Staff login + everything the iPad needs to draw the till.
// GET    /api/session               -> { me, pricing, brands, depositRate, products, testMode, readerPaired }  (401 when locked)
// POST   /api/session { pin }       -> same, and sets the session cookie
// POST   /api/session { logout: 1 } -> { ok }
// Wrong PINs are rate limited per IP: 8 misses locks that iPad out for 5 minutes.
const store = require('./_lib/store');
const { route, send, setSession, clearSession, findByPin } = require('./_lib/http');
const { PRICING, BRANDS, DEPOSIT_RATE } = require('./_lib/pricing');
const { testMode } = require('./_lib/stripe');

async function config(me) {
  const [products, reader] = await store.pipeline([['GET', 'pos:products'], ['GET', 'pos:reader']]);
  return {
    me, pricing: PRICING, depositRate: DEPOSIT_RATE,
    brands: Object.fromEntries(Object.entries(BRANDS).map(([k, b]) => [k, b.name])),
    products: (products ? JSON.parse(products) : []).filter(p => !p.archived),
    testMode: testMode('victoryco'), readerPaired: !!reader,
  };
}

module.exports = route(async (req, res) => {
  if (req.method === 'GET') {
    if (!req.staff) return send(res, 401, { error: 'Locked', locked: true });
    return config(req.staff);
  }
  if (req.body.logout) { clearSession(res); return { ok: true }; }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local').split(',')[0].trim();
  const failKey = 'pos:fail:' + ip;
  if (Number(await store.cmd('GET', failKey)) >= 8) return send(res, 429, { error: 'Too many wrong PINs. Wait 5 minutes.' });
  const pin = String(req.body.pin || '');
  const staff = /^\d{4}$/.test(pin) ? await findByPin(pin) : null;
  if (!staff) {
    await store.pipeline([['INCR', failKey], ['EXPIRE', failKey, '300']]);
    return send(res, 401, { error: 'Wrong PIN' });
  }
  await store.cmd('DEL', failKey);
  const me = { id: staff.id, name: staff.name, role: staff.role };
  setSession(res, me);
  return config(me);
}, { public: true });
