import React, { useState, useEffect } from 'react';
import { Lightbulb, ArrowRight, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import GlassCard from './GlassCard';
import api from '../services/api';

const DailyInsight = () => {
    const { isDarkMode } = useTheme();
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsight = async () => {
            try {
                try {
                    const response = await api.get('/growth/microlearning/recommend');
                    if (response.data) setInsight(response.data);
                    else throw new Error("No data");
                } catch (e) {
                    setInsight({
                        title: "Understanding PM2.5",
                        content: "PM2.5 particles are fine particulate matter less than 2.5 microns in diameter. They can penetrate deep into lung tissue and enter the bloodstream.",
                        action: "Read 2 min article",
                        xp: 50
                    });
                }
            } catch (error) {
                console.error("Insight error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInsight();
    }, []);

    if (loading) return null;

    return (
        <GlassCard className="p-4 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3 relative z-10">
                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <Lightbulb className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Daily Insight</h3>
                        <span className="text-xs font-bold text-emerald-500">+{insight.xp} XP</span>
                    </div>
                    <h4 className={`text-sm font-medium mt-1 mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        {insight.title}
                    </h4>
                    <p className={`text-xs leading-relaxed mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {insight.content}
                    </p>
                    <button className={`w-full text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${isDarkMode
                            ? 'bg-white/5 hover:bg-white/10 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}>
                        <BookOpen className="w-3 h-3" />
                        {insight.action}
                    </button>
                </div>
            </div>
        </GlassCard>
    );
};

export default DailyInsight;
