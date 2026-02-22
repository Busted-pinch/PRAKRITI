import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Volume2, VolumeX } from 'lucide-react';
import GlassCard from './GlassCard';
import { speakText, stopSpeech } from '../utils/speech';

const ContextualBriefing = ({ briefing, isDarkMode }) => {
    const [speaking, setSpeaking] = useState(false);
    if (!briefing) return null;

    const handleSpeak = (e) => {
        e.stopPropagation();
        if (speaking) {
            stopSpeech();
            setSpeaking(false);
        } else {
            speakText(briefing, () => setSpeaking(true), () => setSpeaking(false));
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <GlassCard className="p-5 h-full relative">
                {/* Speaker button — top-right */}
                <button
                    onClick={handleSpeak}
                    title={speaking ? 'Stop speaking' : 'Listen to briefing'}
                    className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 z-10
                        ${speaking
                            ? 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                            : isDarkMode
                                ? 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'
                        }`}
                >
                    {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

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
