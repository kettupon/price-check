(function (root) {
  'use strict';

  const BASE_FACTOR = { ml: 1, cc: 1, L: 1000, 'ลิตร': 1000, g: 1, 'กรัม': 1, kg: 1000, 'กก': 1000 };
  const positive = value => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  // Quantity is the number of purchasable packs. A tier price is the price
  // for one pack at or above minQuantity, never a price for the whole basket.
  function quote(offer, quantity = 1, includeShipping = false) {
    const packs = Math.max(1, Math.floor(positive(quantity) || 1));
    const basePrice = positive(offer.price);
    const tiers = (Array.isArray(offer.priceTiers) ? offer.priceTiers : [])
      .map(tier => ({ minQuantity: Math.floor(positive(tier.minQuantity)), unitPrice: positive(tier.unitPrice) }))
      .filter(tier => tier.minQuantity >= 1 && tier.unitPrice > 0)
      .sort((a, b) => a.minQuantity - b.minQuantity);
    const activeTier = tiers.filter(tier => tier.minQuantity <= packs).at(-1) || null;
    const packPrice = activeTier ? activeTier.unitPrice : basePrice;
    const cashback = offer.cashbackUsed ? positive(offer.cashbackAmount) : 0;
    const shipping = includeShipping && offer.shippingType === 'excluded' ? positive(offer.shippingFee) : 0;
    const total = Math.max(0, (packPrice - cashback) * packs) + shipping;
    const unitQuantity = positive(offer.unitQuantity) || 1;
    const subCount = offer.subUnitMode === 'many' ? (positive(offer.subUnitCount) || 1) : 1;
    const itemsPerPack = unitQuantity * subCount;
    const size = positive(offer.subUnitSize);
    const factor = BASE_FACTOR[offer.subUnitSizeType] || 0;
    const hasMeasure = ['volume', 'weight'].includes(offer.subUnitCategory) && size > 0 && factor > 0;
    const measurePerPack = hasMeasure
      ? size * factor * (offer.subUnitMode === 'many' && offer.subUnitEqual ? subCount : 1) * unitQuantity
      : 0;
    return {
      quantity: packs, packPrice, total, activeTier,
      itemsPerPack, perItem: total / (itemsPerPack * packs),
      measurePerPack, per100: measurePerPack ? total / (measurePerPack * packs) * 100 : null,
      measureUnit: ['g', 'กรัม', 'kg', 'กก'].includes(offer.subUnitSizeType) ? '100g' : '100ml'
    };
  }

  root.DealHunterPricing = { quote };
  if (typeof module !== 'undefined' && module.exports) module.exports = { quote };
})(typeof window !== 'undefined' ? window : globalThis);
