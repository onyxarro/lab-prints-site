// GET  /api/jobs                  -> { jobs: [...] }  newest first, last 300
// POST /api/jobs { id, status }   -> job   (received | printing | ready | collected)
//   Moving to ready emails the customer once, if we have their email.
const sales = require('./_lib/sales');
const { route } = require('./_lib/http');

module.exports = route(async req => {
  if (req.method === 'GET') {
    await sales.reconcilePending();
    return { jobs: await sales.listJobs() };
  }
  return sales.setJobStatus(String(req.body.id || ''), req.body.status, req.staff);
});
