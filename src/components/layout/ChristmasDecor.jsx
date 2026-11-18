import { useCallback, useEffect, useRef, useState } from 'react';
import './ChristmasDecor.css';

// Seasonal Christmas layer. Purely visual apart from the gift, which plays a
// chime and shows a greeting. Mounted through SeasonalDecor in Layout.

// String lights: the wire sags between hooks; one bulb hangs at each low point.
const SWAGS = 14;
const SAG = 16;
const BULB_COLORS = ['#ff4d4d', '#ffd166', '#3ddc84', '#4cc9f0', '#ff8fd8'];

const wirePath = Array.from({ length: SWAGS }, (_, i) => {
    const x1 = (i / SWAGS) * 1000;
    const x2 = ((i + 1) / SWAGS) * 1000;
    const cx = (x1 + x2) / 2;
    return `${i === 0 ? `M${x1} 2 ` : ''}Q${cx} ${SAG * 2} ${x2} 2`;
}).join(' ');

function StringLights() {
    return (
        <div className="xm-lights">
            <svg className="xm-wire" viewBox="0 0 1000 40" preserveAspectRatio="none">
                <path d={wirePath} vectorEffect="non-scaling-stroke" />
            </svg>
            {Array.from({ length: SWAGS }, (_, i) => (
                <span
                    key={i}
                    className="xm-bulb"
                    style={{
                        left: `${((i + 0.5) / SWAGS) * 100}%`,
                        '--xm-color': BULB_COLORS[i % BULB_COLORS.length],
                        '--xm-delay': `${(i % 4) * 0.45}s`,
                    }}
                />
            ))}
        </div>
    );
}

// Parol: the Filipino Christmas star lantern, hanging and gently swinging.
function Parol({ className, hue }) {
    return (
        <div className={`xm-parol ${className}`} style={{ '--xm-hue': hue }}>
            <span className="xm-parol-string" />
            <svg className="xm-parol-star" viewBox="0 0 100 130">
                <circle cx="50" cy="50" r="40" className="xm-parol-ring" />
                <path
                    className="xm-parol-body"
                    d="M50 6 L61 37 L94 37 L67 57 L77 89 L50 70 L23 89 L33 57 L6 37 L39 37 Z"
                />
                <path className="xm-parol-lines" d="M50 6 L50 70 M6 37 L67 57 M94 37 L33 57 M23 89 L50 50 L77 89" />
                <circle cx="50" cy="50" r="9" className="xm-parol-core" />
                <g className="xm-parol-tassels">
                    <path d="M40 86 L36 126" />
                    <path d="M50 74 L50 124" />
                    <path d="M60 86 L64 126" />
                </g>
            </svg>
        </div>
    );
}

// Deterministic "random" snowflakes so renders stay stable.
const flakes = Array.from({ length: 42 }, (_, i) => {
    const r = (n) => ((i * 9301 + n * 49297) % 233280) / 233280;
    return {
        '--xm-left': `${(r(1) * 100).toFixed(2)}vw`,
        '--xm-size': `${(3 + r(2) * 6).toFixed(1)}px`,
        '--xm-dur': `${(9 + r(3) * 12).toFixed(1)}s`,
        '--xm-delay': `-${(r(4) * 20).toFixed(1)}s`,
        '--xm-drift': `${((r(5) - 0.5) * 12).toFixed(1)}vw`,
        '--xm-opacity': (0.35 + r(6) * 0.5).toFixed(2),
    };
});

function Snowfall() {
    return (
        <div className="xm-snow">
            {flakes.map((style, i) => (
                <span key={i} className="xm-flake" style={style} />
            ))}
        </div>
    );
}

function Gift({ open, onClick }) {
    return (
        <div className={`xm-gift ${open ? 'is-open' : ''}`} onClick={onClick}>
            <span className="xm-gift-label">Click me!</span>
            <span className="xm-gift-glow" />
            <svg viewBox="0 0 120 120">
                <rect x="20" y="52" width="80" height="60" rx="5" fill="#c8322f" />
                <rect x="20" y="52" width="80" height="14" fill="#a4262a" opacity="0.6" />
                <rect x="54" y="52" width="12" height="60" fill="#f2c14e" />
                <g className="xm-gift-lid">
                    <rect x="14" y="38" width="92" height="18" rx="4" fill="#e03c37" />
                    <rect x="54" y="38" width="12" height="18" fill="#f7cf63" />
                    <path d="M60 38 C46 18 28 22 34 34 C38 40 52 39 60 38 Z" fill="#f2c14e" />
                    <path d="M60 38 C74 18 92 22 86 34 C82 40 68 39 60 38 Z" fill="#f2c14e" />
                    <circle cx="60" cy="37" r="5" fill="#d9a531" />
                </g>
            </svg>
        </div>
    );
}

// Bell-like arpeggio (C major, up then the top note again) built with WebAudio.
function chime() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const notes = [1046.5, 1318.5, 1568, 2093, 1568, 2093];
        notes.forEach((freq, i) => {
            const t = ctx.currentTime + i * 0.12;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
            gain.connect(ctx.destination);
            [1, 2.76].forEach((mult, j) => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq * mult, t);
                const partial = ctx.createGain();
                partial.gain.value = j === 0 ? 1 : 0.25;
                osc.connect(partial).connect(gain);
                osc.start(t);
                osc.stop(t + 0.95);
            });
        });
        setTimeout(() => ctx.close(), 2200);
    } catch {
        // Audio is a bonus; ignore failures
    }
}

const sparks = Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * Math.PI * 2;
    const dist = 140 + (i % 3) * 60;
    return {
        '--xm-x': `${(Math.cos(angle) * dist).toFixed(0)}px`,
        '--xm-y': `${(Math.sin(angle) * dist).toFixed(0)}px`,
        '--xm-color': BULB_COLORS[i % BULB_COLORS.length],
        '--xm-delay': `${(i % 4) * 0.04}s`,
    };
});

// Greeting pops once per session after a short visit, or whenever the gift is clicked.
const GREET_DELAY_MS = 20000;
const GREET_DURATION_MS = 3600;
const GREET_SEEN_KEY = 'odc_xm_greeted';

export function ChristmasDecor() {
    const [greeting, setGreeting] = useState(false);
    const endTimer = useRef(null);

    const greet = useCallback(() => {
        clearTimeout(endTimer.current);
        setGreeting(false);
        requestAnimationFrame(() => setGreeting(true));
        endTimer.current = setTimeout(() => setGreeting(false), GREET_DURATION_MS);
    }, []);

    useEffect(() => {
        let seen = false;
        try {
            seen = sessionStorage.getItem(GREET_SEEN_KEY) === '1';
        } catch {
            // Ignore storage error
        }
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (seen || reduced) return undefined;

        const timer = setTimeout(() => {
            if (document.hidden) return;
            try {
                sessionStorage.setItem(GREET_SEEN_KEY, '1');
            } catch {
                // Ignore storage error
            }
            greet();
        }, GREET_DELAY_MS);
        return () => clearTimeout(timer);
    }, [greet]);

    useEffect(() => () => clearTimeout(endTimer.current), []);

    const handleGiftClick = () => {
        chime();
        greet();
    };

    return (
        <div className="xm-layer" aria-hidden="true">
            <Snowfall />
            <StringLights />
            <Parol className="xm-parol-left" hue="#ff5a4f" />
            <Parol className="xm-parol-right" hue="#ffc93c" />
            <Gift open={greeting} onClick={handleGiftClick} />
            {greeting ? (
                <div className="xm-greeting">
                    <div className="xm-burst">
                        {sparks.map((style, i) => (
                            <span key={i} className="xm-spark" style={style} />
                        ))}
                    </div>
                    <div className="xm-card">
                        <span className="xm-card-kicker">Maligayang Pasko!</span>
                        <span className="xm-card-title">Merry Christmas</span>
                        <span className="xm-card-sub">from all of us at Odyssey</span>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
