import { motion } from 'framer-motion';
import { Code, Smartphone, Cloud, Database, Palette, ArrowRight, Layers } from 'lucide-react';

const services = [
    {
        Icon: Code,
        title: 'Web Development',
        description: 'Launch high-converting websites and portals that improve lead quality and speed up your sales cycle.',
    },
    {
        Icon: Smartphone,
        title: 'Mobile Apps',
        description: 'Create mobile apps for booking, customer engagement, and retention that keep users coming back.',
    },
    {
        Icon: Cloud,
        title: 'Cloud Solutions',
        description: 'Cut downtime and infrastructure waste with resilient cloud architecture designed for long-term growth.',
    },
    {
        Icon: Database,
        title: 'Backend Systems',
        description: 'Build reliable backends and APIs for scheduling, inventory, payments, and internal operations.',
    },
    {
        Icon: Palette,
        title: 'UI/UX Design',
        description: 'Design user journeys that remove friction, increase activation, and improve conversion rates.',
    },
    {
        Icon: Layers,
        title: 'System Integration',
        description: 'Connect your CRM, billing, and messaging tools so teams spend less time on manual tasks.',
    },
];

export function ServicesSection() {
    return (
        <section id="services" className="pt-24 md:pt-32 pb-20 bg-secondary/40 relative overflow-hidden">
            {/* Subtle orange glow */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 md:mb-20 text-center"
                >
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">Our Expertise</span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">
                        Services Designed for <span className="text-primary">Business Outcomes</span>
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
                        Every engagement is mapped to a target result, from better patient or customer flow to stronger conversion and more reliable operations.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.05 + index * 0.08 }}
                            whileHover={{ y: -5 }}
                            className="group relative bg-white rounded-2xl p-6 border border-border/60 shadow-sm hover:shadow-lg hover:border-primary/25 transition-all duration-300"
                        >
                            {/* Service number */}
                            <span className="absolute top-5 right-6 text-xs font-bold font-mono text-border/70 group-hover:text-primary/35 transition-colors select-none">
                                {String(index + 1).padStart(2, '0')}
                            </span>

                            {/* Icon container — transitions to filled primary on hover */}
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors duration-300 text-primary group-hover:text-white">
                                <service.Icon className="w-6 h-6" />
                            </div>

                            <h3 className="text-lg font-bold mb-2 tracking-tight group-hover:text-primary transition-colors">{service.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">{service.description}</p>

                            {/* "Learn more" — always subtly visible, brightens on hover */}
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary/40 group-hover:text-primary group-hover:gap-2 transition-all duration-300">
                                Learn more <ArrowRight className="w-3 h-3" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

