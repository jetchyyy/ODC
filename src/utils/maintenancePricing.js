// Standard ODC maintenance pricing. One source of truth for the plan math,
// the pay-per-change rate card, and the savings calculator on /pricing.

export const PLAN_TIERS = [
    { id: 'basic', name: 'Basic Care Plan', price: 1500, minorLimit: 2, enhancementLimit: 0 },
    { id: 'standard', name: 'Standard Care Plan', price: 3500, minorLimit: 5, enhancementLimit: 1 },
    { id: 'premium', name: 'Premium Continuous Improvement', price: 7500, minorLimit: 10, enhancementLimit: 2 },
];

// What plan clients pay for requests beyond their monthly allowance.
export const PLAN_OVERAGE = { minor: 500, enhancement: 1500 };

// What clients without an active plan pay.
export const PAY_PER_CHANGE = {
    minor: 1000,
    enhancement: 2500,
    setupFee: 1000,
};

export const PAY_PER_CHANGE_RATES = [
    { service: 'Minor change', detail: 'Text, image, label, price or config value', price: 'PHP 1,000 / change' },
    { service: 'Small enhancement', detail: 'New field, form tweak, small report change', price: 'PHP 2,500 / change' },
    { service: 'Moderate enhancement', detail: 'New page, workflow step or report', price: 'PHP 5,000+ / change' },
    { service: 'Bug fix (outside warranty)', detail: 'Issue diagnosis and fix', price: 'PHP 1,500 / issue' },
    { service: 'Emergency same-day fix', detail: 'Only when the team has capacity', price: 'PHP 3,000+' },
    { service: 'Setup & deployment fee', detail: 'Charged once per request batch', price: 'PHP 1,000 / batch' },
];

export const PAY_PER_CHANGE_TERMS = [
    'Completed in 5-10 business days, after plan clients in the queue',
    'No uptime monitoring, security checks or backups',
    'Paid in full before work starts',
];

// Which plan each kind of system should be on, plus typical monthly usage
// (used to preset the savings calculator).
export const SYSTEM_PLAN_GUIDE = [
    { system: 'Portfolio, landing page or company profile', examples: 'Business websites, event pages', plan: 'basic', minor: 2, enhancement: 0 },
    { system: 'Booking and reservation system', examples: 'Courts, barbershops, salons, tattoo studios', plan: 'standard', minor: 4, enhancement: 1 },
    { system: 'Clinic or patient records system', examples: 'Appointments, EMR, medical services', plan: 'standard', minor: 4, enhancement: 1 },
    { system: 'POS, inventory or sales system', examples: 'Stores, warehouses, distributors', plan: 'standard', minor: 5, enhancement: 1 },
    { system: 'E-commerce or online ordering', examples: 'Online shops with payments', plan: 'premium', minor: 7, enhancement: 2 },
    { system: 'Government, ERP or multi-branch system', examples: 'LGU offices, dispatch, multi-branch operations', plan: 'premium', minor: 9, enhancement: 2 },
];

export function formatPeso(amount) {
    return `PHP ${Math.round(amount).toLocaleString('en-US')}`;
}

// Use the live plan prices from the admin config when they parse to a number.
export function tiersWithPrices(plans = []) {
    return PLAN_TIERS.map((tier, index) => {
        const parsed = Number(String(plans[index]?.price ?? '').replace(/[^\d.]/g, ''));
        return parsed > 0 ? { ...tier, price: parsed } : tier;
    });
}

export function payPerChangeCost({ minor = 0, enhancement = 0 }) {
    if (minor + enhancement === 0) return 0;
    return minor * PAY_PER_CHANGE.minor + enhancement * PAY_PER_CHANGE.enhancement + PAY_PER_CHANGE.setupFee;
}

export function planCost(tier, { minor = 0, enhancement = 0 }) {
    return (
        tier.price +
        Math.max(0, minor - tier.minorLimit) * PLAN_OVERAGE.minor +
        Math.max(0, enhancement - tier.enhancementLimit) * PLAN_OVERAGE.enhancement
    );
}

export function compareMaintenanceCost(usage, tiers = PLAN_TIERS) {
    const withoutPlan = payPerChangeCost(usage);
    const bestPlan = tiers
        .map((tier) => ({ tier, cost: planCost(tier, usage) }))
        .reduce((best, option) => (option.cost < best.cost ? option : best));
    const monthlySavings = withoutPlan - bestPlan.cost;
    return { withoutPlan, bestPlan, monthlySavings, yearlySavings: monthlySavings * 12 };
}
