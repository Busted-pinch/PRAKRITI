import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Target, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import GlassCard from './GlassCard';
import api from '../services/api';

const Achievements = () => {
    const { isDarkMode } = useTheme();
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                try {
                    const response = await api.get('/growth/achievements');
                    if (response.data && response.data.length > 0) setAchievements(response.data);
                    else throw new Error("No data");
                } catch (e) {
                    // Fallback Mock
                    setAchievements([
                        { id: 1, name: "First Breath", desc: "Completed your first check-in", icon: "🌱", unlocked: true },
                        { id: 2, name: "Data Diver", desc: "Connected 3 data sources", icon: "🔌", unlocked: true },
                        { id: 3, name: "Streak Master", desc: "7-day login streak", icon: "🔥", unlocked: false },
                        { id: 4, name: "Eco Guardian", desc: "Reduced carbo footprint by 10%", icon: "🛡️", unlocked: false }
                    ]);
                }
            } catch (error) {
                console.error("Achievements error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    return (
        <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Achievements</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                    <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.05 }}
                        className={`p-3 rounded-xl border relative overflow-hidden group ${achievement.unlocked
                                ? (isDarkMode ? 'bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-transparent border-amber-200')
                                : (isDarkMode ? 'bg-white/5 border-white/5 opacity-60' : 'bg-gray-50 border-gray-100 opacity-60')
                            }`}
                    >
                        <div className="text-2xl mb-2">{achievement.icon}</div>
                        <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{achievement.name}</h4>
                        <p className="text-[10px] text-gray-500 leading-tight mt-1">{achievement.desc}</p>

                        {!achievement.unlocked && (
                            <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] flex items-center justify-center">
                                <div className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">Locked</div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </GlassCard>
    );
};

export default Achievements;
