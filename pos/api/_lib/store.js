// Tiny Redis client for Upstash's REST API (added to the Vercel project from the Marketplace,
// which sets KV_REST_API_URL / KV_REST_API_TOKEN). No npm deps, plain fetch.
// Running locally without those env vars falls back to an in-memory store (dev only: it is
// wiped on restart and refuses to run on Vercel).
//
// Keys:
//   pos:staff            JSON [{ id, name, role, pinHash }]
//   pos:products         JSON [{ id, name, price (cents), brand, archived }]
//   pos:reader           JSON { id, label, location }
//   pos:sale:<id>        JSON sale record
//   pos:day:<YYYY-MM-DD> list of sale ids paid that day (NZ time)
//   pos:pending          set of card sale ids still waiting on the reader
//   pos:job:<id>         JSON job record
//   pos:jobs             sorted set of job ids by created time
//   pos:seq:<name>       counters for human-readable ids

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function pipeline(cmds) {
  if (!URL_) return mem(cmds);
  const r = await fetch(URL_ + '/pipeline', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  });
  const data = await r.json();
  if (!r.ok) throw new Error('store ' + r.status);
  return data.map(d => { if (d.error) throw new Error('store ' + d.error); return d.result; });
}
const cmd = async (...args) => (await pipeline([args]))[0];

const getJSON = async key => { const v = await cmd('GET', key); return v ? JSON.parse(v) : null; };
const setJSON = (key, val) => cmd('SET', key, JSON.stringify(val));
async function mgetJSON(keys) {
  if (!keys.length) return [];
  return (await cmd('MGET', ...keys)).map(v => (v ? JSON.parse(v) : null));
}

// Run fn on a JSON value under a short lock so two iPads can't overwrite each other's change.
async function update(key, fn) {
  const lock = 'lock:' + key;
  for (let i = 0; i < 40; i++) {
    if (await cmd('SET', lock, '1', 'NX', 'PX', '5000')) {
      try {
        const next = await fn(await getJSON(key));
        if (next !== undefined) await setJSON(key, next);
        return next;
      } finally { await cmd('DEL', lock); }
    }
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('Busy, try again');
}

// ---- in-memory fallback (local dev only) ----
const M = new Map();
function mem(cmds) {
  if (process.env.VERCEL) throw new Error('Database not connected: add Upstash Redis to the Vercel project');
  return cmds.map(([op, k, ...a]) => {
    const now = Date.now();
    const e = M.get(k);
    if (e && e.exp && e.exp < now) M.delete(k);
    const v = M.has(k) ? M.get(k).v : null;
    switch (op) {
      case 'GET': return v;
      case 'SET': {
        if (a.includes('NX') && v !== null) return null;
        const px = a.indexOf('PX'), ex = a.indexOf('EX');
        const exp = px > -1 ? now + Number(a[px + 1]) : ex > -1 ? now + Number(a[ex + 1]) * 1000 : 0;
        M.set(k, { v: a[0], exp }); return 'OK';
      }
      case 'DEL': return M.delete(k) ? 1 : 0;
      case 'MGET': return [k, ...a].map(x => (M.has(x) ? M.get(x).v : null));
      case 'INCR': { const n = Number(v || 0) + 1; M.set(k, { v: String(n), exp: e ? e.exp : 0 }); return n; }
      case 'EXPIRE': if (M.has(k)) M.get(k).exp = now + Number(a[0]) * 1000; return 1;
      case 'RPUSH': { const l = v || []; l.push(...a); M.set(k, { v: l }); return l.length; }
      case 'LRANGE': return (v || []).slice(Number(a[0]), Number(a[1]) === -1 ? undefined : Number(a[1]) + 1);
      case 'SADD': { const s = v || []; a.forEach(x => s.includes(x) || s.push(x)); M.set(k, { v: s }); return 1; }
      case 'SREM': { M.set(k, { v: (v || []).filter(x => !a.includes(x)) }); return 1; }
      case 'SMEMBERS': return v || [];
      case 'ZADD': { const z = (v || []).filter(x => x[1] !== a[1]); z.push([Number(a[0]), a[1]]); M.set(k, { v: z }); return 1; }
      case 'ZREVRANGE': return (v || []).slice().sort((x, y) => y[0] - x[0]).map(x => x[1]).slice(Number(a[0]), Number(a[1]) + 1);
      default: throw new Error('mem: unsupported ' + op);
    }
  });
}

module.exports = { cmd, pipeline, getJSON, setJSON, mgetJSON, update };
