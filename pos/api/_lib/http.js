// Request helpers + staff sessions.
// Staff log in with a 4-digit PIN (OWNER_PIN must be 4 digits too). The session is a signed cookie (HMAC with SESSION_SECRET),
// so there is no session table. PINs are stored only as HMACs.
// The owner's PIN comes from the OWNER_PIN env var, so the owner can never be locked out.
const crypto = require('crypto');
const store = require('./store');

const SECRET = process.env.SESSION_SECRET || (process.env.VERCEL ? '' : 'local-dev-secret');
const SESSION_HOURS = 14;

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

// Wrap a handler: JSON body, error -> { error } with 400, session attached as req.staff.
// opts.owner = owner only, opts.public = no login needed.
function route(handler, opts = {}) {
  return async (req, res) => {
    try {
      if (!SECRET) return send(res, 500, { error: 'SESSION_SECRET env var is not set' });
      if (typeof req.body === 'string') { try { req.body = JSON.parse(req.body || '{}'); } catch { req.body = {}; } }
      req.body = req.body || {};
      req.staff = readSession(req);
      if (!opts.public && !req.staff) return send(res, 401, { error: 'Locked', locked: true });
      if (opts.owner && req.staff.role !== 'owner') return send(res, 403, { error: 'Owner only' });
      const out = await handler(req, res);
      if (out !== undefined) send(res, 200, out);
    } catch (e) {
      console.error(e);
      send(res, e.status || 400, { error: e.message || 'Something went wrong' });
    }
  };
}

const sign = s => crypto.createHmac('sha256', SECRET).update(s).digest('base64url');
const pinHash = pin => sign('pin:' + pin);

function readSession(req) {
  const m = /(?:^|;\s*)pos_s=([^;]+)/.exec(req.headers.cookie || '');
  if (!m) return null;
  const [body, sig] = m[1].split('.');
  if (!body || !sig) return null;
  const want = sign(body);
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  try {
    const s = JSON.parse(Buffer.from(body, 'base64url').toString());
    return s.exp > Date.now() ? s : null;
  } catch { return null; }
}

function setSession(res, staff) {
  const body = Buffer.from(JSON.stringify({ id: staff.id, name: staff.name, role: staff.role,
    exp: Date.now() + SESSION_HOURS * 3600e3 })).toString('base64url');
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader('Set-Cookie', `pos_s=${body}.${sign(body)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${secure}`);
}
const clearSession = res => res.setHeader('Set-Cookie', 'pos_s=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');

async function findByPin(pin) {
  if (process.env.OWNER_PIN && pin === process.env.OWNER_PIN)
    return { id: 'owner', name: process.env.OWNER_NAME || 'Owner', role: 'owner' };
  const staff = (await store.getJSON('pos:staff')) || [];
  const h = pinHash(pin);
  return staff.find(s => s.pinHash === h) || null;
}

// NZ calendar date for reports: 'YYYY-MM-DD'
const nzDate = (t = Date.now()) => new Date(t).toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });

// Short readable ids: S-00042 (sale), J-0042 (job)
async function nextId(prefix, name, pad) {
  const n = await store.cmd('INCR', 'pos:seq:' + name);
  return prefix + String(n).padStart(pad, '0');
}

function fail(msg, status = 400) { const e = new Error(msg); e.status = status; throw e; }

module.exports = { send, route, pinHash, setSession, clearSession, findByPin, nzDate, nextId, fail };
