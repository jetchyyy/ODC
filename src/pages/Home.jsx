import { motion as Motion } from 'framer-motion';
import {
    ArrowRight,
    Boxes,
    Brain,
    Check,
    ChevronRight,
    Circle,
    Code2,
    Database,
    FileCode2,
    Github,
    Globe2,
    Lock,
    MessageSquareText,
    Search,
    ShieldCheck,
    Zap,
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0 },
};

const sectionMotion = {
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    variants: fadeUp,
};

const techStackLogos = [
    { name: 'React', mark: 'R', src: '/react.svg' },
    { name: 'Vite', mark: 'V', src: '/vite.svg' },
    { name: 'Next.js', mark: 'N', src: '/nextjs.svg' },
    { name: 'React Native', mark: 'RN', src: '/react.svg' },
    { name: 'Supabase', mark: 'S', src: '/supabase.svg' },
    { name: 'SQLite', mark: 'DB', src: '/sqlite.svg' },
    { name: 'JavaScript', mark: 'JS', src: '/javascript.svg' },
    { name: 'TypeScript', mark: 'TS', src: '/typescript.svg' },
    { name: 'UI/UX Design', mark: 'UX' },
];

const brandLogos = [
    { name: 'The Pickle Point Cebu', mark: 'PP' },
    { name: 'IMS-US', mark: 'IM' },
    { name: 'GRIT', mark: 'GR' },
    { name: 'MediQuick', mark: 'MQ' },
    { name: 'Ngosiok Marketing', mark: 'NM' },
    { name: 'Odyssey Family Clinic', mark: 'OF' },
    { name: 'Firsel Tattoo', mark: 'FT' },
];

const featureCards = [
    {
        tag: 'Systems',
        title: 'Build tools around the workflow, not the other way around.',
        body: 'ODC turns manual booking, clinic, inventory, and admin processes into usable digital systems.',
        image: '/thepicklepointcebu.jpg',
        imageAlt: 'The Pickle Point Cebu court booking system preview',
    },
    {
        tag: 'Automation',
        title: 'Replace repetitive admin work with clear product flows.',
        body: 'From court scheduling to clinic management, each build removes friction from daily operations.',
        image: '/grit.jpg',
        imageAlt: 'GRIT gym management system preview',
    },
    {
        tag: 'UI/UX',
        title: 'Interfaces designed for teams who need speed and clarity.',
        body: 'React, Vite, Next.js, and mobile-ready design patterns keep experiences fast and understandable.',
        image: '/MediQuick.png',
        imageAlt: 'MediQuick medicine e-commerce UI preview',
    },
];

const projectGallery = [
    {
        title: 'Odyssey Family Clinic',
        type: 'Clinic management',
        image: '/odysseyfamilyclinic.jpg',
    },
    {
        title: 'IMS-US',
        type: 'Professional portfolio',
        image: '/imsus.png',
    },
    {
        title: 'Ngosiok Marketing',
        type: 'Corporate portfolio',
        image: '/ngosiokmarketing.jpg',
    },
    {
        title: 'Firsel Tattoo',
        type: 'Artist portfolio',
        image: '/firseltattoo.png',
    },
];

const readyCards = [
    {
        icon: Brain,
        title: 'React + Vite delivery',
        copy: 'Fast web interfaces with a practical build setup and clean component structure.',
    },
    {
        icon: Lock,
        title: 'Supabase and SQLite',
        copy: 'Lean data layers for apps that need auth, records, dashboards, and dependable storage.',
    },
    {
        icon: ShieldCheck,
        title: 'Workflow automation',
        copy: 'Manual tasks become guided flows for booking, inventory, patient records, and team operations.',
    },
];

const documentModes = [
    {
        icon: FileCode2,
        title: 'System builds',
        copy: 'Booking, clinic, gym, and inventory platforms shaped around real operational needs.',
    },
    {
        icon: MessageSquareText,
        title: 'Portfolio websites',
        copy: 'Professional web presences for brands, artists, clinics, and corporate teams.',
    },
    {
        icon: Database,
        title: 'UI/UX prototypes',
        copy: 'High-clarity web app design for e-commerce, medicine inventory, and service workflows.',
    },
];

function ProductWindow({ variant = 'light', className = '' }) {
    const dark = variant === 'dark';

    return (
        <div className={`product-window ${dark ? 'product-window-dark' : ''} ${className}`}>
            <div className="window-dots">
                <span />
                <span />
                <span />
            </div>
            <div className="window-body">
                <aside className="window-sidebar">
                    {['Docs', 'Stack', 'Launch', 'Support', 'Audit'].map((item, index) => (
                        <span key={item} className={index === 1 ? 'active' : ''}>
                            <Circle className="h-2 w-2 fill-current" />
                            {item}
                        </span>
                    ))}
                </aside>
                <div className="window-content">
                    <div className="window-toolbar">
                        <span>Project knowledge</span>
                        <span>Updated now</span>
                    </div>
                    <div className="window-title-line" />
                    <div className="window-block-grid">
                        <span />
                        <span />
                        <span />
                    </div>
                    <div className="window-list">
                        {[0, 1, 2, 3].map((item) => (
                            <div key={item}>
                                <Check className="h-3 w-3" />
                                <span />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CodePanel() {
    return (
        <div className="code-panel">
            <div className="code-row cyan">npm create vite@latest odc-system</div>
            <div className="code-row">connect supabase workflow tables</div>
            <div className="code-row">ship booking + admin dashboard</div>
            <div className="code-row dim">status: ready for client handoff</div>
        </div>
    );
}

function SectionHeader({ eyebrow, title, copy, align = 'left' }) {
    return (
        <Motion.div
            {...sectionMotion}
            className={`section-header ${align === 'center' ? 'mx-auto text-center' : ''}`}
        >
            {eyebrow ? <span className="reference-eyebrow">{eyebrow}</span> : null}
            <h2>{title}</h2>
            {copy ? <p>{copy}</p> : null}
        </Motion.div>
    );
}

function LogoMarquee({ items, reverse = false, compact = false }) {
    const marqueeItems = [...items, ...items];

    return (
        <div className={`logo-marquee ${reverse ? 'is-reverse' : ''} ${compact ? 'is-compact' : ''}`}>
            <div className="logo-marquee-track">
                {marqueeItems.map((item, index) => (
                    <div className="logo-marquee-item" key={`${item.name}-${index}`} aria-label={item.name}>
                        <span className="logo-mark">
                            {item.src ? <img src={item.src} alt="" aria-hidden="true" loading="lazy" /> : item.mark}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HeroShowcase() {
    return (
        <div className="hero-showcase" aria-hidden="true">
            <Motion.div
                initial={{ opacity: 0, y: 28, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="hero-window-one"
            >
                <ProductWindow />
            </Motion.div>
            <Motion.div
                initial={{ opacity: 0, y: 36, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.9, delay: 0.45 }}
                className="hero-window-two"
            >
                <ProductWindow />
            </Motion.div>
            <Motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="hero-code-card"
            >
                <CodePanel />
            </Motion.div>
        </div>
    );
}

function FeatureImage({ src, alt }) {
    return (
        <div className="feature-project-image">
            <img src={src} alt={alt} loading="lazy" />
        </div>
    );
}

function HeroSection() {
    return (
        <section id="home" className="reference-hero">
            <div className="reference-grid-lines" />
            <div className="ambient ambient-hero" />
            <div className="landing-shell">
                <Motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.11, delayChildren: 0.2 } },
                    }}
                    className="hero-layout"
                >
                    <div className="hero-copy">
                        <Motion.div variants={fadeUp} className="brand-mark">
                            <Boxes className="h-4 w-4" />
                            <span>ODC</span>
                        </Motion.div>
                        <Motion.h1 variants={fadeUp}>
                            Systems that automate manual work.
                        </Motion.h1>
                        <Motion.p variants={fadeUp}>
                            ODC builds React, Vite, Next.js, React Native, Supabase, and SQLite systems for businesses that need cleaner operations, faster workflows, and stronger digital presence.
                        </Motion.p>
                        <Motion.div variants={fadeUp} className="hero-actions">
                            <a href="#contact" className="reference-button primary">
                                Start a project
                                <ArrowRight className="h-4 w-4" />
                            </a>
                            <a href="#technical-docs" className="reference-button ghost">
                                See workflow
                            </a>
                        </Motion.div>
                    </div>
                    <HeroShowcase />
                </Motion.div>

                <Motion.div {...sectionMotion} className="trust-strip">
                    <span>Development stack for web apps, mobile flows, databases, and UI/UX systems</span>
                    <LogoMarquee items={techStackLogos} compact />
                </Motion.div>
            </div>
        </section>
    );
}

function FeatureGrid() {
    return (
        <section className="landing-section feature-section">
            <div className="landing-shell">
                <div className="feature-grid">
                    {featureCards.map((card, index) => (
                        <Motion.article
                            key={card.title}
                            {...sectionMotion}
                            transition={{ duration: 0.7, delay: index * 0.08 }}
                            className="reference-card feature-card"
                        >
                            <span className="soft-pill">{card.tag}</span>
                            <h3>{card.title}</h3>
                            <p>{card.body}</p>
                            <FeatureImage src={card.image} alt={card.imageAlt} />
                        </Motion.article>
                    ))}
                    <Motion.article {...sectionMotion} className="reference-card wide-proof">
                        <div>
                            <span className="soft-pill">Live context</span>
                            <h3>Every project is built from the workflow outward.</h3>
                        </div>
                        <p>
                            Pickleball court booking, gym management, clinic operations, medicine inventory, and portfolio websites each receive a system tailored to how the business actually works.
                        </p>
                    </Motion.article>
                </div>
            </div>
        </section>
    );
}

function SyncBand() {
    return (
        <section className="landing-section compact-section">
            <div className="landing-shell">
                <Motion.div {...sectionMotion} className="sync-band">
                    <div className="sync-icons">
                        <Github className="h-6 w-6" />
                        <Zap className="h-6 w-6" />
                    </div>
                    <h2>Keep your workflow and system in sync</h2>
                    <p>
                        Interfaces, databases, and operational rules are designed together, so teams can move from manual work to dependable digital process.
                    </p>
                    <a href="#integrations" className="tiny-link">
                        Explore the stack
                        <ChevronRight className="h-3 w-3" />
                    </a>
                </Motion.div>
            </div>
        </section>
    );
}

function TechnicalDocs() {
    return (
        <section id="technical-docs" className="landing-section docs-section">
            <div className="landing-shell">
                <SectionHeader
                    title="Business systems made practical"
                    copy="ODC specializes in building systems and automating manual workflows for clinics, gyms, booking operations, inventory, portfolios, and service teams."
                />
                <Motion.div {...sectionMotion} className="docs-showcase">
                    <div className="docs-copy">
                        <span className="soft-pill amber">Popular</span>
                        <h3>Everything your team needs to run the process.</h3>
                        <p>
                            From React interfaces to Supabase data models, the implementation is shaped around business tasks, user roles, records, and day-to-day handoffs.
                        </p>
                    </div>
                    <ProductWindow className="docs-window" />
                </Motion.div>
                <div className="project-gallery">
                    {projectGallery.map((project, index) => (
                        <Motion.article
                            key={project.title}
                            {...sectionMotion}
                            transition={{ duration: 0.7, delay: index * 0.06 }}
                        >
                            <img src={project.image} alt={`${project.title} project screenshot`} loading="lazy" />
                            <div>
                                <span>{project.type}</span>
                                <h3>{project.title}</h3>
                            </div>
                        </Motion.article>
                    ))}
                </div>
                <div className="document-mode-grid">
                    {documentModes.map((mode, index) => {
                        const Icon = mode.icon;
                        return (
                            <Motion.article
                                key={mode.title}
                                {...sectionMotion}
                                transition={{ duration: 0.7, delay: index * 0.08 }}
                            >
                                <Icon className="h-6 w-6" />
                                <h3>{mode.title}</h3>
                                <p>{mode.copy}</p>
                            </Motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function SearchChapter() {
    return (
        <section className="landing-section search-section">
            <div className="landing-shell search-layout">
                <SectionHeader
                    title="Move from manual tasks to managed flows. Fast."
                    copy="Replace scattered spreadsheets, message threads, and repetitive admin steps with web and mobile experiences designed for the work."
                />
                <Motion.div {...sectionMotion} className="search-demo">
                    <div className="search-card">
                        <div className="search-input">
                            <Search className="h-4 w-4" />
                            <span>What should this workflow automate?</span>
                        </div>
                        <div className="blurred-results">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                    <div className="search-copy">
                        <span className="orb" />
                        <h3>Workflow-first builds</h3>
                        <p>
                            Each project starts with the current process, then becomes a focused interface, database, and automation path.
                        </p>
                    </div>
                </Motion.div>
            </div>
        </section>
    );
}

function Integrations() {
    return (
        <section id="integrations" className="landing-section integration-section">
            <div className="reference-grid-lines" />
            <div className="landing-shell">
                <Motion.div {...sectionMotion} className="integration-center">
                    <Code2 className="h-7 w-7" />
                    <h2>Integrate with your stack</h2>
                    <p>
                        Build with the technologies ODC uses across production websites, dashboards, mobile interfaces, and database-backed systems.
                    </p>
                    <div className="integration-marquees">
                        <LogoMarquee items={techStackLogos} />
                        <LogoMarquee items={brandLogos} reverse />
                    </div>
                </Motion.div>
            </div>
        </section>
    );
}

function BrandedDocs() {
    return (
        <section className="landing-section branded-section">
            <div className="landing-shell branded-layout">
                <SectionHeader
                    title="Launch branded digital products"
                    copy="Ship systems and websites that feel specific to the business, from court booking to tattoo portfolios and clinic management."
                />
                <div className="publish-cards">
                    <Motion.article {...sectionMotion} className="publish-card warm">
                        <h3>The Pickle Point Cebu, GRIT, MediQuick</h3>
                        <p>Booking, gym management, and medicine e-commerce UI/UX built around practical user flows.</p>
                    </Motion.article>
                    <Motion.article
                        {...sectionMotion}
                        transition={{ duration: 0.7, delay: 0.08 }}
                        className="publish-card cool"
                    >
                        <h3>IMS-US, Ngosiok, Odyssey, Firsel Tattoo</h3>
                        <p>Professional portfolios and integrated management systems with clear brand presentation.</p>
                    </Motion.article>
                </div>
            </div>
        </section>
    );
}

function ReadyScale() {
    return (
        <section className="landing-section ready-section">
            <div className="landing-shell">
                <SectionHeader title="Ready to scale up?" />
                <div className="ready-grid">
                    {readyCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <Motion.article
                                key={card.title}
                                {...sectionMotion}
                                transition={{ duration: 0.7, delay: index * 0.08 }}
                            >
                                <Icon className="h-6 w-6" />
                                <h3>{card.title}</h3>
                                <p>{card.copy}</p>
                            </Motion.article>
                        );
                    })}
                </div>
                <Motion.div {...sectionMotion} className="final-cta">
                    <div>
                        <Globe2 className="h-8 w-8" />
                        <h2>Build the system your workflow has been asking for.</h2>
                        <a href="#contact" className="reference-button dark">
                            Talk to ODC
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                    <ProductWindow className="final-window" />
                    <div className="cta-gradient" />
                </Motion.div>
            </div>
        </section>
    );
}

export function Home() {
    return (
        <div className="reference-landing">
            <HeroSection />
            <FeatureGrid />
            <SyncBand />
            <TechnicalDocs />
            <SearchChapter />
            <Integrations />
            <BrandedDocs />
            <ReadyScale />
        </div>
    );
}
