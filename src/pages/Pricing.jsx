import { ArrowLeft } from '@phosphor-icons/react';
import { PricingPlans } from '../components/sections/PricingPlans';

export default function Pricing() {
    return (
        <div className="reference-landing premium-landing pricing-standalone-page">
            <div className="pricing-standalone-nav">
                <a href="/" className="pricing-back-link">
                    <span>
                        <ArrowLeft size={14} weight="bold" />
                    </span>
                    Back to home
                </a>
                <a href="/portal" className="pricing-client-link">Client portal</a>
            </div>
            <PricingPlans standalone />
        </div>
    );
}
