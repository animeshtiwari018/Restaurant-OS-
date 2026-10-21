import test from 'node:test';
import assert from 'node:assert/strict';

// Core financial logic isolated for unit verification
function calculateOrderTotals(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Items required');
    }

    let subtotalPaise = 0;
    for (const item of items) {
        const qty = parseInt(item.quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            throw new Error('Invalid quantity');
        }
        subtotalPaise += item.price_paise * qty;
    }

    // Standard 5% GST for restaurant services rounded to nearest integer paise
    const taxPaise = Math.round(subtotalPaise * 0.05);
    const totalPaise = subtotalPaise + taxPaise;

    return { subtotalPaise, taxPaise, totalPaise };
}

test('calculates single item order subtotal and GST correctly in integer paise', () => {
    const items = [{ price_paise: 38500, quantity: 2 }]; // 2 × ₹385.00 = ₹770.00
    const totals = calculateOrderTotals(items);

    assert.equal(totals.subtotalPaise, 77000);
    assert.equal(totals.taxPaise, 3850); // 5% of 77000 = 3850 paise (₹38.50)
    assert.equal(totals.totalPaise, 80850); // ₹808.50
});

test('handles multi-item order with paise rounding correctly', () => {
    const items = [
        { price_paise: 38500, quantity: 2 }, // ₹770.00
        { price_paise: 7500, quantity: 3 },  // ₹225.00
        { price_paise: 5500, quantity: 2 },  // ₹110.00
    ];
    // Subtotal: 77000 + 22500 + 11000 = 110500 paise (₹1105.00)
    // 5% GST: 110500 * 0.05 = 5525 paise (₹55.25)
    // Total: 116025 paise (₹1160.25)
    const totals = calculateOrderTotals(items);

    assert.equal(totals.subtotalPaise, 110500);
    assert.equal(totals.taxPaise, 5525);
    assert.equal(totals.totalPaise, 116025);
});

test('rejects negative or zero quantity items', () => {
    assert.throws(() => calculateOrderTotals([{ price_paise: 1000, quantity: 0 }]), /Invalid quantity/);
    assert.throws(() => calculateOrderTotals([{ price_paise: 1000, quantity: -2 }]), /Invalid quantity/);
});
