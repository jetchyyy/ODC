// Link import removed
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/#about' },
        { name: 'Services', path: '/#services' },
        { name: 'Portfolio', path: '/portfolio' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <nav className={cn(
                'mx-auto max-w-5xl transition-all duration-300',
                scrolled
                    ? 'bg-white/85 backdrop-blur-md border border-border/60 rounded-full shadow-lg px-6 py-3'
                    : 'bg-navy-950/35 backdrop-blur-sm border border-white/15 rounded-full px-6 py-3'
            )}>
                <div className="flex items-center justify-between">
                    <a
                        href="#home"
                        className={cn(
                            'text-2xl font-display font-bold tracking-tight transition-colors',
                            scrolled ? 'text-foreground' : 'text-white'
                        )}
                    >
                        ODC
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.path}
                                className={cn(
                                    'text-sm font-medium transition-colors',
                                    scrolled
                                        ? 'text-foreground/70 hover:text-primary'
                                        : 'text-white/80 hover:text-primary'
                                )}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:flex">
                        <a href="/contact">
                            <Button size="sm" variant="primary" className="rounded-full px-6">Get Started</Button>
                        </a>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className={cn('md:hidden p-1 transition-colors', scrolled ? 'text-foreground' : 'text-white')}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-auto max-w-5xl mt-2 bg-white/90 backdrop-blur-md rounded-2xl border border-border/60 shadow-lg overflow-hidden"
                    >
                        <div className="flex flex-col p-4 gap-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.path}
                                    className="text-foreground hover:text-primary py-2.5 px-4 rounded-xl hover:bg-secondary/50 transition-colors block font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="mt-2">
                                <Button className="w-full rounded-full">Get Started</Button>
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
