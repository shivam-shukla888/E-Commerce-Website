const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { calculateOrderTotals, paiseToRupees, rupeesToPaise, formatPaiseToINR } = require('../src/utils/currency');

describe('Currency & Order Calculation Unit Tests', () => {
  test('converts rupees to paise accurately without floating point glitches', () => {
    assert.equal(rupeesToPaise(1499.50), 149950);
    assert.equal(rupeesToPaise(29.99), 2999);
    assert.equal(rupeesToPaise(0), 0);
  });

  test('converts paise to rupees decimal correctly', () => {
    assert.equal(paiseToRupees(149950), 1499.50);
    assert.equal(paiseToRupees(2999), 29.99);
  });

  test('formats paise to Indian Rupee currency standard', () => {
    const formatted = formatPaiseToINR(149900);
    assert.match(formatted, /₹1,499\.00/);
  });

  test('calculates order total with standard shipping when below threshold (₹999)', () => {
    // Single item of ₹500 (50000 paise)
    const items = [
      { productId: 1, productName: 'Test Item', unitPricePaise: 50000, quantity: 1 }
    ];
    const totals = calculateOrderTotals(items);

    assert.equal(totals.subtotalPaise, 50000);
    assert.equal(totals.shippingFeePaise, 9900); // ₹99 shipping
    assert.equal(totals.taxPaise, 9000); // 18% of 50000 = 9000
    assert.equal(totals.totalPaise, 50000 + 9900 + 9000); // 68900
  });

  test('qualifies for free shipping when subtotal is above ₹999 (99900 paise)', () => {
    // Single item of ₹1500 (150000 paise)
    const items = [
      { productId: 1, productName: 'Luxury Item', unitPricePaise: 150000, quantity: 1 }
    ];
    const totals = calculateOrderTotals(items);

    assert.equal(totals.subtotalPaise, 150000);
    assert.equal(totals.shippingFeePaise, 0); // FREE shipping
    assert.equal(totals.taxPaise, 27000); // 18% of 150000 = 27000
    assert.equal(totals.totalPaise, 177000);
  });

  test('throws error for invalid non-positive quantities or negative prices', () => {
    assert.throws(() => {
      calculateOrderTotals([{ productId: 1, unitPricePaise: 100, quantity: 0 }]);
    }, /Invalid item quantity/);

    assert.throws(() => {
      calculateOrderTotals([{ productId: 1, unitPricePaise: -50, quantity: 1 }]);
    }, /Invalid item quantity or price/);
  });
});
