// GET /api/report?date=YYYY-MM-DD  (owner)  -> { date, sales, totals }  defaults to today, NZ time
const sales = require('./_lib/sales');
const { route, nzDate, fail } = require('./_lib/http');

module.exports = route(async req => {
  const date = String(req.query.date || nzDate());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('Bad date');
  return sales.dayReport(date);
}, { owner: true });
