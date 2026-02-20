import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import GlassCard from './GlassCard';

const getImpactColor = (impact, isDarkMode) => {
    switch (impact?.toLowerCase()) {
        case 'high':
            return isDarkMode ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-rose-100 text-rose-700 border-rose-200';
        case 'medium':
            return isDarkMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200';
        case 'low':
            return isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
        default:
            return isDarkMode ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const getImpactIcon = (impact) => {
    switch (impact?.toLowerCase()) {
        case 'high':
            return <AlertCircle className="w-4 h-4" />;
        case 'low':
            return <CheckCircle2 className="w-4 h-4" />;
        default:
            return <Info className="w-4 h-4" />;
    }
};

const NewsCard = ({ article, isDarkMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <GlassCard className="mb-4 overflow-hidden transition-all duration-300" hoverEffect={false}>
            {/* Collapsed View Header */}
            <div
                className="p-5 cursor-pointer flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getImpactColor(article.impact_level, isDarkMode)}`}>
                            {getImpactIcon(article.impact_level)}
                            {article.impact_level} Impact
                        </span>
                        {article.confidence_score && (
                            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Confidence: {article.confidence_score}%
                            </span>
                        )}
                    </div>
                    <h3 className={`font-bold text-lg leading-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {article.headline}
                    </h3>
                    <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {article.summary_simple}
                    </p>
                </div>

                <div className="flex-shrink-0 self-end md:self-center">
                    <button
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                        aria-label={isExpanded ? "Collapse news" : "Expand news"}
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Expanded View Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className={`p-5 pt-0 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>

                            <div className="mt-4 mb-5">
                                <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    <Info className="w-4 h-4" /> Why it matters to YOU
                                </h4>
                                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {article.why_it_matters_to_you}
                                </p>
                            </div>

                            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
                                <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                    <CheckCircle2 className="w-4 h-4" /> What you can do
                                </h4>
                                <ul className="space-y-2">
                                    {article.actionable_steps?.map((step, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                                            <span className={`text-sm ${isDarkMode ? 'text-emerald-100/80' : 'text-emerald-900/80'}`}>
                                                {step}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
};

export default NewsCard;
