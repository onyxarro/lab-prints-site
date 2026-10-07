// Follow-up ("come back") discount. One code; the size depends on the tees total after the
// multi-buy deal (courier not counted). Mirrored in index.html (PROMO_TIERS) for display only.
// COMEBACK5 is the old code name, still accepted.

const CODES = ['COMEBACK', 'COMEBACK5'];
const TIERS = [
  { min: 150, label: '15% off', coupon: 'toa-comeback-15pct', stripe: { percent_off: 15 } },
  { min: 70,  label: '10% off', coupon: 'toa-comeback-10pct', stripe: { percent_off: 10 } },
  { min: 0,   label: '$5 off',  coupon: 'toa-comeback-5',     stripe: { amount_off: 500, currency: 'nzd' } },
];

const valid = code => CODES.includes(String(code || '').trim().toUpperCase());
const tierFor = teesDollars => TIERS.find(t => teesDollars >= t.min);
// Dollars off, rounded to cents (Stripe may differ by a cent on percentage coupons).
const offFor = teesDollars => {
  const t = tierFor(teesDollars);
  return t.stripe.percent_off ? Math.round(teesDollars * t.stripe.percent_off) / 100 : Math.min(5, teesDollars);
};

module.exports = { CODE: CODES[0], TIERS, valid, tierFor, offFor };
