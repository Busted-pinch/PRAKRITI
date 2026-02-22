import React, { useState, useRef } from 'react';
import { useAnimation, motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, Globe, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeech } from '../utils/speech';

/* ─── Impact config ─────────────────────────────────────────── */
const IMPACT = {
    high: {
        badge: 'bg-red-500/20 text-red-300 border-red-500/40',
        badgeLight: 'bg-red-50    text-red-700 border-red-200',
        bar: 'from-red-600 via-rose-500 to-pink-500',
        /* Dark glow: strong red-rose outer + soft inner highlight */
        glowDark: '0 0 0 1px rgba(239,68,68,0.35), 0 0 30px 6px rgba(239,68,68,0.28), inset 0 1px 0 rgba(255,100,100,0.08)',
        glowLight: '0 4px 24px rgba(239,68,68,0.18), 0 0 0 1px rgba(239,68,68,0.12)',
        accentDark: 'text-red-400',
        accentLgt: 'text-red-600',
        icon: <AlertCircle className="w-3 h-3" />,
    },
    medium: {
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        badgeLight: 'bg-amber-50    text-amber-700 border-amber-200',
        bar: 'from-amber-500 via-yellow-400 to-orange-400',
        glowDark: '0 0 0 1px rgba(245,158,11,0.35), 0 0 30px 6px rgba(245,158,11,0.28), inset 0 1px 0 rgba(255,200,50,0.08)',
        glowLight: '0 4px 24px rgba(245,158,11,0.18), 0 0 0 1px rgba(245,158,11,0.12)',
        accentDark: 'text-amber-400',
        accentLgt: 'text-amber-600',
        icon: <Info className="w-3 h-3" />,
    },
    low: {
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        badgeLight: 'bg-emerald-50    text-emerald-700 border-emerald-200',
        bar: 'from-emerald-500 via-teal-400 to-cyan-400',
        glowDark: '0 0 0 1px rgba(16,185,129,0.35), 0 0 30px 6px rgba(16,185,129,0.28), inset 0 1px 0 rgba(52,211,153,0.08)',
        glowLight: '0 4px 24px rgba(16,185,129,0.18), 0 0 0 1px rgba(16,185,129,0.12)',
        accentDark: 'text-emerald-400',
        accentLgt: 'text-emerald-600',
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
};

/* Small utility for face header rows */
const FaceHeader = ({ icon, label, bgDark, bgLight, colorDark, colorLight, counter, isDarkMode, divider }) => (
    <div className={`flex items-center justify-between mb-2.5 pb-2 border-b ${divider}`}>
        <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isDarkMode ? bgDark : bgLight}`}>
                {React.cloneElement(icon, {
                    className: `w-3.5 h-3.5 ${isDarkMode ? colorDark : colorLight}`,
                })}
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-widest ${isDarkMode ? colorDark : colorLight}`}>
                {label}
            </span>
        </div>
        <span className={`text-[10px] font-semibold tabular-nums ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            {counter}
        </span>
    </div>
);

/* ─── NewsCard ───────────────────────────────────────────────── */
const NewsCard = ({ article, isDarkMode }) => {
    const [face, setFace] = useState(0);
    const [hovered, setHovered] = useState(false);
    const flipping = useRef(false);
    const controls = useAnimation();

    const { headline, summary_simple, why_it_matters, actionable_steps, impact_level } = article;
    const impact = IMPACT[impact_level?.toLowerCase()] || IMPACT.medium;

    // TTS: reads the currently-visible face
    const [speaking, setSpeaking] = useState(false);
    const getCurrentFaceText = () => {
        if (face === 0) return `${headline}. ${summary_simple}`;
        if (face === 1) return why_it_matters || 'No personalised relevance available.';
        return actionable_steps?.join('. ') || 'No action steps available.';
    };
    const handleSpeak = (e) => {
        e.stopPropagation();
        if (speaking) { stopSpeech(); setSpeaking(false); }
        else speakText(getCurrentFaceText(), () => setSpeaking(true), () => setSpeaking(false));
    };

    /* Two-phase flip — no mirroring */
    const flip = async () => {
        if (flipping.current) return;
        flipping.current = true;
        await controls.start({ rotateY: 90, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } });
        setFace(f => (f + 1) % 3);
        controls.set({ rotateY: -90 });
        await controls.start({ rotateY: 0, transition: { duration: 0.2, ease: [0, 0, 0.6, 1] } });
        flipping.current = false;
    };

    /* ── Design tokens ────────────────────────────── */
    const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
    const bodyColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
    const divider = isDarkMode ? 'border-white/[0.07]' : 'border-gray-100';

    /* Dark: layered glass — translucent + noise-like texture via border+shadow */
    /* Light: clean card with elevated depth */
    const cardBase = isDarkMode
        ? 'bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] backdrop-blur-md border-white/10'
        : 'bg-white border-gray-200/80 shadow-md shadow-gray-100/60';

    /* Hover: subtle lift + glow border highlight */
    const hoverBase = isDarkMode
        ? (hovered ? 'border-white/20' : 'border-white/10')
        : (hovered ? 'border-gray-300/80' : 'border-gray-200/80');

    const boxShadow = hovered
        ? (isDarkMode ? impact.glowDark : impact.glowLight)
        : (isDarkMode ? 'none' : '0 2px 12px rgba(0,0,0,0.07)');

    return (
        <motion.div
            className="w-full h-52 cursor-pointer"
            style={{ perspective: '1200px' }}
            onClick={flip}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            animate={{ y: hovered ? -4 : 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
        >
            <motion.div
                animate={controls}
                style={{
                    transformOrigin: 'center', willChange: 'transform',
                    boxShadow,
                    transition: 'box-shadow 0.35s ease, border-color 0.25s ease',
                }}
                className={`w-full h-full rounded-2xl border overflow-hidden relative
                    ${cardBase} ${hoverBase}`}
            >
                {/* ── Top gradient bar ── */}
                <div className={`h-[3px] w-full bg-gradient-to-r ${impact.bar}`} />

                {/* ── Speaker button — bottom-right, stops card flip ── */}
                <button
                    onClick={handleSpeak}
                    title={speaking ? 'Stop' : 'Listen'}
                    className={`absolute bottom-3 right-3 z-20 p-1.5 rounded-lg transition-all duration-200
                        ${speaking
                            ? 'bg-emerald-500/25 text-emerald-400 animate-pulse'
                            : isDarkMode
                                ? 'text-gray-500 hover:text-emerald-400 hover:bg-white/10'
                                : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-100'
                        }`}
                >
                    {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {/*
                    Shimmer layer: visible only on hover in dark mode.
                    A semi-transparent white diagonal sweep that slides across once.
                */}
                <AnimatePresence>
                    {hovered && isDarkMode && (
                        <motion.div
                            className="pointer-events-none absolute inset-0 z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                background:
                                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.045) 50%, transparent 60%)',
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Light-mode hover: very faint colored tint */}
                {!isDarkMode && (
                    <div
                        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
                        style={{
                            opacity: hovered ? 1 : 0,
                            background: 'linear-gradient(135deg, rgba(240,253,244,0.6) 0%, transparent 70%)',
                        }}
                    />
                )}

                {/* ── Face content ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={face}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.16, delay: 0.06 } }}
                        exit={{ opacity: 0, transition: { duration: 0.08 } }}
                        className="absolute inset-0 top-[3px] p-4 flex flex-col"
                    >
                        {/* ── Face 0: Headline ── */}
                        {face === 0 && (
                            <div className="flex flex-col h-full">
                                {/* Impact badge + counter */}
                                <div className="flex items-center justify-between mb-2.5">
                                    <motion.span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                            text-[10px] font-bold uppercase tracking-wider border
                                            ${isDarkMode ? impact.badge : impact.badgeLight}`}
                                        animate={{ scale: hovered ? 1.03 : 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {impact.icon}
                                        {impact_level} Impact
                                    </motion.span>
                                    <span className={`text-[10px] font-semibold tabular-nums
                                        ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                        1 / 3
                                    </span>
                                </div>

                                {/* Headline */}
                                <h3 className={`font-bold text-[15px] leading-snug mb-2 ${textColor}`}>
                                    {headline}
                                </h3>

                                {/* Summary */}
                                <p className={`text-sm leading-relaxed flex-1 overflow-hidden ${bodyColor}`}
                                    style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                    {summary_simple}
                                </p>

                                {/* Subtle tap hint at bottom */}
                                <p className={`text-[10px] mt-2 font-medium tracking-wide transition-opacity duration-300
                                    ${hovered ? 'opacity-100' : 'opacity-0'}
                                    ${isDarkMode ? impact.accentDark : impact.accentLgt}`}>
                                    Tap to see why it matters →
                                </p>
                            </div>
                        )}

                        {/* ── Face 1: Why It Matters ── */}
                        {face === 1 && (
                            <div className="flex flex-col h-full">
                                <FaceHeader
                                    icon={<Globe />}
                                    label="Why It Matters to You"
                                    bgDark="bg-blue-500/20" bgLight="bg-blue-50"
                                    colorDark="text-blue-400" colorLight="text-blue-600"
                                    counter="2 / 3"
                                    isDarkMode={isDarkMode} divider={divider}
                                />
                                <p className={`text-sm leading-relaxed overflow-y-auto flex-1 pr-0.5 ${textColor}`}>
                                    {why_it_matters || 'No personalised relevance available.'}
                                </p>
                                <p className={`text-[10px] mt-2 font-medium tracking-wide transition-opacity duration-300
                                    ${hovered ? 'opacity-100' : 'opacity-0'}
                                    ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>
                                    Tap to see what you can do →
                                </p>
                            </div>
                        )}

                        {/* ── Face 2: What You Can Do ── */}
                        {face === 2 && (
                            <div className="flex flex-col h-full">
                                <FaceHeader
                                    icon={<Sparkles />}
                                    label="What You Can Do"
                                    bgDark="bg-emerald-500/20" bgLight="bg-emerald-50"
                                    colorDark="text-emerald-400" colorLight="text-emerald-600"
                                    counter="3 / 3"
                                    isDarkMode={isDarkMode} divider={divider}
                                />
                                {actionable_steps?.length > 0 ? (
                                    <ul className="flex flex-col gap-2 overflow-y-auto flex-1 pr-0.5">
                                        {actionable_steps.map((step, idx) => (
                                            <motion.li
                                                key={idx}
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05, duration: 0.2 }}
                                                className={`text-sm flex items-start gap-2 ${textColor}`}
                                            >
                                                <span className={`mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0
                                                    ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                                                {step}
                                            </motion.li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={`text-sm flex-1 ${bodyColor}`}>No action steps available.</p>
                                )}
                                <p className={`text-[10px] mt-2 font-medium tracking-wide transition-opacity duration-300
                                    ${hovered ? 'opacity-100' : 'opacity-0'}
                                    ${isDarkMode ? impact.accentDark : impact.accentLgt}`}>
                                    Tap to go back to headline →
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default NewsCard;
