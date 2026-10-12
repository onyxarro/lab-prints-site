// Local test server: `OWNER_PIN=1234 node dev.js` then open http://localhost:4321
// Serves the static files and runs api/*.js like Vercel does. With no KV_REST_API_URL set it uses
// the in-memory store (wiped on restart). Add STRIPE_SECRET_KEY=sk_test_... to try the card flow
// against Stripe's simulated reader.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4321;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.css': 'text/css' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const m = /^\/api\/([a-z]+)$/.exec(url.pathname);
  if (m) {
    const file = path.join(__dirname, 'api', m[1] + '.js');
    if (!fs.existsSync(file)) { res.statusCode = 404; return res.end('{}'); }
    let raw = '';
    for await (const c of req) raw += c;
    req.query = Object.fromEntries(url.searchParams);
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
    return require(file)(req, res);
  }
  let p = path.join(__dirname, decodeURIComponent(url.pathname));
  if (p.endsWith('/')) p += 'index.html';
  if (!p.startsWith(__dirname) || p.includes(path.sep + 'api' + path.sep) || !fs.existsSync(p)) { res.statusCode = 404; return res.end('Not found'); }
  res.setHeader('Content-Type', TYPES[path.extname(p)] || 'application/octet-stream');
  fs.createReadStream(p).pipe(res);
}).listen(PORT, () => console.log(`LAB POS on http://localhost:${PORT}`));
