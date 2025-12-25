// Promotion service helpers
// Provides utilities to determine active promotions and compute discounted prices.

export function isPromotionActive(promo) {
  if (!promo) return false;
  const { promoActive, promoStart, promoEnd } = promo;
  if (!promoActive) return false;
  const now = Date.now();
  const startTs = promoStart ? Date.parse(promoStart) : null;
  const endTs = promoEnd ? Date.parse(promoEnd) : null;
  if (startTs && now < startTs) return false;
  if (endTs && now > endTs) return false;
  return true;
}

export function applyPromotion(basePrice, promo) {
  if (!promo || !isPromotionActive(promo)) return basePrice;
  const { promoType, promoValue } = promo;
  if (!promoType || !Number.isFinite(promoValue)) return basePrice;
  let discounted = basePrice;
  if (promoType === 'percent') {
    discounted = basePrice * (1 - Math.min(100, Math.max(0, promoValue)) / 100);
  } else if (promoType === 'amount') {
    discounted = basePrice - Math.max(0, promoValue);
  }
  return Math.max(0, parseFloat(discounted.toFixed(2)));
}
