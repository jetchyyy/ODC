import { motion as Motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        quote: 'ODC helped us move from scattered tools to one reliable platform. Our front desk and operations team now handles requests much faster.',
        name: 'Angela P.',
        role: 'Operations Manager, Clinic',
        avatar: '/odysseyfamilyclinic.jpg',
    },
    {
        quote: 'Their team did not just build features. They solved business bottlenecks and improved our website conversion quality.',
        name: 'Marco T.',
        role: 'Marketing Lead, Retail Brand',
        avatar: '/ngosiokmarketing.jpg',
    },
    {
        quote: 'Communication was clear from day one. We launched on schedule and quickly saw stronger customer retention.',
        name: 'Jessa L.',
        role: 'Founder, Subscription Startup',
        avatar: '/thepicklepointcebu.jpg',
    },
];

export function TestimonialsSection() {
    return (
        <section className="pt-24 md:pt-32 pb-20 bg-secondary/35 relative overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">Testimonials</span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">
                        Trusted by Teams Who Need <span className="text-primary">Real Results</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                        Feedback from clinics, service companies, and growth-stage brands that partnered with us on product and operations challenges.
                    </p>
                </Motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((item, index) => (
                        <Motion.article
                            key={item.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative rounded-2xl bg-white border border-border/60 p-7 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
                        >
                            {/* Decorative large quote mark */}
                            <span
                                className="absolute top-4 right-6 text-7xl leading-none font-serif text-primary/10 select-none pointer-events-none"
                                aria-hidden="true"
                            >
                                "
                            </span>

                            {/* Star rating */}
                            <div className="flex gap-0.5 mb-4" role="img" aria-label="5 out of 5 stars">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-primary text-primary" aria-hidden="true" />
                                ))}
                            </div>

                            <p className="text-foreground/85 leading-relaxed mb-6 flex-1 relative z-10">"{item.quote}"</p>

                            <div className="border-t border-border/60 pt-5 flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                                    <img
                                        src={item.avatar}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <span className="text-xs font-bold text-primary" aria-hidden="true">
                                        {item.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold tracking-tight text-sm leading-tight">{item.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.role}</p>
                                </div>
                            </div>
                        </Motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}


