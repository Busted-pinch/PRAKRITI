import React, { useState, useRef } from 'react';
import { useAnimation, motion, AnimatePresence } from 'framer-motion';
import { Scale, Droplets, Wind, Leaf, Globe, ExternalLink } from 'lucide-react';

/* ─── Category icon ──────────────────────────────────────────── */
const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
        case 'air': return <Wind className="w-4 h-4" />;
        case 'water': return <Droplets className="w-4 h-4" />;
        case 'biodiversity': return <Leaf className="w-4 h-4" />;
        case 'climate': return <Globe className="w-4 h-4" />;
        default: return <Scale className="w-4 h-4" />;
    }
};

/* ─── Type-based accent tokens ───────────────────────────────── */
const TYPE = {
    national: {
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        badgeL: 'bg-emerald-50    text-emerald-700 border-emerald-200',
        bar: 'from-emerald-500 via-teal-400 to-cyan-400',
        glowD: '0 0 0 1px rgba(16,185,129,0.30), 0 0 28px 5px rgba(16,185,129,0.24), inset 0 1px 0 rgba(52,211,153,0.07)',
        glowL: '0 4px 24px rgba(16,185,129,0.15), 0 0 0 1px rgba(16,185,129,0.10)',
        iconBgD: 'bg-emerald-500/20', iconBgL: 'bg-emerald-50',
        colorD: 'text-emerald-400', colorL: 'text-emerald-700',
        face1D: 'text-rose-400', face1L: 'text-rose-600',
        face1BgD: 'bg-rose-500/20', face1BgL: 'bg-rose-50',
    },
    international: {
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        badgeL: 'bg-blue-50    text-blue-700 border-blue-200',
        bar: 'from-blue-500 via-indigo-400 to-violet-400',
        glowD: '0 0 0 1px rgba(99,102,241,0.30), 0 0 28px 5px rgba(99,102,241,0.24), inset 0 1px 0 rgba(129,140,248,0.07)',
        glowL: '0 4px 24px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.10)',
        iconBgD: 'bg-blue-500/20', iconBgL: 'bg-blue-50',
        colorD: 'text-blue-400', colorL: 'text-blue-700',
        face1D: 'text-rose-400', face1L: 'text-rose-600',
        face1BgD: 'bg-rose-500/20', face1BgL: 'bg-rose-50',
    },
};
const defaultType = TYPE.national;

/* ─── LawPolicyCard ──────────────────────────────────────────── */
const LawPolicyCard = ({ law, isDarkMode }) => {
    const [face, setFace] = useState(0);   // 0=Title, 1=Why It Matters
    const [hovered, setHovered] = useState(false);
    const flipping = useRef(false);
    const controls = useAnimation();

    const t = TYPE[law.type] || defaultType;

    /* Two-phase flip — no mirror */
    const flip = async () => {
        if (flipping.current) return;
        flipping.current = true;
        await controls.start({ rotateY: 90, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } });
        setFace(f => (f + 1) % 2);
        controls.set({ rotateY: -90 });
        await controls.start({ rotateY: 0, transition: { duration: 0.2, ease: [0, 0, 0.6, 1] } });
        flipping.current = false;
    };

    /* ── Design tokens (mirrors NewsCard) ── */
    const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
    const bodyColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
    const subColor = isDarkMode ? 'text-gray-600' : 'text-gray-400';
    const divider = isDarkMode ? 'border-white/[0.07]' : 'border-gray-100';

    const cardBase = isDarkMode
        ? 'bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] backdrop-blur-md border-white/10'
        : 'bg-white border-gray-200/80 shadow-md shadow-gray-100/60';

    const hoverBorder = isDarkMode
        ? (hovered ? 'border-emerald-500/30' : 'border-white/10')
        : (hovered ? 'border-gray-300/80' : 'border-gray-200/80');

    const boxShadow = hovered
        ? (isDarkMode ? t.glowD : t.glowL)
        : (isDarkMode ? 'none' : '0 2px 12px rgba(0,0,0,0.07)');

    /* Shared face label row */
    const FaceLabel = ({ icon, label, bgD, bgL, colD, colL, counter }) => (
        <div className={`flex items-center justify-between mb-2.5 pb-2 border-b ${divider}`}>
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isDarkMode ? bgD : bgL}`}>
                    {React.cloneElement(icon, { className: `w-3.5 h-3.5 ${isDarkMode ? colD : colL}` })}
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-widest ${isDarkMode ? colD : colL}`}>
                    {label}
                </span>
            </div>
            <span className={`text-[10px] font-semibold tabular-nums ${subColor}`}>{counter}</span>
        </div>
    );

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
                    transformOrigin: 'center', willChange: 'transform', boxShadow,
                    transition: 'box-shadow 0.35s ease, border-color 0.25s ease'
                }}
                className={`w-full h-full rounded-2xl border overflow-hidden relative
                    ${cardBase} ${hoverBorder}`}
            >
                {/* Gradient accent bar */}
                <div className={`h-[3px] w-full bg-gradient-to-r ${t.bar}`} />

                {/* Dark-mode shimmer */}
                <AnimatePresence>
                    {hovered && isDarkMode && (
                        <motion.div
                            className="pointer-events-none absolute inset-0 z-10"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.045) 50%, transparent 60%)' }}
                        />
                    )}
                </AnimatePresence>

                {/* Light-mode hover tint */}
                {!isDarkMode && (
                    <div className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
                        style={{
                            opacity: hovered ? 1 : 0,
                            background: 'linear-gradient(135deg, rgba(240,253,244,0.6) 0%, transparent 70%)'
                        }} />
                )}

                {/* Faces */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={face}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.16, delay: 0.06 } }}
                        exit={{ opacity: 0, transition: { duration: 0.08 } }}
                        className="absolute inset-0 top-[3px] p-4 flex flex-col"
                    >
                        {/* ── Face 0: Title & Meta ── */}
                        {face === 0 && (
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-2.5">
                                    {/* Type + category badges */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {law.type && (
                                            <motion.span
                                                animate={{ scale: hovered ? 1.03 : 1 }}
                                                transition={{ duration: 0.2 }}
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                                    text-[10px] font-bold uppercase tracking-wider border
                                                    ${isDarkMode ? t.badge : t.badgeL}`}
                                            >
                                                {getCategoryIcon(law.category)}
                                                {law.type}
                                            </motion.span>
                                        )}
                                        {law.category && (
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                                                ${isDarkMode ? 'bg-white/8 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                                {law.category}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-semibold tabular-nums ${subColor}`}>1 / 2</span>
                                </div>

                                <h3 className={`font-bold text-[15px] leading-snug mb-2 ${textColor}`}
                                    style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {law.title}
                                </h3>

                                <p className={`text-sm leading-relaxed flex-1 overflow-hidden ${bodyColor}`}
                                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {law.summary_simple}
                                </p>

                                {/* Hover hint */}
                                <p className={`text-[10px] mt-2 font-medium tracking-wide transition-opacity duration-300
                                    ${hovered ? 'opacity-100' : 'opacity-0'}
                                    ${isDarkMode ? t.colorD : t.colorL}`}>
                                    Tap to see why it matters →
                                </p>
                            </div>
                        )}

                        {/* ── Face 1: Why It Matters ── */}
                        {face === 1 && (
                            <div className="flex flex-col h-full">
                                <FaceLabel
                                    icon={<Globe />} label="Why It Matters to You"
                                    bgD={t.face1BgD} bgL={t.face1BgL}
                                    colD={t.face1D} colL={t.face1L}
                                    counter="2 / 2"
                                />
                                <p className={`text-sm leading-relaxed overflow-y-auto flex-1 pr-0.5 ${textColor}`}>
                                    {law.why_it_matters_to_user || law.summary_simple || 'No personalised relevance available.'}
                                </p>
                                <p className={`text-[10px] mt-2 font-medium tracking-wide transition-opacity duration-300
                                    ${hovered ? 'opacity-100' : 'opacity-0'}
                                    ${isDarkMode ? t.colorD : t.colorL}`}>
                                    Tap to go back →
                                </p>
                            </div>
                        )}


                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default LawPolicyCard;
