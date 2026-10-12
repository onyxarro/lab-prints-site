// POST /api/sale { mode, method, cart | jobId, customer, notes, cashGiven }  -> sale (cash: already paid)
// GET  /api/sale?id=S-00001                                              -> { sale, state, message }  (card polling)
// POST /api/sale { id, action: 'retry' | 'cancel' | 'simulate' | 'decline' | 'void' }
//   simulate/decline = test mode only (fake tap on the simulated reader); void = owner, cash walk-ins only.
const sales = require('./_lib/sales');
const { route, fail } = require('./_lib/http');

module.exports = route(async req => {
  if (req.method === 'GET') return sales.checkCard(String(req.query.id || ''));
  const { id, action } = req.body;
  if (!action) return sales.createSale(req.body, req.staff);
  if (action === 'retry') return sales.retryCard(id);
  if (action === 'cancel') return sales.cancelCard(id);
  if (action === 'simulate' || action === 'decline') return sales.simulateTap(id, action === 'decline');
  if (action === 'void') {
    if (req.staff.role !== 'owner') fail('Owner only', 403);
    return sales.voidSale(id, req.staff);
  }
  fail('Unknown action');
});
