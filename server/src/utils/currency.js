const config = require('../config');

/**
 * Currency Utility: Uses integer paise internally to avoid floating-point errors.
 * 1 INR = 100 paise.
 */

function formatPaiseToINR(paise) {
  const amount = (Number(paise || 0) / 100).toFixed(2);
  const parts = amount.split('.');
  // Indian currency formatting: e.g. 1,00,000.00
  let intPart = parts[0];
  const lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);
  if (otherNumbers !== '') {
    intPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return `₹${intPart}.${parts[1]}`;
}

function rupeesToPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

function paiseToRupees(paise) {
  return Number((Number(paise || 0) / 100).toFixed(2));
}

/**
 * Server-side order calculation strictly using integer arithmetic.
 * Never trust client totals!
 */
function calculateOrderTotals(itemsWithPrices) {
  let subtotalPaise = 0;

  for (const item of itemsWithPrices) {
    const qty = parseInt(item.quantity, 10);
    const price = parseInt(item.unitPricePaise, 10);
    if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
      throw new Error(`Invalid item quantity or price for ${item.productName || 'product'}`);
    }
    subtotalPaise += qty * price;
  }

  // Determine shipping: free if above threshold
  let shippingFeePaise = 0;
  if (subtotalPaise > 0) {
    shippingFeePaise = subtotalPaise >= config.freeShippingThresholdPaise ? 0 : config.standardShippingFeePaise;
  }

  // Calculate tax: 18% GST (rounded to nearest paise)
  const taxPaise = Math.round((subtotalPaise * config.taxRatePercent) / 100);

  const totalPaise = subtotalPaise + shippingFeePaise + taxPaise;

  return {
    subtotalPaise,
    shippingFeePaise,
    taxPaise,
    totalPaise,
    subtotalFormatted: formatPaiseToINR(subtotalPaise),
    shippingFeeFormatted: formatPaiseToINR(shippingFeePaise),
    taxFormatted: formatPaiseToINR(taxPaise),
    totalFormatted: formatPaiseToINR(totalPaise),
  };
}

module.exports = {
  formatPaiseToINR,
  rupeesToPaise,
  paiseToRupees,
  calculateOrderTotals,
};
