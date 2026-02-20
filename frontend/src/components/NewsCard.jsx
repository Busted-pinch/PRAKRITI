import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Info, Map } from 'lucide-react';

const getImpactColor = (level, isDarkMode) => {
    switch (level?.toLowerCase()) {
        case 'high':
            return isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200';
        case 'medium':
            return isDarkMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200';
        case 'low':
            return isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200';
        default:
            return isDarkMode ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const getImpactIcon = (level) => {
    switch (level?.toLowerCase()) {
        case 'high': return <AlertCircle className="w-3.5 h-3.5" />;
        case 'medium': return <Info className="w-3.5 h-3.5" />;
        case 'low': return <CheckCircle2 className="w-3.5 h-3.5" />;
        default: return <Info className="w-3.5 h-3.5" />;
    }
};

const NewsCard = ({ article, isDarkMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        headline,
        summary_simple,
        why_it_matters_to_you,
        actionable_steps,
        impact_level
    } = article;

    return (
        <motion.div
            layout
            className={`w-full rounded-2xl border overflow-hidden transition-colors ${isDarkMode
                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
        >
            {/* Collapsed View (Header) */}
            <div
                className="p-4 cursor-pointer flex flex-col gap-3"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-start gap-4">
                    <h3 className={`font-bold text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {headline}
                    </h3>
                    <div className={`flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getImpactColor(impact_level, isDarkMode)}`}>
                        {getImpactIcon(impact_level)}
                        {impact_level} Impact
                    </div>
                </div>

                <div className="flex justify-between items-end gap-4">
                    <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {summary_simple}
                    </p>
                    <button className={`p-1.5 rounded-full shrink-0 transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Expanded View */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className={`p-5 pt-2 border-t flex flex-col gap-5 ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-gray-100 bg-gray-50/50'}`}>

                            {/* Why it Matters */}
                            <div>
                                <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    <Map className="w-4 h-4" />
                                    Why This Matters to You
                                </h4>
                                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {why_it_matters_to_you}
                                </p>
                            </div>

                            {/* Actionable Steps (Soft Green Accent) */}
                            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                                <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                    <CheckCircle2 className="w-4 h-4" />
                                    What You Can Do
                                </h4>
                                <ul className="flex flex-col gap-2">
                                    {actionable_steps?.map((step, idx) => (
                                        <li key={idx} className={`text-sm flex items-start gap-2 ${isDarkMode ? 'text-emerald-200/80' : 'text-emerald-900/80'}`}>
                                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isDarkMode ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default NewsCard;
