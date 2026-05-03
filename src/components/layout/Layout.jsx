import { motion as Motion } from 'framer-motion';
import { Navbar } from './Navbar';

const footerGroups = [
    ['Product', 'Systems', 'UI/UX', 'Automation'],
    ['Company', 'About', 'Portfolio', 'Contact'],
    ['Resources', 'Stack', 'Support', 'Roadmap'],
    ['Social', 'GitHub', 'LinkedIn', 'Facebook'],
];

export function Layout({ children }) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <Motion.main
                className="grow overflow-x-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {children}
            </Motion.main>
            <footer className="border-t border-[#101718]/10 bg-[#e7f0ed] py-14 text-[#101718]">
                <div className="mx-auto grid w-[min(1080px,calc(100%-2rem))] gap-10 md:grid-cols-[1.2fr_repeat(4,0.8fr)]">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 font-display text-sm font-black tracking-[-0.04em]">
                            <span className="grid h-5 w-5 place-items-center rounded-full border border-[#101718]/20 text-[9px]">OD</span>
                            ODC
                        </div>
                        <p className="max-w-64 text-xs leading-relaxed text-[#101718]/55">
                            Build business systems, automate manual workflows, and launch polished digital products with ODC IT Solutions.
                        </p>
                        <p className="mt-10 text-[11px] text-[#101718]/42">
                            (c) {new Date().getFullYear()} ODC IT Solutions. All rights reserved.
                        </p>
                    </div>
                    {footerGroups.map((group) => (
                        <div key={group[0]}>
                            <h3 className="mb-4 text-xs font-black tracking-[-0.02em]">{group[0]}</h3>
                            <ul className="space-y-2 text-xs text-[#101718]/52">
                                {group.slice(1).map((item) => (
                                    <li key={item}>
                                        <a href="/contact" className="transition-colors hover:text-[#101718]">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </footer>
        </div>
    );
}
