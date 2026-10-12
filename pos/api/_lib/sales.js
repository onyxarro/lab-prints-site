// Sales and jobs. All money is integer cents, GST inclusive.
//
// Sale modes:
//   sale     walk-in, pay in full, take it now
//   deposit  custom job, pay DEPOSIT_RATE now, balance at pickup  (creates a job when paid)
//   jobfull  custom job, pay in full now, collect later           (creates a job when paid)
//   balance  pay what is left on an existing job, hand it over   (job -> collected)
//
// Card sales use Stripe Terminal's server-driven flow: we create a PaymentIntent and push it to
// the reader; the iPad polls until Stripe says it succeeded. A sale only counts as paid from
// Stripe's answer, never from the iPad. Cash sales are recorded straight away.
// Jobs are only created once their first payment succeeds, so a declined card leaves nothing behind.
const store = require('./store');
const { stripe, testMode } = require('./stripe');
const { BRANDS, DEPOSIT_RATE, priceCart, gstOf } = require('./pricing');
const { nzDate, nextId, fail } = require('./http');
const email = require('./email');

const JOB_STATUSES = ['received', 'printing', 'ready', 'collected'];
const saleKey = id => 'pos:sale:' + id;
const jobKey = id => 'pos:job:' + id;

function cleanCustomer(c = {}) {
  const t = (v, n) => String(v || '').trim().slice(0, n);
  const out = { name: t(c.name, 80), phone: t(c.phone, 30), email: t(c.email, 120).toLowerCase() };
  if (out.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) fail('That email address does not look right');
  return out;
}

// NZ has no 1c-5c coins: cash totals round to the nearest 10c (Swedish rounding).
const cashDue = amount => Math.round(amount / 10) * 10;

async function createSale(body, staff) {
  const mode = body.mode;
  if (!['sale', 'deposit', 'jobfull', 'balance'].includes(mode)) fail('Unknown sale type');
  const method = body.method;
  if (!['card', 'cash'].includes(method)) fail('Choose card or cash');
  const customer = cleanCustomer(body.customer);
  const notes = String(body.notes || '').trim().slice(0, 500);

  let lines, orderTotal, entity, brand, amount, jobId = null, paidBefore = 0;
  if (mode === 'balance') {
    const job = await store.getJSON(jobKey(body.jobId));
    if (!job) fail('Job not found');
    if (job.status === 'collected' && job.total - job.paid <= 0) fail('This job is already paid and collected');
    amount = job.total - job.paid;
    if (amount <= 0) fail('Nothing left to pay on this job');
    ({ lines, entity, brand } = job);
    orderTotal = job.total; jobId = job.id; paidBefore = job.paid;
    Object.assign(customer, { name: customer.name || job.customer.name, phone: customer.phone || job.customer.phone,
      email: customer.email || job.customer.email });
  } else {
    const products = (await store.getJSON('pos:products')) || [];
    const priced = priceCart(body.cart, products);
    ({ lines, entity } = priced);
    brand = lines[0].brand;
    orderTotal = priced.total;
    amount = mode === 'deposit'
      ? Math.min(orderTotal, Math.max(100, Math.round(orderTotal * DEPOSIT_RATE / 100) * 100)) // to the dollar
      : orderTotal;
    if ((mode === 'deposit' || mode === 'jobfull') && (!customer.name || !customer.phone))
      fail('Jobs need the customer name and phone number');
  }

  let cash = null;
  if (method === 'cash') {
    const due = cashDue(amount);
    const given = Math.round(Number(body.cashGiven) * 100);
    if (!(given >= due)) fail(`Cash given must be at least $${(due / 100).toFixed(2)}`);
    cash = { cashRounding: due - amount, cashGiven: given, change: given - due };
  }

  const sale = {
    id: await nextId('S-', 'sale', 5), mode, method, brand, entity, lines, orderTotal, amount,
    gst: gstOf(amount, entity), balanceAfter: orderTotal - paidBefore - amount, paidBefore,
    customer, notes, jobId, staff: { id: staff.id, name: staff.name },
    status: 'pending', createdAt: Date.now(),
  };

  if (cash) {
    Object.assign(sale, cash);
    await store.setJSON(saleKey(sale.id), sale);
    return finalize(sale.id);
  }

  const reader = await store.getJSON('pos:reader');
  if (!reader) fail('No card reader paired yet. The owner can pair it in Settings.');
  const pi = await stripe(entity, 'payment_intents', {
    amount, currency: 'nzd', payment_method_types: ['card_present'], capture_method: 'automatic',
    description: `${BRANDS[brand].name} ${sale.id}${jobId ? ' · ' + jobId : ''}`,
    metadata: { sale: sale.id, mode, staff: staff.name, job: jobId || '', source: 'lab-pos' },
  }, 'pi-' + sale.id);
  Object.assign(sale, { piId: pi.id, readerId: reader.id });
  await store.pipeline([['SET', saleKey(sale.id), JSON.stringify(sale)], ['SADD', 'pos:pending', sale.id]]);
  await pushToReader(sale);
  return sale;
}

const pushToReader = sale => stripe(sale.entity, `terminal/readers/${sale.readerId}/process_payment_intent`,
  { payment_intent: sale.piId });

// Called by the iPad every second or so while the customer taps.
// -> { sale, state: 'waiting'|'paid'|'failed'|'cancelled', message }
async function checkCard(id) {
  const sale = await store.getJSON(saleKey(id));
  if (!sale) fail('Sale not found');
  if (sale.status !== 'pending') return { sale, state: sale.status };
  const pi = await stripe(sale.entity, `payment_intents/${sale.piId}`);
  if (pi.status === 'succeeded') return { sale: await finalize(id), state: 'paid' };
  if (pi.status === 'canceled') return { sale: await markCancelled(id), state: 'cancelled' };
  const reader = await stripe(sale.entity, `terminal/readers/${sale.readerId}`);
  const a = reader.action;
  if (a && a.type === 'process_payment_intent' && a.process_payment_intent.payment_intent === sale.piId) {
    if (a.status === 'failed') return { sale, state: 'failed', message: a.failure_message || 'Card declined' };
    return { sale, state: 'waiting', message: reader.status === 'offline' ? 'Reader is offline. Check it is on and connected to wifi.' : '' };
  }
  const err = pi.last_payment_error;
  if (err) return { sale, state: 'failed', message: err.message || 'Card declined' };
  return { sale, state: 'failed', message: 'The reader stopped waiting. Tap Try again.' };
}

async function retryCard(id) {
  const sale = await store.getJSON(saleKey(id));
  if (!sale || sale.status !== 'pending' || sale.method !== 'card') fail('Nothing to retry');
  await pushToReader(sale);
  return { sale, state: 'waiting' };
}

async function cancelCard(id) {
  const sale = await store.getJSON(saleKey(id));
  if (!sale) fail('Sale not found');
  if (sale.status !== 'pending') return { sale, state: sale.status };
  try { await stripe(sale.entity, `terminal/readers/${sale.readerId}/cancel_action`, {}); } catch { /* reader idle */ }
  try { await stripe(sale.entity, `payment_intents/${sale.piId}/cancel`, {}); } catch { /* may have just succeeded */ }
  const pi = await stripe(sale.entity, `payment_intents/${sale.piId}`);
  if (pi.status === 'succeeded') return { sale: await finalize(id), state: 'paid' };
  return { sale: await markCancelled(id), state: 'cancelled' };
}

// Test mode only: pretend a customer tapped a card on the simulated reader.
async function simulateTap(id, decline) {
  const sale = await store.getJSON(saleKey(id));
  if (!sale || sale.status !== 'pending') fail('Nothing waiting');
  if (!testMode(sale.entity)) fail('Simulate only works in test mode');
  await stripe(sale.entity, `test_helpers/terminal/readers/${sale.readerId}/present_payment_method`,
    decline ? { card_present: { number: '4000000000000002' } } : {});
  return { ok: true };
}

async function markCancelled(id) {
  const sale = await store.update(saleKey(id), s => (s.status === 'pending' ? { ...s, status: 'cancelled' } : undefined))
    || await store.getJSON(saleKey(id));
  await store.cmd('SREM', 'pos:pending', id);
  return sale;
}

// Mark paid exactly once, create/update the job, index it for the day, send the receipt.
async function finalize(id) {
  let fresh = false;
  let sale = await store.update(saleKey(id), s => {
    if (s.status !== 'pending') return undefined;
    fresh = true;
    return { ...s, status: 'paid', paidAt: Date.now(), date: nzDate() };
  });
  if (!fresh) return store.getJSON(saleKey(id));

  const pay = { saleId: sale.id, amount: sale.amount, method: sale.method, at: sale.paidAt, by: sale.staff.name };
  if (sale.mode === 'deposit' || sale.mode === 'jobfull') {
    const jobId = await nextId('J-', 'job', 4);
    const job = {
      id: jobId, brand: sale.brand, entity: sale.entity, customer: sale.customer, notes: sale.notes,
      lines: sale.lines, total: sale.orderTotal, paid: sale.amount, status: 'received', payments: [pay],
      createdAt: sale.paidAt, createdBy: sale.staff.name, history: [{ status: 'received', at: sale.paidAt, by: sale.staff.name }],
    };
    await store.pipeline([['SET', jobKey(jobId), JSON.stringify(job)], ['ZADD', 'pos:jobs', String(job.createdAt), jobId]]);
    sale = await store.update(saleKey(id), s => ({ ...s, jobId }));
  } else if (sale.mode === 'balance') {
    await store.update(jobKey(sale.jobId), j => ({
      ...j, paid: j.paid + sale.amount, payments: [...j.payments, pay], status: 'collected',
      history: [...j.history, { status: 'collected', at: sale.paidAt, by: sale.staff.name }],
    }));
  }
  await store.pipeline([['RPUSH', 'pos:day:' + sale.date, sale.id], ['SREM', 'pos:pending', sale.id]]);

  if (sale.customer.email) {
    let receipt;
    try { receipt = await email.receipt(sale); } catch (e) { console.error(e); receipt = 'error'; }
    sale = await store.update(saleKey(id), s => ({ ...s, receipt }));
  }
  return sale;
}

// Card sales the iPad stopped watching (closed the app, lost wifi): settle them from Stripe.
async function reconcilePending() {
  const ids = await store.cmd('SMEMBERS', 'pos:pending');
  for (const id of ids || []) {
    const s = await store.getJSON(saleKey(id));
    if (!s || s.status !== 'pending') { await store.cmd('SREM', 'pos:pending', id); continue; }
    if (Date.now() - s.createdAt < 90e3) continue;
    try {
      const pi = await stripe(s.entity, `payment_intents/${s.piId}`);
      if (pi.status === 'succeeded') await finalize(id);
      else if (Date.now() - s.createdAt > 30 * 60e3) {
        try { await stripe(s.entity, `payment_intents/${s.piId}/cancel`, {}); } catch { /* already final */ }
        await markCancelled(id);
      }
    } catch (e) { console.error('reconcile', id, e.message); }
  }
}

async function listJobs() {
  const ids = await store.cmd('ZREVRANGE', 'pos:jobs', '0', '299');
  return (await store.mgetJSON((ids || []).map(jobKey))).filter(Boolean);
}

async function setJobStatus(id, status, staff) {
  if (!JOB_STATUSES.includes(status)) fail('Unknown status');
  let job = await store.update(jobKey(id), j => {
    if (!j) fail('Job not found');
    if (status === 'collected' && j.total - j.paid > 0) fail('Take the balance before handing it over');
    return { ...j, status, history: [...j.history, { status, at: Date.now(), by: staff.name }] };
  });
  if (status === 'ready' && job.customer.email && !job.readyEmail) {
    let readyEmail;
    try { readyEmail = await email.ready(job); } catch (e) { console.error(e); readyEmail = 'error'; }
    job = await store.update(jobKey(id), j => ({ ...j, readyEmail }));
  }
  return job;
}

async function voidSale(id, staff) {
  return store.update(saleKey(id), s => {
    if (!s) fail('Sale not found');
    if (s.status !== 'paid' || s.method !== 'cash' || s.mode !== 'sale')
      fail('Only paid cash walk-in sales can be voided here. Refund card payments in the Stripe dashboard.');
    return { ...s, status: 'void', voidedAt: Date.now(), voidedBy: staff.name };
  });
}

async function dayReport(date) {
  await reconcilePending();
  const ids = await store.cmd('LRANGE', 'pos:day:' + date, '0', '-1');
  const sales = (await store.mgetJSON((ids || []).map(saleKey))).filter(Boolean);
  const paid = sales.filter(s => s.status === 'paid');
  const sum = (arr, f = s => s.amount) => arr.reduce((t, s) => t + f(s), 0);
  const byStaff = {}, byMode = { sale: 0, deposit: 0, jobfull: 0, balance: 0 };
  for (const s of paid) {
    byStaff[s.staff.name] = byStaff[s.staff.name] || { count: 0, amount: 0 };
    byStaff[s.staff.name].count++; byStaff[s.staff.name].amount += s.amount;
    byMode[s.mode] += s.amount;
  }
  const cash = paid.filter(s => s.method === 'cash');
  return {
    date, sales,
    totals: {
      count: paid.length, taken: sum(paid), gst: sum(paid, s => s.gst),
      card: sum(paid.filter(s => s.method === 'card')), cash: sum(cash),
      cashRounding: sum(cash, s => s.cashRounding || 0), byMode, byStaff,
    },
  };
}

module.exports = { createSale, checkCard, retryCard, cancelCard, simulateTap, listJobs, setJobStatus,
  voidSale, dayReport, reconcilePending, JOB_STATUSES, cashDue };
