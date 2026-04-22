import { CheckCircle2 } from 'lucide-react';

const trustItems = [
    { text: 'Trusted by clinics and local brands' },
    { text: '50+ successful launches' },
    { text: 'Average response within 24 hours' },
    { text: '5+ years building business systems' },
    { text: 'Full-cycle web & mobile delivery' },
    { text: 'Post-launch support included' },
];

const allItems = [...trustItems, ...trustItems];

export function TrustBarSection() {
    return (
        <section className="py-4 border-y border-border/50 bg-white overflow-hidden" aria-label="Trust indicators">
            <div className="relative flex overflow-hidden">
                <div
                    className="marquee-track flex whitespace-nowrap shrink-0 hover:[animation-play-state:paused]"
                    style={{ width: 'max-content' }}
                    aria-hidden="true"
                >
                    {allItems.map((item, index) => (
                        <div key={index} className="inline-flex items-center gap-2.5 px-8 shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm font-semibold text-foreground/75">{item.text}</span>
                            <span className="text-border mx-4" aria-hidden="true">·</span>
                        </div>
                    ))}
                </div>
            </div>
            <ul className="sr-only">
                {trustItems.map((item) => (
                    <li key={item.text}>{item.text}</li>
                ))}
            </ul>
        </section>
    );
}

