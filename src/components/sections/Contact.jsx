import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Mail, Phone, MapPin, Send, Facebook, Linkedin, Instagram } from 'lucide-react';

const socialLinks = [
    { Icon: Facebook, label: 'Facebook', url: 'https://facebook.com/profile.php?id=61587269647950' },
    { Icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com' },
    { Icon: Instagram, label: 'Instagram', url: 'https://instagram.com' },
];

const inputClass =
    'w-full px-4 py-3 bg-white/5 border border-white/15 focus:border-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl transition-all text-white placeholder:text-white/30';

const labelClass = 'block text-xs font-semibold uppercase tracking-widest text-white/70 mb-1.5';

export function ContactSection() {
    return (
        <section id="contact" className="pt-24 md:pt-32 pb-20 bg-navy-900 relative overflow-hidden">
            {/* Orange accent glows */}
            <div className="absolute top-0 right-0 w-125 h-125 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">Get in Touch</span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight text-white">
                        Let's Start a <span className="text-primary">Conversation</span>
                    </h2>
                    <p className="text-white/60 max-w-xl mx-auto text-lg leading-relaxed">
                        Have a clinic, retail, or service project in mind? Share your goal in a few lines and our team will reach out with clear next steps.
                    </p>
                    <p className="text-primary/90 text-sm font-semibold tracking-wide mt-3">Average response time: within 24 hours</p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-5xl mx-auto">

                    {/* Info Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="space-y-6">
                            {[
                                { Icon: Mail, label: 'Email Us', value: 'odysseyclinsys1@gmail.com' },
                                { Icon: Phone, label: 'Call Us', value: '0993-005-0994' },
                                { Icon: MapPin, label: 'Visit Us', value: '3409 Pearl Corner Jade St. Casals Village, Mabolo, Cebu City' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-start gap-4 group">
                                    <div className="p-3 bg-white/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                                        <item.Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">{item.label}</h3>
                                        <p className="text-white/60 group-hover:text-white/85 transition-colors">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-10 mt-10 border-t border-white/10">
                            <h3 className="font-semibold text-white mb-4">Follow Us</h3>
                            <div className="flex gap-3">
                                {socialLinks.map(({ Icon, label, url }) => (
                                    <a
                                        key={label}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Visit ODC on ${label}`}
                                        className="w-11 h-11 rounded-xl bg-white/10 hover:bg-primary text-white transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 mt-8 border-t border-white/10">
                            <h3 className="font-semibold text-white mb-4">To Get a Faster Proposal</h3>
                            <div className="space-y-2.5">
                                {[
                                    'Share your business goal and current challenge',
                                    'Mention your target launch timeline',
                                    'Tell us your key workflow (booking, sales, support)',
                                ].map((item) => (
                                    <div key={item} className="flex items-start gap-3">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        <p className="text-sm text-white/70 leading-relaxed">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/5 backdrop-blur-sm p-8 md:p-10 rounded-3xl border border-white/10"
                    >
                        <form className="space-y-5" noValidate>
                            <div>
                                <label htmlFor="contact-name" className={labelClass}>Full Name</label>
                                <input
                                    id="contact-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    className={inputClass}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label htmlFor="contact-email" className={labelClass}>Email Address</label>
                                <input
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className={inputClass}
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="contact-company" className={labelClass}>
                                    Company <span className="normal-case font-normal text-white/40">(Optional)</span>
                                </label>
                                <input
                                    id="contact-company"
                                    name="company"
                                    type="text"
                                    autoComplete="organization"
                                    className={inputClass}
                                    placeholder="Your company name"
                                />
                            </div>

                            <div>
                                <label htmlFor="contact-goal" className={labelClass}>What Do You Want to Achieve?</label>
                                <textarea
                                    id="contact-goal"
                                    name="goal"
                                    rows={4}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Example: Reduce no-shows, increase qualified leads, or streamline internal operations"
                                />
                            </div>

                            <div className="pt-2">
                                <Button className="w-full rounded-xl" size="lg">
                                    Send Message <Send className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </form>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
