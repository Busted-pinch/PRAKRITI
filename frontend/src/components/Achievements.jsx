import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import GlassCard from './GlassCard';

/**
 * Achievements panel.
 * Accepts `achievements` as a prop — array of:
 *   { id, name, desc, icon, unlocked, earned_at }
 * Falls back to empty skeleton if not provided.
 */
const Achievements = ({ achievements = [] }) => {
    const { isDarkMode } = useTheme();

    // Split earned vs locked for display order
    const earned = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);
    const ordered = [...earned, ...locked];

    return (
        <GlassCard className="h-full flex flex-col p-0 overflow-hidden">
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Achievements
                        </h3>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                        ${isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                        {earned.length} / {achievements.length}
                    </span>
                </div>
            </div>

            {/* Grid — scrollable */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                {achievements.length === 0 ? (
                    /* Skeleton while loading */
                    <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={`h-20 rounded-xl animate-pulse ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {ordered.map((ach, idx) => (
                            <motion.div
                                key={ach.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                whileHover={{ scale: 1.03 }}
                                title={ach.desc}
                                className={`relative p-3 rounded-xl border overflow-hidden cursor-default
                                    ${ach.unlocked
                                        ? isDarkMode
                                            ? 'bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                                            : 'bg-gradient-to-br from-amber-50 to-white border-amber-200'
                                        : isDarkMode
                                            ? 'bg-white/[0.03] border-white/8 opacity-50'
                                            : 'bg-gray-50 border-gray-100 opacity-60'
                                    }`}
                            >
                                <div className={`text-2xl mb-1.5 ${!ach.unlocked ? 'grayscale' : ''}`}>
                                    {ach.icon}
                                </div>
                                <h4 className={`font-bold text-[11px] leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {ach.name}
                                </h4>
                                <p className={`text-[9px] leading-tight mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {ach.desc}
                                </p>

                                {/* Locked overlay */}
                                {!ach.unlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/10 backdrop-blur-[1px]">
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold
                                            ${isDarkMode ? 'bg-black/60 text-gray-400' : 'bg-white/80 text-gray-500'}`}>
                                            <Lock className="w-2.5 h-2.5" /> Locked
                                        </div>
                                    </div>
                                )}

                                {/* Earned glow dot */}
                                {ach.unlocked && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </GlassCard>
    );
};

export default Achievements;
