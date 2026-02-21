import React from 'react';
import { motion } from 'framer-motion';
import { Sun } from 'lucide-react';
import GlassCard from './GlassCard';

const ContextualBriefing = ({ briefing, isDarkMode }) => {
    if (!briefing) return null;
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <GlassCard className="p-5 h-full">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-amber-500/15' : 'bg-amber-50'}`}>
                        <Sun className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Daily Briefing
                    </p>
                </div>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {briefing}
                </p>
            </GlassCard>
        </motion.div>
    );
};

export default ContextualBriefing;
