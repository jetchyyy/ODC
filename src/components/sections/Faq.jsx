import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';

const faqs = [
    {
        question: 'How much does a typical project cost?',
        answer: 'Pricing depends on scope, complexity, and timeline. Most projects start with a strategy call so we can recommend a right-sized plan and budget.',
    },
    {
        question: 'How long does delivery usually take?',
        answer: 'Smaller websites can launch in 3 to 5 weeks. Larger web and mobile platforms may take 8 to 16 weeks with iterative milestones.',
    },
    {
        question: 'Can you work with our existing systems?',
        answer: 'Yes. We often integrate with existing CRMs, appointment tools, payment gateways, and analytics platforms to avoid unnecessary rebuilds.',
    },
    {
        question: 'Do you build solutions for clinics and service businesses?',
        answer: 'Yes. We regularly build scheduling, inquiry, and operations workflows for clinics, retail teams, and service-based companies.',
    },
    {
        question: 'Do you provide support after launch?',
        answer: 'Yes. We offer post-launch support, performance monitoring, and continuous improvements based on your growth goals.',
    },
];

export function FaqSection() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="ambient-light-section ambient-faq pt-24 md:pt-32 pb-20 relative overflow-hidden">
            <div className="section-ambient-orb section-ambient-orb-right" />
            <div className="container mx-auto px-6 md:px-12 max-w-4xl relative z-10">
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">FAQ</span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">
                        Answers Before We Start
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Quick answers to common questions about pricing, timelines, and collaboration.
                    </p>
                </Motion.div>

                <div className="space-y-4">
                    {faqs.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <div
                                key={item.question}
                                className={`rounded-2xl border overflow-hidden transition-colors duration-200 ${
                                    isOpen
                                        ? 'bg-primary/5 border-primary/30'
                                        : 'bg-white border-border/70'
                                }`}
                            >
                                <button
                                    className="w-full px-5 md:px-6 py-4 text-left flex items-center justify-between gap-4"
                                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                    aria-expanded={isOpen}
                                >
                                    <span className={`font-semibold tracking-tight transition-colors ${isOpen ? 'text-primary' : 'text-foreground/95'}`}>{item.question}</span>
                                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform text-primary/60 ${isOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <Motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="px-5 md:px-6"
                                        >
                                            <p className="pb-5 text-muted-foreground leading-relaxed">{item.answer}</p>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-10 rounded-2xl bg-secondary/50 border border-border/70 p-6">
                    <p className="text-foreground/85 mb-4">Still have questions? Let us discuss your project goals directly.</p>
                    <a href="#contact">
                        <Button className="rounded-full px-7">Talk to Our Team</Button>
                    </a>
                </div>
            </div>
        </section>
    );
}

