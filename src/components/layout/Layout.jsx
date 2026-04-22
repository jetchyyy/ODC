import { Navbar } from './Navbar';
import { motion } from 'framer-motion';

export function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <motion.main
                className="grow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {children}
            </motion.main>
            <footer className="bg-navy-950 py-12 border-t border-white/5">
                <div className="container mx-auto px-6 md:px-12 text-center">
                    <div className="text-2xl font-display font-bold text-white mb-3 tracking-tight">ODC</div>
                    <p className="text-white/35 text-sm">© {new Date().getFullYear()} ODC IT Solutions. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
