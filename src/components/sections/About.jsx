import { motion } from 'framer-motion';
import { CheckCircle2, Users, Award, Clock } from 'lucide-react';

const stats = [
    { icon: <Users className="w-4 h-4" />, value: '30+', label: 'Happy Clients' },
    { icon: <Award className="w-4 h-4" />, value: '50+', label: 'Projects Done' },
    { icon: <Clock className="w-4 h-4" />, value: '5+', label: 'Years Exp.' },
];

export function AboutSection() {
    return (
        <section id="about" className="pt-24 md:pt-32 pb-20 bg-background relative overflow-hidden">
            <div className="absolute -top-32 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-2xl overflow-hidden border border-border/30 shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Team working together"
                                className="w-full h-auto hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Floating stats card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-border/50 flex gap-5 z-20"
                        >
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto mb-1">
                                        {stat.icon}
                                    </div>
                                    <div className="text-lg font-bold text-foreground leading-none">{stat.value}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">About Us</span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                            Driven by Innovation, <br /><span className="text-primary">Powered by Technology</span>
                        </h2>
                        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                            At ODC, we are more than just an IT solutions provider; we are your strategic partner in digital transformation. Our mission is to empower businesses with cutting-edge technology that drives growth and efficiency.
                        </p>

                        <div className="space-y-3">
                            {['Expert Team of Developers & Designers', 'Agile Development Methodology', '24/7 Support & Maintenance', 'Scalable & Secure Solutions'].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="font-medium text-foreground/90">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
