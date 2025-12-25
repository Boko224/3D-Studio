// Dynamic shipping calculation service
// Computes shipping price and ETA based on method, total weight, subtotal value, and destination city.

// Default weights by category for items missing explicit weight (grams)
const DEFAULT_CATEGORY_WEIGHTS = {
  keychains: 50,
  figures: 300,
  parts: 200,
  organizers: 400,
  default: 150,
};

// Helper: get per-item weight (grams)
export function resolveItemWeightGrams(item) {
  if (item?.weightGrams && Number.isFinite(item.weightGrams)) return item.weightGrams;
  // try infer from name or category if available
  const category = item?.category || 'default';
  return DEFAULT_CATEGORY_WEIGHTS[category] || DEFAULT_CATEGORY_WEIGHTS.default;
}

// Helper: sum total weight of cart (grams)
export function getCartTotalWeightGrams(cartItems) {
  return (cartItems || []).reduce((sum, item) => {
    const qty = Math.max(1, item.quantity || 1);
    return sum + resolveItemWeightGrams(item) * qty;
  }, 0);
}

// Calculate shipping price and ETA
// methodId: 'econt' | 'speedy' | 'pickup'
// cartItems: array of items
// city: destination city string
// subtotal: order subtotal (items total price)
export function calculateShipping({ methodId, cartItems, city, subtotal }) {
  const grams = getCartTotalWeightGrams(cartItems);
  const kg = grams / 1000;
  const isSofia = (city || '').trim().toLowerCase() === 'софия' || (city || '').trim().toLowerCase() === 'sofia';

  // Insurance on high-value orders (simple model)
  const insuranceThreshold = 50; // лв
  const insuranceRate = 0.005; // 0.5%
  const insuranceFee = subtotal > insuranceThreshold ? subtotal * insuranceRate : 0;

  // Remote surcharge (outside Sofia)
  const remoteSurcharge = !isSofia && methodId !== 'pickup' ? 0.5 : 0;

  let basePrice = 0;
  let perHalfKg = 0;
  let eta = '1-2 дни';

  if (methodId === 'pickup') {
    basePrice = 0;
    perHalfKg = 0;
    eta = 'Същия ден (по уговорка)';
  } else if (methodId === 'econt') {
    basePrice = 4.0; // up to 0.5kg
    perHalfKg = 0.8; // each additional 0.5kg
    eta = isSofia ? 'Следващ ден (24-48 часа)' : '1-2 дни';
  } else if (methodId === 'speedy') {
    basePrice = 4.5; // up to 0.5kg
    perHalfKg = 0.7; // each additional 0.5kg
    eta = isSofia ? 'Следващ ден (24-48 часа)' : '1-2 дни';
  } else {
    // Unknown method fallback
    basePrice = 4.0;
    perHalfKg = 0.8;
  }

  // Weight-based increments beyond first 0.5kg
  const halfKgBlocks = Math.max(0, Math.ceil((kg - 0.5) / 0.5));
  const weightFee = halfKgBlocks * perHalfKg;

  const price = parseFloat((basePrice + weightFee + insuranceFee + remoteSurcharge).toFixed(2));

  return {
    price,
    eta,
    breakdown: {
      basePrice,
      weightFee,
      insuranceFee: parseFloat(insuranceFee.toFixed(2)),
      remoteSurcharge,
      totalWeightGrams: grams,
      totalWeightKg: parseFloat(kg.toFixed(3)),
      methodId,
    },
  };
}
