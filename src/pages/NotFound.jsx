import { motion as Motion } from 'framer-motion';
import { ArrowLeft, Warning } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
            {/* Background elements */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute right-[10%] top-[20%] h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />
            </div>

            <Motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="relative"
            >
                {/* Large 404 text with gradient */}
                <h1 className="font-display text-[clamp(8rem,20vw,16rem)] font-black leading-none tracking-tighter text-transparent"
                    style={{
                        WebkitTextStroke: '1px rgba(16, 23, 24, 0.1)',
                        backgroundImage: 'linear-gradient(180deg, #101718 0%, rgba(16, 23, 24, 0.4) 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text'
                    }}
                >
                    404
                </h1>

                {/* Icon badge */}
                <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-black/5 bg-white/50 px-4 py-1.5 backdrop-blur-md"
                >
                    <Warning size={16} weight="duotone" className="text-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#101718]/60">Page Not Found</span>
                </Motion.div>
            </Motion.div>

            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="mt-8 max-w-md"
            >
                <h2 className="font-display text-3xl font-bold tracking-tight text-[#101718]">
                    Lost in the system?
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#101718]/60">
                    The route you're looking for doesn't exist or has been moved to a new location. Let's get you back on track.
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#101718]/10 bg-white px-6 py-3 text-sm font-bold text-[#101718] transition-all duration-300 hover:border-[#101718]/20 hover:bg-[#f8faf9] active:scale-95"
                    >
                        <ArrowLeft size={18} weight="bold" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 rounded-full bg-[#101718] px-8 py-3 text-sm font-bold text-white transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 active:scale-95"
                    >
                        Return Home
                    </button>
                </div>
            </Motion.div>

            {/* Subtle brand mark */}
            <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1 }}
                className="mt-20 font-display text-[10px] uppercase tracking-[0.2em] text-[#101718]/40"
            >
                OdysseyPH IT Solutions
            </Motion.div>
        </div>
    );
}

