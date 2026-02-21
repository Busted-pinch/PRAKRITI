import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import GlassCard from './GlassCard';

const EmotionalUX = ({ insight, isDarkMode }) => {
    if (!insight) return null;
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <GlassCard className="p-5 h-full">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-pink-500/15' : 'bg-pink-50'}`}>
                        <Heart className={`w-4 h-4 ${isDarkMode ? 'text-pink-400' : 'text-pink-500'}`} />
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Prakriti Insight
                    </p>
                </div>
                <p className={`text-sm leading-relaxed italic ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    "{insight}"
                </p>
            </GlassCard>
        </motion.div>
    );
};

export default EmotionalUX;
