import { createElement, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Mail, Phone, MapPin, Send, Facebook, Linkedin, Instagram, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const socialLinks = [
    { Icon: Facebook, label: 'Facebook', url: 'https://facebook.com/profile.php?id=61587269647950' },
    { Icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com' },
    { Icon: Instagram, label: 'Instagram', url: 'https://instagram.com' },
];

const inputClass =
    'w-full px-4 py-3 bg-white/5 border border-white/15 focus:border-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl transition-all text-white placeholder:text-white/30';

const labelClass = 'block text-xs font-semibold uppercase tracking-widest text-white/70 mb-1.5';

const initialForm = { name: '', email: '', company: '', goal: '' };

export function ContactSection() {
    const [form, setForm] = useState(initialForm);
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.goal.trim()) {
            setErrorMsg('Please fill in Name, Email, and your Goal.');
            setStatus('error');
            return;
        }

        setStatus('loading');
        setErrorMsg('');

        try {
            await addDoc(collection(db, 'contactSubmissions'), {
                name: form.name.trim(),
                email: form.email.trim(),
                company: form.company.trim() || null,
                goal: form.goal.trim(),
                submittedAt: serverTimestamp(),
                // basic metadata
                userAgent: navigator.userAgent,
                referrer: document.referrer || null,
            });

            setStatus('success');
            setForm(initialForm);
        } catch (err) {
            console.error('Firestore error:', err);
            setErrorMsg('Something went wrong. Please try again or email us directly.');
            setStatus('error');
        }
    };

    return (
        <section id="contact" className="pt-24 md:pt-32 pb-20 bg-navy-900 relative overflow-hidden">
            {/* Orange accent glows */}
            <div className="absolute top-0 right-0 w-125 h-125 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <Motion.div
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
                </Motion.div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-5xl mx-auto">

                    {/* Info Side */}
                    <Motion.div
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
                                        {createElement(Icon, { className: 'w-5 h-5' })}
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
                    </Motion.div>

                    {/* Form Side */}
                    <Motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/5 backdrop-blur-sm p-8 md:p-10 rounded-3xl border border-white/10"
                    >
                        {status === 'success' ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                                <CheckCircle className="w-14 h-14 text-green-400" />
                                <h3 className="text-xl font-bold text-white">Message Sent!</h3>
                                <p className="text-white/60 text-sm max-w-xs">
                                    Thanks for reaching out. We'll get back to you within 24 hours.
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-2 text-primary text-sm font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form className="space-y-5" noValidate onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="contact-name" className={labelClass}>Full Name</label>
                                    <input
                                        id="contact-name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        className={inputClass}
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
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
                                        value={form.email}
                                        onChange={handleChange}
                                        required
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
                                        value={form.company}
                                        onChange={handleChange}
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
                                        value={form.goal}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {status === 'error' && (
                                    <div className="flex items-start gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Button className="w-full rounded-xl" size="lg" disabled={status === 'loading'} type="submit">
                                        {status === 'loading' ? (
                                            <>
                                                <Loader className="w-4 h-4 mr-2 animate-spin" /> Sending…
                                            </>
                                        ) : (
                                            <>
                                                Send Message <Send className="w-4 h-4 ml-1" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </Motion.div>

                </div>
            </div>
        </section>
    );
}
