import test from 'node:test';
import assert from 'node:assert/strict';
import {
    PLAN_TIERS,
    compareMaintenanceCost,
    payPerChangeCost,
    planCost,
    tiersWithPrices,
} from '../src/utils/maintenancePricing.js';

test('pay per change adds a setup fee only when there is work', () => {
    assert.equal(payPerChangeCost({ minor: 0, enhancement: 0 }), 0);
    assert.equal(payPerChangeCost({ minor: 2, enhancement: 0 }), 3000);
    assert.equal(payPerChangeCost({ minor: 5, enhancement: 1 }), 8500);
});

test('plan cost bills overage beyond the allowance', () => {
    const [basic] = PLAN_TIERS;
    assert.equal(planCost(basic, { minor: 2, enhancement: 0 }), 1500);
    assert.equal(planCost(basic, { minor: 4, enhancement: 1 }), 1500 + 1000 + 1500);
});

test('compare picks the cheapest plan and reports savings', () => {
    const result = compareMaintenanceCost({ minor: 5, enhancement: 1 });
    assert.equal(result.bestPlan.tier.id, 'standard');
    assert.equal(result.monthlySavings, 5000);
    assert.equal(result.yearlySavings, 60000);
});

test('no changes means pay per change is cheaper', () => {
    const result = compareMaintenanceCost({ minor: 0, enhancement: 0 });
    assert.ok(result.monthlySavings < 0);
});

test('tiersWithPrices reads admin price strings and falls back', () => {
    const tiers = tiersWithPrices([{ price: '₱2,000' }, { price: 'Ask us' }]);
    assert.equal(tiers[0].price, 2000);
    assert.equal(tiers[1].price, 3500);
    assert.equal(tiers[2].price, 7500);
});
