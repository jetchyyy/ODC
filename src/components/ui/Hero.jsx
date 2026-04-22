import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';

export function Hero() {
    return (
        <section id="home" className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-navy-900">
            <img
                src="/her-bg.png"
                alt="ODC IT Solutions hero background"
                className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-navy-950/88 via-navy-900/72 to-navy-900/45" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_26%,hsl(24.6,95%,53.1%,0.24)_0%,transparent_44%)]" />
            <div className="absolute inset-0 bg-linear-to-t from-navy-950/72 via-transparent to-transparent" />
            <motion.div
                className="hero-halftone"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.14, 0.22, 0.14] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="hero-grain" />

            <div className="container mx-auto px-6 md:px-12 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-primary/30 bg-primary/15"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-semibold tracking-widest uppercase text-primary">Built for Clinics, Retail, and Service Teams</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] mb-6 tracking-tight text-white">
                        Launch Better Systems<br />
                        and <span className="text-primary">Digital Products</span><br />
                        That Scale
                    </h1>

                    <p className="text-lg text-white/75 mb-10 max-w-xl leading-relaxed font-normal">
                        We help clinics, service businesses, and growth-stage brands streamline operations, attract more customers, and launch faster through web, mobile, and cloud solutions.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <a href="#contact">
                            <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25">
                                Book a Strategy Call <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </a>
                        <a href="#portfolio">
                            <Button size="lg" variant="outline" className="rounded-full px-8 border-white/45 text-white hover:bg-white/10 hover:border-white">
                                View Case Studies
                            </Button>
                        </a>
                    </div>

                    <div className="mt-6">
                        <p className="text-[11px] uppercase tracking-widest text-white/55 mb-3 font-semibold">Popular Project Types</p>
                        <div className="flex flex-wrap gap-2.5">
                            {['Clinic Booking Portal', 'Retail Ordering Flow', 'Service Business CRM'].map((item) => (
                                <span key={item} className="px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 text-xs text-white/80">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex gap-10 mt-14 pt-10 border-t border-white/20"
                    >
                        {[
                            { label: 'Projects Delivered', value: '50+' },
                            { label: 'Happy Clients', value: '30+' },
                            { label: 'Years Experience', value: '5+' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-xs text-white/60 mt-0.5 tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 40, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.9, delay: 0.25 }}
                    className="relative hidden lg:block"
                >
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative max-w-xl ml-auto"
                    >
                        <div className="relative rounded-3xl overflow-hidden border border-white/22 shadow-2xl shadow-navy-950/40 bg-white/4 backdrop-blur-[1px]">
                            <img
                                src="/hero-right.png"
                                alt="ODC advanced technology preview"
                                className="w-full h-full object-cover aspect-4/3"
                                onError={(event) => {
                                    event.currentTarget.src = '/her-bg.png';
                                }}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-navy-950/62 via-navy-900/16 to-transparent" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(24.6,95%,53.1%,0.22)_0%,transparent_44%)]" />
                        </div>

                        <div className="absolute top-4 left-4 rounded-full border border-white/25 bg-navy-900/45 px-4 py-2 backdrop-blur-md">
                            <span className="text-[11px] tracking-wide uppercase text-white/85 font-semibold">Live Collaboration</span>
                        </div>

                        <div className="absolute -bottom-5 left-5 rounded-2xl border border-white/30 bg-white/92 px-4 py-3 shadow-lg shadow-navy-950/15">
                            <div className="text-[10px] uppercase tracking-wider text-navy-800/70 font-semibold">Projects Delivered</div>
                            <div className="text-xl leading-none mt-1 text-navy-900 font-bold">50+</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
