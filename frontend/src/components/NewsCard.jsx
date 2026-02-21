import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Info, Globe, Sparkles } from 'lucide-react';

const IMPACT_CONFIG = {
    high: {
        badge: 'bg-red-500/20 text-red-400 border-red-500/30',
        badgeLight: 'bg-red-100 text-red-700 border-red-200',
        bar: 'bg-red-500',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    medium: {
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        badgeLight: 'bg-amber-100 text-amber-700 border-amber-200',
        bar: 'bg-amber-500',
        icon: <Info className="w-3.5 h-3.5" />,
    },
    low: {
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        badgeLight: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        bar: 'bg-emerald-500',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
};

const NewsCard = ({ article, isDarkMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        headline,
        summary_simple,
        why_it_matters,       // correct field name from backend
        actionable_steps,
        impact_level,
    } = article;

    const impact = IMPACT_CONFIG[impact_level?.toLowerCase()] || IMPACT_CONFIG.medium;

    return (
        <motion.div
            layout
            className={`w-full rounded-2xl border overflow-hidden transition-all duration-300 ${isDarkMode
                    ? 'bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                    : 'bg-white border-gray-200 hover:border-emerald-200 shadow-sm hover:shadow-md'
                }`}
        >
            {/* Impact accent bar */}
            <div className={`h-0.5 w-full ${impact.bar} opacity-60`} />

            {/* Card header — always visible */}
            <div
                className="p-5 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-start gap-4 mb-3">
                    {/* Impact Badge */}
                    <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border flex-shrink-0 ${isDarkMode ? impact.badge : impact.badgeLight
                            }`}
                    >
                        {impact.icon}
                        {impact_level} Impact
                    </div>

                    {/* Expand toggle */}
                    <button
                        className={`p-1.5 rounded-full flex-shrink-0 transition-colors ${isDarkMode
                                ? 'hover:bg-white/10 text-gray-500 hover:text-gray-200'
                                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'
                            }`}
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Headline */}
                <h3 className={`font-bold text-[17px] leading-snug mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {headline}
                </h3>

                {/* Summary — always visible */}
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {summary_simple}
                </p>
            </div>

            {/* Expandable section */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className={`px-5 pb-5 flex flex-col gap-4 border-t ${isDarkMode ? 'border-white/8 pt-4' : 'border-gray-100 pt-4'}`}>

                            {/* Why It Matters */}
                            {why_it_matters && (
                                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
                                    <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                        <Globe className="w-3.5 h-3.5" />
                                        Why This Matters to You
                                    </h4>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-blue-100/80' : 'text-blue-900/80'}`}>
                                        {why_it_matters}
                                    </p>
                                </div>
                            )}

                            {/* What You Can Do */}
                            {actionable_steps?.length > 0 && (
                                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-emerald-900/15 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
                                    <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                        <Sparkles className="w-3.5 h-3.5" />
                                        What You Can Do
                                    </h4>
                                    <ul className="flex flex-col gap-2">
                                        {actionable_steps.map((step, idx) => (
                                            <li
                                                key={idx}
                                                className={`text-sm flex items-start gap-2.5 ${isDarkMode ? 'text-emerald-100/80' : 'text-emerald-900/80'}`}
                                            >
                                                <span className={`mt-[6px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default NewsCard;
