import { Hero } from '../components/ui/Hero';
import { TrustBarSection } from '../components/sections/TrustBar';
import { AboutSection } from '../components/sections/About';
import { ServicesSection } from '../components/sections/Services';
import { ProcessSection } from '../components/sections/Process';
import { PortfolioSection } from '../components/sections/Portfolio';
import { TestimonialsSection } from '../components/sections/Testimonials';
import { FaqSection } from '../components/sections/Faq';
import { ContactSection } from '../components/sections/Contact';

export function Home() {
    return (
        <>
            <Hero />
            <TrustBarSection />
            <AboutSection />
            <ServicesSection />
            <ProcessSection />
            <PortfolioSection />
            <TestimonialsSection />
            <FaqSection />
            <ContactSection />
        </>
    );
}
