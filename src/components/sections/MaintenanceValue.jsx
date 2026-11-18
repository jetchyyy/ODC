import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowRight, Calculator, Receipt, TreeStructure } from '@phosphor-icons/react';
import {
    PAY_PER_CHANGE_RATES,
    PAY_PER_CHANGE_TERMS,
    SYSTEM_PLAN_GUIDE,
    compareMaintenanceCost,
    formatPeso,
    tiersWithPrices,
} from '../../utils/maintenancePricing';

const easeOut = [0.22, 1, 0.36, 1];
const sectionMotion = {
    initial: { opacity: 0, y: 34 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-90px' },
    transition: { duration: 0.78, ease: easeOut },
};

export function MaintenanceValue({ plans, onSelectPlan }) {
    const tiers = tiersWithPrices(plans);
    const [usage, setUsage] = useState({ minor: 4, enhancement: 1 });
    const [activeSystem, setActiveSystem] = useState(null);

    const { withoutPlan, bestPlan, monthlySavings, yearlySavings } = compareMaintenanceCost(usage, tiers);
    const bestPlanIndex = tiers.indexOf(bestPlan.tier);
    const savingsPercent = withoutPlan > 0 ? Math.round((monthlySavings / withoutPlan) * 100) : 0;
    const planName = (id) => tiers.find((tier) => tier.id === id)?.name ?? id;

    const setField = (field) => (event) => {
        setActiveSystem(null);
        setUsage((current) => ({ ...current, [field]: Number(event.target.value) }));
    };

    const pickSystem = (row) => {
        setActiveSystem(row.system);
        setUsage({ minor: row.minor, enhancement: row.enhancement });
        document.getElementById('maintenance-calculator')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <>
            <Motion.div {...sectionMotion} className="mv-shell mv-guide">
                <div className="pricing-detail-header">
                    <span className="reference-eyebrow">Plan guide</span>
                    <h3>Which plan fits your system.</h3>
                </div>
                <div className="mv-guide-table">
                    {SYSTEM_PLAN_GUIDE.map((row) => (
                        <button
                            type="button"
                            key={row.system}
                            className={`mv-guide-row is-${row.plan} ${activeSystem === row.system ? 'is-active' : ''}`}
                            onClick={() => pickSystem(row)}
                        >
                            <span className="mv-guide-system">
                                <TreeStructure size={18} weight="duotone" />
                                <span>
                                    <strong>{row.system}</strong>
                                    <small>{row.examples}</small>
                                </span>
                            </span>
                            <span className="mv-guide-usage">
                                ~{row.minor} changes{row.enhancement ? ` + ${row.enhancement} enhancement${row.enhancement > 1 ? 's' : ''}` : ''} / mo
                            </span>
                            <span className="mv-guide-plan">{planName(row.plan)}</span>
                        </button>
                    ))}
                </div>
                <p className="mv-hint">Tap a system to load its typical usage into the savings calculator.</p>
            </Motion.div>

            <div className="mv-grid">
                <Motion.div {...sectionMotion} id="maintenance-calculator" className="mv-shell mv-calculator">
                    <div className="mv-card-head">
                        <Calculator size={22} weight="duotone" />
                        <div>
                            <span className="pricing-list-label">Savings calculator</span>
                            <h4>How much a plan saves you</h4>
                        </div>
                    </div>

                    <label className="mv-slider">
                        <span>
                            Minor changes per month
                            <strong>{usage.minor}</strong>
                        </span>
                        <input type="range" min="0" max="20" step="1" value={usage.minor} onChange={setField('minor')} />
                    </label>
                    <label className="mv-slider">
                        <span>
                            Small enhancements per month
                            <strong>{usage.enhancement}</strong>
                        </span>
                        <input type="range" min="0" max="4" step="1" value={usage.enhancement} onChange={setField('enhancement')} />
                    </label>

                    <div className="mv-compare">
                        <div>
                            <span>Without a plan</span>
                            <strong className="is-strike">{formatPeso(withoutPlan)}</strong>
                            <small>per month</small>
                        </div>
                        <div className="is-plan">
                            <span>{bestPlan.tier.name}</span>
                            <strong>{formatPeso(bestPlan.cost)}</strong>
                            <small>per month{bestPlan.cost > bestPlan.tier.price ? ', incl. extra requests' : ''}</small>
                        </div>
                    </div>

                    {monthlySavings > 0 ? (
                        <div className="mv-savings">
                            <span>You save</span>
                            <strong>{formatPeso(monthlySavings)}<small>/month</small></strong>
                            <p>
                                That is {formatPeso(yearlySavings)} a year ({savingsPercent}% less), plus monitoring, backups and priority support you do not get per change.
                            </p>
                        </div>
                    ) : (
                        <div className="mv-savings is-neutral">
                            <span>Low usage</span>
                            <strong>Pay per change is cheaper here</strong>
                            <p>A plan still keeps your system monitored, backed up and secured every month, so issues are caught before they cost more.</p>
                        </div>
                    )}

                    <button type="button" className="pricing-cta" onClick={() => onSelectPlan(plans[bestPlanIndex])} disabled={!plans[bestPlanIndex]}>
                        Get the {bestPlan.tier.name}
                        <span>
                            <ArrowRight size={14} weight="bold" />
                        </span>
                    </button>
                </Motion.div>

                <Motion.aside {...sectionMotion} className="mv-shell mv-payg">
                    <div className="mv-card-head">
                        <Receipt size={22} weight="duotone" />
                        <div>
                            <span className="pricing-list-label">No maintenance plan</span>
                            <h4>Pay-per-change rates</h4>
                        </div>
                    </div>
                    <div className="mv-rate-list">
                        {PAY_PER_CHANGE_RATES.map((rate) => (
                            <div key={rate.service}>
                                <span>
                                    {rate.service}
                                    <small>{rate.detail}</small>
                                </span>
                                <strong>{rate.price}</strong>
                            </div>
                        ))}
                    </div>
                    <ul className="mv-terms">
                        {PAY_PER_CHANGE_TERMS.map((term) => (
                            <li key={term}>{term}</li>
                        ))}
                    </ul>
                </Motion.aside>
            </div>
        </>
    );
}
