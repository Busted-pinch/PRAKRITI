import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, FileText, Droplets, Wind, Leaf, Globe, Zap, ArrowRight, ExternalLink } from 'lucide-react';

// Icon Map based on Category
const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
        case 'air': return <Wind className="w-6 h-6" />;
        case 'water': return <Droplets className="w-6 h-6" />;
        case 'biodiversity': return <Leaf className="w-6 h-6" />;
        case 'climate': return <Globe className="w-6 h-6" />;
        default: return <Scale className="w-6 h-6" />;
    }
};

const getAccentColor = (type, isDarkMode) => {
    if (type === 'national') {
        return isDarkMode ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else {
        return isDarkMode ? 'bg-blue-900/40 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200';
    }
};

const LawPolicyCard = ({ law, isDarkMode }) => {
    const [face, setFace] = useState(0);

    const flipCard = () => {
        setFace((prev) => (prev + 1) % 5);
    };

    const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
    const subTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const bgBase = isDarkMode ? 'bg-gray-800/80' : 'bg-white/90';

    return (
        <div
            className="w-full h-72 cursor-pointer perspective-[1000px] mb-4"
            onClick={flipCard}
        >
            <motion.div
                className={`w-full h-full relative rounded-2xl shadow-lg border outline-none ${isDarkMode ? 'border-white/10' : 'border-gray-200'
                    }`}
                animate={{ rotateX: face * -90 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Due to typical CSS 3D limitations, instead of true geometric cubes, 
                    we render an array of faces that fade in/out based on the current step, 
                    while the container seemingly flips. */}
                <div className={`absolute inset-0 backface-hidden rounded-2xl p-6 flex flex-col ${bgBase}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={face}
                            initial={{ opacity: 0, rotateX: 90 }}
                            animate={{ opacity: 1, rotateX: 0 }}
                            exit={{ opacity: 0, rotateX: -90 }}
                            transition={{ duration: 0.3 }}
                            className="h-full flex flex-col"
                        >
                            {/* FACE 0: FRONT - TITLE & ICON */}
                            {face === 0 && (
                                <div className="flex flex-col h-full justify-between items-start">
                                    <div className={`p-3 rounded-2xl ${getAccentColor(law.type, isDarkMode)}`}>
                                        {getCategoryIcon(law.category)}
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getAccentColor(law.type, isDarkMode)}`}>
                                                {law.type || 'Regulation'}
                                            </span>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                                {law.category}
                                            </span>
                                        </div>
                                        <h3 className={`text-xl font-bold leading-tight ${textColor}`}>
                                            {law.title}
                                        </h3>
                                    </div>
                                    <div className="w-full flex justify-between items-center mt-3 border-t border-gray-500/20 pt-3">
                                        <p className={`text-xs ${subTextColor}`}>Tap to explore</p>
                                        <ArrowRight className={`w-4 h-4 ${subTextColor}`} />
                                    </div>
                                </div>
                            )}

                            {/* FACE 1: SUMMARY */}
                            {face === 1 && (
                                <div className="flex flex-col h-full">
                                    <h4 className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                        Summary
                                    </h4>
                                    <p className={`text-sm leading-relaxed overflow-y-auto pr-1 flex-1 ${textColor}`}>
                                        {law.summary_simple}
                                    </p>
                                    <div className="w-full flex justify-end mt-2">
                                        <ArrowRight className={`w-4 h-4 ${subTextColor}`} />
                                    </div>
                                </div>
                            )}

                            {/* FACE 2: WHY IT MATTERS */}
                            {face === 2 && (
                                <div className="flex flex-col h-full">
                                    <h4 className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                                        Why it matters to YOU
                                    </h4>
                                    <p className={`text-sm leading-relaxed overflow-y-auto pr-1 flex-1 ${textColor}`}>
                                        {law.why_it_matters_to_user}
                                    </p>
                                    <div className="w-full flex justify-end mt-2">
                                        <ArrowRight className={`w-4 h-4 ${subTextColor}`} />
                                    </div>
                                </div>
                            )}

                            {/* FACE 3: ACTIONABLE INSIGHTS */}
                            {face === 3 && (
                                <div className="flex flex-col h-full">
                                    <h4 className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`}>
                                        Actionable Insights
                                    </h4>
                                    <ul className={`space-y-3 overflow-y-auto pr-1 flex-1 ${textColor}`}>
                                        {law.actionable_steps?.map((step, idx) => (
                                            <li key={idx} className="flex gap-2 items-start text-sm">
                                                <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="w-full flex justify-end mt-2">
                                        <ArrowRight className={`w-4 h-4 ${subTextColor}`} />
                                    </div>
                                </div>
                            )}

                            {/* FACE 4: SOURCE */}
                            {face === 4 && (
                                <div className="flex flex-col h-full justify-between items-center text-center">
                                    <div className="mt-8">
                                        <div className={`p-4 rounded-full mx-auto inline-block mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <FileText className={`w-8 h-8 ${textColor}`} />
                                        </div>
                                        <h4 className={`text-lg font-bold mb-2 ${textColor}`}>
                                            Original Source
                                        </h4>
                                        <p className={`text-sm mb-6 ${subTextColor}`}>
                                            Access the complete legal text and official documentation for deep-dive reading.
                                        </p>
                                    </div>
                                    <a
                                        href={law.source}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-transform hover:scale-105 ${isDarkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
                                            }`}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Read Official Doc
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default LawPolicyCard;
