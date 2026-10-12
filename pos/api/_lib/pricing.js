// Prices, brands and legal entities. Single source of truth for the POS: the iPad shows these
// prices, and the server recalculates every cart from here, so a tampered client can't change them.
// PRICING is copied from the LAB Prints quote calculator (Desktop Files/lab-prints-quote-calculator,
// owner confirmed current Oct 2026). All prices are NZD, GST inclusive.

// A brand is what customers see; an entity is the business that legally takes the money.
// One checkout can only charge one entity. BFG & Co. gets added here once its business,
// GST status and payment account are confirmed.
const ENTITIES = {
  victoryco: { name: 'The Victory Co. Limited', gstRate: 0.15, stripeKeyEnv: 'STRIPE_SECRET_KEY' },
};
const BRANDS = {
  lab: { name: 'LAB Prints', entity: 'victoryco' },
};

const DEPOSIT_RATE = 0.5;

const PRICING = {
  brackets: [
    { key: '1-4',   min: 1,   max: 4 },
    { key: '5-9',   min: 5,   max: 9 },
    { key: '10-24', min: 10,  max: 24 },
    { key: '25-49', min: 25,  max: 49 },
    { key: '50-99', min: 50,  max: 99 },
  ],
  garments: {
    tshirt:     { label: 'T-shirt',         brackets: { '1-4': [38, 48], '5-9': [35, 44], '10-24': [32, 39], '25-49': [29, 36], '50-99': [26, 32] } },
    hoodie:     { label: 'Hoodie',          brackets: { '1-4': [75, 88], '5-9': [70, 82], '10-24': [66, 78], '25-49': [62, 74], '50-99': [58, 69] } },
    crewneck:   { label: 'Crewneck',        brackets: { '1-4': [65, 78], '5-9': [61, 73], '10-24': [57, 68], '25-49': [54, 64], '50-99': [50, 60] } },
    polo:       { label: 'Polo',            brackets: { '1-4': [48, 58], '5-9': [45, 55], '10-24': [42, 51], '25-49': [39, 48], '50-99': [36, 44] } },
    longsleeve: { label: 'Long sleeve tee', brackets: { '1-4': [45, 55], '5-9': [42, 52], '10-24': [39, 48], '25-49': [36, 45], '50-99': [33, 41] } },
    singlet:    { label: 'Singlet',         brackets: { '1-4': [36, 45], '5-9': [33, 42], '10-24': [30, 38], '25-49': [28, 35], '50-99': [25, 31] } },
  },
  // [front only, front + back] per unit
  addons: {
    sleeve:     { one: 8, both: 16 },
    oversized:  12,
    nameNumber: 15,
    packaging:  2,
  },
  artwork: { ready: 0, cleanup: 25, scratch: 50 },
  rush: 1.25,
  maxQty: 99, // 100+ is a custom quote: ring it up as a custom item
};

const cents = n => Math.round(n * 100);

function bracketFor(qty) {
  return PRICING.brackets.find(b => qty >= b.min && qty <= b.max);
}

// One print-job line from the quote builder, same maths as the calculator.
// Returns { label, detail, qty, amount (cents) } or throws on bad input.
function pricePrint(l) {
  const g = PRICING.garments[l.garment];
  const qty = Math.floor(Number(l.qty));
  if (!g) throw new Error('Unknown garment');
  if (!(qty >= 1 && qty <= PRICING.maxQty)) throw new Error('Print qty must be 1 to 99 (100+ is a custom quote)');
  const fb = l.printLocation === 'frontBack';
  const unit = g.brackets[bracketFor(qty).key][fb ? 1 : 0];
  const ex = l.extras || {};
  const sleeve = PRICING.addons.sleeve[l.sleeve] || 0;
  const perUnit = unit + sleeve + (ex.oversized ? PRICING.addons.oversized : 0)
    + (ex.nameNumber ? PRICING.addons.nameNumber : 0) + (ex.packaging ? PRICING.addons.packaging : 0);
  const artwork = PRICING.artwork[l.artwork] || 0;
  const pre = perUnit * qty + artwork;
  const total = l.rush ? pre * PRICING.rush : pre;

  const detail = [fb ? 'Front + back' : 'Front only',
    l.sleeve === 'one' && 'One sleeve', l.sleeve === 'both' && 'Both sleeves',
    ex.oversized && 'Oversized', ex.nameNumber && 'Name + number', ex.packaging && 'Packaging',
    l.artwork === 'cleanup' && 'Artwork cleanup', l.artwork === 'scratch' && 'Design from scratch',
    l.rush && 'Rush'].filter(Boolean).join(' · ');
  return { kind: 'print', brand: 'lab', label: `${g.label} print`, detail, qty, unit: cents(unit), amount: cents(total) };
}

// Whole cart -> priced lines + total. products = owner-managed quick items from the store.
function priceCart(cart, products) {
  if (!Array.isArray(cart) || !cart.length) throw new Error('Cart is empty');
  if (cart.length > 50) throw new Error('Cart too long');
  const lines = cart.map(l => {
    if (l.kind === 'print') return pricePrint(l);
    const qty = Math.floor(Number(l.qty));
    if (!(qty >= 1 && qty <= 999)) throw new Error('Bad quantity');
    if (l.kind === 'product') {
      const p = (products || []).find(x => x.id === l.id && !x.archived);
      if (!p) throw new Error('Product no longer exists, remove it from the cart');
      return { kind: 'product', brand: p.brand, productId: p.id, label: p.name, detail: '', qty, unit: p.price, amount: p.price * qty };
    }
    if (l.kind === 'custom') {
      const unit = cents(Number(l.price));
      const label = String(l.label || '').trim().slice(0, 80);
      if (!label) throw new Error('Custom item needs a description');
      if (!(unit > 0 && unit <= 1000000)) throw new Error('Custom price must be between $0.01 and $10,000');
      const brand = BRANDS[l.brand] ? l.brand : 'lab';
      return { kind: 'custom', brand, label, detail: String(l.detail || '').slice(0, 120), qty, unit, amount: unit * qty };
    }
    throw new Error('Unknown cart item');
  });
  const entities = [...new Set(lines.map(l => BRANDS[l.brand].entity))];
  if (entities.length > 1) throw new Error('This cart mixes businesses. Ring each business up as its own sale.');
  const entity = entities[0];
  const total = lines.reduce((s, l) => s + l.amount, 0);
  return { lines, total, entity, gst: gstOf(total, entity) };
}

// GST included in a GST-inclusive amount (cents): 15% rate -> total * 3/23
function gstOf(total, entity) {
  const r = ENTITIES[entity].gstRate;
  return Math.round(total * r / (1 + r));
}

module.exports = { ENTITIES, BRANDS, DEPOSIT_RATE, PRICING, pricePrint, priceCart, gstOf, bracketFor };
